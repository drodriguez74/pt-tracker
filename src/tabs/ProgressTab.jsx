import { useState, useEffect, useMemo } from "react";
import { weekSchedule, DAY_ABBRS, TARGET_WORKOUTS, PROGRESSION } from "../data/schedule";
import { askCoach } from "../utils/aiCoach";

const API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY;
const NARRATIVE_KEY = "pt-weekly-narrative";

// ── Constants ──────────────────────────────────────────────────────────────────

const CAT_TO_AXIS = {
  pushVariations: "Push", dipsTriCeps: "Push",
  pullVariations: "Pull", back: "Pull",
  lowerBody: "Legs",
  core: "Core",
  cardioConditioning: "Cardio",
  mobilityWarmup: "Mobility",
};
const RADAR_AXES = ["Push", "Pull", "Legs", "Core", "Cardio", "Mobility"];
const HEAT_WEEKS = 16;

const ACTIVITY_TYPE_TO_AXIS = {
  run: "Cardio", walk: "Cardio", bike: "Cardio", swim: "Cardio", sport: "Cardio",
  yoga: "Mobility", stretch: "Mobility",
};

// ── Helpers ────────────────────────────────────────────────────────────────────

function toISO(d) {
  return d.toISOString().split("T")[0];
}

function computeRadarScores(completedDates, activities = []) {
  const scores = Object.fromEntries(RADAR_AXES.map(l => [l, 0]));
  for (const dateStr of completedDates) {
    const d = new Date(dateStr + "T12:00:00");
    const abbr = DAY_ABBRS[d.getDay()];
    const day = weekSchedule.find(w => w.day === abbr);
    if (!day) continue;
    for (const cat of day.cats) {
      const axis = CAT_TO_AXIS[cat];
      if (axis) scores[axis]++;
    }
    // Warmup presets on weekday workouts include mobility movements — credit Mobility
    if (day.warmup) scores["Mobility"]++;
  }
  for (const a of activities) {
    const axis = ACTIVITY_TYPE_TO_AXIS[a.type];
    if (axis) scores[axis]++;
  }
  return scores;
}

// ── Mission Ring ───────────────────────────────────────────────────────────────

