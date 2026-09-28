// Hidden bottom-left corner: 3 quick taps open the event menu. Same gesture
// pattern as DemoResetZone (bottom-right) and GuidedDemoStartZone; in the
// event build this replaces the latter, since the menu offers the guided
// demo among its options.

import { useRef, useCallback } from "react";
import "./EventMenu.css";

const REQUIRED_TAPS = 3;
const TAP_WINDOW_MS = 2500;

export default function EventMenuZone({ onOpen }: { onOpen: () => void }) {
  const taps = useRef<number[]>([]);

  const handleTap = useCallback(() => {
    const now = Date.now();
    taps.current = [...taps.current, now].filter((t) => now - t < TAP_WINDOW_MS);
    if (taps.current.length >= REQUIRED_TAPS) {
      taps.current = [];
      onOpen();
    }
  }, [onOpen]);

  return <div className="evm-zone" onPointerDown={handleTap} aria-hidden="true" />;
}
