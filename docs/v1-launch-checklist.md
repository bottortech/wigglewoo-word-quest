# WiggleWoo's Word Quest — v1 App Store Launch Checklist

Snapshot date: 2026-05-09 (refreshed from 2026-04-26 baseline)
Target: iOS App Store, Kids 4+ category

---

## ✅ Done

### Code / build
- [x] App version 1.0.0 (package.json + Xcode `MARKETING_VERSION`)
- [x] `UIRequiredDeviceCapabilities` corrected `armv7` → `arm64`
- [x] `IPHONEOS_DEPLOYMENT_TARGET = 16.0`
- [x] App icon: single 1024×1024 universal asset (modern Xcode format)
- [x] Splash screen present (2732×2732)
- [x] iOS Info.plist locked to landscape only (no portrait) — *2026-05-08*
- [x] Branded boot loader replaces "Rotate your device" overlay — *2026-05-08*
- [x] OpenDyslexic font self-hosted, SIL OFL 1.1 licensed
- [x] Dev-only controls guarded by `import.meta.env.DEV`
- [x] Web build, `cap sync ios`, simulator-target `xcodebuild` all clean

### Audio
- [x] **Phoneme audio — Take 3 final cut landed** — `/public/assets/audio/new phonetics/{A-Z} Phoneme_1.wav`, wired in `playLetterSound`. *Take 3 replaced earlier takes on 2026-05-31.*
- [x] All event VOs present and matched to `EventSlug` types (36 total — original 28 + 4 from May pickup + 4 from May "additional lines" batch — see `playEvent()` in [src/audio/SoundEffects.ts](../src/audio/SoundEffects.ts))
- [x] **Per-room discovery welcome lines** (`welcome-volcano`, `-castle`, `-coastal`, `-geartown`, `-greenhouse`) + first-ever discovery intro (`welcome-intro`) + interaction hint (`tap-to-listen`) wired via `playRoomWelcome()` in [src/screens/ExploreScreen.tsx](../src/screens/ExploreScreen.tsx) — *landed 2026-05-31*
- [x] CVC tier completion VO (`v1-quest-complete`) wired in [src/components/QuestCompleteCelebration.tsx](../src/components/QuestCompleteCelebration.tsx) — *landed 2026-05-31*
- [x] All 11 phrase VOs (success / encouragement / progression / etc.)
- [x] All 80 v1 CVC word audio + image assets present
- [x] All 80 Discovery Room fact narrations on disk

### Privacy / compliance
- [x] COPPA: zero third-party network calls, no analytics, no tracking
- [x] Privacy policy at `/public/privacy.html`, bundled with app
- [x] Privacy policy reachable via "👋 For Parents" → 3-second hold gate → Learning Insights → Privacy link

### Feature scope (v1)
- [x] Quick Review (cross-match) game wired at nodes 4 and 12 — *2026-05-08*
- [x] Per-room first-visit letter trace with daily 5-letter rotation — *2026-05-08*
- [x] Trophy Room phase-2 routing (full trophy at node 16)
- [x] Mini-games scrapped from v1 scope; scaffolding parked behind `MINI_GAMES_ENABLED` flag — *2026-05-08*

### App Store Connect prep
- [x] D-U-N-S number obtained
- [x] Apple Developer Program application accepted
- [x] App Store metadata drafted — see [docs/app-store-metadata.md](app-store-metadata.md)
- [x] Pricing decided: Free, no IAP, no ads
- [x] VO recording sheet finalized — see [docs/VO-Recording-Sheet-V1.md](VO-Recording-Sheet-V1.md)

---

## 🔴 Must do before submission

### Apple account
- [x] **Apple Developer Program enrollment paid** — *cleared 2026-05-31*. Account is active; another app ("Retro Rack") is already under review, so signing certs / TestFlight / App Store Connect access are all in working order.

### Code / build (do at archive time)
- [ ] Increment `CURRENT_PROJECT_VERSION` in Xcode for each TestFlight upload (currently `1`)
- [ ] Run `npx cap sync ios` after final web build, before archiving (use `LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8` prefix to dodge the CocoaPods Ruby encoding bug on this Mac)
- [ ] *(optional)* Wire + record the remaining 6 VO slugs — pickup script sent to voice actor on 2026-05-31 (see [docs/Voiceover-Pickup-2026-06.md](Voiceover-Pickup-2026-06.md)). **Verified 2026-07-07: neither the audio files nor the calling code exist yet** — the pickup doc's note that "these slugs are wired into the code" is inaccurate/aspirational. Both the recording *and* the feature code (title-screen idle timer, Quest Map idle pool, TraceMoment overlay prompt) still need to happen. Independent of the Apple blocker; safe to land in 1.0.1 if v1.0 ships first.
  - [ ] `trace-prompt.wav` — "Trace the letter with your finger!" — fires ~400ms after the first-visit letter-trace overlay opens
  - [ ] `play-now-nudge.wav` — "Tap Play Now when you're ready!" — title screen, ~8s idle
  - [ ] `idle-tap-gear.wav` — "Tap a gear when you're ready!" — Quest Map idle pool (~20s idle, random pick)
  - [ ] `idle-pickup.wav` — "Pick up where you left off!" — Quest Map idle pool
  - [ ] `idle-another-word.wav` — "Ready for another word?" — Quest Map idle pool
  - [ ] `idle-keep-reading.wav` — "Let's keep reading!" — Quest Map idle pool

