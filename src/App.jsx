import { useState, useEffect } from "react";

// ─── Storage helpers ──────────────────────────────────────────────────────────

function loadStorage(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v !== null ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
}

// Migrate old flat keys ("ExerciseName-0") to date-prefixed ("YYYY-MM-DD:ExerciseName-0")
function migrateCompleted(raw) {
  const today = new Date().toISOString().split("T")[0];
  const migrated = {};
  let changed = false;
  for (const [key, val] of Object.entries(raw)) {
    if (!/^\d{4}-\d{2}-\d{2}:/.test(key)) {
      migrated[`${today}:${key}`] = val;
      changed = true;
    } else {
      migrated[key] = val;
    }
  }
  if (changed) localStorage.setItem("pt-completed", JSON.stringify(migrated));
  return migrated;
}

function calcStreak(dates) {
  if (!dates.length) return { current: 0, best: 0, total: 0 };
  const sorted = [...dates].sort();
  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
  let streak = 1, best = 1;
  for (let i = 1; i < sorted.length; i++) {
    const diff = (new Date(sorted[i]) - new Date(sorted[i - 1])) / 86400000;
    streak = diff === 1 ? streak + 1 : 1;
    if (streak > best) best = streak;
  }
  const last = sorted[sorted.length - 1];
  const current = (last === today || last === yesterday) ? streak : 0;
  return { current, best, total: dates.length };
}

// ─── Ailments ─────────────────────────────────────────────────────────────────

const AILMENTS = [
  { key: "shoulders", label: "Shoulders", color: "#f59e0b", note: "Avoid deep dips, overhead pressing, internal rotation under load. Prefer incline & wall push-ups." },
  { key: "lowerBack", label: "Lower Back", color: "#f59e0b", note: "Prioritize Dead Bug & Bird Dog. Avoid loaded spinal flexion and hyperextension." },
  { key: "knees", label: "Knees", color: "#f59e0b", note: "Use reverse lunges over forward. Limit squat depth to a comfortable range." },
  { key: "wrists", label: "Wrists", color: "#f59e0b", note: "Use fists or push-up handles for weight-bearing. Avoid sustained extended wrist under load." },
  { key: "neck", label: "Neck", color: "#f59e0b", note: "Never pull on your neck during crunches. Move slowly through all cervical rotations." },
  { key: "hips", label: "Hips", color: "#f59e0b", note: "Warm up hip flexors thoroughly. Limit deep hip flexion if it causes pain or catching." },
];

// ─── Exercise library ─────────────────────────────────────────────────────────

const ALL_EXERCISES = {
  pushVariations: {
    label: "Push Variations", color: "#e85d26", icon: "💪",
    exercises: [
      { name: "Standard Push-up", sets: "3x10", notes: "Elbows at 45°, core tight", caution: ["wrists"] },
      { name: "Incline Push-up", sets: "3x12", notes: "Hands on wall or bench — easiest on shoulders" },
      { name: "Decline Push-up", sets: "3x8", notes: "Feet elevated — upper chest focus", caution: ["shoulders"] },
      { name: "Diamond Push-up", sets: "3x8", notes: "Skip if shoulders flare", caution: ["shoulders", "wrists"] },
      { name: "Wide-Arm Push-up", sets: "3x10", notes: "Hands wider than shoulders" },
      { name: "Hand-Release Push-up", sets: "3x8", notes: "Lift hands off floor each rep — controlled" },
      { name: "Pike Push-up", sets: "3x8", notes: "Hips high, shoulder-safe overhead press", caution: ["shoulders", "wrists"] },
      { name: "Wall Push-up", sets: "3x15", notes: "Recovery days or warm-up" },
      { name: "Knee Push-up", sets: "3x12", notes: "Modified — great for shoulder recovery days" },
      { name: "Archer Push-up", sets: "3x6/side", notes: "One arm loaded, one extended — advanced", caution: ["shoulders", "wrists"] },
      { name: "Pseudo Planche Push-up", sets: "3x8", notes: "Hands at hips — tricep & shoulder strength", caution: ["shoulders", "wrists"] },
      { name: "Slow Negative Push-up", sets: "3x6", notes: "5-second lowering — builds control", caution: ["wrists"] },
    ],
  },
  pullVariations: {
    label: "Pull & Row Variations", color: "#8b5cf6", icon: "🔙",
    exercises: [
      { name: "Pull-up (overhand)", sets: "3x5", notes: "Use a bar — full range", caution: ["shoulders"] },
      { name: "Chin-up (underhand)", sets: "3x5", notes: "Easier on shoulders than pull-up" },
      { name: "Australian Pull-up", sets: "3x10", notes: "Low bar or table edge — great back exercise" },
      { name: "Doorframe Row", sets: "3x10", notes: "Grab both sides of a doorframe and row" },
      { name: "Towel Row", sets: "3x10", notes: "Loop towel around a pole and row" },
      { name: "Negative Pull-up", sets: "3x5", notes: "Jump up, lower slowly — builds pulling strength", caution: ["shoulders"] },
      { name: "Scapular Pull-up", sets: "3x10", notes: "Hang and shrug shoulder blades — warm-up" },
      { name: "Dead Hang", sets: "3x20s", notes: "Decompress spine, grip strength" },
      { name: "Flex Hang (hold at top)", sets: "3x10s", notes: "Hold chin above bar", caution: ["shoulders"] },
    ],
  },
  dipsTriCeps: {
    label: "Dips & Triceps", color: "#f59e0b", icon: "↕️",
    exercises: [
      { name: "Bench Dip (shallow)", sets: "3x10", notes: "Limit depth to protect shoulders", caution: ["shoulders"] },
      { name: "Chair Dip", sets: "3x10", notes: "Use a sturdy chair — keep elbows back", caution: ["shoulders"] },
      { name: "Tricep Push-up", sets: "3x10", notes: "Elbows tight to sides", caution: ["wrists"] },
      { name: "Diamond Push-up (tricep focus)", sets: "3x8", notes: "Hands form diamond under chest", caution: ["shoulders", "wrists"] },
    ],
  },
  core: {
    label: "Core & Abs", color: "#ef4444", icon: "🔥",
    exercises: [
      { name: "Dead Bug", sets: "3x10", notes: "Best core exercise for back issues" },
      { name: "Bird Dog", sets: "3x10/side", notes: "Core stability — spine neutral" },
      { name: "Plank (standard)", sets: "3x30s", notes: "No lower back strain — back flat", caution: ["wrists"] },
      { name: "Side Plank", sets: "3x20s/side", notes: "Obliques — back-safe" },
      { name: "Glute Bridge", sets: "3x15", notes: "Core + glutes — protects lower back" },
      { name: "Single-Leg Glute Bridge", sets: "3x10/side", notes: "More glute activation — advanced version" },
      { name: "Hollow Body Hold", sets: "3x20s", notes: "Military staple — low back pressed to floor", caution: ["lowerBack"] },
      { name: "Bent-Knee Leg Raise", sets: "3x10", notes: "Gentler on lower back than straight-leg", caution: ["lowerBack", "hips"] },
      { name: "Crunch (controlled)", sets: "3x12", notes: "Upper abs — don't pull neck", caution: ["neck", "lowerBack"] },
      { name: "Bicycle Crunch", sets: "3x10/side", notes: "Obliques — slow and controlled", caution: ["neck"] },
      { name: "Flutter Kick", sets: "3x20s", notes: "Hip flexors — keep low back pressed down", caution: ["lowerBack", "hips"] },
      { name: "Superman Hold", sets: "3x10", notes: "Lower back strengthening — hold 2s", caution: ["lowerBack"] },
      { name: "Reverse Snow Angel (floor)", sets: "3x10", notes: "Upper back and rear delts" },
      { name: "V-Sit Hold", sets: "3x15s", notes: "Advanced — skip if back is flaring", caution: ["lowerBack"] },
      { name: "Windshield Wiper (bent knee)", sets: "3x10/side", notes: "Rotational core — go slow", caution: ["lowerBack", "hips"] },
      { name: "Plank Hip Dip", sets: "3x10/side", notes: "Side obliques from plank position", caution: ["wrists"] },
      { name: "Ab Wheel Rollout (from knees)", sets: "3x8", notes: "Advanced — full core", caution: ["lowerBack", "wrists", "shoulders"] },
      { name: "Seated Knee Tuck", sets: "3x12", notes: "Sit on edge of chair, pull knees to chest", caution: ["hips", "lowerBack"] },
    ],
  },
  lowerBody: {
    label: "Lower Body", color: "#2d6a4f", icon: "🦵",
    exercises: [
      // Hinge pattern first — was buried at positions 13-14, now 0-1
      { name: "Romanian Deadlift (BW)", sets: "3x10", notes: "Hip hinge — back flat, push hips back", caution: ["lowerBack"] },
      { name: "Good Morning (bodyweight)", sets: "3x10", notes: "Hamstrings — hinge at hips, back flat", caution: ["lowerBack"] },
      { name: "Bodyweight Squat", sets: "3x10", notes: "Don't pass 90° if knees flare", caution: ["knees"] },
      { name: "Reverse Lunge", sets: "3x10/side", notes: "Easier on knees than forward lunges" },
      { name: "Glute Bridge", sets: "3x15", notes: "Core + glutes — protects lower back" },
      { name: "Single-Leg Glute Bridge", sets: "3x10/side", notes: "More glute activation — advanced version" },
      { name: "Wall Sit", sets: "3x30s", notes: "Isometric — zero knee impact" },
      { name: "Sumo Squat", sets: "3x10", notes: "Wider stance — inner thigh focus", caution: ["knees", "hips"] },
      { name: "Pulse Squat", sets: "3x15", notes: "Small pulses at bottom — burns without impact", caution: ["knees"] },
      { name: "Side Lunge", sets: "3x8/side", notes: "Lateral movement — inner thigh & glutes", caution: ["knees", "hips"] },
      { name: "Step-up (low step)", sets: "3x10/side", notes: "Controlled — no knee past toe", caution: ["knees"] },
      { name: "Calf Raise", sets: "3x15", notes: "Stand on step for full range" },
      { name: "Single-Leg Calf Raise", sets: "3x12/side", notes: "More balance and ankle stability" },
      { name: "Glute Kickback", sets: "3x12/side", notes: "On all fours — glutes and hamstrings" },
      { name: "Fire Hydrant", sets: "3x12/side", notes: "Hip abductor — great for knee stability", caution: ["hips"] },
      { name: "Donkey Kick", sets: "3x12/side", notes: "On all fours — glute isolation" },
      { name: "Squat Hold", sets: "3x20s", notes: "Static squat — mobility and endurance", caution: ["knees"] },
      { name: "Lateral Leg Raise (standing)", sets: "3x12/side", notes: "Hip abductor — use wall for balance" },
    ],
  },
  back: {
    label: "Back & Posture", color: "#0ea5e9", icon: "🧍",
    exercises: [
      { name: "Superman", sets: "3x10", notes: "Lower back — hold 2 sec at top", caution: ["lowerBack"] },
      { name: "Reverse Snow Angel", sets: "3x10", notes: "Prone — rear delts and upper back" },
      { name: "YTW (floor)", sets: "3x8 each", notes: "Y, T, W positions — posture builder" },
      { name: "Prone Hip Extension", sets: "3x10/side", notes: "Lying face down — lower back", caution: ["lowerBack"] },
      { name: "Cat-Cow Stretch", sets: "3x10", notes: "Spinal mobility — not strength but vital" },
      { name: "Thoracic Extension (on floor)", sets: "3x10", notes: "Improves posture and upper back mobility" },
      { name: "Wall Angels", sets: "3x10", notes: "Back flat on wall — shoulder & posture" },
    ],
  },
  cardioConditioning: {
    label: "Cardio & Conditioning", color: "#1a3a5c", icon: "💨",
    exercises: [
      { name: "March in Place", sets: "3x60s", notes: "Warm-up / cool-down staple" },
      { name: "Low-Impact Jumping Jacks", sets: "3x30s", notes: "Step side-to-side — no jumping" },
      { name: "Slow Mountain Climbers", sets: "3x10/side", notes: "Controlled pace — core + cardio", caution: ["wrists"] },
      { name: "Modified Burpee (no jump)", sets: "3x8", notes: "Step back instead of jumping", caution: ["wrists", "shoulders"] },
      { name: "Bear Crawl", sets: "3x10 steps", notes: "Full body — slow and deliberate", caution: ["wrists", "shoulders"] },
      { name: "Lateral Shuffle (slow)", sets: "3x30s", notes: "Side-to-side — agility without impact" },
      { name: "High Knee March", sets: "3x30s", notes: "Controlled — hip flexor activation", caution: ["hips"] },
      { name: "Butt Kicker March", sets: "3x30s", notes: "Hamstring activation — no running", caution: ["knees"] },
      { name: "Inchworm", sets: "3x8", notes: "Walk hands out to plank and back — full body", caution: ["wrists", "lowerBack"] },
      { name: "Squat-to-Stand", sets: "3x10", notes: "Hamstring mobility + squat warm-up", caution: ["knees"] },
      { name: "Slow Burpee (4-count)", sets: "3x6", notes: "Down in 2, up in 2 — controlled", caution: ["wrists", "shoulders", "knees"] },
      { name: "Standing Cross-Body Crunch", sets: "3x12/side", notes: "Elbow to opposite knee — cardio + core" },
    ],
  },
  mobilityWarmup: {
    label: "Mobility & Warm-Up", color: "#10b981", icon: "🧘",
    exercises: [
      { name: "Arm Circles (forward & back)", sets: "2x10/dir", notes: "Shoulder warm-up — essential before pushing" },
      { name: "Shoulder Rolls", sets: "2x10/dir", notes: "Loosens shoulder joint" },
      { name: "Hip Circle (standing)", sets: "2x10/dir", notes: "Hip joint mobility" },
      { name: "Leg Swing (front/back)", sets: "2x10/side", notes: "Dynamic hamstring warm-up", caution: ["hips"] },
      { name: "Leg Swing (side/side)", sets: "2x10/side", notes: "Dynamic hip abductor warm-up", caution: ["hips"] },
      { name: "Ankle Circle", sets: "2x10/dir", notes: "Ankle mobility — helps knees" },
      { name: "Wrist Circle", sets: "2x10/dir", notes: "Warm-up before push-up variations" },
      { name: "Cat-Cow", sets: "2x10", notes: "Spinal mobility — must-do for lower back" },
      { name: "Child's Pose", sets: "2x20s", notes: "Lower back decompression" },
      { name: "Cobra Stretch", sets: "2x20s", notes: "Spinal extension — helpful for most lower back issues; skip if spinal stenosis", caution: ["lowerBack"] },
      { name: "Hip Flexor Stretch (kneeling)", sets: "2x20s/side", notes: "Tight from sitting — crucial", caution: ["knees", "hips"] },
      { name: "World's Greatest Stretch", sets: "2x5/side", notes: "Full body mobility — slow", caution: ["hips", "knees"] },
      { name: "Doorway Chest Stretch", sets: "2x20s", notes: "Opens chest — shoulder friendly", caution: ["shoulders"] },
      { name: "Thread the Needle", sets: "2x20s/side", notes: "Thoracic rotation — upper back" },
      { name: "Neck Rolls (slow)", sets: "2x5/dir", notes: "Cervical mobility — slow and gentle", caution: ["neck"] },
    ],
  },
};

