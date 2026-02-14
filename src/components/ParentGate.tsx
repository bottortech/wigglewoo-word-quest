// =============================================
// ParentGate.tsx — COPPA-safe parent gate
// Hold for 3 seconds to access parent features
// =============================================

import React, { useState, useRef, useCallback, useEffect } from "react";

interface ParentGateProps {
  onPass: () => void;
  onCancel: () => void;
}

const HOLD_DURATION_MS = 3000;

const ParentGate: React.FC<ParentGateProps> = ({ onPass, onCancel }) => {
  const [progress, setProgress] = useState(0); // 0 to 100
  const [holding, setHolding] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();
  const startTimeRef = useRef<number>(0);

  const startHold = useCallback(() => {
    setHolding(true);
    startTimeRef.current = Date.now();
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const pct = Math.min((elapsed / HOLD_DURATION_MS) * 100, 100);
      setProgress(pct);
      if (pct >= 100) {
        clearInterval(intervalRef.current);
        onPass();
      }
    }, 30);
  }, [onPass]);

  const stopHold = useCallback(() => {
    setHolding(false);
    setProgress(0);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  return (
    <div className="parent-gate-overlay" onClick={onCancel}>
      <div className="parent-gate" onClick={(e) => e.stopPropagation()}>
        <h2 className="parent-gate__title">👋 For Parents & Teachers</h2>
        <p className="parent-gate__text">
          Hold the button below for 3 seconds to view Learning Insights.
        </p>
        <div className="parent-gate__hold-area">
          <button
            className={`parent-gate__btn ${holding ? "parent-gate__btn--holding" : ""}`}
            onPointerDown={startHold}
            onPointerUp={stopHold}
            onPointerLeave={stopHold}
            onPointerCancel={stopHold}
          >
            {holding ? "Keep holding…" : "Hold to Continue"}
          </button>
          <div className="parent-gate__progress-track">
            <div
              className="parent-gate__progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        <button className="parent-gate__cancel" onClick={onCancel}>
          ← Back
        </button>
      </div>
    </div>
  );
};

export default ParentGate;
