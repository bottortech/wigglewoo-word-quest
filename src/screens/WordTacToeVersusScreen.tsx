// =============================================
// WordTacToeVersusScreen.tsx — two tablets, one game
// =============================================
// Event build only. Two audience volunteers each hold a tablet; the presenter
// laptop's relay (tools/event-relay) owns the game and the big screen shows
// it to the room. This screen is a thin renderer of the relay's state:
//   - tap a square on your turn -> build a literacy challenge with the SAME
//     builders single-player uses, send it once, answer it here
//   - everything else (was it right? whose turn? who won?) comes back from
//     the relay, so the two tablets and the big screen can never disagree
// Recovery is automatic: a dropped link retries forever and the relay replies
// with the full game, so a volunteer never sees a broken state — only a small
// "Reconnecting…" note while it happens. There is no auto-exit and no exit
// button: volunteers just play; the presenter leaves via the event menu.

import React, { useCallback, useEffect, useRef, useState } from "react";
import type { CvcWord } from "../game/types";
import { buildMissingLetterChallenge, buildWordPictureChallenge, shuffle } from "./WordTacToeScreen";
import { RelayClient } from "../versus/relayClient";
import type { LinkStatus } from "../versus/relayClient";
import { findRelay, getDeviceId, loadRelayAddress, relayWsUrl, saveRelayAddress } from "../versus/relayAddress";
import type { Mark, VersusState, WireChallenge } from "../versus/protocol";
import { playEvent, playSuccessPhrase, playWordSound } from "../audio/SoundEffects";
import wigglewooX from "../assets/wigglewoo_X.png";
import wigglewooO from "../assets/wigglewoo_O.png";
import "../styles/word-tac-toe.css";
import "../styles/word-tac-toe-versus.css";

interface Props {
  /** Challenge pool (see versus/versusWords.ts). */
  words: CvcWord[];
  /** Play word/feedback audio on THIS tablet. Off by default: the laptop plays it for the room. */
  tabletSound?: boolean;
}

type Finder = "no-address" | "searching" | "scanning" | "none" | "ready";

const MARK_ASSET: Record<Mark, string> = { X: wigglewooX, O: wigglewooO };
const otherMark = (m: Mark): Mark => (m === "X" ? "O" : "X");

