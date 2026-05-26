import { CatIcon } from "../components/CatIcon";
import { ALL_EXERCISES, categories } from "../data/exercises";

const DIFFICULTY_FILTERS = [
  { key: "all",          label: "All" },
  { key: "beginner",     label: "Beginner",     color: "#22c55e" },
  { key: "intermediate", label: "Intermediate", color: "#f59e0b" },
  { key: "advanced",     label: "Advanced",     color: "#ef4444" },
];

export default function LibraryTab({
  search, setSearch,
  difficultyFilter, setDifficultyFilter,
  selectedCat, setSelectedCat,
  setDemoEx,
  hasCaution,
  filteredExercises,
  inputStyle,
}) {
  return (
    <>
      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search exercises..."
        style={{ ...inputStyle, marginBottom: 10 }}
      />

      {/* Difficulty filter pills */}
      <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
        {DIFFICULTY_FILTERS.map(d => {
          const active = difficultyFilter === d.key;
          const c = d.color || "var(--muted)";
          return (
            <button key={d.key} onClick={() => setDifficultyFilter(d.key)} style={{
              padding: "5px 12px", borderRadius: 20, border: `1px solid ${active ? c : "var(--border2)"}`,
              background: active ? c + "22" : "transparent",
              color: active ? c : "var(--muted3)",
              fontSize: 10, letterSpacing: 0.5, fontFamily: "inherit", cursor: "pointer",
            }}>{d.label}</button>
          );
        })}
      </div>

      {/* Category tabs */}
      {!search && (
        <div style={{ display: "flex", gap: 6, marginBottom: 14, overflowX: "auto", paddingBottom: 6 }}>
          {categories.map(cat => (
            <button key={cat.key} onClick={() => setSelectedCat(cat.key)} style={{
              whiteSpace: "nowrap", padding: "7px 12px", borderRadius: 20, border: "1px solid",
              borderColor: selectedCat === cat.key ? cat.color : "var(--border2)",
              background: selectedCat === cat.key ? cat.color + "22" : "transparent",
              color: selectedCat === cat.key ? cat.color : "var(--muted3)",
              fontSize: 11, fontFamily: "inherit", cursor: "pointer",
            }}>
              <CatIcon icon={cat.icon} size={13} color={selectedCat === cat.key ? cat.color : "var(--muted3)"} /> {cat.label} ({cat.exercises.length})
            </button>
          ))}
        </div>
      )}

      <div style={{ fontSize: 10, letterSpacing: 3, color: "var(--muted)", textTransform: "uppercase", marginBottom: 10 }}>
        {search
          ? `${filteredExercises.length} results for "${search}"`
          : `${ALL_EXERCISES[selectedCat]?.label} — ${ALL_EXERCISES[selectedCat]?.exercises.length} exercises`}
      </div>

      {filteredExercises.map((ex, idx) => {
        const warn = hasCaution(ex);
        const catKey = search ? (Object.entries(ALL_EXERCISES).find(([, cat]) => cat.exercises.some(e => e.name === ex.name))?.[0] ?? selectedCat) : selectedCat;
        const catMeta = ALL_EXERCISES[catKey];
        const dc = ex.difficulty === "beginner" ? "#22c55e" : ex.difficulty === "advanced" ? "#ef4444" : "#f59e0b";
        return (
          <div key={idx} style={{
            background: warn ? "var(--warn-surface)" : "var(--surface)",
            border: `1px solid ${warn ? "#f59e0b44" : "var(--border)"}`,
            borderRadius: 11, padding: "13px 15px", marginBottom: 8,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4, flexWrap: "wrap" }}>
              <span style={{ fontSize: 14, fontWeight: "bold" }}>{ex.name}</span>
              <span style={{ fontSize: 9, letterSpacing: 0.5, textTransform: "uppercase", background: dc + "22", border: `1px solid ${dc}44`, borderRadius: 4, padding: "1px 6px", color: dc }}>
                {ex.difficulty}
              </span>
              {search && catMeta && (
                <span style={{
                  fontSize: 9, letterSpacing: 1, textTransform: "uppercase",
                  background: catMeta.color + "22", border: `1px solid ${catMeta.color}44`,
                  borderRadius: 4, padding: "1px 6px", color: catMeta.color,
                }}>{catMeta.label}</span>
              )}
              {warn && (
                <span style={{
                  fontSize: 9, letterSpacing: 1, textTransform: "uppercase",
                  background: "#f59e0b22", border: "1px solid #f59e0b55",
                  borderRadius: 4, padding: "1px 5px", color: "#f59e0b",
                }}>Modify</span>
              )}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6 }}>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                <span style={{ background: "var(--surface3)", border: "1px solid var(--border3)", borderRadius: 5, padding: "2px 7px", fontSize: 11, color: "#e85d26" }}>{ex.sets}</span>
                <span style={{ fontSize: 11, color: "var(--muted)" }}>{ex.notes}</span>
              </div>
              <button
                onClick={() => setDemoEx(ex)}
                title="How to perform"
                style={{
                  background: "none", border: "1px solid var(--border2)", borderRadius: 7,
                  width: 28, height: 28, color: "var(--muted)", fontSize: 13,
                  cursor: "pointer", flexShrink: 0, fontFamily: "inherit",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >ⓘ</button>
            </div>
          </div>
        );
      })}
    </>
  );
}
