// =============================================
// IslandLayer.tsx — Positioned island & landmark assets
// WiggleWoo's Word Quest
// =============================================
// Renders decorative islands, land fills, vehicles,
// bridge, submarine, and explorable landmarks.
// Landmarks show a pulsing explore badge when unlocked.
// All positioning is percentage-based for responsiveness.

import { useMemo } from "react";
import { LANDMARK_POSITIONS } from "../game/exploreData";
import "./IslandLayer.css";

// ---- Static decorative items (no interaction) ----
interface DecoItem {
  src: string;
  x: number; // % from left
  y: number; // % from top
  w: number; // % width
  z?: number; // z-index for stacking
  extra?: string; // additional CSS class
}

const DECO_ITEMS: DecoItem[] = [
  // Left island (castle sits here) — upper-left
  { src: "/assets/land-fill-1.png", x: 0, y: 8, w: 38 },
  // Center-left land (volcano area) — mid-left
  { src: "/assets/land-fill-2.png", x: 18, y: 22, w: 36 },
  // Bottom-left land patch
  { src: "/assets/land-fill-3.png", x: 5, y: 55, w: 40 },
  // Upper-right island (industrial city)
  { src: "/assets/land-fill-4.png", x: 55, y: 5, w: 38 },
  // Center-right land
  { src: "/assets/land-fill-5.png", x: 48, y: 35, w: 32 },
  // Bottom-right (greenhouse area)
  { src: "/assets/land-fill-6.png", x: 58, y: 55, w: 36 },
  // Bridge — connecting village to land above it
  { src: "/assets/bridge.png", x: 9, y: 70, w: 18, z: 6, extra: "island-layer__item--bridge-left" },
  // Bridge — connecting center to right
  { src: "/assets/bridge.png", x: 46, y: 25, w: 20, z: 6, extra: "island-layer__item--bridge-right" },
  // Vehicles
  { src: "/assets/land-vehicle-1.png", x: 30, y: 52, w: 9 },
  { src: "/assets/land-vehicle-2.png", x: 72, y: 48, w: 7 },
  // Submarine — left side in the water
  { src: "/assets/submarine.png", x: 28, y: 72, w: 11, extra: "island-layer__item--submarine" },
  // Shipwreck — in the water between nodes 6 and 7
  { src: "/assets/shipwreck.png", x: 55, y: 68, w: 14, extra: "island-layer__item--shipwreck" },
];

// ---- Explorable landmarks ----
interface LandmarkDef {
  envId: string;
  src: string;
  emoji: string;
}

const LANDMARKS: LandmarkDef[] = [
  { envId: "valcano",               src: "/assets/valcano.png",               emoji: "🌋" },
  { envId: "castle-island",         src: "/assets/castle-island.png",         emoji: "🏰" },
  { envId: "small-coastal-village", src: "/assets/small-coastal-village.png", emoji: "🏘️" },
  { envId: "industrial-tech-city",  src: "/assets/industrial-tech-city.png",  emoji: "⚙️" },
  { envId: "glass-dome",            src: "/assets/glass-dome.png",            emoji: "🌿" },
];

interface IslandLayerProps {
  onExplore?: (envId: string) => void;
  revision?: number; // bump to re-check unlock state
  devUnlock?: boolean; // dev mode — unlock all rooms
  hideBadges?: boolean; // hide explore badges (used on PlayNowScreen)
}

const IslandLayer: React.FC<IslandLayerProps> = ({ onExplore, revision = 0, devUnlock = false, hideBadges = false }) => {
  // Islands are decorative — discovery rooms are accessed via the quest map node
  // Only dev mode makes them directly clickable
  const unlockedSet = useMemo(() => {
    const set = new Set<string>();
    if (devUnlock) {
      for (const lm of LANDMARKS) {
        set.add(lm.envId);
      }
    }
    return set;
  }, [revision, devUnlock]);

  return (
    <div className="island-layer">
      {/* ---- Decorative items ---- */}
      {DECO_ITEMS.map((item, i) => (
        <div
          key={`deco-${i}`}
          style={{
            position: "absolute",
            left: `${item.x}%`,
            top: `${item.y}%`,
            width: `${item.w}%`,
            ...(item.z != null && { zIndex: item.z }),
          }}
        >
          <img
            className={`island-layer__item ${item.extra ?? ""}`}
            src={item.src}
            alt=""
            draggable={false}
            style={{ width: "100%" }}
          />
        </div>
      ))}

      {/* ---- Explorable landmarks ---- */}
      {LANDMARKS.map((lm) => {
        const pos = LANDMARK_POSITIONS[lm.envId];
        if (!pos) return null;
        const unlocked = unlockedSet.has(lm.envId);

        return (
          <div
            key={lm.envId}
            className={`island-layer__landmark-wrap`}
            style={{
              position: "absolute",
              left: `${pos.x}%`,
              top: `${pos.y}%`,
              width: `${22 * pos.s}%`,
              transform: "translate(-50%, -50%)",
              cursor: unlocked && onExplore ? "pointer" : "default",
              pointerEvents: unlocked && onExplore ? "auto" : "none",
            }}
            onClick={unlocked && onExplore ? () => onExplore(lm.envId) : undefined}
          >
            <img
              className={`island-layer__item ${unlocked ? "island-layer__item--explorable" : ""} ${lm.envId === "_none" ? "island-layer__item--highlight" : ""}`}
              src={lm.src}
              alt=""
              draggable={false}
              style={{ width: "100%" }}
            />
            {unlocked && !hideBadges && (
              <div className="island-layer__explore-badge">
                <span className="island-layer__explore-icon">{lm.emoji}</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default IslandLayer;
