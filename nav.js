document.addEventListener('DOMContentLoaded', function () {

/* ── Content protection ── */
(function() {
  document.addEventListener('contextmenu', function(e) { e.preventDefault(); });
  document.addEventListener('copy',    function(e) { e.preventDefault(); });
  document.addEventListener('cut',     function(e) { e.preventDefault(); });
  document.addEventListener('dragstart',function(e) { e.preventDefault(); });
  document.addEventListener('keydown', function(e) {
    if ((e.ctrlKey || e.metaKey) && ['u','U','s','S','a','A','c','C','p','P','j','J'].includes(e.key)) {
      e.preventDefault();
    }
    if (e.key === 'F12') e.preventDefault();
  });
  document.querySelectorAll('img').forEach(function(img) {
    img.setAttribute('draggable', 'false');
  });
}());

  /* Navbar scroll state — hide on scroll down, show on scroll up */
  const navbar = document.querySelector('.navbar');
  let lastScroll = 0;
  let scrollTimer = null;

  window.addEventListener('scroll', function () {
    const currentScroll = window.pageYOffset;

    if (currentScroll > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    /* Hide navbar on scroll down, show on scroll up (only after threshold) */
    if (currentScroll > 120) {
      if (currentScroll > lastScroll && !navbar.classList.contains('hidden')) {
        navbar.classList.add('hidden');
      } else if (currentScroll < lastScroll && navbar.classList.contains('hidden')) {
        navbar.classList.remove('hidden');
      }
    } else {
      navbar.classList.remove('hidden');
    }

    lastScroll = currentScroll;

    /* Go-to-top button visibility — sticky floating */
    var goTop = document.getElementById('go-to-top');
    if (goTop) {
      if (currentScroll > 250) {
        goTop.classList.add('visible');
      } else {
        goTop.classList.remove('visible');
      }
    }
  });

  /* Mobile menu */
  const toggle = document.querySelector('.mobile-toggle');
  const navMenu = document.getElementById('navMenu');
  const overlay = document.getElementById('mobileOverlay');

  function closeMenu() {
    navMenu.classList.remove('open');
    toggle.classList.remove('active');
    overlay.classList.remove('active');
    document.body.classList.remove('menu-open');
    if (toggle) toggle.focus();
  }

  function openMenu() {
    navMenu.classList.add('open');
    toggle.classList.add('active');
    overlay.classList.add('active');
    document.body.classList.add('menu-open');
  }

  if (toggle) {
    toggle.addEventListener('click', function () {
      if (navMenu.classList.contains('open')) {
        closeMenu();
      } else {
        openMenu();
      }
    });
  }

  if (overlay) {
    overlay.addEventListener('click', closeMenu);
  }

  /* Close menu on Escape key */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && navMenu.classList.contains('open')) closeMenu();
  });

  /* Close menu on resize above mobile breakpoint */
  var mql = window.matchMedia('(min-width: 769px)');
  mql.addListener(function (e) {
    if (e.matches && navMenu.classList.contains('open')) closeMenu();
  });

  /* Close menu on nav link click */
  document.querySelectorAll('.nav-links a').forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });


  /* Reveal on scroll — re-triggers both up and down */
  var revealSelectors = '.reveal, .reveal-left, .reveal-right, .reveal-scale';
  var revealElements = document.querySelectorAll(revealSelectors);
  if (revealElements.length > 0 && 'IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        } else {
          entry.target.classList.remove('visible');
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

    revealElements.forEach(function (el) { observer.observe(el); });
  } else {
    revealElements.forEach(function (el) { el.classList.add('visible'); });
  }

  /* Lazy image loaded handler */
  document.querySelectorAll('img[loading="lazy"]').forEach(function (img) {
    if (img.complete) { img.classList.add('loaded'); }
    else { img.addEventListener('load', function () { this.classList.add('loaded'); }); }
  });

  /* FAQ accordion */
  document.querySelectorAll('.faq-q').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var item = this.closest('.faq-item');
      var answer = item.querySelector('.faq-a');
      var isOpen = item.classList.contains('active');

      document.querySelectorAll('.faq-item.active').forEach(function (openItem) {
        if (openItem !== item) {
          openItem.classList.remove('active');
          openItem.querySelector('.faq-a').style.maxHeight = '0';
        }
      });

      if (isOpen) {
        item.classList.remove('active');
        answer.style.maxHeight = '0';
      } else {
        item.classList.add('active');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });

  /* Count-up animation for .count-up elements */
  function animateCountUp(el) {
    var target = parseInt(el.getAttribute('data-target'), 10);
    if (isNaN(target)) return;
    var suffix = el.getAttribute('data-suffix') || '';
    var duration = parseInt(el.getAttribute('data-duration'), 10) || 2000;
    var startTime = null;

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var progress = Math.min((timestamp - startTime) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var current = Math.floor(eased * target);
      el.textContent = current + suffix;
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = target + suffix;
      }
    }

    requestAnimationFrame(step);
  }

  var countUpElements = document.querySelectorAll('.count-up');
  if (countUpElements.length > 0 && 'IntersectionObserver' in window) {
    var countObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCountUp(entry.target);
          countObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    countUpElements.forEach(function (el) {
      countObserver.observe(el);
    });
  } else {
    countUpElements.forEach(function (el) {
      el.textContent = el.getAttribute('data-target') + (el.getAttribute('data-suffix') || '');
    });
  }
});

