// =============================================
// LoadingScreen.tsx — Boot loader
// WiggleWoo's Word Quest
// =============================================
// The branded loading screen is `#boot-fallback` in index.html
// (kept OUTSIDE #root so React's mount doesn't tear it down).
// This gate just enforces a minimum display time so even a fast
// boot plays the splash for a beat — feels intentional.
//
// The native splash (Android/iOS) is configured with launchAutoHide:
// false so it can't race the WebView's page load — it's dismissed
// here, at the same moment the web boot-fallback fades out, so the
// native and web loading screens hand off in lockstep.
// =============================================

import React, { useEffect } from "react";
import { SplashScreen } from "@capacitor/splash-screen";

interface LoadingGateProps {
  /** Fully disable the gate (drops the splash immediately). */
  disabled?: boolean;
  /** Min splash duration even on a fast boot. Default 1500ms. */
  minDurationMs?: number;
  children?: React.ReactNode;
}

/** No-ops safely on web (WebPlugin stub) — safe to call outside a native shell. */
function hideNativeSplash() {
  try {
    void SplashScreen.hide();
  } catch {
    // Native plugin unavailable (e.g. plain browser preview) — ignore.
  }
}

const LoadingGate: React.FC<LoadingGateProps> = ({
  disabled = false,
  minDurationMs = 1500,
  children,
}) => {
  useEffect(() => {
    const fallback = document.getElementById("boot-fallback");
    if (!fallback) {
      hideNativeSplash(); // already removed (e.g. dev hot reload) — still clear native splash
      return;
    }

    if (disabled) {
      fallback.classList.add("fade-out");
      hideNativeSplash();
      const t = setTimeout(() => fallback.remove(), 600);
      return () => clearTimeout(t);
    }

    const minTimer = setTimeout(() => {
      fallback.classList.add("fade-out");
      hideNativeSplash();
      setTimeout(() => fallback.remove(), 600);
    }, minDurationMs);

    return () => clearTimeout(minTimer);
  }, [disabled, minDurationMs]);

  return <>{children}</>;
};

export default LoadingGate;
