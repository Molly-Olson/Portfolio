/**
 * Casa Verde — script.js
 * Handles: sticky nav + active links, mobile menu toggle,
 *          menu tab switching, reservation form validation + success message.
 */

(function () {
  'use strict';

  /* ──────────────────────────────────────────
     1.  NAVBAR: scroll class + active link
  ────────────────────────────────────────── */
  const navbar   = document.getElementById('navbar');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  // Add .scrolled class after scrolling past 60px
  function handleNavScroll() {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  // Highlight the nav link whose section is currently in view
  function updateActiveLink() {
    let currentId = '';

    sections.forEach((section) => {
      const sectionTop = section.offsetTop - 100;
      if (window.scrollY >= sectionTop) {
        currentId = section.getAttribute('id');
      }
    });

    navLinks.forEach((link) => {
      link.classList.remove('active');
      if (link.getAttribute('href') === '#' + currentId) {
        link.classList.add('active');
      }
    });
  }

  // Throttle scroll handler for performance
  let scrollTicking = false;
  window.addEventListener('scroll', () => {
    if (!scrollTicking) {
      window.requestAnimationFrame(() => {
        handleNavScroll();
        updateActiveLink();
        scrollTicking = false;
      });
      scrollTicking = true;
    }
  });

  // Run once on load
  handleNavScroll();
  updateActiveLink();


  /* ──────────────────────────────────────────
     2.  MOBILE MENU TOGGLE
  ────────────────────────────────────────── */
  const navToggle     = document.getElementById('navToggle');
  const navLinksMenu  = document.getElementById('navLinks');

  navToggle.addEventListener('click', () => {
    const isOpen = navLinksMenu.classList.toggle('open');
    navToggle.classList.toggle('open', isOpen);
    navToggle.setAttribute('aria-expanded', isOpen);
  });

  // Close mobile menu when a nav link is clicked
  navLinksMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      navLinksMenu.classList.remove('open');
      navToggle.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });


  /* ──────────────────────────────────────────
     3.  SMOOTH SCROLL (supplement for older browsers)
  ────────────────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();
      const navHeight = navbar.offsetHeight;
      const top = target.getBoundingClientRect().top + window.scrollY - navHeight;

      window.scrollTo({ top, behavior: 'smooth' });
    });
  });


  /* ──────────────────────────────────────────
     4.  MENU TAB SWITCHING
  ────────────────────────────────────────── */
  const menuTabs   = document.querySelectorAll('.menu-tab');
  const menuPanels = document.querySelectorAll('.menu-panel');

  menuTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const targetTab = tab.getAttribute('data-tab');

      // Deactivate all tabs and panels
      menuTabs.forEach((t) => t.classList.remove('active'));
      menuPanels.forEach((p) => {
        p.classList.remove('active');
        p.style.animation = '';
      });

      // Activate selected tab and panel
      tab.classList.add('active');
      const panel = document.getElementById('tab-' + targetTab);
      if (panel) {
        panel.classList.add('active');
        panel.style.animation = 'fadeInUp 0.35s ease both';
      }
    });
  });

  // Define the fade-in animation via a style injection (avoids extra CSS file edits)
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(14px); }
      to   { opacity: 1; transform: translateY(0); }
    }
  `;
  document.head.appendChild(style);


  /* ──────────────────────────────────────────
     5.  RESERVATION FORM VALIDATION + SUCCESS
  ────────────────────────────────────────── */
  const form        = document.getElementById('reservationForm');
  const successBox  = document.getElementById('formSuccess');

  if (form) {
    // Set minimum date to today
    const dateInput = document.getElementById('res-date');
    if (dateInput) {
      const today = new Date().toISOString().split('T')[0];
      dateInput.setAttribute('min', today);
    }

    // Helper: show/clear field error
    function setError(fieldId, errId, message) {
      const field = document.getElementById(fieldId);
      const err   = document.getElementById(errId);
      if (message) {
        field.classList.add('error');
        err.textContent = message;
      } else {
        field.classList.remove('error');
        err.textContent = '';
      }
    }

    // Clear error on input
    ['res-name', 'res-phone', 'res-date', 'res-time', 'res-party'].forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', () => {
          el.classList.remove('error');
          const errEl = document.getElementById('err-' + id.replace('res-', ''));
          if (errEl) errEl.textContent = '';
        });
      }
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      let valid = true;

      // Name
      const name = document.getElementById('res-name').value.trim();
      if (!name) {
        setError('res-name', 'err-name', 'Please enter your name.');
        valid = false;
      } else {
        setError('res-name', 'err-name', '');
      }

      // Phone — basic US pattern
      const phone = document.getElementById('res-phone').value.trim();
      const phonePattern = /^[\d\s\-()+]{7,15}$/;
      if (!phone) {
        setError('res-phone', 'err-phone', 'Please enter your phone number.');
        valid = false;
      } else if (!phonePattern.test(phone)) {
        setError('res-phone', 'err-phone', 'Please enter a valid phone number.');
        valid = false;
      } else {
        setError('res-phone', 'err-phone', '');
      }

      // Date
      const date = document.getElementById('res-date').value;
      if (!date) {
        setError('res-date', 'err-date', 'Please choose a date.');
        valid = false;
      } else {
        setError('res-date', 'err-date', '');
      }

      // Time
      const time = document.getElementById('res-time').value;
      if (!time) {
        setError('res-time', 'err-time', 'Please select a time.');
        valid = false;
      } else {
        setError('res-time', 'err-time', '');
      }

      // Party size
      const party = document.getElementById('res-party').value;
      if (!party) {
        setError('res-party', 'err-party', 'Please select a party size.');
        valid = false;
      } else {
        setError('res-party', 'err-party', '');
      }

      if (!valid) {
        // Scroll to first error
        const firstError = form.querySelector('.error');
        if (firstError) {
          const top = firstError.getBoundingClientRect().top + window.scrollY - 120;
          window.scrollTo({ top, behavior: 'smooth' });
        }
        return;
      }

      // All valid — show success state
      form.hidden = true;
      successBox.hidden = false;
      successBox.style.animation = 'fadeInUp 0.4s ease both';

      // Scroll to success message
      const top = successBox.getBoundingClientRect().top + window.scrollY - 120;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  }


  /* ──────────────────────────────────────────
     6.  GALLERY: subtle entrance animation
         (Intersection Observer)
  ────────────────────────────────────────── */
  const galleryItems = document.querySelectorAll('.gallery-item');

  if ('IntersectionObserver' in window && galleryItems.length) {
    const galleryObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            // Stagger each item slightly
            setTimeout(() => {
              entry.target.style.opacity    = '1';
              entry.target.style.transform  = 'translateY(0)';
            }, i * 80);
            galleryObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    galleryItems.forEach((item) => {
      item.style.opacity   = '0';
      item.style.transform = 'translateY(20px)';
      item.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      galleryObserver.observe(item);
    });
  }


  /* ──────────────────────────────────────────
     7.  FEATURE / ABOUT CARDS: scroll entrance
  ────────────────────────────────────────── */
  const fadeEls = document.querySelectorAll(
    '.feature-item, .menu-card, .info-card, .about-content, .about-image-wrap'
  );

  if ('IntersectionObserver' in window && fadeEls.length) {
    const fadeObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.opacity   = '1';
            entry.target.style.transform = 'translateY(0)';
            fadeObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    fadeEls.forEach((el) => {
      el.style.opacity    = '0';
      el.style.transform  = 'translateY(18px)';
      el.style.transition = 'opacity 0.55s ease, transform 0.55s ease';
      fadeObserver.observe(el);
    });
  }

})();
