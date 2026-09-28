import test from "node:test";
import assert from "node:assert/strict";
import { Game, LINES, checkWinner, sanitizeChallenge, HINT_AFTER_WRONG } from "../game.mjs";

const seq = (values) => { let i = 0; return () => values[i++ % values.length]; };

const letterChallenge = (over = {}) => ({
  type: "missing-letter", word: "cat", blankIndex: 1, letters: ["c", "a", "t"],
  options: ["o", "a", "u"], correctIndex: 1, ...over,
});
const pictureChallenge = () => ({
  type: "word-picture-match", word: "bat", options: ["bat", "hat", "map"], correctIndex: 0,
});

/** Two seated players, game running. */
function started(opts) {
  const g = new Game(opts);
  g.join("a"); g.join("b");
  return g;
}
/** Player `id` claims `cell` correctly and the mark lands. */
function claim(g, id, cell) {
  assert.equal(g.submitChallenge(id, { cell, challenge: letterChallenge() }).ok, true);
  const r = g.answer(id, 1);
  assert.equal(r.ok && r.correct, true);
  assert.equal(g.resolveCorrect(r.challengeId).ok, true);
}

test("first two tablets get X then O and the game starts", () => {
  const g = new Game();
  assert.equal(g.state.phase, "lobby");
  assert.deepEqual([g.join("a").seat, g.state.phase], ["X", "lobby"]);
  assert.deepEqual([g.join("b").seat, g.state.phase], ["O", "playing"]);
  assert.equal(g.state.turn, "X");
});

test("seat preference is honored when free, ignored when taken", () => {
  const g = new Game();
  assert.equal(g.join("a", { seat: "O" }).seat, "O");
  assert.equal(g.join("b", { seat: "O" }).seat, "X");
});

test("a returning id keeps its seat and does not restart the game", () => {
  const g = started();
  claim(g, "a", 4);
  g.disconnect("a");
  assert.equal(g.state.seats.X.connected, false);
  const r = g.join("a");
  assert.deepEqual([r.seat, r.takeover], ["X", false]);
  assert.equal(g.state.seats.X.connected, true);
  assert.equal(g.state.board[4], "X");
  assert.equal(g.state.phase, "playing");
});

test("a third tablet is refused while both seats are held", () => {
  const g = started();
  assert.equal(g.join("c").error, "full");
});

test("a new id can take over a seat whose tablet is gone", () => {
  const g = started();
  g.disconnect("b");
  const r = g.join("fresh");
  assert.deepEqual([r.ok, r.seat, r.takeover], [true, "O", true]);
  assert.equal(g.state.seats.O.id, "fresh");
});

test("only the seat whose turn it is may pick, and only empty cells", () => {
  const g = started();
  assert.equal(g.submitChallenge("b", { cell: 0, challenge: letterChallenge() }).error, "not-your-turn");
  assert.equal(g.submitChallenge("a", { cell: 9, challenge: letterChallenge() }).error, "bad-cell");
  assert.equal(g.submitChallenge("a", { cell: 0, challenge: letterChallenge() }).ok, true);
  assert.equal(g.submitChallenge("a", { cell: 1, challenge: letterChallenge() }).error, "challenge-open");
});

test("cannot pick an occupied cell", () => {
  const g = started();
  claim(g, "a", 0);
  assert.equal(g.submitChallenge("b", { cell: 0, challenge: letterChallenge() }).error, "bad-cell");
});

test("nobody can play before both seats are filled", () => {
  const g = new Game();
  g.join("a");
  assert.equal(g.submitChallenge("a", { cell: 0, challenge: letterChallenge() }).error, "not-playing");
});

test("only the mover can answer", () => {
  const g = started();
  g.submitChallenge("a", { cell: 0, challenge: letterChallenge() });
  assert.equal(g.answer("b", 1).error, "not-your-turn");
  assert.equal(g.answer("ghost", 1).error, "not-seated");
});

test("a correct answer holds the mark until resolveCorrect, then passes the turn", () => {
  const g = started();
  g.submitChallenge("a", { cell: 4, challenge: letterChallenge() });
  const r = g.answer("a", 1);
  assert.equal(g.state.challenge.status, "correct");
  assert.equal(g.state.board[4], null);
  assert.equal(g.answer("a", 1).error, "no-challenge");
  g.resolveCorrect(r.challengeId);
  assert.equal(g.state.board[4], "X");
  assert.equal(g.state.challenge, null);
  assert.equal(g.state.turn, "O");
});

