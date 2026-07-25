"""Programmatic insertion of an actuated camera-pitch gimbal on the G1 (CAMERA_GIMBAL=1).

The camera (``head_camera_single``) is normally a FIXED +20deg-up mount on ``torso_link``. This
re-parents it onto a new child body ``camera_pitch_link`` joined to torso by a hinge
``camera_pitch_joint`` (pitch about Y; neutral 0deg = level forward; range +/-30deg), and adds the
smallest G1 actuator (the 4010) for it. The whole edit is applied only when requested, via a
``spec_fn`` wrapper, so a run without it is the unmodified model (bit-exact repro).

API notes (mujoco MjSpec, confirmed against the installed build):
  - bodies/joints/cameras/geoms are added with ``body.add_*(...)`` keyword methods;
  - there is NO ``cam.delete()`` -- elements are removed with ``spec.delete(cam_obj)``;
  - the actuator cfg reuses ``BuiltinPositionActuatorCfg`` (the class the commented-out
    ``G1_ACTUATOR_4010`` used) rather than the wrist's ``UnitreeActuatorCfg_N5010_16``: the latter
    carries 5010-specific torque-speed-curve constants (X1/X2/Y1/Y2/...) that are wrong for the 4010
    and it has no ``velocity_limit`` field anyway. ``BuiltinPositionActuatorCfg`` is the PD actuator
    the commented 4010 pattern names, and satisfies the ``G1_ACTION_SCALE`` isinstance assert.
"""

from __future__ import annotations

import dataclasses
import math

import mujoco

from mjlab.actuator import BuiltinPositionActuatorCfg
from src.assets.robots.unitree_g1 import g1_constants as gc

GIMBAL_BODY = "camera_pitch_link"
GIMBAL_JOINT = "camera_pitch_joint"
_PITCH_LIMIT = math.radians(30.0)  # 0.5235987... rad
_MOUNT_POS = (0.08, 0.0, 0.45)  # current head_camera_single mount on torso_link


def _edit_spec(spec: mujoco.MjSpec) -> None:
  """Re-parent ``head_camera_single`` onto a new pitch-gimbal body under ``torso_link``."""
  torso = spec.body("torso_link")
  gimbal = torso.add_body(name=GIMBAL_BODY, pos=list(_MOUNT_POS))
  # Tiny near-massless camera-head sphere so the gimbal has well-defined inertia but its dynamics
  # are negligible vs the robot. group=3, no contacts (contype=0/conaffinity=0): invisible + inert.
  gimbal.add_geom(
    type=mujoco.mjtGeom.mjGEOM_SPHERE,
    size=[0.02, 0.0, 0.0],
    mass=0.05,
    group=3,
    contype=0,
    conaffinity=0,
  )
  gimbal.add_joint(
    name=GIMBAL_JOINT,
    type=mujoco.mjtJoint.mjJNT_HINGE,
    axis=[0, 1, 0],
    range=[-_PITCH_LIMIT, _PITCH_LIMIT],
  )
  # Move the camera onto the gimbal at neutral (level forward). MuJoCo cams look along -Z;
  # xyaxes right=(0,-1,0) up=(0,0,1) -> optical axis = +X horizontal at joint=0.
  old = spec.camera("head_camera_single")
  fovy = float(old.fovy)
  spec.delete(old)  # no cam.delete() in this MjSpec build; remove via spec.delete(obj)
  gimbal.add_camera(
    name="head_camera_single",
    pos=[0, 0, 0],
    fovy=fovy,
    xyaxes=[0, -1, 0, 0, 0, 1],
  )


def _camera_pitch_actuator() -> BuiltinPositionActuatorCfg:
  """Position actuator for ``camera_pitch_joint``.

  The **4010** -- the smallest G1 motor -- drives the ORACLE-aimed gimbal. Mirrors the
  commented-out ``G1_ACTUATOR_4010``: ``stiffness=STIFFNESS_4010``, ``damping=DAMPING_4010``,
  ``effort=5``, ``armature=ARMATURE_4010``. Ample when an oracle sets the joint target.
  """
  return BuiltinPositionActuatorCfg(
    target_names_expr=(GIMBAL_JOINT,),
    stiffness=gc.STIFFNESS_4010,
    damping=gc.DAMPING_4010,
    effort_limit=gc.ACTUATOR_4010.effort_limit,
    armature=gc.ACTUATOR_4010.reflected_inertia,
  )


def add_camera_gimbal(robot_cfg) -> None:
  """Gate-on path: wrap ``spec_fn`` to insert the gimbal + append the camera-pitch actuator.

  Mutates ``robot_cfg`` in place. The ``articulation`` is replaced
  with a copy (not mutated) so the shared module-level ``G1_ARTICULATION`` does not leak the gimbal
  actuator into other env builds in the same process.
  """
  orig_spec_fn = robot_cfg.spec_fn

  def spec_fn():
    spec = orig_spec_fn()
    _edit_spec(spec)
    return spec

  robot_cfg.spec_fn = spec_fn

  art = robot_cfg.articulation
  new_actuators = tuple(art.actuators) + (_camera_pitch_actuator(),)
  robot_cfg.articulation = dataclasses.replace(art, actuators=new_actuators)
