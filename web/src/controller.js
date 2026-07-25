/**
 * The 50 Hz control loop: obs assembly, automatic dodge/walk arbitration, and
 * the PD targets that go to MuJoCo.
 *
 * Structurally this is deploy/policy/dodge_policy.py with the UDP replaced by
 * direct calls and the operator's mode byte replaced by an automatic arbiter.
 * Everything else is deliberately identical: both policies share one proprio
 * history and one `last_action`; the depth ring is pushed EVERY tick regardless
 * of mode so the dodge belief is fresh the instant a throw arrives; a mode
 * switch blends joint targets over 25 ticks (~0.5 s) instead of stepping them.
 */

import {
  NUM_JOINTS,
  DEFAULT_POS,
  ACTION_SCALE,
  PROPRIO_DIM,
  FRAME_OFFSETS,
  HEAD_CAMERA_FOVY_DEG,
} from './generated/constants.js';
import { ProprioHistory, DepthRing, assembleObs } from './obs.js';
import { ballOnlyDepth, makePixelRays, FRAME_DIM } from './depth.js';
import { planThrow } from './throw.js';
import { makeRng } from './mathutil.js';

export const MODE = { DODGE: 0, WALK: 1 };

const ZERO3 = new Float32Array(3);

export const ARBITER_DEFAULTS = {
  /** A ball above this height is still in flight (matches rethrow_ground_height). */
  liveHeight: 0.15,
  /** Only balls closer than this in xy count as a threat. */
  threatRange: 4.0,
  /** Stay in DODGE this long after the threat clears, so the dodge completes. */
  holdSeconds: 1.2,
  /** Joint-target blend length on a mode switch (ticks). */
  blendTicks: 25,
  /** Per-throw ball radius, as training randomised it (dodge_env_cfgs.py). */
  randomizeBallRadius: true,
  ballRadiusRange: [0.075, 0.125],
};

export class Controller {
  /**
   * @param sim       Sim instance
   * @param policies  {runDodge, runWalk} from createPolicies
   * @param opts      arbiter overrides, `rowZeroIsTop`, `seed`
   */
  constructor(sim, policies, opts = {}) {
    this.sim = sim;
    this.policies = policies;
    this.cfg = { ...ARBITER_DEFAULTS, ...opts };
    this.rng = makeRng(opts.seed ?? 12345);

    this.rays = makePixelRays(
      HEAD_CAMERA_FOVY_DEG,
      undefined,
      undefined,
      opts.rowZeroIsTop ?? true,
      opts.subsample
    );
    this.proprio = new ProprioHistory();
    this.ring = new DepthRing(FRAME_OFFSETS, FRAME_DIM);

    this.frameBuf = new Float32Array(FRAME_DIM);
    this.obsBuf = new Float32Array(PROPRIO_DIM + FRAME_OFFSETS.length * FRAME_DIM);
    this.jointPosRel = new Float32Array(NUM_JOINTS);
    this.lastAction = new Float32Array(NUM_JOINTS);
    this.target = new Float32Array(NUM_JOINTS);
    this.lastTarget = Float32Array.from(DEFAULT_POS);
    this.blendFrom = Float32Array.from(DEFAULT_POS);
    this.blendI = this.cfg.blendTicks;

    this.mode = MODE.WALK;
    this.threatTicks = 0; // ticks remaining of the DODGE hold
    this.lastThrow = null;
    this.ticks = 0;
    /** Pin the mode, bypassing the arbiter (null = automatic). */
    this.forceMode = opts.forceMode ?? null;
  }

  /** Clear all temporal belief (an episode boundary). */
  resetBelief() {
    this.proprio.reset();
    this.ring.reset();
    this.lastAction.fill(0);
    this.lastTarget.set(DEFAULT_POS);
    this.blendFrom.set(DEFAULT_POS);
    this.blendI = this.cfg.blendTicks;
    this.mode = MODE.WALK;
    this.threatTicks = 0;
    this.ticks = 0;
  }

