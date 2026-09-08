// =============================================
// TraceMoment.tsx — Worksheet-style trace overlay
// =============================================
// Renders an in-room dim vignette, scales up the
// target prop, draws a single lowercase letter as
// a worksheet (outlined letter body + dashed
// direction guide), and teaches the kid the letter
// in two phases:
//
//   1. Watch  — an animated dot demonstrates the
//      correct stroke order and direction, pausing
//      at each stroke's true starting point before
//      moving. A "show me again" button lets the
//      kid re-watch at any time.
//   2. Trace  — the kid traces the same letter.
//      Validation is order-agnostic via
//      useTraceValidator (forgiving — this component
//      only WATCHES for stroke order/coverage, it
//      doesn't reject off-order touches), but a
//      hopping start-indicator visually guides multi-
//      stroke letters (m, n, h, k, t, f, i, j) through
//      their strokes one at a time, matching what the
//      demo just showed.
//
// On success: prop swaps to its "active" sprite,
// success animation plays, then onComplete fires
// after a short reaction beat.
// =============================================

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LETTER_PATHS } from "./letterPaths";
import { useTraceValidator } from "./useTraceValidator";
import { playLetterSound, playEvent, waitForLetterDone } from "../../audio/SoundEffects";
import "../../styles/trace-moment.css";

interface TraceMomentProps {
  /** Single lowercase letter to trace. Must exist in LETTER_PATHS. */
  letter: string;
  /** Optional asset URL shown before tracing succeeds (Discovery-Room
   *  prop sprite). Omit for in-quest trace where there's no prop. */
  dimSrc?: string;
  /** Optional asset URL shown after tracing succeeds. Omit when there's
   *  no prop sprite to swap. Either both or neither should be set. */
  activeSrc?: string;
  /** Optional caption shown below the trace prompt — e.g. "for CAT" so
   *  the kid keeps word context while focusing on the letter. */
  caption?: string;
  /** Fired after the success reaction animation finishes. */
  onComplete: () => void;
  /** Optional skip handler — exposed after a delay for accessibility. */
  onSkip?: () => void;
}

interface Pt { x: number; y: number; }

interface StrokeMeta {
  start: Pt;
  end: Pt;
  startAngle: number; // degrees, 0=right, 90=down
  endAngle: number;
  len: number;
  /** Cumulative path length (in the combined multi-stroke path) before
   *  this stroke begins — used to map stroke ranges onto the shared
   *  validator's waypoint indices. */
  startLen: number;
}

const SKIP_REVEAL_MS = 30_000;
const REACTION_HOLD_MS = 1500;

// Multi-stroke guidance thresholds (ported from the same tuning used by
// the Discovery-Room first-visit trace prototype): hop is more lenient
// than done so the kid sees the next stroke's hint while still tying off
// the current one, but success requires each stroke to be nearly fully
// covered before the letter counts as finished.
const STROKE_HOP_COVERAGE = 0.7;
const STROKE_DONE_COVERAGE = 0.95;

// Demo playback pacing — slow enough for a young kid to visually track
// the dot, capped so a long, curvy single-stroke letter (s, g, e) doesn't
// drag on.
const DEMO_MS_PER_UNIT = 9;
const DEMO_STROKE_MIN_MS = 500;
const DEMO_STROKE_MAX_MS = 1400;
const DEMO_FIRST_PAUSE_MS = 350; // hold on stroke 1's start point before moving
const DEMO_NEXT_PAUSE_MS = 300;  // hold on each subsequent stroke's start point

/** Split a path's `d` into per-sub-path strings (each starts with an
 *  M command). The leading non-M chunk (if any) is dropped. */
function splitSubPaths(d: string): string[] {
  return d
    .split(/(?=[Mm](?=[\s\-0-9.]))/)
    .map((s) => s.trim())
    .filter((s) => /^[Mm]/.test(s));
}

