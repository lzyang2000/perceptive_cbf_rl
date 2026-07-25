#!/usr/bin/env bash
# state_link -- state oracle x Link-CBF -- ground-truth ball obs + per-link clearance CBF reward
# (the base recipe; this is the reward stack deployed on hardware, on the vision policy).
set -euo pipefail
cd "$(dirname "$0")/.."
export NUM_ENVS="${NUM_ENVS:-8192}"
export STAND_RATIO=0.2
export INPLACE_RATIO=0.4
_SUF=""; [ "$NUM_ENVS" != "8192" ] && _SUF="_${NUM_ENVS}"
export EXP_NAME="state_link${_SUF}"
exec ./train_dodge_state.sh "$@"
