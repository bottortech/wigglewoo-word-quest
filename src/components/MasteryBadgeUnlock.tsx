// =============================================
// MasteryBadgeUnlock.tsx — Lesson mastery celebration
// =============================================
// Fires after the kid completes the mastery-check word (word 4, 8,
// 12, or 16 of a quest). Shows a silver-star skill badge with the
// lesson focus and a "You learned the {sound} sound!" line, then a
// "Keep Going!" button to continue into the next lesson (or trophy
// room if it was the last lesson).
//
// Deliberately distinct visual language from the per-word celebration
// — silver star + radial burst — so kids feel a clear "lesson done"
// milestone, separate from the per-word "yay!" reaction.
// =============================================

import React, { useEffect } from "react";
import { LESSONS_PER_QUEST } from "../game/types";
import { playEvent } from "../audio/SoundEffects";
import "../styles/mastery-badge.css";

interface MasteryBadgeUnlockProps {
  /** 0-based index of the lesson just completed (0..3). */
  lessonIndex: number;
  /** Quest focus label — e.g. "Short A". Already trimmed for display. */
  focusLabel: string;
  /** Fires when the kid taps "Keep Going!". */
  onContinue: () => void;
}

const LESSON_BADGE_TITLE: Record<number, string> = {
  0: "Listener Badge",
  1: "Builder Badge",
  2: "Master Badge",
  3: "Champion Badge",
};

const MasteryBadgeUnlock: React.FC<MasteryBadgeUnlockProps> = ({
  lessonIndex,
  focusLabel,
  onContinue,
}) => {
  // Soft fanfare on mount — reuse the existing "correct" cue so the
  // sound palette stays consistent across screens.
  useEffect(() => {
    playEvent("mini-correct");
  }, []);

  const badgeTitle = LESSON_BADGE_TITLE[lessonIndex] ?? "Skill Badge";
  const isFinalLesson = lessonIndex === LESSONS_PER_QUEST - 1;
  const continueLabel = isFinalLesson ? "Trophy Room!" : "Keep Going!";

  return (
    <div className="mastery-badge" role="dialog" aria-label="Skill badge unlocked">
      <div className="mastery-badge__backdrop" />
      <div className="mastery-badge__rays" aria-hidden="true" />

      <div className="mastery-badge__card">
        <div className="mastery-badge__eyebrow">Lesson {lessonIndex + 1} Mastered</div>

        <div className="mastery-badge__medallion" aria-hidden="true">
          <div className="mastery-badge__medallion-ring" />
          <div className="mastery-badge__medallion-disk">
            <span className="mastery-badge__medallion-star">★</span>
          </div>
        </div>

        <div className="mastery-badge__title">{badgeTitle}</div>
        <div className="mastery-badge__focus">
          You learned the <strong>{focusLabel}</strong> sound!
        </div>

        <button
          type="button"
          className="mastery-badge__continue"
          onClick={onContinue}
          autoFocus
        >
          {continueLabel}
        </button>
      </div>
    </div>
  );
};

export default MasteryBadgeUnlock;
