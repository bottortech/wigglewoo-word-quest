// =============================================
// UnlockModal.tsx — Shows quest type unlock requirements
// Displayed when a locked quest type is tapped
// =============================================

import React from "react";
import { CVC_QUESTS } from "../game/wordData";
import { isQuestFullyComplete } from "../game/progression";
import "../styles/unlock-modal.css";

type QuestType = "CVC" | "CVCC" | "CVVC" | "CCVC";

// Which prerequisite quests must be completed to unlock each type
const PREREQ_MAP: Record<QuestType, { label: string; questIds: string[] }> = {
  CVC: { label: "CVC", questIds: [] }, // always unlocked
  CVCC: {
    label: "CVC",
    questIds: CVC_QUESTS.map((q) => q.id),
  },
  CVVC: {
    label: "CVCC",
    questIds: [], // TODO: fill when CVCC quests exist
  },
  CCVC: {
    label: "CVVC",
    questIds: [], // TODO: fill when CVVC quests exist
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
  };
  return vowelMap[questId] || questId;
}

interface UnlockModalProps {
  questType: QuestType;
  onClose: () => void;
}

const UnlockModal: React.FC<UnlockModalProps> = ({ questType, onClose }) => {
  const prereq = PREREQ_MAP[questType];
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
        <h2 className="unlock-modal__title">Unlock {questType} Quests</h2>
        <p className="unlock-modal__desc">
          Complete all {prereq.label} quests including the trophy challenge to
          unlock {questType} quests.
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
          Continue CVC
        </button>
      </div>
    </div>
  );
};

export default UnlockModal;
