"""Unitree G1 AMP **Dodge** environment configurations.

First step toward the reactive dodgeball task: take the working leap-to-goal controller
and add a thrown ball. A ball entity (fixed radius 0.1 m for now; see
``assets/objects/ball``) is added to the scene, and a ball is launched at the robot
*only once it has dwelled in standing* -- i.e. it has stood still (zero velocity command
+ settled base) continuously for a short dwell. The ball spawns in the robot's frontal
cone (within +/-25 deg of its heading, 0.3-2.0 m ahead, 0.6-1.0 m high) and is given a
gravity-corrected velocity so that it arrives at the robot's torso/pelvis after a short
reaction window (a parabola).

**Built on the leap-to-goal env, not the plain leap env**, so it inherits *every* fix
that produced clean leaps: the ``collapsed_crouch`` termination + raised base-height
floor (from ``leap_env_cfgs``), the AMP weight bump (from ``rl_cfg`` via the goto runner),
the 24 flight-only clips, AND the ``leap_flight`` both-feet-airborne reward + goal
curriculum (which live in ``goto_env_cfgs`` only). Most envs are flipped to standing so
they dwell and get thrown at; the rest keep leaping to goals, which keeps the leap skill
sharp.

There is no dodge reward or ball observation yet -- this commit only puts the ball in the
world and throws it on a standing dwell. Those come next.
"""

import os
from dataclasses import dataclass, fields

from mjlab.envs import ManagerBasedRlEnvCfg
from mjlab.envs.mdp import dr
from mjlab.managers.event_manager import EventTermCfg
from mjlab.managers.scene_entity_config import SceneEntityCfg
from mjlab.managers.observation_manager import (
  ObservationGroupCfg,
  ObservationTermCfg,
)
from mjlab.managers.reward_manager import RewardTermCfg
from mjlab.managers.termination_manager import TerminationTermCfg
from mjlab.sensor import CameraSensorCfg, ContactMatch, ContactSensorCfg

import src.tasks.amp_loco.mdp as mdp
from src.assets.objects import get_ball_cfg
from src.assets.robots import G1_ACTION_SCALE
import src.assets.robots.unitree_g1.g1_constants as gc
from src.tasks.amp_loco.mdp.goal_command import (
  DodgeGoToGoalCommandCfg,
  GoToGoalCommandCfg,
)

from .goto_env_cfgs import (
  g1_amp_leap_goto_flat_env_cfg,
  g1_amp_leap_goto_rough_env_cfg,
)

# Fraction of envs commanded to permanently stand -- kept at the goto training level
# (0.1). The throw mechanic does NOT need a high stand ratio: the goto command also
# zeroes the velocity whenever a (non-standing) env *arrives at its goal and dwells*
# (dwell_time_range, 1-3 s) before resampling a new goal, and that arrival-dwell already
# satisfies the throw condition (cmd ~0 + settled base). So robots leap to goals, stand
# to dwell, get a ball thrown at them, then must react -- the dodge loop fires on goal
# arrivals without freezing most robots in place (which a high ratio did, especially in
# play mode where the episode is effectively infinite so standers never re-roll).
_STAND_RATIO = 0.2
# In-place-throw fraction: envs commanded to ZERO velocity but STILL pelted with balls, so the
# policy learns to dodge from a standstill (most dodge envs are in locomotion mode otherwise).
# Distinct from _STAND_RATIO (those are ball-free); the two are mutually exclusive and sum to <= 1.
# Override per-run via --env.commands.twist.rel-inplace-throw-envs (see train_dodge_single_stand01.sh).
_INPLACE_THROW_RATIO = 0.1

# Head depth-camera clip range (metres). The mujoco_warp depth sensor returns true
# distance, so this is applied as a data clip when the depth feeds the policy observation
# (clip to [DEPTH_NEAR, DEPTH_FAR]): near 0.1 m, far 5 m -- resolves the ball's 1-3 m
# approach instead of the ~800 m horizon.
DEPTH_NEAR = 0.1
DEPTH_FAR = 5.0
# Curriculum: enable the ball-hit termination only after this many global env steps, so the
# policy first learns to locomote/leap (the dense dodge_cbf reward shapes dodging from the
# start; the hard -200 terminal hit penalty would only destabilize learning before the
# robot can plausibly avoid the ball). env.common_step_counter is ~24 steps/iter (=
# num_steps_per_env), so 200k steps ~= 8.3k iters -- inside the user's "leap learned by
# 5-10k" window. Training only; play enables it immediately (enable_after_steps=0).
HIT_TERM_ENABLE_STEPS = 200_000.0
# Head depth-camera resolution (pixels). 16x9 (aspect 1.78) matches the ZED Mini WVGA FOV:
# at the XML fovy=54, aspect 16/9 yields ~85 H deg (hFOV = 2*atan(tan(27)*16/9) ~= 84.5),
# i.e. the real cam's 85 H x 54 V. (The old 20x9 simulated a ~100-deg-H camera we don't have;
# 16x12 would be only ~72 H -- too narrow.) For the Dodge-Depth task the depth image is
# FLATTENED (9*16 = 144) and fed straight into the policy MLP alongside the proprio
# (no CNN): the camera is head-fixed so a pixel's location directly encodes the ball's
# bearing, and a fully-connected layer is position-sensitive (a CNN's translation
# invariance is the opposite of what a "which way is the ball" cue wants). 144 keeps
# depth from dominating the 384-D proprio.
DEPTH_WIDTH = 16
DEPTH_HEIGHT = 9
# Single-camera tilt (deg up from horizontal), overridable per run like DEPTH_DR_SCALE:
#   CAMERA_TILT_DEG=25 ./train_dodge_single_stand01.sh     (and the SAME value at play!)
# Applied at robot-spec build time to head_camera_single (+_ref) -- the XML's baked +20
# is the default. fovy 54 -> vertical coverage tilt+/-27 deg. HISTORY: +25 was tried
# (coverage -2..+52) and collapsed the DOWN ball to 0% on the controlled benchmark --
# the -7..-2 deg band it gave up carries the descending ball's last usable frames
# (84ade66). Don't raise without re-checking the benchmark's DOWN column. Keep the
# PHYSICAL ZED mount matched to whatever a checkpoint trained with.
CAMERA_TILT_DEG = float(os.environ.get("CAMERA_TILT_DEG", "20.0"))
# Camera update period in CONTROL steps (DepthImageObs samples a new depth frame every
# N steps and HOLDS it in between; proprio/control stay 50 Hz). 1 = every step (50 fps
# camera); 5 = a 10 fps camera (NEURAL-mode ZED / slower Jetson pipeline). Train and
# play/deploy must match: replay with the same DEPTH_UPDATE_PERIOD, and on hardware
# publish depth at the matching rate (CAMERA_HZ=10 for update_period=5). With 5-step
# holds, frame offsets (0,5,10,20) sample 4 DISTINCT camera frames (the default
# (0,3,8,18) would alias: 0 and 3 usually read the same held frame).
DEPTH_UPDATE_PERIOD = int(os.environ.get("DEPTH_UPDATE_PERIOD", "1"))
# Ball-only DR dials (the masked-depth profile ignores DEPTH_DR_SCALE -- its knobs are a
# separate, EfficientTAM-tuned set). Two INDEPENDENT dials:
#   BALLONLY_DR_SCALE      -- the NOISE-type knobs (ball dropout/jitter/noise + edge flicker)
#   BALLONLY_CLUTTER_SCALE -- the STATIC-cluster WOBBLE VIOLENCE: scales the per-step lateral
#                             random-walk rate + bound and the depth random-walk rate + bound.
#                             Presence/count/size stay full (the "persistent non-looming blob
#                             is not a threat" lesson keeps its coverage; the blobs just move
#                             more gently).
BALLONLY_DR_SCALE = float(os.environ.get("BALLONLY_DR_SCALE", "1.0"))
BALLONLY_CLUTTER_SCALE = float(os.environ.get("BALLONLY_CLUTTER_SCALE", "1.0"))
# Per-step random-walk RATES (m/step), individually overridable; default = the scaled base.
BALLONLY_CLUTTER_JITTER = float(
  os.environ.get("BALLONLY_CLUTTER_JITTER", str(0.1 * BALLONLY_CLUTTER_SCALE))
)
BALLONLY_CLUTTER_DEPTH_JITTER = float(
  os.environ.get("BALLONLY_CLUTTER_DEPTH_JITTER", str(0.03 * BALLONLY_CLUTTER_SCALE))
)
# Joint-level CBF action filter (CBF-RL Phase 1; see docs/cbf_joint_filter_spec.md). OFF by
# default so the baseline recipe is byte-identical; CBF_JOINT=1 swaps the joint-position action
# for the filtered one and adds the two CBF-RL reward terms. The lambdas weight the
# filter-correction penalty and the clearance-buffer penalty.
CBF_JOINT = os.environ.get("CBF_JOINT", "0") == "1"
# Reward weights: filter-correction penalty + clearance-buffer penalty, and the reward's
# linear standoff target h_buf (metres) at which the buffer penalty kicks in.
CBF_JOINT_LAMBDA_CORR = float(os.environ.get("CBF_JOINT_LAMBDA_CORR", "0.1"))
CBF_JOINT_LAMBDA_BUF = float(os.environ.get("CBF_JOINT_LAMBDA_BUF", "1.0"))
CBF_JOINT_BUFFER = float(os.environ.get("CBF_JOINT_BUFFER", "0.1"))
# Filter (barrier) shape: D = ball_radius + BODY_BUFFER is the per-link keep-out (bigger ->
# the barrier demands a larger standoff -> wider v* correction -> stronger teaching signal);
# ALPHA is the class-K gain; DELTA_MAX/T_ALERT are the TTC urgency margin's cap and the
# time-to-impact (s) at/below which it saturates (longer T_ALERT -> commit earlier).
CBF_JOINT_BODY_BUFFER = float(os.environ.get("CBF_JOINT_BODY_BUFFER", "0.25"))
CBF_JOINT_ALPHA = float(os.environ.get("CBF_JOINT_ALPHA", "1.5"))
CBF_JOINT_DELTA_MAX = float(os.environ.get("CBF_JOINT_DELTA_MAX", "2.0"))
CBF_JOINT_T_ALERT = float(os.environ.get("CBF_JOINT_T_ALERT", "0.4"))

