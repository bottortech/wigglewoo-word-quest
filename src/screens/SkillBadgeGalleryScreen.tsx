// =============================================
// SkillBadgeGalleryScreen.tsx — Earned-badge collection view
// =============================================
// Phase C. Surfaces every lesson mastery badge the kid has earned
// (and what's still empty) so kids feel collection progress and
// parents can see at a glance which sounds the kid has mastered.
//
// One row per loaded quest. Each row shows 4 badge slots — filled
// silver-star for earned lessons, dim outline for not-yet. Lazy-
// loaded higher-tier quests appear here once they've been pulled in,
// which happens automatically when the kid progresses past CVC.
// =============================================

import React, { useMemo } from "react";
import { getLoadedQuests } from "../game/wordData";
import { loadLessonMastery } from "../game/progression";
import { LESSONS_PER_QUEST } from "../game/types";
import type { Quest, PatternType } from "../game/types";
import "../styles/badge-gallery.css";

interface SkillBadgeGalleryScreenProps {
  onBack: () => void;
}

const TIER_LABEL: Record<PatternType, string> = {
  cvc: "Sound Builders",
  cvcc: "Blending Power",
  "magic-e": "Magic E",
  cvvc: "Vowel Teams",
  advanced: "Advanced Reading",
};

const LESSON_BADGE_NAME = ["Listener", "Builder", "Master", "Champion"] as const;

const SkillBadgeGalleryScreen: React.FC<SkillBadgeGalleryScreenProps> = ({
  onBack,
}) => {
  const quests = useMemo<Quest[]>(() => getLoadedQuests(), []);

  // Group by patternType so the tiers read as sections.
  const grouped = useMemo(() => {
    const groups = new Map<PatternType, Quest[]>();
    for (const q of quests) {
      const list = groups.get(q.patternType) ?? [];
      list.push(q);
      groups.set(q.patternType, list);
    }
    // Order: cvc → cvcc → magic-e → cvvc → advanced
    const order: PatternType[] = ["cvc", "cvcc", "magic-e", "cvvc", "advanced"];
    return order
      .filter((p) => groups.has(p))
      .map((p) => ({ tier: p, quests: groups.get(p) ?? [] }));
  }, [quests]);

  // Roll-up across all loaded quests.
  const totals = useMemo(() => {
    let earned = 0;
    let total = 0;
    for (const q of quests) {
      const mastery = loadLessonMastery(q.id);
      earned += mastery.filter(Boolean).length;
      total += LESSONS_PER_QUEST;
    }
    return { earned, total };
  }, [quests]);

  return (
    <div className="badge-gallery">
      <div className="badge-gallery__header">
        <button
          type="button"
          className="badge-gallery__back"
          onClick={onBack}
          aria-label="Back to quest map"
        >
          ← Back
        </button>
        <h1 className="badge-gallery__title">
          <span className="badge-gallery__title-star" aria-hidden="true">★</span>{" "}
          Skill Badges
        </h1>
        <div className="badge-gallery__counter" aria-label="Badges earned">
          {totals.earned} / {totals.total}
        </div>
      </div>

      <div className="badge-gallery__body">
        {grouped.map(({ tier, quests }) => (
          <section className="badge-gallery__tier" key={tier}>
            <h2 className="badge-gallery__tier-title">{TIER_LABEL[tier]}</h2>
            <ul className="badge-gallery__quests">
              {quests.map((quest) => {
                const mastery = loadLessonMastery(quest.id);
                const earned = mastery.filter(Boolean).length;
                const focusLabel = quest.title.includes(":")
                  ? quest.title.slice(quest.title.lastIndexOf(":") + 1).trim()
                  : quest.title;
                return (
                  <li className="badge-gallery__quest" key={quest.id}>
                    <div className="badge-gallery__quest-info">
                      <div className="badge-gallery__quest-name">{focusLabel}</div>
                      <div className="badge-gallery__quest-progress">
                        {earned} of {LESSONS_PER_QUEST} mastered
                      </div>
                    </div>
                    <div className="badge-gallery__slots" role="list">
                      {mastery.map((earned, idx) => (
                        <div
                          key={idx}
                          className={`badge-gallery__slot ${earned ? "badge-gallery__slot--earned" : ""}`}
                          role="listitem"
                          aria-label={`${LESSON_BADGE_NAME[idx]} badge ${earned ? "earned" : "not yet earned"}`}
                          title={LESSON_BADGE_NAME[idx]}
                        >
                          <span className="badge-gallery__slot-star" aria-hidden="true">★</span>
                          <span className="badge-gallery__slot-label">{LESSON_BADGE_NAME[idx]}</span>
                        </div>
                      ))}
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
};

export default SkillBadgeGalleryScreen;
