"""Unitree G1 AMP **Leap** environment configurations.

This task teaches the G1 to *leap* (jump) in commanded horizontal directions using
linear-velocity (vx, vy) commands, with an AMP discriminator trained exclusively on
leaping reference clips. Because the only reference style available to the
discriminator is leaping, the policy is pushed to realize the commanded velocity by
*jumping* rather than walking.

It reuses the full ``amp_loco`` machinery (observations, actions, AMP obs group, events,
rewards, terminations) and only overrides what differs for leaping:

* Motion data points at ``src/assets/motions/g1/amp_leap/Leap`` (single, moderate
  standing leaps converted from the NVIDIA SEED dataset: forward / backward / left /
  right / diagonal jumps, with mirror clips for left-right symmetry). The discriminator
  walks the parent ``amp_leap`` directory recursively. All clips keep the root above
  ~0.65 m, so every frame is safe to reset an episode from.
* No fall-recovery: ``recovery_dir`` is unset and delayed reset is disabled (leaping is
  the only skill, unlike the walk/run + recovery base task).
* Velocity command emphasises vx/vy with only mild yaw, and the base-height termination
  is lowered (vs. the locomotion default) to give learned leap crouches some headroom.
"""

import math
import os

from mjlab.envs import ManagerBasedRlEnvCfg
from mjlab.managers.termination_manager import TerminationTermCfg
from mjlab.tasks.velocity.mdp import UniformVelocityCommandCfg

import src.tasks.amp_loco.mdp as mdp

from .env_cfgs import g1_amp_flat_env_cfg, g1_amp_rough_env_cfg

_MOTION_BASE = os.path.abspath(
  os.path.join(
    os.path.dirname(__file__), "..", "..", "..", "..", "assets", "motions", "g1", "amp_leap"
  )
)
# Discriminator loads the parent dir recursively (Leap/ + StyleForward/).
_LEAP_DISCR_DIR = _MOTION_BASE
# Episode reset samples frames only from the reset-safe Leap/ subdir.
_LEAP_RESET_DIR = os.path.join(_MOTION_BASE, "Leap")


def _apply_leap_overrides(cfg: ManagerBasedRlEnvCfg, play: bool) -> ManagerBasedRlEnvCfg:
  """Mutate a base AMP env cfg into the leap variant (in place)."""
  # --- Motion data: leap clips, no recovery, no delayed reset. ---
  cfg.events["init_motion_loader"].params["motion_dir"] = _LEAP_RESET_DIR
  cfg.events["init_motion_loader"].params["recovery_dir"] = None
  cfg.events["init_motion_loader"].params["delay_reset_env_ratio"] = 0.0
  cfg.events["init_motion_loader"].params["max_delay_steps"] = 0
  cfg.events["reset_from_motion"].params["motion_dir"] = _LEAP_RESET_DIR

  # track_root_height is a fall-recovery reward: it anchors the root to the default
  # *standing* height, but only fires for envs inside the delayed-termination recovery
  # window. With recovery disabled above (max_delay_steps=0) it is identically zero, and
  # for a leap we would not want it anyway -- tracking standing height fights the flight
  # phase. Drop it so it stops cluttering the reward log.
  cfg.rewards.pop("track_root_height", None)

  # --- Command: leap with vx/vy, hold heading, only mild yaw. ---
  twist = cfg.commands["twist"]
  assert isinstance(twist, UniformVelocityCommandCfg)
  twist.resampling_time_range = (3.0, 6.0)
  twist.rel_standing_envs = 0.1
  twist.rel_heading_envs = 1.0
  twist.heading_command = True
  # Velocity ranges derived from the leap clips' body-frame root speeds
  # (scripts/clip_velocity_stats.py): forward peak ~+1.3, backward ~-1.1, lateral
  # ~+/-1.4 m/s. Commanding beyond this would be unachievable in the leap style and
  # would fight the AMP discriminator.
  twist.ranges = UniformVelocityCommandCfg.Ranges(
    lin_vel_x=(-1.1, 1.3),
    lin_vel_y=(-1.4, 1.4),
    ang_vel_z=(-0.5, 0.5),
    heading=(-math.pi / 2, math.pi / 2),
  )

  # --- Terminations: keep robot upright-ish and out of the "collapsed crouch". ---
  # Measured: the leap reference clips never dip the root below 0.65 m (min over all
  # 24 clips = 0.651). The old 0.40 m floor left 0.25 m of slack below the real crouch
  # -- exactly the room the policy used to collapse into a wide, deep ~0.45-0.5 m squat
  # and *scrape* to goals instead of leaping. So:
  #   - keep an instantaneous hard floor at 0.45 m (a true fall / hard drop), and
  #   - add a *sustained* collapse termination: below 0.55 m held for > 0.3 s. A leap's
  #     landing dips only briefly (and never below 0.65 m in the reference), so this
  #     cannot clip a real leap, but it turns the held collapse into a -200 fall.
  cfg.terminations["bad_base_height"].params["minimum_height"] = 0.45
  cfg.terminations["bad_orientation"].params["limit_angle"] = math.radians(80.0)
  cfg.terminations["collapsed_crouch"] = TerminationTermCfg(
    func=mdp.root_height_below_minimum_sustained,
    params={"minimum_height": 0.55, "duration_s": 0.3},
  )

  if play:
    twist.ranges.lin_vel_x = (-1.1, 1.3)
    twist.ranges.lin_vel_y = (-1.4, 1.4)
    twist.ranges.ang_vel_z = (-0.5, 0.5)

  return cfg


def g1_amp_leap_flat_env_cfg(play: bool = False) -> ManagerBasedRlEnvCfg:
  """Unitree G1 AMP leap task on flat terrain."""
  cfg = g1_amp_flat_env_cfg(play=play)
  return _apply_leap_overrides(cfg, play)


def g1_amp_leap_rough_env_cfg(play: bool = False) -> ManagerBasedRlEnvCfg:
  """Unitree G1 AMP leap task on rough terrain."""
  cfg = g1_amp_rough_env_cfg(play=play)
  return _apply_leap_overrides(cfg, play)
