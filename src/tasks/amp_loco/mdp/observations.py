from __future__ import annotations

import math
from typing import TYPE_CHECKING

import mujoco
import torch
import torch.nn.functional as F

from mjlab.entity import Entity
from mjlab.managers.manager_base import ManagerTermBase
from mjlab.managers.scene_entity_config import SceneEntityCfg
from mjlab.sensor import ContactSensor

from mjlab.utils.lab_api.math import (
  matrix_from_quat,
  subtract_frame_transforms,
  quat_apply_inverse,
  yaw_quat,
)

if TYPE_CHECKING:
  from mjlab.envs import ManagerBasedRlEnv

_DEFAULT_ASSET_CFG = SceneEntityCfg("robot")

def robot_body_pos_b(
    env: ManagerBasedRlEnv,
    anchor_cfg: SceneEntityCfg = SceneEntityCfg("robot", body_names=()),
    body_cfg: SceneEntityCfg = SceneEntityCfg("robot", body_names=()),
) -> torch.Tensor:
    asset: Entity = env.scene[anchor_cfg.name]
    
    anchor_pos_w = asset.data.body_link_pos_w[:, anchor_cfg.body_ids[0]]   # (num_envs, 3)
    anchor_quat_w = asset.data.body_link_quat_w[:, anchor_cfg.body_ids[0]]  # (num_envs, 4)
    
    body_pos_w = asset.data.body_link_pos_w[:, body_cfg.body_ids]     # (num_envs, num_bodies, 3)
    body_quat_w = asset.data.body_link_quat_w[:, body_cfg.body_ids]   # (num_envs, num_bodies, 4)

    num_bodies = body_pos_w.shape[1]
    pos_b, _ = subtract_frame_transforms(
        anchor_pos_w[:, None, :].expand(-1, num_bodies, -1),
        anchor_quat_w[:, None, :].expand(-1, num_bodies, -1),
        body_pos_w,
        body_quat_w,
    )
    return pos_b.reshape(env.num_envs, -1)

def robot_body_ori_b(
    env: ManagerBasedRlEnv,
    anchor_cfg: SceneEntityCfg = SceneEntityCfg("robot", body_names=()),
    body_cfg: SceneEntityCfg = SceneEntityCfg("robot", body_names=()),
) -> torch.Tensor:
    asset: Entity = env.scene[anchor_cfg.name]
    
    anchor_pos_w = asset.data.body_link_pos_w[:, anchor_cfg.body_ids[0]]   # (num_envs, 3)
    anchor_quat_w = asset.data.body_link_quat_w[:, anchor_cfg.body_ids[0]]  # (num_envs, 4)
    
    body_pos_w = asset.data.body_link_pos_w[:, body_cfg.body_ids]     # (num_envs, num_bodies, 3)
    body_quat_w = asset.data.body_link_quat_w[:, body_cfg.body_ids]   # (num_envs, num_bodies, 4)

    num_bodies = body_pos_w.shape[1]
    _, ori_b = subtract_frame_transforms(
        anchor_pos_w[:, None, :].expand(-1, num_bodies, -1),
        anchor_quat_w[:, None, :].expand(-1, num_bodies, -1),
        body_pos_w,
        body_quat_w,
    )
    mat = matrix_from_quat(ori_b)
    return mat[..., :2].reshape(mat.shape[0], -1)

def robot_body_lin_vel_b(
    env: ManagerBasedRlEnv,
    anchor_cfg: SceneEntityCfg = SceneEntityCfg("robot", body_names=()),
    body_cfg: SceneEntityCfg = SceneEntityCfg("robot", body_names=()),
) -> torch.Tensor:
    asset: Entity = env.scene[anchor_cfg.name]
    
    body_lin_vel_w = asset.data.body_link_lin_vel_w[:, body_cfg.body_ids]   # (num_envs, num_bodies, 3)
    body_quat_w = asset.data.body_link_quat_w[:, body_cfg.body_ids]       # (num_envs, num_bodies, 4)

    num_bodies = body_lin_vel_w.shape[1]

    body_lin_vel_b = quat_apply_inverse(
        body_quat_w.reshape(-1, 4),
        body_lin_vel_w.reshape(-1, 3),
    ).reshape(env.num_envs, num_bodies, 3)

    return body_lin_vel_b.reshape(env.num_envs, -1)

def robot_body_ang_vel_b(
    env: ManagerBasedRlEnv,
    anchor_cfg: SceneEntityCfg = SceneEntityCfg("robot", body_names=()),
    body_cfg: SceneEntityCfg = SceneEntityCfg("robot", body_names=()),
) -> torch.Tensor:
    asset: Entity = env.scene[anchor_cfg.name]
    
    body_ang_vel_w = asset.data.body_link_ang_vel_w[:, body_cfg.body_ids]   # (num_envs, num_bodies, 3)
    body_quat_w = asset.data.body_link_quat_w[:, body_cfg.body_ids]       # (num_envs, num_bodies, 4)

    num_bodies = body_ang_vel_w.shape[1]

    body_ang_vel_b = quat_apply_inverse(
        body_quat_w.reshape(-1, 4),
        body_ang_vel_w.reshape(-1, 3),
    ).reshape(env.num_envs, num_bodies, 3)

    return body_ang_vel_b.reshape(env.num_envs, -1)


