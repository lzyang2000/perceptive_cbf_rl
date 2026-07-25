"""Tests for the extracted ``optimal_camera_pitch`` helper and the refactored
``aim_camera_at_ball`` event (Task 1 of the policy-controlled-gimbal plan).

The sim-based tests are guarded by ``pytest.mark.skipif(not torch.cuda.is_available(), ...)``.

IMPORTANT — import ordering: ``src.tasks.__init__`` is eagerly executed the first time any
``src.tasks.*`` module is imported (``import_packages`` auto-discovers and imports all
sub-packages).  Because the task registry PRE-BUILDS env cfgs at that point, env vars that
gate the cfg (e.g. ``CAMERA_GIMBAL=1``) MUST be set in ``os.environ`` before any
``src.tasks.*`` import runs in the same pytest process.  When the full suite runs this may
not be achievable.  We therefore bypass the global registry and call the cfg-builder function
directly, which reads env vars at call-time (not at module-import time), so we get a fresh
cfg with the gimbal joint wired in regardless of import order.
"""
from __future__ import annotations

import math
import os

import pytest
import torch


# ---------------------------------------------------------------------------
# Helpers shared by multiple tests
# ---------------------------------------------------------------------------

def _build_gimbal_env():
    """Set CAMERA_GIMBAL=1, call the cfg builder directly (bypasses the global registry),
    and return a live env with the gimbal joint in the robot articulation.

    We bypass ``load_env_cfg`` (returns a cached pre-built cfg) and call
    ``g1_amp_dodge_depth_single_ballonly_flat_env_cfg`` directly.  The function reads
    ``os.environ["CAMERA_GIMBAL"]`` at call time, so it always produces a fresh cfg
    with the gimbal wired in, independent of when ``src.tasks`` was first imported.
    """
    os.environ.update({
        "CAMERA_GIMBAL": "1",
        "CAMERA_TILT_DEG": "20",
        "BALLONLY_AUG": "0",
        # clear flags that might pull in other features
        "CBF_JOINT": "0",
        "DAGGER_TEACHER_OBS": "0",
    })
    # Import src.tasks so its sub-packages are registered (side-effect).
    # We DON'T use load_env_cfg() because the registry stores a pre-built cfg baked in at
    # first import, which may have been built without CAMERA_GIMBAL=1.
    import src.tasks  # noqa: F401

    from src.tasks.amp_loco.config.g1.dodge_env_cfgs import (
        g1_amp_dodge_depth_single_ballonly_flat_env_cfg,
    )
    from mjlab.envs import ManagerBasedRlEnv

    cfg = g1_amp_dodge_depth_single_ballonly_flat_env_cfg(play=False)
    cfg.scene.num_envs = 4
    env = ManagerBasedRlEnv(cfg=cfg, device="cuda")
    env.reset()
    return env


def _place_ball_airborne(env, robot, ball, x_offset=2.0, z_world=1.8, vx=-3.0):
    """Place ball at (robot_x + x_offset, robot_y, z_world) with velocity (vx, 0, 0).

    Uses write_root_link_pose_to_sim / write_root_link_velocity_to_sim (mjlab API).
    After writing, steps the sim once so data caches are refreshed.
    """
    N = env.num_envs
    dev = env.device

    robot_base_pos = robot.data.root_link_pos_w.clone()  # (N, 3)
    quat_identity = torch.zeros(N, 4, device=dev)
    quat_identity[:, 0] = 1.0  # w=1, x=y=z=0

    ball_pos = robot_base_pos.clone()
    ball_pos[:, 0] += x_offset
    ball_pos[:, 2] = z_world

    ball.write_root_link_pose_to_sim(
        torch.cat([ball_pos, quat_identity], dim=-1)
    )
    vel = torch.zeros(N, 6, device=dev)
    vel[:, 0] = vx  # world-frame x velocity (closing if negative)
    ball.write_root_link_velocity_to_sim(vel)

    env.sim.step()  # flush writes so data caches are current


def _place_ball_grounded(env, ball, ball_geom_id, x_offset=1.0):
    """Place ball resting on the floor (z = ball_radius, zero velocity)."""
    N = env.num_envs
    dev = env.device

    robot = env.scene["robot"]
    robot_base_pos = robot.data.root_link_pos_w.clone()
    ball_r = env.sim.model.geom_size[:, ball_geom_id, 0]  # (N,)

    quat_identity = torch.zeros(N, 4, device=dev)
    quat_identity[:, 0] = 1.0

    ball_pos = robot_base_pos.clone()
    ball_pos[:, 0] += x_offset
    ball_pos[:, 2] = ball_r  # center at ball_radius = resting

    ball.write_root_link_pose_to_sim(
        torch.cat([ball_pos, quat_identity], dim=-1)
    )
    ball.write_root_link_velocity_to_sim(torch.zeros(N, 6, device=dev))

    env.sim.step()  # flush writes


# ---------------------------------------------------------------------------
# Test 1: optimal_camera_pitch returns correct target_pitch and threat flag
# ---------------------------------------------------------------------------

