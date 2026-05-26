// steps: numbered cues covering setup → movement → finish
// cues:  2-3 short form reminders shown as a callout block

export const EXERCISE_DEMOS = {
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
