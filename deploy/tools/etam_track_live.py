#!/usr/bin/env python3
"""Live ball tracking on the ZED with RealtimeEfficientTAM.

Runs in the py3.8 DEPLOY venv (torch 2.4.1) -- EfficientTAM works on py3.8 once the
submodule is patched once via deploy/tools/patch_efficienttam_py38.py (the requires-
python>=3.10/torch>=2.5.1 pins are conservative). No TensorRT needed.
Streams the ZED LEFT RGB through EfficientTAM's camera predictor: CLICK the ball to
(re)start a track from the current frame, then it propagates frame-by-frame using
EfficientTAM's memory (the point of using it -- it re-acquires the ball on re-entry
far better than per-frame centroid re-prompting). No depth needed.

Keys: click=(re)init the track from the current frame, r=reset, q=quit. Per-frame
track latency is overlaid.

  deploy/.venv/bin/python deploy/tools/etam_track_live.py --tiny [--serial S] [--conf 0.5]
      # --tiny = efficienttam_ti_512x512 (~2x faster); omit for the more accurate _s
"""

import argparse
import contextlib
import math
import os
import sys
import time

import numpy as np

_REPO_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
_RT = os.path.join(_REPO_ROOT, "deploy", "common", "RealtimeEfficientTAM")
sys.path.insert(0, _REPO_ROOT)
sys.path.insert(0, _RT)  # efficient_track_anything namespace + hydra config search path

from deploy.common.g1_deploy_constants import DEPTH_FAR, DEPTH_H, DEPTH_NEAR, DEPTH_W
from deploy.common.zed_depth_source import ZedDepthSource, mask_depth_to_far, percentile_pool_depth

WINDOW = "EfficientTAM live (click=track, r=reset, q=quit)"


def overlay_mask(bgr, mask, color=(0, 0, 255), alpha=0.5):
    """Blend a boolean HxW mask over a BGR uint8 image as a translucent color (new array)."""
    out = bgr.copy()
    sel = np.asarray(mask, dtype=bool)
    out[sel] = ((1.0 - alpha) * out[sel] + alpha * np.array(color, dtype=np.float32)).astype(np.uint8)
    return out


MASK_MAX_HEIGHT_FRAC = 0.5  # mask taller than this fraction of the frame -> not a ball (person/wall) -> discard
BALL_CAM_VFOV_DEG = 54.0    # vertical FOV of the head depth cam (fovy 54, matches the ZED VGA mount)
BALL_DIAM_MAX_M = 0.65      # generous upper bound on a dodgeball diameter (incl. segmenter overshoot);
#                             a mask taller than this ball would subtend at its measured range -> reject.
#                             Relaxed (0.45 -> 0.65) so a slightly-baggy mask isn't rejected too eagerly.


def mask_too_tall(mask, max_height_frac=MASK_MAX_HEIGHT_FRAC, dist=None,
                  vfov_deg=BALL_CAM_VFOV_DEG, ball_diam_max=BALL_DIAM_MAX_M):
    """True if the mask's vertical bbox is too tall to be a ball -> discard it (feed all-far)
    rather than hand the policy a human/wall-sized 'ball'. A dodgeball is compact; a tall mask
    is a person/wall/clutter the segmenter grabbed. Two caps, whichever is TIGHTER:

    * absolute: taller than ``max_height_frac`` of the frame (person/wall, any range).
    * distance-aware: a ball of diameter <= ``ball_diam_max`` at range ``dist`` subtends at most
      ``ball_diam_max / (2 d tan(vfov/2))`` of the frame height, so a mask taller than that AT ITS
      MEASURED DISTANCE can't be a ball (e.g. a far-off person the segmenter latched onto -- which
      the absolute cap alone misses, since a distant person is small in the frame). Applied only
      when ``dist`` is a finite positive depth (m); skipped otherwise.
    """
    m = np.asarray(mask, dtype=bool)
    rows = np.nonzero(m.any(axis=1))[0]
    if rows.size == 0:
        return False
    frac = (rows[-1] - rows[0] + 1) / m.shape[0]
    cap = max_height_frac
    if dist is not None and np.isfinite(dist) and dist > 0.0:
        dist_cap = ball_diam_max / (2.0 * float(dist) * math.tan(math.radians(vfov_deg) * 0.5))
        cap = min(cap, dist_cap)
    return frac > cap


