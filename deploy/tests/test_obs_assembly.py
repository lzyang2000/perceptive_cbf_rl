"""Obs-assembly contract tests for dodge_policy.

Reproduces, in pure numpy, the exact actor-obs vector the sim builds for the
``Unitree-G1-AMP-Dodge-Depth-Single-Flat`` policy:

  actor input = actor_proprio(384) ++ depth(144 * n_offsets)

* proprio is a 4-frame TERM-MAJOR history (oldest->newest per term), term order
  base_ang_vel, projected_gravity, command, joint_pos, joint_vel, actions
  (matches src/tasks/amp_loco/amp_env_cfg.py actor_terms + mjlab default
  history_ordering="term").
* depth stacks the ring buffer at frame_offsets NEWEST->OLDEST (offset 0 first),
  each frame the DepthImageObs-normalised [0,1] 144-vector (no-hit->far, clamp,
  normalise) -- matches mdp/observations.py DepthImageObs.__call__.

A layout/offset drift here is a fall on the robot, so these pin it. No sim, no
GPU: the layout is hand-derived from the config.
"""

import os
import sys

import numpy as np

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from deploy.policy import dodge_policy as P


# ---------------------------------------------------------------------------
# Depth metres -> normalised obs (DepthImageObs._one, no aug / no ground-far-out)
# ---------------------------------------------------------------------------
def test_depth_metres_to_obs():
    near, far = 0.1, 5.0
    frame = np.array([0.05, 0.1, 5.0, 2.55], dtype=np.float32)  # below-near, near, far, mid
    out = P.depth_metres_to_obs(frame, near, far)
    # below-near -> far -> 1; near -> 0; far -> 1; mid 2.55 -> (2.55-0.1)/4.9 = 0.5
    np.testing.assert_allclose(out, [1.0, 0.0, 1.0, 0.5], atol=1e-6)


def test_depth_metres_to_obs_clamps_above_far():
    near, far = 0.1, 5.0
    out = P.depth_metres_to_obs(np.array([1000.0], dtype=np.float32), near, far)
    np.testing.assert_allclose(out, [1.0], atol=1e-6)


# ---------------------------------------------------------------------------
# Proprio term-major history
# ---------------------------------------------------------------------------
def test_proprio_dim_is_384_at_history_4():
    h = P.ProprioHistory(history_length=4)
    h.append(
        base_ang_vel=np.zeros(3), proj_grav=np.zeros(3), command=np.zeros(3),
        joint_pos_rel=np.zeros(29), joint_vel_rel=np.zeros(29), last_action=np.zeros(29),
    )
    assert h.vector().shape == (384,)


def test_proprio_term_major_layout():
    # history_length=2, distinct per-term sentinel values so the layout is checkable.
    h = P.ProprioHistory(history_length=2)
    # frame 0
    h.append(
        base_ang_vel=np.full(3, 10.0), proj_grav=np.full(3, 20.0), command=np.full(3, 30.0),
        joint_pos_rel=np.full(29, 40.0), joint_vel_rel=np.full(29, 50.0), last_action=np.full(29, 60.0),
    )
    # frame 1 (newest)
    h.append(
        base_ang_vel=np.full(3, 11.0), proj_grav=np.full(3, 21.0), command=np.full(3, 31.0),
        joint_pos_rel=np.full(29, 41.0), joint_vel_rel=np.full(29, 51.0), last_action=np.full(29, 61.0),
    )
    v = h.vector()
    # term-major: each term is [oldest(frame0) .. newest(frame1)] concatenated, in term order.
    expected = np.concatenate([
        np.full(3, 10.0), np.full(3, 11.0),    # base_ang_vel  oldest, newest
        np.full(3, 20.0), np.full(3, 21.0),    # projected_gravity
        np.full(3, 30.0), np.full(3, 31.0),    # command
        np.full(29, 40.0), np.full(29, 41.0),  # joint_pos
        np.full(29, 50.0), np.full(29, 51.0),  # joint_vel
        np.full(29, 60.0), np.full(29, 61.0),  # actions
    ])
    np.testing.assert_array_equal(v, expected)


