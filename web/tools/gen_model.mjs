/**
 * Generate the browser MuJoCo model + the JS mirror of the deploy constants.
 *
 * Two outputs, both derived from in-repo sources so the browser demo cannot
 * silently drift from what was trained/deployed:
 *
 *   public/model/g1_dodge.xml   <- src/assets/robots/unitree_g1/xmls/g1.xml
 *   src/generated/constants.js  <- deploy/common/g1_deploy_constants.py
 *
 * The physics model is g1.xml with every VISUAL mesh geom stripped. All 30
 * bodies carry explicit <inertial>, and collision geometry is capsules/spheres
 * only, so dropping the 33 MB of STL costs the simulation nothing -- three.js
 * draws the robot separately. What this script ADDS is everything mjlab applied
 * programmatically at build time (and which therefore is not in the XML):
 *
 *   - <option>          timestep 0.005, iterations 10, ls_iterations 20
 *                       (amp_env_cfg.py SimulationCfg/MujocoCfg)
 *   - joint armature    per-joint reflected inertia (see ARMATURE below)
 *   - <position> actuators  kp=KP, kv=KD, forcerange=+/-effort_limit
 *                       (g1_constants.py G1_ARTICULATION)
 *   - collision condim  FULL_COLLISION: 1 for self, 3 + friction 0.6 for feet
 *   - floor + ball      the dodge scene (assets/objects/ball.py)
 *
 * NOT applied, deliberately: joint damping and frictionloss stay 0. get_spec()
 * loads g1.xml, NOT scene_g1.xml, so that file's
 * <joint damping="0.05" armature="0.01" frictionloss="0.2"/> default never
 * reaches the trained model; all joint damping comes from the actuator kv.
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const WEB = resolve(HERE, '..');
const REPO = resolve(WEB, '..');

const G1_XML = resolve(REPO, 'src/assets/robots/unitree_g1/xmls/g1.xml');
const DEPLOY_PY = resolve(REPO, 'deploy/common/g1_deploy_constants.py');
const OUT_XML = resolve(WEB, 'public/model/g1_dodge.xml');
const OUT_JS = resolve(WEB, 'src/generated/constants.js');
const OUT_VISUALS = resolve(WEB, 'public/model/visuals.json');

// mjlab actuator gains are stiffness = armature * w^2, damping = 2*zeta*armature*w
// with w = 2*pi*10 Hz and zeta = 2 (g1_constants.py). So the reflected inertia
// that mjlab writes onto each joint is recoverable exactly from the baked KP,
// and the effort limit from ACTION_SCALE = 0.25 * effort / stiffness.
const NATURAL_FREQ = 10 * 2.0 * 3.1415926535;

// ---------------------------------------------------------------------------
// Parse the baked deploy constants (the frozen, hardware-validated bridge).
// ---------------------------------------------------------------------------
function parsePyArray(src, name) {
  const m = new RegExp(`^${name}\\s*=\\s*np\\.array\\(\\[([^\\]]*)\\]`, 'ms').exec(src);
  if (!m) throw new Error(`could not parse ${name} from ${DEPLOY_PY}`);
  const nums = m[1]
    .split(',')
    .map((s) => s.replace(/#.*$/gm, '').trim())
    .filter((s) => s.length > 0)
    .map(Number);
  if (nums.some(Number.isNaN)) throw new Error(`non-numeric entry in ${name}`);
  return nums;
}

function parsePyScalar(src, name) {
  const m = new RegExp(`^${name}\\s*=\\s*([-\\d.eE+]+)`, 'm').exec(src);
  if (!m) throw new Error(`could not parse scalar ${name}`);
  return Number(m[1]);
}

function parsePyJointNames(src) {
  const m = /^POLICY_JOINT_NAMES\s*=\s*\[([\s\S]*?)\]/m.exec(src);
  if (!m) throw new Error('could not parse POLICY_JOINT_NAMES');
  return [...m[1].matchAll(/"([^"]+)"/g)].map((x) => x[1]);
}

const py = readFileSync(DEPLOY_PY, 'utf8');
const JOINTS = parsePyJointNames(py);
const DEFAULT_POS = parsePyArray(py, 'DEFAULT_POS');
const KP = parsePyArray(py, 'KP');
const KD = parsePyArray(py, 'KD');
const ACTION_SCALE = parsePyArray(py, 'ACTION_SCALE');
const DEPTH_H = parsePyScalar(py, 'DEPTH_H');
const DEPTH_W = parsePyScalar(py, 'DEPTH_W');
const DEPTH_NEAR = parsePyScalar(py, 'DEPTH_NEAR');
const DEPTH_FAR = parsePyScalar(py, 'DEPTH_FAR');
const FOVY_DEG = parsePyScalar(py, 'HEAD_CAMERA_FOVY_DEG');

const N = JOINTS.length;
for (const [name, arr] of Object.entries({ DEFAULT_POS, KP, KD, ACTION_SCALE })) {
  if (arr.length !== N) throw new Error(`${name} has ${arr.length} entries, expected ${N}`);
}

const ARMATURE = KP.map((kp) => kp / (NATURAL_FREQ * NATURAL_FREQ));
const EFFORT = KP.map((kp, i) => 4.0 * ACTION_SCALE[i] * kp);

// Sanity: KD must be the 2*zeta*armature*w that produced it (zeta = 2).
KD.forEach((kd, i) => {
  const expect = 4.0 * ARMATURE[i] * NATURAL_FREQ;
  if (Math.abs(kd - expect) > 1e-9 * Math.max(1, Math.abs(kd))) {
    throw new Error(
      `KD[${i}]=${kd} is not 2*zeta*armature*w (${expect}) for joint ${JOINTS[i]}. ` +
        'The gain formula in g1_constants.py changed -- update this script.'
    );
  }
});

// ---------------------------------------------------------------------------
// Transform g1.xml -> the browser physics model.
// ---------------------------------------------------------------------------
const src = readFileSync(G1_XML, 'utf8');
const lines = src.split('\n');
const out = [];
let strippedVisual = 0;
let strippedMesh = 0;
let armed = 0;

// Stripping the visual geoms would also throw away WHERE each mesh hangs in the
// kinematic tree, which the renderer needs. Capture it on the way out.
const bodyStack = [];
const visuals = [];
const meshFiles = {};
const MATERIALS = { silver: [0.7, 0.7, 0.7, 1], black: [0.2, 0.2, 0.2, 1] };
const nums = (s) => s.trim().split(/\s+/).map(Number);

for (let raw of lines) {
  const line = raw;
  const t = line.trim();

  const bodyOpen = /^<body\s[^>]*name="([^"]+)"/.exec(t);
  if (bodyOpen) bodyStack.push(bodyOpen[1]);
  if (/^<\/body>/.test(t)) bodyStack.pop();

  // Drop mesh assets and every visual geom: three.js owns the appearance.
  const meshDecl = /^<mesh\s+name="([^"]+)"\s+file="([^"]+)"/.exec(t);
  if (meshDecl) {
    meshFiles[meshDecl[1]] = meshDecl[2];
    strippedMesh++;
    continue;
  }
  if (/^<geom\s[^>]*class="visual"/.test(t)) {
    const mesh = /mesh="([^"]+)"/.exec(t)?.[1];
    const material = /material="([^"]+)"/.exec(t)?.[1] ?? 'silver';
    const pos = /pos="([^"]+)"/.exec(t)?.[1];
    const quat = /quat="([^"]+)"/.exec(t)?.[1];
    if (!mesh) throw new Error(`visual geom without a mesh: ${t}`);
    visuals.push({
      body: bodyStack[bodyStack.length - 1],
      mesh,
      rgba: MATERIALS[material] ?? MATERIALS.silver,
      pos: pos ? nums(pos) : [0, 0, 0],
      quat: quat ? nums(quat) : [1, 0, 0, 0], // MuJoCo order (w, x, y, z)
    });
    strippedVisual++;
    continue;
  }
  // The visual default class now has no users (and names a mesh type with no
  // meshes loaded); drop it so the compiler never has to resolve it.
  if (/^<default class="visual">$/.test(t)) {
    // Skip this element and its single child <geom .../> plus the closing tag.
    // Handled by the state machine below instead of here.
  }

  // FULL_COLLISION: self-collision contacts are condim 1, feet are condim 3
  // with slide friction 0.6. The XML default says condim 6 for everything.
  if (/^<geom type="capsule" priority="1" condim="6" group="3"\/>$/.test(t)) {
    out.push(line.replace('condim="6"', 'condim="1"'));
    continue;
  }
  if (/^<geom size="0\.01"\/>$/.test(t) && /foot/.test(out[out.length - 1] ?? '')) {
    out.push(line.replace('/>', ' condim="3" friction="0.6 0.005 0.0001"/>'));
    continue;
  }

  // Give every actuated joint its reflected inertia. Joints appear as
  //   <joint name="X" axis="..." range="..."/>
  const jm = /^<joint name="([^"]+)"/.exec(t);
  if (jm) {
    const idx = JOINTS.indexOf(jm[1]);
    if (idx >= 0) {
      out.push(line.replace('/>', ` armature="${ARMATURE[idx].toPrecision(10)}"/>`));
      armed++;
      continue;
    }
  }

  out.push(line);
}

let xml = out.join('\n');

// Remove the now-unused visual default class (element + its child geom).
xml = xml.replace(
  /\s*<default class="visual">\s*<geom[^>]*\/>\s*<\/default>/,
  ''
);

if (strippedMesh === 0 || strippedVisual === 0) {
  throw new Error(
    `expected to strip mesh assets and visual geoms, got mesh=${strippedMesh} visual=${strippedVisual}`
  );
}
if (armed !== N) {
  throw new Error(`armature applied to ${armed} joints, expected ${N}`);
}

// meshdir no longer means anything without meshes.
xml = xml.replace(/ meshdir="assets"/, '');

// Simulation options (amp_env_cfg.py). implicitfast integrates the actuator's
// kv damping implicitly, which is what mjlab's builtin position actuators rely
// on for stability at these gains.
const OPTION = `  <option timestep="0.005" iterations="10" ls_iterations="20" integrator="implicitfast"/>\n`;
xml = xml.replace(/(<compiler[^>]*\/>\n)/, `$1\n${OPTION}`);

// Floor + a visible ground grid, and the thrown ball (assets/objects/ball.py:
// radius 0.0762 m, mass 0.136 kg, freejoint, collides with robot and terrain).
const SCENE_ASSETS = `
    <texture name="grid" type="2d" builtin="checker" rgb1="0.18 0.20 0.23" rgb2="0.23 0.25 0.29"
             width="512" height="512"/>
    <material name="grid" texture="grid" texrepeat="8 8" texuniform="true" reflectance="0.05"/>
`;
xml = xml.replace(/(<material name="black"[^>]*\/>\n)/, `$1${SCENE_ASSETS}`);

const WORLD_PREFIX = `    <geom name="floor" type="plane" size="0 0 0.05" material="grid"/>
    <light pos="0 0 4" dir="0 0 -1" directional="true"/>
`;
xml = xml.replace(/(<worldbody>\n)/, `$1${WORLD_PREFIX}`);

const BALL = `
    <body name="ball" pos="3 0 1.5">
      <freejoint name="ball_free"/>
      <geom name="ball_collision" type="sphere" size="0.0762" mass="0.136" rgba="0.9 0.2 0.2 1"/>
    </body>
`;
xml = xml.replace(/(\n\s*<\/worldbody>)/, `${BALL}$1`);

// Builtin position actuators: force = kp*(target - q) - kv*qdot, clamped to the
// motor's effort limit. Exactly the PD the deploy hardware_node runs.
const acts = JOINTS.map(
  (j, i) =>
    `    <position name="${j}" joint="${j}" kp="${KP[i].toPrecision(10)}" ` +
    `kv="${KD[i].toPrecision(10)}" forcerange="${-EFFORT[i]} ${EFFORT[i]}"/>`
).join('\n');
xml = xml.replace(/(\n<\/mujoco>)/, `\n  <actuator>\n${acts}\n  </actuator>\n$1`);

// The deploy State datagram carries base angular velocity + base orientation.
// g1.xml already provides the gyro at the pelvis IMU site (`imu_ang_vel`, which
// is the angular velocity in base frame -- the same signal the real IMU gives);
// only the orientation quaternion needs adding. Projected gravity is derived
// from it in JS, exactly as the hardware node does.
xml = xml.replace(
  /(\n\s*<subtreeangmom name="root_angmom" body="pelvis"\/>)/,
  `$1\n    <framequat name="base_quat" objtype="body" objname="pelvis"/>`
);
if (!xml.includes('base_quat')) {
  throw new Error('failed to add the base_quat sensor -- g1.xml sensor block changed');
}

xml = xml.replace('<mujoco model="g1_29dof_rev_1_0">', '<mujoco model="g1_dodge_browser">');

mkdirSync(dirname(OUT_XML), { recursive: true });
writeFileSync(OUT_XML, xml);

if (visuals.some((v) => !v.body)) throw new Error('a visual geom resolved to no parent body');
writeFileSync(
  OUT_VISUALS,
  JSON.stringify({ meshFiles, visuals }, null, 2)
);

// ---------------------------------------------------------------------------
// JS mirror of the deploy constants.
// ---------------------------------------------------------------------------
const f = (arr) => `[\n  ${arr.map((v) => String(v)).join(',\n  ')},\n]`;

const js = `// GENERATED by web/tools/gen_model.mjs from deploy/common/g1_deploy_constants.py.
// Do not edit. Run \`npm run gen\`; \`npm run check-constants\` asserts no drift.

export const POLICY_JOINT_NAMES = ${JSON.stringify(JOINTS, null, 2)};
export const NUM_JOINTS = ${N};

/** KNEES_BENT rest pose, in POLICY_JOINT_NAMES order (rad). */
export const DEFAULT_POS = Float32Array.from(${f(DEFAULT_POS)});
/** Actuator stiffness = PD position gain. */
export const KP = Float32Array.from(${f(KP)});
/** Actuator damping = PD velocity gain. */
export const KD = Float32Array.from(${f(KD)});
/** target = DEFAULT_POS + action * ACTION_SCALE. */
export const ACTION_SCALE = Float32Array.from(${f(ACTION_SCALE)});
/** Per-joint reflected inertia mjlab writes onto the joint (= KP / (2*pi*10)^2). */
export const ARMATURE = Float32Array.from(${f(ARMATURE)});
/** Motor effort limit (N*m) = 4 * ACTION_SCALE * KP. */
export const EFFORT_LIMIT = Float32Array.from(${f(EFFORT)});

