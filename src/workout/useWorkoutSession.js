import { useReducer, useEffect, useRef, useCallback } from "react";

// ─── Reducer ──────────────────────────────────────────────────────────────────

const REST_SECONDS = 60;

function reducer(state, action) {
  switch (action.type) {
    case "START_WORKOUT": {
      return {
        ...state,
        phase: "exercise",
        exercises: action.exercises, // snapshot — never mutates mid-session
        exerciseIdx: 0,
        setIdx: 0,
        restSecondsLeft: REST_SECONDS,
        startedAt: Date.now(),
        skipped: [],
      };
    }

    case "COMPLETE_SET": {
      const { exercises, exerciseIdx, setIdx } = state;
      const totalSets = 3;
      const isLastSet = setIdx >= totalSets - 1;
      const isLastExercise = exerciseIdx >= exercises.length - 1;

      if (!isLastSet) {
        // More sets for current exercise → rest, same exercise, next set
        return { ...state, phase: "resting", restSecondsLeft: REST_SECONDS, setIdx: setIdx + 1 };
      }
      if (!isLastExercise) {
        // Last set, more exercises → rest, advance exercise, reset set
        return { ...state, phase: "resting", restSecondsLeft: REST_SECONDS, setIdx: 0, exerciseIdx: exerciseIdx + 1 };
      }
      // Last set of last exercise → done
      return { ...state, phase: "done" };
    }

    case "REST_TICK": {
      const next = state.restSecondsLeft - 1;
      if (next <= 0) return { ...state, phase: "exercise", restSecondsLeft: 0 };
      return { ...state, restSecondsLeft: next };
    }

    case "SKIP_REST":
      return { ...state, phase: "exercise", restSecondsLeft: 0 };

    case "SKIP_EXERCISE": {
      const { exercises, exerciseIdx } = state;
      const isLast = exerciseIdx >= exercises.length - 1;
      if (isLast) return { ...state, phase: "done" };
      return {
        ...state,
        phase: "exercise",
        exerciseIdx: exerciseIdx + 1,
        setIdx: 0,
        restSecondsLeft: REST_SECONDS,
        skipped: [...state.skipped, exercises[exerciseIdx].name],
      };
    }

    case "END_WORKOUT":
      return { ...initialState };

    default:
      return state;
  }
}

const initialState = {
  phase: "idle",
  exercises: [],
  exerciseIdx: 0,
  setIdx: 0,
  restSecondsLeft: REST_SECONDS,
  startedAt: null,
  skipped: [],
};

// ─── Chime ────────────────────────────────────────────────────────────────────

function playChime(freq = 880, duration = 0.15) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = freq;
    osc.type = "sine";
    gain.gain.setValueAtTime(0.4, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (_) { /* AudioContext blocked — silent fallback */ }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useWorkoutSession({ onComplete }) {
  const [session, dispatch] = useReducer(reducer, initialState);
  const wakeLockRef = useRef(null);
  const silentAudioRef = useRef(null);
  const intervalRef = useRef(null);

  // ── Rest timer ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (session.phase !== "resting") return;
    intervalRef.current = setInterval(() => {
      dispatch({ type: "REST_TICK" });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [session.phase, session.restSecondsLeft === REST_SECONDS]); // restart when a new rest period begins

  // Chime at 3s warning and at zero
  useEffect(() => {
    if (session.phase !== "resting") return;
    if (session.restSecondsLeft === 3) playChime(660, 0.12);
    if (session.restSecondsLeft === 0) playChime(880, 0.2);
  }, [session.restSecondsLeft, session.phase]);

  // Chime when exercise phase starts (coming from rest)
  const prevPhase = useRef("idle");
  useEffect(() => {
    if (prevPhase.current === "resting" && session.phase === "exercise") {
      playChime(880, 0.15);
    }
    prevPhase.current = session.phase;
  }, [session.phase]);

  // ── Screen Wake Lock ────────────────────────────────────────────────────────
  const acquireWakeLock = useCallback(async () => {
    if (!("wakeLock" in navigator)) return;
    try {
      wakeLockRef.current = await navigator.wakeLock.request("screen");
    } catch (_) { /* graceful degradation */ }
  }, []);

  const releaseWakeLock = useCallback(async () => {
    if (wakeLockRef.current) {
      await wakeLockRef.current.release().catch(() => {});
      wakeLockRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (session.phase === "exercise" || session.phase === "resting") {
      acquireWakeLock();
    } else {
      releaseWakeLock();
    }
    return () => {};
  }, [session.phase, acquireWakeLock, releaseWakeLock]);

  // Re-acquire after browser releases on tab background
  useEffect(() => {
    const handler = () => {
      if (document.visibilityState === "visible" &&
          (session.phase === "exercise" || session.phase === "resting")) {
        acquireWakeLock();
      }
    };
    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
  }, [session.phase, acquireWakeLock]);

  // ── Media Session (earphone buttons) ───────────────────────────────────────
  useEffect(() => {
    if (!("mediaSession" in navigator)) return;

    if (session.phase === "exercise" || session.phase === "resting") {
      // Keep a silent audio loop alive so Media Session handlers fire
      if (!silentAudioRef.current) {
        const audio = new Audio(
          "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA="
        );
        audio.loop = true;
        audio.volume = 0.001;
        audio.play().catch(() => {});
        silentAudioRef.current = audio;
      }
      navigator.mediaSession.setActionHandler("nexttrack", () => dispatch({ type: "COMPLETE_SET" }));
      navigator.mediaSession.setActionHandler("previoustrack", () => dispatch({ type: "SKIP_EXERCISE" }));
    } else {
      navigator.mediaSession.setActionHandler("nexttrack", null);
      navigator.mediaSession.setActionHandler("previoustrack", null);
      if (silentAudioRef.current) {
        silentAudioRef.current.pause();
        silentAudioRef.current = null;
      }
    }
  }, [session.phase]);

  // ── Completion callback ─────────────────────────────────────────────────────
  useEffect(() => {
    if (session.phase === "done") {
      onComplete(session);
    }
  }, [session.phase]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Public API ──────────────────────────────────────────────────────────────
  const startWorkout = useCallback((exercises) => {
    dispatch({ type: "START_WORKOUT", exercises: [...exercises] });
  }, []);

  const completeSet = useCallback(() => dispatch({ type: "COMPLETE_SET" }), []);
  const skipExercise = useCallback(() => dispatch({ type: "SKIP_EXERCISE" }), []);
  const skipRest = useCallback(() => dispatch({ type: "SKIP_REST" }), []);
  const endWorkout = useCallback(() => dispatch({ type: "END_WORKOUT" }), []);

  return { session, startWorkout, completeSet, skipExercise, skipRest, endWorkout };
}
