/**
 * Prove src/mlp.js matches onnxruntime-web, element-wise, on both policies.
 *
 * Dropping ORT from the browser bundle (~13 MB of WASM to evaluate a 4-layer MLP)
 * is only safe if the hand-written forward pass is bit-close to the runtime that
 * produced every previously validated rollout. So the .onnx files stay in the
 * repo as the reference implementation and this script is the contract between
 * them: hundreds of random observations at several scales through both paths, and
 * a hard failure if any action component drifts by more than TOL.
 *
 * Run after tools/gen_weights.mjs. Both this and that must pass before trusting
 * src/mlp.js in the demo.
 *
 * Usage: node tools/verify_mlp.mjs
 */

import * as ort from 'onnxruntime-web';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { createMlp } from '../src/mlp.js';

const HERE = dirname(fileURLToPath(import.meta.url));
// The .onnx checkpoints stay in the repo (they are not published); only the
// extracted weights live under public/.
const CKPT_DIR = resolve(HERE, '../../deploy/ckpts');
const POLICY_DIR = resolve(HERE, '../public/policy');

const MODELS = [
  { name: 'dodge', onnx: 'dodge_link_cbf.onnx' },
  { name: 'walk', onnx: 'walk_policy.onnx' },
];

const N_RANDOM = 200;
const N_TIMED = 200;
const N_WARMUP = 20;
const TOL = 1e-4;
// Relative error is meaningless as a pass criterion on near-zero components, so
// it is reported over the elements above this magnitude only; TOL covers the rest.
const REL_FLOOR = 1e-3;

// Same single-threaded WASM config the browser is stuck with (GitHub Pages sends
// no COOP/COEP, so SharedArrayBuffer is unavailable and threads cannot start).
ort.env.wasm.numThreads = 1;
ort.env.logLevel = 'error';

/** Deterministic RNG so a failure is reproducible. */
function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makeCases(dim, rand) {
  const cases = [];
  const constant = (v) => Float32Array.from({ length: dim }, () => v);
  cases.push(constant(0), constant(1), constant(-1), constant(5));
  for (let n = 0; n < N_RANDOM; n++) {
    // Mixed scales: the normalizer and ELU are both scale-sensitive, and the real
    // depth channels are far from unit variance.
    const sigma = n % 2 === 0 ? 1 : 3;
    const v = new Float32Array(dim);
    for (let i = 0; i < dim; i++) {
      const u1 = Math.max(rand(), 1e-12);
      const u2 = rand();
      v[i] = sigma * Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    }
    cases.push(v);
  }
  return cases;
}

let failed = false;

for (const { name, onnx } of MODELS) {
  const onnxPath = resolve(CKPT_DIR, onnx);
  const manifestPath = resolve(POLICY_DIR, `${name}.weights.json`);
  const binPath = resolve(POLICY_DIR, `${name}.weights.bin`);

  const session = await ort.InferenceSession.create(new Uint8Array(readFileSync(onnxPath)), {
    executionProviders: ['wasm'],
    graphOptimizationLevel: 'all',
  });
  const inputName = session.inputNames[0];
  const outputName = session.outputNames[0];

  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  const binBuf = readFileSync(binPath);
  // readFileSync hands back a Buffer over a shared pool; slice out just this
  // file's bytes so the manifest offsets are relative to byte 0.
  const mlp = createMlp(
    manifest,
    binBuf.buffer.slice(binBuf.byteOffset, binBuf.byteOffset + binBuf.byteLength)
  );

  const tensor = new ort.Tensor('float32', new Float32Array(mlp.inputDim), [1, mlp.inputDim]);
  const runOrt = async (obs) => {
    tensor.data.set(obs);
    const out = await session.run({ [inputName]: tensor });
    return out[outputName].data;
  };

  // The extracted dims must agree with what the graph itself declares.
  const declared = await runOrt(new Float32Array(mlp.inputDim));
  if (declared.length !== mlp.outputDim) {
    throw new Error(`${name}: ORT emits ${declared.length} actions, manifest says ${mlp.outputDim}`);
  }

  const cases = makeCases(mlp.inputDim, mulberry32(0x5eed));
  let maxAbs = 0;
  let maxRel = 0;
  let worst = null;

  for (let c = 0; c < cases.length; c++) {
    const ref = await runOrt(cases[c]);
    const got = mlp.run(cases[c]);
    if (got.length !== ref.length) throw new Error(`${name}: JS emitted ${got.length} vs ORT ${ref.length}`);
    for (let i = 0; i < ref.length; i++) {
      if (!Number.isFinite(got[i])) throw new Error(`${name}: JS produced ${got[i]} at case ${c}, action ${i}`);
      const abs = Math.abs(got[i] - ref[i]);
      if (abs > maxAbs) {
        maxAbs = abs;
        worst = { c, i, ref: ref[i], got: got[i] };
      }
      if (Math.abs(ref[i]) > REL_FLOOR) maxRel = Math.max(maxRel, abs / Math.abs(ref[i]));
    }
  }

  // Timing on one representative observation; both paths are shape-invariant.
  const probe = cases[cases.length - 1];
  for (let n = 0; n < N_WARMUP; n++) {
    await runOrt(probe);
    mlp.run(probe);
  }
  let t0 = performance.now();
  for (let n = 0; n < N_TIMED; n++) await runOrt(probe);
  const msOrt = (performance.now() - t0) / N_TIMED;
  t0 = performance.now();
  for (let n = 0; n < N_TIMED; n++) mlp.run(probe);
  const msJs = (performance.now() - t0) / N_TIMED;

  const pass = maxAbs < TOL;
  failed ||= !pass;

  const shapes = manifest.tensors
    .filter((t) => t.role === 'weight')
    .map((t) => t.shape[1])
    .concat(manifest.outputDim)
    .join('->');
  console.log(`${name}: ${shapes}  (${cases.length} cases x ${manifest.outputDim} actions)`);
  console.log(`  max abs diff ${maxAbs.toExponential(3)}   max rel diff ${maxRel.toExponential(3)} (over |ref| > ${REL_FLOOR})`);
  console.log(`  worst element: ORT ${worst.ref} vs JS ${worst.got}  (case ${worst.c}, action ${worst.i})`);
  console.log(`  ms/inference: ORT ${msOrt.toFixed(4)}   JS ${msJs.toFixed(4)}   (${(msOrt / msJs).toFixed(2)}x)`);
  console.log(`  ${pass ? 'PASS' : `FAIL (tolerance ${TOL})`}\n`);
}

console.log(failed ? 'FAILED' : `all models match ORT within ${TOL}`);
// Explicit exit: ORT's WASM module keeps handles alive that would otherwise hang
// the process after the last await.
process.exit(failed ? 1 : 0);