@pytest.mark.skipif(not torch.cuda.is_available(), reason="needs GPU sim")
def test_optimal_camera_pitch_matches_legacy():
    """``optimal_camera_pitch`` returns the expected pitch and threat mask.

    Case A – ball in front of the robot, slightly above camera, moving toward the robot:
      * threat must be True for all envs.
      * target_pitch must be ≈ -elev (hand-computed from torso-frame geometry) and clamped
        to ±30°.

    Case B – ball resting on the floor (z ≈ ball_radius, zero velocity):
      * threat must be False for all envs.
    """
    from src.tasks.amp_loco.mdp.events import optimal_camera_pitch

    # Build the env.  _build_gimbal_env calls the cfg builder directly (bypasses the
    # global registry) so the gimbal joint is always present, regardless of import order.
    env = _build_gimbal_env()
    robot = env.scene["robot"]
    ball = env.scene["ball"]

    # Warm up the _gimbal_ids cache (first call to helper).
    optimal_camera_pitch(env, robot, ball)
    _, _, ball_geom_id, _ = env._gimbal_ids

    # ------------------------------------------------------------------
    # Case A: ball in front, airborne, closing toward the robot.
    # ------------------------------------------------------------------
    _place_ball_airborne(env, robot, ball, x_offset=2.0, z_world=1.8, vx=-3.0)

    target_pitch, threat = optimal_camera_pitch(env, robot, ball)

    # Threat: all envs should see the ball as a threat.
    assert threat.all(), f"Expected all threats (airborne+closing), got threat={threat}"

    # target_pitch must be finite and within the ±30° clamp.
    assert not torch.isnan(target_pitch).any(), "target_pitch contains NaN"
    lim = math.radians(30)
    assert (target_pitch.abs() <= lim + 1e-5).all(), \
        f"target_pitch out of ±30° clamp: {target_pitch}"

    # Verify numeric consistency: recompute elev from the same torso-frame math as the
    # helper and check that target_pitch == clamp(-elev, ±30°).
    from mjlab.utils.lab_api.math import quat_apply_inverse

    jid, bid, _, tid = env._gimbal_ids
    cam = robot.data.body_link_pos_w[:, bid, :]
    bp = ball.data.root_link_pos_w
    torso_quat = robot.data.body_link_quat_w[:, tid, :]
    d_torso = quat_apply_inverse(torso_quat, bp - cam)
    horiz = torch.linalg.norm(d_torso[:, :2], dim=-1).clamp(min=1e-6)
    elev = torch.atan2(d_torso[:, 2], horiz)
    expected_pitch = (-elev).clamp(-lim, lim)

    assert torch.allclose(target_pitch, expected_pitch, atol=1e-5), \
        f"Mismatch: target_pitch={target_pitch}, expected={expected_pitch}"

    # ------------------------------------------------------------------
    # Case B: ball at rest on the floor -> threat == False
    # ------------------------------------------------------------------
    _place_ball_grounded(env, ball, ball_geom_id, x_offset=1.0)

    _, threat2 = optimal_camera_pitch(env, robot, ball)
    assert not threat2.any(), \
        f"Expected no threats for grounded ball (z=ball_r, vel=0), got threat2={threat2}"


# ---------------------------------------------------------------------------
# Test 2: aim_camera_at_ball sets the same joint target as where(threat, pitch, 0)
# ---------------------------------------------------------------------------

@pytest.mark.skipif(not torch.cuda.is_available(), reason="needs GPU sim")
def test_aim_event_sets_same_target():
    """After refactor, ``aim_camera_at_ball`` must set the joint target equal to
    ``where(threat, target_pitch, 0)`` as computed by the shared helper.

    We set up a live threat (ball airborne + closing) and verify that the joint
    position target on the robot matches the helper's output.
    """
    from src.tasks.amp_loco.mdp.events import aim_camera_at_ball, optimal_camera_pitch

    # Build env via direct cfg-builder call so the gimbal joint is present.
    env = _build_gimbal_env()
    robot = env.scene["robot"]
    ball = env.scene["ball"]

    # Warm up the _gimbal_ids cache.
    optimal_camera_pitch(env, robot, ball)

    # Place the ball: airborne, in-range, closing.
    _place_ball_airborne(env, robot, ball, x_offset=1.5, z_world=1.5, vx=-4.0)

    # Call the helper to get the expected target.
    target_pitch, threat = optimal_camera_pitch(env, robot, ball)
    expected_target = torch.where(threat, target_pitch, torch.zeros_like(target_pitch))

    # Call the refactored event (env_ids=None -> step mode, acts on all envs).
    aim_camera_at_ball(env, env_ids=None, robot_name="robot", ball_name="ball")

    # Read back what the event wrote.
    jid = env._gimbal_ids[0]
    actual_target = robot.data.joint_pos_target[:, jid].squeeze(-1)   # (N,)

    assert torch.allclose(actual_target, expected_target, atol=1e-5), (
        f"aim_camera_at_ball joint target mismatch.\n"
        f"  expected = {expected_target}\n"
        f"  actual   = {actual_target}"
    )

