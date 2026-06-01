import { useState, useEffect } from "react";
import { CatIcon } from "./CatIcon";
import { ALL_EXERCISES, exerciseCategoryMap } from "../data/exercises";
import { EXERCISE_DEMOS } from "../data/exerciseDemos";
import { askCoach } from "../utils/aiCoach";

const API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY;

function getAilmentCacheKey(exName, ailments) {
  return `pt-form-tips:${exName}:${[...ailments].sort().join(",")}`;
}

function AiFormTips({ demoEx, prefs, AILMENTS }) {
  const [tip, setTip] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!prefs?.ailments?.length || !API_KEY) return;

    const cacheKey = getAilmentCacheKey(demoEx.name, prefs.ailments);
    const cached = localStorage.getItem(cacheKey);
    if (cached) { setTip(cached); return; }

    setLoading(true);
    const ailmentDescs = AILMENTS
      .filter(a => prefs.ailments.includes(a.key))
      .map(a => `${a.label} (${a.note})`)
      .join("; ");

    askCoach(
      `You are a physical therapist and certified strength coach.
Give 2-3 targeted form cues for the exercise based on the user's physical limitations.
Format each cue with a • prefix. Be specific and actionable — no generic advice.
Keep total response under 80 words.`,
      `Exercise: ${demoEx.name} — ${demoEx.sets}, ${demoEx.notes}
User: ${prefs.ageRange || "adult"}, Limitations: ${ailmentDescs}`,
      200
    ).then(text => {
      if (text) {
        localStorage.setItem(cacheKey, text);
        setTip(text);
      }
      setLoading(false);
    });
  }, [demoEx.name]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!prefs?.ailments?.length || !API_KEY) return null;

  return (
    <div style={{
      background: "var(--info-surface)", border: "1px solid #e85d2633",
      borderRadius: 10, padding: "12px 14px", marginBottom: 16,
    }}>
      <div style={{ fontSize: 9, color: "#e85d26", letterSpacing: 3, textTransform: "uppercase", marginBottom: 8 }}>
        Personalized for You
      </div>
      {loading ? (
        <div style={{ fontSize: 11, color: "var(--muted3)", display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--muted3)", animation: "breathe 1.2s ease-in-out infinite" }} />
          Generating tips for your profile...
        </div>
      ) : tip ? (
        tip.split("\n").filter(l => l.trim()).map((line, i) => (
          <div key={i} style={{ display: "flex", gap: 8, marginBottom: i < tip.split("\n").filter(l => l.trim()).length - 1 ? 7 : 0 }}>
            <span style={{ color: "#e85d26", fontSize: 10, marginTop: 2, flexShrink: 0 }}>▸</span>
            <span style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.45 }}>{line.replace(/^[•\-]\s*/, "")}</span>
          </div>
        ))
      ) : null}
    </div>
  );
}

