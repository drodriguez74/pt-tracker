import { CatIcon } from "../components/CatIcon";
import { ALL_EXERCISES, categories, exerciseCategoryMap } from "../data/exercises";

const DIFFICULTY = {
  beginner:     { label: "Beginner",     color: "#22c55e" },
  intermediate: { label: "Intermediate", color: "#f59e0b" },
  advanced:     { label: "Advanced",     color: "#ef4444" },
};

const DIFF_FILTERS = [
  { key: "all" },
  { key: "beginner",     color: "#22c55e" },
  { key: "intermediate", color: "#f59e0b" },
  { key: "advanced",     color: "#ef4444" },
];

// ── Difficulty distribution bar ───────────────────────────────────────────────

function DiffBar({ exercises }) {
  const b = exercises.filter(e => e.difficulty === "beginner").length;
  const i = exercises.filter(e => e.difficulty === "intermediate").length;
  const a = exercises.filter(e => e.difficulty === "advanced").length;
  const total = (b + i + a) || 1;
  return (
    <div style={{ display: "flex", height: 3, borderRadius: 2, overflow: "hidden", width: "100%", gap: 1 }}>
      {b > 0 && <div style={{ flex: b / total, background: "#22c55e77" }} />}
      {i > 0 && <div style={{ flex: i / total, background: "#f59e0b77" }} />}
      {a > 0 && <div style={{ flex: a / total, background: "#ef444477" }} />}
    </div>
  );
}

// ── Category grid ─────────────────────────────────────────────────────────────

