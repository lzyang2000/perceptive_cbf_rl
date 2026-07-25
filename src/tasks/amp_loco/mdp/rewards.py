from __future__ import annotations

from typing import TYPE_CHECKING

import mujoco
import torch

from mjlab.entity import Entity
from mjlab.managers.reward_manager import RewardTermCfg
from mjlab.managers.scene_entity_config import SceneEntityCfg
from mjlab.sensor import BuiltinSensor, ContactSensor
from mjlab.utils.lab_api.math import (
  quat_apply_inverse, 
  yaw_quat, 
  quat_apply
)
from mjlab.utils.lab_api.string import (
  resolve_matching_names_values,
)

if TYPE_CHECKING:
  from mjlab.envs import ManagerBasedRlEnv


_DEFAULT_ASSET_CFG = SceneEntityCfg("robot")


def airborne(env, ball_z: torch.Tensor, ball_name: str = "ball", margin: float = 0.05) -> torch.Tensor:
  """Radius-relative 'ball is airborne' test (shared by all threat gates).

  A ball resting on the floor has its center at z = ball_radius (it can't go underground), so an
  absolute z floor (the old 0.25/0.3) excluded genuine LOW incoming balls (center 0.13-0.25 m, a ball
  a few cm off the ground heading at the shins/feet). This returns z > ball_radius + margin instead --
  off the ground by ``margin`` -- which includes low incoming balls and still excludes grounded ones
  (which are also caught by the speed/closing terms each gate ANDs in). Per-env ball radius (the ball
  is size-randomized); the collision-geom id is cached on the env."""
  if not hasattr(env, "_airborne_ball_geom_id"):
    env._airborne_ball_geom_id = env.sim.mj_model.geom(f"{ball_name}/ball_collision").id
  r = env.sim.model.geom_size[:, env._airborne_ball_geom_id, 0]  # (N,) per-env radius
  return ball_z > r + margin


def _get_delay_env_mask(env: ManagerBasedRlEnv) -> torch.Tensor | None:
  """Get delaying env mask from DelayedTerminationManager if installed."""
  tm = env.termination_manager
  delay_env_mask = getattr(tm, "_delay_env_mask", None)
  delay_counters = getattr(tm, "_delay_counters", None)
  if isinstance(delay_env_mask, torch.Tensor) and isinstance(delay_counters, torch.Tensor):
    return delay_env_mask & (delay_counters > 0)
  return None


def _apply_delay_env_reward_scaling(
  env: ManagerBasedRlEnv,
  reward: torch.Tensor,
  mask_delay: bool,
  delay_env_rew_ratio: float,
) -> torch.Tensor:
  if not mask_delay:
    return reward

  delay_env_mask = _get_delay_env_mask(env)
  if delay_env_mask is None:
    return reward

  scaled_reward = reward * delay_env_rew_ratio
  return torch.where(delay_env_mask, scaled_reward, reward)


def _apply_delay_env_reward_mask_only(
  env: ManagerBasedRlEnv,
  reward: torch.Tensor,
  mask_delay: bool,
  delay_env_rew_ratio: float,
) -> torch.Tensor:
  if not mask_delay:
    return torch.zeros_like(reward)

  delay_env_mask = _get_delay_env_mask(env)
  if delay_env_mask is None:
    return torch.zeros_like(reward)

  scaled_reward = reward * delay_env_rew_ratio
  masked_reward = torch.where(delay_env_mask, scaled_reward, torch.zeros_like(reward))
  return masked_reward

