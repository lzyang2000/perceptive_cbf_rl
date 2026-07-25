"""Goal-conditioned ("go to a point") command that the policy observes as a velocity.

This command term implements the navigation layer of a goal-conditioned task while
keeping the policy's command interface a pure velocity (vx, vy, wz) -- the goal point
itself never enters the observation. Each control step it converts the *current* base ->
goal error into a clamped proportional velocity command:

    v_xy_b = clip(kp * R_yaw^{-1} (goal_xy - base_xy), v_max)
    w_z    = clip(kp_yaw * wrap(atan2(goal - base) - heading))   # face the goal

Because the command is proportional to the remaining error, its magnitude **decays to
zero as the robot approaches the goal**. That decaying velocity is the only proximity
cue available to the policy (there is no explicit distance/goal in the observation), and
it is what lets a memoryless policy learn to slow down and stop at the target.

Is "goal not in the observation" realistic? Yes -- this is the standard deployable
decomposition: a navigation/planner layer turns a goal into a velocity command and the
locomotion policy only ever sees a velocity (like a joystick). The goal still reaches the
policy, but compressed into the velocity command. A truly goal-invisible observation
(goal in the reward but with no path into the observation at all) would be an unsolvable
POMDP. This is the same trick mjlab's UniformVelocityCommand already uses for
``heading_command`` (heading error -> yaw-rate command), generalized to an xy point.
"""

from __future__ import annotations

import math
from dataclasses import dataclass, field
from typing import TYPE_CHECKING

import numpy as np
import torch

from mjlab.entity import Entity
from mjlab.managers.command_manager import CommandTerm, CommandTermCfg
from mjlab.utils.lab_api.math import (
  quat_apply,
  quat_apply_inverse,
  wrap_to_pi,
  yaw_quat,
)

from src.assets.objects.ball import DEFAULT_BALL_RADIUS
from src.tasks.amp_loco.mdp.cbf import predictive_dodge_filter

if TYPE_CHECKING:
  from mjlab.envs.manager_based_rl_env import ManagerBasedRlEnv
  from mjlab.viewer.debug_visualizer import DebugVisualizer