function CategoryGrid({ selectedCat, setSelectedCat }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
      {categories.map(cat => {
        const active = selectedCat === cat.key;
        return (
          <button
            key={cat.key}
            onClick={() => setSelectedCat(cat.key)}
            style={{
              background: active ? cat.color + "18" : "var(--surface)",
              border: `1px solid ${active ? cat.color + "99" : "var(--border)"}`,
              borderRadius: 12, padding: "13px 12px",
              cursor: "pointer", textAlign: "left", fontFamily: "inherit",
              boxShadow: active ? `0 0 12px ${cat.color}22` : "none",
              outline: "none",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <CatIcon icon={cat.icon} size={20} color={active ? cat.color : "var(--muted)"} />
              <span style={{
                fontSize: 20, fontWeight: 900, lineHeight: 1,
                color: active ? cat.color : "var(--muted3)",
              }}>
                {cat.exercises.length}
              </span>
            </div>
            <div style={{
              fontSize: 11, fontWeight: "bold", lineHeight: 1.3,
              marginBottom: 8, color: active ? "var(--text)" : "var(--muted)",
            }}>
              {cat.label}
            </div>
            <DiffBar exercises={cat.exercises} />
          </button>
        );
      })}
    </div>
  );
}

// ── Exercise card ─────────────────────────────────────────────────────────────

function ExerciseCard({ ex, catColor, warn, setDemoEx }) {
  const d = DIFFICULTY[ex.difficulty] || DIFFICULTY.intermediate;
  const accentColor = warn ? "#f59e0b" : catColor;

  return (
    <button
      onClick={() => setDemoEx(ex)}
      style={{
        display: "block", width: "100%", textAlign: "left",
        background: warn ? "var(--warn-surface)" : "var(--surface)",
        border: `1px solid ${warn ? "#f59e0b44" : "var(--border)"}`,
        borderLeft: `3px solid ${accentColor}`,
        borderRadius: 11, padding: "12px 14px", marginBottom: 8,
        cursor: "pointer", fontFamily: "inherit", outline: "none",
      }}
    >
      {/* Name + difficulty badge */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
        <span style={{ fontSize: 14, fontWeight: "bold", color: "var(--text)", lineHeight: 1.3, flex: 1 }}>
          {ex.name}
        </span>
        <span style={{
          fontSize: 9, flexShrink: 0, textTransform: "uppercase", letterSpacing: 0.5,
          background: d.color + "22", border: `1px solid ${d.color}44`,
          borderRadius: 4, padding: "2px 6px", color: d.color,
        }}>
          {d.label}
        </span>
      </div>

      {/* Sets + notes + cta */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, marginTop: 7 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 0 }}>
          <span style={{
            background: "var(--surface3)", border: "1px solid var(--border3)",
            borderRadius: 5, padding: "2px 8px",
            fontSize: 11, fontWeight: "bold", color: accentColor, flexShrink: 0,
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
        <span style={{ fontSize: 10, color: "var(--muted3)", flexShrink: 0, letterSpacing: 0.3 }}>
          How to →
        </span>
      </div>

      {warn && (
        <div style={{ marginTop: 5, fontSize: 10, color: "#f59e0b", letterSpacing: 0.3 }}>
          ⚠ Modify if needed
        </div>
      )}
    </button>
  );
}

// ── Section label ─────────────────────────────────────────────────────────────

function SectionLabel({ icon, color, label, count }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 7,
      fontSize: 9, color: color || "var(--muted)",
      letterSpacing: 3, textTransform: "uppercase",
      marginTop: 12, marginBottom: 8,
    }}>
      {icon && <CatIcon icon={icon} size={12} color={color} />}
      {label}{count != null && ` — ${count}`}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function LibraryTab({
  search, setSearch,
  difficultyFilter, setDifficultyFilter,
  selectedCat, setSelectedCat,
  setDemoEx,
  hasCaution,
  filteredExercises,
  inputStyle,
}) {
  const activeCat = categories.find(c => c.key === selectedCat);

  // Group search results by category, preserving encounter order
  const grouped = search.length > 1
    ? (() => {
        const map = new Map();
        for (const ex of filteredExercises) {
          const catKey = exerciseCategoryMap[ex.name];
          const catMeta = categories.find(c => c.key === catKey);
          const key = catKey || "__other";
          if (!map.has(key)) map.set(key, { meta: catMeta, exercises: [] });
          map.get(key).exercises.push(ex);
        }
        return [...map.entries()];
      })()
    : null;

  return (
    <>
      {/* Search */}
      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search exercises..."
        style={{ ...inputStyle, marginBottom: 12 }}
      />

      {/* Difficulty filter */}
      <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
        {DIFF_FILTERS.map(d => {
          const active = difficultyFilter === d.key;
          const c = d.color || "var(--muted)";
          const label = d.key === "all" ? "All" : d.key.charAt(0).toUpperCase() + d.key.slice(1);
          return (
            <button key={d.key} onClick={() => setDifficultyFilter(d.key)} style={{
              padding: "5px 12px", borderRadius: 20,
              border: `1px solid ${active ? c : "var(--border2)"}`,
              background: active ? c + "22" : "transparent",
              color: active ? c : "var(--muted3)",
              fontSize: 10, letterSpacing: 0.5, fontFamily: "inherit",
              cursor: "pointer", outline: "none",
            }}>
              {label}
            </button>
          );
        })}
      </div>

      {/* Category grid — hidden during search */}
      {!search && <CategoryGrid selectedCat={selectedCat} setSelectedCat={setSelectedCat} />}

      {/* Context line */}
      {!search ? (
        <SectionLabel
          icon={activeCat?.icon}
          color={activeCat?.color}
          label={activeCat?.label}
          count={`${filteredExercises.length} exercises`}
        />
      ) : (
        <div style={{ fontSize: 9, color: "var(--muted)", letterSpacing: 3, textTransform: "uppercase", marginBottom: 12 }}>
          {filteredExercises.length} result{filteredExercises.length !== 1 ? "s" : ""} for &ldquo;{search}&rdquo;
        </div>
      )}

      {/* Exercise list */}
      {grouped ? (
        grouped.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 20px", color: "var(--muted3)" }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>🔍</div>
            <div style={{ fontSize: 14 }}>No exercises found</div>
          </div>
        ) : (
          grouped.map(([key, { meta, exercises: exs }]) => (
            <div key={key}>
              <SectionLabel
                icon={meta?.icon}
                color={meta?.color}
                label={meta?.label || "Other"}
              />
              {exs.map((ex, idx) => (
                <ExerciseCard
                  key={idx} ex={ex}
                  catColor={meta?.color || "#e85d26"}
                  warn={hasCaution(ex)}
                  setDemoEx={setDemoEx}
                />
              ))}
            </div>
          ))
        )
      ) : (
        filteredExercises.map((ex, idx) => (
          <ExerciseCard
            key={idx} ex={ex}
            catColor={activeCat?.color || "#e85d26"}
            warn={hasCaution(ex)}
            setDemoEx={setDemoEx}
          />
        ))
      )}
    </>
  );
}
