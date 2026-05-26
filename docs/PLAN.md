# PT Tracker — Expert Panel Audit & Implementation Plan

## Context

The original audit identified feature and content gaps from a single technical viewpoint. This plan expands it with a three-perspective expert panel: **Software Architect**, **NSCA-Certified S&C Coach**, and **Fitness App Product Strategist**. The panel surfaced several issues the original audit missed entirely — including an active data corruption bug — and reframes priorities around retention, safety, and differentiation, not just feature completeness.

---

## What the Original Audit Got Right

- Flat `completed` state is the core data model problem
- `.slice(0, 3)` limits exercise exposure — confirmed
- Missing features inventory was accurate (rest timer, rep logging, streak, history)
- Search icon bug confirmed (line 433 uses `selectedCat` icon in cross-category results)
- Equipment context field missing from Settings
- Exercise coverage gaps: biceps isolation, rotator cuff, tibialis

---

## What the Original Audit Missed

### Active Bugs (not future design gaps)

1. **Key collision is causing real-time data corruption today.** Standard Push-up appears on MON and THU. Plank appears on TUE, THU, and SAT. Completing Monday's workout marks those exercises as done when the user views Thursday — and the auto-complete `useEffect` then incorrectly adds Thursday to `completedWorkoutDates`. This is firing on any user who completes one workout day and then views another.

2. **Stale closure on the auto-complete useEffect (line 285).** `completedWorkoutDates` is used inside the effect but deliberately excluded from the dependency array (`// eslint-disable-line`). The `.includes(todayStr)` check sees a stale snapshot, enabling duplicate writes to the completed dates array.

3. **Mission is permanently deadlocked after Day 30.** `missionStartDate` is initialized once and has no setter. `resetProgress()` explicitly skips it. Users hit 100% on Day 30 with no forward path — no celebration state, no restart, no mission 2.

4. **Only 24 unique exercise slots exist in the weekly schedule, not 39.** Several exercises repeat across days (Push-ups on MON and THU, Plank on TUE/THU/SAT). The actual unreachable library percentage is ~75%, not ~60%.

### S&C / Programming Issues

5. **Thursday–Friday creates a 24-hour pull-to-pull recovery window.** Thursday Full Body includes 9 sets of vertical/horizontal pulling; Friday Pull+Back repeats the same pull-up, chin-up, and Australian pull-up pattern 24 hours later. For the 40+ demographic with bilateral shoulder issues, this is the highest acute injury risk in the current schedule.

6. **The hip hinge pattern is structurally excluded from every scheduled workout.** Romanian Deadlift (BW) is position 14 in lowerBody; Good Morning is position 13. `.slice(0, 3)` always surfaces squat-dominant moves. The posterior chain (hamstrings, glutes, erectors) — most critical for lower back health in sedentary 40+ adults — never appears in any assigned workout.

7. **Warm-up category exists but is never prescribed.** mobilityWarmup has 15 exercises appropriate for pre-workout activation. It appears only in Saturday's schedule (Core+Mobility) and even then only the first 3 due to the slice. Every Monday, Tuesday, and Thursday workout begins with Standard Push-up as the literal first movement.

8. **The ailment system is clinically oversimplified.** Cobra Stretch is flagged `caution: ["lowerBack"]` but is the McKenzie extension technique — therapeutic for disc herniation (the most common lower back pathology in this demographic) and only contraindicated for spinal stenosis. The system conflates pathology subtypes under a single region flag without disclaimer.

### Product / Retention Issues

9. **The 30-Day Mission progress bar is a calendar, not a progress signal.** It advances based on `Date.now() - missionStartDate`, not on workouts completed. A user who misses the first 10 days still sees "Day 11 of 30 — 37%." Users cannot fail it, which means they cannot succeed at it either.

10. **The app's primary differentiator (ailment-aware modification) is invisible on first run.** Onboarding doesn't exist. A new user with knee and shoulder issues follows the schedule for a week without their ailment flags active because they never navigated to Settings.

11. **Streak is absent entirely** — the single most validated consumer retention mechanic. All the data needed to calculate it (`completedWorkoutDates`) already exists.

---

## Phased Implementation Plan

### Phase 1 — Fix Foundations ✅ COMPLETE
*Scope: All frontend, no backend required, touches App.jsx and infra files*

**Bug fixes:**
- [x] Change completed key schema from `"ExerciseName-setIndex"` to `"YYYY-MM-DD:ExerciseName-setIndex"` with one-time migration
- [x] Fix useEffect dependency array — add `completedWorkoutDates` to deps
- [x] Fix mission deadlock — Restart Mission button in Settings, completion state on Progress tab
- [x] Fix search icon bug — `exerciseCategoryMap` reverse lookup at module level

**Schedule programming fixes:**
- [x] Remove `.slice(0, 3)` — replaced with per-day `catCounts` + week-based rotation offset
- [x] Restructure Thursday — push → pull → lower body → core with hinge at top of lowerBody
- [x] Separate Friday pull volume — back + cardioConditioning only, no pull-up overlap
- [x] Warm-up callout on every training day via `WARMUP_PRESETS`

