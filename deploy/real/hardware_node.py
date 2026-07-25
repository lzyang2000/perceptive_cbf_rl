"""G1 real-hardware control node for the single-cam depth dodge.

Lean control process -- the ONE process that must stay alive to hold the stand
and damp on demand (camera lives in its own process for fault isolation). It:

  * owns ``unitree_interface``: reads IMU (quat + body ang vel) + 29 joint q/dq
    and the wireless remote; applies 29 position targets at 50 Hz,
  * computes projected_gravity from the quat and cmd[3] from the remote left
    stick (default [0,0,0] = stand-and-dodge),
  * packs State -> dodge_policy (UDP), receives Action -> motors,
  * runs the safety state machine (wireless remote): START -> interpolate to
    DEFAULT_POS over 2 s; A -> 50 Hz policy loop; B -> graceful stop (damp, then
    re-stand on START); SELECT -> emergency stop (damp at current pose + exit,
    which trips the launcher cleanup to tear down camera + policy too).

Driven entirely by the physical wireless remote -- no ROS / rclpy dependency.

  uv run python deploy/real/hardware_node.py --net <iface> [--policy-ip 127.0.0.1]

CANNOT be unit-tested off-robot (needs the built unitree_interface .so + DDS +
the G1). Mirrors the proven wbc_mjlab hardware_node; verify against play_sim
behaviour before trusting it on hardware.
"""

import argparse
import os
import signal
import sys
import time

import numpy as np

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

import unitree_interface

from deploy.common.command import command_from_sticks, make_command
from deploy.common.g1_deploy_constants import DEFAULT_POS, KD, KP, NUM_JOINTS
from deploy.common.udp_sync import (
    ACTION_BYTES,
    UDP_HOST,
    UDP_HW_PORT,
    UDP_POLICY_PORT,
    create_udp_socket,
    pack_state,
    unpack_action,
)

CONTROL_DT = 0.02  # 50 Hz

# Wireless-remote state-machine buttons, read from the controller's `keys`
# bitmask (the unitree_sdk2_wrapper WirelessController exposes lx/ly/rx/ry +
# keys; the .pyi stub's A/B bools + left_stick/right_stick are STALE). Mapping
# matches wbc: START=stand, A=go, B=graceful stop (damp + re-stand),
# SELECT=emergency stop (damp at current pose + exit everything).
STAND_BUTTON = "start"
GO_BUTTON = "A"
DAMP_BUTTON = "B"
KILL_BUTTON = "select"
# X = toggle "depth far hold": force the policy to see an all-far (empty) depth
# image so the robot stops reacting to thrown balls and just holds / follows the
# stick. Latching: each press flips the state (edge-detected in the policy loop).
DEPTH_HOLD_BUTTON = "X"
# Y = toggle WALK mode: ship mode=1 so the policy node runs the proprio-only walk
# (AMP-Flat loco) policy driven by the stick twist; flip back to dodge (mode=0) to
# react to balls. Latching, edge-detected. No gain change -- the in-repo walker
# shares the dodge actuator config.
WALK_MODE_BUTTON = "Y"

# Unitree wireless-controller key bitmask (TWIST2 g1_wrapper ControllerMapping).
_KEYS_BITMASK = {
    "R1": 0x0001, "L1": 0x0002, "start": 0x0004, "select": 0x0008,
    "R2": 0x0010, "L2": 0x0020, "F1": 0x0040, "F2": 0x0080,
    "A": 0x0100, "B": 0x0200, "X": 0x0400, "Y": 0x0800,
    "up": 0x1000, "right": 0x2000, "down": 0x4000, "left": 0x8000,
}


def btn(ctrl, name: str) -> bool:
    """Is button ``name`` pressed? Reads the `keys` bitmask (this binding), with a
    bool-attribute fallback in case a future binding exposes named bools."""
    keys = getattr(ctrl, "keys", None)
    if keys is not None and name in _KEYS_BITMASK:
        return bool(keys & _KEYS_BITMASK[name])
    v = getattr(ctrl, name, None)
    return bool(v) if isinstance(v, bool) else False


