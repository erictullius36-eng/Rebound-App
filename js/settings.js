// Rebound settings: profile, targets, schedule, rebuild status, backup.
var R = window.R || {};

R.renderSettings = function(){
  if (R.isJulia()) { R.renderJuliaSettings(); return; }
  var p = R.S.profile, t = R.S.targets;
  var days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  var ballChips = days.map(function(d, i){
    var on = R.S.schedule.basketballDays.indexOf(i) >= 0;
    return '<button class="chip' + (on ? ' on' : '') + '" data-ball="' + i + '" onclick="this.classList.toggle(\'on\');R.saveSchedule()">' + d + '</button>';
  }).join('');
  var homeChips = days.map(function(d, i){
    var on = R.S.schedule.homeDays.indexOf(i) >= 0;
    return '<button class="chip' + (on ? ' on' : '') + '" data-home="' + i + '" onclick="this.classList.toggle(\'on\');R.saveSchedule()">' + d + '</button>';
  }).join('');
  var rebuild = R.rebuildSummary().map(function(r){
    var dots = '';
    for (var s = 0; s <= R.MAX_STAGE; s++) dots += '<span class="dot' + (s <= r.stage && !r.locked ? ' fill' : '') + '"></span>';
    return '<div class="rb-row"><div><div class="rb-name">' + r.label + (r.locked ? ' 🔒' : '') + '</div>' +
      '<div class="rb-stage">' + r.stageName + (r.locked ? '' : ' · ' + r.clean + '/' + R.CLEAN_TO_ADVANCE + ' clean sessions to advance') + '</div></div>' +
      '<div class="dots">' + dots + '</div></div>';
  }).join('');

  document.getElementById('screen-settings').innerHTML =
    '<div class="card form">' +
      '<h3>Profile</h3>' +
      '<label>Current weight (lb)<input id="st-weight" type="number" inputmode="decimal" value="' + p.weightLbs + '"></label>' +
      '<label>Goal weight (lb)<input id="st-goal" type="number" inputmode="decimal" value="' + p.goalWeight + '"></label>' +
      '<label>Age<input id="st-age" type="number" inputmode="numeric" value="' + p.age + '"></label>' +
      '<button class="btn primary" onclick="R.saveProfile()">Save & recalc targets</button>' +
    '</div>' +
    '<div class="card form">' +
      '<h3>Daily targets</h3>' +
      '<label>Protein (g)<input id="st-protein" type="number" inputmode="numeric" value="' + t.protein + '"></label>' +
      '<label>Calories<input id="st-cal" type="number" inputmode="numeric" value="' + t.calories + '"></label>' +
      '<p class="hint">' + (t.overridden ? 'Manually set. ' : 'Auto-calculated from your stats (1g protein per lb of goal weight; ~500 cal deficit). ') + 'Edit to override.</p>' +
      '<button class="btn" onclick="R.saveTargets()">Save targets</button>' +
      (t.overridden ? '<button class="btn ghost" onclick="R.resetTargets()">Back to auto-calculated</button>' : '') +
    '</div>' +
    '<div class="card">' +
      '<h3>Basketball nights</h3><div class="chip-row">' + ballChips + '</div>' +
      '<h3>Home-gym days</h3><div class="chip-row">' + homeChips + '</div>' +
      '<p class="hint">Lifts on ball days stay upper-body so your legs show up to play.</p>' +
    '</div>' +
    '<div class="card">' +
      '<h3>Rebuild status</h3>' + rebuild +
      '<p class="hint">Stages advance with ' + R.CLEAN_TO_ADVANCE + ' pain-free sessions per pattern, drop back if you report pain. The dunk track unlocks when Squat and Lunge are both cleared.</p>' +
    '</div>' +
    '<div class="card">' +
      '<h3>Data</h3>' +
      '<button class="btn" onclick="R.exportBackup()">⬇︎ Backup everything (JSON)</button>' +
      '<label class="btn file-btn">⬆︎ Restore backup<input type="file" accept=".json,application/json" onchange="R.doImport(this)"></label>' +
      '<button class="btn" onclick="R.exportWorkoutCSV()">⬇︎ Workouts CSV</button>' +
      '<button class="btn" onclick="R.exportProteinCSV()">⬇︎ Protein CSV</button>' +
      '<p class="hint">Data lives only in this browser. Download a backup monthly — it restores everything on any phone.</p>' +
      '<button class="btn ghost" onclick="R.switchProfile()">Switch profile (Eric / Julia)</button>' +
      '<button class="btn danger" onclick="R.wipe()">Erase all data</button>' +
    '</div>';
};

