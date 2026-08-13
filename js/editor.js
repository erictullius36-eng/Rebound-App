// Rebound workout customization: edit today's session, exercise picker, pins,
// custom exercise creator, manual builder, and saved templates. Both profiles.
var R = window.R || {};

R.PAT_LABELS = {
  push_h:'Chest', pull_v:'Back — pulldowns & pull-ups', pull_h:'Back — rows', pull_acc:'Rear delts & upper back',
  push_v:'Shoulders', traps:'Traps', bi:'Biceps', tri:'Triceps',
  squat:'Legs — squat', lunge:'Legs — lunge', hinge:'Legs — hinge & glutes', ham:'Hamstrings',
  calf_foot:'Calves & feet', core:'Core', ppcore:'Core — postpartum ladder', jump:'Jump & plyo',
  condition:'Conditioning', mobility:'Mobility'
};

// ---- edit today's workout ----
R.moveEx = function(i, dir){
  var w = R.S.workouts[R.today()];
  var j = i + dir;
  if (j < 0 || j >= w.exercises.length) return;
  var tmp = w.exercises[i]; w.exercises[i] = w.exercises[j]; w.exercises[j] = tmp;
  R._editIdx = undefined;
  R.save(); R.renderWorkout();
};
R.removeEx = function(i){
  var w = R.S.workouts[R.today()];
  var ex = w.exercises[i];
  if (ex.sets.some(function(s){ return s.done; }) && !confirm('You logged sets on ' + ex.name + '. Remove it anyway?')) return;
  w.exercises.splice(i, 1);
  R._editIdx = undefined;
  R.save(); R.renderWorkout();
};
R.toggleEdit = function(i){
  R._editIdx = (R._editIdx === i) ? undefined : i;
  R.renderWorkout();
};
R.editSets = function(i, delta){
  var w = R.S.workouts[R.today()];
  var ex = w.exercises[i];
  if (delta > 0) ex.sets.push({reps:'', weight: ex.suggestW || '', done:false});
  else if (ex.sets.length > 1) ex.sets.pop();
  R.save(); R.renderWorkout();
};
R.editRest = function(i, val){
  var w = R.S.workouts[R.today()];
  w.exercises[i].rest = Math.max(0, parseInt(val, 10) || 0);
  R.save();
};

// ---- exercise picker ----
R.dayLabel = function(){
  if (R.isJulia()) {
    var w = R.S.workouts[R.today()];
    var rot = w && w.rot !== undefined ? w.rot : (R.juliaCompletedCount() % 3);
    return ['Full Body A','Full Body B','Full Body C'][rot];
  }
  return ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][R.weekday(R.today())];
};
R.pinKeyToday = function(){
  if (R.isJulia()) {
    var w = R.S.workouts[R.today()];
    var rot = w && w.rot !== undefined ? w.rot : (R.juliaCompletedCount() % 3);
    return 'r' + rot;
  }
  return String(R.weekday(R.today()));
};

R.pickerEligible = function(e){
  var w = R.S.workouts[R.today()];
  if (w && w.exercises.some(function(x){ return x.id === e.id; })) return false;
  if (R.S.banned.indexOf(e.id) >= 0) return false;
  if (R.S.avoid[e.id] && R.S.avoid[e.id] >= R.today()) return false;
  if (e.eq) {
    if (R.isJulia()) { if (R.S.prefs.equip === 'bw' ? !e.bw : e.eq === 'g') return false; }
    else { var loc = w ? w.loc : (R.S.schedule.homeDays.indexOf(R.weekday(R.today())) >= 0 ? 'home' : 'gym'); if (loc === 'home' ? e.eq === 'g' : e.eq === 'h') return false; }
  }
  if (R.isJulia() && e.pat === 'jump') return false;
  return true;
};