# Stage-1 actuated camera-pitch gimbal: re-parents head_camera_single onto a pitch hinge
# (camera_pitch_joint, +/-30deg) actuated by the smallest G1 motor (4010). Added ONLY inside a
# gated spec_fn wrapper so CAMERA_GIMBAL=0 reproduces the baseline model bit-for-bit. Read at CALL
# time in the BallOnly builder so a benchmark can toggle per build (do not freeze at import).

# Episode-reset (RSI) motion dir for the dodge tasks: the full ``amp_dodge`` set (Leap/ +
# Dodge/), so robots reset into the same standing/leap/evasion poses the AMP discriminator
# imitates -- not just the leap clips (the inherited leap/goto reset dir). The reset loader is
# recursive (``ampmotion_loader._load_dir`` uses os.walk), so the parent dir loads all 31 clips.
# NOTE: this is reference-state init across the WHOLE distribution, which includes one-leg and
# (briefly) airborne frames -- a robustness aid, but it does start ~46% of episodes on one foot;
# restrict to a grounded subset here if early two-foot standing suffers.
_DODGE_RESET_DIR = os.path.normpath(
  os.path.join(
    os.path.dirname(os.path.abspath(__file__)),
    "..", "..", "..", "..", "assets", "motions", "g1", "amp_dodge",
  )
)


def _head_depth_camera_cfg(
  name: str = "head_depth",
  camera: str = "head_camera",
  width: int = DEPTH_WIDTH,
  height: int = DEPTH_HEIGHT,
  data_types: tuple[str, ...] = ("depth",),
) -> CameraSensorCfg:
  """Forward head depth camera (wraps a `head_camera*` in the G1 XML).

  Shared by the play-only viser preview (Dodge task) and the policy depth obs
  (Dodge-Depth task). Renders depth at the policy resolution; mujoco_warp returns
  TRUE geometric distance (model near/far clip ignored), so the [near, far] range
  is applied as a data clip in the `DepthImageObs` obs term / the viser monkeypatch.
  ``camera`` selects which XML camera to wrap (head_camera / head_camera_single).
  ``width``/``height`` set the render resolution (default 20x9 flat; the CNN task uses 64x48).
  """
  return CameraSensorCfg(
    name=name,
    camera_name=f"robot/{camera}",
    width=width,
    height=height,
    data_types=data_types,
  )


