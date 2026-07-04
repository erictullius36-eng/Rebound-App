// Rebound app shell: boot, navigation, dashboard.
var R = window.R || {};

R.showScreen = function(name){
  ['dash','workout','protein','history','settings'].forEach(function(s){
    document.getElementById('screen-' + s).classList.toggle('active', s === name);
    var nav = document.querySelector('[data-nav="' + s + '"]');
    if (nav) nav.classList.toggle('on', s === name);
  });
  if (name === 'dash') R.renderDash();
  if (name === 'workout') R.renderWorkout();
  if (name === 'protein') R.renderProtein();
  if (name === 'history') R.renderHistory();
  if (name === 'settings') R.renderSettings();
  window.scrollTo(0, 0);
};

R.flash = function(msg){
  var el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(R._toastT);
  R._toastT = setTimeout(function(){ el.classList.remove('show'); }, 1800);
};

R.ring = function(pct, big, small){
  var r = 52, c = 2 * Math.PI * r;
  var off = c * (1 - Math.min(1, pct));
  return '<svg viewBox="0 0 120 120" class="ring">' +
    '<circle cx="60" cy="60" r="' + r + '" class="ring-bg"/>' +
    '<circle cx="60" cy="60" r="' + r + '" class="ring-fg" stroke-dasharray="' + c + '" stroke-dashoffset="' + off + '" transform="rotate(-90 60 60)"/>' +
    '<text x="60" y="58" class="ring-big">' + big + '</text>' +
    '<text x="60" y="76" class="ring-small">' + small + '</text>' +
    '</svg>';
};

R.renderDash = function(){
  var d = R.today();
  var wd = R.weekday(d);
  var w = R.S.workouts[d];
  var t = w ? {focus: w.focus, ball: w.ball} : R.dayTemplate(wd);
  var pt = R.proteinToday();
  var goal = R.S.targets.protein;
  var left = Math.max(0, goal - pt.protein);
  var streak = R.streak();
  var dayName = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][wd];
  var loc = R.S.schedule.homeDays.indexOf(wd) >= 0 ? '🏠 Home' : '🏋️ Gym';
  var status = !w ? 'Tap to start' : (w.completed ? 'Done ✅' : 'In progress — tap to continue');

  document.getElementById('screen-dash').innerHTML =
    '<p class="date-line">' + dayName + (t.ball ? ' · 🏀 ball tonight' : '') + '</p>' +
    '<div class="dash-grid">' +
      '<button class="card dash-card" onclick="R.showScreen(\'workout\')">' +
        '<div class="dc-label">' + loc + ' · Today</div>' +
        '<div class="dc-title">' + t.focus + '</div>' +
        '<div class="dc-status' + (w && w.completed ? ' good' : '') + '">' + status + '</div>' +
      '</button>' +
      '<button class="card dash-card center" onclick="R.showScreen(\'protein\')">' +
        R.ring(goal ? pt.protein / goal : 0, pt.protein + 'g', left > 0 ? left + 'g left' : 'goal hit!') +
      '</button>' +
    '</div>' +
    '<div class="card streak-card">' +
      '<span class="streak-fire">🔥</span><span class="streak-n">' + streak + '</span> day streak' +
      '<span class="streak-goal">' + p2goal(pt.protein, goal) + '</span>' +
    '</div>' +
    '<button class="btn primary big" onclick="R.showScreen(\'protein\')">+ Log protein</button>';

  function p2goal(cur, g){
    if (cur >= g) return '· protein ✓';
    return '· ' + Math.round(cur / g * 100) + '% protein';
  }
};

// boot
document.addEventListener('DOMContentLoaded', function(){
  R.S = R.load();
  R.refreshTargets();
  R.save();
  document.querySelectorAll('[data-nav]').forEach(function(btn){
    btn.addEventListener('click', function(){ R.showScreen(btn.getAttribute('data-nav')); });
  });
  R.showScreen('dash');
  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    navigator.serviceWorker.register('sw.js').catch(function(){});
  }
});

window.R = R;
