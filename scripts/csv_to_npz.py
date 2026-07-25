# python scripts/csv_to_npz.py \
#   --input-file motion_data_csv/lafan1/fallAndGetUp1_subject1.csv \
#   --output-name fallAndGetUp1_subject1.npz \
#   --input-fps 30 \
#   --output-fps 50 \
#   --line-range "(408,1953)" \
#   --render True \
#   --render-backend window \
#   --window-realtime True \
#   --window-realtime-scale 1.0

# python scripts/csv_to_npz.py \
#   --input-file src/assets/motions/g1/dance1_subject2.csv \
#   --output-name dance1_subject2.npz \
#   --input-fps 30 \
#   --output-fps 50 \
#   --render True \
#   --render-backend offscreen \
#   --video-output src/assets/motions/g1/dance1_subject2.mp4

# python scripts/csv_to_npz.py \
#   --input-dir /home/crp/wbc_mjlab/motion_data_csv/amp \
#   --output-dir /home/crp/wbc_mjlab/motion_data_npz/amp \
#   --input-fps 120 \
#   --output-fps 50 \
#   --render True \
#   --render-backend window \
#   --window-realtime True \
#   --window-realtime-scale 1.0


from pathlib import Path
import time
from typing import Any, Literal

import mujoco
import mujoco.viewer as mj_viewer
import numpy as np
import torch
import tyro
from tqdm import tqdm

import mjlab
from mjlab.entity import Entity
from mjlab.scene import Scene
from mjlab.sim.sim import Simulation, SimulationCfg
from mjlab.tasks.tracking.config.g1.env_cfgs import unitree_g1_flat_tracking_env_cfg
from mjlab.utils.lab_api.math import (
  axis_angle_from_quat,
  quat_conjugate,
  quat_mul,
  quat_slerp,
)
from mjlab.viewer.offscreen_renderer import OffscreenRenderer
from mjlab.viewer.viewer_config import ViewerConfig


