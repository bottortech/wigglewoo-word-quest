// =============================================
// RiverLayer.tsx — Animated SVG river overlay
// WiggleWoo's Word Quest
// =============================================
// Renders an SVG river path with shimmer highlight
// and a branching stream. All animation is CSS-driven.

import "./RiverLayer.css";

const RiverLayer: React.FC = () => (
  <div className="river-layer">
    <svg className="river-layer__svg" viewBox="0 0 1000 500" preserveAspectRatio="none">
      {/* Main river path — gentle S-curve through the map */}
      <path
        className="river-layer__path"
        d="M -20 260 C 120 240, 200 310, 340 280 S 520 220, 680 270 S 850 320, 1020 250"
        fill="none"
        stroke="rgba(60,180,220,0.35)"
        strokeWidth="28"
        strokeLinecap="round"
      />
      {/* Shimmer highlight — narrower, lighter, offset */}
      <path
        className="river-layer__shimmer"
        d="M -20 258 C 120 238, 200 308, 340 278 S 520 218, 680 268 S 850 318, 1020 248"
        fill="none"
        stroke="rgba(180,230,255,0.25)"
        strokeWidth="10"
        strokeLinecap="round"
      />
      {/* Branch stream — splits off to the bottom-left */}
      <path
        className="river-layer__branch"
        d="M 340 280 C 310 340, 260 380, 180 420 S 80 460, -20 470"
        fill="none"
        stroke="rgba(60,180,220,0.22)"
        strokeWidth="16"
        strokeLinecap="round"
      />
    </svg>
  </div>
);

export default RiverLayer;
