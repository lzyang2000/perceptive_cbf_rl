"""Dev-box ONNX exporter: dodge .pt -> .onnx. NEVER run on the robot (imports mjlab).

Thin wrapper over the same machinery scripts/play.py uses to export the actor
(``runner.export_policy_to_onnx``). Builds the play env at num_envs=1 on CPU with
the given depth frame offsets (so the actor input dim matches the checkpoint),
loads the checkpoint into the task's runner, and writes ``<ckpt_stem>.onnx`` next
to the checkpoint.

    uv run python deploy/export_onnx.py <task_id> <checkpoint.pt> [--frame-offsets '(0,3,8,18)']

e.g.
    uv run python deploy/export_onnx.py Unitree-G1-AMP-Dodge-Depth-Single-Flat \
        logs/rsl_rl/g1_amp_dodge_depth_single/<run>/model_24999.pt
"""

import argparse
import ast
import os
import sys
from dataclasses import asdict
from pathlib import Path

_REPO_ROOT = Path(__file__).resolve().parent.parent
if str(_REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(_REPO_ROOT))


def main():
    parser = argparse.ArgumentParser(description="Export a dodge checkpoint to ONNX (dev box)")
    parser.add_argument("task_id")
    parser.add_argument("checkpoint")
    parser.add_argument(
        "--frame-offsets", default="(0,3,8,18)",
        help="Depth frame offsets the checkpoint was trained with (Python-literal tuple). "
             "Sets env.depth_frame_offsets so the actor input dim matches.",
    )
    args = parser.parse_args()

    if not os.path.exists(args.checkpoint):
        print(f"Error: checkpoint not found: {args.checkpoint}")
        sys.exit(1)

    # Importing the task config registers the dodge tasks with mjlab's registry.
    import src.tasks.amp_loco.config.g1 as _g1  # noqa: F401
    from mjlab.envs import ManagerBasedRlEnv
    from mjlab.rl import MjlabOnPolicyRunner, RslRlVecEnvWrapper
    from mjlab.tasks.registry import load_env_cfg, load_rl_cfg, load_runner_cls

    device = "cpu"
    offsets = tuple(ast.literal_eval(args.frame_offsets))

    print(f"Loading task: {args.task_id}  (frame_offsets={offsets})")
    env_cfg = load_env_cfg(args.task_id, play=True)
    agent_cfg = load_rl_cfg(args.task_id)
    runner_cls = load_runner_cls(args.task_id) or MjlabOnPolicyRunner

    # DepthImageObs reads env.cfg.depth_frame_offsets at instantiation -> set before build.
    env_cfg.depth_frame_offsets = offsets
    env_cfg.scene.num_envs = 1

    env = ManagerBasedRlEnv(cfg=env_cfg, device=device)
    env = RslRlVecEnvWrapper(env, clip_actions=agent_cfg.clip_actions)

    runner = runner_cls(env, asdict(agent_cfg), device=device)
    print(f"Loading checkpoint: {args.checkpoint}")
    runner.load(args.checkpoint)

    ckpt = Path(args.checkpoint).resolve()
    onnx_path = ckpt.with_suffix(".onnx")
    # runner.export_policy_to_onnx(dir, filename) bakes the obs normalizer into the
    # exported actor (deploy feeds raw obs). Replaces the old scripts.play helper,
    # which became a nested function and is no longer importable.
    runner.export_policy_to_onnx(str(onnx_path.parent), onnx_path.name)
    print(f"Exported ONNX to: {onnx_path}")


if __name__ == "__main__":
    main()
