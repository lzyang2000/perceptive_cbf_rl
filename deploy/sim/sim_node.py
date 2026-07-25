"""Sim2sim node: drive the mjlab dodge env through the DEPLOY UDP path.

Verifies the whole on-robot wiring without hardware. It plays the role of
hardware_node + camera_node combined: it builds the real
``Unitree-G1-AMP-Dodge-Depth-Single-Flat`` play env (ball + head depth camera +
physics), extracts HARDWARE-LIKE raw signals (quat, body ang-vel, joint q/dq,
raw depth metres), sends them over the same State/Depth datagrams the robot
would, receives the policy's 29 joint targets, and applies them by inverting the
unscale and stepping the env. The DEPLOY ``dodge_policy`` (ONNX, real obs
assembly) is the brain -- so this exercises the deploy obs layout, depth
offset-stacking, normalise, action unscale, and reset signalling end to end.

Runs in the DEV env (imports mjlab); the policy runs in the deploy uv env
(onnxruntime). UDP on localhost bridges the two -- that decoupling is the point.

  # policy (deploy env, background):
  uv run --project deploy python deploy/policy/dodge_policy.py model.onnx --frame-offsets '(0,3,8,18)'
  # sim (dev env, foreground); --viewer viser to WATCH it dodge in a browser:
  uv run python deploy/sim/sim_node.py Unitree-G1-AMP-Dodge-Depth-Single-Flat --viewer viser

Or just: bash deploy/play_sim_dodge.sh   (VIEWER=viser by default)

THE joint-order check: this asserts POLICY_JOINT_NAMES == the env's joint order
(the order the ONNX was trained in) at startup -- the single most likely silent
deploy bug.
"""

import argparse
import ast
import os
import sys
import time
from pathlib import Path

import numpy as np

_REPO_ROOT = Path(__file__).resolve().parent.parent.parent
if str(_REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(_REPO_ROOT))

from deploy.common.g1_deploy_constants import (
    ACTION_SCALE,
    DEFAULT_POS,
    DEPTH_H,
    DEPTH_W,
    NUM_JOINTS,
    POLICY_JOINT_NAMES,
)
from deploy.common.udp_sync import (
    ACTION_BYTES,
    UDP_DEPTH_PORT,
    UDP_HOST,
    UDP_HW_PORT,
    UDP_POLICY_PORT,
    create_udp_socket,
    pack_depth,
    pack_state,
    unpack_action,
)


