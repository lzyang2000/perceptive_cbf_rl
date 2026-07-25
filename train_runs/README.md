# train_runs: the paper's training cohort

One script per cell of the paper's perception x safety grid. Each wrapper pins the
cohort settings (`NUM_ENVS=8192`, `STAND_RATIO=0.2`, `INPLACE_RATIO=0.4`, 25k max
iterations) and exports `EXP_NAME=<key>`, so `scripts/dodge_benchmark.py`
auto-discovers the newest checkpoint under `logs/rsl_rl/<key>/`.

All results in the paper are reported at a matched 20k-iteration checkpoint
(`model_20000.pt`); pass `--ckpt logs/rsl_rl/<key>/<run>/model_20000.pt` to the
benchmark to pin it explicitly instead of using the newest checkpoint.

Override the environment count with `NUM_ENVS=<n>` (a non-default count suffixes the
experiment name, e.g. `state_link_4096`). The state tasks render no depth and train
fastest; the vision/gimbal tasks are render-bound.

## The grid

| Perception | No barrier | Link-CBF | Joint-CBF (+filter) |
|---|---|---|---|
| State oracle | `state_none.sh` | `state_link.sh` | `state_joint.sh` |
| Fixed camera | `vision_none.sh` | `vision_link.sh` (**deployed**) | `vision_joint.sh` |
| Gimbal camera | `gimbal_none.sh` | `gimbal_link.sh` | `gimbal_joint.sh` |

- **No barrier**: distance-to-core reward only (`NO_LINK_CBF=1`).
- **Link-CBF**: adds the per-link clearance barrier reward. `vision_link` is the
  configuration deployed on hardware (`deploy/ckpts/dodge_link_cbf.onnx`).
- **Joint-CBF**: additionally trains with the joint-space CBF module as reward
  guidance (`CBF_JOINT=1`). Evaluated bare by default; the paper's "+filter" cells
  re-evaluate the same checkpoint with `BENCH_CBF_FILTER=1` (privileged: the runtime
  projection reads ground-truth ball state, so it is not hardware-deployable).
- **Gimbal**: the same BallOnly depth task with the camera on an oracle-aimed
  +/-30 degree pitch hinge (`CAMERA_GIMBAL=1 CAMERA_PROPRIO=1`); a simulation
  ceiling for what better aim buys.

## Omni-throw calibration

`state_link_omni.sh` / `state_joint_omni.sh` train the state oracle against
360-degree fast throws (`OMNI_THROW=1`: 8-10 m, 12-15 m/s). Evaluate WITH
`--omni`; the benchmark runs these keys by default only when `--omni` is passed.

## Walk policy (Deployment regime)

`../train_walk.sh` trains the proprio-only walk policy (`Unitree-G1-AMP-Flat`,
experiment name `walk`) used by the benchmark's `--walk-recover` regime and the
hardware walk<->dodge mode switch.

## Benchmarking a trained cohort

```bash
# Reset regime (one throw per env from a clean stand), statue floor included:
uv run python scripts/dodge_benchmark.py

# Deployment regime (walk policy returns the robot to its station between throws):
uv run python scripts/dodge_benchmark.py --walk-recover

# One cell / the "+filter" cells / the omni calibration:
uv run python scripts/dodge_benchmark.py --only vision_link
BENCH_CBF_FILTER=1 uv run python scripts/dodge_benchmark.py --only state_joint
uv run python scripts/dodge_benchmark.py --omni
```
