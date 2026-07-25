/**
 * Headless validation of the browser port, in Node, before any rendering exists.
 *
 * Three things this must establish, because each is a way the port can be subtly
 * wrong while still "running":
 *
 *  1. STAND    -- with no ball, the policy holds a stable stand. If the physics
 *                 contract (gains, armature, integrator) or the proprio layout
 *                 were wrong, this collapses immediately.
 *  2. DODGE    -- thrown balls are mostly avoided, and the robot stays upright.
 *                 A plausible-but-wrong obs assembly passes (1) and fails (2).
 *  3. ROW ORDER-- the one depth convention that cannot be settled by reading the
 *                 code (whether image row 0 is the top or the bottom of the
 *                 frame) is decided by measuring both against (2).
 *
 * Runs the SHIPPED inference path (src/mlp.js), so this measures the behaviour
 * the browser actually gets. tools/verify_mlp.mjs separately proves that path
 * matches ONNX Runtime, which is what ties these numbers back to the checkpoint.
 *
 * Usage: node tools/headless.mjs [--throws N] [--seed S] [--rows both|top|bottom]
 */

import load_mujoco from '@mujoco/mujoco';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { Sim } from '../src/sim.js';
import { Controller, MODE } from '../src/controller.js';
import { createMlp } from '../src/mlp.js';
import { PROPRIO_DIM, FRAME_OFFSETS, CONTROL_DT } from '../src/generated/constants.js';
import { FRAME_DIM } from '../src/depth.js';

const HERE = dirname(fileURLToPath(import.meta.url));
const WEB = resolve(HERE, '..');

const argv = process.argv.slice(2);
const arg = (name, def) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 ? argv[i + 1] : def;
};
const N_THROWS = Number(arg('throws', 12));
const SEED = Number(arg('seed', 7));
const ROWS = arg('rows', 'both');

const DODGE_DIM = PROPRIO_DIM + FRAME_OFFSETS.length * FRAME_DIM;
const HZ = Math.round(1 / CONTROL_DT);

const xml = readFileSync(resolve(WEB, 'public/model/g1_dodge.xml'), 'utf8');
const mj = await load_mujoco();