def _apply_dodge_overrides(cfg: ManagerBasedRlEnvCfg, play: bool) -> ManagerBasedRlEnvCfg:
  # --- Add the ball entity to the scene. ---
  cfg.scene.entities = {**cfg.scene.entities, "ball": get_ball_cfg()}

  # --- Episode reset (RSI) from the full amp_dodge set instead of the inherited leap-only dir,
  # so episodes start in the standing/leap/evasion poses the discriminator imitates (see
  # _DODGE_RESET_DIR). Both the loader-install event and the per-reset sampler must match.
  cfg.events["init_motion_loader"].params["motion_dir"] = _DODGE_RESET_DIR
  cfg.events["reset_from_motion"].params["motion_dir"] = _DODGE_RESET_DIR

  # --- Ball<->robot contact sensor: ground-truth "the ball hit the robot" (any link).
  # Also the basis for a future dodge/avoid-hit reward. found > 0 => the ball is touching
  # some robot body this step.
  ball_hit_cfg = ContactSensorCfg(
    name="ball_robot_contact",
    primary=ContactMatch(mode="body", pattern="ball", entity="ball"),
    secondary=ContactMatch(mode="subtree", pattern="pelvis", entity="robot"),
    fields=("found",),
    reduce="netforce",
    num_slots=1,
  )
  cfg.scene.sensors = (cfg.scene.sensors or ()) + (ball_hit_cfg,)

  # --- Terminate the episode when the ball hits the robot (got hit). ---
  # Uses the ball_robot_contact sensor above (whole-robot, since subtree(pelvis) covers
  # every link). A hit ends the episode -> the is_terminated penalty (-200) makes getting
  # hit decisively costly, on top of the dense dodge_cbf shaping. (Time-out terminations
  # are flagged time_out=True so they are not penalized; this one is a genuine failure.)
  cfg.terminations["ball_hit"] = TerminationTermCfg(
    func=mdp.ball_contact,
    params={
      "sensor_name": "ball_robot_contact",
      # Velocity-discontinuity fallback: a fast ball can tunnel through a link in one step
      # and slip past the contact sensor. In MuJoCo only a collision changes the ball's
      # velocity (no drag), so a ball whose velocity deviates from gravity-only free-fall
      # while within hit_dist of the torso (and above the floor, to exclude ground bounces)
      # was hit. ORed with the contact sensor (from MimicKit's dodgeball fail check).
      "delta_v_threshold": 1.5,
      "hit_dist": 1.0,
      "hit_z_min": 0.3,
    },
  )

  # --- Swap the goal command for the CBF-filtered one (ball avoidance). ---
  # Copy every field of the inherited GoToGoalCommandCfg so the navigation layer is
  # byte-for-byte the goto config, then wrap it with the CBF filter params. The policy
  # observes the *filtered* velocity, so the (pre-trained, velocity-tracking) leap policy
  # dodges the ball without retraining.
  twist = cfg.commands["twist"]
  assert isinstance(twist, GoToGoalCommandCfg)
  # In play (the demo): pin the goal to each robot's fixed start (home) position and have
  # it RETURN there after every dodge -- a goal-tracker, not a dead stander. This keeps
  # the policy in locomotion mode (it dodges reliably) instead of the settled-stand
  # attractor where it intermittently freezes and gets hit (measured). No forced-standing
  # envs in play. Training keeps random goals + the 0.1 standing mix.
  twist.rel_standing_envs = 0.0 if play else _STAND_RATIO
  # In-place-throw fraction: zero velocity command BUT balls still thrown (dodge from a standstill).
  # 0 in play (no forced standing/in-place there). Mutually exclusive with the stand ratio.
  twist.rel_inplace_throw_envs = 0.0 if play else _INPLACE_THROW_RATIO
  goto_params = {f.name: getattr(twist, f.name) for f in fields(GoToGoalCommandCfg)}
  cfg.commands["twist"] = DodgeGoToGoalCommandCfg(
    **goto_params,
    ball_name="ball",
    # Play: goal pinned 0.5 m BEHIND the robot every step -> constant backpedal, so it
    # stays in locomotion mode (dodges far better than standing) and is already retreating
    # from the front-thrown ball. Training uses random goals (back_offset=0).
    back_offset=0.5 if play else 0.0,
    cbf_enabled=True,
    # The filter predicts the ball's straight xy trajectory and sidesteps the robot
    # perpendicular to it, keeping it clear of the whole path line (see
    # mdp/cbf.predictive_dodge_filter). alpha is the class-K gain in h_dot >= -alpha*h
    # (h = sidestep distance - safe_radius); 1.5 commands a near-full-speed sidestep
    # while the robot is on the line and relaxes once it is safe_radius clear.
    cbf_alpha=1.5,
    # safe_radius = lateral clearance to keep from the ball's path. 0.9 m aims well
    # clear of the ball (radius 0.1) + body; with the policy's weak (~54%) tracking,
    # aiming high means the robot still ends up with comfortable actual margin.
    safe_radius=0.9,
    # Sense out to 4 m (along the ball's path) so a ball launched from far (see throw
    # dist_range) is filtered from the moment it leaves the thrower.
    sense_radius=4.0,
    z_active=0.25,
  )

  # --- Dodgeball events: park the ball on reset, throw it on standing dwell. ---
  # reset_dodge_state (reset mode): clear the dwell counter and park the ball aside.
  cfg.events["reset_dodge_state"] = EventTermCfg(
    func=mdp.reset_dodge_state,
    mode="reset",
    params={"ball_name": "ball", "park_offset": (0.0, 3.0, 0.1)},
  )
  # Randomize the ball RADIUS per env each episode: 7.5 cm - 12.5 cm (15-25 cm diameter).
  # Floor raised from 3 cm: at the 16x9 (ZED) resolution a 6-cm-diameter ball is sub-pixel
  # until ~0.65 m (effectively invisible most of its flight), so the small end was an
  # unlearnable perception task. 15-25 cm balls resolve from ~1.6-2.1 m -- visible in the
  # dodge-critical window.
  # dr.geom_size writes geom_size[..,0] absolutely and recomputes geom_rbound/geom_aabb so
  # the collision broadphase stays consistent (verified per-env independent). Registering
  # the event makes mjlab de-broadcast geom_size to true per-env storage at build time.
  # Mass stays fixed (136 g): the throw writes velocity directly (mass-independent) and the
  # contact/hit detection is geometric, so only the radius matters for the dodge dynamics.
  # The CBF reads the per-env radius and widens its clearance accordingly (see
  # DodgeGoToGoalCommand), and the critic gets the true radius (DepthImageObs lets the actor
  # judge size from the ball's apparent size in depth).
  cfg.events["randomize_ball_size"] = EventTermCfg(
    func=dr.geom_size,
    mode="reset",
    params={
      "asset_cfg": SceneEntityCfg("ball", geom_names=("ball_collision",)),
      "operation": "abs",
      "ranges": (0.075, 0.125),
      "axes": [0],
    },
  )
  # throw_ball_on_dwell (step mode): launch a ball at an env once its robot is ready.
  # Runs every step (after sim.forward(), so world pose/velocity are fresh).
  # In play, rethrow the ball the instant the previous one hits the ground -- a continuous
  # stream, one ball at a time. (The robot backpedals continuously via the command, so it's
  # always in locomotion mode regardless.) Training keeps the standing-dwell trigger.
  # Both train and play: rethrow the instant the ball lands -- a continuous stream, one ball
  # at a time, so a threat is present on nearly every step (dodge_cbf reward fires densely).
  # NO grounded gate: gating the throw on "both feet on the ground" was REWARD-HACKED -- the
  # policy learned to never plant both feet (perma-hop) so a ball never fired and it dodged
  # nothing. Throwing unconditionally on ground-contact removes that exploit (the robot can't
  # suppress throws), at the cost of occasionally throwing while it is mid-leap, which is fine.
  play_kw = dict(rethrow_ground_height=0.15)
  cfg.events["throw_ball_on_dwell"] = EventTermCfg(
    func=mdp.throw_ball_on_dwell,
    mode="step",
    params={
      "ball_name": "ball",
      "robot_name": "robot",
      "command_name": "twist",
      "dwell_time_s": 0.5,
      "command_threshold": 0.1,
      "speed_threshold": 0.3,
      **play_kw,
      # Pure horizontal toss under STRICT gravity (vz0=0), targeting a REACTION TIME with
      # NO pelvis target -- the ball just has to reach the robot, hitting wherever it has
      # fallen to (lower legs for a long flight). From ~2 m, 2-3 m ahead; the horizontal
      # speed makes it reach the robot's xy after flight_time_range (the reaction window).
      # Dropping the pelvis target lets it fall lower -> ~0.6 s airtime (vs ~0.48 s to the
      # pelvis), the max for a flat ~2 m toss. Never rises (camera-visible, no lob).
      "dist_range": (2.0, 3.0),
      "height_range": (1.5, 2.3),
      "angle_deg": 25.0,
      "flight_time_range": (0.58, 0.63),
      # Lead the robot's velocity (aim where it is GOING, not where it was -- else a robot
      # moving in a straight line escapes a throw aimed at its old position for free) and
      # jitter the aim slightly so the intercept is not perfectly dead-on every throw. From
      # MimicKit's dodgeball. The launch point stays in the frontal cone (camera-visible).
      "lead_target": True,
      "aim_noise_scale": 0.1,
      # Mix in LOW-ARC throws (half): launched low (~waist) with upward velocity so they peak
      # at torso/head height as they reach the robot -- a ball to DUCK under, complementing the
      # descending balls you sidestep. Pairs with the ducking clips now in the amp_dodge prior.
      "high_throw_fraction": 0.5,
      "high_launch_height_range": (0.4, 0.9),
      # Arrival height (0.9, 1.3): every UP throw is a REAL threat. The old (1.0, 1.5) wasted ~26%
      # of UP throws -- a frozen-statue sweep (2026-06-09) showed z_tgt > ~1.4 m sails clean over
      # the head (head top ~1.3 m + ball radius ~0.1 m), and with the 0.1 m lateral aim noise the
      # 1.3-1.5 band is mostly a free miss. 1.3 keeps head-height duck balls; matches the
      # benchmark's eval default (scripts/dodge_benchmark.py --up-z).
      "high_target_z_range": (0.9, 1.3),
      # Never throw at the permanently-standing fraction (rel_standing_envs = _STAND_RATIO):
      # those envs are a ball-free "clean stand" anchor that keeps a no-threat standing skill
      # in the batch. No-op in play (rel_standing_envs = 0 -> nothing is standing).
      "skip_standing_envs": True,
    },
  )

  # Play-only: tighten the overhead (UP) arrival band to (0.9, 1.1) so the "Throw overhead"
  # button lands squarely at head height -- the upper 1.1-1.3 slice (just-grazes-the-head)
  # is dropped for a cleaner duck demo. Training keeps the full (0.9, 1.3) threat band.
  if play:
    cfg.events["throw_ball_on_dwell"].params["high_target_z_range"] = (0.9, 1.1)

  return cfg


def g1_amp_dodge_flat_env_cfg(play: bool = False) -> ManagerBasedRlEnvCfg:
  """G1 AMP dodge task on flat terrain (ball thrown on standing dwell)."""
  cfg = g1_amp_leap_goto_flat_env_cfg(play=play)
  return _apply_dodge_overrides(cfg, play)