def quat_rotate_inverse(q, v):
    """Rotate v by the inverse of quaternion q (wxyz). Used for projected_gravity."""
    w, x, y, z = (float(c) for c in q)
    q_vec = np.array([x, y, z], dtype=np.float32)
    a = v * (2.0 * w * w - 1.0)
    b = np.cross(q_vec, v) * w * 2.0
    c = q_vec * float(np.dot(q_vec, v)) * 2.0
    return (a - b + c).astype(np.float32)


def _send_pd(robot, q_target, kp, kd):
    cmd = robot.create_zero_command()
    cmd.q_target = list(np.asarray(q_target, dtype=float))
    cmd.dq_target = [0.0] * NUM_JOINTS
    cmd.kp = list(np.asarray(kp, dtype=float))
    cmd.kd = list(np.asarray(kd, dtype=float))
    cmd.tau_ff = [0.0] * NUM_JOINTS
    robot.write_low_command(cmd)


def _wait_for(robot, button, hold_fn):
    """Block until `button` is pressed on the physical remote, calling hold_fn()
    each control tick to keep the motors held."""
    while True:
        ctrl = robot.read_wireless_controller()
        if btn(ctrl, button):
            return
        hold_fn()
        time.sleep(CONTROL_DT)


def startup(robot, kp):
    print(f"Press {STAND_BUTTON} on the remote to interpolate to the default pose ...")
    _wait_for(
        robot, STAND_BUTTON,
        lambda: _send_pd(robot, np.array(robot.read_low_state().motor.q[:NUM_JOINTS]),
                         np.zeros(NUM_JOINTS), KD),
    )

    print("Moving to default position ...")
    q_start = np.array(robot.read_low_state().motor.q[:NUM_JOINTS], dtype=np.float32)
    n_steps = int(2.0 / CONTROL_DT)
    for i in range(n_steps):
        alpha = (i + 1) / n_steps
        _send_pd(robot, (1.0 - alpha) * q_start + alpha * DEFAULT_POS, kp, KD)
        time.sleep(CONTROL_DT)
    print("Default position reached.")

    print(f"Press {GO_BUTTON} to start the policy loop ...")
    _wait_for(robot, GO_BUTTON, lambda: _send_pd(robot, DEFAULT_POS, kp, KD))
    print("Starting policy loop.")


def damp(robot, n_ticks=100):
    """Graceful damp: zero stiffness, KD-only, holding current q targets."""
    print("Damping ...")
    for _ in range(n_ticks):
        q = np.array(robot.read_low_state().motor.q[:NUM_JOINTS], dtype=np.float32)
        _send_pd(robot, q, np.zeros(NUM_JOINTS), KD)
        time.sleep(CONTROL_DT)


