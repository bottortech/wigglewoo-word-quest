// =============================================================
// game.mjs — authoritative Word-Tac-Toe VERSUS engine
// =============================================================
// Pure state machine: no sockets, no timers, no I/O. The relay (server.mjs)
// owns those and calls in here, which is what makes every rule testable.
//
// WHO DOES WHAT
//   - The mover's tablet builds the literacy challenge (it has the app's real
//     word data) and sends it once. Everything after that is decided here:
//     correctness, turn order, winner, scores. One wrong tap ends the turn —
//     no retries, no hints; the cell stays empty for whoever picks it later.
//   - Tablets and the big screen are thin renderers of `state`.
//
// PROTOCOL (JSON over WebSocket at /ws; every change broadcasts a FULL state
// snapshot, so a dropped message can never leave clients disagreeing)
//
//   client -> relay
//     hello     { role: "player"|"screen"|"presenter"|"spectator", id, name?, seat?: "X"|"O" }
//     challenge { cell, challenge: { type, word, options[], correctIndex, blankIndex?, letters? } }
//     answer    { index }
//     rematch   {}                       (player; only when the game is over)
//     newgame   {} | resetscores {} | clearseats {} | swap {}   (screen/presenter only)
//     ping      { t }
//   relay -> client
//     welcome   { role, seat, id, takeover, serverTime, state }
//     state     { state }
//     hb        { t }                    (1 Hz; clients use it as a liveness watchdog)
//     pong      { t }
//     error     { code, message }
//
// state.phase: "lobby" (waiting for both seats) | "playing" | "over"
// =============================================================

export const PROTOCOL_VERSION = 1;
export const LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];
/** Pause between a correct answer and the mark landing (matches the single-player screen). */
export const CORRECT_MS = 700;
/** Pause between a wrong answer and the turn passing — long enough for the
 *  "wrong" flash/shake and sound to land before the board hands off. One
 *  wrong tap ends the turn; there's no retry and no hint. */
export const WRONG_MS = 900;
export const CHALLENGE_TYPES = ["missing-letter", "word-picture-match"];

const other = (m) => (m === "X" ? "O" : "X");
const ok = (extra = {}) => ({ ok: true, ...extra });
const err = (error) => ({ ok: false, error });

export function checkWinner(board) {
  for (const line of LINES) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { mark: board[a], line };
    }
  }
  return null;
}

function freshState() {
  return {
    v: PROTOCOL_VERSION,
    seq: 0,
    phase: "lobby",
    round: 1,
    starter: "X",
    turn: "X",
    seats: { X: null, O: null },
    board: Array(9).fill(null),
    challenge: null,
    challengeCount: 0,
    result: null,
    wins: { X: 0, O: 0 },
    ties: 0,
  };
}

const WORD_RE = /^[a-z]{1,16}$/;
const OPT_RE = /^[a-z]{1,16}$/;

/** Accept only well-formed challenges; returns a sanitized copy or null. */
export function sanitizeChallenge(c) {
  if (!c || typeof c !== "object") return null;
  if (!CHALLENGE_TYPES.includes(c.type)) return null;
  const word = typeof c.word === "string" ? c.word.toLowerCase().trim() : "";
  if (!WORD_RE.test(word)) return null;
  if (!Array.isArray(c.options) || c.options.length < 2 || c.options.length > 4) return null;
  const options = c.options.map((o) => (typeof o === "string" ? o.toLowerCase().trim() : ""));
  if (!options.every((o) => OPT_RE.test(o))) return null;
  if (!Number.isInteger(c.correctIndex) || c.correctIndex < 0 || c.correctIndex >= options.length) return null;
  const out = { type: c.type, word, options, correctIndex: c.correctIndex };
  if (c.type === "missing-letter") {
    const letters = Array.isArray(c.letters) && c.letters.length === word.length
      ? c.letters.map((l) => String(l).toLowerCase().slice(0, 2))
      : word.split("");
    if (!Number.isInteger(c.blankIndex) || c.blankIndex < 0 || c.blankIndex >= letters.length) return null;
    out.letters = letters;
    out.blankIndex = c.blankIndex;
  }
  return out;
}

