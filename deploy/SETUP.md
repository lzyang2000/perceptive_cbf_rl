# Deployment setup: single-cam depth dodge on a fresh Jetson

Step-by-step bring-up of the single-camera depth-dodge policy on a **new**
Unitree G1 + Jetson Orin. Read `deploy/README.md` first for the architecture;
this file is the ordered "do this, verify that" procedure.

## How to use this

- Work **top to bottom**. After each step run its verification command and
  confirm the expected output before continuing.
- Steps marked 🟥 touch the robot or system libraries (robot power, motor
  enable, sudo installs). Have an operator with the e-stop present before any
  step that can move the robot.
- The robot runs the `deploy/` uv env (numpy + onnxruntime) **plus torch for the
  EfficientTAM segmenter** (Step 9, the production perception path). Never
  `pip install mjlab` / warp on the Jetson; they do not build on 20.04 aarch64
  and are not needed (mjlab is dev-box only: export/sim/tests). torch is the one
  heavy dep that belongs on the robot, and only via the Jetson aarch64 wheels in
  Step 9, never the PyPI build.
- If a step fails, fix it before moving on. The "Troubleshooting" section lists
  the common failures.

## Target environment (assumptions)

- Unitree G1 (29 DOF) + a head-mounted **ZED Mini**.
- **Jetson Orin**, JetPack 5.x, **Ubuntu 20.04**, aarch64, system **Python 3.8**.
- **ZED SDK for L4T** installed at `/usr/local/zed` (provides the cp38 pyzed wheel).
- `uv` installed (`curl -LsSf https://astral.sh/uv/install.sh | sh`).
- `git`, `cmake`, `build-essential` available (or installable via apt).

Verify:
```bash
uname -m                                  # aarch64
python3 --version                         # 3.8.x
ls /usr/local/zed/pyzed-*-cp38-*.whl      # the L4T cp38 wheel exists
uv --version
```

## Step 1: Clone the repo + the SDK submodule

```bash
git clone <this-repo-url> ~/perceptive_cbf_rl
cd ~/perceptive_cbf_rl
git submodule update --init deploy/common/unitree_sdk2_wrapper
```
Verify: `ls deploy/common/unitree_sdk2_wrapper/python_binding/build.sh` exists.

## Step 2: Create the deploy uv env (Python 3.8)

```bash
cd ~/perceptive_cbf_rl/deploy
uv sync                       # installs numpy + onnxruntime==1.16.3 into a py3.8 venv
```
Verify:
```bash
uv run --project ~/perceptive_cbf_rl/deploy --python 3.8 \
  python -c "import numpy, onnxruntime; print('np', numpy.__version__, 'ort', onnxruntime.__version__)"
```
Expected: numpy 1.24.x, ort 1.16.3. (No torch, no mjlab.)

## Step 3: Install pyzed (the ZED SDK Python API)

The Jetson cp38 wheel is native; install it directly (the `get_python_api.py`
pip step is known to fail on this project; install the wheel):
```bash
uv pip install --python ~/perceptive_cbf_rl/deploy/.venv/bin/python \
  /usr/local/zed/pyzed-*-cp38-*.whl
```
Verify:
```bash
uv run --project ~/perceptive_cbf_rl/deploy python -c "import pyzed.sl as sl; print('pyzed OK', sl.Camera.get_device_list())"
```
Expected: prints the connected ZED's serial/model. If the list is empty, the
camera isn't detected (check USB / power); fixable later, and the stack can
still be brought up with `DRY_RUN=1`.

## Step 4: Build the Unitree SDK Python binding (aarch64)

```bash
cd ~/perceptive_cbf_rl
bash deploy/install_unitree_sdk.sh        # apt build deps (sudo) + builds unitree_interface.so
```
Verify (the script ends by printing this, but re-check):
```bash
uv run --project ~/perceptive_cbf_rl/deploy python -c "import unitree_interface; print('unitree_interface OK')"
```
🟥 This links against the robot SDK; it does not move the robot, but it installs
system libraries (sudo apt, ldconfig).

## Step 5: Confirm the policy checkpoints are present

