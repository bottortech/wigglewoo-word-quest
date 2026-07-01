import React, { useEffect, useCallback } from "react";
import badgeLogo from "../assets/wigglewoos_word_quest_badge-logo.png";
import GameShell from "../components/GameShell";
import "../styles/home.css";
import "./schoolconomy.css";

interface Props {
  onBegin: () => void;
}

const SchoolconomyWelcome: React.FC<Props> = ({ onBegin }) => {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onBegin();
      }
    },
    [onBegin]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <GameShell showMapWorld titleBadge={false}>
      <div className="home-overlay sc-welcome" role="main" aria-label="Schoolconomy welcome">
        <div className="home-logo-container">
          <img src={badgeLogo} alt="" className="home-logo" draggable={false} />
          <div className="home-logo-glow" />
        </div>

        <h1 className="sr-only">WiggleWoo's Word Quest — Schoolconomy Edition</h1>

        <div className="sc-points-callout">
          <div className="sc-points-row">
            <span className="sc-points-icon" aria-hidden>⭐</span>
            <span>Finish the quest to earn points</span>
          </div>
          <div className="sc-points-row sc-points-row--bonus">
            <span className="sc-points-icon" aria-hidden>🏅</span>
            <span>Earn a mastery badge for bonus points</span>
          </div>
        </div>

        <button
          className="home-play-btn"
          onClick={onBegin}
          aria-label="Begin your word quest"
          autoFocus
        >
          Begin Quest
        </button>

        <p className="home-hint">Press Enter or Space to start</p>
      </div>
    </GameShell>
  );
};

export default SchoolconomyWelcome;
