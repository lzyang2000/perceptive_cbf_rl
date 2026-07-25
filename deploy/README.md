# Hardware deploy: single-camera depth dodge (Unitree G1 + ZED Mini, Jetson Orin)

Runs the trained depth-dodge policy on the real Unitree G1, driven by a live
ZED Mini head camera with EfficientTAM ball segmentation, on a Jetson Orin
(JetPack 5.x, aarch64, Python 3.8). This folder has its **own uv environment**
and **does not import mjlab at runtime on the robot**.

## Quick start (canonical hardware command)

```bash
# From the repo root, after the one-time setup below:
STATIC_MASK=1 ETAM=1 TINY=1 NET=<your-iface> zsh deploy/play_real_dodge.sh deploy/ckpts/dodge_link_cbf.onnx
```

This launches three processes: `camera_node_etam` (ZED -> EfficientTAM ball mask
-> ball-only depth, with the static-mask looming gate), `dodge_policy` (ONNX on
CPU), and `hardware_node` (motor control + wireless remote). Click the ball once
in the camera window to start tracking (needs a display, or `ssh -X`). Replace
`<your-iface>` with the wired interface the G1 is on (`ip -brief addr`, look for
the 192.168.123.x link).

Safety state machine on the physical wireless remote:

- **START**: interpolate to the default pose over 2 s.
- **A**: start the 50 Hz policy loop (the robot dodges).
- **B**: graceful stop (damp; press START to stand again).
- **SELECT**: emergency stop (damp at the current pose and exit everything).
- **X**: toggle depth-far hold (the policy sees an empty depth image and just stands).
- **Y**: toggle dodge <-> walk (only if `deploy/ckpts/walk_policy.onnx` is present;
  the left stick then drives the walk twist command).

## Architecture (3 processes, localhost UDP)

```
   ZED ──grab(thread)──> camera_node[_etam] ──UDP(depth, 50 Hz, :9872)──┐
                                                                        v
 G1 LowState ─> hardware_node ──UDP(state, 50 Hz, :9871)──> dodge_policy ──UDP(action, 50 Hz, :9870)─> hardware_node ─> motors
        ^ wireless remote (START/A/B/SELECT + sticks)            (ONNX, CPU)
```

The camera is its **own process for fault isolation**: a pyzed segfault / USB
stall / ZED-SDK deadlock must not kill the motor-control process. `hardware_node`
is the one process that must stay alive to hold the stand and damp on demand.
No ROS anywhere; the state machine is driven by the physical wireless remote.

## What runs where (mjlab never touches the Jetson)

mjlab/warp do not build on the 20.04 Jetson, and they are never needed there.
The robot runs **only** the deploy uv env (numpy + onnxruntime + torch for the
EfficientTAM segmenter); all mjlab-using tools are dev-box only.

| Runs on | Processes / scripts | Heavy deps |
|---|---|---|
| **Jetson (robot)** | `camera_node_etam` (or `camera_node`), `dodge_policy`, `hardware_node`, `common/*` | numpy + onnxruntime; torch (Jetson wheel) only for EfficientTAM |
| **Dev box (x86 + GPU)** | `sim_node`, `export_onnx.py`, `scripts/gen_deploy_constants.py`, `tests/test_deploy_constants.py` | mjlab / warp / torch |

`play_real_dodge.sh` (the robot path) launches only the deploy env.
`play_sim_dodge.sh` (sim2sim) is a **dev-box** tool: `sim_node` runs in the dev
env (mjlab) and `dodge_policy` in the deploy env (onnxruntime), bridged by
localhost UDP; the robot is never involved. Every `common/`, `policy/`, and
`real/` module imports with mjlab+torch absent.

## One-time setup (on the Jetson)

