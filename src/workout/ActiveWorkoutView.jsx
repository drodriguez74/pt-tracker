import { useState, useRef } from "react";

const TOTAL_SETS = 3;

function getExerciseSeconds(ex) {
  if (!ex?.sets) return null;
  if (ex.sets.includes("/side") || ex.sets.includes("/dir")) return null;
  const match = ex.sets.match(/x(\d+)s/);
  return match ? parseInt(match[1], 10) : null;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ProgressRail({ current, total }) {
  return (
    <div style={{ display: "flex", gap: 4, marginBottom: 0 }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{
          flex: 1, height: 3, borderRadius: 2,
          background: i < current ? "#e85d26" : i === current ? "#e85d2666" : "var(--border2)",
          transition: "background 0.3s",
        }} />
      ))}
    </div>
  );
}

function SetDots({ completed, total }) {
  return (
    <div style={{ display: "flex", gap: 10, justifyContent: "center", margin: "20px 0 8px" }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{
          width: i < completed ? 18 : 14,
          height: i < completed ? 18 : 14,
          borderRadius: "50%",
          background: i < completed ? "#e85d26" : "var(--border3)",
          border: i === completed ? "2px solid #e85d26" : "none",
          transition: "all 0.25s",
        }} />
      ))}
    </div>
  );
}

function ExerciseTimer({ secondsLeft, total }) {
  const pct = total > 0 ? secondsLeft / total : 0;
  const urgent = secondsLeft <= 5;
  const r = 34;
  const circ = 2 * Math.PI * r;
  return (
    <div style={{ position: "relative", width: 86, height: 86, margin: "10px auto 4px" }}>
      <svg width="86" height="86" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="43" cy="43" r={r} fill="none" stroke="var(--border2)" strokeWidth="5" />
        <circle
          cx="43" cy="43" r={r} fill="none"
          stroke={urgent ? "#ef4444" : "#10b981"} strokeWidth="5"
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - pct)}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.9s linear, stroke 0.3s" }}
        />
      </svg>
      <div style={{
        position: "absolute", inset: 0, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
      }}>
        <div style={{ fontSize: 22, fontWeight: "bold", color: urgent ? "#ef4444" : "var(--text)", lineHeight: 1, transition: "color 0.3s" }}>
          {secondsLeft}
        </div>
        <div style={{ fontSize: 9, color: "var(--muted)", letterSpacing: 1 }}>sec</div>
      </div>
    </div>
  );
}

function RestScreen({ secondsLeft, onSkip }) {
  const pct = (secondsLeft / 60) * 100;
  const urgent = secondsLeft <= 10;
  return (
    <div style={{
      flex: 1, display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", padding: "0 24px",
    }}>
      <div style={{ fontSize: 11, letterSpacing: 4, color: "var(--muted)", textTransform: "uppercase", marginBottom: 32 }}>Rest</div>

      <div style={{ position: "relative", width: 180, height: 180, marginBottom: 36 }}>
        <svg width="180" height="180" style={{ transform: "rotate(-90deg)" }}>
          <circle cx="90" cy="90" r="80" fill="none" stroke="var(--border2)" strokeWidth="6" />
          <circle
            cx="90" cy="90" r="80" fill="none"
            stroke={urgent ? "#ef4444" : "#e85d26"} strokeWidth="6"
            strokeDasharray={`${2 * Math.PI * 80}`}
            strokeDashoffset={`${2 * Math.PI * 80 * (1 - pct / 100)}`}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 0.9s linear, stroke 0.3s" }}
          />
        </svg>
        <div style={{
          position: "absolute", inset: 0, display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
        }}>
          <div style={{ fontSize: 56, fontWeight: "bold", color: urgent ? "#ef4444" : "var(--text)", lineHeight: 1, transition: "color 0.3s" }}>
            {secondsLeft}
          </div>
          <div style={{ fontSize: 11, color: "var(--muted)", letterSpacing: 2, marginTop: 4 }}>sec</div>
        </div>
      </div>

      <button onClick={onSkip} style={{
        padding: "14px 40px", borderRadius: 50,
        border: "1px solid var(--border2)", background: "transparent",
        color: "var(--muted)", fontSize: 14, fontFamily: "inherit", cursor: "pointer",
        letterSpacing: 0.5,
      }}>
        Skip Rest
      </button>
    </div>
  );
}

