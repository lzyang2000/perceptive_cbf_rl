/**
 * ONNX policy sessions (onnxruntime-web, single-threaded WASM).
 *
 * Single-threaded is not a limitation we work around but a requirement: GitHub
 * Pages cannot send the COOP/COEP headers that SharedArrayBuffer needs, so any
 * multi-threaded build would fail to start. These are small MLPs (960->29 and
 * 384->29); inference is well under a millisecond either way.
 */

/**
 * @param ort      the onnxruntime-web module
 * @param urls     {dodge, walk} model URLs
 * @param expected {dodgeDim, walkDim} assembled observation dims to verify
 */
export async function createPolicies(ort, urls, expected) {
  ort.env.wasm.numThreads = 1;
  ort.env.logLevel = 'error';

  const opts = { executionProviders: ['wasm'], graphOptimizationLevel: 'all' };
  const [dodge, walk] = await Promise.all([
    ort.InferenceSession.create(urls.dodge, opts),
    ort.InferenceSession.create(urls.walk, opts),
  ]);

  const inputDim = (session) => {
    const name = session.inputNames[0];
    const meta = session.inputMetadata?.[0] ?? session.inputMetadata?.[name];
    const dims = meta?.shape ?? meta?.dims;
    return { name, dim: dims ? Number(dims[dims.length - 1]) : null };
  };

  const d = inputDim(dodge);
  const w = inputDim(walk);

  // Same guard dodge_policy.py applies at startup: a layout or frame-offset
  // mismatch must fail loudly here, not as a fall three seconds in.
  if (d.dim != null && d.dim !== expected.dodgeDim) {
    throw new Error(
      `dodge ONNX expects ${d.dim} inputs but the assembled obs is ${expected.dodgeDim} ` +
        `(proprio 384 + depth ${expected.dodgeDim - 384}). Wrong FRAME_OFFSETS for this checkpoint?`
    );
  }
  if (w.dim != null && w.dim !== expected.walkDim) {
    throw new Error(`walk ONNX expects ${w.dim} inputs but proprio is ${expected.walkDim}`);
  }

  const dodgeTensor = new ort.Tensor('float32', new Float32Array(expected.dodgeDim), [1, expected.dodgeDim]);
  const walkTensor = new ort.Tensor('float32', new Float32Array(expected.walkDim), [1, expected.walkDim]);

  const run = async (session, inputName, tensor, obs) => {
    tensor.data.set(obs);
    const out = await session.run({ [inputName]: tensor });
    return out[session.outputNames[0]].data;
  };

  return {
    dodgeDim: expected.dodgeDim,
    walkDim: expected.walkDim,
    runDodge: (obs) => run(dodge, d.name, dodgeTensor, obs),
    runWalk: (obs) => run(walk, w.name, walkTensor, obs),
  };
}
