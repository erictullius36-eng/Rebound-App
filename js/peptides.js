// Rebound peptide & injection-site tracker.
// Pure logging: what, when, how much (user's own label), where. Never suggests doses.
// Data lives in S.peptides (definitions) and S.pepLog (date -> entries), per profile, local-only.
var R = window.R || {};

R.pepDefaults = function(){
  var stomach = ['Stomach — upper L','Stomach — upper R','Stomach — lower L','Stomach — lower R'];
  return [
    {id:'pep1', name:'Reta', dose:'.75', days:[0,3], sites:stomach.slice(), shots:1, start:null, end:null},
    {id:'pep2', name:'Tesa', dose:'20', days:[1,2,3,4,5], sites:['Left glute','Right glute'], shots:1, start:null, end:null},
    {id:'pep3', name:'BPC-157 / TB-500', dose:'20', days:[0,1,2,3,4], sites:['Right knee','Lower back'], shots:2, start:null, end:null},
    {id:'pep4', name:'MOTS-c', dose:'30', days:[2,5], sites:stomach.slice(), shots:1, start:null, end:null}
  ];
};

R.pepActive = function(p, dateStr){
  return (!p.start || p.start <= dateStr) && (!p.end || p.end >= dateStr);
};
R.pepDueToday = function(p, dateStr){
  return R.pepActive(p, dateStr) && p.days.indexOf(R.weekday(dateStr)) >= 0;
};
R.pepLogsOn = function(dateStr){ return R.S.pepLog[dateStr] || []; };
R.pepShotsToday = function(pid, dateStr){
  return R.pepLogsOn(dateStr).filter(function(e){ return e.pid === pid; }).length;
};
// days since this peptide (or peptide+site) was last injected; null if never
R.pepDaysSince = function(pid, site){
  var dates = Object.keys(R.S.pepLog).sort().reverse();
  for (var i = 0; i < dates.length; i++) {
    var hit = R.S.pepLog[dates[i]].some(function(e){ return e.pid === pid && (!site || e.site === site); });
    if (hit) {
      var diff = Math.round((new Date(R.today()) - new Date(dates[i])) / 86400000);
      return diff;
    }
  }
  return null;
};
R.pepWeekTotal = function(pid){
  var n = 0;
  for (var i = 0; i < 7; i++) n += R.pepShotsToday(pid, R.addDays(R.today(), -i));
  return n;
};
R.pepCycleInfo = function(p){
  var bits = [];
  if (p.start && p.start <= R.today()) {
    bits.push('day ' + (Math.round((new Date(R.today()) - new Date(p.start)) / 86400000) + 1));
  } else if (p.start) bits.push('starts ' + p.start.slice(5));
  if (p.end && p.end >= R.today()) {
    var left = Math.round((new Date(p.end) - new Date(R.today())) / 86400000);
    bits.push(left === 0 ? 'last day' : 'ends in ' + left + 'd');
  }
  return bits.join(' · ');
};

R.logShot = function(pid, site){
  var p = R.S.peptides.find(function(x){ return x.id === pid; });
  if (!p) return;
  var d = R.today();
  if (!R.S.pepLog[d]) R.S.pepLog[d] = [];
  var now = new Date();
  R.S.pepLog[d].push({ pid: pid, name: p.name, dose: p.dose, site: site,
    t: String(now.getHours()).padStart(2,'0') + ':' + String(now.getMinutes()).padStart(2,'0') });
  R.save();
  R.renderPeptides();
  R.flash(p.name + ' → ' + site + ' ✓');
};
R.deleteShot = function(dateStr, idx){
  R.S.pepLog[dateStr].splice(idx, 1);
  if (!R.S.pepLog[dateStr].length) delete R.S.pepLog[dateStr];
  R.save();
  R.renderPeptides();
};

