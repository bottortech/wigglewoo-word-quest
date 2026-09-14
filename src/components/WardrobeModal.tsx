// =============================================
// WardrobeModal.tsx — Skin/costume selector
// with preview + spin transition
// WiggleWoo's Word Quest
// =============================================

import React, { useMemo, useState, useCallback, useEffect } from "react";
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

  // Main build only: which skin is currently being browsed, independent of
  // which one is actually equipped. Swiping/arrows here only move this —
  // they never equip (see goToOffset below). Kiosk ignores this entirely
  // and keeps its original browse-equips-immediately behavior, since every
  // skin is always unlocked there and it's a different, guided flow.
  // Reset to whatever's equipped each time the modal opens. (This effect
  // matches the same "sync local state to a prop" pattern already used a
  // few lines up for `unlocked`, and elsewhere in this codebase — the
  // render-time alternatives here would need either a ref mutation or an
  // impure localStorage read during render, both of which this project's
  // stricter lint rules reject outright.)
  const [browseSkinId, setBrowseSkinId] = useState<string | null>(null);
  useEffect(() => {
    if (isOpen) setBrowseSkinId(getActiveSkinId());
  }, [isOpen]);

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

  // The skin shown in preview: previewSkin (cosmetic spin target) first,
  // then — for the main build only — whatever's being browsed, falling
  // back to whatever's equipped. Kiosk never sets browseSkinId, so its
  // displayed skin is always just the active one, unchanged from before.
  const displayedSkinId = previewSkin ?? (requireContinue ? activeSkin : browseSkinId ?? activeSkin);
  const displayedSkin = skins.find((s) => s.skinId === displayedSkinId) ?? skins[0];

  const handleSelect = useCallback((skinId: string) => {
    if (skinId === activeSkin) return;
    // Safety net: never equip a locked skin, regardless of call site.
    if (!skins.find((s) => s.skinId === skinId)?.unlocked) return;

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
  }, [activeSkin, onSkinChanged, skins]);

  // ---- Carousel: one big character at a time, swipe or arrows to browse.
  // Kiosk (requireContinue): whichever is showing is provisionally equipped
  // — handleSelect fires on every browse step, unchanged from before. Every
  // skin is unlocked in kiosk builds, so there's no locked state to handle.
  // Main build (!requireContinue): browsing only moves browseSkinId, never
  // equips — see the explicit "Use This Character!" action below instead. ----
  const carouselIndex = Math.max(0, skins.findIndex((s) => s.skinId === displayedSkinId));

  const goToOffset = useCallback((offset: number) => {
    if (skins.length === 0) return;
    const nextIndex = (carouselIndex + offset + skins.length) % skins.length;
    const nextSkinId = skins[nextIndex].skinId;
    if (requireContinue) {
      handleSelect(nextSkinId);
    } else {
      setBrowseSkinId(nextSkinId);
    }
  }, [carouselIndex, skins, handleSelect, requireContinue]);

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

        {/* One big character at a time, swipe or arrows to browse — used by
            both the kiosk intro and the voluntary main-build wardrobe.
            Kiosk: browsing provisionally equips immediately (handleSelect
            fires every step); "Let's Go!" below just confirms and moves on.
            Main build: browsing only previews (goToOffset moves
            browseSkinId, never equips) — the action row below the carousel
            is what actually equips, or explains why it can't yet. */}
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
            <div className="wardrobe-carousel__img-wrap">
              <img
                src={displayedSkin.thumbnailPath}
                alt={displayedSkin.label}
                className={`wardrobe-carousel__img ${transitioning ? "wardrobe-preview__img--spin" : ""} ${!displayedSkin.unlocked ? "wardrobe-carousel__img--locked" : ""}`}
                draggable={false}
              />
              {!displayedSkin.unlocked && (
                <span className="wardrobe-carousel__lock-icon" aria-hidden="true">🔒</span>
              )}
            </div>
            <span className="wardrobe-carousel__label">{displayedSkin.label}</span>
            <div className="wardrobe-carousel__dots" aria-hidden="true">
              {skins.map((skin) => (
                <span
                  key={skin.skinId}
                  className={[
                    "wardrobe-carousel__dot",
                    skin.skinId === displayedSkinId ? "wardrobe-carousel__dot--active" : "",
                    !skin.unlocked ? "wardrobe-carousel__dot--locked" : "",
                  ].filter(Boolean).join(" ")}
                />
              ))}
            </div>

            {/* Main build only — kiosk keeps its own "Let's Go!" below. */}
            {!requireContinue && (
              <div className="wardrobe-carousel__action">
                {!displayedSkin.unlocked ? (
                  <span className="wardrobe-carousel__status wardrobe-carousel__status--locked">
                    🔒 Complete {displayedSkin.roomName} Discovery Room to unlock
                  </span>
                ) : displayedSkin.skinId === activeSkin ? (
                  <span className="wardrobe-carousel__status wardrobe-carousel__status--equipped">
                    ✓ Equipped
                  </span>
                ) : (
                  <button
                    type="button"
                    className="wardrobe-carousel__equip-btn"
                    onClick={() => handleSelect(displayedSkin.skinId)}
                  >
                    Use This Character!
                  </button>
                )}
              </div>
            )}
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