// ─── Derived constants ────────────────────────────────────────────────────────

const categories = Object.entries(ALL_EXERCISES).map(([key, val]) => ({ key, ...val }));

// Reverse lookup: exercise name → category key (fixes search icon bug)
const exerciseCategoryMap = {};
Object.entries(ALL_EXERCISES).forEach(([catKey, cat]) => {
  cat.exercises.forEach(ex => { exerciseCategoryMap[ex.name] = catKey; });
});

// Warm-up guidance shown at top of each training day
const WARMUP_PRESETS = {
  upper: "Arm Circles · Shoulder Rolls · Wrist Circles",
  lower: "Leg Swings · Hip Circles · Ankle Circles",
  full: "Arm Circles · Leg Swings · Cat-Cow",
  core: "Cat-Cow · Hip Circles · Child's Pose",
};

// ─── Exercise demos ───────────────────────────────────────────────────────────
// steps: numbered cues covering setup → movement → finish
// cues:  2-3 short form reminders shown as a callout block

const EXERCISE_DEMOS = {
  // ── Push Variations ──────────────────────────────────────────────────────
  "Standard Push-up": {
    steps: ["High plank: hands shoulder-width, wrists directly under shoulders, body forms a straight line from head to heels.", "Bend elbows to 45° — not flared wide — and lower your chest until it nearly touches the floor.", "Press the floor away to return to start. Keep your core braced throughout."],
    cues: ["Elbows track at 45°, not 90°", "Hips stay level — no sagging or piking", "Look slightly forward, not straight down"],
  },
  "Incline Push-up": {
    steps: ["Place hands on a bench, chair, or wall at an angle. The higher the surface, the easier.", "Walk feet back so your body forms a straight diagonal line from head to heels.", "Lower chest to the edge of the surface, elbows at 45°, then press back."],
    cues: ["Higher surface = less load on the joint", "Maintain the plank body-line at all times", "Full range of motion — don't stop halfway"],
  },
  "Decline Push-up": {
    steps: ["Place feet on an elevated surface (chair or step), hands on the floor shoulder-width.", "Body angles downhill — upper chest and shoulders take more load.", "Lower chest to floor with elbows at 45°, then press back up."],
    cues: ["Skip if shoulders impinge in this position", "Keep core tight to avoid lower-back arch", "Higher feet = greater challenge"],
  },
  "Diamond Push-up": {
    steps: ["Place hands close together under your chest so thumbs and index fingers form a diamond shape.", "Extend into plank position — straight line from head to heels.", "Lower chest slowly toward hands, elbows tracking toward hips, then press up."],
    cues: ["Triceps and inner chest do the work", "Avoid if wrists or shoulders flare", "Start on knees if full form is too difficult"],
  },
  "Wide-Arm Push-up": {
    steps: ["Place hands wider than shoulder-width, fingertips pointing slightly outward.", "Lower chest to a point between your hands — elbows angle out wider than 45°.", "Press back up evenly through both palms."],
    cues: ["Wider grip shifts load to outer chest", "Don't let elbows flare excessively wide", "Slow the descent for more chest activation"],
  },
  "Hand-Release Push-up": {
    steps: ["Lower yourself all the way to the floor under full control.", "At the bottom, briefly lift both hands off the floor (a centimetre is enough).", "Replace hands and press explosively back to the top."],
    cues: ["Eliminates momentum — each rep starts fresh", "Controlled descent every time — don't drop", "Develops strength in the bottom push-up position"],
  },
  "Pike Push-up": {
    steps: ["Start in downward-dog: hips high, hands and feet on the floor forming an inverted V.", "Bend elbows and lower the top of your head toward the floor between your hands.", "Press back up by straightening your arms — this mimics an overhead shoulder press."],
    cues: ["Hips stay high throughout the movement", "Skip if you feel shoulder impingement", "Warm wrists thoroughly before starting"],
  },
  "Wall Push-up": {
    steps: ["Stand about 2 feet from a wall, place hands flat at chest height.", "Keeping a straight body line, lean and lower your chest toward the wall.", "Press back to start — slow and controlled both ways."],
    cues: ["Great for shoulder recovery or as a warm-up", "Control both the down and up phases equally", "Step closer to the wall to reduce difficulty"],
  },
  "Knee Push-up": {
    steps: ["Kneel on the floor, hands just wider than shoulder-width, knees behind your hips.", "Lower chest to the floor with elbows at 45°, maintaining a straight line from knees to head.", "Press back up and repeat."],
    cues: ["Don't let hips pike up or sag toward the floor", "Same elbow angle as a standard push-up", "A good starting point before progressing to full push-ups"],
  },
  "Archer Push-up": {
    steps: ["Start in a wide-arm plank, hands much wider than shoulders.", "Shift weight toward one arm, bending that elbow while the opposite arm stays fully straight.", "Lower chest toward the bent-arm side, then press back up. Alternate sides."],
    cues: ["The straight arm must not sag — keep it engaged", "Advanced — build to it from the wide-arm push-up", "Wrists bear high shear load — warm up first"],
  },
  "Pseudo Planche Push-up": {
    steps: ["Get into plank position but walk hands back so wrists are near hip level.", "Arms angle back — this approximates a gymnastics planche direction.", "Perform a push-up from this position; wrists and shoulders absorb a much higher load."],
    cues: ["Extremely wrist-intensive — warm up fully", "Lean further forward to increase difficulty", "Not for beginners — build shoulder strength first"],
  },
  "Slow Negative Push-up": {
    steps: ["Start at the top of a push-up position.", "Take 5 full seconds to lower all the way to the floor, maintaining perfect alignment.", "Reset at the top (push from floor or use knees) and repeat."],
    cues: ["The slow descent is where strength is built", "Keep breathing — don't hold your breath", "3–5 reps is plenty; quality over quantity"],
  },
  // ── Pull & Row ────────────────────────────────────────────────────────────
  "Pull-up (overhand)": {
    steps: ["Grab the bar overhand (palms away), slightly wider than shoulder-width.", "Start from a full dead hang — arms straight, shoulders relaxed down.", "Pull chest toward the bar by driving elbows down and toward your hips. Chin clears the bar at the top."],
    cues: ["Think 'elbows to pockets,' not just 'pull up'", "No kipping — strict form builds real strength", "Lower slowly — the descent builds as much as the pull"],
  },
  "Chin-up (underhand)": {
    steps: ["Grab the bar underhand (palms facing you), shoulder-width apart.", "Start from a full dead hang with arms extended.", "Pull until chin clears the bar, leading with your chest. Lower under control."],
    cues: ["Biceps contribute more here than the overhand pull-up", "Generally easier for beginners than overhand grip", "Shoulder-friendlier option if pull-ups cause discomfort"],
  },
  "Australian Pull-up": {
    steps: ["Position yourself under a low bar or table edge and grip it with both hands, arms extended.", "Walk feet out until your body forms a straight diagonal line — the more horizontal, the harder.", "Pull your chest up to the bar by driving elbows toward your hips, then lower."],
    cues: ["Keep hips and knees extended — no sagging", "More horizontal body = harder", "Great progression before full pull-ups"],
  },
  "Doorframe Row": {
    steps: ["Stand in a doorway and grip both sides of the frame at chest height.", "Walk feet forward until you're leaning back at an angle, arms extended.", "Pull chest toward the doorframe by driving elbows back. Squeeze shoulder blades at the top."],
    cues: ["Keep body rigid — this is a row, not a squat", "Adjust lean angle to control difficulty", "Excellent equipment-free back exercise"],
  },
  "Towel Row": {
    steps: ["Loop a towel around a fixed pole or railing and hold both ends.", "Walk feet forward until you're leaning back at an angle.", "Pull your chest toward the anchor by driving elbows toward your hips."],
    cues: ["Verify the anchor point can hold your full body weight", "Same pull pattern as a cable row", "Lean further back to increase the challenge"],
  },
  "Negative Pull-up": {
    steps: ["Use a chair or box to get into the top position with chin above the bar.", "Step off and lower yourself as slowly as possible — aim for 5–10 seconds.", "When fully extended, step back up and repeat."],
    cues: ["Negatives are among the fastest ways to build pull-up strength", "Resist every centimetre of the descent — don't drop", "3–5 reps per set is ideal for strength building"],
  },
  "Scapular Pull-up": {
    steps: ["Hang from the bar with arms fully extended and shoulders relaxed.", "Without bending your elbows, shrug your shoulder blades down and together.", "Hold 1 second at the retracted position, then return to the relaxed hang."],
    cues: ["Think 'shoulders down and back,' not up", "Warm-up drill before any pulling exercise", "Protects against shoulder impingement during rows and pull-ups"],
  },
  "Dead Hang": {
    steps: ["Grab the bar with both hands, arms fully extended, feet off the floor.", "Relax your shoulders and let gravity decompress your spine.", "Hold for the prescribed time, breathing steadily."],
    cues: ["Don't shrug — let shoulders fully relax", "Excellent for grip strength and spinal decompression", "Alternate overhand and underhand grip across sets"],
  },
  "Flex Hang (hold at top)": {
    steps: ["Jump or step into the top of a pull-up with chin above the bar.", "Hold this position as long as possible, keeping shoulder blades depressed (pulled down).", "Lower slowly when you can no longer hold form."],
    cues: ["Builds strength at the hardest part of the pull-up", "Shoulder blades stay down, not shrugged up", "Combine with Negative Pull-ups for fastest progress"],
  },
  // ── Dips & Triceps ────────────────────────────────────────────────────────
  "Bench Dip (shallow)": {
    steps: ["Sit on the edge of a bench or chair, grip the edge with fingers forward, feet flat on the floor.", "Slide hips off the bench, arms straight.", "Lower hips by bending elbows to about 90° — no deeper. Press back up."],
    cues: ["Limit depth to protect the shoulder joint", "Elbows track straight back, not flaring out", "Skip if you feel shoulder pinching at the bottom"],
  },
  "Chair Dip": {
    steps: ["Grip the back edge of a sturdy chair behind you, fingers pointing forward, legs extended.", "Lower until elbows reach about 90°, keeping body close to the chair.", "Press through palms to return to start."],
    cues: ["Further legs extend = harder", "Elbows track directly behind you, not outward", "Use the heaviest chair available — it must not tip"],
  },
  "Tricep Push-up": {
    steps: ["Start in a high plank with hands directly under shoulders — narrower than standard push-up.", "Keep elbows pinned tight to your sides as you lower your chest.", "Press back up, maintaining elbow contact with your ribcage throughout."],
    cues: ["Arms should feel like a close-grip bench press", "Elbows never flare outward during this movement", "Much more tricep-focused than a standard push-up"],
  },
  "Diamond Push-up (tricep focus)": {
    steps: ["Place both hands together under your sternum, forming a diamond with thumbs and index fingers.", "Lower your chest slowly toward your hands, elbows tracking toward your hips.", "Press straight up, focusing on squeezing the back of the upper arms."],
    cues: ["Visualize pushing the floor apart with both palms", "Wrists may fatigue — use fists if needed", "Beginners: perform from knees first"],
  },
  // ── Core & Abs ────────────────────────────────────────────────────────────
  "Dead Bug": {
    steps: ["Lie on your back, arms extended toward the ceiling, knees bent at 90° with shins parallel to the floor.", "Press your lower back firmly into the floor — maintain this throughout the entire set.", "Slowly lower your right arm overhead while extending the left leg straight. Return, then switch sides."],
    cues: ["Lower back stays glued to the floor — this is the only rule that matters", "Opposite arm and leg move simultaneously", "Slow and controlled — 3 seconds each direction"],
  },
  "Bird Dog": {
    steps: ["Start on all fours: hands under shoulders, knees under hips, spine neutral.", "Brace your core and extend your right arm forward while simultaneously extending your left leg back.", "Hold 2 seconds, return to start, then switch sides."],
    cues: ["Hips must not rotate or shift sideways", "Think long — reach arm and leg away from center", "If you wobble, slow down; stability is the goal here"],
  },
  "Plank (standard)": {
    steps: ["Get into a push-up position, then lower onto your forearms. Elbows under shoulders.", "Hold a straight line from head to heels — hips level, core engaged.", "Breathe steadily throughout. Eyes look down at a spot on the floor."],
    cues: ["Don't let hips sag toward the floor", "Squeeze glutes and quads to help brace the core", "Stop when form breaks — a short perfect plank beats a long bad one"],
  },
  "Side Plank": {
    steps: ["Lie on your side, forearm on the floor with elbow directly under shoulder.", "Stack your feet (or stagger for balance) and lift hips off the floor.", "Body forms a straight line from head to feet. Hold steadily."],
    cues: ["Top hand on hip or extended overhead for balance", "Don't let hips drop toward the floor", "Modified: bottom knee stays on the floor"],
  },
  "Glute Bridge": {
    steps: ["Lie on your back, knees bent, feet flat on the floor hip-width apart.", "Brace your core, then press through heels to lift hips until your body forms a straight line from knees to shoulders.", "Squeeze glutes hard at the top for 1 second. Lower slowly."],
    cues: ["Drive through heels, not your toes", "Glute squeeze at the top is where the work happens", "Lower back should not hyperextend at the top"],
  },
  "Single-Leg Glute Bridge": {
    steps: ["Lie on your back, one knee bent with foot flat on the floor. Extend the other leg straight.", "Brace your core and press through the planted heel to lift hips.", "Hold 1 second at the top, then lower. Complete all reps on one side before switching."],
    cues: ["Keep hips level — don't let one side drop", "Extended leg stays in line with the body, not raised higher", "Much harder than it looks — build from two-leg version first"],
  },
  "Hollow Body Hold": {
    steps: ["Lie on your back and press your lower back firmly into the floor.", "Extend arms overhead and legs straight, angled low toward the floor — as low as you can while keeping lower back contact.", "Hold this banana-bowl shape. Breathe steadily."],
    cues: ["Lower back must stay flat — raise legs if it arches away from the floor", "Arms and legs are just lever arms; your core is doing the work", "Military and gymnastics staple — build time gradually"],
  },
  "Bent-Knee Leg Raise": {
    steps: ["Lie on your back, hands under your glutes for support.", "With knees bent at 90°, raise them toward your chest.", "Lower shins back to the starting position without letting feet touch the floor."],
    cues: ["Bent knees reduce the lever arm and protect the lower back", "Keep lower back pressed down, not arching off the floor", "Add a hip lift at the top for more lower-ab engagement"],
  },
  "Crunch (controlled)": {
    steps: ["Lie on your back, knees bent, feet flat. Place hands lightly behind your head — do not interlace fingers or pull.", "Curl your upper back off the floor by bringing your chest toward your knees — not your head toward your knees.", "Lower back to the floor under full control."],
    cues: ["Lift with your abs, not your neck or your hands", "Keep elbows in peripheral vision — if you can't see them, your hands are pulling", "Small and slow beats big and fast every time"],
  },
  "Bicycle Crunch": {
    steps: ["Lie on your back, knees bent at 90°, hands lightly behind your head.", "Bring one knee toward your chest while rotating your opposite shoulder toward that knee.", "Simultaneously extend the other leg straight. Alternate in a slow, controlled pedaling motion."],
    cues: ["Slow rotation is more effective than speed", "Don't pull your head — just support its weight", "True torso rotation, not just elbow movement"],
  },
  "Flutter Kick": {
    steps: ["Lie on your back, hands under your glutes for lower-back support.", "Lift both legs about 6 inches off the floor. Press lower back into the floor.", "Make small, alternating up-and-down kicks with straight legs."],
    cues: ["Lower back stays flat — raise legs higher if it arches", "Small kicks, not wide — the core engagement is the point", "Skip if hip flexors are causing lower-back discomfort"],
  },
  "Superman Hold": {
    steps: ["Lie face down on the floor, arms extended overhead.", "Simultaneously lift your arms, chest, and legs off the floor by squeezing your glutes and back muscles.", "Hold 2 seconds at the top. Lower slowly and repeat."],
    cues: ["Look down at the floor — don't strain your neck by looking up", "Squeeze glutes hard to protect the lower back", "If lower back pinches, reduce the height of the lift"],
  },
  "Reverse Snow Angel (floor)": {
    steps: ["Lie face down, arms at your sides, palms down.", "Lift arms slightly off the floor and sweep them up alongside your ears, squeezing shoulder blades together.", "Return arms to sides. Keep arms off the floor throughout the full set."],
    cues: ["Rear deltoids and upper back are the primary movers", "Keep chest lightly on the floor — don't lift your torso", "Combine with YTW for a complete posture session"],
  },
  "V-Sit Hold": {
    steps: ["Sit on the floor and lean back slightly, lifting your feet off the floor.", "Extend arms forward parallel to the floor — body forms a V shape.", "Hold the position, balancing on your tailbone. Keep spine as tall as possible."],
    cues: ["Advanced — skip if lower back flares", "Beginners: bend knees to shorten the lever arm", "Engage entire core — not just hip flexors"],
  },
  "Windshield Wiper (bent knee)": {
    steps: ["Lie on your back, knees bent at 90°, shins parallel to the floor. Arms extended at your sides.", "Slowly lower both knees toward the floor on one side — only as far as your lower back stays flat.", "Return to center, then rotate to the other side."],
    cues: ["Rotation comes from obliques, not momentum", "Shoulders stay flat on the floor throughout", "Slow and controlled — speed defeats the purpose"],
  },
  "Plank Hip Dip": {
    steps: ["Start in a forearm plank with solid alignment.", "Rotate your hips and dip them toward the right — as close to the floor as control allows.", "Return to center and dip left."],
    cues: ["Elbows stay planted and stable", "Small controlled movement — not a big swing", "Obliques drive the motion, not momentum"],
  },
  "Ab Wheel Rollout (from knees)": {
    steps: ["Kneel on the floor with the ab wheel in front of you, gripping both handles.", "Brace your core and roll forward slowly, extending arms as far as control allows with your back flat.", "Pull the wheel back by contracting your abs hard. That's one rep."],
    cues: ["Don't let the lower back arch as you extend — this is the key to staying safe", "Start with short rolls until your core handles full extension", "One of the hardest core movements that exists — respect the difficulty"],
  },
  "Seated Knee Tuck": {
    steps: ["Sit on the edge of a chair, hands gripping the sides for support, leaning back slightly.", "Extend legs straight in front of you, then pull knees in toward your chest.", "Return to extended position without letting feet fully rest on the floor."],
    cues: ["Keep your back from rounding too much — maintain a slight chest lift", "Breathe out as you pull knees in", "Modify by lifting one knee at a time"],
  },
  // ── Lower Body ────────────────────────────────────────────────────────────
  "Romanian Deadlift (BW)": {
    steps: ["Stand with feet hip-width apart, soft bend in the knees.", "Push hips back while keeping your back flat. Let your torso lower toward the floor.", "Feel the hamstrings load with tension. Drive hips forward to return to standing, squeezing glutes."],
    cues: ["The hinge is at the hips — back stays flat, never rounded", "Look slightly forward, not straight down", "Hamstrings feel tension; lower back should feel none"],
  },
  "Good Morning (bodyweight)": {
    steps: ["Stand with feet hip-width, hands behind your head with elbows wide (or crossed on chest).", "Hinge at the hips and lower your torso toward parallel with the floor, maintaining a flat spine.", "Drive hips forward to return to standing. Squeeze glutes at the top."],
    cues: ["Same hip hinge as the RDL — back stays flat", "Any rounding of the spine ends the set", "Slow and deliberate — no bouncing or momentum"],
  },
  "Bodyweight Squat": {
    steps: ["Stand with feet shoulder-width, toes turned slightly outward.", "Push hips back and bend knees, lowering until thighs are roughly parallel to the floor.", "Press through heels to return to standing."],
    cues: ["Chest stays tall — don't fold forward", "Knees track over your toes, not caving inward", "Adjust depth to where your knees are comfortable"],
  },
  "Reverse Lunge": {
    steps: ["Stand tall with feet together.", "Step one foot back and lower your rear knee toward the floor — front thigh parallel to floor.", "Press through the front heel to return to standing. Alternate legs."],
    cues: ["Far easier on the knee than a forward lunge", "Torso stays upright — don't lean forward", "Front knee stays behind your toes"],
  },
  "Wall Sit": {
    steps: ["Stand with your back against a wall, feet about 2 feet in front of you, shoulder-width.", "Slide down the wall until thighs are parallel to the floor — 90° knee angle.", "Hold the position. Hands rest on thighs or extend forward."],
    cues: ["Back stays flat on the wall — don't slide forward", "Don't let knees cave inward", "If 90° causes pain, stay at a shallower angle"],
  },
  "Sumo Squat": {
    steps: ["Stand wider than shoulder-width, toes turned out at about 45°.", "Push hips back and lower into a squat — knees track in the direction of your toes.", "Press through heels to return to standing, squeezing glutes at the top."],
    cues: ["Inner thighs and glutes are the primary movers", "Keep chest tall — avoid excessive forward lean", "Great for those with limited ankle mobility"],
  },
  "Pulse Squat": {
    steps: ["Lower into a squat with thighs at or near parallel.", "Stay at the bottom and perform small 2–3 inch pulses up and down.", "Stay in the bottom range — don't return to standing between reps."],
    cues: ["Isometric work at the hardest position — intentional discomfort", "Keep chest tall during pulses", "30 seconds at the end of a squat set is brutally effective"],
  },
  "Side Lunge": {
    steps: ["Stand with feet together.", "Take a large step directly to one side, keeping that foot flat.", "Bend the lunging knee and push hips back — other leg stays straight. Push off to return."],
    cues: ["Step wide enough to feel an inner-thigh stretch", "Chest stays tall — don't fold forward", "Knee tracks over the middle of your foot, not caving inward"],
  },
  "Step-up (low step)": {
    steps: ["Stand in front of a low step (6–8 inches high).", "Place one foot fully on the step. Press through that heel to lift your body — don't push off the ground foot.", "Step down slowly. Complete all reps on one side before switching."],
    cues: ["Drive through the top foot — the ground foot is just a safety net", "Full hip extension at the top — stand tall", "Slow the step-down to maximize strength development"],
  },
  "Calf Raise": {
    steps: ["Stand with feet hip-width, toes forward. Use a wall for balance if needed.", "Rise onto the balls of your feet as high as possible.", "Lower heels all the way down — use a step edge for full range."],
    cues: ["Full range of motion — all the way up, all the way down", "Slow the descent for better calf development", "Single-leg version is significantly harder — a natural progression"],
  },
  "Single-Leg Calf Raise": {
    steps: ["Stand on one foot on the edge of a step, heel hanging off.", "Rise onto the ball of your foot as high as possible.", "Lower heel below the step level for maximum range. Complete all reps before switching."],
    cues: ["Rest a hand lightly on a wall for balance", "Full range of motion is the point — don't cheat the descent", "Much harder than the two-leg version"],
  },
  "Glute Kickback": {
    steps: ["Start on all fours: hands under shoulders, knees under hips, spine neutral.", "Keep knee bent at 90° and flex the foot, then drive one heel toward the ceiling by contracting the glute.", "Lower with control and repeat before switching legs."],
    cues: ["Don't rotate your hip open — hips stay squared to the floor", "The glute does the lifting, not your lower back", "Pair with Fire Hydrant for a complete hip circuit"],
  },
  "Fire Hydrant": {
    steps: ["Start on all fours: hands under shoulders, knees under hips.", "Keep the knee bent and lift one leg out to the side.", "Lower under control and repeat before switching sides."],
    cues: ["Hip abductors and glute medius drive this movement", "Hips must stay level — don't tilt away from the working leg", "Excellent for knee stability by strengthening the outer hip"],
  },
  "Donkey Kick": {
    steps: ["Start on all fours with a neutral spine.", "Drive one heel up toward the ceiling, keeping the knee bent at 90°.", "Squeeze the glute at the top. Lower slowly without letting the knee touch the floor."],
    cues: ["Focus on glute contraction, not height of the leg", "Don't arch the lower back to gain height", "Hips stay square to the floor throughout"],
  },
  "Squat Hold": {
    steps: ["Lower into a squat position — thighs at or near parallel.", "Hold completely still. Breathe steadily.", "Reset posture at any point it breaks — don't chase the clock with bad form."],
    cues: ["Isometric quad and glute work — surprisingly demanding", "Adjust depth to where you can maintain proper form", "Knees stay tracking over toes throughout the hold"],
  },
  "Lateral Leg Raise (standing)": {
    steps: ["Stand tall and use a wall for balance if needed.", "Keep one leg straight and lift it directly to the side — as high as is comfortable.", "Lower with control. Complete all reps before switching sides."],
    cues: ["Hip abductors (outer hip) drive this movement", "Don't lean your torso sideways to gain height", "Slow tempo is far more effective than momentum"],
  },
  // ── Back & Posture ────────────────────────────────────────────────────────
  "Superman": {
    steps: ["Lie face down with arms extended overhead and legs straight behind you.", "Simultaneously lift arms and legs off the floor by contracting your back and glutes.", "Hold 2 seconds at the top. Lower slowly."],
    cues: ["Eyes look down at the floor — don't strain your neck up", "Squeeze glutes to protect your lower back", "If lower back pinches, reduce the height of the lift"],
  },
  "Reverse Snow Angel": {
    steps: ["Lie face down, arms at your sides, palms facing up.", "Lift arms off the floor and sweep them up toward your head in a wide arc.", "Sweep back down to sides. Keep arms off the floor throughout the full set."],
    cues: ["Rear deltoids and upper back are the movers", "Chest stays lightly on the floor — don't lift your torso", "Also called 'prone lateral raise'"],
  },
  "YTW (floor)": {
    steps: ["Lie face down, arms extended. Raise arms slightly off the floor.", "Y: reach arms up at 45° forming a Y shape — hold 2 seconds. T: arms straight out at shoulder height — hold 2 seconds. W: bend elbows to 90° with hands at ear height — hold 2 seconds.", "That sequence is one rep. Thumbs point up for each position."],
    cues: ["Each position targets different rear-delt and upper-back muscles", "Pinch shoulder blades together — scapulae do the work", "Small movement — this is precision, not power"],
  },
  "Prone Hip Extension": {
    steps: ["Lie face down, forehead resting on your hands.", "Keeping one leg straight, lift it a few inches off the floor by squeezing the glute.", "Hold 1 second at the top, lower slowly, and repeat before switching."],
    cues: ["Glute does the lifting — lower back should feel minimal work", "Keep hips pressed flat on the floor", "Very small movement — focus on the squeeze, not the height"],
  },
  "Cat-Cow Stretch": {
    steps: ["Start on all fours: wrists under shoulders, knees under hips.", "Exhale and round your entire spine toward the ceiling (Cat).", "Inhale and drop your belly, lifting chest and tailbone (Cow). Flow smoothly between the two."],
    cues: ["Exhale on Cat, inhale on Cow", "Move slowly — feel each vertebra participate", "Mobility work, not strength — control and range matter most"],
  },
  "Thoracic Extension (on floor)": {
    steps: ["Sit in front of a rolled towel placed horizontally behind your mid-back.", "Lean back over it, hands behind your head, and let your upper back gently extend over the roll.", "Hold 10–20 seconds, then shift to a different vertebra level."],
    cues: ["Target mid-back (T4–T8), not your lower back", "Gentle weight of your head provides the stretch", "Counteracts hours of forward posture — worth doing daily"],
  },
  "Wall Angels": {
    steps: ["Stand with your back flat against a wall, feet 6 inches from the base.", "Raise arms to a goalpost position (elbows at 90°, upper arms parallel to floor) — both elbows touching the wall.", "Slide arms up overhead and back down, keeping contact with the wall throughout."],
    cues: ["If arms lift off the wall, work within your available range — don't force it", "Reveals shoulder mobility restrictions quickly", "Back must stay flat on wall — don't let it arch away"],
  },
  // ── Cardio & Conditioning ─────────────────────────────────────────────────
  "March in Place": {
    steps: ["Stand tall with core engaged.", "Alternate lifting knees to hip height in a controlled marching tempo.", "Swing arms naturally as you march."],
    cues: ["Keep core engaged — don't slump forward", "Lift knees high enough to feel hip flexors engage", "Beginner-friendly — anyone can do this"],
  },
  "Low-Impact Jumping Jacks": {
    steps: ["Stand with feet together, arms at sides.", "Step one foot out to the side while raising arms overhead.", "Return foot in and lower arms. Alternate sides rhythmically."],
    cues: ["Step only — no jumping required", "Keep a steady rhythm for a cardio effect", "Maintain upright posture throughout"],
  },
  "Slow Mountain Climbers": {
    steps: ["Start in a high plank: hands under shoulders, body in a straight line.", "Drive one knee slowly toward your chest without letting hips rise.", "Return to start, then drive the other knee. Alternate."],
    cues: ["Slow pace = more core work, less cardio impact", "Keep hips level — don't pike up", "Wrists bear significant load — warm up first"],
  },
  "Modified Burpee (no jump)": {
    steps: ["Stand tall, then hinge and place hands on the floor in front of you.", "Step one foot back, then the other, to a plank position.", "Step feet back in, then stand tall. No jumping at any stage."],
    cues: ["Step in and out — don't hop", "Flat back in the plank position", "Can use a bench or chair for hand placement to reduce wrist load"],
  },
  "Bear Crawl": {
    steps: ["Start on all fours, knees hovering just 1 inch above the floor.", "Move forward by stepping right hand + left foot simultaneously.", "Continue crawling, keeping knees just off the floor and back flat."],
    cues: ["Keep hips low and level — don't waddle side to side", "Small steps — control is the point, not speed", "Extremely demanding for both shoulders and core simultaneously"],
  },
  "Lateral Shuffle (slow)": {
    steps: ["Stand in a slight athletic squat, feet shoulder-width.", "Step the lead foot out to the side, then bring the trail foot to close the gap.", "Maintain consistent distance between feet and stay in the squat throughout."],
    cues: ["Stay low — the moment you stand up, you lose the benefit", "Face forward the entire time", "Great for hip abductors and lateral stability"],
  },
  "High Knee March": {
    steps: ["Stand tall.", "Alternate driving knees above hip height in an exaggerated marching tempo.", "Swing opposite arms to balance and add upper-body engagement."],
    cues: ["Core stays tight — don't let your torso bounce", "Drive the knee up — don't lean back to compensate", "Hip flexors will burn; that's the intent"],
  },
  "Butt Kicker March": {
    steps: ["Stand tall and march in place.", "As you step, bring each heel up toward your glutes.", "Stay upright — don't lean forward."],
    cues: ["Hamstring activation without running impact", "Slow march keeps it safe for all fitness levels", "Pair with High Knee March for a complete activation sequence"],
  },
  "Inchworm": {
    steps: ["Stand with feet hip-width. Hinge at the hips and place hands on the floor.", "Walk hands forward until you're in a plank position.", "Walk hands back toward your feet, then stand tall. That's one rep."],
    cues: ["Keep legs as straight as your hamstrings allow — you'll feel the stretch", "Flat back in the plank — no sagging hips", "Wrists and lower back both load heavily — warm up first"],
  },
  "Squat-to-Stand": {
    steps: ["Stand with feet hip-width. Hinge down and hold your toes with both hands.", "Use the grip to pull your chest up and sink into a deep squat — back as flat as possible.", "Drive hips up to a standing position while keeping hands on toes. Repeat."],
    cues: ["One of the best mobility warm-up drills that exists", "The toe grip lets you feel the hip hinge while mobilizing the hamstrings", "Not a speed drill — take your time with each rep"],
  },
  "Slow Burpee (4-count)": {
    steps: ["Count 1: hinge and place hands on the floor. Count 2: step or jump feet to plank.", "Count 3: perform a push-up (optional). Count 4: return feet to hands and stand.", "Everything is slow and deliberate — this is a 4-count movement."],
    cues: ["Step instead of jumping if joints are a concern", "Wrist, shoulder, and knee demands are all high — warm up first", "3 reps done perfectly beats 10 done poorly"],
  },
  "Standing Cross-Body Crunch": {
    steps: ["Stand with feet shoulder-width, hands lightly behind your head.", "Drive one knee up while rotating your opposite elbow toward that knee.", "Return to start and alternate sides rhythmically."],
    cues: ["Rotation comes from the torso — not just the elbow moving", "Core stays engaged throughout the full set", "Light cardio + oblique work — two benefits in one"],
  },
  // ── Mobility & Warm-Up ────────────────────────────────────────────────────
  "Arm Circles (forward & back)": {
    steps: ["Stand with arms extended straight out to the sides.", "Make 10 small circles forward, then 10 large circles forward.", "Reverse: 10 small and 10 large circles backward."],
    cues: ["Essential before any pushing or pressing exercise", "Start small and progressively increase the diameter", "Feel the shoulder joint warming up with each rotation"],
  },
  "Shoulder Rolls": {
    steps: ["Stand tall, arms relaxed at your sides.", "Roll both shoulders forward in a large circle: up, forward, down, back.", "Complete reps, then reverse direction."],
    cues: ["Move slowly — feel the full range at the top and bottom", "Lubricates the shoulder girdle before upper-body work", "Combine with Arm Circles for a complete shoulder warm-up"],
  },
  "Hip Circle (standing)": {
    steps: ["Stand with feet shoulder-width, hands on hips.", "Move your hips in a large clockwise circle.", "Complete reps, then reverse to counterclockwise."],
    cues: ["Make the circle as wide as possible", "Move slowly enough to feel the entire range", "Warms the hip joint before squats, lunges, and deadlifts"],
  },
  "Leg Swing (front/back)": {
    steps: ["Stand beside a wall for balance, one hand touching it lightly.", "Swing the outside leg forward as high as control allows, then back behind you.", "Keep the swing relaxed and dynamic — this is a mobility drill, not a static stretch."],
    cues: ["Swing from the hip — don't let momentum come from your spine", "Controlled ballistic movement — don't force the range", "10 reps is enough; you're priming the hamstrings, not exhausting them"],
  },
  "Leg Swing (side/side)": {
    steps: ["Stand facing a wall, both hands touching for balance.", "Swing one leg across your body to the opposite side, then out to your side as far as it comfortably goes.", "Keep the movement smooth and controlled."],
    cues: ["Hip abductors and adductors both get primed", "Stay upright — don't lean away from the swinging leg", "Pairs with front/back swings for a complete hip warm-up"],
  },
  "Ankle Circle": {
    steps: ["Sit or stand and lift one foot slightly off the floor.", "Rotate the ankle in a full clockwise circle — as wide as possible.", "Complete reps, then reverse direction. Switch feet."],
    cues: ["Ankle mobility affects knee and hip mechanics downstream", "Often overlooked — critical for sedentary adults", "Make the circle as full and wide as possible"],
  },
  "Wrist Circle": {
    steps: ["Extend arms in front of you with hands in loose fists.", "Rotate both wrists slowly clockwise, then counterclockwise.", "Also: interlace fingers and rotate both wrists together."],
    cues: ["Non-negotiable before any push-up or plank work", "If wrists click, use smaller circles first", "Pain during wrist circles is a signal to modify push-up grip"],
  },
  "Cat-Cow": {
    steps: ["Start on all fours: wrists under shoulders, knees under hips.", "Exhale: round your entire spine toward the ceiling (Cat).", "Inhale: drop your belly, lift chest and tailbone (Cow). Flow between the two."],
    cues: ["Breathe into each position — don't rush", "Move slowly so each vertebra participates", "Most effective lower-back warm-up before any loaded movement"],
  },
  "Child's Pose": {
    steps: ["Kneel on the floor and sit hips back toward your heels.", "Extend arms forward on the floor and rest your forehead down.", "Breathe deeply — feel the lower back and hips expand with each inhale."],
    cues: ["Wide knees open the hips more", "Breathe into your lower back — feel it expand with each inhale", "Great recovery reset between hard sets or at the end of a workout"],
  },
  "Cobra Stretch": {
    steps: ["Lie face down, hands flat under your shoulders.", "Gently press up, lifting your chest off the floor while keeping hips and lower body relaxed on the floor.", "Hold 20 seconds. Elbows can remain slightly bent."],
    cues: ["Therapeutic for most lumbar disc issues (McKenzie extension)", "Skip if you have spinal stenosis", "If wrists are a concern, perform on forearms (Sphinx pose)"],
  },
  "Hip Flexor Stretch (kneeling)": {
    steps: ["Kneel on one knee, the other foot planted in front of you.", "Shift weight forward until you feel a deep stretch in the front of the rear hip.", "Hold 20 seconds. Keep torso tall — don't lean forward."],
    cues: ["Hip flexors are chronically tight from sitting — this is a priority", "Squeeze the glute of the rear leg to deepen the stretch", "Use a folded towel under the knee if it's uncomfortable"],
  },
  "World's Greatest Stretch": {
    steps: ["Start in a deep lunge (right foot forward). Place both hands on the floor inside your right foot.", "Rotate your right arm toward the ceiling, opening the chest. Hold 2 seconds.", "Return hand to floor, push back toward a hamstring stretch, then switch to the left side."],
    cues: ["One rep covers hips, thoracic spine, and hamstrings", "Move slowly — don't rush through the rotation", "5 reps per side as a warm-up covers your entire body"],
  },
  "Doorway Chest Stretch": {
    steps: ["Stand in a doorway, elbows at 90° and forearms on the doorframe.", "Step forward slightly until you feel a stretch across the chest and front of the shoulders.", "Hold 20 seconds. Breathe into the stretch."],
    cues: ["High elbows target lower chest; low elbows target upper chest", "Opens what desk posture closes — do this daily", "Never bounce — hold a steady stretch only"],
  },
  "Thread the Needle": {
    steps: ["Start on all fours with a neutral spine.", "Slide one arm under your body, palm facing up, until your shoulder and ear rest on the floor.", "Hold, feeling the rotation through your upper back. Return and switch sides."],
    cues: ["The threading arm reaches under as far as it can go", "Thoracic spine rotation — not just a shoulder stretch", "Great for upper-back tightness from desk work"],
  },
  "Neck Rolls (slow)": {
    steps: ["Sit or stand with good posture.", "Slowly drop your right ear toward your right shoulder. Roll your head forward and across to the left.", "Continue in a slow, controlled arc. Do NOT roll the head backward into hyperextension."],
    cues: ["Slow is the only acceptable speed for this exercise", "Never roll the head back into extension", "Any sharp or pinching sensation means stop immediately"],
  },
};

