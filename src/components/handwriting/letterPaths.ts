// =============================================
// letterPaths.ts — SVG path data for traced letters
// =============================================
// Lowercase, single-style. viewBox is always 100x100 so
// hit-radius math in the validator stays consistent.
// Multi-segment paths (M ... M ...) are fine — kids can
// lift and continue; getPointAtLength still samples
// across the whole path.
// =============================================

export interface LetterPath {
  d: string;
  viewBox: string;
}

export const LETTER_PATHS: Record<string, LetterPath> = {
  c: {
    d: "M 76 24 Q 22 22 22 50 Q 22 78 76 76",
    viewBox: "0 0 100 100",
  },
  t: {
    d: "M 50 14 L 50 70 Q 50 78 62 76 M 30 32 L 70 32",
    viewBox: "0 0 100 100",
  },
  m: {
    // Two sub-paths (split at the second M):
    //   1) left vertical + top arch + middle vertical down
    //   2) right arch + right vertical down
    // Per-sub-path rendering in ExploreScreen ensures stroke 2 stays dark
    // until its own waypoints are hit; the global validator keeps a single
    // continuous trace experience.
    d: "M 20 78 L 20 32 Q 20 22 32 22 Q 44 22 44 32 L 44 78 M 44 32 Q 44 22 56 22 Q 68 22 68 32 L 68 78",
    viewBox: "0 0 100 100",
  },
  p: {
    d: "M 28 92 L 28 22 L 56 22 Q 70 22 70 38 Q 70 54 56 54 L 28 54",
    viewBox: "0 0 100 100",
  },
  v: {
    // Two diagonals meeting at the bottom — kids can trace as one stroke
    // or two; the validator works on coverage, not stroke order.
    d: "M 22 22 L 50 78 L 78 22",
    viewBox: "0 0 100 100",
  },

  // ---- Vowels ----
  a: {
    // Round handwriting "a" — bowl on the left + short tail on the right.
    // Earlier draft had the stem from y=22 to y=78 (taller than the bowl),
    // which read as "d". Stem now sits from the top of the bowl (y=30) to
    // a small tail below it (y=80), so it's unmistakably "a".
    d: "M 65 30 Q 25 30 25 50 Q 25 70 65 70 M 65 30 L 65 80",
    viewBox: "0 0 100 100",
  },
  e: {
    // Crossbar then the curve sweeps up over and around to bottom-right.
    d: "M 25 50 L 70 50 M 70 50 Q 70 25 45 25 Q 20 25 20 50 Q 20 75 70 75",
    viewBox: "0 0 100 100",
  },
  i: {
    // Dot (small loop) + vertical stem.
    d: "M 50 16 Q 58 16 58 22 Q 58 28 50 28 Q 42 28 42 22 Q 42 16 50 16 M 50 36 L 50 78",
    viewBox: "0 0 100 100",
  },
  o: {
    // Closed oval, clockwise from the top.
    d: "M 50 25 Q 75 25 75 50 Q 75 75 50 75 Q 25 75 25 50 Q 25 25 50 25",
    viewBox: "0 0 100 100",
  },
  u: {
    // Down-left, curve at bottom, up-right.
    d: "M 25 30 L 25 65 Q 30 78 50 78 Q 75 78 75 65 L 75 30",
    viewBox: "0 0 100 100",
  },

  // ---- Common consonants ----
  b: {
    // Stem + bowl on the lower-right.
    d: "M 25 22 L 25 78 M 25 50 Q 70 50 70 65 Q 70 78 25 78",
    viewBox: "0 0 100 100",
  },
  d: {
    // Bowl on the lower-left + stem on the right.
    d: "M 75 50 Q 30 50 30 65 Q 30 78 75 78 M 75 22 L 75 78",
    viewBox: "0 0 100 100",
  },
  h: {
    // Stem + arch sweeping up over and down to baseline.
    d: "M 25 22 L 25 78 M 25 45 Q 50 22 75 45 L 75 78",
    viewBox: "0 0 100 100",
  },
  n: {
    // Single stroke: up-left, arch over, down-right.
    d: "M 25 78 L 25 30 Q 50 22 75 30 L 75 78",
    viewBox: "0 0 100 100",
  },
  s: {
    // Serpentine — top curve then bottom curve, single stroke.
    d: "M 70 30 Q 50 22 30 30 Q 22 38 30 50 Q 50 58 70 50 Q 78 58 70 70 Q 50 78 30 70",
    viewBox: "0 0 100 100",
  },
  f: {
    // Hook at top, vertical stem, crossbar through the middle.
    // Two sub-paths: stem-with-hook, then the crossbar.
    d: "M 70 30 Q 55 18 40 26 L 40 80 M 28 46 L 60 46",
    viewBox: "0 0 100 100",
  },
  g: {
    // Bowl + descender that hooks left. Single continuous stroke that
    // starts at the top right, sweeps left around the bowl, comes back
    // to the right side, drops below the baseline, then hooks left.
    d: "M 72 38 Q 50 22 30 38 Q 22 50 30 62 Q 50 72 72 60 L 72 80 Q 72 92 56 92 Q 42 92 38 84",
    viewBox: "0 0 100 100",
  },
  j: {
    // Tittle (dot loop) + descender stem that hooks left at the bottom.
    d: "M 58 16 Q 66 16 66 22 Q 66 28 58 28 Q 50 28 50 22 Q 50 16 58 16 M 58 36 L 58 78 Q 58 92 42 92 Q 30 92 28 80",
    viewBox: "0 0 100 100",
  },
  k: {
    // Vertical stem + upper diagonal in + lower diagonal out.
    // Three sub-paths so each leg lights independently as the kid traces it.
    d: "M 30 22 L 30 78 M 70 30 L 30 54 M 42 50 L 72 78",
    viewBox: "0 0 100 100",
  },
  l: {
    // Simple vertical stem — full x-height plus a touch.
    d: "M 50 18 L 50 78",
    viewBox: "0 0 100 100",
  },
  r: {
    // Stem + small hook arching up to the right at the top.
    d: "M 30 30 L 30 78 M 30 38 Q 40 22 60 28 Q 68 30 70 36",
    viewBox: "0 0 100 100",
  },
  w: {
    // Four diagonals zig-zagging across the baseline. Single stroke,
    // mirrors uppercase W. Kids can lift and continue — coverage-based.
    d: "M 18 28 L 32 78 L 50 38 L 68 78 L 82 28",
    viewBox: "0 0 100 100",
  },
};
