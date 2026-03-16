// =============================================
// GameShell.tsx — Full-viewport shell with optional map world layers
// WiggleWoo's Word Quest
// =============================================
// When showMapWorld is true, renders the water/sky/island
// layers behind children — used by PlayNowScreen to give
// the home screen a living ocean backdrop.

import WaterBaseLayer from "./WaterBaseLayer";
import RiverLayer from "./RiverLayer";
import SkyLayer from "./SkyLayer";
import WaterAmbientLayer from "./WaterAmbientLayer";
import IslandLayer from "./IslandLayer";

interface GameShellProps {
  children: React.ReactNode;
  showMapWorld?: boolean;
  titleBadge?: boolean;
}

const GameShell: React.FC<GameShellProps> = ({ children, showMapWorld = false }) => (
  <div
    className="game-shell"
    style={{
      position: "absolute",
      inset: 0,
      overflow: "hidden",
    }}
  >
    {showMapWorld && (
      <>
        <WaterBaseLayer />
        <RiverLayer />
        <WaterAmbientLayer />
        <IslandLayer hideBadges />
        <SkyLayer />
      </>
    )}
    {/* Children render on top of all layers */}
    <div style={{ position: "absolute", inset: 0, zIndex: 10 }}>
      {children}
    </div>
  </div>
);

export default GameShell;
