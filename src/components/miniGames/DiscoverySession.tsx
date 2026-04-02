// =============================================
// DiscoverySession.tsx — Orchestrates 3 mini-games
// in sequence, then dismisses so player can explore
// =============================================
// Flow:
//   1. RhymePop → immediate →
//   2. SoundPop → immediate →
//   3. WordSort → complete → dismiss overlay
//
// No fact reveals between games.
// Facts are collected by exploring the room after.
// =============================================

import React, { useState, useCallback, useMemo } from "react";
import RhymePopGame from "./RhymePopGame";
import SoundPopGame from "./SoundPopGame";
import WordSortGame from "./WordSortGame";
import {
  generateSession,
  getThemeForRoom,
  THEME_CONFIGS,
  type MiniGameSession,
  type ThemeConfig,
} from "../../game/discoveryMiniGames";

type SessionStep = "rhyme-pop" | "sound-pop" | "word-sort" | "complete";

interface DiscoverySessionProps {
  roomId: string;
  facts: string[];
  onComplete: () => void;
  onBack: () => void;
}

const DiscoverySession: React.FC<DiscoverySessionProps> = ({
  roomId,
  onComplete,
  onBack,
}) => {
  const themeId = getThemeForRoom(roomId);
  const theme: ThemeConfig = THEME_CONFIGS[themeId];

  const session: MiniGameSession | null = useMemo(
    () => generateSession(roomId),
    [roomId]
  );

  const [step, setStep] = useState<SessionStep>("rhyme-pop");
  const [gamesCompleted, setGamesCompleted] = useState(0);

  const handleGameComplete = useCallback((currentStep: SessionStep) => {
    setGamesCompleted((c) => c + 1);

    // Advance straight to next game
    if (currentStep === "rhyme-pop") {
      setStep("sound-pop");
    } else if (currentStep === "sound-pop") {
      setStep("word-sort");
    } else if (currentStep === "word-sort") {
      setStep("complete");
      // Brief celebration then dismiss — player explores room for facts
      setTimeout(onComplete, 1500);
    }
  }, [onComplete]);

  if (!session) {
    return (
      <div className="mg-game" style={{ background: "transparent" }}>
        <p style={{ color: "#fff", textAlign: "center", padding: 40 }}>
          No word data for this room yet.
        </p>
        <button onClick={onBack} className="mg-back-btn">Back</button>
      </div>
    );
  }

  return (
    <div className="mg-session">
      {/* Back button */}
      <button className="mg-back-btn" onClick={onBack}>← Back</button>

      {/* Game step indicator */}
      <div className="mg-step-dots">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className={`mg-step-dot ${i < gamesCompleted ? "mg-step-dot--done" : ""} ${i === gamesCompleted && step !== "complete" ? "mg-step-dot--active" : ""}`}
          />
        ))}
      </div>

      {/* MINI-GAMES — straight sequence, no interruptions */}
      {step === "rhyme-pop" && (
        <RhymePopGame
          round={session.rhymePop}
          theme={theme}
          onComplete={() => handleGameComplete("rhyme-pop")}
        />
      )}

      {step === "sound-pop" && (
        <SoundPopGame
          round={session.soundPop}
          theme={theme}
          onComplete={() => handleGameComplete("sound-pop")}
        />
      )}

      {step === "word-sort" && (
        <WordSortGame
          round={session.wordSort}
          theme={theme}
          onComplete={() => handleGameComplete("word-sort")}
        />
      )}

      {/* SESSION COMPLETE — brief celebration before dismissing */}
      {step === "complete" && (
        <div className="mg-complete" style={{ background: "transparent" }}>
          <div className="mg-complete__content">
            <span className="mg-complete__emoji">🎉</span>
            <h2 className="mg-complete__title">All Done!</h2>
            <p className="mg-complete__sub">Now explore the room and discover facts!</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiscoverySession;
