// =============================================
// WaterBaseLayer.tsx — Tiled water background fill
// WiggleWoo's Word Quest
// =============================================
// Pure CSS-driven tiled water texture with drift animation.
// No JS state, no re-renders — visual only.

import "./WaterBaseLayer.css";

const WaterBaseLayer: React.FC = () => (
  <div className="water-base-layer">
    <div className="water-base-layer__scroll" />
  </div>
);

export default WaterBaseLayer;
