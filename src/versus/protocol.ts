// =============================================
// protocol.ts — wire types for the Word-Tac-Toe event relay
// =============================================
// Mirrors tools/event-relay/game.mjs (the source of truth — see the protocol
// comment at the top of that file). Types only, so it costs nothing at runtime.

export type Mark = "X" | "O";
export type ChallengeType = "missing-letter" | "word-picture-match";

/** What a tablet sends when its player taps a square. */
export interface WireChallenge {
  type: ChallengeType;
  word: string;
  options: string[];
  correctIndex: number;
  /** missing-letter only */
  blankIndex?: number;
  letters?: string[];
}

/** The challenge as the relay broadcasts it (adds bookkeeping the relay owns). */
export interface ServerChallenge extends WireChallenge {
  id: number;
  seat: Mark;
  cell: number;
  /** "wrong" holds briefly (WRONG_MS on the relay) after a miss, same as
   *  "correct" does before the mark lands — one wrong tap ends the turn,
   *  no retries. */
  status: "open" | "correct" | "wrong";
  wrongCount: number;
  /** Increments on every wrong tap — clients animate when it changes. */
  wrongN: number;
  wrongIndex: number | null;
  eliminated: number[];
}

export interface Seat {
  id: string;
  name: string;
  connected: boolean;
}

export interface VersusState {
  v: number;
  seq: number;
  phase: "lobby" | "playing" | "over";
  round: number;
  starter: Mark;
  turn: Mark;
  seats: { X: Seat | null; O: Seat | null };
  board: (Mark | null)[];
  challenge: ServerChallenge | null;
  result: { winner: Mark | null; line: number[] | null } | null;
  wins: { X: number; O: number };
  ties: number;
}

export interface WelcomeMessage {
  type: "welcome";
  role: "player" | "spectator" | "screen" | "presenter";
  seat: Mark | null;
  id: string;
  takeover: boolean;
  state: VersusState;
}

export type ServerMessage =
  | WelcomeMessage
  | { type: "state"; state: VersusState }
  | { type: "hb"; t: number }
  | { type: "pong"; t: number }
  | { type: "error"; code: string; message?: string };

export const RELAY_PORT = 8787;