// Updated schedule:
// - Thursday: push/pull/hinge(lower)/core alternating — 2 per category = 8 exercises
// - Friday: Back + Cardio only (removed pullVariations — was 24h after Thursday pulls)
// - catCounts drives how many exercises per category (replaces hardcoded slice(0,3))
// - warmup key maps to WARMUP_PRESETS
const weekSchedule = [
  { day: "MON", focus: "Upper Body",   color: "#e85d26", cats: ["pushVariations", "dipsTriCeps"],               catCounts: [3, 2], warmup: "upper" },
  { day: "TUE", focus: "Core + Lower", color: "#2d6a4f", cats: ["core", "lowerBody"],                           catCounts: [3, 3], warmup: "lower" },
  { day: "WED", focus: "Rest",         color: "var(--muted)",    cats: [] },
  { day: "THU", focus: "Full Body",    color: "#8b5cf6", cats: ["pushVariations", "pullVariations", "lowerBody", "core"], catCounts: [2, 2, 2, 2], warmup: "full" },
  { day: "FRI", focus: "Back + Cardio",color: "#0ea5e9", cats: ["back", "cardioConditioning"],                  catCounts: [4, 3], warmup: "lower" },
  { day: "SAT", focus: "Core + Mobility", color: "#10b981", cats: ["core", "mobilityWarmup"],                   catCounts: [3, 3] },
  { day: "SUN", focus: "Rest",         color: "var(--muted)",    cats: [] },
];

