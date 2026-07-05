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
  var pt = R.proteinToday();
  var goal = R.S.targets.protein;
  var left = Math.max(0, goal - pt.protein);
  var dayName = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][wd];
  var status = !w ? 'Tap to start' : (w.completed ? 'Done ✅' : 'In progress — tap to continue');

  if (R.isJulia()) {
    var wk = R.weekCount();
    document.getElementById('screen-dash').innerHTML =
      '<p class="date-line">' + dayName + ' · hey Julia 🌱</p>' +
      '<div class="dash-grid">' +
        '<button class="card dash-card" onclick="R.showScreen(\'workout\')">' +
          '<div class="dc-label">Next up</div>' +
          '<div class="dc-title">' + R.juliaNextFocus() + '</div>' +
          '<div class="dc-status' + (w && w.completed ? ' good' : '') + '">' + status + '</div>' +
        '</button>' +
        '<button class="card dash-card center" onclick="R.showScreen(\'protein\')">' +
          R.ring(goal ? pt.protein / goal : 0, pt.protein + 'g', left > 0 ? left + 'g left' : 'goal hit!') +
        '</button>' +
      '</div>' +
      '<div class="card streak-card">' +
        '<span class="streak-fire">💪</span><span class="streak-n">' + wk + '</span> workout' + (wk === 1 ? '' : 's') + ' this week' +
        '<span class="streak-goal">· aim for 2–3</span>' +
      '</div>' +
      '<button class="btn primary big" onclick="R.showScreen(\'protein\')">+ Log protein</button>';
    return;
  }

  var t = w ? {focus: w.focus, ball: w.ball} : R.dayTemplate(wd);
  var streak = R.streak();
  var loc = R.S.schedule.homeDays.indexOf(wd) >= 0 ? '🏠 Home' : '🏋️ Gym';

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

// first-launch profile picker (only ever seen on a device with no profile yet)
R.renderPicker = function(){
  var div = document.createElement('div');
  div.id = 'picker';
  div.innerHTML =
    '<div class="picker-inner">' +
      '<span class="logo big-logo">RE<span class="accent">BOUND</span></span>' +
      '<h2>Who\'s training on this phone?</h2>' +
      '<button class="btn primary big" onclick="R.pickProfile(\'eric\')">🏀 Eric</button>' +
      '<button class="btn primary big julia" onclick="R.pickProfile(\'julia\')">🌱 Julia</button>' +
      '<p class="hint center">This phone remembers your choice. Each profile\'s data stays only on its own phone.</p>' +
    '</div>';
  document.body.appendChild(div);
};
R.pickProfile = function(mode){
  R.setProfile(mode);
  var el = document.getElementById('picker');
  if (el) el.remove();
  R.showScreen('dash');
  R.flash(mode === 'julia' ? 'Welcome, Julia 🌱' : 'Welcome back, Eric 🏀');
};

// boot
document.addEventListener('DOMContentLoaded', function(){
  R.S = R.load();
  document.querySelectorAll('[data-nav]').forEach(function(btn){
    btn.addEventListener('click', function(){ R.showScreen(btn.getAttribute('data-nav')); });
  });
  if (!R.S) {
    R.renderPicker();
  } else {
    R.refreshTargets();
    R.save();
    R.showScreen('dash');
  }
  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    navigator.serviceWorker.register('sw.js').catch(function(){});
  }
});

window.R = R;
