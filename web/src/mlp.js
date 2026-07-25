/**
 * Forward pass for the two policy MLPs, in plain JS.
 *
 * These policies are a mean/std normalizer plus four nn.Linear layers with ELU
 * between them -- 660k multiply-adds for the dodge net, well under a millisecond.
 * onnxruntime-web would run them faster, but it costs ~13 MB of WASM that the
 * browser has to fetch and compile before the demo can show anything, which is a
 * bad trade for a graph this small. GitHub Pages also cannot send the COOP/COEP
 * headers that ORT's threaded build needs, so the WASM would be single-threaded
 * anyway.
 *
 * The weights come from tools/gen_weights.mjs and this path is checked against
 * ORT element-wise by tools/verify_mlp.mjs -- do not change the arithmetic
 * without re-running it.
 *
 * No imports on purpose: this loads in the browser, in Node, and in a worker.
 */

/**
 * Fetch a manifest + weight blob pair written by tools/gen_weights.mjs.
 *
 * @param manifestUrl <name>.weights.json
 * @param binUrl      <name>.weights.bin
 */
export async function loadMlp(manifestUrl, binUrl) {
  const get = async (url, kind) => {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`failed to fetch ${url}: ${res.status} ${res.statusText}`);
    return kind === 'json' ? res.json() : res.arrayBuffer();
  };
  // Both are needed before anything can run, so overlap the two requests.
  const [manifest, buffer] = await Promise.all([get(manifestUrl, 'json'), get(binUrl, 'bin')]);
  return createMlp(manifest, buffer);
}

/**
 * @param manifest    parsed <name>.weights.json
 * @param arrayBuffer the matching .bin, as an ArrayBuffer
 * @returns {{inputDim: number, outputDim: number, run: (obs: Float32Array) => Float32Array}}
 */
export function createMlp(manifest, arrayBuffer) {
  const { inputDim, outputDim, eluAlpha, tensors } = manifest;
  if (!Array.isArray(tensors) || tensors.length === 0) {
    throw new Error('weights manifest has no tensors[]');
  }
  if (!Number.isFinite(inputDim) || !Number.isFinite(outputDim)) {
    throw new Error('weights manifest is missing inputDim/outputDim');
  }
  if (!Number.isFinite(eluAlpha)) throw new Error('weights manifest is missing eluAlpha');
  if (!(arrayBuffer instanceof ArrayBuffer)) {
    throw new Error('createMlp needs an ArrayBuffer (got ' + typeof arrayBuffer + ')');
  }

  // Views, not copies: one blob backs every weight. offset is in floats, so
  // offset * 4 is always 4-byte aligned as Float32Array requires.
  const view = (t) => {
    const endBytes = (t.offset + t.count) * 4;
    if (endBytes > arrayBuffer.byteLength) {
      throw new Error(
        `tensor "${t.name}" ends at byte ${endBytes} but the weight blob is ${arrayBuffer.byteLength} bytes ` +
          '-- manifest and .bin are out of sync'
      );
    }
    return new Float32Array(arrayBuffer, t.offset * 4, t.count);
  };

  const only = (role) => {
    const found = tensors.filter((t) => t.role === role);
    if (found.length !== 1) throw new Error(`expected exactly one "${role}" tensor, found ${found.length}`);
    return view(found[0]);
  };
  const mean = only('mean');
  const std = only('std');
  if (mean.length !== inputDim || std.length !== inputDim) {
    throw new Error(`normalizer is ${mean.length}/${std.length} wide, inputDim is ${inputDim}`);
  }

  const layers = [];
  for (const t of tensors) {
    if (t.role !== 'weight' && t.role !== 'bias') continue;
    if (!Number.isInteger(t.layer)) throw new Error(`tensor "${t.name}" has no layer index`);
    const layer = (layers[t.layer] ??= {});
    if (t.role === 'weight') {
      if (t.shape.length !== 2) throw new Error(`weight "${t.name}" is not 2-D`);
      layer.w = view(t);
      layer.outDim = t.shape[0]; // stored [out, in]: Gemm transB=1
      layer.inDim = t.shape[1];
    } else {
      layer.b = view(t);
    }
  }
  if (layers.length === 0) throw new Error('weights manifest has no layers');

  let expect = inputDim;
  layers.forEach((layer, i) => {
    if (!layer.w || !layer.b) throw new Error(`layer ${i} is missing its weight or bias`);
    if (layer.inDim !== expect) {
      throw new Error(`layer ${i} takes ${layer.inDim} inputs, previous stage emits ${expect}`);
    }
    if (layer.b.length !== layer.outDim) {
      throw new Error(`layer ${i} bias is ${layer.b.length} wide, weight says ${layer.outDim}`);
    }
    expect = layer.outDim;
  });
  if (expect !== outputDim) throw new Error(`last layer emits ${expect}, manifest says ${outputDim}`);

  // run() is on the 50 Hz control path, so every buffer it touches is allocated
  // once, here, and reused.
  const norm = new Float32Array(inputDim);
  const scratch = layers.map((layer) => new Float32Array(layer.outDim));
  const last = layers.length - 1;

  /**
   * @param obs length inputDim
   * @returns the action vector -- a view of internal scratch, valid until the
   *          next run(); copy it if you need to keep it.
   */
  function run(obs) {
    if (obs.length !== inputDim) {
      throw new Error(`obs has ${obs.length} values, this policy expects ${inputDim}`);
    }

    for (let i = 0; i < inputDim; i++) norm[i] = (obs[i] - mean[i]) / std[i];

    let x = norm;
    for (let li = 0; li <= last; li++) {
      const { w, b, inDim, outDim } = layers[li];
      const y = scratch[li];
      for (let o = 0; o < outDim; o++) {
        const row = o * inDim;
        let sum = b[o];
        for (let i = 0; i < inDim; i++) sum += w[row + i] * x[i];
        y[o] = sum;
      }
      // ELU on every layer but the output one, which is linear. Applied after the
      // whole Gemm has been rounded to float32, matching ORT's node boundary.
      if (li !== last) {
        for (let o = 0; o < outDim; o++) {
          const v = y[o];
          if (v <= 0) y[o] = eluAlpha * (Math.exp(v) - 1);
        }
      }
      x = y;
    }
    return x;
  }

  return { inputDim, outputDim, run };
}
