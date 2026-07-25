#!/usr/bin/env bash
# Sim2sim for the BALL-ONLY masked-depth policy, driven by the REAL ZED + realtime
# EfficientTAM -- the exact on-robot perception path, no robot. Three processes:
#   * dodge_policy      -- the ball-only ONNX, DEPLOY uv env (onnxruntime).
#   * camera_node_etam  -- REAL ZED -> EfficientTAM ball mask -> ball-only depth
#                          (ball=real depth, everything else=far) -> UDP. DEPLOY py3.8
#                          venv (torch 2.4.1 + EfficientTAM + pyzed cp38).
#   * sim_node          -- the mjlab BallOnly dodge env (DEV env / mjlab) supplying
#                          robot dynamics + proprio, with its OWN depth render disabled
#                          (--external-depth): the live masked ZED feed replaces it.
#
# This is the live equivalent of play_depth_single_ballonly_aug.sh: the policy sees the
# SAME ball-only [9,16] depth it trained on (BallOnlyDepthObs), except now it comes from
# the camera+segmenter instead of the sim. CLICK the ball once in the EfficientTAM window
# to start tracking; sim balls are paused (--pause-throws) -- wave/throw a REAL ball at
# the camera and watch the sim robot dodge.
#
# Uses a pre-exported ONNX directly (no mjlab export step). Default = newest *.onnx under
# the ballonly exp's export/ dir; pass an explicit ONNX to pin one.
#
# Usage:
#   bash deploy/play_sim_dodge_ballonly.sh                                   # newest export ONNX
#   bash deploy/play_sim_dodge_ballonly.sh path/to/...BallOnly..._model_24000.onnx   # explicit
#   RUN=2026-06-11_00-08-51 bash deploy/play_sim_dodge_ballonly.sh           # newest in one run
#   TINY=1 bash deploy/play_sim_dodge_ballonly.sh                            # faster tiny EfficientTAM
#   CAMERA_TILT_DEG=0 bash deploy/play_sim_dodge_ballonly.sh <onnx>          # for a *_tilt0 ckpt
#
# CAMERA_TILT_DEG (default 20) is the PHYSICAL ZED pitch you mounted -- match it to the
# checkpoint's training tilt (the plain ballonly exp = 20 deg, the *_tilt0 exp = 0 deg) and
# point the camera that way, or the ball lands in the wrong image region.
#
# Env: FRAME_OFFSETS (default "(0,3,8,18)", MUST match how the ONNX was exported), EXP_NAME,
#      RUN, DEVICE (cuda:0/cpu), TINY, CAMERA_TILT_DEG, VIEWER (viser|native|none).
set -e
set -o pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"   # .../deploy
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
TASK="Unitree-G1-AMP-Dodge-Depth-Single-BallOnly-Flat"
EXP_NAME="${EXP_NAME:-g1_amp_dodge_depth_single_ballonly}"
FRAME_OFFSETS="${FRAME_OFFSETS:-(0,3,8,18)}"

# Physical ZED pitch -- match the checkpoint's training tilt. Read at import by the env cfg,
# but for this external-depth path it documents the mount you must physically point at.
export CAMERA_TILT_DEG="${CAMERA_TILT_DEG:-20}"

cleanup() {
  trap '' SIGINT SIGTERM EXIT
  echo -e '\nStopping...'
  pkill -f "deploy/policy/dodge_policy.py"   2>/dev/null || true
  pkill -f "deploy/sim/sim_node.py"          2>/dev/null || true
  pkill -f "deploy/real/camera_node_etam.py" 2>/dev/null || true
  fuser -k -KILL 9870/udp 2>/dev/null || true
  fuser -k -KILL 9871/udp 2>/dev/null || true
  fuser -k -KILL 9872/udp 2>/dev/null || true
}

cd "$ROOT_DIR"
export PYTHONPATH="${PYTHONPATH:-}:${ROOT_DIR}"

