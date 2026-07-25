"""Live ZED Mini depth source for hardware-in-the-loop dodge play.

Opens a ZED Mini, grabs the ``DEPTH`` measure (metres) in a background thread, and
serves the latest frame downsampled to the sim head-camera resolution (default
16x9) so it can be dropped into the depth-single dodge policy in place of the
simulated ``head_camera_single``. The frame is delivered as RAW metres (invalid /
no-hit pixels -> 0.0); the policy's ``DepthImageObs`` term then does its usual
no-hit->far, clamp[near,far], normalize[0,1] and frame-stacking -- identical math
to the simulated sensor, so the policy sees the same representation it trained on.



``pyzed`` is imported lazily inside :class:`ZedDepthSource` so this module (and the
pure ``min_pool_depth`` helper / its self-test) import without the SDK or a camera.
"""

from __future__ import annotations

import threading
import time
import warnings

import numpy as np
import torch


def percentile_pool_depth(
  depth_full: np.ndarray,
  height: int,
  width: int,
  percentile: float = 0.0,
  fill_invalid: float = 0.0,
) -> np.ndarray:
  """Downsample a full-res depth map (metres) to ``height x width`` by a low-percentile
  ("soft-min") pool over each block, ignoring invalid pixels.

  ``percentile`` is the per-block percentile of the VALID depths (0 = strict min, the
  nearest pixel). A *low* percentile preserves a small near object (the ball) -- which
  occupies many pixels of its block -- while rejecting the 1-2 spurious near pixels that
  strict min would let darken a whole cell. It must stay BELOW the ball's pixel fraction
  in a block (~5-18% across the 2-5 m range), so keep it small (~2-5). Average/bilinear
  pooling is wrong here: it blends a small ball into the far background, erasing the
  signal, and invents a mid-distance surface the natively-rendered sim depth never makes
  (sim takes the nearest hit per ray, which a low-percentile pool reproduces).

  Invalid pixels (NaN, +/-Inf, or <= 0 -- ZED's no-measure / too-far / too-near codes)
  are excluded from the percentile. A block with no valid pixels returns ``fill_invalid``;
  pass ``fill_invalid=far`` so empty blocks read as "far" both to the policy
  (``DepthImageObs`` normalizes far->1, identical to its 0->far->1 mapping, so the policy
  result is unchanged) and to the viser display (far->bright). The frame is centre-cropped
  to an integer-divisible size before pooling.
  """
  if depth_full.ndim != 2:
    raise ValueError(f"expected a 2-D depth map, got shape {depth_full.shape}")
  if not 0.0 <= percentile <= 100.0:
    raise ValueError(f"percentile must be in [0, 100], got {percentile}")
  h0, w0 = depth_full.shape
  if h0 < height or w0 < width:
    raise ValueError(f"source {h0}x{w0} smaller than target {height}x{width}")

  # Invalid -> NaN so np.nanpercentile excludes them regardless of how many a block has.
  invalid = ~np.isfinite(depth_full) | (depth_full <= 0.0)
  d = np.where(invalid, np.nan, depth_full).astype(np.float32, copy=False)

  # Centre-crop to a size divisible by the target grid, group each block's pixels on one
  # axis, then take the per-block percentile of the valid depths.
  bh, bw = h0 // height, w0 // width
  ch, cw = bh * height, bw * width
  top, left = (h0 - ch) // 2, (w0 - cw) // 2
  blocks = (
    d[top : top + ch, left : left + cw]
    .reshape(height, bh, width, bw)
    .transpose(0, 2, 1, 3)
    .reshape(height, width, bh * bw)
  )
  with warnings.catch_warnings():
    warnings.simplefilter("ignore", category=RuntimeWarning)  # all-NaN blocks
    pooled = np.nanpercentile(blocks, percentile, axis=2)

  # All-invalid blocks (NaN) -> fill_invalid ("nothing there").
  return np.where(np.isfinite(pooled), pooled, fill_invalid).astype(np.float32)


def min_pool_depth(
  depth_full: np.ndarray, height: int, width: int, fill_invalid: float = 0.0
) -> np.ndarray:
  """Strict-min pool (percentile 0). Thin alias for :func:`percentile_pool_depth`."""
  return percentile_pool_depth(depth_full, height, width, 0.0, fill_invalid)


