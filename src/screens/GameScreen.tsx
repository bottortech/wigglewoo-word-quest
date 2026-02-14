// =============================================
// GameScreen.tsx — CVC word-building screen
// Wigglewoo CVC Quest
// =============================================
// GAME RULES (all enforced here + state.ts):
//   ✓ Drag-and-drop only (no tap-to-place)
//   ✓ Only correct letters snap into matching slot
//   ✓ Incorrect drops snap back — no sound, no X, no penalty
//   ✓ Letters can be removed/replaced by dragging out
//   ✓ Hint escalation: 1st=nothing, 2nd=point, 3rd=point+phoneme
//   ✓ Unlimited attempts, no fail state
//   ✓ Word complete → lock → celebration → auto-advance
//   ✓ No "Next" button — advancement is automatic
//   ✓ No score, timer, lives, penalties, or leaderboard
//   ✓ Word label is HIDDEN — kids solve from image only
// =============================================

import React, { useReducer, useCallback, useMemo, useEffect, useState, useRef } from "react";

import CelebrationOverlay from "../components/CelebrationOverlay";
import WordSlot from "../components/WordSlot";
import WordImage from "../components/WordImage";

import type {
  SlotPosition,
  CvcWord,
  Quest,
  LetterTile,
} from "../game/types";

import { getWordSentence } from "../game/wordData";

import {
  gameReducer,
  initGameState,
  isDropValid,
  type GameState,
  type GameAction,
} from "../game/state";

import { getHintAction, AUTO_ADVANCE_DELAY } from "../game/triggers";
import { useGameDrag } from "../game/useGameDrag";
import {
  recordCorrectPlacement,
  recordIncorrectPlacement,
  recordNodeComplete,
  recordTimeSpent,
} from "../game/analytics";

import helperImg from "../assets/wigglewoo_helper_transparent.png";
import badgeLogo from "../assets/wigglewoos_word_quest_badge-logo.png";
import LabBackground from "../components/LabBackground";
import "../styles/game.css";

