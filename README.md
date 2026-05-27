# 🪖 Operation Fit

A military-style calisthenics PWA built for consistent, low-impact training. Designed for 40+ athletes with physical limitations, but works for anyone.

---

## Features

### Workout Tracking
- **Weekly Schedule** — 7-day plan (Upper, Core/Lower, Full Body, Back/Cardio, Core/Mobility, 2× Rest)
- **Active Workout Mode** — Guided session with set dots, rest timer, exercise timer, and swipe gestures
- **Set Logger** — Tap dots to log individual sets; long-press a card to complete all 3 sets at once
- **30-Day Mission** — Progress tracked by workouts completed (not calendar days)
- **Streak Tracking** — Current, best, and total workout streaks on the Progress tab
- **Workout History** — Completed days marked on the weekly calendar

### Hands-Free Controls
When a workout session is active, you can advance without touching the screen:

**Voice commands** (say any of these while exercising):
| Command | Action |
|---|---|
| `done` `complete` `next` `finish` `rep` | Complete current set (or skip rest if resting) |
| `skip` `pass` | Skip the current exercise |

Voice recognition stays active throughout the session and auto-restarts between utterances. A status indicator in the top bar shows `🎙 listening` when active. On iOS, the browser may prompt for microphone permission on first use.

**Double-knock** (tap the back of your phone twice):
- Set your phone face-down on a bench or flat surface
- Give it two firm knocks with a knuckle within half a second
- The app logs your set — no screen touch needed
- A brief on-screen flash confirms the action was registered
- iOS users: tap **✊ enable tap** in the workout top bar once to grant motion permission (required by iOS)

### Rest Timer
- Configurable: **30s / 45s / 1 min / 1:30** — set it in Settings → Workout
- Animated breathing ring counts down; turns red at 10 seconds
- Audio chime at 3s warning and when rest ends
- Haptic feedback when transitioning back to exercise
- Tap **Skip Rest** or say `done` to jump straight to the next set

### AI Coach (requires API key)
- **Coach Chat** — Tap the orange chat button (bottom right) for a context-aware assistant. Knows your ailments, today's workout, streak, and mission week. Ask anything mid-workout.
- **Personalized Form Tips** — Open any exercise's demo modal; if you have ailment flags set, AI generates targeted cues for your specific limitations
- **Weekly Narrative** — Progress tab shows a coach-written summary once per day based on your actual completion data
- **Pre-Workout Brief** — Tap "Get coaching tips for today" on the Schedule tab before starting; AI reviews yesterday's workout and your limitations

