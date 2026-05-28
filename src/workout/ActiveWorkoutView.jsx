import { useState, useRef, useCallback } from "react";
import { useHandsFreeInput } from "./useHandsFreeInput";

const TOTAL_SETS = 3;

function getExerciseSeconds(ex) {
  if (!ex?.sets) return null;
  if (ex.sets.includes("/side") || ex.sets.includes("/dir")) return null;
  const match = ex.sets.match(/x(\d+)s/);
  return match ? parseInt(match[1], 10) : null;
}

function parseTargetReps(sets) {
  if (!sets || /x\d+s/.test(sets)) return null; // timed exercise — no rep count
  const m = sets.match(/x(\d+)/);
  return m ? parseInt(m[1], 10) : null;
}

// ─── Rep Counter ──────────────────────────────────────────────────────────────

function RepCounter({ targetReps, onConfirm }) {
  const [count, setCount] = useState(targetReps);
  return (
    <div
      onClick={() => onConfirm(count)}
      style={{
        position: "fixed", inset: 0, background: "#000000cc", zIndex: 300,
        display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: 20, padding: "32px 24px 24px",
          width: "100%", maxWidth: 300, textAlign: "center",
        }}
      >
        <div style={{ fontSize: 9, letterSpacing: 3, color: "var(--muted3)", textTransform: "uppercase", marginBottom: 20 }}>
          Reps completed
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 24, marginBottom: 28 }}>
          <button
            onClick={() => setCount(c => Math.max(1, c - 1))}
            style={{
              width: 52, height: 52, borderRadius: "50%", flexShrink: 0,
              border: "1px solid var(--border2)", background: "var(--surface2)",
              fontSize: 26, cursor: "pointer", fontFamily: "inherit", color: "var(--text)",
            }}
          >−</button>

          <div>
            <div style={{ fontSize: 72, fontWeight: 900, lineHeight: 1, color: "var(--text)" }}>{count}</div>
            {count !== targetReps && (
              <div style={{ fontSize: 10, color: "var(--muted3)", marginTop: 4 }}>target {targetReps}</div>
            )}
          </div>

          <button
            onClick={() => setCount(c => c + 1)}
            style={{
              width: 52, height: 52, borderRadius: "50%", flexShrink: 0,
              border: "1px solid var(--border2)", background: "var(--surface2)",
              fontSize: 26, cursor: "pointer", fontFamily: "inherit", color: "var(--text)",
            }}
          >+</button>
        </div>

        <button
          onClick={() => onConfirm(count)}
          style={{
            width: "100%", padding: "18px", borderRadius: 14,
            border: "none", background: "#e85d26",
            color: "#fff", fontSize: 16, fontWeight: "bold",
            fontFamily: "inherit", cursor: "pointer", letterSpacing: 0.5,
          }}
        >
          Log {count} rep{count !== 1 ? "s" : ""}
        </button>

        <div style={{ fontSize: 11, color: "var(--muted3)", marginTop: 12 }}>
          or tap outside to log {targetReps}
        </div>
      </div>
    </div>
  );
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

