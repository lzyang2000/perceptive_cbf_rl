"""RL configuration for the Unitree G1 AMP **leap** task.

Identical to the base AMP locomotion runner config except the AMP discriminator is fed
the leaping motion set (``src/assets/motions/g1/amp_leap``, loaded recursively) and the
experiment name is changed so leap runs log to their own directory.
"""

import os

from .rl_cfg import RslRlAmpRunnerCfg, g1_amp_ppo_runner_cfg

_LEAP_MOTION_DIR = os.path.normpath(
  os.path.join(
    os.path.dirname(os.path.abspath(__file__)),
    os.pardir, os.pardir, os.pardir, os.pardir, os.pardir,
    "src", "assets", "motions", "g1", "amp_leap",
  )
)


def g1_amp_leap_ppo_runner_cfg() -> RslRlAmpRunnerCfg:
  """Create RL runner configuration for the Unitree G1 AMP leap task."""
  cfg = g1_amp_ppo_runner_cfg()
  cfg.experiment_name = "g1_amp_leap"
  cfg.amp_motion_files = _LEAP_MOTION_DIR
  return cfg
