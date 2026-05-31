import { useRef, useState } from "react";
import { GiMeditation } from "react-icons/gi";
import { ALL_EXERCISES, WARMUP_PRESETS, AILMENTS, exerciseCategoryMap } from "../data/exercises";
import { weekSchedule, DAY_ABBRS, getThisWeekDates } from "../data/schedule";
import { askCoach } from "../utils/aiCoach";

// ── Activity Logging ──────────────────────────────────────────────────────────

const ACTIVITY_TYPES = [
  { type: "walk",    emoji: "🚶", label: "Walk",    units: ["miles", "km", "min"] },
  { type: "run",     emoji: "🏃", label: "Run",     units: ["miles", "km", "min"] },
  { type: "bike",    emoji: "🚴", label: "Bike",    units: ["miles", "km", "min"] },
  { type: "swim",    emoji: "🏊", label: "Swim",    units: ["laps", "min"] },
  { type: "yoga",    emoji: "🧘", label: "Yoga",    units: ["min"] },
  { type: "stretch", emoji: "🤸", label: "Stretch", units: ["min"] },
  { type: "sport",   emoji: "⚽", label: "Sport",   units: ["hr", "min"] },
  { type: "other",   emoji: "⚡", label: "Other",   units: ["min"] },
];

function formatDateLabel(dateStr) {
  const today    = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
  if (dateStr === today)     return "Today";
  if (dateStr === yesterday) return "Yesterday";
  return new Date(dateStr + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function estimateMinutes(exs, restSeconds = 60) {
  let secs = 0;
  for (const ex of exs) {
    const m = ex.sets?.match(/x(\d+)s/);
    secs += m ? parseInt(m[1]) * 3 : 45 * 3; // timed hold × 3 sets, or ~45 s/set
    secs += restSeconds * 2;                   // 2 rest periods between 3 sets
  }
  secs += 30 * Math.max(0, exs.length - 1);   // ~30 s transition between exercises
  return Math.max(5, Math.round(secs / 60));
}

const CAT_GROUP_LABEL = {
  pushVariations: "Push", dipsTriCeps: "Push",
  pullVariations: "Pull", back: "Pull",
  lowerBody: "Lower body", core: "Core",
  cardioConditioning: "Cardio", mobilityWarmup: "Mobility",
};

function groupExsByCategory(exs) {
  const order = [];
  const map   = {};
  for (const ex of exs) {
    const label = CAT_GROUP_LABEL[exerciseCategoryMap[ex.name]] || "Other";
    if (!map[label]) { map[label] = []; order.push(label); }
    map[label].push(ex);
  }
  return order.map(label => ({ label, exercises: map[label] }));
}

function LogActivitySheet({ date, onSave, onClose }) {
  const [type, setType] = useState(null);
  const [value, setValue] = useState("");
  const [unit, setUnit] = useState("miles");
  const [note, setNote] = useState("");

  const selectedType = ACTIVITY_TYPES.find(t => t.type === type);

  function handleSave() {
    if (!type) return;
    onSave({
      id: Date.now().toString(),
      date,
      type,
      emoji: selectedType.emoji,
      label: selectedType.label,
      value: value.trim(),
      unit: value.trim() ? unit : "",
      note: note.trim(),
    });
    onClose();
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "#000000bb",
        zIndex: 400, display: "flex", flexDirection: "column", justifyContent: "flex-end",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "var(--surface)", borderTop: "3px solid #e85d26",
          borderRadius: "20px 20px 0 0", padding: "20px 20px 36px",
          maxHeight: "85vh", overflowY: "auto",
          animation: "slideUp 0.25s ease",
        }}
      >
        <div style={{ width: 40, height: 4, borderRadius: 2, background: "var(--border2)", margin: "0 auto 20px" }} />

        <div style={{ fontSize: 9, letterSpacing: 3, color: "var(--muted)", textTransform: "uppercase", marginBottom: 4 }}>
          Log Activity
        </div>
        <div style={{ fontSize: 17, fontWeight: "bold", marginBottom: 20 }}>
          {formatDateLabel(date)}
        </div>

        {/* Type grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 20 }}>
          {ACTIVITY_TYPES.map(t => (
            <button
              key={t.type}
              onClick={() => { setType(t.type); setUnit(t.units[0]); }}
              style={{
                padding: "10px 4px", borderRadius: 11,
                border: `1px solid ${type === t.type ? "#e85d26" : "var(--border)"}`,
                background: type === t.type ? "#e85d2618" : "var(--surface2)",
                cursor: "pointer", fontFamily: "inherit",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
              }}
            >
              <span style={{ fontSize: 22 }}>{t.emoji}</span>
              <span style={{ fontSize: 10, color: type === t.type ? "#e85d26" : "var(--muted)", letterSpacing: 0.5 }}>
                {t.label}
              </span>
            </button>
          ))}
        </div>

        {/* Amount + unit */}
        {type && (
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <input
              type="number"
              inputMode="decimal"
              placeholder="Amount (optional)"
              value={value}
              onChange={e => setValue(e.target.value)}
              style={{
                flex: 1, background: "var(--surface0)", border: "1px solid var(--border2)",
                borderRadius: 10, padding: "10px 14px",
                color: "var(--text)", fontSize: 14, fontFamily: "inherit", outline: "none",
              }}
            />
            <select
              value={unit}
              onChange={e => setUnit(e.target.value)}
              style={{
                background: "var(--surface0)", border: "1px solid var(--border2)",
                borderRadius: 10, padding: "10px 12px",
                color: "var(--text)", fontSize: 14, fontFamily: "inherit",
                outline: "none", cursor: "pointer",
              }}
            >
              {selectedType.units.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
        )}

        {/* Note */}
        {type && (
          <input
            placeholder="Note (optional) — e.g. morning loop"
            value={note}
            onChange={e => setNote(e.target.value)}
            style={{
              width: "100%", boxSizing: "border-box",
              background: "var(--surface0)", border: "1px solid var(--border2)",
              borderRadius: 10, padding: "10px 14px", marginBottom: 20,
              color: "var(--text)", fontSize: 14, fontFamily: "inherit", outline: "none",
            }}
          />
        )}

        <button
          onClick={handleSave}
          disabled={!type}
          style={{
            width: "100%", padding: "16px", borderRadius: 13, border: "none",
            background: type ? "#e85d26" : "var(--surface2)",
            color: type ? "#fff" : "var(--muted3)",
            fontSize: 15, fontWeight: "bold", letterSpacing: 1,
            fontFamily: "inherit", cursor: type ? "pointer" : "default",
            transition: "background 0.15s",
          }}
        >
          Save Activity
        </button>
      </div>
    </div>
  );
}

const API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY;

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

// ── Recovery Warning ─────────────────────────────────────────────────────────

const MUSCLE_GROUPS = {
  pushVariations: "push", dipsTriCeps: "push",
  pullVariations: "pull", back: "pull",
  lowerBody: "lower", core: "core",
};
const MUSCLE_LABELS = { push: "Push", pull: "Pull", lower: "Lower body", core: "Core" };

function getExercisesForDate(completed, dateStr) {
  const seen = new Set();
  for (const key of Object.keys(completed)) {
    if (!key.startsWith(dateStr + ":") || !completed[key]) continue;
    const name = key.slice(dateStr.length + 1).replace(/-\d+$/, "");
    seen.add(name);
  }
  return [...seen];
}

function getMuscleGroupMap(exerciseNames) {
  const map = new Map();
  for (const name of exerciseNames) {
    const group = MUSCLE_GROUPS[exerciseCategoryMap[name]];
    if (group) {
      if (!map.has(group)) map.set(group, []);
      map.get(group).push(name);
    }
  }
  return map;
}

function buildWarnings(completed, dayExercises, todayStr) {
  const warnings = [];
  const yesterday = new Date(new Date(todayStr).getTime() - 86400000).toISOString().split("T")[0];
  const ydayNames = getExercisesForDate(completed, yesterday);

  if (ydayNames.length > 0) {
    const ydayGroups = getMuscleGroupMap(ydayNames);
    const todayGroups = getMuscleGroupMap(dayExercises.map(e => e.name));
    for (const [group] of todayGroups) {
      if (ydayGroups.has(group)) {
        const examples = ydayGroups.get(group).slice(0, 2).join(", ");
        warnings.push({ type: "overlap", group, examples });
      }
    }
  }

  let streak = 0;
  for (let i = 1; i <= 5; i++) {
    const d = new Date(new Date(todayStr).getTime() - i * 86400000).toISOString().split("T")[0];
    if (getExercisesForDate(completed, d).length > 0) streak++;
    else break;
  }
  if (streak >= 3) warnings.push({ type: "streak", streak });

  return warnings;
}

function RecoveryWarning({ completed, dayExercises, todayStr }) {
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem(`pt-warn-dismissed:${todayStr}`) === "true"
  );

  const warnings = buildWarnings(completed, dayExercises, todayStr);
  if (dismissed || !warnings.length) return null;

  function dismiss() {
    localStorage.setItem(`pt-warn-dismissed:${todayStr}`, "true");
    setDismissed(true);
  }

  return (
    <div style={{
      background: "var(--warn-surface)", border: "1px solid #f59e0b44",
      borderLeft: "3px solid #f59e0b",
      borderRadius: 10, padding: "12px 14px", marginBottom: 8,
      position: "relative",
    }}>
      <button
        onClick={dismiss}
        style={{ position: "absolute", top: 8, right: 10, background: "none", border: "none", color: "var(--muted3)", cursor: "pointer", fontSize: 14, lineHeight: 1, padding: 0 }}
      >✕</button>
      <div style={{ fontSize: 9, color: "#f59e0b", letterSpacing: 3, textTransform: "uppercase", marginBottom: 8 }}>
        Recovery Heads-Up
      </div>
      {warnings.map((w, i) => (
        <div key={i} style={{ display: "flex", gap: 8, marginBottom: i < warnings.length - 1 ? 6 : 0 }}>
          <span style={{ color: "#f59e0b", fontSize: 10, marginTop: 2, flexShrink: 0 }}>▸</span>
          <span style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.45 }}>
            {w.type === "overlap"
              ? <><span style={{ color: "var(--text)", fontWeight: "bold" }}>{MUSCLE_LABELS[w.group]}</span> muscles hit yesterday ({w.examples}) — reduce volume or sub easier variants</>
              : <><span style={{ color: "var(--text)", fontWeight: "bold" }}>{w.streak} training days</span> in a row — consider lighter effort today</>
            }
          </span>
        </div>
      ))}
    </div>
  );
}