/* Services accordion — hover on desktop, click on touch */
(function () {
  var rows = document.querySelectorAll('.sva-row');
  if (!rows.length) return;

  var isTouchDevice = window.matchMedia('(hover: none)').matches;

  function openRow(row) {
    rows.forEach(function (r) { r.classList.remove('open'); });
    row.classList.add('open');
  }

  function closeAll() {
    rows.forEach(function (r) { r.classList.remove('open'); });
  }

  if (isTouchDevice) {
    /* Touch: toggle on click */
    rows.forEach(function (row) {
      row.addEventListener('click', function () {
        var isOpen = row.classList.contains('open');
        if (isOpen) { closeAll(); } else { openRow(row); }
      });
    });
  } else {
    /* Desktop: open on mouseenter, close section on mouseleave */
    var accordionEl = document.getElementById('svcAccordion') || rows[0].closest('.svc-accordion');
    rows.forEach(function (row) {
      row.addEventListener('mouseenter', function () { openRow(row); });
    });
    if (accordionEl) {
      accordionEl.addEventListener('mouseleave', function () { closeAll(); });
    }
  }
}());

/* Work section — 3-card sliding showcase (1 card on mobile), auto-advances */
(function () {
  var slider  = document.getElementById('wkSlider');
  if (!slider) return;

  var track   = document.getElementById('wkTrack');
  var cards   = Array.from(track.querySelectorAll('.wk-card'));
  var dots    = Array.from(document.querySelectorAll('.wk-dot'));
  var btnPrev = document.getElementById('wkPrev');
  var btnNext = document.getElementById('wkNext');
  var total   = cards.length;   /* 6 */
  var current = 0;
  var autoTimer;

  function perView() { return window.innerWidth <= 768 ? 1 : 3; }
  function maxPos()  { return total - perView(); }

  function goTo(idx) {
    var max = maxPos();
    current = Math.max(0, Math.min(idx, max));

    /* Pixel-perfect offset: card width + gap, measured live */
    var cardW = cards[0].getBoundingClientRect().width;
    var gap   = parseFloat(getComputedStyle(track).gap) || 20;
    track.style.transform = 'translateX(-' + (current * (cardW + gap)) + 'px)';

    /* Sync dots — 4 dots for desktop (pos 0-3), 6 dots for mobile (pos 0-5) */
    dots.forEach(function (d, i) { d.classList.toggle('active', i === current); });
  }

  function next() { goTo(current >= maxPos() ? 0 : current + 1); }
  function prev() { goTo(current <= 0 ? maxPos() : current - 1); }

  function startAuto() { stopAuto(); autoTimer = setInterval(next, 4500); }
  function stopAuto()  { clearInterval(autoTimer); }

  if (btnPrev) btnPrev.addEventListener('click', function () { prev(); startAuto(); });
  if (btnNext) btnNext.addEventListener('click', function () { next(); startAuto(); });

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      goTo(parseInt(dot.dataset.idx, 10));
      startAuto();
    });
  });

  slider.addEventListener('mouseenter', stopAuto);
  slider.addEventListener('mouseleave', startAuto);

  var touchX = 0;
  slider.addEventListener('touchstart', function (e) { touchX = e.touches[0].clientX; }, { passive: true });
  slider.addEventListener('touchend',   function (e) {
    var diff = touchX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) { diff > 0 ? next() : prev(); startAuto(); }
  }, { passive: true });

  slider.setAttribute('tabindex', '0');
  slider.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight') { e.preventDefault(); next(); startAuto(); }
    if (e.key === 'ArrowLeft')  { e.preventDefault(); prev(); startAuto(); }
  });

  window.addEventListener('resize', function () {
    current = Math.min(current, maxPos());
    goTo(current);
  });

  goTo(0);
  startAuto();
}());

