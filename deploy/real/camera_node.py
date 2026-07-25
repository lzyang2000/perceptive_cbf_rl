"""Camera node: ZED depth -> pooled 16x9 -> UDP to the policy node.

Its own process for FAULT ISOLATION: a pyzed segfault / USB stall / ZED-SDK
deadlock must not take down the motor-control process (hardware_node), which
must stay alive to hold the stand and damp on demand. No ROS, no motor, no
command dependency -- pure perception.

Opens one (later N) ``ZedDepthSource``, reads the cached pooled ``[9,16]`` frame
at ``--hz``, packs all cameras' depth (metres, row-major) into a Depth datagram
stamped with a monotonic seq + send time, and sends it to ``UDP_DEPTH_PORT``.
The grab itself runs in the source's background thread, so ``latest_frame()``
returns in microseconds and the publish cadence is set purely by ``--hz``.

``--dry-run`` emits synthetic all-far frames so the whole UDP path runs with no
camera (loopback bring-up before touching the robot).

  uv run python deploy/real/camera_node.py [--hz 30] [--serials S1[,S2]] [--dry-run]
"""

import argparse
import os
import signal
import sys
import time

import numpy as np

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from deploy.common.g1_deploy_constants import DEPTH_FAR, DEPTH_H, DEPTH_NEAR, DEPTH_W
from deploy.common.udp_sync import (
    UDP_DEPTH_PORT,
    UDP_HOST,
    create_udp_socket,
    pack_depth,
)


def _depth_panel(img2d, scale, label, cv2, interp):
    """One JET-colormapped depth panel (metres -> red=near, blue=far) at
    DEPTH_W*scale x DEPTH_H*scale, with a crosshair on the NEAREST pixel/cell and
    min (+ its row,col) / near-fraction stats overlaid."""
    h, w = img2d.shape
    tw, th = DEPTH_W * scale, DEPTH_H * scale
    norm = np.clip((img2d - DEPTH_NEAR) / (DEPTH_FAR - DEPTH_NEAR), 0.0, 1.0)
    u8 = (255 - norm * 255).astype(np.uint8)  # near=hot
    big = cv2.resize(u8, (tw, th), interpolation=interp)
    color = cv2.applyColorMap(big, cv2.COLORMAP_JET)
    near_frac = float((norm < 0.5).mean()) * 100.0
    # Locate the nearest finite pixel/cell (invalid -> +inf so they never win) and
    # mark it, so we can SEE which region drives the reported min.
    masked = np.where(np.isfinite(img2d), img2d, np.inf)
    r, c = np.unravel_index(int(np.argmin(masked)), masked.shape)
    mn = float(masked[r, c])
    loc = ""
    if np.isfinite(mn):
        mx, my = int((c + 0.5) / w * tw), int((r + 0.5) / h * th)
        cv2.circle(color, (mx, my), 9, (0, 0, 0), 2)            # black halo for contrast
        cv2.drawMarker(color, (mx, my), (255, 255, 255), cv2.MARKER_CROSS, 16, 2)
        loc = f"@({r},{c})"
    else:
        mn = DEPTH_FAR
    cv2.putText(color, f"{label}  min={mn:.2f}m{loc}  <2.5m:{near_frac:.0f}%",
                (6, 16), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (255, 255, 255), 1, cv2.LINE_AA)
    return color


def _colorbar(width, cv2, height=28):
    """A horizontal JET legend spanning ``width`` px: red=near (DEPTH_NEAR) on the
    left, blue=far (DEPTH_FAR) on the right, with metre tick labels. Matches the
    near=hot mapping used by _depth_panel."""
    grad = np.linspace(255, 0, max(width, 2)).astype(np.uint8)[None, :]  # near(255)->far(0)
    bar = cv2.applyColorMap(np.repeat(grad, height, axis=0), cv2.COLORMAP_JET)
    for frac in (0.0, 0.25, 0.5, 0.75, 1.0):
        d = DEPTH_NEAR + frac * (DEPTH_FAR - DEPTH_NEAR)
        x = min(max(int(frac * (width - 1)) - 12, 2), width - 38)
        cv2.putText(bar, f"{d:.1f}m", (x, height - 8), cv2.FONT_HERSHEY_SIMPLEX,
                    0.4, (255, 255, 255), 1, cv2.LINE_AA)
    return bar


