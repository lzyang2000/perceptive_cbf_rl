#!/usr/bin/env bash
# Train the proprio-only WALK policy (Unitree-G1-AMP-Flat): AMP locomotion over the
# WalkandRun motion set, actor = 384-D proprio history -> 29 joint targets.
#
# This is the policy the benchmark's Deployment regime (--walk-recover) and the hardware
# walk<->dodge mode switch use to return the robot to its station between throws
# (deploy/ckpts/walk_policy.onnx). Logs under logs/rsl_rl/walk, which
# scripts/dodge_benchmark.py --walk-recover auto-discovers.
#
# Usage:
#   ./train_walk.sh
#   ./train_walk.sh --agent.max-iterations=100000
#
# Env overrides: NUM_ENVS, EXP_NAME. Extra args -> scripts/train.py.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$REPO_ROOT"

TASK="Unitree-G1-AMP-Flat"
NUM_ENVS="${NUM_ENVS:-8192}"
EXP_NAME="${EXP_NAME:-walk}"

echo "[train_walk.sh] task=${TASK} num_envs=${NUM_ENVS} experiment_name=${EXP_NAME}"
echo "[train_walk.sh] extra args: $*"

PYTHONPATH="$REPO_ROOT${PYTHONPATH:+:$PYTHONPATH}" \
  exec uv run python scripts/train.py "$TASK" \
    --env.scene.num-envs="$NUM_ENVS" \
    --agent.experiment-name="$EXP_NAME" \
    --agent.max-iterations=60000 \
    --video True \
    --video-interval 48000 \
    "$@"
