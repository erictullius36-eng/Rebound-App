// Rebound today's-workout screen: check-in -> workout -> finish & rate.
var R = window.R || {};
R._timers = {};

R.renderWorkout = function(){
  var d = R.today();
  var w = R.S.workouts[d];
  var el = document.getElementById('screen-workout');
  if (!w) { el.innerHTML = R.isJulia() ? R.juliaStartHtml() : R.checkinHtml(); return; }
  if (w.completed) { el.innerHTML = R.doneHtml(w); return; }
  el.innerHTML = R.workoutHtml(w);
};

// ---- Julia: no check-in, one tap to a workout ----
R.juliaStartHtml = function(){
  var p = R.S.prefs;
  var lenLabel = {short:'15–20 min', medium:'25–35 min', long:'40+ min'}[p.length];
  return '<div class="card">' +
    '<h2>' + R.juliaNextFocus() + '</h2>' +
    '<p class="hint">' + lenLabel + ' · ' + (p.equip === 'bw' ? 'no equipment' : 'basement gym') + ' · ' + p.difficulty + ' mode — all adjustable in Settings.</p>' +
    '<button class="btn primary big" onclick="R.startJulia()">Build my workout</button>' +
    '</div>';
};
R.startJulia = function(){
  R.S.workouts[R.today()] = R.generateJuliaWorkout(R.today());
  R.save();
  R.renderWorkout();
};

// ---- check-in ----
R.checkinHtml = function(){
  var wd = R.weekday(R.today());
  var t = R.dayTemplate(wd);
  var soreChips = [['knees','Knees'],['back','Lower back'],['feet','Feet'],['legs','Leg muscles'],['upper','Upper body']]
    .map(function(c){ return '<button class="chip" data-sore="' + c[0] + '" onclick="this.classList.toggle(\'on\')">' + c[1] + '</button>'; }).join('');
  return '<div class="card">' +
    '<h2>' + t.focus + '</h2>' +
    '<p class="hint">' + (t.ball ? '🏀 Ball tonight — today\'s lift stays out of your legs\' way.' : 'Quick 10-second check-in, then your workout.') + '</p>' +
    '<h3>Energy today?</h3>' +
    '<div class="energy-row">' + [1,2,3,4,5].map(function(n){
      return '<button class="chip energy' + (n === 3 ? ' on' : '') + '" data-energy="' + n + '" onclick="R.pickEnergy(this)">' + n + '</button>';
    }).join('') + '</div>' +
    '<h3>Anything sore?</h3>' +
    '<div class="chip-row">' + soreChips + '</div>' +
    '<button class="btn primary big" onclick="R.startToday()">Build my workout</button>' +
    '</div>';
};
R.pickEnergy = function(btn){
  document.querySelectorAll('.energy').forEach(function(b){ b.classList.remove('on'); });
  btn.classList.add('on');
};
R.startToday = function(){
  var energy = 3;
  var e = document.querySelector('.energy.on');
  if (e) energy = parseInt(e.getAttribute('data-energy'), 10);
  var sore = {};
  document.querySelectorAll('[data-sore].on').forEach(function(b){ sore[b.getAttribute('data-sore')] = true; });
  var w = R.generateWorkout(R.today(), {energy: energy, sore: sore});
  R.S.workouts[R.today()] = w;
  R.save();
  R.renderWorkout();
};
R.regenToday = function(){
  var w = R.S.workouts[R.today()];
  if (w && w.exercises.some(function(ex){ return ex.sets.some(function(s){ return s.done; }); })) {
    if (!confirm('You\'ve already logged sets. Rebuild anyway?')) return;
  }
  delete R.S.workouts[R.today()];
  R.save();
  if (R.isJulia()) R.startJulia(); else R.renderWorkout();
};