class MotionLoader:
  def __init__(
    self,
    motion_file: str,
    input_fps: int,
    output_fps: int,
    device: torch.device | str,
    line_range: tuple[int, int] | None = None,
  ):
    self.motion_file = motion_file
    self.input_fps = input_fps
    self.output_fps = output_fps
    self.input_dt = 1.0 / self.input_fps
    self.output_dt = 1.0 / self.output_fps
    self.current_idx = 0
    self.device = device
    self.line_range = line_range
    self._load_motion()
    self._interpolate_motion()
    self._compute_velocities()

  def _load_motion(self):
    """Loads the motion from the csv file."""
    if self.line_range is None:
      motion = torch.from_numpy(np.loadtxt(self.motion_file, delimiter=","))
    else:
      motion = torch.from_numpy(
        np.loadtxt(
          self.motion_file,
          delimiter=",",
          skiprows=self.line_range[0] - 1,
          max_rows=self.line_range[1] - self.line_range[0] + 1,
        )
      )
    motion = motion.to(torch.float32).to(self.device)
    # motion[:, 2] -= 0.05
    self.motion_base_poss_input = motion[:, :3]
    self.motion_base_rots_input = motion[:, 3:7]
    self.motion_base_rots_input = self.motion_base_rots_input[
      :, [3, 0, 1, 2]
    ]  # convert to wxyz
    self.motion_dof_poss_input = motion[:, 7:]

    self.input_frames = motion.shape[0]
    self.duration = (self.input_frames - 1) * self.input_dt

  def _interpolate_motion(self):
    """Interpolates the motion to the output fps."""
    times = torch.arange(
      0, self.duration, self.output_dt, device=self.device, dtype=torch.float32
    )
    self.output_frames = times.shape[0]
    index_0, index_1, blend = self._compute_frame_blend(times)
    self.motion_base_poss = self._lerp(
      self.motion_base_poss_input[index_0],
      self.motion_base_poss_input[index_1],
      blend.unsqueeze(1),
    )
    self.motion_base_rots = self._slerp(
      self.motion_base_rots_input[index_0],
      self.motion_base_rots_input[index_1],
      blend,
    )
    self.motion_dof_poss = self._lerp(
      self.motion_dof_poss_input[index_0],
      self.motion_dof_poss_input[index_1],
      blend.unsqueeze(1),
    )
    print(
      f"Motion interpolated, input frames: {self.input_frames}, "
      f"input fps: {self.input_fps}, "
      f"output frames: {self.output_frames}, "
      f"output fps: {self.output_fps}"
    )

  def _lerp(
    self, a: torch.Tensor, b: torch.Tensor, blend: torch.Tensor
  ) -> torch.Tensor:
    """Linear interpolation between two tensors."""
    return a * (1 - blend) + b * blend

  def _slerp(
    self, a: torch.Tensor, b: torch.Tensor, blend: torch.Tensor
  ) -> torch.Tensor:
    """Spherical linear interpolation between two quaternions."""
    slerped_quats = torch.zeros_like(a)
    for i in range(a.shape[0]):
      slerped_quats[i] = quat_slerp(a[i], b[i], float(blend[i]))
    return slerped_quats

  def _compute_frame_blend(
    self, times: torch.Tensor
  ) -> tuple[torch.Tensor, torch.Tensor, torch.Tensor]:
    """Computes the frame blend for the motion."""
    phase = times / self.duration
    index_0 = (phase * (self.input_frames - 1)).floor().long()
    index_1 = torch.minimum(index_0 + 1, torch.tensor(self.input_frames - 1))
    blend = phase * (self.input_frames - 1) - index_0
    return index_0, index_1, blend

  def _compute_velocities(self):
    """Computes the velocities of the motion."""
    self.motion_base_lin_vels = torch.gradient(
      self.motion_base_poss, spacing=self.output_dt, dim=0
    )[0]
    self.motion_dof_vels = torch.gradient(
      self.motion_dof_poss, spacing=self.output_dt, dim=0
    )[0]
    self.motion_base_ang_vels = self._so3_derivative(
      self.motion_base_rots, self.output_dt
    )

  def _so3_derivative(self, rotations: torch.Tensor, dt: float) -> torch.Tensor:
    """Computes the derivative of a sequence of SO3 rotations.

    Args:
      rotations: shape (B, 4).
      dt: time step.
    Returns:
      shape (B, 3).
    """
    q_prev, q_next = rotations[:-2], rotations[2:]
    q_rel = quat_mul(q_next, quat_conjugate(q_prev))  # shape (B−2, 4)

    omega = axis_angle_from_quat(q_rel) / (2.0 * dt)  # shape (B−2, 3)
    omega = torch.cat(
      [omega[:1], omega, omega[-1:]], dim=0
    )  # repeat first and last sample
    return omega

  def get_next_state(
    self,
  ) -> tuple[
    tuple[
      torch.Tensor,
      torch.Tensor,
      torch.Tensor,
      torch.Tensor,
      torch.Tensor,
      torch.Tensor,
    ],
    bool,
  ]:
    """Gets the next state of the motion."""
    state = (
      self.motion_base_poss[self.current_idx : self.current_idx + 1],
      self.motion_base_rots[self.current_idx : self.current_idx + 1],
      self.motion_base_lin_vels[self.current_idx : self.current_idx + 1],
      self.motion_base_ang_vels[self.current_idx : self.current_idx + 1],
      self.motion_dof_poss[self.current_idx : self.current_idx + 1],
      self.motion_dof_vels[self.current_idx : self.current_idx + 1],
    )
    self.current_idx += 1
    reset_flag = False
    if self.current_idx >= self.output_frames:
      self.current_idx = 0
      reset_flag = True
    return state, reset_flag


