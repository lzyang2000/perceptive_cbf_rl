#!/usr/bin/env python3
"""Masked-depth camera node: ZED -> EfficientTAM ball mask -> ball-only depth -> UDP.

Drop-in replacement for camera_node.py that publishes the SAME depth datagram, but with
the background removed: the EfficientTAM-segmented ball keeps its real depth and everything
else is forced to DEPTH_FAR (all-far when the track is lost). This is the live equivalent of
the sim's BallOnlyDepthObs (d = where(ball, raw, far)) -- the "clean image" path. Runs in the
DEPLOY py3.8 venv (torch 2.4.1, pyzed cp38, EfficientTAM via the py3.8-patched submodule).

CLICK the ball once in the window to start tracking (EfficientTAM then follows it and
re-acquires on re-entry). Keys: r=reset, q=quit.

  deploy/.venv/bin/python deploy/real/camera_node_etam.py --hz 50 --tiny [--serial S] [--policy-ip 127.0.0.1]

Used by play_sim_dodge.sh ETAM=1 to feed the deploy ONNX live masked depth while the sim
supplies robot dynamics (throws paused -- wave/throw a REAL ball at the camera).
"""

import argparse
import os
import signal
import sys
import time
from collections import deque

import numpy as np

_REPO_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
_RT = os.path.join(_REPO_ROOT, "deploy", "common", "RealtimeEfficientTAM")
sys.path.insert(0, _REPO_ROOT)
sys.path.insert(0, _RT)

from deploy.common.g1_deploy_constants import DEPTH_FAR, DEPTH_H, DEPTH_NEAR, DEPTH_W
from deploy.common.udp_sync import (UDP_DEPTH_PORT, UDP_HOST,
                                    create_udp_socket, pack_depth)
from deploy.common.zed_depth_source import ZedDepthSource, mask_depth_to_far, percentile_pool_depth
from deploy.tools.etam_track_live import _quiet, depth_panel, mask_too_tall, overlay_mask

WINDOW = "camera_node_etam (click the ball; r=reset, f=re-arm freeze, q=quit)"


