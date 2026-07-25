from __future__ import annotations

import math
from typing import TYPE_CHECKING

import torch

from mjlab.entity import Entity
from mjlab.managers.scene_entity_config import SceneEntityCfg
from mjlab.sensor import ContactSensor
from mjlab.utils.lab_api.math import quat_apply, quat_apply_inverse, yaw_quat

if TYPE_CHECKING:
    from mjlab.envs import ManagerBasedRlEnv

from src.tasks.amp_loco.ampmotion_loader import MotionLoader
from src.tasks.amp_loco.mdp.terminations import DelayedTerminationManager

_DEFAULT_ASSET_CFG = SceneEntityCfg("robot")


class MotionResetManager:
    """Manages motion frame data and delayed-reset logic for AMP environments."""

    _instance: MotionResetManager | None = None

    def __init__(self) -> None:
        self.walk_run_frames: dict[str, dict[str, torch.Tensor]] = {}
        self.recovery_frames: dict[str, dict[str, torch.Tensor]] = {}

    @classmethod
    def get(cls) -> MotionResetManager:
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    # ------------------------------------------------------------------
    # Initialization
    # ------------------------------------------------------------------

    def init(
        self,
        env: ManagerBasedRlEnv,
        motion_dir: str,
        recovery_dir: str | None = None,
    ) -> None:
        if motion_dir in self.walk_run_frames:
            return

        loader = MotionLoader(
            motion_dir=motion_dir,
            tgt_body_indexes=[],
            tgt_anchor_indexes=0,
            feet_indexes=0,
            device=str(env.device),
            recovery_dir=recovery_dir,
        )

        self.walk_run_frames[motion_dir] = self._concat_frames(loader.motion_data)
        motion_count = self.walk_run_frames[motion_dir]["root_pos"].shape[0]
        print(f"[MotionResetManager] Loaded {len(loader.motion_data)} clips, {motion_count} frames from {motion_dir}")

        if loader.motion_data_recovery:
            self.recovery_frames[motion_dir] = self._concat_frames(loader.motion_data_recovery)
            recovery_count = self.recovery_frames[motion_dir]["root_pos"].shape[0]
            print(f"[MotionResetManager] Loaded {len(loader.motion_data_recovery)} recovery clips, {recovery_count} frames from {recovery_dir}")

    # ------------------------------------------------------------------
    # Reset
    # ------------------------------------------------------------------

    def reset(
        self,
        env: ManagerBasedRlEnv,
        env_ids: torch.Tensor | None,
        motion_dir: str,
        asset_cfg: SceneEntityCfg = _DEFAULT_ASSET_CFG,
    ) -> None:
        if env_ids is None:
            env_ids = torch.arange(env.num_envs, device=env.device, dtype=torch.int)

        if len(env_ids) == 0:
            return

        # Split into delay envs and normal envs.
        delay_mask = self._get_delay_env_mask(env)
        if delay_mask is not None:
            is_delay = delay_mask[env_ids]
            delay_ids = env_ids[is_delay]
            normal_ids = env_ids[~is_delay]
        else:
            delay_ids = env_ids[:0]  # empty
            normal_ids = env_ids

        # Reset normal envs with walk/run data.
        if len(normal_ids) > 0:
            self._write_reset_state(env, normal_ids, self.walk_run_frames[motion_dir], asset_cfg)

        # Reset delay envs with recovery data (fallback to walk/run if unavailable).
        if len(delay_ids) > 0:
            recovery = self.recovery_frames.get(motion_dir)
            frames = recovery if recovery is not None else self.walk_run_frames[motion_dir]
            self._write_reset_state(env, delay_ids, frames, asset_cfg)

    def _get_delay_env_mask(self, env: ManagerBasedRlEnv) -> torch.Tensor | None:
        """Get delay env mask from DelayedTerminationManager if installed."""
        tm = env.termination_manager
        if isinstance(tm, DelayedTerminationManager):
            return tm._delay_env_mask
        return None

    def _write_reset_state(
        self,
        env: ManagerBasedRlEnv,
        env_ids: torch.Tensor,
        frames: dict[str, torch.Tensor],
        asset_cfg: SceneEntityCfg,
    ) -> None:
        total_frames = frames["root_pos"].shape[0]
        num_reset = len(env_ids)
        idx = torch.randint(0, total_frames, (num_reset,), device=env.device)

        asset: Entity = env.scene[asset_cfg.name]

        # --- Root pose ---
        root_pos = frames["root_pos"][idx]
        root_quat = frames["root_quat"][idx]
        positions = env.scene.env_origins[env_ids].clone()
        positions[:, 2] = root_pos[:, 2]

        root_pose = torch.cat([positions, root_quat], dim=-1)
        asset.write_root_link_pose_to_sim(root_pose, env_ids=env_ids)

        # --- Root velocity ---
        root_vel = torch.cat([frames["root_lin_vel"][idx], frames["root_ang_vel"][idx]], dim=-1)
        asset.write_root_link_velocity_to_sim(root_vel, env_ids=env_ids)

        # --- Joint state ---
        joint_pos = frames["joint_pos"][idx]
        joint_vel = frames["joint_vel"][idx]

        soft_joint_pos_limits = asset.data.soft_joint_pos_limits
        assert soft_joint_pos_limits is not None
        joint_pos_limits = soft_joint_pos_limits[env_ids][:, asset_cfg.joint_ids]
        joint_pos_clamped = joint_pos[:, asset_cfg.joint_ids].clamp_(
            joint_pos_limits[..., 0], joint_pos_limits[..., 1]
        )

        joint_ids = asset_cfg.joint_ids
        if isinstance(joint_ids, list):
            joint_ids = torch.tensor(joint_ids, device=env.device)

        asset.write_joint_state_to_sim(
            joint_pos_clamped,
            joint_vel[:, asset_cfg.joint_ids],
            env_ids=env_ids,
            joint_ids=joint_ids,
        )

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------

    @staticmethod
    def _concat_frames(motions: list[dict]) -> dict[str, torch.Tensor]:
        root_pos_list = []
        root_quat_list = []
        root_lin_vel_list = []
        root_ang_vel_list = []
        joint_pos_list = []
        joint_vel_list = []
        for motion in motions:
            root_pos_list.append(motion["body_pos_w"][:, 0, :])
            root_quat_list.append(motion["body_quat_w"][:, 0, :])
            root_lin_vel_list.append(motion["body_lin_vel_w"][:, 0, :])
            root_ang_vel_list.append(motion["body_ang_vel_w"][:, 0, :])
            joint_pos_list.append(motion["dof_pos"])
            joint_vel_list.append(motion["dof_vel"])
        return {
            "root_pos": torch.cat(root_pos_list, dim=0),
            "root_quat": torch.cat(root_quat_list, dim=0),
            "root_lin_vel": torch.cat(root_lin_vel_list, dim=0),
            "root_ang_vel": torch.cat(root_ang_vel_list, dim=0),
            "joint_pos": torch.cat(joint_pos_list, dim=0),
            "joint_vel": torch.cat(joint_vel_list, dim=0),
        }


