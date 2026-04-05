// =============================================
// GameScreen.tsx — 2-Step CVC word-learning screen
// Wigglewoo CVC Quest
// =============================================
// Step 1: BUILD — image + tap-to-place letters (phoneme per tap)
// Step 2: REVEAL — completed word large + WiggleWoo + blend audio
//
// Flow: build → reveal → next word (continuous)
// No drag-and-drop. No fill-in-blank. No hint system for nodes 1-8.
// =============================================

import React, { useCallback, useMemo, useEffect, useState, useRef } from "react";
import WordImage from "../components/WordImage";
import type { Quest, CvcWord, LetterTile } from "../game/types";
import { FIRST_HALF_WORDS } from "../game/types";

import { buildLetterBank } from "../game/state";
import { getCelebrationTypeForWord } from "../game/triggers";
import {
  recordCorrectPlacement,
  recordNodeComplete,
  recordTimeSpent,
} from "../game/analytics";
import { recordWordCompletion } from "../game/learningAnalytics";
import { questIdToVowelId, getLetterCategory } from "../game/wordData";
import {
  playLetterSound,
  playSuccessPhrase,
  playPromptPhrase,
} from "../audio/SoundEffects";
import CelebrationOverlay from "../components/CelebrationOverlay";
import badgeLogo from "../assets/wigglewoos_word_quest_badge-logo.png";
import machine1 from "../assets/machine1.png";
import machine2 from "../assets/machine2.png";
import gaugeImg from "../assets/guage.png";
import needleImg from "../assets/needle_guage_pin.png";
import gear1 from "../assets/gear1.png";
import gear2 from "../assets/gear2.png";
import gear3 from "../assets/gear3.png";
import pipe1 from "../assets/pipe1.png";
import pipe2 from "../assets/pipe2.png";
import { saveNodeRating, type WordRating } from "../game/progression";
import "../styles/game.css";
import "../styles/questmap.css";
import "../styles/home.css";

// =============================================
// SESSION STREAK — persists across remounts
// =============================================
let sessionStreak = 0;

// =============================================
// Speaker icon — SVG component matching WiggleWoo style
// =============================================
const SpeakerIcon: React.FC<{ active: boolean }> = ({ active }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="speaker-icon-svg"
  >
    {/* Speaker body */}
    <path
      d="M3 9v6h4l5 5V4L7 9H3z"
      fill={active ? "#6C63FF" : "#5A5A7A"}
      stroke={active ? "#4B44CC" : "#3E3E5C"}
      strokeWidth="1.2"
      strokeLinejoin="round"
    />
    {/* Sound waves — only visible when active */}
    {active && (
      <>
        <path
          d="M16.5 7.5a5.5 5.5 0 010 9"
          stroke="#6C63FF"
          strokeWidth="2"
          strokeLinecap="round"
          className="speaker-wave speaker-wave--outer"
        />
        <path
          d="M14 10a2.5 2.5 0 010 4"
          stroke="#6C63FF"
          strokeWidth="2"
          strokeLinecap="round"
          className="speaker-wave speaker-wave--inner"
        />
      </>
    )}
    {/* Subtle dot when idle */}
    {!active && (
      <circle cx="16" cy="12" r="1.5" fill="#5A5A7A" opacity="0.5" />
    )}
  </svg>
);

type GameStep = "build" | "celebrate";

interface GameScreenProps {
  quest: Quest;
  currentWordIndex: number;
  onNavigate: (target: "next-word" | "quest-map" | "quest-summary") => void;
  onGoHome?: () => void;
}

