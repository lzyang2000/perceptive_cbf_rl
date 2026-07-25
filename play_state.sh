#!/usr/bin/env bash
# Play / visualize the trained STATE-BASED (oracle) dodge policy
# (Unitree-G1-AMP-Dodge-MimicKit-Flat) in the viser web viewer (default http://localhost:8080).
# This is the MimicKit/SMP faithful baseline: the actor sees the GROUND-TRUTH 6-D ball state
# (relative pos + vel in the heading frame) directly -- NO camera, NO depth. It is the PERCEPTION
# UPPER BOUND for the dodge task: how well the robot can dodge when it knows the ball perfectly.
# Use it as the ceiling to compare the single-depth policy against. Works headless.
#
# No depth obs, so there are no depth panels and no --depth-frame-offsets / --depth-aug flags
# (unlike play_depth_single.sh). Just the scene + the robot dodging thrown balls.
#
# The first positional arg is a direct checkpoint path; omit it to use the newest model_*.pt under
# the experiment dir (logs/rsl_rl/state_link).
#
# Usage:
#   ./play_state.sh                                          # newest checkpoint
#   ./play_state.sh logs/rsl_rl/state_link/<run>/model_25000.pt
#   RUN=2026-06-02_19-35-53 ./play_state.sh                  # newest under a specific run dir
#   NUM_ENVS=9 ./play_state.sh                               # more robots on screen
#   ./play_state.sh --video True                             # forward extra play.py flags
#
# Env overrides: RUN, NUM_ENVS, EXP_NAME, RESET_STAND. Extra args -> scripts/play.py.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$REPO_ROOT"

TASK="Unitree-G1-AMP-Dodge-MimicKit-Flat"

# First positional arg (anything not starting with '-') = direct checkpoint path.
CKPT=""
if [[ $# -gt 0 && "$1" != -* ]]; then
  CKPT="$1"
  shift
fi

EXP_NAME="${EXP_NAME:-state_link}"
EXP_DIR="logs/rsl_rl/${EXP_NAME}"

# No explicit checkpoint path -> newest model_*.pt under the RUN dir (if set) or the experiment dir.
if [[ -z "$CKPT" ]]; then
  SEARCH_DIR="$EXP_DIR"
  [[ -n "${RUN:-}" ]] && SEARCH_DIR="${EXP_DIR}/${RUN}"
  CKPT="$(find "$SEARCH_DIR" -name 'model_*.pt' -printf '%T@ %p\n' 2>/dev/null \
            | sort -n | tail -1 | cut -d' ' -f2-)"
  if [[ -z "$CKPT" ]]; then
    echo "[play_state.sh] No model_*.pt under ${SEARCH_DIR}. Pass a checkpoint path as arg 1." >&2
    exit 1
  fi
elif [[ ! -f "$CKPT" ]]; then
  echo "[play_state.sh] Checkpoint not found: ${CKPT}" >&2
  exit 1
fi

NUM_ENVS="${NUM_ENVS:-1}"
RESET_STAND="${RESET_STAND:-True}"

echo "[play_state.sh] task=${TASK} (state-based oracle, ground-truth ball obs)"
echo "[play_state.sh] checkpoint=${CKPT}"
echo "[play_state.sh] num_envs=${NUM_ENVS} viewer=viser reset_stand=${RESET_STAND}"
echo "[play_state.sh] extra args: $*"

PYTHONPATH="$REPO_ROOT${PYTHONPATH:+:$PYTHONPATH}" \
  exec uv run python scripts/play.py "$TASK" \
    --checkpoint-file "$CKPT" \
    --num-envs "$NUM_ENVS" \
    --viewer viser \
    --reset-stand "$RESET_STAND" \
    "$@"
