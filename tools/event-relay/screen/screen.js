// WiggleWoo Word-Tac-Toe — big-screen view. Pure renderer of the relay's game
// state (see ../game.mjs for the protocol). Also the presenter's control
// surface: a few hotkeys send commands back to the relay.
(() => {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const stage = $("stage");
  const params = new URLSearchParams(location.search);
  const PREVIEW = params.get("preview");

  const MARK_IMG = { X: "/img/wigglewoo_X.png", O: "/img/wigglewoo_O.png" };
  const NAME = { X: "Player X", O: "Player O" };
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const up = (s) => esc(String(s).toUpperCase());

  // ---------- scale the 1920x1080 stage to whatever display this is ----------
  function fit() {
    const k = Math.min(innerWidth / 1920, innerHeight / 1080);
    stage.style.transform = `translate(-50%, -50%) scale(${k})`;
  }
  addEventListener("resize", fit);
  fit();

  // ---------- sound (browsers need one click/keypress before audio may play) ----------
  const audio = { unlocked: false, muted: false };
  const SUCCESS = ["great-job", "amazing", "fantastic", "nice-work"];
  function unlockAudio() {
    if (audio.unlocked) return;
    audio.unlocked = true;
    $("sound").classList.add("hidden");
  }
  function play(url, volume = 1) {
    if (!audio.unlocked || audio.muted) return;
    const a = new Audio(url);
    a.volume = volume;
    a.play().catch(() => {});
  }
  const sfx = {
    word: (w) => play(`/assets/audio/words/${w}.m4a`, 1),
    success: () => play(`/assets/audio/phrases/${SUCCESS[Math.floor(Math.random() * SUCCESS.length)]}.m4a`, 0.9),
    wrong: () => play("/assets/audio/events/wrong-gentle.m4a", 0.8),
    // The dedicated Word-Tac-Toe win/tie lines aren't recorded yet (VO pickup
    // round 3) — use existing celebration + phrase audio until they land.
    win: () => { play("/assets/audio/events/celebrate-perfect.m4a", 0.9); setTimeout(() => play("/assets/audio/phrases/hooray.m4a", 1), 900); },
    tie: () => play("/assets/audio/events/celebrate-assisted.m4a", 0.9),
  };
  if (!PREVIEW) setTimeout(() => { if (!audio.unlocked) $("sound").classList.remove("hidden"); }, 600);

  // ---------- confetti ----------
  const cv = $("confetti");
  const cx = cv.getContext("2d");
  let confettiRaf = 0;
  function confetti(ms = 6500, count = 170) {
    cancelAnimationFrame(confettiRaf);
    const colors = ["#6FC9BE", "#FFB65E", "#F5C542", "#E85D5D", "#C7A3E8", "#7BE0A0", "#fff"];
    const ps = Array.from({ length: count }, () => ({
      x: Math.random() * 1920, y: -Math.random() * 900 - 20,
      w: 14 + Math.random() * 16, h: 8 + Math.random() * 12,
      vx: -2 + Math.random() * 4, vy: 4 + Math.random() * 6,
      rot: Math.random() * 6.28, vr: -0.2 + Math.random() * 0.4,
      c: colors[Math.floor(Math.random() * colors.length)],
    }));
    const t0 = performance.now();
    (function frame(now) {
      const t = now - t0;
      cx.clearRect(0, 0, 1920, 1080);
      for (const p of ps) {
        p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.vy += 0.03;
        cx.save(); cx.translate(p.x, p.y); cx.rotate(p.rot);
        cx.globalAlpha = t > ms - 900 ? Math.max(0, (ms - t) / 900) : 1;
        cx.fillStyle = p.c; cx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); cx.restore();
      }
      if (t < ms) confettiRaf = requestAnimationFrame(frame);
      else cx.clearRect(0, 0, 1920, 1080);
    })(t0);
  }

  // ---------- rendering ----------
  const boardEl = $("board");
  for (let i = 0; i < 9; i++) { const c = document.createElement("div"); c.className = "cell"; boardEl.appendChild(c); }
  const panel = $("panel");
  let lastPanelSig = "";
  let lastChallengeId = null;
  let lastWrongN = 0;
  const cardHtml = { X: "", O: "" };

  function renderCards(s) {
    for (const m of ["X", "O"]) {
      const seat = s.seats[m];
      const active = s.phase === "playing" && s.turn === m;
      $("card-" + m).classList.toggle("active", active);
      let dot = "on", text;
      if (!seat) { dot = "wait"; text = "Waiting for tablet…"; }
      else if (!seat.connected) { dot = "wait"; text = "Reconnecting…"; }
      else if (s.phase === "over") text = s.result?.winner === m ? "Winner!" : "Good game!";
      else if (active) text = s.challenge ? "Solving the word…" : "Your move!";
      else text = "Get ready…";
      const html = `<img src="${MARK_IMG[m]}" alt=""><div class="who"><div class="name">${esc(seat?.name ?? NAME[m])}</div>` +
        `<div class="status"><span class="dot ${dot}"></span>${text}</div></div>` +
        `<div class="wins"><div class="n">${s.wins[m]}</div><div class="l">WINS</div></div>`;
      if (html !== cardHtml[m]) { $("card-" + m).innerHTML = html; cardHtml[m] = html; }
    }
  }

  const CELL = (760 - 44) / 3;
  const centre = (i) => [(i % 3) * (CELL + 22) + CELL / 2, Math.floor(i / 3) * (CELL + 22) + CELL / 2];

  function renderBoard(prev, s) {
    const cells = boardEl.children;
    for (let i = 0; i < 9; i++) {
      const v = s.board[i];
      const c = cells[i];
      const win = s.result?.line?.includes(i);
      c.className = "cell" + (v ? " filled" : "") + (s.challenge?.cell === i ? " active" : "") + (win ? ` win ${v.toLowerCase()}` : "");
      if ((c.dataset.mark || "") !== (v || "")) {
        const fresh = prev && !prev.board[i];
        c.innerHTML = v ? `<img class="${fresh ? "pop" : ""}" src="${MARK_IMG[v]}" alt="${v}">` : "";
        c.dataset.mark = v || "";
      }
    }
    const svg = $("winline");
    const line = s.result?.line;
    const key = line ? line.join() + s.result.winner : "";
    if (svg.dataset.key !== key) {
      svg.dataset.key = key;
      if (line) {
        const [x1, y1] = centre(line[0]);
        const [x2, y2] = centre(line[2]);
        svg.innerHTML = `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${s.result.winner === "X" ? "#2E6F67" : "#B96500"}"/>`;
      } else svg.innerHTML = "";
    }
  }

  function challengeHtml(s) {
    const c = s.challenge;
    const correct = c.status === "correct";
    const seat = s.seats[c.seat];
    const chip = `<div class="chip ${c.seat.toLowerCase()}"><img src="${MARK_IMG[c.seat]}" alt="">${esc(seat?.name ?? NAME[c.seat]).toUpperCase()}</div>`;
    const showWrong = c.wrongN > lastWrongN && !correct;
    const opts = `<div class="options${c.type === "word-picture-match" ? " words" : ""}">` + c.options.map((o, i) => {
      const cls = ["opt", c.eliminated.includes(i) ? "gone" : "", showWrong && c.wrongIndex === i ? "wrong" : "", correct && i === c.correctIndex ? "right" : ""].join(" ");
      return `<div class="${cls}">${up(o)}</div>`;
    }).join("") + `</div>`;
    let body;
    if (c.type === "missing-letter") {
      body = `<div class="question">Choose the missing letter!</div><div class="letters">` +
        c.letters.map((l, i) => i === c.blankIndex
          ? `<div class="tile ${correct ? "filled" : "blank"}">${correct ? up(c.options[c.correctIndex]) : "?"}</div>`
          : `<div class="tile">${up(l)}</div>`).join("") + `</div>`;
    } else {
      body = `<div class="question long">Which word matches the picture?</div>` +
        `<div class="pic"><img src="/assets/words/${esc(c.word)}.png" alt="" onerror="this.style.visibility='hidden'"></div>`;
    }
    return chip + body + opts + (correct ? `<div class="stamp">✓ Correct!</div>` : "");
  }

  function idleHtml(s) {
    const seat = s.seats[s.turn];
    const away = seat && !seat.connected;
    return `<div class="idle"><img class="mascot" src="${MARK_IMG[s.turn]}" alt="">` +
      `<div class="big ${s.turn.toLowerCase()}">${esc(seat?.name ?? NAME[s.turn])}, pick a square!</div>` +
      `<div class="sub ${away ? "warn" : ""}">${away ? "Waiting for the tablet to reconnect…" : "Choose any empty square on your tablet"}</div></div>`;
  }

  function overHtml(s) {
    const w = s.result?.winner;
    const name = w ? esc(s.seats[w]?.name ?? NAME[w]) : "";
    const score = `<div class="score"><span class="s x">X &nbsp;${s.wins.X}</span><span class="s o">O &nbsp;${s.wins.O}</span></div>`;
    const again = `<div class="again">Tap Play Again on your tablet</div>`;
    if (w) {
      return `<div class="celebrate"><div class="mascots"><img class="mascot" src="${MARK_IMG[w]}" alt=""></div>` +
        `<div class="headline ${w.toLowerCase()}">${name} wins!</div><div class="sub">Three in a row! ⭐</div>${score}${again}</div>`;
    }
    return `<div class="celebrate"><div class="mascots both"><img class="mascot" src="${MARK_IMG.X}" alt=""><img class="mascot" src="${MARK_IMG.O}" alt=""></div>` +
      `<div class="headline tie">It's a tie!</div><div class="sub">Great game, both of you!</div>${score}${again}</div>`;
  }

  function renderPanel(s) {
    const mode = s.phase === "over" ? "over" : s.challenge ? "challenge" : "idle";
    const c = s.challenge;
    const away = s.seats[s.turn] && !s.seats[s.turn].connected;
    const sig = JSON.stringify([mode, c && [c.id, c.status, c.wrongN, c.eliminated], s.turn, s.result, s.wins, s.round, !!away, s.seats.X?.name, s.seats.O?.name]);
    if (sig === lastPanelSig) return;
    const fresh = mode !== "challenge" || !c || c.id !== lastChallengeId;
    lastPanelSig = sig;
    panel.className = mode === "over" ? "" : `turn-${s.turn.toLowerCase()}` + (c?.status === "correct" ? " is-correct" : "");
    panel.innerHTML = mode === "over" ? overHtml(s) : mode === "challenge" ? challengeHtml(s) : idleHtml(s);
    if (fresh) { panel.classList.add("enter"); }
    lastChallengeId = c ? c.id : null;
    lastWrongN = c ? c.wrongN : 0;
  }

  function renderLobby(s) {
    const lobby = $("lobby");
    const show = s.phase === "lobby";
    lobby.classList.toggle("show", show);
    $("topbar").style.display = $("main").style.display = show ? "none" : "";
    if (!show) return;
    const seat = (m) => {
      const st = s.seats[m];
      const ready = st && st.connected;
      return `<div class="seat ${m.toLowerCase()} ${ready ? "ready" : ""}"><img src="${MARK_IMG[m]}" alt="">` +
        `<div class="sname">${esc(st?.name ?? NAME[m])}</div><div class="sstat">${ready ? "Ready! ✓" : st ? "Reconnecting…" : "Waiting for a tablet…"}</div></div>`;
    };
    const html = `<img class="logo" src="/img/wigglewoos_word_quest_badge-logo.png" alt=""><div class="ltitle">WORD-TAC-TOE</div>` +
      `<div class="lsub">Grab a tablet and join the game!</div><div class="seats">${seat("X")}${seat("O")}</div>`;
    if (lobby._html !== html) { lobby.innerHTML = html; lobby._html = html; }
  }

  // ---------- state -> screen, plus sound/confetti on real transitions ----------
  let prevState = null;
  function effects(prev, s) {
    if (!prev) return;                                   // first snapshot (page load / reconnect): stay quiet
    const c = s.challenge, p = prev.challenge;
    if (c && (!p || p.id !== c.id)) sfx.word(c.word);
    if (c && p && c.id === p.id) {
      if (c.wrongN > p.wrongN) sfx.wrong();
      if (c.status === "correct" && p.status !== "correct") sfx.success();
    }
    if (s.phase === "over" && prev.phase !== "over") {
      if (s.result?.winner) { sfx.win(); confetti(); } else { sfx.tie(); confetti(3500, 70); }
    }
  }
  function setState(s) {
    const prev = prevState;
    renderLobby(s);
    renderCards(s);
    renderBoard(prev, s);
    renderPanel(s);
    effects(prev, s);
    prevState = s;
  }

  // ---------- connection ----------
  let ws = null, lastMsg = 0, backoff = 500, downSince = 0, connTimer = 0;
  const screenId = "screen-" + Math.random().toString(36).slice(2, 8);
  const conn = $("conn");
  function send(o) { if (ws && ws.readyState === 1) { ws.send(JSON.stringify(o)); return true; } return false; }
  function connect() {
    ws = new WebSocket(`ws://${location.host}/ws`);
    ws.onopen = () => {
      backoff = 500; lastMsg = Date.now(); downSince = 0;
      clearTimeout(connTimer); conn.classList.add("hidden");
      send({ type: "hello", role: "screen", id: screenId });
    };
    ws.onmessage = (e) => {
      lastMsg = Date.now();
      const m = JSON.parse(e.data);
      if (m.type === "welcome" || m.type === "state") setState(m.state);
    };
    ws.onclose = () => {
      if (!downSince) { downSince = Date.now(); connTimer = setTimeout(() => conn.classList.remove("hidden"), 1500); }
      setTimeout(connect, backoff);
      backoff = Math.min(backoff * 2, 2000);
    };
    ws.onerror = () => {};
  }
  setInterval(() => { if (ws && ws.readyState === 1 && Date.now() - lastMsg > 4500) ws.close(); }, 1000);

  // ---------- presenter keys ----------
  let toastTimer = 0, armed = null;
  function toast(text) {
    const t = $("toast");
    t.textContent = text; t.classList.remove("hidden");
    clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.add("hidden"), 2200);
  }
  function command(type, label) {
    if (send({ type })) toast(label); else toast("Not connected to the relay");
  }
  function twice(key, type, label, prompt) {
    if (armed && armed.key === key && Date.now() < armed.until) { armed = null; command(type, label); }
    else { armed = { key, until: Date.now() + 2000 }; toast(prompt); }
  }
  addEventListener("pointerdown", unlockAudio);
  let cursorTimer = 0;
  addEventListener("mousemove", () => {
    document.body.classList.add("show-cursor");
    clearTimeout(cursorTimer);
    cursorTimer = setTimeout(() => document.body.classList.remove("show-cursor"), 2500);
  });
  addEventListener("keydown", (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    unlockAudio();
    const k = e.key.toLowerCase();
    if (k === "n") command("newgame", "New game");
    else if (k === "r") twice("r", "resetscores", "Scores reset", "Press R again to reset scores");
    else if (k === "k") twice("k", "clearseats", "Cleared — waiting for tablets", "Press K again to clear both tablets");
    else if (k === "s") command("swap", "Swapped X and O");
    else if (k === "m") { audio.muted = !audio.muted; toast(audio.muted ? "Sound off" : "Sound on"); }
    else if (k === "f") { if (document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen?.(); }
    else if (k === "h") $("help").classList.toggle("hidden");
  });

  // ---------- preview mode: canned states, no relay needed ----------
  const blank = () => ({
    v: 1, seq: 1, phase: "playing", round: 1, starter: "X", turn: "X", challengeCount: 1,
    seats: { X: { id: "a", name: "Player X", connected: true }, O: { id: "b", name: "Player O", connected: true } },
    board: Array(9).fill(null), challenge: null, result: null, wins: { X: 0, O: 0 }, ties: 0,
  });
  const chal = (over = {}) => ({
    id: 1, seat: "X", cell: 2, type: "missing-letter", word: "cat", letters: ["c", "a", "t"], blankIndex: 1,
    options: ["o", "a", "u"], correctIndex: 1, status: "open", wrongCount: 0, wrongN: 0, wrongIndex: null, eliminated: [], ...over,
  });
  const mid = (o = {}) => ({ ...blank(), board: ["X", null, null, null, "O", null, null, null, null], wins: { X: 1, O: 0 }, ...o });
  const PREVIEWS = {
    lobby: () => ({ ...blank(), phase: "lobby", seats: { X: { id: "a", name: "Player X", connected: true }, O: null } }),
    idle: () => mid({ turn: "X" }),
    letter: () => mid({ challenge: chal() }),
    hint: () => mid({ challenge: chal({ options: ["o", "a", "u", "e"], eliminated: [2], wrongCount: 2, wrongN: 2, wrongIndex: 2 }) }),
    picture: () => mid({ turn: "O", challenge: chal({ seat: "O", type: "word-picture-match", word: "bat", options: ["bat", "hat", "map"], correctIndex: 0, letters: undefined, blankIndex: undefined }) }),
    wrong: () => mid({ challenge: chal({ wrongCount: 1, wrongN: 1, wrongIndex: 0 }) }),
    correct: () => mid({ challenge: chal({ status: "correct" }) }),
    win: () => ({ ...blank(), phase: "over", board: ["X", "O", null, "O", "X", null, null, null, "X"], result: { winner: "X", line: [0, 4, 8] }, wins: { X: 2, O: 1 } }),
    winO: () => ({ ...blank(), phase: "over", board: ["X", "X", "O", null, "O", null, "O", null, "X"], result: { winner: "O", line: [2, 4, 6] }, wins: { X: 1, O: 2 }, turn: "O" }),
    tie: () => ({ ...blank(), phase: "over", board: ["X", "O", "X", "X", "O", "O", "O", "X", "X"], result: { winner: null, line: null }, ties: 1 }),
    reconnect: () => mid({ turn: "O", seats: { X: { id: "a", name: "Player X", connected: true }, O: { id: "b", name: "Player O", connected: false } } }),
  };
  if (PREVIEW) {
    document.body.classList.add("show-cursor");
    const names = PREVIEW === "gallery" ? Object.keys(PREVIEWS) : [PREVIEW];
    let i = 0;
    const show = () => {
      const name = names[i++ % names.length];
      lastPanelSig = ""; lastChallengeId = null; lastWrongN = 0;
      prevState = null;
      setState(PREVIEWS[name]());
      if (name === "win" || name === "winO") confetti(60000);
      if (name === "tie") confetti(60000, 70);
      if (PREVIEW === "gallery") document.title = "preview: " + name;
    };
    show();
    if (PREVIEW === "gallery") setInterval(show, 4000);
  } else {
    setState({ ...blank(), phase: "lobby", seats: { X: null, O: null } });
    connect();
  }
})();
