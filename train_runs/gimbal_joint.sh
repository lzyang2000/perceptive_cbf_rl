#!/usr/bin/env bash
# gimbal_joint -- gimbal camera x Joint-CBF -- oracle-aimed gimbal + joint-space CBF reward guidance
# (CBF_JOINT=1). Bare for the Joint-CBF cell; BENCH_CBF_FILTER=1 for '+filter'.
set -euo pipefail
cd "$(dirname "$0")/.."
export NUM_ENVS="${NUM_ENVS:-8192}"
export STAND_RATIO=0.2
export INPLACE_RATIO=0.4
_SUF=""; [ "$NUM_ENVS" != "8192" ] && _SUF="_${NUM_ENVS}"
export CAMERA_GIMBAL=1
export CAMERA_PROPRIO=1
export CBF_JOINT=1
export EXP_NAME="gimbal_joint${_SUF}"
exec ./train_dodge_single_ballonly.sh "$@"
