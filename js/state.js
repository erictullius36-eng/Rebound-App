// Rebound state: profiles, load/save, defaults, dates, backup, CSV export.
// Two profiles, fully separate: Eric ('rebound_v1') and Julia ('rebound_julia_v1').
// The profile marker records which profile owns THIS device/browser.
var R = window.R || {};
R.PROFILE_KEY = 'rebound_profile';
R.keyFor = function(mode){ return mode === 'julia' ? 'rebound_julia_v1' : 'rebound_v1'; };

R.defaults = function(mode){
  if (mode === 'julia') return {
    version: 1,
    mode: 'julia',
    profile: { age:34, heightIn:67, weightLbs:165, sex:'female', goalWeight:145 },
    nursing: true, // breastfeeding: gentle deficit, high protein; toggle off in Settings
    prefs: { difficulty:'gentle', length:'short', equip:'home' },
    rebuild: { ppcore:{stage:0, count:0} }, // postpartum core ladder
    targets: { protein:0, calories:0, overridden:false },
    foods: [],
    proteinLog: {},
    workouts: {},
    progress: {},
    avoid: {}
  };
  return {
    version: 1,
    mode: 'eric',
    profile: { age:38, heightIn:73, weightLbs:235, sex:'male', goalWeight:200, goalBF:13 },
    schedule: { basketballDays:[2,4,5], homeDays:[0,6] },
    rebuild: {
      squat:{stage:0, clean:0}, lunge:{stage:0, clean:0},
      hinge:{stage:0, clean:0}, jump:{stage:0, clean:0}
    },
    targets: { protein:0, calories:0, overridden:false },
    foods: [],
    proteinLog: {},
    workouts: {},
    progress: {},
    avoid: {}
  };
};

// Returns state, or null if this device hasn't picked a profile yet (show picker).
R.load = function(){
  var mode = localStorage.getItem(R.PROFILE_KEY);
  if (!mode) {
    // Legacy auto-claim: only treat v1 data as Eric's if it shows real use.
    // (A phone that merely OPENED the old version once has an empty v1 shell — ignore it and show the picker.)
    try {
      var legacy = JSON.parse(localStorage.getItem('rebound_v1') || 'null');
      if (legacy && (Object.keys(legacy.workouts || {}).length ||
                     Object.keys(legacy.proteinLog || {}).length ||
                     (legacy.foods || []).length)) mode = 'eric';
    } catch(e){}
  }
  if (!mode) return null;
  localStorage.setItem(R.PROFILE_KEY, mode);
  R.KEY = R.keyFor(mode);
  var raw = localStorage.getItem(R.KEY);
  var s = raw ? JSON.parse(raw) : R.defaults(mode);
  var d = R.defaults(mode);
  Object.keys(d).forEach(function(k){ if (s[k] === undefined) s[k] = d[k]; });
  return s;
};
R.setProfile = function(mode){
  localStorage.setItem(R.PROFILE_KEY, mode);
  R.S = R.load();
  R.refreshTargets();
  R.save();
};
R.save = function(){ localStorage.setItem(R.KEY, JSON.stringify(R.S)); };
R.isJulia = function(){ return R.S && R.S.mode === 'julia'; };

// Local-timezone date string
R.dstr = function(d){
  d = d || new Date();
  return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
};
R.today = function(){ return R.dstr(new Date()); };
R.addDays = function(dateStr, n){
  var p = dateStr.split('-');
  var d = new Date(+p[0], +p[1]-1, +p[2]);
  d.setDate(d.getDate() + n);
  return R.dstr(d);
};
R.weekday = function(dateStr){
  var p = dateStr.split('-');
  return new Date(+p[0], +p[1]-1, +p[2]).getDay();
};

// Targets.
// Eric: Mifflin-St Jeor male, activity 1.45, -500 deficit; protein 1g/lb goal weight.
// Julia: Mifflin female, activity 1.35.
//   Nursing: +400 kcal breastfeeding demand, gentle -300 deficit; protein 0.8g/lb current weight.
//   Not nursing: -500 deficit (floor 1400); protein 1g/lb goal weight.
R.calcTargets = function(){
  var p = R.S.profile;
  var kg = p.weightLbs * 0.4536, cm = p.heightIn * 2.54;
  var bmr = 10*kg + 6.25*cm - 5*p.age + (p.sex === 'male' ? 5 : -161);
  if (R.isJulia()) {
    if (R.S.nursing) return {
      protein: Math.round(p.weightLbs * 0.8),
      calories: Math.round(bmr * 1.35 + 400 - 300)
    };
    return {
      protein: Math.round(p.goalWeight * 1.0),
      calories: Math.max(1400, Math.round(bmr * 1.35 - 500))
    };
  }
  return { protein: Math.round(p.goalWeight * 1.0), calories: Math.max(1800, Math.round(bmr * 1.45 - 500)) };
};
R.refreshTargets = function(){
  if (!R.S.targets.overridden) {
    var t = R.calcTargets();
    R.S.targets.protein = t.protein;
    R.S.targets.calories = t.calories;
  }
};

