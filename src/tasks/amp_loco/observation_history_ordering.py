"""In-code overload that adds time-major observation-history ordering to mjlab.

The AMP env configs declare observation groups with ``history_ordering="time"`` so that
a stacked-history observation is laid out time-major
(``[A_t0, B_t0, ..., A_t1, B_t1, ...]``) instead of mjlab's default term-major
(``[A_t0, A_t1, ..., B_t0, B_t1, ...]``). Upstream mjlab does not support this, so the
repo historically shipped a file patch under ``mjlab_patch/`` that had to be copied over
the installed package.

This module replaces that file patch with a runtime overload: it subclasses
``ObservationGroupCfg`` (to accept the ``history_ordering`` field) and
``ObservationManager`` (to realize the layout), then rebinds those names on every mjlab
module that holds a reference, including ``manager_based_rl_env`` which imports them by
name and instantiates the manager. Importing this module (done from
``src.tasks.amp_loco`` before any task config is built) is idempotent and mutates nothing
on disk.

The behavior is identical to ``mjlab_patch/mjlab/managers/observation_manager.py``:

* For ``"time"`` groups, history is kept unflattened ``(B, H, D)`` per term.
* Terms are concatenated to ``(B, H, sum_D)`` then reshaped to ``(B, H * sum_D)`` so
  timesteps are interleaved.
* The reported group dim is the flattened ``(H * sum_D,)``.
"""

from __future__ import annotations

import dataclasses
from typing import Literal

import torch
from mjlab import managers as _managers_pkg
from mjlab.envs import manager_based_rl_env as _mbenv
from mjlab.managers import observation_manager as _om

_HISTORY_ORDERING_ATTR = "history_ordering"


def _already_installed() -> bool:
  return _HISTORY_ORDERING_ATTR in {
    f.name for f in dataclasses.fields(_om.ObservationGroupCfg)
  }


def _install() -> None:
  if _already_installed():
    return

  base_group_cfg = _om.ObservationGroupCfg

  @dataclasses.dataclass
  class ObservationGroupCfg(base_group_cfg):  # type: ignore[valid-type, misc]
    history_ordering: Literal["term", "time"] = "term"
    """History layout when ``concatenate_terms`` and ``history_length`` are set.

    - ``"term"`` (default): term-major ``[A_t0, A_t1, ..., B_t0, B_t1, ...]``.
    - ``"time"``: time-major ``[A_t0, B_t0, ..., A_t1, B_t1, ...]``.
    """

  class TimeOrderingObservationManager(_om.ObservationManager):
    """ObservationManager that supports ``history_ordering="time"`` groups."""

    def __init__(self, cfg, env):  # noqa: ANN001
      # Time-major ordering needs per-term history kept unflattened (B, H, D) so
      # timesteps can be interleaved at concatenation. mjlab's _prepare_terms
      # propagates the group's flatten flag to each term, so flip it here.
      for group_cfg in cfg.values():
        if group_cfg is None:
          continue
        if getattr(group_cfg, _HISTORY_ORDERING_ATTR, "term") == "time":
          group_cfg.flatten_history_dim = False

      super().__init__(cfg, env)

      # Report the flattened group dim (H * sum_D,) to match the runtime output of
      # compute_group below (the base class computes a 2D dim for unflattened history).
      for name, group_cfg in self.cfg.items():
        if group_cfg is None:
          continue
        if getattr(group_cfg, _HISTORY_ORDERING_ATTR, "term") != "time":
          continue
        if not self._group_obs_concatenate.get(name, False):
          continue
        term_dims = self._group_obs_term_dim[name]
        if term_dims and len(term_dims[0]) > 1:
          history_len = int(term_dims[0][0])
          feature_sum = sum(int(d[1]) for d in term_dims)
          self._group_obs_dim[name] = (history_len * feature_sum,)

    def compute_group(self, group_name, update_history=False):  # noqa: ANN001
      result = super().compute_group(group_name, update_history)
      group_cfg = self.cfg[group_name]
      if (
        isinstance(result, torch.Tensor)
        and result.dim() == 3
        and getattr(group_cfg, _HISTORY_ORDERING_ATTR, "term") == "time"
      ):
        # (B, H, sum_D) -> (B, H * sum_D): interleave terms within each timestep.
        result = result.reshape(result.shape[0], -1)
      return result

  # Rebind on every module that holds a reference. manager_based_rl_env imports both
  # names by value and instantiates the manager, so it must be rebound explicitly.
  for module in (_om, _managers_pkg, _mbenv):
    setattr(module, "ObservationGroupCfg", ObservationGroupCfg)
    setattr(module, "ObservationManager", TimeOrderingObservationManager)


_install()
