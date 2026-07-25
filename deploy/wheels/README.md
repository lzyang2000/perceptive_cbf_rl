# Jetson aarch64 wheels (torch + torchvision for the EfficientTAM segmenter)

The EfficientTAM masked-depth path (deploy `SETUP.md` Step 9) needs **torch** +
**torchvision** built for the Jetson (aarch64, cp38, CUDA 11.4 / JetPack 5.x). PyPI has
no Tegra-CUDA build, so this directory is the local wheel mirror the bring-up installs
from.

Populate it with `deploy/tools/fetch_jetson_etam_wheels.sh`: it downloads the torch
wheel from NVIDIA's CDN and verifies it against `SHA256SUMS` (sha256-pinned), then
installs torch (plus torchvision, if a matching wheel is present here) into the deploy
venv.

| Wheel | Version | Source | In git? |
|---|---|---|---|
| `torch-2.1.0a0+41361538.nv23.06-cp38-cp38-linux_aarch64.whl` | torch 2.1.0 (NVIDIA nv23.06) | NVIDIA official redist `developer.download.nvidia.com/compute/redist/jp/v512/pytorch/` | **No**: 170 MB, fetched on demand by the script (checksum-pinned) |
| `torchvision-0.16.2*-cp38-cp38-linux_aarch64.whl` | torchvision 0.16.2 (pairs with torch 2.1.0) | build from source on a JP5 Jetson (below), or jetson-ai-lab `pypi.jetson-ai-lab.dev/jp5/cu114` when it is up | **No**: not shipped in the repo; obtain it once and drop it here |

## Getting the torchvision wheel

NVIDIA does **not** ship a torchvision wheel, and the repo does not include one:
you must build it from source or obtain it separately. **Building it once on a JP5
Jetson is the reliable method** (the prebuilt jetson-ai-lab index goes down). Do this
**after** torch is installed; it links against the deploy venv's torch (CUDA 11.4).
~10-20 min on an Orin. Then keep the wheel in this directory so later robots install
it offline.

```bash
sudo apt-get install -y git build-essential ninja-build libjpeg-dev zlib1g-dev libpng-dev python3-dev
cd /tmp && git clone --branch v0.16.2 --depth 1 https://github.com/pytorch/vision torchvision && cd torchvision
# CUDA on; TORCH_CUDA_ARCH_LIST: Orin=8.7, Xavier=7.2. MAX_JOBS caps compile RAM.
export BUILD_VERSION=0.16.2 FORCE_CUDA=1 TORCH_CUDA_ARCH_LIST="8.7" MAX_JOBS=4
<repo>/deploy/.venv/bin/python setup.py bdist_wheel       # -> dist/torchvision-0.16.2*-cp38-*-linux_aarch64.whl
# mirror it here + append the checksum:
cp dist/torchvision-0.16.2*-cp38-*-linux_aarch64.whl <repo>/deploy/wheels/
( cd <repo>/deploy/wheels && sha256sum torchvision-0.16.2*-cp38-*.whl >> SHA256SUMS )
```

Alternatively, **prebuilt** from jetson-ai-lab while it's up (then still mirror it here):
`pip download --no-deps --extra-index-url https://pypi.jetson-ai-lab.dev/jp5/cu114 torchvision==0.16.2`
(direct `+f/torchvision-0.16.2+c6f3977-cp38-cp38-linux_aarch64.whl`).

Generic aarch64 torchvision wheels (e.g. KumaTea) are CPU-only / not built against the
NVIDIA Jetson torch; do **not** use them, they lack the CUDA ops and can ABI-mismatch.