The deployable ONNX files ship in the repo (no export on the robot):
`deploy/ckpts/dodge_link_cbf.onnx` (the dodge policy) and
`deploy/ckpts/walk_policy.onnx` (the optional walk policy for the remote-Y
dual mode).
```bash
ls -la deploy/ckpts/*.onnx
uv run --project ~/perceptive_cbf_rl/deploy python -c "
import onnxruntime as ort
f='deploy/ckpts/dodge_link_cbf.onnx'
print(f, ort.InferenceSession(f, providers=['CPUExecutionProvider']).get_inputs()[0].shape)"
```
Expected: input shape `[1, 960]` (= proprio 384 + depth 4x144 at frame_offsets
`(0,3,8,18)`).

## Step 6: Cameraless loopback (NO robot, NO camera) 🟩 safe

Smoke-test the full UDP + obs-assembly path with synthetic depth before touching
hardware. This runs the policy + a dry-run camera; `hardware_node` will block
waiting for the robot, which is fine. Ctrl-C after you see the policy start.
```bash
cd ~/perceptive_cbf_rl
DRY_RUN=1 NET=lo zsh deploy/play_real_dodge.sh
```
Expected within a few seconds: `dodge_policy` prints `obs dim 960 OK` (the
startup assert passed), `camera_node` prints `DRY RUN: emitting ... synthetic`.
If you see `Assembled obs dim ... != ONNX input`, the frame offsets don't match
the checkpoint; set `FRAME_OFFSETS` to what the ONNX was exported with. Ctrl-C.

## Step 7: Network interface for the robot DDS

Find the wired interface the G1 is on:
```bash
ip -brief addr      # look for the 192.168.123.x link to the robot
```
Pass it as `NET=` in the next step (e.g. `enP2p1s0`, `eth0`).

## Step 8: 🟥 Run on the robot (raw-depth fallback path)

**Prerequisites the operator must confirm:** robot powered, **suspended on a
gantry or with clear fall space**, e-stop in hand, ZED connected, the operator
holds the wireless remote.

This step runs the raw-depth `camera_node` path as a bring-up check. The
production run is Step 9 E5 (EfficientTAM masked depth); the shipped
`dodge_link_cbf.onnx` is trained on ball-only masked depth and should be run
with `ETAM=1`.

```bash
cd ~/perceptive_cbf_rl
NET=<iface> zsh deploy/play_real_dodge.sh
```
Sequence (the operator drives the remote):
1. The script launches camera + policy (background) + hardware (foreground).
2. **START**: robot interpolates to the default pose over 2 s.
3. **A**: the 50 Hz policy loop starts.
4. **B**: graceful stop (damp; press START to stand again).
5. **SELECT**: emergency stop: damp at the current pose and exit everything
   (kills camera + policy too via the launcher cleanup). This is the panic button.

## Hardware-verify items (cannot be checked off-robot)

1. **Remote button map.** **START=stand, A=go, B=graceful stop, SELECT=emergency
   stop/kill** (read from the `keys` bitmask; constants
   `STAND_BUTTON/GO_BUTTON/DAMP_BUTTON/KILL_BUTTON` in
   `deploy/real/hardware_node.py`). Confirm on the physical remote; remap if not.
2. **Left-stick handedness.** `deploy/common/command.py` assumes `lx`=right+,
   `ly`=fwd+ (sticks come from `ctrl.lx/ly/rx/ry`). Verify directions at low speed.
3. **Camera mount.** The policy expects the head ZED at the trained mount
   (~ +20 deg up, fovy 54, 16:9). A different mount degrades dodging.
4. **First motion is gentle.** On the first GO, keep the robot suspended and the
   commanded twist at default `[0,0,0]` (no stick input); it should hold and
   react to thrown balls, not walk off.

## Step 9: Ball-only masked depth (EfficientTAM segmenter), REQUIRED

**This is the production perception path, not an add-on.** Instead of feeding the
policy the raw pooled depth (`camera_node`), `camera_node_etam` segments the ball out
of the ZED RGB with **EfficientTAM** (you click the ball once; it then tracks and
re-acquires), keeps the ball at its real depth, and forces everything else to far:
the clean *ball-only* `[9,16]` image the shipped `dodge_link_cbf.onnx` policy is
trained on. The raw-depth `camera_node` path (Steps 3/5/8) is kept only as a
fallback / diagnostic. This is the **one place torch is required** on the Jetson
(the policy itself is still onnxruntime); complete the base bring-up (Steps 1-8)
first, then this.