class UdpDodgeBridge:
    """Policy-shaped callable bridging the mjlab env to the deploy dodge_policy.

    Each call (one control step): extract hardware-like raw signals from the env,
    send State + Depth datagrams to the policy, receive its joint target, invert
    the unscale to recover the raw action, and return it for ``env.step``. Used as
    the ``policy`` of an mjlab viewer (which renders + steps) or in the headless
    loop below -- the env stepping is identical either way.

    ``step_id`` is the env's per-episode step count (``episode_length_buf``): it
    resets to 0 on every episode reset, so the policy sees a backwards jump and
    clears its history -- exactly the hardware-reset signal.
    """

    def __init__(self, env, torch_mod, device, gravity_dir, depth_key,
                 state_sock, depth_sock, action_sock, depth_dim, depth_aug):
        self.env = env
        self.torch = torch_mod
        self.device = device
        self.depth_key = depth_key
        self.depth_aug = depth_aug
        self.external_depth = False  # True: a real camera_node owns the depth port
        self.zero_command = False  # True: force the twist command to 0 (in-place; camera-only motion)
        self.mode = 0  # 0 = dodge, 1 = walk (shipped in the state packet)
        # Manual twist (vx, vy, wz) from the viser sliders; overrides the env command
        # when use_manual_cmd is set -- the walk driver in walk mode.
        self.manual_cmd = np.zeros(3, dtype=np.float32)
        self.use_manual_cmd = False
        self.depth_decim = 1  # publish depth every N steps (N=5 -> 10 Hz at 50 Hz control)
        self._warned_no_stash = False
        self.state_sock = state_sock
        self.depth_sock = depth_sock
        self.action_sock = action_sock
        self.depth_dim = depth_dim
        self._gravity = gravity_dir
        self.last_target = DEFAULT_POS.copy()
        self.seq = 0
        self._prev_len = -1
        # stats
        self.n_steps = 0
        self.episodes = 0
        self.ep_lens = []
        self._t_log = time.perf_counter()
        self._dt = float(env.step_dt)

    def reset(self):
        self.last_target = DEFAULT_POS.copy()

    def _depth_metres(self):
        """The pooled depth in METRES that the camera would send. With depth_aug,
        use DepthImageObs's stashed AUGMENTED metric frame (= what the policy
        trained on / what real ZED noise stands in for); else the clean sensor
        render. The deploy policy normalises either way -- exactly as it will the
        real ZED depth."""
        env = self.env
        if self.depth_aug:
            store = getattr(env, "_depth_aug_display", None)
            frame = store.get(self.depth_key) if store else None
            if frame is not None:
                return frame[0].reshape(DEPTH_H * DEPTH_W).detach().cpu().numpy().astype(np.float32)
            if not self._warned_no_stash:
                print("[sim_node] WARN: depth-aug requested but no augmented frame stashed yet; "
                      "falling back to clean sensor depth this step.", flush=True)
                self._warned_no_stash = True
        return (env.scene[self.depth_key].data.depth[0].reshape(DEPTH_H * DEPTH_W)
                .detach().cpu().numpy().astype(np.float32))

    def __call__(self, obs=None):
        env = self.env
        step_id = int(env.episode_length_buf[0].item())
        if 0 <= step_id < self._prev_len:  # episode just reset
            self.episodes += 1
            self.ep_lens.append(self._prev_len)
        self._prev_len = step_id

        q = env.scene["robot"].data.joint_pos[0].detach().cpu().numpy().astype(np.float32)
        dq = env.scene["robot"].data.joint_vel[0].detach().cpu().numpy().astype(np.float32)
        quat = env.scene["robot"].data.root_link_quat_w[0].detach().cpu().numpy().astype(np.float32)
        ang_vel = env.scene["robot"].data.root_link_ang_vel_b[0].detach().cpu().numpy().astype(np.float32)
        proj_grav = env.scene["robot"].data.projected_gravity_b[0].detach().cpu().numpy().astype(np.float32)
        cmd = env.command_manager.get_command("twist")[0, :3].detach().cpu().numpy().astype(np.float32)
        if self.use_manual_cmd:
            cmd = self.manual_cmd.copy()  # viser sliders drive the policy's twist command
        elif self.zero_command:
            cmd[:] = 0.0  # in-place command: the only motion driver is what the camera sees

        self.state_sock.sendto(
            pack_state(step_id, quat, ang_vel, proj_grav, q, dq, cmd, mode=self.mode),
            (UDP_HOST, UDP_POLICY_PORT))
        # Publish depth at the (decimated) camera rate: every depth_decim control
        # steps. The policy's gate holds the last frame between, reproducing a
        # slower real camera (e.g. depth_decim=5 -> 10 Hz depth at 50 Hz control,
        # matching a 10fps-trained ckpt). depth_decim=1 = every step (50 Hz).
        if not self.external_depth and (self.seq % self.depth_decim == 0):
            depth_m = self._depth_metres()
            self.depth_sock.sendto(pack_depth(self.seq, time.time(), 1, depth_m),
                                   (UDP_HOST, UDP_DEPTH_PORT))
        self.seq += 1

        # Receive the policy's target (drain to newest; hold the last on timeout).
        data = None
        self.action_sock.settimeout(0.1)
        try:
            data, _ = self.action_sock.recvfrom(ACTION_BYTES + 64)
        except (OSError,):
            pass
        if data is not None:
            self.action_sock.setblocking(False)
            try:
                while True:
                    data, _ = self.action_sock.recvfrom(ACTION_BYTES + 64)
            except (BlockingIOError, OSError):
                pass
            self.action_sock.setblocking(True)
            self.last_target = unpack_action(data)

        action_np = (self.last_target - DEFAULT_POS) / ACTION_SCALE
        self.n_steps += 1
        now = time.perf_counter()
        if now - self._t_log >= 2.0:
            recent = self.ep_lens[-20:]
            mean_ep = (sum(recent) / len(recent)) if recent else float("nan")
            print(f"[sim_node] steps={self.n_steps} episodes={self.episodes} "
                  f"mean_recent_survival={mean_ep:.0f} steps ({mean_ep * self._dt:.1f}s) "
                  f"cur_ep={step_id}", flush=True)
            self._t_log = now
        return self.torch.as_tensor(action_np, device=self.device).reshape(1, NUM_JOINTS)


