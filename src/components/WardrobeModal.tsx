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
  /** Kiosk intro step: no X / backdrop-dismiss — the kid must tap the
   *  Continue button, so picking a character always reads as a
   *  deliberate first step rather than something to dismiss past. */
  requireContinue?: boolean;
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
  requireContinue = false,
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

    // Commit the actual selection immediately, decoupled from the visual
    // spin transition below. Previously the localStorage write (setActiveSkin)
    // was itself inside the 300ms transition delay — a fast "pick a
    // character, then immediately tap Let's Go" tap sequence could route
    // to the next screen before the write landed, so gameplay/trophy/
    // discovery-room screens read back the still-default skin. The data
    // commit must never be gated behind an animation timer.
    setActiveSkin(skinId);
    setActiveSkinLocal(skinId);
    onSkinChanged();

    // Visual spin-out/spin-in stays on its own timer — purely cosmetic.
    setTransitioning(true);
    setTimeout(() => {
      setPreviewSkin(skinId);
      setTimeout(() => {
        setTransitioning(false);
        setPreviewSkin(null);
      }, 400);
    }, 300);
  }, [activeSkin, onSkinChanged]);

  // ---- Kiosk carousel: one big character at a time, swipe or arrows to
  // browse. Whichever is showing is provisionally equipped (handleSelect
  // already does this); "Let's Go!" just confirms and moves on. Every
  // skin is unlocked in kiosk builds, so there's no locked state to
  // handle here. ----
  const carouselIndex = Math.max(0, skins.findIndex((s) => s.skinId === activeSkin));

  const goToOffset = useCallback((offset: number) => {
    if (skins.length === 0) return;
    const nextIndex = (carouselIndex + offset + skins.length) % skins.length;
    handleSelect(skins[nextIndex].skinId);
  }, [carouselIndex, skins, handleSelect]);

  const handlePrev = useCallback(() => goToOffset(-1), [goToOffset]);
  const handleNext = useCallback(() => goToOffset(1), [goToOffset]);

  const swipeStartX = React.useRef<number | null>(null);
  const handleSwipeStart = useCallback((e: React.PointerEvent) => {
    swipeStartX.current = e.clientX;
  }, []);
  const handleSwipeEnd = useCallback((e: React.PointerEvent) => {
    if (swipeStartX.current === null) return;
    const delta = e.clientX - swipeStartX.current;
    swipeStartX.current = null;
    const SWIPE_THRESHOLD = 36;
    if (delta > SWIPE_THRESHOLD) handlePrev();
    else if (delta < -SWIPE_THRESHOLD) handleNext();
  }, [handlePrev, handleNext]);

  if (!isOpen) return null;

  return (
    <div className="wardrobe-backdrop" onClick={requireContinue ? undefined : onClose}>
      <div className="wardrobe-modal" onClick={(e) => e.stopPropagation()}>
        <div className="wardrobe-header">
          <h2 className="wardrobe-title">
            {requireContinue ? "Choose Your WiggleWoo!" : "WiggleWoo's Wardrobe"}
          </h2>
          {!requireContinue && (
            <button className="wardrobe-close" onClick={onClose} aria-label="Close wardrobe">
              &times;
            </button>
          )}
        </div>

        {requireContinue ? (
          /* Kiosk carousel — one big character at a time. Swipe or use
             the arrow buttons; whichever is showing is the provisional
             pick, "Let's Go!" below just confirms it. */
          <div className="wardrobe-carousel">
            <button
              type="button"
              className="wardrobe-carousel__arrow wardrobe-carousel__arrow--prev"
              onClick={handlePrev}
              aria-label="Previous character"
            >
              ‹
            </button>

            <div
              className="wardrobe-carousel__stage"
              onPointerDown={handleSwipeStart}
              onPointerUp={handleSwipeEnd}
            >
              <img
                src={displayedSkin.thumbnailPath}
                alt={displayedSkin.label}
                className={`wardrobe-carousel__img ${transitioning ? "wardrobe-preview__img--spin" : ""}`}
                draggable={false}
              />
              <span className="wardrobe-carousel__label">{displayedSkin.label}</span>
              <div className="wardrobe-carousel__dots" aria-hidden="true">
                {skins.map((skin) => (
                  <span
                    key={skin.skinId}
                    className={`wardrobe-carousel__dot ${skin.skinId === activeSkin ? "wardrobe-carousel__dot--active" : ""}`}
                  />
                ))}
              </div>
            </div>

            <button
              type="button"
              className="wardrobe-carousel__arrow wardrobe-carousel__arrow--next"
              onClick={handleNext}
              aria-label="Next character"
            >
              ›
            </button>
          </div>
        ) : (
          /* Scrollable body — header stays fixed above; only the
             preview + grid scroll. */
          <div className="wardrobe-scroll-body">
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
        )}

        {requireContinue && (
          <button className="wardrobe-continue-btn" onClick={onClose}>
            Let's Go!
          </button>
        )}
      </div>
    </div>
  );
};

export default WardrobeModal;
