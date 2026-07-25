"""Drift guard: the baked deploy constants must equal a live re-derivation
from ``src.assets.robots.unitree_g1.g1_constants`` to 1e-6.

The robot runs ``g1_deploy_constants`` with NO mjlab import; the numbers are
frozen literals baked once by ``deploy/scripts/gen_deploy_constants.py``. This
test re-derives them from the source of truth and compares, so an edit to the
G1 actuators / keyframe in ``g1_constants.py`` that is not re-baked fails here
instead of silently shipping a wrong PD gain or rest pose to the hardware.

Runs on the DEV box only (imports mjlab via g1_constants); it is not part of
the robot's py3.8 deploy env.
"""

import os
import re
import sys

import numpy as np

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from deploy.common import g1_deploy_constants as C


def _derive():
    """Re-derive (joint_names, default_pos, kp, kd, action_scale) from g1_constants."""
    from src.assets.robots.unitree_g1.g1_constants import (
        G1_ACTION_SCALE,
        G1_ARTICULATION,
        KNEES_BENT_KEYFRAME,
    )

    names = C.POLICY_JOINT_NAMES
    n = len(names)

    # DEFAULT_POS: first keyframe pattern that fullmatches a joint wins; else 0.
    default_pos = np.zeros(n, dtype=np.float64)
    for i, name in enumerate(names):
        for pattern, value in KNEES_BENT_KEYFRAME.joint_pos.items():
            if re.fullmatch(pattern, name):
                default_pos[i] = value
                break

    # KP / KD: the actuator whose target_names_expr fullmatches this joint.
    kp = np.full(n, np.nan, dtype=np.float64)
    kd = np.full(n, np.nan, dtype=np.float64)
    for act in G1_ARTICULATION.actuators:
        for pattern in act.target_names_expr:
            for i, name in enumerate(names):
                if re.fullmatch(pattern, name):
                    kp[i] = act.stiffness
                    kd[i] = act.damping
    assert not np.isnan(kp).any(), "a joint matched no actuator (KP)"
    assert not np.isnan(kd).any(), "a joint matched no actuator (KD)"

    # ACTION_SCALE: first G1_ACTION_SCALE regex that matches (re.match, mirrors amp_policy).
    action_scale = np.full(n, np.nan, dtype=np.float64)
    for i, name in enumerate(names):
        for pattern, scale in G1_ACTION_SCALE.items():
            if re.match(pattern, name):
                action_scale[i] = scale
                break
    assert not np.isnan(action_scale).any(), "a joint matched no action scale"

    return names, default_pos, kp, kd, action_scale


def test_joint_order_is_29_and_matches_source():
    names, *_ = _derive()
    assert len(names) == 29
    assert list(C.POLICY_JOINT_NAMES) == list(names)


def test_default_pos_matches():
    _, default_pos, *_ = _derive()
    np.testing.assert_allclose(C.DEFAULT_POS, default_pos, atol=1e-6)


def test_kp_kd_match():
    _, _, kp, kd, _ = _derive()
    np.testing.assert_allclose(C.KP, kp, atol=1e-6)
    np.testing.assert_allclose(C.KD, kd, atol=1e-6)


def test_action_scale_matches():
    *_, action_scale = _derive()
    np.testing.assert_allclose(C.ACTION_SCALE, action_scale, atol=1e-6)


def test_action_scale_consistency_with_kp():
    # ACTION_SCALE = 0.25 * effort_limit / stiffness, and KP = stiffness, so
    # ACTION_SCALE * KP = 0.25 * effort_limit. Just sanity that the arrays agree
    # in shape and are positive (a zero would null an actuator).
    assert C.ACTION_SCALE.shape == C.KP.shape == C.KD.shape == (29,)
    assert (C.ACTION_SCALE > 0).all()
    assert (C.KP > 0).all() and (C.KD > 0).all()


def test_depth_params():
    assert C.DEPTH_H == 9 and C.DEPTH_W == 16
    assert C.DEPTH_NEAR == 0.1 and C.DEPTH_FAR == 5.0
    assert C.DEFAULT_FRAME_OFFSETS == (0, 3, 8, 18)


def _run():
    fns = [v for k, v in sorted(globals().items()) if k.startswith("test_")]
    for fn in fns:
        fn()
        print(f"  ok  {fn.__name__}")
    print(f"deploy_constants: {len(fns)} tests passed")


if __name__ == "__main__":
    _run()
