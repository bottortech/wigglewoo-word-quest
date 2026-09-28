import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { startRelay, connect, play, letterChallenge } from "./helpers.mjs";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function room(t, opts) {
  const env = await startRelay(opts);
  const clients = [];
  const add = async (hello, wsOpts) => { const c = await connect(env.url, hello, wsOpts); clients.push(c); return c; };
  t.after(async () => { clients.forEach((c) => c.close()); await env.relay.close(); });
  return { ...env, add };
}
const seated = async (r) => ({
  screen: await r.add({ type: "hello", role: "screen", id: "screen" }),
  a: await r.add({ type: "hello", role: "player", id: "tab-a" }),
  b: await r.add({ type: "hello", role: "player", id: "tab-b" }),
});

test("two tablets are seated X/O, the game starts, everyone sees it", async (t) => {
  const r = await room(t);
  const { screen, a, b } = await seated(r);
  assert.equal(a.welcome.seat, "X");
  assert.equal(b.welcome.seat, "O");
  assert.equal(screen.welcome.role, "screen");
  await screen.waitFor((s) => s.state.phase === "playing" && s.state.seats.X.connected && s.state.seats.O.connected);
  await a.waitFor((c) => c.state.phase === "playing");
  await b.waitFor((c) => c.state.phase === "playing");
});

test("a full game over the wire: X wins, then Play Again from a tablet", async (t) => {
  const r = await room(t);
  const { screen, a, b } = await seated(r);
  await play(a, screen, 0); await play(b, screen, 3);
  await play(a, screen, 1); await play(b, screen, 4);
  await play(a, screen, 2);
  await screen.waitFor((s) => s.state.phase === "over");
  assert.deepEqual(screen.state.result, { winner: "X", line: [0, 1, 2] });
  assert.deepEqual(screen.state.wins, { X: 1, O: 0 });
  b.send({ type: "rematch" });
  await screen.waitFor((s) => s.state.phase === "playing" && s.state.round === 2);
  assert.equal(screen.state.turn, "O");
  assert.equal(screen.state.board.filter(Boolean).length, 0);
});

test("wrong answers keep the turn; hints appear from the second miss; correct still lands", async (t) => {
  const r = await room(t);
  const { screen, a } = await seated(r);
  a.send({ type: "challenge", cell: 4, challenge: letterChallenge({ options: ["o", "a", "u", "e"] }) });
  await screen.waitFor((s) => s.state.challenge);
  a.send({ type: "answer", index: 0 });
  await screen.waitFor((s) => s.state.challenge.wrongN === 1);
  a.send({ type: "answer", index: 2 });
  await screen.waitFor((s) => s.state.challenge.eliminated.length === 1);
  assert.equal(screen.state.turn, "X");
  a.send({ type: "answer", index: 1 });
  await screen.waitFor((s) => s.state.challenge?.status === "correct");
  await screen.waitFor((s) => s.state.board[4] === "X" && s.state.turn === "O");
});

test("illegal actions get an error and change nothing", async (t) => {
  const r = await room(t);
  const { screen, a, b } = await seated(r);
  b.send({ type: "challenge", cell: 0, challenge: letterChallenge() });      // not O's turn
  await b.waitFor((c) => c.errors.some((e) => e.code === "not-your-turn"));
  a.send({ type: "newgame" });                                                // players can't run the show
  a.send({ type: "clearseats" });
  const spec = await r.add({ type: "hello", role: "spectator", id: "phone" });
  spec.send({ type: "swap" });
  spec.send({ type: "challenge", cell: 0, challenge: letterChallenge() });
  a.send({ type: "challenge", cell: 0, challenge: { type: "missing-letter", word: "cat" } });
  await a.waitFor((c) => c.errors.some((e) => e.code === "bad-challenge"));
  await sleep(150);
  assert.equal(screen.state.phase, "playing");
  assert.equal(screen.state.seats.X.id, "tab-a");
  assert.equal(screen.state.challenge, null);
});

