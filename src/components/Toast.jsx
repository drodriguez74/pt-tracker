import { useEffect } from "react";

export default function Toast({ message, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2800);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div style={{
      position: "fixed", bottom: 96, left: "50%", transform: "translateX(-50%)",
      background: "var(--surface)", border: "1px solid var(--border2)",
      borderRadius: 40, padding: "11px 22px",
      fontSize: 15, fontWeight: "bold", color: "var(--text)",
      fontFamily: "'Barlow Condensed', sans-serif",
      boxShadow: "0 4px 24px #00000055",
      zIndex: 500, whiteSpace: "nowrap",
      animation: "toastIn 0.3s ease",
    }}>
      {message}
    </div>
  );
}