export default function ExerciseDemoModal({ demoEx, setDemoEx, prefs, AILMENTS }) {
  if (!demoEx) return null;

  const demo = EXERCISE_DEMOS[demoEx.name];
  const catKey = exerciseCategoryMap[demoEx.name];
  const catColor = ALL_EXERCISES[catKey]?.color || "#e85d26";
  const ytQuery = encodeURIComponent(`${demoEx.name} exercise how to form`);

  return (
    <div
      onClick={() => setDemoEx(null)}
      style={{ position: "fixed", inset: 0, background: "#000000cc", zIndex: 100, display: "flex", alignItems: "flex-end", justifyContent: "center" }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "var(--surface)", border: "1px solid var(--border)",
          borderTop: `3px solid ${catColor}`,
          borderRadius: "20px 20px 0 0", padding: "16px 20px 36px",
          width: "100%", maxWidth: 480, maxHeight: "82vh", overflowY: "auto",
          animation: "slideUp 0.28s ease",
        }}
      >
        {/* Drag handle */}
        <div style={{ width: 36, height: 4, borderRadius: 2, background: "var(--border3)", margin: "0 auto 18px" }} />

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
          <div style={{ flex: 1, paddingRight: 12 }}>
            <div style={{ fontSize: 9, color: catColor, letterSpacing: 3, textTransform: "uppercase", marginBottom: 5, display: "flex", alignItems: "center", gap: 5 }}>
              <CatIcon icon={ALL_EXERCISES[catKey]?.icon} size={12} color={catColor} />{ALL_EXERCISES[catKey]?.label}
            </div>
            <div style={{ fontSize: 20, fontWeight: "bold", lineHeight: 1.2 }}>{demoEx.name}</div>
            <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 5 }}>{demoEx.sets} · {demoEx.notes}</div>
          </div>
          <button
            onClick={() => setDemoEx(null)}
            style={{ background: "var(--surface3)", border: "1px solid var(--border2)", borderRadius: 8, width: 32, height: 32, color: "var(--muted3)", fontSize: 16, cursor: "pointer", fontFamily: "inherit", flexShrink: 0 }}
          >✕</button>
        </div>

        {/* Caution callout */}
        {demoEx.caution?.length > 0 && (
          <div style={{ background: "var(--warn-surface)", border: "1px solid #f59e0b33", borderRadius: 10, padding: "10px 14px", marginBottom: 16 }}>
            <div style={{ fontSize: 9, color: "#f59e0b", letterSpacing: 3, textTransform: "uppercase", marginBottom: 5 }}>Caution</div>
            <div style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.5 }}>
              May need modification if you have <span style={{ color: "#f59e0b" }}>{demoEx.caution.join(" or ")} issues</span>. See safer options below.
            </div>
          </div>
        )}

        {/* AI personalized tips */}
        <AiFormTips demoEx={demoEx} prefs={prefs} AILMENTS={AILMENTS} />

        {/* Steps */}
        {demo?.steps.map((step, i) => (
          <div key={i} style={{ display: "flex", gap: 12, marginBottom: 14 }}>
            <div style={{
              width: 24, height: 24, borderRadius: "50%", flexShrink: 0,
              background: `${catColor}22`, border: `1px solid ${catColor}55`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 11, color: catColor, fontWeight: "bold",
            }}>{i + 1}</div>
            <div style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.55, paddingTop: 3 }}>{step}</div>
          </div>
        ))}

        {/* Form cues */}
        {demo?.cues && (
          <div style={{ background: "var(--cues-surface)", border: "1px solid var(--cues-border)", borderRadius: 10, padding: "12px 14px", marginTop: 6, marginBottom: 16 }}>
            <div style={{ fontSize: 9, color: "#4ade80", letterSpacing: 3, textTransform: "uppercase", marginBottom: 10 }}>Form Cues</div>
            {demo.cues.map((cue, i) => (
              <div key={i} style={{ display: "flex", gap: 8, marginBottom: i < demo.cues.length - 1 ? 8 : 0 }}>
                <span style={{ color: "#4ade80", fontSize: 10, marginTop: 2, flexShrink: 0 }}>▸</span>
                <span style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.4 }}>{cue}</span>
              </div>
            ))}
          </div>
        )}

        {/* Safer options */}
        {demoEx.substitutes?.length > 0 && (
          <div style={{ background: "var(--warn-surface)", border: "1px solid #f59e0b33", borderRadius: 10, padding: "12px 14px", marginBottom: 16 }}>
            <div style={{ fontSize: 9, color: "#f59e0b", letterSpacing: 3, textTransform: "uppercase", marginBottom: 10 }}>Safer Options</div>
            {demoEx.substitutes.map((subName, i) => {
              const subEx = Object.values(ALL_EXERCISES).flatMap(c => c.exercises).find(e => e.name === subName);
              return (
                <button
                  key={i}
                  onClick={() => subEx && setDemoEx(subEx)}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    width: "100%", background: "var(--surface)", border: "1px solid var(--border)",
                    borderRadius: 8, padding: "10px 12px", marginBottom: i < demoEx.substitutes.length - 1 ? 8 : 0,
                    cursor: "pointer", fontFamily: "inherit", textAlign: "left",
                  }}
                >
                  <div>
                    <div style={{ fontSize: 13, fontWeight: "bold", color: "var(--text)" }}>{subName}</div>
                    {subEx && <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>{subEx.sets} · {subEx.notes}</div>}
                  </div>
                  <span style={{ fontSize: 16, color: "#f59e0b", flexShrink: 0, marginLeft: 8 }}>→</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Free weight alternative */}
        {demoEx.freeWeightAlt && prefs?.gymType && prefs.gymType !== "bodyweight" && (
          <div style={{ background: "#1e3a5f22", border: "1px solid #3b82f633", borderRadius: 10, padding: "12px 14px", marginBottom: 16 }}>
            <div style={{ fontSize: 9, color: "#3b82f6", letterSpacing: 3, textTransform: "uppercase", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 12 }}>🏋️</span> Free Weight Alternative
            </div>
            <div style={{
              display: "flex", alignItems: "flex-start", justifyContent: "space-between",
              background: "var(--surface)", border: "1px solid #3b82f633",
              borderRadius: 8, padding: "11px 13px",
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: "bold", color: "var(--text)", marginBottom: 3 }}>{demoEx.freeWeightAlt.name}</div>
                <div style={{ fontSize: 11, color: "#3b82f6", marginBottom: 5, display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ fontSize: 10 }}>⚙</span> {demoEx.freeWeightAlt.equipment} · {demoEx.freeWeightAlt.sets}
                </div>
                <div style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.45 }}>{demoEx.freeWeightAlt.notes}</div>
              </div>
            </div>
          </div>
        )}

        {/* YouTube button */}
        <a
          href={`https://www.youtube.com/results?search_query=${ytQuery}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            width: "100%", padding: "13px", borderRadius: 11, boxSizing: "border-box",
            border: "1px solid #ff000033", background: "var(--yt-surface)",
            color: "#ff4444", fontSize: 13, textDecoration: "none",
            fontFamily: "inherit", letterSpacing: 0.5,
          }}
        >
          ▶ Watch on YouTube
        </a>
      </div>
    </div>
  );
}
