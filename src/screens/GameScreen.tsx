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
} from "../game/state";

import { getHintAction } from "../game/triggers";
import { useGameDrag } from "../game/useGameDrag";
import {
  recordCorrectPlacement,
  recordIncorrectPlacement,
  recordNodeComplete,
  recordTimeSpent,
} from "../game/analytics";

import {
  recordWordCompletion,
  recordIncorrectDrop,
} from "../game/learningAnalytics";
import { questIdToVowelId } from "../game/wordData";

import {
  playLetterSound,
  playSuccessPhrase,
  playPromptPhrase,
  playProgressionPhrase,
  playRetryPhrase,
} from "../audio/SoundEffects";
import helperImg from "../assets/wigglewoo_helper_transparent.png";
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
import "../styles/game.css";
import "../styles/questmap.css";
import "../styles/home.css";

// =============================================
// SESSION STREAK — persists across GameScreen remounts
// =============================================
let sessionStreak = 0;

import { saveNodeRating, type WordRating } from "../game/progression";

function computeWordRating(hintLevel: number): WordRating {
  if (hintLevel === 0) return "perfect";
  if (hintLevel <= 2) return "clean";
  return "assisted";
}

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

  // Track incorrect drops for mastery analytics
  const incorrectDropCount = useRef(0);

  // Play "Let's build a word" on first mount
  const hasPlayedPrompt = useRef(false);
  useEffect(() => {
    if (!hasPlayedPrompt.current) {
      hasPlayedPrompt.current = true;
      setTimeout(() => playPromptPhrase(), 400);
    }
  }, []);

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
      // Play letter phoneme sound on pick up
      playLetterSound(tile.letter);
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
          incorrectDropCount.current++;
          recordIncorrectDrop(currentWord.word, quest.id, questIdToVowelId(quest.id));
          // Play "Try it again" on wrong drop
          playRetryPhrase();
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
    // Play next-word phrase
    playProgressionPhrase();
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
  const [, setLastRating] = useState<WordRating | null>(null);

  useEffect(() => {
    if (game.celebration.isActive) {
      // Play word complete phrase
      playSuccessPhrase();

      // Record mastery analytics
      const elapsed = Date.now() - nodeStartTime.current;
      recordWordCompletion(
        currentWord.word,
        quest.id,
        questIdToVowelId(quest.id),
        incorrectDropCount.current,
        elapsed,
      );
      incorrectDropCount.current = 0;

      // Record per-word rating
      const rating = computeWordRating(game.hint.level);
      setLastRating(rating);
      saveNodeRating(quest.id, currentWordIndex, rating);
      console.log(
        `[WordRating] ${quest.id} node ${currentWordIndex + 1}: ${rating} (hint level ${game.hint.level})`
      );

      // Streak: only perfect solves increment
      if (rating === "perfect") {
        sessionStreak++;
      } else {
        sessionStreak = 0;
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
    <div className="machine-world">
      {/* ---- Blue rounded frame (play area) ---- */}
      <div className="map-window">
        <div className="game-shell-panel" />

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
      </div>
      {/* end map-window */}

      {/* ==== OUTER UI — outside the blue frame ==== */}

      {/* Background decorative gears */}
      <img src={gear2} alt="" className="bg-gear bg-gear-1" draggable={false} />
      <img src={gear3} alt="" className="bg-gear bg-gear-2" draggable={false} />
      <img src={gear2} alt="" className="bg-gear bg-gear-3" draggable={false} />
      <img src={gear3} alt="" className="bg-gear bg-gear-4" draggable={false} />
      <img src={gear3} alt="" className="bg-gear bg-gear-5" draggable={false} />
      <img src={gear2} alt="" className="bg-gear bg-gear-6" draggable={false} />
      <img src={gear3} alt="" className="bg-gear bg-gear-7" draggable={false} />
      <img src={gear2} alt="" className="bg-gear bg-gear-8" draggable={false} />

      {/* Left machine + gear + pipe */}
      <img src={machine2} alt="" className="home-machine home-machine-left" draggable={false} />
      <img src={gear1} alt="" className="home-gear home-gear-left" draggable={false} />
      <img src={pipe1} alt="" className="home-pipe home-pipe-left" draggable={false} />
      <img src={pipe2} alt="" className="home-pipe home-pipe-bottom" draggable={false} />

      {/* Right machine with gauge + needle */}
      <div className="home-machine-right-wrap">
        <img src={machine1} alt="" className="home-machine home-machine-right" draggable={false} />
        <img src={gaugeImg} alt="" className="home-gauge-face" draggable={false} />
        <div className="home-needle-wrap">
          <img src={needleImg} alt="" className="home-gauge-needle" draggable={false} />
        </div>
      </div>

      {/* TITLE BADGE — top-left, clickable home button */}
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
