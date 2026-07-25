"""CBF-filtered joint-position action term (CBF-RL Phase 1).

Wraps the stock ``JointPositionAction``: after the usual ``scale*a + default_pose`` produces the
joint position target ``q_des``, we treat the requested motion as an implicit joint velocity
``v_des = (q_des - q_cur)/dt``, run the single-constraint joint-level CBF projection
(``cbf_joint``) against the nearest threatened body point, and re-integrate the filtered velocity
back to a position target ``q_des* = q_cur + v*·dt``. The per-step correction ``v* - v_des`` and
the min barrier ``h_min`` are stashed on the env for the CBF-RL reward terms
(``dodge_cbf_joint_correction`` / ``dodge_cbf_joint_buffer``).

Train-only: the filter needs privileged ball state + Jacobians, so it is dropped at deploy (the
exported policy is the bare actor). The reward, not the runtime nudge, is the lever: penalizing
the correction teaches the policy to stay safe on its own. See docs/cbf_joint_filter_spec.md.

The body Jacobian is computed by ``mujoco_warp.support.jac`` (batched over worlds); selection is
Jacobian-free, so exactly one Jacobian launch happens per step (for the active body per env).
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import TYPE_CHECKING

import mujoco
import torch
from mjlab.envs.mdp.actions import JointPositionActionCfg
from mjlab.envs.mdp.actions.actions import JointPositionAction

from src.tasks.amp_loco.mdp.cbf_joint import project_action, select_active_point

if TYPE_CHECKING:
  from mjlab.envs import ManagerBasedRlEnv

# Default candidate body points: the AMP-tracked links (pelvis + limbs), a whole-body set so the
# filter can defend legs/arms/torso, not just the base. Matches amp_body_names in rl_cfg.py.
_DEFAULT_BODY_NAMES: tuple[str, ...] = (
  "pelvis",
  "left_hip_roll_link",
  "left_knee_link",
  "left_ankle_roll_link",
  "right_hip_roll_link",
  "right_knee_link",
  "right_ankle_roll_link",
  "left_shoulder_roll_link",
  "left_elbow_link",
  "left_wrist_yaw_link",
  "right_shoulder_roll_link",
  "right_elbow_link",
  "right_wrist_yaw_link",
)


@dataclass(kw_only=True)
class CbfJointPositionActionCfg(JointPositionActionCfg):
  """JointPositionAction + joint-level CBF ball-avoidance projection."""

  cbf_enabled: bool = True
  """Master switch. When False this term is a plain JointPositionAction (pass-through)."""
  filter_action: bool = True
  """If True (default) the projected v* overrides the action (the runtime filter). If False, v* and
  h_min are still computed and stashed for the reward terms, but the policy's RAW action is applied
  -- pure CBF-RL reward shaping with NO filter override, so there is no train/deploy mismatch and the
  policy can't lean on the filter as a crutch."""
  ball_name: str = "ball"
  body_names: tuple[str, ...] = ()
  """Candidate body points p_i defended by the filter. Empty (default) = ALL robot links (minus the
  gimbal camera body). Each link uses its OWN collision radius (see body_buffer)."""
  body_buffer: float = 0.05
  """Small geometry/discretization margin added to the per-body keep-out:
  D_i = ball_radius + body_radius_i + body_buffer (m). Per-body radius (PDF-faithful), NOT lumped."""
  alpha: float = 1.5
  """Class-K CBF gain (matches the 2-D filter's cbf_alpha)."""
  delta_max: float = 2.0
  """Max TTC urgency margin (PDF eq. 4); units of h-dot. Drives earlier commitment as TTC->0."""
  t_alert: float = 0.4
  """Time-to-contact (s) at/below which the urgency margin saturates to delta_max."""
  z_margin: float = 0.05
  """Airborne when ball center > ball_radius + z_margin (radius-relative; excludes grounded balls
  while including low incoming ones). Replaces the old absolute z_active threshold."""
  sense_radius: float = 4.0
  """Ball-to-body distance (m) beyond which there is no threat."""
  min_ball_speed: float = 0.5
  """Ball speed (m/s) below which there is no threat."""

  def build(self, env: "ManagerBasedRlEnv") -> "CbfJointPositionAction":
    return CbfJointPositionAction(self, env)


