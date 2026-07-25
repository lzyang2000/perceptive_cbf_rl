"""Single-cam depth-dodge policy node (no ROS).

Owns the obs contract for ``Unitree-G1-AMP-Dodge-Depth-Single-Flat``. Each 50 Hz
tick it non-blocking-drains BOTH UDP sources (state from hardware_node, depth
from camera_node), assembles the actor obs exactly as the sim built it, runs the
ONNX actor on CPU, unscales the action, and sends 29 joint-position targets back
to hardware_node.

  actor input = actor_proprio(384) ++ depth(144 * n_cam * n_offsets)

  * proprio: 4-frame TERM-MAJOR history (oldest->newest per term) over
    base_ang_vel, projected_gravity, command, joint_pos_rel, joint_vel_rel,
    last_action  (matches src/tasks/amp_loco/amp_env_cfg.py + mjlab default
    term-major ordering).
  * depth: per-frame DepthImageObs-normalised [0,1] 144-vector, stacked at
    frame_offsets NEWEST->OLDEST (matches mdp/observations.py DepthImageObs).

The assembled dim is asserted == the ONNX input dim, so a layout/offset mismatch
fails loudly at startup instead of as a fall. A backwards ``step_id`` jump
(hardware reset) clears proprio history + last_action. Depth older than
``--depth-stale-s`` (measured by arrival on this node) holds the last frame and
warns -- the robot keeps standing, it just stops reacting.
"""

import argparse
import ast
import os
import time
from collections import deque

os.environ.setdefault("ORT_LOG_SEVERITY_LEVEL", "3")

import numpy as np

import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from deploy.common.g1_deploy_constants import (
    ACTION_SCALE,
    DEFAULT_FRAME_OFFSETS,
    DEFAULT_POS,
    DEPTH_FAR,
    DEPTH_NEAR,
    NUM_JOINTS,
)
from deploy.common.udp_sync import (
    DEPTH_FRAME_FLOATS,
    UDP_DEPTH_PORT,
    UDP_HOST,
    UDP_HW_PORT,
    UDP_POLICY_PORT,
    STATE_BYTES,
    create_udp_socket,
    pack_action,
    unpack_depth,
    unpack_state,
)

HISTORY_LENGTH = 4
PROPRIO_DIM = 384

# Per-frame proprio term order + dims. MUST match amp_env_cfg.py actor_terms
# (insertion order) and the mjlab default term-major history flatten.
_TERM_ORDER = (
    "base_ang_vel", "projected_gravity", "command",
    "joint_pos", "joint_vel", "actions",
)
_TERM_DIMS = {
    "base_ang_vel": 3, "projected_gravity": 3, "command": 3,
    "joint_pos": NUM_JOINTS, "joint_vel": NUM_JOINTS, "actions": NUM_JOINTS,
}
assert sum(_TERM_DIMS[k] for k in _TERM_ORDER) * HISTORY_LENGTH == PROPRIO_DIM


# ---------------------------------------------------------------------------
# Depth metres -> normalised obs (DepthImageObs._one, no aug / no ground-far-out)
# ---------------------------------------------------------------------------
def depth_metres_to_obs(frame_m: np.ndarray, near: float, far: float) -> np.ndarray:
    """Pooled depth in metres -> the [0,1] vector the policy trained on.

    Replicates DepthImageObs._one with no augmentation (the real ZED supplies
    the noise) and no ground-far-out (a sim-only segmentation cue):
    no-hit/sky (raw < near) -> far, clamp[near,far], normalise (d-near)/(far-near).
    """
    x = np.asarray(frame_m, dtype=np.float32)
    x = np.where(x < near, far, x)
    x = np.clip(x, near, far)
    return ((x - near) / (far - near)).astype(np.float32)


