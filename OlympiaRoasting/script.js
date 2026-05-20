/* ============================================================
   OLYMPIA ROASTING CO. — script.js
   Smooth scroll, sticky nav, tab switching, scroll-reveal,
   animated counters, toast notifications, CTA interactions
   ============================================================ */

'use strict';

/* ============================================================
   1. STICKY NAVBAR — shadow on scroll
   ============================================================ */
(function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  let ticking = false;

  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(() => {
        if (window.scrollY > 20) {
          navbar.classList.add('scrolled');
        } else {
          navbar.classList.remove('scrolled');
        }
        ticking = false;
      });
      ticking = true;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // Run once on init
})();


/* ============================================================
   2. MOBILE NAV TOGGLE
   ============================================================ */
(function initMobileNav() {
  const toggle = document.getElementById('navToggle');
  const menu   = document.getElementById('navMenu');
  if (!toggle || !menu) return;

  toggle.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(isOpen));
    // Swap icon
    const icon = toggle.querySelector('i');
    if (icon) {
      icon.className = isOpen ? 'bi bi-x-lg' : 'bi bi-list';
    }
  });

  // Close mobile nav when a link inside it is clicked
  menu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      menu.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      const icon = toggle.querySelector('i');
      if (icon) icon.className = 'bi bi-list';
    });
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!menu.contains(e.target) && !toggle.contains(e.target)) {
      menu.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      const icon = toggle.querySelector('i');
      if (icon) icon.className = 'bi bi-list';
    }
  });
})();


/* ============================================================
   3. SMOOTH SCROLL — all in-page anchor links
   ============================================================ */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();

      // Account for fixed navbar height
      const navbarH = parseInt(
        getComputedStyle(document.documentElement)
          .getPropertyValue('--navbar-h')
          .trim()
      ) || 68;

      const targetTop = target.getBoundingClientRect().top + window.scrollY - navbarH;

      window.scrollTo({ top: targetTop, behavior: 'smooth' });
    });
  });
})();


/* ============================================================
   4. TAB SWITCHER — Menu section
   ============================================================ */
(function initTabs() {
  const tabBtns   = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');
  if (!tabBtns.length) return;

  function activateTab(targetId) {
    // Deactivate all
    tabBtns.forEach(btn => {
      btn.classList.remove('active');
      btn.setAttribute('aria-selected', 'false');
    });
    tabPanels.forEach(panel => {
      panel.classList.remove('active', 'fade-in');
    });

    // Activate target
    const targetBtn   = document.querySelector(`[data-tab="${targetId}"]`);
    const targetPanel = document.getElementById(`tab-${targetId}`);

    if (targetBtn) {
      targetBtn.classList.add('active');
      targetBtn.setAttribute('aria-selected', 'true');
    }

    if (targetPanel) {
      targetPanel.classList.add('active');
      // Trigger fade-in on next frame so CSS transition fires
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          targetPanel.classList.add('fade-in');
        });
      });
    }
  }

  // Set initial state
  const firstActive = document.querySelector('.tab-btn.active');
  if (firstActive) {
    const id = firstActive.dataset.tab;
    const panel = document.getElementById(`tab-${id}`);
    if (panel) {
      requestAnimationFrame(() => requestAnimationFrame(() => panel.classList.add('fade-in')));
    }
  }

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      activateTab(btn.dataset.tab);
    });

    // Keyboard: arrow keys for tab navigation
    btn.addEventListener('keydown', (e) => {
      const btnsArr = Array.from(tabBtns);
      const idx = btnsArr.indexOf(btn);

      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        const next = btnsArr[(idx + 1) % btnsArr.length];
        next.focus();
        activateTab(next.dataset.tab);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        const prev = btnsArr[(idx - 1 + btnsArr.length) % btnsArr.length];
        prev.focus();
        activateTab(prev.dataset.tab);
      }
    });
  });
})();


/* ============================================================
   5. SCROLL-REVEAL ANIMATIONS — IntersectionObserver
   ============================================================ */
(function initScrollReveal() {
  const elements = document.querySelectorAll('.reveal');
  if (!elements.length) return;

  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  if (prefersReducedMotion) {
    elements.forEach(el => el.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    }
  );

  elements.forEach(el => observer.observe(el));
})();


/* ============================================================
   6. ANIMATED COUNTERS
   ============================================================ */
