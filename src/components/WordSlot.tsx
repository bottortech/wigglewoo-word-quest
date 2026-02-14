// =============================================
// WordSlot.tsx — Drop target for CVC letter
// Wigglewoo CVC Quest
// =============================================

import React, { forwardRef } from "react";
import type { SlotPosition, SlotState, LetterCategory } from "../game/types";
import { SLOT_CATEGORIES } from "../game/types";
import "../styles/game.css";

interface WordSlotProps {
  slotIndex: SlotPosition;
  state: SlotState;
  /** Whether a drag is hovering over this slot */
  isHovered: boolean;
  /** Whether WW is pointing at this slot (hint) */
  isHintTarget: boolean;
}

const SLOT_LABELS: Record<LetterCategory, string> = {
  consonant: "C",
  vowel: "V",
};

const WordSlot = forwardRef<HTMLDivElement, WordSlotProps>(
  ({ slotIndex, state, isHovered, isHintTarget }, ref) => {
    const category = SLOT_CATEGORIES[slotIndex];

    const className = [
      "word-slot",
      state.locked ? "word-slot--locked" : "",
      isHovered ? "word-slot--hovered" : "",
      isHintTarget ? "word-slot--hint" : "",
      state.placedLetter ? "word-slot--filled" : "",
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div ref={ref} className={className} data-slot-index={slotIndex}>
        {state.placedLetter ? (
          <span className="word-slot__letter">
            {state.placedLetter.toUpperCase()}
          </span>
        ) : (
          <span className="word-slot__placeholder">
            {SLOT_LABELS[category]}
          </span>
        )}
      </div>
    );
  }
);

WordSlot.displayName = "WordSlot";
export default WordSlot;