def track_anchor_linear_velocity(
  env: ManagerBasedRlEnv,
  std: float,
  command_name: str,
  mask_delay: bool = False,
  delay_env_rew_ratio: float = 1.0,
  asset_cfg: SceneEntityCfg = _DEFAULT_ASSET_CFG,
  anchor_cfg: SceneEntityCfg = SceneEntityCfg("robot", body_names=()),
  track_dodge_safe: bool = False,
  mask_inplace: bool = False,
) -> torch.Tensor:
  """Reward for tracking the commanded anchor linear velocity.

  The commanded z velocity is assumed to be zero.

  ``track_dodge_safe`` (dodge tasks): track the CBF-FILTERED ("safe") velocity command
  instead of the observed (nominal) one. The ``DodgeGoToGoalCommand`` stashes the safe
  command in world frame (``_dodge_u_safe_w``); when no ball threatens it equals the
  nominal command, so locomotion is unchanged, and when a ball is incoming it includes the
  perpendicular sidestep -- so this single dense reward directly rewards the dodge. Crucially
  the policy still *observes* only the nominal command (CBF-RL mode, ``cbf_filter_command=
  False``), so it must infer the sidestep from depth; it is not handed the answer. Avoids the
  opposing-gradient tension of tracking nominal while ``dodge_cbf`` rewards deviating from it.

  ``mask_inplace``: zero this reward for the in-place-throw envs (``command.is_inplace_env``).
  Those envs are commanded ZERO velocity but ARE pelted (dodge-from-a-standstill); when this
  reward tracks the NOMINAL command (``track_dodge_safe=False``, the MimicKit dodge tasks), a
  zero command would reward stillness and fight the sidestep -- so we drop the term for them and
  let the dodge reward + hit termination drive evasion. No-op under ``track_dodge_safe`` (there
  the target already includes the sidestep, so masking would delete the dodge signal).
  """
  asset: Entity = env.scene[asset_cfg.name]

  if track_dodge_safe:
    # Safe command is already world-frame xy (stashed by DodgeGoToGoalCommand each step).
    cmd_term = env.command_manager.get_term(command_name)
    u_safe_w = cmd_term._dodge_u_safe_w  # (N, 2)
    command_xyz_w = torch.cat((u_safe_w, torch.zeros_like(u_safe_w[:, :1])), dim=-1)
  else:
    command = env.command_manager.get_command(command_name)
    assert command is not None, f"Command '{command_name}' not found."
    command_xyz_b = torch.cat((command[:, :2], torch.zeros_like(command[:, :1])), dim=-1)
    command_xyz_w = quat_apply(
      yaw_quat(asset.data.body_link_quat_w[:, anchor_cfg.body_ids[0]]),
      command_xyz_b,
    )
  lin_vel_error = torch.sum(torch.square(command_xyz_w[:,:3] - asset.data.body_link_lin_vel_w[:, anchor_cfg.body_ids[0], :3]), dim=1)
  reward = torch.exp(-lin_vel_error / std**2)
  if mask_inplace and not track_dodge_safe:
    # In-place-throw envs: zero command but pelted -> don't reward stillness (it fights the dodge).
    cmd_term = env.command_manager.get_term(command_name)
    inplace = getattr(cmd_term, "is_inplace_env", None)
    if inplace is not None:
      reward = torch.where(inplace, torch.zeros_like(reward), reward)
  return _apply_delay_env_reward_scaling(env, reward, mask_delay, delay_env_rew_ratio)


def track_anchor_angular_velocity(
  env: ManagerBasedRlEnv,
  std: float,
  command_name: str,
  mask_delay: bool = False,
  delay_env_rew_ratio: float = 1.0,
  asset_cfg: SceneEntityCfg = _DEFAULT_ASSET_CFG,
  anchor_cfg: SceneEntityCfg = SceneEntityCfg("robot", body_names=()),
) -> torch.Tensor:
  """Reward heading error for heading-controlled envs, angular velocity for others.

  The commanded xy angular velocities are assumed to be zero.
  """
  asset: Entity = env.scene[asset_cfg.name]
  command = env.command_manager.get_command(command_name)
  assert command is not None, f"Command '{command_name}' not found."

  anchor_ang_vel_w = asset.data.body_link_ang_vel_w[:, anchor_cfg.body_ids[0]]
  anchor_ang_z_vel_w = anchor_ang_vel_w[:, 2]
  command_ang_vel_w = command[:, 2]
  ang_vel_z_error = torch.square(command_ang_vel_w - anchor_ang_z_vel_w)

  anchor_ang_vel_b =  quat_apply_inverse(
    asset.data.body_link_quat_w[:, anchor_cfg.body_ids[0]],
    anchor_ang_vel_w,
  )
  ang_vel_xy_error = torch.sum(torch.square(anchor_ang_vel_b[:, :2]), dim=-1)

  total_error = ang_vel_z_error + ang_vel_xy_error

  reward = torch.exp(-total_error / std**2)
  return _apply_delay_env_reward_scaling(env, reward, mask_delay, delay_env_rew_ratio)

def body_ang_vel_xy_l2(
  env: ManagerBasedRlEnv,
  std: float,
  mask_delay: bool = False,
  delay_env_rew_ratio: float = 1.0,
  body_cfg: SceneEntityCfg = SceneEntityCfg("robot", body_names=()),
) -> torch.Tensor:
  """Reward heading error for heading-controlled envs, angular velocity for others.

  The commanded xy angular velocities are assumed to be zero.
  """
  asset: Entity = env.scene[body_cfg.name]
  body_ang_vel_w = asset.data.body_link_ang_vel_w[:, body_cfg.body_ids[0]]
  body_ang_vel_b = quat_apply_inverse(
    asset.data.body_link_quat_w[:, body_cfg.body_ids[0]],
    body_ang_vel_w,
  )
  body_ang_vel_xy_b = body_ang_vel_b[:, :2]
  ang_vel_xy_error = torch.sum(torch.square(body_ang_vel_xy_b), dim=-1)

  reward = torch.exp(-ang_vel_xy_error / std**2)
  return _apply_delay_env_reward_scaling(env, reward, mask_delay, delay_env_rew_ratio)

def track_root_height(
  env: ManagerBasedRlEnv,
  std: float,
  mask_delay: bool = False,
  delay_env_rew_ratio: float = 1.0,
  asset_cfg: SceneEntityCfg = _DEFAULT_ASSET_CFG,
) -> torch.Tensor:
  """Reward for tracking the commanded anchor height."""
  asset: Entity = env.scene[asset_cfg.name]

  desired_height = asset.data.default_root_state[:, 2]
  cur_root_height = asset.data.body_link_pos_w[:, 0, 2]
  height_error = torch.square(desired_height - cur_root_height)
  reward = torch.exp(-height_error / std**2)
  return _apply_delay_env_reward_mask_only(env, reward, mask_delay, delay_env_rew_ratio)

