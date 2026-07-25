#!/usr/bin/env zsh
# Launch the single-cam depth-dodge policy on the real G1 (Jetson Orin).
# Three processes: camera_node + dodge_policy (background) + hardware_node
# (foreground). Mirrors wbc_mjlab/deploy/play_real_amp.sh.
#
# Usage (run with zsh -- this script uses zsh-only path expansion):
#   zsh deploy/play_real_dodge.sh                         # newest *.onnx in deploy/ckpts/
#   zsh deploy/play_real_dodge.sh path/to/model.onnx      # explicit ONNX
#   (a .pt errors: there is no mjlab on the robot -- export on the dev box first)
#
# Env overrides: CKPT_DIR (default deploy/ckpts), FRAME_OFFSETS (default
# "(0,3,8,18)" -- MUST match how the ONNX was exported), NET, CAMERA_HZ,
# KP_SCALE (default 1.0 -- position-stiffness scale on the hardware node; KD
# damping unaffected; lower for softer first runs), OBS_FAR=1 (freeze
# the depth obs at all-far -- policy sees no objects, camera still runs; diagnostic
# stand test), ZED_CONFIDENCE / ZED_TEXTURE_CONF (ZED depth outlier rejection,
# lower=stricter; defaults 50/100) + FILL_HOLES=1 (re-enable ZED FILL, off by
# default), EDGE_CROP (blank outer N px before pooling, default 10 -- drops the ZED
# stereo border artifact), DRY_RUN=1 (synthetic far frames, no camera). Verify
# play_depth_single.sh in sim first -- real hardware turns any obs/action bug into a fall.
set -e
set -o pipefail

SCRIPT_DIR=${0:A:h}                 # .../deploy
ROOT_DIR=${SCRIPT_DIR:h}           # repo root
TASK="Unitree-G1-AMP-Dodge-Depth-Single-Flat"
EXP_NAME="${EXP_NAME:-g1_amp_dodge_depth_single}"
FRAME_OFFSETS="${FRAME_OFFSETS:-(0,3,8,18)}"
CAMERA_HZ="${CAMERA_HZ:-50}"   # publish at the control rate; ZED grabs at --camera-fps (60)
KP_SCALE="${KP_SCALE:-1.0}"   # position-stiffness scale on hardware_node (KD/damp unchanged)
DRY_RUN="${DRY_RUN:-0}"

# The three node command-line patterns (each pkill -f match also catches the
# wrapping `uv run ... python <pat>` parent, which is what we want).
NODE_PATS=(
  "deploy/real/camera_node.py"
  "deploy/real/camera_node_etam.py"
  "deploy/policy/dodge_policy.py"
  "deploy/real/hardware_node.py"
)

# Tear down any running nodes. SIGTERM first so each node runs its finally block
# (camera_node closes the ZED cleanly); then wait, then SIGKILL the
# stragglers. The escalation matters because a camera_node wedged inside the ZED
# SDK's blocking C open() can't run its Python SIGTERM handler until open()
# returns -- SIGTERM alone leaves it alive, holding the single ZED, which makes
# the NEXT launch fail identically.
reap_nodes() {
  local pat
  for pat in "${NODE_PATS[@]}"; do
    pkill -TERM -f "${pat}" 2>/dev/null || true
  done
  local i
  for i in {1..10}; do  # up to ~3 s for clean exits before escalating
    pgrep -f "deploy/real/camera_node.py"    >/dev/null 2>&1 ||
    pgrep -f "deploy/policy/dodge_policy.py"  >/dev/null 2>&1 ||
    pgrep -f "deploy/real/hardware_node.py"   >/dev/null 2>&1 || break
    sleep 0.3
  done
  for pat in "${NODE_PATS[@]}"; do
    pkill -KILL -f "${pat}" 2>/dev/null || true
  done
}