def main():
    parser = argparse.ArgumentParser(description="ZED -> EfficientTAM ball-only depth -> UDP (deploy py3.8).")
    parser.add_argument("--hz", type=float, default=50.0, help="UDP publish rate (policy control rate)")
    parser.add_argument("--policy-ip", default="127.0.0.1")
    parser.add_argument("--serial", type=int, default=None)
    parser.add_argument("--pool-percentile", type=float, default=3.0)
    parser.add_argument("--checkpoint", default=os.path.join(_RT, "checkpoints", "efficienttam_s.pt"))
    parser.add_argument("--config", default="configs/efficienttam/efficienttam_s.yaml")
    parser.add_argument("--tiny", action="store_true", help="efficienttam_ti_512x512 (~2x faster)")
    parser.add_argument("--conf", type=float, default=0.5)
    parser.add_argument("--no-view", action="store_true", help="hide the window (then you cannot click -> all-far)")
    parser.add_argument("--freeze-first", action="store_true",
                        help="DIAGNOSTIC: latch the FIRST valid (ball-present) pooled frame and send "
                             "only that frozen observation forever after. Live tracking still runs in "
                             "the window, but the policy receives a static depth obs -- use to check the "
                             "robot's response to one fixed segmented ball. Press 'f' to re-arm/relatch.")
    parser.add_argument("--static-mask", action="store_true",
                        help="LOOMING gate: mask out the tracked cluster (send all-far) unless its "
                             "average depth is CLOSING fast enough -- a world-static ball/clutter has a "
                             "~constant range (only noise wobble), a real incoming ball collapses depth. "
                             "Pass-through by default until the trend is confirmed static (no added "
                             "latency for a genuine approach).")
    parser.add_argument("--min-closing-speed", type=float, default=1.0,
                        help="m/s: cluster avg-depth must be decreasing at least this fast to count as "
                             "an approaching ball (else masked under --static-mask). ~1.0 sits well "
                             "above the noise wobble and below a real throw (~3-5 m/s).")
    parser.add_argument("--static-window", type=int, default=12,
                        help="frames over which to least-squares-fit the closing speed (longer -> more "
                             "noise rejection; a real ball still passes during the fill, so a longer "
                             "window costs no reaction latency, only delays masking a static cluster).")
    args = parser.parse_args()
    if args.tiny:
        args.checkpoint = os.path.join(_RT, "checkpoints", "efficienttam_ti_512x512.pt")
        args.config = "configs/efficienttam/efficienttam_ti_512x512.yaml"

    import cv2
    import torch
    from efficient_track_anything.realtime_tam import build_predictor, start, track

    _shutting_down = [False]

    def _on_signal(signum, frame):
        if _shutting_down[0]:
            return
        _shutting_down[0] = True
        raise KeyboardInterrupt

    signal.signal(signal.SIGTERM, _on_signal)
    signal.signal(signal.SIGINT, _on_signal)

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    with _quiet():
        state = build_predictor(args.config, args.checkpoint, device=device)
    src = ZedDepthSource(
        height=DEPTH_H, width=DEPTH_W, min_depth_m=DEPTH_NEAR, max_depth_m=DEPTH_FAR,
        pool_percentile=args.pool_percentile, fill_invalid=DEPTH_FAR,
        serial_number=args.serial, keep_full=True,
    )

    sock = create_udp_socket(UDP_HOST, 0)
    addr = (args.policy_ip, UDP_DEPTH_PORT)
    print(f"[camera_node_etam] masked depth -> {args.policy_ip}:{UDP_DEPTH_PORT} @ {args.hz} Hz "
          f"(model={'tiny' if args.tiny else 's'})")

    pending = {"pt": None}
    if not args.no_view:
        def on_mouse(event, x, y, flags, param):
            if event == cv2.EVENT_LBUTTONDOWN:
                pending["pt"] = (int(x), int(y))
        cv2.namedWindow(WINDOW)
        cv2.setMouseCallback(WINDOW, on_mouse)

    far_pooled = np.full((DEPTH_H, DEPTH_W), DEPTH_FAR, dtype=np.float32)
    tracking = False
    frozen = None  # --freeze-first: the latched first valid pooled frame (None until captured)
    depth_hist = deque(maxlen=max(2, int(args.static_window)))  # --static-mask: recent cluster avg-depths (m)
    seq = 0
    dt = 1.0 / float(args.hz)
    next_tick = time.perf_counter()
    try:
        while True:
            now = time.perf_counter()
            if next_tick - now > 0:
                time.sleep(next_tick - now)
            next_tick += dt

            depth, bgr = src.latest_full()
            m = None
            if bgr is not None:
                with _quiet():  # silence RealtimeEfficientTAM's per-frame prints
                    if pending["pt"] is not None:
                        x, y = pending["pt"]
                        pending["pt"] = None
                        state.initialized = False
                        state.predictor.load_first_frame(bgr)
                        _ids, ml = start(state, points=np.array([[x, y]], np.float32),
                                         labels=np.array([1], np.int32), obj_id=0)
                        m = _mask_hw(ml, bgr.shape[0], bgr.shape[1], cv2)
                        tracking = True
                    elif tracking:
                        _ids, ml = track(state, bgr, confidence_threshold=args.conf)
                        m = _mask_hw(ml, bgr.shape[0], bgr.shape[1], cv2)

            # Representative depth under the raw mask (median of finite px), in metres -- used both
            # to reject masks too tall to be a ball AT THAT RANGE and for the on-screen readout.
            m_dist = None
            if m is not None and bool(m.any()) and depth is not None:
                mpx = np.asarray(depth, dtype=np.float32)[m]
                mpx = mpx[np.isfinite(mpx)]
                if mpx.size:
                    m_dist = float(np.median(mpx))

            # Ball-only depth: ball -> real depth, everything else -> far. A lost/absent track, OR a
            # mask too tall to be a ball (a person/wall the segmenter grabbed -- distance-aware, so a
            # FAR-OFF person who is small in the frame but still too tall for that range is caught) -> all far.
            too_tall = m is not None and bool(m.any()) and mask_too_tall(m, dist=m_dist)
            valid_ball = m is not None and bool(m.any()) and not too_tall
            ball_dist = m_dist if valid_ball else None  # on-screen readout

            # --static-mask: looming gate. Track the cluster's avg depth; mask it out (treat as
            # non-ball) once its range is confirmed ~constant (a world-static ball / clutter -- only
            # noise wobble, no consistent closing). A real incoming ball collapses depth, so it keeps
            # passing. Pass-through until the window fills (no latency for a genuine approach).
            static_masked = False
            if args.static_mask:
                if valid_ball and m_dist is not None:
                    depth_hist.append(m_dist)
                    if len(depth_hist) >= depth_hist.maxlen:
                        # Closing speed = -(least-squares slope of depth-vs-time) over the window.
                        # A line fit uses every sample (var ~1/N^3 in the slope), so it rejects the
                        # per-frame depth noise far better than differencing two window halves -- a
                        # +/-0.2 m wobble fits to ~0 slope, a real approach to a strong negative one.
                        d = np.asarray(depth_hist, dtype=np.float64)
                        t = np.arange(d.size, dtype=np.float64) * dt
                        slope = np.polyfit(t, d, 1)[0]  # m/s, depth change per second
                        closing = -slope                # +ve = approaching (depth shrinking)
                        if closing < args.min_closing_speed:
                            static_masked = True  # range ~constant (or receding) -> not a threat
                else:
                    depth_hist.clear()  # track gap -> restart the trend estimate

            send_ball = valid_ball and not static_masked
            if depth is not None:
                sel = m if send_ball else np.zeros(depth.shape[:2], dtype=bool)
                pooled = percentile_pool_depth(
                    mask_depth_to_far(depth, sel, DEPTH_FAR),
                    DEPTH_H, DEPTH_W, args.pool_percentile, fill_invalid=DEPTH_FAR,
                )
            else:
                pooled = far_pooled

            # --freeze-first: capture the first valid (ball-present) pooled frame, then send ONLY
            # that frozen observation to the policy from now on (live tracking keeps running for the
            # window). 'f' re-arms (frozen=None) to relatch the next valid frame.
            if args.freeze_first:
                if frozen is None and send_ball:
                    frozen = pooled.copy()
                    print("[camera_node_etam] FROZEN first segmented frame -> sending it statically", flush=True)
                sent = frozen if frozen is not None else pooled
            else:
                sent = pooled

            sock.sendto(pack_depth(seq, time.time(), 1, sent.reshape(-1)), addr)

            seq += 1

            if not args.no_view and bgr is not None:
                disp = overlay_mask(bgr, m) if valid_ball else bgr.copy()
                label = ("static (masked: all far)" if static_masked else "tracking") if valid_ball else (
                    "rejected: too tall (all far)" if too_tall else
                    "click the ball" if not tracking else "lost (all far) - click")
                cv2.putText(disp, label, (8, 22), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2, cv2.LINE_AA)
                dist_txt = f"ball: {ball_dist:.2f} m" if ball_dist is not None else "ball: -- m"
                cv2.putText(disp, dist_txt, (8, 46), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2, cv2.LINE_AA)
                if args.freeze_first:
                    froze = frozen is not None
                    cv2.putText(disp, "FROZEN (sending latched frame)" if froze else "freeze-first: armed (waiting for ball)",
                                (8, 70), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 200, 255), 2, cv2.LINE_AA)
                panel_label = "policy depth (FROZEN)" if (args.freeze_first and frozen is not None) else "policy depth"
                disp = np.hstack([disp, depth_panel(sent, disp.shape[1] // 2, disp.shape[0], panel_label)])
                cv2.imshow(WINDOW, disp)
                k = cv2.waitKey(1) & 0xFF
                if k == ord("q"):
                    break
                if k in (ord("r"), ord("c")):
                    state.initialized = False
                    tracking = False
                    frozen = None  # reset clears the latch too
                if k == ord("f"):
                    frozen = None  # re-arm: relatch the next valid segmented frame
    except KeyboardInterrupt:
        pass
    finally:
        src.close()
        sock.close()
        if not args.no_view:
            cv2.destroyAllWindows()


def _mask_hw(mask_logits, h, w, cv2):
    m = (mask_logits[0, 0] > 0.0).detach().cpu().numpy()
    if m.shape != (h, w):
        m = cv2.resize(m.astype(np.uint8), (w, h), interpolation=cv2.INTER_NEAREST) > 0
    return m


if __name__ == "__main__":
    main()
