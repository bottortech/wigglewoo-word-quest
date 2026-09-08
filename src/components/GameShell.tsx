// =============================================
// GameShell.tsx — Full-viewport shell with optional map world layers
// WiggleWoo's Word Quest
// =============================================
// When showMapWorld is true, renders the water/sky/island
// layers behind children — used by PlayNowScreen to give
// the home screen a living ocean backdrop.

import { useEffect, useState } from "react";
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

const GameShell: React.FC<GameShellProps> = ({ children, showMapWorld = false }) => {
  // Mount the decorative water/island layers (20+ images) shortly after
  // the shell itself, so the lightweight foreground content (logo,
  // button, background) can finish compositing first instead of
  // competing with ~20 additional images for the WebView's GPU tile
  // budget in the same burst — on weak/low-RAM Android devices that
  // burst can exceed the compositor's tile memory limit and silently
  // fail to paint anything. A wall-clock delay (not requestAnimationFrame)
  // is used deliberately: it creates real separation even when the main
  // thread is still busy with initial bundle/render work, whereas
  // back-to-back rAFs can still land in the same burst. Same final
  // visual, just sequenced so low-end devices show something immediately.
  const [showWorld, setShowWorld] = useState(false);
  useEffect(() => {
    if (!showMapWorld) return;
    const t = setTimeout(() => setShowWorld(true), 600);
    return () => clearTimeout(t);
  }, [showMapWorld]);

  return (
    <div
      className="game-shell"
      style={{
        position: "absolute",
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        overflow: "hidden",
      }}
    >
      {showWorld && (
        <>
          <WaterBaseLayer />
          <RiverLayer />
          <WaterAmbientLayer />
          <IslandLayer hideBadges />
          <SkyLayer />
        </>
      )}
      {/* Children render on top of all layers */}
      <div style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0, zIndex: 10 }}>
        {children}
      </div>
    </div>
  );
};

export default GameShell;
