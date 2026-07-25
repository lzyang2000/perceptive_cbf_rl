/**
 * Decimate the Unitree G1 visual STL set into one binary blob for the three.js demo.
 *
 *   src/assets/robots/unitree_g1/xmls/assets/*.STL  ->  public/model/robot_meshes.bin
 *                                                       public/model/robot_meshes.json
 *
 * The assets/ directory is 33 MB / 689k triangles of binary STL CAD export; the
 * 35 meshes g1.xml actually declares are 18.8 MB / 393k of it, with no index
 * buffer at all (every triangle repeats its three vertices). That is the entire
 * web budget spent on geometry the viewer sees at ~200 px tall, and it would
 * dwarf the ONNX policy, so it never ships as-is. gen_model.mjs already strips
 * these meshes from the physics XML -- MuJoCo runs on capsules and explicit
 * inertials, three.js owns the appearance -- which leaves this script free to
 * decimate purely for looks.
 *
 * The decimator is vertex clustering: overlay a cubic grid sized as a fraction
 * of each mesh's own bounding-box diagonal, collapse every vertex in a cell onto
 * one representative, and keep the source triangles whose corners survive in
 * three distinct cells. It is a poor choice for CAD *authoring* (it does not
 * preserve edges or topology) but the right one here: single pass, no
 * quadric/heap machinery, scale-free per mesh, and it turns the 46k-triangle
 * rubber hand into a recognisable 2.6k-triangle one instead of a hole-ridden
 * mess. Net result at the default: 393k -> 69k triangles, 1.1 MB.
 *
 * Normals are deliberately dropped -- the renderer calls
 * computeVertexNormals(), and cluster-averaged vertices make the source facet
 * normals wrong anyway.
 *
 * Usage: node tools/gen_meshes.mjs [--cell 0.028]   (npm run meshes)
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const WEB = resolve(HERE, '..');
const REPO = resolve(WEB, '..');

const G1_XML = resolve(REPO, 'src/assets/robots/unitree_g1/xmls/g1.xml');
const MESH_DIR = resolve(REPO, 'src/assets/robots/unitree_g1/xmls/assets');
const OUT_BIN = resolve(WEB, 'public/model/robot_meshes.bin');
const OUT_JSON = resolve(WEB, 'public/model/robot_meshes.json');

// Cell edge as a fraction of the mesh bounding-box diagonal. Tuned by measuring
// the whole set: 0.012 -> 150k tri / 2.51 MB (over budget), 0.025 -> 78k / 1.27,
// 0.028 -> 69k / 1.11, 0.05 -> 31k / 0.50 (hands and ankle rollers lose their
// silhouette). 0.028 keeps margin under both the 80k-triangle and 2 MB ceilings.
const DEFAULT_CELL_FRAC = 0.028;

// Meshes whose bounding box gets printed before/after as a mangling check.
const SANITY_MESHES = ['pelvis', 'head_link', 'left_knee_link'];

// A collapsed axis is the failure mode that matters (cellFrac far too coarse).
// Judge it against the diagonal, not the axis extent: a 4 mm-thick plate on a
// 300 mm part is legitimately down to one cell on its thin axis.
const BBOX_TOL_FRAC_OF_DIAG = 0.05;

// Cell coordinates and cell ids are packed three-to-a-key as exact doubles, 17
// bits per field (max key 2^51), so every field must stay inside +/-2^16.
const PACK_BIAS = 65536;
const PACK_BASE = 131072;

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------
function parseArgs(argv) {
  let cellFrac = DEFAULT_CELL_FRAC;
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    let raw = null;
    if (arg === '--cell') raw = argv[++i];
    else if (arg.startsWith('--cell=')) raw = arg.slice('--cell='.length);
    else throw new Error(`unknown argument "${arg}" (only --cell <fraction> is supported)`);
    const val = Number(raw);
    if (!Number.isFinite(val) || val <= 0 || val >= 1) {
      throw new Error(`--cell must be a fraction in (0, 1), got "${raw}"`);
    }
    cellFrac = val;
  }
  return cellFrac;
}

// ---------------------------------------------------------------------------
// Inputs
// ---------------------------------------------------------------------------
/** The manifest is g1.xml's <asset> block, so it cannot drift from the model. */
function parseMeshManifest(xmlPath) {
  const xml = readFileSync(xmlPath, 'utf8');
  const meshes = [];
  const seen = new Set();
  for (const m of xml.matchAll(/<mesh\s+name="([^"]+)"\s+file="([^"]+)"\s*\/>/g)) {
    const [, name, file] = m;
    if (seen.has(name)) throw new Error(`duplicate mesh name "${name}" in ${xmlPath}`);
    seen.add(name);
    meshes.push({ name, file });
  }
  if (meshes.length === 0) {
    throw new Error(`no <mesh name=... file=.../> declarations found in ${xmlPath}`);
  }
  return meshes;
}

