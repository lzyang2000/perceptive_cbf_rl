#!/usr/bin/env bash
# state_joint -- state oracle x Joint-CBF -- adds the joint-space CBF module as reward guidance
# (CBF_JOINT=1). Benchmark this checkpoint bare for the Joint-CBF cell, or with
# BENCH_CBF_FILTER=1 for the privileged '+filter' cell.
set -euo pipefail
cd "$(dirname "$0")/.."
export NUM_ENVS="${NUM_ENVS:-8192}"
export STAND_RATIO=0.2
export INPLACE_RATIO=0.4
_SUF=""; [ "$NUM_ENVS" != "8192" ] && _SUF="_${NUM_ENVS}"
export CBF_JOINT=1
export EXP_NAME="state_joint${_SUF}"
exec ./train_dodge_state.sh "$@"