class DepthImageObs(ManagerTermBase):
  """Head depth camera -> normalized depth observation.

  Reads the forward ``head_camera`` :class:`CameraSensor` depth, which is a TRUE
  geometric distance in metres (``mujoco_warp`` ignores the model near/far clip),
  and turns it into a unit-range depth observation for the dodge-depth policy
  (``Unitree-G1-AMP-Dodge-Depth-*``). Concretely:

  1. No-hit / sky pixels (``raw < near``, e.g. 0 or the ~1000 m horizon mapped
     below ``near``) are pushed to ``far`` so "nothing there" reads as far, not
     near.
  2. Clamp to ``[near, far]`` (the ball's ~0.1-5 m approach window).
  3. (Training only) D435-style perception noise: depth-dependent Gaussian
     ``sigma = noise_sigma_base + noise_sigma_per_m * d`` plus per-pixel dropout
     at ``dropout_rate`` (dropped pixels read ``far``, simulating depth "holes").
  4. Normalize to ``[0, 1]`` via ``(d - near) / (far - near)`` (near/ball -> 0,
     far/empty -> 1).

  ``flatten`` (default ``False``):
  - ``False`` -> ``[B, 1, H, W]`` image (a 2D obs group for a CNN encoder).
  - ``True``  -> ``[B, H*W]`` flattened vector (a 1D obs group fed straight into
    the policy MLP -- the dodge-depth task uses this: the camera is head-fixed so a
    pixel's location directly encodes the ball's bearing, and a position-sensitive
    fully-connected layer suits that better than a translation-invariant CNN).

  Input: ``env.scene[sensor_name].data.depth`` of shape ``[B, H, W, 1]`` (metres).
  """

  def __init__(self, cfg, env: ManagerBasedRlEnv) -> None:
    super().__init__(env)
    p = cfg.params
    # One sensor (``sensor_name``) or several stacked as channels (``sensor_names``, e.g. the two
    # head cameras merged into a single image group so ONE CNN processes both -- cheaper than a CNN
    # per camera). Output channels = n_sensors * n_frame_offsets.
    self._sensors: list[str] = list(p.get("sensor_names") or [p["sensor_name"]])
    # Multi-sensor merge mode. "vertical": concat the cameras along image HEIGHT into ONE
    # continuous panel. "channel": keep each camera as its own channel (CNN-per-shared-conv path).
    # Default "channel" (back-compat). For the flat MLP the two are permutation-equivalent;
    # "vertical" is the geometrically-correct single image (and the right CNN input).
    self._fuse: str = str(p.get("fuse", "channel"))
    self._near: float = float(p.get("near", 0.1))
    self._far: float = float(p.get("far", 5.0))
    self._flatten: bool = bool(p.get("flatten", False))
    # Perception-noise knobs (default 0 -> clean depth; set in training cfg).
    self._noise_sigma_base: float = float(p.get("noise_sigma_base", 0.0))
    self._noise_sigma_per_m: float = float(p.get("noise_sigma_per_m", 0.0))
    self._dropout_rate: float = float(p.get("dropout_rate", 0.0))
    # ZED-style sim2real depth augmentation (default 0 -> off; play sets 0). The pattern is held for
    # ``aug_update_period`` steps (below) then re-rolled, so across the wider stacked offsets the
    # synthetic noise still varies (temporally incoherent vs the looming ball) while a real
    # ball stays coherent+looming -> the policy is forced onto the temporal/approach-rate cue instead
    # of the empty-arena "near == ball" shortcut. All intrusions are MIN-POOLED (only ever make a
    # pixel NEARER, like a spurious stereo return); holes push to far. Each knob's effective amount is
    # drawn per-image from U[0, max] so the batch spans clean..speckly (we don't know the final camera
    # mount, so randomize over the whole envelope rather than fit one scene).
    #   speckle_rate_max  -- max fraction of pixels turned into near-biased flecks (~ZED stereo speckle)
    #   speckle_edge_bias -- 0..1: concentrate speckle on DEPTH-DISCONTINUITY edges (where stereo fails)
    #   speckle_border_bias -- 0..1: concentrate speckle on the IMAGE border (less stereo overlap)
    #   speckle_far_bias  -- 0..inf: concentrate speckle on FAR/empty (free-space) pixels. A real ZED
    #     speckles most in low-texture open space, NOT on the close ground; this counters the edge bias
    #     (which starves the uniform far field of speckle). Pixels weighted by normalized depth (mean 1).
    #   haze_sigma_max    -- max stdev of far-field per-pixel gaussian haze (scaled by depth)
    #   hole_rate_max     -- max fraction of pixels set to far (ZED unmatched/invalid pixels)
    #   speckle_keep_min  -- if >=0, the spurious depth is a RELATIVE perturbation depth*U(keep_min,1)
    #     (a candidate reads keep_min..100% of the pixel's true depth -- moderate, range-tracking, never
    #     a phantom slammed to `near`). If <0 (default/unset), legacy ABSOLUTE U(near,far) is used.
    # BACKGROUND FILL (the room sim2real fix): with prob ``bg_fill_prob`` an env gets a
    # synthetic "room shell" for the episode -- every far/no-hit pixel reads a per-env
    # background depth instead of far. The background is a random vertical gradient:
    # b_top, b_bottom ~ U(bg_depth_range) sampled per env per RESET and lerped across
    # image rows (top rows nearer half the time = a ceiling; farther = open hall).
    # Held static all episode -> temporally coherent and NON-looming, so the policy
    # must learn "persistent surround at 2-5 m = ignore; looming = dodge". Hardware
    # forensics (2026-06-09): the empty-arena-trained policy read a real ceiling
    # (upper rows at 1.8-5 m) as a wall-sized incoming ball and blew up on the spot.
    # Noise/speckle/holes apply ON TOP of the fill (holes punch back to far, exactly
    # like a real ZED no-return against a wall). 1 - bg_fill_prob of envs keep the
    # empty-arena background as an anchor.
    self._bg_fill_prob: float = float(p.get("bg_fill_prob", 0.0))
    self._bg_depth_range: tuple = tuple(p.get("bg_depth_range", (2.0, 5.0)))
    self._bg_state: dict = {}  # per-sensor: b[N,H] row-interpolated background (metres)
    self._speckle_rate_max: float = float(p.get("speckle_rate_max", 0.0))
    self._speckle_edge_bias: float = float(p.get("speckle_edge_bias", 0.0))
    self._speckle_border_bias: float = float(p.get("speckle_border_bias", 0.0))
    self._speckle_far_bias: float = float(p.get("speckle_far_bias", 0.0))
    self._speckle_keep_min: float = float(p.get("speckle_keep_min", -1.0))  # <0 -> legacy absolute
    self._haze_sigma_max: float = float(p.get("haze_sigma_max", 0.0))
    self._hole_rate_max: float = float(p.get("hole_rate_max", 0.0))
    self._border_w: torch.Tensor | None = None  # cached [H,W] border-distance weight (mean 1)
    # Coherent CLUTTER blobs: a few large rectangular near-surfaces (walls/furniture) that PERSIST
    # across the frame stack and DRIFT slowly -- unlike the per-frame speckle, they are temporally
    # coherent, so appearance can't tell them from a static-looking ball; only the ball's fast
    # looming (rapid depth collapse) separates it. This is the cluttered-room counterpart to speckle.
    # State (normalized coords [N, K]) is advanced once per control step in __call__ and rendered
    # (min-pooled, metric) in _augment; re-randomized per env on episode reset. Biased toward image
    # EDGES by default (clutter usually frames the periphery; the ball comes through the center).
    #   clutter_blobs       -- K blobs per env (0 -> off)
    #   clutter_prob        -- fraction of envs that have ANY clutter (rest are clean rooms)
    #   clutter_edge_bias   -- 0..inf: push blob centers toward the frame edge (0 = uniform)
    #   clutter_size_min/max-- blob half-size as a fraction of H,W
    #   clutter_depth_min/max - blob depth in NORMALIZED [0,1] (0=near, 1=far)
    #   clutter_drift       -- max per-step center velocity (normalized) -> slow coherent drift
    #   clutter_jitter      -- per-step RANDOM-WALK std in WORLD METRES of lateral (yz-plane) motion
    #                          of each blob: models ego-motion wobble of a STATIONARY object (robot
    #                          jerks -> a world-static ball slides up/down/left/right). Converted to an
    #                          image offset at render using the blob's depth + camera FOV, so a NEAR
    #                          blob wobbles more in the image than a far one (physically correct).
    #                          Teaches the policy that lateral + small range wobble is NOT a threat
    #                          (only a fast depth COLLAPSE / looming is).
    #   clutter_jitter_max  -- max +/- excursion (METRES) of that lateral random walk from the base.
    #   clutter_cam_vfov_deg-- camera vertical FOV (deg) for the metres<->image conversion (hfov is
    #                          derived from the H:W aspect). Default 54 (the head depth cam / ZED mount).
    #   clutter_depth_jitter     -- per-step RANDOM-WALK std (METRES) on each blob's depth (ego-motion
    #                          also nudges range a little + the depth estimate is noisy). Stays small/
    #                          bounded so it is NOT a looming cue.
    #   clutter_depth_jitter_max -- max +/- excursion (METRES) of that depth walk from the base depth.
    self._clutter_n: int = int(p.get("clutter_blobs", 0))
    self._clutter_prob: float = float(p.get("clutter_prob", 0.5))
    self._clutter_edge_bias: float = float(p.get("clutter_edge_bias", 1.5))
    self._clutter_size_min: float = float(p.get("clutter_size_min", 0.04))
    self._clutter_size_max: float = float(p.get("clutter_size_max", 0.14))
    self._clutter_depth_min: float = float(p.get("clutter_depth_min", 0.1))
    self._clutter_depth_max: float = float(p.get("clutter_depth_max", 0.95))
    self._clutter_drift: float = float(p.get("clutter_drift", 0.02))
    self._clutter_jitter: float = float(p.get("clutter_jitter", 0.0))          # metres / step
    self._clutter_jitter_max: float = float(p.get("clutter_jitter_max", 1.0))  # metres
    self._clutter_cam_vfov_deg: float = float(p.get("clutter_cam_vfov_deg", 54.0))
    self._clutter_depth_jitter: float = float(p.get("clutter_depth_jitter", 0.0))
    self._clutter_depth_jitter_max: float = float(p.get("clutter_depth_jitter_max", 0.2))
    # Per-blob presence prob (within a clutter env): the realized blob COUNT is Binomial(K, this),
    # so a single env shows anywhere from 0..K static blobs. Lower -> sparser/more-variable count.
    self._clutter_blob_prob: float = float(p.get("clutter_blob_prob", 0.8))
    # Per-env blob state [N, K]; lazily allocated in _advance_clutter (None until first step).
    self._cl_cy = self._cl_cx = self._cl_hy = self._cl_hx = None
    self._cl_d = self._cl_vy = self._cl_vx = self._cl_on = None
    self._cl_oy = self._cl_ox = None  # per-step image-plane jitter OFFSET from the base center
    self._cl_od = None                # per-step depth jitter OFFSET (metres) from the base depth
    # GROUND blindness: the sim depth camera sees the floor (finite slant depth in the bottom rows),
    # but a real ZED at a grazing angle gets no stereo match on a textureless floor -> invalid -> far.
    # With prob ``ground_far_prob``, push floor pixels to far in training so the policy never relies
    # on a ground cue the hardware can't deliver. Floor pixels are read straight from the sensor's
    # SEGMENTATION map (exact, training-only sim signal -- the deploy ZED needs no segmentation): a
    # pixel is floor iff its segmented object is a PLANE-type geom. Needs the sensor to render
    # segmentation (data_types includes "segmentation"; wired in the training cfg, not play).
    self._ground_far_prob: float = float(p.get("ground_far_prob", 0.0))
    self._plane_ids: torch.Tensor | None = None  # cached plane-type geom ids (the floor)
    # Temporal sampling: keep the depth frames at the given step offsets (0 = current, k = k steps
    # ago) and concatenate them. The offsets come from the env cfg's ``depth_frame_offsets`` (read
    # here at env instantiation, so ``--env.depth_frame_offsets`` CLI overrides take effect),
    # falling back to the term ``frame_offsets`` param, then to dense 2-frame ``(0, 1)`` (the
    # default: current + previous). A sparse set e.g. (0, 5, 10, 20, 40, 80) gives a long (1.6 s
    # @ 50 Hz) receptive field with few frames -- a cheap, dilated alternative to a long dense
    # stack or an LSTM for carrying the ball across FOV exit. Maintained per-term via a GPU ring
    # buffer (no per-step roll copy); reset reinitializes an env's history to its current frame so
    # belief never bleeds across episodes. Only the flattened path stacks (the CNN path returns a
    # single image).
    fo = getattr(getattr(env, "cfg", None), "depth_frame_offsets", None)
    if fo is None:
      fo = p.get("frame_offsets", None)
    if fo is None:
      fo = (0, 1)  # dense default: current + previous frame
    self._frame_offsets: tuple[int, ...] = tuple(sorted(int(o) for o in fo))
    self._L: int = max(self._frame_offsets) + 1
    self._buf: torch.Tensor | None = None  # [N, L, *frame_shape] ring buffer
    self._head: int = 0
    self._pending_reset: torch.Tensor | None = None  # [N] bool: reinit history to current frame
    # Camera update period in CONTROL steps: a new depth frame is sampled every ``update_period``
    # steps and HELD in between (proprioception/control still run every step). 1 = every step (=
    # control rate). >1 models a camera/tracking slower than control, e.g. 5 = a 10 Hz camera under
    # 50 Hz control (the Jetson-Orin ball tracker). The held frame is what enters the ring buffer,
    # so the policy trains on the same stale-between-updates depth it gets on hardware.
    self._update_period: int = max(1, int(p.get("update_period", 1)))
    self._held: torch.Tensor | None = None  # [N, *frame_shape] last sampled camera frame
    self._step: int = 0
    # Speckle/hole noise = FIXED candidate pixel LOCATIONS (sampled once per reset, like a real
    # camera's stereo-fail spots) that BLINK on/off over time -- NOT fresh random locations each
    # frame. ``flicker_keep`` of the fixed candidates are ON in any blink (0.5 -> ~half visible at a
    # time = "twice as fewer" flickers than showing them all); the ON subset is re-rolled every
    # ``aug_update_period`` control steps and held in between (so the blink isn't every-frame busy).
    # The DEPTH still refreshes every step; only which fixed candidates are visible blinks.
    self._aug_update_period: int = max(1, int(p.get("aug_update_period", 2)))
    self._flicker_keep: float = float(p.get("flicker_keep", 0.5))
    self._aug_state: dict[str, dict] = {}  # per-sensor: fixed cand/d_spk/hole_cand/haze + blink masks
    self._aug_step: int = 0
    self._aug_do_refresh: bool = True

  def _one(self, raw: torch.Tensor, env=None, sensor_name: str | None = None) -> torch.Tensor:
    far, near = self._far, self._near
    # Floor far-out (training): done BEFORE the no-hit clamp so it works on the true slant depth.
    raw = self._ground_far_out(raw, env, sensor_name)
    # No-hit / sky pixels (~0 or far horizon mapped below `near`) -> far.
    x = torch.where(raw < near, torch.full_like(raw, far), raw)
    x = x.clamp(min=near, max=far)
    x = self._bg_fill(x, sensor_name)  # far pixels -> per-env room shell (training only)
    if self._noise_sigma_base > 0.0 or self._noise_sigma_per_m > 0.0:
      sigma = self._noise_sigma_base + self._noise_sigma_per_m * x
      x = (x + torch.randn_like(x) * sigma).clamp(min=near, max=far)
    if self._dropout_rate > 0.0:
      hole = torch.rand_like(x) < self._dropout_rate
      x = torch.where(hole, torch.full_like(x, far), x)
    x = self._augment(x, sensor_name)
    # Play preview: stash the augmented metric frame so a display-only sensor can show what the
    # policy sees (set by play.py --depth-aug-preview). No-op in training (attr absent).
    if env is not None and sensor_name is not None and getattr(env, "_depth_aug_display_enabled", False):
      store = getattr(env, "_depth_aug_display", None)
      if store is None:
        store = {}
        env._depth_aug_display = store
      store[sensor_name] = x.detach()
    return (x - near) / (far - near)  # [B, H, W, 1] in [0, 1]

  def _bg_fill(self, x: torch.Tensor, sensor_name: str | None) -> torch.Tensor:
    """Replace far pixels with the per-env background gradient (see __init__ docs).

    ``x``: clamped metric depth [B, H, W, 1]. State ``b`` [N, H] (a per-row background
    depth per env) is sampled on first use and re-sampled for just-reset envs; envs
    without a background this episode (prob 1 - bg_fill_prob) get b = far (no-op).
    Real geometry (the ball) is untouched: only pixels AT far are filled.
    """
    if self._bg_fill_prob <= 0.0:
      return x
    n, h = x.shape[0], x.shape[1]
    key = sensor_name or "_"
    st = self._bg_state.get(key)
    if st is None or st["b"].shape != (n, h):
      st = {"b": x.new_full((n, h), self._far)}
      self._bg_state[key] = st
      self._sample_bg(st, x, torch.ones(n, dtype=torch.bool, device=x.device))
    elif self._pending_reset is not None and bool(self._pending_reset.any()):
      self._sample_bg(st, x, self._pending_reset)
    bg = st["b"][:, :, None, None].expand_as(x)
    # OCCLUDING composite: the background is a surface, so anything rendered BEHIND
    # it is hidden -- min(b, x), not a far-pixels-only replacement. The ball becomes
    # visible exactly when it is nearer than its background along the ray, which is
    # precisely deployment optics (a real ball behind the wall line can't be seen).
    # The first (2,5)@0.8 attempt used far-only replacement and balls could render
    # "behind" the background -- an impossible pattern; min() removes it and trains
    # the policy under the true visibility constraint. Off envs have b=far -> no-op.
    return torch.minimum(x, bg)

  def _sample_bg(self, st: dict, x: torch.Tensor, mask: torch.Tensor) -> None:
    """(Re)sample the background gradient for envs in ``mask``: with prob bg_fill_prob,
    b_top, b_bottom ~ U(bg_depth_range) lerped over image rows; else far (empty arena)."""
    n, h = st["b"].shape
    lo, hi = self._bg_depth_range
    m = int(mask.sum())
    if m == 0:
      return
    ends = lo + (hi - lo) * torch.rand(m, 2, device=x.device, dtype=x.dtype)  # [m, (top,bot)]
    rows = torch.linspace(0.0, 1.0, h, device=x.device, dtype=x.dtype)  # 0=top .. 1=bottom
    b = ends[:, 0:1] * (1.0 - rows) + ends[:, 1:2] * rows  # [m, H]
    off = torch.rand(m, 1, device=x.device, dtype=x.dtype) >= self._bg_fill_prob
    st["b"][mask] = torch.where(off, x.new_full((m, h), self._far), b)

  def _ground_far_out(self, raw: torch.Tensor, env, sensor_name: str | None) -> torch.Tensor:
    """Push floor pixels to ``far`` with prob ``ground_far_prob`` (training only). Floor pixels are
    read from the sensor's segmentation map: a pixel is floor iff its object is a PLANE-type geom.
    Returns ``raw`` unchanged when disabled or when segmentation isn't rendered. ``raw`` is [B,H,W,1]."""
    if self._ground_far_prob <= 0.0 or env is None or sensor_name is None:
      return raw
    seg = getattr(env.scene[sensor_name].data, "segmentation", None)
    if seg is None:
      return raw  # segmentation not enabled on this sensor (e.g. play / ZED path)
    if self._plane_ids is None:
      gtype = env.sim.mj_model.geom_type  # host MjModel: numpy [ngeom]; mjGEOM_PLANE == 0
      plane = int(mujoco.mjtGeom.mjGEOM_PLANE)
      ids = [i for i in range(len(gtype)) if int(gtype[i]) == plane]
      self._plane_ids = torch.tensor(ids, device=seg.device, dtype=seg.dtype)
    geom_obj = seg[..., 1] == int(mujoco.mjtObj.mjOBJ_GEOM)  # [B,H,W]
    is_floor = geom_obj & torch.isin(seg[..., 0], self._plane_ids)
    blind = is_floor & (torch.rand_like(raw[..., 0]) < self._ground_far_prob)
    return torch.where(blind.unsqueeze(-1), torch.full_like(raw, self._far), raw)

  def _border_weight(self, h: int, w: int, device, dtype) -> torch.Tensor:
    """[H,W] mean-1 weight that grows toward the image border (1 - normalized distance to the
    nearest edge), cached. Used to bias speckle toward the frame edges (less stereo overlap)."""
    if self._border_w is not None and self._border_w.shape == (h, w):
      return self._border_w
    ii = torch.arange(h, device=device, dtype=dtype).view(h, 1).expand(h, w)
    jj = torch.arange(w, device=device, dtype=dtype).view(1, w).expand(h, w)
    di = torch.minimum(ii, (h - 1) - ii)
    dj = torch.minimum(jj, (w - 1) - jj)
    edge_dist = torch.minimum(di / max(h - 1, 1), dj / max(w - 1, 1))  # 0 at border, ~0.5 center
    bw = 1.0 - edge_dist  # high on border, low in center
    bw = bw / (bw.mean() + 1e-6)  # mean 1
    self._border_w = bw
    return bw

  def _spawn_clutter(self, mask: torch.Tensor) -> None:
    """(Re)randomize ALL blobs of the envs selected by ``mask`` [N] bool, in place."""
    idx = mask.nonzero(as_tuple=True)[0]
    m = int(idx.numel())
    if m == 0:
      return
    k, dev = self._clutter_n, self._cl_cy.device

    def U(a: float, b: float) -> torch.Tensor:
      return a + (b - a) * torch.rand(m, k, device=dev)

    def edge_coord() -> torch.Tensor:
      # Distance-from-edge skewed small when edge_bias>0 (-> centers hug the frame border).
      d = (torch.rand(m, k, device=dev) ** (1.0 + self._clutter_edge_bias)) * 0.5
      side = torch.rand(m, k, device=dev) < 0.5
      return torch.where(side, d, 1.0 - d)

    self._cl_cy[idx] = edge_coord()
    self._cl_cx[idx] = edge_coord()
    self._cl_oy[idx] = 0.0  # fresh episode -> blob starts at its base center/depth (walks from 0)
    self._cl_ox[idx] = 0.0
    self._cl_od[idx] = 0.0
    self._cl_hy[idx] = U(self._clutter_size_min, self._clutter_size_max)
    self._cl_hx[idx] = U(self._clutter_size_min, self._clutter_size_max)
    self._cl_d[idx] = U(self._clutter_depth_min, self._clutter_depth_max)
    self._cl_vy[idx] = U(-self._clutter_drift, self._clutter_drift)
    self._cl_vx[idx] = U(-self._clutter_drift, self._clutter_drift)
    has = (torch.rand(m, 1, device=dev) < self._clutter_prob).float()  # whole-env clutter gate
    # Per-blob presence -> realized count ~ Binomial(k, clutter_blob_prob); randomizes how many
    # static blobs each env shows (0..k), not a fixed number.
    self._cl_on[idx] = has * (torch.rand(m, k, device=dev) < self._clutter_blob_prob).float()

  def _advance_clutter(self) -> None:
    """Init/reset/drift the coherent clutter state once per control step (normalized coords, no
    H,W needed). Called at the top of __call__ so the rendered clutter is consistent across sensors
    and the ring buffer captures its slow drift across the stacked offsets."""
    k = self._clutter_n
    if k <= 0:
      return
    n, dev = self.num_envs, self.device
    if self._cl_cy is None:  # lazy alloc + randomize all envs
      z = torch.zeros(n, k, device=dev)
      self._cl_cy, self._cl_cx = z.clone(), z.clone()
      self._cl_hy, self._cl_hx = z.clone(), z.clone()
      self._cl_d, self._cl_vy, self._cl_vx, self._cl_on = z.clone(), z.clone(), z.clone(), z.clone()
      self._cl_oy, self._cl_ox, self._cl_od = z.clone(), z.clone(), z.clone()
      self._spawn_clutter(torch.ones(n, dtype=torch.bool, device=dev))
      return
    # Fresh clutter for just-reset envs (pending_reset is set in reset(), cleared later in __call__).
    # Blob base center/size/depth are sampled ONCE per reset and held for the episode; the per-blob
    # presence is fixed too. (cl_vy/cl_vx -- the old coherent-drift velocities -- are intentionally
    # unused.) The ONLY per-step motion is the image-plane JITTER below.
    if self._pending_reset is not None and bool(self._pending_reset.any()):
      self._spawn_clutter(self._pending_reset)
    # Per-step image-plane random walk on the blob center (depth untouched -> constant range). Models
    # the ego-motion wobble of a WORLD-STATIONARY object: each control step the center drifts by
    # N(0, jitter), clamped to +/- jitter_max from the base, so across the frame stack the blob slides
    # up/down/left/right at fixed depth. A frozen (zero-motion) blob taught the policy nothing about
    # this; real robot jerks make a static ball do exactly this.
    if self._clutter_jitter > 0.0:
      mx = self._clutter_jitter_max
      self._cl_oy = (self._cl_oy + torch.randn_like(self._cl_oy) * self._clutter_jitter).clamp(-mx, mx)
      self._cl_ox = (self._cl_ox + torch.randn_like(self._cl_ox) * self._clutter_jitter).clamp(-mx, mx)
    # Per-step depth random walk (metres), bounded -> small range wobble, NOT a looming collapse.
    if self._clutter_depth_jitter > 0.0:
      dmx = self._clutter_depth_jitter_max
      self._cl_od = (self._cl_od + torch.randn_like(self._cl_od) * self._clutter_depth_jitter).clamp(-dmx, dmx)

  def _augment(self, x: torch.Tensor, sensor_name: str | None = None) -> torch.Tensor:
    """Training-only ZED-style depth augmentation on clamped metric depth ``x`` [B,H,W,1] in
    [near,far], before normalization. See the knob docs in ``__init__``. No-op when everything is 0
    (play). Speckle/holes are FIXED candidate pixel locations (sampled per reset, per sensor) of
    which ``flicker_keep`` BLINK on at a time (re-rolled every ``aug_update_period`` steps) -- the
    locations don't move, they just flicker on/off; clutter blobs use their own static per-reset
    state; intrusions are min-pooled (only make a pixel nearer); holes push to far."""
    if not (
      self._speckle_rate_max > 0.0
      or self._haze_sigma_max > 0.0
      or self._hole_rate_max > 0.0
      or self._clutter_n > 0
    ):
      return x
    near, far = self._near, self._far
    need = self._speckle_rate_max > 0.0 or self._haze_sigma_max > 0.0 or self._hole_rate_max > 0.0
    st = None
    if need:
      key = sensor_name or "_"
      st = self._aug_state.get(key)
      if st is None or st.get("shape") != tuple(x.shape):
        st = {"shape": tuple(x.shape)}
        self._aug_state[key] = st
        self._sample_aug_candidates(  # fixed locations for all envs (first use / shape change)
          st, x, torch.ones(x.shape[0], dtype=torch.bool, device=x.device)
        )
        self._blink_aug(st)
      else:
        if self._pending_reset is not None and bool(self._pending_reset.any()):
          self._sample_aug_candidates(st, x, self._pending_reset)  # fresh locations for reset envs
        if self._aug_do_refresh:
          self._blink_aug(st)  # re-roll which fixed candidates are visible this blink
      # Speckle: the ON subset of the FIXED candidates, near-biased, min-pooled into current depth.
      if "spk_on" in st:
        if "f_spk" in st:  # relative: a fraction (<=1) of the CURRENT depth -> always nearer
          x = torch.where(st["spk_on"], x * st["f_spk"], x)
        else:  # legacy: absolute intruder depth, kept only if nearer
          x = torch.where(st["spk_on"], torch.minimum(x, st["d_spk"]), x)
    if self._clutter_n > 0 and self._cl_cy is not None:
      # Render the persistent blobs as axis-aligned rectangles, min-pooled into the metric depth.
      h, w = x.shape[1], x.shape[2]
      yg = ((torch.arange(h, device=x.device, dtype=x.dtype) + 0.5) / h).view(1, 1, h, 1)
      xg = ((torch.arange(w, device=x.device, dtype=x.dtype) + 0.5) / w).view(1, 1, 1, w)
      # Per-blob depth (metres) = base + depth jitter, clamped to the valid range. [N, K]
      depth_m = (near + (far - near) * self._cl_d + self._cl_od).clamp(near, far)
      # Convert the WORLD-METRE lateral jitter (_cl_oy/_cl_ox) to a normalized image offset using
      # this depth + the camera FOV: full visible extent at depth d is 2*d*tan(fov/2), so a metre
      # offset maps to metre/(2*d*tan). Near blob -> larger image swing (physically correct). hfov
      # is derived from the H:W aspect (square pixels).
      tan_v = math.tan(math.radians(self._clutter_cam_vfov_deg) * 0.5)
      tan_h = tan_v * (w / h)
      ny = self._cl_oy / (2.0 * depth_m * tan_v)
      nx = self._cl_ox / (2.0 * depth_m * tan_h)
      cy = (self._cl_cy + ny).clamp(0.0, 1.0)[..., None, None]
      cx = (self._cl_cx + nx).clamp(0.0, 1.0)[..., None, None]
      hy, hx = self._cl_hy[..., None, None], self._cl_hx[..., None, None]
      inside = (
        ((yg - cy).abs() <= hy) & ((xg - cx).abs() <= hx) & (self._cl_on[..., None, None] > 0.5)
      )  # [N, K, H, W]
      d_m = depth_m[..., None, None]  # [N, K, 1, 1] metres
      blob = torch.where(inside, d_m.expand_as(inside.float()), x.new_full((), far)).amin(dim=1)
      x = torch.minimum(x, blob.unsqueeze(-1))
    if st is not None:
      # Haze (fixed field per reset): far-field gaussian, scaled by CURRENT depth so it tracks looming.
      if "haze" in st:
        x = (x + st["haze"] * (x / far)).clamp(min=near, max=far)
      # Holes: the ON subset of the fixed hole candidates -> far.
      if "hole_on" in st:
        x = torch.where(st["hole_on"], torch.full_like(x, far), x)
    return x

  def _sample_aug_candidates(self, st: dict, x: torch.Tensor, mask: torch.Tensor) -> None:
    """(Re)sample the FIXED speckle/hole candidate locations + intruder depths + haze field for the
    env rows in ``mask`` [N] bool -- all envs on first use, just-reset envs after. These stay put for
    the episode; only the per-blink ON subset (``_blink_aug``) changes, so the noise flickers in place
    rather than jumping to new pixels each frame."""
    near, far = self._near, self._far
    b, h, w = x.shape[0], x.shape[1], x.shape[2]
    dev, dt = x.device, x.dtype
    if "cand" not in st:  # lazy-alloc full-batch state
      st["cand"] = torch.zeros(b, h, w, 1, dtype=torch.bool, device=dev)
      # Relative mode stores a per-candidate depth FACTOR (f_spk); legacy stores an absolute depth.
      if self._speckle_keep_min >= 0.0:
        st["f_spk"] = torch.zeros(b, h, w, 1, device=dev, dtype=dt)
      else:
        st["d_spk"] = torch.zeros(b, h, w, 1, device=dev, dtype=dt)
      st["hole_cand"] = torch.zeros(b, h, w, 1, dtype=torch.bool, device=dev)
      st["haze"] = torch.zeros(b, h, w, 1, device=dev, dtype=dt)
    idx = mask.nonzero(as_tuple=True)[0]
    m = int(idx.numel())
    if m == 0:
      return
    xs = x[idx]  # [m, H, W, 1]
    if self._speckle_rate_max > 0.0:
      rate = torch.rand(m, 1, 1, 1, device=dev, dtype=dt) * self._speckle_rate_max
      # Per-pixel weight (mean ~1), optionally biased toward depth-edges and/or the image border.
      xm = xs[..., 0]
      wgt = torch.ones_like(xm)
      if self._speckle_edge_bias > 0.0:
        gx = torch.zeros_like(xm)
        gx[:, :, 1:] = (xm[:, :, 1:] - xm[:, :, :-1]).abs()
        gy = torch.zeros_like(xm)
        gy[:, 1:, :] = (xm[:, 1:, :] - xm[:, :-1, :]).abs()
        edge = gx + gy
        edge = edge / (edge.mean(dim=(1, 2), keepdim=True) + 1e-6)
        wgt = wgt + self._speckle_edge_bias * (edge - 1.0)
      if self._speckle_border_bias > 0.0:
        bw = self._border_weight(h, w, dev, dt)
        wgt = wgt + self._speckle_border_bias * (bw.unsqueeze(0) - 1.0)
      if self._speckle_far_bias > 0.0:
        # Weight FAR/empty pixels up (free-space speckle): normalized depth in [0,1], mean-1.
        fw = ((xm - near) / (far - near)).clamp(0.0, 1.0)
        fw = fw / (fw.mean(dim=(1, 2), keepdim=True) + 1e-6)
        wgt = wgt + self._speckle_far_bias * (fw - 1.0)
      wgt = wgt.clamp_min(0.0)
      wgt = wgt / (wgt.mean(dim=(1, 2), keepdim=True) + 1e-6)
      prob = (rate * wgt.unsqueeze(-1)).clamp(0.0, 1.0)
      st["cand"][idx] = torch.rand_like(xs) < prob
      if self._speckle_keep_min >= 0.0:
        # Relative perturbation: store a per-candidate FACTOR in [keep_min, 1]; rendered as
        # depth*factor against the CURRENT depth (range-tracking, never slammed to `near`).
        km = self._speckle_keep_min
        st["f_spk"][idx] = km + (1.0 - km) * torch.rand_like(xs)
      else:
        # Legacy: absolute intruder depth U(near, far), kept if nearer (min-pooled).
        st["d_spk"][idx] = near + (far - near) * torch.rand_like(xs)
    if self._hole_rate_max > 0.0:
      hr = torch.rand(m, 1, 1, 1, device=dev, dtype=dt) * self._hole_rate_max
      st["hole_cand"][idx] = torch.rand_like(xs) < hr
    if self._haze_sigma_max > 0.0:
      s = torch.rand(m, 1, 1, 1, device=dev, dtype=dt) * self._haze_sigma_max
      st["haze"][idx] = torch.randn_like(xs) * s

  def _blink_aug(self, st: dict) -> None:
    """Re-roll which FIXED candidates are visible this blink: keep ``flicker_keep`` of them ON
    (the locations don't change -- they flicker on/off)."""
    keep = self._flicker_keep
    if "cand" in st:
      ref = st["f_spk"] if "f_spk" in st else st["d_spk"]  # any float tensor of candidate shape
      st["spk_on"] = st["cand"] & (torch.rand_like(ref) < keep)
    if "hole_cand" in st:
      st["hole_on"] = st["hole_cand"] & (torch.rand_like(st["haze"]) < keep)

  def _raw_depth(self, env: ManagerBasedRlEnv, sensor_name: str) -> torch.Tensor:
    """Per-sensor raw depth (metres, [B, H, W, 1]) fed to ``_one``. Override to transform the
    depth before clamp/normalize (e.g. ball-only masking); base returns the sensor depth as-is."""
    return env.scene[sensor_name].data.depth

  def _frame(self, env: ManagerBasedRlEnv) -> torch.Tensor:
    frames = [self._one(self._raw_depth(env, s), env, s) for s in self._sensors]  # each [B, H, W, 1]
    if self._fuse == "vertical" and len(frames) > 1:
      # Stack the cameras along image HEIGHT (elevation) into ONE continuous panel, in self._sensors
      # order (top-to-bottom). Generic N-camera capability; no current task uses it (single tasks pass
      # one sensor_name). Flat: flatten the whole panel; image: 1 channel.
      img = torch.cat([f[..., 0] for f in frames], dim=1)  # [B, sum_H, W]
      if self._flatten:
        return img.reshape(img.shape[0], -1).contiguous()  # [B, sum_H * W]
      return img.unsqueeze(1).contiguous()  # [B, 1, sum_H, W] (single channel)
    if self._flatten:
      # [B, n_sensors * H*W] (one timeframe)
      return torch.cat([f.reshape(f.shape[0], -1) for f in frames], dim=-1).contiguous()
    # [B, n_sensors, H, W] (one timeframe; sensors as channels, offsets add more channels)
    return torch.stack([f[..., 0] for f in frames], dim=1).contiguous()

  def reset(self, env_ids=None):
    # Mark envs whose episode just reset so their depth history is reinitialized to the next
    # observed frame (the buffer is filled lazily in __call__, where the frame is available).
    if self._buf is None:
      return {}
    if self._pending_reset is None:
      self._pending_reset = torch.zeros(
        self._buf.shape[0], dtype=torch.bool, device=self._buf.device
      )
    if env_ids is None:
      self._pending_reset[:] = True
    else:
      self._pending_reset[env_ids] = True
    return {}

  def __call__(self, env: ManagerBasedRlEnv, **_kwargs) -> torch.Tensor:
    # Decide ONCE per control step whether the held aug pattern refreshes this step (all sensors in
    # this step share the decision so their patterns refresh in lockstep).
    self._aug_do_refresh = (self._aug_step % self._aug_update_period) == 0
    self._aug_step += 1
    self._advance_clutter()  # reset coherent clutter state before _frame renders it
    frame = self._frame(env)  # fresh sensor frame this control step. flat: [N, F]; image: [N, H, W]
    n = frame.shape[0]
    if self._update_period > 1:
      # Sample a new camera frame only every ``update_period`` control steps; hold it otherwise.
      if self._held is None:
        self._held = frame.clone()
      if self._step % self._update_period == 0:
        self._held.copy_(frame)
      # Just-reset envs always get a fresh frame (their new episode's scene), regardless of phase.
      if self._pending_reset is not None and bool(self._pending_reset.any()):
        rm = self._pending_reset
        self._held[rm] = frame[rm]
      self._step += 1
      cur = self._held
    else:
      cur = frame
    if self._buf is None:  # lazy alloc: fill all slots with the current frame
      self._buf = cur.new_zeros(n, self._L, *cur.shape[1:])
      self._buf[:] = cur.unsqueeze(1)
      self._head = 0
    else:
      if self._pending_reset is not None and bool(self._pending_reset.any()):
        m = self._pending_reset
        self._buf[m] = cur[m].unsqueeze(1)  # fresh episode -> all offsets = current frame
        self._pending_reset[:] = False
      self._head = (self._head + 1) % self._L
      self._buf[:, self._head] = cur
    idx = [(self._head - k) % self._L for k in self._frame_offsets]
    sel = self._buf[:, idx]  # [N, n_offsets, *frame_shape]
    if self._flatten:
      return sel.reshape(n, -1).contiguous()  # [N, n_offsets * n_sensors * H*W]
    # image: frame_shape = (n_sensors, H, W) -> fold offsets+sensors into channels
    return sel.reshape(n, -1, sel.shape[-2], sel.shape[-1]).contiguous()  # [N, n_off*n_sensors, H, W]


