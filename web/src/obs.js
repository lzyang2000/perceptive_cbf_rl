/**
 * Observation assembly -- a direct port of deploy/policy/dodge_policy.py.
 *
 * That file is the contract the ONNX checkpoints were exported against and the
 * one validated on hardware, so this module mirrors it structurally (same term
 * order, same history layout, same depth ring indexing) rather than rebuilding
 * the obs from the training config. Any divergence here is a silent fall.
 *
 *   actor input = proprio(384) ++ depth(144 * n_offsets)
 */

import { PROPRIO_HISTORY, PROPRIO_DIM, TERM_ORDER } from './generated/constants.js';

/**
 * 4-frame TERM-MAJOR proprio history -> flat 384 vector.
 *
 * Term-major means the flat vector is [term0 frame0..frameN, term1 frame0..frameN, ...]
 * with frames ordered OLDEST -> NEWEST within each term. This is mjlab's default
 * history flatten, and it is NOT the same as frame-major; getting it backwards
 * produces a plausible-looking vector that the policy cannot use.
 */
export class ProprioHistory {
  constructor(historyLength = PROPRIO_HISTORY) {
    this.L = historyLength;
    this.terms = TERM_ORDER.map(([name, dim]) => ({ name, dim }));
    this.dim = this.terms.reduce((s, t) => s + t.dim, 0) * this.L;
    if (this.dim !== PROPRIO_DIM) {
      throw new Error(`proprio dim ${this.dim} != expected ${PROPRIO_DIM}`);
    }
    // Per term, a ring of L frames.
    this.buf = this.terms.map((t) =>
      Array.from({ length: this.L }, () => new Float32Array(t.dim))
    );
    this.head = this.L - 1; // newest slot
    this.out = new Float32Array(this.dim);
    this.reset();
  }

  reset() {
    for (const ring of this.buf) for (const f of ring) f.fill(0);
    this.head = this.L - 1;
  }

  /** Append one frame. `values` must be in TERM_ORDER order. */
  append(values) {
    if (values.length !== this.terms.length) {
      throw new Error(`append expects ${this.terms.length} terms, got ${values.length}`);
    }
    this.head = (this.head + 1) % this.L;
    for (let t = 0; t < this.terms.length; t++) {
      const src = values[t];
      if (src.length !== this.terms[t].dim) {
        throw new Error(
          `term ${this.terms[t].name}: got ${src.length} values, expected ${this.terms[t].dim}`
        );
      }
      this.buf[t][this.head].set(src);
    }
  }

  /** Flat term-major vector, oldest -> newest within each term. */
  vector() {
    let o = 0;
    for (let t = 0; t < this.terms.length; t++) {
      const ring = this.buf[t];
      for (let k = 0; k < this.L; k++) {
        // oldest first: head+1 is the oldest slot in a full ring.
        const f = ring[(this.head + 1 + k) % this.L];
        this.out.set(f, o);
        o += f.length;
      }
    }
    return this.out;
  }
}

/**
 * Depth frame ring with offset stacking, NEWEST -> OLDEST.
 *
 * Mirrors DepthImageObs's `idx = [(head - k) % L]` selection: offset 0 (current
 * frame) comes first, then progressively older frames. The first frame fills
 * every slot so the stack is never zero-padded; reset re-fills on the next push
 * so belief never bleeds across an episode boundary.
 */
export class DepthRing {
  constructor(offsets, frameDim) {
    this.offsets = [...offsets].sort((a, b) => a - b);
    this.L = Math.max(...this.offsets) + 1;
    this.frameDim = frameDim;
    this.buf = Array.from({ length: this.L }, () => new Float32Array(frameDim));
    this.head = 0;
    this.pendingReset = true;
    this.out = new Float32Array(this.offsets.length * frameDim);
  }

  reset() {
    this.pendingReset = true;
  }

  /** Push the current normalised frame; returns the stacked observation. */
  push(frame) {
    if (frame.length !== this.frameDim) {
      throw new Error(`depth frame ${frame.length} != expected ${this.frameDim}`);
    }
    if (this.pendingReset) {
      for (const f of this.buf) f.set(frame);
      this.head = 0;
      this.pendingReset = false;
    } else {
      this.head = (this.head + 1) % this.L;
      this.buf[this.head].set(frame);
    }
    for (let i = 0; i < this.offsets.length; i++) {
      const k = this.offsets[i];
      const idx = ((this.head - k) % this.L + this.L) % this.L;
      this.out.set(this.buf[idx], i * this.frameDim);
    }
    return this.out;
  }
}

/** Concatenate proprio ++ depth into the actor input buffer. */
export function assembleObs(proprio, depth, out) {
  const need = proprio.length + depth.length;
  if (!out || out.length !== need) out = new Float32Array(need);
  out.set(proprio, 0);
  out.set(depth, proprio.length);
  return out;
}
