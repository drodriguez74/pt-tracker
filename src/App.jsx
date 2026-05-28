import { useState, useEffect, useCallback, useRef } from "react";
import { FiSun, FiMoon, FiBook, FiCalendar, FiTrendingUp, FiSettings, FiMessageSquare } from "react-icons/fi";
import { useWorkoutSession } from "./workout/useWorkoutSession";
import ActiveWorkoutView from "./workout/ActiveWorkoutView";
import ExerciseDemoModal from "./components/ExerciseDemoModal";
import Toast from "./components/Toast";
import CoachChat from "./components/CoachChat";
import LibraryTab from "./tabs/LibraryTab";
import ScheduleTab from "./tabs/ScheduleTab";
import ProgressTab from "./tabs/ProgressTab";
import SettingsTab from "./tabs/SettingsTab";
import { ALL_EXERCISES, AILMENTS, exerciseCategoryMap } from "./data/exercises";
import {
  weekSchedule, DAY_ABBRS, AGE_RANGES, TARGET_WORKOUTS,
  DEFAULT_PREFS, PROGRESSION, calcStreak,
} from "./data/schedule";

// ─── Storage helpers ──────────────────────────────────────────────────────────

function loadStorage(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v !== null ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
}

function migrateCompleted(raw) {
  const today = new Date().toISOString().split("T")[0];
  const migrated = {};
  let changed = false;
  for (const [key, val] of Object.entries(raw)) {
    if (!/^\d{4}-\d{2}-\d{2}:/.test(key)) {
      migrated[`${today}:${key}`] = val;
      changed = true;
    } else {
      migrated[key] = val;
    }
  }
  if (changed) localStorage.setItem("pt-completed", JSON.stringify(migrated));
  return migrated;
}

