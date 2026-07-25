"""Live ZED Mini depth source for the hardware dodge deploy (numpy-only).

Ported from ``src/deploy/zed_depth_source.py`` with torch DROPPED: ``latest_frame()``
returns a numpy ``[H, W]`` float32 depth in metres (invalid -> ``fill_invalid``,
default ``far`` to match sim play). The policy node then applies the DepthImageObs
no-hit->far / clamp / normalise, so the policy sees the same representation it
trained on.

``pyzed`` is imported lazily inside :class:`ZedDepthSource` so this module (and the
pure ``percentile_pool_depth`` / ``min_pool_depth`` helpers + their self-test)
import and run without the SDK or a camera.
"""

from __future__ import annotations

import threading
import time

import numpy as np


def percentile_pool_depth(
    depth_full: np.ndarray,
    height: int,
    width: int,
    percentile: float = 0.0,
    fill_invalid: float = 0.0,
) -> np.ndarray:
    """Downsample full-res depth (metres) to ``height x width`` by a low-percentile
    ("soft-min") pool per block, ignoring invalid pixels.

    A LOW percentile preserves a small near object (the ball) while rejecting the
    1-2 spurious near pixels strict-min would let darken a cell; it must stay below
    the ball's per-block pixel fraction (~5-18% over 2-5 m), so keep it small (~2-5).
    Average pooling is wrong: it blends a small ball into the far background and
    invents a mid-distance surface the natively-rendered sim depth never makes.

    Invalid pixels (NaN, +/-Inf, or <= 0 -- ZED no-measure / too far / too near) are
    excluded; an all-invalid block returns ``fill_invalid`` (pass ``far`` so empty
    blocks read as far to the policy, identical to its 0->far->1 mapping). The frame
    is centre-cropped to an integer-divisible size before pooling.
    """
    if depth_full.ndim != 2:
        raise ValueError(f"expected a 2-D depth map, got shape {depth_full.shape}")
    if not 0.0 <= percentile <= 100.0:
        raise ValueError(f"percentile must be in [0, 100], got {percentile}")
    h0, w0 = depth_full.shape
    if h0 < height or w0 < width:
        raise ValueError(f"source {h0}x{w0} smaller than target {height}x{width}")

    # Push invalid pixels to +inf so they sort last; the low-percentile pick is then
    # just the k-th smallest finite value in each block.
    invalid = ~np.isfinite(depth_full) | (depth_full <= 0.0)
    d = np.where(invalid, np.inf, depth_full).astype(np.float32, copy=False)

    bh, bw = h0 // height, w0 // width
    ch, cw = bh * height, bw * width
    top, left = (h0 - ch) // 2, (w0 - cw) // 2
    blocks = (
        d[top : top + ch, left : left + cw]
        .reshape(height, bh, width, bw)
        .transpose(0, 2, 1, 3)
        .reshape(height, width, bh * bw)
    )
    # One k-th-smallest selection per block via np.partition (O(n) introselect) instead
    # of np.nanpercentile (full sort + NaN bookkeeping) -- ~10x faster, so the grab
    # thread sustains the camera FPS instead of being pool-bound. k uses np.percentile's
    # (n-1) index convention. A block with <= k valid pixels yields +inf -> fill_invalid
    # (matches the old all-invalid -> far behaviour).
    n = blocks.shape[2]
    k = int(round((n - 1) * (percentile / 100.0)))
    pooled = np.partition(blocks, k, axis=2)[:, :, k]
    return np.where(np.isfinite(pooled), pooled, fill_invalid).astype(np.float32)


def min_pool_depth(
    depth_full: np.ndarray, height: int, width: int, fill_invalid: float = 0.0
) -> np.ndarray:
    """Strict-min pool (percentile 0). Thin alias for :func:`percentile_pool_depth`."""
    return percentile_pool_depth(depth_full, height, width, 0.0, fill_invalid)