# Full-strength (scale=1.0) single-camera depth sim2real augmentation. Used by
# `_add_depth_obs_single` (training) and `enable_depth_aug_preview` (the play preview that lets you
# eyeball the augmentation live). See `DepthImageObs._augment` / `_ground_far_out` for the semantics.
_DEPTH_AUG_FULL: dict = {
  # Base D435/ZED gaussian + dropout.
  "noise_sigma_base": 0.01,
  "noise_sigma_per_m": 0.01,
  "dropout_rate": 0.01,
  # Per-frame flickering speckle, far-field haze, invalid->far holes. The real ZED speckles in
  # low-texture FREE SPACE (open air), not on the close ground, and with moderate values -- so we bias
  # speckle toward FAR/empty pixels (speckle_far_bias) instead of depth edges (edge_bias=0; the edge
  # bias actually starved the uniform far field of speckle and piled it on the ground), and make the
  # spurious depth a RELATIVE perturbation depth*U(keep_min,1) (speckle_keep_min) so a free-space
  # fleck reads a moderate fraction of its true range rather than a phantom slammed to `near`.
  "speckle_rate_max": 0.15,
  "speckle_edge_bias": 0.0,
  "speckle_border_bias": 0.2,
  "speckle_far_bias": 1.0,
  "speckle_keep_min": 0.6,
  "haze_sigma_max": 0.05,
  "hole_rate_max": 0.05,
  # Coherent clutter: SMALL persistent+drifting blobs pinned to the frame EDGES/corners (matching the
  # real ZED feed -- far field clean, junk only at the periphery). Persist across the frame stack so
  # the policy must use the ball's looming, not proximity. Half the envs stay fully clean.
  "clutter_blobs": 3,
  "clutter_prob": 0.5,
  "clutter_edge_bias": 1.5,
  "clutter_size_min": 0.04,
  "clutter_size_max": 0.14,
  "clutter_depth_min": 0.1,
  "clutter_depth_max": 0.95,
  "clutter_drift": 0.02,
  # Ground blindness: far-out floor pixels (read from the segmentation map: plane-type geoms) so the
  # policy never leans on a ground cue a real ZED can't deliver at a grazing angle.
  "ground_far_prob": 0.9,
  # BACKGROUND FILL (the room sim2real fix; hardware forensics 2026-06-09): with prob 0.8 an env's
  # far/no-hit pixels read a per-env random vertical-gradient "room shell" (b_top, b_bottom ~
  # U(2, 5) m, lerped over rows, held all episode) instead of far -- a real room's ceiling/walls
  # sit inside the 5 m clip and an empty-arena-trained policy reads them as a wall-sized incoming
  # ball. Static + non-looming, so only the ball's depth-collapse remains a dodge cue. The other
  # 20% of envs keep the empty-arena background as an anchor. NOT scaled by DEPTH_DR_SCALE
  # (scene content, not noise intensity). See DepthImageObs._bg_fill.
  # THIRD attempt (2026-06-10): (2,5) coverage restored -- the deployment room's
  # content sits at 1.6-3.5 m (mid rows median 2.38 m), so a (4,5) fill trains
  # nothing the room actually shows. What changed vs the failed (2,5)@0.8 run:
  # the fill now composites OCCLUDING (min(b, x), see DepthImageObs._bg_fill) --
  # the ball pops into view exactly when nearer than its background, deployment
  # optics -- and the camera is back at +20 deg, restoring the close/low late
  # window where the ball always out-contrasts a >=2 m background. Benchmark
  # attribution of the failure: bench A/B 39/40% with DOWN 0% both ways = the
  # DOWN skill was never learned (early window contrast-erased by the fill, late
  # window cut by the +25 deg tilt). prob 0.5 keeps a strong clean-arena anchor.
  "bg_fill_prob": 0.0,
  "bg_depth_range": (2.0, 5.0),
}

# Per-run dial to REDUCE the depth domain randomization without editing this file: the effective
# augmentation is `_DEPTH_AUG_FULL` with its magnitude/rate/probability knobs multiplied by
# DEPTH_DR_SCALE (env var; default 1.0 = unchanged). Distribution-SHAPE knobs (edge/border biases,
# blob size/depth ranges, drift) are left as-is -- scaling only changes "how much", not "what shape".
# DEPTH_DR_SCALE=0 -> clean depth (no aug, same as play); 0.25 -> quarter strength; 0.5 -> half.
# Read at import (registration) time, so it applies to BOTH training and the aug preview.
# NOTE: ground_far_prob is deliberately NOT scaled -- ground blindness is a hard sim2real fact (a real
# ZED gets no floor return at a grazing angle), not tunable "noise", so it stays fixed at its full
# 0.9 regardless of DEPTH_DR_SCALE.
_DEPTH_AUG_SCALABLE_KEYS = (
  "noise_sigma_base", "noise_sigma_per_m", "dropout_rate",
  "speckle_rate_max", "haze_sigma_max", "hole_rate_max",
  "clutter_prob", "clutter_blobs",
)


def _scaled_depth_aug(scale: float) -> dict:
  out = dict(_DEPTH_AUG_FULL)
  for k in _DEPTH_AUG_SCALABLE_KEYS:
    scaled = out[k] * scale
    # clutter_blobs is an integer COUNT of blobs, not a continuous magnitude.
    out[k] = max(0, round(scaled)) if k == "clutter_blobs" else scaled
  return out


DEPTH_DR_SCALE = float(os.environ.get("DEPTH_DR_SCALE", "1.0"))
# Single source of truth for the single-camera (HEAD, +20 deg up) depth augmentation actually
# applied (post-scale). Includes the ground-far-out fill (correct for the up-tilted head: distant
# grazing ground reads as no-return on a real ZED).
_DEPTH_SINGLE_AUG_KWARGS: dict = _scaled_depth_aug(DEPTH_DR_SCALE)


def enable_depth_aug_preview(cfg: ManagerBasedRlEnvCfg) -> None:
  """Turn the single-depth sim2real augmentation ON in a PLAY env (the cfg builds play with clean
  depth; play.py re-enables it here) so the policy obs -- and the viser preview -- match what the
  policy trained on. Also enables segmentation rendering on the obs sensor (needed for the ground
  far-out). Honors DEPTH_DR_SCALE. Called by play.py for --depth-aug (default on, sim only) and
  --depth-aug-preview on the ``Unitree-G1-AMP-Dodge-Depth-Single-Flat`` task; the ZED path skips it
  (real depth already carries real noise)."""
  # The ball-only task carries its OWN masked DR (BallOnlyDepthObs + ball_dr, on via BALLONLY_AUG);
  # the regular full-frame aug (speckle/clutter/bg_fill) is wrong for it -- layering it on would make
  # the play obs OOD vs training (cluttered/speckled background the ball-only policy never saw). Skip.
  if cfg.observations["depth"].terms["head_depth"].func is mdp.BallOnlyDepthObs:
    return
  sensors = []
  for s in cfg.scene.sensors or ():
    if s.name == "head_depth_single" and "segmentation" not in s.data_types:
      s.data_types = tuple(s.data_types) + ("segmentation",)
    sensors.append(s)
  cfg.scene.sensors = tuple(sensors)
  term = cfg.observations["depth"].terms["head_depth"]
  term.params = {**term.params, **_DEPTH_SINGLE_AUG_KWARGS}


def _set_single_camera_tilt(cfg: ManagerBasedRlEnvCfg, tilt_deg: float) -> None:
  """Point ``head_camera_single`` (+ its ``_ref`` play-preview duplicate) ``tilt_deg``
  up from horizontal, by wrapping the robot entity's ``spec_fn`` and rewriting the
  cameras' xyaxes orientation before compile (the XML bakes the +20 default; this
  makes the tilt a per-run knob -- see CAMERA_TILT_DEG). No-op at the default."""
  import math

  if abs(tilt_deg - 20.0) < 1e-9:
    return  # XML default already
  robot_cfg = cfg.scene.entities["robot"]
  orig_spec_fn = robot_cfg.spec_fn
  s, c = math.sin(math.radians(tilt_deg)), math.cos(math.radians(tilt_deg))

  def spec_fn():
    spec = orig_spec_fn()
    for cam in spec.cameras:
      if cam.name == "head_camera_single":
        cam.alt.xyaxes = [0.0, -1.0, 0.0, -s, 0.0, c]
    return spec

  robot_cfg.spec_fn = spec_fn
  print(f"[dodge] head_camera_single tilt overridden: +{tilt_deg:g} deg up "
        f"(coverage {tilt_deg-27:g}..{tilt_deg+27:g} deg). Match the physical mount!")


def _add_depth_obs_single(cfg: ManagerBasedRlEnvCfg, play: bool) -> None:
  """Wire ONE head depth camera (``head_camera_single``, +20 deg up by default --
  CAMERA_TILT_DEG overrides per run) into a flattened ``depth`` obs group: 16x9 = 144 dims/frame.
  The camera is mounted at the head (pos 0.08 0 0.45); at the default tilt
  the vertical coverage is -7..+47 deg (biased toward the high-launched ball). Same
  flatten-into-MLP scheme + per-frame ring-buffer stacking."""
  _set_single_camera_tilt(cfg, CAMERA_TILT_DEG)
  sensors = tuple(
    s for s in (cfg.scene.sensors or ())
    if s.name not in ("head_depth", "head_depth_single")
  )
  # Train also renders SEGMENTATION (for the ground far-out augmentation, which reads floor pixels
  # from the seg map); play renders depth only (the ZED supplies depth, no segmentation needed).
  _single_data_types = ("depth",) if play else ("depth", "segmentation")
  cfg.scene.sensors = sensors + (
    _head_depth_camera_cfg(
      name="head_depth_single", camera="head_camera_single", data_types=_single_data_types
    ),
  )
  # Train: base D435/ZED gaussian+dropout PLUS the ZED sim2real augmentation (speckle/clutter/haze/
  # holes/ground far-out; see _DEPTH_SINGLE_AUG_KWARGS + DepthImageObs._augment). The cfg builds PLAY
  # with clean depth; play.py re-enables the aug for SIM play by default (--depth-aug) via
  # enable_depth_aug_preview, and skips it on the ZED path (the real camera supplies the real noise).
  depth_noise = {} if play else dict(_DEPTH_SINGLE_AUG_KWARGS)
  cfg.observations["depth"] = ObservationGroupCfg(
    terms={
      "head_depth": ObservationTermCfg(
        func=mdp.DepthImageObs,
        params={
          "sensor_name": "head_depth_single",
          "near": DEPTH_NEAR,
          "far": DEPTH_FAR,
          "flatten": True,
          "update_period": DEPTH_UPDATE_PERIOD,
          **depth_noise,
        },
      ),
    },
    concatenate_terms=True,
    enable_corruption=False,
    history_length=0,
  )


