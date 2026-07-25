/**
 * Ball-only masked depth, computed analytically instead of rendered.
 *
 * The deployed checkpoint (`dodge_link_cbf.onnx`) is the BallOnly policy: its
 * depth observation is "the ball at its true distance, `far` everywhere else"
 * (src/tasks/amp_loco/mdp/observations.py:BallOnlyDepthObs). In training that
 * comes from the head camera's segmentation channel; on hardware it comes from
 * EfficientTAM masking the ZED depth. Either way the result is a 9x16 image
 * where only ball pixels carry a reading.
 *
 * With a fixed camera, a known sphere and a 16x9 render, that image is exactly
 * 144 ray-sphere intersections -- no depth pass, no segmentation, no WebGL.
 * The value stored is TRUE GEOMETRIC DISTANCE along the ray, which is what the
 * mujoco_warp sensor reports (it ignores the model's near/far clip).
 *
 * Known simplification: self-occlusion is not modelled. In training, an arm in
 * front of the ball segments as the arm, so those pixels read `far`; here the
 * ball stays visible. That only ever gives the policy a cleaner view than
 * training did (and it trained with per-pixel and whole-ball dropout), so it
 * stays inside the distribution rather than pushing outside it.
 */

import { DEPTH_H, DEPTH_W, DEPTH_NEAR, DEPTH_FAR } from './generated/constants.js';

export const FRAME_DIM = DEPTH_H * DEPTH_W;

/**
 * Precomputed per-pixel ray directions in the CAMERA frame.
 *
 * MuJoCo camera frame: +x right, +y up, looking down -z. `fovy` is the vertical
 * field of view, so the horizontal half-extent scales by the aspect ratio
 * (fovy 54 at 16:9 -> hFOV ~84.5 deg, as documented in dodge_env_cfgs.py).
 *
 * Row 0 is the TOP of the image (+y). Flattening is row-major, matching the
 * `[B, H*W]` flatten of DepthImageObs.
 */
export const DEFAULT_SUBSAMPLE = 3;

/**
 * `subsample` rays per pixel axis, min-pooled per pixel (see ballOnlyDepth).
 *
 * This is not extra precision for its own sake -- it reproduces the DEPLOYED
 * perception stack. The robot's ZED produces a full-resolution depth map that
 * EfficientTAM masks, and camera_node MIN-POOLS it down to 9x16. So a ball
 * smaller than one 9x16 cell still registers on hardware, because min-pooling
 * keeps the nearest sample in the cell. A single ray per pixel centre would
 * instead miss the ball entirely until ~1.65 m (a 0.0762 m ball only subtends a
 * full 5.3 deg cell at that range), leaving the policy a fraction of the
 * reaction window it was deployed with.
 */
export function makePixelRays(
  fovyDeg,
  w = DEPTH_W,
  h = DEPTH_H,
  rowZeroIsTop = true,
  subsample = DEFAULT_SUBSAMPLE
) {
  const s = Math.max(1, subsample | 0);
  const tanV = Math.tan((fovyDeg * Math.PI) / 180 / 2);
  const tanH = (tanV * w) / h;
  const rays = new Float32Array(w * h * s * s * 3);
  let o = 0;
  for (let r = 0; r < h; r++) {
    for (let c = 0; c < w; c++) {
      for (let sr = 0; sr < s; sr++) {
        for (let sc = 0; sc < s; sc++) {
          // Sub-sample centres inside the pixel footprint.
          const fx = c + (sc + 0.5) / s;
          const fy = r + (sr + 0.5) / s;
          const sx = (2 * fx) / w - 1; // -1 (left) .. +1 (right)
          let sy = 1 - (2 * fy) / h; // +1 (top) .. -1 (bottom)
          if (!rowZeroIsTop) sy = -sy;
          const x = sx * tanH;
          const y = sy * tanV;
          const z = -1;
          const n = Math.hypot(x, y, z);
          rays[o++] = x / n;
          rays[o++] = y / n;
          rays[o++] = z / n;
        }
      }
    }
  }
  rays.subsample = s;
  return rays;
}

