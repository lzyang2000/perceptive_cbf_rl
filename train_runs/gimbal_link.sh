#!/usr/bin/env bash
# gimbal_link -- gimbal camera x Link-CBF -- oracle-aimed camera-pitch gimbal + per-link CBF reward.
set -euo pipefail
cd "$(dirname "$0")/.."
export NUM_ENVS="${NUM_ENVS:-8192}"
export STAND_RATIO=0.2
export INPLACE_RATIO=0.4
_SUF=""; [ "$NUM_ENVS" != "8192" ] && _SUF="_${NUM_ENVS}"
export CAMERA_GIMBAL=1
export CAMERA_PROPRIO=1
export EXP_NAME="gimbal_link${_SUF}"
exec ./train_dodge_single_ballonly.sh "$@"
