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
import type { PatternType, TrophyTier } from "../game/types";
import "../styles/trophy-showcase.css";

// Pattern type to champion label (user-facing tier names)
const CHAMPION_LABELS: Record<PatternType, string> = {
  cvc: "Sound Builders",
  cvcc: "Blending Power",
  "magic-e": "Magic E",
  cvvc: "Vowel Teams",
  advanced: "Advanced Reading",
};

interface GlassDisplayCaseProps {
  /** Trophy tier — "none" = empty, "half" = partial trophy, "full" = full trophy */
  tier: TrophyTier;
  patternType: PatternType;
  size?: "small" | "medium" | "large";
  className?: string;
}

const GlassDisplayCase: React.FC<GlassDisplayCaseProps> = ({
  tier,
  patternType,
  size = "medium",
  className = "",
}) => {
  const label = CHAMPION_LABELS[patternType] || "CVC";

  return (
    <div className={`glass-display glass-display--${size} glass-display--tier-${tier} ${className}`}>
      <div className="glass-display__spotlight" />
      <div className="glass-display__case">
        <div className="glass-display__reflection glass-display__reflection--left" />
        <div className="glass-display__reflection glass-display__reflection--right" />
        <div className="glass-display__trophy-wrap">
          {tier === "half" ? (
            // Half: stack two copies of the trophy in a relative wrapper.
            // The first image takes the natural size (so the wrapper sizes
            // exactly like the working full-tier render). The second is
            // absolute-overlaid, clipped to the bottom half.
            <div className="glass-display__half-stack">
              <img
                src={trophyImg}
                alt=""
                aria-hidden="true"
                className="glass-display__trophy-img glass-display__trophy-img--half-ghost"
                draggable={false}
              />
              <img
                src={trophyImg}
                alt="Half trophy"
                className="glass-display__trophy-img glass-display__trophy-img--half-fill"
                draggable={false}
              />
            </div>
          ) : (
            <img
              src={tier === "full" ? trophyImg : silhouetteImg}
              alt={tier === "full" ? "Earned Trophy" : "Trophy Placeholder"}
              className={`glass-display__trophy-img glass-display__trophy-img--${tier}`}
              draggable={false}
            />
          )}
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