def depth_panel(pooled, out_w, out_h, label):
    """Render a pooled [DEPTH_H, DEPTH_W] depth map as a JET image (near=hot) in an out_w x out_h box.

    The depth obs is WIDE (DEPTH_H=9 x DEPTH_W=16, i.e. 16:9). Preserve that aspect and letterbox
    into the box -- otherwise stretching a wide map into a tall box makes it look (wrongly) portrait.
    """
    import cv2

    norm = np.clip((pooled - DEPTH_NEAR) / (DEPTH_FAR - DEPTH_NEAR), 0.0, 1.0)
    u8 = (255 - norm * 255).astype(np.uint8)  # near = hot
    h, w = u8.shape[:2]  # (DEPTH_H, DEPTH_W)
    # Largest integer-friendly fit that keeps the w:h (16:9) aspect inside the box.
    scale = min(out_w / w, out_h / h)
    fit_w, fit_h = max(1, int(w * scale)), max(1, int(h * scale))
    big = cv2.resize(u8, (fit_w, fit_h), interpolation=cv2.INTER_NEAREST)
    color = cv2.applyColorMap(big, cv2.COLORMAP_JET)
    # Letterbox: center the wide strip in the box on a dark background.
    canvas = np.zeros((out_h, out_w, 3), dtype=np.uint8)
    y0, x0 = (out_h - fit_h) // 2, (out_w - fit_w) // 2
    canvas[y0:y0 + fit_h, x0:x0 + fit_w] = color
    cv2.putText(canvas, label, (8, 22), cv2.FONT_HERSHEY_SIMPLEX, 0.55, (255, 255, 255), 2, cv2.LINE_AA)
    return canvas


@contextlib.contextmanager
def _quiet():
    """Silence realtime_tam's per-frame prints."""
    with open(os.devnull, "w") as fn, contextlib.redirect_stdout(fn):
        yield


def _mask_hw(mask_logits, h, w):
    """First object's logits [N,1,H,W] -> boolean (h, w), resized if the model emitted a different size."""
    import cv2

    m = (mask_logits[0, 0] > 0.0).detach().cpu().numpy()
    if m.shape != (h, w):
        m = cv2.resize(m.astype(np.uint8), (w, h), interpolation=cv2.INTER_NEAREST) > 0
    return m


