// =============================================
// TraceMoment.tsx — Worksheet-style trace overlay
// =============================================
// Renders an in-room dim vignette, scales up the
// target prop, draws a single lowercase letter as
// a worksheet (outlined letter body + dashed
// direction guide + numbered stroke markers +
// arrow heads), and lets the child trace with a
// finger. On success: prop swaps to its "active"
// sprite, success animation plays, then onComplete
// fires after a short reaction beat.
//
// Validation is order-agnostic via useTraceValidator
// (forgiving), but the visual layout teaches the
// conventional stroke order ① → ② → ③.
// =============================================

import React, { useEffect, useMemo, useRef, useState } from "react";
import { LETTER_PATHS } from "./letterPaths";
import { useTraceValidator } from "./useTraceValidator";
import { playLetterSound, playEvent } from "../../audio/SoundEffects";
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

interface StrokeMeta {
  start: { x: number; y: number };
  end: { x: number; y: number };
  startAngle: number; // degrees, 0=right, 90=down
  endAngle: number;   // degrees, 0=right, 90=down
}

const SKIP_REVEAL_MS = 30_000;
const REACTION_HOLD_MS = 1500;

/** Split a path's `d` into per-sub-path strings (each starts with an
 *  M command). The leading non-M chunk (if any) is dropped. */
function splitSubPaths(d: string): string[] {
  return d
    .split(/(?=[Mm](?=[\s\-0-9.]))/)
    .map((s) => s.trim())
    .filter((s) => /^[Mm]/.test(s));
}

/** Parse each sub-path of `d` into a stroke meta record. Uses a
 *  detached SVGPathElement so we can ride the browser's geometry
 *  APIs instead of writing a path parser. Safe to call during render
 *  in modern browsers (Chrome / Safari / Firefox all support
 *  getTotalLength on a detached element). */
function parseStrokes(d: string): StrokeMeta[] {
  if (typeof document === "undefined") return [];
  const out: StrokeMeta[] = [];
  for (const subD of splitSubPaths(d)) {
    const el = document.createElementNS("http://www.w3.org/2000/svg", "path");
    el.setAttribute("d", subD);
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
    });
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

  const handleSuccess = () => {
    if (completed) return;
    setCompleted(true);
    playLetterSound(letter);
    playEvent("mini-correct");
    window.setTimeout(() => onComplete(), REACTION_HOLD_MS);
  };

  const validator = useTraceValidator({
    pathRef,
    svgRef,
    onSuccess: handleSuccess,
  });

  useEffect(() => {
    if (!onSkip) return;
    const t = window.setTimeout(() => setSkipVisible(true), SKIP_REVEAL_MS);
    return () => window.clearTimeout(t);
  }, [onSkip]);

  useEffect(() => {
    if (!path) onComplete();
  }, [path, onComplete]);

  // Stroke meta is derived from the path data so multi-stroke letters
  // (m, n, h, k, t, f, …) automatically get the right number of
  // markers and arrow heads without per-letter authoring.
  const strokes = useMemo<StrokeMeta[]>(() => {
    return path ? parseStrokes(path.d) : [];
  }, [path]);

  // Hit-position reveal — each hit waypoint stamps a circle into the
  // completed mask at its xy position so multi-stroke letters can't
  // bleed reveal across sub-paths.
  const hitPositions = useMemo<Array<{ x: number; y: number }>>(() => {
    const el = pathRef.current;
    const total = validator.pathLength;
    const N = validator.hitMask.length;
    if (!el || !total || N === 0) return [];
    const out: Array<{ x: number; y: number }> = [];
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

  if (!path) return null;

  return (
    <div
      className={`trace-moment ${completed ? "trace-moment--complete" : ""}`}
      role="dialog"
      aria-label="Trace the letter"
    >
      <div className="trace-moment__vignette" />

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

      <div className="trace-moment__prompt">Trace the letter</div>
      {caption && (
        <div className="trace-moment__caption" aria-live="polite">{caption}</div>
      )}

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
          onPointerDown={validator.onPointerDown}
          onPointerMove={validator.onPointerMove}
          onPointerUp={validator.onPointerUp}
          onPointerCancel={validator.onPointerCancel}
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

          {/* Start arrow — anchored at the natural touchscreen entry
              point (bottom of first stroke via path.startHint) rather
              than the path's M-command origin (which sits at the top
              for most letters). Direction defaults to "up" since the
              kid is dragging upward into the letter; letters with
              curved entries (c, s, …) override via startHintAngle.
              Validator is order-agnostic, so this is visual only. */}
          {!completed && (path.startHint ?? strokes[0]?.end) && (() => {
            const pos = path.startHint ?? strokes[0]!.end;
            const angle = path.startHintAngle ?? -90;
            return (
              <g
                className="trace-moment__stroke-arrow"
                transform={`translate(${pos.x} ${pos.y}) rotate(${angle})`}
                pointerEvents="none"
              >
                <path d="M -4 -3 L 1 0 L -4 3 z" className="trace-moment__arrow-head" />
              </g>
            );
          })()}

          {validator.pointerPos && !completed && (
            <circle
              className="trace-moment__spark"
              cx={validator.pointerPos.x}
              cy={validator.pointerPos.y}
              r={3.2}
            />
          )}
        </svg>
      </div>
    </div>
  );
};

export default TraceMoment;
