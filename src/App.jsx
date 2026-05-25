import { useState, useEffect } from "react";

function loadStorage(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v !== null ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
}

const AILMENTS = [
  {
    key: "shoulders",
    label: "Shoulders",
    color: "#f59e0b",
    note: "Avoid deep dips, overhead pressing, internal rotation under load. Prefer incline & wall push-ups.",
  },
  {
    key: "lowerBack",
    label: "Lower Back",
    color: "#f59e0b",
    note: "Prioritize Dead Bug & Bird Dog. Avoid loaded spinal flexion and hyperextension.",
  },
  {
    key: "knees",
    label: "Knees",
    color: "#f59e0b",
    note: "Use reverse lunges over forward. Limit squat depth to a comfortable range.",
  },
  {
    key: "wrists",
    label: "Wrists",
    color: "#f59e0b",
    note: "Use fists or push-up handles for weight-bearing. Avoid sustained extended wrist under load.",
  },
  {
    key: "neck",
    label: "Neck",
    color: "#f59e0b",
    note: "Never pull on your neck during crunches. Move slowly through all cervical rotations.",
  },
  {
    key: "hips",
    label: "Hips",
    color: "#f59e0b",
    note: "Warm up hip flexors thoroughly. Limit deep hip flexion if it causes pain or catching.",
  },
];

