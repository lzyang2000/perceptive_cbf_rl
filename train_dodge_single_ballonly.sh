#!/usr/bin/env bash
# Train the SINGLE-CAMERA ball-only masked depth dodge policy (Unitree-G1-AMP-Dodge-Depth-Single-BallOnly-Flat)
# with the head camera tilted +20 deg up (CAMERA_TILT_DEG=20, the default).
#
# The depth obs is BallOnlyDepthObs: "ball at its real depth, empty (far) everywhere else",
# matching the representation produced by the hardware EfficientTAM ball-segmenter. Training-only
# DR adds bursty whole-ball dropout, ragged pixel dropout, coherent ball-depth jitter, and
# edge-tile flicker; no full-frame speckle/clutter/haze/bg_fill (the masked background is
# always clean far). Camera tilt +20 deg -> vertical coverage -7..+47 deg.
#
# DEPLOY NOTE: a checkpoint from this run requires an EfficientTAM ball-segmenter on
# hardware (the policy sees ball-only masked depth at train time, so it EXPECTS a clean
# far background). The physical ZED mount must match CAMERA_TILT_DEG (+20 deg).
#
# Prefer the train_runs/vision_*.sh / gimbal_*.sh wrappers, which pin the paper cohort settings
# and set the experiment name the benchmark auto-discovers.
#
# Usage:
#   ./train_dodge_single_ballonly.sh
#   ./train_dodge_single_ballonly.sh --agent.max-iterations=40000
#
# Env overrides: TASK, NUM_ENVS, STAND_RATIO, INPLACE_RATIO, DEPTH_DR_SCALE,
# FRAME_OFFSETS, CAMERA_TILT_DEG (default 20 here). Extra args -> scripts/train.py.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$REPO_ROOT"

TASK="${TASK:-Unitree-G1-AMP-Dodge-Depth-Single-BallOnly-Flat}"
NUM_ENVS="${NUM_ENVS:-8192}"
STAND_RATIO="${STAND_RATIO:-0.2}"
INPLACE_RATIO="${INPLACE_RATIO:-0.4}"
export DEPTH_DR_SCALE="${DEPTH_DR_SCALE:-1.0}"
export CAMERA_TILT_DEG="${CAMERA_TILT_DEG:-20}"
FRAME_OFFSETS="${FRAME_OFFSETS:-(0,3,8,18)}"
EXP_NAME="${EXP_NAME:-vision_link}"

echo "[train_dodge_single_ballonly.sh] task=${TASK} num_envs=${NUM_ENVS} CAMERA_TILT_DEG=${CAMERA_TILT_DEG}"
echo "[train_dodge_single_ballonly.sh] rel_standing_envs=${STAND_RATIO} rel_inplace_throw_envs=${INPLACE_RATIO} depth_dr_scale=${DEPTH_DR_SCALE} depth_frame_offsets=${FRAME_OFFSETS}"
echo "[train_dodge_single_ballonly.sh] experiment_name=${EXP_NAME} (REMINDER: physical mount + play must use the same tilt)"
echo "[train_dodge_single_ballonly.sh] extra args: $*"

PYTHONPATH="$REPO_ROOT${PYTHONPATH:+:$PYTHONPATH}" \
  exec uv run python scripts/train.py "$TASK" \
    --env.scene.num-envs="$NUM_ENVS" \
    --env.commands.twist.rel-inplace-throw-envs="$INPLACE_RATIO" \
    --env.depth-frame-offsets "$FRAME_OFFSETS" \
    --env.commands.twist.rel-standing-envs="$STAND_RATIO" \
    --agent.experiment-name="$EXP_NAME" \
    --agent.max-iterations=25000 \
    --video True \
    --video-interval 48000 \
    "$@"
