/** Minimal quaternion helpers. MuJoCo quaternion order is (w, x, y, z). */

/** Rotate `v` by quaternion `q`. Writes into `out` (may alias neither q nor v). */
export function quatApply(q, v, out = new Float32Array(3)) {
  const [w, x, y, z] = q;
  const [vx, vy, vz] = v;
  // t = 2 * (q_vec x v)
  const tx = 2 * (y * vz - z * vy);
  const ty = 2 * (z * vx - x * vz);
  const tz = 2 * (x * vy - y * vx);
  out[0] = vx + w * tx + (y * tz - z * ty);
  out[1] = vy + w * ty + (z * tx - x * tz);
  out[2] = vz + w * tz + (x * ty - y * tx);
  return out;
}

/** Rotate `v` by the inverse of `q` (i.e. world -> body). */
export function quatApplyInverse(q, v, out = new Float32Array(3)) {
  return quatApply([q[0], -q[1], -q[2], -q[3]], v, out);
}

/** Yaw-only quaternion: strips roll and pitch, keeping rotation about world z. */
export function yawQuat(q) {
  const [w, x, y, z] = q;
  const yaw = Math.atan2(2 * (w * z + x * y), 1 - 2 * (y * y + z * z));
  return [Math.cos(yaw / 2), 0, 0, Math.sin(yaw / 2)];
}

/** Gravity direction expressed in the base frame (what `projected_gravity` is). */
export function projectedGravity(baseQuat, out = new Float32Array(3)) {
  return quatApplyInverse(baseQuat, [0, 0, -1], out);
}

export function uniform(rng, lo, hi) {
  return lo + rng() * (hi - lo);
}

/** Box-Muller standard normal. */
export function randn(rng) {
  let u = 0;
  while (u === 0) u = rng();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rng());
}

/** Deterministic RNG (mulberry32) so a demo run can be reproduced from a seed. */
export function makeRng(seed) {
  let a = seed >>> 0;
  return function rng() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