// ---- rendering ----
R.pepCard = function(p, due){
  var d = R.today();
  var logged = R.pepShotsToday(p.id, d);
  var remaining = due ? Math.max(0, p.shots - logged) : 0;
  var since = R.pepDaysSince(p.id);
  var cycle = R.pepCycleInfo(p);
  var meta = [p.dose && ('dose ' + p.dose), cycle,
    since === null ? 'never logged' : (since === 0 ? 'logged today' : 'last: ' + since + 'd ago'),
    R.pepWeekTotal(p.id) + ' this week'].filter(Boolean).join(' · ');
  var sitesHtml = '';
  if (due && remaining > 0) {
    sitesHtml = '<div class="chip-row">' + p.sites.map(function(s){
      var ss = R.pepDaysSince(p.id, s);
      var fresh = ss === null ? 'never' : (ss === 0 ? 'today' : ss + 'd ago');
      var usedToday = R.pepLogsOn(d).some(function(e){ return e.pid === p.id && e.site === s; });
      return '<button class="chip site' + (usedToday ? ' on' : '') + '" onclick="R.logShot(\'' + p.id + '\',\'' + R.esc(s).replace(/'/g,"\\'") + '\')">' +
        R.esc(s) + '<span class="site-age">' + fresh + '</span></button>';
    }).join('') + '</div>' +
    '<p class="hint">' + (p.shots > 1 ? remaining + ' of ' + p.shots + ' injections left today — tap each site.' : 'Tap the site you used. Oldest date = freshest spot.') + '</p>';
  } else if (due) {
    sitesHtml = '<p class="pep-done">✓ Done for today</p>';
  }
  return '<div class="card pep-card' + (due && remaining > 0 ? ' due' : '') + '">' +
    '<div class="ex-head"><div><div class="ex-name">' + R.esc(p.name) + '</div>' +
    '<div class="ex-meta">' + meta + '</div></div>' +
    '<button class="swap" onclick="R.pepEdit(\'' + p.id + '\')" title="Edit">✎</button></div>' +
    sitesHtml + '</div>';
};

R.renderPeptides = function(){
  var d = R.today();
  var el = document.getElementById('screen-peptides');
  if (R._pepEditing !== undefined) { el.innerHTML = R.pepFormHtml(R._pepEditing); return; }
  var due = [], rest = [], inactive = [];
  R.S.peptides.forEach(function(p){
    if (!R.pepActive(p, d)) inactive.push(p);
    else if (R.pepDueToday(p, d)) due.push(p);
    else rest.push(p);
  });
  var html = '';
  if (!R.S.peptides.length) {
    html = '<div class="card"><h2>Peptide tracker</h2>' +
      '<p class="hint">Log what you take, how much, and where — so rotation is never a guess. Everything stays on this phone only.</p></div>';
  } else {
    html += '<h3>Due today · ' + ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][R.weekday(d)] + '</h3>';
    html += due.length ? due.map(function(p){ return R.pepCard(p, true); }).join('')
                       : '<p class="hint">Nothing scheduled today.</p>';
    if (rest.length) html += '<h3>Not due today</h3>' + rest.map(function(p){ return R.pepCard(p, false); }).join('');
    if (inactive.length) html += '<h3>Inactive (outside cycle dates)</h3>' + inactive.map(function(p){ return R.pepCard(p, false); }).join('');
  }
  html += '<button class="btn" onclick="R.pepEdit(null)">+ Add a peptide</button>';

  // recent history
  var dates = Object.keys(R.S.pepLog).sort().reverse().slice(0, 14);
  if (dates.length) {
    html += '<h3>Recent injections</h3>' + dates.map(function(dt){
      return R.S.pepLog[dt].map(function(e, i){
        return '<div class="entry-row"><span class="e-time">' + dt.slice(5) + ' ' + e.t + '</span>' +
          '<span class="e-name">' + R.esc(e.name) + ' · ' + R.esc(e.dose) + '</span>' +
          '<span class="e-g">' + R.esc(e.site) + '</span>' +
          '<button class="e-del" onclick="R.deleteShot(\'' + dt + '\',' + i + ')" aria-label="delete">×</button></div>';
      }).join('');
    }).join('');
    html += '<button class="btn" onclick="R.exportPeptideCSV()">⬇︎ Peptide CSV</button>';
  }
  el.innerHTML = html;
};