> **Is Python 3.8 a problem on the Jetson? No.** RealtimeEfficientTAM *declares*
> `requires-python>=3.10` / `torch>=2.5.1`, but those pins are conservative; the
> only real py3.8 break is PEP585 builtin-generic annotations, which
> `patch_efficienttam_py38.py` fixes. It imports, builds, and tracks on **py3.8 +
> torch 2.4.1** (verified on an x86 dev box). **The real Jetson gate is the torch
> *wheel*, not Python:** PyPI torch has no Tegra-CUDA build, so you must install the
> NVIDIA Jetson aarch64 wheel (E2).

### E1: Init the EfficientTAM submodule + checkpoints  🟩 safe
```bash
cd ~/perceptive_cbf_rl
git submodule update --init deploy/common/RealtimeEfficientTAM
bash deploy/common/RealtimeEfficientTAM/checkpoints/download_checkpoints.sh   # downloads the .pt weights from HF
```
Verify: `ls deploy/common/RealtimeEfficientTAM/checkpoints/efficienttam_ti_512x512.pt`
(the **tiny** model; use it on the Orin via `TINY=1`).

### E2: Install torch + torchvision into the deploy venv (Jetson aarch64 wheels, NOT PyPI)  🟥 system libs
JetPack 5.x ships CUDA 11.4; **`uv pip install torch` from PyPI will NOT work** (no
Tegra build).

**Fast path: the repo's wheel mirror.** `deploy/tools/fetch_jetson_etam_wheels.sh`
downloads the torch wheel from NVIDIA's CDN (sha256-pinned in
`deploy/wheels/SHA256SUMS`) and installs torch plus the pure-python EfficientTAM
deps. torchvision is NOT shipped in the repo; the script installs it too if you
have dropped a matching wheel into `deploy/wheels/` (see below, and
`deploy/wheels/README.md`), and warns otherwise:
```bash
sudo apt-get install -y libopenblas-base libopenmpi-dev libomp-dev   # NVIDIA torch wheel runtime deps
bash deploy/tools/fetch_jetson_etam_wheels.sh                         # fetch torch, install torch (+ torchvision if mirrored)
```
Then jump to the **Verify** at the end of E2. The manual steps below are the
reference for how the torch wheel is obtained and how to produce the torchvision
wheel.

---

**torch: official NVIDIA Jetson wheel** (JetPack 5.1 / 5.1.1 / 5.1.2 = L4T
R35.2.1 / R35.3.1 / R35.4.1, Python 3.8): **torch 2.1.0** is the highest NVIDIA
publishes for JP5. This is exactly what the fast-path script fetches into
`deploy/wheels/` (sha256 in `deploy/wheels/SHA256SUMS`):
```bash
# official NVIDIA redist wheel (torch 2.1.0a0, cp38, aarch64, CUDA 11.4):
cd /tmp
wget https://developer.download.nvidia.com/compute/redist/jp/v512/pytorch/torch-2.1.0a0+41361538.nv23.06-cp38-cp38-linux_aarch64.whl
uv pip install --python ~/perceptive_cbf_rl/deploy/.venv/bin/python \
  /tmp/torch-2.1.0a0+41361538.nv23.06-cp38-cp38-linux_aarch64.whl
```

**torchvision: build from source on the Jetson (the reliable path).** NVIDIA ships
no torchvision wheel, and the community prebuilt index (**jetson-ai-lab**, torchvision
0.16.2 cp38 cu114) goes down, so the dependable method is to build the matching
version (**0.16.2** for torch 2.1.0) once, against the torch you installed above, then
keep the resulting wheel in `deploy/wheels/` so every later robot installs it offline.

> **Do this AFTER torch is installed**; the build links against the deploy venv's
> torch (CUDA 11.4) and reads its CUDA version. Use the venv's python, not system
> python. The compile takes ~10-20 min on an Orin.

