// =============================================
// QuestCompleteCelebration.tsx — V1 quest-complete moment
// WiggleWoo's Word Quest
// =============================================
// Fires once when the player completes all 5 CVC vowel quests.
// Replaces the (parked) BlendingPowerUnlock for v1: instead of
// promoting a next tier, it celebrates mastery of the v1 content
// and points the player toward the Discovery Rooms.
//
// Visual language matches the existing challenge-mode unlock card
// so the moment feels familiar (same bg + sparkles + card layout).
// =============================================

import { useState, useEffect } from "react";
import wigglewooHero from "../assets/wiggle_woo_hero_stance.png";
import { playEvent } from "../audio/SoundEffects";
import "../styles/challenge-mode.css";
import "./QuestCompleteCelebration.css";

interface QuestCompleteCelebrationProps {
  onDismiss: () => void;
}

const QuestCompleteCelebration: React.FC<QuestCompleteCelebrationProps> = ({ onDismiss }) => {
  const [visible, setVisible] = useState(true);

  // CVC tier complete VO — fires once on mount alongside the visual celebration.
  useEffect(() => {
    playEvent("v1-quest-complete");
  }, []);

  // Auto-dismiss after a longer beat than the standard unlock cards
  // (4.5s vs 2.5s) so the kid has time to actually read the message.
  // Tap-to-skip still works.
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onDismiss, 400);
    }, 4500);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const handleTap = () => {
    setVisible(false);
    setTimeout(onDismiss, 400);
  };

  return (
    <div
      className={`challenge-unlock-overlay quest-complete-overlay ${visible ? "" : "challenge-unlock-overlay--fading"}`}
      onClick={handleTap}
      role="dialog"
      aria-label="Quest Complete"
    >
      <span className="challenge-unlock__star challenge-unlock__star--1">✨</span>
      <span className="challenge-unlock__star challenge-unlock__star--2">⭐</span>
      <span className="challenge-unlock__star challenge-unlock__star--3">✨</span>
      <span className="challenge-unlock__star challenge-unlock__star--4">⭐</span>
      <span className="challenge-unlock__star challenge-unlock__star--5">✨</span>
      <span className="challenge-unlock__star challenge-unlock__star--6">⭐</span>

      <div className="challenge-unlock__card quest-complete-card">
        <img
          src={wigglewooHero}
          alt=""
          className="quest-complete-card__hero"
          draggable={false}
        />
        <div className="challenge-unlock__icon">🏆</div>
        <h2 className="challenge-unlock__title">Quest Complete!</h2>
        <p className="challenge-unlock__subtitle">
          Feel free to explore the Discovery Rooms for more cool facts and fun surprises!
        </p>
        <p className="quest-complete-card__hint">Tap any island to visit a Discovery Room</p>
      </div>
    </div>
  );
};

export default QuestCompleteCelebration;