test("speaking before hello, or with a bad hello, is refused", async (t) => {
  const r = await room(t);
  const c = await connect(r.url, { type: "hello", role: "screen", id: "s" });
  const raw = new (await import("ws")).default(r.url);
  const got = [];
  raw.on("message", (m) => got.push(JSON.parse(m.toString())));
  await new Promise((res) => raw.once("open", res));
  raw.send(JSON.stringify({ type: "answer", index: 0 }));
  raw.send(JSON.stringify({ type: "hello", role: "admin", id: "x" }));
  await sleep(150);
  raw.terminate(); c.close();
  assert.deepEqual(got.map((m) => m.code), ["hello-first", "bad-hello"]);
});

test("presenter controls: swap seats, reset scores, clear seats (screen only)", async (t) => {
  const r = await room(t);
  const { screen, a, b } = await seated(r);
  await play(a, screen, 0); await play(b, screen, 3); await play(a, screen, 1); await play(b, screen, 4); await play(a, screen, 2);
  await screen.waitFor((s) => s.state.phase === "over");
  screen.send({ type: "swap" });
  await screen.waitFor((s) => s.state.seats.X.id === "tab-b" && s.state.phase === "playing");
  assert.deepEqual(screen.state.wins, { X: 0, O: 1 });
  screen.send({ type: "resetscores" });
  await screen.waitFor((s) => s.state.wins.O === 0 && s.state.round === 1);
  screen.send({ type: "newgame" });
  await screen.waitFor((s) => s.state.round === 2);
  screen.send({ type: "clearseats" });
  await screen.waitFor((s) => s.state.phase === "lobby" && !s.state.seats.X);
});

test("a tablet that drops keeps its seat; reconnecting resumes mid-challenge", async (t) => {
  const r = await room(t);
  const { screen, a, b } = await seated(r);
  a.send({ type: "challenge", cell: 4, challenge: letterChallenge() });
  await screen.waitFor((s) => s.state.challenge);
  a.ws.terminate();                                                            // Wi-Fi yanked
  await screen.waitFor((s) => s.state.seats.X.connected === false, 3000, "X shown disconnected");
  assert.equal(screen.state.challenge.cell, 4);                                 // game untouched
  const t0 = Date.now();
  const a2 = await r.add({ type: "hello", role: "player", id: "tab-a" });
  assert.equal(a2.welcome.seat, "X");
  assert.equal(a2.welcome.takeover, false);
  assert.equal(a2.welcome.state.challenge.cell, 4);                             // resumes exactly where it was
  await screen.waitFor((s) => s.state.seats.X.connected === true);
  assert.ok(Date.now() - t0 < 500);
  a2.send({ type: "answer", index: 1 });
  await screen.waitFor((s) => s.state.board[4] === "X");
  assert.equal(b.state.seats.O.connected, true);
});

test("reconnecting while the old socket is still 'open' (half-open) replaces it without a flicker", async (t) => {
  const r = await room(t);
  const { screen, a } = await seated(r);
  const flickers = [];
  screen.ws.on("message", (raw) => {
    const m = JSON.parse(raw.toString());
    if (m.type === "state" && m.state.seats.X?.connected === false) flickers.push(m.state.seq);
  });
  const a2 = await r.add({ type: "hello", role: "player", id: "tab-a" });      // a is still connected
  assert.equal(a2.welcome.seat, "X");
  await sleep(300);
  assert.equal(flickers.length, 0);
  assert.equal(screen.state.seats.X.connected, true);
  await a.waitFor((c) => c.ws.readyState > 1, 2000, "old socket closed");
});

test("a silent (half-open) tablet is detected by the relay's heartbeat within ~6s", async (t) => {
  const r = await room(t);
  const screen = await r.add({ type: "hello", role: "screen", id: "screen" });
  await r.add({ type: "hello", role: "player", id: "tab-a" }, { autoPong: false });   // never answers pings
  await r.add({ type: "hello", role: "player", id: "tab-b" });
  await screen.waitFor((s) => s.state.seats.X?.connected === true);
  const t0 = Date.now();
  await screen.waitFor((s) => s.state.seats.X.connected === false, 9000, "heartbeat timeout");
  assert.ok(Date.now() - t0 < 8000, `took ${Date.now() - t0}ms`);
});

