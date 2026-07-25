#!/usr/bin/env bash
# state_link_omni -- omni-throw calibration: state oracle x Link-CBF trained on 360-degree fast throws
# (OMNI_THROW=1: 8-10 m, 12-15 m/s). Benchmark WITH --omni.
set -euo pipefail
cd "$(dirname "$0")/.."
export NUM_ENVS="${NUM_ENVS:-8192}"
export STAND_RATIO=0.2
export INPLACE_RATIO=0.4
_SUF=""; [ "$NUM_ENVS" != "8192" ] && _SUF="_${NUM_ENVS}"
export OMNI_THROW=1
export EXP_NAME="state_link_omni${_SUF}"
exec ./train_dodge_state.sh "$@"
