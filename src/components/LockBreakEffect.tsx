// =============================================
// LockBreakEffect.tsx — reusable map unlock animation
// WiggleWoo's Word Quest
// =============================================
// A small, purely decorative overlay: a lock icon that shakes, cracks open,
// and fades while a few sparks burst outward, then calls onDone once. Meant
// to be rendered as a child of whatever button/tab just became unlocked
// (vowel tabs, Word-Tac-Toe) — it never intercepts taps (pointer-events:
// none throughout) and never gates the real unlock state, which the caller
// already applies immediately; this only decorates the moment it happened.
// =============================================

import { useEffect } from "react";
import "../styles/lock-break.css";

const DURATION_MS = 1100;

interface LockBreakEffectProps {
  onDone: () => void;
}

const LockBreakEffect: React.FC<LockBreakEffectProps> = ({ onDone }) => {
  useEffect(() => {
    const t = setTimeout(onDone, DURATION_MS);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <span className="lock-break" aria-hidden="true">
      <span className="lock-break__icon">🔒</span>
      {Array.from({ length: 6 }, (_, i) => (
        <span
          key={i}
          className="lock-break__spark"
          style={{ ["--spark-angle" as string]: `${i * 60}deg` }}
        />
      ))}
    </span>
  );
};

export default LockBreakEffect;