test("third tablet is a spectator with an error; a replacement tablet can take over a dead seat", async (t) => {
  const r = await room(t);
  const { screen, a } = await seated(r);
  const c = await r.add({ type: "hello", role: "player", id: "tab-c" });
  assert.equal(c.welcome.role, "spectator");
  assert.equal(c.errors[0].code, "full");
  c.send({ type: "challenge", cell: 0, challenge: letterChallenge() });         // spectators can't play
  a.ws.terminate();
  await screen.waitFor((s) => s.state.seats.X.connected === false);
  const d = await r.add({ type: "hello", role: "player", id: "tab-d" });
  assert.deepEqual([d.welcome.seat, d.welcome.takeover], ["X", true]);
  await screen.waitFor((s) => s.state.seats.X.id === "tab-d" && s.state.seats.X.connected);
});

test("relay restart mid-game: state is restored, tablets re-hello and carry on", async (t) => {
  const first = await startRelay();
  const screen1 = await connect(first.url, { type: "hello", role: "screen", id: "screen" });
  const a1 = await connect(first.url, { type: "hello", role: "player", id: "tab-a" });
  const b1 = await connect(first.url, { type: "hello", role: "player", id: "tab-b" });
  await play(a1, screen1, 0); await play(b1, screen1, 4);
  await sleep(400);                                                              // let the debounced save land
  [screen1, a1, b1].forEach((c) => c.close());
  await first.relay.close();
  assert.ok(fs.existsSync(first.stateFile));

  const second = await startRelay({ stateFile: first.stateFile });
  t.after(() => second.relay.close());
  const screen2 = await connect(second.url, { type: "hello", role: "screen", id: "screen" });
  assert.equal(screen2.state.board[0], "X");
  assert.equal(screen2.state.board[4], "O");
  assert.equal(screen2.state.seats.X.connected, false);                          // nobody is back yet
  const a2 = await connect(second.url, { type: "hello", role: "player", id: "tab-a" });
  const b2 = await connect(second.url, { type: "hello", role: "player", id: "tab-b" });
  assert.deepEqual([a2.welcome.seat, b2.welcome.seat], ["X", "O"]);
  await play(a2, screen2, 1);
  assert.equal(screen2.state.board[1], "X");
  [screen2, a2, b2].forEach((c) => c.close());
});

test("clients get a heartbeat about once a second, and ping/pong works", async (t) => {
  const r = await room(t);
  const screen = await r.add({ type: "hello", role: "screen", id: "screen" });
  await screen.waitFor((s) => s.msgs.filter((m) => m.type === "hb").length >= 2, 3000, "two heartbeats");
  screen.send({ type: "ping", t: 42 });
  await screen.waitFor((s) => s.msgs.some((m) => m.type === "pong" && m.t === 42));
});

test("HTTP: /info (CORS), /health, /state", async (t) => {
  const r = await room(t);
  const info = await fetch(`${r.http}/info`);
  assert.equal(info.headers.get("access-control-allow-origin"), "*");
  const body = await info.json();
  assert.equal(body.app, "wiggle-relay");
  assert.deepEqual(body.seats, { X: false, O: false });
  assert.equal((await (await fetch(`${r.http}/health`)).json()).ok, true);
  assert.equal((await (await fetch(`${r.http}/state`)).json()).phase, "lobby");
});

test("HTTP static: big screen, app assets and art are served; escapes are not", async (t) => {
  const r = await room(t);
  const page = await fetch(`${r.http}/`);
  assert.equal(page.status, 200);
  assert.match(page.headers.get("content-type"), /text\/html/);
  const img = await fetch(`${r.http}/assets/words/cat.png`);
  assert.equal([img.status, img.headers.get("content-type")].join(), "200,image/png");
  assert.equal((await fetch(`${r.http}/img/wigglewoo_X.png`)).status, 200);
  assert.equal((await fetch(`${r.http}/fonts/Nunito-VariableFont_wght.woff2`)).status, 200);
  for (const bad of ["/assets/../../package.json", "/assets/%2e%2e/%2e%2e/package.json", "/img/..%2Fpackage.json",
                     "/img/secret.txt", "/../server.mjs", "/%2e%2e/server.mjs"]) {
    const res = await fetch(`${r.http}${bad}`);
    assert.ok([400, 404].includes(res.status), `${bad} -> ${res.status}`);
  }
  const part = await fetch(`${r.http}/assets/audio/words/cat.m4a`, { headers: { Range: "bytes=0-99" } });
  assert.equal(part.status, 206);
  assert.equal((await part.arrayBuffer()).byteLength, 100);
});