// ── Pre-workout AI Brief ──────────────────────────────────────────────────────

function PreWorkoutBrief({ dayExercises, dayData, prefs, completed, todayStr }) {
  const [brief, setBrief] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const cacheKey = `pt-brief:${todayStr}`;

  function fetchBrief() {
    const cached = localStorage.getItem(cacheKey);
    if (cached) { setBrief(cached); return; }

    setLoading(true);

    // Derive yesterday's exercise names from completed log
    const yesterday = new Date(new Date(todayStr).getTime() - 86400000).toISOString().split("T")[0];
    const yesterdayExs = [...new Set(
      Object.keys(completed)
        .filter(k => k.startsWith(yesterday + ":") && completed[k])
        .map(k => k.split(":")[1].replace(/-\d$/, ""))
    )];

    const ailmentDescs = AILMENTS
      .filter(a => prefs?.ailments?.includes(a.key))
      .map(a => a.label)
      .join(", ");

    const exerciseList = dayExercises.map(ex => `${ex.name} (${ex.sets})`).join(", ");

    askCoach(
      `You are a practical fitness coach. Give 2-3 specific modifications or tips for today's workout.
Format each point with a • prefix. Reference exercises by their exact name.
Be direct — no preamble, no generic encouragement.`,
      `Today: ${dayData?.focus} — ${exerciseList}
Yesterday: ${yesterdayExs.length ? yesterdayExs.join(", ") : "rest day"}
User: ${prefs?.ageRange || "adult"}${ailmentDescs ? `, limitations: ${ailmentDescs}` : ""}`,
      250
    ).then(text => {
      if (text) {
        localStorage.setItem(cacheKey, text);
        setBrief(text);
      }
      setLoading(false);
    });
  }

  if (dismissed) return null;

  if (!brief && !loading) {
    return (
      <button
        onClick={fetchBrief}
        style={{
          width: "100%", padding: "10px", borderRadius: 10, marginBottom: 8,
          border: "1px solid #e85d2644", background: "var(--mission-surface)",
          color: "#e85d26", fontSize: 12, fontFamily: "inherit",
          cursor: "pointer", letterSpacing: 0.5,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
        }}
      >
        ✦ Get coaching tips for today
      </button>
    );
  }

  return (
    <div style={{
      background: "var(--mission-surface)", border: "1px solid #e85d2633",
      borderRadius: 10, padding: "12px 14px", marginBottom: 8,
      position: "relative",
    }}>
      <button
        onClick={() => setDismissed(true)}
        style={{ position: "absolute", top: 8, right: 10, background: "none", border: "none", color: "var(--muted3)", cursor: "pointer", fontSize: 14, lineHeight: 1, padding: 0 }}
      >✕</button>
      <div style={{ fontSize: 9, color: "#e85d26", letterSpacing: 3, textTransform: "uppercase", marginBottom: 8 }}>
        Coach's Tips
      </div>
      {loading ? (
        <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              width: 5, height: 5, borderRadius: "50%", background: "#e85d2666",
              animation: "breathe 1.2s ease-in-out infinite",
              animationDelay: `${i * 0.18}s`,
            }} />
          ))}
        </div>
      ) : (
        brief?.split("\n").filter(l => l.trim()).map((line, i, arr) => (
          <div key={i} style={{ display: "flex", gap: 8, marginBottom: i < arr.length - 1 ? 6 : 0 }}>
            <span style={{ color: "#e85d26", fontSize: 10, marginTop: 2, flexShrink: 0 }}>▸</span>
            <span style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.45 }}>{line.replace(/^[•\-]\s*/, "")}</span>
          </div>
        ))
      )}
    </div>
  );
}

