// Soak-test companion to bots.mjs. Connects as the big screen, randomly fires
// presenter commands, and checks game invariants on EVERY state update.
//   node chaos.mjs --secs 150 [--url ws://localhost:8787/ws]
import WebSocket from "ws";

const args = Object.fromEntries(process.argv.slice(2).reduce((a, x, i, all) => { if (x.startsWith("--")) a.push([x.slice(2), all[i + 1]]); return a; }, []));
const URL_ = args.url ?? "ws://localhost:8787/ws";
const SECS = Number(args.secs ?? 120);

let updates = 0, lastSeq = -1, violations = [], commands = 0, reconnects = 0;
const stats = { phases: {}, maxRound: 0 };
const bad = (why, s) => { violations.push(why); if (violations.length <= 5) console.log("VIOLATION:", why, JSON.stringify(s).slice(0, 400)); };

function check(s) {
  updates++;
  if (s.seq < lastSeq) bad(`seq went backwards ${lastSeq} -> ${s.seq}`, s);
  lastSeq = Math.max(lastSeq, s.seq);
  stats.phases[s.phase] = (stats.phases[s.phase] ?? 0) + 1;
  stats.maxRound = Math.max(stats.maxRound, s.round);
  const xs = s.board.filter((v) => v === "X").length, os = s.board.filter((v) => v === "O").length;
  const d = s.starter === "X" ? xs - os : os - xs;
  if (d !== 0 && d !== 1) bad(`mark counts impossible for starter ${s.starter}: X=${xs} O=${os}`, s);
  if ((s.phase === "over") !== (s.result !== null)) bad("phase/result mismatch", s);
  if (s.phase === "playing" && !(s.seats.X && s.seats.O)) bad("playing without both seats", s);
  if (s.phase === "playing" && !s.result) {
    const expectTurn = (xs === os) ? s.starter : (s.starter === "X" ? "O" : "X");
    if (s.turn !== expectTurn) bad(`turn ${s.turn} but expected ${expectTurn}`, s);
  }
  if (s.result?.line) for (const i of s.result.line) if (s.board[i] !== s.result.winner) bad("win line doesn't match winner", s);
  const c = s.challenge;
  if (c) {
    if (s.board[c.cell] !== null) bad("challenge on an occupied cell", s);
    if (c.seat !== s.turn) bad("challenge seat is not the turn", s);
    if (c.eliminated.includes(c.correctIndex)) bad("correct answer was eliminated", s);
    if (c.eliminated.length > c.options.length - 1) bad("too many eliminated", s);
    if (s.phase !== "playing") bad("challenge outside playing phase", s);
  }
  if (s.seats.X && s.seats.O && s.seats.X.id === s.seats.O.id) bad("same tablet in both seats", s);
}

let ws, alive = true;
function connect() {
  ws = new WebSocket(URL_);
  ws.on("open", () => ws.send(JSON.stringify({ type: "hello", role: "screen", id: "chaos-screen" })));
  ws.on("message", (raw) => { const m = JSON.parse(raw.toString()); if (m.type === "state" || m.type === "welcome") check(m.state); });
  ws.on("close", () => { if (alive) { reconnects++; setTimeout(connect, 300); } });
  ws.on("error", () => {});
}
connect();

const cmds = ["newgame", "newgame", "swap", "resetscores"];
const fire = setInterval(() => {
  if (ws.readyState !== 1) return;
  const type = cmds[Math.floor(Math.random() * cmds.length)];
  ws.send(JSON.stringify({ type })); commands++;
}, 7000 + Math.random() * 4000);

setTimeout(() => {
  alive = false; clearInterval(fire); ws.terminate();
  console.log(`\nchaos done: ${updates} state updates checked, ${commands} presenter commands, ${reconnects} screen reconnects`);
  console.log("phases seen:", JSON.stringify(stats.phases), "max round:", stats.maxRound);
  console.log(violations.length ? `!! ${violations.length} INVARIANT VIOLATIONS` : "no invariant violations");
  process.exit(violations.length ? 1 : 0);
}, SECS * 1000);
