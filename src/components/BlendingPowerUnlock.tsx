// =============================================
// BlendingPowerUnlock.tsx — Tier 2 unlock celebration
// WiggleWoo's Word Quest
// =============================================
// Shown once when the player completes all 5 CVC quests and Blending
// Power (CVCC) becomes available. Reuses challenge-mode.css with a
// modifier class so the visual language matches existing unlock cards.
// Auto-dismisses after 2.5s or tap to skip.
// =============================================

import { useState, useEffect } from "react";
import "../styles/challenge-mode.css";

interface BlendingPowerUnlockProps {
  onDismiss: () => void;
}

const BlendingPowerUnlock: React.FC<BlendingPowerUnlockProps> = ({ onDismiss }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onDismiss, 300);
    }, 2500);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const handleTap = () => {
    setVisible(false);
    setTimeout(onDismiss, 300);
  };

  return (
    <div
      className={`challenge-unlock-overlay challenge-unlock-overlay--blending ${visible ? "" : "challenge-unlock-overlay--fading"}`}
      onClick={handleTap}
    >
      <span className="challenge-unlock__star challenge-unlock__star--1">⚙️</span>
      <span className="challenge-unlock__star challenge-unlock__star--2">⭐</span>
      <span className="challenge-unlock__star challenge-unlock__star--3">⚙️</span>
      <span className="challenge-unlock__star challenge-unlock__star--4">✨</span>
      <span className="challenge-unlock__star challenge-unlock__star--5">✨</span>
      <span className="challenge-unlock__star challenge-unlock__star--6">⚙️</span>

      <div className="challenge-unlock__card">
        <div className="challenge-unlock__icon">💪</div>
        <h2 className="challenge-unlock__title">Blending Power Unlocked!</h2>
        <p className="challenge-unlock__subtitle">New words with two ending sounds!</p>
        <p className="challenge-unlock__quest">Pick Blending Power on the Quest Type panel</p>
      </div>
    </div>
  );
};

export default BlendingPowerUnlock;
