// Rebound exercise database.
// eq: 'g' gym only, 'h' home only, 'b' both.
// pat: movement pattern. minStage: rebuild stage required (squat/lunge/hinge/jump only).
// ks/bs/fs: knee/back/feet stress 0-3. type: 'w' weighted, 'bw' bodyweight reps, 'iso' seconds, 'time' minutes.
// scheme: sets x target range. subs: substitute exercise ids.
var R = window.R || {};
R.EXDB = [
  // ---- SQUAT (stages 0-3) ----
  {id:'sq1', n:'Wall Sit', eq:'b', pat:'squat', minStage:0, ks:1, bs:0, fs:0, type:'iso', sets:3, lo:30, hi:60, rest:60, note:'Back flat on wall, thighs toward parallel. Stay out of pain.', subs:['sq2','hg1']},
  {id:'sq2', n:'Spanish Squat (cable/band behind knees)', eq:'b', pat:'squat', minStage:0, ks:1, bs:0, fs:0, type:'iso', sets:3, lo:20, hi:45, rest:60, note:'Anchor strap behind knees, sit back. Great knee-tendon builder.', subs:['sq1','sq3']},
  {id:'sq3', n:'Box Squat to High Box (tempo)', eq:'b', pat:'squat', minStage:1, ks:1, bs:1, fs:0, type:'bw', sets:3, lo:8, hi:12, rest:90, note:'3-sec lowering to a high box, light touch, stand. Shorten range if pinchy.', subs:['sq4','sq2']},
  {id:'sq4', n:'Goblet Squat to Box', eq:'b', pat:'squat', minStage:1, ks:2, bs:1, fs:0, type:'w', sets:3, lo:8, hi:12, rest:90, note:'Hold DB at chest, controlled sit to box.', subs:['sq3','sq5']},
  {id:'sq5', n:'Goblet Squat', eq:'b', pat:'squat', minStage:2, ks:2, bs:1, fs:0, type:'w', sets:3, lo:8, hi:12, rest:90, note:'Full comfortable range, heels down, knees track over toes.', subs:['sq4','sq6']},
  {id:'sq6', n:'Leg Press (moderate depth)', eq:'g', pat:'squat', minStage:2, ks:2, bs:1, fs:0, type:'w', sets:3, lo:10, hi:15, rest:120, note:'Depth only as deep as pain-free. No locking knees hard.', subs:['sq5','sq8']},
  {id:'sq7', n:'Barbell Back Squat', eq:'b', pat:'squat', minStage:3, ks:3, bs:2, fs:1, type:'w', sets:4, lo:5, hi:8, rest:150, note:'Earned it. Brace hard, own every rep.', subs:['sq8','sq6']},
  {id:'sq8', n:'Hack Squat', eq:'g', pat:'squat', minStage:3, ks:3, bs:1, fs:0, type:'w', sets:3, lo:8, hi:12, rest:120, note:'Back supported. Control the bottom.', subs:['sq6','sq7']},
  // ---- LUNGE (stages 0-3) ----
  {id:'lg1', n:'Split Squat Iso Hold', eq:'b', pat:'lunge', minStage:0, ks:1, bs:0, fs:1, type:'iso', sets:3, lo:20, hi:40, rest:60, note:'Hold the bottom half of a split squat, each leg. Pain-free depth only.', subs:['lg2','sq1']},
  {id:'lg2', n:'Supported Split Squat (hold rack)', eq:'b', pat:'lunge', minStage:1, ks:1, bs:0, fs:1, type:'bw', sets:3, lo:8, hi:12, rest:75, note:'Hold the rack or a rail, unload as needed. Each leg.', subs:['lg1','lg3']},
  {id:'lg3', n:'Step-Up (low box)', eq:'b', pat:'lunge', minStage:1, ks:1, bs:0, fs:1, type:'bw', sets:3, lo:8, hi:12, rest:75, note:'Low step, push through whole foot, control down. Each leg.', subs:['lg2','lg4']},
  {id:'lg4', n:'Reverse Lunge', eq:'b', pat:'lunge', minStage:2, ks:2, bs:1, fs:1, type:'bw', sets:3, lo:8, hi:12, rest:90, note:'Step back, gentle knee. Kinder than forward lunges. Each leg.', subs:['lg3','lg5']},
  {id:'lg5', n:'DB Split Squat', eq:'b', pat:'lunge', minStage:3, ks:2, bs:1, fs:1, type:'w', sets:3, lo:8, hi:12, rest:90, note:'DBs at sides, each leg.', subs:['lg4','lg6']},
  {id:'lg6', n:'Bulgarian Split Squat', eq:'b', pat:'lunge', minStage:3, ks:3, bs:1, fs:1, type:'w', sets:3, lo:8, hi:10, rest:90, note:'Rear foot elevated. The dunk-builder. Each leg.', subs:['lg5','lg7']},
  {id:'lg7', n:'Step-Up (knee height)', eq:'b', pat:'lunge', minStage:3, ks:2, bs:0, fs:1, type:'w', sets:3, lo:6, hi:10, rest:90, note:'Drive up, no push off back leg. Each leg.', subs:['lg6','lg5']},
  // ---- HINGE (stages 0-3) ----
  {id:'hg1', n:'Glute Bridge', eq:'b', pat:'hinge', minStage:0, ks:0, bs:0, fs:0, type:'bw', sets:3, lo:12, hi:20, rest:60, note:'Squeeze glutes at top, ribs down, no back arch.', subs:['hg2','sq1']},
  {id:'hg2', n:'Glute Bridge Iso Hold', eq:'b', pat:'hinge', minStage:0, ks:0, bs:0, fs:0, type:'iso', sets:3, lo:20, hi:45, rest:60, note:'Hold the top, glutes on, back quiet.', subs:['hg1','hg3']},
  {id:'hg3', n:'Cable Pull-Through', eq:'b', pat:'hinge', minStage:1, ks:0, bs:1, fs:0, type:'w', sets:3, lo:10, hi:15, rest:75, note:'Hips back, soft knees, glutes finish. Teaches the hinge safely.', subs:['hg4','hg1']},
  {id:'hg4', n:'DB Romanian Deadlift', eq:'b', pat:'hinge', minStage:2, ks:0, bs:2, fs:0, type:'w', sets:3, lo:8, hi:12, rest:90, note:'Hips back, flat back, feel hamstrings, stop before back rounds.', subs:['hg3','hg5']},
  {id:'hg5', n:'Barbell RDL', eq:'b', pat:'hinge', minStage:3, ks:0, bs:2, fs:0, type:'w', sets:3, lo:6, hi:10, rest:120, note:'Brace. If the back complains, drop weight, not form.', subs:['hg4','hg6']},
  {id:'hg6', n:'Hip Thrust (loaded)', eq:'b', pat:'hinge', minStage:2, ks:1, bs:0, fs:0, type:'w', sets:3, lo:8, hi:12, rest:90, note:'Shoulders on bench, DB or bar on hips. Glute power = jump power.', subs:['hg4','hg3']},
  {id:'hg7', n:'Back Extension (45°)', eq:'g', pat:'hinge', minStage:1, ks:0, bs:1, fs:0, type:'bw', sets:3, lo:10, hi:15, rest:75, note:'Smooth, no jerking. Squeeze glutes, not lower back.', subs:['hg3','hg4']},
  {id:'hg8', n:'Trap Bar Deadlift', eq:'g', pat:'hinge', minStage:3, ks:1, bs:3, fs:1, type:'w', sets:3, lo:5, hi:8, rest:180, note:'Only when the back is fully trusting. Brace like it matters.', subs:['hg5','hg6']},
  // ---- HAMSTRING ISOLATION ----
  {id:'hm1', n:'Seated Leg Curl', eq:'g', pat:'ham', ks:1, bs:0, fs:0, type:'w', sets:3, lo:10, hi:15, rest:75, note:'Control the return — hamstrings protect knees.', subs:['hm2','hm3']},
  {id:'hm2', n:'Lying Leg Curl', eq:'g', pat:'ham', ks:1, bs:0, fs:0, type:'w', sets:3, lo:10, hi:15, rest:75, note:'Hips down, slow lowering.', subs:['hm1','hm3']},
  {id:'hm3', n:'Slider/Towel Leg Curl', eq:'h', pat:'ham', ks:1, bs:0, fs:0, type:'bw', sets:3, lo:6, hi:12, rest:75, note:'Bridge up, slide heels out slow, pull back in. Brutal and free.', subs:['hm1','hg4']},
  {id:'hm4', n:'Single-Leg RDL (light)', eq:'b', pat:'ham', ks:0, bs:1, fs:1, type:'w', sets:3, lo:8, hi:12, rest:75, note:'Balance + hamstring. Hold something if wobbly. Each leg.', subs:['hg4','hm3']},
  // ---- JUMP / DUNK TRACK (unlocks when squat+lunge cleared) ----
  {id:'jp1', n:'Snap Downs (landing mechanics)', eq:'b', pat:'jump', minStage:0, ks:2, bs:1, fs:2, type:'bw', sets:3, lo:5, hi:8, rest:90, note:'Reach tall, snap into a soft quarter-squat landing. Stick it silent.', subs:['jp2']},
  {id:'jp2', n:'Pogo Hops (low)', eq:'b', pat:'jump', minStage:1, ks:2, bs:1, fs:3, type:'bw', sets:3, lo:10, hi:15, rest:90, note:'Small stiff bounces off the ankles. Quiet feet.', subs:['jp1','jp3']},
  {id:'jp3', n:'Box Jump (low box)', eq:'b', pat:'jump', minStage:1, ks:2, bs:1, fs:2, type:'bw', sets:4, lo:3, hi:5, rest:120, note:'Jump up, land soft, STEP down. Never jump down.', subs:['jp2','jp4']},
  {id:'jp4', n:'Box Jump (mid box)', eq:'b', pat:'jump', minStage:2, ks:2, bs:1, fs:2, type:'bw', sets:4, lo:3, hi:5, rest:150, note:'Full intent every rep. Quality over quantity.', subs:['jp3','jp5']},
  {id:'jp5', n:'Approach Jumps (1-2 step)', eq:'b', pat:'jump', minStage:3, ks:3, bs:1, fs:3, type:'bw', sets:4, lo:3, hi:4, rest:180, note:'Dunk practice. 1-2 step gather, jump for max height. Fresh legs only.', subs:['jp4','jp3']},
  {id:'jp6', n:'Med Ball Scoop Toss', eq:'g', pat:'jump', minStage:0, ks:1, bs:1, fs:1, type:'bw', sets:3, lo:5, hi:8, rest:90, note:'Hinge, explode up, toss ball overhead-back. Power without impact.', subs:['jp1','jp3']},
  // ---- HORIZONTAL PUSH ----
  {id:'ph1', n:'Machine Chest Press', eq:'g', pat:'push_h', ks:0, bs:0, fs:0, type:'w', sets:3, lo:8, hi:12, rest:90, note:'Smooth ramp back into pressing post-surgery.', subs:['ph2','ph6']},
  {id:'ph2', n:'DB Bench Press', eq:'b', pat:'push_h', ks:0, bs:0, fs:0, type:'w', sets:3, lo:8, hi:12, rest:90, note:'Full control, no bouncing.', subs:['ph1','ph3']},
  {id:'ph3', n:'Barbell Bench Press', eq:'b', pat:'push_h', ks:0, bs:0, fs:0, type:'w', sets:4, lo:5, hi:8, rest:150, note:'Feet planted, shoulder blades tucked.', subs:['ph2','ph1']},
  {id:'ph4', n:'Incline DB Press', eq:'b', pat:'push_h', ks:0, bs:0, fs:0, type:'w', sets:3, lo:8, hi:12, rest:90, note:'30-45° incline.', subs:['ph2','ph5']},
  {id:'ph5', n:'Cable Fly', eq:'b', pat:'push_h', ks:0, bs:0, fs:0, type:'w', sets:3, lo:12, hi:15, rest:60, note:'Big stretch, soft elbows, squeeze.', subs:['ph4','ph6']},
  {id:'ph6', n:'Push-Up', eq:'b', pat:'push_h', ks:0, bs:0, fs:0, type:'bw', sets:3, lo:10, hi:20, rest:60, note:'Body in one line. Elevate hands to make easier.', subs:['ph1','ph2']},
  // ---- VERTICAL PUSH / SHOULDERS ----
  {id:'pv1', n:'Seated DB Shoulder Press', eq:'b', pat:'push_v', ks:0, bs:1, fs:0, type:'w', sets:3, lo:8, hi:12, rest:90, note:'Back supported, no arching.', subs:['pv2','pv4']},
  {id:'pv2', n:'Machine Shoulder Press', eq:'g', pat:'push_v', ks:0, bs:0, fs:0, type:'w', sets:3, lo:8, hi:12, rest:90, note:'', subs:['pv1','pv4']},
  {id:'pv3', n:'Cable Lateral Raise', eq:'b', pat:'push_v', ks:0, bs:0, fs:0, type:'w', sets:3, lo:12, hi:15, rest:60, note:'Constant tension, lead with elbow. Each arm.', subs:['pv4','pv1']},
  {id:'pv4', n:'DB Lateral Raise', eq:'b', pat:'push_v', ks:0, bs:0, fs:0, type:'w', sets:3, lo:12, hi:15, rest:60, note:'Light weight, no swinging.', subs:['pv3','pv1']},
  {id:'pv5', n:'Landmine Press', eq:'g', pat:'push_v', ks:0, bs:1, fs:0, type:'w', sets:3, lo:8, hi:12, rest:90, note:'Shoulder-friendly angle. Each arm.', subs:['pv1','pv2']},
  // ---- VERTICAL PULL ----
  {id:'puv1', n:'Lat Pulldown', eq:'g', pat:'pull_v', ks:0, bs:0, fs:0, type:'w', sets:3, lo:8, hi:12, rest:90, note:'Pull elbows to ribs, no leaning back hard.', subs:['puv2','puv3']},
  {id:'puv2', n:'Single-Arm Cable Pulldown', eq:'b', pat:'pull_v', ks:0, bs:0, fs:0, type:'w', sets:3, lo:10, hi:12, rest:75, note:'Kneel or sit by the cable. Big stretch up top. Each arm.', subs:['puv1','puv3']},
  {id:'puv3', n:'Assisted Pull-Up', eq:'g', pat:'pull_v', ks:0, bs:0, fs:0, type:'w', sets:3, lo:6, hi:10, rest:120, note:'Machine or band. Chin over bar, control down.', subs:['puv1','puv2']},
  // ---- HORIZONTAL PULL ----
  {id:'puh1', n:'Seated Cable Row', eq:'b', pat:'pull_h', ks:0, bs:1, fs:0, type:'w', sets:3, lo:8, hi:12, rest:90, note:'Chest tall, squeeze shoulder blades.', subs:['puh2','puh3']},
  {id:'puh2', n:'Chest-Supported DB Row', eq:'b', pat:'pull_h', ks:0, bs:0, fs:0, type:'w', sets:3, lo:8, hi:12, rest:90, note:'Chest on incline bench — zero back stress.', subs:['puh1','puh4']},
  {id:'puh3', n:'Machine Row', eq:'g', pat:'pull_h', ks:0, bs:0, fs:0, type:'w', sets:3, lo:8, hi:12, rest:90, note:'', subs:['puh1','puh2']},
  {id:'puh4', n:'One-Arm DB Row', eq:'b', pat:'pull_h', ks:0, bs:1, fs:0, type:'w', sets:3, lo:8, hi:12, rest:75, note:'Hand on bench, flat back. Each arm.', subs:['puh2','puh1']},
  {id:'puh5', n:'Doorway Towel Row', eq:'b', pat:'pull_h', ks:0, bs:0, fs:0, type:'bw', sets:3, lo:10, hi:15, rest:60, note:'Towel around a door handle or sturdy rail, lean back, row your chest to your hands. Walk feet forward to make it harder.', subs:['puh1','puh2']},
  // ---- PULL ACCESSORIES ----
  {id:'pa1', n:'Face Pull', eq:'b', pat:'pull_acc', ks:0, bs:0, fs:0, type:'w', sets:3, lo:12, hi:15, rest:60, note:'Rope to face, elbows high. Shoulder health for ball.', subs:['pa2','pa3']},
  {id:'pa2', n:'Rear Delt Fly', eq:'b', pat:'pull_acc', ks:0, bs:0, fs:0, type:'w', sets:3, lo:12, hi:15, rest:60, note:'Light, strict, squeeze.', subs:['pa1','pa3']},
  {id:'pa3', n:'Band/Cable Pull-Apart', eq:'b', pat:'pull_acc', ks:0, bs:0, fs:0, type:'bw', sets:3, lo:15, hi:20, rest:45, note:'', subs:['pa1','pa2']},
  // ---- ARMS ----
  {id:'tr1', n:'Cable Triceps Pushdown', eq:'b', pat:'tri', ks:0, bs:0, fs:0, type:'w', sets:3, lo:10, hi:15, rest:60, note:'Elbows pinned to sides.', subs:['tr2','tr3']},
  {id:'tr2', n:'Overhead Cable Triceps Extension', eq:'b', pat:'tri', ks:0, bs:0, fs:0, type:'w', sets:3, lo:10, hi:15, rest:60, note:'', subs:['tr1','tr3']},
  {id:'tr3', n:'DB Skull Crusher', eq:'b', pat:'tri', ks:0, bs:0, fs:0, type:'w', sets:3, lo:10, hi:12, rest:60, note:'Lower to ears, slow.', subs:['tr1','tr2']},
  {id:'bi1', n:'DB Curl', eq:'b', pat:'bi', ks:0, bs:0, fs:0, type:'w', sets:3, lo:10, hi:12, rest:60, note:'No swinging.', subs:['bi2','bi3']},
  {id:'bi2', n:'Hammer Curl', eq:'b', pat:'bi', ks:0, bs:0, fs:0, type:'w', sets:3, lo:10, hi:12, rest:60, note:'', subs:['bi1','bi3']},
  {id:'bi3', n:'Cable Curl', eq:'b', pat:'bi', ks:0, bs:0, fs:0, type:'w', sets:3, lo:10, hi:15, rest:60, note:'Constant tension.', subs:['bi1','bi2']},
  // ---- CORE (back-safe) ----
  {id:'co1', n:'Dead Bug', eq:'b', pat:'core', ks:0, bs:0, fs:0, type:'bw', sets:3, lo:8, hi:12, rest:45, note:'Low back pressed to floor the whole time. Each side.', subs:['co2','co9']},
  {id:'co2', n:'Bird Dog', eq:'b', pat:'core', ks:0, bs:0, fs:0, type:'bw', sets:3, lo:8, hi:10, rest:45, note:'Slow, no hip rotation. Each side.', subs:['co1','co3']},
  {id:'co3', n:'Side Plank', eq:'b', pat:'core', ks:0, bs:0, fs:0, type:'iso', sets:3, lo:20, hi:45, rest:45, note:'Straight line, hips high. Each side. Gold for the lower back.', subs:['co4','co2']},
  {id:'co4', n:'Front Plank', eq:'b', pat:'core', ks:0, bs:0, fs:0, type:'iso', sets:3, lo:30, hi:60, rest:45, note:'Glutes squeezed, ribs down.', subs:['co3','co1']},
  {id:'co5', n:'Pallof Press', eq:'b', pat:'core', ks:0, bs:0, fs:0, type:'w', sets:3, lo:10, hi:12, rest:45, note:'Cable at chest, press out, resist the twist. Each side.', subs:['co3','co6']},
  {id:'co6', n:'Suitcase Carry', eq:'b', pat:'core', ks:0, bs:1, fs:1, type:'iso', sets:3, lo:30, hi:45, rest:60, note:'Heavy DB one side, walk tall, don’t lean. Each side.', subs:['co5','co3']},
  {id:'co9', n:'McGill Curl-Up', eq:'b', pat:'core', ks:0, bs:0, fs:0, type:'bw', sets:3, lo:6, hi:10, rest:45, note:'Hands under low back, tiny curl, hold 8s. Back-pain-proof abs.', subs:['co1','co2']},
  // ---- CALF / FOOT / TIBIALIS ----
  {id:'cf1', n:'Standing Calf Raise', eq:'b', pat:'calf_foot', ks:0, bs:0, fs:2, type:'w', sets:3, lo:10, hi:15, rest:60, note:'Full stretch at bottom, pause at top. Slow = tendon-friendly.', subs:['cf5','cf2']},
  {id:'cf2', n:'Seated Calf Raise', eq:'g', pat:'calf_foot', ks:0, bs:0, fs:1, type:'w', sets:3, lo:12, hi:15, rest:60, note:'', subs:['cf1','cf5']},
  {id:'cf3', n:'Tibialis Raise', eq:'b', pat:'calf_foot', ks:0, bs:0, fs:1, type:'bw', sets:3, lo:15, hi:25, rest:45, note:'Heels on ground, lift toes. Bulletproofs shins/feet for ball.', subs:['cf4','cf1']},
  {id:'cf4', n:'Short Foot / Toe Yoga', eq:'b', pat:'calf_foot', ks:0, bs:0, fs:0, type:'iso', sets:3, lo:15, hi:30, rest:30, note:'Grip floor with arch without curling toes. Rebuilds the feet.', subs:['cf3','cf1']},
  {id:'cf5', n:'Single-Leg Calf Raise (bent knee)', eq:'b', pat:'calf_foot', ks:1, bs:0, fs:2, type:'bw', sets:3, lo:8, hi:15, rest:60, note:'Knee slightly bent — hits soleus, protects the achilles. Each leg.', subs:['cf1','cf3']},
  // ---- CONDITIONING (no running, no burpees) ----
  {id:'cd1', n:'Zone-2 Bike', eq:'b', pat:'condition', ks:1, bs:0, fs:0, type:'time', sets:1, lo:20, hi:35, rest:0, note:'Conversational pace. You should be able to talk. Fat-loss engine.', subs:['cd2','cd5']},
  {id:'cd2', n:'Bike Intervals', eq:'b', pat:'condition', ks:1, bs:0, fs:0, type:'time', sets:1, lo:15, hi:20, rest:0, note:'30s hard / 90s easy, repeat. Game-shape without the pounding.', subs:['cd1','cd5']},
  {id:'cd3', n:'Incline Treadmill Walk', eq:'g', pat:'condition', ks:1, bs:0, fs:1, type:'time', sets:1, lo:15, hi:25, rest:0, note:'Steep incline, hold nothing, walk. Zero impact.', subs:['cd1','cd5']},
  {id:'cd5', n:'Easy Spin (recovery)', eq:'b', pat:'condition', ks:0, bs:0, fs:0, type:'time', sets:1, lo:10, hi:20, rest:0, note:'Very light. Blood flow, not effort.', subs:['cd1','cd3']},
  // ---- MOBILITY / RECOVERY ----
  {id:'mo1', n:'90/90 Hip Switch', eq:'b', pat:'mobility', ks:1, bs:0, fs:0, type:'bw', sets:2, lo:8, hi:10, rest:30, note:'Slow transitions, tall chest.', subs:['mo8','mo2']},
  {id:'mo2', n:'Couch Stretch', eq:'b', pat:'mobility', ks:1, bs:0, fs:0, type:'iso', sets:2, lo:45, hi:60, rest:30, note:'Rear foot on couch/wall. Quads + hip flexors — knees thank you. Each side.', subs:['mo8','mo1']},
  {id:'mo3', n:'Hamstring Floss', eq:'b', pat:'mobility', ks:0, bs:0, fs:0, type:'bw', sets:2, lo:10, hi:12, rest:30, note:'Lying down, leg up, extend and bend. Each leg.', subs:['mo1','mo5']},
  {id:'mo4', n:'Ankle Dorsiflexion Rocks', eq:'b', pat:'mobility', ks:0, bs:0, fs:1, type:'bw', sets:2, lo:10, hi:15, rest:30, note:'Knee over toes, heel down. Ankle range = knee relief. Each side.', subs:['mo7','mo1']},
  {id:'mo5', n:'Cat-Camel', eq:'b', pat:'mobility', ks:0, bs:0, fs:0, type:'bw', sets:2, lo:8, hi:10, rest:30, note:'Gentle, pain-free spine waves. No forcing.', subs:['mo6','mo9']},
  {id:'mo6', n:'Thoracic Rotation (open book)', eq:'b', pat:'mobility', ks:0, bs:0, fs:0, type:'bw', sets:2, lo:8, hi:10, rest:30, note:'Upper back rotates, lower back stays. Each side.', subs:['mo5','mo9']},
  {id:'mo7', n:'Calf Stretch on Step', eq:'b', pat:'mobility', ks:0, bs:0, fs:1, type:'iso', sets:2, lo:30, hi:45, rest:30, note:'Straight then bent knee. Each side.', subs:['mo4','mo3']},
  {id:'mo8', n:'Hip Flexor Stretch (half-kneel)', eq:'b', pat:'mobility', ks:1, bs:0, fs:0, type:'iso', sets:2, lo:30, hi:45, rest:30, note:'Glute squeezed, tall. Desk-job antidote. Each side.', subs:['mo2','mo1']},
  {id:'mo9', n:'Child’s Pose Breathing', eq:'b', pat:'mobility', ks:1, bs:0, fs:0, type:'iso', sets:2, lo:45, hi:60, rest:30, note:'Long exhales. Decompress.', subs:['mo5','mo6']},
  {id:'mo10', n:'Vibration Plate Recovery Stand', eq:'h', pat:'mobility', ks:0, bs:0, fs:0, type:'time', sets:1, lo:5, hi:10, rest:0, note:'Soft knees on the plate. Circulation for legs and feet.', subs:['mo9','mo7']},
  {id:'mo11', n:'Foam Roll Quads/Calves', eq:'g', pat:'mobility', ks:0, bs:0, fs:0, type:'time', sets:1, lo:5, hi:8, rest:0, note:'Slow passes, breathe.', subs:['mo2','mo7']},
  // ---- POSTPARTUM CORE LADDER (Julia) — pelvic-floor-safe progression, minStage = core ladder stage ----
  {id:'pp1', n:'360 Breathing + Pelvic Floor Lift', eq:'b', pat:'ppcore', minStage:0, ks:0, bs:0, fs:0, type:'bw', sets:3, lo:6, hi:8, rest:30, note:'Inhale ribs wide; on the slow exhale gently lift pelvic floor + draw belly in. This IS the workout — quality breaths.', subs:['pp2','pp3']},
  {id:'pp2', n:'Heel Slides (with exhale)', eq:'b', pat:'ppcore', minStage:0, ks:0, bs:0, fs:0, type:'bw', sets:3, lo:8, hi:10, rest:30, note:'Lying down, exhale + engage, slide one heel out and back. Low back stays quiet. Each leg.', subs:['pp1','pp3']},
  {id:'pp3', n:'Supine Marching', eq:'b', pat:'ppcore', minStage:0, ks:0, bs:0, fs:0, type:'bw', sets:3, lo:8, hi:12, rest:30, note:'Knees up one at a time, exhale each lift, no belly doming. Each side.', subs:['pp2','pp4']},
  {id:'pp4', n:'Side Plank from Knees', eq:'b', pat:'ppcore', minStage:1, ks:0, bs:0, fs:0, type:'iso', sets:3, lo:15, hi:30, rest:45, note:'Knees bent, hips forward and lifted. Breathe — don\'t brace-and-hold-breath. Each side.', subs:['pp3','pp5']},
  {id:'pp5', n:'Bear Hold', eq:'b', pat:'ppcore', minStage:2, ks:1, bs:0, fs:0, type:'iso', sets:3, lo:15, hi:30, rest:45, note:'Hands and toes, knees hovering an inch up. Exhale steadily, back flat.', subs:['pp4','pp6']},
  {id:'pp6', n:'Glute Bridge March', eq:'b', pat:'ppcore', minStage:2, ks:0, bs:0, fs:0, type:'bw', sets:3, lo:8, hi:12, rest:45, note:'Hold the bridge, march slowly. Hips stay level — that\'s the work.', subs:['pp5','pp4']},
  {id:'pp7', n:'Tall-Kneeling Pallof Press', eq:'b', pat:'ppcore', minStage:2, ks:0, bs:0, fs:0, type:'w', sets:3, lo:8, hi:12, rest:45, note:'Cable at chest, press out, resist the twist, exhale on the press. Each side.', subs:['pp5','pp6']},
  // ---- LOW-IMPACT BODYWEIGHT CONDITIONING (no equipment) ----
  {id:'cdbw', n:'March + Step-Out Intervals', eq:'b', pat:'condition', ks:0, bs:0, fs:1, type:'time', sets:1, lo:8, hi:12, rest:0, note:'1 min brisk march, 30s side step-outs with arm reach, repeat. Zero impact, heart rate up.', subs:['cd5','cd1']}
];
R.EX = {}; R.EXDB.forEach(function(e){ R.EX[e.id] = e; });
// No-equipment flags: doable in a living room with zero gear (Julia's bodyweight mode)
['sq1','sq3','lg1','lg2','lg3','lg4','hg1','hg2','hm3','ph6','puh5','co1','co2','co3','co4','co9',
 'cf3','cf4','cf5','mo1','mo2','mo3','mo4','mo5','mo6','mo7','mo8','mo9',
 'pp1','pp2','pp3','pp4','pp5','pp6','cdbw'].forEach(function(id){ R.EX[id].bw = 1; });
// Regular core moves admitted to the postpartum ladder at higher stages (pps = min core stage)
R.EX.co1.pps = 1; R.EX.co2.pps = 1; R.EX.co9.pps = 1;
R.EX.co3.pps = 2; R.EX.co4.pps = 2; R.EX.co5.pps = 2; R.EX.co6.pps = 3;
window.R = R;
