/* =========================================
   GreenThumb Landscaping — Script
   ========================================= */

(function () {
  'use strict';

  const NAV_HEIGHT = 70;

  /* ---- Navbar: scroll class + active link ---- */
  const navbar = document.getElementById('navbar');
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a[data-scroll]');

  function updateNavbar() {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  function updateActiveLink() {
    let current = '';
    sections.forEach((section) => {
      const sectionTop = section.offsetTop - NAV_HEIGHT - 80;
      if (window.scrollY >= sectionTop) {
        current = section.getAttribute('id');
      }
    });
    navLinks.forEach((link) => {
      link.classList.remove('active');
      if (link.getAttribute('href') === '#' + current) {
        link.classList.add('active');
      }
    });
  }

  window.addEventListener('scroll', () => {
    updateNavbar();
    updateActiveLink();
    revealOnScroll();
    runCounters();
  }, { passive: true });

  updateNavbar();
  updateActiveLink();

  /* ---- Smooth scroll ---- */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - NAV_HEIGHT;
      window.scrollTo({ top, behavior: 'smooth' });

      // Close mobile nav if open
      const navLinksList = document.querySelector('.nav-links');
      const toggle = document.querySelector('.nav-toggle');
      if (navLinksList && navLinksList.classList.contains('open')) {
        navLinksList.classList.remove('open');
        toggle.classList.remove('open');
      }
    });
  });

  /* ---- Mobile nav toggle ---- */
  const navToggle = document.querySelector('.nav-toggle');
  const navLinksList = document.querySelector('.nav-links');

  if (navToggle && navLinksList) {
    navToggle.addEventListener('click', () => {
      navToggle.classList.toggle('open');
      navLinksList.classList.toggle('open');
    });
  }

  /* ---- Scroll reveal ---- */
  const revealEls = document.querySelectorAll('.reveal');

  function revealOnScroll() {
    const threshold = window.innerHeight - 80;
    revealEls.forEach((el) => {
      const top = el.getBoundingClientRect().top;
      if (top < threshold) {
        el.classList.add('visible');
      }
    });
  }

  // Run once on load (catch elements already in view)
  revealOnScroll();

  /* ---- Counter animation ---- */
  const counters = document.querySelectorAll('[data-count]');
  let countersRan = false;

  function easeOut(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function animateCounter(el) {
    const target = parseInt(el.getAttribute('data-count'), 10);
    const suffix = el.getAttribute('data-suffix') || '';
    const prefix = el.getAttribute('data-prefix') || '';
    const duration = 1800;
    const start = performance.now();

    function step(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const value = Math.round(easeOut(progress) * target);
      el.textContent = prefix + value.toLocaleString() + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }

  function runCounters() {
    if (countersRan) return;
    if (!counters.length) return;

    const firstCounter = counters[0];
    const rect = firstCounter.getBoundingClientRect();
    if (rect.top < window.innerHeight) {
      countersRan = true;
      counters.forEach((el) => animateCounter(el));
    }
  }

  runCounters();

  /* ---- Quote form handler ---- */
  const quoteForm = document.getElementById('quoteForm');
  const formSuccess = document.getElementById('formSuccess');

  if (quoteForm) {
    quoteForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const submitBtn = quoteForm.querySelector('.form-submit .btn');
      const originalText = submitBtn.innerHTML;

      // Show loading state
      submitBtn.innerHTML = '<i class="bi bi-hourglass-split"></i> Sending…';
      submitBtn.disabled = true;

      // Simulate async submission (swap for real fetch/API call)
      setTimeout(() => {
        quoteForm.style.display = 'none';
        if (formSuccess) {
          formSuccess.style.display = 'block';
        }
        // Reset for next time (hidden, but keeps data clean)
        quoteForm.reset();
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
      }, 1200);
    });
  }

  /* ---- Gallery lightbox (simple focus overlay) ---- */
  document.querySelectorAll('.gallery-item').forEach((item) => {
    item.addEventListener('click', () => {
      // Basic: open image in new tab as placeholder for full lightbox
      const img = item.querySelector('img');
      if (img) window.open(img.src, '_blank');
    });
  });

})();
