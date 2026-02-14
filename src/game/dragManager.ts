// =============================================
// dragManager.ts — Touch/pointer drag-and-drop
// Wigglewoo CVC Quest
// =============================================
// Uses pointer events (pointerdown/move/up) for
// unified mouse + touch handling.
//
// Mobile Safari compatibility:
//   - touch-action: none on draggable elements
//   - No HTML5 drag API (broken on mobile)
//   - Manual hit-testing against drop targets
//   - setPointerCapture for reliable tracking
// =============================================

import type { SlotPosition, DragOperation } from "./types";

/** Rectangle for hit-testing drop targets */
export interface DropTargetRect {
  slotIndex: SlotPosition;
  left: number;
  top: number;
  right: number;
  bottom: number;
}

/**
 * Hit-test a point against an array of drop target rects.
 * Returns the slotIndex if the point is inside a target, null otherwise.
 */
export function hitTestDropTargets(
  x: number,
  y: number,
  targets: DropTargetRect[]
): SlotPosition | null {
  for (const t of targets) {
    if (x >= t.left && x <= t.right && y >= t.top && y <= t.bottom) {
      return t.slotIndex;
    }
  }
  return null;
}

/**
 * Create a drag operation from a pointer event on a letter tile.
 */
export function startDrag(
  tileId: string,
  letter: string,
  origin: "bank" | SlotPosition,
  clientX: number,
  clientY: number
): DragOperation {
  return {
    tileId,
    letter,
    origin,
    currentX: clientX,
    currentY: clientY,
    startX: clientX,
    startY: clientY,
  };
}

/**
 * Update drag position during pointermove.
 */
export function updateDrag(
  drag: DragOperation,
  clientX: number,
  clientY: number
): DragOperation {
  return { ...drag, currentX: clientX, currentY: clientY };
}

/**
 * Calculate snap-back animation origin (for invalid drops).
 * Returns the delta from current position to start position.
 */
export function getSnapBackDelta(drag: DragOperation): {
  dx: number;
  dy: number;
} {
  return {
    dx: drag.startX - drag.currentX,
    dy: drag.startY - drag.currentY,
  };
}

/**
 * Get the CSS transform for a tile being dragged.
 * Offset from its original position.
 */
export function getDragTransform(drag: DragOperation): string {
  const dx = drag.currentX - drag.startX;
  const dy = drag.currentY - drag.startY;
  return `translate(${dx}px, ${dy}px) scale(1.1)`;
}

/**
 * Measure drop target rects from DOM elements.
 * Call this once on mount and on resize.
 */
export function measureDropTargets(
  slotElements: (HTMLElement | null)[]
): DropTargetRect[] {
  const targets: DropTargetRect[] = [];

  slotElements.forEach((el, i) => {
    if (!el) return;
    const rect = el.getBoundingClientRect();
    targets.push({
      slotIndex: i as SlotPosition,
      left: rect.left,
      top: rect.top,
      right: rect.right,
      bottom: rect.bottom,
    });
  });

  return targets;
}
