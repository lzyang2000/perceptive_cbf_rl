#!/usr/bin/env bash
# Preview the BALL-ONLY masked-depth domain randomization for the ball-only dodge task
# (Unitree-G1-AMP-Dodge-Depth-Single-BallOnly-Flat) live in the viser web viewer.
#
# The obs is BallOnlyDepthObs: ONLY the ball is kept (real depth), everything else -> far -- the
# representation the deploy EfficientTAM ball-segmenter produces. Plays WITH the masked-depth DR ON
# by default (the policy trained on it -- in-distribution), so you watch in the 'head_depth_single'
# depth panel exactly what it trained on: ball_depth_jitter, ball_noise_sigma, edge_tile_flicker,
# whole-ball/pixel dropout (no full-frame speckle/clutter/bg-fill -- background stays clean far).
# Set BALLONLY_AUG=0 to eval on the CLEAN masked ball instead. With no checkpoint it drives a
# STANDING dummy (inspect the obs without a policy).
#
# CAMERA_TILT_DEG MUST match the checkpoint's training tilt -- AUTO-INFERRED from the ckpt path
# (a *_tilt0 ckpt -> 0 deg, else 20 deg); an explicit CAMERA_TILT_DEG overrides. (Mismatched tilt is
# the usual cause of a good policy playing badly: the ball lands in the wrong image region.)
#
# Usage:
#   ./play_vision.sh                                  # standing dummy + DR preview
#   ./play_vision.sh logs/.../ballonly/<run>/model_*.pt        # 20deg auto
#   ./play_vision.sh logs/.../ballonly_tilt0/<run>/model_*.pt  # 0deg auto-inferred
#   BALLONLY_AUG=0 ./play_vision.sh <ckpt>            # eval on the CLEAN masked ball
#   NUM_ENVS=4 ./play_vision.sh                       # more robots
#
# Env overrides: NUM_ENVS, FRAME_OFFSETS, CAMERA_TILT_DEG (default 20), AGENT (zero|random). Extra
# args -> scripts/play.py.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$REPO_ROOT"

TASK="Unitree-G1-AMP-Dodge-Depth-Single-BallOnly-Flat"

# First positional arg (not a flag) = checkpoint path -> trained policy; else standing dummy.
CKPT=""
if [[ $# -gt 0 && "$1" != -* ]]; then
  CKPT="$1"
  shift
fi

# Camera tilt MUST match the checkpoint's training tilt (the release trains at +20 deg).
export CAMERA_TILT_DEG="${CAMERA_TILT_DEG:-20}"      # read at import by dodge_env_cfgs

# Play WITH the masked-depth DR by default (the policy trained on it -- in-distribution). Set
# BALLONLY_AUG=0 to eval on the clean masked ball instead.
export BALLONLY_AUG="${BALLONLY_AUG:-1}"

NUM_ENVS="${NUM_ENVS:-1}"
FRAME_OFFSETS="${FRAME_OFFSETS:-(0,3,8,18)}"
AGENT="${AGENT:-zero}"  # standing dummy by default (no checkpoint needed)

echo "[play_vision.sh] task=${TASK} CAMERA_TILT_DEG=${CAMERA_TILT_DEG} BALLONLY_AUG=${BALLONLY_AUG} (1=DR on, 0=clean eval)"
echo "[play_vision.sh] depth_frame_offsets=${FRAME_OFFSETS} num_envs=${NUM_ENVS} viewer=viser"

COMMON=( "$TASK" --num-envs "$NUM_ENVS" --viewer viser --depth-frame-offsets "$FRAME_OFFSETS" )

if [[ -n "$CKPT" ]]; then
  [[ -f "$CKPT" ]] || { echo "[play_vision.sh] checkpoint not found: ${CKPT}" >&2; exit 1; }
  echo "[play_vision.sh] policy checkpoint=${CKPT}"
  PYTHONPATH="$REPO_ROOT${PYTHONPATH:+:$PYTHONPATH}" \
    exec uv run python scripts/play.py "${COMMON[@]}" --checkpoint-file "$CKPT" "$@"
else
  echo "[play_vision.sh] dummy agent=${AGENT} (standing; pass a checkpoint to drive a policy)"
  PYTHONPATH="$REPO_ROOT${PYTHONPATH:+:$PYTHONPATH}" \
    exec uv run python scripts/play.py "${COMMON[@]}" --agent "$AGENT" "$@"
fi