(function initCounters() {
  const counters = document.querySelectorAll('.counter__number');
  if (!counters.length) return;

  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  function formatNumber(n) {
    if (n >= 1000) {
      return n.toLocaleString();
    }
    return String(n);
  }

  function animateCounter(el) {
    const target   = parseInt(el.dataset.target, 10);
    const suffix   = el.dataset.suffix || '';
    const duration = 1800; // ms
    const start    = performance.now();

    if (prefersReducedMotion) {
      el.textContent = formatNumber(target) + suffix;
      return;
    }

    function easeOutQuart(t) {
      return 1 - Math.pow(1 - t, 4);
    }

    function update(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased    = easeOutQuart(progress);
      const current  = Math.round(eased * target);

      el.textContent = formatNumber(current) + suffix;

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = formatNumber(target) + suffix;
      }
    }

    requestAnimationFrame(update);
  }

  // Trigger counters when the counters section is in view
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          animateCounter(el);
          observer.unobserve(el);
        }
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach(counter => observer.observe(counter));
})();


/* ============================================================
   7. TOAST NOTIFICATION SYSTEM
   ============================================================ */
const Toast = (function () {
  const el = document.getElementById('toast');
  let hideTimer = null;

  function show(message, duration = 3000) {
    if (!el) return;
    if (hideTimer) clearTimeout(hideTimer);

    el.textContent = message;
    el.classList.add('show');

    hideTimer = setTimeout(() => {
      el.classList.remove('show');
    }, duration);
  }

  return { show };
})();


/* ============================================================
   8. "BUY BEANS" BUTTON — demo interaction
   ============================================================ */
function handleBuyBeans(btn) {
  const card = btn.closest('.roast-card');
  const name = card ? card.querySelector('.roast-card__name')?.textContent : 'these beans';

  // Visual feedback on button
  const originalHTML = btn.innerHTML;
  btn.innerHTML = '<i class="bi bi-check-lg"></i> Added!';
  btn.disabled = true;
  btn.style.background = '#4a7c59';

  Toast.show(`${name} added to your bag! (Demo — no real purchase)`);

  setTimeout(() => {
    btn.innerHTML = originalHTML;
    btn.disabled = false;
    btn.style.background = '';
  }, 2200);
}


/* ============================================================
   9. "ORDER ONLINE" CTA — demo interaction
   ============================================================ */
(function initOrderCTA() {
  // Attach to any element with href="#menu" that is the .navbar__cta
  const ctaBtn = document.querySelector('.navbar__cta');
  if (!ctaBtn) return;

  ctaBtn.addEventListener('click', () => {
    // Just navigate to menu; toast confirms the intent
    Toast.show('Browse our menu below — order at the counter or call ahead.');
  });
})();


/* ============================================================
   10. HERO — staggered reveal on load
   ============================================================ */
(function initHeroReveal() {
  // Hero elements aren't handled by scroll observer (above fold),
  // so trigger them manually with staggered delays.
  const heroReveals = document.querySelectorAll('.hero .reveal');
  if (!heroReveals.length) return;

  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  heroReveals.forEach((el, i) => {
    if (prefersReducedMotion) {
      el.classList.add('visible');
      return;
    }
    setTimeout(() => {
      el.classList.add('visible');
    }, 120 + i * 140);
  });
})();


/* ============================================================
   11. ACTIVE NAV LINK — highlight current section while scrolling
   ============================================================ */
(function initActiveNav() {
  const sections = document.querySelectorAll('section[id], div[id="hero"]');
  const navLinks = document.querySelectorAll('.navbar__link');
  if (!sections.length || !navLinks.length) return;

  const navbarH = parseInt(
    getComputedStyle(document.documentElement)
      .getPropertyValue('--navbar-h')
      .trim()
  ) || 68;

  let ticking = false;

  function updateActive() {
    const scrollY = window.scrollY + navbarH + 80;

    let current = '';
    sections.forEach(section => {
      if (section.offsetTop <= scrollY) {
        current = section.id;
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      const href = link.getAttribute('href');
      if (href === `#${current}`) {
        link.classList.add('active');
      }
    });
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        updateActive();
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  updateActive();
})();


/* ============================================================
   12. MENU CARD — add to order demo interaction
   ============================================================ */
(function initMenuCardInteraction() {
  // Double-clicking a menu card triggers a "order note" toast
  document.querySelectorAll('.menu-card').forEach(card => {
    card.addEventListener('dblclick', () => {
      const name = card.querySelector('.menu-card__name')?.textContent || 'Item';
      Toast.show(`"${name}" noted — order at the counter!`);
    });
  });
})();


/* ============================================================
   13. INFO BAR — phone link click feedback
   ============================================================ */
(function initPhoneLink() {
  const phoneLink = document.querySelector('.info-bar__item a[href^="tel"]');
  if (!phoneLink) return;

  phoneLink.addEventListener('click', () => {
    Toast.show('Calling Olympia Roasting Co. — (360) 555-0182');
  });
})();
