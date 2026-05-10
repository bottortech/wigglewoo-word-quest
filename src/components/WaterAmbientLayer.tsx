// =============================================
// WaterAmbientLayer.tsx — Ambient ocean life effects
// WiggleWoo's Word Quest
// =============================================
// Caustic shimmer, 8 micro-bubbles, fish silhouette,
// and deep whale shadow. All CSS animation — no JS timers.

import "./WaterAmbientLayer.css";

const WaterAmbientLayer: React.FC = () => (
  <div className="water-ambient">
    {/* 1. Caustics shimmer — gentle light refraction over the texture's
         own caustics. Toned down since the new water-layer.png already
         carries strong caustic detail; this just adds slow drift on top. */}
    <div className="water-ambient__shimmer" />

    {/* 1b. Slow sheen pan — soft light sweep across the surface,
         water-masked. ~50s loop for a luxurious, calm pace. */}
    <div className="water-ambient__sheen" />

    {/* 1c. Atmospheric haze — soft cyan bloom that breathes very slowly,
         giving the whole water area a dreamy quality. Water-masked. */}
    <div className="water-ambient__haze" />

    {/* Sparkles deferred — see <WaterSparklesLayer> on disk for the
         standalone twinkle component (currently not rendered anywhere). */}

    {/* 2. Micro-bubbles — DISABLED 2026-05-09. They read as "sparkles"
         from a distance, which conflicts with the v1 decision to drop
         dot-style glints. Block kept commented for easy revival. */}
    {/*
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
    */}

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
