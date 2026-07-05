// Rebound history: daily list, weekly summary, 30-day success meter.
var R = window.R || {};

R.renderHistory = function(){
  var today = R.today();
  var goal = R.S.targets.protein;

  // weekly summary (last 7 days incl. today)
  var wDone = 0, pHit = 0, pSum = 0, pDays = 0;
  for (var i = 0; i < 7; i++) {
    var d = R.addDays(today, -i);
    var w = R.S.workouts[d];
    if (w && w.completed) wDone++;
    var pt = R.proteinToday(d);
    if (pt.entries.length) { pDays++; pSum += pt.protein; }
    if (pt.protein >= goal) pHit++;
  }

  // 30-day success rate vs the 80% bar
  var days30 = 0, success30 = 0;
  for (var j = 0; j < 30; j++) {
    var d3 = R.addDays(today, -j);
    var w3 = R.S.workouts[d3];
    var p3 = R.proteinToday(d3);
    var any = (w3 && w3.completed) || p3.entries.length;
    if (!any && j > 0) continue; // don't count days before you started using the app
    days30++;
    // Julia trains 2-3x/week, so her success metric is protein; Eric's is workout + protein
    if (R.isJulia() ? p3.protein >= goal : ((w3 && w3.completed) && p3.protein >= goal)) success30++;
  }
  var rate = days30 ? Math.round(success30 / days30 * 100) : 0;

  // daily rows, last 30 days
  var rows = '';
  for (var k = 0; k < 30; k++) {
    var dk = R.addDays(today, -k);
    var wk = R.S.workouts[dk];
    var pk = R.proteinToday(dk);
    if (!wk && !pk.entries.length) continue;
    var wd = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][R.weekday(dk)];
    rows += '<div class="entry-row">' +
      '<span class="e-time">' + wd + ' ' + dk.slice(5) + '</span>' +
      '<span class="e-name">' + (wk ? (wk.completed ? '✅ ' : '◻️ ') + R.esc(wk.focus) : '—') + '</span>' +
      '<span class="e-g ' + (pk.protein >= goal ? 'good' : '') + '">' + pk.protein + 'g</span>' +
      '</div>';
  }
  if (!rows) rows = '<p class="hint">History shows up here once you log workouts and protein.</p>';

  document.getElementById('screen-history').innerHTML =
    '<div class="card">' +
      '<h3>This week</h3>' +
      '<div class="stat-row">' +
        '<div class="stat"><div class="stat-n">' + wDone + '<span class="stat-d">/7</span></div><div class="stat-l">workouts</div></div>' +
        '<div class="stat"><div class="stat-n">' + pHit + '<span class="stat-d">/7</span></div><div class="stat-l">protein days</div></div>' +
        '<div class="stat"><div class="stat-n">' + (pDays ? Math.round(pSum / pDays) : 0) + '<span class="stat-d">g</span></div><div class="stat-l">avg protein</div></div>' +
      '</div>' +
    '</div>' +
    '<div class="card">' +
      '<h3>30-day success rate <span class="hint-inline">(goal: 80%)</span></h3>' +
      '<div class="bar tall"><div class="bar-fill' + (rate >= 80 ? ' good' : '') + '" style="width:' + rate + '%"></div>' +
      '<span class="bar-marker" style="left:80%"></span></div>' +
      '<p class="hint">' + rate + '% of active days you ' + (R.isJulia() ? 'hit your protein target.' : 'finished the workout AND hit protein.') + '</p>' +
    '</div>' +
    '<h3>Day by day</h3>' + rows +
    '<div class="card">' +
      '<h3>Export</h3>' +
      '<button class="btn" onclick="R.exportWorkoutCSV()">⬇︎ Workouts CSV</button>' +
      '<button class="btn" onclick="R.exportProteinCSV()">⬇︎ Protein CSV</button>' +
    '</div>';
};

window.R = R;
