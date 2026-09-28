// =============================================
// useGuidedDemo.ts — Guided Demo controller
// WiggleWoo's Word Quest
// =============================================
// A small action-based reducer, not a pile of ad-hoc setState calls, so that
// stepping the demo forward/back/etc. always goes through one `dispatch`.
// That's the one property that matters for the planned phone-based Presenter
// Mode remote: whoever ends up triggering these actions (a local button
// today, a remote control later) can call the exact same dispatch function
// without the controller itself changing shape.
//
// This hook only owns the guided-demo walkthrough's own state (is it
// running, which step). It does NOT own app navigation or game progress —
// App.tsx still drives real screen transitions in response to the step
// changing, the same way it already drives everything else.
// =============================================

import { useReducer, useMemo } from "react";
import { GUIDED_DEMO_STEPS } from "../game/guidedDemoSteps";
import type { GuidedDemoStep } from "../game/guidedDemoSteps";

export interface GuidedDemoState {
  active: boolean;
  stepIndex: number;
  /** Which step list is running — the full tour or a shorter preset (e.g.
   *  STAGE_DEMO_STEPS). Chosen by START, not baked into the hook, so one
   *  engine instance can run either without App.tsx knowing the difference:
   *  every advance effect there is keyed by step id, not by list. */
  steps: GuidedDemoStep[];
}

export type GuidedDemoAction =
  | { type: "START"; steps?: GuidedDemoStep[] }
  | { type: "NEXT" }
  | { type: "PREV" }
  | { type: "RESTART" }
  | { type: "END" }
  /** Distinct from END: today it has the same effect (demo stops, step
   *  resets), but it's kept as its own action so the future "Reset for Next
   *  Visitor" presenter-remote control has a stable action name to send,
   *  separate from a presenter just ending the walkthrough early. */
  | { type: "RESET_FOR_NEXT_VISITOR" };

const initialState: GuidedDemoState = { active: false, stepIndex: 0, steps: GUIDED_DEMO_STEPS };

function guidedDemoReducer(state: GuidedDemoState, action: GuidedDemoAction): GuidedDemoState {
  switch (action.type) {
    case "START":
      return { active: true, stepIndex: 0, steps: action.steps ?? GUIDED_DEMO_STEPS };
    case "NEXT": {
      if (!state.active) return state;
      if (state.stepIndex >= state.steps.length - 1) return { ...initialState };
      return { ...state, stepIndex: state.stepIndex + 1 };
    }
    case "PREV": {
      if (!state.active) return state;
      return { ...state, stepIndex: Math.max(0, state.stepIndex - 1) };
    }
    case "RESTART":
      return { ...state, active: true, stepIndex: 0 };
    case "END":
    case "RESET_FOR_NEXT_VISITOR":
      return { ...initialState };
    default:
      return state;
  }
}

export function useGuidedDemo() {
  const [state, dispatch] = useReducer(guidedDemoReducer, initialState);

  const currentStep = state.active ? state.steps[state.stepIndex] : null;
  const isLastStep = state.active && state.stepIndex === state.steps.length - 1;
  const isFirstStep = state.stepIndex === 0;

  return useMemo(
    () => ({ state, dispatch, currentStep, isLastStep, isFirstStep }),
    [state, currentStep, isLastStep, isFirstStep]
  );
}
