// =============================================
// SoundPopGame.tsx — Ending Sound Builder
// =============================================
// Game 2: hear word → see onset (CA _) → tap
// correct ending letter (T, P, M, B).
// Word completes visually on correct answer.
// 3 rounds per session.
// =============================================

import React, { useState, useCallback, useEffect, useRef } from "react";
import type { SoundPopRound, ThemeConfig } from "../../game/discoveryMiniGames";
import MiniGameHeader from "./MiniGameHeader";
import { playWordSound } from "../../audio/SoundEffects";

interface SoundPopGameProps {
  round: SoundPopRound;
  theme: ThemeConfig;
  onComplete: () => void;
}

const SoundPopGame: React.FC<SoundPopGameProps> = ({ round, theme, onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [wrongLetter, setWrongLetter] = useState<string | null>(null);
  const [solved, setSolved] = useState(false);
  const [showReveal, setShowReveal] = useState(false);
  const completedRef = useRef(false);

  const totalChallenges = round.challenges.length;
  const challenge = round.challenges[currentIndex];

  // Speak the target word each time a new challenge appears
  useEffect(() => {
    if (challenge) {
      const t = setTimeout(() => playWordSound(challenge.targetWord), 250);
      return () => clearTimeout(t);
    }
  }, [currentIndex, challenge]);

  // If no challenges, auto-complete
  useEffect(() => {
    if (totalChallenges === 0 && !completedRef.current) {
      completedRef.current = true;
      setTimeout(onComplete, 300);
    }
  }, [totalChallenges, onComplete]);

  // Clear wrong feedback
  useEffect(() => {
    if (!wrongLetter) return;
    const t = setTimeout(() => setWrongLetter(null), 500);
    return () => clearTimeout(t);
  }, [wrongLetter]);

  // After reveal, advance to next round
  useEffect(() => {
    if (!showReveal) return;
    const t = setTimeout(() => {
      setShowReveal(false);
      setSolved(false);
      setSelectedLetter(null);

      if (currentIndex + 1 >= totalChallenges) {
        if (!completedRef.current) {
          completedRef.current = true;
          onComplete();
        }
      } else {
        setCurrentIndex((i) => i + 1);
      }
    }, 1200);
    return () => clearTimeout(t);
  }, [showReveal, currentIndex, totalChallenges, onComplete]);

  const handleLetterTap = useCallback((letter: string) => {
    if (solved || showReveal) return;

    if (letter === challenge.correctEnding) {
      setSelectedLetter(letter);
      setSolved(true);
      setTimeout(() => setShowReveal(true), 400);
    } else {
      setWrongLetter(letter);
    }
  }, [challenge, solved, showReveal]);

  const cfg = theme.rhymePop;

  return (
    <div className="mg-game mg-soundpop" style={{ background: "transparent" }}>
      <MiniGameHeader
        title="Finish the Word!"
      />

      {/* Centered panel — matches Game 1 layout */}
      <div className="mg-play-board">
        {/* Onset prompt + blank */}
        <div className="mg-soundpop-prompt">
          <span className="mg-soundpop-prompt__onset">{challenge.onset}</span>
          <span className={`mg-soundpop-prompt__blank ${solved ? "mg-soundpop-prompt__blank--filled" : ""}`}>
            {solved ? challenge.correctEnding : "_"}
          </span>
        </div>

        {/* Completed word reveal with vowel highlight */}
        {showReveal && (
          <div className="mg-soundpop-reveal">
            <span className="mg-soundpop-highlight">
              {challenge.targetWord.split("").map((letter, i) => {
                const vowels = new Set(["a", "e", "i", "o", "u"]);
                return (
                  <span
                    key={i}
                    className={vowels.has(letter.toLowerCase()) ? "mg-soundpop-highlight__vowel" : ""}
                  >
                    {letter.toUpperCase()}
                  </span>
                );
              })}
            </span>
          </div>
        )}

        {/* Ending letter choices */}
        {!showReveal && (
          <div className="mg-soundpop-letters">
            {challenge.endingChoices.map((letter) => {
              const isCorrect = solved && letter === selectedLetter;
              const isWrong = letter === wrongLetter;
              return (
                <button
                  key={letter}
                  className={[
                    "mg-soundpop-letter",
                    isCorrect ? "mg-soundpop-letter--correct" : "",
                    isWrong ? "mg-soundpop-letter--wrong" : "",
                  ].filter(Boolean).join(" ")}
                  onClick={() => handleLetterTap(letter)}
                  disabled={solved}
                >
                  {cfg.objectImage && (
                    <img
                      src={cfg.objectImage}
                      alt=""
                      className="mg-soundpop-letter__image"
                      draggable={false}
                    />
                  )}
                  <span className="mg-soundpop-letter__text">
                    {letter}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Progress */}
      <div className="mg-progress">
        {Math.min(currentIndex + (solved ? 1 : 0), totalChallenges)} / {totalChallenges}
      </div>
    </div>
  );
};

export default SoundPopGame;
