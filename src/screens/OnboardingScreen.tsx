// =============================================
// OnboardingScreen.tsx — First-time guided intro
// WiggleWoo's Word Quest
// =============================================
// Teaches the real Potion Game / Word Laboratory instead of a separate
// simplified mock-up or standalone intro/completion screens. This screen is
// a thin wrapper: it mounts the actual PotionGameScreen in "tutorial mode"
// (see PotionGameTutorialMode) for the word CAT — same lab background, same
// WiggleWoo, same bottles/beaker/pour animations, same completion
// celebration — and overlays a small guide (instruction text + pulsing
// highlight + hand pointer) that advances C → A → T as the child correctly
// taps each bottle. Tutorial mode writes no real progress/analytics (see
// PotionGameScreen.tsx), and normal gameplay is completely unaffected when
// it's absent.
//
// Flow, entirely on the real lab screen: welcome VO (no separate screen) →
// guided C → A → T → real celebration plays out → "Let's Go!" appears as
// an overlay on the same lab scene → tap it → onComplete.
// =============================================

import { useState, useCallback, useEffect, useLayoutEffect } from "react";
import PotionGameScreen from "./PotionGameScreen";
import { QUEST_SHORT_A } from "../game/wordData";
import type { Quest } from "../game/types";
import { playEvent } from "../audio/SoundEffects";
import "../styles/onboarding.css";

interface OnboardingScreenProps {
  onComplete: () => void;
}

// The real CAT word data (letters, image, distractor rules) — reused, not
// duplicated, so onboarding can't drift out of sync with real gameplay.
// Only the quest id is synthetic, and only so PotionGameScreen's normal
// analytics/progress calls (which are all skipped anyway in tutorial mode)
// would have nothing real to collide with if that guard were ever bypassed.
const TUTORIAL_QUEST: Quest = {
  id: "onboarding-tutorial",
  title: "Tutorial",
  patternType: QUEST_SHORT_A.patternType,
  words: [QUEST_SHORT_A.words[0]],
};

const TUTORIAL_LETTERS = TUTORIAL_QUEST.words[0].letters.map((l) => l.toLowerCase());
const TUTORIAL_WORD = TUTORIAL_QUEST.words[0].word.toUpperCase();

const GUIDE_INSTRUCTIONS = [
  `Let's make ${TUTORIAL_WORD}! Tap the ${TUTORIAL_LETTERS[0].toUpperCase()} potion.`,
  `Now tap the ${TUTORIAL_LETTERS[1]?.toUpperCase()} potion.`,
  `Last one — tap the ${TUTORIAL_LETTERS[2]?.toUpperCase()} potion!`,
];

/** Guide overlay — instruction text + a pulsing highlight ring + hand
 *  pointer, positioned over the real potion bottle for the current target
 *  letter via `[data-potion-letter]` (not aria-label, which stays reserved
 *  for accessibility). Purely visual: never intercepts taps. */
const TutorialGuideOverlay: React.FC<{ letter: string | null; instruction: string }> = ({
  letter,
  instruction,
}) => {
  const [rect, setRect] = useState<{ x: number; y: number; width: number; height: number } | null>(null);

  const measure = useCallback(() => {
    if (!letter) {
      setRect(null);
      return;
    }
    const el = document.querySelector(`[data-potion-letter="${letter}"]`) as HTMLElement | null;
    if (!el) {
      setRect(null);
      return;
    }
    const r = el.getBoundingClientRect();
    setRect({ x: r.left, y: r.top, width: r.width, height: r.height });
  }, [letter]);

  // Slight delay so the previous bottle's removal (and the remaining
  // bottles' reflow) settles before measuring the next target.
  useLayoutEffect(() => {
    const t = setTimeout(measure, 250);
    return () => clearTimeout(t);
  }, [measure]);

  useEffect(() => {
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure]);

  if (!letter) return null;

  return (
    <div className="onboarding-guide" aria-hidden="true">
      <div className="onboarding-guide__instruction">{instruction}</div>
      {rect && (
        <>
          <div
            className="onboarding-guide__ring"
            style={{
              left: rect.x - 8,
              top: rect.y - 8,
              width: rect.width + 16,
              height: rect.height + 16,
            }}
          />
          <div
            className="onboarding-guide__hand"
            style={{ left: rect.x + rect.width / 2 - 24, top: rect.y + rect.height - 8 }}
          >
            <span className="onboarding-guide__hand-inner">👆</span>
          </div>
        </>
      )}
    </div>
  );
};

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  // Index into TUTORIAL_LETTERS for the letter currently being guided, or
  // null once all three are filled (the real celebration takes over from
  // here with no further guidance needed).
  const [guideIndex, setGuideIndex] = useState<number | null>(0);
  // True once the real CAT celebration has finished — only then does the
  // final "Let's Go!" button appear, as an overlay on the same lab scene.
  const [readyToContinue, setReadyToContinue] = useState(false);

  // Welcome VO — plays once over the real lab scene as it appears; no
  // separate welcome screen anymore.
  useEffect(() => {
    playEvent("onboard-intro");
  }, []);

  const handleSlotFilled = useCallback((slotIndex: number) => {
    const next = slotIndex + 1;
    setGuideIndex(next < TUTORIAL_LETTERS.length ? next : null);
  }, []);

  const handleGameComplete = useCallback(() => {
    setReadyToContinue(true);
  }, []);

  // Stable object identity (handleSlotFilled/handleGameComplete never change
  // — both are useCallbacks with empty deps) via a lazy initializer, not a
  // ref read during render.
  const [tutorialMode] = useState(() => ({
    onSlotFilled: handleSlotFilled,
    onComplete: handleGameComplete,
  }));

  return (
    <div className="onboarding">
      <PotionGameScreen
        quest={TUTORIAL_QUEST}
        currentWordIndex={0}
        onNavigate={() => {}}
        tutorialMode={tutorialMode}
      />
      {!readyToContinue && (
        <TutorialGuideOverlay
          letter={guideIndex !== null ? TUTORIAL_LETTERS[guideIndex] : null}
          instruction={guideIndex !== null ? GUIDE_INSTRUCTIONS[guideIndex] : ""}
        />
      )}
      {readyToContinue && (
        <div className="onboarding-cta">
          <button
            className="onboarding-cta__button"
            onClick={onComplete}
            autoFocus
          >
            Let's Go!
          </button>
        </div>
      )}
    </div>
  );
};

export default OnboardingScreen;
