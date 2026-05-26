import { AILMENTS } from "../data/exercises";
import { AGE_RANGES } from "../data/schedule";

function SectionHeader({ label }) {
  return (
    <div style={{
      fontSize: 9, color: "var(--muted3)", letterSpacing: 3,
      textTransform: "uppercase", marginTop: 24, marginBottom: 8,
    }}>{label}</div>
  );
}

function Card({ children, danger }) {
  return (
    <div style={{
      background: danger ? "#1a080822" : "var(--surface)",
      border: `1px solid ${danger ? "var(--danger-border)" : "var(--border)"}`,
      borderRadius: 13, overflow: "hidden",
    }}>
      {children}
    </div>
  );
}

function Row({ children, style }) {
  return (
    <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--border-subtle)", ...style }}>
      {children}
    </div>
  );
}

export default function SettingsTab({
  prefs, setPrefs,
  toggleAilment,
  restartMission, resetProgress,
  inputStyle,
}) {
  return (
    <>
      {/* ── Profile ── */}
      <SectionHeader label="Profile" />
      <Card>
        <Row>
          <div style={{ fontSize: 10, color: "var(--muted3)", letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>Name</div>
          <input
            value={prefs.name}
            onChange={e => setPrefs(p => ({ ...p, name: e.target.value }))}
            placeholder="Your name (optional)"
            style={{ ...inputStyle, background: "var(--surface2)" }}
          />
        </Row>
        <Row style={{ borderBottom: "none" }}>
          <div style={{ fontSize: 10, color: "var(--muted3)", letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 }}>Age Range</div>
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
        </Row>
      </Card>

      {/* ── Physical Limitations ── */}
      <SectionHeader label="Physical Limitations" />
      <div style={{ fontSize: 11, color: "var(--muted2)", marginBottom: 12, lineHeight: 1.5 }}>
        Conflicting exercises will show a <span style={{ color: "#f59e0b" }}>Modify</span> badge with safer alternatives.
      </div>
      <Card>
        {AILMENTS.map((a, idx) => {
          const active = prefs.ailments.includes(a.key);
          return (
            <div
              key={a.key}
              onClick={() => toggleAilment(a.key)}
              style={{
                padding: "14px 16px",
                borderBottom: idx < AILMENTS.length - 1 ? "1px solid var(--border-subtle)" : "none",
                background: active ? "var(--warn-surface)" : "transparent",
                display: "flex", alignItems: "center", gap: 13, cursor: "pointer",
                transition: "background 0.15s",
              }}
            >
              <div style={{
                width: 20, height: 20, borderRadius: 6, flexShrink: 0,
                border: `2px solid ${active ? "#f59e0b" : "var(--border3)"}`,
                background: active ? "#f59e0b" : "transparent",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "background 0.15s, border-color 0.15s",
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
      </Card>

      {/* ── Mission ── */}
      <SectionHeader label="Mission" />
      <Card>
        <Row style={{ borderBottom: "none" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: "bold", marginBottom: 3 }}>Restart 30-Day Mission</div>
              <div style={{ fontSize: 11, color: "var(--muted)", lineHeight: 1.4 }}>
                Resets mission start, completed sets, and workout history.
              </div>
            </div>
            <button
              onClick={restartMission}
              style={{
                padding: "9px 16px", borderRadius: 9, marginLeft: 12,
                border: "1px solid #e85d2666", background: "#e85d2614",
                color: "#e85d26", fontSize: 12, fontFamily: "inherit",
                cursor: "pointer", letterSpacing: 0.5, flexShrink: 0,
                fontWeight: "bold",
              }}
            >Restart</button>
          </div>
        </Row>
      </Card>

      {/* ── Danger Zone ── */}
      <SectionHeader label="Danger Zone" />
      <Card danger>
        <Row style={{ borderBottom: "none" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: "bold", color: "#ef4444", marginBottom: 3 }}>Reset Workout Progress</div>
              <div style={{ fontSize: 11, color: "var(--muted)", lineHeight: 1.4 }}>
                Clears all logged sets and completed days. Keeps profile.
              </div>
            </div>
            <button
              onClick={resetProgress}
              style={{
                padding: "9px 16px", borderRadius: 9, marginLeft: 12,
                border: "1px solid var(--danger-border)", background: "#ef444414",
                color: "#ef4444", fontSize: 12, fontFamily: "inherit",
                cursor: "pointer", letterSpacing: 0.5, flexShrink: 0,
                fontWeight: "bold",
              }}
            >Reset</button>
          </div>
        </Row>
      </Card>

      <div style={{ height: 16 }} />
    </>
  );
}
