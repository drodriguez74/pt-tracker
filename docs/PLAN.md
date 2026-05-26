# PT Tracker — Expert Panel Audit & Implementation Plan

## Context

The original audit identified feature and content gaps from a single technical viewpoint. This plan expands it with a three-perspective expert panel: **Software Architect**, **NSCA-Certified S&C Coach**, and **Fitness App Product Strategist**. The panel surfaced several issues the original audit missed entirely — including an active data corruption bug — and reframes priorities around retention, safety, and differentiation, not just feature completeness.

**Core insight (post-Phase 2):** The app was being treated like a database, not a real-time workout companion. When someone is mid-session with sweaty hands, elevated heart rate, and fatigue, navigating tabs or tapping tiny checkboxes is a UX nightmare. Phase 3 corrects this with a fully separate, highly restrictive UI flow that guides the user through every set.

---

## What the Original Audit Got Right

- Flat `completed` state is the core data model problem
- `.slice(0, 3)` limits exercise exposure — confirmed
- Missing features inventory was accurate (rest timer, rep logging, streak, history)
- Search icon bug confirmed — reverse lookup map needed
- Equipment context field missing from Settings
- Exercise coverage gaps: biceps isolation, rotator cuff, tibialis

---

## What the Original Audit Missed

### Active Bugs (not future design gaps)

1. **Key collision causing real-time data corruption.** Push-up appears on MON and THU. Plank on TUE/THU/SAT. Completing Monday marked those exercises done on Thursday. **Fixed in Phase 1** — keys are now `"YYYY-MM-DD:ExerciseName-setIndex"`.

2. **Stale closure on the auto-complete useEffect.** `completedWorkoutDates` was used inside the effect but excluded from deps. **Fixed in Phase 1.**

3. **Mission permanently deadlocked after target.** No setter for `missionStartDate`, `resetProgress()` skipped it. **Fixed in Phase 1** — Restart Mission button clears all state.

4. **Only 24 unique exercise slots, not 39.** Repeat exercises across days inflated the estimate. **Fixed in Phase 1** — week-based rotation with `catCounts` exposes the full library over time.

### S&C / Programming Issues

5. **Thursday–Friday 24-hour pull-to-pull recovery window.** Highest acute injury risk for the 40+ demographic. **Fixed in Phase 1** — Friday restructured to back + cardioConditioning only.

6. **Hip hinge pattern structurally excluded.** `.slice(0, 3)` always surfaced squat-dominant moves; RDL and Good Morning never appeared. **Fixed in Phase 1** — catCounts rotation surfaces hinge pattern.

7. **Warm-up category never prescribed.** Every training day opened with Standard Push-up. **Fixed in Phase 1** — WARMUP_PRESETS callout on every training day.

8. **Ailment system clinically oversimplified.** Single region flag conflates distinct pathologies. **Known gap — accepted for now.** Addressed in onboarding disclaimer copy.

### Product / Retention Issues

9. **Mission progress was calendar-based, not workout-based.** Advancing even on missed days. **Fixed in Phase 1** — progress = `workoutsCompleted / TARGET_WORKOUTS`.

10. **Ailment-aware differentiation invisible on first run.** No onboarding. **Fixed in Phase 2** — 3-screen onboarding gates mission start.

11. **Streak absent entirely.** **Fixed in Phase 1** — streak card on Progress tab with current, best, total.

---

## Phased Implementation Plan

### Phase 1 — Fix Foundations ✅ COMPLETE

**Bug fixes:**
- [x] Date-prefixed key schema `"YYYY-MM-DD:ExerciseName-setIndex"` with one-time migration
- [x] Auto-complete `useEffect` dependency array fixed
- [x] Mission restart button — resets `missionStartDate`, `completed`, `completedWorkoutDates`
- [x] Search icon reverse lookup map (`exerciseCategoryMap`)

**Schedule programming fixes:**
- [x] `slice(0, 3)` removed — `catCounts` per day + week-rotation offset
- [x] Thursday restructured — push → pull → lower body (hinge at top) → core
- [x] Friday separated — back + cardioConditioning only, no pull-up overlap
- [x] Warm-up callout on every training day via `WARMUP_PRESETS`

**Retention:**
- [x] Streak card — current, best, total workouts
- [x] Mission progress = workout count / target (not calendar days)

**Infrastructure:**
- [x] PWA via `vite-plugin-pwa` — service worker, web manifest, offline support
- [x] Barlow Condensed font
- [x] Full light/dark theme via CSS custom properties

---

### Phase 2 — Engagement & Differentiation ✅ COMPLETE