def _add_depth_obs_single_ballonly(cfg: ManagerBasedRlEnvCfg, play: bool) -> None:
  """Wire ONE head depth camera (``head_camera_single``) into a flattened ``depth`` obs group,
  using ``BallOnlyDepthObs``: everything except the ball is masked to ``far``, mirroring the
  representation produced by the hardware EfficientTAM ball-segmenter.

  Identical sensor/obs-group structure to ``_add_depth_obs_single`` EXCEPT:
  - The sensor always renders BOTH ``depth`` and ``segmentation`` (needed to find the ball geom).
  - The obs term uses ``mdp.BallOnlyDepthObs`` (not ``mdp.DepthImageObs``).
  - The DR profile is the masked-depth profile (noisy ball depth + ring flicker + bursty dropout
    + STATIC fixed clusters so the policy dodges on looming, not on static near-blobs) with NO
    full-frame speckle/haze/bg_fill (the masked background between blobs is always clean far).
  Camera tilt is applied identically to ``_add_depth_obs_single`` (via ``_set_single_camera_tilt``).
  """
  _set_single_camera_tilt(cfg, CAMERA_TILT_DEG)
  sensors = tuple(
    s for s in (cfg.scene.sensors or ())
    if s.name not in ("head_depth", "head_depth_single")
  )
  # BallOnlyDepthObs always needs segmentation to locate the ball geom (even in play).
  cfg.scene.sensors = sensors + (
    _head_depth_camera_cfg(
      name="head_depth_single", camera="head_camera_single",
      data_types=("depth", "segmentation")
    ),
  )
  # Masked-depth DR profile: noisy ball depth + ragged mask + ring flicker + static fixed clusters.
  # NOTE: no false_positive_rate, no bg_fill, no speckle -- the masked bg (between static blobs) is clean far.
  # On in training; off in play (clean masked ball) UNLESS BALLONLY_AUG=1 forces it on, so the DR can
  # be eyeballed live in the viser viewer (play_depth_single_ballonly_aug.sh).
  # NB: depth noise is BALL-ONLY here (ball_noise_sigma), NOT the inherited frame-wide noise_sigma --
  # the masked background must stay a CLEAN constant far (frame-wide gaussian would speckle the empty
  # field every frame, which the real EfficientTAM feed never does).
  _aug_on = (not play) or os.environ.get("BALLONLY_AUG", "0") == "1"
  _s = BALLONLY_DR_SCALE  # scales the noise-type knobs below; static clusters unscaled
  ball_dr = {
    "ball_full_dropout_prob": 0.02 * _s,   # bursty whole-ball loss
    "ball_pixel_dropout": 0.10 * _s,       # ragged mask
    "ball_depth_jitter": 0.15 * _s,        # +/- coherent ball-depth offset (m)
    "ball_noise_sigma": 0.03 * _s,         # per-pixel depth noise ON THE BALL only
    "edge_tile_flicker": 0.15 * _s,        # frac of the 1-tile ring flipping to ball-distance
    # STATIC fixed clusters (re-added): ball-sized near blobs that PERSIST all episode and do
    # NOT loom -- a held/stationary ball or a segmenter false-positive on a static object. Forces
    # the policy to dodge on LOOMING (rapid depth collapse), not on the mere presence of a near
    # blob, fixing over-sensitivity to static balls. clutter_drift=0 => truly fixed; edge_bias=0
    # => placed UNIFORMLY (incl. the center lane the real ball comes through, so it learns a
    # center static blob is not a threat). Rendered by the inherited DepthImageObs clutter path.
    "clutter_blobs": 3,               # MAX blobs per env; realized count is randomized (below)
    "clutter_prob": 0.6,              # 60% of envs carry static clusters; rest are clean
    "clutter_blob_prob": 0.5,         # per-blob presence -> count ~ Binomial(3, 0.5) => 0..3 blobs
    "clutter_drift": 0.0,             # no coherent linear drift (jitter below is the motion model)
    "clutter_edge_bias": 0.0,         # uniform placement (not edge-biased) -> can sit center
    "clutter_size_min": 0.04,         # ball-ish half-size (frac of H,W) at [9,16]
    "clutter_size_max": 0.12,
    # Placement depth floor also gentled by the dial: at scale 1 blobs may sit as near as
    # 0.1 normalized (0.6 m, the held-ball range); at 0.5 the floor rises to 0.3 (1.6 m);
    # at 0.25 to 0.4 (2.1 m). Max stays 0.9 (4.5 m).
    "clutter_depth_min": 0.1 + 0.4 * (1.0 - BALLONLY_CLUTTER_SCALE),
    "clutter_depth_max": 0.9,
    # Ego-motion wobble: each step the blob slides up/down/left/right (and its range nudges a bit) as
    # a WORLD-STATIONARY object would when the robot jerks. Lateral jitter is in WORLD METRES (mapped
    # to the image by depth+FOV, so near blobs swing more); depth jitter is small + bounded so it is
    # NOT a looming collapse. Without this a static blob is frozen in place and the policy never learns
    # that lateral / small-range wobble at fixed depth is not a threat.
    # Wobble dynamics: bounds scaled by BALLONLY_CLUTTER_SCALE (the "violence" dial); the
    # per-step rates are individually overridable (BALLONLY_CLUTTER_JITTER /
    # BALLONLY_CLUTTER_DEPTH_JITTER, m/step) and default to the scaled base.
    "clutter_jitter": BALLONLY_CLUTTER_JITTER,                 # per-step lateral random-walk std (WORLD m)
    "clutter_jitter_max": 1.0 * BALLONLY_CLUTTER_SCALE,        # lateral wander bound (+/- m from base)
    "clutter_depth_jitter": BALLONLY_CLUTTER_DEPTH_JITTER,     # per-step depth random-walk std (m)
    "clutter_depth_jitter_max": 0.2 * BALLONLY_CLUTTER_SCALE,  # depth wander bound -> never a looming collapse
  } if _aug_on else {}
  depth_noise = {}  # no frame-wide noise_sigma -> background stays clean far
  cfg.observations["depth"] = ObservationGroupCfg(
    terms={
      "head_depth": ObservationTermCfg(
        func=mdp.BallOnlyDepthObs,
        params={
          "sensor_name": "head_depth_single",
          "near": DEPTH_NEAR,
          "far": DEPTH_FAR,
          "flatten": True,
          "ball_geom_name": "ball/ball_collision",
          "update_period": DEPTH_UPDATE_PERIOD,
          **ball_dr,
          **depth_noise,
        },
      ),
    },
    concatenate_terms=True,
    enable_corruption=False,
    history_length=0,
  )


def _add_ball_state_obs(cfg: ManagerBasedRlEnvCfg) -> None:
  """Wire MimicKit's dodgeball observation into an actor-visible ``ball_state`` group.

  MimicKit's ``compute_dodgeball_observations`` is the ball's position + velocity relative
  to the character, expressed in its heading (yaw) frame -- exactly ``dodge_ball_state_b``
  ([B, 6]). For the MimicKit-observation task this group is given to BOTH the actor and the
  critic (MimicKit's PPO is symmetric: actor and critic share the obs), so the actor is
  handed clean ground-truth ball state instead of inferring it from depth. ``history_length
  =0`` -- pos+vel already encode the ball's motion (MimicKit uses a single frame too).
  """
  cfg.observations["ball_state"] = ObservationGroupCfg(
    terms={
      "ball_state": ObservationTermCfg(
        func=mdp.dodge_ball_state_b,
        params={"robot_name": "robot", "ball_name": "ball"},
      ),
    },
    concatenate_terms=True,
    enable_corruption=False,
    history_length=0,
  )