def feet_slip(
  env: ManagerBasedRlEnv,
  sensor_name: str,
  command_name: str,
  command_threshold: float = 0.01,
  asset_cfg: SceneEntityCfg = _DEFAULT_ASSET_CFG,
) -> torch.Tensor:
  """Penalize foot sliding (xy velocity while in contact)."""
  asset: Entity = env.scene[asset_cfg.name]
  contact_sensor: ContactSensor = env.scene[sensor_name]
  command = env.command_manager.get_command(command_name)
  assert command is not None
  linear_norm = torch.norm(command[:, :2], dim=1)
  angular_norm = torch.abs(command[:, 2])
  total_command = linear_norm + angular_norm
  active = (total_command > command_threshold).float()
  assert contact_sensor.data.found is not None
  in_contact = (contact_sensor.data.found > 0).float()  # [B, N]
  foot_vel_xy = asset.data.site_lin_vel_w[:, asset_cfg.site_ids, :2]  # [B, N, 2]
  vel_xy_norm = torch.norm(foot_vel_xy, dim=-1)  # [B, N]
  vel_xy_norm_sq = torch.square(vel_xy_norm)  # [B, N]
  cost = torch.sum(vel_xy_norm_sq * in_contact, dim=1) * active
  num_in_contact = torch.sum(in_contact)
  mean_slip_vel = torch.sum(vel_xy_norm * in_contact) / torch.clamp(
    num_in_contact, min=1
  )
  env.extras["log"]["Metrics/slip_velocity_mean"] = mean_slip_vel
  return cost

def soft_landing(
  env: ManagerBasedRlEnv,
  sensor_name: str,
  command_name: str | None = None,
  command_threshold: float = 0.05,
) -> torch.Tensor:
  """Penalize high impact forces at landing to encourage soft footfalls."""
  contact_sensor: ContactSensor = env.scene[sensor_name]
  sensor_data = contact_sensor.data
  assert sensor_data.force is not None
  forces = sensor_data.force  # [B, N, 3]
  force_magnitude = torch.norm(forces, dim=-1)  # [B, N]
  first_contact = contact_sensor.compute_first_contact(dt=env.step_dt)  # [B, N]
  landing_impact = force_magnitude * first_contact.float()  # [B, N]
  cost = torch.sum(landing_impact, dim=1)  # [B]
  num_landings = torch.sum(first_contact.float())
  mean_landing_force = torch.sum(landing_impact) / torch.clamp(num_landings, min=1)
  env.extras["log"]["Metrics/landing_force_mean"] = mean_landing_force
  if command_name is not None:
    command = env.command_manager.get_command(command_name)
    if command is not None:
      linear_norm = torch.norm(command[:, :2], dim=1)
      angular_norm = torch.abs(command[:, 2])
      total_command = linear_norm + angular_norm
      active = (total_command > command_threshold).float()
      cost = cost * active
  return cost

def leap_flight_time(
  env: ManagerBasedRlEnv,
  sensor_name: str,
  command_name: str,
  min_flight_s: float = 0.05,
  command_threshold: float = 0.1,
) -> torch.Tensor:
  """Reward a genuine both-feet-airborne flight phase (the signature of a leap).

  Uses the **minimum** of the two feet's current air time: it is > 0 only when *both*
  feet are simultaneously off the ground, so walking/scraping (always >=1 foot in
  contact) scores exactly 0 and cannot game this term. ``min_flight_s`` clamps away
  sub-threshold contact flicker / micro-bounces; it is set below the reference clips'
  measured flight phases (~0.1-0.28 s, median ~0.15-0.22 s) so real leaps still pay.
  Gated on an active velocity command so it does not reward hopping in place while
  standing or already arrived at the goal. AMP shapes *how* the leap looks; this only
  supplies the coarse "leave the ground" gradient the discriminator is too weak to give.
  """
  sensor: ContactSensor = env.scene[sensor_name]
  air_time = sensor.data.current_air_time  # [B, N_feet]
  assert air_time is not None, (
    f"Sensor '{sensor_name}' must have track_air_time=True for leap_flight_time."
  )
  flight_t = air_time.min(dim=1).values  # > 0 only when BOTH feet are airborne
  reward = (flight_t - min_flight_s).clamp(min=0.0)

  command = env.command_manager.get_command(command_name)
  active = (torch.norm(command[:, :2], dim=1) > command_threshold).float()

  env.extras["log"]["Metrics/flight_time_mean"] = flight_t.mean()
  return reward * active

def goal_distance_reward(
  env: ManagerBasedRlEnv,
  command_name: str,
  std: float = 1.0,
) -> torch.Tensor:
  """Dense reward for being close to the goal point.

  Reads the goal/distance from a ``GoToGoalCommand`` term (the goal itself never
  enters the observation). ``exp(-d^2/std^2)`` peaks at 1 when the robot is on the goal.
  """
  command = env.command_manager.get_term(command_name)
  dist = command.distance_to_goal
  return torch.exp(-torch.square(dist) / std**2)


