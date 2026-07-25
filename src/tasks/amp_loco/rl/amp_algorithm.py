"""AMP (Adversarial Motion Priors) PPO algorithm.

Subclasses stock rsl_rl ``PPO`` (no longer a vendored fork) and adds:
  - Discriminator score -> AMP reward injection during ``process_env_step``.
  - Discriminator loss + gradient penalty in ``update``.
  - AMP transition replay buffer and online AMP-obs normalizer.

The env publishes an ``"amp"`` observation group in its TensorDict; ``AmpPPO``
reads that key inside ``act()`` and ``process_env_step()``, so the rollout loop
in stock ``OnPolicyRunner`` (inherited by ``MjlabOnPolicyRunner``) needs no
override. No RND, no symmetry, no multi-GPU AMP path.
"""

from __future__ import annotations

import copy

import torch
import torch.nn as nn
import torch.optim as optim
from tensordict import TensorDict

from rsl_rl.algorithms import PPO
from rsl_rl.env import VecEnv
from rsl_rl.storage import RolloutStorage
from rsl_rl.utils import resolve_callable, resolve_obs_groups

from src.tasks.amp_loco.rl.amp_discriminator import Discriminator
from src.tasks.amp_loco.rl.amp_motion_loader import AMPLoader
from src.tasks.amp_loco.rl.amp_normalizer import Normalizer
from src.tasks.amp_loco.rl.amp_replay_buffer import ReplayBuffer


