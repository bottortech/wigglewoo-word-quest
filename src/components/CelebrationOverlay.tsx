// =============================================
// CelebrationOverlay.tsx — Word completion celebration
// WiggleWoo's Word Quest
// =============================================
// Auto-timed celebration: heading → word → WiggleWoo → progress
// Auto-advances after 2.8s. Tap anywhere to skip.
// =============================================

import React, { useEffect, useState, useMemo } from "react";
import "../styles/celebration.css";
import jumpingImg from "../assets/jumping pose.png";
import celebBg from "../assets/celebration_screen.png";
import gear1 from "../assets/gear1.png";

export type CelebrationType = "level-complete" | "quest-complete";

type WordRating = "perfect" | "clean" | "assisted";

interface CelebrationOverlayProps {
  type: CelebrationType;
  onComplete: () => void;
  wordsComplete?: number;
  totalWords?: number;
  word?: string;
  rating?: WordRating;
}

const BANNER_TEXT: Record<CelebrationType, string> = {
  "level-complete": "WORD POWER ACTIVATED!",
  "quest-complete": "QUEST COMPLETE!",
};

const SUB_TEXT: Record<CelebrationType, string> = {
  "level-complete": "You spelled the word!",
  "quest-complete": "You finished all the words!",
};

const CONFETTI_COLORS = ["teal", "orange", "gold", "pink", "green", "purple", "red"];
const CONFETTI_SHAPES = ["circle", "square", "rect"];

interface ConfettiPiece {
  id: number;
  left: string;
  color: string;
  shape: string;
  delay: string;
  fallDur: string;
  spin: string;
}

function makeConfetti(count: number): ConfettiPiece[] {
  const pieces: ConfettiPiece[] = [];
  for (let i = 0; i < count; i++) {
    const seed = i * 137.508;
    pieces.push({
      id: i,
      left: `${(seed % 100).toFixed(1)}%`,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      shape: CONFETTI_SHAPES[i % CONFETTI_SHAPES.length],
      delay: `${(i * 0.03).toFixed(2)}s`,
      fallDur: `${0.8 + (i % 5) * 0.1}s`,
      spin: `${180 + (i % 4) * 120}deg`,
    });
  }
  return pieces;
}

const AUTO_ADVANCE_MS = 2800;

export const CelebrationOverlay: React.FC<CelebrationOverlayProps> = ({
  type,
  onComplete,
  wordsComplete = 1,
  totalWords = 16,
  word,
  rating = "perfect",
}) => {
  const isAssisted = rating === "assisted";
  const [showProgress, setShowProgress] = useState(false);
  const [confettiActive, setConfettiActive] = useState(!isAssisted); // no confetti for assisted
  const [fading, setFading] = useState(false);

  const confetti = useMemo(
    () => makeConfetti(type === "quest-complete" ? 50 : 40),
    [type]
  );

  useEffect(() => {
    // Timeline
    const t1 = setTimeout(() => setShowProgress(true), 500);
    const t2 = setTimeout(() => setConfettiActive(false), 1200);
    const t3 = setTimeout(() => {
      setFading(true);
      setTimeout(onComplete, 300);
    }, AUTO_ADVANCE_MS);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onComplete]);

  const handleTap = () => {
    if (fading) return;
    setFading(true);
    setTimeout(onComplete, 200);
  };

  return (
    <div
      className={`celeb ${fading ? "celeb--fading" : ""}`}
      onClick={handleTap}
      aria-hidden="true"
    >
      {/* Golden background */}
      <img className="celeb__bg" src={celebBg} alt="" draggable={false} />

      {/* Spinning gears */}
      <img className="celeb__gear celeb__gear--1" src={gear1} alt="" draggable={false} />
      <img className="celeb__gear celeb__gear--2" src={gear1} alt="" draggable={false} />
      <img className="celeb__gear celeb__gear--3" src={gear1} alt="" draggable={false} />
      <img className="celeb__gear celeb__gear--4" src={gear1} alt="" draggable={false} />

      {/* Confetti */}
      <div className={`confetti-container ${!confettiActive ? "confetti-container--fading" : ""}`}>
        {confetti.map((c) => (
          <span
            key={c.id}
            className={`confetti confetti--${c.color} confetti--${c.shape}`}
            style={{
              left: c.left,
              "--delay": c.delay,
              "--fall-dur": c.fallDur,
              "--spin": c.spin,
            } as React.CSSProperties}
          />
        ))}
      </div>

      {/* Heading */}
      <div className={`celeb__headline ${type}`}>
        {isAssisted ? "NICE TRY!" : BANNER_TEXT[type]}
      </div>
      <div className="celeb__sub">{isAssisted ? "Keep practicing!" : SUB_TEXT[type]}</div>

      {/* THE WORD — main focus */}
      {word && (
        <div className="celeb__word">{word.toUpperCase()}</div>
      )}

      {/* WiggleWoo — smaller, below the word */}
      <div className="celeb__character-zone celeb__character-zone--compact">
        <div className="celeb__shadow celeb__shadow--bouncing" />
        <img
          className="celeb__ww celeb__ww--bounce"
          src={jumpingImg}
          alt="WiggleWoo celebrating"
          draggable={false}
        />
      </div>

      {/* Progress — bottom of screen */}
      <div className="celeb__bottom">
        <div className={`celeb__progress ${showProgress ? "celeb__progress--visible" : ""}`}>
          <span className={`celeb__star-icon ${showProgress ? "celeb__star-icon--pop" : ""}`}>⭐</span>
          <span className="celeb__progress-text">
            +1 Star &nbsp;•&nbsp; {wordsComplete}/{totalWords} Words
          </span>
        </div>
      </div>
    </div>
  );
};

export default CelebrationOverlay;