class BallOnlyDepthObs(DepthImageObs):
  """Depth obs that keeps ONLY the ball, masking everything else to ``far``.

  Sim2real bridge: instead of the cluttered full depth image, the obs is "ball at its real depth,
  empty (far) everywhere else" -- the representation a hardware ball-segmenter (EfficientTAM) also
  produces, so the sim2real gap collapses to the perception layer. Reads the head camera's
  ``segmentation`` channel (chan 0 = geom id) to find the ball geom (``ball_geom_name``), keeps
  those pixels' depth, sets the rest to ``far``, then runs the base ``DepthImageObs``
  clamp/normalize/frame-stack. Training-only DR (all default 0) models a real masked-depth feed:

  * ``ball_full_dropout_prob`` -- per env/step: drop the WHOLE ball (segmenter loses it -> all far).
  * ``ball_pixel_dropout``     -- per ball-pixel: drop -> far (ragged mask).
  * ``ball_depth_jitter``      -- per env/step: coherent +/- offset (m) on the ball's depth (the
                                  segmented ball reads a bit nearer/farther than truth).
  * ``edge_tile_flicker``      -- per-pixel prob a tile in the 1-cell RING around the ball flips
                                  from far to the ball's distance (mask-boundary/pooling flicker:
                                  an edge tile sometimes catches the ball, sometimes doesn't).
  * ``false_positive_rate``    -- (legacy, default 0) per-bg-pixel spurious random near reading.
  The sensor MUST render ``segmentation`` (data_types includes "segmentation").
  """

  def __init__(self, cfg, env: ManagerBasedRlEnv) -> None:
    super().__init__(cfg, env)
    p = cfg.params
    self._ball_geom_name: str = str(p.get("ball_geom_name", "ball/ball_collision"))
    self._ball_full_dropout_prob: float = float(p.get("ball_full_dropout_prob", 0.0))
    self._ball_pixel_dropout: float = float(p.get("ball_pixel_dropout", 0.0))
    self._ball_depth_jitter: float = float(p.get("ball_depth_jitter", 0.0))
    self._ball_noise_sigma: float = float(p.get("ball_noise_sigma", 0.0))
    self._edge_tile_flicker: float = float(p.get("edge_tile_flicker", 0.0))
    self._false_positive_rate: float = float(p.get("false_positive_rate", 0.0))
    self._ball_gid: int | None = None  # resolved lazily (mj_model available by first call)

  def _raw_depth(self, env: ManagerBasedRlEnv, sensor_name: str) -> torch.Tensor:
    sensor = env.scene[sensor_name]
    raw = sensor.data.depth  # [B, H, W, 1] metres
    seg = sensor.data.segmentation  # [B, H, W, 2] int (chan 0 = geom id)
    if seg is None:
      raise RuntimeError(
        f"BallOnlyDepthObs needs segmentation; sensor '{sensor_name}' must render it "
        "(data_types must include 'segmentation')."
      )
    if self._ball_gid is None:
      self._ball_gid = int(env.sim.mj_model.geom(self._ball_geom_name).id)

    far = torch.full_like(raw, self._far)
    ball = seg[..., 0:1] == self._ball_gid  # [B, H, W, 1] bool

    if self._ball_full_dropout_prob > 0.0:
      keep_env = torch.rand(raw.shape[0], 1, 1, 1, device=raw.device) >= self._ball_full_dropout_prob
      ball = ball & keep_env
    if self._ball_pixel_dropout > 0.0:
      ball = ball & (torch.rand_like(raw) >= self._ball_pixel_dropout)

    d = torch.where(ball, raw, far)  # ball -> real depth; everything else -> far

    # DR: coherent per-env depth offset on the ball (segmented depth a bit random).
    if self._ball_depth_jitter > 0.0:
      off = (torch.rand(raw.shape[0], 1, 1, 1, device=raw.device) * 2.0 - 1.0) * self._ball_depth_jitter
      d = torch.where(ball, d + off, d)

    # DR: per-pixel depth noise ON THE BALL ONLY (the far/empty background stays clean -- the masked
    # real feed has a constant-far background, so frame-wide noise would be unrealistic flicker).
    if self._ball_noise_sigma > 0.0:
      d = torch.where(ball, d + torch.randn_like(raw) * self._ball_noise_sigma, d)

    # DR: flicker the 1-tile ring around the ball between FAR (default) and the ball's distance.
    if self._edge_tile_flicker > 0.0:
      ballf = ball.float().permute(0, 3, 1, 2)  # [B,1,H,W]
      dilated = (F.max_pool2d(ballf, kernel_size=3, stride=1, padding=1) > 0.5).permute(0, 2, 3, 1)
      ring = dilated & (~ball)  # 1-cell ring just outside the ball
      ball_dist = torch.where(ball, raw, torch.full_like(raw, float("inf"))).amin(dim=(1, 2), keepdim=True)
      ball_dist = torch.where(torch.isfinite(ball_dist), ball_dist, far[:, :1, :1, :])  # no-ball guard
      flick = ring & (torch.rand_like(raw) < self._edge_tile_flicker)
      d = torch.where(flick, ball_dist.expand_as(d), d)

    # DR (legacy, default off): spurious random near readings on the background.
    if self._false_positive_rate > 0.0:
      fp = (~ball) & (torch.rand_like(raw) < self._false_positive_rate)
      near = self._near + torch.rand_like(raw) * (self._far - self._near)
      d = torch.where(fp, near, d)
    return d


