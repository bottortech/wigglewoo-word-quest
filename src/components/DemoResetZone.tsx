import { useRef, useState, useCallback } from "react";
import "./DemoResetZone.css";

interface Props {
  onReset: () => void;
}

const REQUIRED_TAPS = 3;
const TAP_WINDOW_MS = 2500;

export default function DemoResetZone({ onReset }: Props) {
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
    onReset();
  }, [onReset]);

  const handleCancel = useCallback(() => {
    setConfirming(false);
    tapTimestamps.current = [];
  }, []);

  return (
    <>
      <div
        className="demo-reset-zone"
        onPointerDown={handleTap}
        aria-hidden="true"
      />

      {confirming && (
        <div
          className="demo-reset-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Reset demo session"
        >
          <div className="demo-reset-dialog">
            <p className="demo-reset-dialog__msg">Ready for the next child?</p>
            <p className="demo-reset-dialog__sub">
              This will return the game to the start screen and clear this
              session's progress.
            </p>
            <div className="demo-reset-dialog__actions">
              <button
                className="demo-reset-dialog__btn demo-reset-dialog__btn--cancel"
                onClick={handleCancel}
              >
                Cancel
              </button>
              <button
                className="demo-reset-dialog__btn demo-reset-dialog__btn--confirm"
                onClick={handleConfirm}
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
