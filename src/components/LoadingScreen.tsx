// =============================================
// LoadingScreen.tsx — Boot loader / orientation gate
// WiggleWoo's Word Quest
// =============================================
// The branded loading screen is `#boot-fallback` in index.html
// (kept OUTSIDE #root so React's mount doesn't tear it down).
// This gate just decides WHEN to fade it out:
//   - minimum display time has passed (so even a fast boot
//     plays the splash for a beat — feels intentional), AND
//   - on touch devices, the device is in landscape.
// On desktop / non-touch viewports, only the time gate
// applies — there's nothing to rotate.
// Replaces the old "Rotate your device" overlay so a kid
// who launches in portrait sees the loading splash during
// the rotate, instead of a corrective prompt.
// =============================================

import React, { useEffect } from "react";

interface LoadingGateProps {
  /** Fully disable the gate (drops the splash immediately). */
  disabled?: boolean;
  /** Min splash duration even on a fast landscape boot. Default 1500ms. */
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

    const isMobile =
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0 ||
      window.innerWidth <= 1024;

    let minElapsed = false;
    let removed = false;
    let removeTimer: ReturnType<typeof setTimeout> | null = null;

    const tryHide = () => {
      if (removed || !minElapsed) return;
      const portrait = window.innerHeight > window.innerWidth;
      if (isMobile && portrait) return; // wait for the rotate
      removed = true;
      fallback.classList.add("fade-out");
      removeTimer = setTimeout(() => fallback.remove(), 600);
    };

    const minTimer = setTimeout(() => {
      minElapsed = true;
      tryHide();
    }, minDurationMs);

    window.addEventListener("resize", tryHide);
    window.addEventListener("orientationchange", tryHide);

    return () => {
      clearTimeout(minTimer);
      if (removeTimer) clearTimeout(removeTimer);
      window.removeEventListener("resize", tryHide);
      window.removeEventListener("orientationchange", tryHide);
    };
  }, [disabled, minDurationMs]);

  return <>{children}</>;
};

export default LoadingGate;
