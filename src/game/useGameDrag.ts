// =============================================
// useGameDrag.ts — Pointer-event drag-and-drop
// Wigglewoo CVC Quest
// =============================================
// Custom hook encapsulating all drag behavior:
//   - Pointer capture (mobile Safari)
//   - Hit-testing against slot rects
//   - Snap-back animation on invalid drops
//   - Hover feedback during drag
//
// Uses pointer events (NOT HTML5 Drag API)
// because HTML5 drag is broken on mobile Safari.
//
// Mobile Safari specifics handled here:
//   - setPointerCapture on container
//   - touch-action: none via CSS on tiles
//   - No scrolling during drag (overscroll-behavior)
// =============================================

import { useState, useRef, useCallback, useEffect } from "react";
import type { SlotPosition, DragOperation } from "./types";
import {
  startDrag,
  updateDrag,
  hitTestDropTargets,
  measureDropTargets,
  getDragTransform,
  type DropTargetRect,
} from "./dragManager";

export interface DragResult {
  /** Active drag operation (null when idle) */
  drag: DragOperation | null;
  /** Which slot the pointer is hovering over */
  hoveredSlot: SlotPosition | null;
  /** Whether a snap-back animation is playing */
  snappingBack: boolean;
  /** CSS transform for the dragged tile */
  dragTransform: string | undefined;
  /** Refs array for the 3 word slot elements */
  slotRefs: React.MutableRefObject<(HTMLDivElement | null)[]>;
  /** Ref for the game container (attach to root div) */
  containerRef: React.RefObject<HTMLDivElement>;
  /** Start a drag from bank or slot */
  beginDrag: (
    tileId: string,
    letter: string,
    origin: "bank" | SlotPosition,
    e: React.PointerEvent
  ) => void;
  /** Attach to container onPointerMove */
  onPointerMove: (e: React.PointerEvent) => void;
  /** Attach to container onPointerUp — returns drop result */
  onPointerUp: (e: React.PointerEvent) => DropOutcome;
  /** Attach to container onPointerCancel */
  onPointerCancel: () => void;
  /** Trigger snap-back animation (call on invalid drop) */
  triggerSnapBack: () => void;
  /** Immediately clear drag (call on valid drop) */
  clearDrag: () => void;
}

export type DropOutcome =
  | { kind: "on-slot"; slotIndex: SlotPosition; tileId: string; letter: string }
  | { kind: "miss"; tileId: string }
  | { kind: "no-drag" };

/** Snap-back animation duration (ms) — must match CSS */
const SNAP_BACK_MS = 220;

export function useGameDrag(): DragResult {
  const [drag, setDrag] = useState<DragOperation | null>(null);
  const [hoveredSlot, setHoveredSlot] = useState<SlotPosition | null>(null);
  const [snappingBack, setSnappingBack] = useState(false);

  const slotRefs = useRef<(HTMLDivElement | null)[]>([null, null, null]);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropTargets = useRef<DropTargetRect[]>([]);
  const pointerIdRef = useRef<number | null>(null);

  // Measure drop targets on mount + resize + word change
  useEffect(() => {
    const measure = () => {
      dropTargets.current = measureDropTargets(slotRefs.current);
    };
    const raf = requestAnimationFrame(measure);
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", measure);
    };
  }, []);

  // Re-measure after any state change that might shift layout
  const remeasure = useCallback(() => {
    requestAnimationFrame(() => {
      dropTargets.current = measureDropTargets(slotRefs.current);
    });
  }, []);

  // ---- Start drag ----
  const beginDrag = useCallback(
    (
      tileId: string,
      letter: string,
      origin: "bank" | SlotPosition,
      e: React.PointerEvent
    ) => {
      e.preventDefault();
      e.stopPropagation();

      // Pointer capture → reliable tracking even if finger
      // drifts off the tile element (critical on mobile Safari)
      if (containerRef.current) {
        containerRef.current.setPointerCapture(e.pointerId);
        pointerIdRef.current = e.pointerId;
      }

      setDrag(startDrag(tileId, letter, origin, e.clientX, e.clientY));
      setSnappingBack(false);
      remeasure();
    },
    [remeasure]
  );

  // ---- Move ----
  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!drag || snappingBack) return;
      e.preventDefault();
      setDrag(updateDrag(drag, e.clientX, e.clientY));
      setHoveredSlot(
        hitTestDropTargets(e.clientX, e.clientY, dropTargets.current)
      );
    },
    [drag, snappingBack]
  );

  // ---- Drop — returns outcome, caller decides what to do ----
  const onPointerUp = useCallback(
    (e: React.PointerEvent): DropOutcome => {
      // Release pointer capture
      if (containerRef.current && pointerIdRef.current !== null) {
        try {
          containerRef.current.releasePointerCapture(pointerIdRef.current);
        } catch { /* already released */ }
        pointerIdRef.current = null;
      }

      if (!drag) return { kind: "no-drag" };

      e.preventDefault();
      setHoveredSlot(null);

      const hitSlot = hitTestDropTargets(
        e.clientX,
        e.clientY,
        dropTargets.current
      );

      if (hitSlot !== null) {
        return {
          kind: "on-slot",
          slotIndex: hitSlot,
          tileId: drag.tileId,
          letter: drag.letter,
        };
      }
      return { kind: "miss", tileId: drag.tileId };
    },
    [drag]
  );

  // ---- Cancel (finger left screen, etc.) ----
  const onPointerCancel = useCallback(() => {
    if (containerRef.current && pointerIdRef.current !== null) {
      try {
        containerRef.current.releasePointerCapture(pointerIdRef.current);
      } catch { /* already released */ }
      pointerIdRef.current = null;
    }
    setDrag(null);
    setHoveredSlot(null);
    setSnappingBack(false);
  }, []);

  // ---- Snap-back (invalid/missed drop) ----
  // Keeps drag state alive so the tile can animate back
  // to its bank position via CSS transition, then clears.
  const triggerSnapBack = useCallback(() => {
    setSnappingBack(true);
    setHoveredSlot(null);
    setTimeout(() => {
      setSnappingBack(false);
      setDrag(null);
    }, SNAP_BACK_MS);
  }, []);

  // ---- Clear (valid drop) ----
  const clearDrag = useCallback(() => {
    setDrag(null);
    setHoveredSlot(null);
    setSnappingBack(false);
  }, []);

  // ---- Drag transform for rendering ----
  const dragTransform =
    drag && !snappingBack ? getDragTransform(drag) : undefined;

  return {
    drag,
    hoveredSlot,
    snappingBack,
    dragTransform,
    slotRefs,
    containerRef,
    beginDrag,
    onPointerMove,
    onPointerUp,
    onPointerCancel,
    triggerSnapBack,
    clearDrag,
  };
}