def main():
    parser = argparse.ArgumentParser(description="Sim2sim dodge node (drives mjlab via the deploy UDP path)")
    parser.add_argument("task_id", nargs="?", default="Unitree-G1-AMP-Dodge-Depth-Single-Flat")
    parser.add_argument("--frame-offsets", default="(0,3,8,18)",
                        help="Must match the policy node / ONNX (sets env.depth_frame_offsets)")
    parser.add_argument("--device", default=None, help="cuda:0 / cpu (default: cuda if available)")
    parser.add_argument("--viewer", default="none", choices=["none", "viser", "native"],
                        help="none = headless stats; viser = browser viewer; native = local window")
    parser.add_argument("--reset-stand", action=argparse.BooleanOptionalAction, default=True,
                        help="Reset episodes to the nominal default stand (matches "
                             "play_depth_single.sh's RESET_STAND=True); --no-reset-stand keeps "
                             "the dodge RSI motion resets. Terminations are unchanged either way.")
    parser.add_argument("--depth-aug", action=argparse.BooleanOptionalAction, default=True,
                        help="Send the training sim2real-AUGMENTED depth (matches "
                             "play_depth_single.sh's DEPTH_AUG=True; clean depth is OOD for the "
                             "DR-trained policy). The real ZED's own noise stands in for this on "
                             "hardware. --no-depth-aug sends the clean render (clean-depth eval).")
    parser.add_argument("--external-depth", action="store_true",
                        help="Do NOT publish depth: a real deploy/real/camera_node.py (live ZED) "
                             "owns the depth port instead. Tests the full deploy perception path "
                             "(real camera -> pooling -> UDP -> ONNX) against the sim robot. The "
                             "policy then CANNOT see sim balls -- pair with --pause-throws and "
                             "wave/throw real objects at the camera.")
    parser.add_argument("--pause-throws", action="store_true",
                        help="Suppress the env's automatic ball throws (the policy is blind to sim "
                             "balls under --external-depth).")
    parser.add_argument("--zero-command", action="store_true",
                        help="Force the twist velocity command sent to the policy to 0 (in-place "
                             "stand). Removes the play backpedal so the ONLY motion driver is what "
                             "the camera sees -- a clean 'is it reacting to the ball' test. Matches "
                             "the rel_inplace_throw regime the policy also trained on.")
    parser.add_argument("--depth-decimation", type=int, default=1,
                        help="Publish depth every N control steps (the gate holds it between) to "
                             "emulate a slower camera. Use 5 for a 10fps-trained ckpt (10 Hz depth "
                             "at 50 Hz control). Default 1 = 50 Hz.")
    parser.add_argument("--max-steps", type=int, default=0, help="Headless only: stop after N steps")
    args = parser.parse_args()

    import torch

    import src.tasks.amp_loco.config.g1 as _g1  # noqa: F401  (registers the dodge tasks)
    from mjlab.envs import ManagerBasedRlEnv
    from mjlab.tasks.registry import load_env_cfg

    device = args.device or ("cuda:0" if torch.cuda.is_available() else "cpu")
    offsets = tuple(ast.literal_eval(args.frame_offsets))

    env_cfg = load_env_cfg(args.task_id, play=True)
    env_cfg.depth_frame_offsets = offsets  # keeps the env's own depth obs consistent (unused here)
    env_cfg.scene.num_envs = 1
    # Match play_depth_single.sh (RESET_STAND=True): nominal default-stand resets instead of the
    # dodge RSI motion resets, so the start distribution matches native play. Terminations are the
    # play=True set either way (time_out, bad_orientation, bad_base_height, collapsed_crouch,
    # ball_hit active immediately) -- identical to scripts/play.py, which never edits them.
    if args.reset_stand and "reset_from_motion" in env_cfg.events:
        from src.tasks.amp_loco.mdp.events import reset_to_default_stand

        stand_event = env_cfg.events["reset_from_motion"]
        stand_event.func = reset_to_default_stand
        stand_event.params = {}
        print("[sim_node] reset_stand: episodes reset to the nominal default stand (matches play)")

    # Depth augmentation: clean rendered depth is OOD for the DR-trained policy, so by default
    # send the SAME sim2real-augmented depth native play feeds (play_depth_single.sh DEPTH_AUG=True).
    # On hardware the real ZED's noise replaces this; here enable_depth_aug_preview turns the
    # DepthImageObs aug on + renders segmentation, and we stash the augmented METRIC frame to send.
    if args.depth_aug:
        from src.tasks.amp_loco.config.g1.dodge_env_cfgs import enable_depth_aug_preview

        enable_depth_aug_preview(env_cfg)
        print("[sim_node] depth_aug: sending the training-augmented depth (matches native play)")

    print(f"[sim_node] building {args.task_id} on {device} (offsets={offsets}, viewer={args.viewer}) ...")
    env = ManagerBasedRlEnv(cfg=env_cfg, device=device)
    if args.depth_aug:
        # Make DepthImageObs._one stash its augmented metric frame in env._depth_aug_display.
        env._depth_aug_display_enabled = True
    env.reset()

    env_joint_names = list(env.scene["robot"].joint_names)
    if env_joint_names != list(POLICY_JOINT_NAMES):
        print("[sim_node] FATAL: env joint order != POLICY_JOINT_NAMES.\n"
              f"  env:    {env_joint_names}\n  policy: {list(POLICY_JOINT_NAMES)}", file=sys.stderr)
        sys.exit(1)
    print(f"[sim_node] joint order OK ({NUM_JOINTS} joints match POLICY_JOINT_NAMES)")

    depth_key = "head_depth_single"
    try:
        _ = env.scene[depth_key]
    except KeyError:
        print(f"[sim_node] FATAL: sensor '{depth_key}' not in the scene "
              f"(is this the single-cam task?).", file=sys.stderr)
        sys.exit(1)

    state_sock = create_udp_socket(UDP_HOST, 0)
    depth_sock = create_udp_socket(UDP_HOST, 0)
    action_sock = create_udp_socket(UDP_HOST, UDP_HW_PORT)
    if args.external_depth:
        print(f"[sim_node] state->{UDP_POLICY_PORT} depth: EXTERNAL (run deploy/real/camera_node.py) "
              f"action<-{UDP_HW_PORT}")
    else:
        print(f"[sim_node] state->{UDP_POLICY_PORT} depth->{UDP_DEPTH_PORT} action<-{UDP_HW_PORT}")
    print("[sim_node] start the policy node now (or use play_sim_dodge.sh).")

    if args.pause_throws:
        # throw_ball_on_dwell honors this flag (the viser Dodgeball checkbox toggles it).
        env._dodge_throw_paused = True
        print("[sim_node] sim ball throws PAUSED")

    bridge = UdpDodgeBridge(
        env, torch, device, np.array([0.0, 0.0, -1.0], dtype=np.float32), depth_key,
        state_sock, depth_sock, action_sock, DEPTH_H * DEPTH_W, args.depth_aug,
    )
    bridge.external_depth = bool(args.external_depth)
    bridge.zero_command = bool(args.zero_command)
    bridge.depth_decim = max(1, int(args.depth_decimation))
    if args.zero_command:
        print("[sim_node] twist command FORCED to 0 (in-place; only the camera drives motion)")

    try:
        if args.viewer == "viser":
            from mjlab.viewer import ViserPlayViewer

            class _DodgeWalkViewer(ViserPlayViewer):
                def setup(self):
                    super().setup()
                    gui = self._server.gui

                    # --- Walk/dodge mode (no gain swap: shared actuator config). ---
                    cb = gui.add_checkbox("Walk mode", initial_value=False)
                    def _on_mode(_=None, _cb=cb):
                        bridge.mode = 1 if _cb.value else 0
                        print(f"[sim_node] mode -> {'WALK' if bridge.mode else 'DODGE'}", flush=True)
                    cb.on_update(_on_mode)

                    # --- Manual twist command (vx, vy, wz) sliders -> the policy. ---
                    with gui.add_folder("Command (vx, vy, wz)"):
                        man = gui.add_checkbox("Manual cmd", initial_value=False)
                        s_vx = gui.add_slider("vx", min=-1.0, max=1.0, step=0.05, initial_value=0.0)
                        s_vy = gui.add_slider("vy", min=-1.0, max=1.0, step=0.05, initial_value=0.0)
                        s_wz = gui.add_slider("wz", min=-1.0, max=1.0, step=0.05, initial_value=0.0)
                        stop = gui.add_button("Stop (zero cmd)")

                    def _push_cmd(_=None):
                        bridge.use_manual_cmd = man.value
                        bridge.manual_cmd = np.array(
                            [s_vx.value, s_vy.value, s_wz.value], dtype=np.float32)
                    for h in (man, s_vx, s_vy, s_wz):
                        h.on_update(_push_cmd)
                    def _on_stop(_=None):
                        s_vx.value = s_vy.value = s_wz.value = 0.0
                        _push_cmd()
                    stop.on_click(_on_stop)

                    # --- Ball throw controls (honored by throw_ball_on_dwell). ---
                    with gui.add_folder("Ball throws"):
                        pause = gui.add_checkbox("Pause auto-throws", initial_value=False)
                        b_hi = gui.add_button("Throw high (overhead)")
                        b_lo = gui.add_button("Throw low (underbody)")
                        b_rand = gui.add_button("Throw random")
                    pause.on_update(lambda _=None: setattr(env, "_dodge_throw_paused", pause.value))
                    def _throw(force_high):
                        env._dodge_throw_force_high = force_high
                        env._dodge_throw_once = True
                    b_hi.on_click(lambda _=None: _throw(True))
                    b_lo.on_click(lambda _=None: _throw(False))
                    b_rand.on_click(lambda _=None: _throw(None))

            _DodgeWalkViewer(env, bridge).run()
        elif args.viewer == "native":
            from mjlab.viewer import NativeMujocoViewer
            NativeMujocoViewer(env, bridge).run()
        else:
            dt = float(env.step_dt)
            next_tick = time.perf_counter()
            while True:
                action = bridge(None)
                env.step(action)
                if args.max_steps and bridge.n_steps >= args.max_steps:
                    break
                next_tick += dt
                sleep_t = next_tick - time.perf_counter()
                if sleep_t > 0:
                    time.sleep(sleep_t)
                else:
                    next_tick = time.perf_counter()
    except KeyboardInterrupt:
        pass
    finally:
        state_sock.close()
        depth_sock.close()
        action_sock.close()
        env.close()
        print(f"[sim_node] stopped. {bridge.episodes} episodes over {bridge.n_steps} steps.")


if __name__ == "__main__":
    main()
