// =============================================
// StickerBookScreen.tsx — Sticker Book collection viewer
// WiggleWoo's Word Quest
// =============================================
// Displays a book UI with left page (room info + nav)
// and right page (2-col sticker grid). Sticker values
// are tracked individually: 0=not earned, 1=learned, 2=powered up.
// =============================================

import { useState, useMemo } from "react";
import {
  ENVIRONMENTS,
  EXPLORE_UNLOCK_ORDER,
  isEnvironmentUnlocked,
} from "../game/exploreData";
import type { EnvironmentConfig, FactItem } from "../game/exploreData";
import { loadStickers, getTotalStickerCount } from "../game/progression";
import bookOpenImg from "/assets/sticker book/sticker-book-open.png";
import "../styles/stickerbook.css";

interface StickerBookScreenProps {
  onBack: () => void;
}

/** Collect all fact items from an environment's props */
function getStickersForEnv(env: EnvironmentConfig): FactItem[] {
  const items: FactItem[] = [];
  if (env.props) {
    for (const prop of env.props) {
      if (prop.factPanel) {
        items.push(...prop.factPanel.items);
      }
    }
  }
  for (const hs of env.hotspots) {
    items.push({
      id: hs.id,
      name: hs.label,
      emoji: hs.emoji,
      fact: hs.fact,
    });
  }
  return items;
}

const StickerBookScreen: React.FC<StickerBookScreenProps> = ({ onBack }) => {
  const [pageIndex, setPageIndex] = useState(0);

  const stickerData = useMemo(() => loadStickers(), []);
  const totalStickerCount = useMemo(() => getTotalStickerCount(), []);

  // Build page data from environments
  const pages = useMemo(() => {
    return EXPLORE_UNLOCK_ORDER.map((envId) => {
      const env = ENVIRONMENTS[envId];
      const unlocked = isEnvironmentUnlocked(envId);
      const stickers = env ? getStickersForEnv(env) : [];
      const roomStickers = stickerData[envId] ?? {};
      return { envId, env, unlocked, stickers, roomStickers };
    });
  }, [stickerData]);

  const currentPage = pages[pageIndex];

  // Count total possible stickers (all fact items across all rooms)
  const totalPossible = pages.reduce((sum, p) => sum + p.stickers.length, 0);

  const goPrev = () => setPageIndex((i) => Math.max(0, i - 1));
  const goNext = () => setPageIndex((i) => Math.min(pages.length - 1, i + 1));

  return (
    <div className="stickerbook">
      {/* Back button */}
      <button className="stickerbook__back" onClick={onBack}>
        ← Back
      </button>

      {/* Total sticker count */}
      <div className="stickerbook__total">
        <span className="stickerbook__total-count">
          {totalStickerCount}/{totalPossible}
        </span>
      </div>

      {/* Book */}
      <div className="stickerbook__book-wrapper">
        <img
          className="stickerbook__book-img"
          src={bookOpenImg}
          alt="Sticker Book"
          draggable={false}
        />

        <div className="stickerbook__book-content">
          {/* Left page — room info + navigation */}
          <div className="stickerbook__page stickerbook__page--left">
            {currentPage?.env ? (
              <>
                <h2 className="stickerbook__room-title">{currentPage.env.name}</h2>
                <p className="stickerbook__room-desc">{currentPage.env.description}</p>
                <div className="stickerbook__room-count">
                  {currentPage.unlocked
                    ? (() => {
                        const earned = Object.keys(currentPage.roomStickers).filter(k => currentPage.roomStickers[k] > 0).length;
                        const max = currentPage.stickers.length;
                        return `${earned}/${max} stickers`;
                      })()
                    : "Locked"}
                </div>
              </>
            ) : (
              <p className="stickerbook__room-desc">Unknown room</p>
            )}

            {/* Navigation */}
            <div className="stickerbook__nav">
              <button
                className="stickerbook__nav-btn"
                onClick={goPrev}
                disabled={pageIndex === 0}
                aria-label="Previous page"
              >
                ◀
              </button>

              <div className="stickerbook__nav-dots">
                {pages.map((_, i) => (
                  <div
                    key={i}
                    className={`stickerbook__nav-dot ${i === pageIndex ? "stickerbook__nav-dot--active" : ""}`}
                    onClick={() => setPageIndex(i)}
                  />
                ))}
              </div>

              <button
                className="stickerbook__nav-btn"
                onClick={goNext}
                disabled={pageIndex === pages.length - 1}
                aria-label="Next page"
              >
                ▶
              </button>
            </div>
          </div>

          {/* Right page — sticker grid */}
          <div className="stickerbook__page stickerbook__page--right">
            <div className="stickerbook__grid">
              {currentPage?.stickers.map((sticker, i) => {
                const stickerValue = currentPage.roomStickers[sticker.id] ?? 0;
                const isEarned = stickerValue > 0;
                const isPowered = stickerValue >= 2;

                return (
                  <div
                    key={sticker.id}
                    className={`stickerbook__slot ${isEarned ? "stickerbook__slot--discovered" : ""} ${isPowered ? "stickerbook__slot--powered" : ""}`}
                  >
                    {isEarned ? (
                      <>
                        <span className="stickerbook__slot-emoji">{sticker.emoji}</span>
                        <span className="stickerbook__slot-label">{sticker.name}</span>
                        {isPowered && <span className="stickerbook__slot-badge">x2</span>}
                      </>
                    ) : currentPage.unlocked ? (
                      <span className="stickerbook__slot-placeholder">?</span>
                    ) : (
                      <span className="stickerbook__slot-placeholder">{i + 1}</span>
                    )}
                  </div>
                );
              })}
              {currentPage?.stickers.length === 0 &&
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={`empty-${i}`} className="stickerbook__slot">
                    <span className="stickerbook__slot-placeholder">?</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StickerBookScreen;
