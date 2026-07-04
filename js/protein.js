// Rebound protein tracking UI + logic.
var R = window.R || {};

R.esc = function(s){
  return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
  });
};

R.logProtein = function(name, protein, cal){
  var d = R.today();
  if (!R.S.proteinLog[d]) R.S.proteinLog[d] = [];
  var now = new Date();
  R.S.proteinLog[d].push({
    name: name, protein: Math.round(protein * 10) / 10, cal: Math.round(cal || 0),
    t: String(now.getHours()).padStart(2,'0') + ':' + String(now.getMinutes()).padStart(2,'0')
  });
  R.save();
};

R.quickAdd = function(foodId){
  var f = R.S.foods.find(function(x){ return x.id === foodId; });
  if (!f) return;
  R.logProtein(f.name, f.protein, f.cal);
  R.renderProtein();
  R.flash('+' + f.protein + 'g — ' + f.name);
};

R.deleteEntry = function(idx){
  var d = R.today();
  R.S.proteinLog[d].splice(idx, 1);
  R.save();
  R.renderProtein();
};

R.submitCustomFood = function(){
  var name = document.getElementById('pf-name').value.trim() || 'Food';
  var protein = parseFloat(document.getElementById('pf-protein').value);
  var cal = parseFloat(document.getElementById('pf-cal').value) || 0;
  if (isNaN(protein) || protein < 0) { R.flash('Enter protein grams'); return; }
  var saveIt = document.getElementById('pf-save').checked;
  if (saveIt) {
    R.S.foods.push({ id: 'f' + Date.now(), name: name, protein: protein, cal: cal, quick: true });
  }
  R.logProtein(name, protein, cal);
  R.renderProtein();
  R.flash('+' + protein + 'g logged');
};

R.deleteFood = function(foodId){
  R.S.foods = R.S.foods.filter(function(f){ return f.id !== foodId; });
  R.save();
  R.renderProtein();
};

R.renderProtein = function(){
  var t = R.proteinToday();
  var goal = R.S.targets.protein;
  var left = Math.max(0, goal - t.protein);
  var pct = goal ? Math.min(100, Math.round(t.protein / goal * 100)) : 0;

  var quick = R.S.foods.filter(function(f){ return f.quick; });
  var quickHtml = quick.length
    ? '<div class="quick-grid">' + quick.map(function(f){
        return '<button class="quick-btn" onclick="R.quickAdd(\'' + f.id + '\')">' +
          '<span class="qb-name">' + R.esc(f.name) + '</span><span class="qb-g">' + f.protein + 'g</span></button>';
      }).join('') + '</div>'
    : '<p class="hint">No quick-add foods yet. Log something below and check “save” — it becomes a one-tap button here.</p>';

  var entries = t.entries.length
    ? t.entries.map(function(e, i){
        return '<div class="entry-row"><span class="e-time">' + e.t + '</span><span class="e-name">' + R.esc(e.name) + '</span>' +
          '<span class="e-g">' + e.protein + 'g</span>' +
          '<button class="e-del" onclick="R.deleteEntry(' + i + ')" aria-label="delete">×</button></div>';
      }).join('')
    : '<p class="hint">Nothing logged today yet.</p>';

  var manage = quick.length
    ? '<details class="manage"><summary>Manage saved foods</summary>' + quick.map(function(f){
        return '<div class="entry-row"><span class="e-name">' + R.esc(f.name) + '</span><span class="e-g">' + f.protein + 'g / ' + (f.cal || 0) + ' cal</span>' +
          '<button class="e-del" onclick="R.deleteFood(\'' + f.id + '\')" aria-label="remove">×</button></div>';
      }).join('') + '</details>'
    : '';

  document.getElementById('screen-protein').innerHTML =
    '<div class="p-head card">' +
      '<div class="p-big"><span class="p-num">' + t.protein + '</span><span class="p-unit">/ ' + goal + 'g</span></div>' +
      '<div class="bar"><div class="bar-fill" style="width:' + pct + '%"></div></div>' +
      '<div class="p-sub">' + (left > 0 ? left + 'g to go' : 'Goal hit 💪') + ' · ' + t.cal + ' / ' + R.S.targets.calories + ' cal</div>' +
    '</div>' +
    '<h3>Quick add</h3>' + quickHtml +
    '<h3>Add food</h3>' +
    '<div class="card form">' +
      '<input id="pf-name" type="text" placeholder="Food name" autocomplete="off">' +
      '<div class="row2">' +
        '<input id="pf-protein" type="number" inputmode="decimal" placeholder="Protein (g)">' +
        '<input id="pf-cal" type="number" inputmode="numeric" placeholder="Calories (opt.)">' +
      '</div>' +
      '<label class="check"><input id="pf-save" type="checkbox" checked> Save as quick-add button</label>' +
      '<button class="btn primary" onclick="R.submitCustomFood()">Log it</button>' +
    '</div>' +
    '<h3>Today</h3>' + entries + manage;
};

window.R = R;
