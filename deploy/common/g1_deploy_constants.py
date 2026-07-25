"""mjlab-FREE baked G1 constants for the single-cam depth-dodge deploy.

The robot runs this module with NO mjlab import (mjlab pulls in warp/mujoco at
import time, which we do not want on the Jetson). Every number here is a frozen
literal generated once from the dev-box source of truth
``src.assets.robots.unitree_g1.g1_constants`` by
``deploy/scripts/gen_deploy_constants.py``; ``deploy/tests/test_deploy_constants.py``
re-derives and asserts equality to 1e-6 so the bake cannot silently drift.

Re-bake whenever the G1 actuators / KNEES_BENT keyframe change:

    uv run python deploy/scripts/gen_deploy_constants.py   # prints the arrays
    # paste DEFAULT_POS / KP / KD / ACTION_SCALE below, then run the test.

NOTE: this repo assigns ``hip_pitch``/``hip_roll``/``knee`` to the 7520_22
actuator and ``hip_yaw``/``waist_yaw`` to 7520_14, and wrists to 5010_16 -- a
DIFFERENT mapping from the wbc deploy. The numbers below reflect THIS repo, so
do not copy gains across projects; always regenerate.
"""

import numpy as np

# ---------------------------------------------------------------------------
# Joint order (the 29-DOF order the policy was trained with; identical to
# amp_policy.py and the hardware_node). Hip/knee/ankle x2, waist x3,
# shoulder/elbow/wrist x2.
# ---------------------------------------------------------------------------
POLICY_JOINT_NAMES = [
    "left_hip_pitch_joint", "left_hip_roll_joint", "left_hip_yaw_joint",
    "left_knee_joint", "left_ankle_pitch_joint", "left_ankle_roll_joint",
    "right_hip_pitch_joint", "right_hip_roll_joint", "right_hip_yaw_joint",
    "right_knee_joint", "right_ankle_pitch_joint", "right_ankle_roll_joint",
    "waist_yaw_joint", "waist_roll_joint", "waist_pitch_joint",
    "left_shoulder_pitch_joint", "left_shoulder_roll_joint", "left_shoulder_yaw_joint",
    "left_elbow_joint", "left_wrist_roll_joint", "left_wrist_pitch_joint", "left_wrist_yaw_joint",
    "right_shoulder_pitch_joint", "right_shoulder_roll_joint", "right_shoulder_yaw_joint",
    "right_elbow_joint", "right_wrist_roll_joint", "right_wrist_pitch_joint", "right_wrist_yaw_joint",
]
NUM_JOINTS = len(POLICY_JOINT_NAMES)  # 29

# ---------------------------------------------------------------------------
# Baked per-joint arrays (generated from g1_constants.py; do not hand-edit).
# ---------------------------------------------------------------------------
# KNEES_BENT_KEYFRAME rest pose, resolved onto POLICY_JOINT_NAMES.
DEFAULT_POS = np.array([
    -0.312, 0.0, 0.0, 0.669, -0.363, 0.0,
    -0.312, 0.0, 0.0, 0.669, -0.363, 0.0,
    0.0, 0.0, 0.0,
    0.2, 0.2, 0.0, 0.6, 0.0, 0.0, 0.0,
    0.2, -0.2, 0.0, 0.6, 0.0, 0.0, 0.0,
], dtype=np.float32)

# PD position gains (= actuator stiffness; ankle/waist-pitch/roll carry the x2
# parallel-linkage scaling).
KP = np.array([
    99.09842777666111, 99.09842777666111, 40.17923863450712, 99.09842777666111,
    28.50124619574858, 28.50124619574858, 99.09842777666111, 99.09842777666111,
    40.17923863450712, 99.09842777666111, 28.50124619574858, 28.50124619574858,
    40.17923863450712, 28.50124619574858, 28.50124619574858, 14.25062309787429,
    14.25062309787429, 14.25062309787429, 14.25062309787429, 14.25062309787429,
    8.611032447370201, 8.611032447370201, 14.25062309787429, 14.25062309787429,
    14.25062309787429, 14.25062309787429, 14.25062309787429, 8.611032447370201,
    8.611032447370201,
], dtype=np.float32)

# PD velocity gains (= actuator damping; same x2 scaling).
KD = np.array([
    6.308801853496639, 6.308801853496639, 2.557889775413375, 6.308801853496639,
    1.814445686584846, 1.814445686584846, 6.308801853496639, 6.308801853496639,
    2.557889775413375, 6.308801853496639, 1.814445686584846, 1.814445686584846,
    2.557889775413375, 1.814445686584846, 1.814445686584846, 0.907222843292423,
    0.907222843292423, 0.907222843292423, 0.907222843292423, 0.907222843292423,
    0.548195351665136, 0.548195351665136, 0.907222843292423, 0.907222843292423,
    0.907222843292423, 0.907222843292423, 0.907222843292423, 0.548195351665136,
    0.548195351665136,
], dtype=np.float32)

# Action scale (0.25 * effort_limit / stiffness per joint). target = DEFAULT_POS
# + action * ACTION_SCALE.
ACTION_SCALE = np.array([
    0.35066146637882434, 0.35066146637882434, 0.5475464629911068, 0.35066146637882434,
    0.43857731392336724, 0.43857731392336724, 0.35066146637882434, 0.35066146637882434,
    0.5475464629911068, 0.35066146637882434, 0.43857731392336724, 0.43857731392336724,
    0.5475464629911068, 0.43857731392336724, 0.43857731392336724, 0.43857731392336724,
    0.43857731392336724, 0.43857731392336724, 0.43857731392336724, 0.43857731392336724,
    0.2903252328080005, 0.2903252328080005, 0.43857731392336724, 0.43857731392336724,
    0.43857731392336724, 0.43857731392336724, 0.43857731392336724, 0.2903252328080005,
    0.2903252328080005,
], dtype=np.float32)

# ---------------------------------------------------------------------------
# Depth observation parameters (single head camera).
# ---------------------------------------------------------------------------
DEPTH_H = 9
DEPTH_W = 16
# DepthImageObs data clip [near, far] (metres). The mujoco_warp sensor returns
# true distance; the policy applies this as a clamp before normalising, exactly
# as the live ZED path must.
DEPTH_NEAR = 0.1
DEPTH_FAR = 5.0
# Depth frame stack offsets (steps ago; 0 = current). Must match the checkpoint
# (the trained single-cam policy used (0, 3, 8, 18) -> 4 * 144 = 576 depth dims).
# Override at launch to match a differently-trained checkpoint.
DEFAULT_FRAME_OFFSETS = (0, 3, 8, 18)

# Camera mount (documentation / 2-cam extension). ``head_camera_single`` sits at
# pos (0.05, 0, 0.45) in the robot head, tilted +20 deg up (vertical coverage
# -7..+47 deg), fovy 54 deg, 16:9 aspect (HFOV ~= 84.5 deg) -- matches the ZED
# Mini WVGA FOV. A 2nd (torso-down) camera would append another 144 per frame.
HEAD_CAMERA_FOVY_DEG = 54.0
HEAD_CAMERA_TILT_UP_DEG = 20.0
