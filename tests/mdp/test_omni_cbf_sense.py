"""Integration test: omni-aware CBF sense_radius scaling (4m -> 12m under OMNI_THROW).

Proves that the 4bdce87 fix is load-bearing:
  - With sense_radius=12 (OMNI_THROW=1 default) the CBF threat gate fires from the moment
    an omni ball is launched (8-10 m away), because dist < 12 m.
  - With sense_radius=4 (CBF_SENSE_RADIUS=4, old default) it does NOT fire at launch, because
    the ball starts > 4 m from the robot.

GPU required (builds a full sim env).  Keep num_envs tiny (64) to share GPU 0 safely with any
concurrent training run.  The test steps physics exactly ONCE (via mujoco_warp.forward) then
calls process_action directly, so GPU time is negligible.

Sim step flow note: env.step() runs process_action THEN physics THEN events.  The throw event
fires AFTER process_action, so the CBF only sees the thrown ball on the next step.  The test
bypasses this by writing the ball state, propagating via mujoco_warp.forward + entity.update(),
then calling process_action directly -- identical to what happens when the CBF sees a ball that
was thrown on the previous step.
"""
import math
import os

import torch
import pytest


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _build_state_cbf_env(num_envs: int, sense_radius_override: str | None = None):
    """Build the MimicKit state env with OMNI_THROW=1 and CBF_JOINT=1.

    Calls the cfg builder directly (not load_env_cfg) so all env-vars are read
    fresh at call time rather than at import time.
    """
    if sense_radius_override is not None:
        os.environ["CBF_SENSE_RADIUS"] = sense_radius_override
    else:
        os.environ.pop("CBF_SENSE_RADIUS", None)
    os.environ.update({
        "OMNI_THROW": "1",
        "CBF_JOINT": "1",
        "CBF_JOINT_APPLY_FILTER": "0",   # reward shaping only; don't override actions
        "CBF_JOINT_LAMBDA_CORR": "0",
        "CBF_JOINT_LAMBDA_BUF": "0",
    })

    import src.tasks  # noqa: F401 -- triggers task registration side-effect
    from mjlab.envs import ManagerBasedRlEnv
    from src.tasks.amp_loco.config.g1.dodge_env_cfgs import g1_amp_dodge_mimickit_flat_env_cfg

    cfg = g1_amp_dodge_mimickit_flat_env_cfg(play=False)
    cfg.scene.num_envs = num_envs
    env = ManagerBasedRlEnv(cfg=cfg, device="cuda")
    env.reset()
    return env


def _place_omni_ball_and_run_cbf(env):
    """Write omni-throw ball states (8-10 m, 20-25 m/s, all directions), propagate physics,
    and run process_action so env._cbf_joint_threat reflects the threat gate.

    Returns the threat tensor (N,) bool.

    The sim step flow is: process_action -> physics -> events (throw fires here).
    So the CBF sees a freshly thrown ball on the NEXT step.  We simulate this by:
      1. write_root_link_{pose,velocity}_to_sim  (as throw_ball_on_dwell does)
      2. scene.write_data_to_sim() + mujoco_warp.forward()  (propagate to sim buffers)
      3. ball.update()  (refresh entity data tensors from sim buffers)
      4. process_action  (CBF reads updated ball.data.root_link_{pos,vel}_w)
    """
    from src.tasks.amp_loco.mdp.events import solve_ballistic_velocity
    import mujoco_warp as mjw

    G = 9.81
    n = env.num_envs
    dev = env.device

    g = torch.Generator(device=dev).manual_seed(42)
    robot = env.scene["robot"]
    ball = env.scene["ball"]

    rp = robot.data.root_link_pos_w  # (N, 3)

    bearing = torch.rand(n, generator=g, device=dev) * (2 * math.pi) - math.pi
    dist = torch.rand(n, generator=g, device=dev) * 2.0 + 8.0    # U(8, 10)
    start = torch.empty(n, 3, device=dev)
    start[:, 0] = rp[:, 0] + dist * torch.cos(bearing)
    start[:, 1] = rp[:, 1] + dist * torch.sin(bearing)
    start[:, 2] = torch.rand(n, generator=g, device=dev) * 0.8 + 1.5  # U(1.5, 2.3)

    speed = torch.rand(n, generator=g, device=dev) * 5.0 + 20.0   # U(20, 25)
    target = rp.clone()
    target[:, 2] = torch.rand(n, generator=g, device=dev) * 1.0 + 0.3  # U(0.3, 1.3)

    vel = solve_ballistic_velocity(start, target, speed, gravity=G)

    quat = torch.zeros(n, 4, device=dev)
    quat[:, 0] = 1.0
    ball.write_root_link_pose_to_sim(torch.cat([start, quat], dim=-1))
    rv = torch.zeros(n, 6, device=dev)
    rv[:, 0:3] = vel
    ball.write_root_link_velocity_to_sim(rv)

    # Propagate writes into the physics buffers so ball.data reflects them.
    env.scene.write_data_to_sim()
    mjw.forward(env.sim.wp_model, env.sim.wp_data)
    ball.update(env.step_dt)

    # Run the CBF action term (reads current ball.data.root_link_{pos,vel}_w).
    zero_action = torch.zeros(n, env.action_manager.total_action_dim, device=dev)
    env.action_manager.process_action(zero_action)

    return env._cbf_joint_threat


