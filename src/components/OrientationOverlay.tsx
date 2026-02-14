// =============================================
// OrientationOverlay.tsx — Soft portrait mode hint
// WiggleWoo's Word Quest
// =============================================
// Shows a non-blocking overlay when device is in portrait.
// Disappears automatically when landscape is detected.
// Does NOT force rotation — relies on device/browser behavior.

import React, { useState, useEffect } from "react";
import heroImg from "../assets/wiggle_woo_hero_stance.png";
import "./OrientationOverlay.css";

interface OrientationOverlayProps {
  /** Optional: completely disable the overlay */
  disabled?: boolean;
}

const OrientationOverlay: React.FC<OrientationOverlayProps> = ({ disabled = false }) => {
  const [isPortrait, setIsPortrait] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (disabled) return;

    // Detect if we're on a mobile/touch device
    const checkMobile = () => {
      const mobile = 
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        window.innerWidth <= 1024;
      setIsMobile(mobile);
    };

    // Check orientation
    const checkOrientation = () => {
      const portrait = window.innerHeight > window.innerWidth;
      setIsPortrait(portrait);
    };

    // Initial checks
    checkMobile();
    checkOrientation();

    // Listen for orientation/resize changes
    window.addEventListener("resize", checkOrientation);
    window.addEventListener("orientationchange", checkOrientation);

    return () => {
      window.removeEventListener("resize", checkOrientation);
      window.removeEventListener("orientationchange", checkOrientation);
    };
  }, [disabled]);

  // Only show on mobile devices in portrait mode
  if (disabled || !isMobile || !isPortrait) {
    return null;
  }

  return (
    <div className="orientation-overlay">
      <div className="orientation-overlay__content">
        {/* Rotate icon */}
        <div className="orientation-overlay__icon">
          <svg 
            viewBox="0 0 100 100" 
            className="orientation-overlay__rotate-svg"
            aria-hidden="true"
          >
            {/* Phone outline */}
            <rect 
              x="30" y="15" 
              width="40" height="70" 
              rx="5" ry="5"
              fill="none" 
              stroke="currentColor" 
              strokeWidth="4"
              className="orientation-overlay__phone"
            />
            {/* Screen */}
            <rect 
              x="34" y="22" 
              width="32" height="52" 
              fill="currentColor" 
              opacity="0.3"
            />
            {/* Home button */}
            <circle cx="50" cy="79" r="3" fill="currentColor" />
            {/* Rotation arrow */}
            <path 
              d="M 75 50 A 30 30 0 0 1 50 80"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              className="orientation-overlay__arrow-path"
            />
            <polygon 
              points="45,75 50,85 55,78" 
              fill="currentColor"
              className="orientation-overlay__arrow-head"
            />
          </svg>
        </div>

        {/* WiggleWoo pointing */}
        <div className="orientation-overlay__wigglewoo">
          <img 
            src={heroImg} 
            alt="WiggleWoo" 
            className="orientation-overlay__wigglewoo-img"
            draggable={false}
          />
          <div className="orientation-overlay__pointer">👉</div>
        </div>

        {/* Message */}
        <p className="orientation-overlay__message">
          Rotate your device for the best experience!
        </p>
      </div>
    </div>
  );
};

export default OrientationOverlay;