def _apply_mimickit_reward(cfg: ManagerBasedRlEnvCfg, play: bool) -> ManagerBasedRlEnvCfg:
  """MimicKit-faithful dodgeball reward AND curriculum (no CBF shaping).

  The shared override for both MimicKit-reward dodge tasks (ball-state obs and depth obs).
  Faithfully reproduces MimicKit/SMP's dodgeball setup (arXiv:2512.03028) on three axes:

  * **Reward** -- the *only* task reward is MimicKit's ``compute_dodge_reward``
    (``mimickit_dodge``: far-from-ball + stay-still). The goal-navigation task rewards are
    dropped (no MimicKit analog; they fought the dodge), and the velocity-tracking terms are
    cut to a light stabilizer. Naturalness/standing come from the AMP motion prior (our
    analog of SMP's score-matching prior), not a locomotion-reward stack.
  * **Termination** -- the ball-hit termination is ON FROM ITER 0 (MimicKit
    ``enable_early_termination: True``, no delay/ramp), with no penalty spike (zero future
    reward). This removes the curriculum cliff: the previous runs deferred the hit-termination
    to ~8.3k iters, by which point the policy had converged to a never-dodge stander and then
    collapsed when the termination switched on.
  * **Throws** -- intermittent TIMED throws on a random 1-4 s interval (MimicKit
    ``proj_trigger_time_min/max``) instead of the continuous rethrow-on-ground barrage, so the
    robot gets a recovery window between throws.

  Note: this drops ``leap_flight`` -- MimicKit dodges by sidestepping, not leaping, and that
  term was already producing zero reward here (gated on the ~0 home command). The throw
  *geometry* (distance/height/flight time) stays ours, tuned for the head camera + G1 scale.
  """
  twist = cfg.commands["twist"]
  assert isinstance(twist, DodgeGoToGoalCommandCfg)
  # CBF is not used by MimicKit: don't hard-filter the command. The CBF still runs in the
  # command term (its output feeds the privileged critic obs on the depth task) but nothing
  # here consumes it -- no dodge_cbf reward, no tracking of the safe command.
  twist.cbf_filter_command = False

  # --- Stand in place, no navigation goal (MimicKit has neither goal nor velocity command). ---
  # Pin the goal home (TRAIN AND PLAY) so the nominal command is ~0 and the robot stands /
  # returns to spawn -- play used to inherit the CBF task's backpedal (back_offset=0.5), which
  # is out-of-distribution vs how these policies train (stand), so "left alone" in play it walked
  # backward and drifted. back_offset=0 + home_goal makes play match training. Drop ALL
  # goal-navigation task rewards and leap_flight (see docstring). Keep the velocity-tracking
  # terms at a MODERATE 0.5 (was 1.0 base): they anchor a stable two-foot stand -- needed because
  # the amp_dodge prior is ~46% one-leg (pulls toward foot-lifting) -- while the hit-termination
  # (live from iter 0) keeps the dodge dominant so this anchor no longer suppresses evasion.
  # Physical-sanity regularizers (joint/action/slip/collision) are untouched.
  twist.home_goal = True
  twist.back_offset = 0.0
  for term in ("goal_distance", "goal_progress", "goal_reached", "stop_at_goal", "leap_flight"):
    cfg.rewards.pop(term, None)
  for term in ("track_anchor_linear_velocity", "track_anchor_angular_velocity"):
    if term in cfg.rewards:
      cfg.rewards[term].weight = 0.5
  # In-place-throw envs are commanded zero velocity but ARE pelted (rel_inplace_throw_envs): drop the
  # linear velocity-tracking term for them so its stillness pull (tracking the 0 command) doesn't fight
  # the sidestep -- mimickit_dodge (far-from-ball) + the hit termination drive their evasion instead.
  if "track_anchor_linear_velocity" in cfg.rewards:
    cfg.rewards["track_anchor_linear_velocity"].params["mask_inplace"] = True

  # Light POSITION-HOLD against forward drift. home_goal pins the goal to spawn, but goal_distance
  # was dropped above, so nothing penalized POSITION -- only the home-return velocity command (tracked
  # at 0.5) and mimickit's stillness term, which penalizes SPEED not position. A slow low-speed creep
  # therefore accumulated unpenalized -> the robot drifted forward. Re-add goal_distance (= exp(-d^2/
  # std^2) to the spawn) LIGHT and WIDE (weight 0.3, std 1.5): a gentle restoring pull toward home that
  # corrects cumulative drift, but soft enough not to penalize the transient ~0.5 m dodge sidestep.
  cfg.rewards["goal_distance"] = RewardTermCfg(
    func=mdp.goal_distance_reward,
    weight=0.3,
    params={"command_name": "twist", "std": 1.5},
  )

  # --- Reward: MimicKit root-distance dodge (gross evasion + settle) + per-link CBF (limb veto). ---
  cfg.rewards.pop("dodge_cbf", None)
  cfg.rewards["mimickit_dodge"] = RewardTermCfg(
    func=mdp.mimickit_dodge_reward,
    weight=1.0,
    params={"robot_name": "robot", "ball_name": "ball"},
  )
  # Stand still UNLESS a ball is looming (threat-gated): the in-place/between-throw regime drops
  # the velocity-tracking stillness anchor (mask_inplace) and mimickit's stillness is only vel_w=0.1,
  # so a FALSE dodge on noise/clutter is nearly free while a missed ball costs -200 -> the policy
  # over-twitches at any near-blob. This rewards near-zero base speed when threat=0 (noise only) and
  # vanishes when threat=1 (real ball) so it never slows a genuine dodge. The actor sees only depth,
  # so collecting it forces the looming (depth-collapse) vs noise (depth-stationary) discrimination.
  cfg.rewards["dodge_stillness_when_safe"] = RewardTermCfg(
    func=mdp.dodge_stillness_when_safe,
    weight=0.5,
    params={"command_name": "twist", "robot_name": "robot", "vel_scale": 2.0},
  )
  # Companion to the above: penalize action JITTER (rapid joint-target changes) when no ball is
  # looming, so the robot doesn't shuffle/twitch in place on noise (motion the base-velocity term
  # barely catches). Threat-gated -> OFF during a real dodge, so it never smooths a genuine reaction.
  # Like the global action_rate_l2 (kept light, unconditional) but stronger and only when safe.
  cfg.rewards["dodge_action_rate_when_safe"] = RewardTermCfg(
    func=mdp.dodge_action_rate_when_safe,
    weight=-0.05,
    params={"command_name": "twist"},
  )
  # Per-link full-body control-barrier penalty. `mimickit_dodge` only sees the PELVIS, so the policy
  # banks pelvis clearance while leaving limbs in the ball's path (a hit-location analysis found the
  # residual hits are ~41% arm / 26% foot, only 2.5% torso). This term penalizes min over links of
  # clamp(h_dot + alpha*h, -clip, 0) for clearance h = ||p_ball - p_link|| - (r_ball + r_link); it is
  # ZERO when safe (preserves the stand/settle behavior) and only bites when a ball closes on a link.
  # alpha=1.0 (class-K gain): an alpha sweep (/tmp/cbf_calibrate.py) showed the danger window is
  # threat-gated (ball airborne+approaching), so alpha in [0.5,2] barely changes it -- all give a
  # ~0.4 s (~20-step) warning before a hit; alpha only shifts penalty magnitude. 1.0 ties for the
  # most lead. weight=0.25 calibrated to that alpha: W*=0.21 nets the danger-zone reward to ~0 (so
  # exposing a limb stops being reward-positive without swamping the signal -- 1.0 was ~5x too
  # strong); 0.25 nudges danger marginally net-negative.
  cfg.rewards["dodge_link_cbf"] = RewardTermCfg(
    func=mdp.dodge_link_cbf_reward,
    weight=0.27,
    params={
      "robot_name": "robot",
      "ball_name": "ball",
      "alpha": 1.0,
      "margin": 0.05,
      "constraint_clip": 2.0,
    },
  )
  # Full-body sidestep CBF -- TESTED AND DISABLED (weight 0). Idea: charge the base for not getting
  # OFF the ball's incoming xy line -> commit to a whole-body sidestep. Run 2026-06-04_18-25-45
  # (link 0.27 + sidestep 1.2) REGRESSED vs link-only (2026-06-04_11-39-27) at matched iters 6k/8k:
  # hit-fraction ~7pp worse AND legs (its target) went UP 35.3%->38.5%. Why: a lateral sidestep
  # against a head-on ball (93% of hits) swings a LEG out into the path, and the directive fights
  # both the link-CBF (which penalizes that leg motion) and the settle term. The leg residual is a
  # physical floor (load-bearing leg can't vacate a head-on ball), not a reward-shaping miss. Kept
  # at weight 0 (code/lever preserved, computed-but-inert) in case a different formulation is tried.
  cfg.rewards["dodge_sidestep"] = RewardTermCfg(
    func=mdp.dodge_sidestep_reward,
    weight=0.0,
    params={"robot_name": "robot", "ball_name": "ball", "alpha": 1.0, "safe_radius": 0.4},
  )

  # NO_LINK_CBF=1: pure distance-to-core baseline -- zero the per-link CBF barrier so the ONLY dodge
  # signal is `mimickit_dodge` (root/pelvis distance-to-ball + stillness, the verbatim SMP reward,
  # no control-barrier structure). The anti-twitch terms (dodge_stillness/action_rate_when_safe) are
  # NOT CBF-like and stay. This is the honest zero-CBF lower bound: the existing "vision_baseline"
  # still carries dodge_link_cbf at 0.27, so it is not actually CBF-free. Read at CALL time so the
  # flag composes with any task build; no-op when unset (byte-identical). dodge_sidestep is already 0.
  if os.environ.get("NO_LINK_CBF", "0") == "1":
    cfg.rewards["dodge_link_cbf"].weight = 0.0

  # --- Termination: ball-hit ON from iter 0, no penalty (do NOT call the curriculum helper). ---
  cfg.rewards["is_terminated"] = RewardTermCfg(
    func=mdp.is_terminated_except,
    weight=-200.0,
    params={"exclude_terms": ("ball_hit",)},
  )
  cfg.terminations["ball_hit"].params.pop("enable_after_steps", None)  # active immediately

  # --- Throws: intermittent timed trigger (1-4 s), replacing the rethrow-on-ground barrage. ---
  interval = (1.0, 4.0)
  throw = cfg.events["throw_ball_on_dwell"]
  throw.params.pop("rethrow_ground_height", None)
  throw.params["throw_interval_range"] = interval
  cfg.events["reset_dodge_state"].params["throw_interval_range"] = interval

  return cfg




