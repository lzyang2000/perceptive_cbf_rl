#!/usr/bin/env bash
# Build the unitree_sdk2_wrapper python binding (unitree_interface) into the
# deploy uv env. Jetson Orin / Ubuntu 20.04 / aarch64 / Python 3.8.
# Mirrors wbc_mjlab/deploy/install_unitree_sdk.sh, minus the dex1 gripper (the
# dodge robot has no grippers) and pointed at this repo's submodule path.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"   # .../deploy
WRAPPER_DIR="$SCRIPT_DIR/common/unitree_sdk2_wrapper"
ARCH="$(uname -m)"   # aarch64 on the Jetson; x86_64 on a dev box

# Match the Jetson's system python (3.8) so the .so ABI lines up on the robot.
UV_PYTHON="3.8"
UV_PROJECT_ARGS=(--project "$SCRIPT_DIR" --python "$UV_PYTHON")

echo "[install] arch=$ARCH  python=$UV_PYTHON  wrapper=$WRAPPER_DIR"

# 1. System build deps.
sudo apt-get update
sudo apt-get install -y build-essential cmake python3-dev pybind11-dev \
  libspdlog-dev libboost-all-dev libyaml-cpp-dev libfmt-dev

# 2. Python build deps into the deploy uv env.
uv pip install "${UV_PROJECT_ARGS[@]}" pybind11 numpy

# 3. Ensure the wrapper submodule is populated.
git -C "$SCRIPT_DIR/.." submodule update --init deploy/common/unitree_sdk2_wrapper

# 4. Build the python binding.
cd "$WRAPPER_DIR/python_binding"
export UNITREE_SDK2_PATH="$(cd .. && pwd)"
uv run "${UV_PROJECT_ARGS[@]}" bash build.sh --sdk-path "$UNITREE_SDK2_PATH"

# 5. Install the .so into the deploy uv env site-packages.
SITE_PACKAGES=$(uv run "${UV_PROJECT_ARGS[@]}" python -c "import site; print(site.getsitepackages()[0])")
echo "[install] installing unitree_interface.so -> $SITE_PACKAGES"
cp build/lib/unitree_interface.cpython-*-linux-gnu.so "$SITE_PACKAGES/unitree_interface.so"

# 6. Verify the import.
uv run "${UV_PROJECT_ARGS[@]}" python -c "import unitree_interface; print('unitree_interface installed OK')"