def main():
    parser = argparse.ArgumentParser(description="G1 single-cam dodge hardware node")
    parser.add_argument("--net", default="eth0", help="Network interface for robot DDS")
    parser.add_argument("--policy-ip", default=UDP_HOST, help="IP of the dodge_policy node")
    parser.add_argument("--kp-scale", type=float, default=1.0,
                        help="Scale factor on the position (P) stiffness KP applied every control "
                             "tick (default 1.0 = baked gains). KD damping and the emergency-damp "
                             "paths are unaffected. <1 -> softer / more compliant tracking, gentler "
                             "on the hardware; useful for cautious first runs.")
    args = parser.parse_args()

    kp = (KP * args.kp_scale).astype(np.float32)
    print(f"[hardware] KP scale {args.kp_scale} -> effective KP {kp.min():.2f}..{kp.max():.2f} "
          f"(KD damping unchanged)")

    # First signal -> clean shutdown (the finally block damps); repeats ignored
    # so a second SIGTERM can't abort the finally block mid-damp.
    _shutting_down = [False]

    def _on_sigterm(signum, frame):
        if _shutting_down[0]:
            return
        _shutting_down[0] = True
        raise KeyboardInterrupt

    signal.signal(signal.SIGTERM, _on_sigterm)

    robot = unitree_interface.UnitreeInterface.create_g1(args.net)
    if not robot.release_motion_control():
        print("[WARN] Failed to release high-level motion control; LowCmd writes may be ignored.")
    robot.set_control_mode(unitree_interface.ControlMode.PR)

    # Action receiver (policy -> here) + state sender (here -> policy).
    sock = create_udp_socket(UDP_HOST, UDP_HW_PORT)
    sock.setblocking(False)
    policy_addr = (args.policy_ip, UDP_POLICY_PORT)
    print(f"UDP: hardware={UDP_HOST}:{UDP_HW_PORT}  policy={args.policy_ip}:{UDP_POLICY_PORT}")

    gravity = np.array([0.0, 0.0, -1.0], dtype=np.float32)
    last_target = DEFAULT_POS.copy()
    depth_far_hold = False        # latched X toggle, persists across re-stands
    prev_depth_hold_btn = False   # for rising-edge detection
    walk_mode = False             # latched Y toggle: True -> ship mode=1 (walk)
    prev_walk_btn = False         # for rising-edge detection

    try:
        while True:
            startup(robot, kp)
            last_target = DEFAULT_POS.copy()
            step_id = 0  # restart at 0 each policy entry -> policy clears its history

            # 50 Hz policy loop until DAMP.
            next_tick = time.perf_counter()
            damp_requested = False
            while not damp_requested:
                now = time.perf_counter()
                sleep_t = next_tick - now
                if sleep_t > 0:
                    time.sleep(sleep_t)
                next_tick += CONTROL_DT

                ctrl = robot.read_wireless_controller()
                if btn(ctrl, KILL_BUTTON):
                    # SELECT = emergency stop: damp at the current pose and exit the
                    # whole program. hardware_node exiting trips the launcher's cleanup
                    # trap, which tears down camera_node + dodge_policy too.
                    print("SELECT pressed -- emergency stop (damp + exit).")
                    damp(robot, n_ticks=50)
                    return
                if btn(ctrl, DAMP_BUTTON):
                    damp_requested = True
                    break

                # X (rising edge) toggles the depth-far hold. Latched: held in
                # depth_far_hold and shipped to the policy in the state packet.
                depth_hold_btn = btn(ctrl, DEPTH_HOLD_BUTTON)
                if depth_hold_btn and not prev_depth_hold_btn:
                    depth_far_hold = not depth_far_hold
                    print(f"[hardware] depth-far hold {'ON (ignoring camera)' if depth_far_hold else 'OFF (reacting to balls)'}",
                          flush=True)
                prev_depth_hold_btn = depth_hold_btn

                # Y (rising edge) toggles WALK mode. Latched: shipped as mode in the
                # state packet so the policy node swaps to the walk policy (stick twist
                # drives it); flip back to dodge to react to balls.
                walk_btn = btn(ctrl, WALK_MODE_BUTTON)
                if walk_btn and not prev_walk_btn:
                    walk_mode = not walk_mode
                    print(f"[hardware] mode -> {'WALK (stick-driven loco)' if walk_mode else 'DODGE (reacting to balls)'}",
                          flush=True)
                prev_walk_btn = walk_btn

                state = robot.read_low_state()
                quat = np.array(state.imu.quat, dtype=np.float32)      # wxyz
                ang_vel = np.array(state.imu.omega, dtype=np.float32)  # body frame
                q = np.array(state.motor.q[:NUM_JOINTS], dtype=np.float32)
                dq = np.array(state.motor.dq[:NUM_JOINTS], dtype=np.float32)
                proj_grav = quat_rotate_inverse(quat, gravity)
                cmd = command_from_sticks((ctrl.lx, ctrl.ly), (ctrl.rx, ctrl.ry))

                sock.sendto(
                    pack_state(step_id, quat, ang_vel, proj_grav, q, dq, cmd,
                               depth_far_hold=depth_far_hold, mode=(1 if walk_mode else 0)),
                    policy_addr,
                )
                step_id += 1

                # Apply the newest action target (hold the last if none arrived).
                action_data = None
                try:
                    while True:
                        action_data, _ = sock.recvfrom(ACTION_BYTES + 64)
                except BlockingIOError:
                    pass
                if action_data is not None:
                    last_target = unpack_action(action_data)
                _send_pd(robot, last_target, kp, KD)

            damp(robot)
            print("Damped (B). Press START to stand again; SELECT or Ctrl-C to exit.")
    except KeyboardInterrupt:
        pass
    finally:
        # Damp FIRST (motor safety beats everything).
        damp(robot, n_ticks=50)
        sock.close()
        print("hardware_node stopped.")


if __name__ == "__main__":
    main()
