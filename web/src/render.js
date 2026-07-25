/**
 * three.js rendering of the MuJoCo state.
 *
 * MuJoCo owns the physics and the transforms; this module only draws them. Each
 * MuJoCo body gets a THREE.Group whose position/quaternion is copied from
 * data.xpos/xquat every frame, and the robot's visual meshes hang off those
 * groups with the local offsets that gen_model.mjs recorded when it stripped
 * them out of the physics XML.
 *
 * The meshes are decimated (see tools/gen_meshes.mjs) because the source STL set
 * is 33 MB. If they fail to load, the scene falls back to drawing the collision
 * primitives, which is enough to see that the demo works.
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

// MuJoCo mjtGeom values we draw.
const GEOM = { PLANE: 0, SPHERE: 2, CAPSULE: 3, ELLIPSOID: 4, CYLINDER: 5, BOX: 6 };

const BG = 0xeef2f7;
const FLOOR = 0xdde4ec;

export class Renderer {
  constructor(canvas, sim) {
    this.sim = sim;
    this.canvas = canvas;

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;

    // A bright studio backdrop: the G1's own materials are dark grey and near
    // black, so against a dark scene the robot reads as a silhouette. This also
    // sits better inside the light project page.
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(BG);
    this.scene.fog = new THREE.Fog(BG, 14, 34);

    // MuJoCo is z-up; three.js defaults to y-up. Rotating the world once here
    // means every transform can be copied straight across with no per-object
    // axis juggling.
    this.world = new THREE.Group();
    this.world.rotation.x = -Math.PI / 2;
    this.scene.add(this.world);

    this.camera = new THREE.PerspectiveCamera(45, 1, 0.05, 200);
    this.camera.position.set(3.2, 1.4, 3.2);
    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.minDistance = 1.2;
    this.controls.maxDistance = 14;
    this.controls.maxPolarAngle = Math.PI / 2 - 0.02;
    this.controls.target.set(0, 0.9, 0);

    // Image-based lighting. A metallic surface shows its surroundings, so with no
    // environment set it has nothing to reflect and renders almost black no
    // matter how many lights are added -- which is what made the robot hard to
    // pick out. One generated room probe fixes it for every material at once.
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    this.scene.environmentIntensity = 0.55;
    pmrem.dispose();

    this._addLights();
    this._addGround();

    this.bodyGroups = new Map();
    this.follow = new THREE.Vector3(0, 0.9, 0);
    this.trail = null;

    this._resize();
    window.addEventListener('resize', () => this._resize());
  }

  _addLights() {
    // Sky/ground fill bright enough that the black chassis parts stay legible
    // rather than crushing to the shadow end.
    this.scene.add(new THREE.HemisphereLight(0xffffff, 0xa9b4c2, 1.5));
    const key = new THREE.DirectionalLight(0xffffff, 2.1);
    key.position.set(4, 7, 3);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    const d = 4;
    Object.assign(key.shadow.camera, { left: -d, right: d, top: d, bottom: -d, near: 0.5, far: 25 });
    key.shadow.camera.updateProjectionMatrix(); // the frustum edits above need this
    key.shadow.bias = -0.0015;
    this.scene.add(key);
    this.scene.add(key.target); // the light tracks the robot, so its target must be in the scene
    this.keyLight = key;
    // Cool counter-light from behind so the silhouette separates from the
    // backdrop instead of merging into it.
    const rim = new THREE.DirectionalLight(0xc9d8ff, 0.85);
    rim.position.set(-4, 3, -4);
    this.scene.add(rim);
  }

  _addGround() {
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(60, 60),
      new THREE.MeshStandardMaterial({ color: FLOOR, roughness: 0.92, metalness: 0 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.scene.add(floor);
    // Drawn after the floor so the lines are not z-fought away.
    const grid = new THREE.GridHelper(40, 80, 0xa8b4c2, 0xc6cfda);
    grid.position.y = 0.002;
    this.scene.add(grid);
  }

  /** Group for a MuJoCo body id, created on demand. */
  _group(bodyId) {
    let g = this.bodyGroups.get(bodyId);
    if (!g) {
      g = new THREE.Group();
      this.world.add(g);
      this.bodyGroups.set(bodyId, g);
    }
    return g;
  }

  /**
   * Attach the robot's decimated visual meshes.
   * @param manifest robot_meshes.json
   * @param buffer   robot_meshes.bin as an ArrayBuffer
   * @param visuals  visuals.json (which mesh hangs on which body, with offsets)
   */
  addRobotMeshes(manifest, buffer, visuals) {
    const positions = new Float32Array(buffer, 0, manifest.positionBytes / 4);
    const indices = new Uint32Array(buffer, manifest.positionBytes);
    const byName = new Map(manifest.meshes.map((m) => [m.name, m]));

    const geometries = new Map();
    for (const m of manifest.meshes) {
      const geo = new THREE.BufferGeometry();
      geo.setAttribute(
        'position',
        new THREE.BufferAttribute(
          positions.subarray(m.vertexOffset * 3, (m.vertexOffset + m.vertexCount) * 3),
          3
        )
      );
      geo.setIndex(
        new THREE.BufferAttribute(
          indices.subarray(m.indexOffset, m.indexOffset + m.indexCount),
          1
        )
      );
      geo.computeVertexNormals();
      geometries.set(m.name, geo);
    }

    const materials = new Map();
    let attached = 0;
    for (const v of visuals.visuals) {
      const geo = geometries.get(v.mesh);
      if (!geo || !byName.has(v.mesh)) continue;
      const bodyId = this.sim.bodyId(v.body);
      if (bodyId < 0) continue;

      const key = v.rgba.join(',');
      if (!materials.has(key)) {
        // The MJCF's "black" trim is 0.2 grey, which on a light backdrop still
        // crushes toward flat black. Lift the darkest materials just enough to
        // keep panel edges and joints readable.
        const lift = (c) => Math.max(c, 0.3);
        const dark = v.rgba[0] < 0.35;
        materials.set(
          key,
          new THREE.MeshStandardMaterial({
            color: new THREE.Color(
              dark ? lift(v.rgba[0]) : v.rgba[0],
              dark ? lift(v.rgba[1]) : v.rgba[1],
              dark ? lift(v.rgba[2]) : v.rgba[2]
            ).convertSRGBToLinear(),
            roughness: 0.5,
            metalness: 0.35,
          })
        );
      }
      const mesh = new THREE.Mesh(geo, materials.get(key));
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.position.set(v.pos[0], v.pos[1], v.pos[2]);
      // MuJoCo quaternions are (w, x, y, z); THREE.Quaternion is (x, y, z, w).
      mesh.quaternion.set(v.quat[1], v.quat[2], v.quat[3], v.quat[0]);
      this._group(bodyId).add(mesh);
      attached++;
    }
    this.hasRobotMeshes = attached > 0;
    return attached;
  }

  /**
   * Draw the collision primitives. Used as the fallback when the mesh asset is
   * unavailable, and as an optional overlay for seeing what physics actually
   * collides.
   */
  addCollisionPrimitives({ visible = true, opacity = 1 } = {}) {
    const mat = new THREE.MeshStandardMaterial({
      color: 0x5a6a7a,
      roughness: 0.6,
      metalness: 0.2,
      transparent: opacity < 1,
      opacity,
    });
    this.collisionMeshes = [];
    for (const g of this.sim.describeGeoms()) {
      if (g.name === 'floor' || g.name === 'ball_collision') continue;
      let geo = null;
      const [a, b] = g.size;
      if (g.type === GEOM.SPHERE) geo = new THREE.SphereGeometry(a, 16, 12);
      else if (g.type === GEOM.CAPSULE) geo = new THREE.CapsuleGeometry(a, 2 * b, 8, 12);
      else if (g.type === GEOM.CYLINDER) geo = new THREE.CylinderGeometry(a, a, 2 * b, 16);
      else if (g.type === GEOM.BOX) geo = new THREE.BoxGeometry(2 * a, 2 * b, 2 * g.size[2]);
      if (!geo) continue;
      // three's capsule/cylinder run along +y; MuJoCo's run along +z.
      geo.rotateX(Math.PI / 2);
      const mesh = new THREE.Mesh(geo, mat);
      mesh.castShadow = !this.hasRobotMeshes;
      mesh.visible = visible;
      mesh.userData.geomId = g.id;
      this._group(g.bodyId).add(mesh);
      // Geom-local offset within its body.
      const gp = this.sim.geomLocalPose(g.id);
      mesh.position.set(gp.pos[0], gp.pos[1], gp.pos[2]);
      mesh.quaternion.set(gp.quat[1], gp.quat[2], gp.quat[3], gp.quat[0]);
      this.collisionMeshes.push(mesh);
    }
    return this.collisionMeshes.length;
  }

  setCollisionVisible(v) {
    for (const m of this.collisionMeshes ?? []) m.visible = v;
  }

  /** The thrown ball, plus a short motion trail so fast throws read clearly. */
  addBall() {
    this.ball = new THREE.Mesh(
      new THREE.SphereGeometry(1, 24, 18),
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(0.9, 0.2, 0.2).convertSRGBToLinear(),
        roughness: 0.55,
        metalness: 0.05,
        emissive: new THREE.Color(0.25, 0.02, 0.02),
      })
    );
    this.ball.castShadow = true;
    this.world.add(this.ball);

    const N = 24;
    this.trailPositions = new Float32Array(N * 3);
    this.trailLen = 0;
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(this.trailPositions, 3));
    geo.setDrawRange(0, 0);
    this.trail = new THREE.Line(
      geo,
      new THREE.LineBasicMaterial({ color: 0xff6b5a, transparent: true, opacity: 0.5 })
    );
    this.trail.frustumCulled = false;
    this.world.add(this.trail);
  }

  /** Push a ball position onto the trail (call once per control step). */
  pushTrail(pos, active) {
    if (!this.trail) return;
    const N = this.trailPositions.length / 3;
    if (!active) {
      this.trailLen = 0;
      this.trail.geometry.setDrawRange(0, 0);
      return;
    }
    if (this.trailLen < N) this.trailLen++;
    else this.trailPositions.copyWithin(0, 3);
    const o = (this.trailLen - 1) * 3;
    this.trailPositions[o] = pos[0];
    this.trailPositions[o + 1] = pos[1];
    this.trailPositions[o + 2] = pos[2];
    this.trail.geometry.setDrawRange(0, this.trailLen);
    this.trail.geometry.attributes.position.needsUpdate = true;
  }

  /** Copy every body transform out of MuJoCo and render one frame. */
  render(followRobot = true) {
    const { data } = this.sim;
    for (const [bodyId, group] of this.bodyGroups) {
      const p = 3 * bodyId;
      const q = 4 * bodyId;
      group.position.set(data.xpos[p], data.xpos[p + 1], data.xpos[p + 2]);
      group.quaternion.set(
        data.xquat[q + 1],
        data.xquat[q + 2],
        data.xquat[q + 3],
        data.xquat[q]
      );
    }

    if (this.ball) {
      const b = this.sim.ballPos;
      this.ball.position.set(b[0], b[1], b[2]);
      this.ball.scale.setScalar(this.sim.ballRadius);
    }

    if (followRobot) {
      // The world group is rotated -90 deg about X, so MuJoCo (x, y, z) is drawn
      // at three (x, z, -y). Anything positioned in SCENE space -- the camera
      // target and the lights -- has to convert; anything inside `world` (bodies,
      // ball, trail) must not.
      const r = this.sim.rootPos;
      this._followTo = this._followTo ?? new THREE.Vector3();
      this._followTo.set(r[0], 0.9, -r[1]);
      this.follow.lerp(this._followTo, 0.06);
      const delta = this.follow.clone().sub(this.controls.target);
      this.controls.target.add(delta);
      this.camera.position.add(delta);
      this.keyLight.position.set(r[0] + 4, 7, -r[1] + 3);
      this.keyLight.target.position.set(r[0], 0, -r[1]);
      this.keyLight.target.updateMatrixWorld();
    }

    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  _resize() {
    const w = this.canvas.clientWidth || 1;
    const h = this.canvas.clientHeight || 1;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }
}