def mask_depth_to_far(
    depth_full: np.ndarray, mask: np.ndarray, far: float
) -> np.ndarray:
    """Keep depth only where ``mask`` is True; set every other pixel to ``far`` metres.

    Feeds the policy a depth frame in which a segmented object (the dodgeball, from the
    EfficientTAM mask) is the only near content and ALL background reads as far -- the
    "clean image" the policy was meant to see. Pool the result with
    :func:`percentile_pool_depth` (``fill_invalid=far``) exactly as the live pipeline does.
    Background masking also makes the stereo edge-crop unnecessary (those pixels are forced
    far). ``mask`` must match ``depth_full``'s H x W -- resize it upstream if not.
    """
    depth = np.asarray(depth_full, dtype=np.float32)
    sel = np.asarray(mask, dtype=bool)
    if sel.shape != depth.shape:
        raise ValueError(f"mask shape {sel.shape} does not match depth {depth.shape}")
    return np.where(sel, depth, np.float32(far))


class ZedDepthSource:
    """Background ZED Mini depth grabber producing sim-shaped numpy depth frames.

    ``latest_frame()`` returns the most recent pooled depth as a ``[height, width]``
    float32 numpy array in metres. The grab runs in a daemon thread so the camera
    node never blocks on the camera; it just reads the cached frame each tick.
    """

    @staticmethod
    def list_devices() -> list[tuple[int, str]]:
        """``[(serial_number, model), ...]`` for every connected ZED (for mapping a
        multi-camera rig to serials). ``[]`` if pyzed is missing."""
        try:
            import pyzed.sl as sl
        except ImportError:
            return []
        out: list[tuple[int, str]] = []
        for dev in sl.Camera.get_device_list():
            out.append((int(dev.serial_number), str(getattr(dev, "camera_model", "?"))))
        return out

    def __init__(
        self,
        height: int = 9,
        width: int = 16,
        depth_mode: str = "PERFORMANCE",
        fps: int = 60,
        flip: bool = False,
        min_depth_m: float = 0.1,
        max_depth_m: float = 5.0,
        pool_percentile: float = 3.0,
        fill_holes: bool = False,
        confidence_threshold: int = 50,
        texture_confidence_threshold: int = 100,
        edge_crop_px: int = 0,
        fill_invalid: float = 5.0,
        first_frame_timeout_s: float = 10.0,
        serial_number: int | None = None,
        open_max_attempts: int = 5,
        open_retry_delay_s: float = 2.0,
        keep_full: bool = False,
    ) -> None:
        try:
            import pyzed.sl as sl
        except ImportError as e:  # pragma: no cover - exercised only without the SDK
            raise RuntimeError(
                "pyzed is not installed. On the Jetson, install the L4T cp38 wheel:\n"
                "  uv pip install /usr/local/zed/pyzed-*-cp38-*.whl"
            ) from e

        self._sl = sl
        self.height = int(height)
        self.width = int(width)
        self._near = float(min_depth_m)
        self._far = float(max_depth_m)
        self._pool_percentile = float(pool_percentile)
        self._edge_crop = max(0, int(edge_crop_px))
        self._fill_invalid = float(fill_invalid)
        self.raw_height: int = 0
        self.raw_width: int = 0

        init = sl.InitParameters()
        init.camera_resolution = sl.RESOLUTION.VGA  # WVGA 672x376 (~16:9, matches sim FOV)
        # Pin the grab FPS (VGA supports 15/30/60/100). Keep it >= the 50 Hz control rate so the
        # policy's per-control-step depth-ring push (offsets 0/3/8/18 in CONTROL steps) gets a fresh
        # frame most ticks -- the sim trained with update_period=1 (a fresh frame every step). The
        # grab runs in a background thread; camera_node republishes the cached pooled frame at its
        # own rate. PERFORMANCE depth at VGA sustains >=60 Hz comfortably on an Orin.
        init.camera_fps = int(fps)
        init.coordinate_units = sl.UNIT.METER
        try:
            init.depth_mode = getattr(sl.DEPTH_MODE, depth_mode)
        except AttributeError as e:
            raise ValueError(f"unknown ZED depth_mode {depth_mode!r}") from e
        init.depth_minimum_distance = float(min_depth_m)
        init.depth_maximum_distance = float(max_depth_m)
        if flip:
            init.camera_image_flip = sl.FLIP_MODE.ON
        self.serial_number = None if serial_number is None else int(serial_number)
        if self.serial_number is not None:
            init.set_from_serial_number(self.serial_number)

        self._cam = sl.Camera()
        # Retry the open: a ZED Mini often returns CAMERA STREAM FAILED TO START on a
        # cold first open (USB/firmware settling) and succeeds on a second try a couple
        # seconds later. Raising on the first failure would kill camera_node and leave
        # the policy with stale depth, so give it a few attempts before giving up.
        _which = f" (serial {self.serial_number})" if self.serial_number is not None else ""
        status = None
        for attempt in range(1, int(open_max_attempts) + 1):
            status = self._cam.open(init)
            if status == sl.ERROR_CODE.SUCCESS:
                break
            print(
                f"[zed] open attempt {attempt}/{open_max_attempts} failed{_which}: {status}"
                + (f"; retrying in {open_retry_delay_s:.0f}s ..." if attempt < open_max_attempts else ""),
                flush=True,
            )
            if attempt < open_max_attempts:
                time.sleep(float(open_retry_delay_s))
        if status != sl.ERROR_CODE.SUCCESS:
            raise RuntimeError(
                f"Failed to open ZED camera{_which} after {open_max_attempts} attempts "
                f"({status}). Is it plugged in, the SDK installed, and the serial correct? "
                f"Connected: {ZedDepthSource.list_devices()}"
            )

        self._runtime = sl.RuntimeParameters()
        # FILL mode interpolates/extrapolates into no-measure holes -- it invents a
        # phantom near surface in empty/low-texture space, which the low-percentile
        # pool then reports as a ~1 m object. Default OFF: holes stay invalid -> far.
        self._runtime.enable_fill_mode = bool(fill_holes)
        # Outlier rejection BEFORE pooling: discard low-confidence (flying/mixed) and
        # low-texture (blank wall / empty space) pixels so they go invalid and are
        # excluded from the pool instead of dragging a cell near. Lower = stricter
        # (SDK defaults 95 / 100 keep ~everything; 50 culls the uncertain depth).
        self._runtime.confidence_threshold = int(confidence_threshold)
        self._runtime.texture_confidence_threshold = int(texture_confidence_threshold)
        self._mat = sl.Mat()
        self._latest: np.ndarray | None = None  # pooled [H, W] metres
        # Full-res retention (debug --view / the ETAM RGB path; off on the lean hot
        # path): latest raw depth [H0, W0] float32 metres + left RGB as BGR uint8.
        self._keep_full = bool(keep_full)
        self._img_mat = sl.Mat() if self._keep_full else None
        self._latest_full: np.ndarray | None = None
        self._latest_bgr: np.ndarray | None = None
        self.grab_count: int = 0  # successful grabs (for measuring achieved FPS on hardware)
        self._lock = threading.Lock()
        self._stop = threading.Event()
        self._thread = threading.Thread(target=self._loop, name="zed-depth", daemon=True)
        self._thread.start()

        deadline, waited = first_frame_timeout_s, 0.0
        while self._latest is None and waited < deadline:
            time.sleep(0.05)
            waited += 0.05
        if self._latest is None:
            self.close()
            raise RuntimeError(
                f"No ZED depth frame within {first_frame_timeout_s}s of opening the camera."
            )

    def _loop(self) -> None:
        sl = self._sl
        while not self._stop.is_set():
            if self._cam.grab(self._runtime) != sl.ERROR_CODE.SUCCESS:
                continue
            self._cam.retrieve_measure(self._mat, sl.MEASURE.DEPTH)
            depth_np = np.array(self._mat.get_data(), copy=True)  # [H, W] float32 metres
            # Blank the outer ``edge_crop_px`` ring (stereo occlusion border -- the
            # left/top columns have no right-camera correspondence, so the SDK emits
            # confident-but-bogus near depth there) before pooling. Crop a COPY so the
            # --view full-res panel still shows the real (uncropped) raw.
            pool_in = depth_np
            if self._edge_crop:
                n = self._edge_crop
                pool_in = depth_np.copy()
                pool_in[:n, :] = np.nan
                pool_in[-n:, :] = np.nan
                pool_in[:, :n] = np.nan
                pool_in[:, -n:] = np.nan
            small = percentile_pool_depth(
                pool_in, self.height, self.width, self._pool_percentile,
                fill_invalid=self._fill_invalid,
            )
            bgr_np = None
            if self._keep_full:
                self._cam.retrieve_image(self._img_mat, sl.VIEW.LEFT)
                bgr_np = np.ascontiguousarray(self._img_mat.get_data()[:, :, :3])  # BGRA->BGR
            with self._lock:
                self._latest = small
                if self._keep_full:
                    self._latest_full = depth_np
                    self._latest_bgr = bgr_np
                self.grab_count += 1
                if not self.raw_height:
                    self.raw_height, self.raw_width = depth_np.shape

    def latest_frame(self) -> np.ndarray:
        """Most recent pooled depth: ``[height, width]`` float32 (metres). Invalid ->
        ``fill_invalid``. Returns a copy so the caller can mutate freely."""
        with self._lock:
            frame = self._latest
        if frame is None:
            raise RuntimeError("ZED depth source has no frame yet.")
        return frame.copy()

    def latest_full(self):
        """(raw_depth [H0,W0] float32 metres, left BGR [H0,W0,3] uint8) or (None, None).
        Only populated when constructed with ``keep_full=True`` (--view / the ETAM node)."""
        with self._lock:
            d, b = self._latest_full, self._latest_bgr
        if d is None:
            return None, None
        return d.copy(), (b.copy() if b is not None else None)

    def close(self) -> None:
        self._stop.set()
        thread = getattr(self, "_thread", None)
        if thread is not None and thread.is_alive():
            thread.join(timeout=2.0)
        cam = getattr(self, "_cam", None)
        if cam is not None:
            cam.close()

    def __enter__(self) -> "ZedDepthSource":
        return self

    def __exit__(self, *exc) -> None:
        self.close()


