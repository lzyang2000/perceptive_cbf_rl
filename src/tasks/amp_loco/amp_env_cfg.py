"""Velocity using AMP task configuration.

This module provides a factory function to create a base velocity AMP task config.
Robot-specific configurations call the factory and customize as needed.
"""

import math
from dataclasses import replace

from mjlab.envs import ManagerBasedRlEnvCfg
from mjlab.envs import mdp as envs_mdp
from mjlab.envs.mdp import dr
from mjlab.envs.mdp.actions import JointPositionActionCfg
from mjlab.managers.action_manager import ActionTermCfg
from mjlab.managers.command_manager import CommandTermCfg
from mjlab.managers.curriculum_manager import CurriculumTermCfg
from mjlab.managers.event_manager import EventTermCfg
from mjlab.managers.metrics_manager import MetricsTermCfg
from mjlab.managers.observation_manager import ObservationGroupCfg, ObservationTermCfg
from mjlab.managers.reward_manager import RewardTermCfg
from mjlab.managers.scene_entity_config import SceneEntityCfg
from mjlab.managers.termination_manager import TerminationTermCfg
from mjlab.scene import SceneCfg
from mjlab.sensor import GridPatternCfg, ObjRef, RayCastSensorCfg
from mjlab.sim import MujocoCfg, SimulationCfg
from mjlab.tasks.velocity import mdp
from mjlab.tasks.velocity.mdp import UniformVelocityCommandCfg
from mjlab.terrains import TerrainEntityCfg
from mjlab.terrains.config import ROUGH_TERRAINS_CFG
from mjlab.utils.noise import UniformNoiseCfg as Unoise
from mjlab.viewer import ViewerConfig

import src.tasks.amp_loco.mdp as mdp
from src.tasks.amp_loco.mdp.terrain import RANDOM_ROUGH_TERRAINS_CFG