class ZedDepthSource:
  """Background ZED Mini depth grabber producing sim-shaped depth frames.

  ``latest_frame()`` returns the most recent depth as a ``[height, width]`` float32
  torch tensor in metres (invalid -> 0.0) on ``device``. The grab runs in a daemon
  thread so the sim never blocks on the camera; the sim simply reads the latest
  cached frame each step.
  """

  @staticmethod
  def list_devices() -> list[tuple[int, str]]:
    """Return ``[(serial_number, model), ...]`` for every connected ZED, for mapping a
    multi-camera rig (head vs torso-down) to serials. Returns ``[]`` if pyzed is missing."""
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
    flip: bool = False,
    min_depth_m: float = 0.1,
    max_depth_m: float = 5.0,
    pool_percentile: float = 3.0,
    fill_holes: bool = False,
    confidence_threshold: int = 50,
    texture_confidence_threshold: int = 100,
    edge_crop_px: int = 0,
    obs_mask: str = "none",
    device: str = "cpu",
    first_frame_timeout_s: float = 10.0,
    serial_number: int | None = None,
  ) -> None:
    try:
      import pyzed.sl as sl
    except ImportError as e:  # pragma: no cover - exercised only without the SDK
      raise RuntimeError(
        "pyzed is not installed. Install it into the venv with:\n"
        "  uv run python /usr/local/zed/get_python_api.py   # downloads the cp311 wheel\n"
        "  uv pip install ./pyzed-5.1-cp311-cp311-linux_x86_64.whl"
      ) from e

    self._sl = sl
    self.height = int(height)
    self.width = int(width)
    self._device = device
    self._near = float(min_depth_m)
    self._far = float(max_depth_m)
    self._pool_percentile = float(pool_percentile)
    self._edge_crop = max(0, int(edge_crop_px))
    # Obs-masking mode for the POLICY frame (display panels always show the real scene):
    #   "none" -> the real pooled depth.
    #   "far"  -> all far (an empty image). Diagnostic.
    if obs_mask not in ("none", "far"):
      raise ValueError(f"obs_mask must be 'none' or 'far', got {obs_mask!r}")
    self._obs_mask = obs_mask
    # Full-resolution (pre-pooling) depth, sanitized for display; set on the first frame.
    self.raw_height: int = 0
    self.raw_width: int = 0

    init = sl.InitParameters()
    init.camera_resolution = sl.RESOLUTION.VGA  # WVGA 672x376 (~16:9, matches sim FOV)
    init.coordinate_units = sl.UNIT.METER
    try:
      init.depth_mode = getattr(sl.DEPTH_MODE, depth_mode)
    except AttributeError as e:
      raise ValueError(f"unknown ZED depth_mode {depth_mode!r}") from e
    init.depth_minimum_distance = float(min_depth_m)
    init.depth_maximum_distance = float(max_depth_m)
    if flip:
      init.camera_image_flip = sl.FLIP_MODE.ON
    # Select a SPECIFIC camera by serial (multi-camera rigs: head vs torso-down). Without this the
    # SDK opens the first available device, which is ambiguous when two ZEDs are connected.
    self.serial_number = None if serial_number is None else int(serial_number)
    if self.serial_number is not None:
      init.set_from_serial_number(self.serial_number)

    self._cam = sl.Camera()
    status = self._cam.open(init)
    if status != sl.ERROR_CODE.SUCCESS:
      _which = f" (serial {self.serial_number})" if self.serial_number is not None else ""
      raise RuntimeError(
        f"Failed to open ZED camera{_which} ({status}). Is the ZED plugged in, the SDK "
        f"installed, and the serial correct? Connected: {ZedDepthSource.list_devices()}"
      )

    self._runtime = sl.RuntimeParameters()
    # FILL mode interpolates/extrapolates into no-measure holes -- it invents a phantom near
    # surface in empty/low-texture space, which the low-percentile pool then reports as a ~1 m
    # object. Default OFF: holes stay invalid -> far.
    self._runtime.enable_fill_mode = bool(fill_holes)
    # Outlier rejection BEFORE pooling: discard low-confidence (flying/mixed) and low-texture
    # (blank wall / empty space) pixels so they go invalid and are excluded from the pool instead
    # of dragging a cell near. Lower = stricter (SDK defaults 95 / 100 keep ~everything).
    self._runtime.confidence_threshold = int(confidence_threshold)
    self._runtime.texture_confidence_threshold = int(texture_confidence_threshold)
    self._mat = sl.Mat()  # depth measure
    self._img_mat = sl.Mat()  # left RGB image (display only)
    self._latest: np.ndarray | None = None  # pooled [height, width] metres (policy obs)
    self._latest_raw: np.ndarray | None = None  # full-res [H0, W0] metres (display, pre-pool)
    self._latest_rgb: np.ndarray | None = None  # full-res [H0, W0, 3] uint8 RGB (display)
    self._lock = threading.Lock()
    self._stop = threading.Event()
    self._thread = threading.Thread(target=self._loop, name="zed-depth", daemon=True)
    self._thread.start()

    # Block until the first frame so the caller's first sim step has real data.
    deadline = first_frame_timeout_s
    waited = 0.0
    while self._latest is None and waited < deadline:
      time.sleep(0.05)
      waited += 0.05
    if self._latest is None:
      self.close()
      raise RuntimeError(
        f"No ZED depth frame within {first_frame_timeout_s}s of opening the camera."
      )
    self.raw_height, self.raw_width = self._latest_raw.shape  # type: ignore[union-attr]

  def _loop(self) -> None:
    sl = self._sl
    while not self._stop.is_set():
      if self._cam.grab(self._runtime) != sl.ERROR_CODE.SUCCESS:
        continue
      self._cam.retrieve_measure(self._mat, sl.MEASURE.DEPTH)
      depth_np = np.array(self._mat.get_data(), copy=True)  # [H, W] float32 metres
      # Left RGB image (display only). ZED returns BGRA uint8; drop alpha and BGR->RGB.
      self._cam.retrieve_image(self._img_mat, sl.VIEW.LEFT)
      rgb_np = np.ascontiguousarray(self._img_mat.get_data()[:, :, 2::-1])  # [H, W, 3] uint8
      # Low-percentile ("soft-min") pool: preserves the small near ball while rejecting 1-2
      # spurious near pixels. All-invalid (empty) blocks -> far, so empty space reads as far
      # (bright) in the panel and as far to the policy (identical to a 0.0 fill).
      if self._obs_mask == "far":
        # Force the policy obs to an empty (all-far) image; panels still show the real scene.
        small = np.full((self.height, self.width), self._far, dtype=np.float32)
      else:  # "none": the real pooled depth.
        # Blank the outer edge_crop_px ring (stereo occlusion border emits bogus near
        # depth) before pooling; crop a COPY so the raw display panel stays uncropped.
        pool_in = depth_np
        if self._edge_crop:
          n = self._edge_crop
          pool_in = depth_np.copy()
          pool_in[:n, :] = np.nan
          pool_in[-n:, :] = np.nan
          pool_in[:, :n] = np.nan
          pool_in[:, -n:] = np.nan
        small = percentile_pool_depth(
          pool_in, self.height, self.width, self._pool_percentile, fill_invalid=self._far
        )
      # Full-res frame for the "raw" display panel: invalid (NaN/Inf/<=0) -> far, clamp [near,far].
      finite = np.isfinite(depth_np) & (depth_np > 0.0)
      raw_disp = np.where(finite, depth_np, self._far).astype(np.float32)
      np.clip(raw_disp, self._near, self._far, out=raw_disp)
      with self._lock:
        self._latest = small
        self._latest_raw = raw_disp
        self._latest_rgb = rgb_np

  def latest_frame(self) -> torch.Tensor:
    """Most recent POOLED depth frame: ``[height, width]`` float32 (metres) on ``device``.

    This is the policy obs resolution (16x9). Invalid pixels read 0.0 (DepthImageObs -> far)."""
    with self._lock:
      frame = self._latest
    if frame is None:
      raise RuntimeError("ZED depth source has no frame yet.")
    return torch.from_numpy(frame).to(self._device)

  def latest_raw(self) -> torch.Tensor:
    """Most recent FULL-RES depth frame (pre-pooling): ``[raw_height, raw_width]`` float32
    metres, on CPU (display-only; the viewer copies to CPU anyway). Invalid -> ``far``."""
    with self._lock:
      frame = self._latest_raw
    if frame is None:
      raise RuntimeError("ZED depth source has no frame yet.")
    return torch.from_numpy(frame)

  def latest_rgb(self) -> torch.Tensor:
    """Most recent left RGB image: ``[raw_height, raw_width, 3]`` uint8, on CPU (display-only)."""
    with self._lock:
      frame = self._latest_rgb
    if frame is None:
      raise RuntimeError("ZED depth source has no frame yet.")
    return torch.from_numpy(frame)

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
  """Hardware-free check of the min-pool conversion math."""
  # 4x6 -> 2x3, pooling 2x2 blocks. Distinct values so each block's min is known.
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

  # Invalid handling: NaN/Inf/<=0 must not win the min; an all-invalid block -> 0.0.
  src2 = np.array(
    [
      [np.nan, 1.5, np.inf, 0.0],
      [-1.0, 1.5, np.nan, 0.0],
    ],
    dtype=np.float32,
  )
  out2 = min_pool_depth(src2, 1, 2)
  # block 0 = {nan,1.5,-1,1.5} -> 1.5 ; block 1 = {inf,0,nan,0} all invalid -> 0.0 (default fill)
  assert np.array_equal(out2, np.array([[1.5, 0.0]], dtype=np.float32)), out2

  # fill_invalid=far: the all-invalid block reads far instead of 0.0 (valid block unchanged).
  out3 = min_pool_depth(src2, 1, 2, fill_invalid=5.0)
  assert np.array_equal(out3, np.array([[1.5, 5.0]], dtype=np.float32)), out3

  # Percentile pool: a single spurious near pixel is rejected by a low percentile but kept by min.
  # One block (1x1 target = whole image), 1 near outlier among 9 far pixels.
  src3 = np.full((3, 3), 5.0, dtype=np.float32)
  src3[1, 1] = 1.0  # lone near pixel
  assert min_pool_depth(src3, 1, 1)[0, 0] == 1.0  # strict min keeps the outlier
  # 50th percentile (median) ignores the lone outlier -> 5.0.
  assert percentile_pool_depth(src3, 1, 1, 50.0)[0, 0] == 5.0
  # percentile=0 == strict min.
  assert percentile_pool_depth(src3, 1, 1, 0.0)[0, 0] == 1.0

  print("zed_depth_source self-test OK")


if __name__ == "__main__":
  _self_test()
