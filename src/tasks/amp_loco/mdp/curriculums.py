"""Curriculum terms for AMP tasks."""

from __future__ import annotations

from typing import TYPE_CHECKING

import torch

if TYPE_CHECKING:
  from mjlab.envs.manager_based_rl_env import ManagerBasedRlEnv


def goal_radius_curriculum(
  env: ManagerBasedRlEnv,
  env_ids: torch.Tensor | slice,
  command_name: str,
  start_radius: float = 1.0,
  final_radius: float = 4.0,
  steps_to_full: float = 40_000.0,
) -> float:
  """Grow the goal-sampling radius from ``start_radius`` to ``final_radius``.

  Progress is measured by ``env.common_step_counter`` -- the global env-step counter,
  which increments once per env step (~``num_steps_per_env`` per training iteration,
  24 by default) and, crucially, is **never reset on episode resets**. The radius ramps
  linearly to ``final_radius`` over the first ``steps_to_full`` env steps (e.g. 40k
  steps / 24 per iter ~= 1.7k iterations), then holds. Returns the current max radius
  for logging.

  (The previous proxy ``command.command_counter`` was wrong here: ``CommandTerm.reset``
  zeroes it on every episode reset, so it plateaued at the steady-state per-episode
  resample count (~2.4) and the radius never grew past ~0.5 m.)
  """
  command = env.command_manager.get_term(command_name)
  frac = min(env.common_step_counter / steps_to_full, 1.0)
  new_max = start_radius + frac * (final_radius - start_radius)
  command.cfg.radius = (command.cfg.radius[0], new_max)
  return new_max