- [x] 3-screen onboarding — name/age → ailments → mission intro
- [x] Schedule tab as default view
- [x] Substitute suggestions — `substitutes: string[]` on cautioned exercises; "Safer option →" inline
- [x] Difficulty tiers — `beginner | intermediate | advanced` on all exercises; filter pills in Library
- [x] Progression protocol — week-aware banner (Week 1: 3×8 → Week 4: 4×12)
- [x] Difficulty-aware exercise rotation — beginner pool weeks 1–2, intermediate pool weeks 3–4
- [x] App.jsx decomposed — 9 files: `src/data/`, `src/tabs/`, `src/components/`, `src/workout/`
- [x] react-icons replacing all emoji in structural UI elements
- [x] Light/dark mode CSS variable system — no stray hex colors

**Decision — Gym types deferred:** Equipment context removed from Settings. The app is bodyweight-only calisthenics; surfacing gym types without actually filtering exercises by available equipment would be misleading. Gym-type filtering is Phase 4 scope when non-bodyweight exercise categories are added.

---

### Phase 3 — Active Workout Mode ✅ COMPLETE

**Design principle:** Full-screen takeover. Remove all navigation the moment "Start Workout" is tapped. The app guides; the user never decides what's next.

- [x] `useWorkoutSession` — `useReducer` state machine: `idle → exercise → resting → done`
- [x] `ActiveWorkoutView` — full-screen UI with ProgressRail, SetDots, RestScreen, DoneScreen
- [x] Swipe gestures — right = complete set, left = skip exercise (60px threshold, no library)
- [x] Rest timer — 60s auto-countdown with `setInterval`, auto-advances to next set
- [x] Audio chimes — `AudioContext` sine bursts at 3s warning and rest-end (no audio files)
- [x] Haptic feedback — `navigator.vibrate()` on set complete, rest end, skip, timer zero
- [x] Screen Wake Lock — `navigator.wakeLock.request("screen")`, re-acquired on `visibilitychange`
- [x] Media Session API — earphone next-track → COMPLETE_SET; prev-track → SKIP_EXERCISE
- [x] Exercise timer — timed sets (Plank 3×30s, Wall Sit 3×30s) auto-complete at zero with SVG ring UI
- [x] Session completion — writes to `completedWorkoutDates` via `onComplete` callback
- [x] Confirm-exit modal — "Your progress so far will be saved"
- [x] DoneScreen — medals, elapsed time, exercises + sets completed summary

---

### Phase 3.5 — Interactive UX Quick Wins ✅ COMPLETE

All items from the "quick wins + medium effort" session review:

**Quick wins:**
- [x] Haptic feedback on set completion, rest end, exercise skip, timer zero (in Phase 3)
- [x] Personalized schedule greeting — "Good morning, Darwin. Today is Upper Body." with week label
- [x] Long-press exercise card → mark all 3 sets complete (600ms threshold, `lpFired` guard prevents tap conflict, cancels on touchmove)
- [x] Streak milestone toasts — fires at 3, 7, 14, 30-day streaks; auto-dismiss after 2.8s; slide-up animation

**Medium effort:**
- [x] Exercise countdown timer — SVG ring, green → red at ≤5s; auto-completes set at zero; excluded for per-side exercises
- [x] 4-week workout history in Progress tab — scrollback via `getWeekDates(0..3)` with formatted week labels

---

### Phase 4 — History, Logging & Analytics

- [ ] Rep and weight logging per set — pre-filled from last session's values
- [ ] Workout history browser — per-day detail view, browseable by week
- [ ] Volume charts — sets per category per week, trend lines
- [ ] Export to CSV / JSON
- [ ] Schedule customization — user-defined day-to-workout assignments
- [ ] Gym-type exercise filtering (bodyweight / home / commercial / CrossFit)
- [ ] Exercise additions by gym context (see section below)
- [ ] Apple Health / Google Fit integration
- [ ] Optional backend (Supabase or Firebase) for cross-device sync

---

## Exercise Additions by Gym Context

*(Phase 4 scope — gym type setting deliberately omitted until these categories ship)*

### Bodyweight Only (gaps in existing library)
- Biceps: Supinated Australian Row, Towel Curl, Doorframe Curl
- Shoulder isolation: Lateral Raise (water bottles), Rear Delt Fly (prone)
- Rotator cuff: External rotation (side-lying), Internal rotation, Sleeper stretch
- Advanced skills: L-sit progression, Tuck planche hold, Wall handstand, Pike handstand push-up
- Lower body balance: Pistol squat progression, Shrimp squat