// ---- the workout ----
R.workoutHtml = function(w){
  var notes = w.notes.map(function(n){ return '<p class="note">' + n + '</p>'; }).join('');
  var list = function(items){ return items.map(function(i){ return '<label class="check small"><input type="checkbox"> ' + i + '</label>'; }).join(''); };
  var exHtml = w.exercises.map(function(ex, i){ return R.exerciseCard(ex, i); }).join('');
  return '<div class="w-top"><h2>' + w.focus + '</h2>' +
    '<span class="tag">' + (w.loc === 'home' ? '🏠 Home' : '🏋️ Gym') + '</span></div>' + notes +
    '<details class="card" open><summary>Warm-up</summary>' + list(w.warmup) + '</details>' +
    exHtml +
    '<details class="card"><summary>Cool-down</summary>' + list(w.cooldown) + '</details>' +
    '<button class="btn primary big" onclick="R.showFinish()">Finish workout</button>' +
    '<div id="finish-area"></div>' +
    '<button class="btn ghost" onclick="R.regenToday()">↻ Rebuild today\'s workout</button>';
};

R.exerciseCard = function(ex, i){
  var setsHtml = ex.sets.map(function(s, j){
    var unit = ex.type === 'iso' ? 'sec' : (ex.type === 'time' ? 'min' : 'reps');
    var wField = ex.type === 'w'
      ? '<input type="number" inputmode="decimal" placeholder="lb" value="' + R.esc(s.weight) + '" onchange="R.setField(' + i + ',' + j + ',\'weight\',this.value)">'
      : '';
    return '<div class="set-row' + (s.done ? ' done' : '') + '" id="set-' + i + '-' + j + '">' +
      '<span class="set-n">' + (j + 1) + '</span>' +
      '<input type="number" inputmode="numeric" placeholder="' + unit + '" value="' + R.esc(s.reps) + '" onchange="R.setField(' + i + ',' + j + ',\'reps\',this.value)">' +
      wField +
      '<button class="set-check" onclick="R.toggleSet(' + i + ',' + j + ')">✓</button>' +
      '</div>';
  }).join('');
  var meta = ex.target + (ex.suggestW ? ' @ ' + ex.suggestW + ' lb' : '');
  return '<div class="card ex-card">' +
    '<div class="ex-head"><div><div class="ex-name">' + R.esc(ex.name) + '</div>' +
    '<div class="ex-meta">' + ex.sets.length + ' sets · ' + meta + (ex.rest ? ' · rest ' + ex.rest + 's' : '') + '</div>' +
    (ex.last ? '<div class="ex-last">' + R.esc(ex.last) + '</div>' : '') + '</div>' +
    '<button class="swap" onclick="R.doSwap(' + i + ')" title="Swap exercise">⇄</button></div>' +
    (ex.note ? '<p class="ex-note">' + R.esc(ex.note) + '</p>' : '') +
    setsHtml +
    (ex.rest ? '<button class="btn rest" id="rest-' + i + '" onclick="R.startRest(' + i + ',' + ex.rest + ')">Rest ' + ex.rest + 's</button>' : '') +
    '</div>';
};

R.setField = function(i, j, field, val){
  var w = R.S.workouts[R.today()];
  w.exercises[i].sets[j][field] = val;
  R.save();
};
R.toggleSet = function(i, j){
  var w = R.S.workouts[R.today()];
  var s = w.exercises[i].sets[j];
  s.done = !s.done;
  // convenience: checking an empty set fills the suggested values
  if (s.done && !s.reps) {
    var db = R.EX[w.exercises[i].id];
    s.reps = db.hi;
    var row = document.getElementById('set-' + i + '-' + j);
    if (row) row.querySelector('input').value = db.hi;
  }
  R.save();
  document.getElementById('set-' + i + '-' + j).classList.toggle('done', s.done);
};
R.doSwap = function(i){
  var w = R.S.workouts[R.today()];
  if (R.swapExercise(w, i)) { R.save(); R.renderWorkout(); }
  else R.flash('No safe alternative available today');
};
R.startRest = function(i, secs){
  var btn = document.getElementById('rest-' + i);
  if (R._timers[i]) { clearInterval(R._timers[i]); }
  var left = secs;
  btn.classList.add('running');
  R._timers[i] = setInterval(function(){
    left--;
    if (left <= 0) {
      clearInterval(R._timers[i]); delete R._timers[i];
      btn.textContent = 'Rest done ✓';
      btn.classList.remove('running');
      if (navigator.vibrate) navigator.vibrate(200);
    } else btn.textContent = left + 's…';
  }, 1000);
};