def run_sim(
  sim: Simulation,
  scene: Scene,
  joint_names,
  input_file,
  input_fps,
  output_fps,
  output_name,
  output_dir,
  render,
  line_range,
  renderer: OffscreenRenderer | None = None,
  window_viewer: Any | None = None,
  video_output: str | None = None,
  window_realtime: bool = False,
  window_realtime_scale: float = 1.0,
):
  motion = MotionLoader(
    motion_file=input_file,
    input_fps=input_fps,
    output_fps=output_fps,
    device=sim.device,
    line_range=line_range,
  )

  robot: Entity = scene["robot"]
  robot_joint_indexes = robot.find_joints(joint_names, preserve_order=True)[0]

  log: dict[str, Any] = {
    "fps": [output_fps],
    "joint_pos": [],
    "joint_vel": [],
    "body_pos_w": [],
    "body_quat_w": [],
    "body_lin_vel_w": [],
    "body_ang_vel_w": [],
  }
  file_saved = False

  frames = []
  scene.reset()

  print(f"\nStarting simulation with {motion.output_frames} frames...")
  if render:
    if window_viewer is not None:
      print("Rendering enabled - showing native MuJoCo window...")
    else:
      print("Rendering enabled - generating offscreen video frames...")

  # Create progress bar
  pbar = tqdm(
    total=motion.output_frames,
    desc="Processing frames",
    unit="frame",
    ncols=100,
    bar_format="{l_bar}{bar}| {n_fmt}/{total_fmt} [{elapsed}<{remaining}, {rate_fmt}]",
  )

  frame_count = 0
  wall_start_time = time.perf_counter()
  while not file_saved:
    (
      (
        motion_base_pos,
        motion_base_rot,
        motion_base_lin_vel,
        motion_base_ang_vel,
        motion_dof_pos,
        motion_dof_vel,
      ),
      reset_flag,
    ) = motion.get_next_state()

    root_states = robot.data.default_root_state.clone()
    root_states[:, 0:3] = motion_base_pos
    root_states[:, :2] += scene.env_origins[:, :2]
    root_states[:, 3:7] = motion_base_rot
    root_states[:, 7:10] = motion_base_lin_vel
    root_states[:, 10:] = motion_base_ang_vel
    robot.write_root_state_to_sim(root_states)

    joint_pos = robot.data.default_joint_pos.clone()
    joint_vel = robot.data.default_joint_vel.clone()
    joint_pos[:, robot_joint_indexes] = motion_dof_pos
    joint_vel[:, robot_joint_indexes] = motion_dof_vel
    robot.write_joint_state_to_sim(joint_pos, joint_vel)

    sim.forward()
    scene.update(sim.mj_model.opt.timestep)

    if render and renderer is not None:
      renderer.update(sim.data)
      frames.append(renderer.render())
    if render and window_viewer is not None:
      if not window_viewer.is_running():
        print("Window closed by user, stopping simulation loop.")
        pbar.close()
        break

      if sim.mj_model.nq > 0:
        sim.mj_data.qpos[:] = sim.data.qpos[0].cpu().numpy()
        sim.mj_data.qvel[:] = sim.data.qvel[0].cpu().numpy()
      if sim.mj_model.nmocap > 0:
        sim.mj_data.mocap_pos[:] = sim.data.mocap_pos[0].cpu().numpy()
        sim.mj_data.mocap_quat[:] = sim.data.mocap_quat[0].cpu().numpy()
      sim.mj_data.xfrc_applied[:] = sim.data.xfrc_applied[0].cpu().numpy()
      mujoco.mj_forward(sim.mj_model, sim.mj_data)
      window_viewer.sync()

      if window_realtime:
        sim_elapsed = frame_count / output_fps
        target_elapsed = sim_elapsed / max(window_realtime_scale, 1e-6)
        now_elapsed = time.perf_counter() - wall_start_time
        sleep_s = target_elapsed - now_elapsed
        if sleep_s > 0:
          time.sleep(sleep_s)

    if not file_saved:
      log["joint_pos"].append(robot.data.joint_pos[0, :].cpu().numpy().copy())
      log["joint_vel"].append(robot.data.joint_vel[0, :].cpu().numpy().copy())
      log["body_pos_w"].append(robot.data.body_link_pos_w[0, :].cpu().numpy().copy())
      log["body_quat_w"].append(robot.data.body_link_quat_w[0, :].cpu().numpy().copy())
      log["body_lin_vel_w"].append(
        robot.data.body_link_lin_vel_w[0, :].cpu().numpy().copy()
      )
      log["body_ang_vel_w"].append(
        robot.data.body_link_ang_vel_w[0, :].cpu().numpy().copy()
      )

      torch.testing.assert_close(
        robot.data.body_link_lin_vel_w[0, 0], motion_base_lin_vel[0]
      )
      torch.testing.assert_close(
        robot.data.body_link_ang_vel_w[0, 0], motion_base_ang_vel[0]
      )

      frame_count += 1
      pbar.update(1)

      if frame_count % 100 == 0:  # Update every 100 frames to avoid spam
        elapsed_time = frame_count / output_fps
        pbar.set_description(f"Processing frames (t={elapsed_time:.1f}s)")

      if reset_flag and not file_saved:
        file_saved = True
        pbar.close()

        print("\nStacking arrays and saving data...")
        for k in (
          "joint_pos",
          "joint_vel",
          "body_pos_w",
          "body_quat_w",
          "body_lin_vel_w",
          "body_ang_vel_w",
        ):
          log[k] = np.stack(log[k], axis=0)
        output_dir_path = Path(output_dir)
        output_dir_path.mkdir(parents=True, exist_ok=True)
        np.savez(str(output_dir_path / output_name), **log)  # type: ignore[arg-type]

        if render and renderer is not None and frames:
          mp4_path = Path(video_output) if video_output is not None else None
          if mp4_path is None:
            default_mp4_name = Path(output_name).with_suffix(".mp4").name
            mp4_path = output_dir_path / default_mp4_name
          mp4_path.parent.mkdir(parents=True, exist_ok=True)

          try:
            import imageio.v3 as iio
          except ImportError as exc:
            raise RuntimeError(
              "Saving mp4 requires imageio. Install with: pip install imageio[ffmpeg]"
            ) from exc

          print(f"Saving offscreen video to: {mp4_path}")
          iio.imwrite(str(mp4_path), np.stack(frames, axis=0), fps=output_fps)