/**
 * Binary STL: 80-byte header, uint32 triangle count, then 50 bytes per triangle
 * (3 float32 normal, 3x3 float32 vertices, uint16 attribute). Returns the raw
 * corner stream, 9 floats per triangle, in metres (the G1 STLs are already m).
 */
function readBinaryStl(path) {
  const buf = readFileSync(path);
  if (buf.length < 84) {
    throw new Error(`${path}: ${buf.length} bytes is too short to be a binary STL`);
  }
  const triangles = buf.readUInt32LE(80);
  const expected = 84 + 50 * triangles;
  if (buf.length !== expected) {
    throw new Error(
      `${path}: header declares ${triangles} triangles, so the file must be ` +
        `${expected} bytes, but it is ${buf.length}. Truncated, or not a binary STL.`
    );
  }
  const pos = new Float32Array(triangles * 9);
  let off = 84;
  for (let t = 0; t < triangles; t++) {
    off += 12; // facet normal: unused, computeVertexNormals() regenerates it
    for (let k = 0; k < 9; k++, off += 4) pos[t * 9 + k] = buf.readFloatLE(off);
    off += 2; // attribute byte count
  }
  return { triangles, pos };
}

// ---------------------------------------------------------------------------
// Geometry helpers
// ---------------------------------------------------------------------------
function bbox(pos) {
  const min = [Infinity, Infinity, Infinity];
  const max = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < pos.length; i += 3) {
    for (let a = 0; a < 3; a++) {
      const v = pos[i + a];
      if (v < min[a]) min[a] = v;
      if (v > max[a]) max[a] = v;
    }
  }
  const size = [max[0] - min[0], max[1] - min[1], max[2] - min[2]];
  return { min, max, size, diag: Math.hypot(size[0], size[1], size[2]) };
}

/**
 * Vertex clustering. Cells are keyed by floor(v / cell) and represented by the
 * AVERAGE of the vertices that landed in them -- not the cell centre, which
 * shrink-wraps the mesh onto the grid and visibly facets curved shells.
 */
