import React from "react";
import { LETTER_PATHS } from "./letterPaths";
import "../../styles/trace-moment.css";

const SORTED_LETTERS = Object.keys(LETTER_PATHS).sort();

const LetterGallery: React.FC = () => (
  <div style={{
    position: "fixed", inset: 0, zIndex: 9999,
    background: "#0a0a14",
    overflowY: "auto",
    padding: "24px",
  }}>
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      marginBottom: 20,
    }}>
      <h1 style={{ color: "#eaf6ff", fontFamily: "sans-serif", fontSize: 18, margin: 0 }}>
        Letter Gallery — bubble-letter preview ({SORTED_LETTERS.length} letters)
      </h1>
      <span style={{ color: "rgba(255,255,255,0.35)", fontFamily: "monospace", fontSize: 12 }}>
        ?dev=letters
      </span>
    </div>

    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
      gap: 16,
    }}>
      {SORTED_LETTERS.map((letter) => {
        const path = LETTER_PATHS[letter];
        return (
          <div key={letter} style={{
            background: "rgba(255,255,255,0.04)",
            borderRadius: 12,
            padding: "12px 8px 8px",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
          }}>
            <span style={{
              color: "rgba(255,255,255,0.5)",
              fontFamily: "monospace", fontSize: 11, letterSpacing: "0.08em",
            }}>
              {letter}
            </span>

            <svg
              viewBox={path.viewBox}
              style={{ width: 90, height: 90 }}
              preserveAspectRatio="xMidYMid meet"
            >
              <path className="trace-moment__letter-body-outer" d={path.d} />
              <path className="trace-moment__letter-body-inner" d={path.d} />
              <path className="trace-moment__path-guide" d={path.d} />

              {path.startHint && (
                <g
                  transform={`translate(${path.startHint.x} ${path.startHint.y}) rotate(${path.startHintAngle ?? -90})`}
                >
                  <path d="M -4 -3 L 1 0 L -4 3 z" className="trace-moment__arrow-head" />
                </g>
              )}
            </svg>
          </div>
        );
      })}
    </div>
  </div>
);

export default LetterGallery;
