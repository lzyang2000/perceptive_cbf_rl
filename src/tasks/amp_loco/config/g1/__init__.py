from mjlab.tasks.registry import register_mjlab_task
from src.tasks.amp_loco.rl import AMPOnPolicyRunner

from .env_cfgs import g1_amp_flat_env_cfg
from .dodge_env_cfgs import (
  g1_amp_dodge_depth_single_ballonly_flat_env_cfg,
  g1_amp_dodge_mimickit_flat_env_cfg,
)
from .goto_rl_cfg import (
  g1_amp_dodge_depth_single_ppo_runner_cfg,
  g1_amp_dodge_mimickit_ppo_runner_cfg,
)
from .rl_cfg import g1_amp_ppo_runner_cfg

# ---------------------------------------------------------------------------
# Base AMP locomotion (foundation). Trains the proprio-only walk policy used by
# the benchmark's deployment regime (--walk-recover) and the hardware
# walk<->dodge mode switch. The leap/goto predecessor cfgs the dodge tasks
# inherit through are kept in this package but are not registered as tasks.
# ---------------------------------------------------------------------------
register_mjlab_task(
  task_id="Unitree-G1-AMP-Flat",
  env_cfg=g1_amp_flat_env_cfg(),
  play_env_cfg=g1_amp_flat_env_cfg(play=True),
  rl_cfg=g1_amp_ppo_runner_cfg(),
  runner_cls=AMPOnPolicyRunner,
)

# ---------------------------------------------------------------------------
# Dodgeball tasks (the paper's perception regimes).
# ---------------------------------------------------------------------------

# STATE ORACLE: ground-truth ball pos+vel observed by the actor, no depth.
# The paper's "State oracle" perception regime (symmetric actor-critic).
register_mjlab_task(
  task_id="Unitree-G1-AMP-Dodge-MimicKit-Flat",
  env_cfg=g1_amp_dodge_mimickit_flat_env_cfg(),
  play_env_cfg=g1_amp_dodge_mimickit_flat_env_cfg(play=True),
  rl_cfg=g1_amp_dodge_mimickit_ppo_runner_cfg(),
  runner_cls=AMPOnPolicyRunner,
)

# FIXED / GIMBAL CAMERA: single head-mounted depth camera with ball-only masked
# depth (BallOnlyDepthObs): obs = ball at real depth, all else far. Mirrors the
# representation produced by the hardware EfficientTAM ball segmenter, which
# collapses the sim2real gap to the perception layer. The paper's "Fixed camera"
# regime as-is; the "Gimbal camera" regime is the same task run with
# CAMERA_GIMBAL=1 CAMERA_PROPRIO=1 (oracle-aimed 1-DoF camera pitch).
register_mjlab_task(
  task_id="Unitree-G1-AMP-Dodge-Depth-Single-BallOnly-Flat",
  env_cfg=g1_amp_dodge_depth_single_ballonly_flat_env_cfg(),
  play_env_cfg=g1_amp_dodge_depth_single_ballonly_flat_env_cfg(play=True),
  rl_cfg=g1_amp_dodge_depth_single_ppo_runner_cfg(),
  runner_cls=AMPOnPolicyRunner,
)
