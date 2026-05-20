/* ============================================================
   The Capital Diner — script.js
   Smooth scroll | Active nav | Menu tabs | Form handler
   ============================================================ */

(function () {
  'use strict';

  /* ── Smooth Scroll for anchor links ── */
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      var target = document.querySelector(this.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      // Close mobile menu if open
      document.getElementById('navbar').classList.remove('open');
      var navH = document.getElementById('navbar').offsetHeight;
      var top = target.getBoundingClientRect().top + window.scrollY - navH - 8;
      window.scrollTo({ top: top, behavior: 'smooth' });
    });
  });

  /* ── Active Nav on Scroll ── */
  var sections = document.querySelectorAll('section[id], div[id]');
  var navLinks = document.querySelectorAll('.nav-links a');
  var navbar   = document.getElementById('navbar');

  function setActiveNav() {
    var scrollY = window.scrollY + navbar.offsetHeight + 20;
    var current = '';
    sections.forEach(function (sec) {
      if (sec.offsetTop <= scrollY) current = sec.id;
    });
    navLinks.forEach(function (link) {
      link.classList.remove('active');
      if (link.getAttribute('href') === '#' + current) link.classList.add('active');
    });
  }

  /* ── Scroll-to-top button ── */
  var scrollTopBtn = document.getElementById('scroll-top');
  function handleScroll() {
    setActiveNav();
    if (window.scrollY > 400) {
      scrollTopBtn.classList.add('visible');
    } else {
      scrollTopBtn.classList.remove('visible');
    }
  }
  window.addEventListener('scroll', handleScroll, { passive: true });
  if (scrollTopBtn) {
    scrollTopBtn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ── Mobile Nav Toggle ── */
  var navToggle = document.getElementById('nav-toggle');
  if (navToggle) {
    navToggle.addEventListener('click', function () {
      navbar.classList.toggle('open');
      var expanded = navbar.classList.contains('open');
      navToggle.setAttribute('aria-expanded', expanded);
    });
  }

  /* ── Menu Tab Switching ── */
  var tabBtns   = document.querySelectorAll('.tab-btn');
  var tabPanels = document.querySelectorAll('.tab-panel');

  function switchTab(targetId) {
    tabPanels.forEach(function (panel) {
      if (panel.id === targetId) {
        panel.style.display = 'block';
        // Trigger reflow for fade
        void panel.offsetWidth;
        panel.classList.add('active');
      } else {
        panel.classList.remove('active');
        panel.style.display = 'none';
      }
    });
    tabBtns.forEach(function (btn) {
      btn.classList.toggle('active', btn.dataset.tab === targetId);
      btn.setAttribute('aria-selected', btn.dataset.tab === targetId);
    });
  }

  tabBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      switchTab(this.dataset.tab);
    });
  });

  /* ── Catering Form Success Handler ── */
  var form        = document.getElementById('catering-form');
  var formSuccess = document.getElementById('form-success');

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      // Validate required fields
      var requiredFields = form.querySelectorAll('[required]');
      var valid = true;
      requiredFields.forEach(function (field) {
        if (!field.value.trim()) {
          valid = false;
          field.style.borderColor = '#e53935';
          field.addEventListener('input', function () {
            field.style.borderColor = '';
          }, { once: true });
        }
      });
      if (!valid) return;

      // Simulate submission
      var submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.textContent = 'Sending…';
      submitBtn.disabled = true;

      setTimeout(function () {
        form.style.display = 'none';
        if (formSuccess) {
          formSuccess.style.display = 'block';
        }
      }, 900);
    });
  }

  /* ── Fade-in-up on scroll (Intersection Observer) ── */
  var fadeEls = document.querySelectorAll('.fade-in-up');
  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    fadeEls.forEach(function (el) { observer.observe(el); });
  } else {
    // Fallback: show everything immediately
    fadeEls.forEach(function (el) { el.classList.add('visible'); });
  }

  /* ── Run once on load ── */
  setActiveNav();

})();
