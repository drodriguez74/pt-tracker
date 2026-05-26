import { GiMuscleUp, GiWeightLiftingUp, GiLeg, GiBodyHeight, GiRunningShoe, GiMeditation } from "react-icons/gi";
import { FaDumbbell, FaFire } from "react-icons/fa";

export const AILMENTS = [
  { key: "shoulders", label: "Shoulders", color: "#f59e0b", note: "Avoid deep dips, overhead pressing, internal rotation under load. Prefer incline & wall push-ups." },
  { key: "lowerBack", label: "Lower Back", color: "#f59e0b", note: "Prioritize Dead Bug & Bird Dog. Avoid loaded spinal flexion and hyperextension." },
  { key: "knees",     label: "Knees",      color: "#f59e0b", note: "Use reverse lunges over forward. Limit squat depth to a comfortable range." },
  { key: "wrists",    label: "Wrists",     color: "#f59e0b", note: "Use fists or push-up handles for weight-bearing. Avoid sustained extended wrist under load." },
  { key: "neck",      label: "Neck",       color: "#f59e0b", note: "Never pull on your neck during crunches. Move slowly through all cervical rotations." },
  { key: "hips",      label: "Hips",       color: "#f59e0b", note: "Warm up hip flexors thoroughly. Limit deep hip flexion if it causes pain or catching." },
];

