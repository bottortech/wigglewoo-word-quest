# WiggleWoo's Word Quest — App Store Connect Metadata

**Status:** Draft v1, ready to paste into App Store Connect once $99 enrollment clears.
**Last updated:** 2026-05-09

This is the source-of-truth copy for every App Store listing field. Edit here first; copy into App Store Connect when uploading.

---

## App Name

**Field cap: 30 chars**

```
WiggleWoo's Word Quest
```

(22 chars · uses straight apostrophe to match `CFBundleDisplayName` in `ios/App/App/Info.plist`)

---

## Subtitle

**Field cap: 30 chars** — pick one and delete the others.

```
A playful early reading game
```

(28 chars · recommended — keeps "playful" and "early reading" from the original; reads as a tagline)

Alternates if you want a different angle:

| Option | Chars | Vibe |
|---|---|---|
| `Reading adventures for kids` | 27 | Adventure-forward |
| `Learn to read with WiggleWoo` | 28 | Character-forward, search-friendly |
| `Playful reading for young kids` | 30 | Closest to original phrasing |

---

## Promotional Text

**Field cap: 170 chars** · Editable any time without resubmission — good for seasonal/sale callouts.

```
Explore reading through magical adventures, tracing activities, discovery rooms, and playful learning moments with WiggleWoo.
```

(124 chars)

---

## Description

**Field cap: 4000 chars** · Plain text with line breaks. Avoid HTML.

```
Welcome to WiggleWoo's Word Quest — a playful reading adventure designed for early learners.

Kids explore imaginative worlds while practicing early literacy skills through tracing, word recognition, discovery activities, rewards, and interactive gameplay designed to keep learning fun and engaging.

Built with a warm and welcoming learning experience in mind, WiggleWoo's Word Quest encourages curiosity, confidence, and creativity while supporting foundational reading development.

Features
- Interactive letter tracing
- Fun discovery rooms and themed learning environments
- Reward-based progression and trophies
- Kid-friendly navigation and visuals
- Encouraging voice guidance and prompts
- Supports early literacy and reading confidence

Learning Through Play

WiggleWoo's Word Quest combines educational interaction with imaginative exploration so children stay engaged while learning important reading foundations.

Children can:
- Practice recognizing letters and words
- Improve tracing and handwriting coordination
- Explore immersive themed rooms
- Build confidence through positive reinforcement
- Learn at their own pace

Designed for Families and Classrooms

Whether at home or in the classroom, WiggleWoo's Word Quest creates a playful learning environment that encourages young readers to grow through exploration and repetition. New adventures, environments, and learning experiences are planned as the journey continues.
```

Changes from the original draft:
- "Interactive letter and word tracing" → "Interactive letter tracing" (matches what actually ships in v1; word-tracing was backed out and is deferred)
- "Reward based progression" → "Reward-based progression"
- "Kid friendly navigation" → "Kid-friendly navigation"
- Removed the duplicate "Designed for preschool and early elementary learners" bullet (already covered by the closing paragraph)
- Curly apostrophes in "WiggleWoo's" → straight apostrophes for consistency with the in-app name

---

## Keywords

**Field cap: 100 chars** · Comma-separated, no spaces after commas, App Store search-tuned.

```
kids reading,phonics,cvc,abc,learn to read,alphabet,tracing,preschool,kindergarten,kids game
```

(92 chars · adds `cvc`, `abc`, `alphabet`, `kindergarten` — high-intent parent searches)

---

## Category

- **Primary:** Education
- **Secondary:** Games

---

## Age Rating

**4+**, with **Made for Kids** designation enabled.

When App Store Connect asks the questionnaire, every category should be "None" — no violence, no themes, no controlled substances, etc.

---

## Privacy

- **Privacy Nutrition Label:** "Data Not Collected" across the board
- **Privacy Policy URL:** `https://wigglewoo.app/privacy.html`

---

## URLs

| Field | Value |
|---|---|
| Marketing URL | `https://wigglewoo.app` |
| Support URL | `mailto:support@wigglewoo.app` |
| Privacy Policy URL | `https://wigglewoo.app/privacy.html` |

Apple accepts `mailto:` for Support URL — opens the parent's mail client directly. Make sure `support@wigglewoo.app` actually receives mail before submission (Apple reviewers do test it).

Before submission, verify each URL loads in a fresh browser:
- [ ] `https://wigglewoo.app` → marketing landing
- [ ] `https://wigglewoo.app/privacy.html` → returns the privacy policy (matches `public/privacy.html` content)
- [ ] `support@wigglewoo.app` → email arrives in your inbox

---

## Pricing

**Free** · No in-app purchases · No ads · No subscriptions

(Confirms with the COPPA / Made-for-Kids posture: zero monetization touchpoints inside the app.)

---

## Export Compliance

Standard HTTPS only, no proprietary cryptography → **likely exempt**. Confirm in the App Store Connect form when prompted.

---

## Screenshots

**Required — 13" iPad Display:** 2752 × 2064 (landscape) or 2064 × 2752 (portrait)

Apple consolidated iPad screenshots to the 13" iPad Pro display in 2024. The 11" / 12.9" / older sizes are no longer accepted as primary.

**Recommended hero shots (5):**
1. Play Now (title screen with Play button)
2. Quest Map (showing nodes + WiggleWoo)
3. Mid-quest word build (the core gameplay shot)
4. Trophy Room (post-quest reward)
5. Discovery Room (e.g. Volcano with the letter trace overlay)

Capture method that's known to work: open `ios/App/App.xcworkspace` in Xcode → run on iPad Pro 13" sim → rotate sim to landscape (Cmd+→) → set clean status bar (`xcrun simctl status_bar <UDID> override --time "9:41" --batteryLevel 100 --wifiBars 3`) → Cmd+S in Simulator.

The CLI path (`xcrun simctl io ... screenshot`) was wedging on this Mac — Xcode UI capture is the reliable one.

---

## Build / Submission Checklist (final pass before archive)

1. `npm run build` (fresh web bundle)
2. `npx cap sync ios` (UTF-8 locale: `LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8 npx cap sync ios`)
3. Bump `CURRENT_PROJECT_VERSION` in Xcode (currently `1`) — must be incremented for every TestFlight upload
4. Xcode → Product → Archive
5. Organizer → Distribute App → App Store Connect
6. Wait for processing → fill metadata above → submit for Apple Kids review
