#!/usr/bin/env bash
# vision_joint -- fixed camera x Joint-CBF -- BallOnly masked depth + joint-space CBF reward guidance
# (CBF_JOINT=1). Bare for the Joint-CBF cell; BENCH_CBF_FILTER=1 for '+filter'.
set -euo pipefail
cd "$(dirname "$0")/.."
export NUM_ENVS="${NUM_ENVS:-8192}"
export STAND_RATIO=0.2
export INPLACE_RATIO=0.4
_SUF=""; [ "$NUM_ENVS" != "8192" ] && _SUF="_${NUM_ENVS}"
export CBF_JOINT=1
export EXP_NAME="vision_joint${_SUF}"
exec ./train_dodge_single_ballonly.sh "$@"