export const ALL_EXERCISES = {
  pushVariations: {
    label: "Push Variations", color: "#e85d26", icon: GiMuscleUp,
    exercises: [
      { name: "Standard Push-up",       sets: "3x10",     notes: "Elbows at 45°, core tight",                          difficulty: "intermediate", caution: ["wrists"],                    substitutes: ["Incline Push-up", "Wall Push-up"] },
      { name: "Incline Push-up",        sets: "3x12",     notes: "Hands on wall or bench — easiest on shoulders",       difficulty: "beginner" },
      { name: "Decline Push-up",        sets: "3x8",      notes: "Feet elevated — upper chest focus",                   difficulty: "intermediate", caution: ["shoulders"],                 substitutes: ["Standard Push-up", "Incline Push-up"] },
      { name: "Diamond Push-up",        sets: "3x8",      notes: "Skip if shoulders flare",                             difficulty: "intermediate", caution: ["shoulders", "wrists"],      substitutes: ["Wide-Arm Push-up", "Tricep Push-up"] },
      { name: "Wide-Arm Push-up",       sets: "3x10",     notes: "Hands wider than shoulders",                          difficulty: "intermediate" },
      { name: "Hand-Release Push-up",   sets: "3x8",      notes: "Lift hands off floor each rep — controlled",          difficulty: "intermediate" },
      { name: "Pike Push-up",           sets: "3x8",      notes: "Hips high, shoulder-safe overhead press",             difficulty: "intermediate", caution: ["shoulders", "wrists"],      substitutes: ["Wall Push-up", "Incline Push-up"] },
      { name: "Wall Push-up",           sets: "3x15",     notes: "Recovery days or warm-up",                            difficulty: "beginner" },
      { name: "Knee Push-up",           sets: "3x12",     notes: "Modified — great for shoulder recovery days",         difficulty: "beginner" },
      { name: "Archer Push-up",         sets: "3x6/side", notes: "One arm loaded, one extended — advanced",             difficulty: "advanced",     caution: ["shoulders", "wrists"],      substitutes: ["Wide-Arm Push-up", "Standard Push-up"] },
      { name: "Pseudo Planche Push-up", sets: "3x8",      notes: "Hands at hips — tricep & shoulder strength",          difficulty: "advanced",     caution: ["shoulders", "wrists"],      substitutes: ["Standard Push-up", "Diamond Push-up"] },
      { name: "Slow Negative Push-up",  sets: "3x6",      notes: "5-second lowering — builds control",                  difficulty: "intermediate", caution: ["wrists"],                    substitutes: ["Incline Push-up", "Wall Push-up"] },
    ],
  },
  pullVariations: {
    label: "Pull & Row Variations", color: "#8b5cf6", icon: GiWeightLiftingUp,
    exercises: [
      { name: "Pull-up (overhand)",      sets: "3x5",   notes: "Use a bar — full range",                              difficulty: "advanced",     caution: ["shoulders"],  substitutes: ["Australian Pull-up", "Doorframe Row"] },
      { name: "Chin-up (underhand)",     sets: "3x5",   notes: "Easier on shoulders than pull-up",                    difficulty: "intermediate" },
      { name: "Australian Pull-up",      sets: "3x10",  notes: "Low bar or table edge — great back exercise",          difficulty: "beginner" },
      { name: "Doorframe Row",           sets: "3x10",  notes: "Grab both sides of a doorframe and row",              difficulty: "beginner" },
      { name: "Towel Row",               sets: "3x10",  notes: "Loop towel around a pole and row",                    difficulty: "beginner" },
      { name: "Negative Pull-up",        sets: "3x5",   notes: "Jump up, lower slowly — builds pulling strength",     difficulty: "intermediate", caution: ["shoulders"],  substitutes: ["Scapular Pull-up", "Australian Pull-up"] },
      { name: "Scapular Pull-up",        sets: "3x10",  notes: "Hang and shrug shoulder blades — warm-up",            difficulty: "beginner" },
      { name: "Dead Hang",               sets: "3x20s", notes: "Decompress spine, grip strength",                     difficulty: "beginner" },
      { name: "Flex Hang (hold at top)", sets: "3x10s", notes: "Hold chin above bar",                                 difficulty: "intermediate", caution: ["shoulders"],  substitutes: ["Dead Hang", "Scapular Pull-up"] },
    ],
  },
  dipsTriCeps: {
    label: "Dips & Triceps", color: "#f59e0b", icon: FaDumbbell,
    exercises: [
      { name: "Bench Dip (shallow)",            sets: "3x10", notes: "Limit depth to protect shoulders",       difficulty: "intermediate", caution: ["shoulders"],           substitutes: ["Tricep Push-up"] },
      { name: "Chair Dip",                      sets: "3x10", notes: "Use a sturdy chair — keep elbows back",  difficulty: "intermediate", caution: ["shoulders"],           substitutes: ["Tricep Push-up"] },
      { name: "Tricep Push-up",                 sets: "3x10", notes: "Elbows tight to sides",                  difficulty: "intermediate", caution: ["wrists"],              substitutes: ["Diamond Push-up (tricep focus)"] },
      { name: "Diamond Push-up (tricep focus)", sets: "3x8",  notes: "Hands form diamond under chest",         difficulty: "intermediate", caution: ["shoulders", "wrists"], substitutes: ["Tricep Push-up"] },
    ],
  },
  core: {
    label: "Core & Abs", color: "#ef4444", icon: FaFire,
    exercises: [
      { name: "Dead Bug",                     sets: "3x10",      notes: "Best core exercise for back issues",                     difficulty: "beginner" },
      { name: "Bird Dog",                     sets: "3x10/side", notes: "Core stability — spine neutral",                         difficulty: "beginner" },
      { name: "Plank (standard)",             sets: "3x30s",     notes: "No lower back strain — back flat",                       difficulty: "intermediate", caution: ["wrists"],                       substitutes: ["Dead Bug", "Bird Dog"] },
      { name: "Side Plank",                   sets: "3x20s/side",notes: "Obliques — back-safe",                                   difficulty: "intermediate" },
      { name: "Glute Bridge",                 sets: "3x15",      notes: "Core + glutes — protects lower back",                    difficulty: "beginner" },
      { name: "Single-Leg Glute Bridge",      sets: "3x10/side", notes: "More glute activation — advanced version",               difficulty: "intermediate" },
      { name: "Hollow Body Hold",             sets: "3x20s",     notes: "Military staple — low back pressed to floor",            difficulty: "intermediate", caution: ["lowerBack"],                    substitutes: ["Dead Bug", "Bird Dog"] },
      { name: "Bent-Knee Leg Raise",          sets: "3x10",      notes: "Gentler on lower back than straight-leg",                difficulty: "beginner",     caution: ["lowerBack", "hips"],            substitutes: ["Bird Dog", "Dead Bug"] },
      { name: "Crunch (controlled)",          sets: "3x12",      notes: "Upper abs — don't pull neck",                           difficulty: "beginner",     caution: ["neck", "lowerBack"],            substitutes: ["Dead Bug", "Bird Dog"] },
      { name: "Bicycle Crunch",               sets: "3x10/side", notes: "Obliques — slow and controlled",                        difficulty: "intermediate", caution: ["neck"],                         substitutes: ["Bird Dog", "Side Plank"] },
      { name: "Flutter Kick",                 sets: "3x20s",     notes: "Hip flexors — keep low back pressed down",              difficulty: "intermediate", caution: ["lowerBack", "hips"],            substitutes: ["Dead Bug", "Glute Bridge"] },
      { name: "Superman Hold",                sets: "3x10",      notes: "Lower back strengthening — hold 2s",                    difficulty: "beginner",     caution: ["lowerBack"],                    substitutes: ["Bird Dog", "Dead Bug"] },
      { name: "Reverse Snow Angel (floor)",   sets: "3x10",      notes: "Upper back and rear delts",                             difficulty: "beginner" },
      { name: "V-Sit Hold",                   sets: "3x15s",     notes: "Advanced — skip if back is flaring",                    difficulty: "advanced",     caution: ["lowerBack"],                    substitutes: ["Hollow Body Hold", "Dead Bug"] },
      { name: "Windshield Wiper (bent knee)", sets: "3x10/side", notes: "Rotational core — go slow",                             difficulty: "intermediate", caution: ["lowerBack", "hips"],            substitutes: ["Side Plank", "Bird Dog"] },
      { name: "Plank Hip Dip",                sets: "3x10/side", notes: "Side obliques from plank position",                     difficulty: "intermediate", caution: ["wrists"],                       substitutes: ["Side Plank", "Dead Bug"] },
      { name: "Ab Wheel Rollout (from knees)",sets: "3x8",       notes: "Advanced — full core",                                  difficulty: "advanced",     caution: ["lowerBack", "wrists", "shoulders"], substitutes: ["Dead Bug", "Plank (standard)"] },
      { name: "Seated Knee Tuck",             sets: "3x12",      notes: "Sit on edge of chair, pull knees to chest",             difficulty: "beginner",     caution: ["hips", "lowerBack"],            substitutes: ["Bird Dog", "Dead Bug"] },
    ],
  },
  lowerBody: {
    label: "Lower Body", color: "#22c55e", icon: GiLeg,
    exercises: [
      { name: "Romanian Deadlift (BW)",       sets: "3x10",      notes: "Hip hinge — back flat, push hips back",   difficulty: "intermediate", caution: ["lowerBack"],      substitutes: ["Glute Bridge", "Donkey Kick"] },
      { name: "Good Morning (bodyweight)",    sets: "3x10",      notes: "Hamstrings — hinge at hips, back flat",   difficulty: "beginner",     caution: ["lowerBack"],      substitutes: ["Glute Bridge", "Glute Kickback"] },
      { name: "Bodyweight Squat",             sets: "3x10",      notes: "Don't pass 90° if knees flare",           difficulty: "beginner",     caution: ["knees"],          substitutes: ["Wall Sit", "Glute Bridge"] },
      { name: "Reverse Lunge",                sets: "3x10/side", notes: "Easier on knees than forward lunges",     difficulty: "intermediate" },
      { name: "Glute Bridge",                 sets: "3x15",      notes: "Core + glutes — protects lower back",     difficulty: "beginner" },
      { name: "Single-Leg Glute Bridge",      sets: "3x10/side", notes: "More glute activation — advanced version",difficulty: "intermediate" },
      { name: "Wall Sit",                     sets: "3x30s",     notes: "Isometric — zero knee impact",            difficulty: "beginner" },
      { name: "Sumo Squat",                   sets: "3x10",      notes: "Wider stance — inner thigh focus",        difficulty: "beginner",     caution: ["knees", "hips"], substitutes: ["Wall Sit", "Glute Bridge"] },
      { name: "Pulse Squat",                  sets: "3x15",      notes: "Small pulses at bottom — burns without impact", difficulty: "intermediate", caution: ["knees"],   substitutes: ["Wall Sit", "Bodyweight Squat"] },
      { name: "Side Lunge",                   sets: "3x8/side",  notes: "Lateral movement — inner thigh & glutes", difficulty: "intermediate", caution: ["knees", "hips"], substitutes: ["Lateral Leg Raise (standing)", "Glute Bridge"] },
      { name: "Step-up (low step)",           sets: "3x10/side", notes: "Controlled — no knee past toe",           difficulty: "beginner",     caution: ["knees"],          substitutes: ["Wall Sit", "Bodyweight Squat"] },
      { name: "Calf Raise",                   sets: "3x15",      notes: "Stand on step for full range",            difficulty: "beginner" },
      { name: "Single-Leg Calf Raise",        sets: "3x12/side", notes: "More balance and ankle stability",        difficulty: "intermediate" },
      { name: "Glute Kickback",               sets: "3x12/side", notes: "On all fours — glutes and hamstrings",    difficulty: "beginner" },
      { name: "Fire Hydrant",                 sets: "3x12/side", notes: "Hip abductor — great for knee stability", difficulty: "beginner",     caution: ["hips"],           substitutes: ["Glute Bridge", "Lateral Leg Raise (standing)"] },
      { name: "Donkey Kick",                  sets: "3x12/side", notes: "On all fours — glute isolation",          difficulty: "beginner" },
      { name: "Squat Hold",                   sets: "3x20s",     notes: "Static squat — mobility and endurance",   difficulty: "intermediate", caution: ["knees"],          substitutes: ["Wall Sit", "Glute Bridge"] },
      { name: "Lateral Leg Raise (standing)", sets: "3x12/side", notes: "Hip abductor — use wall for balance",    difficulty: "beginner" },
    ],
  },
  back: {
    label: "Back & Posture", color: "#0ea5e9", icon: GiBodyHeight,
    exercises: [
      { name: "Superman",                     sets: "3x10",      notes: "Lower back — hold 2 sec at top",                    difficulty: "beginner",     caution: ["lowerBack"],  substitutes: ["Bird Dog", "Cat-Cow Stretch"] },
      { name: "Reverse Snow Angel",           sets: "3x10",      notes: "Prone — rear delts and upper back",                  difficulty: "beginner" },
      { name: "YTW (floor)",                  sets: "3x8 each",  notes: "Y, T, W positions — posture builder",                difficulty: "beginner" },
      { name: "Prone Hip Extension",          sets: "3x10/side", notes: "Lying face down — lower back",                       difficulty: "beginner",     caution: ["lowerBack"],  substitutes: ["Glute Bridge", "Cat-Cow Stretch"] },
      { name: "Cat-Cow Stretch",              sets: "3x10",      notes: "Spinal mobility — not strength but vital",           difficulty: "beginner" },
      { name: "Thoracic Extension (on floor)",sets: "3x10",      notes: "Improves posture and upper back mobility",           difficulty: "beginner" },
      { name: "Wall Angels",                  sets: "3x10",      notes: "Back flat on wall — shoulder & posture",             difficulty: "beginner" },
    ],
  },
  cardioConditioning: {
    label: "Cardio & Conditioning", color: "#3b82f6", icon: GiRunningShoe,
    exercises: [
      { name: "March in Place",             sets: "3x60s",      notes: "Warm-up / cool-down staple",                       difficulty: "beginner" },
      { name: "Low-Impact Jumping Jacks",   sets: "3x30s",      notes: "Step side-to-side — no jumping",                   difficulty: "beginner" },
      { name: "Slow Mountain Climbers",     sets: "3x10/side",  notes: "Controlled pace — core + cardio",                  difficulty: "intermediate", caution: ["wrists"],               substitutes: ["High Knee March", "Standing Cross-Body Crunch"] },
      { name: "Modified Burpee (no jump)",  sets: "3x8",        notes: "Step back instead of jumping",                     difficulty: "intermediate", caution: ["wrists", "shoulders"],  substitutes: ["March in Place", "Squat-to-Stand"] },
      { name: "Bear Crawl",                 sets: "3x10 steps", notes: "Full body — slow and deliberate",                  difficulty: "intermediate", caution: ["wrists", "shoulders"],  substitutes: ["Lateral Shuffle (slow)", "March in Place"] },
      { name: "Lateral Shuffle (slow)",     sets: "3x30s",      notes: "Side-to-side — agility without impact",            difficulty: "beginner" },
      { name: "High Knee March",            sets: "3x30s",      notes: "Controlled — hip flexor activation",               difficulty: "beginner",     caution: ["hips"],                 substitutes: ["March in Place", "Butt Kicker March"] },
      { name: "Butt Kicker March",          sets: "3x30s",      notes: "Hamstring activation — no running",                difficulty: "beginner",     caution: ["knees"],                substitutes: ["March in Place", "Lateral Shuffle (slow)"] },
      { name: "Inchworm",                   sets: "3x8",        notes: "Walk hands out to plank and back — full body",     difficulty: "intermediate", caution: ["wrists", "lowerBack"],  substitutes: ["Squat-to-Stand", "March in Place"] },
      { name: "Squat-to-Stand",             sets: "3x10",       notes: "Hamstring mobility + squat warm-up",               difficulty: "beginner",     caution: ["knees"],                substitutes: ["March in Place", "Lateral Shuffle (slow)"] },
      { name: "Slow Burpee (4-count)",      sets: "3x6",        notes: "Down in 2, up in 2 — controlled",                  difficulty: "intermediate", caution: ["wrists", "shoulders", "knees"], substitutes: ["March in Place", "Lateral Shuffle (slow)"] },
      { name: "Standing Cross-Body Crunch", sets: "3x12/side",  notes: "Elbow to opposite knee — cardio + core",           difficulty: "beginner" },
    ],
  },
  mobilityWarmup: {
    label: "Mobility & Warm-Up", color: "#10b981", icon: GiMeditation,
    exercises: [
      { name: "Arm Circles (forward & back)",  sets: "2x10/dir",   notes: "Shoulder warm-up — essential before pushing",                                     difficulty: "beginner" },
      { name: "Shoulder Rolls",                sets: "2x10/dir",   notes: "Loosens shoulder joint",                                                           difficulty: "beginner" },
      { name: "Hip Circle (standing)",         sets: "2x10/dir",   notes: "Hip joint mobility",                                                               difficulty: "beginner" },
      { name: "Leg Swing (front/back)",        sets: "2x10/side",  notes: "Dynamic hamstring warm-up",                                                        difficulty: "beginner", caution: ["hips"], substitutes: ["Hip Circle (standing)", "Ankle Circle"] },
      { name: "Leg Swing (side/side)",         sets: "2x10/side",  notes: "Dynamic hip abductor warm-up",                                                     difficulty: "beginner", caution: ["hips"], substitutes: ["Hip Circle (standing)", "Ankle Circle"] },
      { name: "Ankle Circle",                  sets: "2x10/dir",   notes: "Ankle mobility — helps knees",                                                     difficulty: "beginner" },
      { name: "Wrist Circle",                  sets: "2x10/dir",   notes: "Warm-up before push-up variations",                                                difficulty: "beginner" },
      { name: "Cat-Cow",                       sets: "2x10",       notes: "Spinal mobility — must-do for lower back",                                         difficulty: "beginner" },
      { name: "Child's Pose",                  sets: "2x20s",      notes: "Lower back decompression",                                                         difficulty: "beginner" },
      { name: "Cobra Stretch",                 sets: "2x20s",      notes: "Spinal extension — helpful for most lower back issues; skip if spinal stenosis",   difficulty: "beginner", caution: ["lowerBack"], substitutes: ["Cat-Cow", "Child's Pose"] },
      { name: "Hip Flexor Stretch (kneeling)", sets: "2x20s/side", notes: "Tight from sitting — crucial",                                                     difficulty: "beginner", caution: ["knees", "hips"], substitutes: ["Hip Circle (standing)", "Leg Swing (front/back)"] },
      { name: "World's Greatest Stretch",      sets: "2x5/side",   notes: "Full body mobility — slow",                                                        difficulty: "intermediate", caution: ["hips", "knees"], substitutes: ["Hip Circle (standing)", "Ankle Circle"] },
      { name: "Doorway Chest Stretch",         sets: "2x20s",      notes: "Opens chest — shoulder friendly",                                                  difficulty: "beginner", caution: ["shoulders"], substitutes: ["Thread the Needle", "Wall Angels"] },
      { name: "Thread the Needle",             sets: "2x20s/side", notes: "Thoracic rotation — upper back",                                                   difficulty: "beginner" },
      { name: "Neck Rolls (slow)",             sets: "2x5/dir",    notes: "Cervical mobility — slow and gentle",                                              difficulty: "beginner", caution: ["neck"], substitutes: ["Shoulder Rolls", "Arm Circles (forward & back)"] },
    ],
  },
};

export const categories = Object.entries(ALL_EXERCISES).map(([key, val]) => ({ key, ...val }));

export const exerciseCategoryMap = {};
Object.entries(ALL_EXERCISES).forEach(([catKey, cat]) => {
  cat.exercises.forEach(ex => { exerciseCategoryMap[ex.name] = catKey; });
});

export const WARMUP_PRESETS = {
  upper: "Arm Circles · Shoulder Rolls · Wrist Circles",
  lower: "Leg Swings · Hip Circles · Ankle Circles",
  full:  "Arm Circles · Leg Swings · Cat-Cow",
  core:  "Cat-Cow · Hip Circles · Child's Pose",
};
