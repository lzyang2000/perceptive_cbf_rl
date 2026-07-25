"""Controlled dodge benchmark: 100 throws (50 UP/duckable + 50 DOWN/low), one throw per env, robot
reset to a CLEAN STAND with zero velocity command. Success = robot neither HIT nor FELL over during
the trial window. Same seeded throws across all dodge policies for a fair head-to-head.

Policy keys = the paper's perception x safety grid (see TASKS):

  perception:  state_*  = state oracle (ground-truth ball obs, Unitree-G1-AMP-Dodge-MimicKit-Flat)
               vision_* = fixed head camera, ball-only masked depth (BallOnly task)
               gimbal_* = the same BallOnly task with the oracle-aimed camera-pitch gimbal
                          (the benchmark auto-sets CAMERA_GIMBAL=1 CAMERA_PROPRIO=1 for these keys)
  safety mode: *_none   = distance-to-core reward only (trained with NO_LINK_CBF=1)
               *_link   = + per-link clearance CBF reward (the deployed configuration)
               *_joint  = + joint-space CBF reward guidance (trained CBF_JOINT=1; eval'd bare)
  "+filter":   run a *_joint key with BENCH_CBF_FILTER=1 to keep the joint-CBF projection active
               at eval (privileged: reads ground-truth ball state; NOT hardware-deployable).
  omni:        state_link_omni / state_joint_omni are trained with OMNI_THROW=1 and MUST be
               eval'd with --omni (they run by default only when --omni is passed).
  statue:      frozen-statue control (no checkpoint) -- the free-miss floor.

UP   = force_high=True  : launched low (~waist), arcs UP to torso/head height -> a ball to DUCK under.
DOWN = force_high=False : launched high (~2 m), pure-horizontal, descends to the lower body -> sidestep.

Per policy: reset->stand, settle (stabilize + fill the depth frame stack), inject the controlled throw
(launch math mirrors throw_ball_on_dwell), run a window, and latch each env's FIRST termination using
the env's OWN terms -- hit=ball_hit, fell={bad_orientation,bad_base_height,collapsed_crouch}; neither
within the window => success. Auto-reset on termination is fine (post-latch envs are ignored).

IMPORTANT -- two methodology lessons baked in (both flipped earlier results):
  * HIT must be the env's ball_hit term (real contact), NOT a proximity threshold -- a 0.22 m
    body-link proximity test counted near-misses as hits and made even the oracle look terrible.
  * DEPTH policies must be eval'd WITH their training sim2real depth aug (--depth-aug, default True).
    Clean depth is OOD for them. Run --depth-aug False to see the clean-depth numbers.

Three regimes:
  default        ONE throw per env from a clean stand (the paper's "Reset" regime)
  --walk-recover the paper's "Deployment" regime: the WALK loco policy returns the robot to its
                 station between throws, then the DODGE policy handles the throw. Mirrors the real
                 deployment loop (walk<->dodge switch). Walk actor = Unitree-G1-AMP-Flat
                 (384->29, train_walk.sh); pass --walk-ckpt or train the "walk" experiment first.
  --continuous   back-to-back throws (alternating UP/DOWN per round), NO stand-reset between -- the
                 robot flows from one throw into the next (only termination auto-resets).

Usage:
  uv run python scripts/dodge_benchmark.py                    # statue + all non-omni keys (Reset)
  uv run python scripts/dodge_benchmark.py --walk-recover     # Deployment regime
  uv run python scripts/dodge_benchmark.py --only vision_link
  BENCH_CBF_FILTER=1 uv run python scripts/dodge_benchmark.py --only state_joint   # "+filter" cell
  uv run python scripts/dodge_benchmark.py --omni             # omni-throw oracle calibration
"""
from __future__ import annotations
import argparse, math, os
from collections import Counter
from dataclasses import asdict

import torch

# Base proprio dim the loco walk actor (Unitree-G1-AMP-Flat) expects: 29-joint G1, history 4,
# term-major [ang_vel(3) grav(3) cmd(3) joint_pos(29) joint_vel(29) actions(29)] * 4 = 384.
PROPRIO_BASE = 384


def _actor_cmd_slice(env):
    """(offset, width) of the 'command' (velocity) term within the actor obs vector.

    The command term sits before joint_pos/joint_vel in the term-major layout, so this
    offset is identical in the full actor obs AND the gimbal-sliced one (the gimbal slice
    only drops camera_pitch from the later joint terms). Width == 3 * history_length."""
    om = env.observation_manager
    names = list(om._group_obs_term_names["actor"])
    dims = [int(d[0]) for d in om._group_obs_term_dim["actor"]]
    off = 0
    for n, d in zip(names, dims):
        if n == "command":
            return off, d
        off += d
    raise RuntimeError("no 'command' term in the actor obs group")


def _home_recover_cmd(env, vel_deadband=0.5, omega_floor=1.0, pos_tol=0.35, yaw_tol=0.15,
                      turn_first_thresh=4.0, speed_tol=0.3, ang_speed_tol=1.0, height_tol=0.1):
    """Body-frame velocity command (N,3) = [vx, vy, wz] + a per-env ``settled`` mask, driving
    each robot back to its home STATION -- both position (env origin) and facing (spawn
    heading) -- in a ROTATE-THEN-TRANSLATE fashion.

    Used in the walk-recover phase so the robot returns to its throwing station between throws
    (deploy-faithful) instead of standing wherever / facing whichever way the last dodge left
    it. Reuses the env twist command's P-gains/limits. The caller early-exits the recovery
    (throws the next ball) once ``settled`` -- within ``pos_tol`` m and ``yaw_tol`` rad of home.

      * Turn-while-walking: yaw error is taken to the HOME heading (yaw of the
        ``default_root_state`` pose the robot resets to) and commanded alongside the
        translation. This loco policy turns poorly IN PLACE (zero linear velocity) but turns
        well while walking, so by default translation is NOT suppressed (turn_first_thresh is
        set above pi). The knob remains: with a finite ``turn_first_thresh`` the robot rotates
        in place while |yaw_err| exceeds it -- but for this policy that starves it (it neither
        translates nor effectively rotates from a far, spun, post-dodge pose), so it is off.
      * Rotation floor: the policy under-tracks slow turns, so when a turn is needed the yaw
        command is floored to ``omega_floor`` rad/s (a strong, trackable turn) up to the cfg
        cap, rather than a weak proportional creep.
      * Linear deadband: translation below ``vel_deadband`` m/s is zeroed (no creep on a
        command the policy can't follow); the P-command shrinks with distance, so this stops
        the robot once roughly home."""
    from mjlab.utils.lab_api.math import quat_apply_inverse, yaw_quat, wrap_to_pi
    robot = env.scene["robot"]
    tc = env.cfg.commands["twist"]  # GoToGoalCommandCfg -- reuse its gains/limits
    base_xy = robot.data.root_link_pos_w[:, :2]
    home_xy = env.scene.env_origins[:, :2]
    err_w = home_xy - base_xy
    dist = err_w.norm(dim=-1)
    err_w3 = torch.cat([err_w, torch.zeros_like(err_w[:, :1])], dim=-1)
    err_b = quat_apply_inverse(yaw_quat(robot.data.root_link_quat_w), err_w3)[:, :2]
    # Home heading = yaw of the default (spawn) root quaternion the robot resets to.
    hq = robot.data.default_root_state[:, 3:7]  # (w, x, y, z)
    w, x, y, z = hq.unbind(-1)
    home_heading = torch.atan2(2 * (w * z + x * y), 1 - 2 * (y * y + z * z))
    yaw_err = wrap_to_pi(home_heading - robot.data.heading_w)
    need_turn = yaw_err.abs() > yaw_tol

    # Rotation: strong turn (>= omega_floor rad/s) toward home heading while mis-facing.
    omega_cap = max(tc.max_ang_vel_z, omega_floor)
    wz_mag = (tc.kp_yaw * yaw_err.abs()).clamp(min=omega_floor, max=omega_cap)
    wz = torch.where(need_turn, torch.sign(yaw_err) * wz_mag, torch.zeros_like(yaw_err))

    # Translation toward origin (P-control, clamped, linear deadband). Rotate-then-translate:
    # no translation while still turning to face home.
    v = tc.kp * err_b
    v[:, 0] = v[:, 0].clamp(-tc.max_lin_vel_x, tc.max_lin_vel_x)
    v[:, 1] = v[:, 1].clamp(-tc.max_lin_vel_y, tc.max_lin_vel_y)
    v[v.norm(dim=-1) < vel_deadband] = 0.0
    v[yaw_err.abs() > turn_first_thresh] = 0.0  # rotate-first only when grossly mis-facing

    cmd = torch.zeros(env.num_envs, 3, device=err_w.device)
    cmd[:, :2] = v
    cmd[:, 2] = wz
    # Settled into a STABLE STAND at home: at the origin (position), facing home (heading), AND
    # genuinely standing again -- low linear & angular speed, upright at standing height (not
    # mid-stride, not crouched/toppling from the last dodge). The caller throws the next ball
    # only once this holds, so the robot is never pelted mid-recovery / off-balance.
    base_speed = robot.data.root_link_lin_vel_w[:, :2].norm(dim=-1)
    ang_speed = robot.data.root_link_ang_vel_w.norm(dim=-1)
    stand_h = robot.data.default_root_state[:, 2]
    root_h = robot.data.root_link_pos_w[:, 2]
    standing = (base_speed < speed_tol) & (ang_speed < ang_speed_tol) & (root_h > stand_h - height_tol)
    settled = (dist < pos_tol) & (yaw_err.abs() < yaw_tol) & standing
    return cmd, settled


def region_of(name: str) -> str:
    n = name.lower()
    if "head" in n or "neck" in n:
        return "head"
    if any(k in n for k in ("shoulder", "elbow", "wrist", "hand", "arm")):
        return "arms"
    if any(k in n for k in ("hip", "knee", "ankle", "foot", "leg", "thigh", "calf")):
        return "legs"
    if any(k in n for k in ("pelvis", "torso", "waist", "spine", "trunk", "chest", "base")):
        return "torso"
    return "other"