/** Load one extracted policy the same way the browser does. */
function loadPolicy(name) {
  const dir = resolve(WEB, 'public/policy');
  const manifest = JSON.parse(readFileSync(resolve(dir, `${name}.weights.json`), 'utf8'));
  const buf = readFileSync(resolve(dir, `${name}.weights.bin`));
  // readFileSync returns a Buffer over a shared pool; slice so manifest offsets
  // are relative to byte 0.
  return createMlp(manifest, buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
}

const dodgeMlp = loadPolicy('dodge');
const walkMlp = loadPolicy('walk');
if (dodgeMlp.inputDim !== DODGE_DIM) {
  throw new Error(`dodge policy wants ${dodgeMlp.inputDim} inputs, assembled obs is ${DODGE_DIM}`);
}
if (walkMlp.inputDim !== PROPRIO_DIM) {
  throw new Error(`walk policy wants ${walkMlp.inputDim} inputs, proprio is ${PROPRIO_DIM}`);
}
const policies = {
  runDodge: (obs) => dodgeMlp.run(obs),
  runWalk: (obs) => walkMlp.run(obs),
};
console.log(`policies loaded (src/mlp.js): dodge ${DODGE_DIM}->29, walk ${PROPRIO_DIM}->29\n`);

/**
 * A hit shows up as a sudden velocity change on an airborne ball.
 *
 * MUST be constructed fresh per throw. Carrying one detector across throws
 * compares the newly launched ball against the previous ball's velocity, and the
 * launch itself is a teleport -- which registers as a hit on the first tick of
 * every throw and silently reports ~100% hits no matter how well the policy
 * dodges. (That bug is what made this harness first report 88%.)
 */
function makeHitDetector() {
  let prev = null;
  return (ballPos, ballVel) => {
    let hit = false;
    if (prev && ballPos[2] > 0.2) {
      const dv = Math.hypot(ballVel[0] - prev[0], ballVel[1] - prev[1], ballVel[2] - prev[2]);
      // Gravity alone changes v by g*dt ~= 0.2 m/s per control step.
      if (dv > 1.0) hit = true;
    }
    prev = [ballVel[0], ballVel[1], ballVel[2]];
    return hit;
  };
}

async function standTest(seconds = 5) {
  const sim = new Sim(mj, xml);
  const ctl = new Controller(sim, policies, { seed: SEED });
  let minZ = Infinity;
  let maxTilt = 0;
  const n = Math.round(seconds * HZ);
  for (let i = 0; i < n; i++) {
    await ctl.tick(new Float32Array(3)); // zero command: stand in place
    const s = sim.readState();
    minZ = Math.min(minZ, s.rootPos[2]);
    maxTilt = Math.max(maxTilt, Math.hypot(s.projGrav[0], s.projGrav[1]));
    if (sim.hasFallen()) {
      return { ok: false, fellAt: (i / HZ).toFixed(2), minZ, maxTilt };
    }
  }
  return { ok: true, minZ, maxTilt, finalZ: sim.readState().rootPos[2] };
}

async function dodgeTest(rowZeroIsTop, nThrows, seed, ctlOpts = {}) {
  const sim = new Sim(mj, xml);
  const ctl = new Controller(sim, policies, { seed, rowZeroIsTop, ...ctlOpts });

  // Settle into a stable stand before the first throw.
  for (let i = 0; i < 1.0 * HZ; i++) await ctl.tick(new Float32Array(3));

  let hits = 0;
  let falls = 0;
  let dodgeTicks = 0;
  let sawDodgeMode = 0;
  let ballSeenTicks = 0;

  for (let t = 0; t < nThrows; t++) {
    ctl.throwNow(t % 2 === 0); // alternate duck / sidestep
    const detectHit = makeHitDetector(); // fresh per throw -- see above
    let hitThisThrow = false;
    let enteredDodge = false;
    // Watch the whole flight plus recovery. Only count hits during the flight
    // window itself -- after ~1.2 s the ball is on the floor and may roll into
    // the robot's feet, which is not a dodge failure.
    for (let i = 0; i < Math.round(2.2 * HZ); i++) {
      await ctl.tick(new Float32Array(3));
      const s = sim.readState();
      const hit = detectHit(s.ballPos, s.ballVel);
      if (hit && i < Math.round(1.2 * HZ)) hitThisThrow = true;
      if (ctl.mode === MODE.DODGE) {
        dodgeTicks++;
        enteredDodge = true;
      }
      // Does the policy actually see the ball? (any pixel below far)
      let seen = false;
      for (let k = 0; k < FRAME_DIM; k++) {
        if (ctl.frameBuf[k] < 0.999) {
          seen = true;
          break;
        }
      }
      if (seen) ballSeenTicks++;
      if (sim.hasFallen()) break;
    }
    if (hitThisThrow) hits++;
    if (enteredDodge) sawDodgeMode++;
    if (sim.hasFallen()) {
      falls++;
      sim.reset();
      ctl.resetBelief();
      for (let i = 0; i < 1.0 * HZ; i++) await ctl.tick(new Float32Array(3));
    } else {
      sim.parkBall();
    }
  }
  return {
    rowZeroIsTop,
    nThrows,
    hits,
    falls,
    hitRate: hits / nThrows,
    dodgeSeconds: (dodgeTicks / HZ).toFixed(1),
    modeSwitches: sawDodgeMode,
    ballVisibleSeconds: (ballSeenTicks / HZ).toFixed(1),
  };
}

// --- 1. Stand ---
console.log('[1/3] stand test (5 s, no ball)');
const stand = await standTest(5);
console.log(
  `  ${stand.ok ? 'PASS' : 'FAIL'}  minPelvisZ=${stand.minZ.toFixed(3)} ` +
    `maxTilt=${stand.maxTilt.toFixed(3)}` +
    (stand.ok ? ` finalZ=${stand.finalZ.toFixed(3)}` : ` fellAt=${stand.fellAt}s`)
);
if (!stand.ok) {
  console.error('\nThe policy cannot stand. The physics or proprio contract is wrong;');
  console.error('dodge results below would be meaningless. Fix this first.');
  process.exit(1);
}

// --- 2/3. Dodge, and settle the row convention by measuring both ---
// Pinned DODGE is the baseline: it is the configuration the checkpoint was
// deployed in (the operator selects dodge and leaves it), so it isolates the obs
// pipeline from anything the mode arbiter does.
const variants = ROWS === 'both' ? [true, false] : [ROWS === 'top'];
const results = [];
for (const rowTop of variants) {
  console.log(`\n[2/3] dodge test (${N_THROWS} throws, row0=${rowTop ? 'TOP' : 'BOTTOM'})`);
  for (const [label, opts] of [
    ['pinned DODGE   ', { forceMode: MODE.DODGE }],
    ['auto arbitration', {}],
  ]) {
    const r = await dodgeTest(rowTop, N_THROWS, SEED, opts);
    if (opts.forceMode !== undefined) results.push(r);
    console.log(
      `  ${label}  hits=${r.hits}/${r.nThrows} (${(r.hitRate * 100).toFixed(0)}%)  ` +
        `falls=${r.falls}  dodgeMode=${r.dodgeSeconds}s  ballVisible=${r.ballVisibleSeconds}s`
    );
  }
}

if (results.length === 2) {
  console.log('\n[3/3] row convention');
  const [top, bottom] = results;
  const score = (r) => r.hits + 3 * r.falls; // falling is far worse than a graze
  const sTop = score(top);
  const sBot = score(bottom);
  console.log(`  row0=TOP    hits=${top.hits} falls=${top.falls}  score=${sTop}`);
  console.log(`  row0=BOTTOM hits=${bottom.hits} falls=${bottom.falls}  score=${sBot}`);
  if (sTop === sBot) {
    console.log('  INCONCLUSIVE: both conventions score the same. Increase --throws.');
  } else {
    console.log(
      `  => row0=${sTop < sBot ? 'TOP' : 'BOTTOM'} performs better ` +
        `(lower score = fewer hits/falls)`
    );
  }
}

if (results[0].ballVisibleSeconds === '0.0') {
  console.error('\nWARNING: the policy never saw the ball -- the depth path is broken.');
  process.exit(1);
}
console.log('\ndone');
