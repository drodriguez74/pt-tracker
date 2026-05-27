import { useState, useRef } from "react";
import { useHandsFreeInput } from "./useHandsFreeInput";

const TOTAL_SETS = 3;

function getExerciseSeconds(ex) {
  if (!ex?.sets) return null;
  if (ex.sets.includes("/side") || ex.sets.includes("/dir")) return null;
  const match = ex.sets.match(/x(\d+)s/);
  return match ? parseInt(match[1], 10) : null;
}

// ─── Progress Rail ────────────────────────────────────────────────────────────

function ProgressRail({ current, total, color }) {
  return (
    <div style={{ display: "flex", gap: 3 }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{
          flex: 1, height: 3, borderRadius: 2,
          background: i < current ? color : i === current ? color + "44" : "var(--border2)",
          transition: "background 0.3s",
        }} />
      ))}
    </div>
  );
}

// ─── Set Dots ─────────────────────────────────────────────────────────────────

function SetDots({ completedCount, total, color }) {
  return (
    <div style={{ display: "flex", gap: 12, justifyContent: "center", margin: "24px 0 12px" }}>
      {Array.from({ length: total }).map((_, i) => {
        const isDone    = i < completedCount;
        const isCurrent = i === completedCount;
        return (
          <div key={i} style={{
            width: isDone ? 22 : isCurrent ? 20 : 14,
            height: isDone ? 22 : isCurrent ? 20 : 14,
            borderRadius: "50%", flexShrink: 0,
            background: isDone ? color : "transparent",
            border: isDone ? "none" : isCurrent ? `2.5px solid ${color}` : "2px solid var(--border3)",
            boxShadow: isDone ? `0 0 10px ${color}88` : "none",
            animation: isCurrent ? "pulseDot 1.8s ease-in-out infinite" : "none",
            color: color,
            transition: "all 0.3s",
          }} />
        );
      })}
    </div>
  );
}

// ─── Exercise Timer ───────────────────────────────────────────────────────────

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

// ─── Rest Screen ──────────────────────────────────────────────────────────────

function RestScreen({ secondsLeft, totalSeconds, onSkip, nextExercise, nextSet }) {
  const pct = (secondsLeft / (totalSeconds || 60)) * 100;
  const urgent = secondsLeft <= 10;
  const r = 80;
  const circ = 2 * Math.PI * r;

  return (
    <div style={{
      flex: 1, display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", padding: "0 28px",
    }}>
      <div style={{
        fontSize: 9, letterSpacing: 4, color: "var(--muted)",
        textTransform: "uppercase", marginBottom: 28,
      }}>
        Rest
      </div>

      {/* Breathing ring */}
      <div
        style={{
          position: "relative", width: 196, height: 196, marginBottom: 32,
          animation: "breathe 4s ease-in-out infinite",
        }}
      >
        <svg width="196" height="196" style={{ transform: "rotate(-90deg)" }}>
          <circle cx="98" cy="98" r={r} fill="none" stroke="var(--border2)" strokeWidth="6" />
          <circle
            cx="98" cy="98" r={r} fill="none"
            stroke={urgent ? "#ef4444" : "#e85d26"} strokeWidth="6"
            strokeDasharray={`${circ}`}
            strokeDashoffset={`${circ * (1 - pct / 100)}`}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 0.9s linear, stroke 0.3s" }}
          />
        </svg>
        <div style={{
          position: "absolute", inset: 0, display: "flex",
          flexDirection: "column", alignItems: "center", justifyContent: "center",
        }}>
          <div style={{
            fontSize: 58, fontWeight: 900, lineHeight: 1,
            color: urgent ? "#ef4444" : "var(--text)",
            transition: "color 0.3s",
          }}>
            {secondsLeft}
          </div>
          <div style={{ fontSize: 11, color: "var(--muted)", letterSpacing: 2, marginTop: 4 }}>sec</div>
        </div>
      </div>

      {/* Next up */}
      {nextExercise && (
        <div style={{
          textAlign: "center", marginBottom: 28,
          animation: "fadeUp 0.4s ease",
        }}>
          <div style={{ fontSize: 9, color: "var(--muted3)", letterSpacing: 3, textTransform: "uppercase", marginBottom: 6 }}>
            Next up
          </div>
          <div style={{ fontSize: 18, fontWeight: "bold", color: "var(--text)", marginBottom: 4 }}>
            {nextExercise.name}
          </div>
          <div style={{ fontSize: 11, color: "var(--muted)" }}>
            Set {nextSet + 1} of {TOTAL_SETS} · {nextExercise.sets}
          </div>
        </div>
      )}

      <button onClick={onSkip} style={{
        padding: "13px 40px", borderRadius: 50,
        border: "1px solid var(--border2)", background: "transparent",
        color: "var(--muted)", fontSize: 14, fontFamily: "inherit",
        cursor: "pointer", letterSpacing: 0.5,
      }}>
        Skip Rest
      </button>
    </div>
  );
}