_STATE_TASK = "Unitree-G1-AMP-Dodge-MimicKit-Flat"
_VISION_TASK = "Unitree-G1-AMP-Dodge-Depth-Single-BallOnly-Flat"

# key -> (task id, experiment name). Experiment names match the train_runs/<key>.sh scripts
# (each exports EXP_NAME=<key>), so newest_ckpt(exp) auto-discovers a fresh training run.
# gimbal_* keys run the same BallOnly task with the oracle-aimed camera-pitch gimbal; the
# benchmark sets CAMERA_GIMBAL=1 CAMERA_PROPRIO=1 for them automatically (see _set_gimbal_env).
TASKS = {
    # State oracle (ground-truth ball obs), safety-mode trio (eval'd bare):
    "state_none":   (_STATE_TASK, "state_none"),
    "state_link":   (_STATE_TASK, "state_link"),
    "state_joint":  (_STATE_TASK, "state_joint"),
    # Fixed head camera, ball-only masked depth:
    "vision_none":  (_VISION_TASK, "vision_none"),
    "vision_link":  (_VISION_TASK, "vision_link"),
    "vision_joint": (_VISION_TASK, "vision_joint"),
    # Oracle-aimed gimbal camera:
    "gimbal_none":  (_VISION_TASK, "gimbal_none"),
    "gimbal_link":  (_VISION_TASK, "gimbal_link"),
    "gimbal_joint": (_VISION_TASK, "gimbal_joint"),
    # Omni-throw oracle calibration (trained with OMNI_THROW=1; MUST be eval'd WITH --omni --
    # by default these keys run only when --omni is passed, and the front-throw keys are skipped).
    "state_link_omni":  (_STATE_TASK, "state_link_omni"),
    "state_joint_omni": (_STATE_TASK, "state_joint_omni"),
}


def _set_gimbal_env(key: str) -> None:
    """Set/clear the gimbal env-var gates for this key (read at env-BUILD time)."""
    if key.startswith("gimbal"):
        os.environ["CAMERA_GIMBAL"] = "1"
        os.environ["CAMERA_PROPRIO"] = "1"
    else:
        os.environ.pop("CAMERA_GIMBAL", None)
        os.environ.pop("CAMERA_PROPRIO", None)
# throw params (mirror dodge_env_cfgs.py throw_ball_on_dwell registration)
DIST = (2.0, 3.0); ANGLE_DEG = 25.0; FLIGHT = (0.58, 0.63)
H_DESC = (1.5, 2.3)                 # descending (DOWN) launch height
H_LOW = (0.4, 0.9)                  # low-arc (UP) launch height
# UP arrival height (0.9, 1.3) -- matches training (dodge_env_cfgs.py adopted it 2026-06-09 after
# this benchmark's frozen-statue sweep): z_tgt > ~1.4 m sails clean over the head (head top ~1.3 +
# ball radius ~0.1), and with the 0.1 m lateral aim noise the 1.3-1.5 band is mostly a free miss --
# the old (1.0, 1.5) wasted ~26% of UP throws on unhittable balls. (0.9, 1.3) keeps every throw a
# real threat (statue hit rate ~97%) while staying chest/head height (duck territory). NOTE:
# checkpoints trained BEFORE the change saw (1.0, 1.5) throws -- still a fair eval (a subset of
# their training range). --up-z overrides.
H_TGT = (0.9, 1.3)
AIM_NOISE = 0.1; G = 9.81
# Omnidirectional fast-throw eval (mirrors the OMNI_THROW=1 training env): 360deg world bearing,
# OMNI_DIST away, fixed launch speed OMNI_SPEED, solved (direct arc) to hit the body. up_mask maps to
# a high/low target-z band so the UP(duck)/DOWN(low) success breakdown stays meaningful.
# SPEED: matches the released MimicKit config (12-15 m/s, 8-10 m) -- paper text says 20-25 m/s
# (harder written spec); override via --omni-speed or OMNI_SPEED_MIN/MAX env vars if needed.
OMNI_DIST = (8.0, 10.0); OMNI_SPEED = (12.0, 15.0)
OMNI_TZ_HIGH = (0.9, 1.3); OMNI_TZ_LOW = (0.3, 0.7)


def newest_ckpt(exp: str) -> str | None:
    d = f"logs/rsl_rl/{exp}"
    best, bt = None, -1.0
    for root, _, files in os.walk(d):
        for f in files:
            if f.startswith("model_") and f.endswith(".pt"):
                p = os.path.join(root, f); t = os.path.getmtime(p)
                if t > bt: best, bt = p, t
    return best


def yaw_quat(q):  # (...,4) wxyz -> yaw-only quat
    w, x, y, z = q.unbind(-1)
    yaw = torch.atan2(2 * (w * z + x * y), 1 - 2 * (y * y + z * z))
    hz = yaw * 0.5
    out = torch.zeros_like(q); out[..., 0] = torch.cos(hz); out[..., 3] = torch.sin(hz)
    return out


def quat_apply(q, v):
    w, x, y, z = q.unbind(-1)
    t = 2 * torch.cross(torch.stack([x, y, z], -1), v, dim=-1)
    return v + w.unsqueeze(-1) * t + torch.cross(torch.stack([x, y, z], -1), t, dim=-1)


def inject_throw(env, up_mask, seed, h_tgt=None, omni=False):
    """Replicate throw_ball_on_dwell's launch math for ALL envs; up_mask[i]=True -> duckable arc.
    omni=True -> the omnidirectional fast throw (360deg bearing, OMNI_DIST away, OMNI_SPEED launch
    speed solved to hit the body); up_mask picks the high (duck) vs low target-z band."""
    h_tgt = h_tgt or H_TGT
    g = torch.Generator(device=env.device).manual_seed(seed)
    robot, ball = env.scene["robot"], env.scene["ball"]
    n = env.num_envs; dev = env.device
    rp = robot.data.root_link_pos_w; rq = robot.data.root_link_quat_w
    yq = yaw_quat(rq)
    U = lambda a, b: torch.rand(n, generator=g, device=dev) * (b - a) + a
    if omni:
        from src.tasks.amp_loco.mdp.events import solve_ballistic_velocity
        bearing = U(-math.pi, math.pi)                       # world-frame 360deg
        dist = U(*OMNI_DIST)
        start = torch.empty(n, 3, device=dev)
        start[:, 0] = rp[:, 0] + dist * torch.cos(bearing)
        start[:, 1] = rp[:, 1] + dist * torch.sin(bearing)
        start[:, 2] = U(*H_DESC)                             # release height
        speed = U(*OMNI_SPEED)
        target = torch.empty(n, 3, device=dev)
        target[:, 0:2] = rp[:, 0:2] + AIM_NOISE * torch.randn(n, 2, generator=g, device=dev)
        target[:, 2] = torch.where(up_mask, U(*OMNI_TZ_HIGH), U(*OMNI_TZ_LOW))
        vel = solve_ballistic_velocity(start, target, speed, gravity=G)
        quat = torch.zeros(n, 4, device=dev); quat[:, 0] = 1.0
        ball.write_root_link_pose_to_sim(torch.cat([start, quat], -1))
        rv = torch.zeros(n, 6, device=dev); rv[:, 0:3] = vel
        ball.write_root_link_velocity_to_sim(rv)
        return
    high = up_mask
    dist = U(*DIST); angle = (U(-ANGLE_DEG, ANGLE_DEG)) * math.pi / 180.0
    lateral = dist * torch.tan(angle)
    offb = torch.stack([dist, lateral, torch.zeros_like(dist)], -1)
    offw = quat_apply(yq, offb)
    start = torch.empty(n, 3, device=dev)
    start[:, 0:2] = rp[:, 0:2] + offw[:, 0:2]
    start[:, 2] = torch.where(high, U(*H_LOW), U(*H_DESC))
    t_req = U(*FLIGHT)
    t_max = torch.sqrt((2.0 * (start[:, 2] - 0.05).clamp(min=1e-3) / G))
    t_flight = torch.where(high, t_req, torch.minimum(t_req, t_max))
    target_xy = rp[:, 0:2].clone() + AIM_NOISE * torch.randn(n, 2, generator=g, device=dev)
    disp = target_xy - start[:, 0:2]
    vel = torch.zeros(n, 3, device=dev)
    vel[:, 0] = disp[:, 0] / t_flight; vel[:, 1] = disp[:, 1] / t_flight
    z_tgt = U(*h_tgt)
    vz_high = (z_tgt - start[:, 2]) / t_flight + 0.5 * G * t_flight
    vel[:, 2] = torch.where(high, vz_high, torch.zeros_like(vz_high))
    quat = torch.zeros(n, 4, device=dev); quat[:, 0] = 1.0
    ball.write_root_link_pose_to_sim(torch.cat([start, quat], -1))
    rv = torch.zeros(n, 6, device=dev); rv[:, 0:3] = vel
    ball.write_root_link_velocity_to_sim(rv)


