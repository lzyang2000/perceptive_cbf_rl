/**
 * Extract the two policy MLPs from their .onnx files into a flat float32 blob.
 *
 * Both policies are four-layer MLPs behind a fixed mean/std normalizer -- nine
 * ONNX nodes, no control flow, no dynamic shapes. Running them through
 * onnxruntime-web means shipping ~13 MB of WASM to the browser to do ~660k
 * multiply-adds every 20 ms, which src/mlp.js does in ~50 lines of JS. So the
 * weights move into a plain .bin + .json manifest here, and tools/verify_mlp.mjs
 * proves the JS forward pass matches ORT element-wise before either is trusted.
 *
 *   deploy/ckpts/dodge_link_cbf.onnx -> public/policy/dodge.weights.{bin,json}
 *   deploy/ckpts/walk_policy.onnx    -> public/policy/walk.weights.{bin,json}
 *
 * The ONNX protobuf is parsed by the reader below rather than by a dependency:
 * one build script that reads ten float32 tensors out of a known graph does not
 * justify adding onnx/protobufjs (or a Python step) to the browser demo's build.
 * Nothing here is assumed about the graph -- the op sequence, the Gemm
 * alpha/beta/transB, the Elu alpha and every shape are read and asserted, so a
 * re-export with a different structure fails loudly instead of being coded
 * around.
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const WEB = resolve(HERE, '..');
// Read the checkpoints from the repo directly and write only the extracted
// weights into public/. Copying the .onnx into public/ would publish ~3.9 MB the
// browser never loads, since the runtime is src/mlp.js.
const CKPT_DIR = resolve(WEB, '../deploy/ckpts');
const POLICY_DIR = resolve(WEB, 'public/policy');

const MODELS = [
  { name: 'dodge', file: 'dodge_link_cbf.onnx' },
  { name: 'walk', file: 'walk_policy.onnx' },
];

// raw_data is little-endian float32, and so is every Float32Array on the
// platforms this ships to, so the extraction is a byte copy. Assert it anyway: a
// big-endian host would byte-swap all 660k weights without any other symptom.
if (new Uint8Array(new Float32Array([1]).buffer)[3] !== 0x3f) {
  throw new Error('big-endian host: ONNX raw_data would need byte-swapping');
}

// ---------------------------------------------------------------------------
// Minimal protobuf wire-format reader.
// ---------------------------------------------------------------------------
const VARINT = 0;
const I64 = 1;
const LEN = 2;
const I32 = 5;

const cursor = (buf, start = 0, end = buf.length) => ({ buf, p: start, end });

function varint(c) {
  let value = 0;
  let scale = 1;
  for (;;) {
    if (c.p >= c.end) throw new Error('truncated varint');
    const byte = c.buf[c.p++];
    // Plain Numbers, not BigInt: every varint we read (field keys, dims,
    // data_type, attribute ints) is far below 2^53.
    value += (byte & 0x7f) * scale;
    if ((byte & 0x80) === 0) return value;
    scale *= 128;
    if (scale > 2 ** 56) throw new Error('varint wider than 56 bits');
  }
}

/**
 * Yields every field of one message in order, so a caller can pick the fields it
 * knows and ignore the rest -- unknown fields are still skipped correctly
 * because their length is decided by the wire type, not by the schema.
 * Varints arrive as {no, wire, value}; everything else as {no, wire, start, end}.
 */
function* fields(c) {
  while (c.p < c.end) {
    const key = varint(c);
    const no = Math.floor(key / 8);
    const wire = key % 8;
    if (wire === VARINT) {
      yield { no, wire, value: varint(c) };
      continue;
    }
    const len = wire === LEN ? varint(c) : wire === I64 ? 8 : wire === I32 ? 4 : null;
    // Wire types 3/4 are deprecated groups; ONNX never emits them.
    if (len === null) throw new Error(`unsupported wire type ${wire} on field ${no}`);
    const start = c.p;
    c.p += len;
    if (c.p > c.end) throw new Error(`field ${no} overruns its message`);
    yield { no, wire, start, end: c.p };
  }
}