test("a wrong answer never costs the turn; the same challenge stays open", () => {
  const g = started();
  g.submitChallenge("a", { cell: 4, challenge: letterChallenge() });
  const r = g.answer("a", 0);
  assert.deepEqual([r.ok, r.correct], [true, false]);
  assert.equal(g.state.turn, "X");
  assert.equal(g.state.challenge.status, "open");
  assert.equal(g.state.challenge.wrongIndex, 0);
  assert.equal(g.state.challenge.wrongN, 1);
});

test("hints: from the 2nd miss on, each miss removes one WRONG option; the answer is never removed", () => {
  const g = started({ rng: seq([0, 0]) });
  g.submitChallenge("a", { cell: 4, challenge: letterChallenge({ options: ["o", "a", "u", "e"], correctIndex: 1 }) });
  g.answer("a", 0);
  assert.equal(g.state.challenge.eliminated.length, 0);
  g.answer("a", 2);
  assert.equal(g.state.challenge.wrongCount, HINT_AFTER_WRONG);
  assert.equal(g.state.challenge.eliminated.length, 1);
  const first = g.state.challenge.eliminated[0];
  assert.notEqual(first, 1);
  g.answer("a", [0, 2, 3].find((i) => i !== first && !g.state.challenge.eliminated.includes(i)));
  assert.equal(g.state.challenge.eliminated.length, 2);
  assert.ok(!g.state.challenge.eliminated.includes(1));
  const gone = g.state.challenge.eliminated[0];
  assert.equal(g.answer("a", gone).error, "bad-option");
});

test("malformed challenges are rejected", () => {
  const g = started();
  const bad = [
    null, {}, { type: "nope" },
    letterChallenge({ options: ["a"] }),
    letterChallenge({ options: ["a", "b", "c", "d", "e"] }),
    letterChallenge({ correctIndex: 5 }),
    letterChallenge({ blankIndex: 9 }),
    letterChallenge({ word: "CAT!" }),
    letterChallenge({ options: ["o", "<b>", "u"] }),
  ];
  for (const c of bad) assert.equal(g.submitChallenge("a", { cell: 0, challenge: c }).error, "bad-challenge", JSON.stringify(c));
  assert.equal(g.state.challenge, null);
});

test("sanitize: normalizes case, derives letters, accepts picture matches", () => {
  const c = sanitizeChallenge({ type: "missing-letter", word: "CAT", blankIndex: 0, options: ["C", "k"], correctIndex: 0 });
  assert.deepEqual(c.letters, ["c", "a", "t"]);
  assert.deepEqual(c.options, ["c", "k"]);
  assert.equal(sanitizeChallenge(pictureChallenge()).type, "word-picture-match");
});

test("every one of the 8 lines wins for X and for O", () => {
  for (const line of LINES) {
    for (const mark of ["X", "O"]) {
      const board = Array(9).fill(null);
      line.forEach((i) => { board[i] = mark; });
      assert.deepEqual(checkWinner(board), { mark, line });
    }
  }
  assert.equal(checkWinner(Array(9).fill(null)), null);
});

test("a win ends the game, records the line, and counts the score", () => {
  const g = started();
  claim(g, "a", 0); claim(g, "b", 3);
  claim(g, "a", 1); claim(g, "b", 4);
  claim(g, "a", 2);
  assert.equal(g.state.phase, "over");
  assert.deepEqual(g.state.result, { winner: "X", line: [0, 1, 2] });
  assert.deepEqual(g.state.wins, { X: 1, O: 0 });
});

test("O can win too", () => {
  const g = started();
  claim(g, "a", 0); claim(g, "b", 3);
  claim(g, "a", 1); claim(g, "b", 4);
  claim(g, "a", 8); claim(g, "b", 5);
  assert.deepEqual(g.state.result, { winner: "O", line: [3, 4, 5] });
  assert.deepEqual(g.state.wins, { X: 0, O: 1 });
});

test("a full board with no line is a tie", () => {
  const g = started();
  // X: 0 1 5 6 8   O: 2 3 4 7  -> no line
  const order = [["a", 0], ["b", 2], ["a", 1], ["b", 3], ["a", 5], ["b", 4], ["a", 6], ["b", 7], ["a", 8]];
  for (const [id, cell] of order) claim(g, id, cell);
  assert.equal(g.state.phase, "over");
  assert.deepEqual(g.state.result, { winner: null, line: null });
  assert.equal(g.state.ties, 1);
});

test("no moves after the game is over", () => {
  const g = started();
  claim(g, "a", 0); claim(g, "b", 3); claim(g, "a", 1); claim(g, "b", 4); claim(g, "a", 2);
  assert.equal(g.submitChallenge("b", { cell: 8, challenge: letterChallenge() }).error, "not-playing");
});

