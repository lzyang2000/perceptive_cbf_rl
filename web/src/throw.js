/**
 * Ball throws, ported from mdp/events.py:throw_ball_on_dwell.
 *
 * Two threat types, mixed 50/50 exactly as the play config does, because the
 * policy learned a different response to each:
 *
 *  - DESCENDING: launched high (1.5-2.3 m) with vz0 = 0, so it falls across the
 *    body -- a ball you sidestep or lift a leg over.
 *  - LOW-ARC ("high"): launched low (0.4-0.9 m) with an upward vz0 chosen so it
 *    arrives at head/torso height (0.9-1.1 m in play) -- a ball you duck under.
 *
 * The launch point always sits in the robot's frontal cone (+/-25 deg of
 * heading) so the ball is visible to the head camera; only the AIM point is led
 * and jittered.
 */

import { yawQuat, quatApply, uniform, randn } from './mathutil.js';

export const THROW_DEFAULTS = {
  distRange: [2.0, 3.0],
  heightRange: [1.5, 2.3], // descending launch height
  angleDeg: 25.0,
  flightTimeRange: [0.58, 0.63],
  highThrowFraction: 0.5,
  highLaunchHeightRange: [0.4, 0.9],
  highTargetZRange: [0.9, 1.1], // play tightens this from training's (0.9, 1.3)
  aimNoiseScale: 0.1,
  leadTarget: true,
  gravity: 9.81,
};

/**
 * Compute a launch state for one throw.
 *
 * @param rootPos   robot pelvis position in world
 * @param rootQuat  robot pelvis quaternion (w, x, y, z)
 * @param rootVelXY robot xy velocity in world (for aim leading)
 * @param rng       () => [0,1)
 * @param opts      overrides for THROW_DEFAULTS; `forceHigh` pins the type
 * @returns {{pos: number[], vel: number[], high: boolean}}
 */
export function planThrow(rootPos, rootQuat, rootVelXY, rng, opts = {}) {
  const p = { ...THROW_DEFAULTS, ...opts };
  const g = p.gravity;

  // Launch point: dist ahead, lateral = dist * tan(angle), in the yaw frame.
  const dist = uniform(rng, ...p.distRange);
  const angle = (uniform(rng, -p.angleDeg, p.angleDeg) * Math.PI) / 180;
  const lateral = dist * Math.tan(angle);
  const yq = yawQuat(rootQuat);
  const offsetW = quatApply(yq, [dist, lateral, 0]);

  const high =
    opts.forceHigh !== undefined && opts.forceHigh !== null
      ? Boolean(opts.forceHigh)
      : rng() < p.highThrowFraction;

  const startX = rootPos[0] + offsetW[0];
  const startY = rootPos[1] + offsetW[1];
  const startZ = high
    ? uniform(rng, ...p.highLaunchHeightRange)
    : uniform(rng, ...p.heightRange);

  // Reaction window. Descending throws cap flight time so the ball cannot fall
  // below ~0.05 m before it arrives (otherwise it lands short); low-arc throws
  // rise then fall, so they use the full window.
  const tReq = uniform(rng, ...p.flightTimeRange);
  const tMax = Math.sqrt((2 * Math.max(startZ - 0.05, 1e-3)) / g);
  const tFlight = high ? tReq : Math.min(tReq, tMax);

  // Aim: the robot's xy, led by its velocity, then jittered.
  let aimX = rootPos[0];
  let aimY = rootPos[1];
  if (p.leadTarget) {
    aimX += rootVelXY[0] * tFlight;
    aimY += rootVelXY[1] * tFlight;
  }
  if (p.aimNoiseScale > 0) {
    aimX += p.aimNoiseScale * randn(rng);
    aimY += p.aimNoiseScale * randn(rng);
  }

  const vx = (aimX - startX) / tFlight;
  const vy = (aimY - startY) / tFlight;
  // Low-arc: choose vz0 so z(tFlight) lands on the head/torso target height.
  const vz = high
    ? (uniform(rng, ...p.highTargetZRange) - startZ) / tFlight + 0.5 * g * tFlight
    : 0;

  return { pos: [startX, startY, startZ], vel: [vx, vy, vz], high, tFlight };
}
