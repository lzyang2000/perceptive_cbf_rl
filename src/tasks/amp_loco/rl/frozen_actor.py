"""Load a frozen actor from another task's cfg + checkpoint.

Used by the benchmark's deployment (walk-recover) regime to drive the
proprio-only walk policy (``Unitree-G1-AMP-Flat``) between throws, mirroring
the hardware walk<->dodge mode switch.
"""

from __future__ import annotations

import inspect
from dataclasses import asdict

import torch
import torch.nn as nn
from tensordict import TensorDict

from rsl_rl.utils import resolve_callable, resolve_obs_groups


def load_frozen_actor(
  teacher_task: str,
  checkpoint: str,
  obs: TensorDict,
  num_actions: int,
  device: str,
  obs_set: str = "actor",
) -> tuple[nn.Module, list[str]]:
  """Build + load a frozen actor from ``teacher_task``'s actor cfg and a checkpoint.

  ``obs`` must contain the actor's obs groups (e.g. proprio ``actor``). Returns
  the eval-mode, grad-disabled actor and the resolved list of obs-group names it consumes.
  """
  from mjlab.tasks.registry import load_rl_cfg

  tcfg = load_rl_cfg(teacher_task)
  actor_cfg = asdict(tcfg.actor)
  actor_cls = resolve_callable(actor_cfg.pop("class_name"))
  # Keep only kwargs the model ctor accepts (asdict carries cnn_cfg / rnn_* that MLPModel rejects).
  accepted = set(inspect.signature(actor_cls.__init__).parameters)
  actor_cfg = {k: v for k, v in actor_cfg.items() if k in accepted}

  groups = list(tcfg.obs_groups[obs_set])
  sample = TensorDict(
    {g: obs[g] for g in groups}, batch_size=obs.batch_size
  )
  resolved = resolve_obs_groups(sample, {obs_set: tuple(groups)}, [obs_set])
  actor = actor_cls(sample, resolved, obs_set, num_actions, **actor_cfg).to(device)
  ck = torch.load(checkpoint, map_location=device, weights_only=False)
  actor.load_state_dict(ck["actor_state_dict"])
  actor.eval()
  for p in actor.parameters():
    p.requires_grad_(False)
  print(
    f"[frozen-actor] '{teacher_task}' loaded from {checkpoint} "
    f"(iter {ck.get('iter', '?')}); groups={groups}"
  )
  return actor, groups
