/**
 * Boot and drive the demo.
 *
 * Physics steps on a fixed 50 Hz control clock (the rate the policy was trained
 * and deployed at) accumulated against real time, so the simulation runs at true
 * speed regardless of display refresh. Rendering is decoupled and draws whatever
 * the latest MuJoCo state is.
 */

import load_mujoco from '@mujoco/mujoco';

import { Sim } from './sim.js';
import { Controller, MODE } from './controller.js';
import { loadMlp } from './mlp.js';
import { Renderer } from './render.js';
import { FRAME_DIM } from './depth.js';
import {
  CONTROL_DT,
  PROPRIO_DIM,
  FRAME_OFFSETS,
  DEPTH_W,
  DEPTH_H,
} from './generated/constants.js';

const BASE = import.meta.env.BASE_URL ?? '/';
const url = (p) => `${BASE}${p}`.replace(/\/{2,}/g, '/');
const $ = (id) => document.getElementById(id);

const boot = (msg, pct) => {
  $('bootMsg').textContent = msg;
  $('bootBar').style.width = `${pct}%`;
};

function bootError(err) {
  console.error(err);
  $('boot').innerHTML =
    `<div><div style="margin-bottom:10px">Could not start the demo.</div>` +
    `<div class="err">${String(err?.stack ?? err)}</div></div>`;
}

