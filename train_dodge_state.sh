#!/usr/bin/env bash
# Train the STATE-BASED (oracle) dodge policy (Unitree-G1-AMP-Dodge-MimicKit-Flat): the MimicKit/SMP
# faithful baseline where the actor sees the GROUND-TRUTH 6-D ball state (relative pos+vel in the
# heading frame) directly -- NO camera, NO depth. This is the PERCEPTION UPPER BOUND: how well the
# robot can dodge when it knows the ball perfectly. Use it as the ceiling to judge the single-depth
# policy against.
#
# No camera, so this is the FASTEST dodge task to train (no depth rendering).
#
# "Standing ratio" = rel_standing_envs (permanently-standing ball-free anchor); "In-place ratio" =
# rel_inplace_throw_envs (zero velocity but pelted -> dodge from a standstill).
#
# Prefer the train_runs/state_*.sh wrappers, which pin the paper cohort settings and set the
# experiment name the benchmark auto-discovers.
#
# Usage:
#   ./train_dodge_state.sh                           # stand 0.2, inplace 0.4, 8192 envs, 25k iters
#   ./train_dodge_state.sh --agent.max-iterations=40000   # forward extra train.py flags
#
# Env overrides: TASK, NUM_ENVS, STAND_RATIO, INPLACE_RATIO. Extra args -> scripts/train.py.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$REPO_ROOT"

TASK="${TASK:-Unitree-G1-AMP-Dodge-MimicKit-Flat}"
NUM_ENVS="${NUM_ENVS:-8192}"
STAND_RATIO="${STAND_RATIO:-0.2}"
INPLACE_RATIO="${INPLACE_RATIO:-0.4}"
EXP_NAME="${EXP_NAME:-state_link}"  # honor EXP_NAME so runs get distinct log dirs

echo "[train_dodge_state.sh] task=${TASK} num_envs=${NUM_ENVS} experiment_name=${EXP_NAME}"
echo "[train_dodge_state.sh] rel_standing_envs=${STAND_RATIO} rel_inplace_throw_envs=${INPLACE_RATIO}"
echo "[train_dodge_state.sh] extra args: $*"

PYTHONPATH="$REPO_ROOT${PYTHONPATH:+:$PYTHONPATH}" \
  exec uv run python scripts/train.py "$TASK" \
    --env.scene.num-envs="$NUM_ENVS" \
    --env.commands.twist.rel-inplace-throw-envs="$INPLACE_RATIO" \
    --env.commands.twist.rel-standing-envs="$STAND_RATIO" \
    --agent.experiment-name="$EXP_NAME" \
    --agent.max-iterations=25000 \
    --video True \
    --video-interval 48000 \
    "$@"
