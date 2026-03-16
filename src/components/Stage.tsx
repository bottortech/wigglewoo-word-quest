// =============================================
// Stage.tsx — Full-viewport stage container
// WiggleWoo's Word Quest
// =============================================
// Fills the browser viewport edge-to-edge.
// Sets --u / --uv CSS scale units via ResizeObserver
// (design reference: 932 × 430 landscape).
// =============================================

import React, { useRef, useEffect, useState } from "react";
import "./Stage.css";

// iPhone 14 Pro Max: 430 x 932 (landscape: 932 x 430)
const DESIGN_W = 932; // landscape width
const DESIGN_H = 430; // landscape height


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
