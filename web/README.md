# Browser demo

The deployed dodge policy running against MuJoCo physics entirely client-side.
Physics is the official DeepMind MuJoCo WASM build; the policy is the same
checkpoint that ran on the robot, evaluated by a hand-written forward pass.
Nothing is fetched from a CDN and no special HTTP headers are required, so it
works as a plain static upload.

## Run it locally

```bash
cd web
npm install
npm run dev            # regenerates assets, then serves on :5173
```

## Verify it

```bash
npm run verify         # all three checks below
```

| Check | What it proves |
| --- | --- |
| `npm run xcheck` | The JS observation assembly reproduces `deploy/policy/dodge_policy.py` exactly (needs `python3` + numpy; no mjlab). |
| `npm run verify-mlp` | The JS forward pass matches ONNX Runtime on the real checkpoints. |
| `npm run headless` | In-sim behaviour: the policy stands, and dodges thrown balls. |

Diagnostics: `npm run trace` prints a per-tick view of one throw (what the policy
sees and what it does); `npm run sweep` runs the depth-sampling ablation.

## Generated assets

`npm run prepare-assets` derives everything from in-repo sources, so the demo
cannot drift from what was trained and deployed. None of it is tracked in git.

| Output | Generated from |
| --- | --- |
| `public/model/g1_dodge.xml` | `src/assets/robots/unitree_g1/xmls/g1.xml` + mjlab's programmatic actuator/collision setup |
| `src/generated/constants.js` | `deploy/common/g1_deploy_constants.py` |
| `public/model/visuals.json` | the visual geoms stripped out of the physics XML |
| `public/model/robot_meshes.{bin,json}` | the 35 STLs declared in `g1.xml`, decimated 393k -> 69k triangles |
| `public/policy/{dodge,walk}.weights.{bin,json}` | `deploy/ckpts/*.onnx` |

MuJoCo's `mujoco.wasm` needs no step here: Vite resolves it out of
`node_modules` and emits it as a hashed asset.

## Deploy

```bash
npm run build                      # -> web/dist
node tools/deploy_ghpages.mjs      # copies dist into the gh-pages branch under demo/
```

The build's `base` is `/perceptive_cbf_rl/demo/`; override with
`DEMO_BASE=/path/ npm run build` if it moves.

`deploy_ghpages.mjs` commits but does not push unless given `--push`, since
gh-pages is the live site. Use `--dry-run` to preview.

To link it from the project page, add one more `link-block` alongside the
Paper / arXiv / Code buttons in the gh-pages `index.html`:

```html
<span class="link-block">
  <a href="demo/" class="external-link button is-normal is-rounded is-dark">
    <span class="icon"><i class="fas fa-gamepad"></i></span>
    <span>Live Demo</span>
  </a>
</span>
```
