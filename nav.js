document.addEventListener('DOMContentLoaded', function () {
  /* Navbar scroll state */
  const navbar = document.querySelector('.navbar');
  let lastScroll = 0;

  window.addEventListener('scroll', function () {
    const currentScroll = window.pageYOffset;
    if (currentScroll > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    lastScroll = currentScroll;
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

/* Work section — stacked image pile */
(function () {
  var pile    = document.getElementById('workPile');
  var navEl   = document.getElementById('wpdNav');
  var btnPrev = document.getElementById('workPrev');
  var btnNext = document.getElementById('workNext');
  var countEl = document.getElementById('wpcCount');
  if (!pile) return;

  var cards   = Array.from(pile.querySelectorAll('.work-pile-card'));
  var details = Array.from(document.querySelectorAll('.work-pile-detail'));
  var dots    = navEl ? Array.from(navEl.querySelectorAll('.wpd-dot')) : [];
  var total   = cards.length;
  var current = 0;

  /* Resting transform/opacity/z for each stack position (0 = top) */
  var restT = [
    'rotate(0deg) translate(0px, 0px)',
    'rotate(-2.5deg) translate(-8px, 6px)',
    'rotate(1.8deg) translate(6px, 10px)',
    'rotate(-1.2deg) translate(-4px, 16px)',
    'rotate(2.4deg) translate(10px, 22px)',
    'rotate(-1.8deg) translate(-6px, 28px)'
  ];
  var restO = [1, 0.85, 0.70, 0.50, 0.35, 0.20];
  var restZ = [6, 5, 4, 3, 2, 1];

  function pad(n) { return n < 10 ? '0' + n : '' + n; }

  function goTo(idx) {
    current = ((idx % total) + total) % total;

    /* Restack cards */
    cards.forEach(function (card) {
      var pos = ((parseInt(card.dataset.idx, 10) - current) + total) % total;
      card.style.transform = restT[pos];
      card.style.opacity   = restO[pos];
      card.style.zIndex    = restZ[pos];
    });

    /* Swap detail panel */
    details.forEach(function (d) {
      d.classList.toggle('active', parseInt(d.dataset.idx, 10) === current);
    });

    /* Dots */
    dots.forEach(function (d) {
      d.classList.toggle('active', parseInt(d.dataset.idx, 10) === current);
    });

    /* Counter */
    if (countEl) countEl.textContent = pad(current + 1) + ' / ' + pad(total);
  }

  /* Prev / Next */
  if (btnPrev) btnPrev.addEventListener('click', function () { goTo(current - 1); });
  if (btnNext) btnNext.addEventListener('click', function () { goTo(current + 1); });

  /* Dot clicks */
  dots.forEach(function (dot) {
    dot.addEventListener('click', function () { goTo(parseInt(dot.dataset.idx, 10)); });
  });

  /* Pile click → next (still works as shortcut) */
  pile.addEventListener('click', function () { goTo(current + 1); });

  /* Keyboard */
  pile.setAttribute('tabindex', '0');
  pile.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); goTo(current + 1); }
    if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   { e.preventDefault(); goTo(current - 1); }
  });

  goTo(0);
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