const ALL_EXERCISES = {
  pushVariations: {
    label: "Push Variations",
    color: "#e85d26",
    icon: "💪",
    exercises: [
      { name: "Standard Push-up", sets: "3x10", notes: "Elbows at 45°, core tight", caution: ["wrists"] },
      { name: "Incline Push-up", sets: "3x12", notes: "Hands on wall or bench — easiest on shoulders" },
      { name: "Decline Push-up", sets: "3x8", notes: "Feet elevated — upper chest focus", caution: ["shoulders"] },
      { name: "Diamond Push-up", sets: "3x8", notes: "Skip if shoulders flare", caution: ["shoulders", "wrists"] },
      { name: "Wide-Arm Push-up", sets: "3x10", notes: "Hands wider than shoulders" },
      { name: "Hand-Release Push-up", sets: "3x8", notes: "Lift hands off floor each rep — controlled" },
      { name: "Pike Push-up", sets: "3x8", notes: "Hips high, shoulder-safe overhead press", caution: ["shoulders", "wrists"] },
      { name: "Wall Push-up", sets: "3x15", notes: "Recovery days or warm-up" },
      { name: "Knee Push-up", sets: "3x12", notes: "Modified — great for shoulder recovery days" },
      { name: "Archer Push-up", sets: "3x6/side", notes: "One arm loaded, one extended — advanced", caution: ["shoulders", "wrists"] },
      { name: "Pseudo Planche Push-up", sets: "3x8", notes: "Hands at hips — tricep & shoulder strength", caution: ["shoulders", "wrists"] },
      { name: "Slow Negative Push-up", sets: "3x6", notes: "5-second lowering — builds control", caution: ["wrists"] },
    ],
  },
  pullVariations: {
    label: "Pull & Row Variations",
    color: "#8b5cf6",
    icon: "🔙",
    exercises: [
      { name: "Pull-up (overhand)", sets: "3x5", notes: "Use a bar — full range", caution: ["shoulders"] },
      { name: "Chin-up (underhand)", sets: "3x5", notes: "Easier on shoulders than pull-up" },
      { name: "Australian Pull-up", sets: "3x10", notes: "Low bar or table edge — great back exercise" },
      { name: "Doorframe Row", sets: "3x10", notes: "Grab both sides of a doorframe and row" },
      { name: "Towel Row", sets: "3x10", notes: "Loop towel around a pole and row" },
      { name: "Negative Pull-up", sets: "3x5", notes: "Jump up, lower slowly — builds pulling strength", caution: ["shoulders"] },
      { name: "Scapular Pull-up", sets: "3x10", notes: "Hang and shrug shoulder blades — warm-up" },
      { name: "Dead Hang", sets: "3x20s", notes: "Decompress spine, grip strength" },
      { name: "Flex Hang (hold at top)", sets: "3x10s", notes: "Hold chin above bar", caution: ["shoulders"] },
    ],
  },
  dipsTriCeps: {
    label: "Dips & Triceps",
    color: "#f59e0b",
    icon: "↕️",
    exercises: [
      { name: "Bench Dip (shallow)", sets: "3x10", notes: "Limit depth to protect shoulders", caution: ["shoulders"] },
      { name: "Chair Dip", sets: "3x10", notes: "Use a sturdy chair — keep elbows back", caution: ["shoulders"] },
      { name: "Tricep Push-up", sets: "3x10", notes: "Elbows tight to sides", caution: ["wrists"] },
      { name: "Diamond Push-up (tricep focus)", sets: "3x8", notes: "Hands form diamond under chest", caution: ["shoulders", "wrists"] },
    ],
  },
  core: {
    label: "Core & Abs",
    color: "#ef4444",
    icon: "🔥",
    exercises: [
      { name: "Plank (standard)", sets: "3x30s", notes: "No lower back strain — back flat", caution: ["wrists"] },
      { name: "Side Plank", sets: "3x20s/side", notes: "Obliques — back-safe" },
      { name: "Dead Bug", sets: "3x10", notes: "Best core exercise for back issues" },
      { name: "Bird Dog", sets: "3x10/side", notes: "Core stability — spine neutral" },
      { name: "Hollow Body Hold", sets: "3x20s", notes: "Military staple — low back pressed to floor", caution: ["lowerBack"] },
      { name: "Bent-Knee Leg Raise", sets: "3x10", notes: "Gentler on lower back than straight-leg", caution: ["lowerBack", "hips"] },
      { name: "Glute Bridge", sets: "3x15", notes: "Core + glutes — protects lower back" },
      { name: "Single-Leg Glute Bridge", sets: "3x10/side", notes: "More glute activation — advanced version" },
      { name: "Crunch (controlled)", sets: "3x12", notes: "Upper abs — don't pull neck", caution: ["neck", "lowerBack"] },
      { name: "Bicycle Crunch", sets: "3x10/side", notes: "Obliques — slow and controlled", caution: ["neck"] },
      { name: "Flutter Kick", sets: "3x20s", notes: "Hip flexors — keep low back pressed down", caution: ["lowerBack", "hips"] },
      { name: "Superman Hold", sets: "3x10", notes: "Lower back strengthening — hold 2s", caution: ["lowerBack"] },
      { name: "Reverse Snow Angel (floor)", sets: "3x10", notes: "Upper back and rear delts" },
      { name: "V-Sit Hold", sets: "3x15s", notes: "Advanced — skip if back is flaring", caution: ["lowerBack"] },
      { name: "Windshield Wiper (bent knee)", sets: "3x10/side", notes: "Rotational core — go slow", caution: ["lowerBack", "hips"] },
      { name: "Plank Hip Dip", sets: "3x10/side", notes: "Side obliques from plank position", caution: ["wrists"] },
      { name: "Ab Wheel Rollout (from knees)", sets: "3x8", notes: "Advanced — full core", caution: ["lowerBack", "wrists", "shoulders"] },
      { name: "Seated Knee Tuck", sets: "3x12", notes: "Sit on edge of chair, pull knees to chest", caution: ["hips", "lowerBack"] },
    ],
  },
  lowerBody: {
    label: "Lower Body",
    color: "#2d6a4f",
    icon: "🦵",
    exercises: [
      { name: "Bodyweight Squat", sets: "3x10", notes: "Don't pass 90° if knees flare", caution: ["knees"] },
      { name: "Wall Sit", sets: "3x30s", notes: "Isometric — zero knee impact" },
      { name: "Sumo Squat", sets: "3x10", notes: "Wider stance — inner thigh focus", caution: ["knees", "hips"] },
      { name: "Pulse Squat", sets: "3x15", notes: "Small pulses at bottom — burns without impact", caution: ["knees"] },
      { name: "Reverse Lunge", sets: "3x10/side", notes: "Easier on knees than forward lunges" },
      { name: "Side Lunge", sets: "3x8/side", notes: "Lateral movement — inner thigh & glutes", caution: ["knees", "hips"] },
      { name: "Step-up (low step)", sets: "3x10/side", notes: "Controlled — no knee past toe", caution: ["knees"] },
      { name: "Calf Raise", sets: "3x15", notes: "Stand on step for full range" },
      { name: "Single-Leg Calf Raise", sets: "3x12/side", notes: "More balance and ankle stability" },
      { name: "Glute Kickback", sets: "3x12/side", notes: "On all fours — glutes and hamstrings" },
      { name: "Fire Hydrant", sets: "3x12/side", notes: "Hip abductor — great for knee stability", caution: ["hips"] },
      { name: "Hip Circle", sets: "3x10/dir", notes: "Standing — mobility and hip flexors" },
      { name: "Good Morning (bodyweight)", sets: "3x10", notes: "Hamstrings — hinge at hips, back flat", caution: ["lowerBack"] },
      { name: "Romanian Deadlift (BW)", sets: "3x10", notes: "Single-leg option for balance", caution: ["lowerBack"] },
      { name: "Donkey Kick", sets: "3x12/side", notes: "On all fours — glute isolation" },
      { name: "Squat Hold", sets: "3x20s", notes: "Static squat — mobility and endurance", caution: ["knees"] },
      { name: "Lateral Leg Raise (standing)", sets: "3x12/side", notes: "Hip abductor — use wall for balance" },
    ],
  },
  back: {
    label: "Back & Posture",
    color: "#0ea5e9",
    icon: "🧍",
    exercises: [
      { name: "Superman", sets: "3x10", notes: "Lower back — hold 2 sec at top", caution: ["lowerBack"] },
      { name: "Reverse Snow Angel", sets: "3x10", notes: "Prone — rear delts and upper back" },
      { name: "YTW (floor)", sets: "3x8 each", notes: "Y, T, W positions — posture builder" },
      { name: "Prone Hip Extension", sets: "3x10/side", notes: "Lying face down — lower back", caution: ["lowerBack"] },
      { name: "Cat-Cow Stretch", sets: "3x10", notes: "Spinal mobility — not strength but vital" },
      { name: "Thoracic Extension (on floor)", sets: "3x10", notes: "Improves posture and upper back mobility" },
      { name: "Wall Angels", sets: "3x10", notes: "Back flat on wall — shoulder & posture" },
    ],
  },
  cardioConditioning: {
    label: "Cardio & Conditioning",
    color: "#1a3a5c",
    icon: "💨",
    exercises: [
      { name: "March in Place", sets: "3x60s", notes: "Warm-up / cool-down staple" },
      { name: "Low-Impact Jumping Jacks", sets: "3x30s", notes: "Step side-to-side — no jumping" },
      { name: "Slow Mountain Climbers", sets: "3x10/side", notes: "Controlled pace — core + cardio", caution: ["wrists"] },
      { name: "Modified Burpee (no jump)", sets: "3x8", notes: "Step back instead of jumping", caution: ["wrists", "shoulders"] },
      { name: "Bear Crawl", sets: "3x10 steps", notes: "Full body — slow and deliberate", caution: ["wrists", "shoulders"] },
      { name: "Lateral Shuffle (slow)", sets: "3x30s", notes: "Side-to-side — agility without impact" },
      { name: "High Knee March", sets: "3x30s", notes: "Controlled — hip flexor activation", caution: ["hips"] },
      { name: "Butt Kicker March", sets: "3x30s", notes: "Hamstring activation — no running", caution: ["knees"] },
      { name: "Inchworm", sets: "3x8", notes: "Walk hands out to plank and back — full body", caution: ["wrists", "lowerBack"] },
      { name: "Squat-to-Stand", sets: "3x10", notes: "Hamstring mobility + squat warm-up", caution: ["knees"] },
      { name: "Slow Burpee (4-count)", sets: "3x6", notes: "Down in 2, up in 2 — controlled", caution: ["wrists", "shoulders", "knees"] },
      { name: "Standing Cross-Body Crunch", sets: "3x12/side", notes: "Elbow to opposite knee — cardio + core" },
    ],
  },
  mobilityWarmup: {
    label: "Mobility & Warm-Up",
    color: "#10b981",
    icon: "🧘",
    exercises: [
      { name: "Arm Circles (forward & back)", sets: "2x10/dir", notes: "Shoulder warm-up — essential before pushing" },
      { name: "Shoulder Rolls", sets: "2x10/dir", notes: "Loosens shoulder joint" },
      { name: "Neck Rolls (slow)", sets: "2x5/dir", notes: "Cervical mobility — slow and gentle", caution: ["neck"] },
      { name: "Hip Circle (standing)", sets: "2x10/dir", notes: "Hip joint mobility" },
      { name: "Leg Swing (front/back)", sets: "2x10/side", notes: "Dynamic hamstring warm-up", caution: ["hips"] },
      { name: "Leg Swing (side/side)", sets: "2x10/side", notes: "Dynamic hip abductor warm-up", caution: ["hips"] },
      { name: "Ankle Circle", sets: "2x10/dir", notes: "Ankle mobility — helps knees" },
      { name: "Wrist Circle", sets: "2x10/dir", notes: "Warm-up before push-up variations" },
      { name: "Cat-Cow", sets: "2x10", notes: "Spinal mobility — must-do for lower back" },
      { name: "Child's Pose", sets: "2x20s", notes: "Lower back decompression" },
      { name: "Cobra Stretch", sets: "2x20s", notes: "Spinal extension — lower back", caution: ["lowerBack"] },
      { name: "Hip Flexor Stretch (kneeling)", sets: "2x20s/side", notes: "Tight from sitting — crucial", caution: ["knees", "hips"] },
      { name: "World's Greatest Stretch", sets: "2x5/side", notes: "Full body mobility — slow", caution: ["hips", "knees"] },
      { name: "Doorway Chest Stretch", sets: "2x20s", notes: "Opens chest — shoulder friendly", caution: ["shoulders"] },
      { name: "Thread the Needle", sets: "2x20s/side", notes: "Thoracic rotation — upper back" },
    ],
  },
};