  /**
   * Is a thrown ball currently a threat? Uses the simulator's ground truth,
   * which is the demo's stand-in for the operator who flips the mode byte on
   * hardware -- the POLICY still sees nothing but depth.
   */
  isThreat(s) {
    if (s.ballPos[2] <= this.cfg.liveHeight) return false;
    const rx = s.ballPos[0] - s.rootPos[0];
    const ry = s.ballPos[1] - s.rootPos[1];
    if (Math.hypot(rx, ry) > this.cfg.threatRange) return false;
    // Closing in xy: the ball is coming toward the robot, not rolling away.
    const vx = s.ballVel[0] - s.rootVel[0];
    const vy = s.ballVel[1] - s.rootVel[1];
    return rx * vx + ry * vy < 0;
  }

  /** Throw a ball at the robot now. `forceHigh` pins duck (true) vs sidestep (false). */
  throwNow(forceHigh = undefined) {
    const s = this.sim.readState();
    if (this.cfg.randomizeBallRadius) {
      const [lo, hi] = this.cfg.ballRadiusRange;
      this.sim.setBallRadius(lo + this.rng() * (hi - lo));
    }
    const plan = planThrow(s.rootPos, s.baseQuat, s.rootVel, this.rng, { forceHigh });
    this.sim.throwBall(plan.pos, plan.vel);
    this.lastThrow = plan;
    return plan;
  }

  /**
   * One 50 Hz control step.
   * @param userCmd Float32Array(3) twist (vx, vy, wz) for WALK mode; omit to
   *                hold still. DODGE ignores it either way.
   */
  async tick(userCmd = ZERO3) {
    const s = this.sim.readState();

    // Depth every tick, in both modes -- so a walk->dodge switch starts with a
    // full, current frame stack rather than a cold one.
    const frame = ballOnlyDepth(
      this.rays,
      s.camPos,
      s.camMat,
      s.ballPos,
      s.ballRadius,
      this.frameBuf
    );
    const depth = this.ring.push(frame);

    // --- Automatic mode arbitration ---
    if (this.isThreat(s)) {
      this.threatTicks = Math.round(this.cfg.holdSeconds * 50);
    } else if (this.threatTicks > 0) {
      this.threatTicks--;
    }
    const wanted =
      this.forceMode !== null && this.forceMode !== undefined
        ? this.forceMode
        : this.threatTicks > 0
          ? MODE.DODGE
          : MODE.WALK;
    if (wanted !== this.mode) {
      this.blendFrom.set(this.lastTarget);
      this.blendI = 0;
      this.mode = wanted;
    }

    // DODGE is in-place: the camera is the only motion driver, so any commanded
    // twist is dropped (enforced here exactly as dodge_policy.py does).
    const cmd = this.mode === MODE.WALK ? (userCmd ?? ZERO3) : ZERO3;

    for (let i = 0; i < NUM_JOINTS; i++) this.jointPosRel[i] = s.q[i] - DEFAULT_POS[i];
    this.proprio.append([s.angVel, s.projGrav, cmd, this.jointPosRel, s.dq, this.lastAction]);
    const proprio = this.proprio.vector();

    let action;
    if (this.mode === MODE.WALK) {
      action = await this.policies.runWalk(proprio);
    } else {
      action = await this.policies.runDodge(assembleObs(proprio, depth, this.obsBuf));
    }
    this.lastAction.set(action.subarray ? action.subarray(0, NUM_JOINTS) : action);

    for (let i = 0; i < NUM_JOINTS; i++) {
      this.target[i] = DEFAULT_POS[i] + this.lastAction[i] * ACTION_SCALE[i];
    }
    if (this.blendI < this.cfg.blendTicks) {
      this.blendI++;
      const a = this.blendI / this.cfg.blendTicks;
      for (let i = 0; i < NUM_JOINTS; i++) {
        this.target[i] = (1 - a) * this.blendFrom[i] + a * this.target[i];
      }
    }
    this.lastTarget.set(this.target);

    this.sim.setTargets(this.target);
    this.sim.step();
    this.ticks++;
    return this;
  }
}
