// =============================================
// letterPaths.ts — SVG path data for traced letters
// =============================================
// Lowercase, single-style. viewBox is always 100x100 so
// hit-radius math in the validator stays consistent.
//
// Each letter's path origin (first M command) is at the
// NATURAL handwriting start point — where a kid would
// place their pen first when writing the letter — so
// the trace fill reveals from a sensible location
// instead of a random arbitrary point.
//
// Multi-segment paths (M ... M ...) are fine — kids can
// lift and continue; getPointAtLength still samples
// across the whole path.
// =============================================

export interface LetterPath {
  d: string;
  viewBox: string;
}

export const LETTER_PATHS: Record<string, LetterPath> = {
  // ---- Vowels ----
  a: {
    // Bowl counter-clockwise from upper-right, then tail down on the right.
    d: "M 65 30 Q 25 30 25 50 Q 25 70 65 70 M 65 30 L 65 80",
    viewBox: "0 0 100 100",
  },
  e: {
    // Single stroke: crossbar left → right, then sweep up-left-down-right.
    d: "M 25 50 L 70 50 Q 70 25 45 25 Q 20 25 20 50 Q 20 75 70 75",
    viewBox: "0 0 100 100",
  },
  i: {
    // Dot (small loop) first, then vertical stem starts at the top.
    d: "M 50 16 Q 58 16 58 22 Q 58 28 50 28 Q 42 28 42 22 Q 42 16 50 16 M 50 36 L 50 78",
    viewBox: "0 0 100 100",
  },
  o: {
    // Closed oval, counter-clockwise from top (matches the c direction).
    d: "M 50 25 Q 25 25 25 50 Q 25 75 50 75 Q 75 75 75 50 Q 75 25 50 25",
    viewBox: "0 0 100 100",
  },
  u: {
    // Single stroke: top-left down, curve at bottom, up to top-right.
    d: "M 25 30 L 25 65 Q 30 78 50 78 Q 75 78 75 65 L 75 30",
    viewBox: "0 0 100 100",
  },

  // ---- Common consonants ----
  b: {
    // Single continuous stroke: top of stem, down to baseline, around the
    // bowl going right, back up to the middle of the stem.
    d: "M 25 22 L 25 78 Q 70 78 70 65 Q 70 50 25 50",
    viewBox: "0 0 100 100",
  },
  c: {
    // Upper-right start, curl counter-clockwise to lower-right.
    d: "M 76 24 Q 22 22 22 50 Q 22 78 76 76",
    viewBox: "0 0 100 100",
  },
  d: {
    // Single continuous stroke: top of stem, down to baseline, curl left
    // into the bowl going counter-clockwise, back up to where bowl meets
    // stem at mid-height. Natural "stem-first" handwriting for lowercase d.
    d: "M 75 22 L 75 78 Q 30 78 30 65 Q 30 50 75 50",
    viewBox: "0 0 100 100",
  },
  f: {
    // Hook at the top curling left + vertical stem, then horizontal crossbar.
    d: "M 70 30 Q 55 18 40 26 L 40 80 M 28 46 L 60 46",
    viewBox: "0 0 100 100",
  },
  g: {
    // Bowl counter-clockwise from upper-right, then descender hooking left.
    d: "M 72 38 Q 50 22 30 38 Q 22 50 30 62 Q 50 72 72 60 L 72 80 Q 72 92 56 92 Q 42 92 38 84",
    viewBox: "0 0 100 100",
  },
  h: {
    // Stem from top down, lift, then arch over from middle.
    d: "M 25 22 L 25 78 M 25 45 Q 50 22 75 45 L 75 78",
    viewBox: "0 0 100 100",
  },
  j: {
    // Tittle (dot) first, then descender stem hooking left.
    d: "M 58 16 Q 66 16 66 22 Q 66 28 58 28 Q 50 28 50 22 Q 50 16 58 16 M 58 36 L 58 78 Q 58 92 42 92 Q 30 92 28 80",
    viewBox: "0 0 100 100",
  },
  k: {
    // Stem top→bottom, then upper diagonal in, then lower diagonal out.
    d: "M 30 22 L 30 78 M 70 30 L 30 54 M 42 50 L 72 78",
    viewBox: "0 0 100 100",
  },
  l: {
    // Simple top-to-bottom vertical.
    d: "M 50 18 L 50 78",
    viewBox: "0 0 100 100",
  },
  m: {
    // Three downward strokes, each starting at the top of a stem so the
    // kid's eye is drawn to the top of the letter on every sub-stroke.
    //   1) Left vertical (no arch yet).
    //   2) Left arch + middle vertical.
    //   3) Right arch + right vertical.
    d: "M 20 32 L 20 78 M 20 32 Q 32 22 44 32 L 44 78 M 44 32 Q 56 22 68 32 L 68 78",
    viewBox: "0 0 100 100",
  },
  n: {
    // Two downward strokes — left stem then arch+right-stem. Kid's pen
    // always starts at the top of the letter, never at the baseline.
    d: "M 25 30 L 25 78 M 25 30 Q 50 22 75 30 L 75 78",
    viewBox: "0 0 100 100",
  },
  p: {
    // Two sub-paths: stem from top through baseline into the descender,
    // then bowl from the top-right of the stem curling right around to
    // the mid-left. Stem is top-down so the pen starts at the top of
    // the letter, not at the descender tail.
    d: "M 28 22 L 28 92 M 56 22 Q 70 22 70 38 Q 70 54 56 54 L 28 54",
    viewBox: "0 0 100 100",
  },
  r: {
    // Stem from top down, then small hook at the top.
    d: "M 30 30 L 30 78 M 30 38 Q 40 22 60 28 Q 68 30 70 36",
    viewBox: "0 0 100 100",
  },
  s: {
    // Serpentine from upper-right curving left, then right, then left.
    d: "M 70 30 Q 50 22 30 30 Q 22 38 30 50 Q 50 58 70 50 Q 78 58 70 70 Q 50 78 30 70",
    viewBox: "0 0 100 100",
  },
  t: {
    // Vertical stem with a small tail at the bottom-right, then crossbar.
    d: "M 50 14 L 50 70 Q 50 78 62 76 M 30 32 L 70 32",
    viewBox: "0 0 100 100",
  },
  v: {
    // Two diagonals meeting at the bottom — top-left, down to point,
    // up to top-right.
    d: "M 22 22 L 50 78 L 78 22",
    viewBox: "0 0 100 100",
  },
  w: {
    // Four diagonals zig-zagging across the baseline, top-left to top-right.
    d: "M 18 28 L 32 78 L 50 38 L 68 78 L 82 28",
    viewBox: "0 0 100 100",
  },
};