function DoneScreen({ session, onClose, onViewDemo }) {
  const elapsed = session.startedAt
    ? Math.round((Date.now() - session.startedAt) / 60000)
    : 0;
  const completedExercises = session.exercises.filter(ex => !session.skipped.includes(ex.name));
  const totalSets = completedExercises.length * TOTAL_SETS;

  return (
    <div style={{
      flex: 1, overflowY: "auto", padding: "28px 24px 32px", textAlign: "center",
    }}>
      <div style={{ fontSize: 56, marginBottom: 10, animation: "fadeUp 0.5s ease" }}>🎖️</div>

      <div style={{
        fontSize: 10, letterSpacing: 4, color: "#4ade80",
        textTransform: "uppercase", marginBottom: 8,
        animation: "fadeUp 0.5s 0.1s ease both",
      }}>
        Mission Complete
      </div>

      <div style={{
        fontSize: 28, fontWeight: 900, marginBottom: 24,
        animation: "fadeUp 0.5s 0.15s ease both",
      }}>
        Workout Done
      </div>

      {/* Stats */}
      <div style={{
        display: "flex", gap: 10, marginBottom: 24, width: "100%",
        animation: "fadeUp 0.5s 0.2s ease both",
      }}>
        {[
          { label: "Exercises", value: completedExercises.length, color: "#e85d26" },
          { label: "Minutes",   value: elapsed || "<1",           color: "#8b5cf6" },
          { label: "Sets",      value: totalSets,                 color: "#10b981" },
        ].map(s => (
          <div key={s.label} style={{
            flex: 1, background: "var(--surface2)",
            border: `1px solid ${s.color}33`,
            borderTop: `3px solid ${s.color}`,
            borderRadius: 12, padding: "14px 8px", textAlign: "center",
          }}>
            <div style={{ fontSize: 26, fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: 9, color: "var(--muted)", letterSpacing: 1, marginTop: 5, textTransform: "uppercase" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Exercise list */}
      <div style={{ width: "100%", textAlign: "left", marginBottom: 24, animation: "fadeUp 0.5s 0.25s ease both" }}>
        <div style={{ fontSize: 9, color: "var(--muted3)", letterSpacing: 3, textTransform: "uppercase", marginBottom: 10 }}>
          Exercises Completed
        </div>
        {completedExercises.map((ex, i) => (
          <button
            key={i}
            onClick={() => onViewDemo?.(ex)}
            style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              width: "100%", background: "var(--surface2)", border: "1px solid var(--border)",
              borderRadius: 10, padding: "11px 13px", marginBottom: 6,
              cursor: "pointer", fontFamily: "inherit", textAlign: "left",
              boxSizing: "border-box",
            }}
          >
            <div>
              <div style={{ fontSize: 13, fontWeight: "bold", color: "var(--text)" }}>{ex.name}</div>
              <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>{ex.sets}</div>
            </div>
            <span style={{ fontSize: 12, color: "var(--muted3)", flexShrink: 0, marginLeft: 8 }}>ⓘ</span>
          </button>
        ))}
        {session.skipped.length > 0 && (
          <div style={{ fontSize: 11, color: "var(--muted3)", marginTop: 6 }}>
            Skipped: {session.skipped.join(", ")}
          </div>
        )}
      </div>

      <button
        onClick={onClose}
        style={{
          width: "100%", padding: "18px",
          borderRadius: 14, border: "none", background: "#e85d26",
          color: "#fff", fontSize: 16, fontWeight: "bold",
          fontFamily: "inherit", cursor: "pointer", letterSpacing: 1,
        }}
      >
        Back to Schedule
      </button>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function ActiveWorkoutView({ session, dayData, onCompleteSet, onSkipExercise, onSkipRest, onEnd, onViewDemo }) {
  const [confirmExit, setConfirmExit] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [pendingRep, setPendingRep] = useState(null); // targetReps while counter is open
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);

  const ex = session.exercises[session.exerciseIdx];
  const timerTotal = getExerciseSeconds(ex);
  const isTimed = session.exerciseSecondsLeft !== null && timerTotal !== null;
  const targetReps = parseTargetReps(ex?.sets);

  const accentColor = dayData?.color || "#e85d26";
  const isLastSet = session.setIdx === TOTAL_SETS - 1;
  const isLastExercise = session.exerciseIdx === session.exercises.length - 1;

  // Voice/knock path: auto-log target reps without showing the overlay
  const completeSetHandsFree = useCallback(() => {
    onCompleteSet(targetReps ?? undefined);
  }, [onCompleteSet, targetReps]);

  const {
    voiceActive, voiceSupported, micError,
    knockActive, knockNeedsPermission, requestKnockPermission,
    lastCommand,
  } = useHandsFreeInput({ phase: session.phase, onCompleteSet: completeSetHandsFree, onSkipExercise, onSkipRest, voiceEnabled });

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
    if (dx > 0) {
      const target = parseTargetReps(session.exercises[session.exerciseIdx]?.sets);
      if (target !== null && session.exerciseSecondsLeft === null) setPendingRep(target);
      else onCompleteSet();
    } else {
      onSkipExercise();
    }
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

        {/* Hands-free controls */}
        {session.phase !== "done" && (
          <div style={{ display: "flex", gap: 8, justifyContent: "center", alignItems: "center", paddingTop: 8 }}>
            {/* Knock indicator */}
            {knockActive && (
              <div style={{
                display: "flex", alignItems: "center", gap: 5,
                padding: "4px 10px", borderRadius: 20,
                background: "#4ade8018", border: "1px solid #4ade8044",
              }}>
                <span style={{ fontSize: 11 }}>✊</span>
                <span style={{ fontSize: 9, letterSpacing: 1.5, textTransform: "uppercase", color: "#4ade80" }}>double-knock</span>
              </div>
            )}
            {knockNeedsPermission && (
              <button
                onClick={requestKnockPermission}
                style={{
                  display: "flex", alignItems: "center", gap: 5,
                  padding: "4px 10px", borderRadius: 20,
                  background: "#e85d2618", border: "1px solid #e85d2644",
                  fontSize: 9, letterSpacing: 1.5, textTransform: "uppercase",
                  color: "#e85d26", cursor: "pointer", fontFamily: "inherit",
                }}
              >
                ✊ enable tap
              </button>
            )}
            {/* Voice toggle — off by default to keep music playing */}
            {voiceSupported && (
              <button
                onClick={() => setVoiceEnabled(v => !v)}
                title={voiceEnabled ? "Disable voice (restores music)" : "Enable voice commands (interrupts music)"}
                style={{
                  display: "flex", alignItems: "center", gap: 5,
                  padding: "4px 10px", borderRadius: 20, cursor: "pointer",
                  fontFamily: "inherit",
                  background: voiceEnabled ? "#4ade8018" : "transparent",
                  border: `1px solid ${micError === "blocked" ? "#ef444444" : voiceEnabled ? "#4ade8044" : "var(--border2)"}`,
                }}
              >
                <span style={{ fontSize: 11 }}>{micError === "blocked" ? "🚫" : "🎙"}</span>
                <span style={{
                  fontSize: 9, letterSpacing: 1.5, textTransform: "uppercase",
                  color: micError === "blocked" ? "#ef4444" : voiceEnabled ? "#4ade80" : "var(--muted3)",
                }}>
                  {micError === "blocked" ? "blocked" : voiceEnabled ? (voiceActive ? "listening" : "starting…") : "voice off"}
                </span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Body ── */}
      {session.phase === "done" ? (
        <DoneScreen session={session} onClose={onEnd} onViewDemo={onViewDemo} />

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

            {/* Exercise name + info button */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 8 }}>
              <div style={{
                fontSize: 38, fontWeight: 900, lineHeight: 1.1,
                color: "var(--text)",
              }}>
                {ex?.name}
              </div>
              {onViewDemo && ex && (
                <button
                  onTouchEnd={e => { e.stopPropagation(); onViewDemo(ex); }}
                  onClick={e => { e.stopPropagation(); onViewDemo(ex); }}
                  style={{
                    width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
                    border: "1px solid var(--border2)", background: "var(--surface2)",
                    color: "var(--muted)", fontSize: 14, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "inherit",
                  }}
                >
                  ⓘ
                </button>
              )}
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
            onClick={() => {
              const target = parseTargetReps(ex?.sets);
              if (!isTimed && target !== null) {
                setPendingRep(target); // open rep counter
              } else {
                onCompleteSet(); // timed or unknown — skip counter
              }
            }}
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

      {/* ── Rep counter overlay ── */}
      {pendingRep !== null && (
        <RepCounter
          targetReps={pendingRep}
          onConfirm={(reps) => { setPendingRep(null); onCompleteSet(reps); }}
        />
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