def _set_slim_critic_dodge(
  cfg: ManagerBasedRlEnvCfg,
  gate_up: str = "head_depth_single",
  gate_down: str = "head_depth_single",
) -> None:
  """Slim, CBF-FREE privileged critic obs group for the MimicKit/RMA depth tasks.

  ``critic_dodge`` = ball_state(6: rel pos+vel) + ball_radius(1, true size) + belief_gate(1:
  latched "seen this throw"). Replaces the CBF version (``_add_critic_dodge_obs``, which
  includes ``dodge_cbf_state_b``) -- the CBF barrier is a lossy 2-D base-velocity abstraction
  that mis-judges full-body safety (ball through the legs / ducking). The critic reasons
  full-body from its existing ``body_pos_b`` + true ball state. ``belief_gate`` doubles as the
  depth-RNN-belief decoder's loss mask. Requires the head depth camera to exist (it does for the
  depth tasks); the no-camera ball-state task stays MimicKit-symmetric (no critic_dodge). The
  single-camera tasks pass the same sensor for ``gate_up`` and ``gate_down`` (the gate dedups).
  """
  cfg.observations["critic_dodge"] = ObservationGroupCfg(
    terms={
      "ball_state": ObservationTermCfg(
        func=mdp.dodge_ball_state_b,
        params={"robot_name": "robot", "ball_name": "ball"},
      ),
      "ball_radius": ObservationTermCfg(
        func=mdp.dodge_ball_radius_b,
        params={"command_name": "twist"},
      ),
      "belief_gate": ObservationTermCfg(
        func=mdp.BallObservableGate,
        params={
          "ball_name": "ball",
          "up_sensor": gate_up,
          "down_sensor": gate_down,
        },
      ),
    },
    concatenate_terms=True,
    enable_corruption=False,
    history_length=0,
  )


def g1_amp_dodge_mimickit_flat_env_cfg(play: bool = False) -> ManagerBasedRlEnvCfg:
  """G1 AMP dodge, MimicKit-style: ground-truth ball-state obs + MimicKit task reward.

  The faithful MimicKit/SMP dodgeball setup on the G1: the actor (and critic) observe the
  ball's relative pos+vel in the heading frame (``_add_ball_state_obs``) -- the same 6-D
  observation MimicKit uses -- and the reward is MimicKit's far-from-ball + stay-still
  (``_apply_mimickit_reward``). No depth, no CBF. The "oracle observation" baseline.
  """
  cfg = g1_amp_dodge_flat_env_cfg(play=play)
  cfg = _apply_mimickit_reward(cfg, play)
  _add_ball_state_obs(cfg)
  # OMNI_THROW=1: omnidirectional fast-throw config (state envs only -- the actor observes the ball
  # state, so a ball from BEHIND is still observable, unlike the depth/front cone). Balls launch from
  # a full 360deg bearing 8-10 m away (OMNI_DIST_*) at 12-15 m/s (OMNI_SPEED_*), solving the
  # elevation to hit the body (target_z spans head->legs). Aim model (lead + aim_noise) is reused
  # from the default throw; see mdp.events.throw_ball_on_dwell / solve_ballistic_velocity.
  # SPEED: matches the RELEASED MimicKit config (smp_dodgeball_humanoid_env.yaml:
  # proj_speed_min=12 / proj_speed_max=15, dist 8-10 m) -- the config that produced the shipped
  # 99%-survival model. The paper TEXT says 20-25 m/s (the harder written spec); override via
  # OMNI_SPEED_MIN/MAX to reproduce the harder regime.
  if os.environ.get("OMNI_THROW", "0") == "1":
    _p = cfg.events["throw_ball_on_dwell"].params
    _p["omnidirectional"] = True
    _p["launch_speed_range"] = (
      float(os.environ.get("OMNI_SPEED_MIN", "12.0")),
      float(os.environ.get("OMNI_SPEED_MAX", "15.0")),
    )
    _p["dist_range"] = (
      float(os.environ.get("OMNI_DIST_MIN", "8.0")),
      float(os.environ.get("OMNI_DIST_MAX", "10.0")),
    )
    _p["target_z_range"] = (0.3, 1.3)  # body-spanning aim (head -> legs); high/low fraction unused
  # CBF_JOINT=1: add the joint-CBF filter + reward terms (per-body all-links keep-out). No gimbal /
  # depth here, so this is just the action-space filter on the state-based actor (read at call time).
  if os.environ.get("CBF_JOINT", "0") == "1":
    _apply_cbf_joint_filter(cfg)
  return cfg


@dataclass(kw_only=True)
class G1DodgeDepthEnvCfg(ManagerBasedRlEnvCfg):
  """Depth dodge env cfg + a CLI-overridable depth temporal-sampling knob.

  ``depth_frame_offsets`` (step offsets, 0 = current, k = k steps ago) controls how the depth obs
  is stacked in time; ``DepthImageObs`` reads it at env instantiation, so
  ``--env.depth_frame_offsets 0 5 10 20`` works at launch. Default ``(0, 1)`` = dense 2-frame
  (current + previous, the prior baseline). A sparse set e.g. ``(0, 5, 10, 20, 40, 80)`` gives a
  long receptive field for the raw depth-MLP to carry the ball across FOV exit. The model
  auto-sizes from the resulting depth dim. (Leave at the (0,1) default for the RNN-belief task --
  its LSTM carries memory, so frame-stacking is redundant there.)"""

  depth_frame_offsets: tuple[int, ...] = (0, 1)


def _promote_to_depth_cfg(
  cfg: ManagerBasedRlEnvCfg, depth_frame_offsets: tuple[int, ...]
) -> G1DodgeDepthEnvCfg:
  """Re-home a built env cfg onto ``G1DodgeDepthEnvCfg`` (copying all fields) so the extra
  ``depth_frame_offsets`` field exists and tyro exposes it under ``--env``. Bypasses __init__
  (the base is kw_only with required fields) by copying __dict__."""
  sub = G1DodgeDepthEnvCfg.__new__(G1DodgeDepthEnvCfg)
  sub.__dict__.update(cfg.__dict__)
  sub.depth_frame_offsets = depth_frame_offsets
  return sub



def g1_amp_dodge_depth_single_flat_env_cfg(
  play: bool = False, depth_frame_offsets: tuple[int, ...] = (0, 1)
) -> ManagerBasedRlEnvCfg:
  """G1 AMP dodge with a SINGLE head depth camera tilted +20 deg up, + MimicKit task reward.

  One camera (``head_camera_single``, mounted at the head, tilted +20 deg up -> vertical
  coverage -7..+47 deg). The depth obs is 16x9 = 144 dims/frame. Same MimicKit reward and slim CBF-free
  critic; the critic's ``belief_gate`` is pointed at the single camera. The depth-MimicKit MLP
  runner cfg works unchanged (the actor MLP auto-sizes from the smaller depth dim)."""
  cfg = g1_amp_dodge_flat_env_cfg(play=play)
  cfg = _apply_mimickit_reward(cfg, play)
  _add_depth_obs_single(cfg, play)
  _set_slim_critic_dodge(cfg, gate_up="head_depth_single", gate_down="head_depth_single")
  return _promote_to_depth_cfg(cfg, depth_frame_offsets)


