// =============================================
// UnlockModal.tsx — Shows quest tier unlock requirements
// Displayed when a locked quest tier is tapped
// =============================================

import React from "react";
import { CVC_QUEST_IDS, CVCC_QUEST_IDS, MAGIC_E_QUEST_IDS, CVVC_QUEST_IDS } from "../game/questIds";
import { isQuestFullyComplete } from "../game/progression";
import "../styles/unlock-modal.css";

type QuestType = "CVC" | "CVCC" | "MAGIC_E" | "CVVC" | "ADVANCED";

// Tier display names (user-facing)
const TIER_NAMES: Record<QuestType, string> = {
  CVC: "Sound Builders",
  CVCC: "Blending Power",
  MAGIC_E: "Magic E",
  CVVC: "Vowel Teams",
  ADVANCED: "Advanced Reading",
};

// Which prerequisite quests must be completed to unlock each tier
const PREREQ_MAP: Record<QuestType, { tierName: string; questIds: string[] }> = {
  CVC: { tierName: "Sound Builders", questIds: [] },
  CVCC: {
    tierName: "Sound Builders",
    questIds: [...CVC_QUEST_IDS],
  },
  MAGIC_E: {
    tierName: "Blending Power",
    questIds: [...CVCC_QUEST_IDS],
  },
  CVVC: {
    tierName: "Magic E",
    questIds: [...MAGIC_E_QUEST_IDS],
  },
  ADVANCED: {
    tierName: "Vowel Teams",
    questIds: [...CVVC_QUEST_IDS],
  },
};

// Map quest ID to short display name
function questDisplayName(questId: string): string {
  const vowelMap: Record<string, string> = {
    "quest-short-a": "Short A",
    "quest-short-e": "Short E",
    "quest-short-i": "Short I",
    "quest-short-o": "Short O",
    "quest-short-u": "Short U",
    "quest-cvcc-short-a": "Short A Blends",
    "quest-cvcc-short-e": "Short E Blends",
    "quest-cvcc-short-i": "Short I Blends",
    "quest-cvcc-short-o": "Short O Blends",
    "quest-cvcc-short-u": "Short U Blends",
    "quest-magic-e-a": "Magic E: A",
    "quest-magic-e-i": "Magic E: I",
    "quest-magic-e-o": "Magic E: O",
    "quest-magic-e-u": "Magic E: U",
    "quest-magic-e-mixed": "Magic E: Mixed",
    "quest-cvvc-long-a": "Long A Teams",
    "quest-cvvc-long-e": "Long E Teams",
    "quest-cvvc-long-o": "Long O Teams",
    "quest-cvvc-long-u": "OO Teams",
    "quest-cvvc-mixed-ea": "EA Teams",
  };
  return vowelMap[questId] || questId;
}

interface UnlockModalProps {
  questType: QuestType;
  onClose: () => void;
}

const UnlockModal: React.FC<UnlockModalProps> = ({ questType, onClose }) => {
  const prereq = PREREQ_MAP[questType];
  const tierName = TIER_NAMES[questType];
  const completionStatus = prereq.questIds.map((id) => ({
    id,
    label: questDisplayName(id),
    complete: isQuestFullyComplete(id),
  }));
  const completedCount = completionStatus.filter((s) => s.complete).length;
  const totalCount = completionStatus.length;

  return (
    <div className="unlock-modal-overlay" onClick={onClose}>
      <div className="unlock-modal" onClick={(e) => e.stopPropagation()}>
        <div className="unlock-modal__icon">🔒</div>
        <h2 className="unlock-modal__title">Unlock {tierName}</h2>
        <p className="unlock-modal__desc">
          Complete all {prereq.tierName} quests including the trophy challenge to
          unlock {tierName} quests.
        </p>

        <div className="unlock-modal__progress">
          <div className="unlock-modal__progress-bar">
            <div
              className="unlock-modal__progress-fill"
              style={{
                width: totalCount > 0 ? `${(completedCount / totalCount) * 100}%` : "0%",
              }}
            />
          </div>
          <span className="unlock-modal__progress-text">
            {completedCount} / {totalCount} complete
          </span>
        </div>

        <ul className="unlock-modal__list">
          {completionStatus.map((s) => (
            <li key={s.id} className={`unlock-modal__item ${s.complete ? "unlock-modal__item--done" : ""}`}>
              <span className="unlock-modal__item-icon">{s.complete ? "✅" : "🔒"}</span>
              <span className="unlock-modal__item-label">{s.label}</span>
            </li>
          ))}
        </ul>

        <button className="unlock-modal__btn" onClick={onClose}>
          Got it
        </button>
      </div>
    </div>
  );
};

export default UnlockModal;
