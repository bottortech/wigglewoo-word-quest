// =============================================
// OrientationOverlay.tsx — Landscape gate
// WiggleWoo's Word Quest
// =============================================
// iOS Info.plist locks the installed app to landscape, but web previews,
// mobile Safari, and TestFlight web debugging can still render in portrait.
// This component shows a "rotate device" overlay whenever the viewport is
// taller than it is wide. Children remain mounted so React state is preserved
// across rotations.
// =============================================

import { useEffect, useState } from "react";
import "./OrientationOverlay.css";

interface OrientationOverlayProps {
  children: React.ReactNode;
}

function isPortrait(): boolean {
  if (typeof window === "undefined") return false;
  return window.innerHeight > window.innerWidth;
}

const OrientationOverlay: React.FC<OrientationOverlayProps> = ({ children }) => {
  const [portrait, setPortrait] = useState<boolean>(() => isPortrait());

  useEffect(() => {
    const update = () => setPortrait(isPortrait());
    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
    };
  }, []);

  return (
    <>
      {children}
      {portrait && (
        <div
          className="orientation-overlay"
          role="alertdialog"
          aria-modal="true"
          aria-label="Rotate device to landscape"
        >
          <div className="orientation-overlay__card">
            <div className="orientation-overlay__phone" aria-hidden="true">
              📱
            </div>
            <p className="orientation-overlay__text">
              Turn your device sideways to play!
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default OrientationOverlay;