def goal_progress_reward(
  env: ManagerBasedRlEnv,
  command_name: str,
  clip: float = 2.0,
) -> torch.Tensor:
  """Reward for closing distance to the goal this step (potential-based shaping).

  Returns the per-step distance reduction expressed as a closing speed (m/s):
  ``(prev_dist - cur_dist) / dt``. Unlike ``goal_distance_reward`` (which is ~flat far
  from the goal), this gives a useful gradient at any distance. It is symmetric
  (moving away is penalized) so it stays close to policy-invariant shaping; clipped to
  +/-``clip`` m/s to reject spikes. Resampled envs report ~0 (the command zeroes the
  delta on a goal change).
  """
  command = env.command_manager.get_term(command_name)
  closing_speed = command.distance_delta / env.step_dt
  return closing_speed.clamp(-clip, clip)


def goal_reached_bonus(
  env: ManagerBasedRlEnv,
  command_name: str,
  threshold: float = 0.25,
  speed_threshold: float = 0.5,
  asset_cfg: SceneEntityCfg = _DEFAULT_ASSET_CFG,
) -> torch.Tensor:
  """Sparse bonus for being at the goal *and* nearly stopped.

  Coupling arrival with low speed is what makes goal-reaching non-trivial under the
  decaying velocity command: the policy must actively settle at the target rather than
  pass through it.
  """
  asset: Entity = env.scene[asset_cfg.name]
  command = env.command_manager.get_term(command_name)
  dist = command.distance_to_goal
  speed = torch.norm(asset.data.root_link_lin_vel_b[:, :2], dim=-1)
  return ((dist < threshold) & (speed < speed_threshold)).float()


def stop_at_goal_cost(
  env: ManagerBasedRlEnv,
  command_name: str,
  threshold: float = 0.5,
  asset_cfg: SceneEntityCfg = _DEFAULT_ASSET_CFG,
) -> torch.Tensor:
  """Penalize residual base speed once inside the goal region (encourages stopping)."""
  asset: Entity = env.scene[asset_cfg.name]
  command = env.command_manager.get_term(command_name)
  dist = command.distance_to_goal
  speed = torch.norm(asset.data.root_link_lin_vel_b[:, :2], dim=-1)
  return speed * (dist < threshold).float()


def is_terminated_except(
  env: ManagerBasedRlEnv,
  exclude_terms: tuple[str, ...] = (),
) -> torch.Tensor:
  """`is_terminated` (penalize non-timeout terminations) but EXCLUDING some term names.

  Used so a ball hit can *terminate the episode without a reward penalty* -- matching the
  SMP/MimicKit dodgeball setup (arXiv:2512.03028 §7: "if the character is hit, the episode
  terminates early and the agent receives zero reward for all remaining timesteps as a
  penalty"), i.e. the cost of a hit is the lost future reward from ending the episode, NOT a
  large negative spike. The -200 is_terminated penalty is kept for genuine falls
  (bad_orientation / bad_base_height / collapsed_crouch) but not for ``ball_hit``; otherwise
  every (initially unavoidable) hit floods the gradient and the policy trades away its leap
  style to avoid the spike.
  """
  tm = env.termination_manager
  terminated = tm.terminated.clone()
  for name in exclude_terms:
    if name in tm.active_terms:
      terminated = terminated & ~tm.get_term(name)
  return terminated.float()


def dodge_cbf_reward(
  env: ManagerBasedRlEnv,
  command_name: str,
  sigma: float = 0.5,
  constraint_clip: float = 2.0,
  include_imitation: bool = True,
) -> torch.Tensor:
  """CBF-RL safety reward: teach the policy to dodge from the control-barrier function.

  Implements the per-step ``r_cbf`` of CBF-RL (Yang et al., arXiv:2510.14959, Eqs. 22-23)
  for the ball-dodge barrier, using the quantities the ``DodgeGoToGoalCommand`` already
  computes from ``cbf.predictive_dodge_filter`` each step. With the command's
  ``cbf_filter_command=False`` the CBF does NOT override the velocity command; instead this
  reward supplies the supervision so the policy *learns* to produce the evasive motion
  itself (from the depth observation), and the filter can later be dropped at deploy.

      r_cbf = min( dh/dt + alpha*h , 0 )  +  ( exp(-||v - v_safe||^2 / sigma^2) - 1 )

  per the two CBF-RL terms:

  * **Safety-value / constraint term** ``min(v . e + alpha*h, 0)``: ``e`` is the barrier
    gradient w.r.t. the base velocity (the escape axis), so ``v . e = dh/dt`` (the ball's
    velocity is perpendicular to ``e``). The CBF condition is ``dh/dt >= -alpha*h``; this
    term is 0 when satisfied and negative by the amount of violation -- it penalizes the
    robot's *own motion* for not getting out of the ball's path fast enough. Clipped to
    ``[-constraint_clip, 0]`` so an unbounded closing velocity can't dominate.
  * **Imitation term** ``exp(-||v - v_safe||^2/sigma^2) - 1`` (in ``[-1, 0]``): rewards the
    achieved base velocity ``v`` for matching the CBF-safe command ``v_safe`` ("what the
    robot should do"). ``sigma`` sets how tightly it must match.

  Both use the robot's actual world-frame base velocity ``v`` and are GATED on a live
  threat (a ball airborne + approaching), so there is no signal when nothing is incoming.
  The term is <= 0; scale it with the ``RewardTermCfg.weight`` (the paper's ``w``). The
  velocity-tracking reward keeps the nominal locomotion behavior; this term overrides it
  locally while a ball threatens, exactly the CBF-RL task/safety trade-off.
  """
  command = env.command_manager.get_term(command_name)
  threat = command._dodge_threat  # (N,) bool
  e = command._dodge_e_w  # (N, 2) world escape dir == d h / d v
  h = command._dodge_h  # (N,)
  v_safe = command._dodge_u_safe_w  # (N, 2) world CBF-safe command (clamped)
  alpha = command.cfg.cbf_alpha

  v = command.robot.data.root_link_lin_vel_w[:, :2]  # actual world xy base velocity

  # Safety-value term: min(dh/dt + alpha*h, 0), dh/dt = v . e.
  h_dot = (v * e).sum(dim=-1)
  constraint = (h_dot + alpha * h).clamp(min=-constraint_clip, max=0.0)
  r = constraint
  # Imitation term: Gaussian on velocity match to the safe action, in [-1, 0]. Disable
  # (include_imitation=False) when the velocity-tracking reward already targets the safe
  # command (track_anchor_linear_velocity(track_dodge_safe=True)) -- the two would otherwise
  # double-reward matching u_safe. Then this term is the pure CBF safety-value (constraint).
  if include_imitation:
    r = r + (torch.exp(-torch.square(v - v_safe).sum(dim=-1) / sigma**2) - 1.0)
  return torch.where(threat, r, torch.zeros_like(r))