const categories = Object.entries(ALL_EXERCISES).map(([key, val]) => ({ key, ...val }));

const weekSchedule = [
  { day: "MON", focus: "Upper Body", color: "#e85d26", cats: ["pushVariations", "dipsTriCeps"] },
  { day: "TUE", focus: "Core + Lower", color: "#2d6a4f", cats: ["core", "lowerBody"] },
  { day: "WED", focus: "Rest", color: "#555", cats: [] },
  { day: "THU", focus: "Full Body", color: "#8b5cf6", cats: ["pushVariations", "pullVariations", "core", "lowerBody"] },
  { day: "FRI", focus: "Pull + Back", color: "#0ea5e9", cats: ["pullVariations", "back", "cardioConditioning"] },
  { day: "SAT", focus: "Core + Mobility", color: "#10b981", cats: ["core", "mobilityWarmup"] },
  { day: "SUN", focus: "Rest", color: "#555", cats: [] },
];

const totalExercises = Object.values(ALL_EXERCISES).reduce((sum, cat) => sum + cat.exercises.length, 0);

const DAY_ABBRS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

const AGE_RANGES = ["Under 40", "40–49", "50–59", "60+"];

function getThisWeekDates() {
  const today = new Date();
  const dow = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (dow === 0 ? 6 : dow - 1));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d.toISOString().split("T")[0];
  });
}

