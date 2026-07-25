"""Pack/unpack round-trip + byte-size/field-alignment tests for udp_sync.

Pure numpy, no hardware. Run directly (``uv run python deploy/tests/test_udp_sync.py``)
or under pytest. These guard the three datagram formats the deploy stack puts on
the wire; a layout drift here is a fall on the real robot, so the contract is
pinned by exact byte sizes and field-by-field equality.
"""

import os
import sys

import numpy as np

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from deploy.common import udp_sync


def test_state_sizes_match_layout():
    # 1 step_id + 4 quat + 3 ang_vel + 3 proj_grav + 29 q + 29 dq + 3 cmd
    # + 1 depth_far_hold + 1 mode = 74 floats.
    assert udp_sync.STATE_FLOATS == 74
    assert udp_sync.STATE_BYTES == 74 * 4


def test_state_round_trip():
    rng = np.random.default_rng(0)
    step_id = 12345
    quat = rng.standard_normal(4).astype(np.float32)
    ang_vel = rng.standard_normal(3).astype(np.float32)
    proj_grav = rng.standard_normal(3).astype(np.float32)
    q = rng.standard_normal(29).astype(np.float32)
    dq = rng.standard_normal(29).astype(np.float32)
    cmd = rng.standard_normal(3).astype(np.float32)

    for hold in (False, True):
        buf = udp_sync.pack_state(step_id, quat, ang_vel, proj_grav, q, dq, cmd,
                                  depth_far_hold=hold)
        assert len(buf) == udp_sync.STATE_BYTES

        o_step, o_quat, o_ang, o_grav, o_q, o_dq, o_cmd, o_hold, o_mode = udp_sync.unpack_state(buf)
        assert o_step == step_id
        np.testing.assert_array_equal(o_quat, quat)
        np.testing.assert_array_equal(o_ang, ang_vel)
        np.testing.assert_array_equal(o_grav, proj_grav)
        np.testing.assert_array_equal(o_q, q)
        np.testing.assert_array_equal(o_dq, dq)
        np.testing.assert_array_equal(o_cmd, cmd)
        assert o_hold is hold
        assert o_mode == 0

    # Default (omitted) -> hold off, mode dodge(0).
    *_, o_hold, o_mode = udp_sync.unpack_state(
        udp_sync.pack_state(step_id, quat, ang_vel, proj_grav, q, dq, cmd))
    assert o_hold is False
    assert o_mode == 0


def test_state_mode_round_trip():
    rng = np.random.default_rng(9)
    args = (3, rng.standard_normal(4).astype(np.float32),
            rng.standard_normal(3).astype(np.float32),
            rng.standard_normal(3).astype(np.float32),
            rng.standard_normal(29).astype(np.float32),
            rng.standard_normal(29).astype(np.float32),
            rng.standard_normal(3).astype(np.float32))
    for mode in (0, 1):
        buf = udp_sync.pack_state(*args, depth_far_hold=False, mode=mode)
        assert len(buf) == udp_sync.STATE_BYTES
        *_, o_hold, o_mode = udp_sync.unpack_state(buf)
        assert o_mode == mode


def test_action_round_trip():
    rng = np.random.default_rng(1)
    q_target = rng.standard_normal(29).astype(np.float32)
    buf = udp_sync.pack_action(q_target)
    assert len(buf) == udp_sync.ACTION_BYTES == 29 * 4
    np.testing.assert_array_equal(udp_sync.unpack_action(buf), q_target)


def test_depth_round_trip_one_cam():
    rng = np.random.default_rng(2)
    seq = 7
    stamp = 1.5  # informational; float32-representable
    depth = rng.standard_normal(1 * udp_sync.DEPTH_FRAME_FLOATS).astype(np.float32)
    buf = udp_sync.pack_depth(seq, stamp, 1, depth)
    o_seq, o_stamp, o_ncam, o_depth = udp_sync.unpack_depth(buf)
    assert o_seq == seq
    assert o_ncam == 1
    np.testing.assert_allclose(o_stamp, stamp, rtol=0, atol=1e-3)
    np.testing.assert_array_equal(o_depth, depth)
    # n_cam=1 -> 3 header floats + 144 depth = 147 floats.
    assert len(buf) == (3 + udp_sync.DEPTH_FRAME_FLOATS) * 4


def test_depth_round_trip_two_cam():
    rng = np.random.default_rng(3)
    depth = rng.standard_normal(2 * udp_sync.DEPTH_FRAME_FLOATS).astype(np.float32)
    buf = udp_sync.pack_depth(42, 2.0, 2, depth)
    o_seq, _o_stamp, o_ncam, o_depth = udp_sync.unpack_depth(buf)
    assert o_seq == 42
    assert o_ncam == 2
    np.testing.assert_array_equal(o_depth, depth)
    assert len(buf) == (3 + 2 * udp_sync.DEPTH_FRAME_FLOATS) * 4


def test_depth_n_cam_mismatch_raises():
    # Guard the camera-count contract: declared n_cam must match the payload length.
    bad = np.zeros(udp_sync.DEPTH_FRAME_FLOATS, dtype=np.float32)  # one cam's worth
    try:
        udp_sync.pack_depth(0, 0.0, 2, bad)  # claim two cams
    except ValueError:
        return
    raise AssertionError("pack_depth must reject an n_cam/payload-length mismatch")


def test_distinct_ports():
    ports = {udp_sync.UDP_HW_PORT, udp_sync.UDP_DEPTH_PORT, udp_sync.UDP_POLICY_PORT}
    assert len(ports) == 3, "the three UDP ports must be distinct"


def _run():
    fns = [v for k, v in sorted(globals().items()) if k.startswith("test_")]
    for fn in fns:
        fn()
        print(f"  ok  {fn.__name__}")
    print(f"udp_sync: {len(fns)} tests passed")


if __name__ == "__main__":
    _run()