def main(
  input_file: str | None = None,
  output_name: str | None = None,
  input_dir: str | None = None,
  output_dir: str = "./motion_data_npz/amp/Recovery",
  input_fps: float = 30.0,
  output_fps: float = 50.0,
  device: str = "cuda:0",
  render: bool = False,
  render_backend: Literal["offscreen", "window"] = "offscreen",
  window_realtime: bool = False,
  window_realtime_scale: float = 1.0,
  video_output: str | None = None,
  render_entity_name: str | None = "robot",
  line_range: tuple[int, int] | None = None,
):
  """Replay motion from CSV file and output to npz file.

  Args:
    input_file: Path to a single input CSV file.
    output_name: Output npz filename (used with input_file).
    input_dir: Directory containing CSV files for batch conversion.
    output_dir: Directory to save output npz files.
    input_fps: Frame rate of the CSV file.
    output_fps: Desired output frame rate.
    device: Device to use.
    render: Whether to render the simulation.
    render_backend: Rendering backend (offscreen or window).
    window_realtime: Keep window playback aligned with wall-clock time.
    window_realtime_scale: Realtime speed scale (1.0 real-time, 2.0 twice speed).
    video_output: Optional output path for mp4 video (offscreen backend only).
    render_entity_name: Entity to track when rendering with ASSET_ROOT camera.
    line_range: Range of lines to process from the CSV file.
  """
  if input_file is None and input_dir is None:
    raise ValueError("Either --input_file or --input_dir must be specified.")

  if input_dir is not None:
    csv_files = sorted(Path(input_dir).glob("*.csv"))
    if not csv_files:
      raise FileNotFoundError(f"No CSV files found in {input_dir}")
    file_pairs = [(str(f), f.with_suffix(".npz").name) for f in csv_files]
    print(f"Found {len(csv_files)} CSV files in {input_dir}")
  else:
    assert input_file is not None
    if output_name is None:
      output_name = Path(input_file).with_suffix(".npz").name
    file_pairs = [(input_file, output_name)]
  sim_cfg = SimulationCfg()
  sim_cfg.mujoco.timestep = 1.0 / output_fps

  scene = Scene(unitree_g1_flat_tracking_env_cfg().scene, device=device)
  model = scene.compile()

  sim = Simulation(num_envs=1, cfg=sim_cfg, model=model, device=device)

  scene.initialize(sim.mj_model, sim.model, sim.data)

  renderer = None
  if render and render_backend == "offscreen":
    viewer_cfg = ViewerConfig(
      height=480,
      width=640,
      origin_type=ViewerConfig.OriginType.ASSET_ROOT,
      distance=2.0,
      elevation=-5.0,
      azimuth=20,
    )

    # OffscreenRenderer needs entity_name when ASSET_ROOT is used in a multi-entity scene.
    if viewer_cfg.origin_type == ViewerConfig.OriginType.ASSET_ROOT:
      if render_entity_name is not None:
        viewer_cfg.entity_name = render_entity_name
      elif len(scene.entities) == 1:
        viewer_cfg.entity_name = next(iter(scene.entities.keys()))

    renderer = OffscreenRenderer(
      model=sim.mj_model,
      cfg=viewer_cfg,
      scene=scene,
    )
    renderer.initialize()

  joint_names = [
    "left_hip_pitch_joint",
    "left_hip_roll_joint",
    "left_hip_yaw_joint",
    "left_knee_joint",
    "left_ankle_pitch_joint",
    "left_ankle_roll_joint",
    "right_hip_pitch_joint",
    "right_hip_roll_joint",
    "right_hip_yaw_joint",
    "right_knee_joint",
    "right_ankle_pitch_joint",
    "right_ankle_roll_joint",
    "waist_yaw_joint",
    "waist_roll_joint",
    "waist_pitch_joint",
    "left_shoulder_pitch_joint",
    "left_shoulder_roll_joint",
    "left_shoulder_yaw_joint",
    "left_elbow_joint",
    "left_wrist_roll_joint",
    "left_wrist_pitch_joint",
    "left_wrist_yaw_joint",
    "right_shoulder_pitch_joint",
    "right_shoulder_roll_joint",
    "right_shoulder_yaw_joint",
    "right_elbow_joint",
    "right_wrist_roll_joint",
    "right_wrist_pitch_joint",
    "right_wrist_yaw_joint",
  ]

  for i, (cur_input_file, cur_output_name) in enumerate(file_pairs):
    if len(file_pairs) > 1:
      print(f"\n{'='*60}")
      print(f"Processing file {i + 1}/{len(file_pairs)}: {cur_input_file}")
      print(f"{'='*60}")

    common_kwargs = dict(
      sim=sim,
      scene=scene,
      joint_names=joint_names,
      input_fps=input_fps,
      input_file=cur_input_file,
      output_fps=output_fps,
      output_name=cur_output_name,
      output_dir=output_dir,
      render=render,
      line_range=line_range,
      renderer=renderer,
      video_output=video_output,
      window_realtime=window_realtime,
      window_realtime_scale=window_realtime_scale,
    )

    if render and render_backend == "window":
      with mj_viewer.launch_passive(sim.mj_model, sim.mj_data) as window_viewer:
        run_sim(**common_kwargs, window_viewer=window_viewer)
    else:
      run_sim(**common_kwargs)


if __name__ == "__main__":
  tyro.cli(main, config=mjlab.TYRO_FLAGS)