class GoToGoalCommand(CommandTerm):
  """Velocity command derived from a sampled goal point (goal absent from obs)."""

  cfg: GoToGoalCommandCfg

  def __init__(self, cfg: GoToGoalCommandCfg, env: ManagerBasedRlEnv):
    super().__init__(cfg, env)
    self.robot: Entity = env.scene[cfg.entity_name]

    # World-frame goal (xy) and the resulting body-frame velocity command [vx, vy, wz].
    self.goal_pos_w = torch.zeros(self.num_envs, 2, device=self.device)
    self.vel_command_b = torch.zeros(self.num_envs, 3, device=self.device)
    self.distance_to_goal = torch.zeros(self.num_envs, device=self.device)
    # Per-step distance reduction toward the goal (meters); +ve = progress. Read by the
    # goal_progress_reward. Set to 0 on (re)sample so a goal change is not seen as motion.
    self.prev_distance = torch.zeros(self.num_envs, device=self.device)
    self.distance_delta = torch.zeros(self.num_envs, device=self.device)
    self.is_standing_env = torch.zeros(
      self.num_envs, dtype=torch.bool, device=self.device
    )
    # In-place-throw envs: zero velocity command (like standing) BUT NOT in is_standing_env, so the
    # throw event (skip_standing_envs) still pelts them -- the robot must dodge from a standstill.
    # Mutually exclusive with is_standing_env (partitioned from one uniform draw in _sample_stand_inplace).
    self.is_inplace_env = torch.zeros(
      self.num_envs, dtype=torch.bool, device=self.device
    )
    # Dwell-and-resample: once a (non-standing) env holds the goal for its dwell time, draw
    # a new goal (the periodic timer remains a fallback). Keeps the robot actively leaping.
    # The dwell duration is randomized per env (per goal) within cfg.dwell_time_range.
    self.dwell_counter = torch.zeros(self.num_envs, dtype=torch.long, device=self.device)
    self.dwell_steps = torch.full(
      (self.num_envs,),
      max(1, round(sum(self.cfg.dwell_time_range) / 2 / self._env.step_dt)),
      dtype=torch.long,
      device=self.device,
    )

    self.metrics["distance_to_goal"] = torch.zeros(self.num_envs, device=self.device)
    self.metrics["fraction_at_goal"] = torch.zeros(self.num_envs, device=self.device)

  @property
  def command(self) -> torch.Tensor:
    # The policy only ever sees this velocity, never the goal coordinates.
    return self.vel_command_b

  def _sample_stand_inplace(self, env_ids: torch.Tensor) -> torch.Tensor:
    """Partition ``env_ids`` (one uniform draw) into permanently-standing (zero command, NO ball),
    in-place-throw (zero command but balls STILL thrown), and normal. Sets is_standing_env and
    is_inplace_env (mutually exclusive, exact fractions) and returns the standing mask."""
    r = torch.empty(len(env_ids), device=self.device).uniform_(0.0, 1.0)
    stand_p = self.cfg.rel_standing_envs
    inplace_p = self.cfg.rel_inplace_throw_envs
    standing = r < stand_p
    inplace = (r >= stand_p) & (r < stand_p + inplace_p)
    self.is_standing_env[env_ids] = standing
    self.is_inplace_env[env_ids] = inplace
    return standing

  def _resample_command(self, env_ids: torch.Tensor) -> None:
    n = len(env_ids)
    if n == 0:
      return
    r = torch.empty(n, device=self.device)
    radius = r.uniform_(*self.cfg.radius)
    angle = torch.empty(n, device=self.device).uniform_(-math.pi, math.pi)
    base_xy = self.robot.data.root_link_pos_w[env_ids, :2]
    self.goal_pos_w[env_ids, 0] = base_xy[:, 0] + radius * torch.cos(angle)
    self.goal_pos_w[env_ids, 1] = base_xy[:, 1] + radius * torch.sin(angle)
    # A fraction of envs get a "stay put" goal (goal == current position).
    standing = self._sample_stand_inplace(env_ids)
    self.goal_pos_w[env_ids[standing]] = base_xy[standing]
    # Seed progress tracking to the new goal (delta 0 this step) and clear the dwell,
    # sampling a fresh per-env dwell duration for the new goal.
    self.prev_distance[env_ids] = torch.norm(
      self.goal_pos_w[env_ids] - base_xy, dim=-1
    )
    self.dwell_counter[env_ids] = 0
    dwell_s = torch.empty(n, device=self.device).uniform_(*self.cfg.dwell_time_range)
    self.dwell_steps[env_ids] = (dwell_s / self._env.step_dt).round().long().clamp(min=1)

  def _update_command(self) -> None:
    # --- Dwell-and-resample: non-standing envs that have held the goal long enough
    # get a fresh goal (the periodic timer in compute() remains a fallback). ---
    reached = (
      (self.distance_to_goal < self.cfg.arrive_radius)
      & ~self.is_standing_env
      & ~self.is_inplace_env  # in-place dodgers hold for the whole episode (no goal resample)
    )
    self.dwell_counter = torch.where(
      reached, self.dwell_counter + 1, torch.zeros_like(self.dwell_counter)
    )
    resample_ids = (self.dwell_counter >= self.dwell_steps).nonzero(as_tuple=False).flatten()
    if len(resample_ids) > 0:
      self._resample(resample_ids)  # new goal + resets timer, prev_distance, dwell

    base_pos_w = self.robot.data.root_link_pos_w[:, :2]
    err_w = self.goal_pos_w - base_pos_w  # (N, 2), world frame
    self.distance_to_goal = torch.norm(err_w, dim=-1)

    # Rotate the xy error into the base yaw frame.
    err_w3 = torch.cat([err_w, torch.zeros_like(err_w[:, :1])], dim=-1)
    err_b = quat_apply_inverse(
      yaw_quat(self.robot.data.root_link_quat_w), err_w3
    )[:, :2]

    # Proportional velocity command, clamped per axis. Magnitude decays with the
    # remaining error, so the command -> 0 as the robot reaches the goal.
    v = self.cfg.kp * err_b
    v[:, 0] = v[:, 0].clamp(-self.cfg.max_lin_vel_x, self.cfg.max_lin_vel_x)
    v[:, 1] = v[:, 1].clamp(-self.cfg.max_lin_vel_y, self.cfg.max_lin_vel_y)

    # Yaw: turn to face the goal (skipped very close, where direction is ill-defined).
    if self.cfg.simple_heading:
      heading_target = torch.atan2(err_w[:, 1], err_w[:, 0])
      yaw_err = wrap_to_pi(heading_target - self.robot.data.heading_w)
      wz = (self.cfg.kp_yaw * yaw_err).clamp(
        -self.cfg.max_ang_vel_z, self.cfg.max_ang_vel_z
      )
    else:
      wz = torch.zeros_like(self.distance_to_goal)

    # Arrived: inside the arrival radius, command zero so the robot stands.
    arrived = self.distance_to_goal < self.cfg.arrive_radius
    v[arrived] = 0.0
    wz[arrived] = 0.0

    self.vel_command_b[:, :2] = v
    self.vel_command_b[:, 2] = wz
    # Standing envs: zero command (goal == current pos already, but be explicit).
    self.vel_command_b[self.is_standing_env] = 0.0
    # In-place-throw envs: zero command too (the robot is told to hold still), but the throw event
    # does NOT skip them -- so the policy must learn to dodge from a standstill (depth-driven).
    self.vel_command_b[self.is_inplace_env] = 0.0

    # Progress this step (+ve = moved closer). Resampled envs got prev_distance reset
    # above, so their delta is ~0 (no spurious jump from the goal change).
    self.distance_delta = self.prev_distance - self.distance_to_goal
    self.prev_distance = self.distance_to_goal.clone()

  def _update_metrics(self) -> None:
    self.metrics["distance_to_goal"] = self.distance_to_goal
    self.metrics["fraction_at_goal"] = (
      self.distance_to_goal < self.cfg.arrive_radius
    ).float()

  # Visualization (goal marker + command vs. actual velocity arrows).

  def _debug_vis_impl(self, visualizer: "DebugVisualizer") -> None:
    env_indices = visualizer.get_env_indices(self.num_envs)
    if not env_indices:
      return
    goals = self.goal_pos_w.cpu().numpy()
    base = self.robot.data.root_link_pos_w.cpu().numpy()
    for batch in env_indices:
      if np.linalg.norm(base[batch]) < 1e-6:
        continue
      goal_xyz = np.array([goals[batch, 0], goals[batch, 1], 0.05])
      visualizer.add_sphere(goal_xyz, 0.12, color=(0.9, 0.3, 0.1, 0.8))
      visualizer.add_arrow(
        base[batch] + np.array([0, 0, 0.1]),
        goal_xyz + np.array([0, 0, 0.1]),
        color=(0.9, 0.6, 0.1, 0.5),
        width=0.01,
      )