R.showPicker = function(){
  var q = (R._pickerQ || '').toLowerCase();
  var groups = [];
  var customs = R.S.customEx.filter(function(e){ return R.pickerEligible(e) && (!q || e.n.toLowerCase().indexOf(q) >= 0); });
  if (customs.length) groups.push({label:'⭐ My exercises', items: customs});
  Object.keys(R.PAT_LABELS).forEach(function(pat){
    var items = R.EXDB.filter(function(e){ return e.pat === pat && R.pickerEligible(e) && (!q || e.n.toLowerCase().indexOf(q) >= 0); });
    if (items.length) groups.push({label: R.PAT_LABELS[pat], items: items});
  });
  var day = R.dayLabel();
  var html = '<div class="picker-head">' +
    '<h2>Add exercise</h2><button class="e-del big-x" onclick="R.closePicker()">×</button></div>' +
    '<p class="hint">Add = today only. 📌 Pin = include it in every ' + R.esc(day) + ' from now on.</p>' +
    '<input id="picker-q" type="text" placeholder="Search…" value="' + R.esc(R._pickerQ || '') + '" oninput="R._pickerQ=this.value;R.refreshPicker()">' +
    '<button class="btn" onclick="R.closePicker();R.showScreen(\'settings\');R.flash(\'Create it under My exercises, then add it here\')">＋ Create a new exercise</button>' +
    groups.map(function(g){
      return '<h3>' + g.label + '</h3>' + g.items.map(function(e){
        var meta = e.sets + ' sets · ' + e.lo + '-' + e.hi + (e.type === 'iso' ? 's' : (e.type === 'time' ? ' min' : ' reps'));
        return '<div class="pick-row"><div class="pick-info"><div class="pick-name">' + R.esc(e.n) + '</div><div class="pick-meta">' + meta + '</div></div>' +
          '<button class="btn mini" onclick="R.pickAdd(\'' + e.id + '\', false)">Add</button>' +
          '<button class="btn mini pin" onclick="R.pickAdd(\'' + e.id + '\', true)">📌 Pin</button></div>';
      }).join('');
    }).join('');
  var el = document.getElementById('expicker');
  if (!el) { el = document.createElement('div'); el.id = 'expicker'; document.body.appendChild(el); }
  el.innerHTML = '<div class="picker-inner2">' + html + '</div>';
};
R.refreshPicker = function(){
  if (!document.getElementById('expicker')) return; // only refresh when it's actually open
  var el = document.getElementById('picker-q');
  var pos = el ? el.selectionStart : 0;
  R.showPicker();
  var el2 = document.getElementById('picker-q');
  if (el2) { el2.focus(); el2.setSelectionRange(pos, pos); }
};
R.closePicker = function(){
  var el = document.getElementById('expicker');
  if (el) el.remove();
  R._pickerQ = '';
};
R.pickAdd = function(id, pin){
  var e = R.getEx(id);
  if (!e) return;
  var w = R.S.workouts[R.today()];
  if (!w) return;
  w.exercises.push(R.buildExercise(e, {}));
  if (pin) {
    var key = R.pinKeyToday();
    if (!R.S.pins[key]) R.S.pins[key] = [];
    if (R.S.pins[key].indexOf(id) < 0) R.S.pins[key].push(id);
  }
  R.save();
  R.renderWorkout();
  R.refreshPicker();
  R.flash(e.n + (pin ? ' — pinned to every ' + R.dayLabel() : ' added'));
};
R.unpin = function(key, id){
  R.S.pins[key] = (R.S.pins[key] || []).filter(function(x){ return x !== id; });
  if (!R.S.pins[key].length) delete R.S.pins[key];
  R.save();
  R.renderSettings();
};

// ---- manual builder ----
R.startManual = function(){
  var d = R.today();
  var wd = R.weekday(d);
  var loc = R.isJulia() ? (R.S.prefs.equip === 'bw' ? 'bw' : 'home') : (R.S.schedule.homeDays.indexOf(wd) >= 0 ? 'home' : 'gym');
  R.S.workouts[d] = {
    date: d, focus: 'Custom Workout', loc: loc, ball: false,
    rot: R.isJulia() ? (R.juliaCompletedCount() % 3) : undefined,
    checkin: {energy:3, sore:{}}, notes: [],
    warmup: R.isJulia() ? ['Easy movement — 3 min','360 breathing — 5 slow breaths'] : R.warmupFor(wd, loc),
    cooldown: R.isJulia() ? ['Stretch anything that worked — 2 min'] : R.cooldownFor(wd),
    exercises: [], completed: false, rating: null, pain: []
  };
  R.save();
  R.renderWorkout();
  R.showPicker();
};

