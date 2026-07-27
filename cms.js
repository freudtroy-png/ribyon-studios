/* ─── CMS Live Render ───
   Reads data from localStorage (set via admin panel)
   and renders it onto the page. Falls back silently if no data exists.
   Include AFTER DOM content, BEFORE site JS. ─── */
(function() {
  var raw = localStorage.getItem('rs_data');
  if (!raw) return;
  var d;
  try { d = JSON.parse(raw); } catch(e) { return; }

  /* Support both old (flat) and new (pages.hero) data structures */
  var pages = d.pages || {};
  var home = pages.home || {};
  var hero = home.hero || d.hero || {};
  var cta = home.cta || {};

  /* ─── Hero ─── */
  if (hero.headline || hero.highlight) {
    var h1 = document.querySelector('.hero-content h1');
    if (h1) {
      if (hero.highlight && hero.headline) {
        var parts = hero.headline.split(hero.highlight);
        h1.innerHTML = escHtml(parts[0] || '') + '<span class="orange">' + escHtml(hero.highlight) + '</span>' + escHtml(parts[1] || '');
      } else if (hero.headline) {
        h1.textContent = hero.headline;
        var span = h1.querySelector('.orange');
        if (span && hero.highlight) span.textContent = hero.highlight;
      }
    }
    var sub = document.querySelector('.hero-content .subtitle');
    if (sub && hero.subtitle) sub.textContent = hero.subtitle;
    var statVal = document.querySelector('.hero-stat .count-up');
    if (statVal && hero.statNum) statVal.setAttribute('data-target', hero.statNum);
    var statLabel = document.querySelector('.hero-stat span:last-child');
    if (statLabel && hero.statLabel) statLabel.textContent = hero.statLabel;
  }

  /* ─── Manifesto ─── */
  var manifestoItems = d.manifesto;
  if (manifestoItems && manifestoItems.length) {
    var grid = document.querySelector('.manifesto-grid');
    if (grid) {
      grid.innerHTML = manifestoItems.map(function(m, i) {
        return '<div class="manifesto-card reveal' + (i ? ' reveal-d' + (i*2) : '') + '">' +
          '<span class="card-num">' + escHtml(m.num) + '</span>' +
          '<blockquote>' + m.quote + '</blockquote>' +
          '<p>' + escHtml(m.text) + '</p></div>';
      }).join('');
    }
  }

  /* ─── Services ─── */
  var svc = d.services;
  if (svc && svc.length) {
    var acc = document.getElementById('svcAccordion');
    if (acc) {
      acc.innerHTML = svc.map(function(s, i) {
        var tags = (s.tags||[]).map(function(t) { return '<span>' + escHtml(t) + '</span>'; }).join('');
        var img = s.image ? '<div class="sva-img" aria-hidden="true"><img src="' + escHtml(s.image) + '" alt=""><div class="sva-img-shade"></div></div>' : '';
        return '<div class="sva-row" data-index="' + i + '">' +
          '<div class="sva-row-inner">' +
          '<span class="sva-num">' + escHtml(s.num) + '</span>' +
          '<div class="sva-title-wrap"><h3 class="sva-title">' + escHtml(s.title) + '</h3><p class="sva-conviction">' + escHtml(s.conviction) + '</p></div>' +
          '<div class="sva-tags">' + tags + '</div>' +
          '<a href="products.html" class="sva-cta">See the work<svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M3 8h10M9 4l4 4-4 4"/></svg></a>' +
          '</div>' +
          '<div class="sva-toggle" aria-hidden="true"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 6l4 4 4-4"/></svg></div>' +
          img + '</div>';
      }).join('');
      /* Rebind accordion clicks */
      setTimeout(function() {
        acc.querySelectorAll('.sva-row').forEach(function(row) {
          row.addEventListener('click', function(e) {
            if (e.target.closest('.sva-cta') || e.target.closest('.sva-toggle')) return;
            var open = row.classList.contains('open');
            acc.querySelectorAll('.sva-row').forEach(function(r) { r.classList.remove('open'); });
            if (!open) row.classList.add('open');
          });
        });
      }, 50);
    }
  }

  /* ─── Clients ─── */
  var clients = d.clients;
  if (clients && clients.length) {
    var strip = document.querySelector('.logo-strip');
    if (strip) {
      strip.innerHTML = clients.map(function(c) {
        return '<div class="logo-strip-item"><img src="' + escHtml(c.logo) + '" alt="' + escHtml(c.name) + '"></div>';
      }).join('');
    }
  }

  /* ─── Tiers ─── */
  var tiers = d.tiers;
  if (tiers && tiers.length) {
    var row = document.querySelector('.tiers-row');
    if (row) {
      row.innerHTML = tiers.map(function(t, i) {
        return '<div class="tiers-col' + (t.focus ? ' tiers-col--focus' : '') + ' reveal' + (i ? ' reveal-d' + (i+1) : '') + '">' +
          '<span class="tiers-label">' + escHtml(t.label) + '</span>' +
          '<span class="tiers-name">' + escHtml(t.name) + '</span>' +
          '<p class="tiers-desc">' + escHtml(t.desc) + '</p>' +
          '<span class="tiers-price">' + escHtml(t.price) + '</span>' +
          '<a href="pricing.html" class="tiers-cta">' + escHtml(t.cta) + '</a></div>';
      }).join('');
    }
  }

  /* ─── Portfolio ─── */
  var pf = d.portfolio;
  if (pf && pf.length) {
    var pile = document.getElementById('workPile');
    if (pile) {
      pile.innerHTML = pf.map(function(p, i) {
        return '<div class="work-pile-card" data-idx="' + i + '" data-name="' + escHtml(p.name) + '" data-category="' + escHtml(p.category) + '">' +
          '<img src="' + escHtml(p.image) + '" alt="' + escHtml(p.name) + '"></div>';
      }).join('');
      var nameEl = document.querySelector('.work-pile-info-name');
      var catEl = document.querySelector('.work-pile-info-cat');
      if (nameEl && pf[0]) nameEl.textContent = pf[0].name;
      if (catEl && pf[0]) catEl.textContent = pf[0].category;
    }
  }

  /* ─── Tenets ─── */
  var tenets = d.tenets;
  if (tenets && tenets.length) {
    var tenEl = document.querySelector('.tenets');
    if (tenEl) {
      tenEl.innerHTML = tenets.map(function(t, i) {
        if (t.isStat) {
          var num = t.num || '0';
          var numVal = num.replace(/[^0-9.]/g, '') || '0';
          var suffix = num.replace(numVal, '') || '%';
          return '<div class="tenet tenet--focus reveal' + (i ? ' reveal-d' + (i+1) : '') + '">' +
            '<span class="tenet-num tenet-num--lg"><span class="count-up" data-target="' + numVal + '" data-suffix="' + suffix + '">0' + suffix + '</span></span>' +
            '<span class="tenet-label">' + escHtml(t.label) + '</span></div>';
        }
        return '<div class="tenet reveal' + (i ? ' reveal-d' + (i+1) : '') + '">' +
          '<span class="tenet-num">' + escHtml(t.num) + '</span>' +
          '<span class="tenet-label">' + escHtml(t.label) + '</span></div>';
      }).join('');
    }
  }

  function escHtml(s) { if (!s) return ''; return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
})();
