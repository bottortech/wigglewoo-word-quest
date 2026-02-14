// =============================================
// WordImage.tsx — CVC Word Image Display
// Wigglewoo CVC Quest
// =============================================
// Renders word images from /assets/words/{word}.png
// Images should be placed in public/assets/words/
// Falls back to emoji if image fails to load
// =============================================

import React, { useState } from "react";

/**
 * Fallback emojis in case image fails to load
 */
const WORD_EMOJI_FALLBACK: Record<string, string> = {
  // Short A (nodes 1-8)
  cat: "🐱", hat: "🎩", bat: "🦇", map: "🗺️",
  cap: "🧢", van: "🚐", ham: "🍖", cab: "🚕",
  // Short A (nodes 9-16)
  rat: "🐀", pan: "🍳", can: "🥫", fan: "🌀",
  bag: "🎒", nap: "😴", sad: "😢", tag: "🏷️",
  
  // Short I (nodes 1-8)
  sit: "🪑", pin: "📌", dig: "⛏️", lid: "🫕",
  wig: "💇", rip: "📄", mix: "🥣", zip: "🤐",
  // Short I (nodes 9-16)
  pig: "🐷", bib: "👶", hit: "🥊", kit: "🧰",
  tip: "💡", win: "🏆", fin: "🦈", sip: "🧃",
  
  // Short O (nodes 1-8)
  dog: "🐶", hop: "🐇", pot: "🍲", log: "🪵",
  box: "📦", mop: "🧹", cot: "🛏️", fox: "🦊",
  // Short O (nodes 9-16)
  cob: "🌽", dot: "⚫", jog: "🏃", rot: "🍂",
  top: "🔝", sob: "😭", pop: "🎈", nod: "👍",
  
  // Short U (nodes 1-8)
  cup: "☕", bus: "🚌", tub: "🛁", rug: "🧶",
  sun: "☀️", hug: "🤗", mud: "💩", bug: "🐛",
  // Short U (nodes 9-16)
  pup: "🐕", jug: "🫗", gum: "🫧", run: "🏃",
  fun: "🎉", dug: "🕳️", nut: "🥜", cut: "✂️",
  
  // Short E (nodes 1-8)
  bed: "🛏️", hen: "🐔", red: "🔴", pen: "🖊️",
  jet: "✈️", net: "🥅", wet: "💧", leg: "🦵",
  // Short E (nodes 9-16)
  pet: "🐾", ten: "🔟", beg: "🙏", peg: "🪝",
  set: "📐", get: "🎁", men: "👨", vet: "👨‍⚕️",
};

interface WordImageProps {
  imageKey: string;
  size?: number;
}

const WordImage: React.FC<WordImageProps> = ({ imageKey, size = 110 }) => {
  const [imageError, setImageError] = useState(false);
  
  // Image path: /assets/words/{word}.png (served from public folder)
  const imageSrc = `/assets/words/${imageKey}.png`;
  const fallbackEmoji = WORD_EMOJI_FALLBACK[imageKey] || "❓";

  // If image failed to load, show emoji fallback
  if (imageError) {
    return (
      <div
        className="word-image word-image--emoji"
        style={{
          width: size,
          height: size,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: size * 0.55,
          lineHeight: 1,
          userSelect: "none",
        }}
        aria-label={`Picture of ${imageKey}`}
      >
        {fallbackEmoji}
      </div>
    );
  }

  // Render actual image
  return (
    <div
      className="word-image"
      style={{
        width: size,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      aria-label={`Picture of ${imageKey}`}
    >
      <img
        src={imageSrc}
        alt={imageKey}
        style={{
          maxWidth: "100%",
          maxHeight: "100%",
          objectFit: "contain",
        }}
        onError={() => setImageError(true)}
        draggable={false}
      />
    </div>
  );
};

export default WordImage;
