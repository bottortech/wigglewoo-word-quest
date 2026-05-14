// =============================================
// PlayNowScreen.tsx — Play Now / Start screen
// WiggleWoo's Word Quest
// =============================================
// Displays the animated logo with Play Now button
// over the shared GameShell (gears, machines, bulbs,
// blue frame) with map world layers visible.
// Press Enter/Space or click to start.
// =============================================

import React, { useEffect, useCallback, useRef, useState } from "react";
import badgeLogo from "../assets/wigglewoos_word_quest_badge-logo.png";
import GameShell from "../components/GameShell";
import { enableReviewerMode } from "../game/reviewerMode";
import "../styles/home.css";

interface PlayNowScreenProps {
  onPlay: () => void;
}

// Hidden trigger: 5 taps on the logo within REVIEWER_TAP_WINDOW_MS
// unlocks all content. Documented in App Store Connect → App Review
// Information so the Apple reviewer can reach every screenshot
// without playing through the full progression.
const REVIEWER_TAP_COUNT = 5;
const REVIEWER_TAP_WINDOW_MS = 3000;

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

  // ---- Reviewer-mode 5-tap trigger ----
  const tapCount = useRef(0);
  const firstTapAt = useRef(0);
  const [reviewerToast, setReviewerToast] = useState(false);

  const handleLogoTap = useCallback(() => {
    const now = Date.now();
    if (now - firstTapAt.current > REVIEWER_TAP_WINDOW_MS) {
      tapCount.current = 0;
      firstTapAt.current = now;
    }
    tapCount.current += 1;
    if (tapCount.current >= REVIEWER_TAP_COUNT) {
      tapCount.current = 0;
      enableReviewerMode();
      setReviewerToast(true);
      window.setTimeout(() => setReviewerToast(false), 2200);
    }
  }, []);

  return (
    <GameShell showMapWorld titleBadge={false}>
      {/* ---- Play Now UI overlay ---- */}
      <div className="home-overlay" role="main" aria-label="Welcome screen">
        {/* Animated logo — also the hidden reviewer-mode trigger */}
        <div
          className="home-logo-container"
          onClick={handleLogoTap}
          role="presentation"
        >
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

        {reviewerToast && (
          <div className="home-reviewer-toast" role="status" aria-live="polite">
            Reviewer mode enabled — all content unlocked
          </div>
        )}
      </div>
    </GameShell>
  );
};

export default PlayNowScreen;