### Home Gym (bands, dumbbells, kettlebell, pull-up bar)
New category: **Resistance Bands** — Face pull, Pull-apart, Banded squat, Lateral walk, Clamshell, Bicep curl, Tricep pushdown  
New category: **Dumbbell / Kettlebell** — Goblet squat, DB RDL, DB row, DB shoulder press, KB swing, KB Turkish get-up, Farmer's carry, DB curl, DB skull crusher

### Commercial Gym (LA Fitness)
New category: **Machine & Cable** — Lat pulldown, Cable row, Leg press, Leg curl, Leg extension, Cable face pull, Tricep pushdown, Cable curl, Pec deck, Assisted dip  
Add to existing: Barbell bench press (push), Barbell row (pull), Barbell squat (lower), Barbell RDL (lower), OHP (push)

### CrossFit Gym
Add to cardioConditioning: Box step-up, Wall ball, Slam ball, Rope jump, Rowing machine  
New category: **Barbell Olympic** — Deadlift, Power clean (hang), Push press, Thruster, Hang clean  
New category: **Gymnastics Skills** — Kipping pull-up, Toes-to-bar, Ring row, Ring dip, Bar muscle-up progression, HSPU (wall)

---

## Critical Files

| File | Role |
|---|---|
| `src/App.jsx` | Global shell — state, navigation, all handler functions |
| `src/data/exercises.js` | ALL_EXERCISES, AILMENTS, categories, WARMUP_PRESETS |
| `src/data/exerciseDemos.js` | EXERCISE_DEMOS — steps and cues per exercise |
| `src/data/schedule.js` | weekSchedule, PROGRESSION, getWeekDates, formatWeekLabel, calcStreak |
| `src/tabs/ScheduleTab.jsx` | Day selector, exercise cards, long-press, greeting |
| `src/tabs/ProgressTab.jsx` | Streak cards, mission card, 4-week history, library stats |
| `src/tabs/LibraryTab.jsx` | Search, difficulty filter, category pills, exercise list |
| `src/tabs/SettingsTab.jsx` | Prefs, ailments, mission reset |
| `src/workout/useWorkoutSession.js` | Session state machine (useReducer) |
| `src/workout/ActiveWorkoutView.jsx` | Full-screen workout UI |
| `src/components/Toast.jsx` | Auto-dismiss streak milestone toasts |
| `src/components/ExerciseDemoModal.jsx` | Exercise detail + cues modal |
| `src/components/CatIcon.jsx` | Shared icon renderer |
| `src/index.css` | CSS custom properties — full light/dark theme + toastIn keyframe |
| `index.html` | PWA meta tags, Google Fonts |
| `vite.config.js` | vite-plugin-pwa configuration |

---

## Verification Checklist

### Foundation
- [x] Build passes: `npm run build` — no errors, no suppressed ESLint lines
- [x] Cross-day key collision fixed — completing Monday does not pre-check Thursday
- [x] Schedule: Thursday shows push → pull → lower → core
- [x] Warm-up callout appears on every training day
- [x] Mission progress counts workouts, not calendar days
- [x] Streak resets after a missed day
- [x] PWA manifest loads in DevTools → Application → Manifest
- [x] Light mode: all text readable, semantic surfaces visible; no stray hex colors
- [x] Difficulty filter: selecting "Beginner" shows only beginner exercises
- [x] Substitute: "Safer option" taps open correct demo; appears in demo modal
- [x] Progression banner: Week 1 shows 3×8, Week 4 shows 4×12

### Active Workout
- [x] "Start Workout" enters full-screen mode (schedule tab replaced)
- [x] Swipe right completes set, swipe left skips exercise
- [x] Rest timer auto-advances at zero with audio chime
- [x] Earphone next-track button completes set (Media Session)
- [x] Screen stays awake during workout (Wake Lock)
- [x] Completing final set writes to `completedWorkoutDates`
- [x] Exiting mid-session shows confirmation modal

### Phase 3.5 UX
- [x] Long-press (600ms) on exercise card marks all 3 sets done; no expand fires after long-press
- [x] Long-press cancels on scroll (touchmove)
- [x] Personalized greeting shows correct time of day + name + focus + week label
- [x] Streak milestone toast appears at day 3, 7, 14, 30; auto-dismisses
- [x] Timed exercises show SVG ring timer; ring turns red at ≤5s; auto-completes at zero
- [x] Per-side exercises (e.g. Side Plank 3×20s/side) do NOT get auto-timer
- [x] Progress tab shows 4 weeks of history with formatted week range labels
