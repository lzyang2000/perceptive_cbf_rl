"""UDP datagram pack/unpack for the single-cam depth-dodge deploy stack.

Replaces ROS DDS for the latency-critical paths between the three deploy
processes. Adapted from ``wbc_mjlab/deploy/common/udp_sync.py``; extended with a separate
**depth** datagram so the camera process can publish to the policy over its own
port without touching the 50 Hz state/action path.

All payloads are little-endian float32. Three datagram formats / three ports:

  State  (hardware_node -> dodge_policy, 50 Hz),  UDP_HW_PORT -> UDP_POLICY_PORT
    74 floats = [ step_id(1), quat_wxyz(4), base_ang_vel(3), proj_grav(3),
                  q[29], dq[29], cmd[3], depth_far_hold(1), mode(1) ]
    A backwards ``step_id`` jump signals a hardware reset -> the policy clears
    its proprio history + last_action (cold restart). ``depth_far_hold`` is a
    0/1 operator toggle (remote X button): 1 -> the policy ignores the camera
    and feeds an all-far (empty) depth image, so the robot stops reacting to
    thrown balls and just holds / follows the stick. ``mode`` selects the active
    policy: 0 = dodge (proprio+depth), 1 = walk (proprio-only loco walker).

  Depth  (camera_node -> dodge_policy, ~camera rate), -> UDP_DEPTH_PORT
    (3 + n_cam*144) floats = [ seq(1), stamp(1), n_cam(1), depth[n_cam*144] ]
    Pooled 16x9 = 144 per camera, row-major, metres (invalid -> far; the policy's
    no-hit->far step makes the exact invalid fill moot). ``stamp`` is the send-side
    wall clock and is INFORMATIONAL only: float32 cannot hold a unix timestamp to
    sub-second precision, and the two processes do not share a monotonic clock, so
    the freshness gate measures datagram *arrival* time on the policy side instead.

  Action (dodge_policy -> hardware_node, 50 Hz),    -> UDP_HW_PORT
    29 floats = [ q_target[29] ]
"""

import errno
import os
import signal
import socket
import subprocess
import time

import numpy as np

# ---------------------------------------------------------------------------
# Ports / host
# ---------------------------------------------------------------------------
UDP_HW_PORT = 9870       # hardware_node listens here for action datagrams
UDP_POLICY_PORT = 9871   # dodge_policy listens here for state datagrams
UDP_DEPTH_PORT = 9872    # dodge_policy listens here for depth datagrams
UDP_HOST = "127.0.0.1"

# ---------------------------------------------------------------------------
# Layout
# ---------------------------------------------------------------------------
NUM_JOINTS = 29
CMD_SIZE = 3
DEPTH_H = 9
DEPTH_W = 16
DEPTH_FRAME_FLOATS = DEPTH_H * DEPTH_W  # 144 per camera, row-major

STATE_FLOATS = 1 + 4 + 3 + 3 + NUM_JOINTS + NUM_JOINTS + CMD_SIZE + 1 + 1  # 74 (+depth_far_hold +mode)
ACTION_FLOATS = NUM_JOINTS  # 29
STATE_BYTES = STATE_FLOATS * 4   # 296
ACTION_BYTES = ACTION_FLOATS * 4  # 116
DEPTH_HEADER_FLOATS = 3  # seq, stamp, n_cam


# ---------------------------------------------------------------------------
# Socket helper (kills a zombie holder of the port, mirrors wbc)
# ---------------------------------------------------------------------------
def _kill_udp_port_holders(port: int) -> None:
    my_pid = os.getpid()
    try:
        result = subprocess.run(
            ["fuser", f"{port}/udp"], capture_output=True, text=True, timeout=5
        )
        pids_str = result.stdout.strip()
        if not pids_str:
            return
        for tok in pids_str.split():
            try:
                pid = int(tok)
            except ValueError:
                continue
            if pid == my_pid:
                continue
            print(f"Killing zombie process {pid} on UDP port {port}")
            try:
                os.kill(pid, signal.SIGKILL)
            except ProcessLookupError:
                pass
        time.sleep(0.2)
    except FileNotFoundError:
        print(
            f"Warning: 'fuser' not found - cannot auto-kill zombie on port {port}. "
            "Install psmisc or kill the process manually."
        )
    except subprocess.TimeoutExpired:
        pass