### Device testing (TestFlight, real iPad + iPhone)
*(Previously noted as "blocked on $99" — Apple Developer Program enrollment is now paid and active as of 2026-05-31, so this is no longer blocked. Remaining blocker is just getting hands on a physical iPad — borrowing one temporarily is fine, no purchase required. Simulator can't substitute for these: silent-mode audio, real touch input, and OS interruptions don't replicate there.)*
- [ ] Full quest play-through on real device — golden path
- [ ] Force-quit mid-quest → relaunch → verify progression persists
- [ ] Verify "👋 For Parents" button position is fine in landscape on iPhone + iPad
- [ ] Verify 3-second parent gate hold works with touch (not just pointer)
- [ ] Verify privacy policy opens correctly when tapped from Insights screen
- [ ] Audio playback while device is in silent mode — does it respect or override?
- [ ] Verify no console errors / crashes on cold start
- [ ] Verify app behaves correctly when iOS interrupts (phone call, alarm, low battery alert)
- [ ] Verify the boot loader → auto-rotate → Play Now flow on real device (Info.plist landscape lock)
- [ ] Verify per-room first-visit trace fires correctly across all 5 Discovery Rooms

### Screenshots (blocked on capture, not on Apple)
- [ ] iPad Pro 13" Play Now screenshot (2752×2064 landscape, clean status bar)
- [ ] Quest Map hero shot
- [ ] Mid-quest word-building shot
- [ ] Trophy Room shot
- [ ] Discovery Room shot (Volcano with letter trace, or another themed room)

Capture path that works: open `ios/App/App.xcworkspace` in Xcode → run on iPad Pro 13" sim → rotate sim to landscape → Cmd+S in Simulator. CLI `simctl io screenshot` was wedging on this Mac, avoid it.

### App Store Connect (paste-ready once $99 clears)
- [ ] Create app record in App Store Connect
- [ ] Paste metadata from [docs/app-store-metadata.md](app-store-metadata.md)
- [ ] Pick the final subtitle from the 4 options listed there
- [ ] Fill in Support URL (required) and Privacy Policy URL (required, public)
- [ ] **Made for Kids designation** + age band: 4+
- [ ] Privacy nutrition label: "Data Not Collected" across the board
- [ ] Upload all 5 screenshots
- [ ] Export compliance: confirm exempt (standard HTTPS only)
- [ ] Build uploaded via Xcode Organizer → Archive → Distribute → App Store Connect
- [ ] Submit for Apple Kids review

---

## 🟡 Recommended (not blocking)

- [x] Create `CLAUDE.md` documenting project structure for handoff — *landed 2026-05-31 (commit `210dad6`)*
- [ ] Add a `typecheck` npm script (`tsc --noEmit`) separate from build
- [ ] Pre-record short app preview video (15–30s) showing one CVC word being built — Apple Kids apps benefit from this
- [ ] Track `ios/` more comprehensively in git so native config edits (Info.plist, project.pbxproj) survive a laptop loss — currently only `Info.plist` and `project.pbxproj` are tracked

---

## ⚠️ Things to watch

- **iOS gitignore scope:** native iOS project state outside `Info.plist` and `project.pbxproj` is not in version control. Laptop loss = lost native config edits.
- **Apple Kids review:** stricter than standard review. Expect questions about how data is handled, even though the answer is "none collected." Reviewers also play through and may flag overclaims — current metadata says "letter tracing" (accurate); avoid claiming "word tracing" until that feature is back.
- **First submission turnaround:** budget 1–7 days for App Store review, longer for Kids category.
- **CocoaPods + path with spaces:** `npx cap sync ios` requires `LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8` prefix on this Mac to avoid a Ruby Unicode normalization error. Document this if you ever switch machines.
- **6 unrecorded-but-needed-later VO slugs:** pickup script in `docs/Voiceover-Pickup-2026-06.md` (sent to voice actor 2026-05-31). These also need code wiring (title-screen idle nudge, Quest Map idle pool, TraceMoment prompt). Don't gate v1 submission — fail silently when files are absent — but worth landing both in 1.0.1.

---

## Reference

- App Store metadata: [docs/app-store-metadata.md](app-store-metadata.md)
- VO recording sheet: [docs/VO-Recording-Sheet-V1.md](VO-Recording-Sheet-V1.md)
- VO pickup script (May session): [docs/Voiceover-Pickup-2026-05.md](Voiceover-Pickup-2026-05.md)
- VO pickup script (Round 2, sent 2026-05-31): [docs/Voiceover-Pickup-2026-06.md](Voiceover-Pickup-2026-06.md)
- Privacy policy source: [public/privacy.html](../public/privacy.html)
- Parent gate component: [src/components/ParentGate.tsx](../src/components/ParentGate.tsx)
- "For Parents" entry button: [src/screens/QuestMapScreen.tsx](../src/screens/QuestMapScreen.tsx)
- Audio swap commit: `d81837d`
- v1 readiness commit: `1bfe446`
- v1 batch commit: `02a9511`
- iOS landscape lock commit: `92b79a9`