class CbfJointPositionAction(JointPositionAction):
  """See module docstring."""

  cfg: CbfJointPositionActionCfg

  def __init__(self, cfg: CbfJointPositionActionCfg, env: "ManagerBasedRlEnv"):
    super().__init__(cfg, env)
    self._enabled = bool(cfg.cbf_enabled)
    self._filter_action = bool(cfg.filter_action)
    self._init_stash()
    if not self._enabled:
      return

    robot = self._entity
    idx = robot.indexing
    # Global actuated-DOF (qvel) columns for this action's joints -> slice the nv-wide Jacobian.
    self._act_vadr = idx.joint_v_adr[self._target_ids].long()  # (ndof,)
    # Candidate body points: ALL robot links by default (per-body true radius), excluding the gimbal
    # camera body. Matches the PDF's per-body D_i = ball_radius + local body radius + buffer.
    names = list(cfg.body_names) if cfg.body_names else ["^(?!camera_pitch_link$).*$"]
    body_local, _ = robot.find_bodies(names)
    self._body_local = torch.as_tensor(body_local, device=self.device, dtype=torch.long)
    self._body_global = idx.body_ids[self._body_local].to(torch.int32).contiguous()  # (K,)
    # Per-body true collision radius (max round-geom cross-section per body; default 0.05 m), indexed
    # by the filter's bodies. Body sizes are env-invariant (only the ball is size-randomized).
    mjm = env.sim.mj_model
    _round = {int(mujoco.mjtGeom.mjGEOM_SPHERE), int(mujoco.mjtGeom.mjGEOM_CAPSULE),
              int(mujoco.mjtGeom.mjGEOM_CYLINDER)}
    _br: dict[int, float] = {}
    for g in range(mjm.ngeom):
      if int(mjm.geom_type[g]) in _round:
        b = int(mjm.geom_bodyid[g])
        _br[b] = max(_br.get(b, 0.0), float(mjm.geom_size[g, 0]))
    self._body_radius = torch.tensor(
      [_br.get(int(gid), 0.05) for gid in self._body_global.tolist()], device=self.device
    )  # (K,) per-body true radius
    self._dt = float(env.step_dt)
    self._ball = env.scene[cfg.ball_name]
    self._ball_geom_id = env.sim.mj_model.geom(f"{cfg.ball_name}/ball_collision").id
    self._nv = int(env.sim.wp_model.nv)

    import mujoco_warp as mjw
    import warp as wp

    self._wp = wp
    self._mjw = mjw

  def _init_stash(self) -> None:
    """Allocate the env-level tensors the reward terms read (so they exist before step 1)."""
    z = torch.zeros(self.num_envs, device=self.device)
    self._env._cbf_joint_corr_sq = z.clone()  # (N,) mean_j (v* - v_des)_j^2
    self._env._cbf_joint_hmin = torch.full((self.num_envs,), 1e3, device=self.device)  # (N,)
    self._env._cbf_joint_threat = torch.zeros(
      self.num_envs, dtype=torch.bool, device=self.device
    )

  def _ball_estimate(self):
    """Return (ball_pos_w, ball_vel_w) -- the ground-truth ball state."""
    return self._ball.data.root_link_pos_w, self._ball.data.root_link_lin_vel_w

  def process_actions(self, actions: torch.Tensor) -> None:
    super().process_actions(actions)  # fills self._processed_actions = q_des
    if not self._enabled:
      return

    q_des = self._processed_actions  # (N, ndof) position target
    q_cur = self._entity.data.joint_pos[:, self._target_ids]  # (N, ndof)
    v_des = (q_des - q_cur) / self._dt  # implicit desired joint velocity (q_dot = v)

    body_pos = self._entity.data.body_link_pos_w[:, self._body_local, :]  # (N, K, 3)
    ball_pos, ball_vel = self._ball_estimate()
    ball_r = self._env.sim.model.geom_size[:, self._ball_geom_id, 0]  # (N,) per-env radius
    # Per-body keep-out D_i = ball_radius + body_radius_i + buffer (N, K) -- PDF-faithful, not lumped.
    clearance = ball_r.unsqueeze(1) + self._body_radius.unsqueeze(0) + self.cfg.body_buffer  # (N, K)

    sel = select_active_point(
      body_pos,
      ball_pos,
      ball_vel,
      clearance,
      ball_radius=ball_r,
      z_margin=self.cfg.z_margin,
      sense_radius=self.cfg.sense_radius,
      min_ball_speed=self.cfg.min_ball_speed,
    )
    jac_act = self._active_jacobian(sel["idx"], body_pos)  # (N, 3, ndof)

    v_star, corr = project_action(
      v_des,
      jac_act,
      sel["r_act"],
      ball_vel,
      sel["h_act"],
      sel["dist"],
      sel["nu"],
      sel["D_act"],
      sel["threat"],
      alpha=self.cfg.alpha,
      delta_max=self.cfg.delta_max,
      t_alert=self.cfg.t_alert,
    )

    if self._filter_action:
      q_des_star = q_cur + v_star * self._dt
      # Exactly q_des where not threatened (v* == v_des there); use where to avoid fp drift.
      self._processed_actions = torch.where(sel["threat"].unsqueeze(-1), q_des_star, q_des)
    # else: leave _processed_actions = q_des (raw action applied); v*/corr/h_min below still feed
    # the reward terms -- pure CBF-RL reward shaping with no filter override.

    self._env._cbf_joint_corr_sq = (corr * corr).mean(dim=-1)  # (N,)
    # Stash LINEAR clearance (dist - D, metres) for the buffer reward -- interpretable, unlike the
    # squared barrier h = ||r||^2 - D^2 used inside the projection. argmin is the same body either way.
    self._env._cbf_joint_hmin = sel["dist"] - sel["D_act"]  # (N,)
    self._env._cbf_joint_threat = sel["threat"]  # (N,)

  def _active_jacobian(
    self, idx: torch.Tensor, body_pos: torch.Tensor
  ) -> torch.Tensor:
    """Translational Jacobian of the per-env active body point, actuated columns (N, 3, ndof)."""
    wp = self._wp
    ar = torch.arange(self.num_envs, device=self.device)
    point_t = body_pos[ar, idx].contiguous().to(torch.float32)  # (N, 3) active point (world)
    body_t = self._body_global[idx].contiguous()  # (N,) int32 global body id
    jacp_t = torch.zeros(
      (self.num_envs, 3, self._nv), device=self.device, dtype=torch.float32
    )
    self._mjw.jac(
      self._env.sim.wp_model,
      self._env.sim.wp_data,
      wp.from_torch(jacp_t, dtype=wp.float32),
      None,
      wp.from_torch(point_t, dtype=wp.vec3),
      wp.from_torch(body_t, dtype=wp.int32),
    )
    return jacp_t[:, :, self._act_vadr]  # (N, 3, ndof)