const sub = (c, f) => cursor(c.buf, f.start, f.end);
const text = (c, f) => c.buf.toString('utf8', f.start, f.end);
const float = (c, f) => c.buf.readFloatLE(f.start);
const bytes = (c, f) => c.buf.subarray(f.start, f.end);

function packedVarints(c, f) {
  const p = sub(c, f);
  const out = [];
  while (p.p < p.end) out.push(varint(p));
  return out;
}

// ---------------------------------------------------------------------------
// The slice of onnx.proto3 this script consumes.
// ---------------------------------------------------------------------------
const MODEL_GRAPH = 7;
const GRAPH_NODE = 1;
const GRAPH_INITIALIZER = 5;
const NODE_INPUT = 1;
const NODE_OUTPUT = 2;
const NODE_NAME = 3;
const NODE_OP_TYPE = 4;
const NODE_ATTRIBUTE = 5;
const ATTR_NAME = 1;
const ATTR_FLOAT = 2;
const ATTR_INT = 3;
const TENSOR_DIMS = 1;
const TENSOR_DATA_TYPE = 2;
const TENSOR_NAME = 8;
const TENSOR_RAW_DATA = 9;
const DATA_TYPE_FLOAT = 1;

function parseTensor(t) {
  const dims = [];
  let dataType = null;
  let name = '';
  let raw = null;
  for (const f of fields(t)) {
    if (f.no === TENSOR_DIMS) {
      if (f.wire === VARINT) dims.push(f.value);
      else dims.push(...packedVarints(t, f));
    } else if (f.no === TENSOR_DATA_TYPE) {
      dataType = f.value;
    } else if (f.no === TENSOR_NAME) {
      name = text(t, f);
    } else if (f.no === TENSOR_RAW_DATA) {
      raw = bytes(t, f);
    }
  }
  const count = dims.reduce((a, b) => a * b, 1);
  if (dataType !== DATA_TYPE_FLOAT) {
    throw new Error(`tensor "${name}" has data_type ${dataType}, expected ${DATA_TYPE_FLOAT} (FLOAT)`);
  }
  // float_data (field 4) instead of raw_data would need a different reader; a
  // torch.onnx.export never produces it, so refuse rather than half-support it.
  if (!raw) throw new Error(`tensor "${name}" has no raw_data -- unsupported encoding`);
  if (raw.length !== count * 4) {
    throw new Error(`tensor "${name}" dims ${JSON.stringify(dims)} need ${count * 4} bytes, raw_data has ${raw.length}`);
  }
  return { name, dims, count, raw };
}

function parseNode(n) {
  const inputs = [];
  const outputs = [];
  const attrs = new Map();
  let name = '';
  let opType = '';
  for (const f of fields(n)) {
    if (f.no === NODE_INPUT) inputs.push(text(n, f));
    else if (f.no === NODE_OUTPUT) outputs.push(text(n, f));
    else if (f.no === NODE_NAME) name = text(n, f);
    else if (f.no === NODE_OP_TYPE) opType = text(n, f);
    else if (f.no === NODE_ATTRIBUTE) {
      const a = sub(n, f);
      let attrName = '';
      const value = {};
      for (const g of fields(a)) {
        if (g.no === ATTR_NAME) attrName = text(a, g);
        else if (g.no === ATTR_FLOAT) value.f = float(a, g);
        else if (g.no === ATTR_INT) value.i = g.value;
      }
      attrs.set(attrName, value);
    }
  }
  return { name, opType, inputs, outputs, attrs };
}

function parseGraph(buf) {
  let graphField = null;
  const model = cursor(buf);
  for (const f of fields(model)) {
    if (f.no === MODEL_GRAPH && f.wire === LEN) graphField = f;
  }
  if (!graphField) throw new Error('ModelProto has no graph (field 7)');
  const graph = sub(model, graphField);
  const nodes = [];
  const initializers = new Map();
  for (const f of fields(graph)) {
    if (f.no === GRAPH_NODE) nodes.push(parseNode(sub(graph, f)));
    else if (f.no === GRAPH_INITIALIZER) {
      const t = parseTensor(sub(graph, f));
      initializers.set(t.name, t);
    }
  }
  return { nodes, initializers };
}