const WordTacToeVersusScreen: React.FC<Props> = ({ words, tabletSound = false }) => {
  const [vs, setVs] = useState<VersusState | null>(null);
  const [seat, setSeat] = useState<Mark | null>(null);
  const [link, setLink] = useState<LinkStatus>("connecting");
  const [linkDetail, setLinkDetail] = useState<string | undefined>(undefined);
  const [finder, setFinder] = useState<Finder>(() => (loadRelayAddress() ? "searching" : "no-address"));
  const [attempt, setAttempt] = useState(0);
  const [wrongFlash, setWrongFlash] = useState<number | null>(null);

  const clientRef = useRef<RelayClient | null>(null);
  const wordQueue = useRef<CvcWord[]>([]);
  const pendingRef = useRef(false);
  const lastWrongN = useRef(0);
  const lastChallengeId = useRef<number | null>(null);
  const lastCorrect = useRef(false);
  const soundRef = useRef(tabletSound);
  useEffect(() => { soundRef.current = tabletSound; }, [tabletSound]);

  // Find the relay (saved address first, then a scan of that network), then
  // connect. Re-runs when `attempt` changes (auto-retry while it's not found).
  useEffect(() => {
    const saved = loadRelayAddress();
    if (!saved) return;
    let cancelled = false;
    findRelay(saved, { onScan: () => { if (!cancelled) setFinder("scanning"); } }).then((host) => {
      if (cancelled) return;
      if (!host) { setFinder("none"); return; }
      if (host !== saved) saveRelayAddress(host);
      const client = new RelayClient({
        url: relayWsUrl(host),
        id: getDeviceId(),
        onState: (s) => {
          const c = s.challenge;
          if (soundRef.current) {
            if (c && c.id !== lastChallengeId.current && c.seat === client.seat) playWordSound(c.word);
            if (c && c.wrongN > lastWrongN.current && c.seat === client.seat) playEvent("wrong-gentle");
            if (c?.status === "correct" && !lastCorrect.current && c.seat === client.seat) playSuccessPhrase();
          }
          if (c && c.wrongN > lastWrongN.current && c.wrongIndex !== null) {
            setWrongFlash(c.wrongIndex);
            setTimeout(() => setWrongFlash(null), 500);
          }
          lastWrongN.current = c ? c.wrongN : 0;
          lastChallengeId.current = c ? c.id : null;
          lastCorrect.current = c?.status === "correct";
          setVs(s);
        },
        onWelcome: (w) => setSeat(w.seat),
        onStatus: (st, detail) => { setLink(st); setLinkDetail(detail); },
      });
      clientRef.current = client;
      setFinder("ready");
      client.start();
    });
    return () => {
      cancelled = true;
      clientRef.current?.stop();
      clientRef.current = null;
    };
  }, [attempt]);

  // Not found -> keep looking on its own; the laptop may just not be up yet.
  useEffect(() => {
    if (finder !== "none") return;
    const t = setTimeout(() => { setFinder("searching"); setAttempt((a) => a + 1); }, 4000);
    return () => clearTimeout(t);
  }, [finder]);

  // No address was saved when this screen first mounted (e.g. the presenter
  // tapped Play before successfully finding the game). The main find-relay
  // effect above only fires on a saved address, so on its own this would sit
  // stuck forever even after the presenter sets one in the event menu —
  // poll localStorage until one shows up, then hand off to that effect.
  useEffect(() => {
    if (finder !== "no-address") return;
    const t = setInterval(() => {
      if (loadRelayAddress()) { setFinder("searching"); setAttempt((a) => a + 1); }
    }, 1000);
    return () => clearInterval(t);
  }, [finder]);

  // Gone for a while? The laptop may have come back on a different address
  // (new DHCP lease), which plain retrying would never discover — so after 10 s
  // down, start over from the finder, which re-scans the saved network.
  useEffect(() => {
    if (finder !== "ready" || link !== "down") return;
    const t = setTimeout(() => { setFinder("searching"); setAttempt((a) => a + 1); }, 10000);
    return () => clearTimeout(t);
  }, [finder, link]);

  const nextWord = useCallback((): CvcWord => {
    if (wordQueue.current.length === 0) wordQueue.current = shuffle(words);
    return wordQueue.current.shift()!;
  }, [words]);

  const handleCellTap = useCallback((cell: number) => {
    if (!vs || !seat || link !== "open") return;
    if (vs.phase !== "playing" || vs.turn !== seat || vs.challenge || vs.board[cell]) return;
    if (pendingRef.current) return;                    // ignore a double-tap while the relay answers
    pendingRef.current = true;
    setTimeout(() => { pendingRef.current = false; }, 1200);
    const word = nextWord();
    const built = Math.random() < 0.5 ? buildMissingLetterChallenge(word) : buildWordPictureChallenge(word, words);
    const wire: WireChallenge = built.type === "missing-letter"
      ? { type: built.type, word: word.word, letters: word.letters, blankIndex: built.blankIndex, options: built.options, correctIndex: built.correctIndex }
      : { type: built.type, word: word.word, options: built.options, correctIndex: built.correctIndex };
    clientRef.current?.sendChallenge(cell, wire);
  }, [vs, seat, link, nextWord, words]);

  const handleOption = useCallback((index: number) => {
    clientRef.current?.sendAnswer(index);
  }, []);

  const handlePlayAgain = useCallback(() => { clientRef.current?.sendRematch(); }, []);

  // ---------------- not connected yet ----------------
  const waitingScreen = (mascot: Mark, title: string, sub: string, tone: "" | " wttv-wait--warn" = "") => (
    <div className="wtt wttv">
      <div className={`wttv-wait${tone}`}>
        <img className="wttv-wait__mascot" src={MARK_ASSET[mascot]} alt="" draggable={false} />
        <div className="wttv-wait__title">{title}</div>
        <div className="wttv-wait__sub">{sub}</div>
      </div>
    </div>
  );

  if (finder === "no-address") {
    return waitingScreen("X", "This tablet isn't set up for the game yet",
      "Ask the presenter to open the event menu (tap the bottom-left corner 3 times) and enter the game address.", " wttv-wait--warn");
  }
  if (finder === "searching") return waitingScreen("X", "Finding the game…", "Hang on a moment!");
  if (finder === "scanning") return waitingScreen("O", "Still looking…", "Checking the network for the game.");
  if (finder === "none") {
    return waitingScreen("O", "Can't find the game yet",
      "Make sure the laptop is on and this tablet is on the same Wi-Fi. Trying again…", " wttv-wait--warn");
  }
  if (linkDetail === "blocked") {
    return waitingScreen("O", "This app can't join the game",
      "It wasn't installed as the event app. Ask the presenter.", " wttv-wait--warn");
  }
  if (!vs) return waitingScreen("X", "Joining the game…", link === "down" ? "Reconnecting…" : "Almost there!");
  if (!seat) return waitingScreen("O", "This game already has two players", "Ask the presenter to reset the tablets.", " wttv-wait--warn");

  // ---------------- in the game ----------------
  const opp = otherMark(seat);
  const oppSeat = vs.seats[opp];
  const me = vs.seats[seat];
  const myTurn = vs.phase === "playing" && vs.turn === seat;
  const c = vs.challenge;
  const mine = !!c && c.seat === seat;
  const oppName = oppSeat?.name ?? `Player ${opp}`;

  let panel: React.ReactNode;
  if (vs.phase === "lobby") {
    panel = (
      <div className="wtt__panel-idle">
        <img src={MARK_ASSET[seat]} alt="" className="wtt__panel-idle-mascot" draggable={false} />
        <span className="wtt__panel-idle-text">You're Player {seat}!<br />Waiting for {oppName}…</span>
      </div>
    );
  } else if (c && mine && c.status === "correct") {
    panel = (
      <div className="wtt__panel-feedback wtt__panel-feedback--correct">
        <span className="wtt__panel-feedback-icon">✅</span>
        <span>Correct!</span>
      </div>
    );
  } else if (c && mine && c.status === "wrong") {
    // Held briefly (WRONG_MS on the relay, mirroring how "correct" holds for
    // CORRECT_MS) so the options panel below doesn't stay tappable during
    // the window before the turn actually passes — one wrong tap ends the
    // turn, there's no retry.
    panel = (
      <div className="wtt__panel-feedback wtt__panel-feedback--wrong">
        <span className="wtt__panel-feedback-icon">❌</span>
        <span>Not quite — {oppName}'s turn!</span>
      </div>
    );
  } else if (c && mine) {
    panel = (
      <div className="wtt__panel-challenge">
        <div className="wtt__panel-question">
          {c.type === "missing-letter" ? "Choose the missing letter!" : "Which word matches the picture?"}
        </div>
        {c.type === "missing-letter" ? (
          <>
            <div className="wtt__prompt">
              {(c.letters ?? c.word.split("")).map((l, i) => (
                <span key={i} className="wtt__prompt-letter">{i === c.blankIndex ? "_" : l.toUpperCase()}</span>
              ))}
            </div>
            <div className="wtt__options">
              {c.options.map((opt, i) => !c.eliminated.includes(i) && (
                <button key={i} className={["wtt__option", wrongFlash === i ? "wtt__option--wrong" : ""].join(" ")}
                  onClick={() => handleOption(i)}>{opt.toUpperCase()}</button>
              ))}
            </div>
          </>
        ) : (
          <>
            <img className="wtt__prompt-picture" src={`/assets/words/${c.word}.png`} alt="" draggable={false}
              onError={(e) => { (e.target as HTMLImageElement).style.visibility = "hidden"; }} />
            <div className="wtt__options wtt__options--words">
              {c.options.map((opt, i) => !c.eliminated.includes(i) && (
                <button key={i} className={["wtt__option", "wtt__option--word", wrongFlash === i ? "wtt__option--wrong" : ""].join(" ")}
                  onClick={() => handleOption(i)}>{opt.toUpperCase()}</button>
              ))}
            </div>
          </>
        )}
      </div>
    );
  } else {
    const away = oppSeat && !oppSeat.connected;
    const text = c ? `${oppName} is solving a word…\nCheer them on!`
      : away ? `Waiting for ${oppName} to reconnect…`
        : myTurn ? "Your turn!\nTap a square" : `${oppName} is picking a square…`;
    panel = (
      <div className="wtt__panel-idle">
        <img src={MARK_ASSET[c || !myTurn ? opp : seat]} alt="" className="wtt__panel-idle-mascot" draggable={false} />
        <span className="wtt__panel-idle-text wttv-multiline">{text}</span>
      </div>
    );
  }

  const over = vs.phase === "over";
  const won = over && vs.result?.winner === seat;
  const tie = over && vs.result?.winner === null;
  const resultText = won ? "🌟 You got three in a row! 🌟" : tie ? "It's a tie — great game!" : `${oppName} got three in a row!\nGreat try!`;

  return (
    <div className="wtt wttv">
      <div className="wttv__bar">
        <div className={`wttv__me wttv__me--${seat.toLowerCase()}`}>
          <img src={MARK_ASSET[seat]} alt="" draggable={false} />
          <span>{me?.name ?? `Player ${seat}`}</span>
        </div>
        {link !== "open" && <div className="wttv__conn">Reconnecting…</div>}
        <div className="wttv__score">
          <span className="wttv__score-x">X {vs.wins.X}</span>
          <span className="wttv__score-o">O {vs.wins.O}</span>
        </div>
      </div>

      <div className="wtt__stage">
        <div className="wtt__board-col">
          <div className="wtt__board">
            <div className="wtt__grid">
              {vs.board.map((cell, i) => (
                <button
                  key={i}
                  className={[
                    "wtt__cell",
                    cell ? "wtt__cell--filled" : "wtt__cell--empty",
                    c?.cell === i ? "wtt__cell--active" : "",
                    vs.result?.line?.includes(i) ? "wttv__cell--win" : "",
                  ].filter(Boolean).join(" ")}
                  onClick={() => handleCellTap(i)}
                  disabled={cell !== null || !myTurn || !!c || over || link !== "open"}
                  aria-label={cell ? `Square ${i + 1}, ${cell}` : `Square ${i + 1}, empty`}
                >
                  {cell && <img src={MARK_ASSET[cell]} alt={cell} className="wtt__piece" draggable={false} />}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className={`wtt__panel${myTurn && !c ? " wttv__panel--go" : ""}`}>{panel}</div>
      </div>

      {over && (
        <div className="wtt__celebration" aria-live="polite">
          <span className="wtt__celebration-text wttv-multiline">{resultText}</span>
          <button className="wttv__again-btn" onClick={handlePlayAgain}>Play Again!</button>
        </div>
      )}
    </div>
  );
};

export default WordTacToeVersusScreen;