```bash
cd <repo>
git submodule update --init                          # unitree_sdk2_wrapper + RealtimeEfficientTAM

cd deploy
uv sync                                              # numpy + onnxruntime + opencv (py3.8 venv)
uv pip install --python .venv/bin/python /usr/local/zed/pyzed-*-cp38-*.whl   # ZED SDK python API
bash install_unitree_sdk.sh                          # builds unitree_interface.so into the venv

# EfficientTAM (the production perception path):
bash common/RealtimeEfficientTAM/checkpoints/download_checkpoints.sh   # model weights from HF
bash tools/fetch_jetson_etam_wheels.sh               # Jetson aarch64 torch (+ torchvision if mirrored)
.venv/bin/python tools/patch_efficienttam_py38.py    # required once after checkout (py3.8 compat)
```

See `deploy/SETUP.md` for the full step-by-step fresh-Jetson bring-up with
verification commands, and `deploy/wheels/README.md` for the torch/torchvision
wheel details (torchvision must be built once on a JP5 Jetson).

## Launcher environment variables (`play_real_dodge.sh`)

| Var | Default | What it does |
|---|---|---|
| `NET` | prompts (eth0) | network interface for the robot DDS |
| `CKPT_DIR` | `deploy/ckpts` | where the launcher looks for the newest `*.onnx` when no path is given (`walk_policy*.onnx` is excluded from the auto-pick) |
| `WALK_ONNX` | `$CKPT_DIR/walk_policy.onnx` | proprio-only walk policy; if the file exists, dual-mode is enabled and remote Y toggles dodge <-> walk |
| `FRAME_OFFSETS` | `(0,3,8,18)` | depth frame-stack offsets; MUST match how the ONNX was exported |
| `CAMERA_HZ` | `50` | camera UDP publish rate (= the control rate) |
| `KP_SCALE` | `1.0` | position-stiffness scale on the hardware node (KD damping unaffected); lower for softer first runs |
| `ETAM` | `0` | `1` = EfficientTAM ball-only masked depth (`camera_node_etam`) instead of raw pooled depth |
| `TINY` | `0` | (ETAM) use the faster `efficienttam_ti_512x512` model; recommended on the Orin |
| `STATIC_MASK` | `0` | (ETAM) looming gate: mask out the tracked cluster unless its depth is closing (a world-static ball or clutter is ignored; a real throw passes) |
| `FREEZE` | `0` | (ETAM, diagnostic) latch the first valid segmented frame and send only that static obs; `f` re-arms |
| `DRY_RUN` | `0` | (non-ETAM) synthetic all-far frames, no camera; loopback smoke test |
| `VIEW` | `0` | (non-ETAM) cv2 debug window with the raw and pooled depth (needs a display) |
| `OBS_FAR` | `0` | (non-ETAM, diagnostic) publish an all-far obs; the camera runs but the policy sees no objects |
| `ZED_CONFIDENCE` | `50` | (non-ETAM) ZED confidence threshold, lower = stricter outlier rejection |
| `ZED_TEXTURE_CONF` | `100` | (non-ETAM) ZED texture confidence threshold, lower = stricter |
| `FILL_HOLES` | `0` | (non-ETAM) `1` re-enables ZED FILL depth mode (off by default; FILL invents phantom near surfaces) |
| `EDGE_CROP` | `30` | (non-ETAM) blank the outer N px before pooling (kills the ZED stereo border artifact); `0` disables |

**Gotcha:** the camera arguments marked (non-ETAM) above (`VIEW`, `OBS_FAR`,
`ZED_CONFIDENCE`, `ZED_TEXTURE_CONF`, `FILL_HOLES`, `EDGE_CROP`, `DRY_RUN`) are
only consumed by the raw-depth `camera_node` and are **silently ignored when
`ETAM=1`** (the ETAM node has its own defaults). Conversely `TINY`, `FREEZE`,
and `STATIC_MASK` only apply when `ETAM=1`.

Cameraless / robotless loopback before touching the robot:

```bash
DRY_RUN=1 NET=lo zsh deploy/play_real_dodge.sh   # synthetic far frames through the full UDP path
```