def main():
    parser = argparse.ArgumentParser(description="Live EfficientTAM ball tracking on the ZED (py3.10).")
    parser.add_argument("--checkpoint", default=os.path.join(_RT, "checkpoints", "efficienttam_s.pt"))
    parser.add_argument("--config", default="configs/efficienttam/efficienttam_s.yaml",
                        help="hydra config name (relative to the efficient_track_anything package)")
    parser.add_argument("--serial", type=int, default=None)
    parser.add_argument("--max-depth-m", type=float, default=5.0)
    parser.add_argument("--conf", type=float, default=0.5, help="track() confidence threshold")
    parser.add_argument("--tiny", action="store_true",
                        help="use efficienttam_ti_512x512 (~2x faster, lower-res/accuracy) instead of _s")
    parser.add_argument("--depth", action="store_true",
                        help="also show the masked policy depth: ball kept, all else -> far, pooled to [9,16]")
    args = parser.parse_args()
    if args.tiny:
        args.checkpoint = os.path.join(_RT, "checkpoints", "efficienttam_ti_512x512.pt")
        args.config = "configs/efficienttam/efficienttam_ti_512x512.yaml"

    import cv2
    import torch
    from efficient_track_anything.realtime_tam import build_predictor, start, track

    if not os.path.exists(args.checkpoint):
        raise SystemExit(f"checkpoint not found: {args.checkpoint}")

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    state = build_predictor(args.config, args.checkpoint, device=device)
    src = ZedDepthSource(keep_full=True, serial_number=args.serial, max_depth_m=args.max_depth_m)

    pending = {"pt": None}  # a click (re)initialises the track on the next frame

    def on_mouse(event, x, y, flags, param):
        if event == cv2.EVENT_LBUTTONDOWN:
            pending["pt"] = (int(x), int(y))

    cv2.namedWindow(WINDOW)
    cv2.setMouseCallback(WINDOW, on_mouse)

    tracking = False
    try:
        while True:
            _depth, bgr = src.latest_full()
            if bgr is None:
                time.sleep(0.005)
                continue
            h, w = bgr.shape[:2]
            disp, m, dt = bgr, None, None

            if pending["pt"] is not None:
                x, y = pending["pt"]
                pending["pt"] = None
                state.initialized = False  # allow re-init of the sequence from this frame
                with _quiet():
                    state.predictor.load_first_frame(bgr)  # BGR np array (matches repo's read_frame)
                    t0 = time.perf_counter()
                    _ids, ml = start(state, points=np.array([[x, y]], np.float32),
                                     labels=np.array([1], np.int32), obj_id=0)
                dt = (time.perf_counter() - t0) * 1e3
                m = _mask_hw(ml, h, w)
                tracking = True
            elif tracking:
                with _quiet():
                    t0 = time.perf_counter()
                    _ids, ml = track(state, bgr, confidence_threshold=args.conf)
                dt = (time.perf_counter() - t0) * 1e3
                m = _mask_hw(ml, h, w)

            if m is not None and m.any():
                disp = overlay_mask(bgr, m)
                ys, xs = np.nonzero(m)
                cv2.circle(disp, (int(np.median(xs)), int(np.median(ys))), 5, (0, 255, 0), -1)
                label = f"track {dt:.0f}ms  ({int(m.sum())}px)"
            elif tracking:
                label = f"track {dt:.0f}ms  (no mask)" if dt is not None else "tracking"
            else:
                label = "click the ball to track"

            cv2.putText(disp, label, (8, 22), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2, cv2.LINE_AA)

            if args.depth and _depth is not None:
                # Mask the depth (ball kept, background -> far), then pool to the [9,16] the
                # policy consumes -- exactly the live pipeline (fill_invalid=DEPTH_FAR). When the
                # track is lost (or not yet started) there's NO valid mask: feed ALL FAR rather
                # than raw clutter, so the policy sees "no near object" instead of garbage it
                # wasn't trained on. An empty mask through the same helper yields all-far.
                _mpx = np.asarray(_depth, dtype=np.float32)[m] if (m is not None and bool(m.any())) else None
                _mpx = _mpx[np.isfinite(_mpx)] if _mpx is not None else None
                _mdist = float(np.median(_mpx)) if (_mpx is not None and _mpx.size) else None
                too_tall = m is not None and bool(m.any()) and mask_too_tall(m, dist=_mdist)
                have_mask = m is not None and bool(m.any()) and not too_tall
                sel = m if have_mask else np.zeros(np.asarray(_depth).shape[:2], dtype=bool)
                md = mask_depth_to_far(_depth, sel, DEPTH_FAR)
                dlabel = ("policy depth (masked)" if have_mask else
                          "policy depth (all far - too tall)" if too_tall else
                          "policy depth (all far - no track)")
                pooled = percentile_pool_depth(md, DEPTH_H, DEPTH_W, percentile=3.0, fill_invalid=DEPTH_FAR)
                disp = np.hstack([disp, depth_panel(pooled, disp.shape[1] // 2, disp.shape[0], dlabel)])

            cv2.imshow(WINDOW, disp)
            k = cv2.waitKey(1) & 0xFF
            if k == ord("q"):
                break
            if k in (ord("r"), ord("c")):
                state.initialized = False
                tracking = False
    finally:
        src.close()
        cv2.destroyAllWindows()


if __name__ == "__main__":
    main()
