"""Replay motion_data_csv 36-col CSV clips on the G1 -> one labeled mp4.

Sibling of ``visualize_leap_motions.py`` that reads the headerless 36-col AMP CSVs
(``x,y,z (m), qx,qy,qz,qw, 29 joints (rad)``) directly -- so it works on clips that
exist only as CSV (e.g. restored ``motion_data_csv`` extras), no npz needed. Reuses that
script's MuJoCo setup, upper-left name label, and offscreen video writer.

Example:
    uv run python scripts/visualize_motion_csvs.py \
        --motion-dir motion_data_csv/amp_dodge --video-output amp_dodge_clips.mp4
"""
from __future__ import annotations

from pathlib import Path
from typing import Any

import numpy as np
import torch
import tyro

import mjlab
from mjlab.entity import Entity
from mjlab.scene import Scene
from mjlab.sim.sim import Simulation, SimulationCfg
from mjlab.tasks.tracking.config.g1.env_cfgs import unitree_g1_flat_tracking_env_cfg

# Reuse the leap viz machinery (label drawing, frame writer, offscreen/window runners).
from visualize_leap_motions import _run_offscreen, _run_window  # noqa: E402


def _load_clip_csv(path: Path, device: str, src_fps: float, target_fps: float) -> dict[str, Any]:
    """Load a 36-col AMP CSV, subsample to target_fps, into the leap-viz clip dict.

    CSV quaternion is XYZW; the sim root state wants WXYZ. Velocities aren't in the CSV
    (and don't affect the rendered pose -- it's pure forward-kinematics from qpos), so they
    are zero-filled.
    """
    a = np.loadtxt(path, delimiter=",")
    if a.ndim == 1:
        a = a[None, :]
    stride = max(1, round(src_fps / target_fps))
    a = a[::stride]
    T = a.shape[0]
    q_xyzw = a[:, 3:7]
    q_wxyz = np.concatenate([q_xyzw[:, 3:4], q_xyzw[:, 0:3]], axis=1)
    t = lambda x: torch.tensor(x, dtype=torch.float32, device=device)  # noqa: E731
    z = lambda *s: torch.zeros(s, dtype=torch.float32, device=device)  # noqa: E731
    return {
        "name": path.stem,
        "fps": src_fps / stride,
        "num_frames": T,
        "root_pos": t(a[:, 0:3]),
        "root_quat": t(q_wxyz),
        "root_lin_vel": z(T, 3),
        "root_ang_vel": z(T, 3),
        "joint_pos": t(a[:, 7:36]),
        "joint_vel": z(T, 29),
    }


def main(
    motion_dir: str = "motion_data_csv/amp_dodge",
    video_output: str = "amp_dodge_clips.mp4",
    src_fps: float = 120.0,
    target_fps: float = 30.0,
    realtime_scale: float = 1.0,
    render_backend: str = "offscreen",
    device: str = "cuda:0",
) -> None:
    """Replay every *.csv under motion_dir on the G1, labeled with the clip name.

    Args:
      motion_dir: dir of 36-col AMP CSVs (sorted by name; alternates land adjacent).
      video_output: output mp4 (offscreen backend).
      src_fps: source CSV rate (seed-derived clips are 120 fps).
      target_fps: subsample to this for a standard, viewable video.
      realtime_scale: 1.0 = real time; 0.5 = half speed.
      render_backend: "offscreen" (mp4) or "window" (live viewer).
    """
    paths = sorted(Path(motion_dir).glob("*.csv"))
    if not paths:
        raise FileNotFoundError(f"No .csv clips under {motion_dir}")
    print(f"Found {len(paths)} CSV clip(s) under {motion_dir}")

    scene = Scene(unitree_g1_flat_tracking_env_cfg().scene, device=device)
    model = scene.compile()
    sim = Simulation(num_envs=1, cfg=SimulationCfg(), model=model, device=device)
    scene.initialize(sim.mj_model, sim.model, sim.data)
    robot: Entity = scene["robot"]
    scene.reset()

    clips = [_load_clip_csv(p, device, src_fps, target_fps) for p in paths]
    total = sum(c["num_frames"] for c in clips)
    print(f"{total} frames @ {target_fps:.0f} fps -> ~{total/target_fps:.0f}s video")

    if render_backend == "offscreen":
        _run_offscreen(sim, scene, robot, clips, video_output, realtime_scale)
    else:
        _run_window(sim, scene, robot, clips, False, realtime_scale, 0.5)


if __name__ == "__main__":
    tyro.cli(main, config=mjlab.TYRO_FLAGS)
