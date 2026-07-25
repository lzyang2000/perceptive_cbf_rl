"""Joint-level CBF ball-avoidance projection (CBF-RL, arXiv:2412.04658 / docs/ball_cbf_rl_summary.pdf).

This is the *joint-velocity* safety filter, distinct from the 2-D base-velocity filter in
``cbf.py``. It acts on the policy's per-joint action against per-body-point ball constraints, so
it can express whole-body evasion (duck / leg-tuck / lean), not just a base sidestep.

Math (single active constraint, the GPU-friendly rollout approximation of the PDF):

  body points  p_i(q),  safety  h_i = ||p_ball - p_i||^2 - D_i^2
  affine constraint on joint velocity v:   a_i v <= b_i
      a_i = 2 r_i^T J_i,   c_i = 2 r_i^T pdot_ball,   b_i = alpha h_i + c_i - delta,   r_i = p_ball - p_i
  active point i* = argmin_i h_i (nearest to violation), gated by an airborne+closing threat
  closed-form rank-one projection (W = I):
      v* = v_des - a_i*^T [a_i* v_des - b_i*]_+ / (||a_i*||^2 + eps)
  TTC urgency margin (PDF eq. 3-4):  delta = delta_max [1 - T/T_alert]_+

The Jacobian J_i is supplied by the caller (``mujoco_warp.support.jac``); everything here is
pure torch so it is trivially unit-testable against finite differences. Selection uses positions
only (no Jacobian), so the caller computes exactly ONE Jacobian (for the active body per env).
"""

from __future__ import annotations

import torch


def select_active_point(
  body_pos_w: torch.Tensor,  # (N, K, 3) candidate body-point world positions
  ball_pos_w: torch.Tensor,  # (N, 3)
  ball_vel_w: torch.Tensor,  # (N, 3)
  clearance: torch.Tensor,  # (N, K) per-body D_i = ball_radius + body_radius_i + buffer (or (N,) uniform)
  *,
  ball_radius: torch.Tensor,  # (N,) per-env ball radius (for the radius-relative airborne gate)
  z_margin: float,  # airborne when ball center > ball_radius + z_margin (excludes grounded balls)
  sense_radius: float,
  min_ball_speed: float,
  eps: float = 1e-6,
) -> dict[str, torch.Tensor]:
  """Pick the single most-threatened body point per env (Jacobian-free).

  Returns a dict with:
    * ``idx``     (N,)   index into K of the active (min-h) body point.
    * ``r_act``   (N, 3) ball - p_active  (== PDF r_i; barrier gradient direction).
    * ``h_act``   (N,)   barrier value at the active point (== h_min over K).
    * ``dist``    (N,)   ||r_act||.
    * ``nu``      (N,)   radial closing speed [-r^T pdot_ball / dist]_+  (PDF eq. 3).
    * ``D_act``   (N,)   clearance D at the active point.
    * ``threat``  (N,)   bool: ball airborne + moving + closing + within sense range.
  """
  n, k = body_pos_w.shape[0], body_pos_w.shape[1]
  r_all = ball_pos_w.unsqueeze(1) - body_pos_w  # (N, K, 3) = p_ball - p_i
  d2 = (r_all * r_all).sum(-1)  # (N, K)
  # Per-body keep-out D_i (N, K): D_i = ball_radius + body_radius_i + buffer. Accept a uniform (N,)
  # clearance too (broadcast over K) for back-compat.
  D = clearance if clearance.dim() == 2 else clearance.unsqueeze(1).expand(n, k)
  h_all = d2 - D * D  # (N, K)

  idx = torch.argmin(h_all, dim=1)  # (N,) nearest-to-violation body point
  ar = torch.arange(n, device=body_pos_w.device)
  r_act = r_all[ar, idx]  # (N, 3)
  h_act = h_all[ar, idx]  # (N,)
  dist = torch.sqrt(d2[ar, idx].clamp(min=0.0) + eps)  # (N,)
  D_act = D[ar, idx]  # (N,) clearance at the active body

  speed = ball_vel_w.norm(dim=-1)  # (N,)
  # Radial closing speed: dist decreasing <=> r_act . pdot_ball < 0 (r_act points body->ball).
  nu = torch.clamp(-(r_act * ball_vel_w).sum(-1) / dist, min=0.0)  # (N,)
  threat = (
    (ball_pos_w[:, 2] > ball_radius + z_margin)
    & (speed > min_ball_speed)
    & (nu > 0.0)
    & (dist < sense_radius)
  )
  return {
    "idx": idx,
    "r_act": r_act,
    "h_act": h_act,
    "dist": dist,
    "nu": nu,
    "D_act": D_act,
    "threat": threat,
  }


def project_action(
  v_des: torch.Tensor,  # (N, ndof) desired joint velocity
  jac_act: torch.Tensor,  # (N, 3, ndof) Jacobian of the active body point (actuated cols)
  r_act: torch.Tensor,  # (N, 3) p_ball - p_active
  ball_vel_w: torch.Tensor,  # (N, 3)
  h_act: torch.Tensor,  # (N,)
  dist: torch.Tensor,  # (N,)
  nu: torch.Tensor,  # (N,)
  D_act: torch.Tensor,  # (N,)
  threat: torch.Tensor,  # (N,) bool
  *,
  alpha: float,
  delta_max: float,
  t_alert: float,
  eps: float = 1e-6,
) -> tuple[torch.Tensor, torch.Tensor]:
  """Closed-form single-constraint CBF projection of ``v_des`` (W = I).

  Returns ``(v_star, correction)`` where ``correction = v_star - v_des`` (zero where no threat).
  """
  # a_i = 2 r^T J  (N, ndof);  c_i = 2 r^T pdot_ball  (N,)
  a = 2.0 * torch.einsum("nj,njd->nd", r_act, jac_act)
  c = 2.0 * (r_act * ball_vel_w).sum(-1)

  # TTC urgency margin (PDF eq. 3-4): margin grows as time-to-contact shrinks.
  ttc = torch.clamp(dist - D_act, min=0.0) / (nu + eps)
  delta = delta_max * torch.clamp(1.0 - ttc / t_alert, min=0.0)

  b = alpha * h_act + c - delta  # (N,)
  g = (a * v_des).sum(-1) - b  # (N,) constraint violation a v_des - b
  scale = torch.clamp(g, min=0.0) / ((a * a).sum(-1) + eps)  # (N,)
  v_star = v_des - a * scale.unsqueeze(-1)

  v_star = torch.where(threat.unsqueeze(-1), v_star, v_des)
  return v_star, v_star - v_des