def run_task(key, task, exp, ckpt, args, dev, walk_recover=False):
    import src.tasks  # noqa
    from src.tasks.amp_loco.config.g1 import dodge_env_cfgs as dec
    from src.tasks.amp_loco.mdp.events import reset_to_default_stand
    from mjlab.envs import ManagerBasedRlEnv
    from mjlab.rl import MjlabOnPolicyRunner, RslRlVecEnvWrapper
    from mjlab.tasks.registry import load_rl_cfg, load_runner_cls

    builders = {
        _STATE_TASK:
            lambda play=True, depth_frame_offsets=None: dec.g1_amp_dodge_mimickit_flat_env_cfg(play=play),
        _VISION_TASK: dec.g1_amp_dodge_depth_single_ballonly_flat_env_cfg,
    }
    offs = tuple(int(x) for x in args.frame_offsets.split(","))
    ballonly = task == _VISION_TASK
    # gimbal_* keys need the gimbal env-var gates set BEFORE the cfg builder runs.
    _set_gimbal_env(key)
    # BallOnly's training DR is gated by BALLONLY_AUG inside its builder (the masked-depth profile,
    # not the full-frame aug). Turn it on BEFORE building so eval matches training. The joint-CBF
    # filter is train-only, so force CBF_JOINT off -> eval the bare actor exactly as at deploy.
    if ballonly and args.depth_aug:
        os.environ["BALLONLY_AUG"] = "1"
    # Filter is train-only -> default OFF at eval (bare actor = deploy scenario). Set
    # BENCH_CBF_FILTER=1 to keep the joint-CBF filter ACTIVE at eval -- the paper's "+filter"
    # cells (needs privileged ball state, not deployable).
    os.environ["CBF_JOINT"] = "1" if os.environ.get("BENCH_CBF_FILTER") == "1" else "0"
    cfg = builders[task](play=True, depth_frame_offsets=offs)
    cfg.scene.num_envs = args.n
    # zero-velocity command for ALL envs (stand & dodge in place)
    cfg.commands["twist"].rel_inplace_throw_envs = 1.0
    cfg.commands["twist"].rel_standing_envs = 0.0
    # clean standing reset (not dynamic RSI) so the only variable is the throw
    if "reset_from_motion" in cfg.events:
        cfg.events["reset_from_motion"].func = reset_to_default_stand
        cfg.events["reset_from_motion"].params = {}
    # remove the auto dwell-throw (we inject our own controlled throw)
    cfg.events.pop("throw_ball_on_dwell", None)
    # KEEP terminations: we read the env's EXACT per-term firings (incl. the sustained
    # collapsed_crouch) and latch the first event per env. Auto-reset on termination is fine --
    # post-latch envs are ignored (the ball is consumed; no re-throw). time_out (1000 steps) can't
    # fire in our ~100-step trial, so within the window only hit/fall terminations occur.

    agent_cfg = load_rl_cfg(task)
    env = ManagerBasedRlEnv(cfg=cfg, device=dev)
    envw = RslRlVecEnvWrapper(env, clip_actions=agent_cfg.clip_actions)
    runner = (load_runner_cls(task) or MjlabOnPolicyRunner)(envw, asdict(agent_cfg), device=dev)
    runner.load(ckpt); policy = runner.get_inference_policy(device=dev)

    robot = env.scene["robot"]
    body_names = list(robot.body_names)
    n = args.n
    up_mask = torch.zeros(n, dtype=torch.bool, device=dev)
    up_mask[: n // 2] = True  # first half UP (duckable), second half DOWN (low)
    reg_up, reg_dn = Counter(), Counter()  # hit-location tally (region) by throw type
    link_ct = Counter()                    # hit-location tally by specific link name
    ballz = []                             # ball height at each hit

    # categorize the env's real termination terms
    tm = env.termination_manager
    active = list(tm.active_terms)
    HIT_TERMS = [t for t in active if t == "ball_hit"]
    FALL_TERMS = [t for t in active if t in ("bad_orientation", "bad_base_height", "collapsed_crouch")]
    print(f"  termination terms: hit={HIT_TERMS} fall={FALL_TERMS} (all active={active})")

    obs, _ = envw.reset()
    cmd_norm = float(env.command_manager.get_term("twist").command[:, :2].norm(dim=-1).mean())
    hit = torch.zeros(n, dtype=torch.bool, device=dev)
    fell = torch.zeros(n, dtype=torch.bool, device=dev)
    trial_done = torch.zeros(n, dtype=torch.bool, device=dev)  # latch: ignore an env after its 1st event

    def latch_step(up_now, pb, pbody):
        # read the env's exact per-term firings from THIS step (first event/env). pb/pbody are the
        # ball / body-link positions captured BEFORE this step -- i.e. at contact, before the env
        # auto-resets the hit env and re-parks the ball (reading post-step gives the parked ball).
        live = ~trial_done
        hb = torch.zeros(n, dtype=torch.bool, device=dev)
        fb = torch.zeros(n, dtype=torch.bool, device=dev)
        for t in HIT_TERMS:
            hb |= tm.get_term(t).bool()
        for t in FALL_TERMS:
            fb |= tm.get_term(t).bool()
        new_hit = hb & live
        if bool(new_hit.any()):
            d = (pbody - pb.unsqueeze(1)).norm(dim=-1)  # (n,L) ball-to-link distance at contact
            nearest = d.argmin(dim=1)
            for i in new_hit.nonzero(as_tuple=False).flatten().tolist():
                ln = body_names[int(nearest[i])]
                (reg_up if bool(up_now[i]) else reg_dn)[region_of(ln)] += 1
                link_ct[ln] += 1
                ballz.append(float(pb[i, 2]))
        hit.logical_or_(new_hit)
        fell.logical_or_(fb & live)
        trial_done.logical_or_(hb | fb)

    def snap():  # ball + body-link positions BEFORE a step (for at-contact attribution)
        return (env.scene["ball"].data.root_link_pos_w.clone(),
                robot.data.body_link_pos_w.clone())

    # DEPTH_HOLD_STEPS=N: hold the depth obs group constant for N policy steps before refreshing it,
    # modelling the real onboard perception rate (ZED + EfficientTAM ~10 Hz) feeding the 50 Hz policy
    # -> N=5 ~= 10 fps. Default 1 = fresh depth every step (unchanged). Gates the policy call below.
    _hold_n = int(os.environ.get("DEPTH_HOLD_STEPS", "1"))
    if _hold_n > 1:
        _dkeys = [k for k in obs.keys() if "depth" in str(k).lower()]
        assert _dkeys, f"DEPTH_HOLD_STEPS set but no depth obs group in {list(obs.keys())}"
        _raw_policy = policy
        _hold = {"t": 0, "buf": None}

        def policy(o):  # noqa: F811 -- hold depth for _hold_n steps (proprio still fresh @50Hz)
            if _hold["t"] % _hold_n == 0:
                _hold["buf"] = {k: o[k].clone() for k in _dkeys}
            else:
                for k in _dkeys:
                    o[k] = _hold["buf"][k]
            _hold["t"] += 1
            return _raw_policy(o)
        print(f"  [depth-hold] holding {_dkeys} for {_hold_n} policy steps (~{50 // _hold_n} fps perception)")

    # SAFETY_PROBE=1: record, per THREAT step, the metrics the CBF is meant to protect but the
    # ball-hit success rate ignores -- closest-limb clearance to the ball (the CBF h) and motion
    # "violence" (joint speed + action rate). Threat = the privileged command._dodge_threat flag
    # (perception-agnostic, works for every variant). The camera DOF is excluded from both violence
    # metrics so gimbal vs non-gimbal bodies compare fairly. Diagnostic only; no effect on the rollout.
    if os.environ.get("SAFETY_PROBE", "0") == "1":
        _cmd = env.command_manager.get_term("twist")
        _ball_s = env.scene["ball"]
        _bgid = env.sim.mj_model.geom(next(k for k, v in env.scene.entities.items()
                                           if v is _ball_s) + "/ball_collision").id
        # body-joint mask (exclude camera_pitch) for joint_vel + action rate
        _jn = list(robot.joint_names)
        _bjids = torch.tensor([i for i, n in enumerate(_jn) if n != "camera_pitch_joint"],
                              device=dev, dtype=torch.long)
        _atrm = env.action_manager.get_term("joint_pos")
        _an = list(_atrm._target_names)
        _baids = torch.tensor([i for i, n in enumerate(_an) if n != "camera_pitch_joint"],
                              device=dev, dtype=torch.long)
        _S = {"clear": [], "jvel": [], "arate": []}
        _sp_policy = policy

        def policy(o):  # noqa: F811 -- record safety/violence on threat steps (state pre-step)
            a = _sp_policy(o)
            th = _cmd._dodge_threat.bool()
            if bool(th.any()):
                bp = _ball_s.data.root_link_pos_w
                lp = robot.data.body_link_pos_w
                d = (lp - bp.unsqueeze(1)).norm(dim=-1)  # (N,L) centre dist
                r_ball = env.sim.model.geom_size[:, _bgid, 0]
                clear = d.min(dim=1).values - r_ball      # (N,) closest-limb surface clearance
                jvel = robot.data.joint_vel[:, _bjids].norm(dim=-1)          # (N,) body joint speed
                arate = (a - env.action_manager.action)[:, _baids].norm(dim=-1)  # (N,) body action rate
                _S["clear"].append(clear[th].detach().cpu())
                _S["jvel"].append(jvel[th].detach().cpu())
                _S["arate"].append(arate[th].detach().cpu())
            return a
        env._safety_stats = _S
        print("  [safety-probe] recording clearance / joint-vel / action-rate on threat steps")

    # REACTION_PROBE=1: record the FULL per-step time series (threat flag, body joint speed,
    # closest-limb ball distance) so we can measure, per throw, (a) reaction LATENCY = time from
    # threat onset to first evasive motion (body jvel crossing a threshold), and (b) LEAD = time
    # between that reaction and the ball's closest approach. Threat = privileged command._dodge_threat
    # (same physical anchor for every variant), so the latency of a depth policy INCLUDES its
    # perception delay -- a fixed camera should react later than a gimbal/oracle. Diagnostic only.
    if os.environ.get("REACTION_PROBE", "0") == "1":
        _cmdr = env.command_manager.get_term("twist")
        _ballr = env.scene["ball"]
        _jnr = list(robot.joint_names)
        _bjr = torch.tensor([i for i, n in enumerate(_jnr) if n != "camera_pitch_joint"],
                            device=dev, dtype=torch.long)
        _R = {"threat": [], "jvel": [], "dist": []}
        _rp_policy = policy

        def policy(o):  # noqa: F811 -- record full time series for reaction-time analysis
            a = _rp_policy(o)
            bp = _ballr.data.root_link_pos_w
            lp = robot.data.body_link_pos_w
            dist = (lp - bp.unsqueeze(1)).norm(dim=-1).min(dim=1).values  # (N,) closest-limb dist
            jvel = robot.data.joint_vel[:, _bjr].norm(dim=-1)             # (N,) body joint speed
            _R["threat"].append(_cmdr._dodge_threat.bool().detach().cpu())
            _R["jvel"].append(jvel.detach().cpu())
            _R["dist"].append(dist.detach().cpu())
            return a
        env._react_stats = _R
        env._react_dt = float(env.step_dt)
        print("  [reaction-probe] recording threat / jvel / ball-distance time series")

    # Settle for ~settle_seconds (default 3 s) so the robot has fully stabilized from its reset pose
    # before the first throw; convert seconds -> steps via step_dt.
    n_settle = round(args.settle_seconds / env.step_dt)

    def _settled_speed():
        return float(robot.data.root_link_lin_vel_w[:, :2].norm(dim=-1).mean())

    if walk_recover:
        # ---- WALK-RECOVER: deploy-faithful -- walk loco policy recovers between throws; dodge
        # policy handles each throw.  Mirrors real deployment (walk<->dodge switch).
        # Walk actor = Unitree-G1-AMP-Flat (384->29 proprio-only MLP), shares the dodge actor obs
        # group + ACTION_SCALE (no gain swap, same actuator config in this branch).
        from src.tasks.amp_loco.rl.frozen_actor import load_frozen_actor
        from tensordict import TensorDict as TD
        import rsl_rl.utils.utils as _rsl_utils

        # The loco checkpoint was saved with an older rsl_rl that had rsl_rl.utils.utils.Normalizer.
        # Inject a stub so torch.load can unpickle the checkpoint; load_frozen_actor then loads
        # only actor_state_dict (after MjlabOnPolicyRunner-style migration below).
        if not hasattr(_rsl_utils, "Normalizer"):
            class _LegacyNormalizerStub:
                def __init__(self, *a, **kw): pass
                def __setstate__(self, d): self.__dict__.update(d)
            _rsl_utils.Normalizer = _LegacyNormalizerStub

        # Patch load_frozen_actor's torch.load call: the loco ckpt has 'model_state_dict'
        # (legacy format) rather than 'actor_state_dict'.  Wrap torch.load to apply the same
        # migration that MjlabOnPolicyRunner.load() does before passing the dict downstream.
        _orig_torch_load = torch.load

        def _patched_load(path, *a, **kw):
            ck = _orig_torch_load(path, *a, **kw)
            if "model_state_dict" in ck and "actor_state_dict" not in ck:
                # Legacy format migration (mirrors MjlabOnPolicyRunner.load).
                msd = ck.pop("model_state_dict")
                asd = {}
                for k, v in msd.items():
                    if k.startswith("actor."):
                        asd[k.replace("actor.", "mlp.")] = v
                    elif k.startswith("actor_obs_normalizer."):
                        asd[k.replace("actor_obs_normalizer.", "obs_normalizer.")] = v
                    elif k in ("std", "log_std"):
                        asd[k] = v
                if "std" in asd:
                    asd["distribution.std_param"] = asd.pop("std")
                if "log_std" in asd:
                    asd["distribution.log_std_param"] = asd.pop("log_std")
                # Old checkpoints store the obs normalizer separately as obs_norm_state_dict;
                # wire it in as obs_normalizer.* so MLPModel.load_state_dict finds it.
                obs_norm = ck.get("obs_norm_state_dict", {})
                for k, v in obs_norm.items():
                    asd[f"obs_normalizer.{k}"] = v
                ck["actor_state_dict"] = asd
            return ck

        torch.load = _patched_load
        _walk_ckpt = args.walk_ckpt or newest_ckpt("walk")
        if not _walk_ckpt:
            raise SystemExit(
                "--walk-recover needs a walk checkpoint: train one with ./train_walk.sh "
                "(experiment name 'walk') or pass --walk-ckpt <path to Unitree-G1-AMP-Flat model_N.pt>."
            )
        n_recover = round(args.recover_seconds / env.step_dt)
        n_dwell = round(args.prethrow_settle / env.step_dt)
        tot = {"up": 0, "dn": 0}; hc = {"up": 0, "dn": 0}; fc = {"up": 0, "dn": 0}
        with torch.inference_mode():
            # Initial settle with dodge policy so depth ring + obs normaliser warm up.
            for _ in range(n_settle):
                obs, _, _, _ = envw.step(policy(obs))
            print(f"  settled {n_settle} steps (~{args.settle_seconds:.1f}s) with dodge policy; "
                  f"base speed {_settled_speed():.3f} m/s")

            # ---- GIMBAL support: when the env runs CAMERA_PROPRIO=1 (gimbal), its "actor" obs
            # carries camera_pitch_joint in the joint_pos + joint_vel proprio terms, so the actor
            # group is 392 instead of the base 384.  The base walk actor expects 384.  Build a
            # column-keep index that drops camera_pitch from joint_pos AND joint_vel (in EVERY
            # history copy), leaving 384.  The DODGE actor keeps the full 392 (unchanged).
            #
            # IMPORTANT -- the mjlab "actor" group layout is TERM-MAJOR, not frame-major: each
            # term's full history is flattened contiguously (term.buffer.reshape(N,-1) gives
            # [t0,t1,...,tH-1] per term), THEN terms are concatenated:
            #   [ang_vel(3*H), grav(3*H), cmd(3*H), joint_pos(J*H), joint_vel(J*H), actions(29*H)]
            # So within joint_pos / joint_vel the order is (history, joint): drop joint index
            # cam_idx from each of the H history rows.  (Verified live: J=30, cam_idx=29, dims
            # ang_vel/grav/cmd=12, joint_pos/joint_vel=120, actions=116, total=392.)
            _actor_dim = int(obs["actor"].shape[-1])
            _robot = env.scene["robot"]
            _has_gimbal_joint = "camera_pitch_joint" in list(_robot.joint_names)
            walk_keep = None  # None => pass proprio through unchanged (non-gimbal 384 path)
            if _has_gimbal_joint and _actor_dim != PROPRIO_BASE:
                cam_idx = list(_robot.joint_names).index("camera_pitch_joint")
                om = env.observation_manager
                term_names = list(om._group_obs_term_names["actor"])
                term_flat_dims = [int(d[0]) for d in om._group_obs_term_dim["actor"]]
                H = int(env.cfg.observations["actor"].history_length)
                keep_idx = []
                off = 0
                for tname, fdim in zip(term_names, term_flat_dims):
                    base = fdim // H  # per-history-copy width of this term
                    # Drop camera_pitch (idx cam_idx=last) from joint_pos/joint_vel in every
                    # history copy. The oracle-gimbal env keeps 29 actions (camera excluded from
                    # the action term), so the actions history needs no slicing.
                    if tname in ("joint_pos", "joint_vel"):
                        for h in range(H):
                            for k in range(base):
                                if k != cam_idx:
                                    keep_idx.append(off + h * base + k)
                    else:
                        keep_idx.extend(range(off, off + fdim))
                    off += fdim
                walk_keep = torch.tensor(keep_idx, device=dev, dtype=torch.long)
                assert walk_keep.numel() == PROPRIO_BASE, (
                    f"gimbal proprio slice produced {walk_keep.numel()} != {PROPRIO_BASE}"
                )
                print(f"  [gimbal] slicing walk proprio {_actor_dim} -> {PROPRIO_BASE} "
                      f"(history={H}, camera_pitch_joint idx={cam_idx}, dropped from "
                      f"joint_pos+joint_vel x{H} history copies)")

            def _walk_obs(o):
                """Build the 384-D proprio TensorDict the walk actor consumes from the env obs.
                Always returns a fresh tensor (clone / index_select copy) so the recovery loop
                can overwrite the command slice without mutating the env's live obs."""
                a = o["actor"]
                a = a.index_select(-1, walk_keep) if walk_keep is not None else a.clone()
                return TD({"actor": a}, batch_size=o.batch_size)

            cmd_off, cmd_w = _actor_cmd_slice(env)  # command slice (offset, width=3*H)

            # Load walk actor AFTER settle so obs TensorDict is fully populated (needed to
            # resolve obs_groups and build the actor's obs normaliser).  Feed it the SLICED obs so
            # the actor (and its obs normaliser) is built for the base 384 proprio.
            walk_actor, walk_groups = load_frozen_actor(
                teacher_task="Unitree-G1-AMP-Flat",
                checkpoint=_walk_ckpt,
                obs=_walk_obs(obs),
                num_actions=envw.num_actions,
                device=dev,
                obs_set="actor",
            )
            torch.load = _orig_torch_load  # restore immediately after loading the walk actor
            print(f"  walk-recover mode: n_recover={n_recover} steps (~{args.recover_seconds:.1f}s), "
                  f"n_dodge={args.window} steps per throw; walk_groups={walk_groups}")
            for r in range(args.rounds):
                # -- Recovery phase: walk policy returns to the home station (position + spawn
                # heading), no throw (no inject_throw), don't tally. Overwrite the walk obs
                # command slice with the rotate-then-translate back-to-home command each step;
                # early-exit once ALL envs are settled (within tolerance of home) -- throw then. --
                for _ in range(n_recover):
                    cmd, settled = _home_recover_cmd(env)
                    if bool(settled.all()):
                        break
                    wo = _walk_obs(obs)
                    wo["actor"][:, cmd_off:cmd_off + cmd_w] = cmd.repeat(1, cmd_w // 3)
                    obs, _, _, _ = envw.step(walk_actor(wo))  # deterministic mean
                # Pre-throw settle: hold a ZERO velocity command for n_dwell steps so residual
                # motion damps out and the robot is fully standing still before the throw.
                for _ in range(n_dwell):
                    wo = _walk_obs(obs)
                    wo["actor"][:, cmd_off:cmd_off + cmd_w] = 0.0
                    obs, _, _, _ = envw.step(walk_actor(wo))
                # Clear latches after recovery (any fall during recovery doesn't count).
                hit.zero_(); fell.zero_(); trial_done.zero_()
                # -- Dodge phase: inject throw, switch to dodge policy, tally. --
                up = (r % 2 == 0)
                up_now = torch.full((n,), up, dtype=torch.bool, device=dev)
                inject_throw(env, up_now, seed=args.seed + r, h_tgt=args.up_z, omni=getattr(args, 'omni', False))
                dodge_steps = 0
                for _ in range(args.window):
                    pb, pbody = snap()
                    obs, _, _, _ = envw.step(policy(obs))
                    latch_step(up_now, pb, pbody)
                    dodge_steps += 1
                kk = "up" if up else "dn"
                tot[kk] += n; hc[kk] += int(hit.sum()); fc[kk] += int(fell.sum())
                if r == 0:
                    print(f"  round 0: recover={n_recover} steps, dodge={dodge_steps} steps "
                          f"(up={up}); hits={int(hit.sum())}/{n} fell={int(fell.sum())}/{n}")
        def rate(d):  # per-throw fraction
            return d["up"] / max(tot["up"], 1), d["dn"] / max(tot["dn"], 1), (d["up"] + d["dn"]) / max(tot["up"] + tot["dn"], 1)
        hu, hd, ha = rate(hc); fu, fd, fa = rate(fc)
        su, sd_, sa = 1 - hu - fu, 1 - hd - fd, 1 - ha - fa
        mode = (f"walk-recover ({args.rounds} rounds x {n} envs = {args.rounds*n} throws; "
                f"recover={n_recover}steps/{args.recover_seconds:.1f}s, dodge={args.window}steps)")
    elif not args.continuous:
        # ---- CONTROLLED: one throw per env from a clean stand; 50 UP / 50 DOWN ----
        # TRAJ_DUMP=path.npz: record the full per-env trajectory of the single controlled
        # throw (root pose, joint positions, ball state per policy step, ~0.5 s pre-throw
        # lead-in, per-env outcomes + first-hit step) so showcase throws can be re-rendered
        # and re-styled offline without re-running any policy.
        _dump = os.environ.get("TRAJ_DUMP")
        _tr = None
        if _dump:
            _tr = {k: [] for k in ("root_pos", "root_quat", "joint_pos", "ball_pos", "ball_vel",
                                   "depth_obs")}
            _ball_e = env.scene["ball"]
            _hit_step = torch.full((n,), -1, dtype=torch.long, device=dev)
            _bgid_d = env.sim.mj_model.geom(
                next(k for k, v in env.scene.entities.items() if v is _ball_e) + "/ball_collision").id
            _dkey = next((k for k in obs.keys() if "depth" in str(k).lower()), None)

            def _rec():
                _tr["root_pos"].append(robot.data.root_link_pos_w.cpu().numpy().copy())
                _tr["root_quat"].append(robot.data.root_link_quat_w.cpu().numpy().copy())
                _tr["joint_pos"].append(robot.data.joint_pos.cpu().numpy().copy())
                _tr["ball_pos"].append(_ball_e.data.root_link_pos_w.cpu().numpy().copy())
                _tr["ball_vel"].append(_ball_e.data.root_link_lin_vel_w.cpu().numpy().copy())
                if _dkey is not None:
                    _tr["depth_obs"].append(
                        obs[_dkey].cpu().numpy().astype("float16").copy())
        _lead = 25  # settle steps recorded before the throw (~0.5 s lead-in)
        with torch.inference_mode():
            for _si in range(n_settle):        # stabilize + fill depth ring (pre-throw, no latch)
                obs, _, _, _ = envw.step(policy(obs))
                if _tr is not None and _si >= n_settle - _lead:
                    _rec()
            print(f"  settled {n_settle} steps (~{args.settle_seconds:.1f}s); base speed {_settled_speed():.3f} m/s")
            hit.zero_(); fell.zero_(); trial_done.zero_()   # settle terminations don't count
            _throw_step = len(_tr["root_pos"]) if _tr is not None else 0
            inject_throw(env, up_mask, seed=args.seed, h_tgt=args.up_z, omni=getattr(args, 'omni', False))
            for _wi in range(args.window):
                pb, pbody = snap()
                obs, _, _, _ = envw.step(policy(obs))
                latch_step(up_mask, pb, pbody)
                if _tr is not None:
                    _rec()
                    _hit_step[(_hit_step < 0) & hit] = _throw_step + _wi
        if _tr is not None:
            import numpy as np
            if not _tr["depth_obs"]:
                _tr.pop("depth_obs")
            np.savez_compressed(
                _dump,
                **{k: np.stack(v) for k, v in _tr.items()},
                depth_key=str(_dkey),
                hit=hit.cpu().numpy(), fell=fell.cpu().numpy(),
                up_mask=up_mask.cpu().numpy(), hit_step=_hit_step.cpu().numpy(),
                ball_radius=env.sim.model.geom_size[:, _bgid_d, 0].cpu().numpy(),
                joint_names=np.array(list(robot.joint_names)),
                step_dt=float(env.step_dt), throw_step=_throw_step,
                seed=args.seed, window=args.window)
            print(f"  [traj-dump] {len(_tr['root_pos'])} steps x {n} envs -> {_dump}", flush=True)
        success = ~(hit | fell)
        def split(m):
            return (float(m[up_mask].float().mean()), float(m[~up_mask].float().mean()), float(m.float().mean()))
        su, sd_, sa = split(success); hu, hd, ha = split(hit); fu, fd, fa = split(fell)
        mode = "controlled (1 throw/env, stand-reset)"
    else:
        # ---- CONTINUOUS: back-to-back throws, NO stand-reset between (only termination auto-reset);
        # rounds alternate UP/DOWN. Each round latches the first event/env, then tallies. ----
        tot = {"up": 0, "dn": 0}; hc = {"up": 0, "dn": 0}; fc = {"up": 0, "dn": 0}
        with torch.inference_mode():
            for _ in range(n_settle):          # initial settle only (no settle between rounds)
                obs, _, _, _ = envw.step(policy(obs))
            print(f"  settled {n_settle} steps (~{args.settle_seconds:.1f}s); base speed {_settled_speed():.3f} m/s")
            # Cadence: rethrow only after the previous ball has RESOLVED (landed on the floor or
            # passed the robot -- i.e. no longer airborne+closing) for every env, then a fixed
            # post-resolve settle so the robot gets realistic recovery instead of a fixed metronome.
            # CONT_POST_LAND_SETTLE (s, default 0.5) = the pause after resolve; CONT_MAX_FLY_STEPS
            # caps the wait (default 150 ≈ 3 s) so a stuck ball can't hang the loop. Set
            # CONT_FIXED_CADENCE=1 to restore the old fixed throw_every metronome.
            _fixed = os.environ.get("CONT_FIXED_CADENCE", "0") == "1"
            _post_land = round(float(os.environ.get("CONT_POST_LAND_SETTLE", "0.5")) / env.step_dt)
            _max_fly = int(os.environ.get("CONT_MAX_FLY_STEPS", "150"))
            _min_fly = 8  # let physics apply the launch velocity before testing "resolved"
            ball_e = env.scene["ball"]; robot_e = env.scene["robot"]
            for r in range(args.rounds):
                up = (r % 2 == 0)
                up_now = torch.full((n,), up, dtype=torch.bool, device=dev)
                inject_throw(env, up_now, seed=args.seed + r, h_tgt=args.up_z, omni=getattr(args, 'omni', False))
                hit.zero_(); fell.zero_(); trial_done.zero_()   # per-round latch
                if _fixed:
                    for _ in range(args.throw_every):
                        pb, pbody = snap()
                        obs, _, _, _ = envw.step(policy(obs))
                        latch_step(up_now, pb, pbody)
                else:
                    resolved = torch.zeros(n, dtype=torch.bool, device=dev)
                    for t in range(_max_fly):    # phase A: fly until every ball resolves
                        pb, pbody = snap()
                        obs, _, _, _ = envw.step(policy(obs))
                        latch_step(up_now, pb, pbody)
                        bp = ball_e.data.root_link_pos_w; bv = ball_e.data.root_link_lin_vel_w
                        rp = robot_e.data.root_link_pos_w
                        closing = ((rp - bp) * bv).sum(-1) > 0.0
                        active = (bp[:, 2] > 0.15) & closing   # airborne AND still approaching
                        if t >= _min_fly:
                            resolved |= ~active
                        if bool(resolved.all()):
                            break
                    for _ in range(_post_land):   # phase B: post-resolve recovery settle
                        pb, pbody = snap()
                        obs, _, _, _ = envw.step(policy(obs))
                        latch_step(up_now, pb, pbody)
                kk = "up" if up else "dn"
                tot[kk] += n; hc[kk] += int(hit.sum()); fc[kk] += int(fell.sum())
        def rate(d):  # per-throw fraction
            return d["up"] / max(tot["up"], 1), d["dn"] / max(tot["dn"], 1), (d["up"] + d["dn"]) / max(tot["up"] + tot["dn"], 1)
        hu, hd, ha = rate(hc); fu, fd, fa = rate(fc)
        su, sd_, sa = 1 - hu - fu, 1 - hd - fd, 1 - ha - fa
        _cad = "fixed throw_every" if _fixed else f"land+{os.environ.get('CONT_POST_LAND_SETTLE','0.5')}s"
        mode = f"continuous ({args.rounds} rounds x {n} envs = {args.rounds*n} throws, {_cad}, no stand-reset)"

    print(f"\n===== {key:13s} ({exp}) =====")
    print(f"  ckpt={os.path.basename(ckpt)}  cmd_norm={cmd_norm:.3f}  mode={mode}")
    print(f"  {'':10s} {'UP(duck)':>10s} {'DOWN(low)':>10s} {'ALL':>8s}")
    print(f"  {'success':10s} {su*100:9.0f}% {sd_*100:9.0f}% {sa*100:7.0f}%")
    print(f"  {'  hit':10s} {hu*100:9.0f}% {hd*100:9.0f}% {ha*100:7.0f}%")
    print(f"  {'  fell':10s} {fu*100:9.0f}% {fd*100:9.0f}% {fa*100:7.0f}%")
    # hit-location breakdown (region the ball was nearest to when ball_hit fired)
    reg_all = reg_up + reg_dn
    order = ["legs", "torso", "arms", "head", "other"]
    tot_h = sum(reg_all.values())
    if tot_h:
        cells = "  ".join(f"{r}={100*reg_all[r]/tot_h:.0f}%" for r in order if reg_all[r])
        print(f"  hit regions ({tot_h} hits): {cells}")
        nu, nd = sum(reg_up.values()), sum(reg_dn.values())
        if nu:
            print(f"     UP   hits: " + "  ".join(f"{r}={100*reg_up[r]/nu:.0f}%" for r in order if reg_up[r]))
        if nd:
            print(f"     DOWN hits: " + "  ".join(f"{r}={100*reg_dn[r]/nd:.0f}%" for r in order if reg_dn[r]))
        top = "  ".join(f"{ln}={c}" for ln, c in link_ct.most_common(6))
        print(f"  nearest link: {top}")
        bz = torch.tensor(ballz)
        print(f"  ball height at hit (m): median={float(bz.median()):.2f}  range=[{float(bz.min()):.2f},{float(bz.max()):.2f}]")
    if hasattr(env, "_react_stats") and env._react_stats["threat"]:
        _th = torch.stack(env._react_stats["threat"])   # (T, N)
        _jv = torch.stack(env._react_stats["jvel"])      # (T, N)
        _ds = torch.stack(env._react_stats["dist"])      # (T, N)
        _dt = env._react_dt
        _dd = os.environ.get("REACTION_DUMP_DIR")
        if _dd:
            torch.save({"threat": _th, "jvel": _jv, "dist": _ds, "dt": _dt, "key": key},
                       os.path.join(_dd, f"react_{key}.pt"))
            print(f"  [reaction] dumped series to {_dd}/react_{key}.pt")
        T_, N_ = _th.shape
        _JT = 2.0  # body-jvel threshold (rad/s): clearly-evasive vs settled-idle motion
        lat, lead = [], []
        for i in range(N_):
            thr = _th[:, i]
            if not bool(thr.any()):
                continue
            t0 = int(thr.float().argmax())               # first threat step
            react = (_jv[t0:, i] > _JT).nonzero(as_tuple=False)
            if react.numel() == 0:
                continue
            tr = t0 + int(react[0])                       # first evasive-motion step
            tc = t0 + int(_ds[t0:, i].argmin())           # closest-approach step
            lat.append((tr - t0) * _dt)
            lead.append((tc - tr) * _dt)
        if lat:
            lat_t = torch.tensor(lat); lead_t = torch.tensor(lead)
            print(f"  [reaction] n={lat_t.numel()} throws (jvel>{_JT} rad/s) | "
                  f"latency(s) med={lat_t.median():.3f} mean={lat_t.mean():.3f} p90={torch.quantile(lat_t, 0.9):.3f} | "
                  f"lead-before-closest(s) med={lead_t.median():.3f} mean={lead_t.mean():.3f} | "
                  f"reacted-before-closest={100 * (lead_t > 0).float().mean():.0f}%")
    if hasattr(env, "_safety_stats") and env._safety_stats["clear"]:
        _S = {k: torch.cat(v) for k, v in env._safety_stats.items()}
        cl, jv, ar = _S["clear"], _S["jvel"], _S["arate"]
        clq = torch.quantile(cl, torch.tensor([0.05, 0.10, 0.50]))
        print(f"  [safety] n={cl.numel()} threat-steps | "
              f"clearance(m) p05={clq[0]:.3f} p10={clq[1]:.3f} med={clq[2]:.3f} "
              f"frac<0.15m={(cl < 0.15).float().mean() * 100:.0f}% | "
              f"jointvel(rad/s) mean={jv.mean():.2f} p95={torch.quantile(jv, 0.95):.2f} | "
              f"actionrate mean={ar.mean():.3f} p95={torch.quantile(ar, 0.95):.3f}")
    env.close() if hasattr(env, "close") else None
    del env, envw, runner, policy
    torch.cuda.empty_cache()
    return dict(key=key, success=sa, success_up=su, success_down=sd_, hit=ha, fell=fa,
                cmd_norm=cmd_norm, hit_regions={r: reg_all[r] for r in order if reg_all[r]})


def run_statue(args, dev):
    """Frozen-statue CONTROL: the robot is kinematically pinned in its default stand every step
    (cannot dodge, cannot fall), and the same seeded throws are launched at it. Its hit rate is the
    fraction of throws that are geometrically ON-TARGET -- the free-miss floor every policy's
    success rides on. Run on the state (no-camera) env: throws are policy-independent."""
    import src.tasks  # noqa
    from src.tasks.amp_loco.config.g1 import dodge_env_cfgs as dec
    from src.tasks.amp_loco.mdp.events import reset_to_default_stand
    from mjlab.envs import ManagerBasedRlEnv

    n = args.n
    cfg = dec.g1_amp_dodge_mimickit_flat_env_cfg(play=True)
    cfg.scene.num_envs = n
    cfg.commands["twist"].rel_inplace_throw_envs = 1.0
    cfg.commands["twist"].rel_standing_envs = 0.0
    cfg.events["reset_from_motion"].func = reset_to_default_stand
    cfg.events["reset_from_motion"].params = {}
    cfg.events.pop("throw_ball_on_dwell", None)
    env = ManagerBasedRlEnv(cfg=cfg, device=dev)
    robot, tm = env.scene["robot"], env.termination_manager
    acts = torch.zeros(n, env.action_manager.total_action_dim, device=dev)
    up_mask = torch.zeros(n, dtype=torch.bool, device=dev); up_mask[: n // 2] = True

    env.reset()
    pos0 = robot.data.root_link_pos_w.clone(); quat0 = robot.data.root_link_quat_w.clone()
    jp0 = robot.data.joint_pos.clone(); jv0 = torch.zeros_like(robot.data.joint_vel)
    zero6 = torch.zeros(n, 6, device=dev)

    def freeze():
        robot.write_root_link_pose_to_sim(torch.cat([pos0, quat0], dim=-1))
        robot.write_root_link_velocity_to_sim(zero6)
        robot.write_joint_state_to_sim(jp0, jv0)

    def play_round(up_now, seed, steps):
        inject_throw(env, up_now, seed=seed, h_tgt=args.up_z, omni=getattr(args, 'omni', False))
        done = torch.zeros(n, dtype=torch.bool, device=dev)
        for _ in range(steps):
            freeze(); env.step(acts)
            done |= tm.get_term("ball_hit").bool()
        return done

    with torch.inference_mode():
        for _ in range(10):
            freeze(); env.step(acts)
        if not args.continuous:
            hit = play_round(up_mask, args.seed, args.window)
            hu, hd = float(hit[up_mask].float().mean()), float(hit[~up_mask].float().mean())
            ha = float(hit.float().mean())
        else:
            tot = {"up": 0, "dn": 0}; hc = {"up": 0, "dn": 0}
            for r in range(args.rounds):
                up = (r % 2 == 0)
                done = play_round(torch.full((n,), up, dtype=torch.bool, device=dev),
                                  args.seed + r, args.throw_every)
                kk = "up" if up else "dn"
                tot[kk] += n; hc[kk] += int(done.sum())
            hu, hd = hc["up"] / max(tot["up"], 1), hc["dn"] / max(tot["dn"], 1)
            ha = (hc["up"] + hc["dn"]) / max(tot["up"] + tot["dn"], 1)
    su, sd_, sa = 1 - hu, 1 - hd, 1 - ha
    print(f"\n===== {'statue':13s} (frozen control -- hit rate = fraction of throws ON-TARGET) =====")
    print(f"  {'':10s} {'UP(duck)':>10s} {'DOWN(low)':>10s} {'ALL':>8s}")
    print(f"  {'success':10s} {su*100:9.0f}% {sd_*100:9.0f}% {sa*100:7.0f}%")
    print(f"  {'  hit':10s} {hu*100:9.0f}% {hd*100:9.0f}% {ha*100:7.0f}%")
    env.close() if hasattr(env, "close") else None
    del env
    torch.cuda.empty_cache()
    return dict(key="statue", success=sa, success_up=su, success_down=sd_, hit=ha, fell=0.0,
                cmd_norm=0.0, hit_regions={})


def render_task(key, task, exp, ckpt, args, dev):
    """Render a walk-recover video for one policy (num_envs=1, render_mode='rgb_array').

    Produces a third-person MP4 that tracks the robot through 100 consecutive
    walk-recover -> dodge throws (50 UP + 50 DOWN shuffled by seeded RNG).

    The render path reuses the same walk-recover logic as run_task(...,
    walk_recover=True) but captures env.render() after every step and writes the
    frames to an MP4 via imageio.  The benchmark tallying code is preserved so a
    per-throw success table is printed at the end.

    Args:
        key: policy key (e.g. "vision_link" or "gimbal_joint")
        task: task name string
        exp: experiment dir name (unused if ckpt is explicit)
        ckpt: checkpoint path
        args: parsed argparse namespace (render_video, render_throws,
              render_randomized, frame_offsets, seed, depth_aug, walk_ckpt,
              recover_seconds, window, settle_seconds, up_z are used)
        dev: device string ("cuda:0" etc.)
    """
    import random as _random
    import numpy as np
    import imageio
    import src.tasks  # noqa
    from src.tasks.amp_loco.config.g1 import dodge_env_cfgs as dec
    from src.tasks.amp_loco.mdp.events import reset_to_default_stand
    from mjlab.envs import ManagerBasedRlEnv
    from mjlab.rl import MjlabOnPolicyRunner, RslRlVecEnvWrapper
    from mjlab.tasks.registry import load_rl_cfg, load_runner_cls
    from mjlab.viewer.viewer_config import ViewerConfig

    out_path = args.render_video
    n_throws = args.render_throws
    randomized = args.render_randomized

    builders = {
        _STATE_TASK:
            lambda play=True, depth_frame_offsets=None: dec.g1_amp_dodge_mimickit_flat_env_cfg(play=play),
        _VISION_TASK: dec.g1_amp_dodge_depth_single_ballonly_flat_env_cfg,
    }
    offs = tuple(int(x) for x in args.frame_offsets.split(","))
    ballonly = task == _VISION_TASK
    _set_gimbal_env(key)
    if ballonly and args.depth_aug:
        os.environ["BALLONLY_AUG"] = "1"
    os.environ["CBF_JOINT"] = "1" if os.environ.get("BENCH_CBF_FILTER") == "1" else "0"

    cfg = builders[task](play=True, depth_frame_offsets=offs)
    # Single environment for rendering
    cfg.scene.num_envs = 1
    cfg.commands["twist"].rel_inplace_throw_envs = 1.0
    cfg.commands["twist"].rel_standing_envs = 0.0
    # No on-screen markers in the recovery video: drop the origin goal sphere + velocity arrow
    # (GoToGoalCommand._debug_vis_impl draws both only when the command term's debug_vis is on).
    cfg.commands["twist"].debug_vis = False
    if "reset_from_motion" in cfg.events:
        cfg.events["reset_from_motion"].func = reset_to_default_stand
        cfg.events["reset_from_motion"].params = {}
    cfg.events.pop("throw_ball_on_dwell", None)

    # Configure viewer: track the robot root body, third-person angle
    # Azimuth 135 = robot visible with throws coming from front-left; distance 4m
    cfg.viewer = ViewerConfig(
        origin_type=ViewerConfig.OriginType.ASSET_ROOT,
        entity_name="robot",
        distance=4.0,
        elevation=-20.0,
        azimuth=135.0,
        lookat=(0.0, 0.0, 0.8),
        height=720,
        width=1280,
        max_extra_envs=0,
        enable_shadows=False,
        enable_reflections=False,
    )

    agent_cfg = load_rl_cfg(task)
    env = ManagerBasedRlEnv(cfg=cfg, device=dev, render_mode="rgb_array")
    envw = RslRlVecEnvWrapper(env, clip_actions=agent_cfg.clip_actions)
    runner = (load_runner_cls(task) or MjlabOnPolicyRunner)(envw, asdict(agent_cfg), device=dev)
    runner.load(ckpt); policy = runner.get_inference_policy(device=dev)

    n = 1  # single env
    tm = env.termination_manager
    active = list(tm.active_terms)
    HIT_TERMS = [t for t in active if t == "ball_hit"]
    FALL_TERMS = [t for t in active if t in ("bad_orientation", "bad_base_height", "collapsed_crouch")]
    print(f"  [render] termination terms: hit={HIT_TERMS} fall={FALL_TERMS}")

    # Build seeded UP/DOWN sequence
    if randomized:
        n_up = n_throws // 2; n_dn = n_throws - n_up
        up_seq = [True] * n_up + [False] * n_dn
        _random.Random(args.seed).shuffle(up_seq)
    else:
        up_seq = [(r % 2 == 0) for r in range(n_throws)]

    # Walk-recover setup (mirrors run_task walk_recover=True)
    from src.tasks.amp_loco.rl.frozen_actor import load_frozen_actor
    from tensordict import TensorDict as TD
    import rsl_rl.utils.utils as _rsl_utils

    if not hasattr(_rsl_utils, "Normalizer"):
        class _LegacyNormalizerStub:
            def __init__(self, *a, **kw): pass
            def __setstate__(self, d): self.__dict__.update(d)
        _rsl_utils.Normalizer = _LegacyNormalizerStub

    _orig_torch_load = torch.load
    def _patched_load(path, *a, **kw):
        ck = _orig_torch_load(path, *a, **kw)
        if "model_state_dict" in ck and "actor_state_dict" not in ck:
            msd = ck.pop("model_state_dict")
            asd = {}
            for k, v in msd.items():
                if k.startswith("actor."):
                    asd[k.replace("actor.", "mlp.")] = v
                elif k.startswith("actor_obs_normalizer."):
                    asd[k.replace("actor_obs_normalizer.", "obs_normalizer.")] = v
                elif k in ("std", "log_std"):
                    asd[k] = v
            if "std" in asd:
                asd["distribution.std_param"] = asd.pop("std")
            if "log_std" in asd:
                asd["distribution.log_std_param"] = asd.pop("log_std")
            obs_norm = ck.get("obs_norm_state_dict", {})
            for k, v in obs_norm.items():
                asd[f"obs_normalizer.{k}"] = v
            ck["actor_state_dict"] = asd
        return ck
    torch.load = _patched_load

    _walk_ckpt = args.walk_ckpt or newest_ckpt("walk")
    if not _walk_ckpt:
        raise SystemExit(
            "the render path needs a walk checkpoint: train one with ./train_walk.sh "
            "(experiment name 'walk') or pass --walk-ckpt <path to Unitree-G1-AMP-Flat model_N.pt>."
        )
    n_settle = round(args.settle_seconds / env.step_dt)
    n_recover = round(args.recover_seconds / env.step_dt)
    n_dwell = round(args.prethrow_settle / env.step_dt)

    # Per-throw tally
    results = []  # list of dicts per throw
    frames = []

    up_dev = torch.zeros(1, dtype=torch.bool, device=dev)

    obs, _ = envw.reset()

    with torch.inference_mode():
        # Initial settle with dodge policy
        print(f"  [render] settling {n_settle} steps with dodge policy ...")
        for _ in range(n_settle):
            obs, _, _, _ = envw.step(policy(obs))
            frames.append(env.render())

        # Gimbal slice logic for walk actor (mirrors run_task)
        _actor_dim = int(obs["actor"].shape[-1])
        _robot = env.scene["robot"]
        _has_gimbal_joint = "camera_pitch_joint" in list(_robot.joint_names)
        walk_keep = None
        if _has_gimbal_joint and _actor_dim != PROPRIO_BASE:
            cam_idx = list(_robot.joint_names).index("camera_pitch_joint")
            om = env.observation_manager
            term_names = list(om._group_obs_term_names["actor"])
            term_flat_dims = [int(d[0]) for d in om._group_obs_term_dim["actor"]]
            H = int(env.cfg.observations["actor"].history_length)
            keep_idx = []
            off = 0
            for tname, fdim in zip(term_names, term_flat_dims):
                base = fdim // H
                if tname in ("joint_pos", "joint_vel"):
                    for h in range(H):
                        for ki in range(base):
                            if ki != cam_idx:
                                keep_idx.append(off + h * base + ki)
                else:
                    keep_idx.extend(range(off, off + fdim))
                off += fdim
            walk_keep = torch.tensor(keep_idx, device=dev, dtype=torch.long)
            assert walk_keep.numel() == PROPRIO_BASE
            print(f"  [render] gimbal: slicing walk proprio {_actor_dim} -> {PROPRIO_BASE}")

        def _walk_obs(o):
            # Fresh tensor so the recovery loop can overwrite the command slice safely.
            a = o["actor"]
            a = a.index_select(-1, walk_keep) if walk_keep is not None else a.clone()
            return TD({"actor": a}, batch_size=o.batch_size)

        cmd_off, cmd_w = _actor_cmd_slice(env)  # command slice (offset, width=3*H)

        walk_actor, walk_groups = load_frozen_actor(
            teacher_task="Unitree-G1-AMP-Flat",
            checkpoint=_walk_ckpt,
            obs=_walk_obs(obs),
            num_actions=envw.num_actions,
            device=dev,
            obs_set="actor",
        )
        torch.load = _orig_torch_load
        print(f"  [render] walk actor loaded; walk_groups={walk_groups}")
        print(f"  [render] starting {n_throws} throws (recover={n_recover}steps, dodge={args.window}steps)")

        _dbg_home = os.environ.get("BENCH_DEBUG_HOME") == "1"

        def _dist_home():
            rb = env.scene["robot"].data.root_link_pos_w[:, :2]
            return float((rb - env.scene.env_origins[:, :2]).norm(dim=-1).mean())

        def _yaw_err_home():
            from mjlab.utils.lab_api.math import wrap_to_pi
            rob = env.scene["robot"]
            hq = rob.data.default_root_state[:, 3:7]
            w, x, y, z = hq.unbind(-1)
            hh = torch.atan2(2 * (w * z + x * y), 1 - 2 * (y * y + z * z))
            return float(wrap_to_pi(hh - rob.data.heading_w).abs().mean())

        def _heading_info():
            import math as _m
            from mjlab.utils.lab_api.math import wrap_to_pi
            rob = env.scene["robot"]
            hq = rob.data.default_root_state[:, 3:7]
            w, x, y, z = hq.unbind(-1)
            hh = torch.atan2(2 * (w * z + x * y), 1 - 2 * (y * y + z * z))
            hw = rob.data.heading_w
            err = wrap_to_pi(hh - hw)
            return (_m.degrees(float(hh.mean())), _m.degrees(float(hw.mean())),
                    _m.degrees(float(err.mean())))

        for r in range(n_throws):
            # Recovery phase: walk back to the env origin (station), 0.5 m/s velocity deadband.
            if _dbg_home:
                d0, a0 = _dist_home(), _yaw_err_home()
            if _dbg_home:
                hh0, hw0, se0 = _heading_info()
            used = 0
            for _ in range(n_recover):
                cmd, settled = _home_recover_cmd(env)
                if bool(settled.all()):
                    break
                wo = _walk_obs(obs)
                wo["actor"][:, cmd_off:cmd_off + cmd_w] = cmd.repeat(1, cmd_w // 3)
                obs, _, _, _ = envw.step(walk_actor(wo))
                frames.append(env.render())
                used += 1
            # Pre-throw settle: hold a zero velocity command so residual motion damps out.
            for _ in range(n_dwell):
                wo = _walk_obs(obs)
                wo["actor"][:, cmd_off:cmd_off + cmd_w] = 0.0
                obs, _, _, _ = envw.step(walk_actor(wo))
                frames.append(env.render())
            if _dbg_home:
                hh1, hw1, se1 = _heading_info()
                gated = "settled" if used < n_recover else "MAX (not settled)"
                print(f"  [home] throw {r+1}: dist {d0:.2f}->{_dist_home():.2f} m, "
                      f"head {hw0:+.0f}->{hw1:+.0f} deg (home {hh0:+.0f}), "
                      f"recover {used}/{n_recover} steps [{gated}] + {n_dwell} dwell", flush=True)

            # Inject throw + dodge phase
            up = up_seq[r]
            up_dev.fill_(up)
            inject_throw(env, up_dev, seed=args.seed + r, h_tgt=args.up_z, omni=getattr(args, 'omni', False))

            hit_r = False; fell_r = False
            for _ in range(args.window):
                obs, _, _, _ = envw.step(policy(obs))
                frames.append(env.render())
                # Tally: read terminations
                hb = any(tm.get_term(t).bool()[0].item() for t in HIT_TERMS)
                fb = any(tm.get_term(t).bool()[0].item() for t in FALL_TERMS)
                if hb and not hit_r: hit_r = True
                if fb and not fell_r: fell_r = True
            results.append(dict(round=r, up=up, hit=hit_r, fell=fell_r,
                                success=not hit_r and not fell_r))
            if r % 10 == 0 or r == n_throws - 1:
                suc = sum(x["success"] for x in results)
                print(f"  [render] throw {r+1}/{n_throws}: up={up} hit={hit_r} fell={fell_r} | "
                      f"running success {suc}/{len(results)}")

    # Write MP4
    print(f"  [render] writing {len(frames)} frames to {out_path} ...")
    valid_frames = [f for f in frames if f is not None]
    print(f"  [render] {len(valid_frames)}/{len(frames)} frames are non-None")
    if valid_frames:
        imageio.mimwrite(out_path, valid_frames, fps=30, macro_block_size=1)
        sz = os.path.getsize(out_path)
        print(f"  [render] wrote {out_path} ({sz/1e6:.1f} MB, {len(valid_frames)} frames, "
              f"{len(valid_frames)/30:.1f}s @ 30fps)")
    else:
        print("  [render] ERROR: no valid frames captured!")

    # Per-type tally
    up_res = [x for x in results if x["up"]]
    dn_res = [x for x in results if not x["up"]]
    def _pct(lst, key): return 100.0 * sum(x[key] for x in lst) / max(len(lst), 1)
    print(f"\n===== {key} render tally ({n_throws} throws) =====")
    print(f"  {'':10s} {'UP(duck)':>10s} {'DOWN(low)':>10s} {'ALL':>8s}")
    all_res = results
    for label, lst in [("success", None), ("hit", None), ("fell", None)]:
        lu = _pct(up_res, label); ld = _pct(dn_res, label); la = _pct(all_res, label)
        print(f"  {label:10s} {lu:9.0f}% {ld:9.0f}% {la:7.0f}%")

    env.close() if hasattr(env, "close") else None
    del env, envw, runner, policy
    torch.cuda.empty_cache()
    return dict(key=key, frames=len(valid_frames), out_path=out_path,
                results=results)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--n", type=int, default=100)
    ap.add_argument("--settle", type=int, default=30)
    ap.add_argument("--settle-seconds", type=float, default=0.1,
                    help="settle this many SECONDS (robot stands + stabilizes) before the first "
                         "throw; converted to steps via env.step_dt. Overrides --settle. NOTE: kept "
                         "SHORT (0.1 s) on purpose -- letting the dodge policy stand idle longer drifts "
                         "the robot off its clean ready stand into a worse dodging posture "
                         "(reset: 0.1s=94 -> 1s=87 -> 3s=79 for vision_baseline), which is a settle "
                         "artifact, not real perception difficulty. Short settle = the deployment-"
                         "realistic 'ready robot' condition and agrees with the walk-recover regime.")
    # 120 steps = ~1.8 s after ball arrival (~step 30): a zero-action stand takes ~1.3 s to topple,
    # so this window is long enough to catch a dodge-destabilized fall (70 was not).
    ap.add_argument("--window", type=int, default=120)
    ap.add_argument("--up-z", type=lambda s: tuple(float(x) for x in s.split(",")), default=H_TGT,
                    help="UP-throw arrival height range, e.g. '0.9,1.3' (default; matches training "
                         "-- the pre-2026-06-09 (1.0,1.5) range sailed 1.4+ balls over the head; "
                         "see H_TGT comment)")
    ap.add_argument("--frame-offsets", default="0,3,8,18")
    ap.add_argument("--omni", action="store_true",
                    default=os.environ.get("OMNI_THROW", "0") == "1",
                    help="omnidirectional fast-throw eval (360deg, 8-10m, 12-15 m/s); matches released MimicKit config + OMNI_THROW=1 training")
    ap.add_argument("--seed", type=int, default=12345)
    ap.add_argument("--only", default=None, help="comma list of keys to run (default all)")
    ap.add_argument("--depth-aug", type=lambda s: s.lower() != "false", default=True,
                    help="apply the training sim2real depth aug to depth tasks (default True; "
                         "clean depth is OOD for the depth policies). --depth-aug False for clean.")
    ap.add_argument("--continuous", action="store_true",
                    help="continuous mode: back-to-back throws (alternating UP/DOWN per round) with "
                         "NO stand-reset between -- the robot flows (only termination auto-resets). "
                         "Harder, realistic regime vs the default one-throw-from-stand.")
    ap.add_argument("--rounds", type=int, default=12, help="continuous/walk-recover: throws per env")
    ap.add_argument("--throw-every", type=int, default=45, help="continuous mode: steps between throws")
    ap.add_argument("--walk-recover", action="store_true",
                    help="deploy-faithful mode: walk (loco) policy recovers between throws, then "
                         "dodge policy handles each throw.  Mirrors real deployment (walk<->dodge "
                         "switch). Mutually exclusive with --continuous.")
    ap.add_argument("--recover-seconds", type=float, default=5.0,
                    help="walk-recover: MAX seconds of walk-policy recovery before each throw "
                         "(default 5.0, ~250 steps at 50 Hz). Recovery early-exits as soon as the "
                         "robot is within tolerance of home in both position and heading, so this "
                         "is a ceiling, not a fixed dwell.")
    ap.add_argument("--prethrow-settle", type=float, default=1.0,
                    help="walk-recover: seconds to hold a ZERO velocity command (walk policy) "
                         "AFTER the recovery gate settles, so residual motion damps out and the "
                         "robot is fully standing still before the next throw (default 1.0).")
    ap.add_argument("--walk-ckpt", default=None,
                    help="walk-recover: path to the Unitree-G1-AMP-Flat checkpoint to use as the "
                         "walk actor (default: newest checkpoint of the 'walk' experiment, "
                         "trained via ./train_walk.sh).")
    ap.add_argument("--ckpt", default=None,
                    help="explicit dodge checkpoint path to load (overrides newest_ckpt(exp)). "
                         "Only valid with a single --only key.")
    ap.add_argument("--render-video", default=None,
                    help="[render path] write a walk-recover dodge video to this mp4 path "
                         "(requires --only with exactly one key). Builds num_envs=1, "
                         "render_mode='rgb_array', third-person robot-tracking camera.")
    ap.add_argument("--render-throws", type=int, default=100,
                    help="[render path] number of throws to render (default 100).")
    ap.add_argument("--render-randomized", action="store_true",
                    help="[render path] shuffle UP/DOWN sequence with seeded RNG "
                         "(50 UP + 50 DOWN, shuffled) instead of alternating UP/DOWN.")
    args = ap.parse_args()
    if args.walk_recover and args.continuous:
        raise SystemExit("--walk-recover and --continuous are mutually exclusive.")
    import mjlab.tasks  # noqa
    from mjlab.utils.torch import configure_torch_backends
    configure_torch_backends()
    dev = "cuda:0" if torch.cuda.is_available() else "cpu"

    # ---- render-video path: single policy, num_envs=1, captures frames ----
    if args.render_video:
        if not args.only or len(args.only.split(",")) != 1:
            raise SystemExit("--render-video requires exactly one --only key.")
        k = args.only.strip()
        if k not in TASKS:
            raise SystemExit(f"--render-video key '{k}' not in TASKS: {list(TASKS)}")
        task, exp = TASKS[k]
        ckpt = args.ckpt or newest_ckpt(exp)
        if not ckpt:
            raise SystemExit(f"[render] no checkpoint found under {exp}")
        print(f"[render] policy={k}  task={task}  ckpt={ckpt}")
        print(f"[render] out={args.render_video}  throws={args.render_throws}  "
              f"randomized={args.render_randomized}")
        render_task(k, task, exp, ckpt, args, dev)
        return

    # Default key set: omni-trained policies are only a fair eval against omni throws, and
    # front-throw policies only against front throws -- so the default list follows --omni.
    if args.only:
        keys = args.only.split(",")
    elif args.omni:
        keys = [k for k in TASKS if k.endswith("_omni")]
    else:
        keys = ["statue"] + [k for k in TASKS if not k.endswith("_omni")]
    rows = []
    for k in keys:
        if k == "statue":   # frozen control: free-miss floor (no checkpoint)
            rows.append(run_statue(args, dev))
            continue
        task, exp = TASKS[k]
        ckpt = args.ckpt if (args.ckpt and len(keys) == 1) else newest_ckpt(exp)
        if not ckpt:
            print(f"[bench] {k}: no checkpoint under {exp}, skipping"); continue
        rows.append(run_task(k, task, exp, ckpt, args, dev, walk_recover=args.walk_recover))
    print("\n================= SUMMARY (success = not hit & not fell) =================")
    print(f"{'policy':14s} {'success':>8s} {'UP':>6s} {'DOWN':>6s} {'hit':>6s} {'fell':>6s}   hit-links (of hits)")
    for r in rows:
        regs = r.get("hit_regions", {})
        rtot = sum(regs.values()) or 1
        rs = " ".join(f"{k}={100*v/rtot:.0f}%" for k, v in sorted(regs.items(), key=lambda x: -x[1]))
        print(f"{r['key']:14s} {r['success']*100:7.0f}% {r['success_up']*100:5.0f}% "
              f"{r['success_down']*100:5.0f}% {r['hit']*100:5.0f}% {r['fell']*100:5.0f}%   {rs}")


if __name__ == "__main__":
    main()
