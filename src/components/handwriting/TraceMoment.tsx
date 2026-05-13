// =============================================
// TraceMoment.tsx — MVP embedded-trace overlay
// =============================================
// Renders an in-room dim vignette, scales up the
// target prop, draws a single lowercase letter as
// a "circuit" path on it, and lets the child trace
// it with a finger. On success: prop swaps to its
// "active" sprite, success animation plays, then
// onComplete fires after a short reaction beat.
//
// MVP scope:
//   - one letter at a time, one prop, one material
//   - reuses existing /assets/.../power-core-*.png
//   - validation handled by useTraceValidator (forgiving)
// =============================================

import React, { useEffect, useRef, useState } from "react";
import { LETTER_PATHS } from "./letterPaths";
import { useTraceValidator } from "./useTraceValidator";
import { playLetterSound, playEvent } from "../../audio/SoundEffects";
import "../../styles/trace-moment.css";

interface TraceMomentProps {
  /** Single lowercase letter to trace. Must exist in LETTER_PATHS. */
  letter: string;
  /** Asset URL shown before tracing succeeds. */
  dimSrc: string;
  /** Asset URL shown after tracing succeeds. */
  activeSrc: string;
  /** Fired after the success reaction animation finishes. */
  onComplete: () => void;
  /** Optional skip handler — exposed after a delay for accessibility. */
  onSkip?: () => void;
}

const SKIP_REVEAL_MS = 30_000;
const REACTION_HOLD_MS = 1500;

const TraceMoment: React.FC<TraceMomentProps> = ({
  letter,
  dimSrc,
  activeSrc,
  onComplete,
  onSkip,
}) => {
  const path = LETTER_PATHS[letter];
  const svgRef = useRef<SVGSVGElement | null>(null);
  const pathRef = useRef<SVGPathElement | null>(null);
  const [completed, setCompleted] = useState(false);
  const [skipVisible, setSkipVisible] = useState(false);

  const handleSuccess = () => {
    if (completed) return;
    setCompleted(true);
    // Reinforce phonics on success — speak the letter sound.
    playLetterSound(letter);
    // Soft success cue. Reuses an existing event slug.
    playEvent("mini-correct");
    // Hold the lit state briefly so the kid sees the world react.
    window.setTimeout(() => onComplete(), REACTION_HOLD_MS);
  };

  const validator = useTraceValidator({
    pathRef,
    svgRef,
    onSuccess: handleSuccess,
  });

  // Reveal the skip button only if the child stalls.
  useEffect(() => {
    if (!onSkip) return;
    const t = window.setTimeout(() => setSkipVisible(true), SKIP_REVEAL_MS);
    return () => window.clearTimeout(t);
  }, [onSkip]);

  // Misconfigured letter — fail open so we never block gameplay.
  useEffect(() => {
    if (!path) onComplete();
  }, [path, onComplete]);

  if (!path) return null;

  // Length of the path that has been traced so far. Drives the mask
  // that reveals the "completed" (static) dashed layer on top of the
  // perpetually-flowing "pending" dashed layer underneath.
  const coveredLength = validator.pathLength * validator.coverage;

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

      <div className="trace-moment__stage">
        <div className={`trace-moment__prop ${completed ? "trace-moment__prop--lit" : ""}`}>
          <img
            src={completed ? activeSrc : dimSrc}
            alt=""
            draggable={false}
          />
        </div>

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
          {/* Mask that reveals the "completed" dashed layer only for
              the portion of the path the kid has actually traced.
              `strokeDasharray` of (coveredLength, pathLength) draws
              a single white dash of coveredLength followed by an
              infinite gap — so only the traced portion is visible. */}
          <defs>
            <mask id="trace-completed-mask">
              <rect width="100%" height="100%" fill="black" />
              {validator.pathLength > 0 && (
                <path
                  d={path.d}
                  stroke="white"
                  strokeWidth="14"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                  strokeDasharray={`${coveredLength} ${validator.pathLength}`}
                  strokeDashoffset="0"
                />
              )}
            </mask>
          </defs>

          {/* Dim groove — faint baseline showing the full letter shape
              so kids can read the letter even where dashes have gaps. */}
          <path
            ref={pathRef}
            className="trace-moment__path-dim"
            d={path.d}
          />
          {/* Pending dashes — perpetually flowing in the trace direction,
              showing the kid "go this way." */}
          <path
            className="trace-moment__path-pending"
            d={path.d}
          />
          {/* Completed dashes — static, brighter, revealed only for
              the portion already traced (via the mask above). */}
          <path
            className="trace-moment__path-completed"
            d={path.d}
            mask="url(#trace-completed-mask)"
          />
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
