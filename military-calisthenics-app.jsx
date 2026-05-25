import { useState } from "react";

const ALL_EXERCISES = {
  pushVariations: {
    label: "Push Variations",
    color: "#e85d26",
    icon: "💪",
    exercises: [
      { name: "Standard Push-up", sets: "3x10", impact: "low", notes: "Elbows at 45°, core tight" },
      { name: "Incline Push-up", sets: "3x12", impact: "low", notes: "Hands on wall or bench — easiest on shoulders" },
      { name: "Decline Push-up", sets: "3x8", impact: "low", notes: "Feet elevated — upper chest focus" },
      { name: "Diamond Push-up", sets: "3x8", impact: "low", notes: "Skip if left shoulder flares" },
      { name: "Wide-Arm Push-up", sets: "3x10", impact: "low", notes: "Hands wider than shoulders" },
      { name: "Hand-Release Push-up", sets: "3x8", impact: "low", notes: "Lift hands off floor each rep — controlled" },
      { name: "Pike Push-up", sets: "3x8", impact: "low", notes: "Hips high, shoulder-safe overhead press" },
      { name: "Wall Push-up", sets: "3x15", impact: "low", notes: "Recovery days or warm-up" },
      { name: "Knee Push-up", sets: "3x12", impact: "low", notes: "Modified — great for shoulder recovery days" },
      { name: "Archer Push-up", sets: "3x6/side", impact: "low", notes: "One arm loaded, one extended — advanced" },
      { name: "Pseudo Planche Push-up", sets: "3x8", impact: "low", notes: "Hands at hips — tricep & shoulder strength" },
      { name: "Slow Negative Push-up", sets: "3x6", impact: "low", notes: "5-second lowering — builds control" },
    ],
  },
  pullVariations: {
    label: "Pull & Row Variations",
    color: "#8b5cf6",
    icon: "🔙",
    exercises: [
      { name: "Pull-up (overhand)", sets: "3x5", impact: "low", notes: "Use a bar — full range" },
      { name: "Chin-up (underhand)", sets: "3x5", impact: "low", notes: "Easier on shoulders than pull-up" },
      { name: "Australian Pull-up", sets: "3x10", impact: "low", notes: "Low bar or table edge — great back exercise" },
      { name: "Doorframe Row", sets: "3x10", impact: "low", notes: "Grab both sides of a doorframe and row" },
      { name: "Towel Row", sets: "3x10", impact: "low", notes: "Loop towel around a pole and row" },
      { name: "Negative Pull-up", sets: "3x5", impact: "low", notes: "Jump up, lower slowly — builds pulling strength" },
      { name: "Scapular Pull-up", sets: "3x10", impact: "low", notes: "Hang and shrug shoulder blades — warm-up" },
      { name: "Dead Hang", sets: "3x20s", impact: "low", notes: "Decompress spine, grip strength" },
      { name: "Flex Hang (hold at top)", sets: "3x10s", impact: "low", notes: "Hold chin above bar" },
    ],
  },
  dipsTriCeps: {
    label: "Dips & Triceps",
    color: "#f59e0b",
    icon: "↕️",
    exercises: [
      { name: "Bench Dip (shallow)", sets: "3x10", impact: "low", notes: "Limit depth to protect shoulders" },
      { name: "Chair Dip", sets: "3x10", impact: "low", notes: "Use a sturdy chair — keep elbows back" },
      { name: "Tricep Push-up", sets: "3x10", impact: "low", notes: "Elbows tight to sides" },
      { name: "Diamond Push-up (tricep focus)", sets: "3x8", impact: "low", notes: "Hands form diamond under chest" },
    ],
  },
  core: {
    label: "Core & Abs",
    color: "#ef4444",
    icon: "🔥",
    exercises: [
      { name: "Plank (standard)", sets: "3x30s", impact: "low", notes: "No lower back strain — back flat" },
      { name: "Side Plank", sets: "3x20s/side", impact: "low", notes: "Obliques — back-safe" },
      { name: "Dead Bug", sets: "3x10", impact: "low", notes: "Best core exercise for bad backs" },
      { name: "Bird Dog", sets: "3x10/side", impact: "low", notes: "Core stability — spine neutral" },
      { name: "Hollow Body Hold", sets: "3x20s", impact: "low", notes: "Military staple — low back pressed to floor" },
      { name: "Bent-Knee Leg Raise", sets: "3x10", impact: "low", notes: "Gentler on lower back than straight-leg" },
      { name: "Glute Bridge", sets: "3x15", impact: "low", notes: "Core + glutes — protects lower back" },
      { name: "Single-Leg Glute Bridge", sets: "3x10/side", impact: "low", notes: "More glute activation — advanced version" },
      { name: "Crunch (controlled)", sets: "3x12", impact: "low", notes: "Upper abs — don't pull neck" },
      { name: "Bicycle Crunch", sets: "3x10/side", impact: "low", notes: "Obliques — slow and controlled" },
      { name: "Flutter Kick", sets: "3x20s", impact: "low", notes: "Hip flexors — Marine Corps staple" },
      { name: "Superman Hold", sets: "3x10", impact: "low", notes: "Lower back strengthening" },
      { name: "Reverse Snow Angel (floor)", sets: "3x10", impact: "low", notes: "Upper back and rear delts" },
      { name: "V-Sit Hold", sets: "3x15s", impact: "low", notes: "Advanced — skip if back is flaring" },
      { name: "Windshield Wiper (bent knee)", sets: "3x10/side", impact: "low", notes: "Rotational core — go slow" },
      { name: "Plank Hip Dip", sets: "3x10/side", impact: "low", notes: "Side obliques from plank position" },
      { name: "Ab Wheel Rollout (from knees)", sets: "3x8", impact: "low", notes: "Advanced — full core" },
      { name: "Seated Knee Tuck", sets: "3x12", impact: "low", notes: "Sit on edge of chair, pull knees to chest" },
    ],
  },
  lowerBody: {
    label: "Lower Body",
    color: "#2d6a4f",
    icon: "🦵",
    exercises: [
      { name: "Bodyweight Squat", sets: "3x10", impact: "low", notes: "Don't pass 90° if knees flare" },
      { name: "Wall Sit", sets: "3x30s", impact: "low", notes: "Isometric — zero knee impact" },
      { name: "Sumo Squat", sets: "3x10", impact: "low", notes: "Wider stance — inner thigh focus" },
      { name: "Pulse Squat", sets: "3x15", impact: "low", notes: "Small pulses at bottom — burns without impact" },
      { name: "Reverse Lunge", sets: "3x10/side", impact: "low", notes: "Easier on knees than forward lunges" },
      { name: "Side Lunge", sets: "3x8/side", impact: "low", notes: "Lateral movement — inner thigh & glutes" },
      { name: "Step-up (low step)", sets: "3x10/side", impact: "low", notes: "Controlled — no knee past toe" },
      { name: "Calf Raise", sets: "3x15", impact: "low", notes: "Stand on step for full range" },
      { name: "Single-Leg Calf Raise", sets: "3x12/side", impact: "low", notes: "More balance and ankle stability" },
      { name: "Glute Kickback", sets: "3x12/side", impact: "low", notes: "On all fours — glutes and hamstrings" },
      { name: "Fire Hydrant", sets: "3x12/side", impact: "low", notes: "Hip abductor — great for knee stability" },
      { name: "Hip Circle", sets: "3x10/dir", impact: "low", notes: "Standing — mobility and hip flexors" },
      { name: "Good Morning (bodyweight)", sets: "3x10", impact: "low", notes: "Hamstrings — hinge at hips, back flat" },
      { name: "Romanian Deadlift (BW)", sets: "3x10", impact: "low", notes: "Single-leg option for balance" },
      { name: "Donkey Kick", sets: "3x12/side", impact: "low", notes: "On all fours — glute isolation" },
      { name: "Squat Hold", sets: "3x20s", impact: "low", notes: "Static squat — mobility and endurance" },
      { name: "Lateral Leg Raise (standing)", sets: "3x12/side", impact: "low", notes: "Hip abductor — use wall for balance" },
    ],
  },
  back: {
    label: "Back & Posture",
    color: "#0ea5e9",
    icon: "🧍",
    exercises: [
      { name: "Superman", sets: "3x10", impact: "low", notes: "Lower back — hold 2 sec at top" },
      { name: "Reverse Snow Angel", sets: "3x10", impact: "low", notes: "Prone — rear delts and upper back" },
      { name: "YTW (floor)", sets: "3x8 each", impact: "low", notes: "Y, T, W positions — posture builder" },
      { name: "Prone Hip Extension", sets: "3x10/side", impact: "low", notes: "Lying face down — lower back" },
      { name: "Cat-Cow Stretch", sets: "3x10", impact: "low", notes: "Spinal mobility — not strength but vital" },
      { name: "Thoracic Extension (on floor)", sets: "3x10", impact: "low", notes: "Improves posture and upper back mobility" },
      { name: "Wall Angels", sets: "3x10", impact: "low", notes: "Back flat on wall — shoulder & posture" },
    ],
  },
  cardioConditioning: {
    label: "Cardio & Conditioning",
    color: "#1a3a5c",
    icon: "💨",
    exercises: [
      { name: "March in Place", sets: "3x60s", impact: "low", notes: "Warm-up / cool-down staple" },
      { name: "Low-Impact Jumping Jacks", sets: "3x30s", impact: "low", notes: "Step side-to-side — no jumping" },
      { name: "Slow Mountain Climbers", sets: "3x10/side", impact: "low", notes: "Controlled pace — core + cardio" },
      { name: "Modified Burpee (no jump)", sets: "3x8", impact: "low", notes: "Step back instead of jumping" },
      { name: "Bear Crawl", sets: "3x10 steps", impact: "low", notes: "Full body — slow and deliberate" },
      { name: "Lateral Shuffle (slow)", sets: "3x30s", impact: "low", notes: "Side-to-side — agility without impact" },
      { name: "High Knee March", sets: "3x30s", impact: "low", notes: "Controlled — hip flexor activation" },
      { name: "Butt Kicker March", sets: "3x30s", impact: "low", notes: "Hamstring activation — no running" },
      { name: "Inchworm", sets: "3x8", impact: "low", notes: "Walk hands out to plank and back — full body" },
      { name: "Squat-to-Stand", sets: "3x10", impact: "low", notes: "Hamstring mobility + squat warm-up" },
      { name: "Slow Burpee (4-count)", sets: "3x6", impact: "low", notes: "Down in 2, up in 2 — controlled" },
      { name: "Standing Cross-Body Crunch", sets: "3x12/side", impact: "low", notes: "Elbow to opposite knee — cardio + core" },
    ],
  },
  mobilityWarmup: {
    label: "Mobility & Warm-Up",
    color: "#10b981",
    icon: "🧘",
    exercises: [
      { name: "Arm Circles (forward & back)", sets: "2x10/dir", impact: "low", notes: "Shoulder warm-up — essential for you" },
      { name: "Shoulder Rolls", sets: "2x10/dir", impact: "low", notes: "Loosens shoulder joint" },
      { name: "Neck Rolls (slow)", sets: "2x5/dir", impact: "low", notes: "Cervical mobility — slow and gentle" },
      { name: "Hip Circle (standing)", sets: "2x10/dir", impact: "low", notes: "Hip joint mobility" },
      { name: "Leg Swing (front/back)", sets: "2x10/side", impact: "low", notes: "Dynamic hamstring warm-up" },
      { name: "Leg Swing (side/side)", sets: "2x10/side", impact: "low", notes: "Dynamic hip abductor warm-up" },
      { name: "Ankle Circle", sets: "2x10/dir", impact: "low", notes: "Ankle mobility — helps knees" },
      { name: "Wrist Circle", sets: "2x10/dir", impact: "low", notes: "Warm-up before push-up variations" },
      { name: "Cat-Cow", sets: "2x10", impact: "low", notes: "Spinal mobility — must-do for lower back" },
      { name: "Child's Pose", sets: "2x20s", impact: "low", notes: "Lower back decompression" },
      { name: "Cobra Stretch", sets: "2x20s", impact: "low", notes: "Spinal extension — lower back" },
      { name: "Hip Flexor Stretch (kneeling)", sets: "2x20s/side", impact: "low", notes: "Tight from sitting — crucial" },
      { name: "World's Greatest Stretch", sets: "2x5/side", impact: "low", notes: "Full body mobility — slow" },
      { name: "Doorway Chest Stretch", sets: "2x20s", impact: "low", notes: "Opens chest — shoulder friendly" },
      { name: "Thread the Needle", sets: "2x20s/side", impact: "low", notes: "Thoracic rotation — upper back" },
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

export default function App() {
  const [activeTab, setActiveTab] = useState("library");
  const [selectedCat, setSelectedCat] = useState("pushVariations");
  const [selectedDay, setSelectedDay] = useState("MON");
  const [search, setSearch] = useState("");
  const [completed, setCompleted] = useState({});
  const [expanded, setExpanded] = useState(null);

  const toggleSet = (name, i) => {
    const k = `${name}-${i}`;
    setCompleted(p => ({ ...p, [k]: !p[k] }));
  };

  const filteredExercises = search.length > 1
    ? Object.values(ALL_EXERCISES).flatMap(c => c.exercises).filter(e =>
        e.name.toLowerCase().includes(search.toLowerCase()) ||
        e.notes.toLowerCase().includes(search.toLowerCase())
      )
    : ALL_EXERCISES[selectedCat]?.exercises || [];

  const dayData = weekSchedule.find(d => d.day === selectedDay);
  const dayExercises = dayData?.cats.flatMap(ck =>
    (ALL_EXERCISES[ck]?.exercises || []).slice(0, 3)
  ) || [];

  const dayDone = dayExercises.filter(e =>
    [0,1,2].every(i => completed[`${e.name}-${i}`])
  ).length;

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
            <div style={{ fontSize: 10, letterSpacing: 4, color: "#e85d26", textTransform: "uppercase", marginBottom: 3 }}>🪖 Personal</div>
            <div style={{ fontSize: 22, fontWeight: "bold", letterSpacing: -0.5 }}>Military Calisthenics</div>
          </div>
          <div style={{ textAlign: "right", background: "#161616", border: "1px solid #252525", borderRadius: 10, padding: "8px 12px" }}>
            <div style={{ fontSize: 10, color: "#666", letterSpacing: 1 }}>EXERCISES</div>
            <div style={{ fontSize: 22, fontWeight: "bold", color: "#e85d26" }}>{totalExercises}</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {[
            { key: "library", label: "Library" },
            { key: "schedule", label: "Schedule" },
            { key: "progress", label: "Progress" },
          ].map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)} style={{
              flex: 1, padding: "7px 0", borderRadius: 7, border: "1px solid",
              borderColor: activeTab === t.key ? "#e85d26" : "#222",
              background: activeTab === t.key ? "#e85d26" : "transparent",
              color: activeTab === t.key ? "#fff" : "#666",
              fontSize: 12, fontFamily: "inherit", cursor: "pointer",
              letterSpacing: 1, textTransform: "uppercase",
            }}>{t.label}</button>
          ))}
        </div>
      </div>

      <div style={{ padding: "14px 18px 100px" }}>

        {/* LIBRARY TAB */}
        {activeTab === "library" && (
          <>
            {/* Search */}
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search exercises..."
              style={{
                width: "100%", boxSizing: "border-box",
                background: "#111", border: "1px solid #252525",
                borderRadius: 10, padding: "10px 14px",
                color: "#f0ede8", fontSize: 14, fontFamily: "inherit",
                marginBottom: 14, outline: "none",
              }}
            />

            {/* Category pills */}
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

            {/* Section title */}
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

            {filteredExercises.map((ex, idx) => (
              <div key={idx} style={{
                background: "#0f0f0f", border: "1px solid #1e1e1e",
                borderRadius: 11, padding: "13px 15px", marginBottom: 8,
                display: "flex", alignItems: "center", gap: 12,
              }}>
                <span style={{ fontSize: 22 }}>{ALL_EXERCISES[selectedCat]?.icon || "⚡"}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: "bold", marginBottom: 4 }}>{ex.name}</div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                    <span style={{
                      background: "#1a1a1a", border: "1px solid #2a2a2a",
                      borderRadius: 5, padding: "2px 7px", fontSize: 11, color: "#e85d26",
                    }}>{ex.sets}</span>
                    <span style={{ fontSize: 11, color: "#555" }}>{ex.notes}</span>
                  </div>
                </div>
              </div>
            ))}
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
                const allDone = [0,1,2].every(i => completed[`${ex.name}-${i}`]);
                const isExp = expanded === ex.name;
                return (
                  <div key={idx} style={{
                    background: allDone ? "#091a09" : "#0f0f0f",
                    border: `1px solid ${allDone ? "#2d6a4f" : "#1e1e1e"}`,
                    borderRadius: 11, marginBottom: 8, overflow: "hidden",
                  }}>
                    <div onClick={() => setExpanded(isExp ? null : ex.name)} style={{
                      padding: "13px 15px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer",
                    }}>
                      <div style={{ flex: 1 }}>
                        <div style={{
                          fontSize: 14, fontWeight: "bold",
                          color: allDone ? "#4ade80" : "#f0ede8",
                          textDecoration: allDone ? "line-through" : "none",
                          opacity: allDone ? 0.6 : 1,
                        }}>{ex.name}</div>
                        <div style={{ fontSize: 11, color: "#555", marginTop: 3 }}>{ex.sets} · {ex.notes}</div>
                      </div>
                      <div style={{ fontSize: 16, color: allDone ? "#4ade80" : "#333" }}>
                        {allDone ? "✓" : isExp ? "▲" : "▼"}
                      </div>
                    </div>
                    {isExp && (
                      <div style={{ padding: "0 15px 13px", borderTop: "1px solid #181818", paddingTop: 12 }}>
                        <div style={{ fontSize: 10, color: "#555", letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>Log Sets</div>
                        <div style={{ display: "flex", gap: 8 }}>
                          {[1,2,3].map((s, i) => {
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
              <div style={{ fontSize: 44, fontWeight: "bold" }}>Day 1</div>
              <div style={{ fontSize: 12, color: "#555", marginTop: 2 }}>of 30</div>
              <div style={{ marginTop: 14, height: 6, background: "#1a1a1a", borderRadius: 3, overflow: "hidden" }}>
                <div style={{ height: "100%", width: "3%", background: "#e85d26", borderRadius: 3 }} />
              </div>
            </div>

            {/* This week */}
            <div style={{ fontSize: 10, color: "#555", letterSpacing: 3, textTransform: "uppercase", marginBottom: 10 }}>This Week</div>
            <div style={{ display: "flex", gap: 5, marginBottom: 18 }}>
              {weekSchedule.map(d => (
                <div key={d.day} style={{
                  flex: 1, textAlign: "center", background: "#0f0f0f",
                  border: `1px solid ${d.cats.length > 0 ? "#1e1e1e" : "#141414"}`,
                  borderRadius: 9, padding: "9px 0",
                }}>
                  <div style={{ fontSize: 9, color: "#444", letterSpacing: 1 }}>{d.day}</div>
                  <div style={{ fontSize: 16, marginTop: 5 }}>{d.cats.length === 0 ? "😴" : "⬜"}</div>
                </div>
              ))}
            </div>

            {/* Stats grid */}
            <div style={{ fontSize: 10, color: "#555", letterSpacing: 3, textTransform: "uppercase", marginBottom: 10 }}>Your Library</div>
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

            {/* Milestones */}
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

            {/* Health notes */}
            <div style={{ fontSize: 10, color: "#555", letterSpacing: 3, textTransform: "uppercase", marginBottom: 10, marginTop: 18 }}>Your Modifications</div>
            {[
              { label: "Left Shoulder", note: "Avoid deep dips · Use wall & incline push-ups", icon: "⚠️" },
              { label: "Right Shoulder", note: "Limit overhead · Monitor labrum during pulls", icon: "⚠️" },
              { label: "Lower Back", note: "Prioritize Dead Bug & Bird Dog · Skip V-Sits", icon: "⚠️" },
              { label: "Knees", note: "Reverse lunges over forward · Don't pass 90°", icon: "⚠️" },
            ].map((n, i) => (
              <div key={i} style={{
                background: "#0f0f0f", border: "1px solid #2a1a00",
                borderRadius: 11, padding: "12px 15px", marginBottom: 8,
                display: "flex", gap: 12, alignItems: "center",
              }}>
                <span style={{ fontSize: 20 }}>{n.icon}</span>
                <div>
                  <div style={{ fontSize: 12, color: "#f59e0b", marginBottom: 3 }}>{n.label}</div>
                  <div style={{ fontSize: 12, color: "#666" }}>{n.note}</div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      <div style={{
        position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
        width: "100%", maxWidth: 480, background: "#080808",
        borderTop: "1px solid #141414", padding: "10px 18px 18px",
        textAlign: "center", fontSize: 10, color: "#252525", letterSpacing: 2,
      }}>
        DARWIN · AGE 52 · {totalExercises} EXERCISES · LOW IMPACT PROTOCOL
      </div>
    </div>
  );
}
