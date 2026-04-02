// =============================================
// MiniGameFeedback.tsx — Shared success/failure
// feedback for all Discovery Room mini-games
// =============================================

import React, { useEffect, useState } from "react";

interface MiniGameFeedbackProps {
  type: "success" | "error" | null;
  message?: string;
  onDone?: () => void;
}

const MiniGameFeedback: React.FC<MiniGameFeedbackProps> = ({ type, message, onDone }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!type) { setVisible(false); return; }
    setVisible(true);
    const t = setTimeout(() => {
      setVisible(false);
      onDone?.();
    }, type === "success" ? 1200 : 800);
    return () => clearTimeout(t);
  }, [type, onDone]);

  if (!visible || !type) return null;

  return (
    <div className={`mg-feedback mg-feedback--${type}`}>
      <span className="mg-feedback__emoji">
        {type === "success" ? "⭐" : "💨"}
      </span>
      {message && <span className="mg-feedback__text">{message}</span>}
    </div>
  );
};

export default MiniGameFeedback;
