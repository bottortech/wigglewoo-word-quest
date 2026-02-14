// =============================================
// Bulb.tsx — Soft breathing light bulb
// WiggleWoo's Word Quest — Play Now screen
// =============================================
// Layers off + on images; fades the "on" image
// in and out with CSS transitions for a warm,
// ambient workshop glow.
// =============================================

import React, { useState, useEffect, useRef } from "react";
import bulbOff from "../assets/Light Bulb (off).png";
import bulbOn from "../assets/Light Bulb (on).png";

interface BulbProps {
  /** Base interval in ms between glow cycles (randomized ±30%) */
  interval: number;
  /** How long the bulb stays at peak glow in ms */
  onDuration?: number;
  /** Initial delay before first glow in ms */
  delay?: number;
  /** CSS class for positioning */
  className?: string;
}

const Bulb: React.FC<BulbProps> = ({
  interval,
  onDuration = 1200,
  delay = 0,
  className = "",
}) => {
  const [glowing, setGlowing] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let mounted = true;

    const breathe = () => {
      if (!mounted) return;

      // Fade in
      setGlowing(true);

      // Hold at peak, then fade out
      timeoutRef.current = setTimeout(() => {
        if (!mounted) return;
        setGlowing(false);

        // Schedule next glow with ±30% randomization
        const jitter = interval * (0.7 + Math.random() * 0.6);
        timeoutRef.current = setTimeout(breathe, jitter);
      }, onDuration);
    };

    timeoutRef.current = setTimeout(breathe, delay);

    return () => {
      mounted = false;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [interval, onDuration, delay]);

  return (
    <div className={`bulb ${className}`}>
      {/* Always-visible off state */}
      <img
        src={bulbOff}
        alt=""
        className="bulb-img bulb-off"
        draggable={false}
      />
      {/* On state fades in/out over the off state */}
      <img
        src={bulbOn}
        alt=""
        className={`bulb-img bulb-on ${glowing ? "bulb-glow-active" : ""}`}
        draggable={false}
      />
    </div>
  );
};

export default Bulb;
