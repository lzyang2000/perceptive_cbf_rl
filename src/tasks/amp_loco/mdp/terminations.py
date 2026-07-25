from __future__ import annotations

from typing import TYPE_CHECKING

import torch

from mjlab.entity import Entity
from mjlab.managers.scene_entity_config import SceneEntityCfg
from mjlab.managers.termination_manager import TerminationManager
from mjlab.sensor import ContactSensor

if TYPE_CHECKING:
  from mjlab.envs import ManagerBasedRlEnv


_DEFAULT_ASSET_CFG = SceneEntityCfg("robot")


def root_height_below_minimum_sustained(
  env: ManagerBasedRlEnv,
  minimum_height: float,
  duration_s: float,
  asset_cfg: SceneEntityCfg = _DEFAULT_ASSET_CFG,
) -> torch.Tensor:
  """Terminate when the root stays below ``minimum_height`` for > ``duration_s``.

  Unlike the instantaneous ``root_height_below_minimum``, this tolerates brief dips
  (e.g. a leap's landing compression) and only fires on a *sustained* low posture --
  i.e. the wide, deep "collapsed crouch" the policy falls into to scrape toward goals.
  The leap reference clips never dip below ~0.65 m, so a 0.55 m / 0.3 s rule cannot
  clip a real leap or its landing, but it makes the held collapse a fall (terminates).

  Per-env dwell counter lives on ``env``; it resets to 0 whenever the root is at or
  above the threshold (which always holds right after a reset, since RSI frames are
  >= 0.65 m), so no explicit reset hook is needed.
  """
  asset: Entity = env.scene[asset_cfg.name]
  below = asset.data.root_link_pos_w[:, 2] < minimum_height

  counter = getattr(env, "_low_crouch_counter", None)
  if counter is None or counter.shape[0] != env.num_envs:
    counter = torch.zeros(env.num_envs, dtype=torch.long, device=env.device)
  counter = torch.where(below, counter + 1, torch.zeros_like(counter))
  env._low_crouch_counter = counter

  steps = max(1, round(duration_s / env.step_dt))
  return counter >= steps


def ball_contact(
  env: ManagerBasedRlEnv,
  sensor_name: str = "ball_robot_contact",
  enable_after_steps: float = 0.0,
  ball_name: str = "ball",
  robot_name: str = "robot",
  delta_v_threshold: float = 1.5,
  hit_dist: float = 1.0,
  hit_z_min: float = 0.3,
  gravity: float = 9.81,
) -> torch.Tensor:
  """Terminate the episode when the thrown ball touches the robot (got hit).

  Reads the ``ball_robot_contact`` :class:`ContactSensor` (primary = ball body, secondary
  = the robot's pelvis *subtree*; since the pelvis is the G1's root body the subtree is the
  whole robot, so this catches a hit on any link -- legs, torso, or arms). ``found > 0``
  means the ball is touching some robot link this step. No new sensor is needed.

  Velocity-discontinuity fallback (from MimicKit's dodgeball fail check): a ball thrown at
  12-15 m/s effective speed can *tunnel* through a thin link in a single control step, so
  the contact sensor reports nothing. But in MuJoCo the only thing that changes the ball's
  velocity in flight is a collision (there is no air drag), so any deviation from the
  gravity-only free-fall prediction (``v != v_prev + g*dt``) means it hit *something*. We
  gate that to the robot -- within ``hit_dist`` of the pelvis AND above ``hit_z_min`` (so a
  ground bounce at the feet, which is low and decelerates against the floor, is not counted
  as a body hit) -- and OR it into the contact-sensor result. This makes the hit detection
  robust to fast/tunneling balls without a new sensor. Set ``delta_v_threshold<=0`` to
  disable (contact-sensor only).

  ``enable_after_steps`` (curriculum): the termination is suppressed (returns all-False)
  until ``env.common_step_counter`` (the monotonic global env-step counter, ~24 per
  training iteration) reaches this value. Rationale: while the policy is still learning to
  locomote/leap, a hit is unavoidable, so terminating + the -200 is_terminated penalty on
  every one floods the gradient with a signal it cannot yet act on and competes with the
  AMP/leap rewards building the base skill. The dense, non-terminating ``dodge_cbf`` reward
  supplies the dodge gradient from step 0; this hard terminal signal switches on only once
  leaping is established (~5-10k iters -> ~120-240k env steps) to sharpen the residual hits.
  """
  sensor: ContactSensor = env.scene[sensor_name]
  found = sensor.data.found  # [B, num_slots]
  assert found is not None, f"Sensor '{sensor_name}' must include 'found' in its fields."
  hit = found.squeeze(-1) > 0.0

  if delta_v_threshold > 0.0:
    ball: Entity = env.scene[ball_name]
    robot: Entity = env.scene[robot_name]
    v = ball.data.root_link_lin_vel_w  # [B, 3]
    prev = getattr(env, "_dodge_prev_ball_vel", None)
    if prev is None or prev.shape != v.shape:
      prev = v.clone()
    # Gravity-only free-fall prediction (gravity acts on -z over one control step).
    expected = prev.clone()
    expected[:, 2] -= gravity * env.step_dt
    delta_v = (v - expected).norm(dim=-1)
    ball_pos = ball.data.root_link_pos_w  # [B, 3]
    dist = (ball_pos - robot.data.root_link_pos_w).norm(dim=-1)
    near_body = (dist < hit_dist) & (ball_pos[:, 2] > hit_z_min)
    dv_hit = (delta_v > delta_v_threshold) & near_body
    env._dodge_prev_ball_vel = v.clone()
    hit = hit | dv_hit

  if enable_after_steps > 0.0 and env.common_step_counter < enable_after_steps:
    return torch.zeros_like(hit)
  return hit


class DelayedTerminationManager(TerminationManager):
    """TerminationManager subclass that delays reset for a subset of envs.

    For delay envs, when a termination is triggered the reset signal is
    suppressed and a counter starts incrementing. Once the counter reaches
    ``max_delay_steps``, the reset signal is released and the counter resets.
    """

    def __init__(
        self,
        base: TerminationManager,
        delay_env_mask: torch.Tensor,
        max_delay_steps: int,
    ) -> None:
        # Steal all internal state from the base manager (avoid re-init).
        self.__dict__.update(base.__dict__)
        self._delay_env_mask = delay_env_mask          # (num_envs,) bool
        self._delay_counters = torch.zeros_like(delay_env_mask, dtype=torch.long)
        self._max_delay_steps = max_delay_steps

    def compute(self) -> torch.Tensor:
        dones = super().compute()  # fills _truncated_buf, _terminated_buf

        if self._max_delay_steps <= 0:
            return dones

        # For delay envs that just got a done signal, increment counter.
        delay_and_done = self._delay_env_mask & dones
        self._delay_counters[delay_and_done] += 1

        # Delay envs whose counter hasn't reached threshold: suppress reset.
        not_ready = delay_and_done & (self._delay_counters < self._max_delay_steps)
        # self._truncated_buf[not_ready] = False
        self._terminated_buf[not_ready] = False

        # Delay envs whose counter reached threshold: allow reset, clear counter.
        ready = delay_and_done & (self._delay_counters >= self._max_delay_steps)
        self._delay_counters[ready] = 0

        # Clear counters for delay envs that are NOT done (env recovered on its own).
        self._delay_counters[self._delay_env_mask & ~dones] = 0

        return self._truncated_buf | self._terminated_buf