/* Services split accordion — products.html */
(function () {
  var items = document.querySelectorAll('.svc-split-item');
  if (!items.length) return;

  items.forEach(function (item) {
    var btn = item.querySelector('.svc-split-header');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var isOpen = item.classList.contains('open');
      /* Close all */
      items.forEach(function (i) {
        i.classList.remove('open');
        var b = i.querySelector('.svc-split-header');
        if (b) b.setAttribute('aria-expanded', 'false');
      });
      /* Open clicked if it was closed */
      if (!isOpen) {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });
}());

/* Go to Top button */
(function () {
  var btn = document.getElementById('go-to-top');
  if (!btn) return;
  btn.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}());

/* Newsletter subscribe */
(function () {
  var forms = document.querySelectorAll('.newsletter-form');
  if (!forms.length) return;

  forms.forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var input = form.querySelector('input[type="email"]');
      var msg = form.parentNode.querySelector('.newsletter-message');
      if (!input || !input.value.trim()) return;

      /* Simple validation */
      var email = input.value.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        if (msg) { msg.textContent = 'Please enter a valid email address.'; msg.className = 'newsletter-message error'; }
        return;
      }

      /* Store in localStorage as mock subscription */
      var subs = JSON.parse(localStorage.getItem('ribyon_subscribers') || '[]');
      if (subs.indexOf(email) === -1) {
        subs.push(email);
        localStorage.setItem('ribyon_subscribers', JSON.stringify(subs));
      }

      if (msg) { msg.textContent = 'Thanks for subscribing! We\'ll be in touch.'; msg.className = 'newsletter-message success'; }
      input.value = '';
    });
  });
}());

/* Draw ribbon paths on SVG elements for the wave animation */
(function () {
  var ribbons = document.querySelectorAll('.cta-ribbon, .contact-ribbon, .post-hero-ribbon, .tier-included-ribbon, .svc-detail-ribbon');
  ribbons.forEach(function (svg) {
    svg.querySelectorAll('path').forEach(function (path) {
      if (!path.getAttribute('stroke')) path.setAttribute('stroke', 'var(--orange)');
      if (!path.getAttribute('fill')) path.setAttribute('fill', 'none');
      if (!path.getAttribute('stroke-linecap')) path.setAttribute('stroke-linecap', 'round');
    });
  });
}());

/* Scroll progress bar */
(function () {
  var bar = document.querySelector('.scroll-progress-bar');
  if (!bar) return;
  window.addEventListener('scroll', function () {
    var winScroll = document.documentElement.scrollTop;
    var height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    var scrolled = (winScroll / height) * 100;
    bar.style.width = scrolled + '%';
  });
}());

