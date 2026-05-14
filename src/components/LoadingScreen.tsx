// =============================================
// LoadingScreen.tsx — Boot loader
// WiggleWoo's Word Quest
// =============================================
// The branded loading screen is `#boot-fallback` in index.html
// (kept OUTSIDE #root so React's mount doesn't tear it down).
// This gate just enforces a minimum display time so even a fast
// boot plays the splash for a beat — feels intentional.
// =============================================

import React, { useEffect } from "react";

interface LoadingGateProps {
  /** Fully disable the gate (drops the splash immediately). */
  disabled?: boolean;
  /** Min splash duration even on a fast boot. Default 1500ms. */
  minDurationMs?: number;
  children?: React.ReactNode;
}

const LoadingGate: React.FC<LoadingGateProps> = ({
  disabled = false,
  minDurationMs = 1500,
  children,
}) => {
  useEffect(() => {
    const fallback = document.getElementById("boot-fallback");
    if (!fallback) return; // already removed (e.g. dev hot reload)

    if (disabled) {
      fallback.classList.add("fade-out");
      const t = setTimeout(() => fallback.remove(), 600);
      return () => clearTimeout(t);
    }

    const minTimer = setTimeout(() => {
      fallback.classList.add("fade-out");
      setTimeout(() => fallback.remove(), 600);
    }, minDurationMs);

    return () => clearTimeout(minTimer);
  }, [disabled, minDurationMs]);

  return <>{children}</>;
};

export default LoadingGate;