const DEFAULT_PREFS = { name: "", ageRange: "", ailments: [] };

export default function App() {
  const [activeTab, setActiveTab] = useState("library");
  const [selectedCat, setSelectedCat] = useState("pushVariations");
  const [selectedDay, setSelectedDay] = useState(() => DAY_ABBRS[new Date().getDay()]);
  const [search, setSearch] = useState("");
  const [completed, setCompleted] = useState(() => loadStorage("pt-completed", {}));
  const [expanded, setExpanded] = useState(null);
  const [prefs, setPrefs] = useState(() => loadStorage("pt-prefs", DEFAULT_PREFS));
  const [missionStartDate] = useState(() => {
    const stored = localStorage.getItem("pt-mission-start");
    if (stored) return stored;
    const today = new Date().toISOString().split("T")[0];
    localStorage.setItem("pt-mission-start", today);
    return today;
  });
  const [completedWorkoutDates, setCompletedWorkoutDates] = useState(() =>
    loadStorage("pt-completed-dates", [])
  );

  // Derived values used in effects
  const dayData = weekSchedule.find(d => d.day === selectedDay);
  const dayExercises = dayData?.cats.flatMap(ck =>
    (ALL_EXERCISES[ck]?.exercises || []).slice(0, 3)
  ) || [];
  const dayDone = dayExercises.filter(e =>
    [0, 1, 2].every(i => completed[`${e.name}-${i}`])
  ).length;

  useEffect(() => {
    localStorage.setItem("pt-completed", JSON.stringify(completed));
  }, [completed]);

  useEffect(() => {
    localStorage.setItem("pt-prefs", JSON.stringify(prefs));
  }, [prefs]);

  useEffect(() => {
    localStorage.setItem("pt-completed-dates", JSON.stringify(completedWorkoutDates));
  }, [completedWorkoutDates]);

  // Auto-mark today complete when all sets are logged
  useEffect(() => {
    if (dayExercises.length > 0 && dayDone === dayExercises.length) {
      const todayStr = new Date().toISOString().split("T")[0];
      const todayAbbr = DAY_ABBRS[new Date().getDay()];
      if (selectedDay === todayAbbr && !completedWorkoutDates.includes(todayStr)) {
        setCompletedWorkoutDates(prev => [...prev, todayStr]);
      }
    }
  }, [completed, selectedDay]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleSet = (name, i) => {
    const k = `${name}-${i}`;
    setCompleted(p => ({ ...p, [k]: !p[k] }));
  };

  const toggleAilment = (key) => {
    setPrefs(p => ({
      ...p,
      ailments: p.ailments.includes(key)
        ? p.ailments.filter(a => a !== key)
        : [...p.ailments, key],
    }));
  };

  const hasCaution = (ex) =>
    prefs.ailments.length > 0 && ex.caution?.some(c => prefs.ailments.includes(c));

  const resetProgress = () => {
    setCompleted({});
    setCompletedWorkoutDates([]);
  };

  const filteredExercises = search.length > 1
    ? Object.values(ALL_EXERCISES).flatMap(c => c.exercises).filter(e =>
        e.name.toLowerCase().includes(search.toLowerCase()) ||
        e.notes.toLowerCase().includes(search.toLowerCase())
      )
    : ALL_EXERCISES[selectedCat]?.exercises || [];

  const missionDay = Math.min(
    Math.max(1, Math.floor((Date.now() - new Date(missionStartDate).getTime()) / 86400000) + 1),
    30
  );
  const missionProgress = Math.round((missionDay / 30) * 100);
  const thisWeekDates = getThisWeekDates();

  const activeAilments = AILMENTS.filter(a => prefs.ailments.includes(a.key));

  const inputStyle = {
    width: "100%", boxSizing: "border-box",
    background: "#111", border: "1px solid #252525",
    borderRadius: 10, padding: "10px 14px",
    color: "#f0ede8", fontSize: 14, fontFamily: "inherit",
    outline: "none",
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#080808",
      color: "#f0ede8",
      fontFamily: "'Georgia', serif",
      maxWidth: 480,
      margin: "0 auto",
    }}>
      {/* Header */}
      <div style={{
        background: "#0d0d0d",
        borderBottom: "1px solid #1e1e1e",
        padding: "20px 18px 14px",
        position: "sticky",
        top: 0,
        zIndex: 20,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
          <div>
            {prefs.name && (
              <div style={{ fontSize: 10, letterSpacing: 4, color: "#e85d26", textTransform: "uppercase", marginBottom: 3 }}>
                🪖 {prefs.name}
              </div>
            )}
            <div style={{ fontSize: 22, fontWeight: "bold", letterSpacing: -0.5 }}>Military Calisthenics</div>
          </div>
          <div style={{ textAlign: "right", background: "#161616", border: "1px solid #252525", borderRadius: 10, padding: "8px 12px" }}>
            <div style={{ fontSize: 10, color: "#666", letterSpacing: 1 }}>EXERCISES</div>
            <div style={{ fontSize: 22, fontWeight: "bold", color: "#e85d26" }}>{totalExercises}</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 5 }}>
          {[
            { key: "library", label: "Library" },
            { key: "schedule", label: "Schedule" },
            { key: "progress", label: "Progress" },
            { key: "settings", label: "Settings" },
          ].map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)} style={{
              flex: 1, padding: "7px 0", borderRadius: 7, border: "1px solid",
              borderColor: activeTab === t.key ? "#e85d26" : "#222",
              background: activeTab === t.key ? "#e85d26" : "transparent",
              color: activeTab === t.key ? "#fff" : "#666",
              fontSize: 11, fontFamily: "inherit", cursor: "pointer",
              letterSpacing: 0.5, textTransform: "uppercase",
            }}>{t.label}</button>
          ))}
        </div>
      </div>

      <div style={{ padding: "14px 18px 100px" }}>

        {/* LIBRARY TAB */}
        {activeTab === "library" && (
          <>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search exercises..."
              style={{ ...inputStyle, marginBottom: 14 }}
            />

            {!search && (
              <div style={{ display: "flex", gap: 6, marginBottom: 14, overflowX: "auto", paddingBottom: 6 }}>
                {categories.map(cat => (
                  <button key={cat.key} onClick={() => setSelectedCat(cat.key)} style={{
                    whiteSpace: "nowrap", padding: "7px 12px", borderRadius: 20,
                    border: "1px solid",
                    borderColor: selectedCat === cat.key ? cat.color : "#252525",
                    background: selectedCat === cat.key ? cat.color + "22" : "transparent",
                    color: selectedCat === cat.key ? cat.color : "#666",
                    fontSize: 11, fontFamily: "inherit", cursor: "pointer",
                  }}>
                    {cat.icon} {cat.label} ({cat.exercises.length})
                  </button>
                ))}
              </div>
            )}

            {!search && (
              <div style={{ fontSize: 10, letterSpacing: 3, color: "#555", textTransform: "uppercase", marginBottom: 10 }}>
                {ALL_EXERCISES[selectedCat]?.label} — {ALL_EXERCISES[selectedCat]?.exercises.length} exercises
              </div>
            )}
            {search && (
              <div style={{ fontSize: 10, letterSpacing: 3, color: "#555", textTransform: "uppercase", marginBottom: 10 }}>
                {filteredExercises.length} results for "{search}"
              </div>
            )}

            {filteredExercises.map((ex, idx) => {
              const warn = hasCaution(ex);
              return (
                <div key={idx} style={{
                  background: warn ? "#120e00" : "#0f0f0f",
                  border: `1px solid ${warn ? "#f59e0b44" : "#1e1e1e"}`,
                  borderRadius: 11, padding: "13px 15px", marginBottom: 8,
                  display: "flex", alignItems: "center", gap: 12,
                }}>
                  <span style={{ fontSize: 22 }}>{ALL_EXERCISES[selectedCat]?.icon || "⚡"}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 4 }}>
                      <span style={{ fontSize: 14, fontWeight: "bold" }}>{ex.name}</span>
                      {warn && (
                        <span style={{
                          fontSize: 9, letterSpacing: 1, textTransform: "uppercase",
                          background: "#f59e0b22", border: "1px solid #f59e0b55",
                          borderRadius: 4, padding: "1px 5px", color: "#f59e0b",
                        }}>Modify</span>
                      )}
                    </div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                      <span style={{
                        background: "#1a1a1a", border: "1px solid #2a2a2a",
                        borderRadius: 5, padding: "2px 7px", fontSize: 11, color: "#e85d26",
                      }}>{ex.sets}</span>
                      <span style={{ fontSize: 11, color: "#555" }}>{ex.notes}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        )}

        {/* SCHEDULE TAB */}
        {activeTab === "schedule" && (
          <>
            <div style={{ display: "flex", gap: 5, marginBottom: 16, overflowX: "auto", paddingBottom: 4 }}>
              {weekSchedule.map(d => (
                <button key={d.day} onClick={() => setSelectedDay(d.day)} style={{
                  minWidth: 50, padding: "9px 4px", borderRadius: 9, border: "1px solid",
                  borderColor: selectedDay === d.day ? d.color : "#1e1e1e",
                  background: selectedDay === d.day ? d.color : "#0f0f0f",
                  color: selectedDay === d.day ? "#fff" : "#555",
                  fontSize: 10, fontFamily: "inherit", cursor: "pointer", textTransform: "uppercase", letterSpacing: 1,
                }}>
                  <div style={{ fontWeight: "bold" }}>{d.day}</div>
                  <div style={{ fontSize: 8, marginTop: 3, opacity: 0.8 }}>{d.focus.split(" ")[0]}</div>
                </button>
              ))}
            </div>

            <div style={{
              background: "#0f0f0f", border: `1px solid ${dayData?.color || "#1e1e1e"}`,
              borderRadius: 13, padding: "15px 17px", marginBottom: 14,
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <div>
                <div style={{ fontSize: 10, color: "#555", letterSpacing: 2, textTransform: "uppercase" }}>{selectedDay}</div>
                <div style={{ fontSize: 19, fontWeight: "bold", color: dayData?.color }}>{dayData?.focus}</div>
                {dayExercises.length > 0 && (
                  <div style={{ fontSize: 11, color: "#555", marginTop: 4 }}>
                    {dayData?.cats.map(ck => ALL_EXERCISES[ck]?.label).join(" · ")}
                  </div>
                )}
              </div>
              {dayExercises.length > 0 && (
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 26, fontWeight: "bold", color: dayData?.color }}>{dayDone}</div>
                  <div style={{ fontSize: 10, color: "#555" }}>of {dayExercises.length}</div>
                </div>
              )}
            </div>

            {dayExercises.length === 0 ? (
              <div style={{ textAlign: "center", padding: "48px 20px", color: "#333" }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>😴</div>
                <div style={{ fontSize: 17 }}>Rest Day</div>
                <div style={{ fontSize: 12, marginTop: 6 }}>Recovery is part of training.</div>
              </div>
            ) : (
              dayExercises.map((ex, idx) => {
                const allDone = [0, 1, 2].every(i => completed[`${ex.name}-${i}`]);
                const isExp = expanded === ex.name;
                const warn = hasCaution(ex);
                return (
                  <div key={idx} style={{
                    background: allDone ? "#091a09" : warn ? "#120e00" : "#0f0f0f",
                    border: `1px solid ${allDone ? "#2d6a4f" : warn ? "#f59e0b44" : "#1e1e1e"}`,
                    borderRadius: 11, marginBottom: 8, overflow: "hidden",
                  }}>
                    <div onClick={() => setExpanded(isExp ? null : ex.name)} style={{
                      padding: "13px 15px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer",
                    }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 3 }}>
                          <span style={{
                            fontSize: 14, fontWeight: "bold",
                            color: allDone ? "#4ade80" : "#f0ede8",
                            textDecoration: allDone ? "line-through" : "none",
                            opacity: allDone ? 0.6 : 1,
                          }}>{ex.name}</span>
                          {warn && !allDone && (
                            <span style={{
                              fontSize: 9, letterSpacing: 1, textTransform: "uppercase",
                              background: "#f59e0b22", border: "1px solid #f59e0b55",
                              borderRadius: 4, padding: "1px 5px", color: "#f59e0b",
                            }}>Modify</span>
                          )}
                        </div>
                        <div style={{ fontSize: 11, color: "#555" }}>{ex.sets} · {ex.notes}</div>
                      </div>
                      <div style={{ fontSize: 16, color: allDone ? "#4ade80" : "#333" }}>
                        {allDone ? "✓" : isExp ? "▲" : "▼"}
                      </div>
                    </div>
                    {isExp && (
                      <div style={{ padding: "0 15px 13px", borderTop: "1px solid #181818", paddingTop: 12 }}>
                        <div style={{ fontSize: 10, color: "#555", letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>Log Sets</div>
                        <div style={{ display: "flex", gap: 8 }}>
                          {[1, 2, 3].map((s, i) => {
                            const done = completed[`${ex.name}-${i}`];
                            return (
                              <button key={i} onClick={() => toggleSet(ex.name, i)} style={{
                                flex: 1, padding: "11px 0", borderRadius: 9,
                                border: `2px solid ${done ? "#4ade80" : "#252525"}`,
                                background: done ? "#0d2010" : "#161616",
                                color: done ? "#4ade80" : "#555",
                                fontSize: 13, fontFamily: "inherit", cursor: "pointer",
                              }}>
                                {done ? "✓" : `Set ${s}`}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </>
        )}

        {/* PROGRESS TAB */}
        {activeTab === "progress" && (
          <>
            <div style={{
              background: "linear-gradient(135deg, #1a0800, #080808)",
              border: "1px solid #e85d2644", borderRadius: 14,
              padding: "20px", marginBottom: 14, textAlign: "center",
            }}>
              <div style={{ fontSize: 10, color: "#e85d26", letterSpacing: 3, textTransform: "uppercase", marginBottom: 6 }}>30-Day Mission</div>
              <div style={{ fontSize: 44, fontWeight: "bold" }}>Day {missionDay}</div>
              <div style={{ fontSize: 12, color: "#555", marginTop: 2 }}>of 30</div>
              <div style={{ marginTop: 14, height: 6, background: "#1a1a1a", borderRadius: 3, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${missionProgress}%`, background: "#e85d26", borderRadius: 3, transition: "width 0.4s ease" }} />
              </div>
              <div style={{ fontSize: 10, color: "#555", marginTop: 6 }}>{missionProgress}% complete</div>
            </div>

            <div style={{ fontSize: 10, color: "#555", letterSpacing: 3, textTransform: "uppercase", marginBottom: 10 }}>This Week</div>
            <div style={{ display: "flex", gap: 5, marginBottom: 18 }}>
              {weekSchedule.map((d, i) => {
                const dateStr = thisWeekDates[i];
                const isDone = completedWorkoutDates.includes(dateStr);
                return (
                  <div key={d.day} style={{
                    flex: 1, textAlign: "center", background: "#0f0f0f",
                    border: `1px solid ${isDone ? d.color + "66" : d.cats.length > 0 ? "#1e1e1e" : "#141414"}`,
                    borderRadius: 9, padding: "9px 0",
                  }}>
                    <div style={{ fontSize: 9, color: isDone ? d.color : "#444", letterSpacing: 1 }}>{d.day}</div>
                    <div style={{ fontSize: 16, marginTop: 5 }}>
                      {d.cats.length === 0 ? "😴" : isDone ? "✅" : "⬜"}
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ fontSize: 10, color: "#555", letterSpacing: 3, textTransform: "uppercase", marginBottom: 10 }}>Exercise Library</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 18 }}>
              {categories.map(cat => (
                <div key={cat.key} style={{
                  background: "#0f0f0f", border: `1px solid ${cat.color}33`,
                  borderRadius: 11, padding: "14px", textAlign: "center",
                }}>
                  <div style={{ fontSize: 20 }}>{cat.icon}</div>
                  <div style={{ fontSize: 22, fontWeight: "bold", color: cat.color, marginTop: 4 }}>{cat.exercises.length}</div>
                  <div style={{ fontSize: 10, color: "#555", marginTop: 3 }}>{cat.label}</div>
                </div>
              ))}
            </div>

            <div style={{ fontSize: 10, color: "#555", letterSpacing: 3, textTransform: "uppercase", marginBottom: 10 }}>Milestones</div>
            {[
              { week: "Week 1–2", goal: "Build the habit, muscles adapt", icon: "🌱" },
              { week: "Week 3", goal: "Noticeable strength in push-ups & squats", icon: "💪" },
              { week: "Week 4", goal: "Core stronger, posture visibly improved", icon: "🎯" },
            ].map((m, i) => (
              <div key={i} style={{
                background: "#0f0f0f", border: "1px solid #1e1e1e",
                borderRadius: 11, padding: "13px 15px", marginBottom: 8,
                display: "flex", alignItems: "center", gap: 13,
              }}>
                <span style={{ fontSize: 26 }}>{m.icon}</span>
                <div>
                  <div style={{ fontSize: 12, color: "#e85d26", marginBottom: 3, letterSpacing: 1 }}>{m.week}</div>
                  <div style={{ fontSize: 13 }}>{m.goal}</div>
                </div>
              </div>
            ))}

            {activeAilments.length > 0 && (
              <>
                <div style={{ fontSize: 10, color: "#555", letterSpacing: 3, textTransform: "uppercase", marginBottom: 10, marginTop: 18 }}>Your Modifications</div>
                {activeAilments.map((a) => (
                  <div key={a.key} style={{
                    background: "#0f0f0f", border: "1px solid #2a1a00",
                    borderRadius: 11, padding: "12px 15px", marginBottom: 8,
                    display: "flex", gap: 12, alignItems: "center",
                  }}>
                    <span style={{ fontSize: 20 }}>⚠️</span>
                    <div>
                      <div style={{ fontSize: 12, color: "#f59e0b", marginBottom: 3 }}>{a.label}</div>
                      <div style={{ fontSize: 12, color: "#666" }}>{a.note}</div>
                    </div>
                  </div>
                ))}
              </>
            )}

            {activeAilments.length === 0 && (
              <div style={{
                background: "#0f0f0f", border: "1px solid #1e1e1e",
                borderRadius: 11, padding: "16px", marginTop: 18,
                textAlign: "center", color: "#444", fontSize: 12,
              }}>
                No modifications set.{" "}
                <span
                  onClick={() => setActiveTab("settings")}
                  style={{ color: "#e85d26", cursor: "pointer" }}
                >
                  Add ailments in Settings →
                </span>
              </div>
            )}
          </>
        )}

        {/* SETTINGS TAB */}
        {activeTab === "settings" && (
          <>
            <div style={{ fontSize: 10, color: "#555", letterSpacing: 3, textTransform: "uppercase", marginBottom: 10 }}>Profile</div>

            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 11, color: "#666", letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>Name (optional)</div>
              <input
                value={prefs.name}
                onChange={e => setPrefs(p => ({ ...p, name: e.target.value }))}
                placeholder="Your name"
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, color: "#666", letterSpacing: 1, textTransform: "uppercase", marginBottom: 8, marginTop: 12 }}>Age Range</div>
              <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                {AGE_RANGES.map(range => {
                  const active = prefs.ageRange === range;
                  return (
                    <button key={range} onClick={() => setPrefs(p => ({ ...p, ageRange: active ? "" : range }))} style={{
                      padding: "8px 16px", borderRadius: 20, border: "1px solid",
                      borderColor: active ? "#e85d26" : "#252525",
                      background: active ? "#e85d2622" : "transparent",
                      color: active ? "#e85d26" : "#666",
                      fontSize: 13, fontFamily: "inherit", cursor: "pointer",
                    }}>{range}</button>
                  );
                })}
              </div>
            </div>

            <div style={{ fontSize: 10, color: "#555", letterSpacing: 3, textTransform: "uppercase", marginBottom: 8 }}>Physical Limitations</div>
            <div style={{ fontSize: 11, color: "#444", marginBottom: 14 }}>
              Exercises that conflict with your selections will be flagged with a "Modify" badge in the Library and Schedule.
            </div>

            {AILMENTS.map(a => {
              const active = prefs.ailments.includes(a.key);
              return (
                <div
                  key={a.key}
                  onClick={() => toggleAilment(a.key)}
                  style={{
                    background: active ? "#120e00" : "#0f0f0f",
                    border: `1px solid ${active ? "#f59e0b66" : "#1e1e1e"}`,
                    borderRadius: 11, padding: "13px 15px", marginBottom: 8,
                    display: "flex", alignItems: "center", gap: 13, cursor: "pointer",
                  }}
                >
                  <div style={{
                    width: 20, height: 20, borderRadius: 6, flexShrink: 0,
                    border: `2px solid ${active ? "#f59e0b" : "#333"}`,
                    background: active ? "#f59e0b" : "transparent",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {active && <span style={{ fontSize: 11, color: "#000", fontWeight: "bold" }}>✓</span>}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: "bold", color: active ? "#f59e0b" : "#f0ede8", marginBottom: 3 }}>
                      {a.label}
                    </div>
                    <div style={{ fontSize: 11, color: "#555" }}>{a.note}</div>
                  </div>
                </div>
              );
            })}

            <div style={{ fontSize: 10, color: "#555", letterSpacing: 3, textTransform: "uppercase", marginBottom: 10, marginTop: 28 }}>Data</div>

            <button
              onClick={resetProgress}
              style={{
                width: "100%", padding: "13px", borderRadius: 11,
                border: "1px solid #3a1a1a", background: "transparent",
                color: "#ef4444", fontSize: 13, fontFamily: "inherit",
                cursor: "pointer", letterSpacing: 1,
              }}
            >
              Reset Workout Progress
            </button>
            <div style={{ fontSize: 10, color: "#333", textAlign: "center", marginTop: 6 }}>
              Clears logged sets and completed days. Keeps your profile and mission start date.
            </div>
          </>
        )}
      </div>

      <div style={{
        position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
        width: "100%", maxWidth: 480, background: "#080808",
        borderTop: "1px solid #141414", padding: "10px 18px 18px",
        textAlign: "center", fontSize: 10, color: "#252525", letterSpacing: 2,
      }}>
        {prefs.name ? `${prefs.name.toUpperCase()} · ` : ""}{totalExercises} EXERCISES · LOW IMPACT PROTOCOL
      </div>
    </div>
  );
}