// ---- finish & rate ----
R.showFinish = function(){
  if (R.isJulia()) { // no rating flow — finish directly
    var w = R.S.workouts[R.today()];
    R.finishWorkout(w, 'right', [], []);
    R.renderWorkout();
    R.flash('Workout saved 🔥');
    return;
  }
  var painChips = [['knees','Knees'],['back','Lower back'],['feet','Feet']]
    .map(function(c){ return '<button class="chip warn" data-pain="' + c[0] + '" onclick="this.classList.toggle(\'on\')">' + c[1] + '</button>'; }).join('');
  document.getElementById('finish-area').innerHTML = '<div class="card">' +
    '<h3>How was it?</h3>' +
    '<div class="chip-row">' +
      '<button class="chip rate" data-rate="easy" onclick="R.pickRate(this)">Too easy</button>' +
      '<button class="chip rate on" data-rate="right" onclick="R.pickRate(this)">Just right</button>' +
      '<button class="chip rate" data-rate="hard" onclick="R.pickRate(this)">Too hard</button>' +
    '</div>' +
    '<h3>Any pain during it?</h3>' +
    '<div class="chip-row">' + painChips + '</div>' +
    '<p class="hint">Pain (not soreness) drops that pattern back a stage and benches the exercise for a week. Honesty here is what gets you dunking.</p>' +
    '<button class="btn primary big" onclick="R.submitFinish()">Save workout</button>' +
    '</div>';
  document.getElementById('finish-area').scrollIntoView({behavior:'smooth'});
};
R.pickRate = function(btn){
  document.querySelectorAll('.rate').forEach(function(b){ b.classList.remove('on'); });
  btn.classList.add('on');
};
R.submitFinish = function(){
  var w = R.S.workouts[R.today()];
  var rating = 'right';
  var rb = document.querySelector('.rate.on');
  if (rb) rating = rb.getAttribute('data-rate');
  var pain = [];
  document.querySelectorAll('[data-pain].on').forEach(function(b){ pain.push(b.getAttribute('data-pain')); });
  // pain areas -> bench today's exercises stressing that area
  var painExIds = [];
  if (pain.length) {
    var map = {knees:'ks', back:'bs', feet:'fs'};
    w.exercises.forEach(function(ex){
      var db = R.EX[ex.id];
      pain.forEach(function(a){ if (db[map[a]] >= 2) painExIds.push(ex.id); });
    });
  }
  R.finishWorkout(w, rating, pain, painExIds);
  R.renderWorkout();
  R.flash('Workout saved 🔥');
};

R.doneHtml = function(w){
  var doneSets = 0, totalSets = 0;
  w.exercises.forEach(function(ex){ ex.sets.forEach(function(s){ totalSets++; if (s.done) doneSets++; }); });
  if (R.isJulia()) {
    var pc = R.S.rebuild.ppcore;
    return '<div class="card center">' +
      '<div class="big-emoji">✅</div>' +
      '<h2>' + w.focus + ' — done</h2>' +
      '<p>' + doneSets + '/' + totalSets + ' sets · ' + R.weekCount() + ' workout' + (R.weekCount() === 1 ? '' : 's') + ' this week</p>' +
      '<p class="hint">Core ladder: ' + R.PP_STAGE_NAMES[pc.stage] + (pc.stage < R.MAX_STAGE ? ' · ' + (4 - pc.count) + ' session' + (4 - pc.count === 1 ? '' : 's') + ' to the next stage' : '') + '</p>' +
      '</div>';
  }
  return '<div class="card center">' +
    '<div class="big-emoji">✅</div>' +
    '<h2>' + w.focus + ' — done</h2>' +
    '<p>' + doneSets + '/' + totalSets + ' sets · rated “' + (w.rating || '—') + '”' + (w.pain.length ? ' · pain: ' + w.pain.join(', ') : '') + '</p>' +
    '<p class="hint">Streak: ' + R.streak() + ' day' + (R.streak() === 1 ? '' : 's') + '. See you tomorrow.</p>' +
    '</div>';
};

window.R = R;
