#!/usr/bin/env bash
# state_none -- state oracle x no barrier -- ground-truth ball obs, distance-to-core reward only
# (NO_LINK_CBF=1 strips the per-link clearance CBF term).
set -euo pipefail
cd "$(dirname "$0")/.."
export NUM_ENVS="${NUM_ENVS:-8192}"
export STAND_RATIO=0.2
export INPLACE_RATIO=0.4
_SUF=""; [ "$NUM_ENVS" != "8192" ] && _SUF="_${NUM_ENVS}"
export NO_LINK_CBF=1
export EXP_NAME="state_none${_SUF}"
exec ./train_dodge_state.sh "$@"
