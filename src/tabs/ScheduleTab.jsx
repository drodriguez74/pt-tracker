import { useRef } from "react";
import { GiMeditation } from "react-icons/gi";
import { ALL_EXERCISES, WARMUP_PRESETS } from "../data/exercises";
import { weekSchedule, DAY_ABBRS } from "../data/schedule";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default function ScheduleTab({
  selectedDay, setSelectedDay,
  dayData, dayExercises, dayDone,
  todayStr, completed, expanded, setExpanded,
  missionStartDate, weekProg,
  hasCaution, toggleSet, completeAllSets, startWorkout, setDemoEx,
  prefs,
}) {
  const isToday = selectedDay === DAY_ABBRS[new Date().getDay()];
  const lpTimer = useRef(null);
  const lpFired = useRef(false);

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

  return (
    <>
      {/* Day selector */}
      <div style={{ display: "flex", gap: 5, marginBottom: 16, overflowX: "auto", paddingBottom: 4 }}>
        {weekSchedule.map(d => (
          <button key={d.day} onClick={() => setSelectedDay(d.day)} style={{
            minWidth: 50, padding: "9px 4px", borderRadius: 9, border: "1px solid",
            borderColor: selectedDay === d.day ? d.color : "var(--border)",
            background: selectedDay === d.day ? d.color : "var(--surface)",
            color: selectedDay === d.day ? "#fff" : "var(--muted)",
            fontSize: 10, fontFamily: "inherit", cursor: "pointer", textTransform: "uppercase", letterSpacing: 1,
          }}>
            <div style={{ fontWeight: "bold" }}>{d.day}</div>
            <div style={{ fontSize: 8, marginTop: 3, opacity: 0.8 }}>{d.focus.split(" ")[0]}</div>
          </button>
        ))}
      </div>

      {/* Personalized greeting — today only */}
      {isToday && dayExercises.length > 0 && (
        <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 10, letterSpacing: 0.3 }}>
          {getGreeting()}{prefs?.name ? `, ${prefs.name}` : ""}. Today is{" "}
          <span style={{ color: dayData?.color, fontWeight: "bold" }}>{dayData?.focus}</span>
          {missionStartDate && weekProg && (
            <span> · <span style={{ color: "var(--muted2)" }}>{weekProg.label}</span></span>
          )}.
        </div>
      )}

      {/* Day header */}
      <div style={{
        background: "var(--surface)", border: `1px solid ${dayData?.color || "var(--border)"}`,
        borderRadius: 13, padding: "15px 17px", marginBottom: 12,
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <div>
          <div style={{ fontSize: 10, color: "var(--muted)", letterSpacing: 2, textTransform: "uppercase" }}>{selectedDay}</div>
          <div style={{ fontSize: 19, fontWeight: "bold", color: dayData?.color }}>{dayData?.focus}</div>
          {dayExercises.length > 0 && (
            <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>
              {dayData?.cats.map(ck => ALL_EXERCISES[ck]?.label).join(" · ")}
            </div>
          )}
        </div>
        {dayExercises.length > 0 && (
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 26, fontWeight: "bold", color: dayData?.color }}>{dayDone}</div>
            <div style={{ fontSize: 10, color: "var(--muted)" }}>of {dayExercises.length}</div>
          </div>
        )}
      </div>

      {/* Start Workout button — today's training days only */}
      {dayExercises.length > 0 && isToday && (
        <button
          onClick={() => startWorkout(dayExercises)}
          style={{
            width: "100%", padding: "16px", borderRadius: 13, border: "none",
            background: dayDone === dayExercises.length ? "var(--surface2)" : "#e85d26",
            color: dayDone === dayExercises.length ? "var(--muted)" : "#fff",
            fontSize: 15, fontWeight: "bold", letterSpacing: 1,
            fontFamily: "inherit", cursor: "pointer", marginBottom: 12,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}
        >
          {dayDone === dayExercises.length ? "✓ Workout Complete" : dayDone > 0 ? "▶ Continue Workout" : "▶ Start Workout"}
        </button>
      )}

      {/* Progression banner */}
      {missionStartDate && dayExercises.length > 0 && (
        <div style={{
          background: "var(--mission-surface)", border: "1px solid #e85d2633",
          borderRadius: 10, padding: "10px 14px", marginBottom: 10,
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <div>
            <div style={{ fontSize: 9, color: "#e85d26", letterSpacing: 2, textTransform: "uppercase", marginBottom: 2 }}>{weekProg.label} · {weekProg.sub}</div>
            <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 1 }}>{weekProg.note}</div>
          </div>
          <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 12 }}>
            <div style={{ fontSize: 20, fontWeight: "bold", color: "#e85d26", lineHeight: 1 }}>{weekProg.sets}×{weekProg.reps}</div>
            <div style={{ fontSize: 9, color: "var(--muted)", letterSpacing: 0.5 }}>target</div>
          </div>
        </div>
      )}

      {/* Warm-up callout */}
      {dayData?.warmup && WARMUP_PRESETS[dayData.warmup] && (
        <div style={{
          background: "var(--info-surface)", border: "1px solid #10b98133",
          borderRadius: 10, padding: "10px 14px", marginBottom: 12,
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <GiMeditation size={20} color="#10b981" />
          <div>
            <div style={{ fontSize: 10, color: "#10b981", letterSpacing: 2, textTransform: "uppercase", marginBottom: 2 }}>Warm-up first — 2–3 min</div>
            <div style={{ fontSize: 11, color: "var(--muted3)" }}>{WARMUP_PRESETS[dayData.warmup]}</div>
          </div>
        </div>
      )}

      {/* Long-press hint — today only */}
      {isToday && dayExercises.length > 0 && dayDone < dayExercises.length && (
        <div style={{ fontSize: 10, color: "var(--muted3)", textAlign: "center", marginBottom: 10, letterSpacing: 0.5 }}>
          Hold an exercise card to mark all 3 sets complete
        </div>
      )}

      {/* Exercise list or rest day */}
      {dayExercises.length === 0 ? (
        <div style={{ textAlign: "center", padding: "48px 20px", color: "var(--muted3)" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>😴</div>
          <div style={{ fontSize: 17 }}>Rest Day</div>
          <div style={{ fontSize: 12, marginTop: 6, color: "var(--muted2)" }}>Light walk or 10 min mobility recommended.</div>
        </div>
      ) : (
        dayExercises.map((ex, idx) => {
          const allDone = [0, 1, 2].every(i => completed[`${todayStr}:${ex.name}-${i}`]);
          const isExp = expanded === ex.name;
          const warn = hasCaution(ex);
          return (
            <div
              key={idx}
              onTouchStart={() => isToday && !allDone && startLongPress(ex)}
              onTouchEnd={cancelLongPress}
              onTouchMove={cancelLongPress}
              style={{
                background: allDone ? "var(--success-surface)" : warn ? "var(--warn-surface)" : "var(--surface)",
                border: `1px solid ${allDone ? "var(--done-border)" : warn ? "#f59e0b44" : "var(--border)"}`,
                borderRadius: 11, marginBottom: 8, overflow: "hidden",
                userSelect: "none",
              }}
            >
              <div onClick={() => { if (!lpFired.current) setExpanded(isExp ? null : ex.name); }} style={{
                padding: "13px 15px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer",
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 3 }}>
                    <span style={{
                      fontSize: 14, fontWeight: "bold",
                      color: allDone ? "#4ade80" : "var(--text)",
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
                  <div style={{ fontSize: 11, color: "var(--muted)" }}>{ex.sets} · {ex.notes}</div>
                  {warn && !allDone && ex.substitutes?.length > 0 && (
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        const sub = Object.values(ALL_EXERCISES).flatMap(c => c.exercises).find(e => e.name === ex.substitutes[0]);
                        if (sub) setDemoEx(sub);
                      }}
                      style={{
                        marginTop: 6, background: "none", border: "none", padding: 0,
                        color: "#f59e0b", fontSize: 11, cursor: "pointer", fontFamily: "inherit",
                        display: "flex", alignItems: "center", gap: 4,
                      }}
                    >
                      ↪ Safer option: {ex.substitutes[0]}
                    </button>
                  )}
                </div>
                <button
                  onClick={e => { e.stopPropagation(); setDemoEx(ex); }}
                  title="How to perform"
                  style={{
                    background: "none", border: "1px solid var(--border2)", borderRadius: 7,
                    width: 28, height: 28, color: "var(--muted)", fontSize: 13,
                    cursor: "pointer", flexShrink: 0, fontFamily: "inherit",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >ⓘ</button>
                <div style={{ fontSize: 16, color: allDone ? "#4ade80" : "var(--border3)" }}>
                  {allDone ? "✓" : isExp ? "▲" : "▼"}
                </div>
              </div>
              {isExp && (
                <div style={{ padding: "0 15px 13px", borderTop: "1px solid var(--border-subtle)", paddingTop: 12 }}>
                  <div style={{ fontSize: 10, color: "var(--muted)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>Log Sets</div>
                  <div style={{ display: "flex", gap: 8 }}>
                    {[1, 2, 3].map((s, i) => {
                      const done = completed[`${todayStr}:${ex.name}-${i}`];
                      return (
                        <button key={i} onClick={() => toggleSet(ex.name, i)} style={{
                          flex: 1, padding: "11px 0", borderRadius: 9,
                          border: `2px solid ${done ? "#4ade80" : "var(--border2)"}`,
                          background: done ? "var(--success-surface2)" : "var(--surface2)",
                          color: done ? "#4ade80" : "var(--muted)",
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
  );
}