@dataclass(kw_only=True)
class GoToGoalCommandCfg(CommandTermCfg):
  entity_name: str
  radius: tuple[float, float] = (1.0, 3.0)
  """Min/max distance (m) of a freshly sampled goal from the robot."""
  rel_standing_envs: float = 0.05
  """Stand ratio: fraction of envs whose command is forced to zero every step (stand
  still) instead of being driven toward a goal -- same semantics as mjlab's
  ``UniformVelocityCommand.rel_standing_envs``. Standing is rewarded by the velocity-
  tracking reward: a zero command makes ``exp(-||0 - v||^2/std^2)`` maximal when the
  robot is motionless. (The goal is also pinned to the current position so the goal
  rewards stay consistent for these envs.) For the dodge task these envs are ALSO a
  ball-free anchor (the throw event's ``skip_standing_envs`` skips them)."""
  rel_inplace_throw_envs: float = 0.0
  """In-place-throw ratio: fraction of envs whose command is forced to zero (like standing) but
  which the throw event STILL pelts -- so the policy must learn to dodge from a standstill rather
  than always being in locomotion mode. Mutually exclusive with ``rel_standing_envs`` (the two are
  partitioned from one draw); the sum must be <= 1. Dodge task only (no ball -> no effect); 0 = off."""
  kp: float = 1.5
  """Proportional gain mapping xy position error (m) to commanded velocity (m/s)."""
  kp_yaw: float = 1.0
  """Proportional gain mapping heading error (rad) to commanded yaw rate (rad/s)."""
  max_lin_vel_x: float = 2.0
  max_lin_vel_y: float = 1.0
  max_ang_vel_z: float = 1.0
  arrive_radius: float = 0.25
  """Within this distance the goal is considered reached and the command is zeroed."""
  dwell_time_range: tuple[float, float] = (1.0, 3.0)
  """Seconds a (non-standing) env must hold the goal before a new goal is sampled,
  sampled uniformly per env per goal. The periodic ``resampling_time_range`` timer
  remains a fallback for goals never reached."""
  simple_heading: bool = True
  """If True, command a yaw rate that turns the robot to face the goal."""

  @dataclass
  class VizCfg:
    z_offset: float = 0.2
    scale: float = 0.5

  viz: VizCfg = field(default_factory=VizCfg)

  def build(self, env: ManagerBasedRlEnv) -> GoToGoalCommand:
    return GoToGoalCommand(self, env)


