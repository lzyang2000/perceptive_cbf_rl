"""RL configuration for Unitree G1 AMP locomotion task.

The AMP runner/algorithm are a thin overload of stock rsl_rl (5.2.0): the
algorithm ``class_name`` resolves to ``src.tasks.amp_loco.rl.amp_algorithm:AmpPPO``
and the runner cfg carries top-level AMP knobs (motion paths, tracked body names,
anchor body, discriminator dims, ...) that ``AmpPPO.construct_algorithm`` reads.
See ``src/tasks/amp_loco/rl/`` and the registration in ``config/g1/__init__.py``
(which passes ``runner_cls=AMPOnPolicyRunner``).
"""

import os
from dataclasses import dataclass, field
from typing import List, Tuple

from mjlab.rl import (
  RslRlModelCfg,
  RslRlOnPolicyRunnerCfg,
  RslRlPpoAlgorithmCfg,
)

# AMP motion data directory (npz files)
_MOTION_DATA_DIR = os.path.join(
  os.path.dirname(os.path.abspath(__file__)),
  os.pardir, os.pardir, os.pardir, os.pardir, os.pardir,
  "src", "assets", "motions", "g1", "amp",
)


@dataclass
class AmpAlgorithmCfg(RslRlPpoAlgorithmCfg):
  """PPO algorithm cfg + discriminator loss coefficients."""

  amp_loss_coef: float = 1.0
  """Weight for the discriminator loss (and grad-pen) in the total loss."""
  amp_grad_pen_lambda: float = 10.0
  """Gradient penalty coefficient for WGAN-style stabilization."""
  amp_trunk_weight_decay: float = 1.0e-3
  """Weight decay applied to the discriminator trunk."""
  amp_head_weight_decay: float = 1.0e-2
  """Weight decay applied to the discriminator head."""
  class_name: str = "src.tasks.amp_loco.rl.amp_algorithm:AmpPPO"



@dataclass
class RslRlAmpRunnerCfg(RslRlOnPolicyRunnerCfg):
  """Runner cfg for AMP-teacher training.

  The ``amp_*`` fields below are top-level (not under ``algorithm``); they are
  popped from the runner cfg dict by ``AmpPPO.construct_algorithm``.
  """

  amp_reward_coef: float = 0.1
  """Scale on the discriminator-derived reward."""
  amp_motion_files: str = ""
  """Path to a single .npz or directory of .npz expert motion clips."""
  amp_task_reward_lerp: float = 0.75
  """Blend ``(1-l) * disc_reward + l * task_reward`` per step."""
  amp_discr_hidden_dims: List[int] = field(default_factory=lambda: [1024, 512, 256])
  """Hidden layer sizes for the discriminator MLP trunk."""
  amp_replay_buffer_size: int = 100_000
  """Capacity of the on-policy AMP transition replay buffer."""
  amp_body_names: Tuple[str, ...] = ()
  """Tracked body names for the AMP discriminator obs."""
  amp_anchor_name: str = ""
  """Anchor body for the body-local frame used by AMP obs."""

  algorithm: AmpAlgorithmCfg = field(default_factory=AmpAlgorithmCfg)



def g1_amp_ppo_runner_cfg() -> RslRlAmpRunnerCfg:
  """Create RL runner configuration for Unitree G1 AMP locomotion task."""
  return RslRlAmpRunnerCfg(
    actor=RslRlModelCfg(
      hidden_dims=(512, 256, 128),
      activation="elu",
      obs_normalization=True,
      distribution_cfg={
        "class_name": "GaussianDistribution",
        "init_std": 1.0,
        "std_type": "scalar",
        # Floor the action-noise std at 0.05 (replaces the old fork's
        # per-action ``min_normalized_std``; rsl_rl 5.2.0 clamps std to this
        # range inside GaussianDistribution).
        "std_range": (0.05, 1.0e6),
      },
    ),
    critic=RslRlModelCfg(
      hidden_dims=(512, 256, 128),
      activation="elu",
      obs_normalization=True,
    ),
    algorithm=AmpAlgorithmCfg(
      value_loss_coef=1.0,
      use_clipped_value_loss=True,
      clip_param=0.2,
      entropy_coef=0.005,
      num_learning_epochs=5,
      num_mini_batches=4,
      learning_rate=1.0e-3,
      schedule="adaptive",
      gamma=0.99,
      lam=0.95,
      desired_kl=0.01,
      max_grad_norm=1.0,
    ),
    experiment_name="g1_amp_locomotion",
    logger="wandb",
    wandb_project="humanoid_dodgeball",
    save_interval=100,
    num_steps_per_env=24,
    max_iterations=100001,
    # AMP parameters. coef/lerp raised from the stock 0.1/0.75: with the cleaned,
    # flight-only leap clips the discriminator is trustworthy, and the "scrape /
    # collapsed crouch" failure is maximally off-distribution, so weighting the style
    # reward more makes the discriminator's rejection of it actually cost reward
    # (it was effectively <1% of total reward before).
    amp_reward_coef=0.3,
    amp_motion_files=os.path.normpath(_MOTION_DATA_DIR),
    amp_task_reward_lerp=0.6,
    amp_discr_hidden_dims=[1024, 512, 256],
    amp_replay_buffer_size=100_000,
    amp_body_names=(
      "pelvis",
      "left_hip_roll_link",
      "left_knee_link",
      "left_ankle_roll_link",
      "right_hip_roll_link",
      "right_knee_link",
      "right_ankle_roll_link",
      "left_shoulder_roll_link",
      "left_elbow_link",
      "left_wrist_yaw_link",
      "right_shoulder_roll_link",
      "right_elbow_link",
      "right_wrist_yaw_link",
    ),
    amp_anchor_name="torso_link",
  )
