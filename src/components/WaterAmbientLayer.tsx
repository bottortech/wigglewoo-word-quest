// =============================================
// WaterAmbientLayer.tsx — Ambient ocean life effects
// WiggleWoo's Word Quest
// =============================================
// Caustic shimmer, 8 micro-bubbles, fish silhouette,
// and deep whale shadow. All CSS animation — no JS timers.

import "./WaterAmbientLayer.css";

const WaterAmbientLayer: React.FC = () => (
  <div className="water-ambient">
    {/* 1. Caustics shimmer — drifting light refraction */}
    <div className="water-ambient__shimmer" />

    {/* 2. Micro-bubbles — 8 staggered rising bubbles */}
    <div className="water-ambient__bubbles">
      <div className="bubble bubble--1" />
      <div className="bubble bubble--2" />
      <div className="bubble bubble--3" />
      <div className="bubble bubble--4" />
      <div className="bubble bubble--5" />
      <div className="bubble bubble--6" />
      <div className="bubble bubble--7" />
      <div className="bubble bubble--8" />
    </div>

    {/* 3. Fish silhouette — faint teal shadow crossing the map */}
    <div className="water-ambient__fish">
      <img
        className="fish-shadow"
        src="/assets/fish-silhouette.png"
        alt=""
        draggable={false}
      />
    </div>

    {/* 4. Deep whale shadow — CSS ::after pseudo-element, no markup needed */}
    <div className="water-ambient__whale" />
  </div>
);

export default WaterAmbientLayer;
