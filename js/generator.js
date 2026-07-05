// Rebound daily workout generator.
// Builds a fresh workout for a date from day templates + rebuild stages + check-in + recent history.
var R = window.R || {};

R.GATED = ['squat','lunge','hinge','jump'];
R.STAGE_NAMES = ['Foundation (iso / pain-free range)','Rebuilding (tempo & partials)','Loading (full range, light)','Cleared (progressive load)'];

// Day templates keyed by weekday (Sun=0). ball: basketball tonight -> keep legs fresh.
R.dayTemplate = function(wd){
  var T = {
    1: {focus:'Lower Rebuild A', slots:[
        {pat:'squat', main:true},{pat:'hinge'},{pat:'lunge'},{pat:'calf_foot'},{pat:'core'},{pat:'core', opt:true}]},
    2: {focus:'Upper Push', ball:true, slots:[
        {pat:'push_h', main:true},{pat:'push_v'},{pat:'push_h'},{pat:'tri'},{pat:'core', opt:true}]},
    3: {focus:'Lower Rebuild B — Posterior', slots:[
        {pat:'hinge', main:true},{pat:'ham'},{pat:'squat'},{pat:'lunge'},{pat:'core'}]},
    4: {focus:'Upper Pull', ball:true, slots:[
        {pat:'pull_v', main:true},{pat:'pull_h'},{pat:'pull_acc'},{pat:'bi'},{pat:'core', opt:true}]},
    5: {focus:'Full-Body Prep (short)', ball:true, light:true, slots:[
        {pat:'push_h'},{pat:'pull_h'},{pat:'core'},{pat:'mobility'}]},
    6: {focus:'Conditioning + Mobility', slots:[
        {pat:'condition', main:true},{pat:'core'},{pat:'mobility'},{pat:'mobility'}]},
    0: {focus:'Recovery', light:true, slots:[
        {pat:'mobility'},{pat:'mobility'},{pat:'calf_foot'},{pat:'core'},{pat:'condition', opt:true}]}
  };
  // deep-ish copy so we can mutate slots
  var t = T[wd];
  return {focus:t.focus, ball:!!t.ball, light:!!t.light, slots:t.slots.map(function(s){ return {pat:s.pat, main:!!s.main, opt:!!s.opt}; })};
};

R.jumpUnlocked = function(){
  return R.S.rebuild.squat.stage >= 3 && R.S.rebuild.lunge.stage >= 3;
};

// ids used in the last `days` days before dateStr
R.recentIds = function(dateStr, days){
  var ids = {};
  for (var i = 1; i <= days; i++) {
    var w = R.S.workouts[R.addDays(dateStr, -i)];
    if (w) (w.exercises || []).forEach(function(e){ ids[e.id] = true; });
  }
  return ids;
};

R.lastCompletedGap = function(dateStr){
  for (var i = 1; i <= 30; i++) {
    var w = R.S.workouts[R.addDays(dateStr, -i)];
    if (w && w.completed) return i;
  }
  return null;
};

// ---- Julia: eligibility, rotation, generation ----
// Difficulty caps reuse the exercise minStage tiers as intensity tiers.
R.J_DIFF_CAP = { gentle:1, standard:2, challenge:3 };

