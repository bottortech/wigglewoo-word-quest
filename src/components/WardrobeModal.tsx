// =============================================
// WardrobeModal.tsx — Skin/costume selector
// with preview + spin transition
// WiggleWoo's Word Quest
// =============================================

import React, { useMemo, useState, useCallback } from "react";
import {
  SKIN_REGISTRY,
  DEFAULT_SKIN_ID,
  loadUnlockedSkins,
  getActiveSkinId,
  setActiveSkin,
} from "../game/skins";
import "../styles/wardrobe.css";

// Default WiggleWoo thumbnail (bundled import)
import defaultThumb from "../assets/wiggle_woo_hero_stance.png";

interface WardrobeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSkinChanged: () => void;
}

interface SkinCard {
  skinId: string;
  label: string;
  thumbnailPath: string;
  unlocked: boolean;
  roomName: string;
}

const WardrobeModal: React.FC<WardrobeModalProps> = ({
  isOpen,
  onClose,
  onSkinChanged,
}) => {
  const unlocked = useMemo(() => new Set(loadUnlockedSkins()), [isOpen]);
  const [activeSkin, setActiveSkinLocal] = useState(() => getActiveSkinId());
  const [previewSkin, setPreviewSkin] = useState<string | null>(null);
  const [transitioning, setTransitioning] = useState(false);

  const skins: SkinCard[] = useMemo(() => {
    const cards: SkinCard[] = [
      {
        skinId: DEFAULT_SKIN_ID,
        label: "Classic WiggleWoo",
        thumbnailPath: defaultThumb,
        unlocked: true,
        roomName: "",
      },
    ];

    for (const def of SKIN_REGISTRY) {
      cards.push({
        skinId: def.skinId,
        label: def.label,
        thumbnailPath: def.thumbnailPath,
        unlocked: unlocked.has(def.skinId),
        roomName: def.label.replace(" WiggleWoo", ""),
      });
    }

    return cards;
  }, [unlocked]);

  // The skin shown in preview: previewSkin if transitioning, otherwise active
  const displayedSkinId = previewSkin ?? activeSkin;
  const displayedSkin = skins.find((s) => s.skinId === displayedSkinId) ?? skins[0];

  const handleSelect = useCallback((skinId: string) => {
    if (skinId === activeSkin) return;

    // Trigger spin-out transition
    setTransitioning(true);

    // After spin-out, swap to new skin and spin-in
    setTimeout(() => {
      setPreviewSkin(skinId);
      setActiveSkin(skinId);
      setActiveSkinLocal(skinId);
      onSkinChanged();

      // Clear transition after spin-in completes
      setTimeout(() => {
        setTransitioning(false);
        setPreviewSkin(null);
      }, 400);
    }, 300);
  }, [activeSkin, onSkinChanged]);

  if (!isOpen) return null;

  return (
    <div className="wardrobe-backdrop" onClick={onClose}>
      <div className="wardrobe-modal" onClick={(e) => e.stopPropagation()}>
        <div className="wardrobe-header">
          <h2 className="wardrobe-title">WiggleWoo's Wardrobe</h2>
          <button className="wardrobe-close" onClick={onClose} aria-label="Close wardrobe">
            &times;
          </button>
        </div>

        {/* Preview panel */}
        <div className="wardrobe-preview">
          <div className="wardrobe-preview__ring" />
          <img
            src={displayedSkin.thumbnailPath}
            alt={displayedSkin.label}
            className={`wardrobe-preview__img ${transitioning ? "wardrobe-preview__img--spin" : ""}`}
            draggable={false}
          />
          <span className="wardrobe-preview__label">{displayedSkin.label}</span>
        </div>

        <div className="wardrobe-grid">
          {skins.map((skin) => {
            const isActive = activeSkin === skin.skinId;
            return (
              <button
                key={skin.skinId}
                className={[
                  "wardrobe-card",
                  isActive ? "wardrobe-card--active" : "",
                  !skin.unlocked ? "wardrobe-card--locked" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => skin.unlocked && handleSelect(skin.skinId)}
                disabled={!skin.unlocked}
                aria-label={`${skin.label}${!skin.unlocked ? " (locked)" : ""}${isActive ? " (equipped)" : ""}`}
              >
                <div className="wardrobe-card__img-wrap">
                  <img
                    src={skin.thumbnailPath}
                    alt={skin.label}
                    className="wardrobe-card__img"
                    draggable={false}
                  />
                  {!skin.unlocked && (
                    <div className="wardrobe-card__lock-overlay">
                      <span className="wardrobe-card__lock-icon">🔒</span>
                    </div>
                  )}
                </div>
                <span className="wardrobe-card__label">{skin.label}</span>
                {isActive && <span className="wardrobe-card__equipped">Equipped</span>}
                {!skin.unlocked && (
                  <span className="wardrobe-card__hint">
                    Complete {skin.roomName} Discovery Room
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default WardrobeModal;
