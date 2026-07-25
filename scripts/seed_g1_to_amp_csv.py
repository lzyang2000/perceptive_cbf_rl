"""Convert NVIDIA SEED retargeted G1 CSVs into the AMP CSV format used by this repo.

The SEED g1 CSVs (``seed/g1/csv/<date>/<clip>.csv``) have a header row and store:

    Frame, root_translateX/Y/Z (cm), root_rotateX/Y/Z (intrinsic? -> extrinsic 'xyz'
    Euler **degrees**), then 29 ``*_dof`` joint angles in **degrees**.

The AMP pipeline (``scripts/csv_to_npz.py`` -> ``MotionLoader``) expects a headerless
36-column CSV:

    x, y, z (meters), qx, qy, qz, qw (xyzw quaternion), 29 joint angles (radians)

The joint column order in the SEED file already matches the ``joint_names`` order used
by ``csv_to_npz.py``, so no reordering is needed. The conversion below was verified to
reproduce this repo's existing ``motion_data_csv/amp/*.csv`` clips bit-for-bit
(quaternion L1 error 0.0, joint error < 1e-6) from their SEED sources.

Usage (single file):
    python scripts/seed_g1_to_amp_csv.py \
        --input-file <SEED_ROOT>/g1/csv/230509/broad_jump_002__A359.csv \
        --output-dir motion_data_csv/amp_leap

Usage (manifest of SEED csv paths, one per line, '#' comments allowed):
    python scripts/seed_g1_to_amp_csv.py \
        --manifest motion_data_csv/amp_leap_manifest.txt \
        --output-dir motion_data_csv/amp_leap
"""

from __future__ import annotations

from pathlib import Path

import numpy as np
import tyro
from scipy.spatial.transform import Rotation as R

# SEED g1 csv layout (after the header row).
_FRAME_COL = 0
_TRANS_COLS = slice(1, 4)  # cm
_ROT_COLS = slice(4, 7)  # Euler xyz degrees
_DOF_COLS = slice(7, 36)  # 29 joint angles, degrees
_N_EXPECTED_COLS = 36


def convert_array(seed: np.ndarray) -> np.ndarray:
  """Convert one SEED g1 motion array (T, 36) to AMP format (T, 36)."""
  if seed.ndim != 2 or seed.shape[1] != _N_EXPECTED_COLS:
    raise ValueError(
      f"Expected SEED array of shape (T, {_N_EXPECTED_COLS}), got {seed.shape}"
    )
  pos_m = seed[:, _TRANS_COLS] / 100.0  # cm -> m
  quat_xyzw = R.from_euler("xyz", seed[:, _ROT_COLS], degrees=True).as_quat()
  dof_rad = np.deg2rad(seed[:, _DOF_COLS])
  return np.concatenate([pos_m, quat_xyzw, dof_rad], axis=1).astype(np.float64)


def convert_file(
  input_file: Path,
  output_dir: Path,
  frame_range: tuple[int, int] | None = None,
) -> Path:
  seed = np.genfromtxt(str(input_file), delimiter=",", skip_header=1)
  total = seed.shape[0]
  if frame_range is not None:
    start, end = frame_range  # 1-indexed, inclusive, over data frames
    seed = seed[start - 1 : end]
  amp = convert_array(seed)
  output_dir.mkdir(parents=True, exist_ok=True)
  out_path = output_dir / input_file.name
  # 6 decimals matches the repo's existing amp csv precision.
  np.savetxt(str(out_path), amp, delimiter=",", fmt="%.6f")
  range_note = f" (kept {frame_range[0]}:{frame_range[1]} of {total})" if frame_range else ""
  print(f"  {input_file.name}: {seed.shape[0]} frames{range_note} -> {out_path}")
  return out_path


def main(
  output_dir: str,
  input_file: str | None = None,
  manifest: str | None = None,
) -> None:
  """Convert SEED g1 CSV(s) to AMP CSV format.

  Args:
    output_dir: Directory to write converted AMP csvs into.
    input_file: Path to a single SEED g1 csv.
    manifest: Path to a text file listing SEED g1 csv paths (one per line).
  """
  if input_file is None and manifest is None:
    raise ValueError("Provide either --input-file or --manifest.")

  out_dir = Path(output_dir)
  # Each entry: (path, optional (start, end) frame range, 1-indexed inclusive).
  entries: list[tuple[Path, tuple[int, int] | None]] = []
  if input_file is not None:
    entries.append((Path(input_file), None))
  if manifest is not None:
    for line in Path(manifest).read_text().splitlines():
      line = line.strip()
      if not line or line.startswith("#"):
        continue
      # Optional trailing "start:end" frame range, whitespace-separated from the path.
      # e.g. "/path/clip.csv  1:246" keeps only frames 1..246 (drops a stumbly tail).
      parts = line.split()
      path = Path(parts[0])
      frame_range: tuple[int, int] | None = None
      if len(parts) > 1 and ":" in parts[1]:
        a, b = parts[1].split(":")
        frame_range = (int(a), int(b))
      entries.append((path, frame_range))

  print(f"Converting {len(entries)} SEED g1 clip(s) -> {out_dir}")
  missing = [p for p, _ in entries if not p.exists()]
  if missing:
    raise FileNotFoundError(
      "Missing SEED csv files:\n" + "\n".join(f"  {p}" for p in missing)
    )
  for path, frame_range in entries:
    convert_file(path, out_dir, frame_range)
  print(f"Done. {len(entries)} clip(s) written to {out_dir}")


if __name__ == "__main__":
  tyro.cli(main)