# ---------------------------------------------------------------------------
# Proprio term-major history
# ---------------------------------------------------------------------------
class ProprioHistory:
    """4-frame term-major proprio history -> flat 384 vector (oldest->newest per
    term, in _TERM_ORDER). Mirrors amp_policy.py / mjlab term-major flatten."""

    def __init__(self, history_length: int = HISTORY_LENGTH):
        self._L = int(history_length)
        self._hist = {
            k: deque([np.zeros(_TERM_DIMS[k], np.float32)] * self._L, maxlen=self._L)
            for k in _TERM_ORDER
        }

    def reset(self) -> None:
        for k in _TERM_ORDER:
            self._hist[k].clear()
            for _ in range(self._L):
                self._hist[k].append(np.zeros(_TERM_DIMS[k], np.float32))

    def append(self, base_ang_vel, proj_grav, command,
               joint_pos_rel, joint_vel_rel, last_action) -> None:
        self._hist["base_ang_vel"].append(np.asarray(base_ang_vel, np.float32))
        self._hist["projected_gravity"].append(np.asarray(proj_grav, np.float32))
        self._hist["command"].append(np.asarray(command, np.float32))
        self._hist["joint_pos"].append(np.asarray(joint_pos_rel, np.float32))
        self._hist["joint_vel"].append(np.asarray(joint_vel_rel, np.float32))
        self._hist["actions"].append(np.asarray(last_action, np.float32))

    def vector(self) -> np.ndarray:
        parts = [np.concatenate(list(self._hist[k])) for k in _TERM_ORDER]
        return np.concatenate(parts, dtype=np.float32)


# ---------------------------------------------------------------------------
# Depth ring buffer: offset stacking newest->oldest (mirrors DepthImageObs)
# ---------------------------------------------------------------------------
class DepthRing:
    """Per-frame ring buffer; ``push(frame)`` returns the stacked obs at
    ``frame_offsets`` NEWEST->OLDEST (offset 0 first), matching the sim's
    ``idx = [(head - k) % L]`` selection. First frame fills every slot; reset
    reinitialises to the next frame so belief never bleeds across a hardware
    reset."""

    def __init__(self, frame_offsets):
        self._offsets = tuple(sorted(int(o) for o in frame_offsets))
        self._L = max(self._offsets) + 1
        self._buf = None  # [L, frame_dim]
        self._head = 0
        self._pending_reset = False

    def reset(self) -> None:
        self._pending_reset = True

    def push(self, frame: np.ndarray) -> np.ndarray:
        cur = np.asarray(frame, dtype=np.float32)
        if self._buf is None or self._pending_reset:
            self._buf = np.broadcast_to(cur, (self._L, cur.size)).copy()
            self._head = 0
            self._pending_reset = False
        else:
            self._head = (self._head + 1) % self._L
            self._buf[self._head] = cur
        idx = [(self._head - k) % self._L for k in self._offsets]
        return self._buf[idx].reshape(-1).copy()


# ---------------------------------------------------------------------------
# Depth freshness gate (arrival-time based; cross-process clocks differ)
# ---------------------------------------------------------------------------
class DepthGate:
    """Holds the latest normalised depth frame. Before any datagram arrives,
    ``frame()`` returns an all-far (empty) image so the robot stands rather than
    crashing. ``is_stale`` is measured by datagram arrival time on this node."""

    def __init__(self, n_cam: int = 1):
        self._dim = int(n_cam) * DEPTH_FRAME_FLOATS
        self._frame = np.ones(self._dim, dtype=np.float32)  # far = empty
        self._last_arrival = None

    def update(self, frame: np.ndarray, t: float) -> None:
        f = np.asarray(frame, dtype=np.float32).reshape(-1)
        if f.size != self._dim:
            raise ValueError(f"depth frame {f.size} != expected {self._dim}")
        self._frame = f
        self._last_arrival = float(t)

    def frame(self) -> np.ndarray:
        return self._frame

    def is_stale(self, now: float, stale_s: float) -> bool:
        return self._last_arrival is None or (now - self._last_arrival) > stale_s


# ---------------------------------------------------------------------------
# Full assembly
# ---------------------------------------------------------------------------
def assemble_obs(proprio: np.ndarray, depth: np.ndarray) -> np.ndarray:
    """actor input = proprio(384) ++ depth, shaped [1, D] for ONNX."""
    obs = np.concatenate(
        [np.asarray(proprio, np.float32), np.asarray(depth, np.float32)]
    ).astype(np.float32)
    return obs.reshape(1, -1)


