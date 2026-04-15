// =============================================
// PlayNowScreen.tsx — Play Now / Start screen
// WiggleWoo's Word Quest
// =============================================
// Displays the animated logo with Play Now button
// over the shared GameShell (gears, machines, bulbs,
// blue frame) with map world layers visible.
// Press Enter/Space or click to start.
// =============================================

import React, { useEffect, useCallback } from "react";
import badgeLogo from "../assets/wigglewoos_word_quest_badge-logo.png";
import GameShell from "../components/GameShell";
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
    <GameShell showMapWorld titleBadge={false}>
      {/* ---- Play Now UI overlay ---- */}
      <div className="home-overlay" role="main" aria-label="Welcome screen">
        {/* Animated logo */}
        <div className="home-logo-container">
          <img
            src={badgeLogo}
            alt=""
            className="home-logo"
            draggable={false}
          />
          <div className="home-logo-glow" />
        </div>

        {/* Title — visible to screen readers, visually represented by logo */}
        <h1 className="sr-only">WiggleWoo's Word Quest</h1>

        {/* Play Now button */}
        <button
          className="home-play-btn"
          onClick={onPlay}
          aria-label="Play Now — start the game"
          autoFocus
        >
          Play Now
        </button>

        {/* Keyboard hint */}
        <p className="home-hint">Press Enter or Space to start</p>
      </div>
    </GameShell>
  );
};

export default PlayNowScreen;