class DodgeGoToGoalCommand(GoToGoalCommand):
  """GoToGoalCommand whose velocity command is filtered to dodge the ball's trajectory.

  Each step the nominal goal-tracking velocity (from the parent) is passed through a
  predictive control-barrier filter (see ``cbf.predictive_dodge_filter``) that, while a
  ball is airborne and approaching, sidesteps the robot perpendicular to the ball's
  predicted xy path -- keeping it clear of the *entire trajectory line*, not just the
  ball's current point. The policy observes (and the velocity-tracking reward targets)
  the filtered command, so the robot leaps out of the ball's path.

  The escape side (which way to sidestep) is latched per env at the moment the threat
  first appears, so it does not flip-flop while the robot is dodging.
  """

  cfg: DodgeGoToGoalCommandCfg

  def __init__(self, cfg: DodgeGoToGoalCommandCfg, env: ManagerBasedRlEnv):
    super().__init__(cfg, env)
    self.ball: Entity = env.scene[cfg.ball_name]
    # Global geom id of the ball collision sphere, so the CBF can read the per-env ball
    # radius (randomized each episode by the `randomize_ball_size` event) and widen its
    # clearance for bigger balls. Resolved by name (scene prefixes entity geoms).
    self._ball_geom_id = env.sim.mj_model.geom(f"{cfg.ball_name}/ball_collision").id
    # Fixed "home" goal = each env's start (origin) xy, where robots reset to. In
    # home_goal mode the goal is pinned here and never resampled, so after a dodge the
    # P-controller drives the robot back -- it stays a goal-tracker (locomotion mode)
    # instead of sinking into the dead-stand attractor that makes it freeze on a throw.
    self._home_xy = env.scene.env_origins[:, :2].clone()
    # Body-frame forward unit vector, for placing a "behind the robot" goal (back_offset).
    self._forward_b = torch.tensor([1.0, 0.0, 0.0], device=self.device).repeat(
      self.num_envs, 1
    )
    # Nominal (pre-filter) body-frame command, kept for logging / diagnosis.
    self.vel_command_nominal_b = torch.zeros(self.num_envs, 3, device=self.device)
    # Latched escape side (+/-1) and previous-step threat flag, per env.
    self._dodge_side = torch.ones(self.num_envs, device=self.device)
    self._dodge_threat = torch.zeros(self.num_envs, dtype=torch.bool, device=self.device)
    # CBF-RL reward state, refreshed every step (read by mdp.dodge_cbf_reward):
    #   _dodge_e_w    -- (N,2) world escape direction == barrier gradient d h / d v
    #   _dodge_h      -- (N,)  barrier value s - D (>=0 safe)
    #   _dodge_u_safe_w -- (N,2) the CBF-safe velocity command (world xy), clamped to the
    #                     leap envelope -- i.e. "what the robot should do" this step.
    self._dodge_e_w = torch.zeros(self.num_envs, 2, device=self.device)
    self._dodge_h = torch.zeros(self.num_envs, device=self.device)
    self._dodge_u_safe_w = torch.zeros(self.num_envs, 2, device=self.device)
    # Time-to-impact (s), for the privileged critic observation (dodge_cbf_state_b).
    self._dodge_tti = torch.zeros(self.num_envs, device=self.device)
    # Per-env ball radius (m), read from the model each step (privileged critic obs).
    self._dodge_ball_radius = torch.full(
      (self.num_envs,), DEFAULT_BALL_RADIUS, device=self.device
    )
    self.metrics["cbf_active_frac"] = torch.zeros(self.num_envs, device=self.device)
    self.metrics["cbf_min_h"] = torch.zeros(self.num_envs, device=self.device)

  def _resample_command(self, env_ids: torch.Tensor) -> None:
    if not self.cfg.home_goal:
      super()._resample_command(env_ids)
      return
    # Home-goal mode: pin the goal to the env's start (home) xy and never sample a random
    # point. Most envs are normal goal-trackers, so when displaced by a dodge the P-controller
    # drives them back home.
    if len(env_ids) == 0:
      return
    self.goal_pos_w[env_ids] = self._home_xy[env_ids]
    # Sample the permanently-standing fraction (rel_standing_envs) -- a ball-free "clean stand"
    # anchor (velocity hard-zeroed AND throw skipped) -- and the in-place-throw fraction
    # (rel_inplace_throw_envs) -- velocity hard-zeroed but balls STILL thrown, so the policy learns
    # to dodge from a standstill. Both hold for the whole episode; goal is home like everyone else.
    # Both ratios = 0 in play -> none forced.
    self._sample_stand_inplace(env_ids)
    base_xy = self.robot.data.root_link_pos_w[env_ids, :2]
    self.prev_distance[env_ids] = torch.norm(self.goal_pos_w[env_ids] - base_xy, dim=-1)
    self.dwell_counter[env_ids] = 0

  def _update_command(self) -> None:
    # Back-offset mode: every step pin the goal back_offset metres behind the robot
    # (opposite its heading) so the nominal command is a constant backpedal -- the robot
    # is always moving (best dodge regime) and retreating from the front-thrown ball.
    if self.cfg.back_offset != 0.0:
      fwd_xy = quat_apply(
        yaw_quat(self.robot.data.root_link_quat_w), self._forward_b
      )[:, :2]
      self.goal_pos_w[:] = self.robot.data.root_link_pos_w[:, :2] - (
        self.cfg.back_offset * fwd_xy
      )
      self.is_standing_env[:] = False
      self.is_inplace_env[:] = False

    super()._update_command()  # fills self.vel_command_b with the nominal command
    self.vel_command_nominal_b = self.vel_command_b.clone()
    if not self.cfg.cbf_enabled:
      return

    yq = yaw_quat(self.robot.data.root_link_quat_w)

    # Nominal command body -> world (xy only; yaw command left untouched).
    v_nom_b = self.vel_command_b[:, :2]
    v_nom_b3 = torch.cat([v_nom_b, torch.zeros_like(v_nom_b[:, :1])], dim=-1)
    u_nom_w = quat_apply(yq, v_nom_b3)[:, :2]

    # Per-env ball radius (randomized each episode); widen the CBF clearance so a bigger
    # ball is given more berth. cfg.safe_radius is the clearance tuned for the default ball,
    # so add the size delta: safe_radius_eff = cfg.safe_radius + (r_ball - r_default).
    self._dodge_ball_radius = self._env.sim.model.geom_size[:, self._ball_geom_id, 0]
    safe_radius = self.cfg.safe_radius + (self._dodge_ball_radius - DEFAULT_BALL_RADIUS)

    u_safe_w, threat, perp_signed, h, e, tti = predictive_dodge_filter(
      u_nom_w,
      self.robot.data.root_link_pos_w,
      self.ball.data.root_link_pos_w,
      self.ball.data.root_link_lin_vel_w,
      self._dodge_side,
      safe_radius=safe_radius,
      alpha=self.cfg.cbf_alpha,
      sense_radius=self.cfg.sense_radius,
      ball_radius=self._dodge_ball_radius,
      z_margin=0.05,
      momentum_time=self.cfg.momentum_time,
      comfort_buffer=self.cfg.comfort_buffer,
      min_ball_speed=self.cfg.min_ball_speed,
    )

    # Latch the escape side when a threat first appears (perp_signed ~ 0 for an on-target
    # ball, so default to +1); hold it until the threat clears. The ball's xy velocity is
    # constant in flight, so the side stays stable once chosen.
    new_threat = threat & ~self._dodge_threat
    default_side = torch.where(
      perp_signed >= 0.0, torch.ones_like(perp_signed), -torch.ones_like(perp_signed)
    )
    self._dodge_side = torch.where(new_threat, default_side, self._dodge_side)
    self._dodge_threat = threat

    # Filtered command world -> body, then clamp to the leap velocity envelope.
    u_safe_w3 = torch.cat([u_safe_w, torch.zeros_like(u_safe_w[:, :1])], dim=-1)
    u_safe_b = quat_apply_inverse(yq, u_safe_w3)[:, :2]
    u_safe_b[:, 0] = u_safe_b[:, 0].clamp(-self.cfg.max_lin_vel_x, self.cfg.max_lin_vel_x)
    u_safe_b[:, 1] = u_safe_b[:, 1].clamp(-self.cfg.max_lin_vel_y, self.cfg.max_lin_vel_y)

    # Stash the CBF-RL reward state (the clamped safe command in WORLD frame, the escape
    # direction == barrier gradient, and the barrier value). dodge_cbf_reward reads these.
    u_safe_clamped_b3 = torch.cat([u_safe_b, torch.zeros_like(u_safe_b[:, :1])], dim=-1)
    self._dodge_u_safe_w = quat_apply(yq, u_safe_clamped_b3)[:, :2]
    self._dodge_e_w = e
    self._dodge_h = h
    self._dodge_tti = tti

    # Apply the filter to the command the policy SEES only if configured to. With
    # cbf_filter_command=False (the CBF-RL training mode used by the depth task), the
    # command stays nominal and the policy must LEARN to dodge from its observation
    # (depth) -- the CBF here only supplies the reward signal (safe action + safety
    # value), not a hard override. With True (default; play + the non-depth dodge tasks)
    # the safe command replaces the nominal one as before.
    if self.cfg.cbf_filter_command:
      self.vel_command_b[:, :2] = u_safe_b

    self.metrics["cbf_active_frac"] = threat.float()
    self.metrics["cbf_min_h"] = h


