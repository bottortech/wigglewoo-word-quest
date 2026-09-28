// Two fake tablets that play the real protocol against a running relay.
// Use it to watch the big screen without tablets, and to soak-test recovery.
//
//   node bots.mjs                       play forever at a human-ish pace
//   node bots.mjs --games 20 --think 300 --drop 0.15     fast, with random disconnects
//
// Options: --url ws://localhost:8787/ws   --think <ms per move>   --wrong <0..1>
//          --drop <0..1 chance a bot yanks its own socket each turn>   --games <n>
import WebSocket from "ws";

const args = Object.fromEntries(process.argv.slice(2).reduce((a, x, i, all) => {
  if (x.startsWith("--")) a.push([x.slice(2), all[i + 1]]);
  return a;
}, []));
const URL_ = args.url ?? "ws://localhost:8787/ws";
const THINK = Number(args.think ?? 1800);
const WRONG = Number(args.wrong ?? 0.3);
const DROP = Number(args.drop ?? 0);
const GAMES = Number(args.games ?? Infinity);
const AGAIN = Number(args.again ?? 4500);   // ms before Play Again after a game ends

const WORDS = [
  ["cat", "hat", "bat", "map"], ["pig", "dig", "sit", "cup"], ["sun", "bus", "cup", "pen"],
  ["dog", "fox", "bed", "net"], ["hat", "cat", "map", "bat"], ["pen", "net", "bed", "sit"],
].flat().filter((w, i, a) => a.indexOf(w) === i);
const LETTER_POOL = "abcdefghijklmnopqrstuvwxyz".split("");
const shuffle = (a) => { const o = [...a]; for (let i = o.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [o[i], o[j]] = [o[j], o[i]]; } return o; };
const pick = (a) => a[Math.floor(Math.random() * a.length)];

function makeChallenge() {
  const word = pick(WORDS);
  if (Math.random() < 0.5) {
    const blankIndex = Math.floor(Math.random() * word.length);
    const correct = word[blankIndex];
    const wrong = shuffle(LETTER_POOL.filter((l) => !word.includes(l))).slice(0, 2);
    const options = shuffle([correct, ...wrong]);
    return { type: "missing-letter", word, letters: word.split(""), blankIndex, options, correctIndex: options.indexOf(correct) };
  }
  const options = shuffle([word, ...shuffle(WORDS.filter((w) => w !== word)).slice(0, 2)]);
  return { type: "word-picture-match", word, options, correctIndex: options.indexOf(word) };
}

let gamesDone = 0;
const stats = { moves: 0, wrong: 0, drops: 0, reconnects: 0, errors: {} };

function bot(id) {
  let ws, seat = null, state = null, alive = true, backoff = 300, timer = null;
  const say = (m) => console.log(`[${id}] ${m}`);
  const send = (o) => ws?.readyState === 1 && ws.send(JSON.stringify(o));
  const later = (fn, ms) => { clearTimeout(timer); timer = setTimeout(fn, ms); };

  function act() {
    if (!state || !seat) return;
    const s = state, mine = s.seats[seat]?.id === id;
    if (!mine) return;
    if (s.phase === "over") {
      if (seat === "X") later(() => { gamesDone++; stats.games = gamesDone; if (gamesDone >= GAMES) return finish(); send({ type: "rematch" }); }, AGAIN);
      return;
    }
    if (s.phase !== "playing") return;
    const c = s.challenge;
    if (!c && s.turn === seat) {
      const empty = s.board.map((v, i) => (v ? null : i)).filter((i) => i !== null);
      later(() => {
        if (Math.random() < DROP) { stats.drops++; say("yanking socket"); ws.terminate(); return; }
        send({ type: "challenge", cell: pick(empty), challenge: makeChallenge() });
        stats.moves++;
      }, THINK);
    } else if (c && c.seat === seat && c.status === "open") {
      const live = c.options.map((_, i) => i).filter((i) => !c.eliminated.includes(i));
      const wrongs = live.filter((i) => i !== c.correctIndex);
      const goWrong = wrongs.length > 0 && Math.random() < WRONG && c.wrongCount < 2;
      later(() => { if (goWrong) stats.wrong++; send({ type: "answer", index: goWrong ? pick(wrongs) : c.correctIndex }); }, Math.max(400, THINK * 0.7));
    }
  }

  function connect() {
    if (!alive) return;
    ws = new WebSocket(URL_);
    ws.on("open", () => { backoff = 300; send({ type: "hello", role: "player", id, name: id === "bot-a" ? "Ava" : "Ben" }); });
    ws.on("message", (raw) => {
      const m = JSON.parse(raw.toString());
      if (m.type === "welcome") { seat = m.seat; state = m.state; say(`seated as ${seat}${m.takeover ? " (takeover)" : ""}`); act(); }
      else if (m.type === "state") { state = m.state; act(); }
      else if (m.type === "error") { stats.errors[m.code] = (stats.errors[m.code] ?? 0) + 1; }
    });
    ws.on("close", () => { if (!alive) return; stats.reconnects++; setTimeout(connect, backoff); backoff = Math.min(backoff * 2, 2000); });
    ws.on("error", () => {});
  }
  connect();
  return { stop() { alive = false; clearTimeout(timer); ws?.terminate(); } };
}

const bots = [bot("bot-a"), bot("bot-b")];
function finish() {
  bots.forEach((b) => b.stop());
  console.log("\nDone.", JSON.stringify(stats));
  process.exit(0);
}
process.on("SIGINT", finish);
console.log(`bots -> ${URL_}  think=${THINK}ms wrong=${WRONG} drop=${DROP} games=${GAMES}`);
