// =============================================
// PlacementTestScreen.tsx — Quick reading level assessment
// =============================================
// Clean, simplified UI (no game frame).
// 6 questions: 2 CVC, 2 blends, 2 vowel teams.
// Max 3 wrong attempts per word → auto-skip.
// Results determine tier + starting node.
// =============================================

import React, { useState, useCallback, useMemo, useEffect } from "react";
import WordImage from "../components/WordImage";
import {
  PLACEMENT_WORDS,
  QUESTIONS_PER_TIER,
  PASS_THRESHOLD,
  MAX_ATTEMPTS,
  scorePlacement,
  savePlacementResult,
  type PlacementWord,
  type WordResult,
  type PlacementResult,
} from "../game/placementTest";
import { playLetterSound } from "../audio/SoundEffects";
import badgeLogo from "../assets/wigglewoos_word_quest_badge-logo.png";
import "../styles/placement.css";

interface PlacementTestScreenProps {
  onComplete: (result: PlacementResult) => void;
  onSkip: () => void;
}

const PlacementTestScreen: React.FC<PlacementTestScreenProps> = ({
  onComplete,
  onSkip: _onSkip,
}) => {
  void _onSkip; // kept in props interface for future use
  const [phase, setPhase] = useState<"intro" | "test" | "done">("intro");
  const [wordIndex, setWordIndex] = useState(0);
  const [filledSlots, setFilledSlots] = useState<(string | null)[]>([]);
  const [usedTileIds, setUsedTileIds] = useState<Set<number>>(new Set());
  const [wrongCount, setWrongCount] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [results, setResults] = useState<WordResult[]>([]);
  const [transitioning, setTransitioning] = useState(false);

  const currentWord: PlacementWord | undefined = PLACEMENT_WORDS[wordIndex];
  const totalQuestions = PLACEMENT_WORDS.length;

  // Build shuffled tile bank for current word
  const tileBank = useMemo(() => {
    if (!currentWord) return [];
    const allLetters = [...currentWord.letters, ...currentWord.distractors];
    // Shuffle
    const shuffled = allLetters
      .map((letter, idx) => ({ letter, id: idx, correct: idx < currentWord.letters.length }))
      .sort(() => Math.random() - 0.5);
    return shuffled;
  }, [wordIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reset state when word changes
  useEffect(() => {
    if (currentWord) {
      setFilledSlots(Array(currentWord.letters.length).fill(null));
      setUsedTileIds(new Set());
      setWrongCount(0);
      setTotalAttempts(0);
    }
  }, [wordIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  // Next empty slot index
  const nextSlot = useMemo(() => {
    return filledSlots.findIndex((s) => s === null);
  }, [filledSlots]);

  // Record result and advance — check tier pass/fail every 3 words
  const advanceWord = useCallback((correct: boolean, attempts: number) => {
    if (!currentWord) return;

    const result: WordResult = {
      word: currentWord.word,
      tier: currentWord.tier,
      attempts,
      correct,
    };

    const newResults = [...results, result];
    setResults(newResults);

    const finishTest = (finalResults: WordResult[]) => {
      setTransitioning(true);
      setTimeout(() => {
        const placement = scorePlacement(finalResults);
        savePlacementResult(placement);
        setPhase("done");
        setTimeout(() => onComplete(placement), 1500);
      }, 500);
    };

    // Check if we just finished a tier (every 2 words)
    const wordNum = wordIndex + 1; // 1-indexed
    if (wordNum % QUESTIONS_PER_TIER === 0) {
      // Count correct for the tier we just finished
      const tierJustFinished = currentWord.tier;
      const tierResults = newResults.filter((r) => r.tier === tierJustFinished);
      const tierCorrect = tierResults.filter((r) => r.correct).length;

      if (tierCorrect < PASS_THRESHOLD) {
        // FAILED this tier — stop immediately, assign placement here
        finishTest(newResults);
        return;
      }
    }

    if (wordNum >= totalQuestions) {
      // All words done — passed all tiers
      finishTest(newResults);
    } else {
      // Instant transition to next word (no delay)
      setWordIndex((i) => i + 1);
    }
  }, [currentWord, results, wordIndex, totalQuestions, onComplete]);

  // Handle tile tap
  const handleTileTap = useCallback((tileId: number, letter: string) => {
    if (!currentWord || nextSlot === -1 || transitioning) return;

    playLetterSound(letter);
    setTotalAttempts((a) => a + 1);

    const expectedLetter = currentWord.letters[nextSlot];
    const isCorrect = letter.toLowerCase() === expectedLetter.toLowerCase();

    if (isCorrect) {
      const newSlots = [...filledSlots];
      newSlots[nextSlot] = letter;
      setFilledSlots(newSlots);
      setUsedTileIds((prev) => new Set(prev).add(tileId));

      // Check if word complete
      const allFilled = newSlots.every((s) => s !== null);
      if (allFilled) {
        setTimeout(() => advanceWord(true, totalAttempts + 1), 200);
      }
    } else {
      const newWrong = wrongCount + 1;
      setWrongCount(newWrong);

      if (newWrong >= MAX_ATTEMPTS) {
        // Max attempts reached — mark as failed, auto-advance
        setTimeout(() => advanceWord(false, totalAttempts + 1), 200);
      }
    }
  }, [currentWord, nextSlot, filledSlots, wrongCount, totalAttempts, transitioning, advanceWord]);

  // Available tiles (not yet used)
  const availableTiles = tileBank.filter((t) => !usedTileIds.has(t.id));

  // Guidance level: heavy (word 0), medium (word 1), none (word 2+)
  const guidanceLevel = wordIndex === 0 ? "heavy" : wordIndex === 1 ? "medium" : "none";

  // TTS for first word guidance
  // TTS disabled — will be replaced with voice actor recordings

  // ---- INTRO PHASE ----
  if (phase === "intro") {
    return (
      <div className="placement-screen">
        <div className="placement-intro">
          <img
            src={badgeLogo}
            alt="WiggleWoo's Word Quest"
            className="placement-intro__logo"
            draggable={false}
          />
          <h1 className="placement-intro__title">
            Let's find your perfect starting point!
          </h1>
          <p className="placement-intro__desc">
            Build a few words so we can see where you should begin.
            It's quick — just {totalQuestions} words!
          </p>
          <button
            className="placement-intro__start-btn"
            onClick={() => setPhase("test")}
          >
            Let's Go!
          </button>
        </div>
      </div>
    );
  }

  // ---- DONE PHASE ----
  if (phase === "done") {
    return (
      <div className="placement-screen">
        <div className="placement-done">
          <span className="placement-done__emoji">🎉</span>
          <h2 className="placement-done__title">All set!</h2>
          <p className="placement-done__desc">Finding your perfect starting point...</p>
        </div>
      </div>
    );
  }

  // ---- TEST PHASE ----
  return (
    <div className="placement-screen">
      <div className={`placement-card ${transitioning ? "placement-card--fade" : ""}`}>
        {/* Progress bar */}
        <div className="placement-progress">
          <div className="placement-progress__bar">
            <div
              className="placement-progress__fill"
              style={{ width: `${((wordIndex) / totalQuestions) * 100}%` }}
            />
          </div>
          <span className="placement-progress__text">
            {wordIndex + 1} of {totalQuestions}
          </span>
        </div>

        {/* Word image */}
        <div className="placement-image">
          <WordImage imageKey={currentWord.imageKey} size={100} />
        </div>

        {/* Slots */}
        <div className="placement-slots">
          {currentWord.letters.map((_, i) => {
            const filled = filledSlots[i];
            const isNext = i === nextSlot;
            const isGuided = isNext && guidanceLevel !== "none";
            return (
              <div
                key={i}
                className={[
                  "placement-slot",
                  filled ? "placement-slot--filled" : "",
                  isNext ? "placement-slot--next" : "",
                  isGuided ? "placement-slot--guided" : "",
                ].filter(Boolean).join(" ")}
              >
                {filled && (
                  <span className="placement-slot__letter">
                    {filled.toUpperCase()}
                  </span>
                )}
                {isGuided && !filled && (
                  <span className="placement-slot__arrow">▼</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Wrong attempt indicator */}
        {wrongCount > 0 && (
          <div className="placement-attempts">
            {Array.from({ length: MAX_ATTEMPTS }).map((_, i) => (
              <span
                key={i}
                className={`placement-attempt-dot ${i < wrongCount ? "placement-attempt-dot--used" : ""}`}
              />
            ))}
          </div>
        )}

        {/* Letter tiles */}
        <div className="placement-tiles">
          {availableTiles.map((tile) => {
            const isCorrectForSlot = nextSlot >= 0 && currentWord &&
              tile.letter.toLowerCase() === currentWord.letters[nextSlot].toLowerCase();
            // Heavy: highlight correct, dim wrong from start
            // Medium: hint after 1 wrong attempt
            const showHint =
              (guidanceLevel === "heavy" && isCorrectForSlot) ||
              (guidanceLevel === "medium" && wrongCount >= 1 && isCorrectForSlot);
            const isDimmed =
              (guidanceLevel === "heavy" && !isCorrectForSlot && wrongCount >= 1);
            return (
              <button
                key={tile.id}
                className={[
                  "placement-tile",
                  showHint ? "placement-tile--hinted" : "",
                  isDimmed ? "placement-tile--dimmed" : "",
                ].filter(Boolean).join(" ")}
                onClick={() => handleTileTap(tile.id, tile.letter)}
              >
                {tile.letter.toUpperCase()}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PlacementTestScreen;