// ─── Done Screen ──────────────────────────────────────────────────────────────

function DoneScreen({ session, onClose }) {
  const elapsed = session.startedAt
    ? Math.round((Date.now() - session.startedAt) / 60000)
    : 0;
  const completedCount = session.exercises.length - session.skipped.length;
  const totalSets = completedCount * TOTAL_SETS;

  return (
    <div style={{
      flex: 1, display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "0 32px", textAlign: "center",
    }}>
      <div style={{ fontSize: 64, marginBottom: 12, animation: "fadeUp 0.5s ease" }}>🎖️</div>

      <div style={{
        fontSize: 10, letterSpacing: 4, color: "#4ade80",
        textTransform: "uppercase", marginBottom: 10,
        animation: "fadeUp 0.5s 0.1s ease both",
      }}>
        Mission Complete
      </div>

      <div style={{
        fontSize: 30, fontWeight: 900, marginBottom: 32,
        animation: "fadeUp 0.5s 0.15s ease both",
      }}>
        Workout Done
      </div>

      {/* Stats */}
      <div style={{
        display: "flex", gap: 10, marginBottom: 36, width: "100%",
        animation: "fadeUp 0.5s 0.2s ease both",
      }}>
        {[
          { label: "Exercises", value: completedCount,       color: "#e85d26" },
          { label: "Minutes",   value: elapsed || "<1",      color: "#8b5cf6" },
          { label: "Sets",      value: totalSets,             color: "#10b981" },
        ].map(s => (
          <div key={s.label} style={{
            flex: 1, background: "var(--surface2)",
            border: `1px solid ${s.color}33`,
            borderTop: `3px solid ${s.color}`,
            borderRadius: 12, padding: "16px 8px", textAlign: "center",
          }}>
            <div style={{ fontSize: 28, fontWeight: 900, color: s.color, lineHeight: 1 }}>
              {s.value}
            </div>
            <div style={{ fontSize: 9, color: "var(--muted)", letterSpacing: 1, marginTop: 6, textTransform: "uppercase" }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {session.skipped.length > 0 && (
        <div style={{
          fontSize: 11, color: "var(--muted)", marginBottom: 24,
          animation: "fadeUp 0.5s 0.25s ease both",
        }}>
          Skipped: {session.skipped.join(", ")}
        </div>
      )}

      <button
        onClick={onClose}
        style={{
          width: "100%", padding: "18px",
          borderRadius: 14, border: "none", background: "#e85d26",
          color: "#fff", fontSize: 16, fontWeight: "bold",
          fontFamily: "inherit", cursor: "pointer", letterSpacing: 1,
          animation: "fadeUp 0.5s 0.3s ease both",
        }}
      >
        Back to Schedule
      </button>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function ActiveWorkoutView({ session, dayData, onCompleteSet, onSkipExercise, onSkipRest, onEnd }) {
  const [confirmExit, setConfirmExit] = useState(false);
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);

  const {
    voiceActive, voiceSupported, micError,
    knockActive, knockNeedsPermission, requestKnockPermission,
    lastCommand,
  } = useHandsFreeInput({ phase: session.phase, onCompleteSet, onSkipExercise, onSkipRest });

  const ex = session.exercises[session.exerciseIdx];
  const timerTotal = getExerciseSeconds(ex);
  const isTimed = session.exerciseSecondsLeft !== null && timerTotal !== null;

  const accentColor = dayData?.color || "#e85d26";
  const isLastSet = session.setIdx === TOTAL_SETS - 1;
  const isLastExercise = session.exerciseIdx === session.exercises.length - 1;

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

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 200,
      background: "var(--bg)", color: "var(--text)",
      fontFamily: "'Barlow Condensed', sans-serif",
      display: "flex", flexDirection: "column",
      maxWidth: 480, margin: "0 auto",
    }}>

      {/* ── Top bar ── */}
      <div style={{
        padding: "16px 18px 12px",
        background: "var(--header-bg)",
        borderBottom: "1px solid var(--border)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <button
            onClick={() => session.phase === "done" ? onEnd() : setConfirmExit(true)}
            style={{
              background: "none", border: "none", color: "var(--muted)",
              fontSize: 22, cursor: "pointer", padding: "4px 8px 4px 0",
              fontFamily: "inherit",
            }}
          >
            ✕
          </button>
          <div style={{ fontSize: 11, letterSpacing: 2, color: "var(--muted)", textTransform: "uppercase" }}>
            {dayData?.focus || "Workout"}
          </div>
          <div style={{ fontSize: 13, color: accentColor, fontWeight: "bold" }}>
            {session.exerciseIdx + 1} / {session.exercises.length}
          </div>
        </div>
        <ProgressRail
          current={session.exerciseIdx}
          total={session.exercises.length}
          color={accentColor}
        />

        {/* Hands-free status */}
        {session.phase !== "done" && (
          <div style={{ display: "flex", gap: 14, justifyContent: "center", alignItems: "center", paddingTop: 7 }}>
            {voiceSupported && (
              <span style={{
                fontSize: 9, letterSpacing: 1.5, textTransform: "uppercase",
                color: micError === "blocked" ? "#ef4444" : voiceActive ? "#4ade80" : "var(--muted3)",
              }}>
                {micError === "blocked" ? "🎙 mic blocked" : voiceActive ? "🎙 listening" : "🎙 off"}
              </span>
            )}
            {knockActive && (
              <span style={{ fontSize: 9, letterSpacing: 1.5, textTransform: "uppercase", color: "#4ade80" }}>
                ✊ tap ready
              </span>
            )}
            {knockNeedsPermission && (
              <button
                onClick={requestKnockPermission}
                style={{
                  fontSize: 9, letterSpacing: 1.5, textTransform: "uppercase",
                  color: "#e85d26", background: "none",
                  border: "1px solid #e85d2666", borderRadius: 4,
                  padding: "2px 8px", cursor: "pointer", fontFamily: "inherit",
                }}
              >
                ✊ enable tap
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Body ── */}
      {session.phase === "done" ? (
        <DoneScreen session={session} onClose={onEnd} />

      ) : session.phase === "resting" ? (
        <RestScreen
          secondsLeft={session.restSecondsLeft}
          totalSeconds={session.restTotalSeconds}
          onSkip={onSkipRest}
          nextExercise={session.exercises[session.exerciseIdx]}
          nextSet={session.setIdx}
        />

      ) : (
        <div
          style={{ flex: 1, display: "flex", flexDirection: "column", padding: "0 24px 24px" }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Exercise info */}
          <div style={{
            flex: 1, display: "flex", flexDirection: "column",
            justifyContent: "center", textAlign: "center",
          }}>
            {/* Caution badge */}
            {ex?.caution?.length > 0 && (
              <div style={{
                display: "inline-block", margin: "0 auto 16px",
                fontSize: 9, letterSpacing: 1, textTransform: "uppercase",
                background: "#f59e0b22", border: "1px solid #f59e0b55",
                borderRadius: 6, padding: "3px 10px", color: "#f59e0b",
              }}>
                ⚠ Modify if needed
              </div>
            )}

            {/* Exercise counter */}
            <div style={{
              fontSize: 10, letterSpacing: 3, color: "var(--muted)",
              textTransform: "uppercase", marginBottom: 14,
            }}>
              Exercise {session.exerciseIdx + 1} of {session.exercises.length}
            </div>

            {/* Exercise name */}
            <div style={{
              fontSize: 38, fontWeight: 900, lineHeight: 1.1, marginBottom: 8,
              color: "var(--text)",
            }}>
              {ex?.name}
            </div>

            {/* Sets target */}
            <div style={{ fontSize: 14, color: accentColor, marginBottom: 4, fontWeight: "bold" }}>
              {ex?.sets}
            </div>
            <div style={{ fontSize: 12, color: "var(--muted3)", maxWidth: 300, margin: "0 auto" }}>
              {ex?.notes}
            </div>

            {/* Set progress dots */}
            <SetDots
              completedCount={session.setIdx}
              total={TOTAL_SETS}
              color={accentColor}
            />

            {/* Timer or set indicator */}
            {isTimed ? (
              <>
                <ExerciseTimer secondsLeft={session.exerciseSecondsLeft} total={timerTotal} />
                <div style={{ fontSize: 11, color: "var(--muted3)", marginTop: 4 }}>
                  Set{" "}
                  <span style={{ color: "var(--text)", fontWeight: "bold", fontSize: 14 }}>
                    {session.setIdx + 1}
                  </span>{" "}
                  of {TOTAL_SETS} · hold until zero
                </div>
              </>
            ) : (
              <div style={{ fontSize: 13, color: "var(--muted2)" }}>
                Set{" "}
                <span style={{ color: "var(--text)", fontWeight: "bold", fontSize: 18 }}>
                  {session.setIdx + 1}
                </span>{" "}
                of {TOTAL_SETS}
              </div>
            )}
          </div>

          {/* Swipe hint */}
          <div style={{
            textAlign: "center", fontSize: 9, color: "var(--muted3)",
            letterSpacing: 1, marginBottom: 14,
          }}>
            ← skip · complete →
          </div>

          {/* Primary action */}
          <button
            onClick={onCompleteSet}
            style={{
              width: "100%", padding: "22px 0",
              borderRadius: 16, border: "none",
              background: isLastSet && isLastExercise ? "#4ade80" : accentColor,
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

          {/* Skip */}
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

      {/* ── Command flash ── */}
      {lastCommand && (
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          background: "#000000dd", backdropFilter: "blur(8px)",
          border: "1px solid #e85d2666",
          color: "#e85d26", padding: "14px 28px",
          borderRadius: 14, fontSize: 18, fontWeight: 900,
          letterSpacing: 1, pointerEvents: "none",
          zIndex: 10, animation: "fadeUp 0.2s ease",
          whiteSpace: "nowrap",
        }}>
          {lastCommand}
        </div>
      )}

      {/* ── Confirm exit modal ── */}
      {confirmExit && (
        <div
          onClick={() => setConfirmExit(false)}
          style={{
            position: "fixed", inset: 0, background: "#000000bb",
            zIndex: 300, display: "flex", alignItems: "center",
            justifyContent: "center", padding: 24,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: "var(--surface)", border: "1px solid var(--border)",
              borderRadius: 16, padding: "28px 24px",
              width: "100%", maxWidth: 360, textAlign: "center",
            }}
          >
            <div style={{ fontSize: 18, fontWeight: "bold", marginBottom: 8 }}>End workout?</div>
            <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 24 }}>
              Your progress so far will be saved.
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setConfirmExit(false)}
                style={{
                  flex: 1, padding: "14px", borderRadius: 10,
                  border: "1px solid var(--border2)", background: "transparent",
                  color: "var(--muted)", fontSize: 14, fontFamily: "inherit", cursor: "pointer",
                }}
              >
                Keep Going
              </button>
              <button
                onClick={onEnd}
                style={{
                  flex: 1, padding: "14px", borderRadius: 10,
                  border: "none", background: "#e85d26",
                  color: "#fff", fontSize: 14, fontWeight: "bold",
                  fontFamily: "inherit", cursor: "pointer",
                }}
              >
                End Workout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
