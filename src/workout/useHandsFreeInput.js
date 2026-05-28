import { useEffect, useRef, useState, useCallback } from "react";

const KNOCK_THRESHOLD = 25; // m/s² — sharp tap spike
const KNOCK_WINDOW_MS = 500; // max gap between two knocks

export function useHandsFreeInput({ phase, onCompleteSet, onSkipExercise, onSkipRest, voiceEnabled }) {
  const [voiceActive, setVoiceActive]   = useState(false);
  const [voiceSupported]                = useState(() => !!(window.SpeechRecognition || window.webkitSpeechRecognition));
  const [micError, setMicError]         = useState(null);
  const [knockActive, setKnockActive]   = useState(false);
  const [knockNeedsPermission, setKnockNeedsPermission] = useState(false);
  const [lastCommand, setLastCommand]   = useState(null);

  const recRef           = useRef(null);
  const phaseRef         = useRef(phase);
  const voiceEnabledRef  = useRef(voiceEnabled);
  const actionsRef       = useRef({ onCompleteSet, onSkipExercise, onSkipRest });
  const knockRef         = useRef({ lastTime: 0, count: 0, cooldown: false });
  const knockListenerRef = useRef(null);

  useEffect(() => { phaseRef.current = phase; }, [phase]);
  useEffect(() => { voiceEnabledRef.current = voiceEnabled; }, [voiceEnabled]);
  useEffect(() => { actionsRef.current = { onCompleteSet, onSkipExercise, onSkipRest }; }, [onCompleteSet, onSkipExercise, onSkipRest]);

  const flash = useCallback((msg) => {
    setLastCommand(msg);
    setTimeout(() => setLastCommand(null), 1400);
  }, []);

  const trigger = useCallback((action) => {
    const p = phaseRef.current;
    const { onCompleteSet: complete, onSkipExercise: skip, onSkipRest: skipRest } = actionsRef.current;
    if (action === "done") {
      if (p === "exercise") { flash("Set done ✓"); complete(); }
      else if (p === "resting") { flash("Rest skipped"); skipRest(); }
    } else if (action === "skip") {
      if (p === "exercise") { flash("Skipped →"); skip(); }
    }
  }, [flash]);

  // ── Voice (opt-in only — keeps background audio alive when off) ──────────────
  useEffect(() => {
    if (!voiceSupported) return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const r = new SR();
    r.continuous = true;
    r.interimResults = false;
    r.lang = "en-US";
    recRef.current = r;

    r.onresult = (e) => {
      const t = e.results[e.results.length - 1][0].transcript.toLowerCase();
      if (["done", "complete", "next", "finish", "rep"].some(w => t.includes(w))) {
        trigger("done");
      } else if (["skip", "pass"].some(w => t.includes(w))) {
        trigger("skip");
      }
    };

    r.onerror = (e) => {
      if (e.error === "not-allowed") setMicError("blocked");
      else if (e.error !== "no-speech" && e.error !== "aborted") setMicError(e.error);
    };

    r.onend = () => {
      setVoiceActive(false);
      // Only auto-restart if voice is still enabled and workout is active
      if (voiceEnabledRef.current && ["exercise", "resting"].includes(phaseRef.current)) {
        setTimeout(() => {
          try { r.start(); setVoiceActive(true); } catch (_) {}
        }, 250);
      }
    };

    return () => { try { r.abort(); } catch (_) {} };
  }, [voiceSupported, trigger]); // eslint-disable-line react-hooks/exhaustive-deps

  // Start / stop recognition based on voiceEnabled + phase
  useEffect(() => {
    const r = recRef.current;
    if (!r) return;
    const inActivePhase = phase === "exercise" || phase === "resting";
    if (voiceEnabled && inActivePhase) {
      setMicError(null);
      try { r.start(); setVoiceActive(true); } catch (_) {}
    } else {
      try { r.abort(); } catch (_) {}
      setVoiceActive(false);
    }
  }, [voiceEnabled, phase]);

  // ── Double-knock (accelerometer) ─────────────────────────────────────────────
  const setupKnock = useCallback(() => {
    const handleMotion = (e) => {
      const acc = e.accelerationIncludingGravity;
      if (!acc) return;
      const mag = Math.sqrt((acc.x || 0) ** 2 + (acc.y || 0) ** 2 + (acc.z || 0) ** 2);
      if (mag < KNOCK_THRESHOLD) return;

      const k = knockRef.current;
      if (k.cooldown) return;
      const now = Date.now();

      if (now - k.lastTime < KNOCK_WINDOW_MS) {
        k.count++;
        if (k.count >= 2) {
          k.cooldown = true;
          k.count = 0;
          setTimeout(() => { knockRef.current.cooldown = false; }, 1200);
          trigger("done");
        }
      } else {
        k.count = 1;
      }
      k.lastTime = now;
    };

    window.addEventListener("devicemotion", handleMotion);
    knockListenerRef.current = handleMotion;
    setKnockActive(true);
    setKnockNeedsPermission(false);
  }, [trigger]);

  useEffect(() => {
    if (!window.DeviceMotionEvent) return;
    if (typeof DeviceMotionEvent.requestPermission === "function") {
      setKnockNeedsPermission(true);
    } else {
      setupKnock();
    }
    return () => {
      if (knockListenerRef.current) {
        window.removeEventListener("devicemotion", knockListenerRef.current);
      }
    };
  }, [setupKnock]);

  const requestKnockPermission = useCallback(async () => {
    try {
      const perm = await DeviceMotionEvent.requestPermission();
      if (perm === "granted") setupKnock();
    } catch (_) {}
  }, [setupKnock]);

  return {
    voiceActive,
    voiceSupported,
    micError,
    knockActive,
    knockNeedsPermission,
    requestKnockPermission,
    lastCommand,
  };
}
