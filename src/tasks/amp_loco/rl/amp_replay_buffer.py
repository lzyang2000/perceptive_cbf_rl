"""Fixed-size circular buffer of (state, next_state) pairs for AMP discriminator training.

Ported from the previous vendored rsl_rl fork (rsl_rl/storage/replay_buffer.py).
"""

from __future__ import annotations

import torch


class ReplayBuffer:
  """Stores recent policy AMP-obs transitions for the discriminator."""

  def __init__(self, obs_dim: int, buffer_size: int, device: str | torch.device) -> None:
    self.states = torch.zeros(buffer_size, obs_dim).to(device)
    self.next_states = torch.zeros(buffer_size, obs_dim).to(device)
    self.buffer_size = buffer_size
    self.device = device
    self.step = 0
    self.num_samples = 0

  def insert(self, states: torch.Tensor, next_states: torch.Tensor) -> None:
    num = states.shape[0]
    start = self.step
    end = self.step + num
    if end > self.buffer_size:
      first_chunk = self.buffer_size - self.step
      self.states[self.step : self.buffer_size] = states[:first_chunk]
      self.next_states[self.step : self.buffer_size] = next_states[:first_chunk]
      remainder = end - self.buffer_size
      self.states[:remainder] = states[first_chunk:]
      self.next_states[:remainder] = next_states[first_chunk:]
    else:
      self.states[start:end] = states
      self.next_states[start:end] = next_states

    self.num_samples = min(self.buffer_size, max(end, self.num_samples))
    self.step = (self.step + num) % self.buffer_size

  def feed_forward_generator(self, num_mini_batch: int, mini_batch_size: int):
    for _ in range(num_mini_batch):
      # Sample indices on-device (torch.randint, replacement) instead of
      # np.random.choice: a CPU index array gathering from a GPU tensor forced a
      # host->device index copy (torch.as_tensor) every minibatch.
      idx = torch.randint(
        0, self.num_samples, (mini_batch_size,), device=self.states.device
      )
      yield self.states[idx], self.next_states[idx]
