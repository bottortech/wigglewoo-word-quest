// =============================================
// ScreenGate.tsx — Holds screen invisible until all
// images within are loaded, then fades in smoothly.
// Prevents "popping in" of elements during recording.
// =============================================

import { useRef, useState, useEffect, useCallback } from "react";

interface ScreenGateProps {
  children: React.ReactNode;
  /** Max ms to wait before revealing anyway (default 3000) */
  timeout?: number;
  /** Fade duration in ms (default 300) */
  fadeDuration?: number;
}

const ScreenGate: React.FC<ScreenGateProps> = ({
  children,
  timeout = 3000,
  fadeDuration = 300,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  const reveal = useCallback(() => {
    setReady(true);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) { reveal(); return; }

    // Safety timeout — reveal even if some images are slow
    const timer = setTimeout(reveal, timeout);

    // Check all <img> elements inside the container
    const checkImages = () => {
      const imgs = el.querySelectorAll("img");
      if (imgs.length === 0) {
        // No images — reveal after one frame to let layout settle
        requestAnimationFrame(() => requestAnimationFrame(reveal));
        clearTimeout(timer);
        return;
      }

      let loaded = 0;
      const total = imgs.length;

      const onLoad = () => {
        loaded++;
        if (loaded >= total) {
          clearTimeout(timer);
          // One extra frame to let browser paint
          requestAnimationFrame(reveal);
        }
      };

      for (const img of imgs) {
        if (img.complete && img.naturalWidth > 0) {
          loaded++;
        } else {
          img.addEventListener("load", onLoad, { once: true });
          img.addEventListener("error", onLoad, { once: true });
        }
      }

      // All already loaded
      if (loaded >= total) {
        clearTimeout(timer);
        requestAnimationFrame(reveal);
      }
    };

    // Wait one frame so children have rendered their <img> tags
    requestAnimationFrame(checkImages);

    return () => clearTimeout(timer);
  }, [reveal, timeout]);

  return (
    <div
      ref={containerRef}
      style={{
        opacity: ready ? 1 : 0,
        transition: `opacity ${fadeDuration}ms ease-in`,
        width: "100%",
        height: "100%",
      }}
    >
      {children}
    </div>
  );
};

export default ScreenGate;
