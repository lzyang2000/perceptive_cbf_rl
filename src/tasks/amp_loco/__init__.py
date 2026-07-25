"""Velocity tracking using AMP environments for humanoid robots."""

# Install the time-major observation-history ordering overload before any task config
# (which declares ``history_ordering="time"``) is constructed. This replaces the old
# mjlab_patch/ file patch with a runtime overload; see observation_history_ordering.py.
from src.tasks.amp_loco import observation_history_ordering as observation_history_ordering  # noqa: F401
