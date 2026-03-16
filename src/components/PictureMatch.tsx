// =============================================
// PictureMatch.tsx — Picture-based concept match
// WiggleWoo's Word Quest
// =============================================
// Shows a prompt like "Which thing is hot?" with
// 3 image choices. Reinforces phonics + discovery
// room concepts in a visual, low-reading way.
// =============================================

import { useState, useMemo, useCallback } from "react";
import "../styles/mini-challenge.css";

export interface PictureMatchOption {
  word: string;
  imageKey: string;
}

export interface PictureMatchData {
  prompt: string;             // "Which thing is hot?"
  correct: PictureMatchOption;
  distractors: PictureMatchOption[];
}

// ---- Built-in picture match pools by vowel ----
// Each entry: prompt + correct word + 2 distractors
const PICTURE_MATCH_POOLS: Record<string, PictureMatchData[]> = {
  shortA: [
    { prompt: "Which one is a cat?", correct: { word: "cat", imageKey: "cat" }, distractors: [{ word: "hat", imageKey: "hat" }, { word: "bat", imageKey: "bat" }] },
    { prompt: "Which one goes on your head?", correct: { word: "hat", imageKey: "hat" }, distractors: [{ word: "map", imageKey: "map" }, { word: "bag", imageKey: "bag" }] },
    { prompt: "Which one can fly?", correct: { word: "bat", imageKey: "bat" }, distractors: [{ word: "pan", imageKey: "pan" }, { word: "can", imageKey: "can" }] },
    { prompt: "Which one shows directions?", correct: { word: "map", imageKey: "map" }, distractors: [{ word: "cap", imageKey: "cap" }, { word: "fan", imageKey: "fan" }] },
  ],
  shortE: [
    { prompt: "Which one is for sleeping?", correct: { word: "bed", imageKey: "bed" }, distractors: [{ word: "web", imageKey: "web" }, { word: "jet", imageKey: "jet" }] },
    { prompt: "Which one catches bugs?", correct: { word: "web", imageKey: "web" }, distractors: [{ word: "net", imageKey: "net" }, { word: "pet", imageKey: "pet" }] },
    { prompt: "Which one flies fast?", correct: { word: "jet", imageKey: "jet" }, distractors: [{ word: "ten", imageKey: "ten" }, { word: "vet", imageKey: "vet" }] },
    { prompt: "Which one catches fish?", correct: { word: "net", imageKey: "net" }, distractors: [{ word: "red", imageKey: "red" }, { word: "leg", imageKey: "leg" }] },
  ],
  shortI: [
    { prompt: "Which one digs?", correct: { word: "dig", imageKey: "dig" }, distractors: [{ word: "wig", imageKey: "wig" }, { word: "bib", imageKey: "bib" }] },
    { prompt: "Which one goes on a baby?", correct: { word: "bib", imageKey: "bib" }, distractors: [{ word: "kit", imageKey: "kit" }, { word: "lid", imageKey: "lid" }] },
    { prompt: "Which one keeps your head warm?", correct: { word: "wig", imageKey: "wig" }, distractors: [{ word: "pin", imageKey: "pin" }, { word: "rip", imageKey: "rip" }] },
    { prompt: "Which one covers a pot?", correct: { word: "lid", imageKey: "lid" }, distractors: [{ word: "hit", imageKey: "hit" }, { word: "dip", imageKey: "dip" }] },
  ],
  shortO: [
    { prompt: "Which one is a pet?", correct: { word: "dog", imageKey: "dog" }, distractors: [{ word: "log", imageKey: "log" }, { word: "fox", imageKey: "fox" }] },
    { prompt: "Which one lives in the woods?", correct: { word: "fox", imageKey: "fox" }, distractors: [{ word: "dot", imageKey: "dot" }, { word: "pot", imageKey: "pot" }] },
    { prompt: "Which one do you cook in?", correct: { word: "pot", imageKey: "pot" }, distractors: [{ word: "cot", imageKey: "cot" }, { word: "mop", imageKey: "mop" }] },
    { prompt: "Which one cleans the floor?", correct: { word: "mop", imageKey: "mop" }, distractors: [{ word: "jog", imageKey: "jog" }, { word: "hop", imageKey: "hop" }] },
  ],
  shortU: [
    { prompt: "Which one do you drink from?", correct: { word: "cup", imageKey: "cup" }, distractors: [{ word: "bus", imageKey: "bus" }, { word: "rug", imageKey: "rug" }] },
    { prompt: "Which one takes you to school?", correct: { word: "bus", imageKey: "bus" }, distractors: [{ word: "jug", imageKey: "jug" }, { word: "pup", imageKey: "pup" }] },
    { prompt: "Which one is a baby dog?", correct: { word: "pup", imageKey: "pup" }, distractors: [{ word: "mud", imageKey: "mud" }, { word: "run", imageKey: "run" }] },
    { prompt: "Which one is on the floor?", correct: { word: "rug", imageKey: "rug" }, distractors: [{ word: "hug", imageKey: "hug" }, { word: "gum", imageKey: "gum" }] },
  ],
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

interface PictureMatchProps {
  vowelGroup: string;   // "shortA", "shortO", etc.
  onCorrect: () => void;
  onClose: () => void;
}

const PictureMatch: React.FC<PictureMatchProps> = ({ vowelGroup, onCorrect, onClose }) => {
  const challenge = useMemo(() => {
    const pool = PICTURE_MATCH_POOLS[vowelGroup] ?? PICTURE_MATCH_POOLS.shortA;
    const picked = pool[Math.floor(Math.random() * pool.length)];
    const options = shuffle([picked.correct, ...picked.distractors]);
    return { ...picked, options };
  }, [vowelGroup]);

  const [selected, setSelected] = useState<string | null>(null);
  const [result, setResult] = useState<"correct" | "wrong" | null>(null);

  const handlePick = useCallback((word: string) => {
    if (selected) return;
    setSelected(word);
    const isCorrect = word === challenge.correct.word;
    setResult(isCorrect ? "correct" : "wrong");

    if (isCorrect) {
      setTimeout(() => onCorrect(), 800);
    } else {
      setTimeout(() => { setSelected(null); setResult(null); }, 600);
    }
  }, [selected, challenge, onCorrect]);

  return (
    <div className="mini-challenge-backdrop">
      <div className="mini-challenge">
        <button className="mini-challenge__x" onClick={onClose}>✕</button>
        <p className="mini-challenge__prompt">{challenge.prompt}</p>
        <div className="mini-challenge__options" style={{ gap: "14px" }}>
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
                style={{ padding: "8px", flexDirection: "column" }}
              >
                <img
                  src={`/assets/words/${opt.imageKey}.png`}
                  alt=""
                  draggable={false}
                  style={{ width: "60px", height: "60px", objectFit: "contain", marginBottom: "4px" }}
                />
                <span style={{ fontSize: "14px" }}>{opt.word.toUpperCase()}</span>
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

export default PictureMatch;
