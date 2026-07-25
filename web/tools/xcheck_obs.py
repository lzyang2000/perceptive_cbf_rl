"""Emit reference observation vectors from the REAL deploy code.

deploy/policy/dodge_policy.py is the contract the ONNX checkpoints were exported
against, and it is mjlab-free (numpy only; onnxruntime is imported lazily inside
main). So we can import its actual ProprioHistory / DepthRing / assemble_obs /
depth_metres_to_obs here and dump reference vectors, then assert the JS port
reproduces them bit-for-bit. This is the same anti-drift trick
deploy/tests/test_deploy_constants.py uses for the baked arrays.

Usage: python3 tools/xcheck_obs.py > /tmp/obs_ref.json
"""

import json
import os
import sys

import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, REPO)

from deploy.policy.dodge_policy import (  # noqa: E402
    DepthRing,
    ProprioHistory,
    assemble_obs,
    depth_metres_to_obs,
)
from deploy.common.g1_deploy_constants import (  # noqa: E402
    DEFAULT_FRAME_OFFSETS,
    DEPTH_FAR,
    DEPTH_NEAR,
    NUM_JOINTS,
)

FRAME_DIM = 144
N_TICKS = 25

rng = np.random.default_rng(20260724)

proprio = ProprioHistory(4)
ring = DepthRing(DEFAULT_FRAME_OFFSETS)

ticks = []
for t in range(N_TICKS):
    ang_vel = rng.standard_normal(3).astype(np.float32)
    proj_grav = rng.standard_normal(3).astype(np.float32)
    command = rng.standard_normal(3).astype(np.float32)
    joint_pos_rel = rng.standard_normal(NUM_JOINTS).astype(np.float32)
    joint_vel_rel = rng.standard_normal(NUM_JOINTS).astype(np.float32)
    last_action = rng.standard_normal(NUM_JOINTS).astype(np.float32)

    # Raw depth in METRES, spanning the interesting cases: below near (no-hit),
    # inside the band, and beyond far.
    depth_m = rng.uniform(-0.5, 6.0, FRAME_DIM).astype(np.float32)

    proprio.append(
        ang_vel, proj_grav, command, joint_pos_rel, joint_vel_rel, last_action
    )
    norm = depth_metres_to_obs(depth_m, DEPTH_NEAR, DEPTH_FAR)
    stacked = ring.push(norm)
    obs = assemble_obs(proprio.vector(), stacked)

    ticks.append(
        {
            "in": {
                "ang_vel": ang_vel.tolist(),
                "proj_grav": proj_grav.tolist(),
                "command": command.tolist(),
                "joint_pos_rel": joint_pos_rel.tolist(),
                "joint_vel_rel": joint_vel_rel.tolist(),
                "last_action": last_action.tolist(),
                "depth_m": depth_m.tolist(),
            },
            "out": {
                "depth_norm": norm.tolist(),
                "proprio": proprio.vector().tolist(),
                "stacked": stacked.tolist(),
                "obs": obs.reshape(-1).tolist(),
            },
        }
    )

json.dump(
    {
        "frame_offsets": list(DEFAULT_FRAME_OFFSETS),
        "frame_dim": FRAME_DIM,
        "num_joints": int(NUM_JOINTS),
        "near": float(DEPTH_NEAR),
        "far": float(DEPTH_FAR),
        "ticks": ticks,
    },
    sys.stdout,
)