CLEANED_UP=0
cleanup() {
  [[ "${CLEANED_UP}" == "1" ]] && return
  CLEANED_UP=1
  trap '' SIGINT SIGTERM EXIT
  echo -e '\nStopping...'
  reap_nodes
  kill -- -$$ 2>/dev/null || true
  fuser -k -KILL 9870/udp 2>/dev/null || true
  fuser -k -KILL 9871/udp 2>/dev/null || true
  fuser -k -KILL 9872/udp 2>/dev/null || true
  fuser -k -KILL 9873/udp 2>/dev/null || true
}

# ---------------------------------------------------------------------------
# 1. Deploy uv env (Python 3.8). No ROS: the state machine is driven by the
#    physical wireless remote only (see deploy/real/hardware_node.py).
# ---------------------------------------------------------------------------
UV_PYTHON="3.8"
UV_DEPLOY=(uv run --project "${SCRIPT_DIR}" --python "${UV_PYTHON}")

# ---------------------------------------------------------------------------
# 2. Resolve the ONNX. On the robot there is no logs/ and no mjlab to export
#    with, so default to the committed checkpoint(s) in deploy/ckpts/. Export a
#    new one on the DEV box with deploy/export_onnx.py and drop it in ckpts/.
# ---------------------------------------------------------------------------
ONNX_MODEL="${1:-}"
CKPT_DIR="${CKPT_DIR:-${SCRIPT_DIR}/ckpts}"
# WALK_ONNX (proprio-only loco walker, 384->29): if present, enable dual-mode so
# the remote Y button switches dodge<->walk. Excluded from the dodge auto-pick.
WALK_ONNX="${WALK_ONNX:-${CKPT_DIR}/walk_policy.onnx}"
if [[ -z "${ONNX_MODEL}" ]]; then
  ONNX_MODEL="$(find "${CKPT_DIR}" -name '*.onnx' ! -name 'walk_policy*.onnx' -printf '%T@ %p\n' 2>/dev/null | sort -n | tail -1 | cut -d' ' -f2-)"
  [[ -z "${ONNX_MODEL}" ]] && {
    echo "No .onnx in ${CKPT_DIR}. Export one on the dev box and copy it here:" >&2
    echo "  uv run python deploy/export_onnx.py ${TASK} <ckpt.pt> --frame-offsets '${FRAME_OFFSETS}'" >&2
    exit 1
  }
elif [[ "${ONNX_MODEL}" == *.pt ]]; then
  echo "play_real_dodge.sh runs an ONNX directly (no mjlab on the robot); got a .pt." >&2
  echo "Export it on the dev box, then pass/copy the .onnx:" >&2
  echo "  uv run python deploy/export_onnx.py ${TASK} ${ONNX_MODEL} --frame-offsets '${FRAME_OFFSETS}'" >&2
  exit 1
fi
[[ -f "${ONNX_MODEL}" ]] || { echo "ONNX not found: ${ONNX_MODEL}" >&2; exit 1; }
echo "Using ONNX: ${ONNX_MODEL}"
# Dual-mode: pass the walk policy only if it exists (else dodge-only; Y is a no-op).
WALK_FLAG=()
if [[ -f "${WALK_ONNX}" ]]; then
  WALK_FLAG=(--walk-onnx "${WALK_ONNX}")
  echo "Using WALK ONNX: ${WALK_ONNX} (remote Y toggles dodge<->walk)"
else
  echo "No walk ONNX at ${WALK_ONNX}; dodge-only (remote Y inert)."
fi

trap cleanup SIGINT SIGTERM EXIT
cd "${ROOT_DIR}"
export PYTHONPATH="${PYTHONPATH:-}:${ROOT_DIR}"

# ---------------------------------------------------------------------------
# 3. Network interface for robot DDS.
# ---------------------------------------------------------------------------
if [[ -z "${NET:-}" ]]; then
  printf "Network interface for robot DDS [default: eth0]: "
  read -r NET
  NET="${NET:-eth0}"
fi
echo "Using network interface: ${NET}"