# ---------------------------------------------------------------------------
# Main loop
# ---------------------------------------------------------------------------
def main():
    parser = argparse.ArgumentParser(description="Single-cam depth-dodge policy")
    parser.add_argument("onnx_path", help="Path to the exported dodge .onnx")
    parser.add_argument(
        "--frame-offsets", default=str(DEFAULT_FRAME_OFFSETS),
        help="Depth frame stack offsets, Python-literal tuple, MUST match the "
             f"checkpoint (default {DEFAULT_FRAME_OFFSETS})",
    )
    parser.add_argument("--n-cam", type=int, default=1, help="Number of cameras (1 for single)")
    parser.add_argument("--depth-stale-s", type=float, default=0.3,
                        help="Hold the last depth frame + warn if none arrives within this (s)")
    parser.add_argument("--hz", type=float, default=50.0)
    parser.add_argument("--walk-onnx", default=None,
                        help="Path to the proprio-only walk (AMP-Flat loco) .onnx (384->29). "
                             "Enables WALK mode (state packet mode=1). Shares the dodge proprio "
                             "history + action scale; no depth, no gain swap (same actuator config).")
    parser.add_argument("--blend-ticks", type=int, default=25,
                        help="Linear target blend length on a dodge<->walk switch (ticks; ~0.5 s "
                             "at 50 Hz) to avoid a step change in joint targets.")
    args = parser.parse_args()

    import onnxruntime as ort

    offsets = tuple(ast.literal_eval(args.frame_offsets))
    n_cam = int(args.n_cam)

    session = ort.InferenceSession(args.onnx_path, providers=["CPUExecutionProvider"])
    inp_name = session.get_inputs()[0].name
    expected_dim = int(session.get_inputs()[0].shape[-1])
    depth_dim = n_cam * DEPTH_FRAME_FLOATS * len(offsets)
    assembled_dim = PROPRIO_DIM + depth_dim
    if assembled_dim != expected_dim:
        raise ValueError(
            f"Assembled obs dim {assembled_dim} (proprio {PROPRIO_DIM} + depth "
            f"{depth_dim} = {n_cam}cam*144*{len(offsets)}offsets) != ONNX input "
            f"{expected_dim}. Wrong --frame-offsets / --n-cam for this checkpoint?"
        )
    print(f"[dodge_policy] obs dim {assembled_dim} OK (offsets={offsets}, n_cam={n_cam})")

    # Optional WALK policy: proprio-only (384) loco walker, shares the dodge
    # proprio history + ACTION_SCALE (same in-repo actuator config -> no gain
    # swap). mode byte in the state packet selects it.
    walk_session = walk_inp = None
    if args.walk_onnx:
        walk_session = ort.InferenceSession(args.walk_onnx, providers=["CPUExecutionProvider"])
        walk_inp = walk_session.get_inputs()[0].name
        walk_dim = int(walk_session.get_inputs()[0].shape[-1])
        if walk_dim != PROPRIO_DIM:
            raise ValueError(f"walk ONNX input {walk_dim} != proprio dim {PROPRIO_DIM}")
        print(f"[dodge_policy] walk mode enabled ({args.walk_onnx}, {PROPRIO_DIM}->{NUM_JOINTS})")

    proprio = ProprioHistory(HISTORY_LENGTH)
    ring = DepthRing(offsets)
    gate = DepthGate(n_cam)
    far_frame = np.ones(n_cam * DEPTH_FRAME_FLOATS, dtype=np.float32)  # all-far (empty)
    prev_depth_far_hold = False
    last_action = np.zeros(NUM_JOINTS, dtype=np.float32)
    prev_mode = 0
    last_target = DEFAULT_POS.copy()   # last emitted target (blend source on a mode switch)
    blend_from = DEFAULT_POS.copy()
    blend_i = args.blend_ticks         # start 'done' (no blend until a switch arms it)

    state_sock = create_udp_socket(UDP_HOST, UDP_POLICY_PORT)
    depth_sock = create_udp_socket(UDP_HOST, UDP_DEPTH_PORT)
    state_sock.setblocking(False)
    depth_sock.setblocking(False)
    hw_addr = (UDP_HOST, UDP_HW_PORT)
    print(f"[dodge_policy] state<-{UDP_POLICY_PORT} depth<-{UDP_DEPTH_PORT} action->{UDP_HW_PORT}")

    dt = 1.0 / float(args.hz)
    next_tick = time.perf_counter()
    prev_step_id = -1
    last_stale_warn = 0.0

    try:
        while True:
            now = time.perf_counter()
            sleep_t = next_tick - now
            if sleep_t > 0:
                time.sleep(sleep_t)
            next_tick += dt

            # Drain depth to the newest datagram; normalise + hand to the gate.
            depth_data = _drain(depth_sock, (3 + n_cam * DEPTH_FRAME_FLOATS) * 4 + 64)
            if depth_data is not None:
                _seq, _stamp, dn, depth_m = unpack_depth(depth_data)
                if dn == n_cam:
                    gate.update(depth_metres_to_obs(depth_m, DEPTH_NEAR, DEPTH_FAR),
                                time.perf_counter())

            # Drain state to the newest datagram.
            state_data = _drain(state_sock, STATE_BYTES + 64)
            if state_data is None:
                continue
            step_id, _quat, ang_vel, proj_grav, q, dq, cmd, depth_far_hold, mode = unpack_state(state_data)

            # Walk requested but no walk policy loaded -> stay in dodge (warn, throttled).
            if mode == 1 and walk_session is None:
                if (time.perf_counter() - last_stale_warn) > 1.0:
                    print("[dodge_policy] WARN: walk mode requested but no --walk-onnx; holding dodge",
                          flush=True)
                    last_stale_warn = time.perf_counter()
                mode = 0

            # Dodge mode is in-place: ignore any commanded velocity (camera-driven
            # dodge). Only walk mode is stick/slider-driven. Enforced here so it
            # holds for both sim_node and hardware_node, whatever they send.
            if mode == 0:
                cmd = np.zeros(3, dtype=np.float32)

            if step_id < prev_step_id:
                proprio.reset()
                ring.reset()
                last_action[:] = 0.0
                print(f"[dodge_policy] hardware reset (step_id {prev_step_id}->{step_id}); cleared state",
                      flush=True)
            prev_step_id = step_id

            # Mode edge: arm a target blend from the last emitted target. The proprio
            # history is mode-agnostic (both policies consume the same 384 proprio) and
            # the depth ring is pushed every tick, so neither is reset on a switch.
            if mode != prev_mode:
                blend_from = last_target.copy()
                blend_i = 0
                print(f"[dodge_policy] mode -> {'WALK' if mode == 1 else 'DODGE'}", flush=True)
                prev_mode = mode

            tnow = time.perf_counter()
            if mode == 0 and gate.is_stale(tnow, args.depth_stale_s) and (tnow - last_stale_warn) > 1.0:
                print("[dodge_policy] WARN: depth stale; holding last frame (robot stops reacting)",
                      flush=True)
                last_stale_warn = tnow

            # Depth ring is pushed EVERY tick (cheap) so the dodge belief stays fresh
            # across a walk->dodge switch. X "depth far hold" feeds an all-far frame.
            if depth_far_hold != prev_depth_far_hold:
                print(f"[dodge_policy] depth-far hold {'ON (ignoring camera)' if depth_far_hold else 'OFF'}",
                      flush=True)
                prev_depth_far_hold = depth_far_hold
            frame = far_frame if depth_far_hold else gate.frame()
            depth_stacked = ring.push(frame)

            # Proprio current frame (shared by both policies).
            proprio.append(
                base_ang_vel=ang_vel,
                proj_grav=proj_grav,
                command=cmd,
                joint_pos_rel=(q - DEFAULT_POS),
                joint_vel_rel=dq,
                last_action=last_action,
            )

            if mode == 1:  # WALK: proprio-only obs -> walk ONNX
                obs = proprio.vector().reshape(1, -1)
                action = walk_session.run(None, {walk_inp: obs})[0][0].astype(np.float32)
            else:          # DODGE: proprio ++ depth -> dodge ONNX
                obs = assemble_obs(proprio.vector(), depth_stacked)
                action = session.run(None, {inp_name: obs})[0][0].astype(np.float32)
            last_action = action.copy()

            active_target = DEFAULT_POS + action * ACTION_SCALE
            if blend_i < args.blend_ticks:
                blend_i += 1
                alpha = blend_i / args.blend_ticks
                target = (1.0 - alpha) * blend_from + alpha * active_target
            else:
                target = active_target
            last_target = target.copy()
            state_sock.sendto(pack_action(target.astype(np.float32)), hw_addr)
    except KeyboardInterrupt:
        pass
    finally:
        state_sock.close()
        depth_sock.close()
        print("dodge_policy stopped.")


def _drain(sock, bufsize):
    """Non-blocking drain to the most recent datagram (or None)."""
    latest = None
    try:
        while True:
            latest, _ = sock.recvfrom(bufsize)
    except BlockingIOError:
        pass
    return latest


if __name__ == "__main__":
    main()
