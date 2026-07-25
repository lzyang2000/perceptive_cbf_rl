"""Unit tests for the omnidirectional fast-throw speed-solve (events.solve_ballistic_velocity).

CPU-only (pure projectile math, no sim) -- the env-level wiring (OMNI_THROW=1 on the state task)
is exercised by the integration smoke test below, which needs a GPU sim.
"""
import math

import torch

from src.tasks.amp_loco.mdp.events import solve_ballistic_velocity

G = 9.81


def _arrival_z(start, vel, gravity=G):
    """Integrate the projectile to the horizontal range of the (implicit) target and return the
    arrival height: t = horizontal_dist / horizontal_speed, z = z0 + vz*t - 0.5 g t^2."""
    vh = vel[..., :2].norm(dim=-1)
    return vh, vel[..., 2]


def test_speed_is_preserved():
    """The solved velocity has magnitude == the requested launch speed."""
    start = torch.tensor([[0.0, 0.0, 1.5], [3.0, -2.0, 1.0]])
    target = torch.tensor([[9.0, 0.0, 1.0], [3.0, 7.0, 0.4]])
    speed = torch.tensor([22.0, 24.0])
    vel = solve_ballistic_velocity(start, target, speed)
    assert torch.allclose(vel.norm(dim=-1), speed, atol=1e-3)


def test_passes_through_target():
    """Integrating the solved trajectory under gravity reaches the target xy AND z."""
    start = torch.tensor([[0.0, 0.0, 1.8]])
    target = torch.tensor([[9.5, 0.0, 0.7]])
    speed = torch.tensor([21.0])
    vel = solve_ballistic_velocity(start, target, speed)
    d = (target[:, :2] - start[:, :2]).norm(dim=-1)
    vh = vel[:, :2].norm(dim=-1)
    t = d / vh                                   # time to cover the horizontal range
    z = start[:, 2] + vel[:, 2] * t - 0.5 * G * t * t
    assert torch.allclose(z, target[:, 2], atol=1e-2)
    # horizontal direction points at the target
    dir_solved = vel[:, :2] / vh.unsqueeze(-1)
    dir_target = (target[:, :2] - start[:, :2]) / d.unsqueeze(-1)
    assert torch.allclose(dir_solved, dir_target, atol=1e-4)


def test_direct_arc_is_flat():
    """The chosen root is the DIRECT (low-elevation) arc: |vz| < horizontal speed for a fast,
    roughly level shot at 8-10 m / 20-25 m/s (elevation well under 45 deg)."""
    start = torch.tensor([[0.0, 0.0, 1.5]])
    target = torch.tensor([[9.0, 0.0, 1.1]])
    speed = torch.tensor([23.0])
    vel = solve_ballistic_velocity(start, target, speed)
    vh = vel[0, :2].norm().item()
    assert abs(vel[0, 2].item()) < vh           # elevation < 45 deg -> flat/direct arc


def test_omni_throw_flag_sets_state_env_params(monkeypatch):
    """OMNI_THROW=1 rewires the state (MimicKit) env's throw event to the omni/fast config.
    Calls the cfg builder directly (the flag is read at call time) -- no sim, no GPU needed."""
    monkeypatch.setenv("OMNI_THROW", "1")
    monkeypatch.delenv("CBF_JOINT", raising=False)
    import src.tasks  # noqa: F401
    from src.tasks.amp_loco.config.g1.dodge_env_cfgs import g1_amp_dodge_mimickit_flat_env_cfg
    cfg = g1_amp_dodge_mimickit_flat_env_cfg(play=False)
    p = cfg.events["throw_ball_on_dwell"].params
    assert p["omnidirectional"] is True
    assert p["launch_speed_range"] == (12.0, 15.0)
    assert p["dist_range"] == (8.0, 10.0)
    assert p["target_z_range"] == (0.3, 1.3)


def test_omni_throw_flag_off_keeps_front_cone(monkeypatch):
    """Without OMNI_THROW the state env keeps the default frontal-cone throw (no regression)."""
    monkeypatch.delenv("OMNI_THROW", raising=False)
    monkeypatch.delenv("CBF_JOINT", raising=False)
    import src.tasks  # noqa: F401
    from src.tasks.amp_loco.config.g1.dodge_env_cfgs import g1_amp_dodge_mimickit_flat_env_cfg
    cfg = g1_amp_dodge_mimickit_flat_env_cfg(play=False)
    p = cfg.events["throw_ball_on_dwell"].params
    assert p.get("omnidirectional", False) is False
    assert p.get("launch_speed_range") is None
    assert p["dist_range"] == (2.0, 3.0)


def test_omni_360_coverage_in_solver_inputs():
    """Sanity: the solver works for targets in any azimuth around the launch point (the omni
    throw samples bearing in [-pi, pi]); speed preserved and direction correct for all of them."""
    n = 16
    ang = torch.linspace(-math.pi, math.pi, n)
    start = torch.zeros(n, 3)
    start[:, 2] = 1.5
    dist = 9.0
    target = torch.stack([dist * torch.cos(ang), dist * torch.sin(ang), torch.full((n,), 0.9)], dim=-1)
    speed = torch.full((n,), 22.0)
    vel = solve_ballistic_velocity(start, target, speed)
    assert torch.allclose(vel.norm(dim=-1), speed, atol=1e-3)
    assert not torch.isnan(vel).any()
