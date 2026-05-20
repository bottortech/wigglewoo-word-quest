// =============================================
// ParentPrompt.tsx — Home-extension card after each lesson
// =============================================
// Slides in over the gameplay screen after the MasteryBadgeUnlock
// dismisses. One short prompt + an optional "ask at home" question
// + Got it button. Designed to be parent-facing without blocking the
// kid: the type is calm and the tap target is large so a 5-year-old
// can dismiss it themselves if a parent isn't around.
//
// Phase C addition for the curriculum redesign — gives educators /
// parents a concrete bridge from in-app practice to home conversation.
// =============================================

import React from "react";
import type { ParentPrompt as ParentPromptCopy } from "../game/parentPrompts";
import "../styles/parent-prompt.css";

interface ParentPromptProps {
  prompt: ParentPromptCopy;
  /** Fires when the parent / kid taps Got it. */
  onDismiss: () => void;
}

const ParentPrompt: React.FC<ParentPromptProps> = ({ prompt, onDismiss }) => {
  return (
    <div
      className="parent-prompt"
      role="dialog"
      aria-label="A tip for parents and teachers"
    >
      <div className="parent-prompt__card">
        <div className="parent-prompt__eyebrow">
          <span aria-hidden="true">👋</span> For Parents &amp; Teachers
        </div>
        <div className="parent-prompt__text">{prompt.text}</div>
        {prompt.ask && (
          <div className="parent-prompt__ask">
            <span className="parent-prompt__ask-label">Ask at home:</span>{" "}
            {prompt.ask}
          </div>
        )}
        <button
          type="button"
          className="parent-prompt__dismiss"
          onClick={onDismiss}
          autoFocus
        >
          Got it!
        </button>
      </div>
    </div>
  );
};

export default ParentPrompt;
