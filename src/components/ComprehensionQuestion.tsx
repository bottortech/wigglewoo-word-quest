// =============================================
// ComprehensionQuestion.tsx — post-fact comprehension check
// WiggleWoo's Word Quest
// =============================================
// A small, playful multiple-choice card shown after a Discovery Room
// fact's narration finishes. Never blocks progress — the fact panel can
// be closed at any time regardless of whether this was answered.
// =============================================

import { useState, useCallback, useMemo } from "react";
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

  // Every authored question has correctIndex: 0 (the data always writes the
  // right answer first) — shuffle once per question so it isn't the same
  // button every time, and re-derive correctIndex against the new order.
  const choices = useMemo(() => {
    const withFlag = question.choices.map((text, i) => ({ text, isCorrect: i === question.correctIndex }));
    for (let i = withFlag.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [withFlag[i], withFlag[j]] = [withFlag[j], withFlag[i]];
    }
    return withFlag;
  }, [question]);

  const handleChoice = useCallback((idx: number) => {
    if (solved) return;
    setSelected(idx);
    if (choices[idx].isCorrect) {
      setSolved(true);
      playSuccessPhrase();
      onCorrect?.();
    } else {
      playRetryPhrase();
      // Gentle "try again" — clear the miss after a beat so the wrong
      // choice flashes red, then the child can pick again freely.
      setTimeout(() => setSelected((s) => (s === idx ? null : s)), 700);
    }
  }, [solved, choices, onCorrect]);

  return (
    <div className="comprehension-question">
      <p className="comprehension-question__prompt">
        {solved ? "That's right! 🎉" : question.prompt}
      </p>
      <div className="comprehension-question__choices">
        {choices.map(({ text: choice, isCorrect }, idx) => {
          const isSelected = selected === idx;
          const state = solved && isCorrect ? "correct" : isSelected && !isCorrect ? "wrong" : "";
          return (
            <button
              key={idx}
              className={["comprehension-question__choice", state && `comprehension-question__choice--${state}`]
                .filter(Boolean).join(" ")}
              style={{ animationDelay: `${idx * 0.3}s` }}
              onClick={() => handleChoice(idx)}
              disabled={solved}
            >
              <span className="comprehension-question__choice-text">{choice}</span>
              {state === "correct" && <span className="comprehension-question__choice-icon" aria-hidden="true">✓</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ComprehensionQuestion;