const totalExercises = Object.values(ALL_EXERCISES).reduce((sum, cat) => sum + cat.exercises.length, 0);

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [theme, setTheme] = useState(() => {
    const t = loadStorage("pt-theme", "dark");
    document.documentElement.setAttribute("data-theme", t);
    return t;
  });
  const [onboarded, setOnboarded] = useState(() =>
    localStorage.getItem("pt-onboarded") === "true" ||
    localStorage.getItem("pt-mission-start") !== null
  );
  const [onboardStep, setOnboardStep] = useState(0);
  const [activeTab, setActiveTab] = useState("schedule");
  const [selectedCat, setSelectedCat] = useState("pushVariations");
  const [selectedDay, setSelectedDay] = useState(() => DAY_ABBRS[new Date().getDay()]);
  const [demoEx, setDemoEx] = useState(null);
  const [search, setSearch] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [completed, setCompleted] = useState(() => migrateCompleted(loadStorage("pt-completed", {})));
  const [prefs, setPrefs] = useState(() => loadStorage("pt-prefs", DEFAULT_PREFS));
  const [missionStartDate, setMissionStartDate] = useState(() =>
    localStorage.getItem("pt-mission-start")
  );
  const [completedWorkoutDates, setCompletedWorkoutDates] = useState(() =>
    loadStorage("pt-completed-dates", [])
  );
  const [toast, setToast] = useState(null);
  const [coachOpen, setCoachOpen] = useState(false);
  const prevStreakRef = useRef(null);

  // ── Workout session ────────────────────────────────────────────────────────

  const handleWorkoutComplete = useCallback((finishedSession) => {
    const today = new Date().toISOString().split("T")[0];
    finishedSession.exercises.forEach((ex, exIdx) => {
      const wasSkipped = finishedSession.skipped.includes(ex.name);
      const setsCompleted = wasSkipped ? 0
        : exIdx < finishedSession.exerciseIdx ? 3
        : exIdx === finishedSession.exerciseIdx ? finishedSession.setIdx
        : 0;
      for (let i = 0; i < setsCompleted; i++) {
        const k = `${today}:${ex.name}-${i}`;
        const reps = finishedSession.repLog?.[`${exIdx}-${i}`] ?? true;
        setCompleted(p => ({ ...p, [k]: reps }));
      }
    });
    if (!completedWorkoutDates.includes(today)) {
      setCompletedWorkoutDates(prev => [...prev, today]);
    }
  }, [completedWorkoutDates]); // eslint-disable-line react-hooks/exhaustive-deps

  const { session, startWorkout, completeSet, skipExercise, skipRest, endWorkout } = useWorkoutSession({
    onComplete: handleWorkoutComplete,
    restSeconds: prefs.restDuration ?? 60,
  });

  // ── Computed values ────────────────────────────────────────────────────────

  const todayStr = new Date().toISOString().split("T")[0];

  const missionDay = missionStartDate
    ? Math.max(1, Math.floor((Date.now() - new Date(missionStartDate).getTime()) / 86400000) + 1)
    : 1;
  const weekNumber = Math.floor((missionDay - 1) / 7);

  const getRotatedExercises = (catKey, count) => {
    const exs = ALL_EXERCISES[catKey]?.exercises || [];
    if (!exs.length) return [];
    const earlyWeeks = weekNumber <= 1;
    const preferred = exs.filter(e => earlyWeeks ? e.difficulty === "beginner" : e.difficulty !== "beginner");
    const fallback  = exs.filter(e => earlyWeeks ? e.difficulty !== "beginner" : e.difficulty === "beginner");
    const pool = preferred.length >= count ? preferred : [...preferred, ...fallback];
    const offset = (weekNumber * count) % pool.length;
    return [...pool.slice(offset), ...pool.slice(0, offset)].slice(0, count);
  };

  const getDayExercises = useCallback((dayAbbr, weekOffset = 0) => {
    const data = weekSchedule.find(d => d.day === dayAbbr);
    if (!data?.cats?.length) return [];
    const wkNum = weekNumber + weekOffset;
    return data.cats.flatMap((ck, ci) => {
      const count = data.catCounts?.[ci] ?? 3;
      const exs = ALL_EXERCISES[ck]?.exercises || [];
      if (!exs.length) return [];
      const earlyWeeks = wkNum <= 1;
      const preferred = exs.filter(e => earlyWeeks ? e.difficulty === "beginner" : e.difficulty !== "beginner");
      const fallback   = exs.filter(e => earlyWeeks ? e.difficulty !== "beginner" : e.difficulty === "beginner");
      const pool = preferred.length >= count ? preferred : [...preferred, ...fallback];
      const offset = (wkNum * count) % pool.length;
      return [...pool.slice(offset), ...pool.slice(0, offset)].slice(0, count);
    });
  }, [weekNumber]); // eslint-disable-line react-hooks/exhaustive-deps

  const dayData = weekSchedule.find(d => d.day === selectedDay);
  const dayExercises = dayData?.cats.flatMap((ck, ci) =>
    getRotatedExercises(ck, dayData.catCounts?.[ci] ?? 3)
  ) || [];

  const dayDone = dayExercises.filter(e =>
    [0, 1, 2].every(i => completed[`${todayStr}:${e.name}-${i}`])
  ).length;

  // ── Persistence effects ────────────────────────────────────────────────────

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("pt-theme", theme);
  }, [theme]);

  useEffect(() => { localStorage.setItem("pt-completed", JSON.stringify(completed)); }, [completed]);
  useEffect(() => { localStorage.setItem("pt-prefs", JSON.stringify(prefs)); }, [prefs]);
  useEffect(() => { localStorage.setItem("pt-completed-dates", JSON.stringify(completedWorkoutDates)); }, [completedWorkoutDates]);

  useEffect(() => {
    if (dayExercises.length > 0 && dayDone === dayExercises.length) {
      const todayAbbr = DAY_ABBRS[new Date().getDay()];
      if (selectedDay === todayAbbr && !completedWorkoutDates.includes(todayStr)) {
        setCompletedWorkoutDates(prev => [...prev, todayStr]);
      }
    }
  }, [completed, selectedDay, completedWorkoutDates, todayStr]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Handlers ──────────────────────────────────────────────────────────────

  const toggleSet = (name, i) => {
    const k = `${todayStr}:${name}-${i}`;
    setCompleted(p => ({ ...p, [k]: !p[k] }));
  };

  const completeAllSets = (name) => {
    setCompleted(p => {
      const next = { ...p };
      for (let i = 0; i < 3; i++) next[`${todayStr}:${name}-${i}`] = true;
      return next;
    });
    navigator.vibrate?.([20, 50, 20]);
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

  const completeOnboarding = () => {
    const today = new Date().toISOString().split("T")[0];
    localStorage.setItem("pt-mission-start", today);
    localStorage.setItem("pt-onboarded", "true");
    setMissionStartDate(today);
    setOnboarded(true);
    setActiveTab("schedule");
  };

  const resetProgress = () => {
    setCompleted({});
    setCompletedWorkoutDates([]);
  };

  const restartMission = () => {
    const today = new Date().toISOString().split("T")[0];
    localStorage.setItem("pt-mission-start", today);
    setMissionStartDate(today);
    setCompleted({});
    setCompletedWorkoutDates([]);
  };

  // ── Derived display values ─────────────────────────────────────────────────

  const weekProg = PROGRESSION[Math.min(weekNumber, 3)];

  const filteredExercises = (() => {
    const base = search.length > 1
      ? Object.values(ALL_EXERCISES).flatMap(c => c.exercises).filter(e =>
          e.name.toLowerCase().includes(search.toLowerCase()) ||
          e.notes.toLowerCase().includes(search.toLowerCase())
        )
      : ALL_EXERCISES[selectedCat]?.exercises || [];
    return difficultyFilter === "all" ? base : base.filter(e => e.difficulty === difficultyFilter);
  })();

  const workoutsCompleted = completedWorkoutDates.length;
  const missionProgress = Math.min(Math.round((workoutsCompleted / TARGET_WORKOUTS) * 100), 100);
  const missionComplete = workoutsCompleted >= TARGET_WORKOUTS;
  const streak = calcStreak(completedWorkoutDates);
  const activeAilments = AILMENTS.filter(a => prefs.ailments.includes(a.key));

  useEffect(() => {
    const prev = prevStreakRef.current;
    if (prev !== null && streak.current > prev) {
      const milestones = [3, 7, 14, 30];
      if (milestones.includes(streak.current)) {
        setToast(`${streak.current}-day streak! Keep it up.`);
      }
    }
    prevStreakRef.current = streak.current;
  }, [streak.current]); // eslint-disable-line react-hooks/exhaustive-deps

  const inputStyle = {
    width: "100%", boxSizing: "border-box",
    background: "var(--surface0)", border: "1px solid var(--border2)",
    borderRadius: 10, padding: "10px 14px",
    color: "var(--text)", fontSize: 14, fontFamily: "inherit", outline: "none",
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  // ── Onboarding overlay ─────────────────────────────────────────────────────
  if (!onboarded) {
    const stepDots = (
      <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 32 }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: i === onboardStep ? 20 : 6, height: 6, borderRadius: 3,
            background: i === onboardStep ? "#e85d26" : "var(--border2)",
            transition: "width 0.3s ease",
          }} />
        ))}
      </div>
    );

    return (
      <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text)", fontFamily: "'Barlow Condensed', sans-serif", maxWidth: 480, margin: "0 auto", display: "flex", flexDirection: "column", padding: "48px 24px 40px" }}>

        {/* Step 0 — Welcome */}
        {onboardStep === 0 && (
          <>
            <div style={{ flex: 1 }}>
              <div style={{ textAlign: "center", marginBottom: 36 }}>
                <div style={{ fontSize: 52, marginBottom: 14 }}>🪖</div>
                <div style={{ fontSize: 10, letterSpacing: 5, color: "#e85d26", textTransform: "uppercase", marginBottom: 10 }}>Operation Fit</div>
                <div style={{ fontSize: 26, fontWeight: "bold", lineHeight: 1.2, marginBottom: 12 }}>Military-Style Calisthenics</div>
                <div style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.6 }}>
                  Low-impact. Consistent. Built for the long game.<br />
                  3 sets of 10. No gym required.
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 10, letterSpacing: 2, color: "var(--muted)", textTransform: "uppercase", marginBottom: 8 }}>Your name (optional)</div>
                <input
                  value={prefs.name}
                  onChange={e => setPrefs(p => ({ ...p, name: e.target.value }))}
                  placeholder="Enter name"
                  style={{ width: "100%", boxSizing: "border-box", background: "var(--surface0)", border: "1px solid var(--border2)", borderRadius: 10, padding: "12px 14px", color: "var(--text)", fontSize: 15, fontFamily: "inherit", outline: "none" }}
                />
              </div>

              <div>
                <div style={{ fontSize: 10, letterSpacing: 2, color: "var(--muted)", textTransform: "uppercase", marginBottom: 10 }}>Age range</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {AGE_RANGES.map(range => {
                    const active = prefs.ageRange === range;
                    return (
                      <button key={range} onClick={() => setPrefs(p => ({ ...p, ageRange: active ? "" : range }))} style={{
                        padding: "9px 18px", borderRadius: 20, border: "1px solid",
                        borderColor: active ? "#e85d26" : "var(--border2)",
                        background: active ? "#e85d2622" : "transparent",
                        color: active ? "#e85d26" : "var(--muted)",
                        fontSize: 14, fontFamily: "inherit", cursor: "pointer",
                      }}>{range}</button>
                    );
                  })}
                </div>
              </div>
            </div>

            {stepDots}
            <button onClick={() => setOnboardStep(1)} style={{
              width: "100%", padding: "15px", borderRadius: 12,
              border: "none", background: "#e85d26",
              color: "#fff", fontSize: 15, fontWeight: "bold",
              fontFamily: "inherit", cursor: "pointer", letterSpacing: 1,
            }}>Continue →</button>
          </>
        )}

        {/* Step 1 — Physical Limitations */}
        {onboardStep === 1 && (
          <>
            <div style={{ flex: 1 }}>
              <div style={{ marginBottom: 28 }}>
                <div style={{ fontSize: 10, letterSpacing: 4, color: "#e85d26", textTransform: "uppercase", marginBottom: 10 }}>Step 2 of 3</div>
                <div style={{ fontSize: 22, fontWeight: "bold", marginBottom: 8 }}>Any Physical Limitations?</div>
                <div style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.6 }}>
                  Exercises that match your selections will show a <span style={{ color: "#f59e0b" }}>Modify</span> badge so you can adapt safely. You can always update this in Settings.
                </div>
              </div>

              {AILMENTS.map(a => {
                const active = prefs.ailments.includes(a.key);
                return (
                  <div key={a.key} onClick={() => toggleAilment(a.key)} style={{
                    background: active ? "var(--warn-surface)" : "var(--surface)",
                    border: `1px solid ${active ? "#f59e0b66" : "var(--border)"}`,
                    borderRadius: 11, padding: "13px 15px", marginBottom: 8,
                    display: "flex", alignItems: "center", gap: 13, cursor: "pointer",
                  }}>
                    <div style={{
                      width: 20, height: 20, borderRadius: 6, flexShrink: 0,
                      border: `2px solid ${active ? "#f59e0b" : "var(--border3)"}`,
                      background: active ? "#f59e0b" : "transparent",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      {active && <span style={{ fontSize: 11, color: "#000", fontWeight: "bold" }}>✓</span>}
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: "bold", color: active ? "#f59e0b" : "var(--text)", marginBottom: 2 }}>{a.label}</div>
                      <div style={{ fontSize: 11, color: "var(--muted)" }}>{a.note}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {stepDots}
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setOnboardStep(2)} style={{
                flex: 1, padding: "15px", borderRadius: 12, border: "1px solid var(--border2)",
                background: "transparent", color: "var(--muted)", fontSize: 14,
                fontFamily: "inherit", cursor: "pointer",
              }}>Skip</button>
              <button onClick={() => setOnboardStep(2)} style={{
                flex: 2, padding: "15px", borderRadius: 12,
                border: "none", background: "#e85d26",
                color: "#fff", fontSize: 15, fontWeight: "bold",
                fontFamily: "inherit", cursor: "pointer", letterSpacing: 1,
              }}>Continue →</button>
            </div>
          </>
        )}

        {/* Step 2 — Mission Brief */}
        {onboardStep === 2 && (
          <>
            <div style={{ flex: 1 }}>
              <div style={{ textAlign: "center", marginBottom: 32 }}>
                <div style={{ fontSize: 48, marginBottom: 14 }}>🎖️</div>
                <div style={{ fontSize: 10, letterSpacing: 4, color: "#e85d26", textTransform: "uppercase", marginBottom: 10 }}>Step 3 of 3</div>
                <div style={{ fontSize: 24, fontWeight: "bold", marginBottom: 10 }}>Your 30-Day Mission</div>
                <div style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.7 }}>
                  Complete <strong style={{ color: "var(--text)" }}>20 workouts</strong> in 30 days.<br />
                  3 sets of 10. Low impact. Every rep counts.
                </div>
              </div>

              {[
                { week: "Week 1–2", goal: "Build the habit. Muscles begin to adapt.", icon: "🌱" },
                { week: "Week 3", goal: "Noticeable strength in push-ups and squats.", icon: "💪" },
                { week: "Week 4", goal: "Core stronger. Posture visibly improved.", icon: "🎯" },
              ].map((m, i) => (
                <div key={i} style={{
                  background: "var(--surface)", border: "1px solid var(--border)",
                  borderRadius: 11, padding: "14px 16px", marginBottom: 8,
                  display: "flex", alignItems: "center", gap: 14,
                }}>
                  <span style={{ fontSize: 24 }}>{m.icon}</span>
                  <div>
                    <div style={{ fontSize: 11, color: "#e85d26", letterSpacing: 1, marginBottom: 3 }}>{m.week}</div>
                    <div style={{ fontSize: 13, color: "var(--text)" }}>{m.goal}</div>
                  </div>
                </div>
              ))}

              <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 11, padding: "14px 16px", marginTop: 8 }}>
                <div style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.6 }}>
                  📅 Your schedule focuses on <strong style={{ color: "var(--text)" }}>Upper, Core/Lower, and Full Body</strong> days with built-in rest. Warm-ups are included.
                </div>
              </div>
            </div>

            {stepDots}
            <button onClick={completeOnboarding} style={{
              width: "100%", padding: "16px", borderRadius: 12,
              border: "none", background: "#e85d26",
              color: "#fff", fontSize: 16, fontWeight: "bold",
              fontFamily: "inherit", cursor: "pointer", letterSpacing: 1,
            }}>🪖 Begin Mission</button>
          </>
        )}
      </div>
    );
  }

  // ── Active workout full-screen takeover ────────────────────────────────────
  if (session.phase !== "idle") {
    return (
      <ActiveWorkoutView
        session={session}
        dayData={weekSchedule.find(d => d.day === selectedDay)}
        onCompleteSet={completeSet}
        onSkipExercise={skipExercise}
        onSkipRest={skipRest}
        onEnd={endWorkout}
      />
    );
  }

  return (
    <div className="app-shell" style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text)", fontFamily: "'Barlow Condensed', sans-serif", maxWidth: 480, margin: "0 auto" }}>

      {/* ── Header ── */}
      <div style={{ background: "var(--header-bg)", borderBottom: "1px solid var(--border)", padding: "14px var(--content-px)", position: "sticky", top: 0, zIndex: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            {prefs.name && (
              <div style={{ fontSize: 9, letterSpacing: 4, color: "#e85d26", textTransform: "uppercase", marginBottom: 2 }}>
                🪖 {prefs.name}
              </div>
            )}
            <div style={{ fontSize: 20, fontWeight: "bold", letterSpacing: -0.3, lineHeight: 1 }}>Military Calisthenics</div>
          </div>
          <button
            onClick={() => setTheme(t => t === "dark" ? "light" : "dark")}
            style={{
              background: "var(--surface2)", border: "1px solid var(--border2)",
              borderRadius: 10, width: 36, height: 36, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "var(--muted)", flexShrink: 0,
            }}
          >{theme === "dark" ? <FiSun size={16} /> : <FiMoon size={16} />}</button>
        </div>
      </div>

      <div style={{ padding: "14px var(--content-px) 88px" }}>
        {activeTab === "library" && (
          <LibraryTab
            search={search} setSearch={setSearch}
            difficultyFilter={difficultyFilter} setDifficultyFilter={setDifficultyFilter}
            selectedCat={selectedCat} setSelectedCat={setSelectedCat}
            setDemoEx={setDemoEx}
            hasCaution={hasCaution}
            filteredExercises={filteredExercises}
            inputStyle={inputStyle}
          />
        )}
        {activeTab === "schedule" && (
          <ScheduleTab
            selectedDay={selectedDay} setSelectedDay={setSelectedDay}
            dayData={dayData} dayExercises={dayExercises} dayDone={dayDone}
            todayStr={todayStr} completed={completed}
            missionStartDate={missionStartDate} weekProg={weekProg}
            hasCaution={hasCaution} toggleSet={toggleSet}
            completeAllSets={completeAllSets}
            startWorkout={startWorkout} setDemoEx={setDemoEx}
            prefs={prefs}
            completedWorkoutDates={completedWorkoutDates}
            getDayExercises={getDayExercises}
          />
        )}
        {activeTab === "progress" && (
          <ProgressTab
            streak={streak}
            missionComplete={missionComplete}
            workoutsCompleted={workoutsCompleted}
            missionProgress={missionProgress}
            missionDay={missionDay}
            weekNumber={weekNumber}
            completedWorkoutDates={completedWorkoutDates}
            activeAilments={activeAilments}
            prefs={prefs}
            restartMission={restartMission}
            setActiveTab={setActiveTab}
          />
        )}
        {activeTab === "settings" && (
          <SettingsTab
            prefs={prefs} setPrefs={setPrefs}
            toggleAilment={toggleAilment}
            restartMission={restartMission}
            resetProgress={resetProgress}
            inputStyle={inputStyle}
          />
        )}
      </div>

      {/* ── Bottom Nav ── */}
      <nav style={{
        position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
        width: "100%", maxWidth: 480,
        background: "var(--header-bg)", borderTop: "1px solid var(--border)",
        display: "flex", zIndex: 50,
        paddingBottom: "max(8px, env(safe-area-inset-bottom))",
      }}>
        {[
          { key: "library",  label: "Library",  Icon: FiBook },
          { key: "schedule", label: "Today",    Icon: FiCalendar },
          { key: "progress", label: "Progress", Icon: FiTrendingUp },
          { key: "settings", label: "Settings", Icon: FiSettings },
        ].map(({ key, label, Icon }) => {
          const active = activeTab === key;
          return (
            <button key={key} onClick={() => setActiveTab(key)} style={{
              flex: 1, display: "flex", flexDirection: "column",
              alignItems: "center", gap: 3, background: "none", border: "none",
              cursor: "pointer", padding: "10px 0 6px", fontFamily: "inherit",
              position: "relative", outline: "none",
            }}>
              <div style={{
                position: "absolute", top: 0, left: "25%", right: "25%",
                height: 2, borderRadius: "0 0 2px 2px",
                background: active ? "#e85d26" : "transparent",
                transition: "background 0.2s",
              }} />
              <Icon size={20} color={active ? "#e85d26" : "var(--muted)"} />
              <span style={{
                fontSize: 9, letterSpacing: 0.5, textTransform: "uppercase",
                color: active ? "#e85d26" : "var(--muted)",
                fontFamily: "inherit",
              }}>{label}</span>
            </button>
          );
        })}
      </nav>

      {/* Exercise demo modal */}
      <ExerciseDemoModal demoEx={demoEx} setDemoEx={setDemoEx} prefs={prefs} AILMENTS={AILMENTS} />

      {/* Toast */}
      {toast && <Toast message={toast} onDone={() => setToast(null)} />}

      {/* ── AI Coach FAB ── */}
      <div style={{
        position: "fixed", bottom: 76, left: "50%", transform: "translateX(-50%)",
        width: "100%", maxWidth: 480, pointerEvents: "none", zIndex: 60,
      }}>
        <button
          onClick={() => setCoachOpen(true)}
          style={{
            position: "absolute", right: 18, bottom: 0,
            width: 52, height: 52, borderRadius: "50%",
            background: "#e85d26", border: "none",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 20px #e85d2666", cursor: "pointer",
            pointerEvents: "auto",
          }}
        >
          <FiMessageSquare size={22} color="#fff" />
        </button>
      </div>

      {/* ── AI Coach Chat ── */}
      <CoachChat
        isOpen={coachOpen}
        onClose={() => setCoachOpen(false)}
        prefs={prefs}
        missionDay={missionDay}
        weekNumber={weekNumber}
        streak={streak}
        dayData={dayData}
        dayExercises={dayExercises}
        completed={completed}
        completedWorkoutDates={completedWorkoutDates}
        AILMENTS={AILMENTS}
      />
    </div>
  );
}