See [AI Setup](#ai-setup) below to enable these features.

### Exercise Library
- 93+ exercises across 8 categories
- Search by name or keyword
- Filter by difficulty (beginner / intermediate / advanced)
- Each exercise has a demo modal with step-by-step instructions, form cues, caution notices, and safer alternatives
- Long-tap any exercise in the library to open its demo

| Category | Count |
|---|---|
| 💪 Push Variations | 12 |
| 🤸 Pull & Row | 9 |
| ↕️ Dips & Triceps | 4 |
| 🔥 Core & Abs | 16 |
| 🦵 Lower Body | 17 |
| 🧍 Back & Posture | 7 |
| 💨 Cardio & Conditioning | 12 |
| 🧘 Mobility & Warm-Up | 14 |

### Recovery & Safety
- **Recovery Warnings** — Automatic amber banner when the same muscle group was trained yesterday, or after 3+ consecutive training days. Dismissible per day.
- **Ailment Badges** — Exercises that conflict with your physical limitations show an amber **Modify** badge with a one-tap safer alternative
- **Warm-Up Callout** — Each training day surfaces a 2–3 min warm-up routine before the exercise list
- **Rest Day Training** — On rest days, a "Do tomorrow's workout today" option appears using a fresh exercise rotation that won't repeat when the day actually arrives

### Progressive Training
- Exercises rotate weekly through the full library — you won't see the same set every Monday
- Difficulty scales by week: beginner exercises in weeks 1–2, intermediate/advanced in weeks 3–4
- Target rep counts increase across the 4-week block (3×8 → 3×10 → 4×10 → 4×12)

### App & Platform
- **PWA** — Install to your home screen via your browser's "Add to Home Screen" option
- **Dark / Light theme** — Toggle in the top-right corner
- **Responsive** — Works on mobile, tablet, and desktop
- **Screen Wake Lock** — Screen stays on during active workout sessions
- **Earphone controls** — Next track = complete set, Previous track = skip exercise

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm 9+

### Install & run

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

### Build for production

```bash
npm run build
npm run preview
```

---

## AI Setup

AI features use the Anthropic API (Claude Haiku). Cost is negligible at personal-use volumes (~$0.10–0.20/month).

1. Get an API key at [console.anthropic.com](https://console.anthropic.com)
2. Create a `.env` file in the project root:

```
VITE_ANTHROPIC_API_KEY=sk-ant-your-key-here
```

3. Restart the dev server (`npm run dev`)

All AI features degrade gracefully — if no key is set, they simply don't appear. The key is never committed to git (`.env` is in `.gitignore`).

---

## Weekly Schedule

| Day | Focus | Categories |
|---|---|---|
| Monday | Upper Body | Push, Dips & Triceps |
| Tuesday | Core + Lower | Core, Lower Body |
| Wednesday | **Rest** | — |
| Thursday | Full Body | Push, Pull, Lower, Core |
| Friday | Back + Cardio | Back & Posture, Cardio |
| Saturday | Core + Mobility | Core, Mobility |
| Sunday | **Rest** | — |

---

## Settings

| Setting | Options |
|---|---|
| Name | Text (used in greetings and coach prompts) |
| Age Range | Under 40 / 40–49 / 50–59 / 60+ |
| Rest Duration | 30s / 45s / 1 min / 1:30 |
| Physical Limitations | Shoulders, Lower Back, Knees, Wrists, Neck, Hips |
| Restart Mission | Resets mission start date and workout history |
| Reset Progress | Clears all logged sets and completed days; keeps profile |

---

## localStorage Keys

| Key | Type | Description |
|---|---|---|
| `pt-completed` | `object` | `"YYYY-MM-DD:ExerciseName-setIndex"` → `boolean` |
| `pt-mission-start` | `string` | ISO date mission began |
| `pt-completed-dates` | `string[]` | ISO dates of fully completed workout days |
| `pt-prefs` | `object` | `{ name, ageRange, ailments[], gymType, restDuration }` |
| `pt-coach-history` | `array` | Last 20 AI Coach messages |
| `pt-form-tips:*` | `string` | Cached AI form cues per exercise + ailment combination |
| `pt-weekly-narrative` | `object` | Cached weekly progress narrative `{ date, text }` |
| `pt-brief:*` | `string` | Cached daily pre-workout brief |
| `pt-warn-dismissed:*` | `string` | Per-day dismissal state for recovery warning |

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | React 18 (functional components + hooks) |
| Build tool | Vite 5 |
| Styling | Inline styles + CSS custom properties for theming |
| State | `useState` / `useReducer` / `useRef` |
| Persistence | `localStorage` |
| PWA | `vite-plugin-pwa` (Workbox, cache-first) |
| AI | Anthropic API — Claude Haiku (`claude-haiku-4-5-20251001`) |
| Icons | `react-icons` (Feather + game icons) |

---

## Project Structure

```
pt-tracker/
├── src/
│   ├── App.jsx                     # Root — state, routing, computed values
│   ├── index.css                   # CSS variables (theme), keyframes
│   ├── components/
│   │   ├── CoachChat.jsx           # AI Coach chat sheet
│   │   ├── ExerciseDemoModal.jsx   # Exercise demo + AI form tips
│   │   └── Toast.jsx               # Streak notification toast
│   ├── data/
│   │   ├── exercises.js            # All exercises, ailments, category map
│   │   ├── exerciseDemos.js        # Step-by-step instructions per exercise
│   │   └── schedule.js             # Week schedule, progression, defaults
│   ├── tabs/
│   │   ├── LibraryTab.jsx          # Browse + search exercises
│   │   ├── ScheduleTab.jsx         # Daily view, set logging, AI brief, warnings
│   │   ├── ProgressTab.jsx         # Streak, mission progress, AI narrative
│   │   └── SettingsTab.jsx         # Profile, limitations, rest duration
│   ├── utils/
│   │   └── aiCoach.js              # Shared Anthropic API fetch utility
│   └── workout/
│       ├── ActiveWorkoutView.jsx   # Guided session UI (exercise/rest/done screens)
│       ├── useHandsFreeInput.js    # Voice + double-knock input hook
│       └── useWorkoutSession.js    # Workout state machine (useReducer)
├── .env.example                    # API key template
├── vite.config.js
└── package.json
```

---

## Roadmap

- [ ] Rep logging — record actual reps completed per set (vs. target only)
- [ ] Workout history browser — browse past workouts by week
- [ ] Volume charts — sets per category per week, trend lines
- [ ] Export to CSV / JSON
- [ ] AI-generated Phase 2 mission on 30-day completion

---

## License

Personal use only. Not intended for redistribution.