def dodge_link_cbf_reward(
  env: ManagerBasedRlEnv,
  robot_name: str = "robot",
  ball_name: str = "ball",
  alpha: float = 2.0,
  margin: float = 0.05,
  constraint_clip: float = 2.0,
  z_active: float = 0.25,
  min_ball_speed: float = 0.5,
  reduce: str = "min",
  danger_band: float | None = None,
) -> torch.Tensor:
  """Per-link full-body control-barrier dodge reward (<= 0; scale with ``RewardTermCfg.weight``).

  The 3-D, per-link generalization of :func:`dodge_cbf_reward` (which is a lossy 2-D base-velocity
  barrier). For every robot link we form a clearance
  ``h = ||p_ball - p_link|| - (r_ball + r_link)`` (LINEAR, with the per-env true ball radius + the
  link's collision cross-section radius + ``margin``), its closing rate ``h_dot`` from the relative
  ball<->link velocity, and the discrete-time CBF constraint ``min(h_dot + alpha*h, 0)`` -- 0 when
  the link is safely clearing, negative by the violation. ``reduce`` combines the per-link
  constraints: ``"min"`` charges only the single most-binding link (whack-a-mole -- the next link
  becomes binding once the worst is cleared); ``"sum"`` charges ALL violating links at once (gradient
  to clear several threatened limbs simultaneously, e.g. an arm AND a knee); ``"mean"`` is the
  per-link average. Then it gates on a live threat (ball airborne + moving).

  Being **zero when safe**, it leaves the nominal MimicKit stand/settle behavior (the kept
  ``mimickit_dodge_reward``, which only sees the pelvis) untouched and only penalizes leaving a
  *limb* in the ball's path -- the residual-hit failure mode (arms/feet) the root-only reward can't
  see. The ``alpha*h`` (class-K) term makes the penalty ramp up over the final approach, not just at
  contact, so the signal is dense/learnable; ``constraint_clip`` caps it so it can't behave like a
  hard terminal penalty. Privileged (uses ground-truth positions); the actor still sees only depth.
  """
  robot: Entity = env.scene[robot_name]
  ball: Entity = env.scene[ball_name]

  # Cache (once) the static per-link safety radii and the ball geom id. Link radii are env-invariant
  # (only the ball is size-randomized): for each robot body take the max cross-section radius over
  # its round (sphere/capsule/cylinder) collision geoms, default 0.05 m if none, then add `margin`.
  if not hasattr(env, "_dodge_link_radii"):
    mjm = env.sim.mj_model
    round_types = {
      int(mujoco.mjtGeom.mjGEOM_SPHERE),
      int(mujoco.mjtGeom.mjGEOM_CAPSULE),
      int(mujoco.mjtGeom.mjGEOM_CYLINDER),
    }
    body_r: dict[int, float] = {}
    for g in range(mjm.ngeom):
      if int(mjm.geom_type[g]) in round_types:
        b = int(mjm.geom_bodyid[g])
        body_r[b] = max(body_r.get(b, 0.0), float(mjm.geom_size[g, 0]))
    body_ids = robot.indexing.body_ids.tolist()
    radii = [body_r.get(int(b), 0.05) for b in body_ids]
    env._dodge_link_radii = torch.tensor(  # type: ignore[attr-defined]
      radii, device=env.device, dtype=torch.float32
    ) + margin  # (L,)
    env._dodge_ball_geom_id = int(  # type: ignore[attr-defined]
      mjm.geom(f"{ball_name}/ball_collision").id
    )

  r_link = env._dodge_link_radii  # (L,)
  r_ball = env.sim.model.geom_size[:, env._dodge_ball_geom_id, 0]  # (N,) per-env true radius

  ball_p = ball.data.root_link_pos_w  # (N, 3)
  ball_v = ball.data.root_link_lin_vel_w  # (N, 3)
  link_p = robot.data.body_link_pos_w  # (N, L, 3)
  link_v = robot.data.body_link_lin_vel_w  # (N, L, 3)

  rel = ball_p.unsqueeze(1) - link_p  # (N, L, 3) link -> ball
  d = rel.norm(dim=-1).clamp_min(1e-6)  # (N, L)
  h = d - (r_ball.unsqueeze(1) + r_link.unsqueeze(0))  # (N, L) clearance (m)
  # Closing rate dh/dt = d/dt||rel|| = rel . (v_ball - v_link) / ||rel||  (< 0 while approaching).
  h_dot = (rel * (ball_v.unsqueeze(1) - link_v)).sum(dim=-1) / d  # (N, L)
  cbf = (h_dot + alpha * h).clamp(min=-constraint_clip, max=0.0)  # (N, L) <= 0, violation only
  if danger_band is not None:
    # Localize: only links whose clearance is within `danger_band` count. Without this, the ball
    # closing on the whole robot makes h_dot ~ -closing_speed for ~every link, so nearly all links
    # "violate" -- the per-link signal washes out (esp. under `sum`). Gating by each link's own
    # proximity makes `sum` a true near-limb penalty (only the few links the ball is actually near).
    cbf = torch.where(h < danger_band, cbf, torch.zeros_like(cbf))
  if reduce == "sum":
    agg = cbf.sum(dim=1)  # charge ALL violating links -> clear multiple threatened limbs at once
  elif reduce == "mean":
    agg = cbf.mean(dim=1)
  else:  # "min": only the single most-binding link
    agg = cbf.min(dim=1).values

  threat = airborne(env, ball_p[:, 2]) & (ball_v[:, :2].norm(dim=-1) > min_ball_speed)
  return torch.where(threat, agg, torch.zeros_like(agg))


