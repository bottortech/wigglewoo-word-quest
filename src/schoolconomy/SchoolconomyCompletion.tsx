import React from "react";
import GameShell from "../components/GameShell";
import "./schoolconomy.css";

interface Props {
  /** Tracked for the future Schoolconomy callback but not shown. */
  basePoints: number;
  bonusPoints: number;
  masteryBadgeEarned: boolean;
  onPlayAgain: () => void;
}

const SchoolconomyCompletion: React.FC<Props> = ({
  // Props retained so the surrounding state machine still drives this
  // component; production handoff to Schoolconomy will read these via
  // a callback / postMessage when their endpoint is ready.
  basePoints: _basePoints,
  bonusPoints: _bonusPoints,
  masteryBadgeEarned: _masteryBadgeEarned,
  onPlayAgain,
}) => {
  return (
    <GameShell showMapWorld titleBadge={false}>
      <div className="home-overlay sc-completion" role="main" aria-label="Quest complete">
        <h1 className="sc-completion-title">🎉 Quest Complete! 🎉</h1>

        <p className="sc-completion-handoff">
          Return to Schoolconomy to claim your reward.
        </p>

        <button className="home-play-btn" onClick={onPlayAgain}>
          Play Again
        </button>
      </div>
    </GameShell>
  );
};

export default SchoolconomyCompletion;
