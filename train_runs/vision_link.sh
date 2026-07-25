#!/usr/bin/env bash
# vision_link -- fixed camera x Link-CBF -- BallOnly masked depth + per-link clearance CBF reward.
# THE DEPLOYED CONFIGURATION (deploy/ckpts/dodge_link_cbf.onnx comes from this recipe).
set -euo pipefail
cd "$(dirname "$0")/.."
export NUM_ENVS="${NUM_ENVS:-8192}"
export STAND_RATIO=0.2
export INPLACE_RATIO=0.4
_SUF=""; [ "$NUM_ENVS" != "8192" ] && _SUF="_${NUM_ENVS}"
export EXP_NAME="vision_link${_SUF}"
exec ./train_dodge_single_ballonly.sh "$@"
