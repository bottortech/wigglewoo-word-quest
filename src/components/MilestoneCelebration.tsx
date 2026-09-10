// =============================================
// MilestoneCelebration.tsx — reusable full-screen celebration
// WiggleWoo's Word Quest
// =============================================
// Shared celebration overlay for meaningful milestones (NOT per-answer —
// see CELEBRATION_TIERS in celebrationVariants.ts for how big/long each
// tier is). Picks a random visual variant per mount so the same milestone
// doesn't look identical every time. Auto-dismisses after its tier's
// duration; tapping skips ahead immediately either way.
//
// eventSlug is optional on purpose: screens that already manage their own
// celebration audio timing (Cross-Match, Word-Tac-Toe, Discovery Room fact
// narration) should omit it so this overlay doesn't step on that; App.tsx-
// level uses (Discovery Room unlock, trophy earned) pass one since nothing
// else is playing audio at that exact transition moment.
// =============================================

import { useState, useEffect, useRef } from "react";
import { playEvent, type EventSlug } from "../audio/SoundEffects";
import { CELEBRATION_TIERS, type CelebrationTier } from "../game/celebrationVariants";
import "../styles/milestone-celebration.css";

interface MilestoneCelebrationProps {
  tier: CelebrationTier;
  onDone: () => void;
  eventSlug?: EventSlug;
}

interface ConfettiPiece {
  id: number;
  left: number;
  delay: number;
  duration: number;
  color: string;
  rotate: number;
}

const lastVariantIndexByTier: Partial<Record<CelebrationTier, number>> = {};

// Randomness lives in these two module-level helpers (not inline in the
// component body) so it only ever runs once, via useState's lazy
// initializer, rather than during every render pass.
function pickVariantIndex(tier: CelebrationTier, count: number): number {
  if (count <= 1) return 0;
  let idx = Math.floor(Math.random() * count);
  if (idx === lastVariantIndexByTier[tier]) {
    idx = (idx + 1) % count;
  }
  lastVariantIndexByTier[tier] = idx;
  return idx;
}

const CONFETTI_COLORS = ["#FFD166", "#EF476F", "#06D6A0", "#118AB2", "#FF9F1C", "#B794F4"];

function generateConfetti(count: number): ConfettiPiece[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 0.6,
    duration: 1.8 + Math.random() * 1.2,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    rotate: 360 + Math.random() * 360,
  }));
}

const MilestoneCelebration: React.FC<MilestoneCelebrationProps> = ({ tier, onDone, eventSlug }) => {
  const config = CELEBRATION_TIERS[tier];
  const [visible, setVisible] = useState(true);
  const [variantIndex] = useState(() => pickVariantIndex(tier, config.variants.length));
  const [confetti] = useState(() => generateConfetti(config.confettiCount));
  const variant = config.variants[variantIndex];

  useEffect(() => {
    if (eventSlug) playEvent(eventSlug);
    // Only fire once on mount — a new mount (new milestone) is a new instance.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep the latest onDone in a ref so the auto-dismiss timer (below) fires
  // exactly once at config.durationMs regardless of how many times the host
  // screen re-renders in the meantime (e.g. its own ambient animations).
  const onDoneRef = useRef(onDone);
  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  const handleDismiss = () => {
    setVisible(false);
    setTimeout(() => onDoneRef.current(), 350);
  };

  useEffect(() => {
    const timer = setTimeout(handleDismiss, config.durationMs);
    return () => clearTimeout(timer);
  }, [config.durationMs]);

  return (
    <div
      className={`milestone-celebration milestone-celebration--${tier} ${visible ? "" : "milestone-celebration--fading"}`}
      onClick={handleDismiss}
      role="dialog"
      aria-label={variant.headline}
    >
      <div className="milestone-celebration__confetti" aria-hidden="true">
        {confetti.map((c) => (
          <span
            key={c.id}
            className="milestone-confetti-piece"
            style={{
              left: `${c.left}%`,
              animationDelay: `${c.delay}s`,
              animationDuration: `${c.duration}s`,
              background: c.color,
              ["--rotate-end" as string]: `${c.rotate}deg`,
            }}
          />
        ))}
      </div>
      <img src={variant.mascot} alt="" className="milestone-celebration__mascot" draggable={false} />
      <h2 className="milestone-celebration__headline">{variant.headline}</h2>
      {variant.subtext && <p className="milestone-celebration__subtext">{variant.subtext}</p>}
    </div>
  );
};

export default MilestoneCelebration;