export class Game {
  constructor({ rng = Math.random } = {}) {
    this.rng = rng;
    this.state = freshState();
  }

  /** Rebuild from a persisted snapshot. Every seat starts disconnected until
   *  its tablet says hello again; a half-finished "correct" pause is settled. */
  static restore(saved, opts) {
    const g = new Game(opts);
    if (!saved || saved.v !== PROTOCOL_VERSION || !saved.seats || !Array.isArray(saved.board)) return g;
    g.state = { ...freshState(), ...saved };
    for (const m of ["X", "O"]) if (g.state.seats[m]) g.state.seats[m].connected = false;
    const c = g.state.challenge;
    if (c && c.status === "correct") g.resolveCorrect(c.id);
    else if (c && c.status === "wrong") g.resolveWrong(c.id);
    return g;
  }

  _touch() { this.state.seq += 1; }
  _seatOf(id) { return ["X", "O"].find((m) => this.state.seats[m]?.id === id) ?? null; }
  _bothSeated() { return !!(this.state.seats.X && this.state.seats.O); }

  _startRound() {
    const s = this.state;
    s.board = Array(9).fill(null);
    s.challenge = null;
    s.result = null;
    s.turn = s.starter;
    s.phase = this._bothSeated() ? "playing" : "lobby";
  }

  // ---- seating -------------------------------------------------
  join(id, { seat: pref, name } = {}) {
    const s = this.state;
    let mark = this._seatOf(id);
    let takeover = false;
    if (mark) {
      s.seats[mark].connected = true;
      if (name) s.seats[mark].name = String(name).slice(0, 24);
    } else {
      const order = [pref, "X", "O"].filter((m) => m === "X" || m === "O");
      mark = order.find((m) => !s.seats[m]) ?? null;
      if (!mark) {
        // Both seats taken. If one tablet is gone (app data cleared, tablet
        // swapped), let the newcomer take over that seat so the demo recovers.
        mark = ["X", "O"].find((m) => !s.seats[m].connected) ?? null;
        takeover = mark !== null;
      }
      if (!mark) return err("full");
      s.seats[mark] = { id, name: (name && String(name).slice(0, 24)) || `Player ${mark}`, connected: true };
    }
    if (s.phase === "lobby" && this._bothSeated()) this._startRound();
    this._touch();
    return ok({ seat: mark, takeover });
  }

  disconnect(id) {
    const mark = this._seatOf(id);
    if (!mark) return false;
    this.state.seats[mark].connected = false;
    this._touch();
    return true;
  }

  // ---- play ----------------------------------------------------
  submitChallenge(id, { cell, challenge } = {}) {
    const s = this.state;
    const seat = this._seatOf(id);
    if (!seat) return err("not-seated");
    if (s.phase !== "playing") return err("not-playing");
    if (s.turn !== seat) return err("not-your-turn");
    if (s.challenge) return err("challenge-open");
    if (!Number.isInteger(cell) || cell < 0 || cell > 8 || s.board[cell] !== null) return err("bad-cell");
    const clean = sanitizeChallenge(challenge);
    if (!clean) return err("bad-challenge");
    s.challengeCount += 1;
    // wrongCount/eliminated are vestigial — kept on the wire since tablet
    // and screen UIs already key their "wrong" flash off wrongN/wrongIndex,
    // not worth a protocol change. wrongCount now only ever reaches 0 or 1
    // (one wrong tap ends the turn — see answer()) and eliminated stays
    // permanently empty; no client currently special-cases either beyond
    // that, so leaving them is simpler than threading a field removal
    // through every consumer for the Oct 10 timeline.
    s.challenge = {
      id: s.challengeCount, seat, cell, ...clean,
      status: "open", wrongCount: 0, wrongN: 0, wrongIndex: null, eliminated: [],
    };
    this._touch();
    return ok({ challengeId: s.challengeCount });
  }

