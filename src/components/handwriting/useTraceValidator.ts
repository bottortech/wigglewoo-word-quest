// =============================================
// useTraceValidator.ts — Forgiving trace validation
// =============================================
// Samples the SVG path into N waypoints. Each waypoint
// is a hit target with a generous radius (in SVG units).
// Coverage = hit count / N. When coverage crosses the
// threshold, onSuccess fires once. No fail state, no
// timer, no order requirement. Lift-and-continue works.
//
// Single-pointer only: ignores additional fingers so
// palm rests / multi-touch gestures don't interfere.
// =============================================

import { useCallback, useEffect, useRef, useState } from "react";

interface Pt { x: number; y: number; }

interface UseTraceValidatorOpts {
  pathRef: React.RefObject<SVGPathElement | null>;
  svgRef: React.RefObject<SVGSVGElement | null>;
  onSuccess: () => void;
  /** Hit radius in SVG units (viewBox space). Default 5. Tightened from
   *  9 → 5 so the filled trace tracks the cursor within a fraction of a
   *  dash; with 60 waypoints over a ~200-unit path the spacing is ~3.4
   *  units, so the cursor hits one waypoint at a time instead of 2-3. */
  hitRadius?: number;
  /** Number of waypoints sampled along the path. Default 60. Increased
   *  from 40 → 60 for finer resolution that complements the tighter
   *  hit radius without making the trace harder to pass. */
  waypointCount?: number;
  /** 0..1 fraction of waypoints needed to trigger success. Default 0.85.
   *  Raised from 0.6 → 0.85 so success requires actually tracing most
   *  of the letter, not just sweeping through ~25% of it. Combined
   *  with requireEnd, the kid has to reach the final waypoint AND
   *  cover at least 85% of all waypoints before onSuccess fires. */
  coverageThreshold?: number;
  /** When true, success also requires the LAST waypoint to be hit
   *  (i.e. the kid actually reached the end of the letter). Default
   *  true — prevents early success when the kid covers the middle
   *  but skips the tail. Set false to restore old "any 60% somewhere"
   *  behavior. */
  requireEnd?: boolean;
}

interface UseTraceValidatorReturn {
  onPointerDown: (e: React.PointerEvent<SVGSVGElement>) => void;
  onPointerMove: (e: React.PointerEvent<SVGSVGElement>) => void;
  onPointerUp: (e: React.PointerEvent<SVGSVGElement>) => void;
  onPointerCancel: (e: React.PointerEvent<SVGSVGElement>) => void;
  /** 0..1 progress for visual fill */
  coverage: number;
  /** Per-waypoint hit state — exposed so callers can build a dasharray
   *  that fills only the actual traced portions (matters for letters with
   *  multiple sub-paths like M and T). */
  hitMask: boolean[];
  /** Live pointer position in SVG coords, or null if not tracing */
  pointerPos: Pt | null;
  /** Total path length in SVG units (for stroke-dasharray fill) */
  pathLength: number;
}

export function useTraceValidator(opts: UseTraceValidatorOpts): UseTraceValidatorReturn {
  const HIT_R = opts.hitRadius ?? 5;
  const N = opts.waypointCount ?? 60;
  const THRESHOLD = opts.coverageThreshold ?? 0.85;
  const REQUIRE_END = opts.requireEnd ?? true;

  const waypoints = useRef<Pt[]>([]);
  const [pathLength, setPathLength] = useState(0);
  const [hitMask, setHitMask] = useState<boolean[]>(() => new Array(N).fill(false));
  const [pointerPos, setPointerPos] = useState<Pt | null>(null);
  const activePointer = useRef<number | null>(null);
  const succeeded = useRef(false);

  const ensureSampled = useCallback((): boolean => {
    if (waypoints.current.length > 0) return true;
    const path = opts.pathRef.current;
    if (!path) return false;
    let total = 0;
    try { total = path.getTotalLength(); } catch { return false; }
    if (!total || !isFinite(total)) return false;
    const points: Pt[] = [];
    for (let i = 0; i < N; i++) {
      const t = (i / (N - 1)) * total;
      const p = path.getPointAtLength(t);
      points.push({ x: p.x, y: p.y });
    }
    waypoints.current = points;
    setPathLength(total);
    return true;
  }, [opts.pathRef, N]);

  // Sample as soon as the path is in the DOM.
  useEffect(() => {
    ensureSampled();
  }, [ensureSampled]);

  const toSvgCoords = useCallback((clientX: number, clientY: number): Pt | null => {
    const svg = opts.svgRef.current;
    if (!svg) return null;
    const pt = svg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return null;
    const tp = pt.matrixTransform(ctm.inverse());
    return { x: tp.x, y: tp.y };
  }, [opts.svgRef]);

  const updateHits = useCallback((x: number, y: number) => {
    if (waypoints.current.length === 0) return;
    setHitMask((prev) => {
      let changed = false;
      const next = prev.slice();
      for (let i = 0; i < next.length; i++) {
        if (next[i]) continue;
        const wp = waypoints.current[i];
        if (!wp) continue;
        const dx = x - wp.x;
        const dy = y - wp.y;
        if (dx * dx + dy * dy <= HIT_R * HIT_R) {
          next[i] = true;
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [HIT_R]);

  const onPointerDown = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    // Single-pointer only: ignore extra fingers.
    if (activePointer.current !== null) return;
    activePointer.current = e.pointerId;
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* not supported */ }
    ensureSampled();
    const c = toSvgCoords(e.clientX, e.clientY);
    if (c) {
      setPointerPos(c);
      updateHits(c.x, c.y);
    }
  }, [ensureSampled, toSvgCoords, updateHits]);

  const onPointerMove = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    if (e.pointerId !== activePointer.current) return;
    const c = toSvgCoords(e.clientX, e.clientY);
    if (c) {
      setPointerPos(c);
      updateHits(c.x, c.y);
    }
  }, [toSvgCoords, updateHits]);

  const releasePointer = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    if (e.pointerId !== activePointer.current) return;
    activePointer.current = null;
    setPointerPos(null);
    try { e.currentTarget.releasePointerCapture(e.pointerId); } catch { /* noop */ }
  }, []);

  const coverage = hitMask.reduce((acc, h) => acc + (h ? 1 : 0), 0) / N;
  // Kid has actually reached the end of the letter — the final waypoint
  // is hit. Gates success when REQUIRE_END so the trace can't complete
  // by sweeping the middle and stopping early.
  const endReached = hitMask.length > 0 && !!hitMask[hitMask.length - 1];

  useEffect(() => {
    if (succeeded.current) return;
    if (coverage < THRESHOLD) return;
    if (REQUIRE_END && !endReached) return;
    succeeded.current = true;
    opts.onSuccess();
  }, [coverage, endReached, THRESHOLD, REQUIRE_END, opts]);

  return {
    onPointerDown,
    onPointerMove,
    onPointerUp: releasePointer,
    onPointerCancel: releasePointer,
    coverage,
    hitMask,
    pointerPos,
    pathLength,
  };
}