/** Build one detached SVGPathElement per stroke. Detached elements still
 *  support getTotalLength/getPointAtLength in Chrome/Safari/Firefox, so
 *  this avoids ever attaching hidden nodes to the real DOM. Kept around
 *  (not just used transiently) so the demo animation can keep sampling
 *  the same elements every frame instead of recreating them. */
function buildStrokeElements(d: string): SVGPathElement[] {
  if (typeof document === "undefined") return [];
  return splitSubPaths(d).map((subD) => {
    const el = document.createElementNS("http://www.w3.org/2000/svg", "path");
    el.setAttribute("d", subD);
    return el;
  });
}

/** Derive start/end points, tangent angles, and length metadata for each
 *  stroke element. Multi-stroke letters (m, n, h, k, t, f, i, j) get one
 *  entry per real pen-stroke automatically, from the path data alone —
 *  no per-letter authoring needed. */
function computeStrokeMetas(els: SVGPathElement[]): StrokeMeta[] {
  const out: StrokeMeta[] = [];
  let cum = 0;
  for (const el of els) {
    let total = 0;
    try {
      total = el.getTotalLength();
    } catch {
      continue;
    }
    if (!total || !isFinite(total)) continue;
    const start = el.getPointAtLength(0);
    const end = el.getPointAtLength(total);
    // Sample slightly past the start and just before the end to get
    // tangents. 1 unit on a 100-unit viewBox is enough resolution.
    const afterStart = el.getPointAtLength(Math.min(total, 1));
    const beforeEnd = el.getPointAtLength(Math.max(0, total - 1));
    const startAngle =
      Math.atan2(afterStart.y - start.y, afterStart.x - start.x) * (180 / Math.PI);
    const endAngle =
      Math.atan2(end.y - beforeEnd.y, end.x - beforeEnd.x) * (180 / Math.PI);
    out.push({
      start: { x: start.x, y: start.y },
      end: { x: end.x, y: end.y },
      startAngle,
      endAngle,
      len: total,
      startLen: cum,
    });
    cum += total;
  }
  return out;
}

