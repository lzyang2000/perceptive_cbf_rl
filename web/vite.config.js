import { defineConfig } from 'vite';

/**
 * The demo is published into a subdirectory of the gh-pages site, so asset URLs
 * must be relative to that base rather than to the domain root. Override with
 * `DEMO_BASE=/some/path/ npm run build` if the deploy location changes.
 *
 * Everything is self-contained on purpose: the MuJoCo WASM binary is copied into
 * public/wasm by tools/copy_assets.mjs and located explicitly at runtime, and the
 * policies run through src/mlp.js instead of ONNX Runtime, so the page pulls
 * nothing from a CDN and needs no COOP/COEP headers (which GitHub Pages cannot
 * send, and which SharedArrayBuffer would otherwise require).
 */
export default defineConfig({
  base: process.env.DEMO_BASE ?? '/perceptive_cbf_rl/demo/',
  build: {
    target: 'es2022',
    outDir: 'dist',
    emptyOutDir: true,
    assetsInlineLimit: 0,
    chunkSizeWarningLimit: 2000,
  },
  server: { port: 5173, open: true },
  // Large binary payloads (WASM, weights, meshes) live in public/ and are served
  // as-is; Vite must not try to inline or transform them.
  assetsInclude: ['**/*.wasm', '**/*.onnx', '**/*.bin'],
});
