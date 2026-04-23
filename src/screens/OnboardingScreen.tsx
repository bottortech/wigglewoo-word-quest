// =============================================
// OnboardingScreen.tsx — First-time guided intro
// WiggleWoo's Word Quest
// =============================================
// Hand-pointer demo for the word CAT.
// Flow (mixed mode):
//   intro (~3s welcome VO) →
//   demo C: hand glides to C, auto-taps, phoneme, slot fills →
//   your turn A: hand points to A, child taps →
//   your turn T: hand points to T, child taps →
//   done: word spoken + "Let's Go!" button
// Wrong tap during "your turn" steps: shake tile, briefly hide
// hand, re-show on correct tile after 2s. No skip (v1).
// =============================================

import { useState, useCallback, useEffect, useRef, useLayoutEffect } from "react";
import WordImage from "../components/WordImage";
import { playLetterSound, playEvent, playWordSound, waitForLetterDone } from "../audio/SoundEffects";
import "../styles/onboarding.css";

interface OnboardingScreenProps {
  onComplete: () => void;
}

const DEMO_WORD = "cat";
const DEMO_LETTERS = ["c", "a", "t"] as const;
const DEMO_IMAGE = "cat";

/** Tile bank — three letters, always in the same order so the hand's
 *  target position stays predictable between slots. */
const TILES = ["c", "a", "t"];