/**
 * Render the ball-only depth frame, already normalised to the policy's [0, 1].
 *
 * Replicates BallOnlyDepthObs (all training-time DR off, as in play) followed by
 * DepthImageObs's clamp/normalise, which is the same arithmetic
 * `depth_metres_to_obs` applies on the robot:
 *   ball -> true distance; everything else -> far
 *   raw < near -> far; clamp to [near, far]; (d - near) / (far - near)
 *
 * @param rays      camera-frame unit directions from makePixelRays
 * @param camPos    camera position in world, length-3 view
 * @param camMat    camera rotation, 9 values ROW-MAJOR (columns are the camera axes)
 * @param ballPos   ball centre in world
 * @param ballRadius sphere radius (m)
 * @param out       Float32Array(FRAME_DIM) to fill
 */
export function ballOnlyDepth(rays, camPos, camMat, ballPos, ballRadius, out) {
  const n = FRAME_DIM;
  if (!out || out.length !== n) out = new Float32Array(n);
  out.fill(1.0); // normalised far = empty

  // Camera -> ball, in world.
  const ox = camPos[0] - ballPos[0];
  const oy = camPos[1] - ballPos[1];
  const oz = camPos[2] - ballPos[2];
  const cc = ox * ox + oy * oy + oz * oz - ballRadius * ballRadius;

  // Cheap reject: if the ball is far beyond the clip range it cannot contribute.
  const centreDist = Math.hypot(ox, oy, oz);
  if (centreDist - ballRadius > DEPTH_FAR) return out;

  const scale = 1 / (DEPTH_FAR - DEPTH_NEAR);
  // camMat is row-major; its columns are the camera's local axes in world coords,
  // so world = camMat * local reads across rows.
  const m0 = camMat[0], m1 = camMat[1], m2 = camMat[2];
  const m3 = camMat[3], m4 = camMat[4], m5 = camMat[5];
  const m6 = camMat[6], m7 = camMat[7], m8 = camMat[8];

  const ss = (rays.subsample ?? 1) ** 2; // sub-rays per pixel
  let o = 0;
  for (let i = 0; i < n; i++) {
    let best = Infinity; // min-pool over the pixel's sub-rays
    for (let k = 0; k < ss; k++, o += 3) {
      const lx = rays[o], ly = rays[o + 1], lz = rays[o + 2];
      const dx = m0 * lx + m1 * ly + m2 * lz;
      const dy = m3 * lx + m4 * ly + m5 * lz;
      const dz = m6 * lx + m7 * ly + m8 * lz;

      const b = dx * ox + dy * oy + dz * oz;
      const disc = b * b - cc;
      if (disc < 0) continue;
      const sq = Math.sqrt(disc);
      let t = -b - sq;
      if (t < 0) t = -b + sq; // camera inside the sphere
      if (t < 0) continue; // sphere entirely behind the camera
      if (t < best) best = t;
    }
    // raw < near reads as "nothing there" -> far, then clamp + normalise.
    if (best === Infinity || best < DEPTH_NEAR || best >= DEPTH_FAR) continue;
    out[i] = (best - DEPTH_NEAR) * scale;
  }
  return out;
}

/**
 * Raw depth in metres -> the policy's normalised [0, 1] frame.
 *
 * The exact arithmetic of deploy/policy/dodge_policy.py:depth_metres_to_obs:
 * no-hit/sky (raw < near) reads as far, clamp to [near, far], then normalise.
 * `ballOnlyDepth` fuses this in for speed; this is the standalone form used by
 * the cross-check against the Python reference.
 */
export function normalizeDepthMetres(depthM, out) {
  const n = depthM.length;
  if (!out || out.length !== n) out = new Float32Array(n);
  const scale = 1 / (DEPTH_FAR - DEPTH_NEAR);
  for (let i = 0; i < n; i++) {
    let d = depthM[i];
    if (d < DEPTH_NEAR) d = DEPTH_FAR;
    if (d > DEPTH_FAR) d = DEPTH_FAR;
    out[i] = (d - DEPTH_NEAR) * scale;
  }
  return out;
}

/** All-far frame: what the policy sees with no ball in view. */
export function farFrame() {
  return new Float32Array(FRAME_DIM).fill(1.0);
}