```bash
# 1. Build deps (sudo):
sudo apt-get install -y git build-essential ninja-build libjpeg-dev zlib1g-dev libpng-dev python3-dev

# 2. Clone the version that pairs with torch 2.1.0:
cd /tmp && git clone --branch v0.16.2 --depth 1 https://github.com/pytorch/vision torchvision && cd torchvision

# 3. Build a wheel with CUDA on (TORCH_CUDA_ARCH_LIST: Orin=8.7, Xavier=7.2; MAX_JOBS caps RAM use):
export BUILD_VERSION=0.16.2 FORCE_CUDA=1 TORCH_CUDA_ARCH_LIST="8.7" MAX_JOBS=4
~/perceptive_cbf_rl/deploy/.venv/bin/python setup.py bdist_wheel       # -> dist/torchvision-0.16.2*-cp38-*-linux_aarch64.whl

# 4. Install it:
uv pip install --python ~/perceptive_cbf_rl/deploy/.venv/bin/python \
  /tmp/torchvision/dist/torchvision-0.16.2*-cp38-*-linux_aarch64.whl

# 5. Keep it in deploy/wheels/ so the NEXT robot skips the build (build once, install many):
cp /tmp/torchvision/dist/torchvision-0.16.2*-cp38-*-linux_aarch64.whl ~/perceptive_cbf_rl/deploy/wheels/
( cd ~/perceptive_cbf_rl/deploy/wheels && sha256sum torchvision-0.16.2*-cp38-*-linux_aarch64.whl >> SHA256SUMS )
```

If the **jetson-ai-lab** index happens to be up, you can grab the prebuilt wheel
instead of building (then still do step 5 to mirror it):
`pip download --no-deps --extra-index-url https://pypi.jetson-ai-lab.dev/jp5/cu114 torchvision==0.16.2`
(direct: `…/jp5/cu114/+f/torchvision-0.16.2+c6f3977-cp38-cp38-linux_aarch64.whl`).

**Pure-python EfficientTAM deps** (these DO have aarch64 wheels on PyPI; the
fast-path script installs them for you):
```bash
uv pip install --python ~/perceptive_cbf_rl/deploy/.venv/bin/python \
  "hydra-core>=1.3.2" "iopath>=0.1.10" "pillow>=9.4.0"
```

> ⚠ **Version risk (must validate at E3).** EfficientTAM is only *verified* on
> **torch 2.4.1** (x86 dev box). NVIDIA's official JP5 wheel tops out at **2.1.0**.
> Try 2.1.0 first; if E3's import or live tracking errors, fall back to a community
> JP5 wheel **>=2.3** (jetson-ai-lab pip index `https://pypi.jetson-ai-lab.dev` /
> dusty-nv jetson-containers) or move to **JetPack 6** (Python 3.10, CUDA 12, runs
> torch >=2.4, but JP6 means re-flash + a py3.10 deploy venv).

These torch/torchvision wheels are NOT tracked by `uv sync` (out-of-band, like
pyzed); re-install them after any `uv sync`.

Verify:
```bash
deploy/.venv/bin/python -c "import torch, torchvision; print('torch', torch.__version__, 'tv', torchvision.__version__, 'cuda', torch.cuda.is_available())"
```
Expected: prints the versions and `cuda True`. `cuda False` means the wrong wheel
(CPU or non-Tegra build); re-do with the NVIDIA redist wheel above.

### E3: Apply the py3.8 compatibility patch  🟩 safe
```bash
deploy/.venv/bin/python deploy/tools/patch_efficienttam_py38.py   # idempotent; re-run after any fresh submodule init
deploy/.venv/bin/python -c "
import sys; sys.path.insert(0, 'deploy/common/RealtimeEfficientTAM')
from efficient_track_anything.realtime_tam import build_predictor
print('etam import OK')"
```
Expected: `etam import OK`. A `TypeError: 'type' object is not subscriptable` means
the patch didn't apply; re-run it.

### E4: Confirm the ball-only ONNX  🟩 safe
The masked path needs a checkpoint **trained on ball-only depth**. The shipped
`deploy/ckpts/dodge_link_cbf.onnx` is exactly that (do not pair `ETAM=1` with a
raw-depth-trained ONNX; the two are not interchangeable).

