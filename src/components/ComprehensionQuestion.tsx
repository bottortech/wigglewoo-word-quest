// =============================================
// ComprehensionQuestion.tsx — post-fact comprehension check
// WiggleWoo's Word Quest
// =============================================
// A small, playful multiple-choice card shown after a Discovery Room
// fact's narration finishes. Never blocks progress — the fact panel can
// be closed at any time regardless of whether this was answered.
// =============================================

import { useState, useCallback } from "react";
import type { ComprehensionQuestion as ComprehensionQuestionData } from "../game/exploreData";
import { playSuccessPhrase, playRetryPhrase } from "../audio/SoundEffects";

interface ComprehensionQuestionProps {
  question: ComprehensionQuestionData;
  /** Fires once, the moment the correct answer is picked. */
  onCorrect?: () => void;
}

const ComprehensionQuestion: React.FC<ComprehensionQuestionProps> = ({ question, onCorrect }) => {
  const [selected, setSelected] = useState<number | null>(null);
  const [solved, setSolved] = useState(false);

  const handleChoice = useCallback((idx: number) => {
    if (solved) return;
    setSelected(idx);
    if (idx === question.correctIndex) {
      setSolved(true);
      playSuccessPhrase();
      onCorrect?.();
    } else {
      playRetryPhrase();
      // Gentle "try again" — clear the miss after a beat so the wrong
      // choice flashes red, then the child can pick again freely.
      setTimeout(() => setSelected((s) => (s === idx ? null : s)), 700);
    }
  }, [solved, question.correctIndex, onCorrect]);

  return (
    <div className="comprehension-question">
      <p className="comprehension-question__prompt">
        {solved ? "That's right! 🎉" : question.prompt}
      </p>
      <div className="comprehension-question__choices">
        {question.choices.map((choice, idx) => {
          const isCorrect = idx === question.correctIndex;
          const isSelected = selected === idx;
          const state = solved && isCorrect ? "correct" : isSelected && !isCorrect ? "wrong" : "";
          return (
            <button
              key={idx}
              className={["comprehension-question__choice", state && `comprehension-question__choice--${state}`]
                .filter(Boolean).join(" ")}
              onClick={() => handleChoice(idx)}
              disabled={solved}
            >
              {choice}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ComprehensionQuestion;