// ---------------------------------------------------------------------------
// Graph -> tensor manifest. Every structural assumption is checked here.
// ---------------------------------------------------------------------------
const EXPECTED_OPS = ['Sub', 'Div', 'Gemm', 'Elu', 'Gemm', 'Elu', 'Gemm', 'Elu', 'Gemm'];

function extract(buf) {
  const { nodes, initializers } = parseGraph(buf);

  const ops = nodes.map((n) => n.opType);
  if (ops.length !== EXPECTED_OPS.length || ops.some((op, i) => op !== EXPECTED_OPS[i])) {
    throw new Error(`unexpected graph: [${ops}]\nexpected:          [${EXPECTED_OPS}]`);
  }

  const initializer = (name, where) => {
    const t = initializers.get(name);
    if (!t) throw new Error(`${where} input "${name}" is not an initializer`);
    return t;
  };

  // (obs - mean) / std. Operand ORDER is the whole meaning of these two nodes,
  // so require obs/numerator to be input 0 rather than accepting either slot.
  const [subNode, divNode] = nodes;
  if (subNode.inputs.length !== 2 || divNode.inputs.length !== 2) {
    throw new Error('Sub/Div are not binary');
  }
  if (initializers.has(subNode.inputs[0])) {
    throw new Error(`Sub computes mean - obs, not obs - mean (input 0 is "${subNode.inputs[0]}")`);
  }
  const mean = initializer(subNode.inputs[1], 'Sub');
  if (divNode.inputs[0] !== subNode.outputs[0]) {
    throw new Error(`Div numerator is "${divNode.inputs[0]}", not the Sub output`);
  }
  const std = initializer(divNode.inputs[1], 'Div');

  const inputDim = mean.count;
  if (std.count !== inputDim) {
    throw new Error(`normalizer mean has ${inputDim} values but std has ${std.count}`);
  }
  // A zero here becomes Inf in the first layer; the running std is positive by
  // construction, so a non-positive entry means the wrong tensor was picked up.
  // (readFloatLE, not a Float32Array view: raw_data lands at an arbitrary byte
  // offset in the file and typed-array views require 4-byte alignment.)
  for (let i = 0; i < std.count; i++) {
    const v = std.raw.readFloatLE(i * 4);
    if (!(v > 0)) throw new Error(`normalizer std[${i}] = ${v}, must be > 0`);
  }

  const layers = [];
  const eluAlphas = [];
  let feed = divNode.outputs[0];
  let dim = inputDim;

  for (let i = 2; i < nodes.length; i++) {
    const node = nodes[i];
    if (node.opType === 'Elu') {
      if (node.inputs.length !== 1 || node.inputs[0] !== feed) {
        throw new Error(`${node.name} consumes "${node.inputs[0]}", not the preceding Gemm output`);
      }
      const alpha = node.attrs.get('alpha')?.f;
      if (typeof alpha !== 'number' || !Number.isFinite(alpha)) {
        throw new Error(`${node.name} has no float alpha attribute`);
      }
      eluAlphas.push(alpha);
      feed = node.outputs[0];
      continue;
    }

    // Gemm: y = alpha * A@B(^T) + beta * C. Only the nn.Linear form is supported.
    if (node.inputs.length !== 3) throw new Error(`${node.name} has ${node.inputs.length} inputs, expected 3 (x, W, b)`);
    if (node.inputs[0] !== feed) {
      throw new Error(`${node.name} consumes "${node.inputs[0]}", not the preceding output "${feed}"`);
    }
    const attr = (key, want) => {
      const v = node.attrs.get(key);
      const got = v?.f ?? v?.i ?? 0; // absent transA/transB default to 0 in ONNX
      if (got !== want) throw new Error(`${node.name} has ${key}=${got}, expected ${want}`);
      return got;
    };
    attr('alpha', 1);
    attr('beta', 1);
    attr('transA', 0);
    attr('transB', 1);

    const weight = initializer(node.inputs[1], node.name);
    const bias = initializer(node.inputs[2], node.name);
    if (weight.dims.length !== 2) throw new Error(`${weight.name} is not 2-D: ${JSON.stringify(weight.dims)}`);
    // transB=1, so the weight is stored [out_features, in_features].
    const [outFeatures, inFeatures] = weight.dims;
    if (inFeatures !== dim) {
      throw new Error(`${weight.name} takes ${inFeatures} inputs but the previous layer emits ${dim}`);
    }
    if (bias.count !== outFeatures) {
      throw new Error(`${bias.name} has ${bias.count} values, expected ${outFeatures}`);
    }
    layers.push({ weight, bias, inFeatures, outFeatures });
    feed = node.outputs[0];
    dim = outFeatures;
  }

  if (layers.length !== 4) throw new Error(`found ${layers.length} Gemm layers, expected 4`);
  if (eluAlphas.length !== layers.length - 1) {
    throw new Error(`found ${eluAlphas.length} Elu nodes, expected ${layers.length - 1} (the output layer is linear)`);
  }
  if (eluAlphas.some((a) => a !== eluAlphas[0])) {
    throw new Error(`Elu alphas differ: [${eluAlphas}] -- src/mlp.js assumes one alpha`);
  }

  const tensors = [
    { tensor: mean, role: 'mean', layer: null },
    { tensor: std, role: 'std', layer: null },
    ...layers.flatMap((l, i) => [
      { tensor: l.weight, role: 'weight', layer: i },
      { tensor: l.bias, role: 'bias', layer: i },
    ]),
  ];

  // Ten initializers in, ten consumed: a leftover tensor would mean the graph
  // carries structure this extraction dropped.
  if (tensors.length !== initializers.size) {
    const used = new Set(tensors.map((t) => t.tensor.name));
    const unused = [...initializers.keys()].filter((k) => !used.has(k));
    throw new Error(`initializers not consumed: [${unused}]`);
  }

  return { inputDim, outputDim: dim, eluAlpha: eluAlphas[0], tensors, layers };
}

