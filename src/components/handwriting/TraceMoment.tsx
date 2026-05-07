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

  const dashOffset = validator.pathLength * (1 - validator.coverage);

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
          {/* Dim groove */}
          <path
            ref={pathRef}
            className="trace-moment__path-dim"
            d={path.d}
          />
          {/* Lit fill — animates with coverage progress */}
          <path
            className="trace-moment__path-lit"
            d={path.d}
            strokeDasharray={validator.pathLength || undefined}
            strokeDashoffset={validator.pathLength ? dashOffset : undefined}
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
