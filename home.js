/* home.js — Ribyon Studios index page interactions */
(function () {
  'use strict';

  /* ─── Nairobi clock (EAT = UTC+3) ─── */
  const clock = document.getElementById('heroClock');
  function updateClock() {
    if (!clock) return;
    const now = new Date();
    const eat = new Date(now.getTime() + (3 * 60 - now.getTimezoneOffset()) * 60000);
    const h = String(eat.getUTCHours()).padStart(2, '0');
    const m = String(eat.getUTCMinutes()).padStart(2, '0');
    const s = String(eat.getUTCSeconds()).padStart(2, '0');
    clock.textContent = h + ':' + m + ':' + s;
  }
  setInterval(updateClock, 1000);
  updateClock();

  /* ─── Hero headline word stagger ─── */
  const words = document.querySelectorAll('.h-word');
  words.forEach(function (w, i) {
    w.style.transitionDelay = (i * 0.07 + 0.2) + 's';
  });
  // Trigger after paint
  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      words.forEach(function (w) { w.classList.add('in'); });
    });
  });

  /* ─── Hero cursor spotlight ─── */
  const spotlight = document.getElementById('heroSpotlight');
  const hero = document.getElementById('hero');
  if (spotlight && hero) {
    hero.addEventListener('mousemove', function (e) {
      const rect = hero.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      spotlight.style.setProperty('--sx', x + 'px');
      spotlight.style.setProperty('--sy', y + 'px');
      spotlight.style.opacity = '1';
    });
    hero.addEventListener('mouseleave', function () {
      spotlight.style.opacity = '0';
    });
  }

  /* ─── Hero sub & actions fade in ─── */
  var heroDelayed = document.querySelectorAll('.hero-sub, .hero-actions, .hero-stat-bar, .hero-eyebrow, .hero-corner-tl, .hero-corner-tr, .hero-corner-br');
  heroDelayed.forEach(function (el) {
    el.classList.add('hero-fade');
    setTimeout(function () { el.classList.add('hero-fade-in'); }, 900);
  });

  /* ─── Scroll-triggered reveals ─── */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var revealObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          revealObs.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(function (el) { revealObs.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('visible'); });
  }

  /* ─── Count-up numbers ─── */
  function countUp(el) {
    var target = parseInt(el.dataset.target, 10);
    var suffix = el.dataset.suffix || '';
    var duration = 1200;
    var start = performance.now();
    function step(now) {
      var progress = Math.min((now - start) / duration, 1);
      var ease = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(ease * target) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if ('IntersectionObserver' in window) {
    var countObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          countUp(e.target);
          countObs.unobserve(e.target);
        }
      });
    }, { threshold: 0.5 });
    document.querySelectorAll('.count-up').forEach(function (el) { countObs.observe(el); });
  }

  /* ─── Ticker pause on hover ─── */
  var ticker = document.querySelector('.ticker-track');
  if (ticker) {
    ticker.addEventListener('mouseenter', function () { ticker.style.animationPlayState = 'paused'; });
    ticker.addEventListener('mouseleave', function () { ticker.style.animationPlayState = 'running'; });
  }

  /* ─────────────────────────────────────────
     SERVICES sticky scroll
     Logic: scroll position within #services
     drives which panel is "active". The left
     column is position:sticky. The right panels
     are 100vh each — scrolling through them
     updates the left nav + progress bar.
  ───────────────────────────────────────── */
  var svcSection = document.getElementById('services');
  var panels = document.querySelectorAll('.svc-panel');
  var navItems = document.querySelectorAll('.svc-nav-item');
  var progressFill = document.getElementById('svcProgressFill');
  var currentPanel = 0;

  function setActivePanel(idx) {
    if (idx === currentPanel && idx !== 0) return;
    currentPanel = idx;
    panels.forEach(function (p, i) {
      p.classList.toggle('active', i === idx);
      p.classList.toggle('was-active', i < idx);
    });
    navItems.forEach(function (n, i) {
      n.classList.toggle('active', i === idx);
    });
    if (progressFill) {
      progressFill.style.transform = 'scaleY(' + ((idx + 1) / panels.length) + ')';
    }
  }

  function onScroll() {
    if (!svcSection || panels.length === 0) return;

    var rect = svcSection.getBoundingClientRect();
    var total = svcSection.offsetHeight - window.innerHeight;
    var scrolled = -rect.top;

    if (scrolled < 0 || scrolled > total) return;

    var panelH = svcSection.offsetHeight / panels.length;
    var idx = Math.min(Math.floor(scrolled / panelH * panels.length / panels.length * panels.length), panels.length - 1);
    // simpler: divide total scroll into equal segments
    var seg = total / panels.length;
    idx = Math.min(Math.floor(scrolled / seg), panels.length - 1);
    setActivePanel(idx);
  }

  // Nav clicks → scroll to that panel
  navItems.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var idx = parseInt(btn.dataset.idx, 10);
      if (!svcSection) return;
      var rect = svcSection.getBoundingClientRect();
      var total = svcSection.offsetHeight - window.innerHeight;
      var seg = total / panels.length;
      var target = window.scrollY + rect.top + idx * seg;
      window.scrollTo({ top: target, behavior: 'smooth' });
    });
  });

  // Initialise first panel
  setActivePanel(0);

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

})();
