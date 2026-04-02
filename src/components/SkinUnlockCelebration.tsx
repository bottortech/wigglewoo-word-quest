// =============================================
// SkinUnlockCelebration.tsx — Full-screen skin
// unlock reveal with confetti + bounce animation
// WiggleWoo's Word Quest
// =============================================

import React, { useState, useEffect } from "react";
import { SKIN_REGISTRY, setActiveSkin } from "../game/skins";
import defaultHero from "../assets/wiggle_woo_hero_stance.png";
import "../styles/skin-unlock.css";

interface SkinUnlockCelebrationProps {
  skinId: string;
  onTryItOn: () => void;
  onSaveLater: () => void;
}

const CONFETTI_COLORS = ["#4DB6AC", "#FF9800", "#FFD700", "#F48FB1", "#81C784", "#CE93D8", "#EF5350"];
const CONFETTI_SHAPES = ["circle", "square", "rect"];

const SkinUnlockCelebration: React.FC<SkinUnlockCelebrationProps> = ({
  skinId,
  onTryItOn,
  onSaveLater,
}) => {
  const [showButtons, setShowButtons] = useState(false);
  const [showConfetti, setShowConfetti] = useState(true);

  const skin = SKIN_REGISTRY.find((s) => s.skinId === skinId);
  const skinImg = skin?.heroImgPath ?? defaultHero;
  const skinLabel = skin?.label ?? "New Outfit";

  useEffect(() => {
    const btnTimer = setTimeout(() => setShowButtons(true), 1200);
    const confettiTimer = setTimeout(() => setShowConfetti(false), 3000);
    return () => {
      clearTimeout(btnTimer);
      clearTimeout(confettiTimer);
    };
  }, []);

  const handleTryItOn = () => {
    setActiveSkin(skinId);
    onTryItOn();
  };

  // Generate confetti pieces
  const confetti = Array.from({ length: 40 }, (_, i) => {
    const color = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
    const shape = CONFETTI_SHAPES[i % CONFETTI_SHAPES.length];
    const left = Math.random() * 100;
    const delay = Math.random() * 0.6;
    const duration = 0.8 + Math.random() * 0.5;
    const spin = 180 + Math.random() * 540;
    return (
      <div
        key={i}
        className={`skin-unlock__confetti skin-unlock__confetti--${shape}`}
        style={{
          left: `${left}%`,
          background: color,
          "--delay": `${delay}s`,
          "--fall-dur": `${duration}s`,
          "--spin": `${spin}deg`,
        } as React.CSSProperties}
      />
    );
  });

  return (
    <div className="skin-unlock">
      {/* Confetti */}
      <div className={`skin-unlock__confetti-wrap ${showConfetti ? "" : "skin-unlock__confetti-wrap--fading"}`}>
        {confetti}
      </div>

      {/* Centered content stack */}
      <div className="skin-unlock__stack">
        {/* Character */}
        <div className="skin-unlock__character">
          <img
            src={skinImg}
            alt={skinLabel}
            className="skin-unlock__character-img"
            draggable={false}
          />
        </div>

        {/* Title */}
        <h1 className="skin-unlock__title">New Outfit Unlocked!</h1>

        {/* Skin name */}
        <p className="skin-unlock__skin-name">{skinLabel}</p>

        {/* Buttons */}
        {showButtons && (
          <div className="skin-unlock__buttons">
            <button className="skin-unlock__btn skin-unlock__btn--primary" onClick={handleTryItOn}>
              Try It On!
            </button>
            <button className="skin-unlock__btn skin-unlock__btn--secondary" onClick={onSaveLater}>
              Save for Later
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SkinUnlockCelebration;