def make_amp_env_cfg() -> ManagerBasedRlEnvCfg:
  """Create AMP Locomotion task configuration."""

  ##
  # Sensors
  ##

  terrain_scan = RayCastSensorCfg(
    name="terrain_scan",
    frame=ObjRef(type="body", name="", entity="robot"),  # Set per-robot.
    ray_alignment="yaw",
    pattern=GridPatternCfg(size=(1.6, 1.0), resolution=0.1),
    max_distance=5.0,
    exclude_parent_body=True,
    debug_vis=True,
    viz=RayCastSensorCfg.VizCfg(show_normals=True),
  )

  ##
  # Observations
  ##

  actor_terms = {
    "base_ang_vel": ObservationTermCfg(
      func=mdp.builtin_sensor,
      params={"sensor_name": "robot/imu_ang_vel"},
      noise=Unoise(n_min=-0.2, n_max=0.2),
    ),
    "projected_gravity": ObservationTermCfg(
      func=mdp.projected_gravity,
      noise=Unoise(n_min=-0.05, n_max=0.05),
    ),
    "command": ObservationTermCfg(
      func=mdp.generated_commands,
      params={"command_name": "twist"},
    ),
    "joint_pos": ObservationTermCfg(
      func=mdp.joint_pos_rel,
      noise=Unoise(n_min=-0.01, n_max=0.01),
    ),
    "joint_vel": ObservationTermCfg(
      func=mdp.joint_vel_rel,
      noise=Unoise(n_min=-0.5, n_max=0.5),
    ),
    "actions": ObservationTermCfg(func=mdp.last_action),
  }

  critic_terms = {
    **actor_terms,
    "base_lin_vel": ObservationTermCfg(
      func=mdp.builtin_sensor,
      params={"sensor_name": "robot/imu_lin_vel"},
    ),
    "body_pos_b": ObservationTermCfg(
    func=mdp.robot_body_pos_b,
        params={
            "anchor_cfg": SceneEntityCfg("robot", body_names=()),
            "body_cfg": SceneEntityCfg("robot", body_names=()),
        },
    ),
    "body_ori_b": ObservationTermCfg(
        func=mdp.robot_body_ori_b,
        params={
            "anchor_cfg": SceneEntityCfg("robot", body_names=()),
            "body_cfg": SceneEntityCfg("robot", body_names=()),
        },
    ),
  }

  amp_terms = {
    "body_pos_b": ObservationTermCfg(
    func=mdp.robot_body_pos_b,
        params={
            "anchor_cfg": SceneEntityCfg("robot", body_names=()),
            "body_cfg": SceneEntityCfg("robot", body_names=()),
        },
    ),
    "body_ori_b": ObservationTermCfg(
        func=mdp.robot_body_ori_b,
        params={
            "anchor_cfg": SceneEntityCfg("robot", body_names=()),
            "body_cfg": SceneEntityCfg("robot", body_names=()),
        },
    ),
    "body_lin_vel_b": ObservationTermCfg(
        func=mdp.robot_body_lin_vel_b,
        params={
            "anchor_cfg": SceneEntityCfg("robot", body_names=()),
            "body_cfg": SceneEntityCfg("robot", body_names=()),
        },
    ),
    "body_ang_vel_b": ObservationTermCfg(
        func=mdp.robot_body_ang_vel_b,
        params={
            "anchor_cfg": SceneEntityCfg("robot", body_names=()),
            "body_cfg": SceneEntityCfg("robot", body_names=()),
        },
    ),
  }

  observations = {
    "actor": ObservationGroupCfg(
      terms=actor_terms,
      concatenate_terms=True,
      enable_corruption=True,
      history_length=4,
      # history_ordering="time",
    ),
    "critic": ObservationGroupCfg(
      terms=critic_terms,
      concatenate_terms=True,
      enable_corruption=False,
      history_length=4,
      # history_ordering="time",
    ),
    "amp": ObservationGroupCfg(
      terms=amp_terms,
      concatenate_terms=True,
      enable_corruption=False,
      history_length=1,
    ),
  }

  ##
  # Metrics
  ##

  metrics = {
    "mean_action_acc": MetricsTermCfg(
      func=mdp.mean_action_acc,
    ),
    "mean_delay_steps": MetricsTermCfg(
      func=mdp.mean_delay_steps,
    ),
  }

  ##
  # Actions
  ##

  actions: dict[str, ActionTermCfg] = {
    "joint_pos": JointPositionActionCfg(
      entity_name="robot",
      actuator_names=(".*",),
      scale=0.25,  # Override per-robot.
      use_default_offset=True,
    )
  }

  ##
  # Commands
  ##

  commands: dict[str, CommandTermCfg] = {
    "twist": UniformVelocityCommandCfg(
      entity_name="robot",
      resampling_time_range=(3.0, 8.0),
      rel_standing_envs=0.05,
      rel_heading_envs=0.25,
      heading_command=True,
      heading_control_stiffness=0.5,
      debug_vis=True,
      ranges=UniformVelocityCommandCfg.Ranges(
        lin_vel_x=(-1.5, 3.0),
        lin_vel_y=(-1.0, 1.0),
        ang_vel_z=(-3.14 / 2, 3.14 / 2),
        heading=(-math.pi / 2, math.pi / 2),
      ),
    )
  }

  ##
  # Events
  ##

  events = {
    "init_motion_loader": EventTermCfg(
      func=mdp.init_motion_loader,
      mode="startup",
      params={
        "motion_dir": "",  # Set per-robot.
        "recovery_dir": None,
        "delay_reset_env_ratio": 0.0,
        "max_delay_steps": 0,
      },
    ),
    "reset_from_motion": EventTermCfg(
      func=mdp.reset_from_motion_data,
      mode="reset",
      params={
        "motion_dir": "",  # Set per-robot (must match init_motion_loader).
        "asset_cfg": SceneEntityCfg("robot", joint_names=(".*",)),
      },
    ),
    "push_robot": EventTermCfg(
      func=mdp.push_by_setting_velocity,
      mode="interval",
      interval_range_s=(1.0, 3.0),
      params={
        "velocity_range": {
          "x": (-1.0, 1.0),
          "y": (-0.5, 0.5),
          "z": (-0.4, 0.4),
          "roll": (-0.52, 0.52),
          "pitch": (-0.52, 0.52),
          "yaw": (-0.78, 0.78),
        },
      },
    ),
    "foot_friction": EventTermCfg(
      mode="startup",
      func=dr.geom_friction,
      params={
        "asset_cfg": SceneEntityCfg("robot", geom_names=()),  # Set per-robot.
        "operation": "abs",
        "ranges": (0.3, 1.2),
        "shared_random": True,  # All foot geoms share the same friction.
      },
    ),
    "encoder_bias": EventTermCfg(
      mode="startup",
      func=dr.encoder_bias,
      params={
        "asset_cfg": SceneEntityCfg("robot"),
        "bias_range": (-0.015, 0.015),
      },
    ),
    "base_com": EventTermCfg(
      mode="startup",
      func=dr.body_com_offset,
      params={
        "asset_cfg": SceneEntityCfg("robot", body_names=()),  # Set per-robot.
        "operation": "add",
        "ranges": {
          0: (-0.025, 0.025),
          1: (-0.025, 0.025),
          2: (-0.03, 0.03),
        },
      },
    ),
  }

  ##
  # Rewards
  ##

  rewards = {
    "track_anchor_linear_velocity": RewardTermCfg(
      func=mdp.track_anchor_linear_velocity,
      weight=1.0,
        params={"command_name": "twist", 
                "std": 1.0,
                "mask_delay": True,
                "delay_env_rew_ratio": 0.0,
                "anchor_cfg": SceneEntityCfg("robot", body_names=()),},
    ),
    "track_anchor_angular_velocity": RewardTermCfg(
      func=mdp.track_anchor_angular_velocity,
      weight=1.0,
        params={"command_name": "twist", "std": 3.14,
                "mask_delay": True,
                "delay_env_rew_ratio": 0.0,
                "anchor_cfg": SceneEntityCfg("robot", body_names=()),},
    ),
    "track_root_height": RewardTermCfg(
      func=mdp.track_root_height,
      weight=1.0,
        params={"std": 0.3,
                "mask_delay": True,
                "delay_env_rew_ratio": 3.5},
    ),
    "body_ang_vel_xy_l2": RewardTermCfg(
      func=mdp.body_ang_vel_xy_l2,
      weight=0.5,
        params={"std": 3.14,
                "mask_delay": True,
                "delay_env_rew_ratio": 0.0,
                "body_cfg": SceneEntityCfg("robot", body_names=("pelvis",)),},
    ),
    
    "is_terminated": RewardTermCfg(func=mdp.is_terminated, weight=-200.0),
    "joint_acc_l2": RewardTermCfg(func=mdp.joint_acc_l2, weight=-2.5e-7),
    "joint_pos_limits": RewardTermCfg(func=mdp.joint_pos_limits, weight=-10.0),
    "action_rate_l2": RewardTermCfg(func=mdp.action_rate_l2, weight=-0.01),
    
    "foot_slip": RewardTermCfg(
      func=mdp.feet_slip,
      weight=-0.25,
      params={
        "sensor_name": "feet_ground_contact",
        "command_name": "twist",
        "command_threshold": 0.1,
        "asset_cfg": SceneEntityCfg("robot", site_names=()),  # Set per-robot.
      },
    ),
    # "soft_landing": RewardTermCfg(
    #   func=mdp.soft_landing,
    #   weight=-1e-3,
    #   params={
    #     "sensor_name": "feet_ground_contact",
    #     "command_name": "twist",
    #     "command_threshold": 0.1,
    #   },
    # ),
    "self_collisions": RewardTermCfg(
      func=mdp.self_collision_cost,
      weight=-0.1,
      params={"sensor_name": "self_collision", "force_threshold": 10.0},
    ),
  }

  ##
  # Terminations
  ##

  terminations = {
    "time_out": TerminationTermCfg(func=mdp.time_out, time_out=True),
    "bad_orientation": TerminationTermCfg(
      func=mdp.bad_orientation,
      params={"limit_angle": math.radians(70.0)},
    ),
    "bad_base_height": TerminationTermCfg(
      func=mdp.root_height_below_minimum,
      params={"minimum_height": 0.5,},
    ),
  }

  ##
  # Assemble and return
  ##

  return ManagerBasedRlEnvCfg(
    scene=SceneCfg(
      terrain=TerrainEntityCfg(
        terrain_type="generator",
        terrain_generator=replace(ROUGH_TERRAINS_CFG),
        max_init_terrain_level=5,
      ),
      sensors=(terrain_scan,),
      num_envs=1,
      extent=2.0,
    ),
    observations=observations,
    actions=actions,
    commands=commands,
    events=events,
    rewards=rewards,
    terminations=terminations,
    curriculum={},
    metrics=metrics,
    viewer=ViewerConfig(
      origin_type=ViewerConfig.OriginType.ASSET_BODY,
      entity_name="robot",
      body_name="",  # Set per-robot.
      distance=3.0,
      elevation=-5.0,
      azimuth=90.0,
    ),
    sim=SimulationCfg(
      nconmax=35,
      njmax=1500,
      mujoco=MujocoCfg(
        timestep=0.005,
        iterations=10,
        ls_iterations=20,
      ),
    ),
    decimation=4,
    episode_length_s=20.0,
  )