function decimate(pos, cellFrac) {
  const src = bbox(pos);
  if (!(src.diag > 0)) throw new Error('degenerate mesh: bounding box diagonal is 0');
  const cell = src.diag * cellFrac;

  const slotOfKey = new Map();
  const keys = [];
  const sum = []; // [x,y,z,count] triples, appended per new cell
  const vertexCount = pos.length / 3;
  const slotOfVertex = new Int32Array(vertexCount);

  for (let v = 0; v < vertexCount; v++) {
    const i = v * 3;
    const ix = Math.floor(pos[i] / cell);
    const iy = Math.floor(pos[i + 1] / cell);
    const iz = Math.floor(pos[i + 2] / cell);
    if (
      ix < -PACK_BIAS || ix >= PACK_BIAS ||
      iy < -PACK_BIAS || iy >= PACK_BIAS ||
      iz < -PACK_BIAS || iz >= PACK_BIAS
    ) {
      throw new Error(`cell coordinate ${ix},${iy},${iz} exceeds the key packing range -- --cell is too small`);
    }
    // Biasing each field keeps the packed key monotone in (ix,iy,iz), so a plain
    // numeric sort below is a stable lexicographic cell order.
    const key = ((ix + PACK_BIAS) * PACK_BASE + (iy + PACK_BIAS)) * PACK_BASE + (iz + PACK_BIAS);
    let slot = slotOfKey.get(key);
    if (slot === undefined) {
      slot = keys.length;
      slotOfKey.set(key, slot);
      keys.push(key);
      sum.push(0, 0, 0, 0);
    }
    const s = slot * 4;
    sum[s] += pos[i];
    sum[s + 1] += pos[i + 1];
    sum[s + 2] += pos[i + 2];
    sum[s + 3] += 1;
    slotOfVertex[v] = slot;
  }

  // Deterministic cell ordering, independent of insertion (i.e. of STL order).
  const cells = keys.length;
  const order = Array.from({ length: cells }, (_, i) => i).sort((a, b) => keys[a] - keys[b]);
  const rankOfSlot = new Int32Array(cells);
  const rep = new Float32Array(cells * 3);
  for (let r = 0; r < cells; r++) {
    const slot = order[r];
    rankOfSlot[slot] = r;
    const s = slot * 4;
    const n = sum[s + 3];
    rep[r * 3] = sum[s] / n;
    rep[r * 3 + 1] = sum[s + 1] / n;
    rep[r * 3 + 2] = sum[s + 2] / n;
  }
  if (cells >= PACK_BASE) {
    throw new Error(`${cells} cells exceeds the triangle-key packing range -- --cell is too small`);
  }

  // Keep a triangle only if its corners survive in three distinct cells, and
  // only once per (unordered-but-oriented) corner set: rotating to the smallest
  // rank first collapses duplicates while keeping flipped faces distinct.
  const seen = new Set();
  const tris = [];
  for (let t = 0; t < vertexCount; t += 3) {
    const a = rankOfSlot[slotOfVertex[t]];
    const b = rankOfSlot[slotOfVertex[t + 1]];
    const c = rankOfSlot[slotOfVertex[t + 2]];
    if (a === b || b === c || a === c) continue; // collapsed into a sliver
    let r0 = a, r1 = b, r2 = c;
    if (b < a && b <= c) { r0 = b; r1 = c; r2 = a; }
    else if (c < a && c < b) { r0 = c; r1 = a; r2 = b; }
    const key = (r0 * PACK_BASE + r1) * PACK_BASE + r2;
    if (seen.has(key)) continue;
    seen.add(key);
    tris.push(a, b, c);
  }

  // Cells with no surviving triangle would be dead weight in the buffer, so
  // compact to referenced cells only -- still in ascending cell order.
  const usedRank = new Int32Array(cells).fill(-1);
  for (const r of tris) usedRank[r] = 0;
  let kept = 0;
  for (let r = 0; r < cells; r++) if (usedRank[r] === 0) usedRank[r] = kept++;

  const positions = new Float32Array(kept * 3);
  for (let r = 0, w = 0; r < cells; r++) {
    if (usedRank[r] < 0) continue;
    positions[w * 3] = rep[r * 3];
    positions[w * 3 + 1] = rep[r * 3 + 1];
    positions[w * 3 + 2] = rep[r * 3 + 2];
    w++;
  }
  const indices = new Uint32Array(tris.length);
  for (let i = 0; i < tris.length; i++) indices[i] = usedRank[tris[i]];

  return { positions, indices, cell, srcBbox: src, outBbox: bbox(positions) };
}

// ---------------------------------------------------------------------------
// Build
// ---------------------------------------------------------------------------
const cellFrac = parseArgs(process.argv.slice(2));
const manifest = parseMeshManifest(G1_XML);

console.log(`${manifest.length} meshes from ${basename(G1_XML)}, cellFrac = ${cellFrac}\n`);

const built = [];
let srcTotal = 0;
let outTotal = 0;
let vertexTotal = 0;
let indexTotal = 0;

for (const { name, file } of manifest) {
  const path = resolve(MESH_DIR, file);
  const stl = readBinaryStl(path);
  const dec = decimate(stl.pos, cellFrac);

  const vertexCount = dec.positions.length / 3;
  const triangles = dec.indices.length / 3;

  // Fail loudly rather than shipping a hollow robot.
  if (triangles === 0) {
    throw new Error(`${name}: every triangle collapsed at cellFrac=${cellFrac} -- use a smaller --cell`);
  }
  for (let a = 0; a < 3; a++) {
    const drift = Math.abs(dec.srcBbox.size[a] - dec.outBbox.size[a]) / dec.srcBbox.diag;
    if (drift > BBOX_TOL_FRAC_OF_DIAG) {
      throw new Error(
        `${name}: bounding box axis ${'xyz'[a]} moved ${(drift * 100).toFixed(1)}% of the mesh ` +
          `diagonal (${dec.srcBbox.size[a].toFixed(4)} -> ${dec.outBbox.size[a].toFixed(4)} m). ` +
          '--cell is too coarse.'
      );
    }
  }

  built.push({
    name,
    file,
    vertexOffset: vertexTotal,
    vertexCount,
    indexOffset: indexTotal,
    indexCount: dec.indices.length,
    srcTriangles: stl.triangles,
    triangles,
    positions: dec.positions,
    indices: dec.indices,
    srcBbox: dec.srcBbox,
    outBbox: dec.outBbox,
    cell: dec.cell,
  });

  vertexTotal += vertexCount;
  indexTotal += dec.indices.length;
  srcTotal += stl.triangles;
  outTotal += triangles;
}