const TraceMoment: React.FC<TraceMomentProps> = ({
  letter,
  dimSrc,
  activeSrc,
  caption,
  onComplete,
  onSkip,
}) => {
  const hasPropSprite = !!dimSrc && !!activeSrc;
  const path = LETTER_PATHS[letter];
  const svgRef = useRef<SVGSVGElement | null>(null);
  const pathRef = useRef<SVGPathElement | null>(null);
  const [completed, setCompleted] = useState(false);
  const [skipVisible, setSkipVisible] = useState(false);

  // ---- Watch/Trace phase ----
  const [phase, setPhase] = useState<"demo" | "tracing">("demo");
  const [demoStrokeIdx, setDemoStrokeIdx] = useState(0);
  const [demoDotPos, setDemoDotPos] = useState<Pt | null>(null);
  const [replayToken, setReplayToken] = useState(0);
  const demoCancelRef = useRef(false);

  const handleSuccess = () => {
    if (completed) return;
    setCompleted(true);
    playLetterSound(letter);
    // Sequence "mini-correct" after the phoneme finishes (same
    // waitForLetterDone pattern GameScreen/PotionGameScreen/Onboarding
    // use for word→celebration) instead of firing both at once, which
    // overlapped the phoneme with "That's right!". The reaction-hold
    // timer starts once mini-correct begins, so onComplete no longer
    // fires while it's still mid-playback.
    waitForLetterDone().then(() => {
      playEvent("mini-correct");
      window.setTimeout(() => onComplete(), REACTION_HOLD_MS);
    });
  };

  // The validator's own global-coverage success trigger is disabled
  // (coverageThreshold: 2 is unreachable) — success is instead driven by
  // the per-stroke gate effect below, which requires EVERY stroke to be
  // covered rather than letting one long sub-path alone trip it.
  const validator = useTraceValidator({
    pathRef,
    svgRef,
    onSuccess: () => {},
    coverageThreshold: 2,
  });

  useEffect(() => {
    if (!onSkip) return;
    const t = window.setTimeout(() => setSkipVisible(true), SKIP_REVEAL_MS);
    return () => window.clearTimeout(t);
  }, [onSkip]);

  useEffect(() => {
    if (!path) onComplete();
  }, [path, onComplete]);

  const strokeEls = useMemo<SVGPathElement[]>(() => {
    return path ? buildStrokeElements(path.d) : [];
  }, [path]);

  // Stroke meta is derived from the path data so multi-stroke letters
  // automatically get the right number of markers, arrows, and demo
  // beats without per-letter authoring.
  const strokes = useMemo<StrokeMeta[]>(() => {
    return computeStrokeMetas(strokeEls);
  }, [strokeEls]);

  // ---- Demo playback ----
  useEffect(() => {
    if (!path || strokes.length === 0) return;
    demoCancelRef.current = false;
    setPhase("demo");
    setDemoStrokeIdx(0);
    setDemoDotPos(null);

    const sleep = (ms: number) =>
      new Promise<void>((resolve) => window.setTimeout(resolve, ms));

    const animateStroke = (idx: number): Promise<void> =>
      new Promise((resolve) => {
        const el = strokeEls[idx];
        const meta = strokes[idx];
        if (!el || !meta) {
          resolve();
          return;
        }
        const duration = Math.min(
          DEMO_STROKE_MAX_MS,
          Math.max(DEMO_STROKE_MIN_MS, meta.len * DEMO_MS_PER_UNIT)
        );
        const startedAt = performance.now();
        const step = (now: number) => {
          if (demoCancelRef.current) {
            resolve();
            return;
          }
          const t = Math.min(1, (now - startedAt) / duration);
          let p: Pt;
          try {
            p = el.getPointAtLength(t * meta.len);
          } catch {
            p = meta.end;
          }
          setDemoDotPos({ x: p.x, y: p.y });
          if (t < 1) {
            requestAnimationFrame(step);
          } else {
            resolve();
          }
        };
        requestAnimationFrame(step);
      });

    (async () => {
      playLetterSound(letter);
      for (let i = 0; i < strokes.length; i++) {
        if (demoCancelRef.current) return;
        setDemoStrokeIdx(i);
        // Hold on the start point first so the kid registers WHERE this
        // stroke begins before watching it move.
        await sleep(i === 0 ? DEMO_FIRST_PAUSE_MS : DEMO_NEXT_PAUSE_MS);
        if (demoCancelRef.current) return;
        await animateStroke(i);
      }
      if (demoCancelRef.current) return;
      setDemoDotPos(null);
      setPhase("tracing");
    })();

    return () => {
      demoCancelRef.current = true;
    };
  }, [path, strokes, strokeEls, letter, replayToken]);

  const handleReplay = useCallback(() => {
    if (completed) return;
    setReplayToken((t) => t + 1);
  }, [completed]);

  // Hit-position reveal — each hit waypoint stamps a circle into the
  // completed mask at its xy position so multi-stroke letters can't
  // bleed reveal across sub-paths.
  const hitPositions = useMemo<Pt[]>(() => {
    const el = pathRef.current;
    const total = validator.pathLength;
    const N = validator.hitMask.length;
    if (!el || !total || N === 0) return [];
    const out: Pt[] = [];
    for (let i = 0; i < N; i++) {
      if (!validator.hitMask[i]) continue;
      const t = (i / (N - 1)) * total;
      try {
        const p = el.getPointAtLength(t);
        out.push({ x: p.x, y: p.y });
      } catch {
        // browser refused — skip
      }
    }
    return out;
  }, [validator.hitMask, validator.pathLength]);

  // Which stroke (if any) currently needs the child's attention during
  // live tracing — hops forward once the current stroke crosses
  // STROKE_HOP_COVERAGE, hides while the kid is mid-stroke, and returns
  // null once every stroke is essentially done.
  const liveStrokeIdx = useMemo<number | null>(() => {
    if (strokes.length === 0) return null;
    const totalLen = validator.pathLength;
    const N = validator.hitMask.length;
    if (!totalLen || N < 2) return 0;
    const segLen = totalLen / (N - 1);
    for (let idx = 0; idx < strokes.length; idx++) {
      const s = strokes[idx];
      const startIdx = Math.max(0, Math.ceil(s.startLen / segLen));
      const endIdx = Math.min(N, Math.floor((s.startLen + s.len) / segLen) + 1);
      const total = endIdx - startIdx;
      if (total <= 0) continue;
      let hits = 0;
      for (let i = startIdx; i < endIdx; i++) if (validator.hitMask[i]) hits++;
      const coverage = hits / total;
      if (coverage >= STROKE_HOP_COVERAGE) continue;
      if (hits > 0) return null; // mid-stroke — stay out of the way
      return idx;
    }
    return null;
  }, [strokes, validator.pathLength, validator.hitMask]);

  // Per-stroke completion gate — every stroke must independently reach
  // STROKE_DONE_COVERAGE before the letter counts as traced. Prevents a
  // multi-stroke letter (m, t, …) from succeeding just because its
  // longest sub-path alone was covered.
  useEffect(() => {
    if (completed) return;
    if (phase !== "tracing") return;
    // Wait for the kid to lift their finger — coverage can cross
    // threshold mid-drag, and firing success while still moving feels
    // premature.
    if (validator.pointerPos) return;
    const totalLen = validator.pathLength;
    const N = validator.hitMask.length;
    if (!totalLen || N < 2 || strokes.length === 0) return;
    const segLen = totalLen / (N - 1);
    for (const s of strokes) {
      const startIdx = Math.max(0, Math.ceil(s.startLen / segLen));
      const endIdx = Math.min(N, Math.floor((s.startLen + s.len) / segLen) + 1);
      const total = endIdx - startIdx;
      if (total <= 0) continue;
      let hits = 0;
      for (let i = startIdx; i < endIdx; i++) if (validator.hitMask[i]) hits++;
      if (hits / total < STROKE_DONE_COVERAGE) return; // some stroke isn't done yet
    }
    handleSuccess();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completed, phase, validator.hitMask, validator.pathLength, validator.pointerPos, strokes]);

  if (!path) return null;

  // The stroke the "start here" indicator (ring + dot + arrow) should
  // sit on right now — the stroke currently being demoed, or the next
  // stroke the kid needs to start during live tracing.
  const indicatorStroke =
    phase === "demo" ? strokes[demoStrokeIdx] : liveStrokeIdx !== null ? strokes[liveStrokeIdx] : null;

  return (
    <div
      className={`trace-moment ${completed ? "trace-moment--complete" : ""}`}
      role="dialog"
      aria-label="Trace the letter"
    >
      <div className="trace-moment__vignette" />

      <div className="trace-moment__panel">
        {/* Skip/replay live INSIDE the panel (not the outer .trace-moment
            wrapper) so they inherit the panel's own bounds. In the potion
            game, .machine-world--potion repositions .trace-moment__panel
            into the chalkboard area via a percentage inset of its own
            box — but .trace-moment itself keeps its default full-bleed
            box, which sits partly above the visible viewport in that
            layout. A button positioned absolute against .trace-moment
            directly (as these used to be) renders off-screen there. */}
        {onSkip && (
          <button
            className={`trace-moment__skip ${skipVisible ? "trace-moment__skip--visible" : ""}`}
            onClick={onSkip}
            aria-label="Skip"
            tabIndex={skipVisible ? 0 : -1}
          >
            Skip
          </button>
        )}

        {!completed && (
          <button
            className={`trace-moment__replay ${phase === "demo" ? "trace-moment__replay--active" : ""}`}
            onClick={handleReplay}
            aria-label="Watch the letter demonstration again"
          >
            🔁
          </button>
        )}

        <div className="trace-moment__header">
          <span className="trace-moment__prompt">Trace the letter</span>
          {caption && (
            <span className="trace-moment__caption" aria-live="polite">{caption}</span>
          )}
          <span className="trace-moment__phase-hint" aria-live="polite">
            {completed ? "🎉 Great job!" : phase === "demo" ? "👀 Watch first!" : "✏️ Your turn!"}
          </span>
        </div>

        <div className="trace-moment__stage">
        {hasPropSprite && (
          <div className={`trace-moment__prop ${completed ? "trace-moment__prop--lit" : ""}`}>
            <img
              src={completed ? activeSrc : dimSrc}
              alt=""
              draggable={false}
            />
          </div>
        )}

        <svg
          ref={svgRef}
          className="trace-moment__svg"
          viewBox={path.viewBox}
          preserveAspectRatio="xMidYMid meet"
          onPointerDown={phase === "tracing" ? validator.onPointerDown : undefined}
          onPointerMove={phase === "tracing" ? validator.onPointerMove : undefined}
          onPointerUp={phase === "tracing" ? validator.onPointerUp : undefined}
          onPointerCancel={phase === "tracing" ? validator.onPointerCancel : undefined}
        >
          <defs>
            {/* Hit-position reveal mask. Each touched waypoint stamps
                a white circle so the completed dashes show through
                only where the finger actually went. */}
            <mask id="trace-completed-mask">
              <rect width="100%" height="100%" fill="black" />
              {hitPositions.map((p, i) => (
                <circle key={i} cx={p.x} cy={p.y} r={4.5} fill="white" />
              ))}
            </mask>
          </defs>

          {/* Bubble-letter body — two stacked strokes of the same
              centerline. The outer (wider, white) is the visible
              outline edge; the inner (narrower, dark) carves out a
              hollow interior so the dashed guide reads against a
              clean background instead of stamping over a solid white
              fill. All trace layers share `path.d` so they always
              align. */}
          <path
            className="trace-moment__letter-body-outer"
            d={path.d}
          />
          <path
            className="trace-moment__letter-body-inner"
            d={path.d}
          />

          {/* Dashed direction guide — sits inside the hollow interior
              of the bubble letter, showing the kid the path their
              finger should follow. Also what the completed mask
              reveals as yellow once traced. */}
          <path
            ref={pathRef}
            className="trace-moment__path-guide"
            d={path.d}
          />

          {/* Completed dashes — same path, brighter color, mask-revealed
              for the regions the finger has touched. */}
          <path
            className="trace-moment__path-completed"
            d={path.d}
            mask="url(#trace-completed-mask)"
          />

          {/* Start indicator — pulsing ring + dot + direction arrow,
              anchored at the TRUE geometric start of the active stroke
              (the path's own M-origin, which letterPaths.ts already
              authors as the natural handwriting start point) rather
              than a touch-ergonomic override. Hops from stroke to
              stroke during both the demo and live tracing, so the kid
              sees the same "start here" cue in both phases. */}
          {!completed && indicatorStroke && (
            <g
              className="trace-moment__start-indicator"
              transform={`translate(${indicatorStroke.start.x} ${indicatorStroke.start.y})`}
              pointerEvents="none"
            >
              <circle className="trace-moment__start-ring" r={2} />
              <circle className="trace-moment__start-dot" r={2.2} />
              <g transform={`rotate(${indicatorStroke.startAngle})`}>
                <path d="M -2 -3 L 4 0 L -2 3 z" className="trace-moment__arrow-head" />
              </g>
            </g>
          )}

          {/* Demo pointer — animated dot showing correct stroke motion
              during the Watch phase. */}
          {phase === "demo" && demoDotPos && (
            <circle
              className="trace-moment__demo-pointer"
              cx={demoDotPos.x}
              cy={demoDotPos.y}
              r={4}
            />
          )}

          {validator.pointerPos && !completed && (
            <circle
              className="trace-moment__spark"
              cx={validator.pointerPos.x}
              cy={validator.pointerPos.y}
              r={3.2}
            />
          )}
        </svg>
        </div>{/* trace-moment__stage */}
      </div>{/* trace-moment__panel */}
    </div>
  );
};

export default TraceMoment;