@dataclass(kw_only=True)
class DodgeGoToGoalCommandCfg(GoToGoalCommandCfg):
  """GoToGoalCommandCfg + ball-avoidance CBF filter parameters."""

  ball_name: str = "ball"
  home_goal: bool = False
  """If True, pin the goal to each env's start (home) xy and never resample, so the robot
  returns to its fixed start after every dodge instead of standing wherever it ends up.
  Used in the play demo; training keeps random goals (home_goal=False)."""
  back_offset: float = 0.0
  """If > 0, every step place the goal this many meters BEHIND the robot (opposite its
  heading). The nominal command becomes a constant backpedal, so the robot is always in
  locomotion mode (dodges far better than standing) and already retreating from the
  front-thrown ball. Overrides home_goal. Used in the play demo."""
  cbf_enabled: bool = True
  cbf_filter_command: bool = True
  """If True, the CBF-safe velocity replaces the nominal command the policy observes/tracks
  (a hard safety filter). If False, the command stays nominal and the CBF only computes the
  safe action + barrier value for the ``dodge_cbf_reward`` (CBF-RL: the policy must LEARN to
  dodge from its observation). ``cbf_enabled`` must still be True for the filter to run."""
  cbf_alpha: float = 4.0
  """Class-K gain in ``h_dot >= -alpha * h``. Larger = react closer/later; smaller =
  react earlier/more conservatively."""
  safe_radius: float = 0.6
  """Safe 3D center-to-center distance (m) the filter tries to maintain from the ball
  (ball radius + robot torso half-width + margin)."""
  sense_radius: float = 3.0
  """Only filter when the ball is approaching and within this distance (m) along its
  path."""
  z_active: float = 0.25
  """Only filter when the ball is above this height (m), so a grounded/parked or rolling
  ball (resting at ~radius height) is ignored."""
  momentum_time: float = 0.5
  """Robot's velocity-command spin-up time (s). Subtracted from time-to-impact so the
  sidestep is commanded early enough to actually build momentum (measured ~0.5 s)."""
  comfort_buffer: float = 0.3
  """Extra time margin (s) the robot wants to be clear *before* the ball arrives."""
  min_ball_speed: float = 0.5
  """Only filter when the ball's xy speed exceeds this (m/s); defines its heading."""

  def build(self, env: ManagerBasedRlEnv) -> DodgeGoToGoalCommand:
    return DodgeGoToGoalCommand(self, env)
