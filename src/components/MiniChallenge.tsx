// =============================================
// MiniChallenge.tsx — Quick CVC word pick game
// WiggleWoo's Word Quest
// =============================================
// Shows an image and 3 word choices from the quest
// the player just completed. Only 1 is correct.
// Distractors are phonically similar (same vowel).

import { useState, useMemo, useCallback } from "react";
import type { CvcWord } from "../game/types";
import "../styles/mini-challenge.css";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

interface MiniChallengeProps {
  /** Words from the quest the player completed */
  questWords: CvcWord[];
  onCorrect: () => void;
  onClose: () => void;
}

function pickChallenge(questWords: CvcWord[]) {
  if (questWords.length < 3) {
    // Not enough words — shouldn't happen but fallback
    const correct = questWords[0];
    return { correct, options: [correct] };
  }
  const shuffled = shuffle(questWords);
  const correct = shuffled[0];
  // Pick 2 distractors — prefer same vowel (phonically similar)
  const vowel = correct.letters[1]; // middle letter = vowel in CVC
  const sameVowel = shuffled.filter(w => w.word !== correct.word && w.letters[1] === vowel);
  const others = shuffled.filter(w => w.word !== correct.word && w.letters[1] !== vowel);

  const distractors: CvcWord[] = [];
  // Fill with same-vowel words first
  for (const w of sameVowel) {
    if (distractors.length >= 2) break;
    distractors.push(w);
  }
  // Fill remaining with other words
  for (const w of others) {
    if (distractors.length >= 2) break;
    distractors.push(w);
  }

  const options = shuffle([correct, ...distractors]);
  return { correct, options };
}

const MiniChallenge: React.FC<MiniChallengeProps> = ({ questWords, onCorrect, onClose }) => {
  const challenge = useMemo(() => pickChallenge(questWords), [questWords]);
  const [selected, setSelected] = useState<string | null>(null);
  const [result, setResult] = useState<"correct" | "wrong" | null>(null);

  const handlePick = useCallback((word: string) => {
    if (selected) return;
    setSelected(word);
    const isCorrect = word === challenge.correct.word;
    setResult(isCorrect ? "correct" : "wrong");

    if (isCorrect) {
      setTimeout(() => {
        onCorrect();
      }, 800);
    } else {
      // Reset after shake so they can try again
      setTimeout(() => {
        setSelected(null);
        setResult(null);
      }, 600);
    }
  }, [selected, challenge, onCorrect]);

  return (
    <div className="mini-challenge-backdrop">
      <div className="mini-challenge">
        <button className="mini-challenge__x" onClick={onClose}>✕</button>
        <p className="mini-challenge__prompt">What word is this?</p>
        <div className="mini-challenge__image-wrap">
          <img
            className="mini-challenge__image"
            src={`/assets/words/${challenge.correct.imageKey ?? challenge.correct.word}.png`}
            alt="Mystery word"
            draggable={false}
          />
        </div>
        <div className="mini-challenge__options">
          {challenge.options.map((opt) => {
            let cls = "mini-challenge__option";
            if (selected === opt.word && result === "correct") cls += " mini-challenge__option--correct";
            if (selected === opt.word && result === "wrong") cls += " mini-challenge__option--wrong";
            return (
              <button
                key={opt.word}
                className={cls}
                onClick={() => handlePick(opt.word)}
                disabled={result === "correct"}
              >
                {opt.word.toUpperCase()}
              </button>
            );
          })}
        </div>
        {result && (
          <p className={`mini-challenge__feedback mini-challenge__feedback--${result}`}>
            {result === "correct" ? "Great job!" : "Almost! Try again!"}
          </p>
        )}
      </div>
    </div>
  );
};

export default MiniChallenge;
