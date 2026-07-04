// Rebound state: load/save, defaults, dates, backup, CSV export.
var R = window.R || {};
R.KEY = 'rebound_v1';

R.defaults = function(){
  return {
    version: 1,
    profile: { age:38, heightIn:73, weightLbs:235, sex:'male', goalWeight:200, goalBF:13 },
    schedule: { basketballDays:[2,4,5], homeDays:[0,6] }, // getDay(): Sun=0..Sat=6
    rebuild: {
      squat:{stage:0, clean:0}, lunge:{stage:0, clean:0},
      hinge:{stage:0, clean:0}, jump:{stage:0, clean:0}
    },
    targets: { protein:0, calories:0, overridden:false },
    foods: [],            // {id, name, protein, cal, quick:true}
    proteinLog: {},       // 'YYYY-MM-DD' -> [{name, protein, cal, t}]
    workouts: {},         // 'YYYY-MM-DD' -> workout object
    progress: {},         // exId -> {w: lastWeight, r: lastTopReps}
    avoid: {}             // exId -> dateStr until which it's benched (pain)
  };
};

R.load = function(){
  var raw = localStorage.getItem(R.KEY);
  var s = raw ? JSON.parse(raw) : R.defaults();
  // fill any missing keys from defaults (schema-safe upgrades)
  var d = R.defaults();
  Object.keys(d).forEach(function(k){ if (s[k] === undefined) s[k] = d[k]; });
  return s;
};
R.save = function(){ localStorage.setItem(R.KEY, JSON.stringify(R.S)); };

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

// Targets: Mifflin-St Jeor, activity 1.45, -500 deficit; protein = 1g/lb goal weight.
R.calcTargets = function(){
  var p = R.S.profile;
  var kg = p.weightLbs * 0.4536, cm = p.heightIn * 2.54;
  var bmr = 10*kg + 6.25*cm - 5*p.age + (p.sex === 'male' ? 5 : -161);
  var cal = Math.max(1800, Math.round(bmr * 1.45 - 500));
  return { protein: Math.round(p.goalWeight * 1.0), calories: cal };
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
  if (!w || !w.completed) d = R.addDays(d, -1); // today not done yet doesn't break it
  while (true) {
    w = R.S.workouts[d];
    if (w && w.completed) { n++; d = R.addDays(d, -1); } else break;
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
  R.download('rebound-backup-' + R.today() + '.json', JSON.stringify(R.S, null, 1), 'application/json');
};
R.importBackup = function(file, cb){
  var reader = new FileReader();
  reader.onload = function(){
    try {
      var data = JSON.parse(reader.result);
      if (!data.profile || !data.rebuild) throw new Error('not a Rebound backup');
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
  R.download('rebound-protein-' + R.today() + '.csv', rows.join('\n'), 'text/csv');
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
  R.download('rebound-workouts-' + R.today() + '.csv', rows.join('\n'), 'text/csv');
};

window.R = R;