R.juliaEligible = function(pat, dateStr, recent, usedIds){
  var prefs = R.S.prefs;
  var cap = R.J_DIFF_CAP[prefs.difficulty];
  var ppStage = R.S.rebuild.ppcore.stage;
  var kneeCap = prefs.difficulty === 'gentle' ? 2 : 3; // left knee: gentle mode avoids ks>=2
  return R.EXDB.filter(function(e){
    if (pat === 'ppcore') {
      if (e.pat !== 'ppcore' && e.pps === undefined) return false;
      var need = e.pat === 'ppcore' ? (e.minStage || 0) : e.pps;
      if (need > ppStage) return false;
    } else {
      if (e.pat !== pat) return false;
      if ((e.minStage || 0) > cap) return false;
    }
    if (e.pat === 'jump') return false; // no impact work in Julia's program
    if (prefs.equip === 'bw' ? !e.bw : e.eq === 'g') return false; // bw mode or home-gym mode
    if (usedIds[e.id]) return false;
    if (R.S.avoid[e.id] && R.S.avoid[e.id] >= dateStr) return false;
    if (e.ks >= kneeCap) return false;
    return true;
  }).sort(function(a, b){
    var stg = function(e){ return pat === 'ppcore' ? (e.pat === 'ppcore' ? (e.minStage||0) : e.pps) : (e.minStage||0); };
    var top = pat === 'ppcore' ? ppStage : cap;
    var sa = (top - stg(a)) * 10 + (recent[a.id] ? 5 : 0);
    var sb = (top - stg(b)) * 10 + (recent[b.id] ? 5 : 0);
    return sa - sb || Math.random() - 0.5;
  });
};

R.juliaCompletedCount = function(){
  var n = 0;
  Object.keys(R.S.workouts).forEach(function(d){ if (R.S.workouts[d].completed) n++; });
  return n;
};

R.juliaTemplate = function(rot){
  var T = [
    {focus:'Full Body A — Lower Focus', slots:['squat','lunge','ppcore'], extra:['hinge','ham','calf_foot']},
    {focus:'Full Body B — Upper Focus', slots:['push_h','pull_h','ppcore'], extra:['push_v','bi','tri']},
    {focus:'Full Body C — Move & Core', slots:['condition','ppcore','mobility'], extra:['ppcore','mobility','calf_foot']}
  ];
  return T[rot % 3];
};
R.juliaNextFocus = function(){
  var w = R.S.workouts[R.today()];
  if (w) return w.focus;
  return R.juliaTemplate(R.juliaCompletedCount()).focus;
};

R.generateJuliaWorkout = function(dateStr){
  var prefs = R.S.prefs;
  var t = R.juliaTemplate(R.juliaCompletedCount());
  // session length: short = base slots, medium/long add from the extras list
  var slots = t.slots.slice();
  var extraN = prefs.length === 'medium' ? 1 : (prefs.length === 'long' ? 3 : 0);
  if (prefs.difficulty === 'challenge') extraN += 1;
  slots = slots.concat(t.extra.slice(0, extraN));

  var recent = R.recentIds(dateStr, 3);
  var usedIds = {};
  var exercises = [];
  var setsN = prefs.difficulty === 'gentle' ? 2 : 3;
  slots.forEach(function(pat){
    var pool = R.juliaEligible(pat, dateStr, recent, usedIds);
    if (!pool.length) return;
    var pick = pool[0];
    usedIds[pick.id] = true;
    var ex = R.buildExercise(pick, {});
    while (ex.sets.length > setsN) ex.sets.pop();
    while (ex.sets.length < setsN) ex.sets.push({reps:'', weight: ex.suggestW || '', done:false});
    exercises.push(ex);
  });

  var notes = [];
  if (prefs.difficulty === 'gentle') notes.push('Rebuilding phase — smooth reps, full exhales, nothing to prove. Bump difficulty in Settings whenever you\'re ready.');
  var wu = prefs.equip === 'bw'
    ? ['March in place — 2 min', '360 breathing — 5 slow breaths', 'Hip circles — 8 each way', 'Bodyweight glute bridge — 10']
    : ['Easy bike spin — 3 min', '360 breathing — 5 slow breaths', 'Leg swings — 10 each direction', 'Bodyweight glute bridge — 10'];
  var cd = ['Hip flexor stretch — 30s each side', 'Calf stretch — 30s each side', '360 breathing — 5 slow breaths to finish'];

  return {
    date: dateStr, focus: t.focus, loc: prefs.equip === 'bw' ? 'bw' : 'home', ball: false,
    checkin: {energy:3, sore:{}}, notes: notes,
    warmup: wu, cooldown: cd,
    exercises: exercises,
    completed: false, rating: null, pain: []
  };
};

