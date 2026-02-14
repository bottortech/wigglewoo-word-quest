// =============================================
// TrophyShowcase.tsx — Quest Map Trophy Display
// Wigglewoo CVC Quest
// =============================================
// Silhouette → Gold reveal animation for quest map.
// NOT the glass display case (see GlassDisplayCase.tsx).
// =============================================

import React from "react";
import trophyImg from "../assets/trophy.png";
import silhouetteImg from "../assets/silhouette-trophy.png";

interface TrophyShowcaseProps {
  titleSub: string;
  titleMain: string;
  isRevealed: boolean;
}

const TrophyShowcase: React.FC<TrophyShowcaseProps> = ({
  titleSub,
  titleMain,
  isRevealed,
}) => {
  return (
    <div className={`trophy-showcase ${isRevealed ? "trophy-showcase--revealed" : ""}`}>
      <div className="trophy-showcase__spotlight" />
      <div className="trophy-showcase__container">
        <img
          src={silhouetteImg}
          alt="Trophy silhouette"
          className="trophy-showcase__silhouette"
          draggable={false}
        />
        <img
          src={trophyImg}
          alt="Gold trophy"
          className="trophy-showcase__gold"
          draggable={false}
        />
        <div className="trophy-showcase__sparkles">
          {[...Array(8)].map((_, i) => (
            <span key={i} className="trophy-showcase__sparkle" />
          ))}
        </div>
      </div>
      <div className="trophy-showcase__pedestal" />
      <div className="trophy-showcase__plaque">
        <span className="trophy-showcase__title-sub">{titleSub}</span>
        <span className="trophy-showcase__title">{titleMain}</span>
      </div>
    </div>
  );
};

export default TrophyShowcase;
