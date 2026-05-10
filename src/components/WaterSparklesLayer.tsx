// =============================================
// WaterSparklesLayer.tsx — Top-most twinkle layer
// WiggleWoo's Word Quest
// =============================================
// 6 staggered twinkle points that render ON TOP of
// islands, the quest path, and quest nodes — per the
// requested layer order. Water-masked so any glint
// drifting over an island is auto-hidden. Subtle: peak
// opacity 0.7, slow 7s twinkle, 4px dots.
// =============================================

import "./WaterSparklesLayer.css";

const WaterSparklesLayer: React.FC = () => (
  <div className="water-sparkles">
    <i className="water-sparkle water-sparkle--1" />
    <i className="water-sparkle water-sparkle--2" />
    <i className="water-sparkle water-sparkle--3" />
    <i className="water-sparkle water-sparkle--4" />
    <i className="water-sparkle water-sparkle--5" />
    <i className="water-sparkle water-sparkle--6" />
  </div>
);

export default WaterSparklesLayer;
