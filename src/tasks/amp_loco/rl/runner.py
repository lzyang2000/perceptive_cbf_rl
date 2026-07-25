"""Runner for AMP-teacher tasks.

AMP env steps publish an ``"amp"`` observation group in the env's TensorDict.
``AmpPPO`` reads that key inside ``act()`` and ``process_env_step()``, so the
rollout loop in ``MjlabOnPolicyRunner`` (inherited from upstream
``OnPolicyRunner``) needs no override here. We only override ``save()`` to also
export an ONNX of the actor — mirroring ``src/tasks/velocity/rl/runner.py``.

The discriminator + amp_normalizer state is threaded through
``MjlabOnPolicyRunner.save/load`` automatically because ``AmpPPO`` overrides
``save()``/``load()`` to include them.
"""

import os
import shutil

import torch
import wandb

from mjlab.rl import RslRlVecEnvWrapper
from mjlab.rl.exporter_utils import (
  attach_metadata_to_onnx,
  get_base_metadata,
)
from mjlab.rl.runner import MjlabOnPolicyRunner

# Importing the algorithm registers ``AmpPPO`` under its module path so the
# ``class_name`` string in the runner cfg resolves via ``resolve_callable``.
from src.tasks.amp_loco.rl.amp_algorithm import AmpPPO as AmpPPO


class AMPOnPolicyRunner(MjlabOnPolicyRunner):
  """MjlabOnPolicyRunner specialized for AMP-teacher training."""

  env: RslRlVecEnvWrapper

  def save(self, path: str, infos=None):
    # Save the per-iteration checkpoint LOCALLY (keep all of them), but DON'T let the base runner
    # upload every model_{it}.pt to wandb. Instead upload only a single fixed "latest_model.pt"
    # (overwritten each save) so wandb keeps just the most recent checkpoint, not one per interval.
    saved_dict = self.alg.save()
    saved_dict["iter"] = self.current_learning_iteration
    saved_dict["infos"] = infos
    torch.save(saved_dict, path)
    if (
      self.logger.logger_type == "wandb"
      and wandb.run is not None
      and self.cfg.get("upload_model", True)
    ):
      latest = os.path.join(os.path.dirname(path), "latest_model.pt")
      shutil.copyfile(path, latest)
      wandb.save(latest, base_path=os.path.dirname(latest))

    # Recurrent / branched actors (e.g. the depth-belief model) have no single obs->actions
    # ONNX signature the deploy stack can drive; skip export (the .pt checkpoint is saved above;
    # live viser play uses the torch policy, not ONNX).
    if getattr(self.alg.actor, "is_recurrent", False):
      return
    policy_path = path.split("model")[0]
    filename = "policy.onnx"
    try:
      self.export_policy_to_onnx(policy_path, filename)
      run_name: str = (
        wandb.run.name
        if self.logger.logger_type == "wandb" and wandb.run
        else "local"
      )  # type: ignore[assignment]
      onnx_path = os.path.join(policy_path, filename)
      metadata = get_base_metadata(self.env.unwrapped, run_name)
      attach_metadata_to_onnx(onnx_path, metadata)
      if self.logger.logger_type in ["wandb"] and self.cfg["upload_model"]:
        wandb.save(policy_path + filename, base_path=os.path.dirname(policy_path))
    except Exception as e:
      print(f"[WARN] ONNX export failed (training continues): {e}")
