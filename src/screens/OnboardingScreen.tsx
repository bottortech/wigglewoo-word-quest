// =============================================
// OnboardingScreen.tsx — First-time guided intro
// WiggleWoo's Word Quest
// =============================================
// Walks a new player through building "CAT" with
// heavy guidance: TTS instructions, highlighted
// correct letters, dimmed wrong ones, pulsing
// slot indicator. Only shown once.
// =============================================

import { useState, useCallback, useEffect, useRef } from "react";
import WordImage from "../components/WordImage";
import { playLetterSound, playSuccessPhrase } from "../audio/SoundEffects";
import "../styles/onboarding.css";

interface OnboardingScreenProps {
  onComplete: () => void;
}

// The demo word
const DEMO_LETTERS = ["c", "a", "t"];
const DEMO_IMAGE = "cat";

// Distractors per slot (wrong choices alongside the correct one)
const SLOT_DISTRACTORS: string[][] = [
  ["d", "m"],   // slot 0: c + d, m
  ["o", "i"],   // slot 1: a + o, i
  ["p", "n"],   // slot 2: t + p, n
];

type OnboardingStep = "intro" | "build" | "done";

// TTS disabled — will be replaced with voice actor recordings
function speak(_text: string) {
  // No-op
}

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const [step, setStep] = useState<OnboardingStep>("intro");
  const [slotIndex, setSlotIndex] = useState(0);
  const [filledSlots, setFilledSlots] = useState<(string | null)[]>([null, null, null]);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [shakingId, setShakingId] = useState<string | null>(null);
  const [instruction, setInstruction] = useState("Welcome to WiggleWoo's Word Quest!");
  const doneTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Intro sequence
  useEffect(() => {
    if (step === "intro") {
      speak("Welcome to Wiggle Woo's Word Quest! Let's learn how to build a word together.");
      setInstruction("Welcome to WiggleWoo's Word Quest!");
      const t = setTimeout(() => {
        setStep("build");
        setInstruction("This is a cat. Let's spell it! Tap the letter that makes the \"k\" sound.");
        speak("This is a cat. Let's spell it! Tap the letter that makes the kuh sound.");
      }, 3500);
      return () => clearTimeout(t);
    }
  }, [step]);

  // Prompt for each slot
  useEffect(() => {
    if (step !== "build") return;
    const prompts = [
      { text: "Tap the letter that makes the \"k\" sound.", tts: "Tap the letter that makes the kuh sound." },
      { text: "Now tap the letter that makes the \"a\" sound.", tts: "Now tap the letter that makes the ah sound." },
      { text: "Last one! Tap the letter that makes the \"t\" sound.", tts: "Last one! Tap the letter that makes the tuh sound." },
    ];
    if (slotIndex < 3) {
      setInstruction(prompts[slotIndex].text);
      speak(prompts[slotIndex].tts);
    }
  }, [slotIndex, step]);

  // Build choices for current slot
  const choices = slotIndex < 3 ? (() => {
    const correct = DEMO_LETTERS[slotIndex];
    const distractors = SLOT_DISTRACTORS[slotIndex];
    const all = [correct, ...distractors];
    // Simple deterministic shuffle based on slot index
    if (slotIndex === 0) return [all[1], all[0], all[2]]; // d, c, m
    if (slotIndex === 1) return [all[0], all[2], all[1]]; // a, i, o
    return [all[2], all[0], all[1]]; // n, t, p
  })() : [];

  const handleTileTap = useCallback((letter: string, tileId: string) => {
    if (step !== "build" || shakingId || slotIndex >= 3) return;

    playLetterSound(letter);
    const correct = letter.toLowerCase() === DEMO_LETTERS[slotIndex].toLowerCase();

    if (correct) {
      const newSlots = [...filledSlots];
      newSlots[slotIndex] = letter;
      setFilledSlots(newSlots);
      setWrongAttempts(0);

      const nextSlot = slotIndex + 1;
      if (nextSlot >= 3) {
        // Word complete
        setStep("done");
        setInstruction("You spelled CAT! Great job!");
        speak("You spelled cat! Great job! Now let's explore!");
        playSuccessPhrase();
        doneTimerRef.current = setTimeout(onComplete, 3000);
      } else {
        setSlotIndex(nextSlot);
      }
    } else {
      setWrongAttempts((a) => a + 1);
      setShakingId(tileId);
      setTimeout(() => setShakingId(null), 400);
    }
  }, [step, slotIndex, filledSlots, shakingId, onComplete]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (doneTimerRef.current) clearTimeout(doneTimerRef.current);
      // cleanup (no TTS to cancel)
    };
  }, []);

  return (
    <div className="onboarding">
      <div className="onboarding__content">
        {/* Instruction text */}
        <div className="onboarding__instruction">{instruction}</div>

        {/* Word image */}
        <div className="onboarding__image">
          <WordImage imageKey={DEMO_IMAGE} size={120} />
        </div>

        {/* Word slots */}
        <div className="onboarding__slots">
          {DEMO_LETTERS.map((_, i) => {
            const filled = filledSlots[i];
            const isActive = i === slotIndex && step === "build";
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

        {/* Letter choices */}
        {step === "build" && slotIndex < 3 && (
          <div className="onboarding__choices">
            {choices.map((letter, i) => {
              const tileId = `onboard-${slotIndex}-${i}`;
              const isCorrect = letter.toLowerCase() === DEMO_LETTERS[slotIndex].toLowerCase();
              const showHint = wrongAttempts >= 2 && isCorrect;
              const isShaking = shakingId === tileId;
              const isDimmed = wrongAttempts >= 2 && !isCorrect;
              return (
                <button
                  key={tileId}
                  className={[
                    "onboarding__tile",
                    showHint ? "onboarding__tile--hinted" : "",
                    isShaking ? "onboarding__tile--shake" : "",
                    isDimmed ? "onboarding__tile--dimmed" : "",
                  ].filter(Boolean).join(" ")}
                  onClick={() => handleTileTap(letter, tileId)}
                >
                  {letter.toUpperCase()}
                </button>
              );
            })}
          </div>
        )}

        {/* Done state */}
        {step === "done" && (
          <div className="onboarding__done">
            <div className="onboarding__word-reveal">CAT</div>
            <button className="onboarding__continue" onClick={onComplete}>
              Let's Go!
            </button>
          </div>
        )}

        {/* Skip button */}
        {step !== "done" && (
          <button className="onboarding__skip" onClick={onComplete}>
            Skip
          </button>
        )}
      </div>
    </div>
  );
};

export default OnboardingScreen;
