// Rebound progression + rebuild-stage engine. Runs when a workout is finished.
var R = window.R || {};

R.PAIN_TO_PATTERNS = { knees:['squat','lunge','jump'], back:['hinge','squat'], feet:['jump','lunge','calf_foot'] };
R.CLEAN_TO_ADVANCE = 3;
R.MAX_STAGE = 3;

R.finishWorkout = function(w, rating, painAreas, painExIds){
  w.completed = true;
  w.rating = rating;
  w.pain = painAreas;

  // 1. per-exercise progression memory (best done set)
  w.exercises.forEach(function(ex){
    var bestW = 0, bestR = 0, any = false;
    ex.sets.forEach(function(s){
      if (!s.done) return;
      any = true;
      var wt = parseFloat(s.weight) || 0, rp = parseFloat(s.reps) || 0;
      if (wt > bestW || (wt === bestW && rp > bestR)) { bestW = wt; bestR = rp; }
    });
    if (!any) return;
    var db = R.EX[ex.id];
    var prog = R.S.progress[ex.id] || {};
    if (db.type === 'w' && bestW) {
      // double progression: top of rep range hit and not "too hard" -> suggest more weight next time
      var inc = (rating === 'easy') ? 10 : 5;
      if (bestR >= db.hi && rating !== 'hard') prog.w = bestW + inc;
      else prog.w = bestW;
      prog.r = bestR;
    } else {
      prog.r = bestR || prog.r;
    }
    R.S.progress[ex.id] = prog;
  });

  // 2. pain flags bench specific exercises for 7 days
  (painExIds || []).forEach(function(id){
    R.S.avoid[id] = R.addDays(w.date, 7);
  });

  // 3. rebuild stages: patterns trained today advance on clean sessions, drop on pain
  var trained = {};
  w.exercises.forEach(function(ex){ if (R.GATED.indexOf(ex.pat) >= 0) trained[ex.pat] = true; });
  var painPatterns = {};
  painAreas.forEach(function(a){ (R.PAIN_TO_PATTERNS[a] || []).forEach(function(p){ painPatterns[p] = true; }); });

  Object.keys(trained).forEach(function(pat){
    var rb = R.S.rebuild[pat];
    if (!rb) return; // pattern not tracked in this profile
    if (painPatterns[pat]) {
      rb.stage = Math.max(0, rb.stage - 1);
      rb.clean = 0;
    } else {
      rb.clean++;
      if (rb.clean >= R.CLEAN_TO_ADVANCE && rb.stage < R.MAX_STAGE) {
        rb.stage++;
        rb.clean = 0;
      }
    }
  });
  // pain in an area also resets patterns not trained today
  Object.keys(painPatterns).forEach(function(pat){
    if (!trained[pat] && R.S.rebuild[pat]) {
      R.S.rebuild[pat].stage = Math.max(0, R.S.rebuild[pat].stage - 1);
      R.S.rebuild[pat].clean = 0;
    }
  });

  // Julia's postpartum core ladder: advance one stage every 4 completed sessions (no ratings needed)
  if (R.isJulia()) {
    var pc = R.S.rebuild.ppcore;
    pc.count++;
    if (pc.count >= 4 && pc.stage < R.MAX_STAGE) { pc.stage++; pc.count = 0; }
  }

  R.save();
};

R.PP_STAGE_NAMES = ['Reconnect (breath & deep core)','Foundation (anti-rotation basics)','Strong (planks & holds)','Full (loaded core, everything unlocked)'];

// human-readable rebuild summary for settings + promotions worth celebrating
R.rebuildSummary = function(){
  return R.GATED.map(function(p){
    var rb = R.S.rebuild[p];
    var label = p === 'jump' ? 'Jump (dunk track)' : p.charAt(0).toUpperCase() + p.slice(1);
    var locked = p === 'jump' && !R.jumpUnlocked();
    return { pat:p, label:label, stage:rb.stage, clean:rb.clean, locked:locked,
      stageName: locked ? 'Locked — clear squat & lunge first' : R.STAGE_NAMES[rb.stage] };
  });
};

window.R = R;