// ---- Julia's settings ----
R.renderJuliaSettings = function(){
  var p = R.S.profile, t = R.S.targets, prefs = R.S.prefs;
  var pc = R.S.rebuild.ppcore;
  var chips = function(opts, cur, fn){
    return opts.map(function(o){
      return '<button class="chip' + (o[0] === cur ? ' on' : '') + '" onclick="' + fn + '(\'' + o[0] + '\')">' + o[1] + '</button>';
    }).join('');
  };
  var dots = '';
  for (var s = 0; s <= R.MAX_STAGE; s++) dots += '<span class="dot' + (s <= pc.stage ? ' fill' : '') + '"></span>';

  document.getElementById('screen-settings').innerHTML =
    '<div class="card form">' +
      '<h3>Profile — Julia</h3>' +
      '<label>Current weight (lb)<input id="st-weight" type="number" inputmode="decimal" value="' + p.weightLbs + '"></label>' +
      '<label>Goal weight (lb)<input id="st-goal" type="number" inputmode="decimal" value="' + p.goalWeight + '"></label>' +
      '<button class="btn primary" onclick="R.saveProfileJulia()">Save & recalc targets</button>' +
    '</div>' +
    '<div class="card">' +
      '<h3>Breastfeeding</h3>' +
      '<label class="check"><input type="checkbox" ' + (R.S.nursing ? 'checked' : '') + ' onchange="R.toggleNursing(this.checked)"> Currently breastfeeding</label>' +
      '<p class="hint">' + (R.S.nursing
        ? 'On: calories cover nursing demand with only a gentle deficit (safe, slow loss), protein set high to protect supply and muscle.'
        : 'Off: targets aim at your ' + p.goalWeight + ' lb goal with a standard deficit.') + ' Flipping this recalculates everything instantly.</p>' +
    '</div>' +
    '<div class="card form">' +
      '<h3>Daily targets</h3>' +
      '<label>Protein (g)<input id="st-protein" type="number" inputmode="numeric" value="' + t.protein + '"></label>' +
      '<label>Calories<input id="st-cal" type="number" inputmode="numeric" value="' + t.calories + '"></label>' +
      '<p class="hint">' + (t.overridden ? 'Manually set.' : 'Auto-calculated from your stats.') + ' Edit to override.</p>' +
      '<button class="btn" onclick="R.saveTargets()">Save targets</button>' +
      (t.overridden ? '<button class="btn ghost" onclick="R.resetTargets()">Back to auto-calculated</button>' : '') +
    '</div>' +
    '<div class="card">' +
      '<h3>Difficulty</h3><div class="chip-row">' + chips([['gentle','Gentle'],['standard','Standard'],['challenge','Challenge']], prefs.difficulty, 'R.setDifficulty') + '</div>' +
      '<p class="hint">Gentle = 2 sets, easiest variants, extra knee-friendly. Bump it whenever a session feels easy — it applies to the very next workout.</p>' +
      '<h3>Session length</h3><div class="chip-row">' + chips([['short','15–20 min'],['medium','25–35 min'],['long','40+ min']], prefs.length, 'R.setLength') + '</div>' +
      '<h3>Equipment</h3><div class="chip-row">' + chips([['home','Basement gym'],['bw','No equipment']], prefs.equip, 'R.setEquip') + '</div>' +
    '</div>' +
    '<div class="card">' +
      '<h3>Postpartum core ladder</h3>' +
      '<div class="rb-row"><div><div class="rb-name">Core rebuild</div>' +
      '<div class="rb-stage">' + R.PP_STAGE_NAMES[pc.stage] + (pc.stage < R.MAX_STAGE ? ' · ' + (4 - pc.count) + ' sessions to next stage' : '') + '</div></div>' +
      '<div class="dots">' + dots + '</div></div>' +
      '<div class="row2">' +
        '<button class="btn" onclick="R.coreStageAdj(-1)">− Step back</button>' +
        '<button class="btn" onclick="R.coreStageAdj(1)">+ Step up</button>' +
      '</div>' +
      '<p class="hint">Advances automatically every 4 workouts. If anything feels off in your core or pelvic floor (pressure, doming, leaking), step back a stage — no shame, that\'s the system working.</p>' +
    '</div>' +
    '<div class="card">' +
      '<h3>Data</h3>' +
      '<button class="btn" onclick="R.exportBackup()">⬇︎ Backup everything (JSON)</button>' +
      '<label class="btn file-btn">⬆︎ Restore backup<input type="file" accept=".json,application/json" onchange="R.doImport(this)"></label>' +
      '<button class="btn" onclick="R.exportWorkoutCSV()">⬇︎ Workouts CSV</button>' +
      '<button class="btn" onclick="R.exportProteinCSV()">⬇︎ Protein CSV</button>' +
      '<p class="hint">Data lives only in this browser — download a backup monthly.</p>' +
      '<button class="btn ghost" onclick="R.switchProfile()">Switch profile (Eric / Julia)</button>' +
      '<button class="btn danger" onclick="R.wipe()">Erase all data</button>' +
    '</div>';
};
R.saveProfileJulia = function(){
  var p = R.S.profile;
  p.weightLbs = parseFloat(document.getElementById('st-weight').value) || p.weightLbs;
  p.goalWeight = parseFloat(document.getElementById('st-goal').value) || p.goalWeight;
  R.refreshTargets();
  R.save();
  R.renderSettings();
  R.flash('Saved — targets updated');
};
R.toggleNursing = function(on){
  R.S.nursing = on;
  R.S.targets.overridden = false; // recalc for the new phase
  R.refreshTargets();
  R.save();
  R.renderSettings();
  R.flash(on ? 'Breastfeeding targets on' : 'Targets now aim at ' + R.S.profile.goalWeight + ' lb');
};
R.setDifficulty = function(v){ R.S.prefs.difficulty = v; R.save(); R.renderSettings(); R.flash('Difficulty: ' + v); };
R.setLength = function(v){ R.S.prefs.length = v; R.save(); R.renderSettings(); };
R.setEquip = function(v){ R.S.prefs.equip = v; R.save(); R.renderSettings(); };
R.coreStageAdj = function(dir){
  var pc = R.S.rebuild.ppcore;
  pc.stage = Math.max(0, Math.min(R.MAX_STAGE, pc.stage + dir));
  pc.count = 0;
  R.save();
  R.renderSettings();
};
R.switchProfile = function(){
  if (!confirm('Switch profile? Your data stays saved on this phone — this just changes who\'s active.')) return;
  localStorage.removeItem(R.PROFILE_KEY);
  location.reload();
};

