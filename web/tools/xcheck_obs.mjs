/**
 * Assert the JS observation port reproduces the deploy Python code exactly.
 *
 * Reference vectors come from tools/xcheck_obs.py, which imports the actual
 * ProprioHistory / DepthRing / assemble_obs / depth_metres_to_obs out of
 * deploy/policy/dodge_policy.py. If this passes, the term-major history layout,
 * the newest->oldest depth offset stacking, and the depth normalisation are
 * correct by construction rather than by inspection -- which leaves the depth
 * GEOMETRY as the only remaining place the observation can be wrong.
 *
 * Usage: python3 tools/xcheck_obs.py > ref.json && node tools/xcheck_obs.mjs ref.json
 */

import { readFileSync } from 'node:fs';
import { ProprioHistory, DepthRing, assembleObs } from '../src/obs.js';
import { normalizeDepthMetres, FRAME_DIM } from '../src/depth.js';

const refPath = process.argv[2];
if (!refPath) {
  console.error('usage: node tools/xcheck_obs.mjs <ref.json>');
  process.exit(2);
}
const ref = JSON.parse(readFileSync(refPath, 'utf8'));

if (ref.frame_dim !== FRAME_DIM) {
  throw new Error(`frame dim mismatch: python ${ref.frame_dim} vs js ${FRAME_DIM}`);
}

const proprio = new ProprioHistory();
const ring = new DepthRing(ref.frame_offsets, ref.frame_dim);

const TOL = 1e-6;
let worst = { name: '', err: 0, tick: -1, index: -1 };
let checked = 0;

const compare = (name, tick, got, want) => {
  if (got.length !== want.length) {
    throw new Error(`tick ${tick} ${name}: length ${got.length} != ${want.length}`);
  }
  for (let i = 0; i < want.length; i++) {
    const err = Math.abs(got[i] - want[i]);
    if (err > worst.err) worst = { name, err, tick, index: i };
    checked++;
  }
};

for (let t = 0; t < ref.ticks.length; t++) {
  const { in: inp, out } = ref.ticks[t];

  const norm = normalizeDepthMetres(Float32Array.from(inp.depth_m));
  compare('depth_norm', t, norm, out.depth_norm);

  const stacked = ring.push(norm);
  compare('stacked', t, stacked, out.stacked);

  proprio.append([
    Float32Array.from(inp.ang_vel),
    Float32Array.from(inp.proj_grav),
    Float32Array.from(inp.command),
    Float32Array.from(inp.joint_pos_rel),
    Float32Array.from(inp.joint_vel_rel),
    Float32Array.from(inp.last_action),
  ]);
  const p = proprio.vector();
  compare('proprio', t, p, out.proprio);

  compare('obs', t, assembleObs(p, stacked), out.obs);
}

if (worst.err > TOL) {
  console.error(
    `FAIL: max abs error ${worst.err.toExponential(3)} in ${worst.name} ` +
      `at tick ${worst.tick} index ${worst.index} (tolerance ${TOL})`
  );
  process.exit(1);
}
console.log(
  `PASS: ${checked} values across ${ref.ticks.length} ticks match the deploy ` +
    `Python reference (max abs error ${worst.err.toExponential(3)})`
);
