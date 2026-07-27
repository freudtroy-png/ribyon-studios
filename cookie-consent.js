(function () {
  'use strict';

  var COOKIE_NAME = 'ribyon_consent';
  var COOKIE_DURATION = 365;

  function getCookie(name) {
    var match = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
    return match ? decodeURIComponent(match[2]) : null;
  }

  function setCookie(name, value, days) {
    var expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = name + '=' + encodeURIComponent(value) + '; expires=' + expires + '; path=/; SameSite=Lax';
  }

  function showBanner() {
    var banner = document.getElementById('cookie-banner');
    if (banner) banner.style.display = 'block';
  }

  function hideBanner() {
    var banner = document.getElementById('cookie-banner');
    if (banner) banner.style.display = 'none';
  }

  function acceptAll() {
    setCookie(COOKIE_NAME, 'all', COOKIE_DURATION);
    hideBanner();
    if (typeof gtag === 'function') {
      gtag('consent', 'update', { analytics_storage: 'granted' });
    }
  }

  function acceptEssential() {
    setCookie(COOKIE_NAME, 'essential', COOKIE_DURATION);
    hideBanner();
    if (typeof gtag === 'function') {
      gtag('consent', 'update', { analytics_storage: 'denied' });
    }
  }

  var consent = getCookie(COOKIE_NAME);
  if (!consent) {
    document.addEventListener('DOMContentLoaded', showBanner);
  }

  window.cookieAcceptAll = acceptAll;
  window.cookieAcceptEssential = acceptEssential;
})();