# ------------------------------------------------------------------
# Event callback wrappers (thin delegates to singleton)
# ------------------------------------------------------------------

def init_motion_loader(
    env: ManagerBasedRlEnv,
    env_ids: torch.Tensor | None,
    motion_dir: str,
    recovery_dir: str | None = None,
    delay_reset_env_ratio: float = 0.0,
    max_delay_steps: int = 0,
) -> None:
    """Startup event: load motion data and optionally install delayed termination."""
    MotionResetManager.get().init(
        env=env,
        motion_dir=motion_dir,
        recovery_dir=recovery_dir,
    )

    # Install DelayedTerminationManager if requested.
    num_delay = int(env.num_envs * delay_reset_env_ratio)
    if num_delay > 0 and max_delay_steps > 0:
        delay_mask = torch.zeros(env.num_envs, dtype=torch.bool, device=env.device)
        delay_indices = torch.randperm(env.num_envs, device=env.device)[:num_delay]
        delay_mask[delay_indices] = True
        env.termination_manager = DelayedTerminationManager(
            base=env.termination_manager,
            delay_env_mask=delay_mask,
            max_delay_steps=max_delay_steps,
        )
        print(
            "[init_motion_loader] DelayedTerminationManager installed: "
            f"{num_delay}/{env.num_envs} envs, max_delay_steps={max_delay_steps}"
        )


def reset_from_motion_data(
    env: ManagerBasedRlEnv,
    env_ids: torch.Tensor | None,
    motion_dir: str,
    asset_cfg: SceneEntityCfg = _DEFAULT_ASSET_CFG,
) -> None:
    """Reset event: reset envs from random motion frames, with delay support."""
    MotionResetManager.get().reset(
        env=env,
        env_ids=env_ids,
        motion_dir=motion_dir,
        asset_cfg=asset_cfg,
    )


def reset_to_default_stand(
    env: ManagerBasedRlEnv,
    env_ids: torch.Tensor | None,
    asset_cfg: SceneEntityCfg = _DEFAULT_ASSET_CFG,
) -> None:
    """Reset event: put the robot in its nominal default standing pose.

    Uses the entity's default state (the XML ``init_state`` keyframe): default joint
    positions, upright root at the default standing height, zero velocity -- placed at
    each env origin. This is a drop-in replacement for :func:`reset_from_motion_data`
    for HIL / demo play, so episodes start in a calm stand instead of the dynamic dodge
    RSI poses (which begin ~46% on one foot or briefly airborne and are a poor, easily
    destabilized starting point when the depth obs is being driven externally)."""
    if env_ids is None:
        env_ids = torch.arange(env.num_envs, device=env.device, dtype=torch.int)
    if len(env_ids) == 0:
        return

    asset: Entity = env.scene[asset_cfg.name]

    # Root: default standing height + orientation, at the env origin, zero velocity.
    default_root = asset.data.default_root_state[env_ids]  # [N, 13] (pos, quat, lin, ang)
    positions = env.scene.env_origins[env_ids].clone()
    positions[:, 2] = default_root[:, 2]
    root_pose = torch.cat([positions, default_root[:, 3:7]], dim=-1)
    asset.write_root_link_pose_to_sim(root_pose, env_ids=env_ids)
    asset.write_root_link_velocity_to_sim(
        torch.zeros_like(default_root[:, 7:13]), env_ids=env_ids
    )

    # Joints: default pose, zero velocity (all joints).
    asset.write_joint_state_to_sim(
        asset.data.default_joint_pos[env_ids].clone(),
        torch.zeros_like(asset.data.default_joint_vel[env_ids]),
        env_ids=env_ids,
    )


