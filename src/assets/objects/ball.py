"""A thrown ball (dodgeball) entity for the G1 dodge tasks.

The ball is a *floating non-articulated* entity: a single spherical body with a
freejoint as its root, no actuators. Its pose and velocity are written directly each
episode by the ``throw_ball`` reset event (see ``amp_loco.mdp.events``), which launches
it on a gravity-corrected parabola toward the robot's torso/pelvis.

Radius is fixed per build but exposed as a parameter so a future curriculum / domain
randomization can sample ball sizes (and masses) per env. Mass scales with the cube of
the radius at a fixed density so larger balls feel heavier.
"""

from __future__ import annotations

import mujoco

from mjlab.entity import EntityCfg

# Default dodgeball radius (m): a 6-inch-diameter ball -> radius 0.0762 m. Left
# configurable for future size randomization.
DEFAULT_BALL_RADIUS = 0.0762
# Fixed mass (kg): a real foam dodgeball ~= 136 g. Set directly (not via density) so the
# mass is fixed regardless of radius. Trajectory is mass-independent (gravity is an
# acceleration); mass only affects collision impulse + the floaty-ball gravity-cancel force.
DEFAULT_BALL_MASS = 0.136
# Reddish so the ball is easy to spot against the robot / terrain.
_BALL_RGBA = (0.9, 0.2, 0.2, 1.0)


def _make_ball_spec(radius: float, mass: float, rgba: tuple[float, ...]):
  """Build an ``MjSpec`` for a single free-floating sphere named ``ball``."""

  def spec_fn() -> mujoco.MjSpec:
    spec = mujoco.MjSpec()
    body = spec.worldbody.add_body(name="ball")
    # Freejoint -> floating base (6-DOF), so we can write root pose + velocity.
    body.add_freejoint()
    geom = body.add_geom()
    geom.type = mujoco.mjtGeom.mjGEOM_SPHERE
    geom.size = [radius, 0.0, 0.0]
    # Fixed mass (inertia auto-computed for the sphere). contype/conaffinity keep MuJoCo
    # defaults (=1), so the ball collides with the robot and the terrain.
    geom.mass = mass
    geom.rgba = list(rgba)
    geom.name = "ball_collision"
    return spec

  return spec_fn


def get_ball_cfg(
  radius: float = DEFAULT_BALL_RADIUS,
  mass: float = DEFAULT_BALL_MASS,
  rgba: tuple[float, ...] = _BALL_RGBA,
) -> EntityCfg:
  """Return an ``EntityCfg`` for a thrown ball.

  Returns a fresh cfg each call. The ``init_state`` is just a placeholder parked in
  front of the origin; the ``throw_ball`` reset event overwrites pose + velocity every
  episode, so the initial state is never actually trained from.
  """
  return EntityCfg(
    init_state=EntityCfg.InitialStateCfg(
      pos=(1.0, 0.0, 1.0),
      rot=(1.0, 0.0, 0.0, 0.0),
    ),
    spec_fn=_make_ball_spec(radius, mass, rgba),
  )