## Checkpoints (`deploy/ckpts/`)

- `dodge_link_cbf.onnx`: the dodge policy (trained with the link-CBF safety
  reward, on ball-only masked depth; pair it with `ETAM=1`).
- `walk_policy.onnx`: proprio-only walk policy (384 -> 29), auto-detected for
  the remote-Y dual mode.

Both were exported on the dev box with `deploy/export_onnx.py`; there is no
export step on the robot.

## Obs contract (must match the checkpoint)

actor input = `actor_proprio(384)` ++ `depth(144 * n_cam * n_offsets)`.

- **proprio (384):** 4-frame TERM-MAJOR history (oldest to newest per term),
  term order `base_ang_vel, projected_gravity, command, joint_pos_rel,
  joint_vel_rel, last_action` (matches `src/tasks/amp_loco/amp_env_cfg.py` plus
  the mjlab default term-major ordering).
- **depth:** per-frame `DepthImageObs`-normalised `[0,1]` 144-vector (no-hit ->
  far, clamp `[0.1, 5.0]`, normalise), stacked at `frame_offsets` NEWEST to
  OLDEST.

`dodge_policy` **asserts** the assembled dim equals the ONNX input dim at
startup, so a layout/offset mismatch fails loudly instead of as a fall. The
single-cam checkpoint was trained with `frame_offsets=(0,3,8,18)`, giving
`384 + 4*144 = 960`.

## Camera config (ZED Mini)

| Setting | Value | Notes |
|---|---|---|
| Resolution | **VGA** (WVGA 672x376, ~16:9) | matches the sim `head_camera_single` FOV (fovy ~54, HFOV ~85 deg) |
| Depth mode | **PERFORMANCE** | fastest; `--depth-mode` to change (QUALITY/NEURAL/ULTRA) |
| Grab FPS | **60** (pinned) | `--camera-fps`; VGA supports 15/30/60/100; keep >= the control rate |
| Depth range | **0.1-5.0 m** | `DEPTH_NEAR/FAR`; the policy clamps + normalises to this |
| Fill mode | **off** | `FILL_HOLES=1` re-enables ZED FILL; off because FILL invents phantom near surfaces |
| Pooled obs | **9x16** (3rd-percentile soft-min) | preserves the small near ball, rejects 1-2 spurious near pixels |
| UDP publish | **50 Hz** | `CAMERA_HZ`; = the control rate (see below) |

**Why publish at the control rate.** The depth ring stacks `frame_offsets`
`(0,3,8,18)` in **control steps** (50 Hz), a 0/60/160/360 ms window, exactly as
the sim trained it (`update_period=1`, a fresh frame every control step). The
policy pushes the latest held depth into the ring every control tick, so the
camera should deliver at >= the control rate; grabbing at 60 and publishing at
50 keeps each sampled offset on a fresh frame. The ZED grab runs in its own
thread, so it never gates the 50 Hz motor uplink.

**NEURAL depth at 60 fps?** Probably not on a Jetson Orin; `NEURAL` is far
heavier than `PERFORMANCE` (expect roughly 15-30 fps at VGA, variant-dependent).
`camera_node` logs the **achieved** grab fps every 3 s (`ZED grab NN fps`), so
measure rather than guess. The policy also trained on augmented (noisy,
stereo-like) depth, which `PERFORMANCE` resembles more than the cleaner
`NEURAL`, so stay on `PERFORMANCE` unless a measured win says otherwise.

Note that EfficientTAM is much heavier than the raw pooling path; use `TINY=1`
on the Orin and check the printed rate. The policy holds its last depth frame
between camera updates, so a lower segmenter rate degrades reaction time rather
than crashing.

## Sim2sim: verify the wiring with NO hardware (dev box)