# ------------------------------------------------------------------
# Dodgeball: throw a ball at the robot once it dwells in standing
# ------------------------------------------------------------------
#
# The throw is *reactive*, not at reset: a ball is launched only when the robot has
# stood still (zero velocity command + settled base) continuously for ``dwell_time_s``.
# Implemented as a step-mode event (runs every step on all envs, after sim.forward(), so
# derived quantities -- world pose/velocity -- are fresh). A per-env dwell counter on
# ``env`` tracks the standing streak; on firing it teleports the (parked) ball to a
# launch point in the robot's frontal cone and gives it a gravity-corrected velocity so
# it arrives at the torso/pelvis. After firing the counter resets, so the next throw
# requires the robot to settle back into standing again (re-arming the dodge loop).

_DODGE_DWELL_ATTR = "_dodge_dwell_counter"
# Per-env countdown (in env steps) until the next timed throw -- the MimicKit-faithful
# trigger (``throw_interval_range`` mode). MimicKit launches each projectile on a random
# 1-4 s timer (``proj_trigger_time_*``), re-armed after every launch, independent of where
# the previous ball landed. Seeded on reset (``reset_dodge_state``), decremented + re-armed
# in ``throw_ball_on_dwell``.
_DODGE_THROW_CD_ATTR = "_dodge_throw_countdown"


def _sample_interval_steps(
    env: "ManagerBasedRlEnv", n: int, interval_s: tuple[float, float]
) -> torch.Tensor:
  """Sample ``n`` per-env throw countdowns (env steps) uniformly in ``interval_s`` seconds."""
  lo = max(1, round(interval_s[0] / env.step_dt))
  hi = max(lo, round(interval_s[1] / env.step_dt))
  return torch.randint(lo, hi + 1, (n,), device=env.device)


def _park_offset_world(env: "ManagerBasedRlEnv", env_ids: torch.Tensor, park_offset):
    origins = env.scene.env_origins[env_ids]  # (n, 3)
    off = torch.tensor(park_offset, device=env.device, dtype=origins.dtype)
    return origins + off


def reset_dodge_state(
    env: ManagerBasedRlEnv,
    env_ids: torch.Tensor | None,
    ball_name: str = "ball",
    park_offset: tuple[float, float, float] = (0.0, 3.0, 0.1),
    throw_interval_range: tuple[float, float] | None = None,
) -> None:
    """Reset event: clear the standing-dwell counter and park the ball out of the way.

    The ball rests at ``env_origin + park_offset`` (default 3 m to the side, on the
    ground) with zero velocity until a throw teleports it to its launch point. Parking
    avoids a leftover mid-flight ball from the previous episode interfering with the
    fresh one.

    ``throw_interval_range`` (MimicKit-faithful timed throws): if set, seed each reset
    env's first-throw countdown to a random time in this range (seconds), matching
    MimicKit's ``proj_trigger_time_min/max`` (the first ball arrives 1-4 s after reset).
    Must match the ``throw_interval_range`` passed to ``throw_ball_on_dwell``.
    """
    if env_ids is None:
        env_ids = torch.arange(env.num_envs, device=env.device, dtype=torch.long)
    if len(env_ids) == 0:
        return

    counter = getattr(env, _DODGE_DWELL_ATTR, None)
    if counter is None or counter.shape[0] != env.num_envs:
        counter = torch.zeros(env.num_envs, dtype=torch.long, device=env.device)
        setattr(env, _DODGE_DWELL_ATTR, counter)
    counter[env_ids] = 0

    if throw_interval_range is not None:
        cd = getattr(env, _DODGE_THROW_CD_ATTR, None)
        if cd is None or cd.shape[0] != env.num_envs:
            cd = _sample_interval_steps(env, env.num_envs, throw_interval_range)
            setattr(env, _DODGE_THROW_CD_ATTR, cd)
        cd[env_ids] = _sample_interval_steps(env, len(env_ids), throw_interval_range)

    ball: Entity = env.scene[ball_name]
    n = len(env_ids)
    park_pos = _park_offset_world(env, env_ids, park_offset)
    quat_identity = torch.zeros(n, 4, device=env.device)
    quat_identity[:, 0] = 1.0
    ball.write_root_link_pose_to_sim(
        torch.cat([park_pos, quat_identity], dim=-1), env_ids=env_ids
    )
    ball.write_root_link_velocity_to_sim(
        torch.zeros(n, 6, device=env.device), env_ids=env_ids
    )