def _self_test() -> None:
    """Hardware-free check of the pooling math (ported from src/deploy)."""
    src = np.array(
        [
            [5.0, 5.0, 4.0, 4.0, 3.0, 3.0],
            [5.0, 2.0, 4.0, 4.0, 3.0, 3.0],  # block (0,0) has a near 2.0
            [9.0, 9.0, 8.0, 8.0, 7.0, 7.0],
            [9.0, 9.0, 8.0, 8.0, 7.0, 7.0],
        ],
        dtype=np.float32,
    )
    out = min_pool_depth(src, 2, 3)
    expected = np.array([[2.0, 4.0, 3.0], [9.0, 8.0, 7.0]], dtype=np.float32)
    assert np.array_equal(out, expected), (out, expected)

    src2 = np.array([[np.nan, 1.5, np.inf, 0.0], [-1.0, 1.5, np.nan, 0.0]], dtype=np.float32)
    out2 = min_pool_depth(src2, 1, 2)
    assert np.array_equal(out2, np.array([[1.5, 0.0]], dtype=np.float32)), out2
    out3 = min_pool_depth(src2, 1, 2, fill_invalid=5.0)
    assert np.array_equal(out3, np.array([[1.5, 5.0]], dtype=np.float32)), out3

    src3 = np.full((3, 3), 5.0, dtype=np.float32)
    src3[1, 1] = 1.0
    assert min_pool_depth(src3, 1, 1)[0, 0] == 1.0
    assert percentile_pool_depth(src3, 1, 1, 50.0)[0, 0] == 5.0
    assert percentile_pool_depth(src3, 1, 1, 0.0)[0, 0] == 1.0
    print("zed_depth_source self-test OK")


if __name__ == "__main__":
    _self_test()
