#!/usr/bin/env bash
# state_joint_omni -- omni-throw calibration: state oracle x Joint-CBF (OMNI_THROW=1 CBF_JOINT=1).
# Benchmark WITH --omni (add BENCH_CBF_FILTER=1 for the filtered cell).
set -euo pipefail
cd "$(dirname "$0")/.."
export NUM_ENVS="${NUM_ENVS:-8192}"
export STAND_RATIO=0.2
export INPLACE_RATIO=0.4
_SUF=""; [ "$NUM_ENVS" != "8192" ] && _SUF="_${NUM_ENVS}"
export OMNI_THROW=1
export CBF_JOINT=1
export EXP_NAME="state_joint_omni${_SUF}"
exec ./train_dodge_state.sh "$@"