const totalExercises = Object.values(ALL_EXERCISES).reduce((sum, cat) => sum + cat.exercises.length, 0);
const DAY_ABBRS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const AGE_RANGES = ["Under 40", "40–49", "50–59", "60+"];
const TARGET_WORKOUTS = 20; // 5 active days/week × 4 weeks

function getThisWeekDates() {
  const today = new Date();
  const dow = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (dow === 0 ? 6 : dow - 1));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d.toISOString().split("T")[0];
  });
}

const DEFAULT_PREFS = { name: "", ageRange: "", ailments: [] };

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [theme, setTheme] = useState(() => {
    const t = loadStorage("pt-theme", "dark");
    document.documentElement.setAttribute("data-theme", t);
    return t;
  });
  const [onboarded, setOnboarded] = useState(() =>
    localStorage.getItem("pt-onboarded") === "true" ||
    localStorage.getItem("pt-mission-start") !== null
  );
  const [onboardStep, setOnboardStep] = useState(0);
  const [activeTab, setActiveTab] = useState("schedule");
  const [selectedCat, setSelectedCat] = useState("pushVariations");
  const [selectedDay, setSelectedDay] = useState(() => DAY_ABBRS[new Date().getDay()]);
  const [demoEx, setDemoEx] = useState(null);
  const [search, setSearch] = useState("");
  const [completed, setCompleted] = useState(() => migrateCompleted(loadStorage("pt-completed", {})));
  const [expanded, setExpanded] = useState(null);
  const [prefs, setPrefs] = useState(() => loadStorage("pt-prefs", DEFAULT_PREFS));
  const [missionStartDate, setMissionStartDate] = useState(() =>
    localStorage.getItem("pt-mission-start")
  );
  const [completedWorkoutDates, setCompletedWorkoutDates] = useState(() =>
    loadStorage("pt-completed-dates", [])
  );

  // ── Computed values needed by effects ──────────────────────────────────────

  const todayStr = new Date().toISOString().split("T")[0];

  const missionDay = missionStartDate
    ? Math.max(1, Math.floor((Date.now() - new Date(missionStartDate).getTime()) / 86400000) + 1)
    : 1;
  // weekNumber 0–3: drives exercise rotation so each week shows a different slice
  const weekNumber = Math.floor((missionDay - 1) / 7);

  const getRotatedExercises = (catKey, count) => {
    const exs = ALL_EXERCISES[catKey]?.exercises || [];
    if (!exs.length) return [];
    const offset = (weekNumber * count) % exs.length;
    return [...exs.slice(offset), ...exs.slice(0, offset)].slice(0, count);
  };

  const dayData = weekSchedule.find(d => d.day === selectedDay);
  const dayExercises = dayData?.cats.flatMap((ck, ci) =>
    getRotatedExercises(ck, dayData.catCounts?.[ci] ?? 3)
  ) || [];

  // date-prefixed key lookup — fixes cross-day collision
  const dayDone = dayExercises.filter(e =>
    [0, 1, 2].every(i => completed[`${todayStr}:${e.name}-${i}`])
  ).length;

  // ── Persistence effects ────────────────────────────────────────────────────

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("pt-theme", theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("pt-completed", JSON.stringify(completed));
  }, [completed]);

  useEffect(() => {
    localStorage.setItem("pt-prefs", JSON.stringify(prefs));
  }, [prefs]);

  useEffect(() => {
    localStorage.setItem("pt-completed-dates", JSON.stringify(completedWorkoutDates));
  }, [completedWorkoutDates]);

  // Auto-mark today complete — fixed stale closure by including completedWorkoutDates in deps
  useEffect(() => {
    if (dayExercises.length > 0 && dayDone === dayExercises.length) {
      const todayAbbr = DAY_ABBRS[new Date().getDay()];
      if (selectedDay === todayAbbr && !completedWorkoutDates.includes(todayStr)) {
        setCompletedWorkoutDates(prev => [...prev, todayStr]);
      }
    }
  }, [completed, selectedDay, completedWorkoutDates, todayStr]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Handlers ──────────────────────────────────────────────────────────────

  const toggleSet = (name, i) => {
    const k = `${todayStr}:${name}-${i}`;
    setCompleted(p => ({ ...p, [k]: !p[k] }));
  };

  const toggleAilment = (key) => {
    setPrefs(p => ({
      ...p,
      ailments: p.ailments.includes(key)
        ? p.ailments.filter(a => a !== key)
        : [...p.ailments, key],
    }));
  };

  const hasCaution = (ex) =>
    prefs.ailments.length > 0 && ex.caution?.some(c => prefs.ailments.includes(c));

  const completeOnboarding = () => {
    const today = new Date().toISOString().split("T")[0];
    localStorage.setItem("pt-mission-start", today);
    localStorage.setItem("pt-onboarded", "true");
    setMissionStartDate(today);
    setOnboarded(true);
    setActiveTab("schedule");
  };

  const resetProgress = () => {
    setCompleted({});
    setCompletedWorkoutDates([]);
  };

  const restartMission = () => {
    const today = new Date().toISOString().split("T")[0];
    localStorage.setItem("pt-mission-start", today);
    setMissionStartDate(today);
    setCompleted({});
    setCompletedWorkoutDates([]);
  };

  // ── Derived display values ─────────────────────────────────────────────────

  const filteredExercises = search.length > 1
    ? Object.values(ALL_EXERCISES).flatMap(c => c.exercises).filter(e =>
        e.name.toLowerCase().includes(search.toLowerCase()) ||
        e.notes.toLowerCase().includes(search.toLowerCase())
      )
    : ALL_EXERCISES[selectedCat]?.exercises || [];

  const workoutsCompleted = completedWorkoutDates.length;
  const missionProgress = Math.min(Math.round((workoutsCompleted / TARGET_WORKOUTS) * 100), 100);
  const missionComplete = workoutsCompleted >= TARGET_WORKOUTS;
  const thisWeekDates = getThisWeekDates();
  const streak = calcStreak(completedWorkoutDates);
  const activeAilments = AILMENTS.filter(a => prefs.ailments.includes(a.key));

  const inputStyle = {
    width: "100%", boxSizing: "border-box",
    background: "var(--surface0)", border: "1px solid #252525",
    borderRadius: 10, padding: "10px 14px",
    color: "var(--text)", fontSize: 14, fontFamily: "inherit", outline: "none",
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  // ── Onboarding overlay ──────────────────────────────────────────────────────
  if (!onboarded) {
    const stepDots = (
      <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 32 }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: i === onboardStep ? 20 : 6, height: 6, borderRadius: 3,
            background: i === onboardStep ? "#e85d26" : "var(--border2)",
            transition: "width 0.3s ease",
          }} />
        ))}
      </div>
    );

    return (
      <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text)", fontFamily: "'Barlow Condensed', sans-serif", maxWidth: 480, margin: "0 auto", display: "flex", flexDirection: "column", padding: "48px 24px 40px" }}>

        {/* Step 0 — Welcome */}
        {onboardStep === 0 && (
          <>
            <div style={{ flex: 1 }}>
              <div style={{ textAlign: "center", marginBottom: 36 }}>
                <div style={{ fontSize: 52, marginBottom: 14 }}>🪖</div>
                <div style={{ fontSize: 10, letterSpacing: 5, color: "#e85d26", textTransform: "uppercase", marginBottom: 10 }}>Operation Fit</div>
                <div style={{ fontSize: 26, fontWeight: "bold", lineHeight: 1.2, marginBottom: 12 }}>Military-Style Calisthenics</div>
                <div style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.6 }}>
                  Low-impact. Consistent. Built for the long game.<br />
                  3 sets of 10. No gym required.
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 10, letterSpacing: 2, color: "var(--muted)", textTransform: "uppercase", marginBottom: 8 }}>Your name (optional)</div>
                <input
                  value={prefs.name}
                  onChange={e => setPrefs(p => ({ ...p, name: e.target.value }))}
                  placeholder="Enter name"
                  style={{ width: "100%", boxSizing: "border-box", background: "var(--surface0)", border: "1px solid #252525", borderRadius: 10, padding: "12px 14px", color: "var(--text)", fontSize: 15, fontFamily: "inherit", outline: "none" }}
                />
              </div>

              <div>
                <div style={{ fontSize: 10, letterSpacing: 2, color: "var(--muted)", textTransform: "uppercase", marginBottom: 10 }}>Age range</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {AGE_RANGES.map(range => {
                    const active = prefs.ageRange === range;
                    return (
                      <button key={range} onClick={() => setPrefs(p => ({ ...p, ageRange: active ? "" : range }))} style={{
                        padding: "9px 18px", borderRadius: 20, border: "1px solid",
                        borderColor: active ? "#e85d26" : "var(--border2)",
                        background: active ? "#e85d2622" : "transparent",
                        color: active ? "#e85d26" : "var(--muted)",
                        fontSize: 14, fontFamily: "inherit", cursor: "pointer",
                      }}>{range}</button>
                    );
                  })}
                </div>
              </div>
            </div>

            {stepDots}
            <button onClick={() => setOnboardStep(1)} style={{
              width: "100%", padding: "15px", borderRadius: 12,
              border: "none", background: "#e85d26",
              color: "#fff", fontSize: 15, fontWeight: "bold",
              fontFamily: "inherit", cursor: "pointer", letterSpacing: 1,
            }}>Continue →</button>
          </>
        )}

        {/* Step 1 — Physical Limitations */}
        {onboardStep === 1 && (
          <>
            <div style={{ flex: 1 }}>
              <div style={{ marginBottom: 28 }}>
                <div style={{ fontSize: 10, letterSpacing: 4, color: "#e85d26", textTransform: "uppercase", marginBottom: 10 }}>Step 2 of 3</div>
                <div style={{ fontSize: 22, fontWeight: "bold", marginBottom: 8 }}>Any Physical Limitations?</div>
                <div style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.6 }}>
                  Exercises that match your selections will show a <span style={{ color: "#f59e0b" }}>Modify</span> badge so you can adapt safely. You can always update this in Settings.
                </div>
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
                      border: `2px solid ${active ? "#f59e0b" : "#444"}`,
                      background: active ? "#f59e0b" : "transparent",
                      display: "flex", alignItems: "center", justifyContent: "center",
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
            </div>

            {stepDots}
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setOnboardStep(2)} style={{
                flex: 1, padding: "15px", borderRadius: 12, border: "1px solid #252525",
                background: "transparent", color: "var(--muted)", fontSize: 14,
                fontFamily: "inherit", cursor: "pointer",
              }}>Skip</button>
              <button onClick={() => setOnboardStep(2)} style={{
                flex: 2, padding: "15px", borderRadius: 12,
                border: "none", background: "#e85d26",
                color: "#fff", fontSize: 15, fontWeight: "bold",
                fontFamily: "inherit", cursor: "pointer", letterSpacing: 1,
              }}>Continue →</button>
            </div>
          </>
        )}

        {/* Step 2 — Mission Brief */}
        {onboardStep === 2 && (
          <>
            <div style={{ flex: 1 }}>
              <div style={{ textAlign: "center", marginBottom: 32 }}>
                <div style={{ fontSize: 48, marginBottom: 14 }}>🎖️</div>
                <div style={{ fontSize: 10, letterSpacing: 4, color: "#e85d26", textTransform: "uppercase", marginBottom: 10 }}>Step 3 of 3</div>
                <div style={{ fontSize: 24, fontWeight: "bold", marginBottom: 10 }}>Your 30-Day Mission</div>
                <div style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.7 }}>
                  Complete <strong style={{ color: "var(--text)" }}>20 workouts</strong> in 30 days.<br />
                  3 sets of 10. Low impact. Every rep counts.
                </div>
              </div>

              {[
                { week: "Week 1–2", goal: "Build the habit. Muscles begin to adapt.", icon: "🌱" },
                { week: "Week 3", goal: "Noticeable strength in push-ups and squats.", icon: "💪" },
                { week: "Week 4", goal: "Core stronger. Posture visibly improved.", icon: "🎯" },
              ].map((m, i) => (
                <div key={i} style={{
                  background: "var(--surface)", border: "1px solid #1e1e1e",
                  borderRadius: 11, padding: "14px 16px", marginBottom: 8,
                  display: "flex", alignItems: "center", gap: 14,
                }}>
                  <span style={{ fontSize: 24 }}>{m.icon}</span>
                  <div>
                    <div style={{ fontSize: 11, color: "#e85d26", letterSpacing: 1, marginBottom: 3 }}>{m.week}</div>
                    <div style={{ fontSize: 13, color: "var(--text)" }}>{m.goal}</div>
                  </div>
                </div>
              ))}

              <div style={{ background: "var(--surface)", border: "1px solid #1e1e1e", borderRadius: 11, padding: "14px 16px", marginTop: 8 }}>
                <div style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.6 }}>
                  📅 Your schedule focuses on <strong style={{ color: "var(--text)" }}>Upper, Core/Lower, and Full Body</strong> days with built-in rest. Warm-ups are included.
                </div>
              </div>
            </div>

            {stepDots}
            <button onClick={completeOnboarding} style={{
              width: "100%", padding: "16px", borderRadius: 12,
              border: "none", background: "#e85d26",
              color: "#fff", fontSize: 16, fontWeight: "bold",
              fontFamily: "inherit", cursor: "pointer", letterSpacing: 1,
            }}>🪖 Begin Mission</button>
          </>
        )}
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text)", fontFamily: "'Barlow Condensed', sans-serif", maxWidth: 480, margin: "0 auto" }}>

      {/* ── Header ── */}
      <div style={{ background: "var(--header-bg)", borderBottom: "1px solid #1e1e1e", padding: "20px 18px 14px", position: "sticky", top: 0, zIndex: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
          <div>
            {prefs.name && (
              <div style={{ fontSize: 10, letterSpacing: 4, color: "#e85d26", textTransform: "uppercase", marginBottom: 3 }}>
                🪖 {prefs.name}
              </div>
            )}
            <div style={{ fontSize: 22, fontWeight: "bold", letterSpacing: -0.5 }}>Military Calisthenics</div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
            <button
              onClick={() => setTheme(t => t === "dark" ? "light" : "dark")}
              title="Toggle theme"
              style={{
                background: "var(--surface2)", border: "1px solid var(--border2)",
                borderRadius: 10, width: 40, height: 40, fontSize: 18,
                cursor: "pointer", flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >{theme === "dark" ? "☀️" : "🌙"}</button>
            <div style={{ textAlign: "right", background: "var(--surface2)", border: "1px solid var(--border2)", borderRadius: 10, padding: "8px 12px" }}>
              <div style={{ fontSize: 10, color: "var(--muted)", letterSpacing: 1 }}>EXERCISES</div>
              <div style={{ fontSize: 22, fontWeight: "bold", color: "#e85d26" }}>{totalExercises}</div>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 5 }}>
          {[
            { key: "library", label: "Library" },
            { key: "schedule", label: "Schedule" },
            { key: "progress", label: "Progress" },
            { key: "settings", label: "Settings" },
          ].map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)} style={{
              flex: 1, padding: "7px 0", borderRadius: 7, border: "1px solid",
              borderColor: activeTab === t.key ? "#e85d26" : "#222",
              background: activeTab === t.key ? "#e85d26" : "transparent",
              color: activeTab === t.key ? "#fff" : "var(--muted3)",
              fontSize: 11, fontFamily: "inherit", cursor: "pointer",
              letterSpacing: 0.5, textTransform: "uppercase",
            }}>{t.label}</button>
          ))}
        </div>
      </div>

      <div style={{ padding: "14px 18px 100px" }}>

        {/* ════════════════════════════════════════════════════════════════════
            LIBRARY TAB
        ════════════════════════════════════════════════════════════════════ */}
        {activeTab === "library" && (
          <>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search exercises..."
              style={{ ...inputStyle, marginBottom: 14 }}
            />

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
                    {cat.icon} {cat.label} ({cat.exercises.length})
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
              // Fix: use the exercise's own category icon, not selectedCat (search crosses categories)
              const catKey = search ? (exerciseCategoryMap[ex.name] ?? selectedCat) : selectedCat;
              return (
                <div key={idx} style={{
                  background: warn ? "var(--warn-surface)" : "var(--surface)",
                  border: `1px solid ${warn ? "#f59e0b44" : "var(--border)"}`,
                  borderRadius: 11, padding: "13px 15px", marginBottom: 8,
                  display: "flex", alignItems: "center", gap: 12,
                }}>
                  <span style={{ fontSize: 22 }}>{ALL_EXERCISES[catKey]?.icon || "⚡"}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 4 }}>
                      <span style={{ fontSize: 14, fontWeight: "bold" }}>{ex.name}</span>
                      {warn && (
                        <span style={{
                          fontSize: 9, letterSpacing: 1, textTransform: "uppercase",
                          background: "#f59e0b22", border: "1px solid #f59e0b55",
                          borderRadius: 4, padding: "1px 5px", color: "#f59e0b",
                        }}>Modify</span>
                      )}
                    </div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                      <span style={{ background: "var(--surface3)", border: "1px solid #2a2a2a", borderRadius: 5, padding: "2px 7px", fontSize: 11, color: "#e85d26" }}>{ex.sets}</span>
                      <span style={{ fontSize: 11, color: "var(--muted)" }}>{ex.notes}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setDemoEx(ex)}
                    title="How to perform"
                    style={{
                      background: "none", border: "1px solid #252525", borderRadius: 7,
                      width: 30, height: 30, color: "var(--muted)", fontSize: 14,
                      cursor: "pointer", flexShrink: 0, fontFamily: "inherit",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                  >ⓘ</button>
                </div>
              );
            })}
          </>
        )}

        {/* ════════════════════════════════════════════════════════════════════
            SCHEDULE TAB
        ════════════════════════════════════════════════════════════════════ */}
        {activeTab === "schedule" && (
          <>
            <div style={{ display: "flex", gap: 5, marginBottom: 16, overflowX: "auto", paddingBottom: 4 }}>
              {weekSchedule.map(d => (
                <button key={d.day} onClick={() => setSelectedDay(d.day)} style={{
                  minWidth: 50, padding: "9px 4px", borderRadius: 9, border: "1px solid",
                  borderColor: selectedDay === d.day ? d.color : "var(--border)",
                  background: selectedDay === d.day ? d.color : "var(--surface)",
                  color: selectedDay === d.day ? "#fff" : "#555",
                  fontSize: 10, fontFamily: "inherit", cursor: "pointer", textTransform: "uppercase", letterSpacing: 1,
                }}>
                  <div style={{ fontWeight: "bold" }}>{d.day}</div>
                  <div style={{ fontSize: 8, marginTop: 3, opacity: 0.8 }}>{d.focus.split(" ")[0]}</div>
                </button>
              ))}
            </div>

            {/* Day header */}
            <div style={{
              background: "var(--surface)", border: `1px solid ${dayData?.color || "var(--border)"}`,
              borderRadius: 13, padding: "15px 17px", marginBottom: 12,
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <div>
                <div style={{ fontSize: 10, color: "var(--muted)", letterSpacing: 2, textTransform: "uppercase" }}>{selectedDay}</div>
                <div style={{ fontSize: 19, fontWeight: "bold", color: dayData?.color }}>{dayData?.focus}</div>
                {dayExercises.length > 0 && (
                  <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>
                    {dayData?.cats.map(ck => ALL_EXERCISES[ck]?.label).join(" · ")}
                  </div>
                )}
              </div>
              {dayExercises.length > 0 && (
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 26, fontWeight: "bold", color: dayData?.color }}>{dayDone}</div>
                  <div style={{ fontSize: 10, color: "var(--muted)" }}>of {dayExercises.length}</div>
                </div>
              )}
            </div>

            {/* Warm-up callout */}
            {dayData?.warmup && WARMUP_PRESETS[dayData.warmup] && (
              <div style={{
                background: "var(--info-surface)", border: "1px solid #10b98133",
                borderRadius: 10, padding: "10px 14px", marginBottom: 12,
                display: "flex", alignItems: "center", gap: 10,
              }}>
                <span style={{ fontSize: 18 }}>🧘</span>
                <div>
                  <div style={{ fontSize: 10, color: "#10b981", letterSpacing: 2, textTransform: "uppercase", marginBottom: 2 }}>Warm-up first — 2–3 min</div>
                  <div style={{ fontSize: 11, color: "var(--muted3)" }}>{WARMUP_PRESETS[dayData.warmup]}</div>
                </div>
              </div>
            )}

            {dayExercises.length === 0 ? (
              <div style={{ textAlign: "center", padding: "48px 20px", color: "var(--muted3)" }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>😴</div>
                <div style={{ fontSize: 17 }}>Rest Day</div>
                <div style={{ fontSize: 12, marginTop: 6, color: "var(--muted2)" }}>Light walk or 10 min mobility recommended.</div>
              </div>
            ) : (
              dayExercises.map((ex, idx) => {
                const allDone = [0, 1, 2].every(i => completed[`${todayStr}:${ex.name}-${i}`]);
                const isExp = expanded === ex.name;
                const warn = hasCaution(ex);
                return (
                  <div key={idx} style={{
                    background: allDone ? "var(--success-surface)" : warn ? "var(--warn-surface)" : "var(--surface)",
                    border: `1px solid ${allDone ? "#2d6a4f" : warn ? "#f59e0b44" : "var(--border)"}`,
                    borderRadius: 11, marginBottom: 8, overflow: "hidden",
                  }}>
                    <div onClick={() => setExpanded(isExp ? null : ex.name)} style={{
                      padding: "13px 15px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer",
                    }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 3 }}>
                          <span style={{
                            fontSize: 14, fontWeight: "bold",
                            color: allDone ? "#4ade80" : "var(--text)",
                            textDecoration: allDone ? "line-through" : "none",
                            opacity: allDone ? 0.6 : 1,
                          }}>{ex.name}</span>
                          {warn && !allDone && (
                            <span style={{
                              fontSize: 9, letterSpacing: 1, textTransform: "uppercase",
                              background: "#f59e0b22", border: "1px solid #f59e0b55",
                              borderRadius: 4, padding: "1px 5px", color: "#f59e0b",
                            }}>Modify</span>
                          )}
                        </div>
                        <div style={{ fontSize: 11, color: "var(--muted)" }}>{ex.sets} · {ex.notes}</div>
                      </div>
                      <button
                        onClick={e => { e.stopPropagation(); setDemoEx(ex); }}
                        title="How to perform"
                        style={{
                          background: "none", border: "1px solid #252525", borderRadius: 7,
                          width: 28, height: 28, color: "var(--muted)", fontSize: 13,
                          cursor: "pointer", flexShrink: 0, fontFamily: "inherit",
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}
                      >ⓘ</button>
                      <div style={{ fontSize: 16, color: allDone ? "#4ade80" : "var(--border3)" }}>
                        {allDone ? "✓" : isExp ? "▲" : "▼"}
                      </div>
                    </div>
                    {isExp && (
                      <div style={{ padding: "0 15px 13px", borderTop: "1px solid #181818", paddingTop: 12 }}>
                        <div style={{ fontSize: 10, color: "var(--muted)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>Log Sets</div>
                        <div style={{ display: "flex", gap: 8 }}>
                          {[1, 2, 3].map((s, i) => {
                            const done = completed[`${todayStr}:${ex.name}-${i}`];
                            return (
                              <button key={i} onClick={() => toggleSet(ex.name, i)} style={{
                                flex: 1, padding: "11px 0", borderRadius: 9,
                                border: `2px solid ${done ? "#4ade80" : "var(--border2)"}`,
                                background: done ? "var(--success-surface2)" : "var(--surface2)",
                                color: done ? "#4ade80" : "#555",
                                fontSize: 13, fontFamily: "inherit", cursor: "pointer",
                              }}>
                                {done ? "✓" : `Set ${s}`}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </>
        )}

        {/* ════════════════════════════════════════════════════════════════════
            PROGRESS TAB
        ════════════════════════════════════════════════════════════════════ */}
        {activeTab === "progress" && (
          <>
            {/* Streak card */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 14 }}>
              {[
                { label: "Current Streak", value: streak.current, unit: streak.current === 1 ? "day" : "days", color: streak.current > 0 ? "#e85d26" : "#444" },
                { label: "Best Streak", value: streak.best, unit: streak.best === 1 ? "day" : "days", color: "#8b5cf6" },
                { label: "Total Workouts", value: streak.total, unit: "done", color: "#10b981" },
              ].map((s, i) => (
                <div key={i} style={{ background: "var(--surface)", border: `1px solid ${s.color}33`, borderRadius: 11, padding: "12px 10px", textAlign: "center" }}>
                  <div style={{ fontSize: 22, fontWeight: "bold", color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 9, color: "var(--muted)", marginTop: 2, letterSpacing: 0.5 }}>{s.unit}</div>
                  <div style={{ fontSize: 9, color: "var(--muted2)", marginTop: 3, letterSpacing: 0.5, textTransform: "uppercase" }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Mission card */}
            {missionComplete ? (
              <div style={{
                background: "linear-gradient(135deg, var(--complete-surface), var(--bg))",
                border: "1px solid #4ade8044", borderRadius: 14,
                padding: "20px", marginBottom: 14, textAlign: "center",
              }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>🎖️</div>
                <div style={{ fontSize: 10, color: "#4ade80", letterSpacing: 3, textTransform: "uppercase", marginBottom: 6 }}>Mission Complete</div>
                <div style={{ fontSize: 22, fontWeight: "bold" }}>30-Day Mission</div>
                <div style={{ fontSize: 13, color: "var(--muted3)", marginTop: 4 }}>You completed {workoutsCompleted} workouts.</div>
                <button
                  onClick={restartMission}
                  style={{
                    marginTop: 16, padding: "10px 24px", borderRadius: 20,
                    border: "1px solid #4ade80", background: "var(--success-surface2)",
                    color: "#4ade80", fontSize: 13, fontFamily: "inherit", cursor: "pointer",
                  }}
                >
                  Start Mission 2 →
                </button>
              </div>
            ) : (
              <div style={{
                background: "linear-gradient(135deg, var(--mission-surface), var(--bg))",
                border: "1px solid #e85d2644", borderRadius: 14,
                padding: "20px", marginBottom: 14, textAlign: "center",
              }}>
                <div style={{ fontSize: 10, color: "#e85d26", letterSpacing: 3, textTransform: "uppercase", marginBottom: 6 }}>30-Day Mission</div>
                <div style={{ fontSize: 44, fontWeight: "bold" }}>{workoutsCompleted}</div>
                <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>of {TARGET_WORKOUTS} workouts</div>
                <div style={{ marginTop: 14, height: 6, background: "var(--surface3)", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${missionProgress}%`, background: "#e85d26", borderRadius: 3, transition: "width 0.4s ease" }} />
                </div>
                <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 6 }}>
                  {missionProgress}% complete · Calendar day {missionDay}
                </div>
              </div>
            )}

            {/* This week */}
            <div style={{ fontSize: 10, color: "var(--muted)", letterSpacing: 3, textTransform: "uppercase", marginBottom: 10 }}>This Week</div>
            <div style={{ display: "flex", gap: 5, marginBottom: 18 }}>
              {weekSchedule.map((d, i) => {
                const dateStr = thisWeekDates[i];
                const isDone = completedWorkoutDates.includes(dateStr);
                return (
                  <div key={d.day} style={{
                    flex: 1, textAlign: "center", background: "var(--surface)",
                    border: `1px solid ${isDone ? d.color + "66" : d.cats.length > 0 ? "var(--border)" : "var(--border-subtle)"}`,
                    borderRadius: 9, padding: "9px 0",
                  }}>
                    <div style={{ fontSize: 9, color: isDone ? d.color : "#444", letterSpacing: 1 }}>{d.day}</div>
                    <div style={{ fontSize: 16, marginTop: 5 }}>
                      {d.cats.length === 0 ? "😴" : isDone ? "✅" : "⬜"}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Library stats */}
            <div style={{ fontSize: 10, color: "var(--muted)", letterSpacing: 3, textTransform: "uppercase", marginBottom: 10 }}>Exercise Library</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 18 }}>
              {categories.map(cat => (
                <div key={cat.key} style={{ background: "var(--surface)", border: `1px solid ${cat.color}33`, borderRadius: 11, padding: "14px", textAlign: "center" }}>
                  <div style={{ fontSize: 20 }}>{cat.icon}</div>
                  <div style={{ fontSize: 22, fontWeight: "bold", color: cat.color, marginTop: 4 }}>{cat.exercises.length}</div>
                  <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 3 }}>{cat.label}</div>
                </div>
              ))}
            </div>

            {/* Milestones */}
            <div style={{ fontSize: 10, color: "var(--muted)", letterSpacing: 3, textTransform: "uppercase", marginBottom: 10 }}>Milestones</div>
            {[
              { week: "Week 1–2", goal: "Build the habit, muscles adapt", icon: "🌱" },
              { week: "Week 3", goal: "Noticeable strength in push-ups & squats", icon: "💪" },
              { week: "Week 4", goal: "Core stronger, posture visibly improved", icon: "🎯" },
            ].map((m, i) => (
              <div key={i} style={{ background: "var(--surface)", border: "1px solid #1e1e1e", borderRadius: 11, padding: "13px 15px", marginBottom: 8, display: "flex", alignItems: "center", gap: 13 }}>
                <span style={{ fontSize: 26 }}>{m.icon}</span>
                <div>
                  <div style={{ fontSize: 12, color: "#e85d26", marginBottom: 3, letterSpacing: 1 }}>{m.week}</div>
                  <div style={{ fontSize: 13 }}>{m.goal}</div>
                </div>
              </div>
            ))}

            {/* Active ailment modifications */}
            {activeAilments.length > 0 && (
              <>
                <div style={{ fontSize: 10, color: "var(--muted)", letterSpacing: 3, textTransform: "uppercase", marginBottom: 10, marginTop: 18 }}>Your Modifications</div>
                {activeAilments.map((a) => (
                  <div key={a.key} style={{ background: "var(--surface)", border: "1px solid var(--caution-border)", borderRadius: 11, padding: "12px 15px", marginBottom: 8, display: "flex", gap: 12, alignItems: "center" }}>
                    <span style={{ fontSize: 20 }}>⚠️</span>
                    <div>
                      <div style={{ fontSize: 12, color: "#f59e0b", marginBottom: 3 }}>{a.label}</div>
                      <div style={{ fontSize: 12, color: "var(--muted3)" }}>{a.note}</div>
                    </div>
                  </div>
                ))}
              </>
            )}

            {activeAilments.length === 0 && (
              <div style={{ background: "var(--surface)", border: "1px solid #1e1e1e", borderRadius: 11, padding: "16px", marginTop: 18, textAlign: "center", color: "var(--muted2)", fontSize: 12 }}>
                No modifications set.{" "}
                <span onClick={() => setActiveTab("settings")} style={{ color: "#e85d26", cursor: "pointer" }}>
                  Add ailments in Settings →
                </span>
              </div>
            )}
          </>
        )}

        {/* ════════════════════════════════════════════════════════════════════
            SETTINGS TAB
        ════════════════════════════════════════════════════════════════════ */}
        {activeTab === "settings" && (
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
                border: "1px solid #252525", background: "transparent",
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
        )}
      </div>

      {/* Footer */}
      <div style={{
        position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
        width: "100%", maxWidth: 480, background: "var(--bg)",
        borderTop: "1px solid #141414", padding: "10px 18px 18px",
        textAlign: "center", fontSize: 10, color: "var(--border2)", letterSpacing: 2,
      }}>
        {prefs.name ? `${prefs.name.toUpperCase()} · ` : ""}{totalExercises} EXERCISES · LOW IMPACT PROTOCOL
      </div>

      {/* ── Exercise demo modal ── */}
      {demoEx && (() => {
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
              style={{ background: "var(--surface)", border: "1px solid #1e1e1e", borderRadius: "20px 20px 0 0", padding: "22px 20px 36px", width: "100%", maxWidth: 480, maxHeight: "82vh", overflowY: "auto" }}
            >
              {/* Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
                <div style={{ flex: 1, paddingRight: 12 }}>
                  <div style={{ fontSize: 9, color: catColor, letterSpacing: 3, textTransform: "uppercase", marginBottom: 5 }}>
                    {ALL_EXERCISES[catKey]?.icon} {ALL_EXERCISES[catKey]?.label}
                  </div>
                  <div style={{ fontSize: 18, fontWeight: "bold", lineHeight: 1.2 }}>{demoEx.name}</div>
                  <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 5 }}>{demoEx.sets} · {demoEx.notes}</div>
                </div>
                <button
                  onClick={() => setDemoEx(null)}
                  style={{ background: "var(--surface3)", border: "1px solid #252525", borderRadius: 8, width: 32, height: 32, color: "var(--muted3)", fontSize: 16, cursor: "pointer", fontFamily: "inherit", flexShrink: 0 }}
                >✕</button>
              </div>

              {/* Steps */}
              {demo?.steps.map((step, i) => (
                <div key={i} style={{ display: "flex", gap: 12, marginBottom: 14 }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: "50%", flexShrink: 0,
                    background: `${catColor}22`, border: `1px solid ${catColor}55`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 11, color: catColor, fontWeight: "bold",
                  }}>{i + 1}</div>
                  <div style={{ fontSize: 13, color: "#ccc", lineHeight: 1.55, paddingTop: 3 }}>{step}</div>
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
      })()}
    </div>
  );
}
