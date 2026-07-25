from __future__ import annotations
import math
import numpy as np
import os
import torch
from collections.abc import Sequence
from dataclasses import MISSING
from typing import TYPE_CHECKING


class MotionLoader:
    def __init__(
        self,
        motion_dir: str,
        tgt_body_indexes: Sequence[int],
        tgt_anchor_indexes: int,
        feet_indexes: int,
        device: str = "cpu",
        recovery_dir: str | None = None,
    ):
        # 存储所有运动数据的列表
        self.motion_data: list[dict] = []
        # 存储所有恢复数据的列表
        self.motion_data_recovery: list[dict] = []

        # 加载正常运动数据
        self.motion_data = self._load_dir(motion_dir, device)
        assert len(self.motion_data) > 0, f"No npz files found in: {motion_dir}"

        # 加载恢复运动数据
        if recovery_dir is not None and os.path.isdir(recovery_dir):
            self.motion_data_recovery = self._load_dir(recovery_dir, device)

        self.motion_names = [m["motion_name"] for m in self.motion_data + self.motion_data_recovery]

        if not self.motion_data and not self.motion_data_recovery:
            raise ValueError(f"No motion data loaded from: {motion_dir}")

        default_motion = self.motion_data[0] if self.motion_data else self.motion_data_recovery[0]

        self.fps = default_motion["fps"]
        self._dof_pos = default_motion["dof_pos"]
        self._dof_vel = default_motion["dof_vel"]
        self._body_pos_w = default_motion["body_pos_w"]
        self._body_quat_w = default_motion["body_quat_w"]
        self._body_lin_vel_w = default_motion["body_lin_vel_w"]
        self._body_ang_vel_w = default_motion["body_ang_vel_w"]

        self._body_indexes = tgt_body_indexes
        self._anchor_indexes = tgt_anchor_indexes
        self._feet_indexes = feet_indexes
        self.time_step_total = self._dof_pos.shape[0]
        self.motion_total_time = self.time_step_total / self.fps

    @staticmethod
    def _load_dir(dir_path: str, device: str) -> list[dict]:
        """从目录中加载所有 .npz 文件并返回运动数据列表（递归子目录）。

        Recursive (os.walk) so a parent dir of subdirs (e.g. ``amp_dodge`` = Leap/ + Dodge/)
        loads every clip, matching the AMP discriminator loader. Flat reset dirs
        (amp_leap/Leap, WalkandRun, Recovery have no subdirs) are unaffected.
        """
        assert os.path.isdir(dir_path), f"Not a directory: {dir_path}"
        npz_paths = []
        for root, _dirs, files in os.walk(dir_path):
            for filename in files:
                if filename.endswith(".npz"):
                    npz_paths.append(os.path.join(root, filename))
        result = []
        for path in sorted(npz_paths):
            motion_name = os.path.splitext(os.path.basename(path))[0]
            data = np.load(path)
            result.append({
                "motion_name": motion_name,
                "fps": data["fps"],
                "dof_pos": torch.tensor(data["joint_pos"], dtype=torch.float32, device=device),
                "dof_vel": torch.tensor(data["joint_vel"], dtype=torch.float32, device=device),
                "body_pos_w": torch.tensor(data["body_pos_w"], dtype=torch.float32, device=device),
                "body_quat_w": torch.tensor(data["body_quat_w"], dtype=torch.float32, device=device),
                "body_lin_vel_w": torch.tensor(data["body_lin_vel_w"], dtype=torch.float32, device=device),
                "body_ang_vel_w": torch.tensor(data["body_ang_vel_w"], dtype=torch.float32, device=device),
            })
        return result

    def _get_motion_data(self, motion_index: int = None):
        """获取指定motion的数据，如果motion_index为None，则使用默认数据"""
        if motion_index is None:
            return {
                "body_pos_w": self._body_pos_w,
                "body_quat_w": self._body_quat_w,
                "body_lin_vel_w": self._body_lin_vel_w,
                "body_ang_vel_w": self._body_ang_vel_w,
                "dof_pos": self._dof_pos,
                "dof_vel": self._dof_vel,
            }
        else:
            assert 0 <= motion_index < len(self.motion_data), f"Motion index {motion_index} out of range [0, {len(self.motion_data)})"
            return self.motion_data[motion_index]

    def tgt_body_pos_w(self, motion_index: int = None) -> torch.Tensor:
        data = self._get_motion_data(motion_index)
        return data["body_pos_w"][:, self._body_indexes, :]

    def tgt_body_quat_w(self, motion_index: int = None) -> torch.Tensor:
        data = self._get_motion_data(motion_index)
        return data["body_quat_w"][:, self._body_indexes, :]

    def tgt_body_lin_vel_w(self, motion_index: int = None) -> torch.Tensor:
        data = self._get_motion_data(motion_index)
        return data["body_lin_vel_w"][:, self._body_indexes, :]

    def tgt_body_ang_vel_w(self, motion_index: int = None) -> torch.Tensor:
        data = self._get_motion_data(motion_index)
        return data["body_ang_vel_w"][:, self._body_indexes, :]

    def tgt_anchor_pos_w(self, motion_index: int = None) -> torch.Tensor:
        data = self._get_motion_data(motion_index)
        return data["body_pos_w"][:, self._anchor_indexes]

    def tgt_anchor_quat_w(self, motion_index: int = None) -> torch.Tensor:
        data = self._get_motion_data(motion_index)
        return data["body_quat_w"][:, self._anchor_indexes]

    def tgt_anchor_lin_vel_w(self, motion_index: int = None) -> torch.Tensor:
        data = self._get_motion_data(motion_index)
        return data["body_lin_vel_w"][:, self._anchor_indexes]

    def tgt_anchor_ang_vel_w(self, motion_index: int = None) -> torch.Tensor:
        data = self._get_motion_data(motion_index)
        return data["body_ang_vel_w"][:, self._anchor_indexes]

    def tgt_dof_pos(self, motion_index: int = None) -> torch.Tensor:
        data = self._get_motion_data(motion_index)
        return data["dof_pos"]

    def tgt_dof_vel(self, motion_index: int = None) -> torch.Tensor:
        data = self._get_motion_data(motion_index)
        return data["dof_vel"]

    def tgt_feet_pos_w(self, motion_index: int = None) -> torch.Tensor:
        data = self._get_motion_data(motion_index)
        return data["body_pos_w"][:, self._feet_indexes]

    def tgt_root_pos(self, motion_index: int = None) -> torch.Tensor:
        data = self._get_motion_data(motion_index)
        return data["body_pos_w"][:, 0, :]

    def tgt_root_quat(self, motion_index: int = None) -> torch.Tensor:
        data = self._get_motion_data(motion_index)
        return data["body_quat_w"][:, 0, :]

    def tgt_root_lin_vel(self, motion_index: int = None) -> torch.Tensor:
        data = self._get_motion_data(motion_index)
        return data["body_lin_vel_w"][:, 0, :]

    def tgt_root_ang_vel(self, motion_index: int = None) -> torch.Tensor:
        data = self._get_motion_data(motion_index)
        return data["body_ang_vel_w"][:, 0, :]

    def sample_random_frames(self, num_samples: int) -> dict[str, torch.Tensor]:
        """从所有动作中随机抽取帧，返回 root pose/vel 和 joint pos/vel。

        Returns:
            dict with keys:
                root_pos: (num_samples, 3) - root position (relative, z preserved)
                root_quat: (num_samples, 4) - root orientation
                root_lin_vel: (num_samples, 3)
                root_ang_vel: (num_samples, 3)
                joint_pos: (num_samples, num_joints)
                joint_vel: (num_samples, num_joints)
        """
        all_motions = self.motion_data + self.motion_data_recovery
        # 随机选 motion index
        motion_indices = torch.randint(0, len(all_motions), (num_samples,))
        # 对每个选中的 motion 随机选一帧
        result_root_pos = []
        result_root_quat = []
        result_root_lin_vel = []
        result_root_ang_vel = []
        result_joint_pos = []
        result_joint_vel = []

        for i in range(num_samples):
            motion = all_motions[motion_indices[i].item()]
            num_frames = motion["dof_pos"].shape[0]
            frame_idx = torch.randint(0, num_frames, (1,)).item()

            result_root_pos.append(motion["body_pos_w"][frame_idx, 0, :])
            result_root_quat.append(motion["body_quat_w"][frame_idx, 0, :])
            result_root_lin_vel.append(motion["body_lin_vel_w"][frame_idx, 0, :])
            result_root_ang_vel.append(motion["body_ang_vel_w"][frame_idx, 0, :])
            result_joint_pos.append(motion["dof_pos"][frame_idx])
            result_joint_vel.append(motion["dof_vel"][frame_idx])

        return {
            "root_pos": torch.stack(result_root_pos),
            "root_quat": torch.stack(result_root_quat),
            "root_lin_vel": torch.stack(result_root_lin_vel),
            "root_ang_vel": torch.stack(result_root_ang_vel),
            "joint_pos": torch.stack(result_joint_pos),
            "joint_vel": torch.stack(result_joint_vel),
        }
