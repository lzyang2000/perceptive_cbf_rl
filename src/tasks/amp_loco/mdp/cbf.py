"""Predictive ball-avoidance safety filter on the commanded velocity.

The dodge task's navigation layer (``GoToGoalCommand``) produces a *nominal* body-frame
velocity command. Before it reaches the policy (as observation and velocity-tracking
target), this filter modifies it so the robot steps clear of the ball's predicted path.

Why predictive, and why perpendicular
-------------------------------------
The ball is thrown *at the torso*, so a filter that reacts to the ball's current position
is wrong twice over: (1) while the ball arcs in, the predicted impact point is essentially
the robot's own location, so a "move radially away from the ball" rule has no well-defined
escape direction (the gradient vanishes when the ball is dead-on); (2) after the ball
lands it rolls, and a position-based filter chases the rolling ball along the ground.

Instead we use the ball's **predicted straight-line xy trajectory** (its xy velocity is
constant -- gravity only acts on z). The threat is the robot's perpendicular distance to
that line, and the escape is a **sidestep perpendicular to the incoming ball**, which is
the correct, non-degenerate evasion for an on-target projectile. The filter is gated on
the ball being airborne and actually approaching (``along > 0``), so a grounded/rolling or
already-passed ball is ignored.

CBF + reaction-time awareness
-----------------------------
Let ``n`` be the unit xy-perpendicular to the ball's heading and ``e = side * n`` the
chosen escape direction (``side`` latched per env at threat onset so it doesn't flip).
With ``s = (p_robot - p_ball) . e`` the signed sidestep coordinate, the barrier is the
relative-degree-1 ``h = s - D`` (stay at least D off the ball's line). Since the ball's
velocity is perpendicular to ``e`` (n ⟂ heading), ``h_dot = u . e``, so the class-K CBF
condition gives ``u . e >= -alpha*(s - D)`` -- a half-space, closed-form projection.

But the robot is NOT a single integrator: measured, it needs ~0.5 s to build momentum
and tracks a velocity command at ~54%. So a filter that only reacts to the current
geometry commits too gently/late. We add a **time-to-impact** requirement: the ball
reaches the robot's abreast point in ``TTI = along / speed``; the robot must be D clear by
then, but it loses ``momentum_time`` to spin-up and wants a ``comfort_buffer`` to spare,
so it has only ``t_usable = TTI - momentum_time - comfort_buffer`` of usable time. The
required sidestep speed is then ``(D - s) / t_usable``. The commanded floor is the larger
of the class-K term (early commitment) and this time term (escalates as impact nears):

    u . e >= max( alpha*(D - s),  (D - s) / max(t_usable, t_floor) )

Minimal-norm projection: ``u* = u_nom + max(0, rhs - u_nom . e) * e``. On the line (s≈0)
this commands a full-speed sidestep; once D clear (s≈D) the push relaxes to zero. As TTI
shrinks toward ``momentum_time + comfort_buffer`` the time term blows up (capped at the
leap envelope by the caller), so the robot commits maximally with the buffer intact.
"""

from __future__ import annotations

import torch


def predictive_dodge_filter(
  u_nom_w: torch.Tensor,  # (N, 2) nominal xy velocity command, world frame
  robot_pos_w: torch.Tensor,  # (N, 3)
  ball_pos_w: torch.Tensor,  # (N, 3)
  ball_vel_w: torch.Tensor,  # (N, 3)
  latched_side: torch.Tensor,  # (N,) +/-1, the latched escape side (n vs -n)
  *,
  safe_radius: float | torch.Tensor,  # scalar, or (N,) per-env clearance (varies w/ ball size)
  alpha: float,
  sense_radius: float,
  ball_radius: float | torch.Tensor,  # (N,) per-env ball radius (radius-relative airborne gate)
  z_margin: float = 0.05,  # airborne when ball center > ball_radius + z_margin (excludes grounded)
  momentum_time: float = 0.5,
  comfort_buffer: float = 0.3,
  min_ball_speed: float = 0.5,
  t_floor: float = 0.1,
  eps: float = 1e-6,
) -> tuple[
  torch.Tensor, torch.Tensor, torch.Tensor, torch.Tensor, torch.Tensor, torch.Tensor
]:
  """Sidestep the ball's predicted xy path.

  Returns ``(u_safe_w, threat, perp_signed, h, e)``:
    * ``u_safe_w`` -- filtered xy velocity (world frame); identity where not threatened.
    * ``threat`` -- (N,) bool, ball airborne + approaching + predicted to pass within D.
    * ``perp_signed`` -- (N,) robot's signed perpendicular offset from the ball line
      (used by the caller to latch the escape side at threat onset).
    * ``h`` -- (N,) barrier value ``s - D`` (>=0 safe).
    * ``e`` -- (N, 2) unit escape direction (world xy). The barrier gradient w.r.t. the
      robot velocity: since the ball's velocity is perpendicular to ``e``, ``h_dot = u . e``,
      so ``e`` is exactly ``∇_v h``. Used by the CBF-RL reward (the safety-value /
      constraint term ``v . e + alpha*h`` and as the axis the policy must sidestep along).
    * ``tti`` -- (N,) time-to-impact ``along / speed`` (s): when the ball reaches the
      robot's abreast point. Only meaningful under ``threat`` (gate it with ``threat``
      downstream). Exposed for the privileged critic observation.
  """
  rp = robot_pos_w[:, :2]
  bp = ball_pos_w[:, :2]
  vb = ball_vel_w[:, :2]

  speed = vb.norm(dim=-1)
  vdir = vb / (speed.unsqueeze(-1) + eps)  # ball xy heading (unit)
  n = torch.stack([-vdir[:, 1], vdir[:, 0]], dim=-1)  # +90deg xy-perpendicular

  to_robot = rp - bp
  along = (to_robot * vdir).sum(dim=-1)  # >0: robot still ahead of the ball (approaching)
  perp_signed = (to_robot * n).sum(dim=-1)  # signed perpendicular offset from ball line

  # Threat: ball airborne (ignore grounded/rolling), moving, still approaching
  # (along > 0), and within range. We do NOT gate on the current miss distance -- we
  # keep the robot clear of the *entire* trajectory line for the whole approach, so it
  # holds its clearance (the barrier itself relaxes once it is D off the line) rather
  # than drifting back toward the path whenever it is momentarily clear.
  threat = (
    (ball_pos_w[:, 2] > ball_radius + z_margin)
    & (speed > min_ball_speed)
    & (along > 0.0)
    & (along < sense_radius)
  )

  e = latched_side.unsqueeze(-1) * n  # escape direction (unit)
  s = (to_robot * e).sum(dim=-1)  # signed sidestep coordinate
  h = s - safe_radius
  clearance = safe_radius - s  # remaining sidestep to reach D (== -h)

  # Time the ball takes to reach the robot's abreast point, minus the robot's momentum
  # spin-up and a comfort buffer -> the usable time it has to get clear. As this shrinks
  # the required sidestep speed escalates (capped at the leap envelope by the caller).
  tti = along / (speed + eps)
  t_usable = torch.clamp(tti - momentum_time - comfort_buffer, min=t_floor)
  rhs = torch.maximum(alpha * clearance, clearance / t_usable)  # required u . e
  u_dot_e = (u_nom_w * e).sum(dim=-1)
  add = torch.clamp(rhs - u_dot_e, min=0.0)
  u_safe = u_nom_w + add.unsqueeze(-1) * e

  u_out = torch.where(threat.unsqueeze(-1), u_safe, u_nom_w)
  return u_out, threat, perp_signed, h, e, tti