def _show_view(raw_full_frames, pooled_frames, scale):
    """cv2 debug window: per camera, the RAW full-res ZED depth (where flying pixels /
    fill artifacts are visible) | the pooled obs the policy gets. JET colormap, with
    min/near-fraction stats. Lazy cv2 import keeps --view optional. A raw entry may be
    None (dry-run / full-res not retained) -- then only the pooled panel is shown."""
    import cv2

    sep = np.full((DEPTH_H * scale, 2, 3), 255, dtype=np.uint8)
    rows = []
    for raw, pooled in zip(raw_full_frames, pooled_frames):
        panels = []
        if raw is not None:
            raw_img = np.where(np.isfinite(raw) & (raw > 0.0), raw, DEPTH_FAR).astype(np.float32)
            raw_img = np.clip(raw_img, DEPTH_NEAR, DEPTH_FAR)
            panels += [_depth_panel(raw_img, scale, "RAW depth", cv2, cv2.INTER_AREA), sep]
        panels.append(
            _depth_panel(pooled.reshape(DEPTH_H, DEPTH_W), scale, "pooled->policy",
                         cv2, cv2.INTER_NEAREST)
        )
        rows.append(np.hstack(panels))
    grid = np.vstack(rows)
    out = np.vstack([grid, _colorbar(grid.shape[1], cv2)])  # JET legend (near=red .. far=blue)
    cv2.imshow("camera_node depth (raw | pooled->policy)", out)
    cv2.waitKey(1)