export const DEPTH_H = ${DEPTH_H};
export const DEPTH_W = ${DEPTH_W};
export const DEPTH_NEAR = ${DEPTH_NEAR};
export const DEPTH_FAR = ${DEPTH_FAR};
/** Depth frame-stack offsets (control steps ago). MUST match the checkpoint. */
export const FRAME_OFFSETS = [0, 3, 8, 18];
export const HEAD_CAMERA_FOVY_DEG = ${FOVY_DEG};
export const HEAD_CAMERA_NAME = 'head_camera_single';

/** Control-loop rate: sim timestep 0.005 * decimation 4 = 50 Hz. */
export const SIM_TIMESTEP = 0.005;
export const DECIMATION = 4;
export const CONTROL_DT = SIM_TIMESTEP * DECIMATION;

/** 4-frame term-major proprio history -> 384. Order MUST match amp_env_cfg.py. */
export const PROPRIO_HISTORY = 4;
export const PROPRIO_DIM = 384;
export const TERM_ORDER = [
  ['base_ang_vel', 3],
  ['projected_gravity', 3],
  ['command', 3],
  ['joint_pos', ${N}],
  ['joint_vel', ${N}],
  ['actions', ${N}],
];

/** Ball (src/assets/objects/ball.py). */
export const BALL_RADIUS = 0.0762;
export const BALL_MASS = 0.136;
`;

mkdirSync(dirname(OUT_JS), { recursive: true });
writeFileSync(OUT_JS, js);

console.log(`wrote ${OUT_XML}`);
console.log(
  `  stripped ${strippedMesh} mesh assets, ${strippedVisual} visual geoms; ` +
    `armature on ${armed} joints; ${N} position actuators`
);
console.log(`wrote ${OUT_JS}`);
console.log(`wrote ${OUT_VISUALS} (${visuals.length} visual geoms on ${
  new Set(visuals.map((v) => v.body)).size
} bodies)`);
