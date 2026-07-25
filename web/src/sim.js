/**
 * MuJoCo WASM wrapper: model loading, index maps, state extraction, ball throws.
 *
 * Everything is looked up BY NAME and cached as an index map. Joint order in
 * particular is never assumed to match POLICY_JOINT_NAMES -- it is resolved via
 * mj_name2id, the same check deploy/sim/sim_node.py asserts at startup ("the
 * single most likely silent deploy bug").
 */

import {
  POLICY_JOINT_NAMES,
  NUM_JOINTS,
  DEFAULT_POS,
  DECIMATION,
  HEAD_CAMERA_NAME,
} from './generated/constants.js';
import { projectedGravity } from './mathutil.js';

const ROBOT_ROOT_JOINT = 'floating_base_joint';
const BALL_ROOT_JOINT = 'ball_free';
const BALL_GEOM = 'ball_collision';
const GYRO_SENSOR = 'imu_ang_vel';
const QUAT_SENSOR = 'base_quat';
/** Pelvis height of the KNEES_BENT reset pose (g1_constants.py). */
export const RESET_HEIGHT = 0.78;

export class Sim {
  /**
   * @param mj    the resolved MuJoCo WASM module
   * @param xml   model XML text
   */
  constructor(mj, xml) {
    this.mj = mj;
    mj.FS.mkdirTree('/work');
    mj.FS.writeFile('/work/scene.xml', xml);
    this.model = mj.MjModel.mj_loadXML('/work/scene.xml');
    this.data = new mj.MjData(this.model);

    const OBJ = mj.mjtObj;
    const id = (type, name) => {
      const i = mj.mj_name2id(this.model, type.value, name);
      if (i < 0) throw new Error(`model has no ${name}`);
      return i;
    };

    // Joint index maps, resolved by name (never positional).
    this.jointQposAdr = new Int32Array(NUM_JOINTS);
    this.jointDofAdr = new Int32Array(NUM_JOINTS);
    POLICY_JOINT_NAMES.forEach((name, i) => {
      const j = id(OBJ.mjOBJ_JOINT, name);
      this.jointQposAdr[i] = this.model.jnt_qposadr[j];
      this.jointDofAdr[i] = this.model.jnt_dofadr[j];
    });

    const rootJnt = id(OBJ.mjOBJ_JOINT, ROBOT_ROOT_JOINT);
    this.rootQposAdr = this.model.jnt_qposadr[rootJnt];
    this.rootDofAdr = this.model.jnt_dofadr[rootJnt];

    const ballJnt = id(OBJ.mjOBJ_JOINT, BALL_ROOT_JOINT);
    this.ballQposAdr = this.model.jnt_qposadr[ballJnt];
    this.ballDofAdr = this.model.jnt_dofadr[ballJnt];

    this.ballGeomId = id(OBJ.mjOBJ_GEOM, BALL_GEOM);
    this.ballRadius = this.model.geom_size[3 * this.ballGeomId];

    this.camId = id(OBJ.mjOBJ_CAMERA, HEAD_CAMERA_NAME);
    this.pelvisBodyId = id(OBJ.mjOBJ_BODY, 'pelvis');

    this.gyroAdr = this.model.sensor_adr[id(OBJ.mjOBJ_SENSOR, GYRO_SENSOR)];
    this.quatAdr = this.model.sensor_adr[id(OBJ.mjOBJ_SENSOR, QUAT_SENSOR)];

    // Reusable output buffers.
    this.q = new Float32Array(NUM_JOINTS);
    this.dq = new Float32Array(NUM_JOINTS);
    this.angVel = new Float32Array(3);
    this.baseQuat = new Float32Array(4);
    this.projGrav = new Float32Array(3);
    this.camPos = new Float32Array(3);
    this.camMat = new Float32Array(9);
    this.ballPos = new Float32Array(3);
    this.ballVel = new Float32Array(3);
    this.rootPos = new Float32Array(3);
    this.rootVel = new Float32Array(3);

    this.stepId = 0;
    this.reset();
  }

  /** Reset to the KNEES_BENT stand with the ball parked out of view. */
  reset() {
    const { mj, model, data } = this;
    mj.mj_resetData(model, data);
    const qpos = data.qpos;
    qpos[this.rootQposAdr + 0] = 0;
    qpos[this.rootQposAdr + 1] = 0;
    qpos[this.rootQposAdr + 2] = RESET_HEIGHT;
    qpos[this.rootQposAdr + 3] = 1;
    qpos[this.rootQposAdr + 4] = 0;
    qpos[this.rootQposAdr + 5] = 0;
    qpos[this.rootQposAdr + 6] = 0;
    for (let i = 0; i < NUM_JOINTS; i++) {
      qpos[this.jointQposAdr[i]] = DEFAULT_POS[i];
      data.ctrl[i] = DEFAULT_POS[i];
    }
    this.parkBall();
    mj.mj_forward(model, data);
    this.stepId = 0;
  }

  /** Move the ball far away and freeze it (no active threat). */
  parkBall() {
    const { qpos, qvel } = this.data;
    qpos[this.ballQposAdr + 0] = 50;
    qpos[this.ballQposAdr + 1] = 0;
    qpos[this.ballQposAdr + 2] = this.ballRadius;
    qpos[this.ballQposAdr + 3] = 1;
    qpos[this.ballQposAdr + 4] = 0;
    qpos[this.ballQposAdr + 5] = 0;
    qpos[this.ballQposAdr + 6] = 0;
    for (let i = 0; i < 6; i++) qvel[this.ballDofAdr + i] = 0;
  }

