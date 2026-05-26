import { useRef } from "react";
import { GiMeditation } from "react-icons/gi";
import { ALL_EXERCISES, WARMUP_PRESETS } from "../data/exercises";
import { weekSchedule, DAY_ABBRS, getThisWeekDates } from "../data/schedule";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default function ScheduleTab({
  selectedDay, setSelectedDay,
  dayData, dayExercises, dayDone,
  todayStr, completed,
  missionStartDate, weekProg,
  hasCaution, toggleSet, completeAllSets, startWorkout, setDemoEx,
  prefs, completedWorkoutDates,
}) {
  const todayAbbr = DAY_ABBRS[new Date().getDay()];
  const isToday = selectedDay === todayAbbr;
  const thisWeekDates = getThisWeekDates();
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
            fontFamily: "inherit", cursor: "pointer", marginBottom: 12,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}
        >
          {dayDone === dayExercises.length
            ? "✓ Workout Complete"
            : dayDone > 0 ? "▶ Continue Workout" : "▶ Start Workout"}
        </button>
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
          borderRadius: 10, padding: "10px 14px", marginBottom: 12,
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <GiMeditation size={20} color="#10b981" />
          <div>
            <div style={{ fontSize: 10, color: "#10b981", letterSpacing: 2, textTransform: "uppercase", marginBottom: 2 }}>
              Warm-up first — 2–3 min
            </div>
            <div style={{ fontSize: 11, color: "var(--muted3)" }}>{WARMUP_PRESETS[dayData.warmup]}</div>
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
        <div style={{ textAlign: "center", padding: "48px 20px", color: "var(--muted3)" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>😴</div>
          <div style={{ fontSize: 17 }}>Rest Day</div>
          <div style={{ fontSize: 12, marginTop: 6, color: "var(--muted2)" }}>
            Light walk or 10 min mobility recommended.
          </div>
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
                      const done = !!completed[`${todayStr}:${ex.name}-${i}`];
                      return (
                        <div
                          key={i}
                          onClick={() => toggleSet(ex.name, i)}
                          style={{
                            width: 24, height: 24, borderRadius: "50%", flexShrink: 0,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            background: done ? "#4ade8022" : "transparent",
                            border: `2px solid ${done ? "#4ade80" : "var(--border3)"}`,
                            cursor: "pointer",
                            transition: "background 0.15s, border-color 0.15s",
                          }}
                        >
                          {done && (
                            <span style={{ fontSize: 9, color: "#4ade80", lineHeight: 1 }}>✓</span>
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
    </>
  );
}
