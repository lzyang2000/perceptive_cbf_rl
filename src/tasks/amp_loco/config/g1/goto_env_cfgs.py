"""Unitree G1 AMP **leap-to-goal** environment configurations.

Goal-conditioned variant of the leap task: instead of a sampled velocity command, a
``GoToGoalCommand`` term samples a target *point* and converts the base->goal error into
a velocity command each step. The policy's observation is unchanged -- it still sees only
a 3-vector velocity command (``command_name="twist"``); the goal coordinates never enter
the observation. The goal reaches the policy solely through that (decaying) velocity
command, which is the realistic, deployable decomposition (navigation layer -> velocity
-> locomotion policy).

What is learned (vs. a plain velocity tracker): the velocity-tracking rewards give dense
shaping toward the goal-derived command, while the goal rewards (distance, stop-at-goal,
arrival bonus) teach precise final approach and *stopping* at the target -- which is
non-trivial here because the AMP leap style actuates in discrete hops that cannot track
the small velocities commanded near the goal. The AMP discriminator (leap clips) keeps
the motion a leap.
"""

from mjlab.envs import ManagerBasedRlEnvCfg
from mjlab.managers.curriculum_manager import CurriculumTermCfg
from mjlab.managers.reward_manager import RewardTermCfg
from mjlab.managers.scene_entity_config import SceneEntityCfg

import src.tasks.amp_loco.mdp as mdp
from src.tasks.amp_loco.mdp.goal_command import GoToGoalCommandCfg

from .leap_env_cfgs import g1_amp_leap_flat_env_cfg, g1_amp_leap_rough_env_cfg

_ANCHOR = "torso_link"

# Stand ratio: fraction of envs whose command is forced to zero (stand still) instead of
# being driven toward a goal -- same mechanism as vanilla mjlab's
# UniformVelocityCommand.rel_standing_envs. Standing is rewarded by the retained
# velocity-tracking reward (zero command -> max reward when motionless); no separate pose
# reward is added (the AMP discriminator keeps the standing pose natural).
_STAND_RATIO = 0.1


def _apply_goto_overrides(cfg: ManagerBasedRlEnvCfg, play: bool) -> ManagerBasedRlEnvCfg:
  # --- Replace the velocity command with a goal-point -> velocity command. ---
  cfg.commands["twist"] = GoToGoalCommandCfg(
    entity_name="robot",
    resampling_time_range=(6.0, 10.0),
    radius=(0.5, 2.0),  # grown by the curriculum below
    rel_standing_envs=_STAND_RATIO,
    kp=1.5,
    kp_yaw=1.0,
    # Velocity clamps derived from the leap clips' body-frame root speeds
    # (see scripts/clip_velocity_stats.py): forward/back peak ~1.3/1.1 m/s,
    # lateral peak ~2.0 (p95 ~1.4) m/s. Clamping near the data peak keeps the
    # goal-derived command inside the achievable leap envelope.
    max_lin_vel_x=1.3,
    max_lin_vel_y=1.5,
    max_ang_vel_z=0.5,  # moot: simple_heading=False -> commanded yaw is 0.
    arrive_radius=0.25,
    dwell_time_range=(1.0, 3.0),
    # Dodge-style: do NOT turn to face the goal. The robot leaps to the point in
    # whatever body-relative direction it lies (sideways / backward / diagonal) while
    # holding its heading -- i.e. "leap out of the way" without reorienting. This
    # exercises omnidirectional leaps and keeps the torso facing forward (toward a
    # future thrower). With simple_heading=False the yaw command is 0, so the retained
    # track_anchor_angular_velocity reward becomes a "don't spin" / hold-heading term.
    simple_heading=False,
    debug_vis=True,
  )

  # --- Goal rewards (on top of the velocity-tracking + AMP-style rewards). ---
  cfg.rewards["goal_distance"] = RewardTermCfg(
    func=mdp.goal_distance_reward,
    weight=1.0,
    params={"command_name": "twist", "std": 1.5},
  )
  cfg.rewards["goal_progress"] = RewardTermCfg(
    func=mdp.goal_progress_reward,
    weight=0.5,
    params={"command_name": "twist", "clip": 2.0},
  )
  cfg.rewards["goal_reached"] = RewardTermCfg(
    func=mdp.goal_reached_bonus,
    weight=2.0,
    params={
      "command_name": "twist",
      "threshold": 0.3,
      "speed_threshold": 0.5,
      "asset_cfg": SceneEntityCfg("robot"),
    },
  )
  cfg.rewards["stop_at_goal"] = RewardTermCfg(
    func=mdp.stop_at_goal_cost,
    weight=-0.5,
    params={
      "command_name": "twist",
      "threshold": 0.5,
      "asset_cfg": SceneEntityCfg("robot"),
    },
  )
  # Flight-phase reward: rewards a genuine both-feet-airborne phase so the policy leaps
  # toward the goal instead of scraping (sliding with feet glued down). Coarse "leave
  # the ground" signal; AMP shapes the leap's appearance. min_flight_s=0.05 sits below
  # the reference clips' measured flight (~0.1-0.28 s) so real leaps still pay, while
  # filtering contact flicker / micro-bounces. Modest weight keeps AMP+goal dominant.
  cfg.rewards["leap_flight"] = RewardTermCfg(
    func=mdp.leap_flight_time,
    weight=2.0,
    params={
      "sensor_name": "feet_ground_contact",
      "command_name": "twist",
      "min_flight_s": 0.05,
      "command_threshold": 0.1,
    },
  )

  # --- Curriculum: grow the goal radius as training progresses. ---
  if not play:
    cfg.curriculum = dict(cfg.curriculum) if cfg.curriculum else {}
    cfg.curriculum["goal_radius"] = CurriculumTermCfg(
      func=mdp.goal_radius_curriculum,
      params={
        "command_name": "twist",
        "start_radius": 0.5,
        "final_radius": 2.0,
        # Global env steps to reach full radius. ~24 env steps per training iter, so
        # 40k steps ~= 1.7k iters of ramp before goals top out at 2.0 m.
        "steps_to_full": 40_000.0,
      },
    )

  return cfg


def g1_amp_leap_goto_flat_env_cfg(play: bool = False) -> ManagerBasedRlEnvCfg:
  """G1 AMP leap-to-goal task on flat terrain."""
  cfg = g1_amp_leap_flat_env_cfg(play=play)
  return _apply_goto_overrides(cfg, play)


def g1_amp_leap_goto_rough_env_cfg(play: bool = False) -> ManagerBasedRlEnvCfg:
  """G1 AMP leap-to-goal task on rough terrain."""
  cfg = g1_amp_leap_rough_env_cfg(play=play)
  return _apply_goto_overrides(cfg, play)