// ---- templates ----
R.saveTemplate = function(){
  var w = R.S.workouts[R.today()];
  if (!w || !w.exercises.length) { R.flash('Nothing to save yet'); return; }
  var name = prompt('Template name:', w.focus === 'Custom Workout' ? 'My Workout' : w.focus);
  if (!name) return;
  R.S.templates.push({ id: 'tp' + Date.now(), name: name.trim(),
    items: w.exercises.map(function(ex){ return {id: ex.id, sets: ex.sets.length}; }) });
  R.save();
  R.flash('Template saved 📋');
};
R.loadTemplate = function(tid){
  var t = R.S.templates.find(function(x){ return x.id === tid; });
  if (!t) return;
  var d = R.today();
  R.startManual();
  var w = R.S.workouts[d];
  w.focus = t.name;
  t.items.forEach(function(it){
    var e = R.getEx(it.id);
    if (!e) return; // exercise deleted since template was saved
    var ex = R.buildExercise(e, {});
    while (ex.sets.length > it.sets) ex.sets.pop();
    while (ex.sets.length < it.sets) ex.sets.push({reps:'', weight: ex.suggestW || '', done:false});
    w.exercises.push(ex);
  });
  R.closePicker();
  R.save();
  R.renderWorkout();
};
R.deleteTemplate = function(tid){
  if (!confirm('Delete this template?')) return;
  R.S.templates = R.S.templates.filter(function(t){ return t.id !== tid; });
  R.save();
  R.renderWorkout();
};
// start-screen block: manual build + saved templates
R.builderLinksHtml = function(){
  var tpl = R.S.templates.map(function(t){
    return '<div class="entry-row"><span class="e-name">📋 ' + R.esc(t.name) + '</span>' +
      '<span class="e-g">' + t.items.length + ' exercises</span>' +
      '<button class="btn mini" onclick="R.loadTemplate(\'' + t.id + '\')">Load</button>' +
      '<button class="e-del" onclick="R.deleteTemplate(\'' + t.id + '\')">×</button></div>';
  }).join('');
  return '<button class="btn ghost" onclick="R.startManual()">🛠 Build my own workout</button>' + tpl;
};

