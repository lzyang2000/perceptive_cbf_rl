import os
import torch
import pytest


@pytest.mark.skipif(not torch.cuda.is_available(), reason="needs GPU sim")
def test_gimbal_plus_cbf_keeps_29_action_dim_and_excludes_camera():
    os.environ.update({
        "CAMERA_GIMBAL": "1", "CAMERA_PROPRIO": "1", "CBF_JOINT": "1",
        "CAMERA_TILT_DEG": "20", "BALLONLY_AUG": "0",
    })
    import src.tasks  # noqa: F401 -- triggers task registration (side-effect import)
    from mjlab.envs import ManagerBasedRlEnv
    # Call the builder directly: the gimbal/CBF env vars are read at CALL time, whereas the
    # registered cfg is frozen at first import (whose env vars this test cannot control).
    from src.tasks.amp_loco.config.g1.dodge_env_cfgs import (
        g1_amp_dodge_depth_single_ballonly_flat_env_cfg,
    )
    cfg = g1_amp_dodge_depth_single_ballonly_flat_env_cfg(play=False)
    cfg.scene.num_envs = 4
    env = ManagerBasedRlEnv(cfg=cfg, device="cuda")
    term = env.action_manager.get_term("joint_pos")
    # gimbal joint excluded -> 29 body DOF actuated by the CBF term (not 30).
    assert env.action_manager.total_action_dim == 29
    # CBF filter bodies must not include the gimbal camera body.
    body_names = [env.scene["robot"].body_names[i] for i in term._body_local.tolist()]
    assert "camera_pitch_link" not in body_names
