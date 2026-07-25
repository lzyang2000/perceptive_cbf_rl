#!/usr/bin/env python3
"""Make the RealtimeEfficientTAM submodule importable under Python 3.8.

RealtimeEfficientTAM declares requires-python>=3.10 / torch>=2.5.1, but those pins are
conservative: the only actual 3.8 incompatibility is PEP585 builtin-generic annotations
(e.g. ``list[np.ndarray]`` in a signature) evaluated at import time. Adding
``from __future__ import annotations`` makes all annotations lazy, which fixes it -- the
package then imports, builds and tracks on py3.8 + torch 2.4.1 (verified on x86/CUDA 12.1).

Idempotent: skips files that already have the future import. Re-run after a fresh
submodule checkout. (The deploy stack stays py3.8 -- JP5-compatible -- and EfficientTAM
needs NO TensorRT, so this avoids a py3.10 migration; the remaining robot gate is only
the Jetson's torch version.)

  deploy/.venv/bin/python deploy/tools/patch_efficienttam_py38.py
"""

import ast
import pathlib
import sys

PKG = pathlib.Path(__file__).resolve().parents[1] / "common" / "RealtimeEfficientTAM" / "efficient_track_anything"


def main():
    if not PKG.is_dir():
        sys.exit(f"package not found: {PKG} (init the submodule first)")
    patched = 0
    for p in sorted(PKG.rglob("*.py")):
        src = p.read_text()
        if "from __future__ import annotations" in src:
            continue
        try:
            tree = ast.parse(src)
        except SyntaxError:
            continue
        insert_at = 0  # line index; future import must precede all other code
        body = tree.body
        if body and isinstance(body[0], ast.Expr) and isinstance(getattr(body[0], "value", None), ast.Constant) \
                and isinstance(body[0].value.value, str):
            insert_at = body[0].end_lineno  # keep it after the module docstring
        lines = src.splitlines(keepends=True)
        lines.insert(insert_at, "from __future__ import annotations\n")
        p.write_text("".join(lines))
        patched += 1
    print(f"patched {patched} file(s) for py3.8 (added 'from __future__ import annotations')")


if __name__ == "__main__":
    main()