// ---- custom exercise creator (lives in Settings) ----
R.customExCard = function(){
  if (R._cxEditing !== undefined) return R.cxFormHtml(R._cxEditing);
  var rows = R.S.customEx.map(function(e){
    var tag = e.gen ? ' · in generator' : ' · manual add';
    return '<div class="entry-row"><span class="e-name">' + R.esc(e.n) + '</span>' +
      '<span class="e-g">' + e.sets + '×' + e.lo + '-' + e.hi + tag + '</span>' +
      '<button class="e-del" onclick="R.cxEdit(\'' + e.id + '\')">✎</button>' +
      '<button class="e-del" onclick="R.cxDelete(\'' + e.id + '\')">×</button></div>';
  }).join('');
  return '<div class="card"><h3>My exercises</h3>' + (rows || '<p class="hint">Build your own moves — they show up in the add-exercise picker, track weight progression, and can join the generator\'s rotation.</p>') +
    '<button class="btn" onclick="R.cxEdit(null)">＋ New exercise</button></div>';
};
R.cxEdit = function(id){ R._cxEditing = id; R.renderSettings(); };
R.cxFormHtml = function(id){
  var e = id ? R.S.customEx.find(function(x){ return x.id === id; })
             : {n:'', type:'bw', sets:3, lo:8, hi:12, rest:60, note:'', gen:false, tags:[]};
  var dayChips;
  if (R.isJulia()) {
    dayChips = [['r0','Full Body A'],['r1','Full Body B'],['r2','Full Body C']].map(function(c){
      return '<button class="chip' + ((e.tags || []).indexOf(c[0]) >= 0 ? ' on' : '') + '" data-cxtag="' + c[0] + '" onclick="this.classList.toggle(\'on\')">' + c[1] + '</button>';
    }).join('');
  } else {
    dayChips = [['1','Mon'],['2','Tue'],['3','Wed'],['4','Thu'],['5','Fri'],['6','Sat'],['0','Sun']].map(function(c){
      return '<button class="chip' + ((e.tags || []).indexOf(c[0]) >= 0 ? ' on' : '') + '" data-cxtag="' + c[0] + '" onclick="this.classList.toggle(\'on\')">' + c[1] + '</button>';
    }).join('');
  }
  return '<div class="card form"><h3>' + (id ? 'Edit exercise' : 'New exercise') + '</h3>' +
    '<label>Name<input id="cx-name" type="text" value="' + R.esc(e.n) + '"></label>' +
    '<h3>Measured in</h3><div class="chip-row">' +
      '<button class="chip cx-type' + (e.type !== 'iso' ? ' on' : '') + '" data-cxtype="bw" onclick="R.cxType(this)">Reps</button>' +
      '<button class="chip cx-type' + (e.type === 'iso' ? ' on' : '') + '" data-cxtype="iso" onclick="R.cxType(this)">Seconds (hold)</button></div>' +
    '<div class="row2"><label>Sets<input id="cx-sets" type="number" inputmode="numeric" value="' + e.sets + '"></label>' +
    '<label>Rest (sec)<input id="cx-rest" type="number" inputmode="numeric" value="' + e.rest + '"></label></div>' +
    '<div class="row2"><label>Target from<input id="cx-lo" type="number" inputmode="numeric" value="' + e.lo + '"></label>' +
    '<label>to<input id="cx-hi" type="number" inputmode="numeric" value="' + e.hi + '"></label></div>' +
    '<label>Notes (form cues)<input id="cx-note" type="text" value="' + R.esc(e.note || '') + '"></label>' +
    '<label class="check"><input id="cx-gen" type="checkbox" ' + (e.gen ? 'checked' : '') + '> Generator includes it automatically</label>' +
    '<h3>On these days</h3><div class="chip-row">' + dayChips + '</div>' +
    '<button class="btn primary" onclick="R.cxSave(' + (id ? '\'' + id + '\'' : 'null') + ')">Save exercise</button>' +
    '<button class="btn ghost" onclick="R.cxEdit(undefined)">Cancel</button></div>';
};
R.cxType = function(btn){
  document.querySelectorAll('.cx-type').forEach(function(b){ b.classList.remove('on'); });
  btn.classList.add('on');
};
R.cxSave = function(id){
  var name = document.getElementById('cx-name').value.trim();
  if (!name) { R.flash('Give it a name'); return; }
  var type = document.querySelector('.cx-type.on').getAttribute('data-cxtype');
  var tags = [];
  document.querySelectorAll('[data-cxtag].on').forEach(function(b){ tags.push(b.getAttribute('data-cxtag')); });
  var obj = {
    id: id || ('cx' + Date.now()),
    n: name, pat: 'custom', type: type === 'iso' ? 'iso' : 'w',
    sets: Math.max(1, parseInt(document.getElementById('cx-sets').value, 10) || 3),
    lo: parseInt(document.getElementById('cx-lo').value, 10) || 8,
    hi: parseInt(document.getElementById('cx-hi').value, 10) || 12,
    rest: parseInt(document.getElementById('cx-rest').value, 10) || 60,
    note: document.getElementById('cx-note').value.trim(),
    gen: document.getElementById('cx-gen').checked,
    tags: tags
  };
  if (id) {
    var idx = R.S.customEx.findIndex(function(x){ return x.id === id; });
    R.S.customEx[idx] = obj;
  } else R.S.customEx.push(obj);
  R._cxEditing = undefined;
  R.save();
  R.renderSettings();
  R.flash('Saved — find it in the add-exercise picker');
};
R.cxDelete = function(id){
  if (!confirm('Delete this exercise? Past workout history keeps its logged sets.')) return;
  R.S.customEx = R.S.customEx.filter(function(x){ return x.id !== id; });
  Object.keys(R.S.pins).forEach(function(k){ R.S.pins[k] = R.S.pins[k].filter(function(x){ return x !== id; }); });
  R._cxEditing = undefined;
  R.save();
  R.renderSettings();
};

// pinned-exercises card for Settings
R.pinsCard = function(){
  var keys = Object.keys(R.S.pins).filter(function(k){ return R.S.pins[k].length; });
  if (!keys.length) return '';
  var labels = R.isJulia()
    ? {r0:'Full Body A', r1:'Full Body B', r2:'Full Body C'}
    : {0:'Sunday',1:'Monday',2:'Tuesday',3:'Wednesday',4:'Thursday',5:'Friday',6:'Saturday'};
  return '<div class="card"><h3>Pinned exercises</h3>' +
    keys.map(function(k){
      return R.S.pins[k].map(function(id){
        var e = R.getEx(id);
        return '<div class="entry-row"><span class="e-name">' + R.esc(e ? e.n : id) + '</span>' +
          '<span class="e-g">every ' + (labels[k] || k) + '</span>' +
          '<button class="e-del" onclick="R.unpin(\'' + k + '\',\'' + id + '\')">×</button></div>';
      }).join('');
    }).join('') +
    '<p class="hint">Pinned = always included in that day\'s generated workout.</p></div>';
};

window.R = R;