def dodge_sidestep_reward(
  env: ManagerBasedRlEnv,
  robot_name: str = "robot",
  ball_name: str = "ball",
  alpha: float = 1.0,
  safe_radius: float = 0.4,
  constraint_clip: float = 2.0,
  z_active: float = 0.25,
  min_ball_speed: float = 0.5,
  strike_z: tuple[float, float] = (0.0, 0.7),
  gravity: float = 9.81,
) -> torch.Tensor:
  """Predictive full-body sidestep CBF reward (<= 0; scale with ``RewardTermCfg.weight``).

  The "commit earlier/harder" lever for the residual *leg* hits, in CBF form (the 2-D perpendicular
  barrier -- same family as the deprecated base ``dodge_cbf``). ``mimickit_dodge_reward`` rewards
  distance from where the ball *is now*; this charges the base for not getting OFF the ball's incoming
  xy LINE fast enough, so the policy commits to a whole-body sidestep *before* the ball arrives --
  clearing every link at once, which is what a load-bearing leg needs (it can't vacate a head-on ball
  late).

      h    = |perp| - safe_radius              # base's perpendicular clearance from the ball's line
      h_dot= sign(perp) * (v_base . n)         # rate the base is leaving the line (its OWN sideways speed)
      r    = clamp(h_dot + alpha*h, -clip, 0)  # CBF constraint: 0 when clearing fast enough, else <0

  Unlike :func:`dodge_link_cbf_reward`, ``h_dot`` here is the robot's own sideways speed (the ball
  moves ALONG its line, so it doesn't change perp) -- same scale as ``alpha*h``, so this barrier is
  well-conditioned (no closing-rate saturation) and gives real gradient to commit the sidestep.
  ZERO when safe (base already > safe_radius off the line), so it never fights the settle behavior;
  gated to a live, still-approaching threat. Self-contained (ground-truth ball pos/vel; no CBF-command
  dependency). DISABLED by default (register with weight 0); enable + calibrate (like
  /tmp/cbf_calibrate.py) only if the leg-hit bucket plateaus. ``safe_radius`` = how far off the line
  to demand (whole-body clearance ~ body half-width + ball radius); larger weight/alpha = sidestep
  sooner/harder.
  """
  robot: Entity = env.scene[robot_name]
  ball: Entity = env.scene[ball_name]
  rp = robot.data.root_link_pos_w[:, :2]  # (N,2) base xy
  vbase = robot.data.root_link_lin_vel_w[:, :2]  # base xy velocity
  bp = ball.data.root_link_pos_w[:, :2]
  bz = ball.data.root_link_pos_w[:, 2]
  vb = ball.data.root_link_lin_vel_w[:, :2]
  speed = vb.norm(dim=-1)
  vdir = vb / speed.clamp_min(1e-6).unsqueeze(-1)  # ball xy heading
  n = torch.stack([-vdir[:, 1], vdir[:, 0]], dim=-1)  # 90deg perpendicular (escape axis)
  to_robot = rp - bp
  along = (to_robot * vdir).sum(dim=-1)  # >0 while the ball is still approaching
  perp_signed = (to_robot * n).sum(dim=-1)  # base's signed offset from the ball's line
  h = perp_signed.abs() - safe_radius  # perpendicular clearance (>=0 safe)
  h_dot = torch.sign(perp_signed) * (vbase * n).sum(dim=-1)  # rate base increases its clearance
  cbf = (h_dot + alpha * h).clamp(min=-constraint_clip, max=0.0)  # <= 0, violation only

  # Height-aware gate: only demand a sidestep for an UN-DUCKABLE low ball. The xy line ignores the
  # arc, so predict the ball's z at the closest xy approach (t* = along / xy_speed; projectile drop)
  # and require z_cross in `strike_z` = [0, 0.7] m (lower-torso-and-below). A ball arriving there
  # CAN'T be ducked (lowering the body moves it INTO the ball), so a full-body sidestep is the evade
  # -- exactly the residual leg/foot hits. Higher balls (upper torso/head) are duck territory and a
  # ball that arcs overhead or lands short is no threat, so the sidestep is (correctly) not demanded.
  t_star = (along / speed.clamp_min(min_ball_speed)).clamp(min=0.0)
  vz = ball.data.root_link_lin_vel_w[:, 2]
  z_cross = bz + vz * t_star - 0.5 * gravity * t_star * t_star
  threat = (
    airborne(env, bz)
    & (speed > min_ball_speed)
    & (along > 0.0)
    & (z_cross > strike_z[0])
    & (z_cross < strike_z[1])
  )
  return torch.where(threat, cbf, torch.zeros_like(cbf))