# 1. Resolve a ball-only ONNX directly (no export). Pass a path, or use the newest *.onnx
#    under the exp's export/ dir (RUN narrows it to one run). A .pt errors -- export first.
ONNX_MODEL="${1:-}"
EXP_DIR="${ROOT_DIR}/logs/rsl_rl/${EXP_NAME}"
if [[ -z "${ONNX_MODEL}" ]]; then
  SEARCH_DIR="${EXP_DIR}"
  [[ -n "${RUN:-}" ]] && SEARCH_DIR="${EXP_DIR}/${RUN}"
  ONNX_MODEL="$(find "${SEARCH_DIR}" -path '*/export/*.onnx' -printf '%T@ %p\n' 2>/dev/null | sort -n | tail -1 | cut -d' ' -f2-)"
  [[ -z "${ONNX_MODEL}" ]] && {
    echo "No export/*.onnx under ${SEARCH_DIR}. Export one:" >&2
    echo "  uv run python deploy/export_onnx.py ${TASK} <ckpt.pt> --frame-offsets '${FRAME_OFFSETS}'" >&2
    exit 1
  }
elif [[ "${ONNX_MODEL}" == *.pt ]]; then
  echo "play_sim_dodge_ballonly.sh uses an ONNX directly; got a .pt. Export it first:" >&2
  echo "  uv run python deploy/export_onnx.py ${TASK} ${ONNX_MODEL} --frame-offsets '${FRAME_OFFSETS}'" >&2
  exit 1
fi
[[ -f "${ONNX_MODEL}" ]] || { echo "ONNX not found: ${ONNX_MODEL}" >&2; exit 1; }
echo "Using ball-only ONNX (direct): ${ONNX_MODEL}"
echo "CAMERA_TILT_DEG=${CAMERA_TILT_DEG} (point the physical ZED to match)"

trap cleanup SIGINT SIGTERM EXIT

# 2. Policy node in the DEPLOY uv env (onnxruntime), background.
echo "Starting dodge_policy (deploy env, background)..."
uv run --project "${SCRIPT_DIR}" python deploy/policy/dodge_policy.py \
  "${ONNX_MODEL}" --frame-offsets "${FRAME_OFFSETS}" &

# 3. REAL ZED -> EfficientTAM ball-only masked depth -> UDP, in the DEPLOY py3.8 venv
#    (torch + EfficientTAM + pyzed cp38 live there). Click the ball once in its window.
#    TINY=1 uses the faster tiny model. This is the on-robot perception path.
echo "Starting camera_node_etam (REAL ZED + EfficientTAM masked depth, deploy py3.8 venv, background)..."
echo "  -> CLICK the ball in its window to start tracking (r=reset, q=quit)."
ETAM_FLAGS=(--hz 50)
[[ "${TINY:-0}" == "1" ]] && ETAM_FLAGS+=(--tiny)
[[ "${STATIC_MASK:-0}" == "1" ]] && ETAM_FLAGS+=(--static-mask)   # looming gate: mask a static cluster
"${SCRIPT_DIR}/.venv/bin/python" deploy/real/camera_node_etam.py "${ETAM_FLAGS[@]}" &

sleep 2.0

# 4. Sim node in the DEV env (mjlab), foreground. Its own depth render is OFF
#    (--external-depth): the live masked ZED feed feeds the policy. Sim balls are paused
#    (--pause-throws) -- the policy is blind to them; throw a REAL ball at the camera.
#    No --depth-aug: the depth is external (real ZED), so sim aug is moot.
VIEWER="${VIEWER:-viser}"
RESET_STAND="${RESET_STAND:-True}"
[[ "${RESET_STAND}" == "True" || "${RESET_STAND}" == "true" || "${RESET_STAND}" == "1" ]] \
  && RESET_FLAG="--reset-stand" || RESET_FLAG="--no-reset-stand"
#    --zero-command: the twist velocity command is forced to 0 (in-place stand), so the ONLY
#    motion driver is what the ZED+EfficientTAM sees -- the robot stands until a real ball
#    comes in, then dodges. (Removes the play backpedal that otherwise walks it backward
#    regardless of the camera.) Matches the rel_inplace_throw regime it also trained on.
echo "Starting sim_node (dev env, fg, viewer=${VIEWER}, reset_stand=${RESET_STAND}, external ZED depth, cmd=0)..."
uv run python deploy/sim/sim_node.py "${TASK}" --frame-offsets "${FRAME_OFFSETS}" \
  --viewer "${VIEWER}" ${RESET_FLAG} --no-depth-aug --external-depth --pause-throws --zero-command \
  ${DEVICE:+--device "${DEVICE}"}