def create_udp_socket(host: str, port: int) -> socket.socket:
    """Create and bind a UDP socket, killing any zombie holder if needed."""
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    try:
        sock.bind((host, port))
    except OSError as e:
        if e.errno != errno.EADDRINUSE:
            raise
        print(f"Port {port} in use - attempting to kill zombie holder...")
        _kill_udp_port_holders(port)
        sock.bind((host, port))
    return sock


# ---------------------------------------------------------------------------
# State datagram (hardware -> policy)
# ---------------------------------------------------------------------------
def pack_state(
    step_id: int,
    quat: np.ndarray,
    base_ang_vel: np.ndarray,
    proj_grav: np.ndarray,
    q: np.ndarray,
    dq: np.ndarray,
    cmd: np.ndarray,
    depth_far_hold: bool = False,
    mode: int = 0,
) -> bytes:
    buf = np.empty(STATE_FLOATS, dtype=np.float32)
    buf[0] = float(step_id)
    buf[1:5] = quat
    buf[5:8] = base_ang_vel
    buf[8:11] = proj_grav
    buf[11:40] = q
    buf[40:69] = dq
    buf[69:72] = cmd
    buf[72] = 1.0 if depth_far_hold else 0.0
    buf[73] = float(int(mode))
    return buf.tobytes()


def unpack_state(data: bytes):
    buf = np.frombuffer(data, dtype=np.float32)
    step_id = int(buf[0])
    quat = buf[1:5].copy()
    base_ang_vel = buf[5:8].copy()
    proj_grav = buf[8:11].copy()
    q = buf[11:40].copy()
    dq = buf[40:69].copy()
    cmd = buf[69:72].copy()
    depth_far_hold = bool(buf[72] >= 0.5)
    mode = int(round(float(buf[73])))
    return step_id, quat, base_ang_vel, proj_grav, q, dq, cmd, depth_far_hold, mode


# ---------------------------------------------------------------------------
# Action datagram (policy -> hardware)
# ---------------------------------------------------------------------------
def pack_action(q_target: np.ndarray) -> bytes:
    return np.asarray(q_target, dtype=np.float32).reshape(ACTION_FLOATS).tobytes()


def unpack_action(data: bytes) -> np.ndarray:
    return np.frombuffer(data, dtype=np.float32)[:ACTION_FLOATS].copy()


# ---------------------------------------------------------------------------
# Depth datagram (camera -> policy)
# ---------------------------------------------------------------------------
def pack_depth(seq: int, stamp: float, n_cam: int, depth: np.ndarray) -> bytes:
    depth = np.asarray(depth, dtype=np.float32).reshape(-1)
    if depth.size != n_cam * DEPTH_FRAME_FLOATS:
        raise ValueError(
            f"depth payload {depth.size} != n_cam({n_cam}) * {DEPTH_FRAME_FLOATS}"
        )
    buf = np.empty(DEPTH_HEADER_FLOATS + depth.size, dtype=np.float32)
    buf[0] = float(seq)
    buf[1] = float(stamp)
    buf[2] = float(n_cam)
    buf[3:] = depth
    return buf.tobytes()


def unpack_depth(data: bytes):
    buf = np.frombuffer(data, dtype=np.float32)
    seq = int(buf[0])
    stamp = float(buf[1])
    n_cam = int(buf[2])
    depth = buf[3 : 3 + n_cam * DEPTH_FRAME_FLOATS].copy()
    return seq, stamp, n_cam, depth