def main():
    parser = argparse.ArgumentParser(description="ZED depth -> UDP camera node")
    parser.add_argument("--hz", type=float, default=50.0,
                        help="UDP publish rate (Hz). Default 50 = the policy control rate, so each "
                             "control tick's depth-ring push gets a fresh frame (sim used a fresh "
                             "frame/step). The (0,3,8,18) offsets are CONTROL steps, not camera frames.")
    parser.add_argument("--camera-fps", type=int, default=60,
                        help="ZED grab FPS (VGA: 15/30/60/100). Keep >= --hz.")
    parser.add_argument("--depth-mode", default="NEURAL",
                        help="ZED DEPTH_MODE: PERFORMANCE (default, fastest) / QUALITY / NEURAL / ULTRA")
    parser.add_argument("--pool-percentile", type=float, default=3.0)
    parser.add_argument("--zed-confidence", type=int, default=50,
                        help="ZED confidence_threshold (0-100, lower=stricter; SDK default 95). "
                             "Discards low-confidence (flying/mixed) depth pixels BEFORE pooling so "
                             "empty space stops reading as a phantom near object. Lower if a ~1 m "
                             "ghost persists in empty space.")
    parser.add_argument("--zed-texture-conf", type=int, default=100,
                        help="ZED texture_confidence_threshold (0-100, lower=stricter; SDK default "
                             "100=keep all). Discards depth from low-texture regions (blank walls / "
                             "empty space). Lower this (e.g. 50) if confidence alone doesn't clear "
                             "the phantom near reading.")
    parser.add_argument("--fill-holes", action="store_true",
                        help="Enable ZED FILL depth mode (interpolates no-measure holes). OFF by "
                             "default: FILL invents a phantom near surface in empty/low-texture "
                             "space that the pool reports as a near object.")
    parser.add_argument("--edge-crop", type=int, default=30,
                        help="Blank the outer N px of the full-res depth before pooling (default "
                             "30). Kills the ZED stereo occlusion border (top/left edge emits "
                             "confident-but-bogus near depth). 0 disables. The --view raw panel "
                             "stays uncropped so you can still see the artifact.")
    parser.add_argument(
        "--serials", default="",
        help="Comma-separated ZED serial numbers, one per camera (order = obs order). "
             "Empty -> open the single default camera.",
    )
    parser.add_argument("--policy-ip", default=UDP_HOST)
    parser.add_argument("--dry-run", action="store_true",
                        help="No camera; emit synthetic all-far frames over UDP")
    parser.add_argument("--obs-far", action="store_true",
                        help="Diagnostic: freeze the PUBLISHED depth obs at ALL-FAR (an empty "
                             "image) regardless of what the camera sees -- the policy perceives no "
                             "incoming objects, so it should just hold a calm stand. The camera "
                             "still runs (unlike --dry-run).")
    parser.add_argument("--view", action="store_true",
                        help="cv2 debug window: RAW full-res ZED depth | pooled depth the policy "
                             "gets, colormapped, plus per-frame stats. The raw panel exposes flying "
                             "pixels / fill artifacts the pool hides. Needs a display (Jetson "
                             "desktop or ssh -X).")
    parser.add_argument("--view-scale", type=int, default=20,
                        help="Upscale factor for the 16x9 cells in the --view window")
    args = parser.parse_args()

    # Clean shutdown on SIGTERM (the launcher's cleanup pkill) AND SIGINT (which
    # arrives as SIG_IGN-inherited for '&'-backgrounded processes unless we
    # re-register): both must run the finally block so the ZED closes cleanly.
    # Only the FIRST signal raises -- a second (e.g. uv forwarding SIGTERM to its
    # child) must not abort the finally block mid-teardown.
    _shutting_down = [False]

    def _on_signal(signum, frame):
        if _shutting_down[0]:
            return
        _shutting_down[0] = True
        raise KeyboardInterrupt

    signal.signal(signal.SIGTERM, _on_signal)
    signal.signal(signal.SIGINT, _on_signal)

    serials = [int(s) for s in args.serials.split(",") if s.strip()]
    n_cam = max(1, len(serials)) if not args.dry_run else max(1, len(serials) or 1)

    # If the ZED grab thread stops producing new frames for this long (USB stall /
    # cable knock / SDK hiccup), reopen that camera rather than publishing a frozen
    # frame forever. The robot holds (last frame) during the ~5-6 s reopen, then
    # perception self-heals -- far better than camera_node dying and the policy
    # going permanently stale.
    STALE_RESET_S = 2.0

    def make_source(sn):
        from deploy.common.zed_depth_source import ZedDepthSource
        return ZedDepthSource(
            height=DEPTH_H, width=DEPTH_W, depth_mode=args.depth_mode,
            fps=args.camera_fps,
            min_depth_m=DEPTH_NEAR, max_depth_m=DEPTH_FAR,
            pool_percentile=args.pool_percentile, fill_invalid=DEPTH_FAR,
            fill_holes=args.fill_holes,
            confidence_threshold=args.zed_confidence,
            texture_confidence_threshold=args.zed_texture_conf,
            edge_crop_px=args.edge_crop,
            serial_number=sn,
            # full-res raw depth + RGB: needed for the --view raw panel (so we can
            # see flying pixels / fill artifacts the pool hides).
            keep_full=bool(args.view),
        )

    serial_list = serials or [None]
    sources = []
    if not args.dry_run:
        for sn in serial_list:
            sources.append(make_source(sn))
        n_cam = len(sources)
        print(f"[camera_node] opened {n_cam} ZED camera(s)")
    else:
        print(f"[camera_node] DRY RUN: emitting {n_cam} synthetic all-far frame(s)")

    sock = create_udp_socket(UDP_HOST, 0)  # ephemeral send socket
    policy_addr = (args.policy_ip, UDP_DEPTH_PORT)
    print(f"[camera_node] depth -> {args.policy_ip}:{UDP_DEPTH_PORT} @ {args.hz} Hz")

    far_frame = np.full(DEPTH_H * DEPTH_W, DEPTH_FAR, dtype=np.float32)
    far_depth = np.full(DEPTH_H * DEPTH_W * n_cam, DEPTH_FAR, dtype=np.float32)  # --obs-far publish
    if args.obs_far:
        print("[camera_node] --obs-far: publishing ALL-FAR (empty) obs; camera runs but the "
              "policy sees no objects")
    dt = 1.0 / float(args.hz)
    seq = 0
    # Per-camera health + last-good frame (held while a camera reopens).
    last_good = [far_frame.copy() for _ in range(n_cam)]
    last_count = [s.grab_count for s in sources]
    last_progress = [time.monotonic() for _ in sources]
    next_tick = time.perf_counter()
    # Achieved-rate logging: lets you SEE the real ZED grab FPS for a given mode
    # (e.g. whether NEURAL+fill actually sustains the requested --camera-fps).
    t_log = time.perf_counter()
    seq_at_log = 0
    grabs_at_log = sum(s.grab_count for s in sources)
    try:
        while True:
            now = time.perf_counter()
            sleep_t = next_tick - now
            if sleep_t > 0:
                time.sleep(sleep_t)
            next_tick += dt

            if args.dry_run:
                frames = [far_frame for _ in range(n_cam)]
            else:
                now_m = time.monotonic()
                frames = []
                for i, s in enumerate(sources):
                    gc = s.grab_count
                    if gc != last_count[i]:
                        # Fresh frame: cache it and reset the stall timer.
                        last_count[i] = gc
                        last_progress[i] = now_m
                        try:
                            last_good[i] = s.latest_frame().reshape(-1).astype(np.float32)
                        except RuntimeError:
                            pass
                    elif now_m - last_progress[i] > STALE_RESET_S:
                        # Grab thread wedged -> reopen this camera (blocks ~5-6 s;
                        # we keep publishing last_good meanwhile so the channel stays up).
                        print(f"[camera_node] camera {i} stalled ({STALE_RESET_S:.0f}s no new "
                              f"frame); reopening ...", flush=True)
                        try:
                            s.close()
                        except Exception:
                            pass
                        try:
                            sources[i] = make_source(serial_list[i])
                            last_count[i] = sources[i].grab_count
                            print(f"[camera_node] camera {i} reopened.", flush=True)
                        except Exception as exc:
                            print(f"[camera_node] camera {i} reopen failed: {exc}; retrying.",
                                  flush=True)
                        # Either way, restart the stall timer so we don't thrash the open.
                        last_progress[i] = time.monotonic()
                    frames.append(last_good[i])

            real_depth = np.concatenate(frames).astype(np.float32)
            # --obs-far: feed the policy an empty (all-far) image; the camera still
            # grabs, only the published obs is overridden.
            depth = far_depth if args.obs_far else real_depth
            sock.sendto(pack_depth(seq, time.time(), n_cam, depth), policy_addr)
            seq += 1

            if args.view:
                raw_full = ([sources[i].latest_full()[0] for i in range(n_cam)]
                            if sources else [None] * n_cam)
                _show_view(raw_full, frames, args.view_scale)

            now = time.perf_counter()
            if now - t_log >= 3.0:
                pub_fps = (seq - seq_at_log) / (now - t_log)
                if sources:
                    grabs = sum(s.grab_count for s in sources)
                    # max(0, ...): grab_count resets to 0 after a reopen.
                    grab_fps = max(0.0, grabs - grabs_at_log) / (now - t_log) / max(1, len(sources))
                    print(f"[camera_node] publish {pub_fps:.0f} Hz | ZED grab {grab_fps:.0f} fps "
                          f"({args.depth_mode}, target {args.camera_fps})", flush=True)
                    grabs_at_log = grabs
                else:
                    print(f"[camera_node] publish {pub_fps:.0f} Hz (dry-run)", flush=True)
                t_log, seq_at_log = now, seq
    except KeyboardInterrupt:
        pass
    finally:
        for s in sources:
            s.close()
        sock.close()
        print("camera_node stopped.")


if __name__ == "__main__":
    main()