R.saveProfile = function(){
  var p = R.S.profile;
  p.weightLbs = parseFloat(document.getElementById('st-weight').value) || p.weightLbs;
  p.goalWeight = parseFloat(document.getElementById('st-goal').value) || p.goalWeight;
  p.age = parseInt(document.getElementById('st-age').value, 10) || p.age;
  R.refreshTargets();
  R.save();
  R.renderSettings();
  R.flash('Saved — targets updated');
};
R.saveTargets = function(){
  var t = R.S.targets;
  var np = parseInt(document.getElementById('st-protein').value, 10);
  var nc = parseInt(document.getElementById('st-cal').value, 10);
  var auto = R.calcTargets();
  if (np) t.protein = np;
  if (nc) t.calories = nc;
  t.overridden = (t.protein !== auto.protein || t.calories !== auto.calories);
  R.save();
  R.renderSettings();
  R.flash('Targets saved');
};
R.resetTargets = function(){
  R.S.targets.overridden = false;
  R.refreshTargets();
  R.save();
  R.renderSettings();
};
R.saveSchedule = function(){
  var ball = [], home = [];
  document.querySelectorAll('[data-ball].on').forEach(function(b){ ball.push(parseInt(b.getAttribute('data-ball'), 10)); });
  document.querySelectorAll('[data-home].on').forEach(function(b){ home.push(parseInt(b.getAttribute('data-home'), 10)); });
  R.S.schedule.basketballDays = ball;
  R.S.schedule.homeDays = home;
  R.save();
};
R.doImport = function(input){
  if (!input.files || !input.files[0]) return;
  R.importBackup(input.files[0], function(err){
    if (err) { R.flash('That file isn\'t a Rebound backup'); return; }
    R.flash('Backup restored ✓');
    R.showScreen('dash');
  });
};
R.wipe = function(){
  if (!confirm('Erase ALL workouts, protein logs, and settings? This cannot be undone.')) return;
  if (!confirm('Last chance — download a backup first?  OK erases everything.')) return;
  localStorage.removeItem(R.KEY);
  R.S = R.load();
  R.refreshTargets();
  R.save();
  R.showScreen('dash');
};

window.R = R;