async function main() {
  boot('Loading MuJoCo…', 8);
  // No locateFile override: the Emscripten glue resolves the binary through
  // `new URL('mujoco.wasm', import.meta.url)`, which Vite rewrites to a hashed
  // asset under the configured base. Overriding it and shipping a second copy in
  // public/ only duplicated 10 MB.
  const mj = await load_mujoco();

  boot('Loading model…', 22);
  const [xml, visuals] = await Promise.all([
    fetch(url('model/g1_dodge.xml')).then((r) => r.text()),
    fetch(url('model/visuals.json')).then((r) => r.json()),
  ]);
  const sim = new Sim(mj, xml);

  boot('Loading policies…', 40);
  // Weights extracted from the ONNX at build time and evaluated by src/mlp.js;
  // tools/verify_mlp.mjs asserts that path matches ONNX Runtime numerically.
  const DODGE_DIM = PROPRIO_DIM + FRAME_OFFSETS.length * FRAME_DIM;
  const [dodgeMlp, walkMlp] = await Promise.all([
    loadMlp(url('policy/dodge.weights.json'), url('policy/dodge.weights.bin')),
    loadMlp(url('policy/walk.weights.json'), url('policy/walk.weights.bin')),
  ]);

  // The guard dodge_policy.py applies at startup: a frame-offset or layout
  // mismatch must fail here, not as a fall three seconds in.
  if (dodgeMlp.inputDim !== DODGE_DIM) {
    throw new Error(
      `dodge policy expects ${dodgeMlp.inputDim} inputs but the assembled obs is ` +
        `${DODGE_DIM} (proprio ${PROPRIO_DIM} + depth ${DODGE_DIM - PROPRIO_DIM}). ` +
        `Wrong FRAME_OFFSETS for this checkpoint?`
    );
  }
  if (walkMlp.inputDim !== PROPRIO_DIM) {
    throw new Error(`walk policy expects ${walkMlp.inputDim} inputs but proprio is ${PROPRIO_DIM}`);
  }

  const policies = {
    runDodge: (obs) => dodgeMlp.run(obs),
    runWalk: (obs) => walkMlp.run(obs),
  };
  const ctl = new Controller(sim, policies, { seed: (Math.random() * 1e9) | 0 });

  boot('Building scene…', 62);
  const renderer = new Renderer($('view'), sim);
  renderer.addBall();

  // Decimated visual meshes. The demo is fully functional without them, so a
  // failure here degrades to collision shapes instead of blocking startup.
  try {
    boot('Loading meshes…', 78);
    const [manifest, buf] = await Promise.all([
      fetch(url('model/robot_meshes.json')).then((r) => (r.ok ? r.json() : Promise.reject(r.status))),
      fetch(url('model/robot_meshes.bin')).then((r) =>
        r.ok ? r.arrayBuffer() : Promise.reject(r.status)
      ),
    ]);
    const n = renderer.addRobotMeshes(manifest, buf, visuals);
    console.log(`attached ${n} visual meshes`);
  } catch (e) {
    console.warn('visual meshes unavailable, drawing collision shapes instead:', e);
  }
  // Only ever shown as the fallback when the visual meshes could not be loaded;
  // there is no toggle for it.
  renderer.addCollisionPrimitives({ visible: !renderer.hasRobotMeshes });

  boot('Warming up…', 92);
  // First inference compiles the graph; do it before the clock starts so the
  // opening second is not a stutter.
  for (let i = 0; i < 5; i++) await ctl.tick(new Float32Array(3));

  // ---------------------------------------------------------------- input ----
  addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
      e.preventDefault();
      throwBall();
    } else if (e.code === 'KeyR') {
      resetAll();
    }
  });

  // The robot is never driven: the twist command stays zero, so WALK mode holds
  // an in-place stand between throws. The mode still switches under the hood --
  // auto-throw pacing keys off it -- there is just no locomotion input.
  const STAND = new Float32Array(3);

  // ---------------------------------------------------------------- stats ----
  const stats = { throws: 0, hits: 0, avoided: 0 };
  let pendingThrow = null; // the in-flight throw awaiting a hit/miss verdict
  let prevBallVel = null;

  /**
   * Auto-throw waits for the robot to be back in WALK for this long, rather than
   * running on a fixed timer. The arbiter holds DODGE for 1.2 s after the threat
   * clears, so this reads as: finish the dodge, resume walking, settle, then
   * throw again.
   */
  const AUTO_THROW_WALK_DELAY_S = 1.0;
  let walkTicks = 0; // consecutive control steps spent in WALK

  function throwBall(forceHigh) {
    if (pendingThrow) settleThrow(); // resolve the previous one first
    ctl.throwNow(forceHigh);
    prevBallVel = null;
    pendingThrow = { ticks: 0, hit: false };
    stats.throws++;
    // Close the gate immediately: the arbiter only sees the new ball on the next
    // tick, so without this a throw launched outside the threat radius could let
    // a second one fire before the mode flips to DODGE.
    walkTicks = 0;
    updateStats();
  }

  function settleThrow() {
    if (!pendingThrow) return;
    if (pendingThrow.hit) stats.hits++;
    else stats.avoided++;
    pendingThrow = null;
    updateStats();
  }

  function resetAll() {
    sim.reset();
    ctl.resetBelief();
    pendingThrow = null;
    prevBallVel = null;
    walkTicks = 0;
    stats.throws = stats.hits = stats.avoided = 0;
    renderer.pushTrail(null, false);
    updateStats();
  }

  function updateStats() {
    $('sThrows').textContent = stats.throws;
    $('sHits').textContent = stats.hits;
    $('sAvoided').textContent = stats.avoided;
  }

  // No forceHigh argument, so planThrow rolls the type itself: 50/50 between a
  // descending ball to sidestep and a low arc to duck under (highThrowFraction).
  $('btnThrow').onclick = () => throwBall();
  $('btnReset').onclick = resetAll;

  // ------------------------------------------------------------ depth view ----
  const dCanvas = $('depthCanvas');
  const dCtx = dCanvas.getContext('2d');
  const dImage = dCtx.createImageData(DEPTH_W, DEPTH_H);
  function drawDepth() {
    const f = ctl.frameBuf;
    for (let i = 0; i < FRAME_DIM; i++) {
      const v = f[i]; // 0 = near, 1 = far/empty
      const near = 1 - v;
      const o = i * 4;
      if (v > 0.999) {
        dImage.data[o] = 12;
        dImage.data[o + 1] = 16;
        dImage.data[o + 2] = 22;
      } else {
        // Warm ramp so the ball pops against the empty field.
        dImage.data[o] = Math.round(60 + 195 * near);
        dImage.data[o + 1] = Math.round(40 + 90 * near * near);
        dImage.data[o + 2] = Math.round(50 + 40 * near * near);
      }
      dImage.data[o + 3] = 255;
    }
    dCtx.putImageData(dImage, 0, 0);
  }

  // --------------------------------------------------------- visibility ----
  // The demo is embedded in the project page, where it can sit scrolled out of
  // view for as long as someone reads the paper. Stop simulating and drawing
  // when hidden: the parent page reports intersection over postMessage, and
  // document.hidden covers tab switches.
  let onScreen = true;
  addEventListener('message', (e) => {
    const msg = e.data && e.data.pacmanDemo;
    if (msg === 'pause') onScreen = false;
    else if (msg === 'resume') onScreen = true;
  });
  const idle = () => document.hidden || !onScreen;

  // ----------------------------------------------------------- main loops ----
  let acc = 0;
  let last = performance.now();
  let stepping = false;
  let physMs = 0;
  let polMs = 0;
  let frames = 0;
  let fpsT = last;

  async function stepOnce() {
    const t0 = performance.now();
    await ctl.tick(STAND);
    const dt = performance.now() - t0;
    physMs = physMs * 0.9 + dt * 0.1;

    const s = sim.readState();

    // Hit accounting: a step change in an airborne ball's velocity is contact.
    // A fresh detector per throw (prevBallVel reset at launch) matters -- the
    // launch itself is a teleport and would otherwise read as a hit.
    if (pendingThrow) {
      pendingThrow.ticks++;
      if (prevBallVel && s.ballPos[2] > 0.2 && pendingThrow.ticks < 1.2 / CONTROL_DT) {
        const dv = Math.hypot(
          s.ballVel[0] - prevBallVel[0],
          s.ballVel[1] - prevBallVel[1],
          s.ballVel[2] - prevBallVel[2]
        );
        if (dv > 1.0) pendingThrow.hit = true;
      }
      if (pendingThrow.ticks > 2.2 / CONTROL_DT) settleThrow();
    }
    prevBallVel = [s.ballVel[0], s.ballVel[1], s.ballVel[2]];

    const airborne = s.ballPos[2] > 0.15 && Math.abs(s.ballPos[0]) < 40;
    renderer.pushTrail(s.ballPos, airborne);

    if (sim.hasFallen()) {
      // Let the viewer see the fall, then recover on its own.
      if (!ctl._fallenAt) ctl._fallenAt = ctl.ticks;
      else if (ctl.ticks - ctl._fallenAt > 1.5 / CONTROL_DT) {
        ctl._fallenAt = null;
        sim.reset();
        ctl.resetBelief();
        pendingThrow = null;
      }
    } else {
      ctl._fallenAt = null;
    }

    walkTicks = ctl.mode === MODE.WALK ? walkTicks + 1 : 0;
    if (
      $('cbAuto').checked &&
      !airborne &&
      !sim.hasFallen() &&
      walkTicks >= AUTO_THROW_WALK_DELAY_S / CONTROL_DT
    ) {
      throwBall();
    }
  }

  async function frame(now) {
    requestAnimationFrame(frame);
    if (idle()) {
      // Drop the elapsed time rather than banking it, so returning does not
      // trigger a catch-up burst.
      last = now;
      acc = 0;
      return;
    }
    const dt = Math.min((now - last) / 1000, 0.25);
    last = now;
    frames++;

    // Accumulate OUTSIDE the guard: `frame` is async, so the browser can fire
    // the next rAF while a step batch is still awaiting. Adding dt only when the
    // guard is open would silently drop those frames' time and run the sim slow.
    acc += dt;
    if (!stepping) {
      stepping = true;
      // Cap catch-up so a stall cannot spiral into a long synchronous burst.
      let n = 0;
      while (acc >= CONTROL_DT && n < 3) {
        acc -= CONTROL_DT;
        n++;
        await stepOnce();
      }
      if (acc > 4 * CONTROL_DT) acc = 0;
      stepping = false;
    }

    drawDepth();
    renderer.render(true);

    if (now - fpsT > 500) {
      $('sFps').textContent = `${Math.round((frames * 1000) / (now - fpsT))} fps`;
      $('sPhys').textContent = `${physMs.toFixed(1)} ms/step`;
      // Which network is driving, by its input width: the dodge policy consumes
      // proprioception plus the stacked depth, the walk policy proprioception alone.
      $('sPolicy').textContent =
        ctl.mode === MODE.DODGE ? `${DODGE_DIM}→29` : `${PROPRIO_DIM}→29`;
      frames = 0;
      fpsT = now;
    }
  }

  boot('Ready', 100);
  $('boot').remove();
  updateStats();
  requestAnimationFrame(frame);
}

main().catch(bootError);