def mimickit_dodge_reward(
  env: ManagerBasedRlEnv,
  robot_name: str = "robot",
  ball_name: str = "ball",
  pos_w: float = 0.9,
  vel_w: float = 0.1,
  pos_scale: float = 0.3,
  vel_scale: float = 1.0,
) -> torch.Tensor:
  """MimicKit / SMP dodgeball task reward (arXiv:2512.03028, ``compute_dodge_reward``).

  A verbatim port of MimicKit's ``task_dodgeball_env`` reward -- the *entire* dodgeball
  task signal in SMP, blended ~50/50 with the motion (style) prior:

      r = pos_w * (1 - exp(-pos_scale * dist_to_ball))   # far-from-ball
        + vel_w * exp(-vel_scale * ||v_xy||^2)            # stay-still

  * **Distance term** ``1 - exp(-pos_scale * d)`` (in ``[0, 1)``): rewards keeping the
    base far from the ball -- the dodge incentive. ``d`` is the full 3-D distance from the
    robot root to the ball (MimicKit takes the min over projectiles; we have one ball, so
    just the norm). Saturates as the ball gets distant, so once clear there's no gradient
    pulling the robot to flee further -- it can settle.
  * **Stillness term** ``exp(-vel_scale * ||v_xy||^2)`` (in ``(0, 1]``): rewards a near-zero
    horizontal base speed, i.e. don't wander -- only move when you must evade. This is what
    makes the SMP behavior "stand, then sidestep the throw, then settle" rather than pace.

  Unlike ``dodge_cbf_reward`` this uses NO control-barrier function and NO velocity command:
  it is purely the ground-truth ball position + the robot's own speed, exactly as MimicKit
  shapes it. When the ball is parked aside (between throws) ``d`` is large so the distance
  term is ~1; the robot is then driven only to stand still, which is the desired idle pose.
  Defaults match MimicKit (``pos_w`` 0.9, ``vel_w`` 0.1, ``pos_scale`` 0.3, ``vel_scale`` 1).
  """
  robot: Entity = env.scene[robot_name]
  ball: Entity = env.scene[ball_name]
  pos_diff = ball.data.root_link_pos_w - robot.data.root_link_pos_w
  pos_err = torch.linalg.norm(pos_diff, dim=-1)
  pos_reward = 1.0 - torch.exp(-pos_scale * pos_err)
  vel_err = torch.sum(torch.square(robot.data.root_link_lin_vel_w[:, :2]), dim=-1)
  vel_reward = torch.exp(-vel_scale * vel_err)
  return pos_w * pos_reward + vel_w * vel_reward