// ---------------------------------------------------------------------------
// Validate before writing anything.
// ---------------------------------------------------------------------------
for (const m of built) {
  if (m.indexCount % 3 !== 0) {
    throw new Error(`${m.name}: indexCount ${m.indexCount} is not a multiple of 3`);
  }
  for (let i = 0; i < m.positions.length; i++) {
    if (!Number.isFinite(m.positions[i])) {
      throw new Error(`${m.name}: non-finite position at component ${i} (${m.positions[i]})`);
    }
  }
  for (let i = 0; i < m.indices.length; i++) {
    const idx = m.indices[i];
    if (!(idx >= 0 && idx < m.vertexCount)) {
      throw new Error(
        `${m.name}: index[${i}] = ${idx} is out of range for ${m.vertexCount} local vertices`
      );
    }
  }
}

// ---------------------------------------------------------------------------
// Write: all positions, then all indices, both in manifest order.
// ---------------------------------------------------------------------------
const positionBytes = vertexTotal * 3 * 4;
const bin = Buffer.allocUnsafe(positionBytes + indexTotal * 4);
const posView = new Float32Array(bin.buffer, bin.byteOffset, vertexTotal * 3);
const idxView = new Uint32Array(bin.buffer, bin.byteOffset + positionBytes, indexTotal);
for (const m of built) {
  posView.set(m.positions, m.vertexOffset * 3);
  idxView.set(m.indices, m.indexOffset);
}

const json = {
  positionBytes,
  meshes: built.map((m) => ({
    name: m.name,
    file: m.file,
    vertexOffset: m.vertexOffset,
    vertexCount: m.vertexCount,
    indexOffset: m.indexOffset,
    indexCount: m.indexCount,
    srcTriangles: m.srcTriangles,
    triangles: m.triangles,
  })),
};

mkdirSync(dirname(OUT_BIN), { recursive: true });
writeFileSync(OUT_BIN, bin);
writeFileSync(OUT_JSON, `${JSON.stringify(json, null, 2)}\n`);

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------
const nameWidth = Math.max(...built.map((m) => m.name.length));
for (const m of built) {
  const pct = ((m.triangles / m.srcTriangles) * 100).toFixed(1);
  console.log(
    `  ${m.name.padEnd(nameWidth)}  ${String(m.srcTriangles).padStart(7)} -> ` +
      `${String(m.triangles).padStart(6)} tri  (${pct.padStart(5)}%)  ${String(m.vertexCount).padStart(6)} vtx`
  );
}

const fmtBox = (b) =>
  `[${b.size.map((s) => s.toFixed(4)).join(' ')}] m  diag ${b.diag.toFixed(4)}`;

console.log('\nbounding box check (source vs decimated):');
for (const name of SANITY_MESHES) {
  const m = built.find((x) => x.name === name);
  if (!m) {
    console.log(`  ${name}: not in the manifest, skipped`);
    continue;
  }
  const drift = [0, 1, 2].map((a) =>
    Math.abs(m.srcBbox.size[a] - m.outBbox.size[a]) / m.srcBbox.diag
  );
  console.log(`  ${m.name}  cell ${m.cell.toFixed(5)} m`);
  console.log(`    src ${fmtBox(m.srcBbox)}`);
  console.log(`    out ${fmtBox(m.outBbox)}`);
  console.log(
    `    max axis drift ${(Math.max(...drift) * 100).toFixed(2)}% of diagonal, ` +
      `diag ${(((m.outBbox.diag - m.srcBbox.diag) / m.srcBbox.diag) * 100).toFixed(2)}%`
  );
}

const mb = (n) => `${(n / 1024 / 1024).toFixed(2)} MB`;
console.log(
  `\ntriangles ${srcTotal} -> ${outTotal} (${((outTotal / srcTotal) * 100).toFixed(1)}%), ` +
    `${vertexTotal} vertices`
);
console.log(`wrote ${OUT_BIN}  ${mb(bin.length)} (positions ${mb(positionBytes)}, indices ${mb(indexTotal * 4)})`);
console.log(`wrote ${OUT_JSON}`);
