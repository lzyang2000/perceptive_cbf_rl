#!/usr/bin/env bash
# Sim2sim: verify the full deploy wiring with NO hardware. Two processes on
# localhost UDP:
#   * dodge_policy  -- the on-robot policy, in the DEPLOY uv env (onnxruntime)
#   * sim_node      -- the mjlab dodge env, in the DEV env (mjlab), playing the
#                      role of hardware_node + camera_node.
# If the robot dodges here (long survival, few hits), the obs assembly / depth
# offsets / action unscale / joint order are wired correctly. No ROS / robot DDS.
#
# Uses a pre-exported ONNX DIRECTLY (no mjlab export step here). The training
# runner already drops policy.onnx / export/*.onnx in each run dir; export a
# specific checkpoint with deploy/export_onnx.py if you need one.
#
# Usage:
#   bash deploy/play_sim_dodge.sh                      # newest *.onnx under the exp dir
#   bash deploy/play_sim_dodge.sh path/to/model.onnx   # explicit ONNX
#   RUN=2026-06-06_18-50-05 bash deploy/play_sim_dodge.sh   # newest .onnx in one run
#   ZED=1 bash deploy/play_sim_dodge.sh                # REAL ZED depth instead of sim render
#
# ZED=1 = sim2sim with REAL camera data: the actual deploy/real/camera_node.py
# (live ZED -> pooling -> UDP) feeds the deploy ONNX while the sim supplies robot
# dynamics/proprio. The full on-robot perception path, no robot. The policy is
# then blind to sim balls (throws auto-paused) -- wave/throw a REAL object at the
# camera and watch the sim robot react. The bg-fill-trained ckpts take raw room
# depth. VIEW=1 adds the cv2 depth window. Match CAMERA_TILT_DEG + the physical
# pointing to the checkpoint's training tilt.
#
# Env: FRAME_OFFSETS (default "(0,3,8,18)", MUST match how the ONNX was exported),
#      EXP_NAME, RUN, DEVICE (cuda:0/cpu), ZED, VIEW, CAMERA_TILT_DEG.
set -e
set -o pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"   # .../deploy
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
TASK="${TASK:-Unitree-G1-AMP-Dodge-Depth-Single-Flat}"
EXP_NAME="${EXP_NAME:-g1_amp_dodge_depth_single}"
FRAME_OFFSETS="${FRAME_OFFSETS:-(0,3,8,18)}"
DEPTH_DECIM="${DEPTH_DECIM:-1}"   # 5 -> 10 Hz depth for a 10fps-trained ckpt

cleanup() {
  trap '' SIGINT SIGTERM EXIT
  echo -e '\nStopping...'
  pkill -f "deploy/policy/dodge_policy.py" 2>/dev/null || true
  pkill -f "deploy/sim/sim_node.py"        2>/dev/null || true
  pkill -f "deploy/real/camera_node.py"    2>/dev/null || true
  pkill -f "deploy/real/camera_node_etam.py" 2>/dev/null || true
  fuser -k -KILL 9870/udp 2>/dev/null || true
  fuser -k -KILL 9871/udp 2>/dev/null || true
  fuser -k -KILL 9872/udp 2>/dev/null || true
}

cd "$ROOT_DIR"
export PYTHONPATH="${PYTHONPATH:-}:${ROOT_DIR}"

# 1. Resolve an ONNX directly (no export). Pass a path, or use the newest *.onnx
#    under the experiment dir (RUN narrows it to one run).
ONNX_MODEL="${1:-}"
EXP_DIR="${ROOT_DIR}/logs/rsl_rl/${EXP_NAME}"
if [[ -z "${ONNX_MODEL}" ]]; then
  SEARCH_DIR="${EXP_DIR}"
  [[ -n "${RUN:-}" ]] && SEARCH_DIR="${EXP_DIR}/${RUN}"
  ONNX_MODEL="$(find "${SEARCH_DIR}" -name '*.onnx' -printf '%T@ %p\n' 2>/dev/null | sort -n | tail -1 | cut -d' ' -f2-)"
  [[ -z "${ONNX_MODEL}" ]] && {
    echo "No .onnx under ${SEARCH_DIR}. Export one:" >&2
    echo "  uv run python deploy/export_onnx.py ${TASK} <ckpt.pt> --frame-offsets '${FRAME_OFFSETS}'" >&2
    exit 1
  }
