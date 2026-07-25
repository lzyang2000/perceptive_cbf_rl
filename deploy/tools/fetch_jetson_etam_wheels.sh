#!/usr/bin/env bash
# Mirror + install the Jetson aarch64 torch/torchvision wheels the EfficientTAM segmenter
# needs (deploy/SETUP.md Step 9), into deploy/wheels/ and the deploy venv. torch is fetched
# from NVIDIA's CDN (checksum-pinned in deploy/wheels/SHA256SUMS); torchvision is NOT
# fetched -- build it once on a JP5 Jetson (deploy/wheels/README.md) and drop the wheel in
# deploy/wheels/, then this script installs it too.
#
# Run ON the Jetson (aarch64, JetPack 5.x, py3.8). On the x86 dev box it still downloads +
# verifies the torch wheel into deploy/wheels/ (useful to pre-stage), but skips install.
#
#   bash deploy/tools/fetch_jetson_etam_wheels.sh            # fetch torch, install torch+torchvision
#   NO_INSTALL=1 bash deploy/tools/fetch_jetson_etam_wheels.sh   # just mirror the wheels, don't install
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"     # deploy/tools
DEPLOY_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"                     # deploy
WHEELS="$DEPLOY_DIR/wheels"
TORCH_WHL="torch-2.1.0a0+41361538.nv23.06-cp38-cp38-linux_aarch64.whl"
TORCH_URL="https://developer.download.nvidia.com/compute/redist/jp/v512/pytorch/${TORCH_WHL}"

mkdir -p "$WHEELS"

# 1. torch -- fetch from NVIDIA's CDN if not already mirrored, then verify against SHA256SUMS.
if [[ ! -f "$WHEELS/$TORCH_WHL" ]]; then
  echo "[fetch] downloading torch (~170 MB) from NVIDIA ..."
  curl -fSL --connect-timeout 20 --retry 3 -o "$WHEELS/$TORCH_WHL" "$TORCH_URL"
else
  echo "[fetch] torch wheel already mirrored: $WHEELS/$TORCH_WHL"
fi
if [[ -f "$WHEELS/SHA256SUMS" ]]; then
  echo "[fetch] verifying checksums ..."
  ( cd "$WHEELS" && sha256sum -c --ignore-missing SHA256SUMS )
fi

# 2. torchvision -- must already be present in deploy/wheels/ (dropped in per the README).
#    NVIDIA ships no torchvision wheel and jetson-ai-lab is flaky, so we do NOT fetch it.
TV_WHL="$(ls "$WHEELS"/torchvision-0.16.*-cp38-*-linux_aarch64.whl 2>/dev/null | head -1 || true)"
if [[ -z "$TV_WHL" ]]; then
  echo "[fetch] WARNING: no torchvision wheel in $WHEELS." >&2
  echo "        Build it once on this Jetson (after torch installs), then it lives here" >&2
  echo "        for every later robot. See deploy/wheels/README.md / SETUP.md Step 9 E2:" >&2
  echo "          git clone --branch v0.16.2 --depth 1 https://github.com/pytorch/vision /tmp/torchvision" >&2
  echo "          cd /tmp/torchvision && export BUILD_VERSION=0.16.2 FORCE_CUDA=1 TORCH_CUDA_ARCH_LIST=8.7 MAX_JOBS=4" >&2
  echo "          $DEPLOY_DIR/.venv/bin/python setup.py bdist_wheel && cp dist/torchvision-0.16.2*.whl $WHEELS/" >&2
  echo "        then re-run this script (or just install that wheel)." >&2
fi

# 3. Install into the deploy venv (skip on a non-aarch64 box or with NO_INSTALL=1).
if [[ "${NO_INSTALL:-0}" == "1" ]]; then
  echo "[fetch] NO_INSTALL=1 -> mirrored only, not installing."; exit 0
fi
if [[ "$(uname -m)" != "aarch64" ]]; then
  echo "[fetch] $(uname -m) (not aarch64) -> wheels mirrored but NOT installed (they're Jetson-only)."
  exit 0
fi

echo "[fetch] installing torch (+ torchvision if present) + pure-python deps into the deploy venv ..."
uv pip install --project "$DEPLOY_DIR" "$WHEELS/$TORCH_WHL" ${TV_WHL:+"$TV_WHL"} \
  "hydra-core>=1.3.2" "iopath>=0.1.10" "pillow>=9.4.0"

echo "[fetch] verify:"
"$DEPLOY_DIR/.venv/bin/python" - <<'PY'
import torch
print("  torch", torch.__version__, "cuda", torch.cuda.is_available())
try:
    import torchvision; print("  torchvision", torchvision.__version__)
except Exception as e:
    print("  torchvision MISSING:", type(e).__name__, e)
PY