type Step = "intro" | "active" | "done";
type Mode = "demo" | "user";

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const [step, setStep] = useState<Step>("intro");
  const [slotIndex, setSlotIndex] = useState(0);
  const [filledSlots, setFilledSlots] = useState<(string | null)[]>([null, null, null]);
  const [shakingId, setShakingId] = useState<string | null>(null);
  const [instruction, setInstruction] = useState("Welcome to WiggleWoo's Word Quest!");

  // Hand pointer
  const [handCoords, setHandCoords] = useState<{ x: number; y: number } | null>(null);
  const [handVisible, setHandVisible] = useState(false);
  const [handTapping, setHandTapping] = useState(false);

  const tileRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const demoTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const mode: Mode = slotIndex === 0 ? "demo" : "user";
  const correctLetter = DEMO_LETTERS[slotIndex] ?? "";

  // ---- Move the hand to hover just below the correct tile ----
  const moveHandToCorrect = useCallback(() => {
    const idx = TILES.indexOf(correctLetter);
    const el = tileRefs.current[idx];
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setHandCoords({
      x: rect.left + rect.width / 2 - 24,
      y: rect.bottom - 8,
    });
    setHandVisible(true);
  }, [correctLetter]);

  // ---- Intro: welcome VO, auto-advance ----
  useEffect(() => {
    if (step !== "intro") return;
    playEvent("onboard-intro");
    const t = setTimeout(() => setStep("active"), 3000);
    return () => clearTimeout(t);
  }, [step]);

  // ---- Per-slot prompt text ----
  useEffect(() => {
    if (step !== "active" || slotIndex > 2) return;
    const prompts = [
      "Watch! I'll show you how to spell CAT.",
      "Your turn — tap the A!",
      "Last one — tap the T!",
    ];
    setInstruction(prompts[slotIndex]);
  }, [slotIndex, step]);

  // ---- Position the hand after every slot / step change ----
  useLayoutEffect(() => {
    if (step !== "active") return;
    // Slight delay so layout + any state-driven style changes settle
    const t = setTimeout(moveHandToCorrect, 250);
    return () => clearTimeout(t);
  }, [step, slotIndex, moveHandToCorrect]);

  // ---- Re-position hand on window resize ----
  useEffect(() => {
    if (step !== "active") return;
    const onResize = () => moveHandToCorrect();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [step, moveHandToCorrect]);

  // ---- DEMO slot (slot 0): auto-tap sequence ----
  useEffect(() => {
    if (step !== "active" || mode !== "demo") return;
    if (filledSlots[slotIndex] !== null) return;

    // After the hand glides in (~1s) and a brief pause, run the tap animation
    // and fill the slot. Then after another beat, hand off to user mode.
    const tTap = setTimeout(() => {
      setHandTapping(true);
      playLetterSound(correctLetter);
      setFilledSlots((prev) => {
        const next = [...prev];
        next[slotIndex] = correctLetter;
        return next;
      });
      const tReset = setTimeout(() => setHandTapping(false), 320);
      demoTimersRef.current.push(tReset);
      const tAdvance = setTimeout(() => setSlotIndex(1), 1100);
      demoTimersRef.current.push(tAdvance);
    }, 1500);
    demoTimersRef.current.push(tTap);

    return () => {
      demoTimersRef.current.forEach(clearTimeout);
      demoTimersRef.current = [];
    };
  }, [step, mode, slotIndex, filledSlots, correctLetter]);

  // ---- Tile tap (user mode only) ----
  const handleTileTap = useCallback((letter: string, tileId: string) => {
    if (step !== "active" || mode !== "user" || shakingId) return;

    playLetterSound(letter);

    if (letter === correctLetter) {
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
      setFilledSlots((prev) => {
        const next = [...prev];
        next[slotIndex] = letter;
        return next;
      });

      const nextSlot = slotIndex + 1;
      if (nextSlot >= 3) {
        // Brief pause so the last letter phoneme isn't clobbered by the word VO
        setTimeout(() => setStep("done"), 500);
      } else {
        // Hand stays visible, useLayoutEffect will re-position on the next slot
        setTimeout(() => setSlotIndex(nextSlot), 450);
      }
    } else {
      // Wrong — shake the tile, hide the hand, re-show it on the correct tile after 2s
      setShakingId(tileId);
      setHandVisible(false);
      setTimeout(() => setShakingId(null), 400);
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
      retryTimerRef.current = setTimeout(() => {
        moveHandToCorrect();
      }, 2000);
    }
  }, [step, mode, slotIndex, correctLetter, shakingId, moveHandToCorrect]);

  // ---- Done: speak the word after the final phoneme settles ----
  useEffect(() => {
    if (step !== "done") return;
    setInstruction("You spelled CAT! Great job!");
    setHandVisible(false);
    playEvent("onboard-first-complete");
    let cancelled = false;
    waitForLetterDone().then(() => {
      if (!cancelled) playWordSound(DEMO_WORD);
    });
    return () => { cancelled = true; };
  }, [step]);

  // ---- Cleanup on unmount ----
  useEffect(() => {
    return () => {
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
      demoTimersRef.current.forEach(clearTimeout);
    };
  }, []);

  return (
    <div className="onboarding">
      <div className="onboarding__content">
        <div className="onboarding__instruction">{instruction}</div>

        <div className="onboarding__image">
          <WordImage imageKey={DEMO_IMAGE} size={120} />
        </div>

        <div className="onboarding__slots">
          {DEMO_LETTERS.map((_, i) => {
            const filled = filledSlots[i];
            const isActive = i === slotIndex && step === "active";
            return (
              <div
                key={i}
                className={[
                  "onboarding__slot",
                  filled ? "onboarding__slot--filled" : "",
                  isActive ? "onboarding__slot--active" : "",
                ].filter(Boolean).join(" ")}
              >
                {filled ? filled.toUpperCase() : ""}
              </div>
            );
          })}
        </div>

        {step === "active" && (
          <div className="onboarding__choices">
            {TILES.map((letter, i) => {
              const tileId = `tile-${i}`;
              const isShaking = shakingId === tileId;
              return (
                <button
                  key={tileId}
                  ref={(el) => { tileRefs.current[i] = el; }}
                  className={[
                    "onboarding__tile",
                    isShaking ? "onboarding__tile--shake" : "",
                  ].filter(Boolean).join(" ")}
                  onClick={() => handleTileTap(letter, tileId)}
                  disabled={mode === "demo"}
                  aria-label={`Letter ${letter.toUpperCase()}`}
                >
                  {letter.toUpperCase()}
                </button>
              );
            })}
          </div>
        )}

        {step === "done" && (
          <div className="onboarding__done">
            <div className="onboarding__word-reveal">CAT</div>
            <button
              className="onboarding__continue"
              onClick={onComplete}
              autoFocus
            >
              Let's Go!
            </button>
          </div>
        )}
      </div>

      {/* Hand pointer — glides to the correct tile, auto-taps in demo mode */}
      {handVisible && handCoords && (
        <div
          className="onboarding__hand"
          style={{ transform: `translate(${handCoords.x}px, ${handCoords.y}px)` }}
          aria-hidden="true"
        >
          <span className={`onboarding__hand-inner ${handTapping ? "onboarding__hand-inner--tapping" : ""}`}>
            👆
          </span>
        </div>
      )}
    </div>
  );
};

export default OnboardingScreen;
