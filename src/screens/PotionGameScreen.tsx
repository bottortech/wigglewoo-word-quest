// =============================================
// PotionGameScreen.tsx — Potion Lab (primary gameplay)
// WiggleWoo's Word Quest
// =============================================
// Full lesson-step machine identical to GameScreen:
//   lesson-intro → (trace-prep →) (say-cue →) build → celebrate
//   → mastery-unlock → parent-prompt → navigate
//
// The ONLY difference from GameScreen is the "build" step:
//   instead of flat letter tiles the child taps potion bottles
//   that rise, pour, and fill a central beaker.
//
// Pure CSS animations only (see potion-game.css).
// =============================================

import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
import type { Quest, CvcWord, LetterTile } from "../game/types";
import { buildLetterBank } from "../game/state";
import { getCelebrationTypeForWord } from "../game/triggers";
import WordImage from "../components/WordImage";
import CelebrationOverlay from "../components/CelebrationOverlay";
import LessonObjectiveCard from "../components/LessonObjectiveCard";
import MasteryBadgeUnlock from "../components/MasteryBadgeUnlock";
import SayItOutLoudCue from "../components/SayItOutLoudCue";
import ParentPrompt from "../components/ParentPrompt";
import TraceMoment from "../components/handwriting/TraceMoment";
import { LETTER_PATHS } from "../components/handwriting/letterPaths";
import {
  playLetterSound,
  playWordSound,
  playEvent,
  playSuccessPhrase,
  waitForLetterDone,
  waitForWordDone,
} from "../audio/SoundEffects";
import {
  recordCorrectPlacement,
  recordNodeComplete,
  recordTimeSpent,
} from "../game/analytics";
import { recordWordCompletion } from "../game/learningAnalytics";
import { questIdToVowelId } from "../game/wordData";
import {
  saveNodeRating,
  type WordRating,
  isLessonStart,
  isMasteryCheckWord,
  isTracePrepWord,
  getLessonIndex,
  getTraceLetterForWord,
  recordLessonMastery,
} from "../game/progression";
import { getParentPrompt } from "../game/parentPrompts";
import gear1 from "../assets/gear1.png";
import gear2 from "../assets/gear2.png";
import gear3 from "../assets/gear3.png";
import machine1 from "../assets/machine1.png";
import machine2 from "../assets/machine2.png";
import gaugeImg from "../assets/guage.png";
import needleImg from "../assets/needle_guage_pin.png";
import pipe1 from "../assets/pipe1.png";
import pipe2 from "../assets/pipe2.png";
// Professor WiggleWoo sprites — swap when final sprites confirmed
import wigglewooIdle from "../assets/wigglewoo_idle_transparent.png";
import wigglewooCelebrate from "../assets/wigglewoo_celebration_transparent.png";
import "../styles/game.css";
import "../styles/potion-game.css";

// =============================================
// Session streak (persists across remounts)
// =============================================
let sessionStreak = 0;

// =============================================
// Bottle colour palette
// =============================================
const BOTTLE_COLORS = [
  "#7C3AED",
  "#0EA5E9",
  "#16A34A",
  "#EA580C",
  "#DB2777",
  "#0891B2",
];

function assignBottleColors(tiles: LetterTile[]): Map<string, string> {
  const palette = [...BOTTLE_COLORS];
  for (let i = palette.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [palette[i], palette[j]] = [palette[j], palette[i]];
  }
  const map = new Map<string, string>();
  tiles.forEach((t, i) => map.set(t.id, palette[i % palette.length]));
  return map;
}

function levelClass(filled: number, total: number): string {
  if (filled === 0) return "l0";
  if (filled >= total) return "full";
  const ratio = filled / total;
  if (ratio <= 0.34) return "l1";
  if (ratio <= 0.67) return "l2";
  return "l3";
}

function getFocusLabel(questTitle: string): string {
  const colon = questTitle.lastIndexOf(":");
  return colon >= 0 ? questTitle.slice(colon + 1).trim() : questTitle;
}

// =============================================
// Types — full step machine matching GameScreen
// =============================================
type GameStep =
  | "lesson-intro"
  | "trace-prep"
  | "say-cue"
  | "build"
  | "celebrate"
  | "mastery-unlock"
  | "parent-prompt";

type ProfState = "idle" | "excited" | "wrong" | "celebrate";

