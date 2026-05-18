// =============================================
// SayItOutLoudCue.tsx — "Say it out loud!" prompt
// =============================================
// Fires after the audio model plays on the first word of each lesson
// (indices 0, 4, 8, 12). Visual speech-bubble cue with the target
// word spelled large; auto-dismisses after 2.5s OR on tap-anywhere,
// then the kid can tap letter tiles to build the word.
//
// The "say" modality is the missing leg of the listen/say/trace/build/
// read loop the educator brief calls for. Forces a beat of vocalization
// between hearing the word and rushing into tile assembly.
// =============================================

import React, { useCallback, useEffect, useState } from "react";
import "../styles/say-cue.css";

interface SayItOutLoudCueProps {
  /** The word the kid just heard, e.g. "cat". Rendered uppercase. */
  word: string;
  /** Auto-dismiss timeout in ms. Default 2500. */
  durationMs?: number;
  /** Fires when the cue dismisses (auto or tap). */
  onDismiss: () => void;
}

const SayItOutLoudCue: React.FC<SayItOutLoudCueProps> = ({
  word,
  durationMs = 2500,
  onDismiss,
}) => {
  const [dismissing, setDismissing] = useState(false);

  const dismiss = useCallback(() => {
    if (dismissing) return;
    setDismissing(true);
    // Wait for the fade-out animation before unmounting so the kid
    // sees the exit, not an abrupt cut.
    window.setTimeout(() => onDismiss(), 250);
  }, [dismissing, onDismiss]);

  useEffect(() => {
    const t = window.setTimeout(dismiss, durationMs);
    return () => window.clearTimeout(t);
  }, [durationMs, dismiss]);

  return (
    <div
      className={`say-cue ${dismissing ? "say-cue--dismissing" : ""}`}
      role="dialog"
      aria-label={`Say ${word} out loud`}
      onClick={dismiss}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") dismiss(); }}
      tabIndex={0}
    >
      <div className="say-cue__card">
        <div className="say-cue__bubble" aria-hidden="true">
          <div className="say-cue__bubble-emoji">🗣️</div>
          <div className="say-cue__bubble-tail" />
        </div>
        <div className="say-cue__prompt">Your turn — say it out loud!</div>
        <div className="say-cue__word">{word.toUpperCase()}</div>
      </div>
    </div>
  );
};

export default SayItOutLoudCue;