  /** One wrong tap ends the turn immediately — no retries, no hint. The
   *  challenge moves to "wrong" (mirroring "correct") so the relay can hold
   *  it open just long enough for clients to show the miss before the turn
   *  actually passes (see resolveWrong). The cell the mover picked is never
   *  claimed on a miss; it's still open for whoever picks it later. */
  answer(id, index) {
    const s = this.state;
    const seat = this._seatOf(id);
    if (!seat) return err("not-seated");
    const c = s.challenge;
    if (!c || c.status !== "open") return err("no-challenge");
    if (c.seat !== seat) return err("not-your-turn");
    if (!Number.isInteger(index) || index < 0 || index >= c.options.length || c.eliminated.includes(index)) {
      return err("bad-option");
    }
    if (index === c.correctIndex) {
      c.status = "correct";
      this._touch();
      return ok({ correct: true, challengeId: c.id });
    }
    c.status = "wrong";
    c.wrongCount += 1;
    c.wrongN += 1;
    c.wrongIndex = index;
    this._touch();
    return ok({ correct: false, challengeId: c.id });
  }

  /** Called by the relay CORRECT_MS after a correct answer. Places the mark,
   *  decides win/tie, or passes the turn. Idempotent against stale timers. */
  resolveCorrect(challengeId) {
    const s = this.state;
    const c = s.challenge;
    if (!c || c.id !== challengeId || c.status !== "correct") return err("stale");
    s.board[c.cell] = c.seat;
    s.challenge = null;
    const win = checkWinner(s.board);
    if (win) {
      s.phase = "over";
      s.result = { winner: win.mark, line: win.line };
      s.wins[win.mark] += 1;
    } else if (s.board.every((v) => v !== null)) {
      s.phase = "over";
      s.result = { winner: null, line: null };
      s.ties += 1;
    } else {
      s.turn = other(c.seat);
    }
    this._touch();
    return ok({ phase: s.phase });
  }

  /** Called by the relay WRONG_MS after a wrong answer. Passes the turn
   *  without placing a mark — the mover's cell stays empty. Idempotent
   *  against stale timers, same pattern as resolveCorrect. */
  resolveWrong(challengeId) {
    const s = this.state;
    const c = s.challenge;
    if (!c || c.id !== challengeId || c.status !== "wrong") return err("stale");
    s.turn = other(c.seat);
    s.challenge = null;
    this._touch();
    return ok({ phase: s.phase });
  }

  // ---- round / session control --------------------------------
  /** Play Again. Players may only do this once a game is over; the presenter
   *  can force it any time (`force`). The starting mark alternates each round. */
  newGame({ force = false } = {}) {
    const s = this.state;
    if (!force && s.phase !== "over") return err("not-over");
    if (s.phase === "lobby") return err("no-players");
    s.round += 1;
    s.starter = other(s.starter);
    this._startRound();
    this._touch();
    return ok();
  }

  /** Zero the scoreboard and start fresh, keeping both tablets seated. */
  resetScores() {
    const s = this.state;
    s.wins = { X: 0, O: 0 };
    s.ties = 0;
    s.round = 1;
    s.starter = "X";
    this._startRound();
    this._touch();
    return ok();
  }

  /** Back to the lobby with nobody seated (tablets re-hello to sit again). */
  clearSeats() {
    const s = this.state;
    s.seats = { X: null, O: null };
    s.wins = { X: 0, O: 0 };
    s.ties = 0;
    s.round = 1;
    s.starter = "X";
    s.phase = "lobby";
    this._startRound();
    this._touch();
    return ok();
  }

  /** Swap which tablet is X and which is O; restarts the round. */
  swapSeats() {
    const s = this.state;
    [s.seats.X, s.seats.O] = [s.seats.O, s.seats.X];
    [s.wins.X, s.wins.O] = [s.wins.O, s.wins.X];
    this._startRound();
    this._touch();
    return ok();
  }
}