def _apply_cbf_joint_filter(cfg: ManagerBasedRlEnvCfg) -> None:
  """Swap the joint-position action for the CBF-filtered one and add the two CBF-RL reward terms.

  Joint-level ball-avoidance (CBF-RL Phase 1, docs/cbf_joint_filter_spec.md): the filter projects
  the policy's implicit joint-velocity command off the ball's path; the reward (not the runtime
  nudge) is the lever -- penalizing the correction trains the policy to be safe on its own so the
  train-only filter is dropped at deploy. Env-var gated (CBF_JOINT=1)."""
  # Read all knobs at CALL time (env-var override of the import defaults) so the benchmark can vary
  # filter strength / weights per build; training sets them at launch -> identical behavior there.
  ev = lambda k, d: float(os.environ.get(k, d))
  old = cfg.actions["joint_pos"]
  base = {f.name: getattr(old, f.name) for f in fields(old)}
  cfg.actions["joint_pos"] = mdp.CbfJointPositionActionCfg(
    **base,
    cbf_enabled=True,
    # CBF_JOINT_APPLY_FILTER=0 -> compute v*/h_min for the rewards but DON'T override the action
    # (pure reward shaping, no filter crutch / no train-deploy mismatch). Default 1 (filter on).
    filter_action=os.environ.get("CBF_JOINT_APPLY_FILTER", "1") == "1",
    ball_name="ball",
    body_buffer=ev("CBF_JOINT_BODY_BUFFER", CBF_JOINT_BODY_BUFFER),
    alpha=ev("CBF_JOINT_ALPHA", CBF_JOINT_ALPHA),
    delta_max=ev("CBF_JOINT_DELTA_MAX", CBF_JOINT_DELTA_MAX),
    t_alert=ev("CBF_JOINT_T_ALERT", CBF_JOINT_T_ALERT),
    # Threat sense radius (distance gate). Omni fast throws (20-25 m/s from 8-10 m) cross the
    # default 4 m in ~0.18 s -- the CBF would engage far too late. Under OMNI_THROW, sense out to
    # ~12 m so the CBF sees the ball from launch; t_alert still scales the URGENCY by time-to-impact.
    # Override explicitly with CBF_SENSE_RADIUS.
    sense_radius=ev("CBF_SENSE_RADIUS", 12.0 if os.environ.get("OMNI_THROW", "0") == "1" else 4.0),
  )
  # PDF -lambda_corr ||v* - v_des||^2 : term returns <=0, so weight is the positive lambda.
  cfg.rewards["dodge_cbf_joint_correction"] = RewardTermCfg(
    func=mdp.dodge_cbf_joint_correction,
    weight=ev("CBF_JOINT_LAMBDA_CORR", CBF_JOINT_LAMBDA_CORR),
    params={},
  )
  # PDF -lambda_h [h_buf - h_min]_+^2 : likewise <=0, positive weight.
  cfg.rewards["dodge_cbf_joint_buffer"] = RewardTermCfg(
    func=mdp.dodge_cbf_joint_buffer,
    weight=ev("CBF_JOINT_LAMBDA_BUF", CBF_JOINT_LAMBDA_BUF),
    params={"h_buf": ev("CBF_JOINT_BUFFER", CBF_JOINT_BUFFER)},
  )


def g1_amp_dodge_depth_single_ballonly_flat_env_cfg(
  play: bool = False, depth_frame_offsets: tuple[int, ...] = (0, 1)
) -> ManagerBasedRlEnvCfg:
  """G1 AMP dodge with a SINGLE head depth camera + ball-only masked depth observation.

  Identical to ``g1_amp_dodge_depth_single_flat_env_cfg`` EXCEPT the depth obs uses
  ``BallOnlyDepthObs`` (everything except the ball is masked to ``far``), mirroring the
  observation produced by the hardware EfficientTAM ball-segmenter. The sensor renders
  both depth and segmentation so the ball geom can be identified per-pixel. Training-only
  DR models a real masked-depth feed: bursty whole-ball dropout, ragged pixel dropout,
  coherent ball-depth jitter, and edge-tile flicker; no full-frame speckle/clutter/haze/
  bg_fill (the masked background is always clean far). Same MimicKit reward, same slim
  CBF-free critic, same camera tilt (CAMERA_TILT_DEG) as the single-camera baseline."""
  cfg = g1_amp_dodge_flat_env_cfg(play=play)
  # Stage-1 camera gimbal: edit the robot cfg (spec_fn + actuator) BEFORE depth/scene wiring so the
  # re-parented camera + new joint are in place when the depth sensor + obs/critic are set up. Read
  # the flag at call time so a benchmark can toggle it per env build.
  if os.environ.get("CAMERA_GIMBAL", "0") == "1":
    # The gimbal camera's neutral is level (0deg). _set_single_camera_tilt no-ops only at the
    # default 20deg; any other CAMERA_TILT_DEG would silently re-tilt the gimbal camera off level
    # and mis-aim the experiment. Guard it (the Stage-1 runbook never sets CAMERA_TILT_DEG).
    assert abs(CAMERA_TILT_DEG - 20.0) < 1e-9, (
      "CAMERA_GIMBAL=1 is only supported at the default CAMERA_TILT_DEG=20 "
      f"(got {CAMERA_TILT_DEG}); a non-default tilt would re-tilt the gimbal camera off its level neutral."
    )
    from src.tasks.amp_loco.config.g1.camera_gimbal import add_camera_gimbal

    add_camera_gimbal(cfg.scene.entities["robot"])
    # Oracle-driven gimbal: exclude camera_pitch_joint from the policy action term so the
    # action dim stays 29 (unchanged from the baseline checkpoint). Negative-lookahead regex
    # excludes only the gimbal joint; all 29 body joints still match.
    cfg.actions["joint_pos"].actuator_names = ("^(?!camera_pitch_joint$).*$",)
    # Exclude camera_pitch_joint from the RSI (reference-state init) joint reset: motion clips
    # have 29 DOF (body joints only), so the asset_cfg must not include the 30th gimbal joint.
    # The gimbal joint stays at its MuJoCo default (0 rad = level forward) on reset.
    cfg.events["reset_from_motion"].params["asset_cfg"] = SceneEntityCfg(
      "robot", joint_names=("^(?!camera_pitch_joint$).*$",)
    )
    # Exclude camera_pitch_joint from all proprio obs terms (joint_pos + joint_vel) in EVERY obs
    # group that carries them (actor, critic): these default to ALL joints, so without filtering
    # the gimbal adds 1 joint × 4 history = +8 actor dims (+8 critic dims), breaking the existing
    # 29-joint checkpoint. Filter to the same 29 body joints as the action term.
    # CAMERA_PROPRIO=1: skip this filter so camera_pitch_joint IS in proprio (obs dim grows;
    # use for camera-aware training). CAMERA_PROPRIO=0 (default): apply the filter to keep the
    # 29-joint proprio → existing checkpoint loads without dim mismatch.
    # Read at call time (not a frozen module constant) so a benchmark can toggle per env build.
    camera_proprio = os.environ.get("CAMERA_PROPRIO", "0")
    if camera_proprio != "1":
      _body_joint_cfg = SceneEntityCfg("robot", joint_names=("^(?!camera_pitch_joint$).*$",))
      for _group_name in ("actor", "critic"):
        _group = cfg.observations[_group_name]
        for _term_name in ("joint_pos", "joint_vel"):
          if _term_name in _group.terms:
            _group.terms[_term_name].params = {
              **_group.terms[_term_name].params,
              "asset_cfg": _body_joint_cfg,
            }
    # Per-step oracle: pitch camera_pitch_joint to point at the ball using privileged ball state.
    # Runs every step (mode="step") so the camera tracks the ball throughout its flight. The joint
    # is not policy-actuated (excluded above), so this event is its sole driver -- no conflict.
    # Threat gate defaults match the CBF terms (ball airborne + closing + within 4 m).
    cfg.events["aim_camera"] = EventTermCfg(
      func=mdp.aim_camera_at_ball,
      mode="step",
      params={"robot_name": "robot", "ball_name": "ball"},
    )
  cfg = _apply_mimickit_reward(cfg, play)
  _add_depth_obs_single_ballonly(cfg, play)
  _set_slim_critic_dodge(cfg, gate_up="head_depth_single", gate_down="head_depth_single")
  # Read CBF_JOINT at CALL time (not the import-frozen constant) so the benchmark can toggle the
  # filter per env build; training sets it at launch so the behavior is identical there.
  if os.environ.get("CBF_JOINT", "0") == "1":
    _apply_cbf_joint_filter(cfg)
  return _promote_to_depth_cfg(cfg, depth_frame_offsets)