test("Play Again: only after game over, scores persist, starter alternates", () => {
  const g = started();
  assert.equal(g.newGame().error, "not-over");
  claim(g, "a", 0); claim(g, "b", 3); claim(g, "a", 1); claim(g, "b", 4); claim(g, "a", 2);
  assert.equal(g.newGame().ok, true);
  assert.equal(g.state.phase, "playing");
  assert.equal(g.state.round, 2);
  assert.equal(g.state.turn, "O");
  assert.deepEqual(g.state.board, Array(9).fill(null));
  assert.equal(g.state.result, null);
  assert.deepEqual(g.state.wins, { X: 1, O: 0 });
});

test("presenter can force a new game mid-round", () => {
  const g = started();
  claim(g, "a", 0);
  g.submitChallenge("b", { cell: 1, challenge: letterChallenge() });
  assert.equal(g.newGame({ force: true }).ok, true);
  assert.equal(g.state.challenge, null);
  assert.deepEqual(g.state.board, Array(9).fill(null));
});

test("resetScores keeps seats and zeroes everything else", () => {
  const g = started();
  claim(g, "a", 0); claim(g, "b", 3); claim(g, "a", 1); claim(g, "b", 4); claim(g, "a", 2);
  g.resetScores();
  assert.deepEqual([g.state.wins, g.state.ties, g.state.round, g.state.turn], [{ X: 0, O: 0 }, 0, 1, "X"]);
  assert.equal(g.state.phase, "playing");
  assert.equal(g.state.seats.X.id, "a");
});

test("clearSeats returns to the lobby and lets tablets sit again", () => {
  const g = started();
  g.clearSeats();
  assert.equal(g.state.phase, "lobby");
  assert.deepEqual(g.state.seats, { X: null, O: null });
  assert.equal(g.join("b").seat, "X");
});

test("swapSeats exchanges tablets (and their scores) and restarts the round", () => {
  const g = started();
  claim(g, "a", 0); claim(g, "b", 3); claim(g, "a", 1); claim(g, "b", 4); claim(g, "a", 2);
  g.swapSeats();
  assert.equal(g.state.seats.X.id, "b");
  assert.equal(g.state.seats.O.id, "a");
  assert.deepEqual(g.state.wins, { X: 0, O: 1 });
  assert.equal(g.state.phase, "playing");
  assert.deepEqual(g.state.board, Array(9).fill(null));
});

test("a stale resolve timer is harmless", () => {
  const g = started();
  g.submitChallenge("a", { cell: 4, challenge: letterChallenge() });
  const r = g.answer("a", 1);
  g.newGame({ force: true });
  assert.equal(g.resolveCorrect(r.challengeId).error, "stale");
  assert.equal(g.state.board[4], null);
});

test("seq increases on every change (clients can detect missed updates)", () => {
  const g = new Game();
  const seen = [g.state.seq];
  g.join("a"); seen.push(g.state.seq);
  g.join("b"); seen.push(g.state.seq);
  g.submitChallenge("a", { cell: 0, challenge: letterChallenge() }); seen.push(g.state.seq);
  g.answer("a", 0); seen.push(g.state.seq);
  for (let i = 1; i < seen.length; i++) assert.ok(seen[i] > seen[i - 1]);
});

test("restore: seats come back disconnected, board and scores intact", () => {
  const g = started();
  claim(g, "a", 0); claim(g, "b", 3);
  const saved = JSON.parse(JSON.stringify(g.state));
  const r = Game.restore(saved);
  assert.equal(r.state.board[0], "X");
  assert.equal(r.state.board[3], "O");
  assert.equal(r.state.seats.X.connected, false);
  assert.equal(r.state.seats.O.connected, false);
  assert.equal(r.join("a").seat, "X");
  assert.equal(r.state.turn, "X");
});

test("restore mid-'correct' pause settles the move instead of stranding it", () => {
  const g = started();
  g.submitChallenge("a", { cell: 4, challenge: letterChallenge() });
  g.answer("a", 1);
  const r = Game.restore(JSON.parse(JSON.stringify(g.state)));
  assert.equal(r.state.board[4], "X");
  assert.equal(r.state.challenge, null);
  assert.equal(r.state.turn, "O");
});

test("restore ignores garbage and wrong versions", () => {
  assert.equal(Game.restore(null).state.phase, "lobby");
  assert.equal(Game.restore({ v: 99 }).state.phase, "lobby");
  assert.equal(Game.restore({ v: 1, seats: {}, board: "x" }).state.phase, "lobby");
});