# ---------------------------------------------------------------------------
# Tests
# ---------------------------------------------------------------------------

@pytest.mark.skipif(not torch.cuda.is_available(), reason="needs GPU sim")
def test_sense_radius_12_fires_at_omni_launch():
    """With sense_radius=12 the CBF threat fires immediately at omni-throw launch (8-10 m away)."""
    env = _build_state_cbf_env(num_envs=64)
    term = env.action_manager.get_term("joint_pos")

    # Confirm the env picked up sense_radius=12 (OMNI_THROW=1 default, no override).
    assert abs(term.cfg.sense_radius - 12.0) < 1e-9, (
        f"Expected sense_radius=12.0 under OMNI_THROW=1, got {term.cfg.sense_radius}"
    )

    threat = _place_omni_ball_and_run_cbf(env)
    frac = threat.float().mean().item()

    # At 8-10 m launch distance and sense_radius=12, dist < 12 for all envs -> all threatened
    # (modulo a tiny fraction where nu<=0, e.g. ball still moving away at first forward pass;
    # in practice solve_ballistic_velocity always produces a closing trajectory -> near 100%).
    # Require >=80% to give a safe margin against edge cases.
    assert frac >= 0.80, (
        f"Expected >=80% of envs threatened at launch with sense_radius=12, got {frac:.1%}. "
        f"This means the 12 m sense_radius is NOT engaging at the 8-10 m omni launch range."
    )


@pytest.mark.skipif(not torch.cuda.is_available(), reason="needs GPU sim")
def test_sense_radius_4_does_not_fire_at_omni_launch():
    """With sense_radius=4 (old default) the CBF threat does NOT fire at omni-throw launch (8-10 m).

    This is the control case that proves the scaling matters: the ball is 8-10 m from the robot,
    which is outside the 4 m gate, so the CBF is blind at launch.  It would only engage with
    ~0.18 s of lead time -- far too late for a 20-25 m/s ball.
    """
    env = _build_state_cbf_env(num_envs=64, sense_radius_override="4.0")
    term = env.action_manager.get_term("joint_pos")

    assert abs(term.cfg.sense_radius - 4.0) < 1e-9, (
        f"Expected sense_radius=4.0 via CBF_SENSE_RADIUS=4, got {term.cfg.sense_radius}"
    )

    threat = _place_omni_ball_and_run_cbf(env)
    frac = threat.float().mean().item()

    # Ball is 8-10 m from every body point; sense_radius=4 -> dist > sense_radius for all envs.
    # Allow <5% for any numerical edge case.
    assert frac <= 0.05, (
        f"Expected <5% of envs threatened at launch with sense_radius=4 (ball at 8-10m), "
        f"got {frac:.1%}.  The sense_radius=4 gate should not engage at the omni launch range."
    )
