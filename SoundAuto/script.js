/* =============================================
   Sound Auto Repair — script.js
   Smooth scroll | Active nav | Counter animation
   Form handler | Mobile nav
   ============================================= */

(function () {
  'use strict';

  /* -------------------------------------------
     DOM HELPERS
  ------------------------------------------- */
  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];


  /* -------------------------------------------
     NAVBAR: sticky shadow + active link
  ------------------------------------------- */
  const navbar    = $('#navbar');
  const navLinks  = $$('.nav-link');
  const sections  = $$('section[id]');
  const navToggle = $('#navToggle');
  const navMenu   = $('#navLinks');

  // Scrolled shadow
  function handleNavScroll() {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  }
  window.addEventListener('scroll', handleNavScroll, { passive: true });
  handleNavScroll();

  // Active link highlight
  function updateActiveNav() {
    const scrollY = window.scrollY + 100;
    let current   = '';

    sections.forEach(section => {
      if (scrollY >= section.offsetTop) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  }
  window.addEventListener('scroll', updateActiveNav, { passive: true });
  updateActiveNav();

  // Mobile nav toggle
  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      const isOpen = navMenu.classList.toggle('open');
      navToggle.innerHTML = isOpen
        ? '<i class="bi bi-x-lg"></i>'
        : '<i class="bi bi-list"></i>';
      navToggle.setAttribute('aria-expanded', isOpen);
    });

    // Close menu when a link is clicked
    $$('a', navMenu).forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
        navToggle.innerHTML = '<i class="bi bi-list"></i>';
        navToggle.setAttribute('aria-expanded', false);
      });
    });
  }


  /* -------------------------------------------
     SMOOTH SCROLL for all # links
  ------------------------------------------- */
  document.addEventListener('click', e => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;

    const targetId = link.getAttribute('href').slice(1);
    if (!targetId) return;

    const target = document.getElementById(targetId);
    if (!target) return;

    e.preventDefault();
    const navH   = navbar ? navbar.offsetHeight : 0;
    const top    = target.getBoundingClientRect().top + window.scrollY - navH - 8;

    window.scrollTo({ top, behavior: 'smooth' });
  });


  /* -------------------------------------------
     COUNTER ANIMATION
     Triggers once when stats bar enters viewport
  ------------------------------------------- */
  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function animateCounter(el, target, duration = 2000) {
    const start     = performance.now();
    const isLarge   = target >= 1000;
    const suffix    = el.nextElementSibling; // .stat-suffix span

    function frame(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased    = easeOutCubic(progress);
      const value    = Math.round(eased * target);

      // Format with commas for large numbers
      el.textContent = isLarge
        ? value.toLocaleString('en-US')
        : String(value);

      if (progress < 1) {
        requestAnimationFrame(frame);
      } else {
        el.textContent = isLarge
          ? target.toLocaleString('en-US')
          : String(target);
      }
    }

    requestAnimationFrame(frame);
  }

  // Observe stats bar
  const statsBar    = $('.stats-bar');
  let countersRan   = false;

  if (statsBar && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && !countersRan) {
          countersRan = true;
          $$('.stat-number[data-target]').forEach(el => {
            const target = parseInt(el.getAttribute('data-target'), 10);
            animateCounter(el, target);
          });
          observer.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    observer.observe(statsBar);
  }


  /* -------------------------------------------
     APPOINTMENT FORM: success handler
  ------------------------------------------- */
  const form        = $('#appointmentForm');
  const formSuccess = $('#formSuccess');

  if (form && formSuccess) {
    form.addEventListener('submit', e => {
      e.preventDefault();

      // Basic HTML5 validation check
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      // Simulate submission (replace with real fetch/API call as needed)
      const submitBtn = form.querySelector('[type="submit"]');
      const originalHTML = submitBtn.innerHTML;

      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="bi bi-hourglass-split"></i> Sending...';

      setTimeout(() => {
        form.style.display     = 'none';
        formSuccess.style.display = 'block';

        // Scroll form area into view smoothly
        const wrap = $('.appointment-form-wrap');
        if (wrap) {
          const navH = navbar ? navbar.offsetHeight : 0;
          const top  = wrap.getBoundingClientRect().top + window.scrollY - navH - 20;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      }, 1200);
    });
  }


  /* -------------------------------------------
     SERVICE CARD: keyboard accessibility
     (Enter / Space triggers hover style + focus)
  ------------------------------------------- */
  $$('.service-card').forEach(card => {
    card.setAttribute('tabindex', '0');
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        const link = card.querySelector('a');
        if (link) link.click();
      }
    });
  });


  /* -------------------------------------------
     SCROLL-REVEAL: fade-in on scroll
     Lightweight, no library needed
  ------------------------------------------- */
  const revealTargets = [
    '.service-card',
    '.why-card',
    '.testimonial-card',
    '.stat-item',
    '.about-text',
    '.about-image-wrap',
    '.sidebar-card',
  ];

  if ('IntersectionObserver' in window) {
    // Add initial hidden state via JS (not CSS) so non-JS users see content
    const style = document.createElement('style');
    style.textContent = `
      .reveal-hidden {
        opacity: 0;
        transform: translateY(24px);
        transition: opacity 0.55s ease, transform 0.55s ease;
      }
      .reveal-hidden.revealed {
        opacity: 1;
        transform: translateY(0);
      }
    `;
    document.head.appendChild(style);

    const revealObserver = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    revealTargets.forEach(sel => {
      $$(sel).forEach((el, i) => {
        el.classList.add('reveal-hidden');
        // Stagger siblings within same parent
        el.style.transitionDelay = `${(i % 4) * 80}ms`;
        revealObserver.observe(el);
      });
    });
  }


  /* -------------------------------------------
     PREFERRED DATE: default to tomorrow,
     disable past dates
  ------------------------------------------- */
  const dateInput = $('#preferred_date');
  if (dateInput) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yyyy = tomorrow.getFullYear();
    const mm   = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const dd   = String(tomorrow.getDate()).padStart(2, '0');
    const minDate = `${yyyy}-${mm}-${dd}`;
    dateInput.setAttribute('min', minDate);
    dateInput.value = minDate;
  }

})();
