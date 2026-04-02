// =============================================
// MiniGameHeader.tsx — Reusable prompt/header
// for Discovery Room mini-games
// =============================================

import React from "react";

interface MiniGameHeaderProps {
  title: string;
  subtitle?: string;
  accentColor?: string;
}

const MiniGameHeader: React.FC<MiniGameHeaderProps> = ({ title, subtitle, accentColor }) => {
  return (
    <div className="mg-header">
      <h2 className="mg-header__title" style={accentColor ? { color: accentColor } : undefined}>
        {title}
      </h2>
      {subtitle && <p className="mg-header__subtitle">{subtitle}</p>}
    </div>
  );
};

export default MiniGameHeader;
