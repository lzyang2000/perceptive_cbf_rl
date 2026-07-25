"""Running mean/std normalizer for AMP observations.

Ported from the previous vendored rsl_rl fork (rsl_rl/utils/utils.py:
RunningMeanStd + Normalizer) so the AMP overload no longer depends on a forked
rsl_rl.

The streaming statistics live on the GPU (torch tensors, float64 accumulators) so
``update``/``normalize_torch`` never leave the device. The previous numpy
implementation forced a ``.cpu().numpy()`` of every state batch each minibatch
(a GPU->CPU sync + host copy) plus a CPU ``np.mean``/``np.var``; on a fast GPU
that stalled the training loop (the dominant per-iteration cost). Keeping it on
device removes those syncs. Math (Welford parallel update) is unchanged.
"""

from __future__ import annotations

import numpy as np
import torch


class RunningMeanStd:
  """Welford-style streaming mean/var, kept on-device as torch tensors.

  https://en.wikipedia.org/wiki/Algorithms_for_calculating_variance#Parallel_algorithm
  """

  def __init__(
    self,
    epsilon: float = 1e-4,
    shape: tuple[int, ...] = (),
    device: str | torch.device = "cuda:0",
  ) -> None:
    self.device = torch.device(device)
    # float64 accumulators match the previous numpy precision over long runs.
    self.mean = torch.zeros(shape, dtype=torch.float64, device=self.device)
    self.var = torch.ones(shape, dtype=torch.float64, device=self.device)
    self.count = float(epsilon)

  @torch.no_grad()
  def update(self, arr: torch.Tensor) -> None:
    arr = arr.to(self.mean.device, torch.float64)
    batch_mean = arr.mean(dim=0)
    batch_var = arr.var(dim=0, unbiased=False)
    batch_count = arr.shape[0]
    self.update_from_moments(batch_mean, batch_var, batch_count)

  def update_from_moments(
    self, batch_mean: torch.Tensor, batch_var: torch.Tensor, batch_count: int
  ) -> None:
    delta = batch_mean - self.mean
    tot_count = self.count + batch_count

    new_mean = self.mean + delta * batch_count / tot_count
    m_a = self.var * self.count
    m_b = batch_var * batch_count
    m_2 = (
      m_a + m_b + torch.square(delta) * self.count * batch_count / tot_count
    )
    new_var = m_2 / tot_count

    self.mean = new_mean
    self.var = new_var
    self.count = tot_count


class Normalizer(RunningMeanStd):
  """RunningMeanStd with torch-friendly normalization for AMP obs."""

  def __init__(
    self,
    input_dim: int | tuple[int, ...],
    epsilon: float = 1e-4,
    clip_obs: float = 10.0,
    device: str | torch.device = "cuda:0",
  ) -> None:
    super().__init__(
      shape=input_dim if isinstance(input_dim, tuple) else (input_dim,),
      device=device,
    )
    self.epsilon = epsilon
    self.clip_obs = clip_obs
    self._mean_f32: torch.Tensor | None = None
    self._std_f32: torch.Tensor | None = None

  def _refresh_cache(self, device: torch.device) -> None:
    # Cache float32 mean/std on the working device; rebuilt each update via
    # ``normalize_torch`` checking identity, so this stays cheap and sync-free.
    self._mean_f32 = self.mean.to(device, torch.float32)
    self._std_f32 = torch.sqrt((self.var + self.epsilon).to(device, torch.float32))

  def update_from_moments(self, batch_mean, batch_var, batch_count) -> None:  # type: ignore[override]
    super().update_from_moments(batch_mean, batch_var, batch_count)
    self._mean_f32 = None  # invalidate cache; rebuilt lazily on next normalize

  def normalize(self, x: np.ndarray) -> np.ndarray:
    mean = self.mean.detach().cpu().numpy()
    var = self.var.detach().cpu().numpy()
    return np.clip(
      (x - mean) / np.sqrt(var + self.epsilon), -self.clip_obs, self.clip_obs
    )

  def normalize_torch(self, x: torch.Tensor, device: str | torch.device) -> torch.Tensor:
    dev = torch.device(device)
    if self._mean_f32 is None or self._mean_f32.device != dev:
      self._refresh_cache(dev)
    return torch.clamp(
      (x - self._mean_f32) / self._std_f32, -self.clip_obs, self.clip_obs
    )
