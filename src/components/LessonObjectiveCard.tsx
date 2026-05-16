// =============================================
// LessonObjectiveCard.tsx — Lesson kickoff intro
// WiggleWoo's Word Quest
// =============================================
// Renders at the start of each lesson (words 1, 5, 9, 13 of a quest)
// before the kid hits the first word screen. Sets expectations: which
// lesson of 4, what they're learning, and a sample word with audio.
// Designed to look intentional and "school-y" without feeling stiff —
// big friendly type, soft card, tap-anywhere-to-hear-it.
//
// Phase A scope: lesson 0-3 with goal copy + example word + listen
// button. Phase B adds a "say it out loud" cue and parent-prompt
// follow-up. Phase C will surface mastery badges earned so far.
// =============================================

import React, { useCallback } from "react";
import type { CvcWord } from "../game/types";
import { LESSONS_PER_QUEST } from "../game/types";
import { playWordSound } from "../audio/SoundEffects";
import WordImage from "./WordImage";
import "../styles/lesson-objective.css";

interface LessonObjectiveCardProps {
  /** 0-based lesson index (0..3). */
  lessonIndex: number;
  /** Quest title — e.g. "Sound Builders: Short A". Trimmed to its tail. */
  questTitle: string;
  /** First word of this lesson — used as the audio + visual example. */
  exampleWord: CvcWord;
  /** Fires when the kid taps "Let's Go!". */
  onContinue: () => void;
}

const LESSON_GOAL: Record<number, { title: string; sub: string }> = {
  0: { title: "Listen and Build", sub: "Hear the sound, then build the word!" },
  1: { title: "Keep Building",    sub: "More words with the same sound!" },
  2: { title: "Build and Master", sub: "Show how well you know it!" },
  3: { title: "Show What You Know", sub: "The last lesson — you've got this!" },
};

/** "Sound Builders: Short A" → "Short A" so the card focus is the actual sound. */
function getFocusLabel(questTitle: string): string {
  const colon = questTitle.lastIndexOf(":");
  return colon >= 0 ? questTitle.slice(colon + 1).trim() : questTitle;
}

const LessonObjectiveCard: React.FC<LessonObjectiveCardProps> = ({
  lessonIndex,
  questTitle,
  exampleWord,
  onContinue,
}) => {
  const goal = LESSON_GOAL[lessonIndex] ?? LESSON_GOAL[0];
  const focusLabel = getFocusLabel(questTitle);

  const handleListen = useCallback(() => {
    playWordSound(exampleWord.word);
  }, [exampleWord.word]);

  const handleContinue = useCallback(() => {
    onContinue();
  }, [onContinue]);

  return (
    <div className="lesson-objective" role="dialog" aria-label="Lesson objective">
      <div className="lesson-objective__card">
        <div className="lesson-objective__counter">
          Lesson {lessonIndex + 1} of {LESSONS_PER_QUEST}
        </div>
        <h2 className="lesson-objective__focus">{focusLabel}</h2>
        <p className="lesson-objective__goal">{goal.title}</p>
        <p className="lesson-objective__sub">{goal.sub}</p>

        <button
          type="button"
          className="lesson-objective__example"
          onClick={handleListen}
          aria-label={`Tap to hear ${exampleWord.word}`}
        >
          <div className="lesson-objective__example-image">
            <WordImage imageKey={exampleWord.imageKey} size={140} />
          </div>
          <div className="lesson-objective__example-word">
            {exampleWord.word.toUpperCase()}
          </div>
          <div className="lesson-objective__example-listen" aria-hidden="true">
            🔊 Tap to listen
          </div>
        </button>

        <button
          type="button"
          className="lesson-objective__continue"
          onClick={handleContinue}
          autoFocus
        >
          Let's Go!
        </button>
      </div>
    </div>
  );
};

export default LessonObjectiveCard;