def solve_ballistic_velocity(
    start: torch.Tensor,
    target: torch.Tensor,
    speed: torch.Tensor,
    gravity: float = 9.81,
) -> torch.Tensor:
    """Launch velocity of magnitude ``speed`` from ``start`` that passes through ``target`` under
    gravity, choosing the DIRECT (flat) arc -- the low-elevation root, appropriate for a fast shot.

    ``start``/``target`` are ``(..., 3)`` world-frame points; ``speed`` is ``(...)``. Solves the
    fixed-speed projectile equation ``dz = d*u - k*(1 + u^2)`` with ``u = tan(theta)`` and
    ``k = g*d^2 / (2*speed^2)``, taking the smaller-angle root ``u = (d - sqrt(disc)) / (2k)``.
    Falls back to the max-range angle when the target is unreachable at that speed (disc < 0,
    clamped to 0) -- it cannot reach, but still fires sensibly rather than NaN.
    """
    d_xy = target[..., :2] - start[..., :2]
    d = torch.norm(d_xy, dim=-1).clamp(min=1e-6)            # horizontal range
    dir_xy = d_xy / d.unsqueeze(-1)
    dz = target[..., 2] - start[..., 2]
    k = gravity * d * d / (2.0 * speed * speed)
    disc = (d * d - 4.0 * k * (dz + k)).clamp(min=0.0)
    u = (d - torch.sqrt(disc)) / (2.0 * k)                  # tan(theta), direct/flat arc
    theta = torch.atan(u)
    vh = speed * torch.cos(theta)                           # horizontal speed
    vz = speed * torch.sin(theta)                           # vertical speed (signed)
    vel = torch.zeros_like(start)
    vel[..., :2] = dir_xy * vh.unsqueeze(-1)
    vel[..., 2] = vz
    return vel


