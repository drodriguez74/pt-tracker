# 🪖 Operation Fit

A military-style calisthenics tracker built for low-impact, consistent training. Designed for 40+ athletes, but works for anyone.

---

## About

Operation Fit is a workout tracker based on military-style calisthenics — bodyweight exercises used by the U.S. Army, Marines, and Navy to build strength, endurance, and discipline without gym equipment.

Designed for:
- Anyone doing low-impact, joint-friendly training
- 3 sets of 10 as the baseline volume
- 3–5 days per week with visible results in 30 days
- Users with physical limitations — ailment preferences flag exercises that need modification

---

## Features

- **Exercise Library** — 93 exercises across 8 categories, all low-impact
- **Search** — Find any exercise instantly by name or keyword
- **Weekly Schedule** — 7-day workout plan with daily focus (Upper, Core/Lower, Full Body, Rest)
- **Set Logger** — Tap to log each set as you complete it
- **Daily Progress** — See how many exercises completed per day
- **30-Day Mission** — Live day counter calculated from your first launch
- **Weekly Calendar** — Auto-marks days complete when all sets are logged
- **Ailment Preferences** — Select physical limitations (shoulders, lower back, knees, wrists, neck, hips); flagged exercises show a "Modify" badge
- **Settings Tab** — Name, age range, ailment toggles, and progress reset
- **Local Storage Persistence** — Completed sets, profile, mission start date, and workout history survive browser refreshes

---

## Exercise Categories

| Category | Exercises |
|---|---|
| 💪 Push Variations | 12 |
| 🔙 Pull & Row | 9 |
| ↕️ Dips & Triceps | 4 |
| 🔥 Core & Abs | 18 |
| 🦵 Lower Body | 17 |
| 🧍 Back & Posture | 7 |
| 💨 Cardio & Conditioning | 12 |
| 🧘 Mobility & Warm-Up | 14 |
| **Total** | **93** |

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | React 18 (functional components + hooks) |
| Build tool | Vite 5 |
| Styling | Inline styles (no CSS-in-JS library) |
| State | `useState` + `useEffect` |
| Persistence | `localStorage` (3 keys: sets, mission start, completed dates) |

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

## Project Structure

```
pt-tracker/
├── index.html                        # Vite HTML entry point
├── vite.config.js                    # Vite + React plugin config
├── package.json
├── .gitignore
├── src/
│   ├── main.jsx                      # React root mount
│   ├── App.jsx                       # All exercises, schedule, UI, and persistence logic
│   └── index.css                     # Minimal reset + scrollbar styles
├── military-calisthenics-app.jsx     # Original source component (reference)
└── README.md
```

---

## localStorage Keys

| Key | Type | Description |
|---|---|---|
| `pt-completed` | `object` | Map of `"ExerciseName-setIndex"` → `boolean` |
| `pt-mission-start` | `string` | ISO date of first app launch (`YYYY-MM-DD`) |
| `pt-completed-dates` | `string[]` | ISO dates of fully completed workout days |
| `pt-prefs` | `object` | User profile: `{ name, ageRange, ailments[] }` |

## Ailment Preferences

Select any physical limitations in the Settings tab. Exercises tagged with matching conditions show an amber **Modify** badge in both the Library and Schedule tabs. The Progress tab's "Your Modifications" panel updates to show only your active conditions and their guidance.

| Ailment | Affected exercises (examples) |
|---|---|
| Shoulders | Diamond Push-up, Dips, Pike Push-up, Pull-up, Bear Crawl |
| Lower Back | V-Sit, Ab Wheel, Flutter Kick, Good Morning, Superman |
| Knees | Squats, Pulse Squat, Side Lunge, Step-up, Squat Hold |
| Wrists | Plank, Mountain Climbers, Slow Negative Push-up, Inchworm |
| Neck | Crunch, Bicycle Crunch, Neck Rolls |
| Hips | Flutter Kick, Leg Swings, Fire Hydrant, High Knee March |

---

## Dependencies

```json
{
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.1",
    "vite": "^5.4.2"
  }
}
```

---

## Weekly Schedule

| Day | Focus |
|---|---|
| Monday | Upper Body |
| Tuesday | Core + Lower Body |
| Wednesday | Rest |
| Thursday | Full Body |
| Friday | Pull + Back |
| Saturday | Core + Mobility |
| Sunday | Rest |

---

## 30-Day Goal

| Week | Expected Progress |
|---|---|
| Week 1–2 | Build the habit, muscles begin to adapt |
| Week 3 | Noticeable strength improvement in push-ups and squats |
| Week 4 | Core noticeably stronger, posture visibly improved |

---

## Roadmap

- [ ] Rest timer between sets
- [ ] Session notes / journal
- [ ] Monthly volume charts
- [ ] Streak tracking
- [ ] Export workout history
- [ ] PWA support (install on mobile home screen)

---

## License

Personal use only. Not intended for redistribution.

---

*Built with the help of Claude Code — Anthropic's AI assistant.*
