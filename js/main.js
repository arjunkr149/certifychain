/* =============================================
   main.js — Landing Page
   CertifyChain
   ============================================= */

// ---- 1. THEME — runs immediately (before DOM) ----
(function () {
  const saved = localStorage.getItem('cc_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', saved);
})();

// ---- 2. Everything else — after DOM ready ----
document.addEventListener('DOMContentLoaded', function () {

  // ---- THEME TOGGLE ----
  const themeBtn = document.getElementById('theme-toggle');
  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      const html    = document.documentElement;
      const current = html.getAttribute('data-theme') || 'dark';
      const next    = current === 'dark' ? 'light' : 'dark';
      html.setAttribute('data-theme', next);
      localStorage.setItem('cc_theme', next);
      themeBtn.style.transform = 'rotate(360deg)';
      setTimeout(function () { themeBtn.style.transform = ''; }, 400);
    });
  }

  // ---- NAVBAR SCROLL ----
  var nav = document.getElementById('main-nav');
  window.addEventListener('scroll', function () {
    if (!nav) return;
    nav.style.background = window.scrollY > 60
      ? 'rgba(7,8,15,0.98)'
      : 'rgba(7,8,15,0.85)';
  });

  // ---- MOBILE HAMBURGER ----
  var hamburger = document.getElementById('hamburger');
  var navLinks  = document.getElementById('nav-links');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', function () {
      var open = navLinks.style.display === 'flex';
      if (open) {
        navLinks.removeAttribute('style');
      } else {
        navLinks.style.cssText = 'display:flex;flex-direction:column;position:absolute;top:64px;left:0;right:0;background:var(--surface);padding:1rem;border-bottom:1px solid var(--border);z-index:99';
      }
    });
  }

  // ---- SMOOTH SCROLL ----
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        if (navLinks) navLinks.removeAttribute('style');
      }
    });
  });

  // ---- CONTACT FORM — Formspree ----
  var contactForm   = document.getElementById('contact-form');
  var contactResult = document.getElementById('contact-result');

  if (contactForm) {
    // Character counter
    var textarea  = document.getElementById('cf-message');
    var charCount = document.getElementById('cf-char-count');
    var MAX_CHARS = 500;
    if (textarea && charCount) {
      textarea.addEventListener('input', function () {
        var len = textarea.value.length;
        if (len > MAX_CHARS) textarea.value = textarea.value.substring(0, MAX_CHARS);
        charCount.textContent = Math.min(len, MAX_CHARS) + ' / ' + MAX_CHARS;
        charCount.className   = 'cf-char-count' + (len > MAX_CHARS * 0.9 ? ' warn' : '') + (len >= MAX_CHARS ? ' limit' : '');
      });
    }

    // Typing hints
    var hints = {
      'cf-name':    "Keep it professional — first and last name",
      'cf-email':   "We'll reply to this address",
      'cf-subject': "Choose the topic that fits best",
      'cf-message': "Be as detailed as possible"
    };
    Object.keys(hints).forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      var hintEl = null;
      el.addEventListener('focus', function () {
        if (!hintEl) {
          hintEl = document.createElement('div');
          hintEl.className = 'cf-typing-hint';
          hintEl.innerHTML = '<span class="cf-typing-dots"><span></span><span></span><span></span></span> ' + hints[id];
          el.closest('.cf-field').appendChild(hintEl);
        }
      });
      el.addEventListener('blur', function () {
        if (hintEl) { hintEl.remove(); hintEl = null; }
      });
    });

    // Submit
    contactForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      var btnText    = contactForm.querySelector('.cf-btn-text');
      var btnLoading = contactForm.querySelector('.cf-btn-loading');
      var btnSent    = contactForm.querySelector('.cf-btn-sent');
      var submitBtn  = document.getElementById('cf-submit');

      btnText.style.display    = 'none';
      btnLoading.style.display = 'flex';
      submitBtn.disabled       = true;

      try {
        var res = await fetch(contactForm.action, {
          method:  'POST',
          body:    new FormData(contactForm),
          headers: { 'Accept': 'application/json' }
        });
        if (res.ok) {
          btnLoading.style.display   = 'none';
          btnSent.style.display      = 'flex';
          submitBtn.style.background = 'var(--success)';
          contactResult.innerHTML    = '<div class="cf-success"><i class="ti ti-circle-check" style="font-size:1.3rem;flex-shrink:0"></i><div><strong>Message sent!</strong><br><span style="font-size:.82rem;opacity:.8">We\'ll reply within 24 hours.</span></div></div>';
          contactForm.reset();
          if (charCount) { charCount.textContent = '0 / 500'; charCount.className = 'cf-char-count'; }
          setTimeout(function () {
            btnSent.style.display      = 'none';
            btnText.style.display      = 'flex';
            submitBtn.disabled         = false;
            submitBtn.style.background = '';
          }, 4000);
        } else {
          throw new Error('Status ' + res.status);
        }
      } catch (err) {
        btnLoading.style.display = 'none';
        btnText.style.display    = 'flex';
        submitBtn.disabled       = false;
        contactResult.innerHTML  = '<div class="cf-error"><i class="ti ti-alert-circle" style="font-size:1.3rem;flex-shrink:0"></i><div><strong>Failed to send.</strong><br><span style="font-size:.82rem;opacity:.8">Email aksir648@gmail.com directly.</span></div></div>';
      }
    });
  }

  // ---- FADE IN ON SCROLL ----
  var fadeObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.style.opacity   = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.feature-card, .step-card, .team-card, .faq-item').forEach(function (el) {
    el.style.opacity    = '0';
    el.style.transform  = 'translateY(20px)';
    el.style.transition = 'opacity .5s ease, transform .5s ease';
    fadeObserver.observe(el);
  });

}); // end DOMContentLoaded
