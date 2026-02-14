// =============================================
// PlayNowScreen.tsx — Play Now / Start screen
// WiggleWoo's Word Quest
// =============================================
// Displays the animated logo with Play Now button.
// Press Enter/Space or click to start.
// Uses LabBackground for shared decorative environment.
// =============================================

import React, { useEffect, useCallback } from "react";
import badgeLogo from "../assets/wigglewoos_word_quest_badge-logo.png";
import LabBackground from "../components/LabBackground";
import "../styles/home.css";

interface PlayNowScreenProps {
  onPlay: () => void;
}

const PlayNowScreen: React.FC<PlayNowScreenProps> = ({ onPlay }) => {
  // Handle keyboard shortcuts (Enter/Space to start)
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onPlay();
      }
    },
    [onPlay]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <LabBackground className="home-screen">
      {/* Animated logo */}
      <div className="home-logo-container">
        <img
          src={badgeLogo}
          alt="WiggleWoo's Word Quest"
          className="home-logo"
          draggable={false}
        />
        <div className="home-logo-glow" />
      </div>

      {/* Play Now button */}
      <button className="home-play-btn" onClick={onPlay}>
        Play Now
      </button>

      {/* Keyboard hint */}
      <p className="home-hint">Press Enter or Space to start</p>
    </LabBackground>
  );
};

export default PlayNowScreen;