/* ─────────────────────────────────────────────────────────
   FLOATING UTILITY BAR — back-to-top + language switcher
   Injected into every page automatically.
───────────────────────────────────────────────────────── */
(function () {

  /* ── Language config ── */
  var langs = [
    { code: 'en',    label: 'English',    flag: '🇬🇧' },
    { code: 'sw',    label: 'Kiswahili',  flag: '🇰🇪' },
    { code: 'fr',    label: 'Français',   flag: '🇫🇷' },
    { code: 'de',    label: 'Deutsch',    flag: '🇩🇪' },
    { code: 'es',    label: 'Español',    flag: '🇪🇸' },
    { code: 'pt',    label: 'Português',  flag: '🇧🇷' },
    { code: 'ar',    label: 'العربية',    flag: '🇸🇦' },
    { code: 'zh-CN', label: '中文',       flag: '🇨🇳' }
  ];

  /* ── Inject hidden Google Translate target ── */
  /* Use a unique ID so nav.js is always the single source of truth */
  /* Remove any hardcoded wrapper pages may have left in HTML */
  var existingWrap = document.getElementById('google_translate_element_wrapper');
  if (existingWrap) { existingWrap.parentNode.removeChild(existingWrap); }

  var gtWrap = document.createElement('div');
  gtWrap.id = 'google_translate_element_wrapper';
  gtWrap.style.cssText = 'position:absolute;opacity:0;pointer-events:none;height:0;overflow:hidden;';
  var gtEl = document.createElement('div');
  gtEl.id = 'google_translate_element';
  gtWrap.appendChild(gtEl);
  document.body.appendChild(gtWrap);

  /* ── Build floating bar HTML ── */
  var bar = document.createElement('div');
  bar.className = 'float-bar'; /* back-to-top: bottom-right */

  var langBar = document.createElement('div');
  langBar.className = 'float-bar float-bar--lang'; /* language: bottom-left */

  /* Language panel */
  var panel = document.createElement('div');
  panel.className = 'float-lang-panel';
  panel.id = 'floatLangPanel';

  langs.forEach(function (l) {
    var btn = document.createElement('button');
    btn.className = 'float-lang-opt' + (l.code === 'en' ? ' active' : '');
    btn.dataset.lang = l.code;
    btn.innerHTML = '<span class="float-lang-flag">' + l.flag + '</span>' + l.label;
    btn.addEventListener('click', function () {
      translateTo(l.code);
      document.querySelectorAll('.float-lang-opt').forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      /* Update the globe button to show the selected flag */
      langBtnFlag.textContent = l.flag;
      panel.classList.remove('open');
    });
    panel.appendChild(btn);
  });

  /* Language button */
  var langBtn = document.createElement('button');
  langBtn.className = 'float-btn float-btn--lang';
  langBtn.setAttribute('aria-label', 'Change language');
  langBtn.title = 'Language';
  /* Globe icon + active flag display */
  var langBtnFlag = document.createElement('span');
  langBtnFlag.className = 'float-btn-flag';
  langBtnFlag.textContent = '🌐';
  langBtn.appendChild(langBtnFlag);
  langBtn.appendChild(panel);

  langBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    panel.classList.toggle('open');
  });
  document.addEventListener('click', function () { panel.classList.remove('open'); });

  /* Back to top button */
  var topBtn = document.createElement('button');
  topBtn.className = 'float-btn float-btn--top';
  topBtn.id = 'floatTopBtn';
  topBtn.setAttribute('aria-label', 'Back to top');
  topBtn.title = 'Back to top';
  topBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>';
  topBtn.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  bar.appendChild(topBtn);
  langBar.appendChild(langBtn);
  document.body.appendChild(langBar);
  document.body.appendChild(bar);

  /* Show/hide top button on scroll */
  window.addEventListener('scroll', function () {
    if (window.scrollY > 300) {
      topBtn.classList.add('visible');
    } else {
      topBtn.classList.remove('visible');
    }
  }, { passive: true });

  /* ── Google Translate ── */
  window.googleTranslateElementInit = function () {
    new google.translate.TranslateElement({
      pageLanguage: 'en',
      includedLanguages: 'en,sw,fr,de,es,pt,ar,zh-CN',
      layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
      autoDisplay: false
    }, 'google_translate_element');

    /* Suppress Google's banner */
    var s = document.createElement('style');
    s.textContent = '.goog-te-banner-frame{display:none!important}body{top:0!important}.goog-te-gadget-icon{display:none!important}';
    document.head.appendChild(s);
  };

  /* Load Google Translate script once */
  if (!document.getElementById('gt-script')) {
    var gtScript = document.createElement('script');
    gtScript.id = 'gt-script';
    gtScript.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    document.head.appendChild(gtScript);
  }

  /* Switch language via Google Translate cookie (most reliable cross-browser method) */
  function translateTo(langCode) {
    if (langCode === 'en') {
      /* Restore original — clear the GT cookie and reload */
      var expires = new Date(0).toUTCString();
      document.cookie = 'googtrans=; expires=' + expires + '; path=/';
      document.cookie = 'googtrans=; expires=' + expires + '; domain=.' + location.hostname + '; path=/';
      location.reload();
      return;
    }
    /* Set the Google Translate cookie to the chosen language */
    var val = '/en/' + langCode;
    document.cookie = 'googtrans=' + val + '; path=/';
    document.cookie = 'googtrans=' + val + '; domain=.' + location.hostname + '; path=/';
    /* Also try the combo select as secondary trigger (no reload needed if it works) */
    var tryCount = 0;
    function attempt() {
      var combo = document.querySelector('.goog-te-combo');
      if (combo) {
        combo.value = langCode;
        combo.dispatchEvent(new Event('change'));
      } else if (tryCount < 25) {
        tryCount++;
        setTimeout(attempt, 200);
      } else {
        /* Combo never appeared — fall back to reload which picks up the cookie */
        location.reload();
      }
    }
    attempt();
  }

}());