def throw_ball_on_dwell(
    env: ManagerBasedRlEnv,
    env_ids: torch.Tensor | None,
    ball_name: str = "ball",
    robot_name: str = "robot",
    command_name: str = "twist",
    dwell_time_s: float = 0.5,
    command_threshold: float = 0.1,
    speed_threshold: float = 0.3,
    home_radius: float | None = None,
    min_move_speed: float | None = None,
    cooldown_s: float = 1.5,
    throw_interval_range: tuple[float, float] | None = None,
    rethrow_ground_height: float | None = None,
    require_feet_grounded: bool = False,
    feet_sensor_name: str = "feet_ground_contact",
    dist_range: tuple[float, float] = (2.0, 3.0),
    height_range: tuple[float, float] = (1.8, 2.0),
    angle_deg: float = 25.0,
    flight_time_range: tuple[float, float] = (0.55, 0.62),
    lead_target: bool = True,
    aim_noise_scale: float = 0.1,
    gravity: float = 9.81,
    high_throw_fraction: float = 0.0,
    high_launch_height_range: tuple[float, float] = (0.4, 0.9),
    # (0.9, 1.3): every UP throw a real threat -- z_tgt > ~1.4 sails over the head (head ~1.3 +
    # ball radius ~0.1), and with aim noise the 1.3-1.5 band is mostly a free miss (statue sweep).
    high_target_z_range: tuple[float, float] = (0.9, 1.3),
    skip_standing_envs: bool = False,
    omnidirectional: bool = False,
    launch_speed_range: tuple[float, float] | None = None,
    target_z_range: tuple[float, float] = (0.3, 1.3),
) -> None:
    """Step event: throw a ball at envs whose robot is ready (see trigger below).

    Trajectory: **pure horizontal toss under strict gravity, targeting a reaction time**
    (vz0=0, a human throw). Launched flat from ``dist_range`` ahead, ``+/- angle_deg`` of
    heading, ``height_range`` high (~2 m); the horizontal speed is set so the ball reaches
    the robot's xy after ``flight_time_range`` (= the reaction window). There is NO pelvis
    target -- the ball just has to *reach the robot*, hitting wherever it has fallen to
    (the lower legs for a long flight). Letting it fall lower than the pelvis maximizes
    airtime for a flat ~2 m toss (~0.62 s vs ~0.48 s aiming at the pelvis). The flight time
    is capped so the ball can't fall to the ground before reaching the robot. It never
    rises (vz0=0), descending across the body -> camera-visible, not a lob.
    """
    robot: Entity = env.scene[robot_name]
    ball: Entity = env.scene[ball_name]
    device = env.device

    # --- Standing-dwell streak counter (per env). ---
    counter = getattr(env, _DODGE_DWELL_ATTR, None)
    if counter is None or counter.shape[0] != env.num_envs:
        counter = torch.zeros(env.num_envs, dtype=torch.long, device=device)
        setattr(env, _DODGE_DWELL_ATTR, counter)

    base_speed = torch.norm(robot.data.root_link_lin_vel_w[:, :2], dim=1)
    near_home = torch.ones(env.num_envs, dtype=torch.bool, device=device)
    if home_radius is not None:
        home_xy = env.scene.env_origins[:, :2]
        home_dist = torch.norm(robot.data.root_link_pos_w[:, :2] - home_xy, dim=1)
        near_home = home_dist < home_radius

    if throw_interval_range is not None:
        # TIMED throw (MimicKit-faithful): each env fires on a random 1-4 s countdown,
        # re-armed after every launch -- independent of where the previous ball landed and
        # of the robot's pose/position (MimicKit throws regardless; it leads the torso). This
        # is intermittent, NOT a continuous barrage: the robot gets a recovery window between
        # throws (the relentless rethrow-on-ground stream gave a from-scratch policy no room
        # to recover once the hit-termination was live). Seeded per env in reset_dodge_state.
        cd = getattr(env, _DODGE_THROW_CD_ATTR, None)
        if cd is None or cd.shape[0] != env.num_envs:
            cd = _sample_interval_steps(env, env.num_envs, throw_interval_range)
        cd = cd - 1
        fire = cd <= 0
        if fire.any():
            new = _sample_interval_steps(env, env.num_envs, throw_interval_range)
            cd = torch.where(fire, new, cd)
        setattr(env, _DODGE_THROW_CD_ATTR, cd)
    elif rethrow_ground_height is not None:
        # Rethrow when the previous ball has hit the ground: one ball at a time, re-thrown
        # the instant the last one lands. Firing repositions the ball up to its launch point
        # (airborne), so it can't re-fire until it lands again. The parked ball after reset
        # also sits below this height, so the first ball fires immediately.
        landed = ball.data.root_link_pos_w[:, 2] < rethrow_ground_height
        if require_feet_grounded:
            # TRAINING: also require the robot to be planted (both feet on the ground) so a
            # ball is never thrown while it is mid-leap (can't react). Dense -- a new ball
            # comes ~every flight (~0.5-0.6 s) instead of once per long standing dwell, so
            # the dodge_cbf reward fires on nearly every episode -- but it briefly waits for
            # the robot to land before relaunching. Replaces the sparse grounded-dwell trigger.
            feet: ContactSensor = env.scene[feet_sensor_name]
            contact_t = feet.data.current_contact_time  # [B, n_feet]
            assert contact_t is not None, (
                f"Sensor '{feet_sensor_name}' must have track_air_time=True for the trigger."
            )
            landed = landed & (contact_t > 0.0).all(dim=1)
        fire = landed & near_home
    elif min_move_speed is not None:
        # Throw-WHILE-MOVING (play): a robot settled in a dead stand is too slow to jump
        # (measured: standing-at-throw -> ~26% hit, moving-at-throw -> 0%). So instead of
        # waiting for it to settle, throw as it returns home *while still in motion*, so
        # it's already in locomotion mode and tracks the dodge command immediately. The
        # per-env counter is a re-arm cooldown. Fallback: if it has lingered near home
        # past 2x the cooldown (it settled), throw anyway so the demo can't stall.
        counter = counter + 1
        cooldown = max(1, round(cooldown_s / env.step_dt))
        moving = base_speed > min_move_speed
        fire = near_home & (
            ((counter >= cooldown) & moving) | (counter >= 2 * cooldown)
        )
    else:
        # Grounded-dwell trigger (training): throw once BOTH feet have been on the ground
        # continuously for dwell_time_s -- i.e. the robot is in a stable, planted stance
        # (not mid-leap), so it is actually able to react. Reading the feet<->ground contact
        # sensor (per-foot current_contact_time > 0 == that foot is planted) instead of the
        # old command~0 + base-settled definition: a leap lifts both feet -> contact_time
        # resets -> the counter resets, so a ball never fires while the robot is airborne.
        feet: ContactSensor = env.scene[feet_sensor_name]
        contact_t = feet.data.current_contact_time  # [B, n_feet]
        assert contact_t is not None, (
            f"Sensor '{feet_sensor_name}' must have track_air_time=True for the dwell trigger."
        )
        both_feet_grounded = (contact_t > 0.0).all(dim=1)
        standing = both_feet_grounded & near_home
        counter = torch.where(standing, counter + 1, torch.zeros_like(counter))
        dwell_steps = max(1, round(dwell_time_s / env.step_dt))
        fire = counter >= dwell_steps

    # --- Viewer controls (play only): a GUI can pause auto-throws or request a single throw. ---
    # ``_dodge_throw_paused`` suppresses ALL automatic firing; ``_dodge_throw_once`` forces one
    # throw at every env on the next step, then clears itself. Both are plain attrs the viser
    # viewer sets; absent in training, where the getattr defaults make this a no-op.
    force_high: bool | None = None  # viewer override of a manual throw's type
    if getattr(env, "_dodge_throw_paused", False):
        fire = torch.zeros_like(fire)
    if getattr(env, "_dodge_throw_once", False):
        fire = torch.ones_like(fire)
        env._dodge_throw_once = False
        # Optional per-throw type override from the viewer: True -> HIGH throw (low-arc rising
        # to torso/HEAD -- the "overhead" button), False -> LOW throw (~2 m descending across the
        # lower body -- the "underbody" button), None -> random mix.
        force_high = getattr(env, "_dodge_throw_force_high", None)
        env._dodge_throw_force_high = None

    # Never throw at the permanently-standing envs (rel_standing_envs): they are the
    # "clean stand" anchor -- commanded to hold still with NO ball, so the policy keeps a
    # ball-free standing/locomotion skill in the batch. is_standing_env is the same per-env
    # mask the command term zeroes the velocity for. Applied AFTER the manual _dodge_throw_once
    # override so a viewer-forced throw still fires everywhere in play (where stand ratio = 0).
    if skip_standing_envs:
        cmd_term = env.command_manager.get_term(command_name)
        standing_mask = getattr(cmd_term, "is_standing_env", None)
        if standing_mask is not None:
            fire = fire & ~standing_mask

    # Reset the counter for envs that just fired so a re-throw needs a fresh dwell/cooldown.
    counter = torch.where(fire, torch.zeros_like(counter), counter)
    setattr(env, _DODGE_DWELL_ATTR, counter)

    throw_ids = fire.nonzero(as_tuple=False).squeeze(-1)
    if len(throw_ids) == 0:
        return

    n = len(throw_ids)
    root_pos = robot.data.root_link_pos_w[throw_ids]  # fresh in step mode
    root_quat = robot.data.root_link_quat_w[throw_ids]  # (w, x, y, z)
    yq = yaw_quat(root_quat)  # yaw-only: maps body-frame xy -> world

    def _uniform(lo: float, hi: float) -> torch.Tensor:
        return torch.rand(n, device=device) * (hi - lo) + lo

    # --- Launch point in the robot's frontal cone (above the pelvis); target the PELVIS. ---
    dist = _uniform(*dist_range)
    if launch_speed_range is not None:
        # --- Omnidirectional fast throw: launch from a random bearing at dist_range and solve the
        # elevation that reaches the (led/jittered) aim point at a sampled SPEED. The aim model is
        # REUSED from the default path (robot xy + velocity lead + aim_noise); only the launch
        # bearing (full 360deg when omnidirectional), distance, and velocity model differ. The
        # target z spans the body (target_z_range) so throws threaten head->legs. Direct/flat arc. ---
        if omnidirectional:
            bearing = _uniform(-math.pi, math.pi)                          # world-frame 360deg
            off_xy = torch.stack([dist * torch.cos(bearing), dist * torch.sin(bearing)], dim=-1)
            start_xy = root_pos[:, 0:2] + off_xy
        else:
            bearing = _uniform(-angle_deg, angle_deg) * (math.pi / 180.0)  # heading-relative cone
            offset_b = torch.stack([dist, dist * torch.tan(bearing), torch.zeros_like(dist)], dim=-1)
            start_xy = root_pos[:, 0:2] + quat_apply(yq, offset_b)[:, 0:2]
        start = torch.empty(n, 3, device=device)
        start[:, 0:2] = start_xy
        start[:, 2] = _uniform(*height_range)                            # release height
        speed = _uniform(*launch_speed_range)                            # (n,) fixed launch speed
        target_xy = root_pos[:, 0:2].clone()
        if lead_target:                                                  # lead ~ straight-line time
            t_lead = (dist / speed).unsqueeze(-1)
            target_xy = target_xy + robot.data.root_link_lin_vel_w[throw_ids, :2] * t_lead
        if aim_noise_scale > 0.0:
            target_xy = target_xy + aim_noise_scale * torch.randn_like(target_xy)
        target = torch.cat([target_xy, _uniform(*target_z_range).unsqueeze(-1)], dim=-1)
        vel = solve_ballistic_velocity(start, target, speed, gravity=gravity)
        quat_identity = torch.zeros(n, 4, device=device)
        quat_identity[:, 0] = 1.0
        ball.write_root_link_pose_to_sim(
            torch.cat([start, quat_identity], dim=-1), env_ids=throw_ids
        )
        root_vel = torch.zeros(n, 6, device=device)
        root_vel[:, 0:3] = vel
        ball.write_root_link_velocity_to_sim(root_vel, env_ids=throw_ids)
        return
    angle = _uniform(-angle_deg, angle_deg) * (math.pi / 180.0)
    lateral = dist * torch.tan(angle)  # +y = robot's left
    offset_b = torch.stack([dist, lateral, torch.zeros_like(dist)], dim=-1)
    offset_w = quat_apply(yq, offset_b)
    # --- Per-throw TYPE: mix two threats so the policy must both sidestep AND duck. ---
    # * LOW-ARC (high_throw_fraction): launched LOW (high_launch_height_range, ~waist) with an
    #   UPWARD velocity so it arcs up and arrives at TORSO/HEAD height (high_target_z_range) just
    #   as it reaches the robot -- a ball you must DUCK under (now that the prior has ducking).
    # * DESCENDING (the rest): launched high (height_range, ~2 m), pure horizontal (vz0=0),
    #   hitting wherever it has fallen to (lower body) -- a ball you sidestep / lift a leg over.
    if force_high is None:
        high = torch.rand(n, device=device) < high_throw_fraction
    else:
        high = torch.full((n,), bool(force_high), dtype=torch.bool, device=device)
    start = torch.empty(n, 3, device=device)
    start[:, 0:2] = root_pos[:, 0:2] + offset_w[:, 0:2]
    start[:, 2] = torch.where(high, _uniform(*high_launch_height_range), _uniform(*height_range))

    # Reaction window (flight time). DESCENDING throws cap it so the ball can't fall below
    # ~0.05 m before reaching the robot (else it lands short); LOW-ARC throws rise then fall, so
    # they use the full requested window (no ground cap -- they're well above ground at arrival).
    t_req = _uniform(*flight_time_range)
    t_max = torch.sqrt(2.0 * (start[:, 2] - 0.05).clamp(min=1e-3) / gravity)
    t_flight = torch.where(high, t_req, torch.minimum(t_req, t_max))

    # Aim point: the robot's xy, optionally LED by its current xy velocity (intercept where
    # it is heading, not where it was -- else a robot moving in a straight line walks out of
    # a throw aimed at its old position for free), then jittered by aim_noise so the throw
    # is not a perfect dead-on intercept every time (diversifies the threat geometry; from
    # MimicKit's dodgeball). Only the AIM shifts -- the launch point (start) stays in the
    # frontal cone, so the ball still comes from the front (camera-visible).
    target_xy = root_pos[:, 0:2].clone()
    if lead_target:
        root_vel_xy = robot.data.root_link_lin_vel_w[throw_ids, :2]
        target_xy = target_xy + root_vel_xy * t_flight.unsqueeze(-1)
    if aim_noise_scale > 0.0:
        target_xy = target_xy + aim_noise_scale * torch.randn_like(target_xy)

    # Optional deterministic lateral aim offset (body-frame (forward, left) metres), set by a
    # viewer/recorder to aim the throw off-center and induce a SIDEWAYS dodge. No-op when unset
    # (training / normal play). +y = the robot's left.
    aim_off_b = getattr(env, "_dodge_throw_aim_offset_b", None)
    if aim_off_b is not None:
        off_b = torch.tensor(
            [float(aim_off_b[0]), float(aim_off_b[1]), 0.0], device=device
        ).expand(n, 3)
        target_xy = target_xy + quat_apply(yq, off_b)[:, 0:2]

    disp_xy = target_xy - start[:, 0:2]  # reach the (led, jittered) aim point's xy
    vel = torch.zeros(n, 3, device=device)
    vel[:, 0] = disp_xy[:, 0] / t_flight
    vel[:, 1] = disp_xy[:, 1] / t_flight
    # LOW-ARC throws: pick vz0 so the parabola z0 + vz0*t - 0.5*g*t^2 lands on a torso/head
    # target height at arrival t_flight -> vz0 = (z_tgt - z0)/t + 0.5*g*t (always > 0 here since
    # z0 < z_tgt). DESCENDING throws keep vz0 = 0. The ball rises through early flight (visible
    # to the head cameras coming up from below) and peaks ~head height as it reaches the robot.
    z_target = _uniform(*high_target_z_range)
    vz_high = (z_target - start[:, 2]) / t_flight + 0.5 * gravity * t_flight
    vel[:, 2] = torch.where(high, vz_high, torch.zeros_like(vz_high))

    quat_identity = torch.zeros(n, 4, device=device)
    quat_identity[:, 0] = 1.0
    ball.write_root_link_pose_to_sim(
        torch.cat([start, quat_identity], dim=-1), env_ids=throw_ids
    )
    root_vel = torch.zeros(n, 6, device=device)
    root_vel[:, 0:3] = vel
    ball.write_root_link_velocity_to_sim(root_vel, env_ids=throw_ids)


