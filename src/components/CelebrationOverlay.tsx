// =============================================
// CelebrationOverlay.tsx — Upgraded celebration
// WiggleWoo's Word Quest
// =============================================
// Full-screen overlay with golden background,
// standing→jumping WiggleWoo animation,
// star progress panel, and Next Word button.
// =============================================

import React, { useEffect, useState, useMemo } from "react";
import "../styles/celebration.css";
import jumpingImg from "../assets/jumping pose.png";
import celebBg from "../assets/celebration_screen.png";
import gear1 from "../assets/gear1.png";

export type CelebrationType = "level-complete" | "quest-complete";

interface CelebrationOverlayProps {
  type: CelebrationType;
  onComplete: () => void;
  wordsComplete?: number;  // how many words done so far
  totalWords?: number;     // total words in quest (16)
}

const BANNER_TEXT: Record<CelebrationType, string> = {
  "level-complete": "WORD POWER ACTIVATED!",
  "quest-complete": "QUEST COMPLETE!",
};

const SUB_TEXT: Record<CelebrationType, string> = {
  "level-complete": "You spelled the word!",
  "quest-complete": "You finished all the words!",
};

// Confetti colors matching brand
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

export const CelebrationOverlay: React.FC<CelebrationOverlayProps> = ({
  type,
  onComplete,
  wordsComplete = 1,
  totalWords = 16,
}) => {
  const [visible, setVisible] = useState(true);
  const [showProgress, setShowProgress] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const [confettiActive, setConfettiActive] = useState(true);

  const confetti = useMemo(
    () => makeConfetti(type === "quest-complete" ? 50 : 40),
    [type]
  );

  useEffect(() => {
    // Animation timeline
    // 0ms: Jumping pose appears with bounce animation
    // 400ms: Star progress panel slides in
    // 700ms: Next Word button fades in
    // 1200ms: Confetti fades out

    const t1 = setTimeout(() => setShowProgress(true), 400);
    const t2 = setTimeout(() => setShowButton(true), 700);
    const t3 = setTimeout(() => setConfettiActive(false), 1200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  const handleNext = () => {
    setVisible(false);
    onComplete();
  };

  if (!visible) return null;

  return (
    <div className="celeb" aria-hidden="true">
      {/* Golden background image */}
      <img
        className="celeb__bg"
        src={celebBg}
        alt=""
        draggable={false}
      />

      {/* Spinning gears — low opacity background decoration */}
      <img className="celeb__gear celeb__gear--1" src={gear1} alt="" draggable={false} />
      <img className="celeb__gear celeb__gear--2" src={gear1} alt="" draggable={false} />
      <img className="celeb__gear celeb__gear--3" src={gear1} alt="" draggable={false} />
      <img className="celeb__gear celeb__gear--4" src={gear1} alt="" draggable={false} />

      {/* Confetti burst — plays once then fades */}
      <div className={`confetti-container ${!confettiActive ? 'confetti-container--fading' : ''}`}>
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

      {/* Light bulb glows */}
      <div className="celeb__bulbs">
        <div className="celeb__bulb celeb__bulb--1" />
        <div className="celeb__bulb celeb__bulb--2" />
        <div className="celeb__bulb celeb__bulb--3" />
        <div className="celeb__bulb celeb__bulb--4" />
        <div className="celeb__bulb celeb__bulb--5" />
      </div>

      {/* TOP: Headline */}
      <div className={`celeb__headline ${type}`}>
        {BANNER_TEXT[type]}
      </div>
      <div className="celeb__sub">{SUB_TEXT[type]}</div>

      {/* CENTER: WiggleWoo jumping with bounce animation */}
      <div className="celeb__character-zone">
        {/* Shadow under feet — pulses with bounce */}
        <div className="celeb__shadow celeb__shadow--bouncing" />

        {/* Jumping pose with bounce animation */}
        <img
          className="celeb__ww celeb__ww--bounce"
          src={jumpingImg}
          alt="WiggleWoo celebrating"
          draggable={false}
        />
      </div>

      {/* BOTTOM: Star progress + Next button */}
      <div className="celeb__bottom">
        {/* Star progress panel */}
        <div className={`celeb__progress ${showProgress ? 'celeb__progress--visible' : ''}`}>
          <span className={`celeb__star-icon ${showProgress ? 'celeb__star-icon--pop' : ''}`}>⭐</span>
          <span className="celeb__progress-text">
            +1 Star &nbsp;•&nbsp; Progress: {wordsComplete}/{totalWords} Words Complete
          </span>
        </div>

        {/* Next Word button */}
        <button
          className={`celeb__next-btn ${showButton ? 'celeb__next-btn--visible' : ''}`}
          onClick={handleNext}
          style={{ pointerEvents: showButton ? 'auto' : 'none' }}
        >
          {type === "quest-complete" ? "Continue ➜" : "Continue the Quest ➜"}
        </button>
      </div>
    </div>
  );
};

export default CelebrationOverlay;
