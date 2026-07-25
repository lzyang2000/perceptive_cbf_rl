/**
 * Per-tick trace of one throw: what the policy sees and what it does.
 *
 * Prints, each control step: ball position relative to the robot, how many depth
 * pixels the ball lights up and their nearest value, the policy's action
 * magnitude, and the robot's lateral displacement. Distinguishes the failure
 * modes that all look like "stands there and gets hit":
 *   - action magnitude ~0        -> the policy output is not reaching the sim
 *   - lit pixels always 0        -> the depth geometry is wrong (ball invisible)
 *   - lit pixels only at < 1 m   -> the ball is sub-pixel until too late
 *   - action large, robot still  -> targets are being blended or clamped away
 */

import load_mujoco from '@mujoco/mujoco';
import * as ort from 'onnxruntime-web';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { Sim } from '../src/sim.js';
import { Controller, MODE } from '../src/controller.js';
import { createPolicies } from '../src/policy.js';
import { PROPRIO_DIM, FRAME_OFFSETS, DEPTH_W, DEPTH_H } from '../src/generated/constants.js';
import { FRAME_DIM } from '../src/depth.js';

const HERE = dirname(fileURLToPath(import.meta.url));
const WEB = resolve(HERE, '..');
const argv = process.argv.slice(2);
const HIGH = argv.includes('--high');
const SHOW_IMAGE = argv.includes('--image');

const xml = readFileSync(resolve(WEB, 'public/model/g1_dodge.xml'), 'utf8');
const mj = await load_mujoco();
const DODGE_DIM = PROPRIO_DIM + FRAME_OFFSETS.length * FRAME_DIM;
const policies = await createPolicies(
  ort,
  {
    dodge: new Uint8Array(readFileSync(resolve(WEB, '../deploy/ckpts/dodge_link_cbf.onnx'))),
    walk: new Uint8Array(readFileSync(resolve(WEB, '../deploy/ckpts/walk_policy.onnx'))),
  },
  { dodgeDim: DODGE_DIM, walkDim: PROPRIO_DIM }
);

const sim = new Sim(mj, xml);
const ctl = new Controller(sim, policies, { seed: 7, forceMode: MODE.DODGE });

for (let i = 0; i < 50; i++) await ctl.tick(new Float32Array(3));
const s0 = sim.readState();
const home = [s0.rootPos[0], s0.rootPos[1]];

const plan = ctl.throwNow(HIGH);
console.log(
  `throw: ${plan.high ? 'LOW-ARC (duck)' : 'DESCENDING (sidestep)'} ` +
    `from [${plan.pos.map((v) => v.toFixed(2)).join(', ')}] ` +
    `vel [${plan.vel.map((v) => v.toFixed(2)).join(', ')}] tFlight=${plan.tFlight.toFixed(3)}s`
);
console.log(
  '\n tick    t   ballRel(x,y,z)      dist  lit  col, row  nearest   |act|   pelvisΔx,Δy  pelvisZ'
);
console.log(
  '  (+y is the robot LEFT; camera +x is the robot RIGHT, so a ball on the robot\'s\n' +
    '   right should appear at HIGH column index. Row 0 is the top of the image.)'
);

for (let i = 0; i < 60; i++) {
  await ctl.tick(new Float32Array(3));
  const s = sim.readState();

  let lit = 0;
  let nearest = 1.0;
  for (let k = 0; k < FRAME_DIM; k++) {
    if (ctl.frameBuf[k] < 0.999) {
      lit++;
      if (ctl.frameBuf[k] < nearest) nearest = ctl.frameBuf[k];
    }
  }
  let act = 0;
  for (let k = 0; k < ctl.lastAction.length; k++) act += ctl.lastAction[k] ** 2;
  act = Math.sqrt(act);

  const rx = s.ballPos[0] - s.rootPos[0];
  const ry = s.ballPos[1] - s.rootPos[1];
  const rz = s.ballPos[2] - s.rootPos[2];
  const dx = s.rootPos[0] - home[0];
  const dy = s.rootPos[1] - home[1];

  // Which columns/rows the ball lights up: tells us the image handedness.
  let colSum = 0;
  let rowSum = 0;
  let wsum = 0;
  for (let r = 0; r < DEPTH_H; r++) {
    for (let c = 0; c < DEPTH_W; c++) {
      const v = ctl.frameBuf[r * DEPTH_W + c];
      if (v < 0.999) {
        const w = 1 - v;
        colSum += c * w;
        rowSum += r * w;
        wsum += w;
      }
    }
  }
  const col = wsum > 0 ? (colSum / wsum).toFixed(1) : ' - ';
  const row = wsum > 0 ? (rowSum / wsum).toFixed(1) : ' - ';

  console.log(
    `${String(i).padStart(5)} ${(i / 50).toFixed(2)}  ` +
      `${rx.toFixed(2).padStart(6)},${ry.toFixed(2).padStart(6)},${rz.toFixed(2).padStart(6)}  ` +
      `${Math.hypot(rx, ry, rz).toFixed(2).padStart(5)}  ` +
      `${String(lit).padStart(3)} ${String(col).padStart(4)},${String(row).padStart(4)}  ` +
      `${nearest < 1 ? nearest.toFixed(3) : '  -  '}  ` +
      `${act.toFixed(2).padStart(6)}  ${dx.toFixed(3).padStart(6)},${dy.toFixed(3).padStart(6)}   ${s.rootPos[2].toFixed(3)}`
  );

  if (SHOW_IMAGE && lit > 0) {
    for (let r = 0; r < DEPTH_H; r++) {
      let row = '        ';
      for (let c = 0; c < DEPTH_W; c++) {
        const v = ctl.frameBuf[r * DEPTH_W + c];
        row += v > 0.999 ? '.' : v < 0.3 ? '#' : v < 0.6 ? '+' : 'o';
      }
      console.log(row);
    }
  }
}