// ---------------------------------------------------------------------------
// Emit.
// ---------------------------------------------------------------------------
mkdirSync(POLICY_DIR, { recursive: true });

for (const { name, file } of MODELS) {
  const onnx = resolve(CKPT_DIR, file);
  const { inputDim, outputDim, eluAlpha, tensors, layers } = extract(readFileSync(onnx));

  const totalFloats = tensors.reduce((n, t) => n + t.tensor.count, 0);
  const bin = Buffer.allocUnsafe(totalFloats * 4);
  const manifest = { source: file, inputDim, outputDim, eluAlpha, tensors: [] };

  let offset = 0; // in floats, which is what src/mlp.js indexes by
  for (const { tensor, role, layer } of tensors) {
    bin.set(tensor.raw, offset * 4);
    manifest.tensors.push({
      name: tensor.name,
      role,
      layer,
      shape: tensor.dims,
      offset,
      count: tensor.count,
    });
    offset += tensor.count;
  }
  if (offset !== totalFloats) throw new Error('offset bookkeeping disagrees with the total');

  const outBin = resolve(POLICY_DIR, `${name}.weights.bin`);
  const outJson = resolve(POLICY_DIR, `${name}.weights.json`);
  writeFileSync(outBin, bin);
  writeFileSync(outJson, `${JSON.stringify(manifest, null, 2)}\n`);

  const shape = layers.map((l) => l.inFeatures).concat(outputDim).join(' -> ');
  console.log(`${name}  (${file})`);
  console.log(`  ${shape}   eluAlpha=${eluAlpha}, transB=1, alpha=beta=1`);
  for (const t of manifest.tensors) {
    console.log(
      `    ${t.name.padEnd(22)} ${t.role.padEnd(6)} [${t.shape.join(', ')}]`.padEnd(60) +
        `offset ${String(t.offset).padStart(7)}  count ${t.count}`
    );
  }
  console.log(
    `  wrote ${outBin} (${(bin.length / 1048576).toFixed(3)} MB, ${totalFloats} floats)\n` +
      `  wrote ${outJson}\n` +
      `  vs ${(readFileSync(onnx).length / 1048576).toFixed(3)} MB of .onnx\n`
  );
}
