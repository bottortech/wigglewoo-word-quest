# WiggleWoo's Word Quest — v1 App Store Launch Checklist

Snapshot date: 2026-04-26
Target: iOS App Store, Kids 4+ category

---

## ✅ Done

- [x] App version 1.0.0 (package.json + Xcode `MARKETING_VERSION`)
- [x] `UIRequiredDeviceCapabilities` corrected `armv7` → `arm64`
- [x] `IPHONEOS_DEPLOYMENT_TARGET = 16.0` already set
- [x] App icon: single 1024×1024 universal asset (modern Xcode format) ✅
- [x] Splash screen present (2732×2732)
- [x] COPPA: zero third-party network calls, no analytics, no tracking
- [x] Privacy policy live at `/public/privacy.html`, bundled with app
- [x] Privacy policy reachable in production via "👋 For Parents" → 3-second hold gate → Learning Insights → Privacy link
- [x] All 28 event VOs present and matched to `EventSlug` types
- [x] All 11 phrase VOs (success / encouragement / progression / etc.)
- [x] All 80 v1 CVC word audio + image assets present
- [x] Dev-only controls guarded by `import.meta.env.DEV`
- [x] OpenDyslexic font self-hosted, SIL OFL 1.1 licensed

---

## 🔴 Must do before submission

### Code / build
- [ ] **Phoneme audio re-record** (2026-04-26: decided to wait for new VOs before submitting v1) — drop new files into `/public/assets/audio/phonetics/`, then revert [SoundEffects.ts:113](../src/audio/SoundEffects.ts#L113) to `${AUDIO_BASE}/phonetics/${key}.m4a`
- [ ] Increment `CURRENT_PROJECT_VERSION` (build number) in Xcode for each TestFlight upload — currently `1`
- [ ] Run `npx cap sync ios` after final web build, before archiving
- [ ] Decide whether to remove `ios/` from `.gitignore` so native config (Info.plist edits, version bumps) is versioned. Currently those edits live on disk only

### Device testing (TestFlight, real iPad + iPhone)
- [ ] Full quest play-through on real device — golden path
- [ ] Force-quit mid-quest → relaunch → verify progression persists
- [ ] Verify "👋 For Parents" button position doesn't conflict with anything in landscape + portrait, on iPhone + iPad
- [ ] Verify 3-second parent gate hold works with touch (not just pointer)
- [ ] Verify privacy policy opens correctly when tapped from Insights screen
- [ ] Audio playback while device is in silent mode — does it respect or override?
- [ ] Verify no console errors / crashes on cold start
- [ ] Verify app behaves correctly when iOS interrupts (phone call, alarm, low battery alert)

### App Store Connect
- [ ] App name, subtitle, promotional text, description, keywords
- [ ] Category: Education (primary), Games (secondary)
- [ ] **Made for Kids designation** + age band: 4+
- [ ] Privacy nutrition label: "Data Not Collected" across the board
- [ ] Privacy policy URL (must be publicly hosted — Vercel deploy covers this)
- [ ] Support URL + Marketing URL
- [ ] Screenshots — required sizes:
  - 6.9" iPhone (1320×2868 or landscape equivalent)
  - 6.5" iPhone (1284×2778)
  - 12.9" iPad (2048×2732)
- [ ] App preview video (optional, recommended for kids apps)
- [ ] Export compliance: standard HTTPS only → likely exempt, confirm in form
- [ ] Build uploaded via Xcode Organizer → Archive → Distribute → App Store Connect

---

## 🟡 Recommended (not blocking)

- [ ] Create `CLAUDE.md` documenting project structure for handoff
- [ ] Add a `typecheck` npm script (`tsc --noEmit`) separate from build
- [ ] Sample screenshots: clean placement test, mid-quest, trophy room, discovery room, parent insights screen
- [ ] Pre-record short app preview video (15–30s) showing one CVC word being built
- [ ] Decide on launch pricing: Free, Free with optional donation, or Paid

---

## ⚠️ Things to watch

- **Phoneme audio**: temp letter-name swap (`when-letter-is-dropped/`) is in place via `playLetterSound`. Old `phonetics/*.m4a` still on disk for one-line revert. For a phonics app, this matters — letter names ≠ phonemes
- **iOS gitignore**: native iOS project state (Info.plist armv7→arm64 fix, MARKETING_VERSION sync) is not in version control. Laptop loss = lost native config edits
- **Apple Kids review**: stricter than standard review. Expect questions about how data is handled, even though answer is "none collected"
- **First submission turnaround**: budget 1–7 days for App Store review, longer for Kids category

---

## Reference

- Privacy policy source: [public/privacy.html](../public/privacy.html)
- Parent gate component: [src/components/ParentGate.tsx](../src/components/ParentGate.tsx)
- "For Parents" entry button: [src/screens/QuestMapScreen.tsx:1239-1249](../src/screens/QuestMapScreen.tsx)
- Audio swap commit: `d81837d`
- v1 readiness commit: `1bfe446`