Before the robot, validate the entire deploy path against the mjlab dodge sim.
`sim/sim_node.py` plays the role of `hardware_node` + `camera_node`: it builds
the real dodge play env (ball + head depth camera + physics), feeds the deploy
`dodge_policy` hardware-like raw signals over the **same UDP datagrams** the
robot uses, and applies the policy's joint targets back into the sim. The two
processes run in different uv envs (`dodge_policy` in `deploy/`, `sim_node` in
the dev env), bridged only by localhost UDP, so this exercises the real obs
assembly, depth offset-stacking, normalisation, action unscale, and reset
signalling.

```bash
bash deploy/play_sim_dodge.sh                 # newest *.onnx under the exp dir, run sim2sim
bash deploy/play_sim_dodge.sh path/to/model.onnx
VIEWER=native bash deploy/play_sim_dodge.sh   # local MuJoCo window instead of the browser viewer
VIEWER=none   bash deploy/play_sim_dodge.sh   # headless stats only
DEVICE=cpu    bash deploy/play_sim_dodge.sh   # depth render needs a GPU; cpu is slow
```

`sim_node` **asserts `POLICY_JOINT_NAMES` == the env's joint order at startup**
(the order the ONNX was trained in, which must equal the SDK motor order on
hardware), the single most likely silent deploy bug. It then logs survival
stats: if the robot dodges (long mean survival, few ball-hit resets) the wiring
is correct.

Variants:

- `deploy/play_sim_dodge_ballonly.sh`: sim2sim for the ball-only masked-depth
  policy driven by the REAL ZED + EfficientTAM (the exact on-robot perception
  path; throw a real ball at the camera, watch the sim robot dodge).
- `deploy/play_sim_walk.sh`: sim2sim with both policies loaded and the dodge <->
  walk switch wired to the viewer.

## ONNX export (dev box only)

`export_onnx.py` imports mjlab; never run it on the robot:

```bash
uv run python deploy/export_onnx.py Unitree-G1-AMP-Dodge-Depth-Single-Flat \
    <run>/model_24999.pt --frame-offsets '(0,3,8,18)'
```

## Tests (dev box)

Pure-numpy, no hardware:

```bash
uv run python deploy/tests/test_udp_sync.py         # datagram pack/unpack + byte sizes
uv run python deploy/tests/test_obs_assembly.py     # proprio/depth layout + freshness gate
uv run python -m pytest deploy/tests/test_mask_depth.py deploy/tests/test_mask_too_tall.py
                                                    # ball-only masking + not-a-ball rejection
uv run python deploy/tests/test_deploy_constants.py # baked constants vs g1_constants.py (1e-6)
uv run python deploy/common/zed_depth_source.py     # pooling self-test
```

`test_deploy_constants.py` imports mjlab (via `g1_constants.py`); it is a
dev-box drift guard, not part of the robot env. Re-bake the constants after any
G1 actuator/keyframe change: `uv run python deploy/scripts/gen_deploy_constants.py`,
paste into `common/g1_deploy_constants.py`, re-run the test.

## Hardware-verify items (cannot be checked off-robot)

- **Remote button map.** START=stand, A=go, B=graceful stop, SELECT=emergency
  stop (`hardware_node.py`), read from the controller's `keys` bitmask. SELECT
  exits `hardware_node`, which trips the launcher cleanup to tear down camera +
  policy. Confirm the buttons on your remote.
- **Left-stick handedness.** `command.py` assumes `lx`=right+, `ly`=fwd+;
  verify lateral/yaw directions before trusting commanded motion.
- **Camera mount / depth.** The policy expects the single head camera at the
  trained mount (pos `0.05 0 0.45`, +20 deg up, fovy 54, 16:9). A different
  mount degrades dodging. The ZED pooling/clamp path is reused unchanged to
  minimise the sim-to-real depth gap.
- **First motion is gentle.** On the first A press, keep the robot suspended
  or with clear fall space and the commanded twist at the default `[0,0,0]`;
  it should hold a stand and react to thrown balls, not walk off.