# ---------------------------------------------------------------------------
# 4. Launch: camera (bg) -> policy (bg) -> hardware (fg).
# ---------------------------------------------------------------------------
# Reap orphans from a prior crashed/hard-killed run FIRST. A stale camera_node
# still holds the single ZED, so without this a new launch contends for a busy
# camera and dies mid-open (the recurring KeyboardInterrupt-during-open failure).
echo "Reaping any leftover dodge nodes from a previous run ..."
reap_nodes

CAM_ARGS=(--hz "${CAMERA_HZ}")
[[ "${DRY_RUN}" == "1" ]] && CAM_ARGS+=(--dry-run)
# VIEW=1: cv2 debug window (pooled depth the policy gets). Needs a display / ssh -X.
[[ "${VIEW:-0}" == "1" ]] && CAM_ARGS+=(--view)
# OBS_FAR=1: freeze the depth obs at all-far (empty image) -- camera still runs,
# but the policy sees no incoming objects and should just hold a calm stand.
[[ "${OBS_FAR:-0}" == "1" ]] && CAM_ARGS+=(--obs-far)
# ZED outlier rejection (stops empty space reading as a ~1 m near ghost): lower =
# stricter. Defaults (conf 50, texture 100, FILL off) live in camera_node; override
# here. Lower ZED_TEXTURE_CONF (e.g. 50) if a phantom near reading persists.
[[ -n "${ZED_CONFIDENCE:-}" ]]   && CAM_ARGS+=(--zed-confidence "${ZED_CONFIDENCE}")
[[ -n "${ZED_TEXTURE_CONF:-}" ]] && CAM_ARGS+=(--zed-texture-conf "${ZED_TEXTURE_CONF}")
[[ "${FILL_HOLES:-0}" == "1" ]]  && CAM_ARGS+=(--fill-holes)
# EDGE_CROP: blank the outer N px before pooling (default 30 in camera_node) to drop
# the ZED stereo border artifact. EDGE_CROP=0 disables.
[[ -n "${EDGE_CROP:-}" ]]        && CAM_ARGS+=(--edge-crop "${EDGE_CROP}")
HW_ARGS=(--kp-scale "${KP_SCALE}")
# ETAM=1: EfficientTAM ball-only masked depth instead of raw pooled depth (click the ball
# once in its window -- needs a display). TINY=1 uses the faster tiny model. FREEZE=1 latches
# the FIRST valid segmented frame and sends only that static obs (diagnostic; 'f' re-arms).
# STATIC_MASK=1 adds a looming gate: mask the tracked cluster (all-far) unless its avg depth is
# closing (a world-static ball/clutter is depth-constant; a real throw collapses depth).
# Pairs with a ball-only-trained policy; raw bg-fill ckpts see masked depth as OOD.
if [[ "${ETAM:-0}" == "1" ]]; then
  ETAM_ARGS=(--hz "${CAMERA_HZ}")
  [[ "${TINY:-0}" == "1" ]] && ETAM_ARGS+=(--tiny)
  [[ "${FREEZE:-0}" == "1" ]] && ETAM_ARGS+=(--freeze-first)
  [[ "${STATIC_MASK:-0}" == "1" ]] && ETAM_ARGS+=(--static-mask)
  echo "Starting camera_node_etam (EfficientTAM masked depth, background)..."
  "${UV_DEPLOY[@]}" python deploy/real/camera_node_etam.py "${ETAM_ARGS[@]}" &
else
  echo "Starting camera_node (background)${DRY_RUN:+ [dry-run=${DRY_RUN}]}..."
  "${UV_DEPLOY[@]}" python deploy/real/camera_node.py "${CAM_ARGS[@]}" &
fi

echo "Starting dodge_policy (background)..."
"${UV_DEPLOY[@]}" python deploy/policy/dodge_policy.py "${ONNX_MODEL}" "${WALK_FLAG[@]}" --frame-offsets "${FRAME_OFFSETS}" &

sleep 2.0

echo "Starting hardware_node (foreground) [kp_scale=${KP_SCALE}]..."
"${UV_DEPLOY[@]}" python deploy/real/hardware_node.py --net "${NET}" "${HW_ARGS[@]}"