export default function ScheduleTab({
  selectedDay, setSelectedDay,
  dayData, dayExercises, dayDone,
  todayStr, completed,
  missionStartDate, weekProg,
  hasCaution, toggleSet, completeAllSets, startWorkout, setDemoEx,
  prefs, completedWorkoutDates, getDayExercises, missionDay,
  activities, addActivity, deleteActivity,
}) {
  const todayAbbr = DAY_ABBRS[new Date().getDay()];
  const isToday = selectedDay === todayAbbr;
  const thisWeekDates = getThisWeekDates();
  const lpTimer = useRef(null);
  const lpFired = useRef(false);
  const [justCompleted, setJustCompleted] = useState(null);
  const [restDayPreview, setRestDayPreview] = useState(null); // { dayDef, exs }
  const [previewSelections, setPreviewSelections] = useState({}); // { [day]: Set<name> }
  const [logSheetOpen, setLogSheetOpen] = useState(false);

  // Date string for the currently selected day (within this week)
  const selectedDayIdx = weekSchedule.findIndex(d => d.day === selectedDay);
  const selectedDayStr = thisWeekDates[selectedDayIdx] ?? todayStr;
  const dayActivities = (activities ?? []).filter(a => a.date === selectedDayStr);

  function handleSetTap(exName, i) {
    const othersDone = [0, 1, 2].filter(j => j !== i && !!completed[`${todayStr}:${exName}-${j}`]).length;
    if (othersDone === 2 && !completed[`${todayStr}:${exName}-${i}`]) {
      setJustCompleted(exName);
      navigator.vibrate?.([15, 40, 60]);
      setTimeout(() => setJustCompleted(null), 700);
    }
    toggleSet(exName, i);
  }

  function startLongPress(ex) {
    lpFired.current = false;
    lpTimer.current = setTimeout(() => {
      lpFired.current = true;
      completeAllSets(ex.name);
    }, 600);
  }
  function cancelLongPress() {
    clearTimeout(lpTimer.current);
  }

  const doneCount = completedWorkoutDates?.length ?? 0;

  return (
    <>
      {/* ── Day selector ── */}
      <div style={{ display: "flex", gap: 5, marginBottom: 16, overflowX: "auto", paddingBottom: 4 }}>
        {weekSchedule.map((d, idx) => {
          const isSelected = selectedDay === d.day;
          const isCurrent = d.day === todayAbbr;
          const dateStr = thisWeekDates[idx];
          const isDone = (completedWorkoutDates ?? []).includes(dateStr);
          const isRest = d.cats.length === 0;

          return (
            <button
              key={d.day}
              onClick={() => setSelectedDay(d.day)}
              style={{
                minWidth: 46, padding: "10px 4px 8px", borderRadius: 10,
                border: `1px solid ${isSelected ? d.color : "var(--border)"}`,
                background: isSelected ? d.color + "18" : "var(--surface)",
                color: isSelected ? d.color : "var(--muted)",
                fontSize: 10, fontFamily: "inherit", cursor: "pointer",
                textTransform: "uppercase", letterSpacing: 1,
                position: "relative", outline: "none",
              }}
            >
              {/* Today tick */}
              {isCurrent && (
                <div style={{
                  position: "absolute", top: 4, left: "50%", transform: "translateX(-50%)",
                  width: 4, height: 4, borderRadius: "50%",
                  background: isSelected ? d.color : "#e85d26",
                }} />
              )}
              <div style={{ fontWeight: "bold" }}>{d.day}</div>
              <div style={{ fontSize: 8, marginTop: 2, opacity: 0.75 }}>
                {d.focus.split(" ")[0]}
              </div>
              {/* Completion indicator */}
              <div style={{ marginTop: 6, display: "flex", justifyContent: "center" }}>
                {isRest ? (
                  <div style={{ width: 14, height: 2, borderRadius: 1, background: "var(--border2)" }} />
                ) : isDone ? (
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: d.color }} />
                ) : (
                  <div style={{
                    width: 6, height: 6, borderRadius: "50%",
                    border: `1.5px solid ${isSelected ? d.color : "var(--border3)"}`,
                  }} />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* ── Greeting (today only) ── */}
      {isToday && dayExercises.length > 0 && (
        <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 12, letterSpacing: 0.3 }}>
          {getGreeting()}{prefs?.name ? `, ${prefs.name}` : ""}. Today is{" "}
          <span style={{ color: dayData?.color, fontWeight: "bold" }}>{dayData?.focus}</span>
          {missionStartDate && weekProg && (
            <span> · <span style={{ color: "var(--muted2)" }}>{weekProg.label}</span></span>
          )}.
        </div>
      )}

      {/* ── Day header ── */}
      <div style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderTop: `3px solid ${dayData?.color || "var(--border)"}`,
        borderRadius: 13, padding: "16px 18px", marginBottom: 12,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 9, color: "var(--muted)", letterSpacing: 3, textTransform: "uppercase", marginBottom: 5 }}>
              {selectedDay}
            </div>
            <div style={{ fontSize: 26, fontWeight: 900, color: dayData?.color, lineHeight: 1, marginBottom: 5 }}>
              {dayData?.focus}
            </div>
            {dayExercises.length > 0 && (
              <div style={{ fontSize: 10, color: "var(--muted)", letterSpacing: 0.3 }}>
                {dayData?.cats.map(ck => ALL_EXERCISES[ck]?.label).filter(Boolean).join(" · ")}
              </div>
            )}
          </div>
          {dayExercises.length > 0 && (
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div style={{
                fontSize: 34, fontWeight: 900, lineHeight: 1,
                color: dayDone === dayExercises.length ? "#4ade80" : dayData?.color,
              }}>
                {dayDone}
              </div>
              <div style={{ fontSize: 10, color: "var(--muted)" }}>/ {dayExercises.length}</div>
            </div>
          )}
        </div>

        {/* Progress bar */}
        {dayExercises.length > 0 && (
          <div style={{ marginTop: 14, height: 3, background: "var(--border)", borderRadius: 2, overflow: "hidden" }}>
            <div style={{
              height: "100%",
              width: `${(dayDone / dayExercises.length) * 100}%`,
              background: dayDone === dayExercises.length ? "#4ade80" : dayData?.color,
              borderRadius: 2,
              transition: "width 0.4s ease",
            }} />
          </div>
        )}
      </div>

      {/* ── Start Workout button (today, training days only) ── */}
      {dayExercises.length > 0 && isToday && (
        <button
          onClick={() => startWorkout(dayExercises)}
          style={{
            width: "100%", padding: "16px", borderRadius: 13, border: "none",
            background: dayDone === dayExercises.length ? "var(--surface2)" : "#e85d26",
            color: dayDone === dayExercises.length ? "var(--muted)" : "#fff",
            fontSize: 15, fontWeight: "bold", letterSpacing: 1,
            fontFamily: "inherit", cursor: "pointer", marginBottom: 8,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}
        >
          {dayDone === dayExercises.length
            ? "✓ Workout Complete"
            : dayDone > 0 ? "▶ Continue Workout" : "▶ Start Workout"}
        </button>
      )}

      {/* ── Recovery warning (today, training days) ── */}
      {dayExercises.length > 0 && isToday && (
        <RecoveryWarning completed={completed} dayExercises={dayExercises} todayStr={todayStr} />
      )}

      {/* ── Pre-workout AI brief (today, training days, not yet complete) ── */}
      {dayExercises.length > 0 && isToday && dayDone < dayExercises.length && API_KEY && (
        <PreWorkoutBrief
          dayExercises={dayExercises}
          dayData={dayData}
          prefs={prefs}
          completed={completed}
          todayStr={todayStr}
        />
      )}

      {/* ── Progression banner ── */}
      {missionStartDate && dayExercises.length > 0 && (
        <div style={{
          background: "var(--mission-surface)", border: "1px solid #e85d2633",
          borderRadius: 10, padding: "10px 14px", marginBottom: 10,
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <div>
            <div style={{ fontSize: 9, color: "#e85d26", letterSpacing: 2, textTransform: "uppercase", marginBottom: 2 }}>
              {weekProg.label} · {weekProg.sub}
            </div>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>{weekProg.note}</div>
          </div>
          <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 12 }}>
            <div style={{ fontSize: 20, fontWeight: "bold", color: "#e85d26", lineHeight: 1 }}>
              {weekProg.sets}×{weekProg.reps}
            </div>
            <div style={{ fontSize: 9, color: "var(--muted)", letterSpacing: 0.5 }}>target</div>
          </div>
        </div>
      )}

      {/* ── Warm-up callout ── */}
      {dayData?.warmup && WARMUP_PRESETS[dayData.warmup] && (
        <div style={{
          background: "var(--info-surface)", border: "1px solid #10b98133",
          borderRadius: 10, padding: "12px 14px", marginBottom: 12,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <GiMeditation size={18} color="#10b981" />
            <div style={{ fontSize: 10, color: "#10b981", letterSpacing: 2, textTransform: "uppercase" }}>
              Warm-up first — 10–15 min total
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {/* Cardio warm-up */}
            <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <span style={{ fontSize: 16, flexShrink: 0, lineHeight: 1.3 }}>🚶</span>
              <div>
                <div style={{ fontSize: 12, fontWeight: "bold", color: "var(--text)", marginBottom: 2 }}>10–15 min light cardio</div>
                <div style={{ fontSize: 11, color: "var(--muted3)", lineHeight: 1.4 }}>
                  Treadmill walk, stationary bike, or elliptical · fat-burning pace (Zone 2) · can talk but slightly breathless
                </div>
              </div>
            </div>
            <div style={{ height: 1, background: "var(--border)" }} />
            {/* Movement prep */}
            <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <span style={{ fontSize: 16, flexShrink: 0, lineHeight: 1.3 }}>🤸</span>
              <div>
                <div style={{ fontSize: 12, fontWeight: "bold", color: "var(--text)", marginBottom: 2 }}>Movement prep — 2 min</div>
                <div style={{ fontSize: 11, color: "var(--muted3)" }}>{WARMUP_PRESETS[dayData.warmup]}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Long-press hint (today only, incomplete) ── */}
      {isToday && dayExercises.length > 0 && dayDone < dayExercises.length && (
        <div style={{ fontSize: 10, color: "var(--muted3)", textAlign: "center", marginBottom: 10, letterSpacing: 0.5 }}>
          Tap dots to log sets · hold card to complete all
        </div>
      )}

      {/* ── Exercise list or rest day ── */}
      {dayExercises.length === 0 ? (
        <div>
          <div style={{
            background: "var(--info-surface)", border: "1px solid #10b98133",
            borderRadius: 13, padding: "16px 18px", marginBottom: 12,
            display: "flex", alignItems: "center", gap: 12,
          }}>
            <div style={{ fontSize: 32 }}>😴</div>
            <div>
              <div style={{ fontSize: 15, fontWeight: "bold", marginBottom: 3 }}>Rest Day</div>
              <div style={{ fontSize: 11, color: "var(--muted)", lineHeight: 1.5 }}>
                Active recovery only. Light movement helps adaptation.
              </div>
            </div>
          </div>

          <div style={{ fontSize: 9, color: "#10b981", letterSpacing: 3, textTransform: "uppercase", marginBottom: 10 }}>
            Recommended Mobility — 5–10 min
          </div>

          {[
            { name: "Cat-Cow",                       sets: "2×10",       notes: "Spinal decompression — essential" },
            { name: "Child's Pose",                  sets: "2×20s",      notes: "Lower back release" },
            { name: "Hip Circle (standing)",         sets: "2×10/dir",   notes: "Hip joint mobility" },
            { name: "Arm Circles (forward & back)",  sets: "2×10/dir",   notes: "Shoulder warm-down" },
            { name: "Thread the Needle",             sets: "2×20s/side", notes: "Thoracic rotation" },
          ].map((item, idx) => (
            <div key={idx} style={{
              background: "var(--surface)", border: "1px solid var(--border)",
              borderLeft: "3px solid #10b981",
              borderRadius: 11, padding: "12px 14px", marginBottom: 8,
            }}>
              <div style={{ fontSize: 13, fontWeight: "bold", color: "var(--text)", marginBottom: 5 }}>{item.name}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{
                  background: "var(--surface3)", border: "1px solid var(--border3)",
                  borderRadius: 5, padding: "2px 8px",
                  fontSize: 11, fontWeight: "bold", color: "#10b981", flexShrink: 0,
                }}>{item.sets}</span>
                <span style={{ fontSize: 11, color: "var(--muted)" }}>{item.notes}</span>
              </div>
            </div>
          ))}

          <div style={{ textAlign: "center", padding: "12px 0 4px", fontSize: 11, color: "var(--muted3)" }}>
            Or a 10-min walk counts. See you tomorrow.
          </div>

          {/* ── Train anyway: missed days + train ahead ── */}
          {isToday && getDayExercises && (() => {
            // Missed training days in the past 6 days — cap at 2 to prevent volume stacking
            const allMissed = [];
            for (let i = 1; i <= 6; i++) {
              const d = new Date(new Date(todayStr).getTime() - i * 86400000);
              const dateStr = d.toISOString().split("T")[0];
              const abbr = DAY_ABBRS[d.getDay()];
              const def = weekSchedule.find(w => w.day === abbr);
              if (!def || !def.cats.length) continue;
              if ((completedWorkoutDates ?? []).includes(dateStr)) continue;
              allMissed.push({ dateStr, abbr, dayDef: def });
            }
            const missedDays = allMissed.slice(0, 2);

            const todayIdx = weekSchedule.findIndex(d => d.day === todayAbbr);
            const nextTrainingDay = weekSchedule.slice(todayIdx + 1).find(d => d.cats.length > 0)
              || weekSchedule.find(d => d.cats.length > 0);

            const seed = missionDay ?? 1;
            const restSecs = prefs?.restDuration ?? 60;

            // Helper: open a preview, preserving any existing selection for this day
            function openPreview(dayDef, exs) {
              setRestDayPreview({ dayDef, exs });
              setPreviewSelections(prev =>
                prev[dayDef.day]
                  ? prev  // selections already exist — preserve them
                  : { ...prev, [dayDef.day]: new Set(exs.map(e => e.name)) }
              );
            }

            // ── Preview panel ───────────────────────────────────────────────────
            if (restDayPreview) {
              const { dayDef: pd, exs: pExs } = restDayPreview;
              const selected  = previewSelections[pd.day] ?? new Set(pExs.map(e => e.name));
              const selCount  = selected.size;
              const selExs    = pExs.filter(e => selected.has(e.name));
              const estMins   = estimateMinutes(selExs, restSecs);
              const groups    = groupExsByCategory(pExs);

              function toggle(name) {
                setPreviewSelections(prev => {
                  const next = new Set(prev[pd.day]);
                  if (next.has(name)) next.delete(name); else next.add(name);
                  return { ...prev, [pd.day]: next };
                });
              }

              return (
                <div style={{ marginTop: 20 }}>
                  {/* Header row */}
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                    <button
                      onClick={() => setRestDayPreview(null)}
                      style={{
                        background: "none", border: "none", color: "var(--muted)",
                        fontSize: 20, cursor: "pointer", padding: "2px 8px 2px 0", fontFamily: "inherit",
                      }}
                    >←</button>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 9, color: pd.color, letterSpacing: 2, textTransform: "uppercase" }}>
                        {pd.day} · {pd.focus}
                      </div>
                      <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 1 }}>
                        {selCount} of {pExs.length} selected · ~{estMins} min
                      </div>
                    </div>
                    {/* All / None */}
                    <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                      <button
                        onClick={() => setPreviewSelections(prev => ({ ...prev, [pd.day]: new Set(pExs.map(e => e.name)) }))}
                        style={{
                          padding: "4px 10px", borderRadius: 8, fontSize: 11,
                          border: "1px solid var(--border2)", background: "transparent",
                          color: "var(--muted)", fontFamily: "inherit", cursor: "pointer",
                        }}
                      >All</button>
                      <button
                        onClick={() => setPreviewSelections(prev => ({ ...prev, [pd.day]: new Set() }))}
                        style={{
                          padding: "4px 10px", borderRadius: 8, fontSize: 11,
                          border: "1px solid var(--border2)", background: "transparent",
                          color: "var(--muted)", fontFamily: "inherit", cursor: "pointer",
                        }}
                      >None</button>
                    </div>
                  </div>

                  {/* Category-grouped checklist */}
                  {groups.map(({ label, exercises: gExs }) => (
                    <div key={label}>
                      <div style={{
                        fontSize: 8, letterSpacing: 2, color: "var(--muted3)",
                        textTransform: "uppercase", marginBottom: 6, marginTop: 10,
                      }}>
                        {label}
                      </div>
                      {gExs.map((ex) => {
                        const checked = selected.has(ex.name);
                        return (
                          <div
                            key={ex.name}
                            onClick={() => toggle(ex.name)}
                            style={{
                              background: checked ? "var(--surface)" : "var(--surface2)",
                              border: `1px solid ${checked ? pd.color + "44" : "var(--border)"}`,
                              borderLeft: `3px solid ${checked ? pd.color : "var(--border2)"}`,
                              borderRadius: 11, padding: "11px 8px 11px 14px", marginBottom: 7,
                              cursor: "pointer", opacity: checked ? 1 : 0.45,
                              display: "flex", alignItems: "center", gap: 12,
                              transition: "opacity 0.15s",
                            }}
                          >
                            <div style={{
                              width: 20, height: 20, borderRadius: 6, flexShrink: 0,
                              border: `2px solid ${checked ? pd.color : "var(--border3)"}`,
                              background: checked ? pd.color : "transparent",
                              display: "flex", alignItems: "center", justifyContent: "center",
                            }}>
                              {checked && <span style={{ fontSize: 11, color: "#fff", fontWeight: "bold" }}>✓</span>}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 14, fontWeight: "bold", color: "var(--text)" }}>{ex.name}</div>
                              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                                <span style={{
                                  background: "var(--surface3)", border: "1px solid var(--border3)",
                                  borderRadius: 5, padding: "2px 8px",
                                  fontSize: 11, fontWeight: "bold",
                                  color: checked ? pd.color : "var(--muted3)",
                                }}>{ex.sets}</span>
                                <span style={{ fontSize: 11, color: "var(--muted3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ex.notes}</span>
                              </div>
                            </div>
                            {/* Larger touch target for info button */}
                            <button
                              onClick={e => { e.stopPropagation(); setDemoEx(ex); }}
                              style={{
                                background: "none", border: "none", color: "var(--muted3)",
                                fontSize: 15, cursor: "pointer",
                                padding: "10px 12px", flexShrink: 0, lineHeight: 1,
                              }}
                            >ⓘ</button>
                          </div>
                        );
                      })}
                    </div>
                  ))}

                  {selCount === 0 && (
                    <div style={{ fontSize: 11, color: "var(--muted3)", textAlign: "center", padding: "8px 0 4px" }}>
                      Select at least one exercise to start.
                    </div>
                  )}

                  <button
                    onClick={() => selCount > 0 && startWorkout(selExs)}
                    disabled={selCount === 0}
                    style={{
                      width: "100%", padding: "16px", borderRadius: 13, border: "none",
                      background: selCount > 0 ? pd.color : "var(--surface2)",
                      color: selCount > 0 ? "#fff" : "var(--muted3)",
                      fontSize: 15, fontWeight: "bold", letterSpacing: 1,
                      fontFamily: "inherit", cursor: selCount > 0 ? "pointer" : "default",
                      marginTop: 10,
                    }}
                  >
                    ▶ Start · {selCount} exercise{selCount !== 1 ? "s" : ""}
                  </button>
                  {selCount > 0 && (
                    <div style={{ fontSize: 11, color: "#4ade80", textAlign: "center", marginTop: 6 }}>
                      ✓ Counts toward your mission
                    </div>
                  )}
                </div>
              );
            }

            // ── Options list ───────────────────────────────────────────────────
            if (!missedDays.length && !nextTrainingDay) return null;

            return (
              <div style={{ marginTop: 20 }}>
                {/* Volume guardrail when 2+ missed sessions available */}
                {allMissed.length >= 2 && (
                  <div style={{
                    background: "var(--warn-surface)", border: "1px solid #f59e0b44",
                    borderLeft: "3px solid #f59e0b",
                    borderRadius: 10, padding: "10px 14px", marginBottom: 12,
                    fontSize: 12, color: "var(--muted)", lineHeight: 1.5,
                  }}>
                    <span style={{ color: "#f59e0b", fontWeight: "bold" }}>Pick one session. </span>
                    Your muscles need recovery between workouts — doubling up won't speed progress and raises injury risk. Tomorrow is already scheduled.
                  </div>
                )}

                {/* Missed days */}
                {missedDays.length > 0 && (
                  <>
                    <div style={{ fontSize: 9, color: "var(--muted3)", letterSpacing: 3, textTransform: "uppercase", marginBottom: 10 }}>
                      Available to make up
                    </div>
                    {missedDays.map(({ dateStr, dayDef }) => {
                      const exs  = getDayExercises(dayDef.day, seed % 7 || 1);
                      const lbl  = new Date(dateStr + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
                      const mins = estimateMinutes(exs, restSecs);
                      return (
                        <button
                          key={dateStr}
                          onClick={() => openPreview(dayDef, exs)}
                          style={{
                            width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                            padding: "14px 16px", borderRadius: 11, boxSizing: "border-box", marginBottom: 8,
                            border: `1px solid ${dayDef.color}44`, background: `${dayDef.color}0d`,
                            cursor: "pointer", fontFamily: "inherit", textAlign: "left",
                          }}
                        >
                          <div>
                            <div style={{ fontSize: 9, color: dayDef.color, letterSpacing: 2, textTransform: "uppercase", marginBottom: 3 }}>
                              {lbl}
                            </div>
                            <div style={{ fontSize: 15, fontWeight: "bold", color: "var(--text)", marginBottom: 2 }}>
                              {dayDef.focus}
                            </div>
                            <div style={{ fontSize: 11, color: "var(--muted)" }}>
                              {exs.length} exercises · ~{mins} min · tap to customize
                            </div>
                          </div>
                          <span style={{ fontSize: 20, color: dayDef.color, flexShrink: 0, marginLeft: 12 }}>›</span>
                        </button>
                      );
                    })}
                  </>
                )}

                {/* Train ahead */}
                {nextTrainingDay && (() => {
                  const exs  = getDayExercises(nextTrainingDay.day, (seed % 7) + 1);
                  const mins = estimateMinutes(exs, restSecs);
                  return (
                    <>
                      <div style={{
                        fontSize: 9, color: "var(--muted3)", letterSpacing: 3, textTransform: "uppercase",
                        marginBottom: 10, marginTop: missedDays.length ? 14 : 0,
                      }}>
                        {missedDays.length ? "Or train ahead" : "Still want to train?"}
                      </div>
                      <button
                        onClick={() => openPreview(nextTrainingDay, exs)}
                        style={{
                          width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                          padding: "14px 16px", borderRadius: 11, boxSizing: "border-box",
                          border: `1px solid ${nextTrainingDay.color}44`, background: `${nextTrainingDay.color}0d`,
                          cursor: "pointer", fontFamily: "inherit", textAlign: "left",
                        }}
                      >
                        <div>
                          <div style={{ fontSize: 9, color: nextTrainingDay.color, letterSpacing: 2, textTransform: "uppercase", marginBottom: 3 }}>
                            {nextTrainingDay.day} · Train ahead
                          </div>
                          <div style={{ fontSize: 15, fontWeight: "bold", color: "var(--text)", marginBottom: 2 }}>
                            {nextTrainingDay.focus}
                          </div>
                          <div style={{ fontSize: 11, color: "var(--muted)" }}>
                            {exs.length} exercises · ~{mins} min · tap to customize
                          </div>
                        </div>
                        <span style={{ fontSize: 20, color: nextTrainingDay.color, flexShrink: 0, marginLeft: 12 }}>›</span>
                      </button>
                    </>
                  );
                })()}
              </div>
            );
          })()}
        </div>
      ) : (
        dayExercises.map((ex, idx) => {
          const allDone = [0, 1, 2].every(i => completed[`${todayStr}:${ex.name}-${i}`]);
          const warn = hasCaution(ex);

          return (
            <div
              key={idx}
              onTouchStart={() => isToday && !allDone && startLongPress(ex)}
              onTouchEnd={cancelLongPress}
              onTouchMove={cancelLongPress}
              onClick={() => { if (!lpFired.current) setDemoEx(ex); }}
              style={{
                background: allDone ? "var(--success-surface)" : warn ? "var(--warn-surface)" : "var(--surface)",
                border: `1px solid ${allDone ? "var(--done-border)" : warn ? "#f59e0b44" : "var(--border)"}`,
                borderLeft: `3px solid ${allDone ? "#4ade80" : warn ? "#f59e0b" : dayData?.color || "var(--border)"}`,
                borderRadius: 11, marginBottom: 8, padding: "13px 14px",
                cursor: "pointer", userSelect: "none",
                animation: justCompleted === ex.name ? "completePop 0.5s ease" : "none",
              }}
            >
              {/* Name row */}
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span style={{
                    fontSize: 14, fontWeight: "bold",
                    color: allDone ? "#4ade80" : "var(--text)",
                    textDecoration: allDone ? "line-through" : "none",
                    opacity: allDone ? 0.6 : 1,
                  }}>
                    {ex.name}
                  </span>
                  {warn && !allDone && (
                    <span style={{
                      marginLeft: 7, fontSize: 9, letterSpacing: 1, textTransform: "uppercase",
                      background: "#f59e0b22", border: "1px solid #f59e0b55",
                      borderRadius: 4, padding: "1px 5px", color: "#f59e0b",
                    }}>
                      Modify
                    </span>
                  )}
                </div>

                {/* Set dots — today only */}
                {isToday ? (
                  <div
                    style={{ display: "flex", gap: 5, alignItems: "center", flexShrink: 0 }}
                    onTouchStart={e => e.stopPropagation()}
                    onClick={e => e.stopPropagation()}
                  >
                    {[0, 1, 2].map(i => {
                      const val = completed[`${todayStr}:${ex.name}-${i}`];
                      const done = !!val;
                      const reps = typeof val === "number" ? val : null;
                      return (
                        <div
                          key={i}
                          onClick={() => handleSetTap(ex.name, i)}
                          style={{
                            width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            background: done ? "#4ade8022" : "transparent",
                            border: `2px solid ${done ? "#4ade80" : "var(--border3)"}`,
                            cursor: "pointer",
                            transition: "background 0.15s, border-color 0.15s",
                          }}
                        >
                          {done && (
                            <span style={{ fontSize: reps !== null ? 9 : 9, color: "#4ade80", lineHeight: 1, fontWeight: "bold" }}>
                              {reps !== null ? reps : "✓"}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : allDone ? (
                  <span style={{ fontSize: 15, color: "#4ade80", flexShrink: 0 }}>✓</span>
                ) : null}
              </div>

              {/* Sets badge + notes */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 7 }}>
                <span style={{
                  background: "var(--surface3)", border: "1px solid var(--border3)",
                  borderRadius: 5, padding: "2px 8px",
                  fontSize: 11, fontWeight: "bold", flexShrink: 0,
                  color: warn ? "#f59e0b" : allDone ? "#4ade80" : dayData?.color || "var(--muted)",
                }}>
                  {ex.sets}
                </span>
                <span style={{
                  fontSize: 11, color: "var(--muted)",
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>
                  {ex.notes}
                </span>
              </div>

              {/* Substitute suggestion */}
              {warn && !allDone && ex.substitutes?.length > 0 && (
                <button
                  onClick={e => {
                    e.stopPropagation();
                    const sub = Object.values(ALL_EXERCISES)
                      .flatMap(c => c.exercises)
                      .find(e => e.name === ex.substitutes[0]);
                    if (sub) setDemoEx(sub);
                  }}
                  style={{
                    marginTop: 7, background: "none", border: "none", padding: 0,
                    color: "#f59e0b", fontSize: 11, cursor: "pointer",
                    fontFamily: "inherit", display: "flex", alignItems: "center", gap: 4,
                  }}
                >
                  ↪ Safer option: {ex.substitutes[0]}
                </button>
              )}
            </div>
          );
        })
      )}

      {/* ── Extra Activities ── */}
      <div style={{ marginTop: 20, marginBottom: 4 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div style={{ fontSize: 9, color: "var(--muted3)", letterSpacing: 3, textTransform: "uppercase" }}>
            Extra Activities
          </div>
          <button
            onClick={() => setLogSheetOpen(true)}
            style={{
              display: "flex", alignItems: "center", gap: 5,
              padding: "5px 12px", borderRadius: 20,
              border: "1px solid #10b98144", background: "transparent",
              color: "#10b981", fontSize: 11, fontFamily: "inherit",
              cursor: "pointer", letterSpacing: 0.5,
            }}
          >
            + Log Activity
          </button>
        </div>

        {dayActivities.length === 0 ? (
          <div style={{ fontSize: 11, color: "var(--muted3)", padding: "2px 0 6px" }}>
            Log a walk, run, stretch, or anything extra you did today.
          </div>
        ) : (
          dayActivities.map(a => (
            <div key={a.id} style={{
              background: "var(--surface)", border: "1px solid var(--border)",
              borderLeft: "3px solid #10b981",
              borderRadius: 11, padding: "11px 14px", marginBottom: 8,
              display: "flex", alignItems: "center", gap: 10,
            }}>
              <span style={{ fontSize: 20, flexShrink: 0 }}>{a.emoji}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: "bold", color: "var(--text)" }}>
                  {a.label}
                  {a.value && (
                    <span style={{ fontWeight: "normal", color: "#10b981" }}> · {a.value} {a.unit}</span>
                  )}
                </div>
                {a.note && (
                  <div style={{ fontSize: 11, color: "var(--muted3)", marginTop: 2 }}>{a.note}</div>
                )}
              </div>
              {deleteActivity && (
                <button
                  onClick={() => deleteActivity(a.id)}
                  style={{
                    background: "none", border: "none", color: "var(--muted3)",
                    fontSize: 18, cursor: "pointer", padding: "2px 4px",
                    lineHeight: 1, flexShrink: 0,
                  }}
                >×</button>
              )}
            </div>
          ))
        )}
      </div>

      {/* ── Log Activity Sheet ── */}
      {logSheetOpen && (
        <LogActivitySheet
          date={selectedDayStr}
          onSave={addActivity}
          onClose={() => setLogSheetOpen(false)}
        />
      )}
    </>
  );
}
