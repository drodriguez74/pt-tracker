export const DAY_ABBRS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
export const AGE_RANGES = ["Under 40", "40–49", "50–59", "60+"];
export const TARGET_WORKOUTS = 20;
export const DEFAULT_PREFS = { name: "", ageRange: "", ailments: [], gymType: "bodyweight" };

export const GYM_TYPES = [
  { key: "bodyweight", label: "Bodyweight Only",  note: "No equipment needed — anywhere, anytime." },
  { key: "home",       label: "Home Gym",          note: "Bands, dumbbells, or a pull-up bar." },
  { key: "commercial", label: "Commercial Gym",    note: "Machines, cables, barbells." },
  { key: "crossfit",   label: "CrossFit / Box",   note: "Full barbell, gymnastics, conditioning." },
];

export const PROGRESSION = [
  { label: "Week 1", sub: "Build the habit",   sets: 3, reps: 8,  note: "Focus on form" },
  { label: "Week 2", sub: "Volume base",       sets: 3, reps: 10, note: "Full range of motion" },
  { label: "Week 3", sub: "Add a set",         sets: 4, reps: 10, note: "Push the last set" },
  { label: "Week 4", sub: "Peak effort",       sets: 4, reps: 12, note: "Control the negative" },
];

// Updated schedule:
// - Thursday: push/pull/hinge(lower)/core alternating — 2 per category = 8 exercises
// - Friday: Back + Cardio only (removed pullVariations — was 24h after Thursday pulls)
// - catCounts drives how many exercises per category (replaces hardcoded slice(0,3))
// - warmup key maps to WARMUP_PRESETS
export const weekSchedule = [
  { day: "MON", focus: "Upper Body",      color: "#e85d26",      cats: ["pushVariations", "dipsTriCeps"],                    catCounts: [3, 2], warmup: "upper" },
  { day: "TUE", focus: "Core + Lower",   color: "#22c55e",      cats: ["core", "lowerBody"],                               catCounts: [3, 3], warmup: "lower" },
  { day: "WED", focus: "Rest",            color: "var(--muted)", cats: [] },
  { day: "THU", focus: "Full Body",       color: "#8b5cf6",      cats: ["pushVariations", "pullVariations", "lowerBody", "core"], catCounts: [2, 2, 2, 2], warmup: "full" },
  { day: "FRI", focus: "Back + Cardio",  color: "#0ea5e9",      cats: ["back", "cardioConditioning"],                      catCounts: [4, 3], warmup: "lower" },
  { day: "SAT", focus: "Core + Mobility",color: "#10b981",      cats: ["core", "mobilityWarmup"],                          catCounts: [3, 3] },
  { day: "SUN", focus: "Rest",            color: "var(--muted)", cats: [] },
];

export function getWeekDates(weeksAgo = 0) {
  const today = new Date();
  const dow = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (dow === 0 ? 6 : dow - 1) - weeksAgo * 7);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d.toISOString().split("T")[0];
  });
}

export function getThisWeekDates() {
  return getWeekDates(0);
}

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
export function formatWeekLabel(dates) {
  const s = new Date(dates[0] + "T12:00:00");
  const e = new Date(dates[6] + "T12:00:00");
  if (s.getMonth() === e.getMonth()) {
    return `${MONTHS[s.getMonth()]} ${s.getDate()}–${e.getDate()}`;
  }
  return `${MONTHS[s.getMonth()]} ${s.getDate()} – ${MONTHS[e.getMonth()]} ${e.getDate()}`;
}

export function calcStreak(dates) {
  if (!dates.length) return { current: 0, best: 0, total: 0 };
  const sorted = [...dates].sort();
  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
  let streak = 1, best = 1;
  for (let i = 1; i < sorted.length; i++) {
    const diff = (new Date(sorted[i]) - new Date(sorted[i - 1])) / 86400000;
    streak = diff === 1 ? streak + 1 : 1;
    if (streak > best) best = streak;
  }
  const last = sorted[sorted.length - 1];
  const current = (last === today || last === yesterday) ? streak : 0;
  return { current, best, total: dates.length };
}
