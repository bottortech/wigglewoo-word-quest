// =============================================
// ChallengeModeUnlock.tsx — Unlock celebration overlay
// WiggleWoo's Word Quest
// =============================================
// Shown once when a player completes all image-mode words
// for a quest and unlocks Challenge Mode (decode-only).
// Auto-dismisses after 2s or tap to skip.
// =============================================

import { useState, useEffect } from "react";
import "../styles/challenge-mode.css";

interface ChallengeModeUnlockProps {
  questTitle: string;
  onDismiss: () => void;
}

const ChallengeModeUnlock: React.FC<ChallengeModeUnlockProps> = ({ questTitle, onDismiss }) => {
  const [visible, setVisible] = useState(true);

  // Auto-dismiss after 2s
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onDismiss, 300); // wait for fade-out
    }, 2000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const handleTap = () => {
    setVisible(false);
    setTimeout(onDismiss, 300);
  };

  return (
    <div
      className={`challenge-unlock-overlay ${visible ? "" : "challenge-unlock-overlay--fading"}`}
      onClick={handleTap}
    >
      {/* Star particles */}
      <span className="challenge-unlock__star challenge-unlock__star--1">⭐</span>
      <span className="challenge-unlock__star challenge-unlock__star--2">⭐</span>
      <span className="challenge-unlock__star challenge-unlock__star--3">⭐</span>
      <span className="challenge-unlock__star challenge-unlock__star--4">✨</span>
      <span className="challenge-unlock__star challenge-unlock__star--5">✨</span>
      <span className="challenge-unlock__star challenge-unlock__star--6">⭐</span>

      <div className="challenge-unlock__card">
        <div className="challenge-unlock__icon">🏆</div>
        <h2 className="challenge-unlock__title">Challenge Mode Unlocked!</h2>
        <p className="challenge-unlock__subtitle">No pictures — you're leveling up!</p>
        <p className="challenge-unlock__quest">{questTitle}</p>
      </div>
    </div>
  );
};

export default ChallengeModeUnlock;
