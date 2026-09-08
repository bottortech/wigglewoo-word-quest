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
  /** Optional position for the start arrow / "start here" hint. Set
   *  to the natural touchscreen entry point — usually the bottom of
   *  the first stroke — rather than the path's M-command origin
   *  (which is conventional handwriting start, often the top). The
   *  validator is coverage- and order-agnostic, so this is visual
   *  guidance only. */
  startHint?: { x: number; y: number };
  /** Optional rotation (degrees) for the start arrow when sitting at
   *  startHint. 0 = right, -90 = up (default), 90 = down. Override
   *  for letters whose drag direction isn't straight up (e.g. c, s). */
  startHintAngle?: number;
}

export const LETTER_PATHS: Record<string, LetterPath> = {
  // ---- Vowels ----
  a: {
    // Bowl counter-clockwise from upper-right, then tail down on the right.
    // startHint at stem bottom so the last waypoint (end of stem) is hit
    // immediately on touch-down — requireEnd passes as soon as the finger
    // lands, then 85% bowl+stem coverage triggers success.
    d: "M 65 30 Q 25 30 25 50 Q 25 70 65 70 M 65 30 L 65 80",
    viewBox: "0 0 100 100",
    startHint: { x: 65, y: 80 },
  },
  e: {
    // Single stroke: crossbar left → right, then sweep up-left-down-right.
    d: "M 25 50 L 70 50 Q 70 25 45 25 Q 20 25 20 50 Q 20 75 70 75",
    viewBox: "0 0 100 100",
    startHint: { x: 65, y: 75 },
  },
  i: {
    // Dot (small loop) first, then vertical stem starts at the top.
    d: "M 50 16 Q 58 16 58 22 Q 58 28 50 28 Q 42 28 42 22 Q 42 16 50 16 M 50 36 L 50 78",
    viewBox: "0 0 100 100",
    startHint: { x: 50, y: 78 },
  },
  o: {
    // Closed oval, counter-clockwise from top (matches the c direction).
    d: "M 50 25 Q 25 25 25 50 Q 25 75 50 75 Q 75 75 75 50 Q 75 25 50 25",
    viewBox: "0 0 100 100",
    startHint: { x: 50, y: 75 },
  },
  u: {
    // Single stroke: top-left down, curve at bottom, up to top-right.
    d: "M 25 30 L 25 65 Q 30 78 50 78 Q 75 78 75 65 L 75 30",
    viewBox: "0 0 100 100",
    startHint: { x: 25, y: 30 },
    startHintAngle: 90,
  },

  // ---- Common consonants ----
  b: {
    // Single continuous stroke: top of stem, down to baseline, around the
    // bowl going right, back up to the middle of the stem.
    d: "M 25 22 L 25 78 Q 70 78 70 65 Q 70 50 25 50",
    viewBox: "0 0 100 100",
    startHint: { x: 25, y: 78 },
  },
  c: {
    // Tips pushed to x=84 and spread to y=22/78 so the bubble-letter
    // stroke caps at each opening end are clearly separated (38-unit
    // gap) and don't merge into a vertical-bar appearance.
    d: "M 84 22 Q 12 20 12 50 Q 12 80 84 78",
    viewBox: "0 0 100 100",
    startHint: { x: 84, y: 78 },
  },
  d: {
    // Two strokes, matching the standard K-1 "Magic C, up like a
    // helicopter, and back down" instruction: (1) the bowl, starting
    // upper-right and sweeping counter-clockwise — same Magic-C direction
    // as a/c/g/o/q; (2) the tall stem, top to bottom. Deliberately NOT a
    // mirror of "b" (which is stem-first) — using a different motor
    // pattern for b vs d is a standard technique for reducing b/d
    // reversals in early readers, on top of matching the taught method.
    d: "M 75 50 Q 30 50 30 65 Q 30 78 75 78 M 75 22 L 75 78",
    viewBox: "0 0 100 100",
    startHint: { x: 75, y: 50 },
  },
  f: {
    // Hook at the top curling left + vertical stem, then horizontal crossbar.
    d: "M 70 30 Q 55 18 40 26 L 40 80 M 28 46 L 60 46",
    viewBox: "0 0 100 100",
    startHint: { x: 40, y: 80 },
  },
  g: {
    // Bowl counter-clockwise from upper-right, close the right side back to
    // upper-right, then descender hooking left.
    d: "M 72 38 Q 50 22 30 38 Q 22 50 30 62 Q 50 72 72 60 Q 76 48 72 38 L 72 80 Q 72 92 56 92 Q 42 92 38 84",
    viewBox: "0 0 100 100",
    startHint: { x: 72, y: 38 },
    startHintAngle: 180,
  },
  h: {
    // Stem from top down, lift, then arch over from middle.
    d: "M 25 22 L 25 78 M 25 45 Q 50 22 75 45 L 75 78",
    viewBox: "0 0 100 100",
    startHint: { x: 25, y: 78 },
  },
  j: {
    // Tittle (dot) first, then descender stem hooking left.
    d: "M 58 16 Q 66 16 66 22 Q 66 28 58 28 Q 50 28 50 22 Q 50 16 58 16 M 58 36 L 58 78 Q 58 92 42 92 Q 30 92 28 80",
    viewBox: "0 0 100 100",
    startHint: { x: 58, y: 36 },
    startHintAngle: 90,
  },
  k: {
    // Stem top→bottom, then BOTH diagonals starting at the stem and
    // kicking outward (matches standard instruction — pencil starts
    // touching the line and moves away from it, never the reverse).
    // The upper diagonal previously ran the wrong way (outer corner
    // in to the stem); now consistent with the lower diagonal.
    d: "M 30 22 L 30 78 M 30 54 L 70 30 M 42 50 L 72 78",
    viewBox: "0 0 100 100",
    startHint: { x: 30, y: 78 },
  },
  l: {
    // Simple top-to-bottom vertical.
    d: "M 50 18 L 50 78",
    viewBox: "0 0 100 100",
    startHint: { x: 50, y: 78 },
  },
  m: {
    // Three downward strokes, each starting at the top of a stem so the
    // kid's eye is drawn to the top of the letter on every sub-stroke.
    //   1) Left vertical (no arch yet).
    //   2) Left arch + middle vertical.
    //   3) Right arch + right vertical.
    d: "M 20 32 L 20 78 M 20 32 Q 32 22 44 32 L 44 78 M 44 32 Q 56 22 68 32 L 68 78",
    viewBox: "0 0 100 100",
    startHint: { x: 20, y: 78 },
  },
  n: {
    // Two downward strokes — left stem then arch+right-stem. Kid's pen
    // always starts at the top of the letter, never at the baseline.
    d: "M 25 30 L 25 78 M 25 30 Q 50 22 75 30 L 75 78",
    viewBox: "0 0 100 100",
    startHint: { x: 25, y: 78 },
  },
  p: {
    // Two strokes: (1) the stem, top of the x-height down through the
    // descender — was previously encoded bottom-to-top, which is
    // backwards (every other vertical stroke in this file pulls DOWN,
    // matching standard instruction: pencil strokes pull down, never
    // push up); (2) the bowl, starting back at the stem's top and
    // curving right into it, same shape as before. Two strokes (not
    // one continuous path) because the bowl sits well above where the
    // descender ends, unlike "b" whose bowl continues directly from
    // the baseline with no pen lift needed.
    d: "M 28 22 L 28 92 M 28 22 Q 56 22 70 38 Q 70 54 56 54 L 28 54",
    viewBox: "0 0 100 100",
    startHint: { x: 28, y: 22 },
  },
  q: {
    // Bowl shaped exactly like "a" (open three-quarter circle), but with
    // the stem extended past the baseline into a descender.
    d: "M 65 28 Q 25 28 25 50 Q 25 72 65 72 M 65 28 L 65 92",
    viewBox: "0 0 100 100",
    startHint: { x: 65, y: 92 },
  },
  r: {
    // Stem from top down, then small hook at the top.
    d: "M 30 30 L 30 78 M 30 38 Q 40 22 60 28 Q 68 30 70 36",
    viewBox: "0 0 100 100",
    startHint: { x: 30, y: 78 },
  },
  s: {
    // Serpentine from upper-right curving left, then right, then left.
    d: "M 70 30 Q 50 22 30 30 Q 22 38 30 50 Q 50 58 70 50 Q 78 58 70 70 Q 50 78 30 70",
    viewBox: "0 0 100 100",
    startHint: { x: 70, y: 30 },
    startHintAngle: 180,
  },
  t: {
    // Vertical stem with a small tail at the bottom-right, then crossbar.
    d: "M 50 14 L 50 70 Q 50 78 62 76 M 30 32 L 70 32",
    viewBox: "0 0 100 100",
    startHint: { x: 62, y: 76 },
  },
  v: {
    // Two diagonals meeting at the bottom — top-left, down to point,
    // up to top-right.
    d: "M 22 22 L 50 78 L 78 22",
    viewBox: "0 0 100 100",
    startHint: { x: 22, y: 22 },
    startHintAngle: 60,
  },
  w: {
    // Four diagonals zig-zagging across the baseline, top-left to top-right.
    d: "M 18 28 L 32 78 L 50 38 L 68 78 L 82 28",
    viewBox: "0 0 100 100",
    startHint: { x: 18, y: 28 },
    startHintAngle: 75,
  },
  x: {
    // Two crossing diagonals, top-left→bottom-right then top-right→bottom-left.
    d: "M 25 25 L 75 75 M 75 25 L 25 75",
    viewBox: "0 0 100 100",
    startHint: { x: 25, y: 25 },
    startHintAngle: 45,
  },
  y: {
    // Short left diagonal down to the crossing point, long right diagonal
    // continuing through it into a descender tip (bottom-left).
    d: "M 22 26 L 50 58 M 78 26 L 20 92",
    viewBox: "0 0 100 100",
    startHint: { x: 22, y: 26 },
    startHintAngle: 50,
  },
  z: {
    // Single continuous stroke: top bar, diagonal down, bottom bar.
    d: "M 25 30 L 72 30 L 25 72 L 72 72",
    viewBox: "0 0 100 100",
    startHint: { x: 25, y: 30 },
    startHintAngle: 0,
  },
};