elif [[ "${ONNX_MODEL}" == *.pt ]]; then
  echo "play_sim_dodge.sh uses an ONNX directly; got a .pt. Export it first:" >&2
  echo "  uv run python deploy/export_onnx.py ${TASK} ${ONNX_MODEL} --frame-offsets '${FRAME_OFFSETS}'" >&2
  exit 1
fi
[[ -f "${ONNX_MODEL}" ]] || { echo "ONNX not found: ${ONNX_MODEL}" >&2; exit 1; }
echo "Using ONNX (direct): ${ONNX_MODEL}"

trap cleanup SIGINT SIGTERM EXIT

# 2. Policy node in the DEPLOY uv env (onnxruntime), background.
echo "Starting dodge_policy (deploy env, background)..."
uv run --project "${SCRIPT_DIR}" python deploy/policy/dodge_policy.py \
  "${ONNX_MODEL}" --frame-offsets "${FRAME_OFFSETS}" &

# 2b. ZED=1: REAL camera depth instead of sim-rendered -- runs the actual
#     deploy/real/camera_node.py (live ZED -> pooling -> UDP) and tells sim_node
#     not to publish depth. Tests the full deploy perception path against the sim
#     robot. The policy is then BLIND to sim balls (throws are paused); wave/throw
#     a real object at the camera instead. The bg-fill-trained checkpoints take
#     RAW room depth.
#     Runs in the DEV env (pyzed lives there on this box; same camera_node file).
ZED="${ZED:-0}"
ETAM="${ETAM:-0}"
EXT_DEPTH_FLAGS=()
if [[ "${ETAM}" == "1" ]]; then
  # EfficientTAM ball-only (masked) depth, in the DEPLOY py3.8 venv (torch+EfficientTAM live
  # there). Click the ball once in its window. TINY=1 uses the faster tiny model. Implies the
  # external-depth path (sim balls paused -- wave/throw a REAL ball at the camera).
  echo "Starting camera_node_etam (EfficientTAM masked depth, deploy py3.8 venv, background)..."
  "${SCRIPT_DIR}/.venv/bin/python" deploy/real/camera_node_etam.py --hz 50 ${TINY:+--tiny} &
  EXT_DEPTH_FLAGS=(--external-depth --pause-throws)
elif [[ "${ZED}" == "1" ]]; then
  echo "Starting camera_node with the REAL ZED (dev env, background)..."
  uv run python deploy/real/camera_node.py --hz 50 \
    ${VIEW:+--view} &
  EXT_DEPTH_FLAGS=(--external-depth --pause-throws)
fi

sleep 2.0

# 3. Sim node in the DEV env (mjlab), foreground. VIEWER=viser (default) opens a
#    browser viewer to WATCH it dodge; VIEWER=native for a local window;
#    VIEWER=none for headless stats only.
VIEWER="${VIEWER:-viser}"
# RESET_STAND=True (default) matches play_depth_single.sh: nominal default-stand resets.
# Terminations are the play env's set regardless. RESET_STAND=False keeps RSI motion resets.
RESET_STAND="${RESET_STAND:-True}"
[[ "${RESET_STAND}" == "True" || "${RESET_STAND}" == "true" || "${RESET_STAND}" == "1" ]] \
  && RESET_FLAG="--reset-stand" || RESET_FLAG="--no-reset-stand"
# DEPTH_AUG=True (default) sends the training-augmented depth, matching play_depth_single.sh
# (clean depth is OOD for the DR-trained policy). The real ZED's noise replaces it on hardware.
DEPTH_AUG="${DEPTH_AUG:-True}"
[[ "${DEPTH_AUG}" == "True" || "${DEPTH_AUG}" == "true" || "${DEPTH_AUG}" == "1" ]] \
  && AUG_FLAG="--depth-aug" || AUG_FLAG="--no-depth-aug"
echo "Starting sim_node (dev env, fg, viewer=${VIEWER}, reset_stand=${RESET_STAND}, depth_aug=${DEPTH_AUG}, zed=${ZED})..."
uv run python deploy/sim/sim_node.py "${TASK}" --frame-offsets "${FRAME_OFFSETS}" \
  --viewer "${VIEWER}" ${RESET_FLAG} ${AUG_FLAG} "${EXT_DEPTH_FLAGS[@]}" \
  --depth-decimation "${DEPTH_DECIM}" ${DEVICE:+--device "${DEVICE}"}