def dodge_stillness_when_safe(
  env: ManagerBasedRlEnv,
  command_name: str = "twist",
  robot_name: str = "robot",
  vel_scale: float = 2.0,
) -> torch.Tensor:
  """Reward standing still ONLY when no ball is looming -- kills the false-dodge asymmetry.

  ``r = (1 - threat) * exp(-vel_scale * ||v_xy||^2)`` in ``[0, 1]``.

  The dodge payoff is lopsided: missing a real ball ends the episode (``ball_hit``, weight
  ~-200) while twitching at noise costs almost nothing (in the in-place / between-throw
  regime ``track_anchor_linear_velocity`` is masked off and ``mimickit_dodge``'s stillness
  term is only ``vel_w=0.1``). So the policy rationally over-dodges any ambiguous near-blob
  -- including the static-but-jittering clutter / segmenter noise. This term restores the
  cost of a FALSE dodge, but ONLY when there is no real threat:

  * ``threat`` = ``command._dodge_threat`` (privileged, reward-only): 1 while a ball is
    airborne and approaching, else 0. Computed every step by the command's CBF filter even
    when it doesn't filter the command. The ACTOR never sees it -- it observes only depth +
    proprio -- so to collect this reward it must learn to keep still UNLESS the depth shows a
    genuine loom (a fast depth collapse), which is exactly the noise-vs-ball discriminator.
  * threat=0 (noise only / between throws) -> full reward for near-zero base speed -> STAND.
  * threat=1 (ball incoming) -> 0 regardless of speed -> no pull against the dodge; the
    hit-termination drives evasion. So it never slows a real dodge, only phantom ones.

  ``vel_scale`` sharpens the speed falloff (2.0: a 0.5 m/s drift keeps ~0.6, 1 m/s ~0.14).
  """
  command = env.command_manager.get_term(command_name)
  threat = command._dodge_threat.float()  # (N,) 1 while a ball is airborne + approaching
  robot: Entity = env.scene[robot_name]
  v_xy = robot.data.root_link_lin_vel_w[:, :2]
  still = torch.exp(-vel_scale * torch.sum(v_xy * v_xy, dim=-1))  # 1 still -> 0 moving
  return (1.0 - threat) * still


def dodge_action_rate_when_safe(
  env: ManagerBasedRlEnv,
  command_name: str = "twist",
) -> torch.Tensor:
  """Threat-gated action-rate COST: penalize ``||a_t - a_{t-1}||^2`` ONLY when no ball is looming.

  Companion to :func:`dodge_stillness_when_safe`. That term penalizes gross base *velocity* when
  safe; this one penalizes joint *jitter* (rapid action changes) when safe -- the in-place foot
  shuffling / twitching that barely moves the base, so the base-velocity term hardly sees it, but
  reads as the robot reacting to noise. Like the global ``action_rate_l2`` but multiplied by
  ``(1 - threat)`` so it is OFF the moment a real ball is airborne+approaching -- it never smooths
  away a genuine dodge, only the phantom twitching on clutter/segmenter noise. Return as a COST
  (use a NEGATIVE weight). ``threat`` = ``command._dodge_threat`` (privileged, reward-only)."""
  command = env.command_manager.get_term(command_name)
  threat = command._dodge_threat.float()  # (N,) 1 while a ball is airborne + approaching
  rate = torch.sum(
    torch.square(env.action_manager.action - env.action_manager.prev_action), dim=1
  )
  return (1.0 - threat) * rate


def self_collision_cost(
  env: ManagerBasedRlEnv,
  sensor_name: str,
  force_threshold: float = 10.0,
) -> torch.Tensor:
  """Penalize self-collisions.

  When the sensor provides force history (from ``history_length > 0``),
  counts substeps where any contact force exceeds *force_threshold*.
  Falls back to the instantaneous ``found`` count otherwise.
  """
  sensor: ContactSensor = env.scene[sensor_name]
  data = sensor.data
  if data.force_history is not None:
    # force_history: [B, N, H, 3]
    force_mag = torch.norm(data.force_history, dim=-1)  # [B, N, H]
    hit = (force_mag > force_threshold).any(dim=1)  # [B, H]
    return hit.sum(dim=-1).float()  # [B]
  assert data.found is not None
  return data.found.squeeze(-1)




def dodge_cbf_joint_correction(env: ManagerBasedRlEnv) -> torch.Tensor:
  """CBF-RL filter-correction penalty (<= 0; scale with ``RewardTermCfg.weight``).

  The PDF's ``-lambda_corr ||v* - v_des||^2_W`` term (W = I). ``CbfJointPositionAction`` projects
  the policy's implicit joint-velocity command ``v_des`` onto the ball-avoidance half-space and
  stashes the per-step correction; this returns ``-mean_j (v* - v_des)_j^2``. It is the actual
  lever of joint CBF-RL: penalizing how hard the filter had to intervene trains the policy to
  produce safe whole-body motion on its own, so the (train-only) filter is needed less and can be
  dropped at deploy. Already zero where there is no threat (the filter is identity there).
  """
  corr_sq = getattr(env, "_cbf_joint_corr_sq", None)
  if corr_sq is None:
    return torch.zeros(env.num_envs, device=env.device)
  return -corr_sq


def dodge_cbf_joint_buffer(
  env: ManagerBasedRlEnv,
  h_buf: float = 0.1,
) -> torch.Tensor:
  """CBF-RL clearance-buffer penalty (<= 0; scale with ``RewardTermCfg.weight``).

  The PDF's ``-lambda_h [h_buf - h_min]_+^2`` term. ``h_min`` is the LINEAR clearance (metres) of
  the most-threatened body point (``dist - D``, stashed by ``CbfJointPositionAction``); this
  penalizes letting any defended body point come within ``h_buf`` metres of the clearance boundary,
  gated on a live threat. Encourages a margin rather than skimming the safety surface.
  """
  hmin = getattr(env, "_cbf_joint_hmin", None)
  threat = getattr(env, "_cbf_joint_threat", None)
  if hmin is None or threat is None:
    return torch.zeros(env.num_envs, device=env.device)
  viol = torch.clamp(h_buf - hmin, min=0.0)
  return torch.where(threat, -(viol * viol), torch.zeros_like(viol))


