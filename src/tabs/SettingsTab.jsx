import { AILMENTS } from "../data/exercises";
import { AGE_RANGES } from "../data/schedule";

export default function SettingsTab({
  prefs, setPrefs,
  toggleAilment,
  restartMission, resetProgress,
  inputStyle,
}) {
  return (
    <>
      <div style={{ fontSize: 10, color: "var(--muted)", letterSpacing: 3, textTransform: "uppercase", marginBottom: 10 }}>Profile</div>

      <div style={{ marginBottom: 8 }}>
        <div style={{ fontSize: 11, color: "var(--muted3)", letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>Name (optional)</div>
        <input
          value={prefs.name}
          onChange={e => setPrefs(p => ({ ...p, name: e.target.value }))}
          placeholder="Your name"
          style={inputStyle}
        />
      </div>

      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, color: "var(--muted3)", letterSpacing: 1, textTransform: "uppercase", marginBottom: 8, marginTop: 12 }}>Age Range</div>
        <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
          {AGE_RANGES.map(range => {
            const active = prefs.ageRange === range;
            return (
              <button key={range} onClick={() => setPrefs(p => ({ ...p, ageRange: active ? "" : range }))} style={{
                padding: "8px 16px", borderRadius: 20, border: "1px solid",
                borderColor: active ? "#e85d26" : "var(--border2)",
                background: active ? "#e85d2622" : "transparent",
                color: active ? "#e85d26" : "var(--muted3)",
                fontSize: 13, fontFamily: "inherit", cursor: "pointer",
              }}>{range}</button>
            );
          })}
        </div>
      </div>

      <div style={{ fontSize: 10, color: "var(--muted)", letterSpacing: 3, textTransform: "uppercase", marginBottom: 8 }}>Physical Limitations</div>
      <div style={{ fontSize: 11, color: "var(--muted2)", marginBottom: 14 }}>
        Exercises that conflict with your selections will be flagged with a "Modify" badge in the Library and Schedule.
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
              <div style={{ fontSize: 14, fontWeight: "bold", color: active ? "#f59e0b" : "var(--text)", marginBottom: 3 }}>{a.label}</div>
              <div style={{ fontSize: 11, color: "var(--muted)" }}>{a.note}</div>
            </div>
          </div>
        );
      })}

      <div style={{ fontSize: 10, color: "var(--muted)", letterSpacing: 3, textTransform: "uppercase", marginBottom: 10, marginTop: 28 }}>Mission</div>
      <button
        onClick={restartMission}
        style={{
          width: "100%", padding: "13px", borderRadius: 11, marginBottom: 8,
          border: "1px solid var(--border2)", background: "transparent",
          color: "var(--muted)", fontSize: 13, fontFamily: "inherit", cursor: "pointer", letterSpacing: 1,
        }}
      >
        Restart 30-Day Mission
      </button>
      <div style={{ fontSize: 10, color: "var(--muted3)", textAlign: "center", marginBottom: 20 }}>
        Resets mission start date, completed sets, and workout history.
      </div>

      <div style={{ fontSize: 10, color: "var(--muted)", letterSpacing: 3, textTransform: "uppercase", marginBottom: 10 }}>Data</div>
      <button
        onClick={resetProgress}
        style={{
          width: "100%", padding: "13px", borderRadius: 11,
          border: "1px solid var(--danger-border)", background: "transparent",
          color: "#ef4444", fontSize: 13, fontFamily: "inherit", cursor: "pointer", letterSpacing: 1,
        }}
      >
        Reset Workout Progress
      </button>
      <div style={{ fontSize: 10, color: "var(--muted3)", textAlign: "center", marginTop: 6 }}>
        Clears logged sets and completed days. Keeps profile and mission start date.
      </div>
    </>
  );
}
