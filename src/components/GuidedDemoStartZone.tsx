// =============================================
// GuidedDemoStartZone.tsx — hidden staff trigger
// WiggleWoo's Word Quest
// =============================================
// Same hidden-corner, 3-tap-to-confirm pattern as DemoResetZone (bottom-
// right), just in the opposite corner and dispatching a different action.
// Kept as its own small component rather than sharing code with
// DemoResetZone — that one is load-bearing for the MPL Community Tour kiosk
// resets, and duplicating ~15 lines here is cheaper than risking it.
// =============================================

import { useRef, useState, useCallback } from "react";
import "./GuidedDemoStartZone.css";

interface Props {
  onStart: () => void;
}

const REQUIRED_TAPS = 3;
const TAP_WINDOW_MS = 2500;

export default function GuidedDemoStartZone({ onStart }: Props) {
  const tapTimestamps = useRef<number[]>([]);
  const [confirming, setConfirming] = useState(false);

  const handleTap = useCallback(() => {
    const now = Date.now();
    tapTimestamps.current = [...tapTimestamps.current, now].filter(
      (t) => now - t < TAP_WINDOW_MS
    );
    if (tapTimestamps.current.length >= REQUIRED_TAPS) {
      tapTimestamps.current = [];
      setConfirming(true);
    }
  }, []);

  const handleConfirm = useCallback(() => {
    setConfirming(false);
    onStart();
  }, [onStart]);

  const handleCancel = useCallback(() => {
    setConfirming(false);
    tapTimestamps.current = [];
  }, []);

  return (
    <>
      <div
        className="guided-demo-start-zone"
        onPointerDown={handleTap}
        aria-hidden="true"
      />

      {confirming && (
        <div
          className="guided-demo-start-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Start Guided Demo"
        >
          <div className="guided-demo-start-dialog">
            <p className="guided-demo-start-dialog__msg">Start Guided Demo?</p>
            <p className="guided-demo-start-dialog__sub">
              Walks a visitor through the main features step by step. Skippable
              at any time.
            </p>
            <div className="guided-demo-start-dialog__actions">
              <button
                className="guided-demo-start-dialog__btn guided-demo-start-dialog__btn--cancel"
                onClick={handleCancel}
              >
                Cancel
              </button>
              <button
                className="guided-demo-start-dialog__btn guided-demo-start-dialog__btn--confirm"
                onClick={handleConfirm}
              >
                Start
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
