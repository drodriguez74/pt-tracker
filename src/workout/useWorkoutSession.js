import { useReducer, useEffect, useRef, useCallback } from "react";

const TOTAL_SETS = 3;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getExerciseSeconds(ex) {
  if (!ex?.sets) return null;
  if (ex.sets.includes("/side") || ex.sets.includes("/dir")) return null;
  const match = ex.sets.match(/x(\d+)s/);
  return match ? parseInt(match[1], 10) : null;
}

function vibrate(pattern = [10]) {
  navigator.vibrate?.(pattern);
}

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
  } catch (_) {}
}

// ─── Reducer ──────────────────────────────────────────────────────────────────

function reducer(state, action) {
  switch (action.type) {
    case "START_WORKOUT": {
      const exercises = action.exercises;
      const rest = action.restSeconds ?? 60;
      return {
        ...state,
        phase: "exercise",
        exercises,
        exerciseIdx: 0,
        setIdx: 0,
        restSecondsLeft: rest,
        restTotalSeconds: rest,
        exerciseSecondsLeft: getExerciseSeconds(exercises[0]),
        startedAt: Date.now(),
        skipped: [],
      };
    }

    case "COMPLETE_SET": {
      const { exercises, exerciseIdx, setIdx } = state;
      const isLastSet = setIdx >= TOTAL_SETS - 1;
      const isLastExercise = exerciseIdx >= exercises.length - 1;
      const rest = action.restSeconds ?? state.restTotalSeconds ?? 60;

      if (!isLastSet) {
        return { ...state, phase: "resting", restSecondsLeft: rest, restTotalSeconds: rest, setIdx: setIdx + 1 };
      }
      if (!isLastExercise) {
        return { ...state, phase: "resting", restSecondsLeft: rest, restTotalSeconds: rest, setIdx: 0, exerciseIdx: exerciseIdx + 1 };
      }
      return { ...state, phase: "done" };
    }

    case "REST_TICK": {
      const next = state.restSecondsLeft - 1;
      if (next <= 0) {
        return {
          ...state,
          phase: "exercise",
          restSecondsLeft: 0,
          exerciseSecondsLeft: getExerciseSeconds(state.exercises[state.exerciseIdx]),
        };
      }
      return { ...state, restSecondsLeft: next };
    }

    case "SKIP_REST":
      return {
        ...state,
        phase: "exercise",
        restSecondsLeft: 0,
        exerciseSecondsLeft: getExerciseSeconds(state.exercises[state.exerciseIdx]),
      };

    case "EXERCISE_TICK": {
      const next = state.exerciseSecondsLeft - 1;
      return { ...state, exerciseSecondsLeft: Math.max(0, next) };
    }

    case "SKIP_EXERCISE": {
      const { exercises, exerciseIdx } = state;
      const isLast = exerciseIdx >= exercises.length - 1;
      if (isLast) return { ...state, phase: "done" };
      const nextIdx = exerciseIdx + 1;
      const rest = action.restSeconds ?? state.restTotalSeconds ?? 60;
      return {
        ...state,
        phase: "exercise",
        exerciseIdx: nextIdx,
        setIdx: 0,
        restSecondsLeft: rest,
        restTotalSeconds: rest,
        exerciseSecondsLeft: getExerciseSeconds(exercises[nextIdx]),
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
  restSecondsLeft: 60,
  restTotalSeconds: 60,
  exerciseSecondsLeft: null,
  startedAt: null,
  skipped: [],
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useWorkoutSession({ onComplete, restSeconds = 60 }) {
  const [session, dispatch] = useReducer(reducer, initialState);
  const restSecondsRef = useRef(restSeconds);
  useEffect(() => { restSecondsRef.current = restSeconds; }, [restSeconds]);

  const wakeLockRef = useRef(null);
  const silentAudioRef = useRef(null);
  const restIntervalRef = useRef(null);
  const exerciseIntervalRef = useRef(null);

  // ── Rest timer ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (session.phase !== "resting") return;
    restIntervalRef.current = setInterval(() => {
      dispatch({ type: "REST_TICK" });
    }, 1000);
    return () => clearInterval(restIntervalRef.current);
  }, [session.phase, session.restSecondsLeft === session.restTotalSeconds]);

  // Rest chimes
  useEffect(() => {
    if (session.phase !== "resting") return;
    if (session.restSecondsLeft === 3) playChime(660, 0.12);
    if (session.restSecondsLeft === 0) playChime(880, 0.2);
  }, [session.restSecondsLeft, session.phase]);

  // Chime + haptic when rest ends and exercise resumes
  const prevPhase = useRef("idle");
  useEffect(() => {
    if (prevPhase.current === "resting" && session.phase === "exercise") {
      playChime(880, 0.15);
      vibrate([30, 50, 30]);
    }
    prevPhase.current = session.phase;
  }, [session.phase]);

  // ── Exercise countdown timer ────────────────────────────────────────────────
  useEffect(() => {
    if (session.phase !== "exercise" || session.exerciseSecondsLeft === null) {
      clearInterval(exerciseIntervalRef.current);
      return;
    }
    exerciseIntervalRef.current = setInterval(() => {
      dispatch({ type: "EXERCISE_TICK" });
    }, 1000);
    return () => clearInterval(exerciseIntervalRef.current);
  // Restart whenever we enter a new exercise or new set
  }, [session.phase, session.exerciseIdx, session.setIdx]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-complete when exercise timer reaches zero
  useEffect(() => {
    if (session.phase !== "exercise" || session.exerciseSecondsLeft !== 0) return;
    clearInterval(exerciseIntervalRef.current);
    playChime(880, 0.25);
    vibrate([40, 30, 40]);
    dispatch({ type: "COMPLETE_SET" });
  }, [session.exerciseSecondsLeft, session.phase]);

  // Haptic on manual set completion
  const prevSetIdx = useRef(0);
  const prevExIdx = useRef(0);
  useEffect(() => {
    if (session.phase === "resting") {
      if (session.setIdx !== prevSetIdx.current || session.exerciseIdx !== prevExIdx.current) {
        vibrate([15]);
      }
    }
    prevSetIdx.current = session.setIdx;
    prevExIdx.current = session.exerciseIdx;
  }, [session.phase, session.setIdx, session.exerciseIdx]);

  // ── Screen Wake Lock ────────────────────────────────────────────────────────
  const acquireWakeLock = useCallback(async () => {
    if (!("wakeLock" in navigator)) return;
    try {
      wakeLockRef.current = await navigator.wakeLock.request("screen");
    } catch (_) {}
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
  }, [session.phase, acquireWakeLock, releaseWakeLock]);

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
    if (session.phase === "done") onComplete(session);
  }, [session.phase]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Public API ──────────────────────────────────────────────────────────────
  const startWorkout = useCallback((exercises) => {
    dispatch({ type: "START_WORKOUT", exercises: [...exercises], restSeconds: restSecondsRef.current });
  }, []);

  const completeSet    = useCallback(() => dispatch({ type: "COMPLETE_SET", restSeconds: restSecondsRef.current }), []);
  const skipExercise   = useCallback(() => { vibrate([10, 40, 10]); dispatch({ type: "SKIP_EXERCISE", restSeconds: restSecondsRef.current }); }, []);
  const skipRest       = useCallback(() => dispatch({ type: "SKIP_REST" }), []);
  const endWorkout     = useCallback(() => dispatch({ type: "END_WORKOUT" }), []);

  return { session, startWorkout, completeSet, skipExercise, skipRest, endWorkout };
}
