/**
 * Ablation over the depth-sampling and ball-size choices.
 *
 * The benchmark in scripts/dodge_benchmark.py notes a stationary "statue" is hit
 * ~97% of the time by these throws, so that is the do-nothing baseline any
 * configuration has to beat by a wide margin. Hits are counted from real
 * contact (a step change in the airborne ball's velocity), never proximity --
 * the same distinction that script calls out.
 *
 * Usage: node tools/sweep.mjs [--throws N] [--seeds 3]
 */

import load_mujoco from '@mujoco/mujoco';
import * as ort from 'onnxruntime-web';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { Sim } from '../src/sim.js';
import { Controller, MODE } from '../src/controller.js';
import { createPolicies } from '../src/policy.js';
import { PROPRIO_DIM, FRAME_OFFSETS, CONTROL_DT, DEFAULT_POS } from '../src/generated/constants.js';
import { FRAME_DIM } from '../src/depth.js';

const HERE = dirname(fileURLToPath(import.meta.url));
const WEB = resolve(HERE, '..');
const argv = process.argv.slice(2);
const arg = (n, d) => {
  const i = argv.indexOf(`--${n}`);
  return i >= 0 ? Number(argv[i + 1]) : d;
};
const N_THROWS = arg('throws', 20);
const N_SEEDS = arg('seeds', 2);
const HZ = Math.round(1 / CONTROL_DT);
const DODGE_DIM = PROPRIO_DIM + FRAME_OFFSETS.length * FRAME_DIM;

const xml = readFileSync(resolve(WEB, 'public/model/g1_dodge.xml'), 'utf8');
const mj = await load_mujoco();
const policies = await createPolicies(
  ort,
  {
    dodge: new Uint8Array(readFileSync(resolve(WEB, '../deploy/ckpts/dodge_link_cbf.onnx'))),
    walk: new Uint8Array(readFileSync(resolve(WEB, '../deploy/ckpts/walk_policy.onnx'))),
  },
  { dodgeDim: DODGE_DIM, walkDim: PROPRIO_DIM }
);

async function run(opts, nThrows, seed, { frozen = false } = {}) {
  const sim = new Sim(mj, xml);
  const ctl = new Controller(sim, policies, { seed, forceMode: MODE.DODGE, ...opts });
  for (let i = 0; i < HZ; i++) await ctl.tick(new Float32Array(3));

  let hits = 0;
  let falls = 0;
  let firstSeen = [];
  for (let t = 0; t < nThrows; t++) {
    ctl.throwNow(t % 2 === 0);
    let prevVel = null;
    let hit = false;
    let seenAt = null;
    for (let i = 0; i < Math.round(2.2 * HZ); i++) {
      // "frozen" = the statue control: hold the default stand and never react,
      // reproducing the do-nothing baseline dodge_benchmark.py reports at ~97%.
      if (frozen) {
        sim.setTargets(DEFAULT_POS);
        sim.step();
      } else {
        await ctl.tick(new Float32Array(3));
      }
      const s = sim.readState();
      if (!frozen && seenAt === null) {
        for (let k = 0; k < FRAME_DIM; k++) {
          if (ctl.frameBuf[k] < 0.999) {
            seenAt = Math.hypot(s.ballPos[0] - s.rootPos[0], s.ballPos[1] - s.rootPos[1]);
            break;
          }
        }
      }
      if (prevVel && s.ballPos[2] > 0.2 && i < Math.round(1.2 * HZ)) {
        const dv = Math.hypot(
          s.ballVel[0] - prevVel[0],
          s.ballVel[1] - prevVel[1],
          s.ballVel[2] - prevVel[2]
        );
        if (dv > 1.0) hit = true;
      }
      prevVel = [s.ballVel[0], s.ballVel[1], s.ballVel[2]];
      if (sim.hasFallen()) break;
    }
    if (hit) hits++;
    if (seenAt !== null) firstSeen.push(seenAt);
    if (sim.hasFallen()) {
      falls++;
      sim.reset();
      ctl.resetBelief();
      for (let i = 0; i < HZ; i++) await ctl.tick(new Float32Array(3));
    } else {
      sim.parkBall();
    }
  }
  const meanSeen = firstSeen.length
    ? firstSeen.reduce((a, b) => a + b, 0) / firstSeen.length
    : NaN;
  return { hits, falls, nThrows, meanSeen };
}

const CONFIGS = [
  ['1 ray/px, ball 0.0762 (as-was)', { subsample: 1, randomizeBallRadius: false }],
  ['1 ray/px, ball 0.075-0.125    ', { subsample: 1, randomizeBallRadius: true }],
  ['3x3 min-pool, ball 0.0762     ', { subsample: 3, randomizeBallRadius: false }],
  ['3x3 min-pool, ball 0.075-0.125', { subsample: 3, randomizeBallRadius: true }],
  ['5x5 min-pool, ball 0.075-0.125', { subsample: 5, randomizeBallRadius: true }],
];

console.log(`ablation: ${N_THROWS} throws x ${N_SEEDS} seeds per config\n`);
console.log('config                            hits    rate  falls  firstSeen(m)');
for (const [label, opts] of [
  ['STATUE control (no policy)    ', { subsample: 3, randomizeBallRadius: true, frozen: true }],
  ...CONFIGS,
]) {
  let hits = 0;
  let falls = 0;
  let n = 0;
  let seen = [];
  for (let s = 0; s < N_SEEDS; s++) {
    const { frozen, ...copts } = opts;
    const r = await run(copts, N_THROWS, 1000 + s * 77, { frozen });
    hits += r.hits;
    falls += r.falls;
    n += r.nThrows;
    if (!Number.isNaN(r.meanSeen)) seen.push(r.meanSeen);
  }
  const meanSeen = seen.length ? (seen.reduce((a, b) => a + b, 0) / seen.length).toFixed(2) : ' - ';
  console.log(
    `${label}  ${String(hits).padStart(3)}/${n}  ${((hits / n) * 100).toFixed(0).padStart(4)}%  ` +
      `${String(falls).padStart(4)}   ${meanSeen}`
  );
}