# ------------------------------------------------------------------
# Camera-pitch oracle: auto-aim gimbal at the ball (CAMERA_GIMBAL=1)
# ------------------------------------------------------------------

def optimal_camera_pitch(
    env: "ManagerBasedRlEnv",
    robot,
    ball,
    *,
    z_margin: float = 0.05,
    min_ball_speed: float = 0.5,
    sense_radius: float = 4.0,
) -> tuple[torch.Tensor, torch.Tensor]:
    """Return ``(target_pitch (N,), threat (N,) bool)`` for the gimbal camera.

    ``target_pitch`` is the UNMASKED clamped pitch angle in radians:
    ``(-elev).clamp(±30°)`` where ``elev`` is the ball's elevation in the
    torso frame (the gimbal's parent frame).  The caller decides gating:
    the oracle event uses ``where(threat, target_pitch, 0)``; the aim reward
    may apply its own sigma-scaled expression.

    ``threat`` is True when the ball is simultaneously:
      * airborne  -- ``z > ball_radius + z_margin`` (excludes a resting ball
        whose centre sits at ``z = ball_radius``);
      * moving    -- ``speed > min_ball_speed``;
      * closing   -- velocity component toward the robot base is positive;
      * in-range  -- distance from the camera body ``< sense_radius``.

    Caches ``_gimbal_ids`` on *env* (joint id, camera-body id, ball geom id,
    torso-body id) after the first call, identical to the previous monolithic
    ``aim_camera_at_ball`` implementation.
    """
    # Cache the gimbal joint-id, gimbal body-id, ball collision-geom id, and the gimbal's parent
    # (torso) body-id on the env after the first call.
    if not hasattr(env, "_gimbal_ids"):
        jid, _ = robot.find_joints("camera_pitch_joint")
        bid, _ = robot.find_bodies("camera_pitch_link")
        tid, _ = robot.find_bodies("torso_link")
        # Reverse-look-up the ball's scene key so we can form the MuJoCo geom name
        # "ball_name/ball_collision".  This identity search is done only once (cached below).
        ball_scene_name = next(
            k for k, v in env.scene.entities.items() if v is ball
        )
        ball_geom_id = env.sim.mj_model.geom(f"{ball_scene_name}/ball_collision").id
        env._gimbal_ids = (
            torch.tensor(jid, device=env.device), int(bid[0]), int(ball_geom_id), int(tid[0])
        )
    jid, bid, ball_geom_id, tid = env._gimbal_ids

    # Camera / gimbal body world position (N, 3).
    cam = robot.data.body_link_pos_w[:, bid, :]
    bp = ball.data.root_link_pos_w          # ball world pos  (N, 3)
    bv = ball.data.root_link_lin_vel_w      # ball velocity   (N, 3)
    rp = robot.data.root_link_pos_w         # robot base pos  (N, 3)

    # Vector from camera to ball, expressed in the TORSO frame (the gimbal's parent). The joint
    # pitches about torso +Y and the camera neutral (joint=0) looks along torso +X, so the ball's
    # elevation must be measured in the torso frame -- this is exact regardless of torso pitch
    # (a world-frame angle would be wrong whenever the robot leans/ducks, exactly when it matters).
    torso_quat = robot.data.body_link_quat_w[:, tid, :]      # (N, 4)
    d_torso = quat_apply_inverse(torso_quat, bp - cam)       # (N, 3) cam->ball in torso frame
    horiz = torch.linalg.norm(d_torso[:, :2], dim=-1).clamp(min=1e-6)

    # Elevation of the ball in the torso frame: >0 above, <0 below. The joint's +Y rotation pitches
    # the camera DOWN for a POSITIVE angle (verified by directly setting the joint: +0.4 rad ->
    # optical axis z -0.58), so the joint target is the NEGATED elevation: ball above -> negative
    # joint (look up), ball below -> positive joint (look down).
    elev = torch.atan2(d_torso[:, 2], horiz)
    target_pitch = (-elev).clamp(-math.radians(30), math.radians(30))

    # Threat gate: ball is airborne, moving, closing, and nearby.
    # "Airborne" is radius-relative: a ball resting on the floor has its centre at
    # z = ball_radius, so require z > ball_radius + z_margin (>= z_margin clear of the ground) --
    # an absolute z floor below ~radius (0.076 m) would never exclude a grounded ball.
    ball_r = env.sim.model.geom_size[:, ball_geom_id, 0]  # (N,) per-env (randomized) ball radius
    speed = torch.linalg.norm(bv, dim=-1)
    closing = ((rp - bp) * bv).sum(-1) > 0.0
    in_range = torch.linalg.norm(d_torso, dim=-1) < sense_radius  # norm is frame-invariant
    threat = (bp[:, 2] > ball_r + z_margin) & (speed > min_ball_speed) & closing & in_range

    return target_pitch, threat