R.eligible = function(pat, loc, dateStr, recent, sore, usedIds){
  var stage = R.GATED.indexOf(pat) >= 0 ? R.S.rebuild[pat].stage : null;
  return R.EXDB.filter(function(e){
    if (e.pat !== pat) return false;
    if (loc === 'home' ? e.eq === 'g' : e.eq === 'h') return false;
    if (usedIds[e.id]) return false;
    if (stage !== null && (e.minStage || 0) > stage) return false;
    if (R.S.avoid[e.id] && R.S.avoid[e.id] >= dateStr) return false;
    if (sore.knees && e.ks >= 2) return false;
    if (sore.back && e.bs >= 2) return false;
    if (sore.feet && e.fs >= 2) return false;
    return true;
  }).sort(function(a, b){
    // prefer exercises at the current stage, then ones not done recently
    var sa = (stage !== null ? (stage - (a.minStage || 0)) * 10 : 0) + (recent[a.id] ? 5 : 0);
    var sb = (stage !== null ? (stage - (b.minStage || 0)) * 10 : 0) + (recent[b.id] ? 5 : 0);
    return sa - sb || Math.random() - 0.5;
  });
};

R.buildExercise = function(e, opts){
  var prog = R.S.progress[e.id] || {};
  var sets = e.sets;
  if (opts.light || opts.lowEnergy) sets = Math.max(2, sets - 1);
  var target;
  if (e.type === 'iso') target = e.lo + '-' + e.hi + 's holds';
  else if (e.type === 'time') target = e.lo + '-' + e.hi + ' min';
  else target = e.lo + '-' + e.hi + ' reps';
  var suggestW = null;
  if (e.type === 'w') suggestW = prog.w || null;
  var setArr = [];
  for (var i = 0; i < sets; i++) setArr.push({reps:'', weight: suggestW || '', done:false});
  return {
    id: e.id, name: e.n, pat: e.pat, type: e.type,
    sets: setArr, target: target, rest: e.rest, note: e.note,
    last: prog.w ? ('Last: ' + (prog.r || '?') + ' reps @ ' + prog.w + ' lb') : (prog.r ? 'Last: ' + prog.r + (e.type === 'iso' ? 's' : ' reps') : ''),
    suggestW: suggestW
  };
};

R.warmupFor = function(wd, loc){
  var lower = [1,3].indexOf(wd) >= 0;
  var base = [loc === 'home' ? 'Easy bike spin — 4 min' : 'Easy bike or incline walk — 4 min'];
  if (lower) return base.concat(['Leg swings — 10 each direction','Bodyweight glute bridge — 12','Ankle rocks — 10 each side','Wall sit — 20s primer']);
  if ([2,4,5].indexOf(wd) >= 0) return base.concat(['Arm circles — 10 each way','Band/cable pull-apart — 15','Push-up to down-dog — 6','Scap pulls or shrug rolls — 10']);
  return ['Easy movement — 3 min','Cat-camel — 8','Hip circles — 8 each way'];
};
R.cooldownFor = function(wd){
  if ([1,3].indexOf(wd) >= 0) return ['Couch stretch — 45s each side','Hamstring floss — 10 each leg','Child’s pose breathing — 1 min'];
  if ([2,4].indexOf(wd) >= 0) return ['Doorway/chest stretch — 30s each side','Thoracic open book — 8 each side','Long exhale breathing — 1 min'];
  return ['Calf stretch — 30s each side','Hip flexor stretch — 30s each side','Child’s pose breathing — 1 min'];
};

