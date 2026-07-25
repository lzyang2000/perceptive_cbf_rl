from __future__ import annotations

from typing import TYPE_CHECKING

import torch

if TYPE_CHECKING:
  from mjlab.envs import ManagerBasedRlEnv


def mean_delay_steps(env: ManagerBasedRlEnv) -> torch.Tensor:
  """Mean number of delay steps for environments in delayed termination.

  This metric is useful for monitoring the delay duration when using delayed termination.

  Returns:
    Per-environment scalar. Shape: ``(B,)``.
  """
  tm = env.termination_manager
  delay_counters = getattr(tm, "_delay_counters", None)
  delay_env_mask = getattr(tm, "_delay_env_mask", None)
  
  if delay_env_mask is not None and delay_counters is not None:
    total_delay_steps = torch.sum(delay_counters.float())
    total_delay_envs = torch.sum(delay_env_mask.float())
    mean_delay = total_delay_steps / (total_delay_envs + 1e-8)  # Avoid division by zero.
    return mean_delay.expand(env.num_envs)  # Return same mean for all envs for easier logging.
  else:
    return torch.zeros(env.num_envs, device=env.device)