// ---- add / edit form ----
R.pepEdit = function(pid){ R._pepEditing = pid; R.renderPeptides(); };
R.pepFormHtml = function(pid){
  var p = pid ? R.S.peptides.find(function(x){ return x.id === pid; }) : {name:'', dose:'', days:[], sites:[], shots:1, start:null, end:null};
  var dayChips = ['S','M','T','W','T','F','S'].map(function(lbl, i){
    return '<button class="chip' + (p.days.indexOf(i) >= 0 ? ' on' : '') + '" data-pday="' + i + '" onclick="this.classList.toggle(\'on\')">' + lbl + '</button>';
  }).join('');
  return '<div class="card form">' +
    '<h2>' + (pid ? 'Edit ' + R.esc(p.name) : 'Add a peptide') + '</h2>' +
    '<label>Name<input id="pep-name" type="text" value="' + R.esc(p.name) + '"></label>' +
    '<label>Dose label (whatever you call it — e.g. "20", ".75")<input id="pep-dose" type="text" value="' + R.esc(p.dose) + '"></label>' +
    '<label>Injections per scheduled day<input id="pep-shots" type="number" inputmode="numeric" value="' + p.shots + '"></label>' +
    '<h3>Days</h3><div class="chip-row">' + dayChips + '</div>' +
    '<label>Sites (comma-separated)<input id="pep-sites" type="text" value="' + R.esc(p.sites.join(', ')) + '" placeholder="e.g. Left glute, Right glute"></label>' +
    '<div class="row2">' +
      '<label>Start date<input id="pep-start" type="date" value="' + (p.start || '') + '"></label>' +
      '<label>End date<input id="pep-end" type="date" value="' + (p.end || '') + '"></label>' +
    '</div>' +
    '<p class="hint">Leave dates blank for an open-ended run. Past the end date it moves to Inactive (history kept) — set new dates to start the next cycle.</p>' +
    '<button class="btn primary" onclick="R.pepSave(' + (pid ? '\'' + pid + '\'' : 'null') + ')">Save</button>' +
    (pid ? '<button class="btn danger" onclick="R.pepDelete(\'' + pid + '\')">Delete peptide (history kept)</button>' : '') +
    '<button class="btn ghost" onclick="R.pepEdit(undefined)">Cancel</button>' +
    '</div>';
};
R.pepSave = function(pid){
  var name = document.getElementById('pep-name').value.trim();
  if (!name) { R.flash('Give it a name'); return; }
  var days = [];
  document.querySelectorAll('[data-pday].on').forEach(function(b){ days.push(parseInt(b.getAttribute('data-pday'), 10)); });
  var sites = document.getElementById('pep-sites').value.split(',').map(function(s){ return s.trim(); }).filter(Boolean);
  var obj = {
    id: pid || ('pep' + Date.now()),
    name: name,
    dose: document.getElementById('pep-dose').value.trim(),
    shots: Math.max(1, parseInt(document.getElementById('pep-shots').value, 10) || 1),
    days: days,
    sites: sites.length ? sites : ['Default site'],
    start: document.getElementById('pep-start').value || null,
    end: document.getElementById('pep-end').value || null
  };
  if (pid) {
    var idx = R.S.peptides.findIndex(function(x){ return x.id === pid; });
    R.S.peptides[idx] = obj;
  } else R.S.peptides.push(obj);
  R._pepEditing = undefined;
  R.save();
  R.renderPeptides();
  R.flash('Saved');
};
R.pepDelete = function(pid){
  if (!confirm('Remove this peptide from your list? Past injections stay in history.')) return;
  R.S.peptides = R.S.peptides.filter(function(x){ return x.id !== pid; });
  R._pepEditing = undefined;
  R.save();
  R.renderPeptides();
};

R.exportPeptideCSV = function(){
  var rows = ['date,time,peptide,dose,site'];
  Object.keys(R.S.pepLog).sort().forEach(function(dt){
    R.S.pepLog[dt].forEach(function(e){
      rows.push([dt, e.t, R.csvCell(e.name), R.csvCell(e.dose), R.csvCell(e.site)].join(','));
    });
  });
  R.download('rebound-' + R.S.mode + '-peptides-' + R.today() + '.csv', rows.join('\n'), 'text/csv');
};

window.R = R;