def dodge_ball_state_b(
  env: ManagerBasedRlEnv,
  robot_name: str = "robot",
  ball_name: str = "ball",
) -> torch.Tensor:
  """PRIVILEGED (critic-only) ground-truth ball state, robot body frame: ``[B, 6]``.

  The ball's position and velocity *relative to the robot*, expressed in the robot's yaw
  frame: ``[rel_pos_b (3), rel_vel_b (3)]``. This is exactly what the actor must infer from
  the noisy, low-res depth image; handing the critic the clean ground truth sharpens the
  value estimate (and thus the advantages that train the actor) without giving the deployed
  policy any privileged input.
  """
  robot: Entity = env.scene[robot_name]
  ball: Entity = env.scene[ball_name]
  yq = yaw_quat(robot.data.root_link_quat_w)
  rel_pos_w = ball.data.root_link_pos_w - robot.data.root_link_pos_w
  rel_vel_w = ball.data.root_link_lin_vel_w - robot.data.root_link_lin_vel_w
  pos_b = quat_apply_inverse(yq, rel_pos_w)
  vel_b = quat_apply_inverse(yq, rel_vel_w)
  return torch.cat([pos_b, vel_b], dim=-1)  # (N, 6)


def dodge_cbf_state_b(
  env: ManagerBasedRlEnv,
  command_name: str = "twist",
) -> torch.Tensor:
  """PRIVILEGED (critic-only) CBF + filtered-command + ball-size state: ``[B, 8]``.

  Reads the per-step quantities the ``DodgeGoToGoalCommand`` stashes from the CBF and
  exposes them to the critic so it can value how threatened the robot is and what the
  safety filter wants:

    ``[ threat (1), h (1), tti (1), e_b (2), dodge_correction_b (2), ball_radius (1) ]``

  * ``threat`` -- 1.0 while a ball is airborne + approaching, else 0.0.
  * ``h``      -- barrier value ``s - D`` (>=0 safe), gated to 0 when no threat.
  * ``tti``    -- time-to-impact (s), gated to 0 when no threat.
  * ``e_b``    -- escape direction in the robot yaw frame, gated to 0 when no threat.
  * ``dodge_correction_b`` -- ``u_safe - u_nom`` in the yaw frame: how much the CBF wants
    the command to deviate from nominal == what the actor *should* do but is not told (the
    command it actually sees is the nominal one in CBF-RL mode). ~0 when no threat.
  * ``ball_radius`` -- the true per-env ball radius (m); the ball size is randomized each
    episode, and the actor must judge it from the ball's apparent size in depth. NOT gated
    (the size is a fixed ground-truth property regardless of threat).
  """
  cmd = env.command_manager.get_term(command_name)
  robot: Entity = cmd.robot
  yq = yaw_quat(robot.data.root_link_quat_w)
  threat = cmd._dodge_threat.float().unsqueeze(-1)  # (N, 1)

  def _to_b(v2: torch.Tensor) -> torch.Tensor:
    v3 = torch.cat([v2, torch.zeros_like(v2[:, :1])], dim=-1)
    return quat_apply_inverse(yq, v3)[:, :2]

  h = cmd._dodge_h.unsqueeze(-1) * threat
  tti = cmd._dodge_tti.unsqueeze(-1) * threat
  e_b = _to_b(cmd._dodge_e_w) * threat
  corr_b = _to_b(cmd._dodge_u_safe_w) - cmd.vel_command_nominal_b[:, :2]
  radius = cmd._dodge_ball_radius.unsqueeze(-1)
  return torch.cat([threat, h, tti, e_b, corr_b, radius], dim=-1)  # (N, 8)