def test_proprio_reset_zeros_history():
    h = P.ProprioHistory(history_length=4)
    h.append(
        base_ang_vel=np.full(3, 1.0), proj_grav=np.full(3, 1.0), command=np.full(3, 1.0),
        joint_pos_rel=np.full(29, 1.0), joint_vel_rel=np.full(29, 1.0), last_action=np.full(29, 1.0),
    )
    h.reset()
    np.testing.assert_array_equal(h.vector(), np.zeros(384))


# ---------------------------------------------------------------------------
# Depth ring buffer: offset stacking newest->oldest
# ---------------------------------------------------------------------------
def test_depth_ring_first_frame_fills_all_offsets():
    ring = P.DepthRing(frame_offsets=(0, 1, 3))
    f0 = np.full(144, 0.7, dtype=np.float32)
    out = ring.push(f0)
    # only one frame seen -> every offset reads it.
    assert out.shape == (3 * 144,)
    np.testing.assert_array_equal(out, np.tile(f0, 3))


def test_depth_ring_newest_first_ordering():
    ring = P.DepthRing(frame_offsets=(0, 1, 3))
    frames = [np.full(144, float(i), dtype=np.float32) for i in range(6)]
    out = None
    for f in frames:
        out = ring.push(f)
    # after pushing 0..5, newest=5. offsets (0,1,3) -> frames 5, 4, 2.
    expected = np.concatenate([np.full(144, 5.0), np.full(144, 4.0), np.full(144, 2.0)])
    np.testing.assert_array_equal(out, expected)


def test_depth_ring_partial_history_clamps_to_oldest():
    ring = P.DepthRing(frame_offsets=(0, 3, 8, 18))
    a = np.full(144, 1.0, dtype=np.float32)
    b = np.full(144, 2.0, dtype=np.float32)
    ring.push(a)
    out = ring.push(b)  # only two frames pushed; offset 3/8/18 not available yet
    # newest (offset 0) = b; deeper offsets fall back to the oldest fill (a).
    expected = np.concatenate([np.full(144, 2.0), np.full(144, 1.0), np.full(144, 1.0), np.full(144, 1.0)])
    np.testing.assert_array_equal(out, expected)


def test_depth_ring_reset_reinits_to_next_frame():
    ring = P.DepthRing(frame_offsets=(0, 1))
    ring.push(np.full(144, 1.0, dtype=np.float32))
    ring.push(np.full(144, 2.0, dtype=np.float32))
    ring.reset()
    out = ring.push(np.full(144, 9.0, dtype=np.float32))
    # post-reset the new frame fills every offset (no bleed from the old episode).
    np.testing.assert_array_equal(out, np.tile(np.full(144, 9.0), 2))


# ---------------------------------------------------------------------------
# Full assembly: proprio ++ depth, dim must equal the ONNX input
# ---------------------------------------------------------------------------
def test_assemble_obs_concatenates_proprio_then_depth():
    proprio = np.arange(384, dtype=np.float32)
    depth = np.arange(384, 384 + 576, dtype=np.float32)  # 4 offsets * 144
    obs = P.assemble_obs(proprio, depth)
    assert obs.shape == (1, 960)
    np.testing.assert_array_equal(obs[0, :384], proprio)
    np.testing.assert_array_equal(obs[0, 384:], depth)


# ---------------------------------------------------------------------------
# Depth freshness gate
# ---------------------------------------------------------------------------
def test_freshness_gate_holds_last_frame_when_stale():
    gate = P.DepthGate(n_cam=1)
    f = np.full(144, 0.3, dtype=np.float32)
    gate.update(f, t=0.0)
    # fresh just after arrival
    assert not gate.is_stale(now=0.05, stale_s=0.1)
    # stale after the window; the held frame is still returned (no stall).
    assert gate.is_stale(now=0.25, stale_s=0.1)
    np.testing.assert_array_equal(gate.frame(), f)


def test_freshness_gate_stale_before_first_frame():
    gate = P.DepthGate(n_cam=1)
    # no datagram yet -> stale, and frame() returns a far (empty) image so the
    # robot just stands rather than crashing.
    assert gate.is_stale(now=1.0, stale_s=0.1)
    np.testing.assert_array_equal(gate.frame(), np.ones(144, dtype=np.float32))


def _run():
    fns = [v for k, v in sorted(globals().items()) if k.startswith("test_")]
    for fn in fns:
        fn()
        print(f"  ok  {fn.__name__}")
    print(f"obs_assembly: {len(fns)} tests passed")


if __name__ == "__main__":
    _run()