// =============================================
// SESSION STREAK — persists across GameScreen remounts
// =============================================
let sessionStreak = 0;

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
  const wordLength = currentWord.letters.length; // 3, 4, or 5
  
  // CSS class for responsive scaling based on word length
  const wordLengthClass = `word-length-${wordLength}`;

  // Track when WiggleWoo should nod (on correct letter placement)
  const [helperNodding, setHelperNodding] = useState(false);

  // Analytics: track time spent on this node
  const nodeStartTime = useRef(Date.now());
  useEffect(() => {
    nodeStartTime.current = Date.now();
    return () => {
      const elapsed = Date.now() - nodeStartTime.current;
      recordTimeSpent(quest.id, quest.patternType, currentWordIndex, elapsed);
    };
  }, [quest.id, quest.patternType, currentWordIndex]);

  // =============================================
  // STATE — single reducer for all game logic
  // =============================================
  const [game, dispatch] = useReducer(
    gameReducer,
    { questId: quest.id, wordIndex: currentWordIndex, word: currentWord },
    (init) => initGameState(init.questId, init.wordIndex, init.word)
  );

  useEffect(() => {
    dispatch({
      type: "RESET_WORD",
      questId: quest.id,
      wordIndex: currentWordIndex,
      word: currentWord,
    });
  }, [quest.id, currentWordIndex, currentWord]);

  // =============================================
  // DRAG — custom hook with pointer capture
  // =============================================
  const {
    drag,
    hoveredSlot,
    snappingBack,
    dragTransform,
    slotRefs,
    containerRef,
    beginDrag,
    onPointerMove,
    onPointerUp,
    onPointerCancel,
    triggerSnapBack,
    clearDrag,
  } = useGameDrag();

  // =============================================
  // DERIVED DATA
  // =============================================
  const hintAction = useMemo(() => getHintAction(game.hint), [game.hint]);

  const tilesInSlots = useMemo(() => {
    const set = new Set<string>();
    game.slots.forEach((s) => { if (s.tileId) set.add(s.tileId); });
    return set;
  }, [game.slots]);

  const tileById = useMemo(() => {
    const map = new Map<string, LetterTile>();
    game.letterBank.forEach((t) => map.set(t.id, t));
    return map;
  }, [game.letterBank]);

  // =============================================
  // DRAG START — from bank or from a filled slot
  // =============================================
  const handleTilePointerDown = useCallback(
    (e: React.PointerEvent, tile: LetterTile, origin: "bank" | SlotPosition) => {
      if (game.wordComplete) return;
      if (typeof origin === "number" && game.slots[origin].locked) return;
      if (typeof origin === "number") {
        dispatch({ type: "REMOVE_LETTER", slotIndex: origin });
      }
      beginDrag(tile.id, tile.letter, origin, e);
    },
    [game.wordComplete, game.slots, beginDrag]
  );

  // =============================================
  // DROP — validate, place, or snap back
  // =============================================
  const handleContainerPointerUp = useCallback(
    (e: React.PointerEvent) => {
      const outcome = onPointerUp(e);
      if (outcome.kind === "no-drag") return;

      if (outcome.kind === "on-slot") {
        const { slotIndex, tileId, letter } = outcome;
        if (game.slots[slotIndex]?.locked) {
          triggerSnapBack();
          return;
        }
        const valid = isDropValid(letter, slotIndex, currentWord.letters);
        if (valid) {
          dispatch({ type: "PLACE_LETTER", slotIndex, tileId, letter });
          clearDrag();
          recordCorrectPlacement(quest.id, quest.patternType, currentWordIndex, currentWord.word);
          // Trigger WiggleWoo nod animation
          setHelperNodding(true);
          setTimeout(() => setHelperNodding(false), 500);
        } else {
          dispatch({ type: "INVALID_DROP" });
          triggerSnapBack();
          recordIncorrectPlacement(quest.id, quest.patternType, currentWordIndex, currentWord.word);
        }
      } else {
        triggerSnapBack();
      }
    },
    [onPointerUp, game.slots, currentWord.letters, triggerSnapBack, clearDrag]
  );

  // =============================================
  // CELEBRATION → AUTO-ADVANCE
  // =============================================
  // ALL words (including mid-quest) go back to map
  // so the player sees WW move to the next node.
  const handleCelebrationDone = useCallback(() => {
    const celebType = game.celebration.type;
    // Record node completion in analytics
    recordNodeComplete(quest.id, quest.patternType, currentWordIndex);
    // Navigate immediately — no delay, no flash of gameplay
    if (celebType === "quest-complete") {
      onNavigate("quest-summary");
    } else {
      onNavigate("quest-map");
    }
  }, [game.celebration.type, onNavigate]);

  // =============================================
  // WORD STREAK
  // =============================================
  const [streakToast, setStreakToast] = useState<string | null>(null);
  const [streakDisplay, setStreakDisplay] = useState(sessionStreak);

  useEffect(() => {
    if (game.celebration.isActive) {
      // Perfect = no hints triggered (level 0)
      const wasPerfect = game.hint.level === 0;
      if (wasPerfect) {
        sessionStreak++;
      } else {
        sessionStreak = 0; // completed with mistakes — full reset
      }
      setStreakDisplay(sessionStreak);

      // Milestone toasts
      if (sessionStreak === 3 || sessionStreak === 5 || (sessionStreak > 5 && sessionStreak % 5 === 0)) {
        setStreakToast(`\uD83D\uDD25 ${sessionStreak} Word Streak!`);
        const t = setTimeout(() => setStreakToast(null), 2500);
        return () => clearTimeout(t);
      }
    }
  }, [game.celebration.isActive]);

  // =============================================
  // SPEAK SENTENCE when word is complete
  // =============================================
  useEffect(() => {
    if (game.wordComplete && !game.celebration.isActive) {
      // Small delay to let the UI update first
      const timer = setTimeout(() => {
        // Get the context-rich sentence and fill in the word
        const sentenceTemplate = getWordSentence(currentWord.word);
        const sentence = sentenceTemplate.replace("___", currentWord.word);
        if ("speechSynthesis" in window) {
          const utterance = new SpeechSynthesisUtterance(sentence);
          utterance.rate = 0.85; // Slightly slower for kids
          utterance.pitch = 1.1; // Slightly higher pitch, friendly
          speechSynthesis.speak(utterance);
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [game.wordComplete, game.celebration.isActive, currentWord.word]);

  // =============================================
  // START OVER — reset current word
  // =============================================
  const handleStartOver = useCallback(() => {
    if (game.wordComplete) return;
    dispatch({ type: "RESET_SLOTS" });
  }, [game.wordComplete]);

  // =============================================
  // TILE RENDERER (bank tiles + slot tiles)
  // =============================================
  const renderTile = (tile: LetterTile, origin: "bank" | SlotPosition) => {
    const isBeingDragged = drag?.tileId === tile.id;
    const isInSlot = typeof origin === "number";

    let style: React.CSSProperties = { touchAction: "none" };
    if (isBeingDragged && snappingBack) {
      style = {
        transform: "translate(0, 0) scale(1)",
        transition: "transform 220ms ease-out",
        zIndex: 200,
        position: "relative",
        touchAction: "none",
      };
    } else if (isBeingDragged) {
      style = {
        transform: dragTransform,
        zIndex: 200,
        position: "relative",
        touchAction: "none",
      };
    }

    return (
      <div
        key={tile.id}
        className={[
          "letter-tile",
          isBeingDragged && !snappingBack ? "letter-tile--dragging" : "",
          isInSlot ? "letter-tile--in-slot" : "",
        ].filter(Boolean).join(" ")}
        style={style}
        onPointerDown={(e) => handleTilePointerDown(e, tile, origin)}
        data-tile-id={tile.id}
      >
        {tile.letter.toUpperCase()}
      </div>
    );
  };

  // =============================================
  // JSX — machine-world themed layout
  // =============================================
  return (
    <LabBackground className="lab-bg--gameplay">
      {/* DEBUG: Temporary overlay to calibrate inner screen bounds */}
      {import.meta.env.DEV && <div className="screen-debug" />}

      {/* TITLE BADGE — top-left, clickable home button (hidden during celebration) */}
      {!game.celebration.isActive && (
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
      )}

      <div
        ref={containerRef as React.RefObject<HTMLDivElement>}
        className="game-screen"
        style={{
          touchAction: "none",
          zIndex: 2,
        }}
        onPointerMove={onPointerMove}
        onPointerUp={handleContainerPointerUp}
        onPointerCancel={onPointerCancel}
      >
        {/* TOP BAR — progress + start over */}
        <div className="game-top-bar">
          <div className="progress-indicator">
            ⭐ {currentWordIndex + 1} / {quest.words.length}
          </div>
          <button
            className="start-over-btn"
            onClick={handleStartOver}
            disabled={game.wordComplete}
          >
            ↩ Start Over
          </button>
        </div>

        {/* MACHINE VIEWPORT — centers content vertically */}
        <div className="machine-viewport">
          {/* PLAY AREA — WW on left, game center, space on right */}
          <div className="game-play-area">
          {/* WIGGLEWOO HELPER */}
          <div className="wigglewoo-helper">
            <img
              src={helperImg}
              alt="Wigglewoo helper"
              className={`wigglewoo-helper__img${
                hintAction.shouldPoint ? " wigglewoo-helper__img--pointing" : ""
              }${helperNodding ? " wigglewoo-helper__img--nod" : ""}`}
              draggable={false}
            />
            {hintAction.shouldReplayPhoneme && (
              <div className="phoneme-indicator">🔊</div>
            )}
          </div>

          {/* CENTER COLUMN — image, slots, bank */}
          <div className={`game-center-column ${wordLengthClass}`}>
            {/* TARGET IMAGE — no word label! */}
            <div className="target-image-area">
              <WordImage imageKey={currentWord.imageKey} size={wordLength <= 3 ? 80 : wordLength === 4 ? 70 : 60} />
            </div>

            {/* SENTENCE WITH BLANK — context-rich learning sentence */}
            <div className="sentence-display">
              <span className="sentence-display__text">
                {(() => {
                  const sentence = getWordSentence(currentWord.word);
                  const parts = sentence.split("___");
                  return (
                    <>
                      {parts[0]}
                      <span className={`sentence-display__blank ${game.wordComplete ? "sentence-display__blank--filled" : ""}`}>
                        {game.wordComplete ? currentWord.word : "___"}
                      </span>
                      {parts[1] || ""}
                    </>
                  );
                })()}
              </span>
            </div>

            {/* WORD SLOTS — dynamic based on word length */}
            <div className="word-slots-row">
              {currentWord.letters.map((_, i) => {
                const slot = game.slots[i];
                const slotTile = slot?.tileId ? tileById.get(slot.tileId) : null;
                return (
                  <div key={i} className="word-slot-wrapper">
                    <WordSlot
                      ref={(el) => { slotRefs.current[i] = el; }}
                      slotIndex={i as SlotPosition}
                      state={slot || { tileId: null, locked: false }}
                      isHovered={hoveredSlot === i}
                      isHintTarget={
                        hintAction.shouldPoint && hintAction.targetSlot === i
                      }
                    />
                    {slotTile && !slot?.locked && drag?.tileId !== slotTile.id && (
                      <div className="slot-tile-overlay">
                        {renderTile(slotTile, i as SlotPosition)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* LETTER BANK */}
            <div className="letter-bank">
              {game.letterBank.map((tile) => {
                if (tilesInSlots.has(tile.id) && drag?.tileId !== tile.id) {
                  return null;
                }
                return renderTile(tile, "bank");
              })}
            </div>
          </div>
        </div>
        </div>

        {/* STREAK INDICATOR */}
        {streakDisplay > 0 && (
          <div className="streak-indicator">🔥 {streakDisplay}</div>
        )}

        {/* STREAK TOAST */}
        {streakToast && (
          <div className="streak-toast" key={streakToast}>{streakToast}</div>
        )}

        {/* CELEBRATION OVERLAY */}
        {game.celebration.isActive && game.celebration.type && (
          <CelebrationOverlay
            type={game.celebration.type}
            onComplete={handleCelebrationDone}
            wordsComplete={currentWordIndex + 1}
            totalWords={quest.words.length}
          />
        )}
      </div>
    </LabBackground>
  );
};

export default GameScreen;
