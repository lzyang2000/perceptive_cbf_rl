#!/usr/bin/env bash
# Sim2sim with BOTH policies: dodge + walk, switched live from the viser viewer.
# Mirrors play_sim_dodge.sh but loads a second (proprio-only) walk policy and
# wires the dual-mode controls. No gain swap -- the in-repo AMP-Flat walker shares
# the dodge actuator config.
#
# In the viser viewer:
#   * "Walk mode" checkbox  -> switch dodge <-> walk (policy node swaps ONNX).
#   * "Manual cmd" + vx/vy/wz sliders -> drive the twist command (walk driver).
#   * Ball throws: high / low / random buttons + "Pause auto-throws".
#
# Usage:
#   bash deploy/play_sim_walk.sh                      # newest dodge .onnx + bundled walk .onnx
#   bash deploy/play_sim_walk.sh path/to/dodge.onnx   # explicit dodge ONNX
#   WALK_ONNX=path/to/walk.onnx bash deploy/play_sim_walk.sh
#
# Env: TASK, EXP_NAME, FRAME_OFFSETS, WALK_ONNX, VIEWER, DEVICE, BLEND_TICKS.
set -e
set -o pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
TASK="${TASK:-Unitree-G1-AMP-Dodge-Depth-Single-Flat}"
EXP_NAME="${EXP_NAME:-g1_amp_dodge_depth_single}"
FRAME_OFFSETS="${FRAME_OFFSETS:-(0,3,8,18)}"
WALK_ONNX="${WALK_ONNX:-${SCRIPT_DIR}/ckpts/walk_policy.onnx}"
BLEND_TICKS="${BLEND_TICKS:-25}"
DEPTH_DECIM="${DEPTH_DECIM:-1}"   # 5 -> 10 Hz depth for a 10fps-trained dodge ckpt

cleanup() {
  trap '' SIGINT SIGTERM EXIT
  echo -e '\nStopping...'
  pkill -f "deploy/policy/dodge_policy.py" 2>/dev/null || true
  pkill -f "deploy/sim/sim_node.py"        2>/dev/null || true
  for p in 9870 9871 9872; do fuser -k -KILL ${p}/udp 2>/dev/null || true; done
}

cd "$ROOT_DIR"
export PYTHONPATH="${PYTHONPATH:-}:${ROOT_DIR}"

# Resolve the dodge ONNX: explicit arg, else newest under the experiment dir.
DODGE_ONNX="${1:-}"
if [[ -z "${DODGE_ONNX}" ]]; then
  DODGE_ONNX="$(find "${ROOT_DIR}/logs/rsl_rl/${EXP_NAME}" -name '*.onnx' -printf '%T@ %p\n' 2>/dev/null | sort -n | tail -1 | cut -d' ' -f2-)"
fi
[[ -f "${DODGE_ONNX}" ]] || { echo "dodge ONNX not found: ${DODGE_ONNX} (pass one as arg 1)" >&2; exit 1; }
[[ -f "${WALK_ONNX}" ]]  || { echo "walk ONNX not found: ${WALK_ONNX} (set WALK_ONNX=...)" >&2; exit 1; }
echo "dodge=${DODGE_ONNX}"
echo "walk =${WALK_ONNX}"

trap cleanup SIGINT SIGTERM EXIT

echo "Starting dual-mode policy (deploy env, background)..."
uv run --project "${SCRIPT_DIR}" python deploy/policy/dodge_policy.py \
  "${DODGE_ONNX}" --walk-onnx "${WALK_ONNX}" \
  --frame-offsets "${FRAME_OFFSETS}" --blend-ticks "${BLEND_TICKS}" &

sleep 2.0

VIEWER="${VIEWER:-viser}"
echo "Starting sim_node (dev env, fg, viewer=${VIEWER})..."
uv run python deploy/sim/sim_node.py "${TASK}" --frame-offsets "${FRAME_OFFSETS}" \
  --viewer "${VIEWER}" --depth-aug --depth-decimation "${DEPTH_DECIM}" ${DEVICE:+--device "${DEVICE}"}
