import { useState, useRef, useEffect } from "react";
import { FiSend, FiX, FiTrash2 } from "react-icons/fi";
import { PROGRESSION } from "../data/schedule";

const API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY;
const STORAGE_KEY = "pt-coach-history";
const MAX_HISTORY = 20;

const STARTERS = [
  "What should I modify today given my limitations?",
  "I only have 15 minutes — what's the priority?",
  "How am I progressing on this mission?",
  "Walk me through today's workout.",
];

// ── System prompt builder ──────────────────────────────────────────────────────

function buildSystemPrompt({ prefs, missionDay, weekNumber, streak, dayData, dayExercises, completed, completedWorkoutDates, AILMENTS }) {
  const todayStr = new Date().toISOString().split("T")[0];
  const weekProg = PROGRESSION[Math.min(weekNumber, 3)];

  const ailmentLines = AILMENTS
    .filter(a => prefs.ailments.includes(a.key))
    .map(a => `  - ${a.label}: ${a.note}`)
    .join("\n");

  const todayLines = dayExercises.length === 0
    ? "  Rest day."
    : dayExercises.map(ex => `  - ${ex.name} (${ex.sets}) — ${ex.notes}`).join("\n");

  // Derive last 3 completed workout dates (excluding today)
  const allDates = [...new Set(Object.keys(completed).map(k => k.split(":")[0]))]
    .filter(d => d !== todayStr)
    .sort()
    .reverse()
    .slice(0, 3);

  const recentLines = allDates.length === 0
    ? "  No workouts logged yet."
    : allDates.map(date => {
        const exNames = [...new Set(
          Object.keys(completed)
            .filter(k => k.startsWith(date + ":") && completed[k])
            .map(k => k.split(":")[1].replace(/-\d$/, ""))
        )];
        return `  - ${date}: ${exNames.join(", ")}`;
      }).join("\n");

  return `You are a concise, practical military calisthenics coach inside PT Tracker — a low-impact bodyweight fitness app for adults.
Keep every response to 2–4 sentences or a short bulleted list (max 5 items).
Only reference exercises by their exact names from the PT Tracker library (do not invent exercises).
For any pain or injury question, advise stopping the movement rather than pushing through.

USER PROFILE
Name: ${prefs.name || "Soldier"}
Age range: ${prefs.ageRange || "not set"}
Physical limitations:
${ailmentLines || "  None selected."}

MISSION STATUS
Day ${missionDay} · ${weekProg.label} — ${weekProg.sub}
Streak: ${streak.current} day(s) | Best: ${streak.best} | Total workouts: ${streak.total}

TODAY'S SCHEDULE — ${dayData?.day || "?"}: ${dayData?.focus || "Rest"}
${todayLines}

RECENT WORKOUTS (last 3)
${recentLines}`;
}

// ── Typing dots ───────────────────────────────────────────────────────────────

