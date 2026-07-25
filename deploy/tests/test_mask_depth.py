import os
import sys

import numpy as np

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from deploy.common.zed_depth_source import mask_depth_to_far, percentile_pool_depth


def test_non_masked_pixels_become_far():
    depth = np.full((4, 6), 1.5, dtype=np.float32)  # everything near
    mask = np.zeros((4, 6), dtype=bool)
    mask[1:3, 2:4] = True                            # a small "ball" region
    out = mask_depth_to_far(depth, mask, far=5.0)
    assert np.all(out[mask] == 1.5)                  # ball depth kept
    assert np.all(out[~mask] == 5.0)                 # everything else forced far
    assert out.dtype == np.float32
    assert depth[0, 0] == 1.5                         # input not mutated


def test_empty_mask_is_all_far():
    # Track lost / not started -> empty mask -> everything far (policy sees no near object).
    depth = np.random.uniform(0.3, 1.0, (8, 8)).astype(np.float32)
    out = mask_depth_to_far(depth, np.zeros((8, 8), dtype=bool), far=5.0)
    assert np.all(out == 5.0)


def test_shape_mismatch_raises():
    depth = np.zeros((4, 6), dtype=np.float32)
    try:
        mask_depth_to_far(depth, np.zeros((4, 5), dtype=bool), far=5.0)
        assert False, "expected ValueError on shape mismatch"
    except ValueError:
        pass


def test_masked_then_pooled_keeps_ball_drops_background():
    # Ball pixels near (1.0 m) in one corner; rest is junk-near (0.3 m) that masking removes.
    depth = np.full((18, 32), 0.3, dtype=np.float32)
    mask = np.zeros((18, 32), dtype=bool)
    mask[0:2, 0:2] = True
    depth[0:2, 0:2] = 1.0
    masked = mask_depth_to_far(depth, mask, far=5.0)
    pooled = percentile_pool_depth(masked, 9, 16, percentile=3.0, fill_invalid=5.0)  # [9,16]
    assert pooled.shape == (9, 16)
    assert pooled[0, 0] == 1.0           # the ball cell reads near
    assert np.all(pooled[1:, :] == 5.0)  # everywhere the ball isn't reads far (background gone)
