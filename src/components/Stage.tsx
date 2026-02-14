// =============================================
// Stage.tsx — Fixed-aspect-ratio stage container
// WiggleWoo's Word Quest
// =============================================
// Maintains iPhone 14 Pro Max aspect ratio (430:932)
// Scales up on desktop (max ~580px wide), stays centered
// Sets --u CSS variable for proportional scaling
// =============================================

import React, { useRef, useEffect, useState } from "react";
import "./Stage.css";

// iPhone 14 Pro Max: 430 x 932 (landscape: 932 x 430)
const DESIGN_W = 932; // landscape width
const DESIGN_H = 430; // landscape height
const ASPECT = DESIGN_W / DESIGN_H; // ≈ 2.167

interface StageProps {
  children: React.ReactNode;
}

const Stage: React.FC<StageProps> = ({ children }) => {
  const stageRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;

    const updateUnit = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      // --u = 1/932 of stage width (landscape base)
      // --uv = 1/430 of stage height
      el.style.setProperty("--u", `${w / DESIGN_W}`);
      el.style.setProperty("--uv", `${h / DESIGN_H}`);
      el.style.setProperty("--stage-w", `${w}px`);
      el.style.setProperty("--stage-h", `${h}px`);
      if (!ready) setReady(true);
    };

    const ro = new ResizeObserver(updateUnit);
    ro.observe(el);
    updateUnit(); // initial

    return () => ro.disconnect();
  }, [ready]);

  return (
    <div className="stage-wrapper">
      <div className="stage" ref={stageRef}>
        {children}
      </div>
    </div>
  );
};

export default Stage;