R.proteinToday = function(dateStr){
  var log = R.S.proteinLog[dateStr || R.today()] || [];
  var p = 0, c = 0;
  log.forEach(function(e){ p += e.protein; c += e.cal || 0; });
  return { protein: Math.round(p), cal: Math.round(c), entries: log };
};

// Streak: consecutive days (ending today or yesterday) with a completed workout
R.streak = function(){
  var n = 0, d = R.today();
  var w = R.S.workouts[d];
  if (!w || !w.completed) d = R.addDays(d, -1);
  while (true) {
    w = R.S.workouts[d];
    if (w && w.completed) { n++; d = R.addDays(d, -1); } else break;
  }
  return n;
};
// Workouts completed in the last 7 days (Julia's cadence metric)
R.weekCount = function(){
  var n = 0;
  for (var i = 0; i < 7; i++) {
    var w = R.S.workouts[R.addDays(R.today(), -i)];
    if (w && w.completed) n++;
  }
  return n;
};

// ---- Downloads ----
R.download = function(filename, text, mime){
  var blob = new Blob([text], {type: mime || 'text/plain'});
  var a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a); a.click();
  setTimeout(function(){ URL.revokeObjectURL(a.href); a.remove(); }, 500);
};
R.csvCell = function(v){
  v = String(v == null ? '' : v);
  return (v.indexOf(',') >= 0 || v.indexOf('"') >= 0 || v.indexOf('\n') >= 0) ? '"' + v.replace(/"/g,'""') + '"' : v;
};
R.exportBackup = function(){
  R.download('rebound-' + R.S.mode + '-backup-' + R.today() + '.json', JSON.stringify(R.S, null, 1), 'application/json');
};
R.importBackup = function(file, cb){
  var reader = new FileReader();
  reader.onload = function(){
    try {
      var data = JSON.parse(reader.result);
      if (!data.profile || !data.rebuild) throw new Error('not a Rebound backup');
      if ((data.mode || 'eric') !== R.S.mode) throw new Error('wrong profile');
      R.S = data; R.save(); cb(null);
    } catch(e){ cb(e); }
  };
  reader.readAsText(file);
};
R.exportProteinCSV = function(){
  var rows = ['date,time,food,protein_g,calories'];
  Object.keys(R.S.proteinLog).sort().forEach(function(d){
    R.S.proteinLog[d].forEach(function(e){
      rows.push([d, e.t || '', R.csvCell(e.name), e.protein, e.cal || ''].join(','));
    });
  });
  R.download('rebound-' + R.S.mode + '-protein-' + R.today() + '.csv', rows.join('\n'), 'text/csv');
};
R.exportWorkoutCSV = function(){
  var rows = ['date,focus,completed,rating,pain,exercise,sets_done,best_set'];
  Object.keys(R.S.workouts).sort().forEach(function(d){
    var w = R.S.workouts[d];
    (w.exercises || []).forEach(function(ex){
      var done = ex.sets.filter(function(s){ return s.done; }).length;
      var db = R.EX[ex.id] || {};
      var unit = db.type === 'iso' ? ' sec' : (db.type === 'time' ? ' min' : ' reps');
      var best = '';
      ex.sets.forEach(function(s){
        if (s.done && s.reps) best = s.reps + (s.weight ? ' x ' + s.weight + 'lb' : unit);
      });
      rows.push([d, R.csvCell(w.focus), w.completed ? 'yes' : 'no', w.rating || '',
        (w.pain || []).join(';'), R.csvCell(ex.name), done + '/' + ex.sets.length, R.csvCell(best)].join(','));
    });
  });
  R.download('rebound-' + R.S.mode + '-workouts-' + R.today() + '.csv', rows.join('\n'), 'text/csv');
};

window.R = R;
