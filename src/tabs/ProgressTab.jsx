import { CatIcon } from "../components/CatIcon";
import { categories } from "../data/exercises";
import { weekSchedule, TARGET_WORKOUTS, getWeekDates, formatWeekLabel } from "../data/schedule";

const HISTORY_WEEKS = 4;

export default function ProgressTab({
  streak, missionComplete, workoutsCompleted, missionProgress, missionDay,
  completedWorkoutDates, activeAilments,
  restartMission, setActiveTab,
}) {
  return (
    <>
      {/* Streak cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 14 }}>
        {[
          { label: "Current Streak", value: streak.current, unit: streak.current === 1 ? "day" : "days", color: streak.current > 0 ? "#e85d26" : "var(--muted)" },
          { label: "Best Streak",    value: streak.best,    unit: streak.best === 1 ? "day" : "days",    color: "#8b5cf6" },
          { label: "Total Workouts", value: streak.total,   unit: "done",                                color: "#10b981" },
        ].map((s, i) => (
          <div key={i} style={{ background: "var(--surface)", border: `1px solid ${s.color}33`, borderRadius: 11, padding: "12px 10px", textAlign: "center" }}>
            <div style={{ fontSize: 22, fontWeight: "bold", color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 9, color: "var(--muted)", marginTop: 2, letterSpacing: 0.5 }}>{s.unit}</div>
            <div style={{ fontSize: 9, color: "var(--muted2)", marginTop: 3, letterSpacing: 0.5, textTransform: "uppercase" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Mission card */}
      {missionComplete ? (
        <div style={{
          background: "linear-gradient(135deg, var(--complete-surface), var(--bg))",
          border: "1px solid #4ade8044", borderRadius: 14,
          padding: "20px", marginBottom: 14, textAlign: "center",
        }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>🎖️</div>
          <div style={{ fontSize: 10, color: "#4ade80", letterSpacing: 3, textTransform: "uppercase", marginBottom: 6 }}>Mission Complete</div>
          <div style={{ fontSize: 22, fontWeight: "bold" }}>30-Day Mission</div>
          <div style={{ fontSize: 13, color: "var(--muted3)", marginTop: 4 }}>You completed {workoutsCompleted} workouts.</div>
          <button
            onClick={restartMission}
            style={{
              marginTop: 16, padding: "10px 24px", borderRadius: 20,
              border: "1px solid #4ade80", background: "var(--success-surface2)",
              color: "#4ade80", fontSize: 13, fontFamily: "inherit", cursor: "pointer",
            }}
          >
            Start Mission 2 →
          </button>
        </div>
      ) : (
        <div style={{
          background: "linear-gradient(135deg, var(--mission-surface), var(--bg))",
          border: "1px solid #e85d2644", borderRadius: 14,
          padding: "20px", marginBottom: 14, textAlign: "center",
        }}>
          <div style={{ fontSize: 10, color: "#e85d26", letterSpacing: 3, textTransform: "uppercase", marginBottom: 6 }}>30-Day Mission</div>
          <div style={{ fontSize: 44, fontWeight: "bold" }}>{workoutsCompleted}</div>
          <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>of {TARGET_WORKOUTS} workouts</div>
          <div style={{ marginTop: 14, height: 6, background: "var(--surface3)", borderRadius: 3, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${missionProgress}%`, background: "#e85d26", borderRadius: 3, transition: "width 0.4s ease" }} />
          </div>
          <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 6 }}>
            {missionProgress}% complete · Calendar day {missionDay}
          </div>
        </div>
      )}

      {/* Workout history — 4 weeks */}
      {Array.from({ length: HISTORY_WEEKS }, (_, w) => {
        const dates = getWeekDates(w);
        const label = w === 0 ? "This Week" : formatWeekLabel(dates);
        const weekDone = weekSchedule.filter((d, i) => d.cats.length > 0 && completedWorkoutDates.includes(dates[i])).length;
        const weekTotal = weekSchedule.filter(d => d.cats.length > 0).length;
        return (
          <div key={w} style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <div style={{ fontSize: 10, color: "var(--muted)", letterSpacing: 3, textTransform: "uppercase" }}>{label}</div>
              {weekDone > 0 && (
                <div style={{ fontSize: 10, color: "#e85d26", letterSpacing: 1 }}>{weekDone}/{weekTotal} workouts</div>
              )}
            </div>
            <div style={{ display: "flex", gap: 5 }}>
              {weekSchedule.map((d, i) => {
                const dateStr = dates[i];
                const isDone = completedWorkoutDates.includes(dateStr);
                const isRest = d.cats.length === 0;
                return (
                  <div key={d.day} style={{
                    flex: 1, textAlign: "center", background: "var(--surface)",
                    border: `1px solid ${isDone ? d.color + "66" : isRest ? "var(--border-subtle)" : "var(--border)"}`,
                    borderRadius: 9, padding: "9px 0",
                  }}>
                    <div style={{ fontSize: 9, color: isDone ? d.color : "var(--muted)", letterSpacing: 1 }}>{d.day}</div>
                    <div style={{ fontSize: 16, marginTop: 5 }}>
                      {isRest ? "😴" : isDone ? "✅" : "⬜"}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Library stats */}
      <div style={{ fontSize: 10, color: "var(--muted)", letterSpacing: 3, textTransform: "uppercase", marginBottom: 10 }}>Exercise Library</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 18 }}>
        {categories.map(cat => (
          <div key={cat.key} style={{ background: "var(--surface)", border: `1px solid ${cat.color}33`, borderRadius: 11, padding: "14px", textAlign: "center" }}>
            <div style={{ display: "flex", justifyContent: "center" }}><CatIcon icon={cat.icon} size={20} color={cat.color} /></div>
            <div style={{ fontSize: 22, fontWeight: "bold", color: cat.color, marginTop: 4 }}>{cat.exercises.length}</div>
            <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 3 }}>{cat.label}</div>
          </div>
        ))}
      </div>

      {/* Milestones */}
      <div style={{ fontSize: 10, color: "var(--muted)", letterSpacing: 3, textTransform: "uppercase", marginBottom: 10 }}>Milestones</div>
      {[
        { week: "Week 1–2", goal: "Build the habit, muscles adapt", icon: "🌱" },
        { week: "Week 3",   goal: "Noticeable strength in push-ups & squats", icon: "💪" },
        { week: "Week 4",   goal: "Core stronger, posture visibly improved", icon: "🎯" },
      ].map((m, i) => (
        <div key={i} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 11, padding: "13px 15px", marginBottom: 8, display: "flex", alignItems: "center", gap: 13 }}>
          <span style={{ fontSize: 26 }}>{m.icon}</span>
          <div>
            <div style={{ fontSize: 12, color: "#e85d26", marginBottom: 3, letterSpacing: 1 }}>{m.week}</div>
            <div style={{ fontSize: 13 }}>{m.goal}</div>
          </div>
        </div>
      ))}

      {/* Active ailment modifications */}
      {activeAilments.length > 0 && (
        <>
          <div style={{ fontSize: 10, color: "var(--muted)", letterSpacing: 3, textTransform: "uppercase", marginBottom: 10, marginTop: 18 }}>Your Modifications</div>
          {activeAilments.map((a) => (
            <div key={a.key} style={{ background: "var(--surface)", border: "1px solid var(--caution-border)", borderRadius: 11, padding: "12px 15px", marginBottom: 8, display: "flex", gap: 12, alignItems: "center" }}>
              <span style={{ fontSize: 20 }}>⚠️</span>
              <div>
                <div style={{ fontSize: 12, color: "#f59e0b", marginBottom: 3 }}>{a.label}</div>
                <div style={{ fontSize: 12, color: "var(--muted3)" }}>{a.note}</div>
              </div>
            </div>
          ))}
        </>
      )}

      {activeAilments.length === 0 && (
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 11, padding: "16px", marginTop: 18, textAlign: "center", color: "var(--muted2)", fontSize: 12 }}>
          No modifications set.{" "}
          <span onClick={() => setActiveTab("settings")} style={{ color: "#e85d26", cursor: "pointer" }}>
            Add ailments in Settings →
          </span>
        </div>
      )}
    </>
  );
}
