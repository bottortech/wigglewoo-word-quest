// =============================================
// GlassDisplayCase.tsx — Glass Museum Display Case
// Wigglewoo CVC Quest
// =============================================
// Premium museum-style glass case for trophy display.
// Used in TrophyRoom. Does NOT replace the QuestMap TrophyShowcase.
// =============================================

import React from "react";
import trophyImg from "../assets/trophy.png";
import silhouetteImg from "../assets/silhouette-trophy.png";
import type { PatternType } from "../game/types";
import "../styles/trophy-showcase.css";

// Pattern type to champion label
const CHAMPION_LABELS: Record<PatternType, string> = {
  cvc: "CVC",
  cvcc: "CVCC",
  cvvc: "CVVC",
  ccvc: "CCVC",
};

interface GlassDisplayCaseProps {
  earned: boolean;
  patternType: PatternType;
  size?: "small" | "medium" | "large";
  className?: string;
}

const GlassDisplayCase: React.FC<GlassDisplayCaseProps> = ({
  earned,
  patternType,
  size = "medium",
  className = "",
}) => {
  const label = CHAMPION_LABELS[patternType] || "CVC";

  return (
    <div className={`glass-display glass-display--${size} ${className}`}>
      <div className="glass-display__spotlight" />
      <div className="glass-display__case">
        <div className="glass-display__reflection glass-display__reflection--left" />
        <div className="glass-display__reflection glass-display__reflection--right" />
        <div className="glass-display__trophy-wrap">
          <img
            src={earned ? trophyImg : silhouetteImg}
            alt={earned ? "Earned Trophy" : "Trophy Placeholder"}
            className={`glass-display__trophy-img ${
              earned ? "glass-display__trophy-img--earned" : "glass-display__trophy-img--locked"
            }`}
            draggable={false}
          />
        </div>
        <div className="glass-display__inner-glow" />
      </div>
      <div className="glass-display__base">
        <div className="glass-display__base-top" />
        <div className="glass-display__badge">
          <span className="glass-display__badge-text">{label} Quest</span>
          <span className="glass-display__badge-subtitle">Champion</span>
        </div>
        <div className="glass-display__base-bottom" />
      </div>
    </div>
  );
};

export default GlassDisplayCase;