interface PotionGameScreenProps {
  quest: Quest;
  currentWordIndex: number;
  onNavigate: (target: "next-word" | "quest-map" | "quest-summary") => void;
  onGoHome?: () => void;
}

// =============================================
// Component
// =============================================
const PotionGameScreen: React.FC<PotionGameScreenProps> = ({
  quest,
  currentWordIndex,
  onNavigate,
  onGoHome,
}) => {
  const currentWord: CvcWord = quest.words[currentWordIndex];
  const wordLength = currentWord.letters.length;

  const letterBank: LetterTile[] = useMemo(
    () => buildLetterBank(currentWord, quest.patternType),
    [currentWord, quest.patternType],
  );

  const bottleColors = useMemo(
    () => assignBottleColors(letterBank),
    [letterBank],
  );

  // ---- Lesson step logic (mirrors GameScreen exactly) ----
  const isMasteryWord   = isMasteryCheckWord(currentWordIndex);
  const showLessonIntro = isLessonStart(currentWordIndex);
  const lessonIndex     = getLessonIndex(currentWordIndex);

  const traceLetter = useMemo<string | null>(() => {
    const candidate = getTraceLetterForWord(lessonIndex, currentWord.letters);
    if (!candidate) return null;
    return LETTER_PATHS[candidate] ? candidate : null;
  }, [lessonIndex, currentWord.letters]);

  const [step, setStep] = useState<GameStep>(() => {
    if (showLessonIntro) return "lesson-intro";
    if (isTracePrepWord(currentWordIndex)) {
      const candidate = getTraceLetterForWord(lessonIndex, currentWord.letters);
      if (candidate && LETTER_PATHS[candidate]) return "trace-prep";
    }
    return "build";
  });

  // ---- Build step state ----
  const [filledSlots, setFilledSlots] = useState<(string | null)[]>(() =>
    Array(wordLength).fill(null),
  );
  const [usedTileIds,   setUsedTileIds]   = useState<Set<string>>(new Set());
  const [liquidLevel,   setLiquidLevel]   = useState(0);
  const [pouringTileId, setPouringTileId] = useState<string | null>(null);
  const [pourSide,     setPourSide]     = useState<"left" | "right">("left");
  const [isPracticeTrace, setIsPracticeTrace] = useState(false);
  const [wrongTileId,   setWrongTileId]   = useState<string | null>(null);
  const [lockedOut,     setLockedOut]     = useState(false);
  const [audioActive,   setAudioActive]   = useState(false);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [slotAttempts,   setSlotAttempts]   = useState(0);

  // ---- WiggleWoo professor state ----
  const [profState,       setProfState]       = useState<ProfState>("idle");
  const [wordRevealPhase, setWordRevealPhase] = useState<0 | 1 | 2>(0);

  const profTimeoutRef      = useRef<ReturnType<typeof setTimeout>>(undefined);
  const audioTimeoutRef     = useRef<ReturnType<typeof setTimeout>>(undefined);
  const sayCueTimerRef      = useRef<ReturnType<typeof setTimeout>>(undefined);
  const audioStartTimerRef  = useRef<ReturnType<typeof setTimeout>>(undefined);
  const nodeStartTime       = useRef(Date.now());

  // Derived
  const nextEmptySlot = useMemo(
    () => filledSlots.findIndex((s) => s === null),
    [filledSlots],
  );

  const availableTiles = useMemo(
    () => letterBank.filter((t) => !usedTileIds.has(t.id)),
    [letterBank, usedTileIds],
  );

  const isBeakerFull = liquidLevel >= wordLength;

  // ---- Analytics: time spent ----
  useEffect(() => {
    nodeStartTime.current = Date.now();
    return () => {
      recordTimeSpent(
        quest.id,
        quest.patternType,
        currentWordIndex,
        Date.now() - nodeStartTime.current,
      );
    };
  }, [quest.id, quest.patternType, currentWordIndex]);

  // ---- Play target word + say-cue chain (mirrors GameScreen) ----
  const hasPlayedPrompt = useRef(false);
  useEffect(() => {
    if (hasPlayedPrompt.current) return;
    if (step === "lesson-intro" || step === "trace-prep") return;
    if (step !== "build" && step !== "say-cue") return;
    hasPlayedPrompt.current = true;
    audioStartTimerRef.current = setTimeout(() => {
      playWordSound(currentWord.word);
      setAudioActive(true);
      if (audioTimeoutRef.current) clearTimeout(audioTimeoutRef.current);
      audioTimeoutRef.current = setTimeout(() => setAudioActive(false), 1200);
      if (isLessonStart(currentWordIndex) && !isMasteryWord) {
        sayCueTimerRef.current = setTimeout(() => setStep("say-cue"), 1400);
      }
    }, 800);
  }, [step, isMasteryWord, currentWord.word, currentWordIndex]);

  // ---- Cleanup timers on unmount ----
  useEffect(
    () => () => {
      if (audioTimeoutRef.current)    clearTimeout(audioTimeoutRef.current);
      if (profTimeoutRef.current)     clearTimeout(profTimeoutRef.current);
      if (sayCueTimerRef.current)     clearTimeout(sayCueTimerRef.current);
      if (audioStartTimerRef.current) clearTimeout(audioStartTimerRef.current);
    },
    [],
  );

  // ---- Celebration audio + analytics ----
  useEffect(() => {
    if (step !== "celebrate") return;

    const isLast = currentWordIndex === quest.words.length - 1;
    waitForLetterDone().then(() => {
      playWordSound(currentWord.word);
      waitForWordDone().then(() => {
        if (isLast) playEvent("celebrate-quest-complete");
        else playSuccessPhrase();
      });
    });

    const elapsed = Date.now() - nodeStartTime.current;
    recordWordCompletion(
      currentWord.word,
      quest.id,
      questIdToVowelId(quest.id),
      incorrectCount,
      elapsed,
    );
    const rating: WordRating =
      incorrectCount === 0 ? "perfect" : incorrectCount <= 2 ? "clean" : "assisted";
    saveNodeRating(quest.id, currentWordIndex, rating);

    if (isMasteryWord) {
      recordLessonMastery(quest.id, getLessonIndex(currentWordIndex));
    }
    sessionStreak = rating === "perfect" ? sessionStreak + 1 : 0;
    recordNodeComplete(quest.id, quest.patternType, currentWordIndex);
  }, [step]); // eslint-disable-line react-hooks/exhaustive-deps

  // ---- Speaker replay ----
  const handleSpeakerTap = useCallback(() => {
    playWordSound(currentWord.word);
    setAudioActive(true);
    if (audioTimeoutRef.current) clearTimeout(audioTimeoutRef.current);
    audioTimeoutRef.current = setTimeout(() => setAudioActive(false), 1200);
  }, [currentWord.word]);

  // ---- Professor helper ----
  const triggerProf = useCallback((state: ProfState, resetMs?: number) => {
    if (profTimeoutRef.current) clearTimeout(profTimeoutRef.current);
    setProfState(state);
    if (resetMs !== undefined) {
      profTimeoutRef.current = setTimeout(() => setProfState("idle"), resetMs);
    }
  }, []);

  // ---- Tap handler ----
  const handleTileTap = useCallback(
    (tile: LetterTile, bottleIdx: number, totalBottles: number) => {
      if (step !== "build" || lockedOut || pouringTileId !== null) return;
      if (nextEmptySlot === -1) return;

      // Pour toward the beaker: left-side bottles tilt right, right-side bottles tilt left
      const midpoint = (totalBottles - 1) / 2;
      setPourSide(bottleIdx < midpoint ? "right" : "left");

      playLetterSound(tile.letter);

      const isCorrect =
        tile.letter.toLowerCase() ===
        currentWord.letters[nextEmptySlot].toLowerCase();

      if (isCorrect) {
        const slotToFill = nextEmptySlot;
        const newSlots = filledSlots.map((s, i) =>
          i === slotToFill ? tile.letter : s,
        );

        setPouringTileId(tile.id);
        setLockedOut(true);
        setSlotAttempts(0);
        triggerProf("excited", 1400);

        setTimeout(() => setLiquidLevel((lv) => lv + 1), 500);

        setTimeout(() => {
          setFilledSlots(newSlots);
          setUsedTileIds((prev) => new Set(prev).add(tile.id));
          setPouringTileId(null);
          setLockedOut(false);
          recordCorrectPlacement(
            quest.id,
            quest.patternType,
            currentWordIndex,
            currentWord.word,
          );

          if (newSlots.every((s) => s !== null)) {
            triggerProf("celebrate");
            setTimeout(() => setWordRevealPhase(1), 200);
            setTimeout(() => setWordRevealPhase(2), 750);
            setTimeout(() => setStep("celebrate"), 1250);
          }
        }, 1100);
      } else {
        setWrongTileId(tile.id);
        setLockedOut(true);
        setIncorrectCount((c) => c + 1);
        const nextAttempts = slotAttempts + 1;
        setSlotAttempts(nextAttempts);
        // Escalating feedback: gentle → almost → hint
        if (nextAttempts === 1)      playEvent("wrong-gentle");
        else if (nextAttempts === 2) playEvent("wrong-almost");
        else                         playEvent("wrong-hint");
        triggerProf("wrong", 700);
        setTimeout(() => setWrongTileId(null), 600);
        setTimeout(() => setLockedOut(false), 820);
      }
    },
    [
      step,
      lockedOut,
      pouringTileId,
      nextEmptySlot,
      filledSlots,
      slotAttempts,
      currentWord,
      quest.id,
      quest.patternType,
      currentWordIndex,
      triggerProf,
    ],
  );

  // ---- Navigation / step handlers (mirrors GameScreen) ----
  const navigateAfterWord = useCallback(() => {
    const celebType = getCelebrationTypeForWord(currentWordIndex, quest.words.length);
    onNavigate(celebType === "quest-complete" ? "quest-summary" : "quest-map");
  }, [currentWordIndex, onNavigate, quest.words.length]);

  const handleCelebrationComplete = useCallback(() => {
    if (isMasteryWord) {
      setStep("mastery-unlock");
      return;
    }
    navigateAfterWord();
  }, [isMasteryWord, navigateAfterWord]);

  const handleMasteryUnlockComplete = useCallback(() => {
    setStep("parent-prompt");
  }, []);

  const handleParentPromptDismiss = useCallback(() => {
    navigateAfterWord();
  }, [navigateAfterWord]);

  const handleLessonIntroComplete = useCallback(() => {
    if (isTracePrepWord(currentWordIndex) && traceLetter) {
      setIsPracticeTrace(false); // mandatory — no back button
      setStep("trace-prep");
    } else {
      setStep("build");
    }
  }, [currentWordIndex, traceLetter]);

  const handleTracePrepComplete = useCallback(() => {
    setIsPracticeTrace(false);
    setStep("build");
  }, []);

  const handlePracticeBoardClick = useCallback(() => {
    if (step !== "build" || !traceLetter) return;
    setIsPracticeTrace(true); // voluntary — show back button
    setStep("trace-prep");
  }, [step, traceLetter]);

  const handleSayCueDismiss = useCallback(() => {
    setStep("build");
  }, []);

  // ---- Derived values for rendering ----
  const liqClass = levelClass(liquidLevel, wordLength);

  const bubbles = useMemo(() => {
    const count = Math.max(4, liquidLevel * 5);
    return Array.from({ length: count }, (_, i) => ({
      x: `${6 + ((i * 19 + liquidLevel * 13) % 82)}%`,
      delay: `${((i * 0.31 + liquidLevel * 0.07) % 2.2).toFixed(2)}s`,
      dur: `${(0.9 + (i % 6) * 0.28).toFixed(2)}s`,
      size: 3 + (i % 4) * 2.5,
      color: isBeakerFull
        ? `rgba(255, ${190 + (i % 3) * 20}, ${60 + (i % 4) * 30}, 0.7)`
        : `rgba(255, 255, 255, ${0.35 + (i % 3) * 0.15})`,
    }));
  }, [liquidLevel, isBeakerFull]);

  const profSrc = profState === "celebrate" ? wigglewooCelebrate : wigglewooIdle;

  // =============================================
  // JSX
  // =============================================
  return (
    <div className="machine-world machine-world--potion">
      <div className="map-window">
        <div className="game-shell-panel" />

        <div className="game-screen" style={{ touchAction: "none", zIndex: 2 }}>
          <div className="machine-viewport">
            <div className="pg-shell">

              {/* ── Top bar ── */}
              <div className="pg-top-bar">
                <div className="pg-progress">
                  ⭐ {currentWordIndex + 1} / {quest.words.length}
                </div>
                {isMasteryWord && step === "build" && (
                  <div
                    className="mastery-marker"
                    role="status"
                    aria-label="Mastery check"
                    title="Mastery check — try it on your own!"
                  >
                    ★ Mastery Check
                  </div>
                )}
                <button
                  className={`pg-speaker-btn${audioActive ? " pg-speaker-btn--active" : ""}`}
                  onClick={handleSpeakerTap}
                  aria-label="Replay word audio"
                >
                  🔊
                </button>
              </div>

              {/* ── Build step (potion interaction) ── */}
              {(step === "build" || step === "say-cue") && (
                <>
                  {/* Image (left) + gameplay column (right) */}
                  <div className="pg-upper-row">
                    <div className="pg-image-wrap">
                      <WordImage
                        imageKey={currentWord.imageKey}
                        size={wordLength <= 3 ? 120 : 100}
                      />
                    </div>

                    <div className="pg-gameplay-col">
                      {/* Answer slots */}
                      <div className="pg-slots-row">
                        {currentWord.letters.map((_, i) => {
                          const filled = filledSlots[i];
                          const isNext = i === nextEmptySlot && !filled;
                          return (
                            <div
                              key={i}
                              className={[
                                "pg-slot",
                                filled ? "pg-slot--filled" : "",
                                isNext ? "pg-slot--active" : "",
                              ]
                                .filter(Boolean)
                                .join(" ")}
                            >
                              {filled && (
                                <span className="pg-slot__letter">
                                  {filled.toUpperCase()}
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Beaker zone */}
                      <div className="pg-beaker-zone">
                        <div className="pg-beaker-rim" />

                        {/* Pour stream — inside beaker-zone so left:50% always centers on the beaker */}
                        {pouringTileId && (
                          <div
                            className="pg-pour-drip"
                            style={{
                              ["--dc" as string]:
                                bottleColors.get(pouringTileId) ?? BOTTLE_COLORS[0],
                            }}
                          />
                        )}

                        <div
                          className={[
                            "pg-beaker",
                            isBeakerFull && wordRevealPhase === 0 ? "pg-beaker--complete" : "",
                            wordRevealPhase >= 1 ? "pg-beaker--transforming" : "",
                          ].filter(Boolean).join(" ")}
                        >
                          <div className="pg-beaker__highlight" />
                          <div className="pg-beaker__ticks" />

                          <div className={`pg-beaker__liquid pg-liquid--${liqClass}`}>
                            {bubbles.map((b, i) => (
                              <div
                                key={i}
                                className="pg-bubble"
                                style={{
                                  left: b.x,
                                  width: `${b.size}px`,
                                  height: `${b.size}px`,
                                  background: b.color,
                                  ["--del" as string]: b.delay,
                                  ["--dur" as string]: b.dur,
                                }}
                              />
                            ))}
                          </div>

                          {wordRevealPhase > 0 && (
                            <div
                              className={`pg-word-reveal${wordRevealPhase >= 2 ? " pg-word-reveal--visible" : ""}`}
                            >
                              <WordImage imageKey={currentWord.imageKey} size={62} />
                            </div>
                          )}

                          {isBeakerFull && (
                            <div className="pg-sparkle-ring">
                              {Array.from({ length: 8 }, (_, i) => (
                                <div
                                  key={i}
                                  className="pg-sparkle"
                                  style={{
                                    ["--sa" as string]: `${i * 45}deg`,
                                    ["--sd" as string]: `${(i * 0.09).toFixed(2)}s`,
                                  }}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="pg-beaker-stand" />
                      </div>

                      {/* Potion bottles */}
                      <div className="pg-bottles-row">
                        {availableTiles.map((tile, idx) => {
                          const color    = bottleColors.get(tile.id) ?? BOTTLE_COLORS[0];
                          const isPouring = pouringTileId === tile.id;
                          const isWrong   = wrongTileId   === tile.id;
                          const isCorrectForNext =
                            nextEmptySlot >= 0 &&
                            tile.letter.toLowerCase() ===
                              currentWord.letters[nextEmptySlot].toLowerCase();
                          const showSubtleHint = slotAttempts >= 3 && slotAttempts < 5 && isCorrectForNext;
                          const showStrongHint = slotAttempts >= 5 && isCorrectForNext;
                          return (
                            <button
                              key={tile.id}
                              className={[
                                "pg-bottle",
                                isPouring ? "pg-bottle--pouring" : "",
                                isWrong   ? "pg-bottle--wrong"   : "",
                                showSubtleHint ? "pg-bottle--subtle-hint" : "",
                                showStrongHint ? "pg-bottle--strong-hint" : "",
                              ]
                                .filter(Boolean)
                                .join(" ")}
                              style={{
                                ["--bc" as string]: color,
                                ["--bi" as string]: idx,
                                ...(isPouring
                                  ? { ["--pour-deg" as string]: pourSide === "right" ? "60deg" : "-60deg" }
                                  : {}),
                              }}
                              onClick={() => handleTileTap(tile, idx, availableTiles.length)}
                              aria-label={`Bottle ${tile.letter.toUpperCase()}`}
                            >
                              <div className="pg-bottle__cork" />
                              <div className="pg-bottle__neck" />
                              <div className="pg-bottle__body">
                                <div className="pg-bottle__liquid" />
                                <div className="pg-bottle__bubble" />
                                <span className="pg-bottle__letter">
                                  {tile.letter.toUpperCase()}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Professor WiggleWoo */}
                  <div className={`pg-professor pg-professor--${profState}`}>
                    <img src={profSrc} alt="Professor WiggleWoo" draggable={false} />
                  </div>
                </>
              )}

            </div>
          </div>

        </div>
      </div>
      {/* end map-window */}

      {/* ── Blue Gameplay Chalkboard overlay zone ──
          All modal / lesson screens render here, bounded to the Blue Gameplay Chalkboard.
          Each overlay component uses position:absolute;inset:0 and fills this div,
          which is sized and clipped to the Blue Gameplay Chalkboard inner bounds. */}
      {(step === "celebrate" ||
        step === "lesson-intro" ||
        step === "say-cue" ||
        step === "mastery-unlock" ||
        step === "parent-prompt") && (
        <div className="pg-overlay-zone">
          {step === "celebrate" && (
            <CelebrationOverlay
              type={getCelebrationTypeForWord(currentWordIndex, quest.words.length)}
              onComplete={handleCelebrationComplete}
              wordsComplete={currentWordIndex + 1}
              totalWords={quest.words.length}
              word={currentWord.word}
              rating={
                incorrectCount === 0
                  ? "perfect"
                  : incorrectCount <= 2
                  ? "clean"
                  : "assisted"
              }
            />
          )}
          {step === "lesson-intro" && (
            <LessonObjectiveCard
              lessonIndex={getLessonIndex(currentWordIndex)}
              questTitle={quest.title}
              exampleWord={currentWord}
              onContinue={handleLessonIntroComplete}
            />
          )}
          {step === "say-cue" && (
            <SayItOutLoudCue
              word={currentWord.word}
              onDismiss={handleSayCueDismiss}
            />
          )}
          {step === "mastery-unlock" && (
            <MasteryBadgeUnlock
              lessonIndex={getLessonIndex(currentWordIndex)}
              focusLabel={getFocusLabel(quest.title)}
              onContinue={handleMasteryUnlockComplete}
            />
          )}
          {step === "parent-prompt" && (
            <ParentPrompt
              prompt={getParentPrompt(
                questIdToVowelId(quest.id),
                getLessonIndex(currentWordIndex),
              )}
              onDismiss={handleParentPromptDismiss}
            />
          )}
        </div>
      )}

      {/* ── Green Teaching Chalkboard — TraceMoment renders on the expanded desk easel during trace-prep ── */}
      {step === "trace-prep" && traceLetter && (
        <TraceMoment
          letter={traceLetter}
          caption={`for ${currentWord.word.toUpperCase()}`}
          onComplete={handleTracePrepComplete}
          onSkip={handleTracePrepComplete}
        />
      )}

      {/* ── Practice trace back button — only shown when trace was opened voluntarily ── */}
      {step === "trace-prep" && isPracticeTrace && (
        <button
          className="pg-trace-back-btn"
          onClick={handleTracePrepComplete}
          aria-label="Go back to game"
        >
          ✕
        </button>
      )}

      {/* ── Hanging light — centered at top of lab scene ── */}
      <img
        src="/assets/hanging-light.png"
        alt=""
        className="pg-hanging-light"
        draggable={false}
      />

      {/* ── Bookshelf — mounted on top-right wall ── */}
      <div className="pg-bookshelf" aria-hidden="true">
        <img src="/assets/books-horizontally.png" alt="" className="pg-bookshelf__books" draggable={false} />
        <div className="pg-bookshelf__plank" />
        <div className="pg-bookshelf__brackets">
          <div className="pg-bookshelf__bracket" />
          <div className="pg-bookshelf__bracket" />
        </div>
      </div>

      {/* ── Vertical books — bottom-right corner ── */}
      <img src="/assets/books-vertically.png" alt="" className="pg-books--vertical" draggable={false} />

      {/* ── Potion shelf — mounted on left wall ── */}
      <div className="pg-potion-shelf" aria-hidden="true">
        <div className="pg-potion-shelf__row">
          <img src="/assets/red-potion.png"    alt="" className="pg-shelf-potion" draggable={false} />
          <img src="/assets/blue-potion.png"   alt="" className="pg-shelf-potion" draggable={false} />
          <img src="/assets/purple-potion.png" alt="" className="pg-shelf-potion" draggable={false} />
          <img src="/assets/gold-potion.png"   alt="" className="pg-shelf-potion" draggable={false} />
          <img src="/assets/green-potion.png"  alt="" className="pg-shelf-potion" draggable={false} />
        </div>
        <div className="pg-potion-shelf__plank" />
        <div className="pg-potion-shelf__brackets">
          <div className="pg-potion-shelf__bracket" />
          <div className="pg-potion-shelf__bracket" />
        </div>
      </div>

      {/* ── Green Teaching Chalkboard — desk easel; clickable for voluntary letter practice ── */}
      <div
        className={`pg-green-chalkboard${step === "trace-prep" ? " pg-green-chalkboard--active" : ""}`}
        onClick={handlePracticeBoardClick}
        role={traceLetter && step === "build" ? "button" : undefined}
        aria-label={traceLetter && step === "build" ? "Practice tracing letters" : undefined}
        tabIndex={traceLetter && step === "build" ? 0 : -1}
      >
        <img
          src="/assets/green-chalk-board.png"
          alt=""
          className="pg-green-chalkboard__img"
          draggable={false}
        />
        {traceLetter && step !== "trace-prep" && (
          <span className="pg-green-chalkboard__cta" aria-hidden="true">
            Trace the letter
          </span>
        )}
      </div>

      {/* ── Desk potions — clustered by the bottom-right books ── */}
      <img src="/assets/dark-purple-potion.png"  alt="" className="pg-desk-potion pg-desk-potion--1" draggable={false} />
      <img src="/assets/golden-honey-potion.png" alt="" className="pg-desk-potion pg-desk-potion--2" draggable={false} />
      <img src="/assets/green-leaf-potion.png"   alt="" className="pg-desk-potion pg-desk-potion--3" draggable={false} />
      <img src="/assets/love-potion.png"         alt="" className="pg-desk-potion pg-desk-potion--4" draggable={false} />
      <img src="/assets/teal-potion.png"         alt="" className="pg-desk-potion pg-desk-potion--5" draggable={false} />

      {/* ── Outer machine decorations ── */}
      <img src={gear2} alt="" className="bg-gear bg-gear-1" draggable={false} />
      <img src={gear3} alt="" className="bg-gear bg-gear-2" draggable={false} />
      <img src={gear2} alt="" className="bg-gear bg-gear-3" draggable={false} />
      <img src={gear3} alt="" className="bg-gear bg-gear-4" draggable={false} />
      <img src={gear3} alt="" className="bg-gear bg-gear-5" draggable={false} />
      <img src={gear2} alt="" className="bg-gear bg-gear-6" draggable={false} />
      <img src={gear3} alt="" className="bg-gear bg-gear-7" draggable={false} />
      <img src={gear2} alt="" className="bg-gear bg-gear-8" draggable={false} />

      <img src={machine2} alt="" className="home-machine home-machine-left"  draggable={false} />
      <img src={gear1}    alt="" className="home-gear home-gear-left"         draggable={false} />
      <img src={pipe1}    alt="" className="home-pipe home-pipe-left"         draggable={false} />
      <img src={pipe2}    alt="" className="home-pipe home-pipe-bottom"       draggable={false} />

      <div className="home-machine-right-wrap">
        <img src={machine1}  alt="" className="home-machine home-machine-right" draggable={false} />
        <img src={gaugeImg}  alt="" className="home-gauge-face"                 draggable={false} />
        <div className="home-needle-wrap">
          <img src={needleImg} alt="" className="home-gauge-needle" draggable={false} />
        </div>
      </div>

      <img
        src="/assets/word-lab-logo.png"
        alt="WiggleWoo's Word Quest — Go Home"
        className="title-badge title-badge--clickable"
        draggable={false}
        onClick={onGoHome}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && onGoHome?.()}
      />
    </div>
  );
};

export default PotionGameScreen;