function DoneScreen({ session, onClose }) {
  const elapsed = session.startedAt ? Math.round((Date.now() - session.startedAt) / 60000) : 0;
  const completed = session.exercises.length - session.skipped.length;
  return (
    <div style={{
      flex: 1, display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", padding: "0 32px", textAlign: "center",
    }}>
      <div style={{ fontSize: 64, marginBottom: 16 }}>🎖️</div>
      <div style={{ fontSize: 11, letterSpacing: 4, color: "#4ade80", textTransform: "uppercase", marginBottom: 12 }}>Mission Complete</div>
      <div style={{ fontSize: 28, fontWeight: "bold", marginBottom: 8 }}>Workout Done</div>

      <div style={{ display: "flex", gap: 16, marginTop: 28, marginBottom: 40 }}>
        {[
          { label: "Exercises", value: completed },
          { label: "Minutes",   value: elapsed || "<1" },
          { label: "Sets",      value: completed * TOTAL_SETS },
        ].map(s => (
          <div key={s.label} style={{ background: "var(--surface2)", borderRadius: 12, padding: "14px 20px", textAlign: "center" }}>
            <div style={{ fontSize: 26, fontWeight: "bold", color: "#e85d26" }}>{s.value}</div>
            <div style={{ fontSize: 10, color: "var(--muted)", letterSpacing: 1, marginTop: 4, textTransform: "uppercase" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {session.skipped.length > 0 && (
        <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 28 }}>
          Skipped: {session.skipped.join(", ")}
        </div>
      )}

      <button onClick={onClose} style={{
        width: "100%", maxWidth: 360, padding: "18px",
        borderRadius: 14, border: "none", background: "#e85d26",
        color: "#fff", fontSize: 16, fontWeight: "bold",
        fontFamily: "inherit", cursor: "pointer", letterSpacing: 1,
      }}>
        Back to Schedule
      </button>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ActiveWorkoutView({ session, dayData, onCompleteSet, onSkipExercise, onSkipRest, onEnd }) {
  const [confirmExit, setConfirmExit] = useState(false);
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);

  const ex = session.exercises[session.exerciseIdx];
  const timerTotal = getExerciseSeconds(ex);
  const isTimed = session.exerciseSecondsLeft !== null && timerTotal !== null;

  function handleTouchStart(e) {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  }

  function handleTouchEnd(e) {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    touchStartX.current = null;
    touchStartY.current = null;
    if (Math.abs(dx) < 60 || Math.abs(dy) > Math.abs(dx)) return;
    if (dx > 0) onCompleteSet();
    else onSkipExercise();
  }

  const accentColor = dayData?.color || "#e85d26";

  const isLastSet = session.setIdx === TOTAL_SETS - 1;
  const isLastExercise = session.exerciseIdx === session.exercises.length - 1;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 200,
      background: "var(--bg)", color: "var(--text)",
      fontFamily: "'Barlow Condensed', sans-serif",
      display: "flex", flexDirection: "column",
      maxWidth: 480, margin: "0 auto",
    }}>

      {/* ── Top bar ── */}
      <div style={{ padding: "16px 18px 12px", background: "var(--header-bg)", borderBottom: "1px solid var(--border)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <button
            onClick={() => session.phase === "done" ? onEnd() : setConfirmExit(true)}
            style={{ background: "none", border: "none", color: "var(--muted)", fontSize: 22, cursor: "pointer", padding: "4px 8px 4px 0", fontFamily: "inherit" }}
          >
            ✕
          </button>
          <div style={{ fontSize: 11, letterSpacing: 2, color: "var(--muted)", textTransform: "uppercase" }}>
            {dayData?.focus || "Workout"}
          </div>
          <div style={{ fontSize: 12, color: accentColor, fontWeight: "bold" }}>
            {session.exerciseIdx + 1} / {session.exercises.length}
          </div>
        </div>
        <ProgressRail current={session.exerciseIdx} total={session.exercises.length} />
      </div>

      {/* ── Body ── */}
      {session.phase === "done" ? (
        <DoneScreen session={session} onClose={onEnd} />
      ) : session.phase === "resting" ? (
        <RestScreen secondsLeft={session.restSecondsLeft} onSkip={onSkipRest} />
      ) : (
        <div
          style={{ flex: 1, display: "flex", flexDirection: "column", padding: "0 24px 24px" }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Exercise info */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", textAlign: "center" }}>
            {ex?.caution?.length > 0 && (
              <div style={{
                display: "inline-block", margin: "0 auto 14px",
                fontSize: 9, letterSpacing: 1, textTransform: "uppercase",
                background: "#f59e0b22", border: "1px solid #f59e0b55",
                borderRadius: 6, padding: "3px 10px", color: "#f59e0b",
              }}>
                ⚠ Modify if needed
              </div>
            )}

            <div style={{ fontSize: 11, letterSpacing: 3, color: "var(--muted)", textTransform: "uppercase", marginBottom: 12 }}>
              Exercise {session.exerciseIdx + 1} of {session.exercises.length}
            </div>

            <div style={{ fontSize: 36, fontWeight: "bold", lineHeight: 1.1, marginBottom: 8 }}>
              {ex?.name}
            </div>

            <div style={{ fontSize: 14, color: "var(--muted)", marginBottom: 4 }}>
              {ex?.sets}
            </div>
            <div style={{ fontSize: 12, color: "var(--muted3)", maxWidth: 300, margin: "0 auto" }}>
              {ex?.notes}
            </div>

            <SetDots completed={session.setIdx} total={TOTAL_SETS} />

            {isTimed ? (
              <>
                <ExerciseTimer secondsLeft={session.exerciseSecondsLeft} total={timerTotal} />
                <div style={{ fontSize: 11, color: "var(--muted3)", marginTop: 4 }}>
                  Set <span style={{ color: "var(--text)", fontWeight: "bold", fontSize: 14 }}>{session.setIdx + 1}</span> of {TOTAL_SETS} · hold until zero
                </div>
              </>
            ) : (
              <div style={{ fontSize: 13, color: "var(--muted2)" }}>
                Set <span style={{ color: "var(--text)", fontWeight: "bold", fontSize: 16 }}>{session.setIdx + 1}</span> of {TOTAL_SETS}
              </div>
            )}
          </div>

          {/* Swipe hint */}
          <div style={{ textAlign: "center", fontSize: 10, color: "var(--muted3)", letterSpacing: 1, marginBottom: 14 }}>
            ← swipe to skip · swipe to complete →
          </div>

          {/* Primary action */}
          <button
            onClick={onCompleteSet}
            style={{
              width: "100%", padding: "22px 0",
              borderRadius: 16, border: "none",
              background: isLastSet && isLastExercise ? "#4ade80" : "#e85d26",
              color: "#fff",
              fontSize: 18, fontWeight: "bold", letterSpacing: 1,
              fontFamily: "inherit", cursor: "pointer",
              transition: "background 0.2s",
            }}
          >
            {isTimed
              ? (isLastSet && isLastExercise ? "Finish Workout" : "Done Early →")
              : isLastSet
                ? isLastExercise ? "Finish Workout" : "Done — Next Exercise →"
                : `Complete Set ${session.setIdx + 1} of ${TOTAL_SETS}`}
          </button>

          {/* Secondary: skip */}
          <button
            onClick={onSkipExercise}
            style={{
              width: "100%", padding: "14px 0", marginTop: 10,
              borderRadius: 12, border: "1px solid var(--border2)",
              background: "transparent", color: "var(--muted)",
              fontSize: 13, fontFamily: "inherit", cursor: "pointer",
            }}
          >
            Skip Exercise
          </button>
        </div>
      )}

      {/* ── Confirm exit modal ── */}
      {confirmExit && (
        <div
          onClick={() => setConfirmExit(false)}
          style={{ position: "fixed", inset: 0, background: "#000000bb", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
        >
          <div onClick={e => e.stopPropagation()} style={{
            background: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: 16, padding: "28px 24px", width: "100%", maxWidth: 360, textAlign: "center",
          }}>
            <div style={{ fontSize: 18, fontWeight: "bold", marginBottom: 8 }}>End workout?</div>
            <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 24 }}>
              Your progress so far will be saved.
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setConfirmExit(false)}
                style={{ flex: 1, padding: "14px", borderRadius: 10, border: "1px solid var(--border2)", background: "transparent", color: "var(--muted)", fontSize: 14, fontFamily: "inherit", cursor: "pointer" }}
              >Keep Going</button>
              <button
                onClick={onEnd}
                style={{ flex: 1, padding: "14px", borderRadius: 10, border: "none", background: "#e85d26", color: "#fff", fontSize: 14, fontWeight: "bold", fontFamily: "inherit", cursor: "pointer" }}
              >End Workout</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
