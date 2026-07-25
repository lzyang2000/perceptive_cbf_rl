"""One-shot generator for ``deploy/common/g1_deploy_constants.py``.

Imports the dev-box source of truth
(``src.assets.robots.unitree_g1.g1_constants``) and prints the per-joint
arrays the mjlab-free deploy module bakes as literals: the 29-joint policy
order, the KNEES_BENT rest pose, the PD gains (KP/KD), and the action scale
(``0.25 * effort_limit / stiffness``). Run on the dev box and paste the output
into ``g1_deploy_constants.py``; ``deploy/tests/test_deploy_constants.py`` then
re-derives and asserts equality to 1e-6 so the bake cannot silently drift.

    uv run python deploy/scripts/gen_deploy_constants.py
"""

import os
import re
import sys

import numpy as np

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

# The 29-joint order the policy was trained with (identical to amp_policy.py /
# the hardware_node POLICY_JOINT_NAMES). Hip/knee/ankle x2, waist x3,
# shoulder/elbow/wrist x2.
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


def main():
    from src.assets.robots.unitree_g1.g1_constants import (
        G1_ACTION_SCALE,
        G1_ARTICULATION,
        KNEES_BENT_KEYFRAME,
    )

    names = POLICY_JOINT_NAMES
    n = len(names)

    default_pos = np.zeros(n)
    for i, name in enumerate(names):
        for pattern, value in KNEES_BENT_KEYFRAME.joint_pos.items():
            if re.fullmatch(pattern, name):
                default_pos[i] = value
                break

    kp = np.full(n, np.nan)
    kd = np.full(n, np.nan)
    for act in G1_ARTICULATION.actuators:
        for pattern in act.target_names_expr:
            for i, name in enumerate(names):
                if re.fullmatch(pattern, name):
                    kp[i] = act.stiffness
                    kd[i] = act.damping

    action_scale = np.full(n, np.nan)
    for i, name in enumerate(names):
        for pattern, scale in G1_ACTION_SCALE.items():
            if re.match(pattern, name):
                action_scale[i] = scale
                break

    assert not np.isnan(kp).any() and not np.isnan(kd).any()
    assert not np.isnan(action_scale).any()

    def fmt(arr, name):
        body = ",\n    ".join(repr(float(x)) for x in arr)
        return f"{name} = np.array([\n    {body},\n], dtype=np.float32)\n"

    print("# --- paste below into g1_deploy_constants.py (regenerate via gen_deploy_constants.py) ---")
    print(fmt(default_pos, "DEFAULT_POS"))
    print(fmt(kp, "KP"))
    print(fmt(kd, "KD"))
    print(fmt(action_scale, "ACTION_SCALE"))


if __name__ == "__main__":
    main()
