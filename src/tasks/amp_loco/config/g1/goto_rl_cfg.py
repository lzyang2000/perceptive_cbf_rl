"""RL configuration for the Unitree G1 AMP leap-to-goal task.

Same AMP runner as the leap task (discriminator fed the leap clips), with a distinct
experiment name so goal-conditioned runs log separately.
"""

import os

from .leap_rl_cfg import g1_amp_leap_ppo_runner_cfg
from .rl_cfg import RslRlAmpRunnerCfg

# Dodge AMP discriminator dataset: leap clips + standing evasive clips (reactive dodges +
# one-foot balance), loaded recursively (Leap/ + Dodge/ subdirs). Recipe: the leap half is
# amp_leap_manifest.txt (copied verbatim from amp_leap), the standing half is
# amp_dodge_manifest.txt. Distinct from the leap _LEAP_MOTION_DIR so the leap/goto tasks'
# style prior stays leap-only.
_DODGE_MOTION_DIR = os.path.normpath(
  os.path.join(
    os.path.dirname(os.path.abspath(__file__)),
    os.pardir, os.pardir, os.pardir, os.pardir, os.pardir,
    "src", "assets", "motions", "g1", "amp_dodge",
  )
)


def g1_amp_leap_goto_ppo_runner_cfg() -> RslRlAmpRunnerCfg:
  cfg = g1_amp_leap_ppo_runner_cfg()
  cfg.experiment_name = "g1_amp_leap_goto"
  cfg.save_interval = 1000  # checkpoint + ONNX export every 1000 iterations
  return cfg


def g1_amp_dodge_ppo_runner_cfg() -> RslRlAmpRunnerCfg:
  """Base dodge runner: same as the goto runner, but the AMP discriminator is fed the
  combined leap + standing-evasion dataset (``amp_dodge``) instead of leap-only."""
  cfg = g1_amp_leap_goto_ppo_runner_cfg()
  cfg.experiment_name = "g1_amp_dodge"
  cfg.amp_motion_files = _DODGE_MOTION_DIR
  return cfg


def g1_amp_dodge_depth_ppo_runner_cfg() -> RslRlAmpRunnerCfg:
  """Runner cfg for the depth-camera dodge task.

  Same AMP runner as the dodge task, but the actor and critic each take an extra
  ``depth`` observation group: the flattened, normalized [B, 180] (9x20) depth
  vector is concatenated with the existing proprio/privileged 1-D obs and fed
  straight into the policy/value MLP -- NO CNN. The head-fixed camera makes a
  pixel's location a direct bearing cue, and a position-sensitive fully-connected
  layer suits that better than a translation-invariant conv; at 180 px the image is
  small enough to flatten outright. The models stay ``MLPModel`` (the goto default),
  so only ``obs_groups`` changes. The AMP discriminator reads only ``amp`` and inherits the
  combined leap + standing-evasion dataset from ``g1_amp_dodge_ppo_runner_cfg``.
  """
  cfg = g1_amp_dodge_ppo_runner_cfg()
  cfg.experiment_name = "g1_amp_dodge_depth"
  # Protect the AMP (leap-style) reward share so the dodge task can't dilute the jump --
  # MimicKit/SMP holds style at a fixed ~50% (arXiv:2512.03028). Our blend is
  # reward = (1-lerp)*coef*disc + lerp*task; the goto defaults (coef 0.3, lerp 0.6) left
  # style <~15% of a large task-reward stack, so the leap degraded under the dodge rewards.
  # Bump toward 50/50: disc magnitude up (coef 0.3->0.5) and blend weight up (lerp 0.6->0.5).
  # Combined with the de-emphasized goal-nav rewards below (smaller task side), style is now
  # a meaningful, protected fraction. Monitor Episode_Reward AMP/disc vs task and jump quality.
  cfg.amp_reward_coef = 0.5
  cfg.amp_task_reward_lerp = 0.5
  # actor sees proprio history + depth. critic additionally gets the privileged
  # "critic_dodge" group (ground-truth ball + CBF/filter state) -- asymmetric actor-critic:
  # the critic values from clean state the actor must infer from depth, never given to the
  # deployed policy.
  cfg.obs_groups = {
    "actor": ("actor", "depth"),
    "critic": ("critic", "depth", "critic_dodge"),
  }
  return cfg


def g1_amp_dodge_mimickit_ppo_runner_cfg() -> RslRlAmpRunnerCfg:
  """Runner cfg for the MimicKit-style dodge task (ground-truth ball-state obs).

  The faithful MimicKit/SMP baseline: the actor and critic both see the 6-D ball-state
  observation (relative pos+vel in the heading frame) on top of the proprio, and the reward
  is MimicKit's dodgeball reward (set in the env cfg). MimicKit's PPO is symmetric -- actor
  and critic share the obs -- so both sets get the same ``ball_state`` group (no privileged
  critic). The protected ~50/50 style blend (coef/lerp 0.5) is kept so the leap prior is not
  diluted, exactly as for the depth task. Models stay ``MLPModel`` (6-D ball obs, no CNN).
  """
  cfg = g1_amp_dodge_depth_ppo_runner_cfg()
  cfg.experiment_name = "g1_amp_dodge_mimickit"
  cfg.obs_groups = {
    "actor": ("actor", "ball_state"),
    "critic": ("critic", "ball_state"),
  }
  return cfg


def g1_amp_dodge_depth_mimickit_ppo_runner_cfg() -> RslRlAmpRunnerCfg:
  """Runner cfg for the depth-obs + MimicKit-reward dodge task.

  Same actor/critic obs wiring as the CBF-RL depth task (actor sees proprio+depth; critic
  additionally gets the privileged ``critic_dodge`` group) -- only the env reward differs
  (MimicKit's dodgeball reward instead of the CBF-RL reward). Inherits the protected
  ~50/50 style blend from the depth runner.
  """
  cfg = g1_amp_dodge_depth_ppo_runner_cfg()
  cfg.experiment_name = "g1_amp_dodge_depth_mimickit"
  return cfg


def g1_amp_dodge_depth_single_ppo_runner_cfg() -> RslRlAmpRunnerCfg:
  """Runner cfg for the SINGLE level-camera depth dodge task.

  Identical to the MimicKit depth runner -- the actor auto-sizes to the single camera's 144-dim
  depth obs -- but with its OWN ``experiment_name`` so its runs (and wandb group) don't intermix
  with the base ``g1_amp_dodge_depth_mimickit`` runs in the same log dir.
  """
  cfg = g1_amp_dodge_depth_mimickit_ppo_runner_cfg()
  cfg.experiment_name = "g1_amp_dodge_depth_single"
  return cfg