**Retention:**
- [x] Streak card on Progress tab — current, best, total workouts
- [x] Mission progress = `workoutsCompleted / TARGET_WORKOUTS` (not calendar days)

**Infrastructure:**
- [x] PWA via `vite-plugin-pwa` — service worker, web manifest, offline support
- [x] Barlow Condensed font (Wodify-style athletic typography)
- [x] Full light/dark theme via CSS custom properties

---

### Phase 2 — Engagement & Differentiation ✅ COMPLETE

- [x] 3-screen onboarding — name/age → ailments → mission intro, gates mission start
- [x] Schedule tab as default view
- [x] Substitute suggestions — `substitutes: string[]` on every cautioned exercise; tappable "Safer option →" on Schedule cards
- [x] Difficulty tiers — `beginner | intermediate | advanced` on all 93 exercises; filter pills in Library; badge on each card
- [x] Progression protocol — week-aware banner on Schedule (Week 1: 3×8 → Week 4: 4×12)
- [x] Equipment context in Settings — Bodyweight Only / Home Gym / Commercial / CrossFit
- [x] Gym icon sprites — react-icons (Game Icons + Font Awesome) replacing emoji
- [x] Light/dark mode with full CSS variable system

**Remaining from original Phase 2 scope:**
- [ ] Schedule prefers beginner exercises in weeks 1–2, intermediate in weeks 3–4 (difficulty-aware rotation)
- [ ] Decompose App.jsx into hooks + tab components (developer ergonomics, not user-facing)

---

### Phase 3 — Platform Features (some require backend)

- [ ] Rest timer with audio cues (`setTimeout`/`setInterval` — no backend needed)
- [ ] Rep and weight logging per set (date-keyed schema from Phase 1 makes this additive)
- [ ] Workout history browser — per-day detail view, browseable by week
- [ ] Volume charts — sets per category per week, trend lines
- [ ] Export to CSV / JSON
- [ ] Schedule customization — user-defined day-to-workout assignments
- [ ] Exercise additions by gym type (see section below)
- [ ] Apple Health / Google Fit integration
- [ ] Optional backend (Supabase or Firebase) for cross-device sync and cloud backup

---

## Exercise Additions by Gym Context

### Bodyweight Only (gaps in existing library)
- Biceps: Supinated Australian Row, Towel Curl, Doorframe Curl
- Shoulder isolation: Band Pull-Apart (or towel), Lateral Raise (with water bottles), Rear Delt Fly (prone)
- Rotator cuff: External rotation (side-lying), Internal rotation, Sleeper stretch
- Advanced skills: L-sit progression (tuck → extend), Tuck planche hold, Wall handstand, Pike handstand push-up
- Lower body balance: Pistol squat progression (assisted → box → full), Shrimp squat

### Home Gym Additions (bands, dumbbells, kettlebell, pull-up bar)
New category: **Resistance Bands** — Face pull, Pull-apart, Banded squat, Lateral walk, Banded clamshell, Bicep curl, Tricep pushdown  
New category: **Dumbbell / Kettlebell** — Goblet squat, DB Romanian deadlift, DB row, DB shoulder press, Lateral raise, KB swing, KB Turkish get-up, Farmer's carry, DB curl, DB skull crusher

### Commercial Gym Additions (LA Fitness)
New category: **Machine & Cable** — Lat pulldown, Cable row, Leg press, Leg curl, Leg extension, Cable face pull, Tricep pushdown, Cable curl, Pec deck, Assisted pull-up/dip  
Add to existing categories: Barbell bench press (push), Barbell row (pull), Barbell back squat (lower), Barbell RDL (lower), Overhead press (push)

### CrossFit Gym Additions
Add to cardioConditioning: Box step-up, Wall ball, Slam ball, Rope jump (single-under), Rowing machine  
New category: **Barbell Olympic** — Deadlift, Power clean (from hang), Push press, Thruster, Hang clean  
New category: **Gymnastics Skills** — Kipping pull-up, Toes-to-bar, Ring row, Ring dip, Bar muscle-up progression, Handstand push-up (wall)

---

## Critical Files

| File | Role |
|---|---|
| `src/App.jsx` | All state, UI, exercises, schedule — monolith (decompose in Phase 2 remainder) |
| `src/index.css` | CSS custom properties — full light/dark theme |
| `index.html` | PWA meta tags, Google Fonts |
| `vite.config.js` | vite-plugin-pwa configuration |
| `package.json` | Dependencies — react-icons, vite-plugin-pwa |

---

## Verification Checklist

- [x] Build passes: `npm run build` — no errors
- [x] Cross-day key collision: complete Monday → navigate to Thursday → no pre-checked exercises
- [x] Schedule: Thursday shows push → pull → lower → core, hinge surfaces
- [x] Warm-up callout appears on every training day
- [x] Mission progress counts workouts, not calendar days
- [x] Streak resets after a missed day
- [x] PWA manifest loads in DevTools → Application → Manifest
- [x] Light mode: all text readable, semantic surfaces visible
- [ ] Difficulty filter: selecting "Beginner" shows only beginner exercises
- [ ] Substitute link: tapping "Safer option" opens correct demo modal
- [ ] Progression banner: Week 1 shows 3×8, Week 4 shows 4×12
