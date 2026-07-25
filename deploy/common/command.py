"""Nominal-twist command for the dodge policy + wireless-remote left-stick map.

The dodge actor observes a 3-vector command ``[vx, vy, yaw_rate]`` (the same
``twist`` term the policy trained on). The default is ``[0, 0, 0]`` --
stand-and-dodge: the robot holds position and reacts to thrown balls. The
operator can nudge it with the wireless remote's left stick (translation) and
right stick x (yaw), e.g. to walk it back to a start spot between throws.

Pure functions (no SDK import) so they unit-test and import anywhere.
"""

import numpy as np

CMD_VX = 0
CMD_VY = 1
CMD_YAW_RATE = 2
CMD_SIZE = 3

# Stand-and-dodge default: zero twist.
NOMINAL_COMMAND = np.zeros(CMD_SIZE, dtype=np.float32)

# Stick -> command gains (m/s, m/s, rad/s) at full deflection. Set to the
# AMP-Flat WALK policy's training command range (amp_env_cfg.py: lin_vel_x
# (-1.5,3.0), lin_vel_y (-1.0,1.0), ang_vel_z (-pi/2,pi/2)) so a full-stick walk
# stays in-distribution. Signs assume left_stick = [x(right+), y(fwd+)]; VERIFY
# the handedness on hardware before trusting lateral/yaw directions.
#
# NOTE (dodge mode shares these gains): the dodge policy trained with
# max_ang_vel_z=1.0 and effectively ~0 commanded yaw, so YAW_SCALE=1.57 is for
# WALK -- cranking the yaw stick *while in dodge mode* commands beyond the dodge
# policy's trained yaw. Keep yaw near neutral in dodge mode (it's camera-driven).
VX_SCALE = 1.5
VY_SCALE = 1.0
YAW_SCALE = 1.57
DEADZONE = 0.1


def make_command() -> np.ndarray:
    """Fresh copy of the nominal (zero) command."""
    return NOMINAL_COMMAND.copy()


def _dz(v: float) -> float:
    return 0.0 if abs(v) < DEADZONE else float(v)


def command_from_sticks(left_stick, right_stick) -> np.ndarray:
    """Map wireless-remote sticks to ``[vx, vy, yaw_rate]`` with a deadzone.

    left_stick = [x, y] -> (vy, vx); right_stick = [x, y] -> yaw from x.
    The remote's stick-x axis is inverted on this hardware (both sticks), so the
    x reading is negated -> left-stick x gives +vy to the left and right-stick x
    gives +yaw_rate as expected. (Verified on the G1 remote.)
    """
    lx, ly = -float(left_stick[0]), float(left_stick[1])  # negate x (both sticks inverted)
    rx = -float(right_stick[0])
    cmd = np.zeros(CMD_SIZE, dtype=np.float32)
    cmd[CMD_VX] = _dz(ly) * VX_SCALE
    cmd[CMD_VY] = _dz(lx) * VY_SCALE
    cmd[CMD_YAW_RATE] = _dz(rx) * YAW_SCALE
    return cmd