  /**
   * Resize the ball. Training randomises the radius per episode over
   * 7.5-12.5 cm (dodge_env_cfgs.py `randomize_ball_size`), which is part of how
   * the policy learned to judge range from apparent size; mass stays fixed, as
   * in ball.py. Writing geom_size is safe for a sphere -- there is no collision
   * mesh or BVH to rebuild.
   */
  setBallRadius(r) {
    this.model.geom_size[3 * this.ballGeomId] = r;
    this.ballRadius = r;
  }

  /** Place the ball at `pos` with linear velocity `vel` (a thrown ball). */
  throwBall(pos, vel) {
    const { qpos, qvel } = this.data;
    qpos[this.ballQposAdr + 0] = pos[0];
    qpos[this.ballQposAdr + 1] = pos[1];
    qpos[this.ballQposAdr + 2] = pos[2];
    qpos[this.ballQposAdr + 3] = 1;
    qpos[this.ballQposAdr + 4] = 0;
    qpos[this.ballQposAdr + 5] = 0;
    qpos[this.ballQposAdr + 6] = 0;
    qvel[this.ballDofAdr + 0] = vel[0];
    qvel[this.ballDofAdr + 1] = vel[1];
    qvel[this.ballDofAdr + 2] = vel[2];
    qvel[this.ballDofAdr + 3] = 0;
    qvel[this.ballDofAdr + 4] = 0;
    qvel[this.ballDofAdr + 5] = 0;
  }

  /** Write joint position targets (the PD setpoints the policy produced). */
  setTargets(targets) {
    const ctrl = this.data.ctrl;
    for (let i = 0; i < NUM_JOINTS; i++) ctrl[i] = targets[i];
  }

  /** Advance one control step (DECIMATION physics steps). */
  step() {
    const { mj, model, data } = this;
    for (let i = 0; i < DECIMATION; i++) mj.mj_step(model, data);
    this.stepId++;
  }

  /** Refresh the cached state views from MjData. */
  readState() {
    const { data } = this;
    const { qpos, qvel, sensordata } = data;

    for (let i = 0; i < 3; i++) this.angVel[i] = sensordata[this.gyroAdr + i];
    for (let i = 0; i < 4; i++) this.baseQuat[i] = sensordata[this.quatAdr + i];
    projectedGravity(this.baseQuat, this.projGrav);

    for (let i = 0; i < NUM_JOINTS; i++) {
      this.q[i] = qpos[this.jointQposAdr[i]];
      this.dq[i] = qvel[this.jointDofAdr[i]];
    }
    for (let i = 0; i < 3; i++) {
      this.rootPos[i] = qpos[this.rootQposAdr + i];
      this.rootVel[i] = qvel[this.rootDofAdr + i];
      this.ballPos[i] = qpos[this.ballQposAdr + i];
      this.ballVel[i] = qvel[this.ballDofAdr + i];
      this.camPos[i] = data.cam_xpos[3 * this.camId + i];
    }
    for (let i = 0; i < 9; i++) this.camMat[i] = data.cam_xmat[9 * this.camId + i];
    return this;
  }

  /** True once the robot has clearly fallen (used to auto-reset the demo). */
  hasFallen() {
    return this.rootPos[2] < 0.4 || this.projGrav[2] > -0.4;
  }

  /** MuJoCo body id for a name, or -1. */
  bodyId(name) {
    return this.mj.mj_name2id(this.model, this.mj.mjtObj.mjOBJ_BODY.value, name);
  }

  /** A geom's pose within its parent body (MuJoCo quat order). */
  geomLocalPose(geomId) {
    const m = this.model;
    return {
      pos: [m.geom_pos[3 * geomId], m.geom_pos[3 * geomId + 1], m.geom_pos[3 * geomId + 2]],
      quat: [
        m.geom_quat[4 * geomId],
        m.geom_quat[4 * geomId + 1],
        m.geom_quat[4 * geomId + 2],
        m.geom_quat[4 * geomId + 3],
      ],
    };
  }

  /** Static geometry description for the renderer. */
  describeGeoms() {
    const { model, mj } = this;
    const OBJ = mj.mjtObj;
    const geoms = [];
    for (let g = 0; g < model.ngeom; g++) {
      geoms.push({
        id: g,
        name: mj.mj_id2name(model, OBJ.mjOBJ_GEOM.value, g) || `geom${g}`,
        type: model.geom_type[g],
        bodyId: model.geom_bodyid[g],
        size: [model.geom_size[3 * g], model.geom_size[3 * g + 1], model.geom_size[3 * g + 2]],
        rgba: [
          model.geom_rgba[4 * g],
          model.geom_rgba[4 * g + 1],
          model.geom_rgba[4 * g + 2],
          model.geom_rgba[4 * g + 3],
        ],
      });
    }
    return geoms;
  }
}

/** Load the WASM module and build a Sim. */
export async function createSim(loadMujoco, xml) {
  const mj = await loadMujoco();
  return new Sim(mj, xml);
}