### E5: Run the masked-depth variant  🟥 (same robot procedure + prerequisites as Step 8)
```bash
cd ~/perceptive_cbf_rl
STATIC_MASK=1 ETAM=1 TINY=1 NET=<your-iface> zsh deploy/play_real_dodge.sh deploy/ckpts/dodge_link_cbf.onnx
```
`ETAM=1` swaps in `camera_node_etam`; `TINY=1` selects the faster tiny model;
`STATIC_MASK=1` enables the looming gate (a world-static ball or clutter is
masked out; a real incoming throw passes). **Click the ball once** in the camera
window to start tracking (needs a display: desktop or `ssh -X`). The remote
sequence (START/A/B/SELECT) is identical to Step 8.

**Caveat: fps on the Orin.** EfficientTAM is much heavier than the raw pooling path;
expect well under 60 fps (Nano < NX < AGX). Use `TINY=1`. The policy holds its last
depth frame between camera updates, so a lower segmenter rate degrades reaction time
rather than crashing. Measure the achieved Hz (`camera_node_etam` prints its rate)
and confirm it's acceptable before relying on it.

## Troubleshooting

| Symptom | Likely cause / fix |
|---|---|
| `obs dim ... != ONNX input` at policy start | `FRAME_OFFSETS` doesn't match how the ONNX was exported. Default is `(0,3,8,18)`; set to match the checkpoint in `deploy/ckpts/`. |
| `unitree_interface` import fails | Step 4 didn't install the `.so`; re-run `install_unitree_sdk.sh`; check it copied `unitree_interface.so` into the deploy venv site-packages. |
| `pyzed` import fails / no camera | Re-run Step 3 with the correct cp38 wheel; check USB/power; `DRY_RUN=1` to proceed without it. |
| Robot ignores motor commands | High-level service still active; `hardware_node` calls `release_motion_control()`; check its `[WARN]` line; confirm `--net` is the right DDS interface. |
| Depth "stale" warnings | The camera node isn't publishing (camera fault). The robot keeps standing (holds last frame); fix the camera. |
| Robot dodges in sim but falls on hardware | Re-check the hardware-verify items above (button map, mount); confirm the sim2sim (`deploy/play_sim_dodge.sh`, dev box) dodges with this exact ONNX first. |
| (ETAM) `torch.cuda.is_available()` is False | Wrong torch wheel: CPU or non-Tegra build. Re-do E2 with the NVIDIA Jetson aarch64 CUDA wheel for your JetPack. |
| (ETAM) `TypeError: 'type' object is not subscriptable` on import | py3.8 compat patch not applied; re-run `deploy/tools/patch_efficienttam_py38.py` (E3). |
| (ETAM) segmenter too slow / robot reacts late | Use `TINY=1`; check `camera_node_etam`'s printed Hz. EfficientTAM is GPU-heavy on the Orin; the policy holds the last frame between updates. |
| (ETAM) torchvision build: `nvcc not found` / no CUDA in the wheel | Build env not set: `export FORCE_CUDA=1 TORCH_CUDA_ARCH_LIST=8.7` and ensure `/usr/local/cuda/bin` is on `PATH`; build with the deploy venv's python (not system python3). |
| (ETAM) torchvision build OOM / killed | Lower `MAX_JOBS` (e.g. `MAX_JOBS=2`); close other processes. The Orin compile is RAM-heavy. |
| (ETAM) `import torchvision` errors after install (symbol/ABI) | torchvision version doesn't match torch; rebuild **v0.16.2** against the installed **torch 2.1.0**; don't mix a generic-aarch64 torchvision wheel. |

## What this never needs on the robot

mjlab, warp, `logs/`, or running `export_onnx.py` / `sim_node.py` /
`scripts/play.py`. Those are dev-box tools. If a step here asks you to install or
import any of them on the Jetson, something is wrong; stop and re-read. (**torch +
a GPU** ARE needed, for the Step 9 EfficientTAM segmenter, the production
perception path, but only via the Jetson aarch64 wheels, never PyPI.)