def aim_camera_at_ball(
    env: "ManagerBasedRlEnv",
    env_ids: torch.Tensor | None,
    robot_name: str = "robot",
    ball_name: str = "ball",
    z_margin: float = 0.05,
    min_ball_speed: float = 0.5,
    sense_radius: float = 4.0,
) -> None:
    """Per-step oracle: pitch ``camera_pitch_joint`` to point the camera at the ball.

    Uses privileged ball state (position + velocity) to compute the world-frame pitch angle
    from the gimbal body to the ball, then sets that as the joint position target. Returns to
    level (0 rad) when no airborne+closing ball is within ``sense_radius``. Clamped to
    ±30 deg (0.5236 rad) by the actuator/joint limits.

    Registered as ``mode="step"`` so it runs every step (the event manager passes
    ``env_ids=None`` for step-mode calls; we act on all envs every step).

    Threat gate (drives the tilt AND "is there a threat"): ball is airborne -- radius-relative,
    z > ball_radius + z_margin, so a ball resting on the floor (center at z=ball_radius) is excluded
    -- moving (speed > min_ball_speed), closing toward the robot, and within sense_radius.

    The torso-pitch correction (joint target is relative to the torso, not the world) is
    omitted for Stage-1: for the upright in-place stand the torso barely pitches, so
    world-pitch is a fine approximation. Refine here if eval shows aim error.

    Thin wrapper around :func:`optimal_camera_pitch`. All angle/threat math lives there.
    """
    robot = env.scene[robot_name]
    ball = env.scene[ball_name]

    target_pitch, threat = optimal_camera_pitch(
        env, robot, ball,
        z_margin=z_margin,
        min_ball_speed=min_ball_speed,
        sense_radius=sense_radius,
    )

    # Level (0) when no threat; desired pitch otherwise.
    target = torch.where(threat, target_pitch, torch.zeros_like(target_pitch))

    jid = env._gimbal_ids[0]
    robot.set_joint_position_target(target.unsqueeze(-1), joint_ids=jid)
