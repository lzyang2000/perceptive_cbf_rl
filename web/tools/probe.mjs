/** Probe the MuJoCo WASM API shape and verify the generated model compiles. */
import load_mujoco from '@mujoco/mujoco';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const XML = readFileSync(resolve(HERE, '../public/model/g1_dodge.xml'), 'utf8');

const mj = await load_mujoco();
console.log('loaded mujoco wasm');

mj.FS.mkdirTree('/work');
mj.FS.writeFile('/work/g1_dodge.xml', XML);

let model;
try {
  model = mj.MjModel.mj_loadXML('/work/g1_dodge.xml');
} catch (e) {
  console.error('LOAD FAILED:', e?.message ?? e);
  if (typeof e === 'number') console.error('  (embind exception ptr; message unavailable)');
  process.exit(1);
}
console.log('model compiled OK');

for (const k of ['nq', 'nv', 'nu', 'nbody', 'njnt', 'ngeom', 'ncam', 'nsensor', 'nmesh']) {
  console.log(`  ${k} =`, model[k]);
}

const data = new mj.MjData(model);
console.log('data created');

const probe = (obj, name, field) => {
  const v = obj[field];
  console.log(
    `  ${name}.${field}: ctor=${v?.constructor?.name} len=${v?.length} ` +
      `keys=${v && typeof v === 'object' ? Object.keys(v).slice(0, 6).join(',') : ''}`
  );
  return v;
};

console.log('--- data array shapes ---');
const qpos = probe(data, 'data', 'qpos');
probe(data, 'data', 'qvel');
probe(data, 'data', 'ctrl');
probe(data, 'data', 'sensordata');
probe(data, 'data', 'cam_xpos');
probe(data, 'data', 'cam_xmat');
probe(data, 'data', 'xpos');
console.log('--- model array shapes ---');
probe(model, 'model', 'jnt_qposadr');
probe(model, 'model', 'jnt_dofadr');
probe(model, 'model', 'geom_size');
probe(model, 'model', 'body_pos');

// Writability of qpos (needed to set the reset pose and throw the ball).
console.log('--- writability ---');
const before = qpos[2];
try {
  qpos[2] = 1.234;
  console.log(`  qpos[2] write: ${before} -> ${qpos[2]} (${qpos[2] === 1.234 ? 'WRITABLE' : 'NOT writable'})`);
} catch (e) {
  console.log('  qpos write threw:', e?.message ?? e);
}
if (typeof data.setQpos === 'function') console.log('  data.setQpos exists');

// Name lookup.
console.log('--- name lookup ---');
const mjOBJ = mj.mjtObj;
console.log('  mjtObj keys:', Object.keys(mjOBJ ?? {}).slice(0, 12).join(','));
try {
  const jid = mj.mj_name2id(model, mjOBJ.mjOBJ_JOINT.value, 'left_knee_joint');
  console.log('  mj_name2id(joint left_knee_joint) =', jid);
} catch (e) {
  console.log('  mj_name2id threw:', e?.message ?? e);
}

// Step it and see whether it is stable under gravity with no control.
console.log('--- stepping ---');
mj.mj_resetData(model, data);
mj.mj_forward(model, data);
const t0 = performance.now();
for (let i = 0; i < 400; i++) mj.mj_step(model, data);
const dtms = performance.now() - t0;
console.log(`  400 steps in ${dtms.toFixed(1)} ms (${(dtms / 400).toFixed(3)} ms/step)`);
console.log(`  time=${data.time.toFixed(3)} pelvis z=${data.qpos[2].toFixed(4)}`);
console.log(`  sensordata[0..7]=`, Array.from(data.sensordata).slice(0, 7).map((v) => v.toFixed(3)).join(' '));