def dodge_ball_radius_b(
  env: ManagerBasedRlEnv,
  command_name: str = "twist",
) -> torch.Tensor:
  """PRIVILEGED (critic-only) true per-env ball radius (m): ``[B, 1]``.

  The ball size is randomized 7.5-12.5 cm radius (15-25 cm diameter) each episode; the actor must judge it from the ball's
  apparent size in depth, so the critic gets the ground-truth value. Read from the dodge
  command's stashed per-env radius (same source as ``dodge_cbf_state_b``'s radius field).
  """
  cmd = env.command_manager.get_term(command_name)
  return cmd._dodge_ball_radius.unsqueeze(-1)


class BallObservableGate(ManagerTermBase):
  """PRIVILEGED (critic-only) latched "ball seen this throw" flag: ``[B, 1]`` in {0,1}.

  Used (a) as the loss mask for the actor's belief decoder -- supervise the ball-state
  regression only once the ball has actually entered a camera's view, and keep supervising
  after it leaves view (so the recurrent depth encoder learns to extrapolate the trajectory
  through FOV exit) but NEVER before the ball is first seen (the policy can't predict an
  unseen ball); and (b) as a value cue for the privileged critic.

  Latched per env: set 1.0 the first step the ball falls inside EITHER head camera's true
  frustum, held until a new throw or episode reset. "In frustum" is computed from the live
  per-camera world pose (``sim.data.cam_xpos``/``cam_xmat`` -- recomputed by forward
  kinematics each step, so it tracks the robot's pose: ducking pitches the cameras down), so
  it is correct under arbitrary torso orientation, not a static pelvis-frame cone. A new throw
  is detected by the ball teleporting (>1 m position jump) when it is re-launched.

  Training-only privileged signal (from ground-truth ball pos + camera pose); never fed to the
  actor.
  """

  def __init__(self, cfg, env: ManagerBasedRlEnv) -> None:
    super().__init__(env)
    p = cfg.params
    self._ball: str = p.get("ball_name", "ball")
    self._up_sensor: str = p.get("up_sensor", "head_depth_single")
    self._down_sensor: str = p.get("down_sensor", "head_depth_single")
    self._max_range: float = float(p.get("max_range", 5.0))
    self._near: float = float(p.get("near", 0.05))
    fovy = math.radians(float(p.get("fovy_deg", 54.0)))
    aspect = float(p.get("aspect", 16.0 / 9.0))  # depth WxH = 16x9 (ZED Mini WVGA: 85 H x 54 V)
    self._tan_v = math.tan(0.5 * fovy)
    self._tan_h = self._tan_v * aspect
    self._latch = torch.zeros(self.num_envs, device=self.device)
    self._prev_p = torch.zeros(self.num_envs, 3, device=self.device)
    self._cam_ids: list[int] | None = None
    self._init = False

  def reset(self, env_ids: torch.Tensor | slice | None = None):
    ids = slice(None) if env_ids is None else env_ids
    self._latch[ids] = 0.0
    self._prev_p[ids] = self._env.scene[self._ball].data.root_link_pos_w[ids]
    return {}

  def _in_view(self, env: ManagerBasedRlEnv, p: torch.Tensor) -> torch.Tensor:
    data = env.sim.data
    cam_xpos = data.cam_xpos  # [B, ncam, 3]
    cam_xmat = data.cam_xmat  # [B, ncam, 9] row-major 3x3 (cam->world)
    out = torch.zeros(self.num_envs, dtype=torch.bool, device=self.device)
    for cid in self._cam_ids:  # type: ignore[union-attr]
      R = cam_xmat[:, cid].reshape(-1, 3, 3)
      rel = p - cam_xpos[:, cid]
      pc = torch.einsum("bij,bj->bi", R.transpose(1, 2), rel)  # R^T rel -> camera frame
      d = -pc[:, 2]  # mujoco camera views along -z
      inv = d.clamp_min(1e-6)
      nx = pc[:, 0] / (inv * self._tan_h)
      ny = pc[:, 1] / (inv * self._tan_v)
      out |= (d > self._near) & (d < self._max_range) & (nx.abs() <= 1.0) & (ny.abs() <= 1.0)
    return out

  def __call__(self, env: ManagerBasedRlEnv, **_kwargs) -> torch.Tensor:
    if self._cam_ids is None:
      self._cam_ids = [
        int(env.scene[self._up_sensor].camera_idx),
        int(env.scene[self._down_sensor].camera_idx),
      ]
    p = env.scene[self._ball].data.root_link_pos_w  # [B, 3] world
    if not self._init:
      self._prev_p[:] = p
      self._init = True
    # New throw => ball teleports => require re-sighting.
    jumped = torch.norm(p - self._prev_p, dim=-1) > 1.0
    self._latch = torch.where(jumped, torch.zeros_like(self._latch), self._latch)
    # Latch on first (and any) sighting in either camera frustum.
    self._latch = torch.maximum(self._latch, self._in_view(env, p).float())
    self._prev_p = p.clone()
    return self._latch.unsqueeze(-1)