import os
import sys

import numpy as np

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from deploy.tools.etam_track_live import mask_too_tall


def test_compact_ball_kept():
    m = np.zeros((376, 672), dtype=bool)
    m[170:210, 320:360] = True            # ~40 px tall ball -> 0.11 of height
    assert not mask_too_tall(m)


def test_person_height_rejected():
    m = np.zeros((376, 672), dtype=bool)
    m[20:360, 300:340] = True             # ~340 px tall -> 0.90 of height
    assert mask_too_tall(m)


def test_empty_mask_not_too_tall():
    assert not mask_too_tall(np.zeros((376, 672), dtype=bool))


def test_threshold_is_fraction_of_height():
    m = np.zeros((100, 100), dtype=bool)
    m[0:60, 0:10] = True                  # 60% tall
    assert mask_too_tall(m, max_height_frac=0.5)
    assert not mask_too_tall(m, max_height_frac=0.7)


def _mask(frac, h=376, w=672):
    m = np.zeros((h, w), dtype=bool)
    n = int(frac * h)
    m[h // 2 : h // 2 + n, w // 2 - 5 : w // 2 + 5] = True
    return m


def test_far_blob_too_tall_for_distance_rejected():
    # A 30%-tall blob is UNDER the absolute 0.5 cap (so the old rule kept it), but at 2.46 m a
    # real ball (<=0.45 m diam) can only span ~18% of the frame -> distance-aware reject.
    m = _mask(0.30)
    assert not mask_too_tall(m)                 # old absolute rule: kept
    assert mask_too_tall(m, dist=2.46)          # distance-aware: rejected


def test_real_ball_far_kept():
    # A real ~0.22 m ball at 2.46 m subtends ~9% of the frame -> kept under both caps.
    m = _mask(0.09)
    assert not mask_too_tall(m, dist=2.46)


def test_large_blob_close_kept():
    # The same 30%-tall blob up close (0.6 m) is consistent with a ball -> kept.
    assert not mask_too_tall(_mask(0.30), dist=0.6)


def test_no_distance_falls_back_to_absolute_cap():
    # dist=None / non-finite -> only the absolute cap applies (back-compat).
    m = _mask(0.30)
    assert not mask_too_tall(m, dist=None)
    assert not mask_too_tall(m, dist=float("nan"))
    assert not mask_too_tall(m, dist=0.0)
