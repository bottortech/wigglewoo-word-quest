// =============================================
// GuidedDemoOverlay.tsx — Guided Demo spotlight overlay
// WiggleWoo's Word Quest
// =============================================
// Renders on top of the real app (whatever screen is actually mounted) and:
//   - dims everything except a cutout hole around the current step's target
//   - blocks taps everywhere outside that hole (four scrim bands around the
//     cutout rect, rather than a single dimmed layer — see the render below)
//   - shows a callout with the step's message, plus a hand pointer
//   - for "tap-callout" steps, a "Got it" button advances manually
//   - "app-state" steps advance from outside (App.tsx watches real app
//     state and dispatches NEXT) — this component never decides that itself
//
// It never assumes a fixed screen — the target is (re)located by CSS
// selector every time the step changes, tolerating a short delay while the
// real screen it lives on finishes mounting after a navigation.
// =============================================

import { useState, useEffect, useCallback } from "react";
import type { GuidedDemoStep } from "../game/guidedDemoSteps";
import "../styles/guided-demo.css";

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface GuidedDemoOverlayProps {
  step: GuidedDemoStep;
  onAdvanceTap: () => void;
  onSkip: () => void;
}

const POLL_INTERVAL_MS = 200;

const GuidedDemoOverlay: React.FC<GuidedDemoOverlayProps> = ({ step, onAdvanceTap, onSkip }) => {
  const [rect, setRect] = useState<Rect | null>(null);

  const measure = useCallback(() => {
    const el = document.querySelector(step.targetSelector) as HTMLElement | null;
    if (!el) {
      setRect(null);
      return;
    }
    const r = el.getBoundingClientRect();
    setRect({ x: r.left, y: r.top, width: r.width, height: r.height });
  }, [step.targetSelector]);

  // Poll continuously for the life of the step, rather than once — the
  // target can appear late (the screen it lives on is still mounting after
  // a real navigation) and can also disappear again mid-step (the word-
  // building bottles vanish once the real completion celebration takes
  // over) — in that case `rect` needs to go back to null so the scrim
  // clears and the celebration plays undimmed, not just fail once and stop.
  useEffect(() => {
    setRect(null);
    measure();
    const interval = window.setInterval(measure, POLL_INTERVAL_MS);
    return () => window.clearInterval(interval);
  }, [measure]);

  useEffect(() => {
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure]);

  const PAD = 8;
  const hole = rect
    ? { x: rect.x - PAD, y: rect.y - PAD, width: rect.width + PAD * 2, height: rect.height + PAD * 2 }
    : null;

  // Callout placement: below the hole if there's room, otherwise above it.
  const calloutBelow = hole ? hole.y + hole.height + 140 < window.innerHeight : true;

  return (
    <div className="guided-demo">
      {/* Deliberately render nothing but the Skip button when the target
          isn't on screen (mid-navigation, or — for the word-building step —
          while the real completion celebration is playing in its place).
          That keeps the celebration fully visible/undimmed rather than
          having a stale scrim sit on top of it. */}
      {hole && (
        <>
          <div className="guided-demo__scrim" style={{ left: 0, top: 0, right: 0, height: hole.y }} aria-hidden="true" />
          <div
            className="guided-demo__scrim"
            style={{ left: 0, top: hole.y + hole.height, right: 0, bottom: 0 }}
            aria-hidden="true"
          />
          <div
            className="guided-demo__scrim"
            style={{ left: 0, top: hole.y, width: hole.x, height: hole.height }}
            aria-hidden="true"
          />
          <div
            className="guided-demo__scrim"
            style={{ left: hole.x + hole.width, top: hole.y, right: 0, height: hole.height }}
            aria-hidden="true"
          />
          <div
            className="guided-demo__ring"
            style={{ left: hole.x, top: hole.y, width: hole.width, height: hole.height }}
            aria-hidden="true"
          />
          <div
            className="guided-demo__hand"
            style={{ left: hole.x + hole.width / 2 - 24, top: hole.y + hole.height }}
            aria-hidden="true"
          >
            <span className="guided-demo__hand-inner">👆</span>
          </div>

          <div
            className={`guided-demo__callout ${calloutBelow ? "guided-demo__callout--below" : "guided-demo__callout--above"}`}
            style={{
              left: Math.min(Math.max(hole.x + hole.width / 2, 160), window.innerWidth - 160),
              top: calloutBelow ? hole.y + hole.height + 28 : undefined,
              bottom: calloutBelow ? undefined : window.innerHeight - hole.y + 28,
            }}
          >
            <p className="guided-demo__message">{step.message}</p>
            {step.advance === "tap-callout" && (
              <button className="guided-demo__advance-btn" onClick={onAdvanceTap}>
                Got it →
              </button>
            )}
          </div>
        </>
      )}

      <button className="guided-demo__skip-btn" onClick={onSkip}>
        Skip Demo
      </button>
    </div>
  );
};

export default GuidedDemoOverlay;