const GameScreen: React.FC<GameScreenProps> = ({
  quest,
  currentWordIndex,
  onNavigate,
  onGoHome,
}) => {
  const currentWord: CvcWord = quest.words[currentWordIndex];
  const wordLength = currentWord.letters.length;
  const wordLengthClass = `word-length-${wordLength}`;

  // Should we use distractors? Only for nodes 9-16 (index >= 8)
  const useDistractors = currentWordIndex >= FIRST_HALF_WORDS;

  // Build the letter bank — strip distractors for early nodes
  const letterBank: LetterTile[] = useMemo(() => {
    const wordForBank: CvcWord = useDistractors
      ? currentWord
      : { ...currentWord, distractors: [] };
    return buildLetterBank(wordForBank);
  }, [currentWord, useDistractors]);

  // ---- Step state ----
  const [step, setStep] = useState<GameStep>("build");
  const [filledSlots, setFilledSlots] = useState<(string | null)[]>(
    () => Array(wordLength).fill(null)
  );
  const [usedTileIds] = useState<Set<string>>(new Set());
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [slotAttempts, setSlotAttempts] = useState(0); // wrong attempts on current slot
  const [shakingTileId, setShakingTileId] = useState<string | null>(null);
  const nodeStartTime = useRef(Date.now());

  // Build per-slot letter choices: correct letter + 1-2 distractors
  const slotChoices: LetterTile[] = useMemo(() => {
    const slotIdx = filledSlots.findIndex((s) => s === null);
    if (slotIdx === -1) return [];
    const correctLetter = currentWord.letters[slotIdx];
    // Pick 1-2 distractors from the word's distractor list or other letters
    const distractors = currentWord.distractors.length > 0
      ? currentWord.distractors.slice(0, 2)
      : currentWord.letters.filter((l, i) => i !== slotIdx && l !== correctLetter).slice(0, 1);
    const choices = [correctLetter, ...distractors];
    // Shuffle
    const tiles: LetterTile[] = choices.map((letter, i) => ({
      id: `choice-${slotIdx}-${i}-${letter}`,
      letter,
      category: getLetterCategory(letter),
    }));
    for (let i = tiles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
    }
    return tiles;
  }, [filledSlots, currentWord]);

  // ---- Speaker / audio replay state ----
  const [audioActive, setAudioActive] = useState(false);
  const audioTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const handleSpeakerTap = useCallback(() => {
    // Replay the appropriate audio for the current step
    if (step === "build") {
      playPromptPhrase();
    }
    // Show active state briefly
    setAudioActive(true);
    if (audioTimeoutRef.current) clearTimeout(audioTimeoutRef.current);
    audioTimeoutRef.current = setTimeout(() => setAudioActive(false), 1200);
  }, [step]);

  // Clear audio timeout on unmount
  useEffect(() => {
    return () => { if (audioTimeoutRef.current) clearTimeout(audioTimeoutRef.current); };
  }, []);

  // Analytics time tracking
  useEffect(() => {
    nodeStartTime.current = Date.now();
    return () => {
      const elapsed = Date.now() - nodeStartTime.current;
      recordTimeSpent(quest.id, quest.patternType, currentWordIndex, elapsed);
    };
  }, [quest.id, quest.patternType, currentWordIndex]);

  // Play prompt on first mount + flash speaker
  const hasPlayedPrompt = useRef(false);
  useEffect(() => {
    if (!hasPlayedPrompt.current) {
      hasPlayedPrompt.current = true;
      setTimeout(() => {
        playPromptPhrase();
        setAudioActive(true);
        if (audioTimeoutRef.current) clearTimeout(audioTimeoutRef.current);
        audioTimeoutRef.current = setTimeout(() => setAudioActive(false), 1200);
      }, 400);
    }
  }, []);

  // ---- Step 1: Tap-to-place ----
  const nextEmptySlot = useMemo(() => {
    return filledSlots.findIndex((s) => s === null);
  }, [filledSlots]);

  const handleTileTap = useCallback((tile: LetterTile) => {
    if (step !== "build" || shakingTileId) return;
    const slotIdx = filledSlots.findIndex((s) => s === null);
    if (slotIdx === -1) return;

    // Play phoneme sound
    playLetterSound(tile.letter);

    // Check if correct for this slot
    const correct = tile.letter.toLowerCase() === currentWord.letters[slotIdx].toLowerCase();

    if (correct) {
      const newSlots = [...filledSlots];
      newSlots[slotIdx] = tile.letter;
      setFilledSlots(newSlots);
      setSlotAttempts(0); // reset for next slot
      recordCorrectPlacement(quest.id, quest.patternType, currentWordIndex, currentWord.word);

      // Check if word is now complete
      const allFilled = newSlots.every((s) => s !== null);
      if (allFilled) {
        setStep("celebrate");
      }
    } else {
      // Wrong letter — shake tile, count attempt
      setIncorrectCount((c) => c + 1);
      setSlotAttempts((a) => a + 1);
      setShakingTileId(tile.id);
      setTimeout(() => setShakingTileId(null), 400);
    }
  }, [step, filledSlots, currentWord, quest.id, quest.patternType, currentWordIndex, shakingTileId]);

  // ---- Step 2: Celebration ----
  useEffect(() => {
    if (step === "celebrate") {
      // Play success chime
      playSuccessPhrase();

      // Record analytics
      const elapsed = Date.now() - nodeStartTime.current;
      recordWordCompletion(
        currentWord.word,
        quest.id,
        questIdToVowelId(quest.id),
        incorrectCount,
        elapsed,
      );

      // Record rating
      const rating: WordRating = incorrectCount === 0 ? "perfect" : incorrectCount <= 2 ? "clean" : "assisted";
      saveNodeRating(quest.id, currentWordIndex, rating);

      // Streak
      if (rating === "perfect") {
        sessionStreak++;
      } else {
        sessionStreak = 0;
      }

      // Record node completion
      recordNodeComplete(quest.id, quest.patternType, currentWordIndex);
    }
  }, [step]);

  // ---- Celebration complete → navigate ----
  const handleCelebrationComplete = useCallback(() => {
    const celebType = getCelebrationTypeForWord(currentWordIndex);
    if (celebType === "quest-complete") {
      onNavigate("quest-summary");
    } else {
      onNavigate("quest-map");
    }
  }, [currentWordIndex, onNavigate]);

  // Available tiles (not yet used)
  // Letter bank filtered by used tiles (kept for future use)
  void letterBank; void usedTileIds;

  // =============================================
  // JSX
  // =============================================
  return (
    <div className="machine-world">
      {/* Blue rounded frame */}
      <div className="map-window">
        <div className="game-shell-panel" />

        <div className="game-screen" style={{ touchAction: "none", zIndex: 2 }}>
          {/* TOP BAR */}
          <div className="game-top-bar">
            <div className="progress-indicator">
              ⭐ {currentWordIndex + 1} / {quest.words.length}
            </div>
            <button
              className={`speaker-btn ${audioActive ? "speaker-btn--active" : ""}`}
              onClick={handleSpeakerTap}
              aria-label="Replay audio"
            >
              <SpeakerIcon active={audioActive} />
            </button>
          </div>

          {/* MACHINE VIEWPORT */}
          <div className="machine-viewport">
            <div className="game-play-area">
              <div className={`game-center-column ${wordLengthClass}`}>

                {/* ========== STEP 1: BUILD ========== */}
                {step === "build" && (
                  <div className="build-group">
                    {/* Target image — only for "image" mode words */}
                    {(currentWord.mode ?? "image") === "image" && (
                      <div className="target-image-area">
                        <WordImage imageKey={currentWord.imageKey} size={wordLength <= 3 ? 115 : 96} />
                      </div>
                    )}

                    {/* Word slots */}
                    <div className="word-slots-row">
                      {currentWord.letters.map((_, i) => {
                        const filled = filledSlots[i];
                        const isNext = i === nextEmptySlot;
                        return (
                          <div
                            key={i}
                            className={[
                              "word-slot",
                              filled ? "word-slot--filled" : "",
                              isNext ? "word-slot--hovered" : "",
                            ].filter(Boolean).join(" ")}
                          >
                            {filled && (
                              <span className="word-slot__letter">
                                {filled.toUpperCase()}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Letter bank — reduced choices per slot */}
                    <div className="letter-bank">
                      {slotChoices.map((tile) => {
                        const slotIdx = filledSlots.findIndex((s) => s === null);
                        const isCorrect = slotIdx >= 0 && tile.letter.toLowerCase() === currentWord.letters[slotIdx].toLowerCase();
                        const showHint = slotAttempts >= 2 && isCorrect;
                        const isShaking = shakingTileId === tile.id;
                        return (
                          <div
                            key={tile.id}
                            className={[
                              "letter-tile",
                              showHint ? "letter-tile--hinted" : "",
                              isShaking ? "letter-tile--wrong-shake" : "",
                            ].filter(Boolean).join(" ")}
                            onClick={() => handleTileTap(tile)}
                            style={{ cursor: "pointer", touchAction: "manipulation" }}
                          >
                            {tile.letter.toUpperCase()}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}


              </div>
            </div>
          </div>

          {/* ========== STEP 2: CELEBRATION ========== */}
          {step === "celebrate" && (
            <CelebrationOverlay
              type={getCelebrationTypeForWord(currentWordIndex)}
              onComplete={handleCelebrationComplete}
              wordsComplete={currentWordIndex + 1}
              totalWords={quest.words.length}
              word={currentWord.word}
            />
          )}
        </div>
      </div>
      {/* end map-window */}

      {/* ==== OUTER UI — machine frame decorations ==== */}
      <img src={gear2} alt="" className="bg-gear bg-gear-1" draggable={false} />
      <img src={gear3} alt="" className="bg-gear bg-gear-2" draggable={false} />
      <img src={gear2} alt="" className="bg-gear bg-gear-3" draggable={false} />
      <img src={gear3} alt="" className="bg-gear bg-gear-4" draggable={false} />
      <img src={gear3} alt="" className="bg-gear bg-gear-5" draggable={false} />
      <img src={gear2} alt="" className="bg-gear bg-gear-6" draggable={false} />
      <img src={gear3} alt="" className="bg-gear bg-gear-7" draggable={false} />
      <img src={gear2} alt="" className="bg-gear bg-gear-8" draggable={false} />

      <img src={machine2} alt="" className="home-machine home-machine-left" draggable={false} />
      <img src={gear1} alt="" className="home-gear home-gear-left" draggable={false} />
      <img src={pipe1} alt="" className="home-pipe home-pipe-left" draggable={false} />
      <img src={pipe2} alt="" className="home-pipe home-pipe-bottom" draggable={false} />

      <div className="home-machine-right-wrap">
        <img src={machine1} alt="" className="home-machine home-machine-right" draggable={false} />
        <img src={gaugeImg} alt="" className="home-gauge-face" draggable={false} />
        <div className="home-needle-wrap">
          <img src={needleImg} alt="" className="home-gauge-needle" draggable={false} />
        </div>
      </div>

      {/* Title badge — home button */}
      <img
        src={badgeLogo}
        alt="WiggleWoo's Word Quest - Go Home"
        className="title-badge title-badge--clickable"
        draggable={false}
        onClick={onGoHome}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && onGoHome?.()}
      />

      {/* Pipe strips + corner bolts */}
      <div className="machine-world-pipes-top" />
      <div className="machine-world-pipes-bottom" />
      <span className="machine-bolt machine-bolt--tl" />
      <span className="machine-bolt machine-bolt--tr" />
      <span className="machine-bolt machine-bolt--bl" />
      <span className="machine-bolt machine-bolt--br" />
    </div>
  );
};

export default GameScreen;