class AmpPPO(PPO):
  """PPO + adversarial motion-prior discriminator."""

  def __init__(
    self,
    actor: nn.Module,
    critic: nn.Module,
    storage: RolloutStorage,
    discriminator: Discriminator,
    amp_loader: AMPLoader,
    amp_normalizer: Normalizer | None,
    amp_storage: ReplayBuffer,
    *,
    amp_loss_coef: float = 1.0,
    amp_grad_pen_lambda: float = 10.0,
    amp_trunk_weight_decay: float = 1.0e-3,
    amp_head_weight_decay: float = 1.0e-2,
    learning_rate: float = 1.0e-3,
    optimizer: str = "adam",
    multi_gpu_cfg: dict | None = None,
    **ppo_kwargs,
  ) -> None:
    # Drop optional kwargs upstream PPO doesn't accept here.
    ppo_kwargs.pop("rnd_cfg", None)
    ppo_kwargs.pop("symmetry_cfg", None)
    super().__init__(
      actor=actor,
      critic=critic,
      storage=storage,
      learning_rate=learning_rate,
      optimizer=optimizer,
      rnd_cfg=None,
      symmetry_cfg=None,
      multi_gpu_cfg=multi_gpu_cfg,
      **ppo_kwargs,
    )

    self.discriminator = discriminator.to(self.device)
    self.amp_loader = amp_loader
    self.amp_normalizer = amp_normalizer
    self.amp_storage = amp_storage
    self.amp_loss_coef = float(amp_loss_coef)
    self.amp_grad_pen_lambda = float(amp_grad_pen_lambda)

    # Re-create the optimizer with the discriminator parameters folded in, so the
    # policy step and the discriminator step happen in lockstep.
    policy_params = list(self.actor.parameters()) + list(self.critic.parameters())
    param_groups = [
      {"params": policy_params, "name": "policy"},
      {"params": list(self.discriminator.trunk.parameters()),
       "weight_decay": float(amp_trunk_weight_decay), "name": "amp_trunk"},
      {"params": list(self.discriminator.amp_linear.parameters()),
       "weight_decay": float(amp_head_weight_decay), "name": "amp_head"},
    ]
    self.optimizer = optim.Adam(param_groups, lr=learning_rate)

    # State carried between act() and process_env_step() so we can pair
    # (amp_obs_t, amp_obs_{t+1}) for the discriminator.
    self._prev_amp_obs: torch.Tensor | None = None

  # ---------------------------------------------------------------------------
  # Rollout hooks

  def act(self, obs: TensorDict) -> torch.Tensor:
    if "amp" not in obs.keys():
      raise KeyError("AmpPPO requires an 'amp' obs group on the env's TensorDict.")
    self._prev_amp_obs = obs["amp"].detach().clone().to(self.device)
    return super().act(obs)

  def process_env_step(
    self,
    obs: TensorDict,
    rewards: torch.Tensor,
    dones: torch.Tensor,
    extras: dict[str, torch.Tensor],
  ) -> None:
    next_amp_obs = obs["amp"].detach().clone().to(self.device)
    # mjlab auto-resets before the next obs is computed, so post-reset amp obs
    # are from the new episode. Use the pre-step amp obs as the best
    # approximation of the terminal frame for envs that just reset.
    if self._prev_amp_obs is None:
      raise RuntimeError("process_env_step called before act() captured amp obs.")
    next_amp_with_term = next_amp_obs.clone()
    reset_ids = (dones > 0).nonzero(as_tuple=False).flatten()
    if reset_ids.numel():
      next_amp_with_term[reset_ids] = self._prev_amp_obs[reset_ids]

    # Replace task reward with discriminator-scored reward (the discriminator
    # internally lerps with task reward if `task_reward_lerp > 0`).
    rewards_dev = rewards.to(self.device)
    amp_reward, _ = self.discriminator.predict_amp_reward(
      self._prev_amp_obs,
      next_amp_with_term,
      rewards_dev,
      normalizer=self.amp_normalizer,
    )
    blended_rewards = amp_reward.to(rewards.device)

    # Push (s, s') into the AMP replay buffer for discriminator training.
    self.amp_storage.insert(self._prev_amp_obs, next_amp_with_term)
    # Defer to upstream PPO for actor/critic norms, time-out bootstrap,
    # transition push, etc.
    super().process_env_step(obs, blended_rewards, dones, extras)

  # ---------------------------------------------------------------------------
  # Train / eval / save / load — extend to cover the discriminator.

  def train_mode(self) -> None:
    super().train_mode()
    self.discriminator.train()

  def eval_mode(self) -> None:
    super().eval_mode()
    self.discriminator.eval()

  def save(self) -> dict:
    saved = super().save()
    saved["discriminator_state_dict"] = self.discriminator.state_dict()
    saved["amp_normalizer"] = self.amp_normalizer
    return saved

  def load(self, loaded_dict: dict, load_cfg: dict | None, strict: bool) -> bool:
    load_iteration = super().load(loaded_dict, load_cfg, strict)
    if "discriminator_state_dict" in loaded_dict:
      self.discriminator.load_state_dict(
        loaded_dict["discriminator_state_dict"], strict=strict
      )
    if "amp_normalizer" in loaded_dict and loaded_dict["amp_normalizer"] is not None:
      self.amp_normalizer = loaded_dict["amp_normalizer"]
    return load_iteration

  # ---------------------------------------------------------------------------
  # Update — replicates upstream PPO's mini-batch loop and adds AMP loss.
  # Kept as a single method so the policy optimizer step folds in the
  # discriminator gradient in lockstep.

  def update(self) -> dict[str, float]:  # noqa: C901
    # Accumulate the logged scalars on-device and sync once at the end of the update
    # (one .item() per metric) instead of ~8 .item() syncs every minibatch -- each
    # .item() is a GPU->CPU sync that stalls a fast GPU between minibatches.
    mean_value_loss = torch.zeros((), device=self.device)
    mean_surrogate_loss = torch.zeros((), device=self.device)
    mean_entropy = torch.zeros((), device=self.device)
    mean_amp_loss = torch.zeros((), device=self.device)
    mean_grad_pen_loss = torch.zeros((), device=self.device)
    mean_policy_pred = torch.zeros((), device=self.device)
    mean_expert_pred = torch.zeros((), device=self.device)

    if self.actor.is_recurrent or self.critic.is_recurrent:
      generator = self.storage.recurrent_mini_batch_generator(
        self.num_mini_batches, self.num_learning_epochs
      )
    else:
      generator = self.storage.mini_batch_generator(
        self.num_mini_batches, self.num_learning_epochs
      )

    num_updates_total = self.num_learning_epochs * self.num_mini_batches
    # AMP minibatch size = total samples / num_mini_batches.
    amp_mb_size = (
      self.storage.num_envs * self.storage.num_transitions_per_env
    ) // self.num_mini_batches
    amp_policy_gen = self.amp_storage.feed_forward_generator(
      num_updates_total, amp_mb_size
    )
    amp_expert_gen = self.amp_loader.feed_forward_generator(
      num_updates_total, amp_mb_size
    )

    for batch, sample_amp_policy, sample_amp_expert in zip(
      generator, amp_policy_gen, amp_expert_gen
    ):
      original_batch_size = batch.observations.batch_size[0]

      if self.normalize_advantage_per_mini_batch:
        with torch.no_grad():
          batch.advantages = (
            batch.advantages - batch.advantages.mean()
          ) / (batch.advantages.std() + 1e-8)

      # Recompute log-prob, value, entropy for the current batch.
      self.actor(
        batch.observations,
        masks=batch.masks,
        hidden_state=batch.hidden_states[0],
        stochastic_output=True,
      )
      actions_log_prob = self.actor.get_output_log_prob(batch.actions)
      values = self.critic(
        batch.observations, masks=batch.masks, hidden_state=batch.hidden_states[1]
      )
      distribution_params = tuple(
        p[:original_batch_size] for p in self.actor.output_distribution_params
      )
      entropy = self.actor.output_entropy[:original_batch_size]

      # Adaptive LR via KL.
      if self.desired_kl is not None and self.schedule == "adaptive":
        with torch.inference_mode():
          kl = self.actor.get_kl_divergence(
            batch.old_distribution_params, distribution_params
          )
          kl_mean = torch.mean(kl)
          if self.is_multi_gpu:
            torch.distributed.all_reduce(kl_mean, op=torch.distributed.ReduceOp.SUM)
            kl_mean /= self.gpu_world_size
          if self.gpu_global_rank == 0:
            if kl_mean > self.desired_kl * 2.0:
              self.learning_rate = max(1e-5, self.learning_rate / 1.5)
            elif kl_mean < self.desired_kl / 2.0 and kl_mean > 0.0:
              self.learning_rate = min(1e-2, self.learning_rate * 1.5)
          if self.is_multi_gpu:
            lr_tensor = torch.tensor(self.learning_rate, device=self.device)
            torch.distributed.broadcast(lr_tensor, src=0)
            self.learning_rate = lr_tensor.item()
          for param_group in self.optimizer.param_groups:
            param_group["lr"] = self.learning_rate

      # Surrogate + value loss (PPO).
      ratio = torch.exp(actions_log_prob - torch.squeeze(batch.old_actions_log_prob))
      surrogate = -torch.squeeze(batch.advantages) * ratio
      surrogate_clipped = -torch.squeeze(batch.advantages) * torch.clamp(
        ratio, 1.0 - self.clip_param, 1.0 + self.clip_param
      )
      surrogate_loss = torch.max(surrogate, surrogate_clipped).mean()

      if self.use_clipped_value_loss:
        value_clipped = batch.values + (values - batch.values).clamp(
          -self.clip_param, self.clip_param
        )
        value_losses = (values - batch.returns).pow(2)
        value_losses_clipped = (value_clipped - batch.returns).pow(2)
        value_loss = torch.max(value_losses, value_losses_clipped).mean()
      else:
        value_loss = (batch.returns - values).pow(2).mean()

      loss = (
        surrogate_loss
        + self.value_loss_coef * value_loss
        - self.entropy_coef * entropy.mean()
      )

      # Discriminator loss.
      policy_state, policy_next_state = sample_amp_policy
      expert_state, expert_next_state = sample_amp_expert
      if self.amp_normalizer is not None:
        with torch.no_grad():
          policy_state = self.amp_normalizer.normalize_torch(policy_state, self.device)
          policy_next_state = self.amp_normalizer.normalize_torch(
            policy_next_state, self.device
          )
          expert_state = self.amp_normalizer.normalize_torch(expert_state, self.device)
          expert_next_state = self.amp_normalizer.normalize_torch(
            expert_next_state, self.device
          )
      policy_d = self.discriminator(
        torch.cat([policy_state, policy_next_state], dim=-1)
      )
      expert_d = self.discriminator(
        torch.cat([expert_state, expert_next_state], dim=-1)
      )
      expert_loss = nn.MSELoss()(
        expert_d, torch.ones(expert_d.size(), device=self.device)
      )
      policy_loss = nn.MSELoss()(
        policy_d, -1 * torch.ones(policy_d.size(), device=self.device)
      )
      amp_loss = 0.5 * (expert_loss + policy_loss)
      grad_pen_loss = self.discriminator.compute_grad_pen(
        *sample_amp_expert, lambda_=self.amp_grad_pen_lambda
      )
      loss = loss + self.amp_loss_coef * (amp_loss + grad_pen_loss)

      self.optimizer.zero_grad()
      loss.backward()
      if self.is_multi_gpu:
        self.reduce_parameters()
      nn.utils.clip_grad_norm_(self.actor.parameters(), self.max_grad_norm)
      nn.utils.clip_grad_norm_(self.critic.parameters(), self.max_grad_norm)
      self.optimizer.step()

      if self.amp_normalizer is not None:
        # Stats live on-device; pass the detached tensors directly (no .cpu()/.numpy()
        # host round-trip, which was the dominant per-minibatch sync stall).
        self.amp_normalizer.update(policy_state.detach())
        self.amp_normalizer.update(expert_state.detach())

      mean_value_loss += value_loss.detach()
      mean_surrogate_loss += surrogate_loss.detach()
      mean_entropy += entropy.mean().detach()
      mean_amp_loss += amp_loss.detach()
      mean_grad_pen_loss += grad_pen_loss.detach()
      mean_policy_pred += policy_d.mean().detach()
      mean_expert_pred += expert_d.mean().detach()

    n = max(num_updates_total, 1)
    self.storage.clear()

    # Single host sync for all logged scalars (each .item() blocks on the GPU).
    return {
      "value": (mean_value_loss / n).item(),
      "surrogate": (mean_surrogate_loss / n).item(),
      "entropy": (mean_entropy / n).item(),
      "amp": (mean_amp_loss / n).item(),
      "amp_grad_pen": (mean_grad_pen_loss / n).item(),
      "amp_policy_pred": (mean_policy_pred / n).item(),
      "amp_expert_pred": (mean_expert_pred / n).item(),
    }

  # ---------------------------------------------------------------------------
  # Construction (called by the runner during init).

  @staticmethod
  def construct_algorithm(
    obs: TensorDict, env: VecEnv, cfg: dict, device: str
  ) -> "AmpPPO":
    alg_class: type[AmpPPO] = resolve_callable(cfg["algorithm"].pop("class_name"))  # type: ignore[assignment]
    actor_class = resolve_callable(cfg["actor"].pop("class_name"))
    critic_class = resolve_callable(cfg["critic"].pop("class_name"))

    cfg["obs_groups"] = resolve_obs_groups(
      obs, cfg["obs_groups"], ["actor", "critic"]
    )
    if "amp" not in obs.keys():
      raise ValueError(
        "AmpPPO requires the env to publish an 'amp' observation group."
      )
    amp_dim = obs["amp"].shape[-1]

    # AMP-specific top-level runner-cfg fields (see RslRlAmpRunnerCfg).
    amp_motion_files = cfg.pop("amp_motion_files")
    amp_body_names = tuple(cfg.pop("amp_body_names"))
    amp_anchor_name = cfg.pop("amp_anchor_name")
    amp_reward_coef = float(cfg.pop("amp_reward_coef", 0.1))
    amp_task_reward_lerp = float(cfg.pop("amp_task_reward_lerp", 0.75))
    amp_discr_hidden_dims = tuple(
      cfg.pop("amp_discr_hidden_dims", (1024, 512, 256))
    )
    amp_replay_buffer_size = int(cfg.pop("amp_replay_buffer_size", 100_000))

    cfg["algorithm"].setdefault("rnd_cfg", None)
    cfg["algorithm"].setdefault("symmetry_cfg", None)
    # mjlab's RslRlPpoAlgorithmCfg carries share_cnn_encoders (a CNN-critic option this
    # AMP stack does not use); upstream PPO doesn't accept it, so drop it here.
    cfg["algorithm"].pop("share_cnn_encoders", None)

    # Instantiate actor / critic on the resolved obs groups.
    actor = actor_class(
      obs,
      cfg["obs_groups"],
      "actor",
      env.num_actions,
      **copy.deepcopy(cfg["actor"]),
    ).to(device)
    print(f"Actor Model: {actor}")
    critic = critic_class(
      obs,
      cfg["obs_groups"],
      "critic",
      1,
      **copy.deepcopy(cfg["critic"]),
    ).to(device)
    print(f"Critic Model: {critic}")

    storage = RolloutStorage(
      "rl", env.num_envs, cfg["num_steps_per_env"], obs, [env.num_actions], device
    )

    # AMP-specific components: motion loader, discriminator, replay, normalizer.
    robot_entity = env.unwrapped.scene["robot"]
    all_body_names = tuple(robot_entity.body_names)
    amp_loader = AMPLoader(
      motion_file=amp_motion_files,
      body_names=amp_body_names,
      anchor_name=amp_anchor_name,
      all_body_names=all_body_names,
      device=device,
    )
    if amp_loader.observation_dim != amp_dim:
      raise ValueError(
        f"AMP loader produces obs_dim={amp_loader.observation_dim}, but env's "
        f"'amp' group has dim={amp_dim}. Confirm body_names + anchor_name in "
        f"the env cfg match those passed to the AMP loader."
      )
    discriminator = Discriminator(
      input_dim=amp_dim * 2,
      amp_reward_coef=amp_reward_coef,
      hidden_layer_sizes=amp_discr_hidden_dims,
      device=device,
      task_reward_lerp=amp_task_reward_lerp,
    ).to(device)
    amp_normalizer = Normalizer(amp_dim, device=device)
    amp_storage = ReplayBuffer(amp_dim, amp_replay_buffer_size, device)

    alg = alg_class(
      actor=actor,
      critic=critic,
      storage=storage,
      discriminator=discriminator,
      amp_loader=amp_loader,
      amp_normalizer=amp_normalizer,
      amp_storage=amp_storage,
      device=device,
      multi_gpu_cfg=cfg.get("multi_gpu"),
      **cfg["algorithm"],
    )
    # Parity with stock PPO.construct_algorithm (torch.compile is a no-op when
    # ``torch_compile_mode`` is unset).
    alg.compile(cfg.get("torch_compile_mode"))
    return alg