function MissionRing({ current, total, complete }) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setOn(true), 200);
    return () => clearTimeout(t);
  }, []);

  const r = 70;
  const cx = 88;
  const cy = 88;
  const circ = 2 * Math.PI * r;
  const pct = on ? Math.min(current / total, 1) : 0;
  const color = complete ? "#4ade80" : "#e85d26";
  const tickAngles = [5, 10, 15].map(n => (n / total) * 2 * Math.PI);

  return (
    <div style={{ position: "relative", width: 176, height: 176, flexShrink: 0 }}>
      <svg
        width="176" height="176"
        style={{ position: "absolute", inset: 0, transform: "rotate(-90deg)" }}
      >
        <defs>
          <filter id="ring-glow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="4" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Track */}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e85d2612" strokeWidth="10" />

        {/* Milestone ticks at 5, 10, 15 */}
        {tickAngles.map((a, i) => (
          <line
            key={i}
            x1={cx + (r - 7) * Math.cos(a)} y1={cy + (r - 7) * Math.sin(a)}
            x2={cx + (r + 3) * Math.cos(a)} y2={cy + (r + 3) * Math.sin(a)}
            stroke="#e85d2650" strokeWidth="1.5"
          />
        ))}

        {/* Progress arc */}
        <circle
          cx={cx} cy={cy} r={r}
          fill="none" stroke={color} strokeWidth="10"
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - pct)}
          strokeLinecap="round"
          filter="url(#ring-glow)"
          style={{ transition: "stroke-dashoffset 1.4s cubic-bezier(0.16,1,0.3,1), stroke 0.4s" }}
        />
      </svg>

      {/* Center label */}
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        textAlign: "center", gap: 1,
      }}>
        {complete ? (
          <>
            <div style={{ fontSize: 30 }}>🎖️</div>
            <div style={{ fontSize: 8, color: "#4ade80", letterSpacing: 3, textTransform: "uppercase", marginTop: 4 }}>Complete</div>
          </>
        ) : (
          <>
            <div style={{ fontSize: 9, color: "var(--muted3)", letterSpacing: 3, textTransform: "uppercase" }}>Mission</div>
            <div style={{ fontSize: 40, fontWeight: 900, lineHeight: 1, color }}>{current}</div>
            <div style={{ fontSize: 10, color: "var(--muted)" }}>/ {total}</div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Radar Chart ────────────────────────────────────────────────────────────────

function RadarChart({ scores }) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setOn(true), 500);
    return () => clearTimeout(t);
  }, []);

  const size = 220;
  const cx = size / 2;
  const cy = size / 2;
  const R = 76;
  const N = RADAR_AXES.length;
  const maxVal = Math.max(...Object.values(scores), 1);

  const angle = i => -Math.PI / 2 + (2 * Math.PI / N) * i;

  const pt = (r, i) => ({
    x: cx + r * Math.cos(angle(i)),
    y: cy + r * Math.sin(angle(i)),
  });

  const polyStr = pts => pts.map(p => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" ");

  const gridRing = r => polyStr(RADAR_AXES.map((_, i) => pt(r, i)));

  const dataPoints = RADAR_AXES.map((label, i) =>
    pt(R * (scores[label] / maxVal), i)
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
      <svg width={size} height={size} style={{ overflow: "visible" }}>
        <defs>
          <filter id="rdot-glow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="3" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="rfill-glow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="8" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Grid rings */}
        {[0.25, 0.5, 0.75, 1].map(r => (
          <polygon key={r} points={gridRing(R * r)} fill="none" stroke="#e85d2614" strokeWidth="1" />
        ))}

        {/* Spokes */}
        {RADAR_AXES.map((_, i) => {
          const p = pt(R, i);
          return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="#e85d2220" strokeWidth="1" />;
        })}

        {/* Data shape — scale from center */}
        <g style={{
          transformOrigin: `${cx}px ${cy}px`,
          transform: `scale(${on ? 1 : 0.05})`,
          opacity: on ? 1 : 0,
          transition: "transform 1s cubic-bezier(0.16,1,0.3,1), opacity 0.5s",
        }}>
          {/* Glow halo */}
          <polygon
            points={polyStr(dataPoints)}
            fill="#e85d2645" stroke="none"
            filter="url(#rfill-glow)"
          />
          {/* Main polygon */}
          <polygon
            points={polyStr(dataPoints)}
            fill="#e85d2620" stroke="#e85d26" strokeWidth="2" strokeLinejoin="round"
          />
          {/* Vertex dots */}
          {dataPoints.map((p, i) =>
            scores[RADAR_AXES[i]] > 0 && (
              <circle key={i} cx={p.x} cy={p.y} r="4" fill="#e85d26" filter="url(#rdot-glow)" />
            )
          )}
        </g>

        {/* Axis labels */}
        {RADAR_AXES.map((label, i) => {
          const lp = pt(R + 22, i);
          const active = scores[label] > 0;
          return (
            <text
              key={i}
              x={lp.x} y={lp.y + 4}
              textAnchor="middle"
              style={{
                fontSize: 9,
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 700,
                letterSpacing: 1,
                fill: active ? "#e85d26" : "var(--muted3)",
              }}
            >
              {label.toUpperCase()}
            </text>
          );
        })}
      </svg>

      {/* Score row */}
      <div style={{ display: "flex", gap: 6, justifyContent: "center", marginTop: 6, flexWrap: "wrap" }}>
        {RADAR_AXES.map(label => (
          <div key={label} style={{ textAlign: "center", minWidth: 38 }}>
            <div style={{
              fontSize: 15, fontWeight: 900, lineHeight: 1,
              color: scores[label] > 0 ? "#e85d26" : "var(--muted3)",
            }}>
              {scores[label]}
            </div>
            <div style={{ fontSize: 7, color: "var(--muted3)", letterSpacing: 1, textTransform: "uppercase", marginTop: 2 }}>
              {label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Weekly Activity Feed ───────────────────────────────────────────────────────

function WeeklyFeed({ completedWorkoutDates, activities }) {
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    return d.toISOString().split("T")[0];
  });

  const activeDays = days.filter(d =>
    completedWorkoutDates.includes(d) || activities.some(a => a.date === d)
  );

  if (activeDays.length === 0) return null;

  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <div style={{ fontSize: 9, color: "var(--muted)", letterSpacing: 3, textTransform: "uppercase" }}>
          This Week
        </div>
        <div style={{ fontSize: 11, color: "#10b981", fontWeight: "bold" }}>
          {activeDays.length} active day{activeDays.length !== 1 ? "s" : ""}
        </div>
      </div>
      {days.map(dateStr => {
        const isWorkout  = completedWorkoutDates.includes(dateStr);
        const dayActvs   = activities.filter(a => a.date === dateStr);
        if (!isWorkout && dayActvs.length === 0) return null;

        const d      = new Date(dateStr + "T12:00:00");
        const abbr   = DAY_ABBRS[d.getDay()];
        const dayDef = weekSchedule.find(w => w.day === abbr);
        const label  = dateStr === todayStr
          ? "Today"
          : d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

        return (
          <div key={dateStr} style={{
            background: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: 11, padding: "12px 14px", marginBottom: 8,
          }}>
            <div style={{ fontSize: 9, color: "var(--muted3)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>
              {label}
            </div>
            {isWorkout && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: dayActvs.length ? 7 : 0 }}>
                <span style={{
                  width: 22, height: 22, borderRadius: "50%",
                  background: "#4ade8022", border: "1px solid #4ade8066",
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  <span style={{ fontSize: 10, color: "#4ade80" }}>✓</span>
                </span>
                <span style={{ fontSize: 13, fontWeight: "bold", color: "var(--text)" }}>
                  {dayDef?.focus || "Workout"}
                </span>
              </div>
            )}
            {dayActvs.map(a => (
              <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                <span style={{ fontSize: 16, flexShrink: 0 }}>{a.emoji}</span>
                <span style={{ fontSize: 13, color: "var(--muted)" }}>
                  {a.label}
                  {a.value && <span style={{ color: "#10b981" }}> · {a.value} {a.unit}</span>}
                  {a.note && <span style={{ color: "var(--muted3)" }}> · {a.note}</span>}
                </span>
              </div>
            ))}
          </div>
        );
      }).filter(Boolean)}
    </div>
  );
}

// ── Heat Grid ──────────────────────────────────────────────────────────────────

function HeatGrid({ completedDates, activities }) {
  const todayStr = toISO(new Date());

  const grid = useMemo(() => {
    const today = new Date();
    const dow = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - (dow === 0 ? 6 : dow - 1) - (HEAT_WEEKS - 1) * 7);

    return Array.from({ length: HEAT_WEEKS }, (_, w) =>
      Array.from({ length: 7 }, (_, d) => {
        const date = new Date(monday);
        date.setDate(monday.getDate() + w * 7 + d);
        const dateStr = toISO(date);
        const abbr = DAY_ABBRS[date.getDay()];
        const dayData = weekSchedule.find(x => x.day === abbr);
        const isTraining = dayData && dayData.cats.length > 0;
        const isDone = completedDates.includes(dateStr);
        const isFuture = dateStr > todayStr;
        return { dateStr, isTraining, isDone, isFuture, date };
      })
    );
  }, [completedDates]); // eslint-disable-line react-hooks/exhaustive-deps

  const CELL = 16;
  const GAP = 3;

  return (
    <div style={{ overflowX: "auto" }}>
      <div style={{ display: "flex", gap: GAP, minWidth: "fit-content" }}>

        {/* Day label column */}
        <div style={{ display: "flex", flexDirection: "column", gap: GAP, paddingTop: 18 }}>
          {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
            <div key={i} style={{
              width: 8, height: CELL, fontSize: 7,
              color: "var(--muted3)", fontFamily: "monospace",
              display: "flex", alignItems: "center", justifyContent: "flex-end",
            }}>
              {[0, 2, 4].includes(i) ? d : ""}
            </div>
          ))}
        </div>

        {/* Week columns */}
        {grid.map((week, wi) => {
          const firstDate = week[0].date;
          const showMonth = wi === 0 || firstDate.getDate() <= 7;
          return (
            <div key={wi} style={{ display: "flex", flexDirection: "column", gap: GAP }}>
              {/* Month label */}
              <div style={{ height: 14, overflow: "visible" }}>
                {showMonth && (
                  <span style={{
                    fontSize: 7, color: "var(--muted3)",
                    fontFamily: "monospace", whiteSpace: "nowrap",
                  }}>
                    {firstDate.toLocaleDateString("en", { month: "short" })}
                  </span>
                )}
              </div>

              {/* Day cells */}
              {week.map((cell, di) => {
                const hasActivity = !cell.isDone && (activities ?? []).some(a => a.date === cell.dateStr);
                let bg, border, shadow;
                if (cell.isFuture) {
                  bg = "transparent"; border = "1px solid transparent"; shadow = "none";
                } else if (cell.isDone) {
                  bg = "#e85d26"; border = "none"; shadow = "0 0 7px #e85d2670";
                } else if (hasActivity) {
                  bg = "#10b981"; border = "none"; shadow = "0 0 5px #10b98155";
                } else if (cell.isTraining) {
                  bg = "#e85d2615"; border = "1px solid #e85d2630"; shadow = "none";
                } else {
                  bg = "#ffffff05"; border = "1px solid #ffffff08"; shadow = "none";
                }
                return (
                  <div
                    key={di}
                    title={cell.dateStr}
                    style={{
                      width: CELL, height: CELL, borderRadius: 3,
                      background: bg, border, boxShadow: shadow,
                    }}
                  />
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div style={{ display: "flex", gap: 10, marginTop: 12, justifyContent: "flex-end", alignItems: "center", flexWrap: "wrap" }}>
        {[
          { bg: "#e85d26", shadow: "0 0 6px #e85d2660", label: "Workout" },
          { bg: "#10b981", shadow: "0 0 4px #10b98150", label: "Activity" },
          { bg: "#e85d2615", border: "1px solid #e85d2630", label: "Scheduled" },
          { bg: "#ffffff05", border: "1px solid #ffffff08", label: "Rest" },
        ].map(({ bg, border, shadow, label }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: bg, border, boxShadow: shadow }} />
            <span style={{ fontSize: 8, color: "var(--muted3)", letterSpacing: 0.5 }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────────

function WeeklyNarrative({ prefs, streak, workoutsCompleted, missionDay, weekNumber, completedWorkoutDates }) {
  const [narrative, setNarrative] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!API_KEY || workoutsCompleted === 0) return;

    const todayStr = new Date().toISOString().split("T")[0];
    try {
      const cached = JSON.parse(localStorage.getItem(NARRATIVE_KEY) || "null");
      if (cached?.date === todayStr) { setNarrative(cached.text); return; }
    } catch { /* stale */ }

    setLoading(true);
    const weekProg = PROGRESSION[Math.min(weekNumber, 3)];

    // Workouts this week vs last week
    const thisWeekStart = new Date();
    thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay());
    const thisWeekStr = thisWeekStart.toISOString().split("T")[0];
    const lastWeekStr = new Date(thisWeekStart.getTime() - 7 * 86400000).toISOString().split("T")[0];
    const thisWeekCount = completedWorkoutDates.filter(d => d >= thisWeekStr).length;
    const lastWeekCount = completedWorkoutDates.filter(d => d >= lastWeekStr && d < thisWeekStr).length;

    askCoach(
      `You are an encouraging military fitness coach writing a brief weekly progress summary.
Write exactly 2-3 sentences. Be specific about numbers and trends.
End with one forward-looking sentence. No bullet points — natural paragraph only.`,
      `User: ${prefs?.name || "Soldier"}, ${prefs?.ageRange || "adult"}
Mission: Day ${missionDay}, ${weekProg.label} — ${weekProg.sub}
Streak: ${streak.current} days (best: ${streak.best})
Total workouts: ${workoutsCompleted}
This week: ${thisWeekCount} workout(s), last week: ${lastWeekCount}
Ailments: ${prefs?.ailments?.length ? prefs.ailments.join(", ") : "none"}`,
      200
    ).then(text => {
      if (text) {
        localStorage.setItem(NARRATIVE_KEY, JSON.stringify({ date: todayStr, text }));
        setNarrative(text);
      }
      setLoading(false);
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!API_KEY || (workoutsCompleted === 0 && !loading)) return null;

  return (
    <div style={{
      background: "var(--mission-surface)", border: "1px solid #e85d2633",
      borderRadius: 13, padding: "14px 16px", marginBottom: 20,
    }}>
      <div style={{ fontSize: 9, color: "#e85d26", letterSpacing: 3, textTransform: "uppercase", marginBottom: 8 }}>
        Coach's Take
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
        <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.6, margin: 0 }}>{narrative}</p>
      )}
    </div>
  );
}

export default function ProgressTab({
  streak, missionComplete, workoutsCompleted, missionProgress, missionDay,
  completedWorkoutDates, activeAilments, prefs, weekNumber,
  restartMission, setActiveTab, activities,
}) {
  const radarScores = useMemo(
    () => computeRadarScores(completedWorkoutDates, activities ?? []),
    [completedWorkoutDates, activities]
  );

  return (
    <>
      {/* ── Weekly activity feed ── */}
      <WeeklyFeed completedWorkoutDates={completedWorkoutDates} activities={activities ?? []} />

      {/* ── AI Weekly Narrative ── */}
      <WeeklyNarrative
        prefs={prefs}
        streak={streak}
        workoutsCompleted={workoutsCompleted}
        missionDay={missionDay}
        weekNumber={weekNumber}
        completedWorkoutDates={completedWorkoutDates}
      />

      {/* ── Mission ring + streak ── */}
      <div style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 20 }}>
        <MissionRing current={workoutsCompleted} total={TARGET_WORKOUTS} complete={missionComplete} />

        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
          {/* Current streak */}
          <div style={{
            background: streak.current > 0 ? "var(--mission-surface)" : "var(--surface)",
            border: `1px solid ${streak.current > 0 ? "#e85d2640" : "var(--border)"}`,
            borderRadius: 11, padding: "11px 13px",
          }}>
            <div style={{ fontSize: 8, color: "var(--muted3)", letterSpacing: 3, textTransform: "uppercase", marginBottom: 3 }}>
              Streak
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
              <span style={{
                fontSize: 34, fontWeight: 900, lineHeight: 1,
                color: streak.current > 0 ? "#e85d26" : "var(--muted)",
              }}>
                {streak.current}
              </span>
              <span style={{ fontSize: 10, color: "var(--muted)" }}>
                {streak.current === 1 ? "day" : "days"}
              </span>
            </div>
          </div>

          {/* Best + Total */}
          <div style={{ display: "flex", gap: 6 }}>
            {[
              { label: "Best",  value: streak.best,  color: "#8b5cf6" },
              { label: "Total", value: streak.total, color: "#10b981" },
            ].map(s => (
              <div key={s.label} style={{
                flex: 1, background: "var(--surface)",
                border: "1px solid var(--border)", borderRadius: 11, padding: "9px 11px",
              }}>
                <div style={{ fontSize: 7, color: "var(--muted3)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 3 }}>
                  {s.label}
                </div>
                <div style={{ fontSize: 22, fontWeight: 900, color: s.color }}>{s.value}</div>
              </div>
            ))}
          </div>

          {missionComplete && (
            <button onClick={restartMission} style={{
              padding: "9px 0", borderRadius: 9,
              border: "1px solid #4ade8055", background: "var(--success-surface)",
              color: "#4ade80", fontSize: 11, fontFamily: "inherit",
              cursor: "pointer", letterSpacing: 1,
            }}>
              Start Mission 2 →
            </button>
          )}
        </div>
      </div>

      {/* ── Training log heat map ── */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 9, color: "var(--muted)", letterSpacing: 3, textTransform: "uppercase", marginBottom: 10 }}>
          Training Log · 16 Weeks
        </div>
        <div style={{
          background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: 13, padding: "14px 16px",
        }}>
          <HeatGrid completedDates={completedWorkoutDates} activities={activities ?? []} />
        </div>
      </div>

      {/* ── Muscle balance radar ── */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 9, color: "var(--muted)", letterSpacing: 3, textTransform: "uppercase", marginBottom: 10 }}>
          Muscle Group Balance
        </div>
        <div style={{
          background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: 13, padding: "20px 16px", display: "flex", justifyContent: "center",
        }}>
          {completedWorkoutDates.length === 0 ? (
            <div style={{ fontSize: 12, color: "var(--muted3)", padding: "36px 0", textAlign: "center" }}>
              Complete your first workout to see balance data.
            </div>
          ) : (
            <RadarChart scores={radarScores} />
          )}
        </div>
      </div>

      {/* ── Milestones ── */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 9, color: "var(--muted)", letterSpacing: 3, textTransform: "uppercase", marginBottom: 10 }}>
          Milestones
        </div>
        {[
          { label: "Week 1–2", goal: "Build the habit, muscles adapt",           icon: "🌱", done: streak.total >= 4  },
          { label: "Week 3",   goal: "Noticeable strength in push-ups & squats", icon: "💪", done: streak.total >= 10 },
          { label: "Week 4",   goal: "Core stronger, posture visibly improved",  icon: "🎯", done: streak.total >= 16 },
        ].map((m, i) => (
          <div key={i} style={{
            background: m.done ? "var(--success-surface)" : "var(--surface)",
            border: `1px solid ${m.done ? "var(--done-border)" : "var(--border)"}`,
            borderRadius: 11, padding: "12px 15px", marginBottom: 8,
            display: "flex", alignItems: "center", gap: 12,
          }}>
            <span style={{ fontSize: 20, opacity: m.done ? 1 : 0.35 }}>{m.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 9, color: m.done ? "#4ade80" : "#e85d26", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 2 }}>
                {m.label}
              </div>
              <div style={{ fontSize: 12, color: "var(--muted)", textDecoration: m.done ? "line-through" : "none" }}>
                {m.goal}
              </div>
            </div>
            {m.done && <span style={{ fontSize: 14, color: "#4ade80" }}>✓</span>}
          </div>
        ))}
      </div>

      {/* ── Ailment modifications ── */}
      {activeAilments.length > 0 && (
        <>
          <div style={{ fontSize: 9, color: "var(--muted)", letterSpacing: 3, textTransform: "uppercase", marginBottom: 10 }}>
            Your Modifications
          </div>
          {activeAilments.map(a => (
            <div key={a.key} style={{
              background: "var(--surface)", border: "1px solid var(--caution-border)",
              borderRadius: 11, padding: "12px 15px", marginBottom: 8,
              display: "flex", gap: 12, alignItems: "center",
            }}>
              <span style={{ fontSize: 18 }}>⚠️</span>
              <div>
                <div style={{ fontSize: 11, color: "#f59e0b", marginBottom: 2 }}>{a.label}</div>
                <div style={{ fontSize: 11, color: "var(--muted3)" }}>{a.note}</div>
              </div>
            </div>
          ))}
        </>
      )}

      {activeAilments.length === 0 && (
        <div style={{
          background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: 11, padding: "14px", textAlign: "center",
          color: "var(--muted2)", fontSize: 12,
        }}>
          No modifications set.{" "}
          <span onClick={() => setActiveTab("settings")} style={{ color: "#e85d26", cursor: "pointer" }}>
            Add ailments in Settings →
          </span>
        </div>
      )}
    </>
  );
}