function TypingDots() {
  return (
    <div style={{ display: "flex", gap: 4, padding: "12px 14px", alignItems: "center" }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          width: 6, height: 6, borderRadius: "50%",
          background: "var(--muted3)",
          animation: "breathe 1.2s ease-in-out infinite",
          animationDelay: `${i * 0.18}s`,
        }} />
      ))}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function CoachChat({
  isOpen, onClose,
  prefs, missionDay, weekNumber, streak,
  dayData, dayExercises, completed, completedWorkoutDates,
  AILMENTS,
}) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const abortRef = useRef(null);
  const readerRef = useRef(null);

  // Load history on open
  useEffect(() => {
    if (!isOpen) return;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      setMessages(saved ? JSON.parse(saved) : []);
    } catch {
      setMessages([]);
    }
    setTimeout(() => inputRef.current?.focus(), 120);
  }, [isOpen]);

  // Auto-scroll on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Persist on change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-MAX_HISTORY)));
    }
  }, [messages]);

  function handleClose() {
    if (loading) {
      abortRef.current?.abort();
      readerRef.current?.cancel().catch(() => {});
    }
    onClose();
  }

  function clearHistory() {
    localStorage.removeItem(STORAGE_KEY);
    setMessages([]);
  }

  async function sendMessage(text) {
    const trimmed = (text ?? input).trim();
    if (!trimmed || loading) return;
    setInput("");

    if (!API_KEY) {
      setMessages(prev => [
        ...prev,
        { role: "user", content: trimmed },
        { role: "assistant", content: "No API key configured. Add `VITE_ANTHROPIC_API_KEY` to your `.env` file and restart the dev server." },
      ]);
      return;
    }

    const userMsg = { role: "user", content: trimmed };
    const placeholder = { role: "assistant", content: "" };
    setMessages(prev => [...prev, userMsg, placeholder]);
    setLoading(true);

    const controller = new AbortController();
    abortRef.current = controller;

    const context = { prefs, missionDay, weekNumber, streak, dayData, dayExercises, completed, completedWorkoutDates, AILMENTS };
    const systemPrompt = buildSystemPrompt(context);

    // Build the API messages array (only prior messages, not the placeholder)
    const apiMessages = [...messages, userMsg].map(m => ({ role: m.role, content: m.content }));

    let accumulated = "";

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          "x-api-key": API_KEY,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 512,
          stream: true,
          system: systemPrompt,
          messages: apiMessages,
        }),
      });

      if (!response.ok) {
        const err = await response.text().catch(() => response.statusText);
        throw new Error(err);
      }

      const reader = response.body.getReader();
      readerRef.current = reader;
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        for (const line of chunk.split("\n")) {
          if (!line.startsWith("data: ") || line === "data: [DONE]") continue;
          try {
            const parsed = JSON.parse(line.slice(6));
            if (parsed.type === "content_block_delta" && parsed.delta?.type === "text_delta") {
              accumulated += parsed.delta.text;
              setMessages(prev => [
                ...prev.slice(0, -1),
                { role: "assistant", content: accumulated },
              ]);
            }
          } catch {
            // malformed SSE line — skip
          }
        }
      }
    } catch (err) {
      if (err.name === "AbortError") {
        // Stream was cancelled — leave partial content as-is
      } else {
        const errMsg = err.message?.includes("401")
          ? "Invalid API key. Check your `VITE_ANTHROPIC_API_KEY` in `.env`."
          : "Connection error. Try again in a moment.";
        setMessages(prev => [
          ...prev.slice(0, -1),
          { role: "assistant", content: errMsg },
        ]);
      }
    } finally {
      setLoading(false);
      readerRef.current = null;
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  if (!isOpen) return null;

  return (
    <div
      onClick={handleClose}
      style={{ position: "fixed", inset: 0, background: "#000000cc", zIndex: 100, display: "flex", alignItems: "flex-end", justifyContent: "center" }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "var(--surface)", border: "1px solid var(--border)",
          borderTop: "3px solid #e85d26",
          borderRadius: "20px 20px 0 0",
          width: "100%", maxWidth: 480, height: "72vh",
          display: "flex", flexDirection: "column",
          animation: "slideUp 0.28s ease",
        }}
      >
        {/* Drag handle */}
        <div style={{ width: 36, height: 4, borderRadius: 2, background: "var(--border3)", margin: "14px auto 0", flexShrink: 0 }} />

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 18px 10px", borderBottom: "1px solid var(--border-subtle)", flexShrink: 0 }}>
          <div>
            <div style={{ fontSize: 9, color: "#e85d26", letterSpacing: 3, textTransform: "uppercase" }}>AI Coach</div>
            {prefs.name && <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>Hey, {prefs.name}</div>}
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {messages.length > 0 && (
              <button
                onClick={clearHistory}
                style={{ background: "var(--surface3)", border: "1px solid var(--border2)", borderRadius: 8, width: 30, height: 30, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted3)" }}
              ><FiTrash2 size={13} /></button>
            )}
            <button
              onClick={handleClose}
              style={{ background: "var(--surface3)", border: "1px solid var(--border2)", borderRadius: 8, width: 30, height: 30, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted3)", fontSize: 14 }}
            ><FiX size={14} /></button>
          </div>
        </div>

        {/* Message list */}
        <div style={{ flex: 1, overflowY: "auto", padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10 }}>

          {/* Starter prompts */}
          {messages.length === 0 && (
            <div>
              <div style={{ fontSize: 9, color: "var(--muted3)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 }}>Suggested questions</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7 }}>
                {STARTERS.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(s)}
                    style={{
                      background: "var(--surface2)", border: "1px solid var(--border2)",
                      borderRadius: 12, padding: "10px 12px",
                      color: "var(--muted)", fontSize: 12, lineHeight: 1.4,
                      fontFamily: "inherit", cursor: "pointer", textAlign: "left",
                    }}
                  >{s}</button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          {messages.map((msg, i) => (
            <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
              <div style={{
                maxWidth: "82%", padding: "10px 14px",
                borderRadius: msg.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                background: msg.role === "user" ? "#e85d26" : "var(--surface2)",
                color: msg.role === "user" ? "#fff" : "var(--text)",
                border: msg.role === "user" ? "none" : "1px solid var(--border2)",
                fontSize: 14, lineHeight: 1.55,
                whiteSpace: "pre-wrap", wordBreak: "break-word",
              }}>
                {msg.content || (msg.role === "assistant" && loading && i === messages.length - 1 ? null : msg.content)}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {loading && messages[messages.length - 1]?.content === "" && (
            <div style={{ display: "flex", justifyContent: "flex-start" }}>
              <div style={{
                background: "var(--surface2)", border: "1px solid var(--border2)",
                borderRadius: "18px 18px 18px 4px",
              }}>
                <TypingDots />
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input area */}
        <div style={{ padding: "10px 14px 16px", borderTop: "1px solid var(--border)", background: "var(--header-bg)", flexShrink: 0, display: "flex", gap: 8, alignItems: "flex-end" }}>
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask your coach..."
            disabled={loading}
            style={{
              flex: 1, background: "var(--surface2)", border: "1px solid var(--border2)",
              borderRadius: 22, padding: "11px 16px",
              color: "var(--text)", fontSize: 14, fontFamily: "inherit",
              outline: "none", opacity: loading ? 0.6 : 1,
            }}
          />
          <button
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            style={{
              width: 42, height: 42, borderRadius: "50%", flexShrink: 0,
              background: loading || !input.trim() ? "var(--surface3)" : "#e85d26",
              border: "none", cursor: loading || !input.trim() ? "default" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "background 0.15s",
            }}
          >
            <FiSend size={16} color={loading || !input.trim() ? "var(--muted3)" : "#fff"} />
          </button>
        </div>
      </div>
    </div>
  );
}