R.generateWorkout = function(dateStr, checkin){
  checkin = checkin || {energy:3, sore:{}};
  var wd = R.weekday(dateStr);
  var t = R.dayTemplate(wd);
  var loc = R.S.schedule.homeDays.indexOf(wd) >= 0 ? 'home' : 'gym';
  var lowEnergy = checkin.energy <= 2;
  var gap = R.lastCompletedGap(dateStr);
  var reentry = gap !== null && gap >= 5;

  // dunk track: add a jump slot to lower days when unlocked, fresh legs, decent energy
  if ([1,3].indexOf(wd) >= 0 && R.jumpUnlocked() && !lowEnergy && !checkin.sore.legs && !checkin.sore.knees && !checkin.sore.feet) {
    t.slots.unshift({pat:'jump', main:true});
  }
  var slots = t.slots.filter(function(s){ return !(s.opt && (lowEnergy || reentry)); });
  if (checkin.sore.legs) slots = slots.filter(function(s){ return !(['squat','lunge','hinge','ham'].indexOf(s.pat) >= 0 && !s.main); });
  if (checkin.sore.upper) slots = slots.filter(function(s){ return !(['push_h','push_v','pull_h','pull_v','tri','bi','pull_acc'].indexOf(s.pat) >= 0 && !s.main); });

  var recent = R.recentIds(dateStr, 2);
  var usedIds = {};
  var exercises = [];
  slots.forEach(function(slot){
    var pool = R.eligible(slot.pat, loc, dateStr, recent, checkin.sore, usedIds);
    if (!pool.length) pool = R.eligible(slot.pat, loc, dateStr, {}, checkin.sore, usedIds); // relax recency
    if (!pool.length) return; // nothing safe for this slot today
    var pick = pool[0];
    usedIds[pick.id] = true;
    exercises.push(R.buildExercise(pick, {light: t.light || reentry, lowEnergy: lowEnergy}));
  });

  var notes = [];
  if (t.ball) notes.push('Basketball tonight — this session leaves your legs fresh.');
  if (reentry) notes.push('Been ' + gap + ' days — this is a lighter re-entry session on purpose. Ease back in.');
  if (lowEnergy) notes.push('Low energy day — volume trimmed. Showing up still counts.');
  if (checkin.sore.knees || checkin.sore.back || checkin.sore.feet) notes.push('Sore-area exercises swapped out for today.');

  return {
    date: dateStr, focus: t.focus, loc: loc, ball: t.ball,
    checkin: checkin, notes: notes,
    warmup: R.warmupFor(wd, loc), cooldown: R.cooldownFor(wd),
    exercises: exercises,
    completed: false, rating: null, pain: []
  };
};

// swap one exercise for the next best alternative
R.swapExercise = function(workout, idx){
  var cur = workout.exercises[idx];
  var used = {};
  workout.exercises.forEach(function(e){ used[e.id] = true; });
  var e = R.EX[cur.id];
  if (R.isJulia()) {
    var jpat = cur.pat === 'core' ? 'ppcore' : cur.pat; // pps-admitted core moves swap within the ladder
    var jpool = R.juliaEligible(jpat, workout.date, {}, used);
    if (!jpool.length) return false;
    var jex = R.buildExercise(jpool[0], {});
    var setsN = cur.sets.length;
    while (jex.sets.length > setsN) jex.sets.pop();
    while (jex.sets.length < setsN) jex.sets.push({reps:'', weight: jex.suggestW || '', done:false});
    workout.exercises[idx] = jex;
    return true;
  }
  // try listed subs first
  var pick = null;
  (e.subs || []).some(function(sid){
    var s = R.EX[sid];
    var stage = R.GATED.indexOf(s.pat) >= 0 ? R.S.rebuild[s.pat].stage : null;
    var locBad = workout.loc === 'home' ? s.eq === 'g' : s.eq === 'h';
    if (!used[sid] && !locBad && (stage === null || (s.minStage || 0) <= stage)) { pick = s; return true; }
    return false;
  });
  if (!pick) {
    var pool = R.eligible(e.pat, workout.loc, workout.date, {}, workout.checkin.sore || {}, used);
    if (pool.length) pick = pool[0];
  }
  if (pick) workout.exercises[idx] = R.buildExercise(pick, {});
  return !!pick;
};

window.R = R;
