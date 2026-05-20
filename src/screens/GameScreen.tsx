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

import { buildLetterBank } from "../game/state";
import { getCelebrationTypeForWord } from "../game/triggers";
import {
  recordCorrectPlacement,
  recordNodeComplete,
  recordTimeSpent,
} from "../game/analytics";
import { recordWordCompletion } from "../game/learningAnalytics";
import { questIdToVowelId } from "../game/wordData";
import {
  playLetterSound,
  playWordSound,
  playEvent,
  playSuccessPhrase,
  waitForLetterDone,
  waitForWordDone,
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
import { getActiveSkinAssets } from "../game/skins";
import LessonObjectiveCard from "../components/LessonObjectiveCard";
import MasteryBadgeUnlock from "../components/MasteryBadgeUnlock";
import SayItOutLoudCue from "../components/SayItOutLoudCue";
import ParentPrompt from "../components/ParentPrompt";
import TraceMoment from "../components/handwriting/TraceMoment";
import { LETTER_PATHS } from "../components/handwriting/letterPaths";
import { getParentPrompt } from "../game/parentPrompts";
import "../styles/game.css";
import "../styles/questmap.css";
import "../styles/home.css";

/** "Sound Builders: Short A" → "Short A" so the mastery card focus
 *  matches the lesson intro card. */
function getFocusLabel(questTitle: string): string {
  const colon = questTitle.lastIndexOf(":");
  return colon >= 0 ? questTitle.slice(colon + 1).trim() : questTitle;
}

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

/** Step machine:
 *  - lesson-intro:   start of each lesson (words 0/4/8/12)
 *  - trace-prep:     letter trace before build, on word-3 of a lesson
 *                    (indices 2/6/10/14). Uses the existing TraceMoment
 *                    overlay; letter rotates 1st / vowel / last / vowel
 *                    across the 4 lessons of a quest.
 *  - say-cue:        "say it out loud" prompt, fires after the audio
 *                    model on the FIRST word of each lesson (0/4/8/12)
 *                    so the kid vocalizes the target before tapping
 *                    tiles. Auto-dismiss after 2.5s.
 *  - build:          the existing tap-to-place letter mechanic
 *  - celebrate:      per-word "yay!" overlay (existing CelebrationOverlay)
 *  - mastery-unlock: silver-star badge after a mastery-check word
 *                    (3/7/11/15) before any quest-level navigation
 */
type GameStep =
  | "lesson-intro"
  | "trace-prep"
  | "say-cue"
  | "build"
  | "celebrate"
  | "mastery-unlock"
  | "parent-prompt";

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

  // Build the full letter bank — all correct letters + phonetic distractors
  const letterBank: LetterTile[] = useMemo(() => {
    return buildLetterBank(currentWord, quest.patternType);
  }, [currentWord, quest.patternType]);

  // Active skin's helper asset for the bottom-right companion. Falls
  // back to the default WiggleWoo helper PNG when no themed skin is
  // active (e.g. before the first discovery room is completed).
  const skinAssets = useMemo(() => getActiveSkinAssets(), []);

  // ---- Step state ----
  // Initial step is the first overlay we owe the kid before "build":
  //   word 0/4/8/12 → lesson-intro (then later say-cue after audio model)
  //   word 2/6/10/14 → trace-prep   (when a valid letter is available)
  //   everything else → build
  const isMasteryWord = isMasteryCheckWord(currentWordIndex);
  const showLessonIntro = isLessonStart(currentWordIndex);
  const lessonIndex = getLessonIndex(currentWordIndex);
  // The letter to trace on word-3 of this lesson. null when the chosen
  // letter has no path data — caller falls back to "build" without a trace.
  const traceLetter = useMemo<string | null>(() => {
    if (!isTracePrepWord(currentWordIndex)) return null;
    const candidate = getTraceLetterForWord(lessonIndex, currentWord.letters);
    if (!candidate) return null;
    return LETTER_PATHS[candidate] ? candidate : null;
  }, [currentWordIndex, lessonIndex, currentWord.letters]);
  const [step, setStep] = useState<GameStep>(() => {
    if (showLessonIntro) return "lesson-intro";
    if (isTracePrepWord(currentWordIndex)) {
      const candidate = getTraceLetterForWord(lessonIndex, currentWord.letters);
      if (candidate && LETTER_PATHS[candidate]) return "trace-prep";
    }
    return "build";
  });
  const [filledSlots, setFilledSlots] = useState<(string | null)[]>(
    () => Array(wordLength).fill(null)
  );
  const [usedTileIds, setUsedTileIds] = useState<Set<string>>(new Set());
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [slotAttempts, setSlotAttempts] = useState(0); // wrong attempts on current slot
  const [shakingTileId, setShakingTileId] = useState<string | null>(null);
  const [lockedOut, setLockedOut] = useState(false); // 0.8s lockout after wrong tap
  const [imageRevealed, setImageRevealed] = useState(false); // delayed image reveal
  const nodeStartTime = useRef(Date.now());

  // Available tiles (not yet placed)
  const availableTiles = useMemo(() =>
    letterBank.filter((t) => !usedTileIds.has(t.id)),
    [letterBank, usedTileIds]
  );

  // ---- Speaker / audio replay state ----
  const [audioActive, setAudioActive] = useState(false);
  const audioTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const handleSpeakerTap = useCallback(() => {
    // Replay the target word — useful at any point (mid-build or after)
    playWordSound(currentWord.word);
    setAudioActive(true);
    if (audioTimeoutRef.current) clearTimeout(audioTimeoutRef.current);
    audioTimeoutRef.current = setTimeout(() => setAudioActive(false), 1200);
  }, [currentWord.word]);

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

  // Speak the target word on first mount so the child hears what to build.
  // Plays on every word INCLUDING mastery checks (3/7/11/15) — the kid
  // hears the target once, then has to recall the spelling independently
  // (no hand-pointer hint, no say-cue follow-up on mastery words). The
  // ★ Mastery Check pill in the top bar still signals "this one's on you".
  //
  // Deferred until the lesson-intro AND trace-prep overlays are dismissed
  // so the model audio doesn't play underneath those screens.
  //
  // Lesson-opener words (0/4/8/12) chain the audio model into the say-cue
  // overlay so the kid vocalizes the word before tapping tiles.
  const hasPlayedPrompt = useRef(false);
  const sayCueTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const audioStartTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
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
      // On lesson openers (non-mastery) follow the audio with the say-cue.
      // Mastery words skip the cue — independent recall, no vocalization
      // prompt — just the model audio + the marker pill.
      if (isLessonStart(currentWordIndex) && !isMasteryWord) {
        sayCueTimerRef.current = setTimeout(() => setStep("say-cue"), 1400);
      }
    }, 800);
  }, [step, isMasteryWord, currentWord.word, currentWordIndex]);

  useEffect(() => {
    return () => {
      if (sayCueTimerRef.current) clearTimeout(sayCueTimerRef.current);
      if (audioStartTimerRef.current) clearTimeout(audioStartTimerRef.current);
    };
  }, []);

  // ---- Step 1: Tap-to-place ----
  const nextEmptySlot = useMemo(() => {
    return filledSlots.findIndex((s) => s === null);
  }, [filledSlots]);

  const handleTileTap = useCallback((tile: LetterTile) => {
    if (step !== "build" || shakingTileId || lockedOut) return;
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
      setUsedTileIds((prev) => new Set(prev).add(tile.id));
      setSlotAttempts(0);
      // Reveal image on first correct letter (word already spoken on mount)
      if (!imageRevealed) {
        setImageRevealed(true);
      }
      recordCorrectPlacement(quest.id, quest.patternType, currentWordIndex, currentWord.word);

      const allFilled = newSlots.every((s) => s !== null);
      if (allFilled) {
        setStep("celebrate");
      }
    } else {
      // Wrong letter — shake tile, lockout for 0.8s
      setIncorrectCount((c) => c + 1);
      const nextAttempts = slotAttempts + 1;
      setSlotAttempts(nextAttempts);
      setShakingTileId(tile.id);
      setLockedOut(true);
      // Escalating feedback: 1st gentle, 2nd almost, 3rd+ hint
      if (nextAttempts === 1) playEvent("wrong-gentle");
      else if (nextAttempts === 2) playEvent("wrong-almost");
      else playEvent("wrong-hint");
      setTimeout(() => setShakingTileId(null), 500);
      setTimeout(() => setLockedOut(false), 800);
    }
  }, [step, filledSlots, currentWord, quest.id, quest.patternType, currentWordIndex, shakingTileId, lockedOut, imageRevealed]);

  // ---- Step 2: Celebration ----
  useEffect(() => {
    if (step === "celebrate") {
      // Wait for the final letter phoneme to finish so it isn't cut off,
      // then speak the whole word, then the celebration VO.
      // Per-word completions pull from the 12-phrase SUCCESS_PHRASES pool
      // (anti-repeat) for variety. The quest-complete milestone keeps its
      // dedicated event slug.
      const isLastInQuest = currentWordIndex === quest.words.length - 1;
      // Sequence: final phoneme → word VO → celebration. Use waitForWordDone
      // so the word ("cat") fully finishes before the celebration plays —
      // they live on different channels and would otherwise overlap audibly
      // when the word VO runs >900ms.
      waitForLetterDone().then(() => {
        playWordSound(currentWord.word);
        waitForWordDone().then(() => {
          if (isLastInQuest) playEvent("celebrate-quest-complete");
          else playSuccessPhrase();
        });
      });

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

      // Lesson mastery — completing the mastery-check word (3/7/11/15)
      // earns the silver-star badge for that lesson. Any completion
      // counts in Phase A; later phases can tighten this to require
      // a "perfect" rating if educators want stricter assessment.
      if (isMasteryWord) {
        recordLessonMastery(quest.id, getLessonIndex(currentWordIndex));
      }

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

  // ---- Celebration complete → mastery unlock (if applicable) → navigate ----
  // Mastery-check words detour through the silver-star unlock screen
  // before any quest-level routing. handleMasteryUnlockComplete picks
  // up the navigation once the kid taps "Keep Going!".
  const navigateAfterWord = useCallback(() => {
    const celebType = getCelebrationTypeForWord(currentWordIndex, quest.words.length);
    if (celebType === "quest-complete") {
      onNavigate("quest-summary");
    } else {
      onNavigate("quest-map");
    }
  }, [currentWordIndex, onNavigate, quest.words.length]);

  const handleCelebrationComplete = useCallback(() => {
    if (isMasteryWord) {
      setStep("mastery-unlock");
      return;
    }
    navigateAfterWord();
  }, [isMasteryWord, navigateAfterWord]);

  const handleMasteryUnlockComplete = useCallback(() => {
    // After the silver-star badge, surface the home-extension prompt
    // before any quest-level routing. Falls through to navigation when
    // dismissed. This is Phase C: parent prompts after each mastery
    // check so educators / parents get a per-lesson conversation hook.
    setStep("parent-prompt");
  }, []);

  const handleParentPromptDismiss = useCallback(() => {
    navigateAfterWord();
  }, [navigateAfterWord]);

  const handleLessonIntroComplete = useCallback(() => {
    // After the kid taps Let's Go on the intro card, route to the right
    // pre-build step for this word. Trace-prep words drop straight into
    // the trace overlay before the build screen renders.
    if (
      isTracePrepWord(currentWordIndex)
      && traceLetter
    ) {
      setStep("trace-prep");
    } else {
      setStep("build");
    }
  }, [currentWordIndex, traceLetter]);

  const handleTracePrepComplete = useCallback(() => {
    setStep("build");
  }, []);

  const handleSayCueDismiss = useCallback(() => {
    setStep("build");
  }, []);


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
            {isMasteryWord && (
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

                {/* ========== STEP 1: BUILD ==========
                    Build group also renders during the say-cue step so
                    the overlay layers on top of the visible image + word
                    slots. handleTileTap guards against non-"build" step
                    so tiles are visibly present but un-tappable while
                    the cue is on screen. */}
                {(step === "build" || step === "say-cue") && (
                  <div className="build-group">
                    {/* Target image — only for "image" mode words */}
                    {(currentWord.mode ?? "image") === "image" && (
                      <div className="target-image-area">
                        <WordImage imageKey={currentWord.imageKey} size={wordLength <= 3 ? 115 : 96} />
                      </div>
                    )}

                    {/* Decode mode — phoneme segmentation (disabled until voiceovers ready)
                    {enablePhonemeMode && (currentWord.mode ?? "image") !== "image" && (
                      <div className="decode-segmentation">
                        {currentWord.letters.map((letter, i) => (
                          <span key={i} className="decode-segmentation__letter">
                            {letter.toLowerCase()}
                            {i < currentWord.letters.length - 1 && (
                              <span className="decode-segmentation__dot"> · </span>
                            )}
                          </span>
                        ))}
                      </div>
                    )} */}

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
                              isNext && lockedOut ? "word-slot--lockout-pulse" : "",
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

                    {/* Letter bank — full word letters + distractors */}
                    <div className="letter-bank">
                      {availableTiles.map((tile) => {
                        const slotIdx = filledSlots.findIndex((s) => s === null);
                        const isCorrect = slotIdx >= 0 && tile.letter.toLowerCase() === currentWord.letters[slotIdx].toLowerCase();
                        const showSubtleHint = slotAttempts >= 3 && slotAttempts < 5 && isCorrect;
                        const showStrongHint = slotAttempts >= 5 && isCorrect;
                        const isShaking = shakingTileId === tile.id;
                        return (
                          <button
                            key={tile.id}
                            className={[
                              "letter-tile",
                              showSubtleHint ? "letter-tile--subtle-hint" : "",
                              showStrongHint ? "letter-tile--hinted" : "",
                              isShaking ? "letter-tile--wrong-shake" : "",
                            ].filter(Boolean).join(" ")}
                            onClick={() => handleTileTap(tile)}
                            style={{ cursor: "pointer", touchAction: "manipulation" }}
                            aria-label={`Letter ${tile.letter.toUpperCase()}`}
                          >
                            {tile.letter.toUpperCase()}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}


              </div>
            </div>

            {/* WiggleWoo helper — companion in the bottom-right of the
                gameplay viewport. Idle bob always; bigger celebrate
                bounce when the word is solved (step === "celebrate"). */}
            <div
              className={`game-screen__helper ${step === "celebrate" ? "game-screen__helper--celebrate" : ""}`}
              aria-hidden="true"
            >
              <img
                src={skinAssets.helperImg}
                alt=""
                className="game-screen__helper-img"
                draggable={false}
              />
            </div>
          </div>

          {/* ========== STEP 2: CELEBRATION ========== */}
          {step === "celebrate" && (
            <CelebrationOverlay
              type={getCelebrationTypeForWord(currentWordIndex, quest.words.length)}
              onComplete={handleCelebrationComplete}
              wordsComplete={currentWordIndex + 1}
              totalWords={quest.words.length}
              word={currentWord.word}
              rating={incorrectCount === 0 ? "perfect" : incorrectCount <= 2 ? "clean" : "assisted"}
            />
          )}

          {/* ========== LESSON INTRO (words 0/4/8/12) ========== */}
          {step === "lesson-intro" && (
            <LessonObjectiveCard
              lessonIndex={getLessonIndex(currentWordIndex)}
              questTitle={quest.title}
              exampleWord={currentWord}
              onContinue={handleLessonIntroComplete}
            />
          )}

          {/* ========== TRACE PREP (word-3 of each lesson) ==========
              The trace overlay re-uses the Discovery-Room trace
              component, without the prop sprite — the kid just sees a
              clean letter to trace. A caption keeps word context
              ("for CAT") so they remember which word the letter
              belongs to. onSkip mirrors onComplete so a stuck kid can
              still progress past it. */}
          {step === "trace-prep" && traceLetter && (
            <TraceMoment
              letter={traceLetter}
              caption={`for ${currentWord.word.toUpperCase()}`}
              onComplete={handleTracePrepComplete}
              onSkip={handleTracePrepComplete}
            />
          )}

          {/* ========== SAY-IT-OUT-LOUD CUE (after audio on lesson openers) ========== */}
          {step === "say-cue" && (
            <SayItOutLoudCue
              word={currentWord.word}
              onDismiss={handleSayCueDismiss}
            />
          )}

          {/* ========== MASTERY UNLOCK (after words 3/7/11/15) ========== */}
          {step === "mastery-unlock" && (
            <MasteryBadgeUnlock
              lessonIndex={getLessonIndex(currentWordIndex)}
              focusLabel={getFocusLabel(quest.title)}
              onContinue={handleMasteryUnlockComplete}
            />
          )}

          {/* ========== PARENT PROMPT (after every mastery unlock) ==========
              One conversational tip + ask-at-home question. Default-
              shown, single Got it tap dismisses. Copy is keyed by the
              quest's vowel + lesson index so the prompts shift across
              the four lessons of a quest (listen / build / trace /
              read superpower). */}
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
