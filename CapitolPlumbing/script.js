/**
 * Capitol Plumbing & Drain — script.js
 * Handles: sticky nav, smooth scroll, scroll-reveal, mobile menu,
 *          form validation + success state, click-to-call tracking,
 *          back-to-top button, footer year
 */

'use strict';

/* ==========================================================================
   Utility helpers
   ========================================================================== */

/**
 * Throttle a function so it fires at most once per `limit` ms.
 * @param {Function} fn
 * @param {number} limit
 * @returns {Function}
 */
function throttle(fn, limit) {
  let lastRan = 0;
  return function (...args) {
    const now = Date.now();
    if (now - lastRan >= limit) {
      lastRan = now;
      fn.apply(this, args);
    }
  };
}

/**
 * Query helper — returns first match or null.
 * @param {string} sel
 * @param {Element} [ctx=document]
 * @returns {Element|null}
 */
const $ = (sel, ctx = document) => ctx.querySelector(sel);

/**
 * QueryAll helper — returns Array.
 * @param {string} sel
 * @param {Element} [ctx=document]
 * @returns {Element[]}
 */
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));


/* ==========================================================================
   1. Footer year
   ========================================================================== */
(function setFooterYear() {
  const el = $('#footerYear');
  if (el) el.textContent = new Date().getFullYear();
})();


/* ==========================================================================
   2. Sticky navbar
   ========================================================================== */
(function stickyNav() {
  const navbar = $('#navbar');
  if (!navbar) return;

  const SCROLL_THRESHOLD = 60;

  function updateNav() {
    if (window.scrollY > SCROLL_THRESHOLD) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', throttle(updateNav, 80), { passive: true });
  updateNav(); // run on load in case page is already scrolled
})();


/* ==========================================================================
   3. Active nav link on scroll (Intersection Observer)
   ========================================================================== */
(function activeNavLink() {
  const sections = $$('section[id], div[id]');
  const navLinks = $$('.nav-link');
  if (!sections.length || !navLinks.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navLinks.forEach((link) => {
            const href = link.getAttribute('href');
            if (href === `#${id}`) {
              link.classList.add('active');
            } else {
              link.classList.remove('active');
            }
          });
        }
      });
    },
    {
      rootMargin: '-40% 0px -55% 0px',
      threshold: 0,
    }
  );

  sections.forEach((section) => observer.observe(section));
})();


/* ==========================================================================
   4. Mobile nav toggle
   ========================================================================== */
(function mobileNav() {
  const toggle = $('#navToggle');
  const menu   = $('#navMenu');
  const icon   = $('#toggleIcon');
  if (!toggle || !menu) return;

  function openMenu() {
    menu.classList.add('open');
    toggle.setAttribute('aria-expanded', 'true');
    if (icon) {
      icon.classList.remove('bi-list');
      icon.classList.add('bi-x-lg');
    }
    document.addEventListener('click', handleOutsideClick);
    document.addEventListener('keydown', handleEscape);
  }

  function closeMenu() {
    menu.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    if (icon) {
      icon.classList.remove('bi-x-lg');
      icon.classList.add('bi-list');
    }
    document.removeEventListener('click', handleOutsideClick);
    document.removeEventListener('keydown', handleEscape);
  }

  function handleOutsideClick(e) {
    const navbar = $('#navbar');
    if (navbar && !navbar.contains(e.target)) {
      closeMenu();
    }
  }

  function handleEscape(e) {
    if (e.key === 'Escape') {
      closeMenu();
      toggle.focus();
    }
  }

  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    if (menu.classList.contains('open')) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  // Close when a nav link is clicked (smooth scroll takes over)
  menu.addEventListener('click', (e) => {
    if (e.target.classList.contains('nav-link') || e.target.closest('.nav-link')) {
      closeMenu();
    }
  });
})();


/* ==========================================================================
   5. Smooth scroll for anchor links
   ========================================================================== */
(function smoothScroll() {
  const NAVBAR_H = parseInt(
    getComputedStyle(document.documentElement).getPropertyValue('--navbar-h') || '70',
    10
  );
  const OFFSET = NAVBAR_H + 16; // extra breathing room

  document.addEventListener('click', (e) => {
    const anchor = e.target.closest('a[href^="#"]');
    if (!anchor) return;

    const targetId = anchor.getAttribute('href').slice(1);
    if (!targetId) return;

    const target = document.getElementById(targetId);
    if (!target) return;

    e.preventDefault();

    const top = target.getBoundingClientRect().top + window.scrollY - OFFSET;

    window.scrollTo({
      top: Math.max(0, top),
      behavior: 'smooth',
    });

    // Update URL hash without jumping
    history.pushState(null, '', `#${targetId}`);

    // Move focus to section for accessibility
    target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
    target.addEventListener(
      'blur',
      () => target.removeAttribute('tabindex'),
      { once: true }
    );
  });
})();


/* ==========================================================================
   6. Scroll-reveal animations (Intersection Observer)
   ========================================================================== */
(function scrollReveal() {
  const reveals = $$('.reveal');
  if (!reveals.length) return;

  // Respect prefers-reduced-motion
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) {
    reveals.forEach((el) => el.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target); // animate once only
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: '0px 0px -48px 0px',
    }
  );

  reveals.forEach((el) => observer.observe(el));
})();


/* ==========================================================================
   7. Back-to-top button
   ========================================================================== */
(function backToTop() {
  const btn = $('#backToTop');
  if (!btn) return;

  const SHOW_AT = 400;

  function update() {
    if (window.scrollY > SHOW_AT) {
      btn.hidden = false;
      // Small rAF pause ensures transition fires
      requestAnimationFrame(() => btn.classList.add('visible'));
    } else {
      btn.classList.remove('visible');
      btn.addEventListener(
        'transitionend',
        () => {
          if (!btn.classList.contains('visible')) btn.hidden = true;
        },
        { once: true }
      );
    }
  }

  window.addEventListener('scroll', throttle(update, 100), { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();


/* ==========================================================================
   8. Click-to-call tracking simulation
   ========================================================================== */
(function callTracking() {
  const phoneLinks = $$('.phone-link');
  if (!phoneLinks.length) return;

  // Simple in-memory log (would be replaced with GA/GTM in production)
  const callLog = [];

  phoneLinks.forEach((link) => {
    link.addEventListener('click', function handleCallClick() {
      const source = this.dataset.track || 'unknown';
      const entry = {
        event:     'click_to_call',
        source:    source,
        number:    this.textContent.trim().replace(/[^0-9+]/g, ''),
        timestamp: new Date().toISOString(),
        page:      window.location.href,
      };

      callLog.push(entry);

      // Console output simulates sending to an analytics endpoint
      console.info('[CallTracking] Event captured:', entry);

      // Visual feedback — brief checkmark badge
      const el = this;
      el.classList.add('phone-tracked');
      setTimeout(() => el.classList.remove('phone-tracked'), 2000);

      // In production: window.dataLayer?.push({ event: 'click_to_call', ...entry });
    });
  });

  // Expose log on window for debugging / demo purposes
  window._callLog = callLog;
})();


/* ==========================================================================
   9. Service request form — validation + success state
   ========================================================================== */
(function serviceForm() {
  const form        = $('#serviceForm');
  const successEl   = $('#formSuccess');
  const resetBtn    = $('#resetFormBtn');
  const submitBtn   = $('#submitBtn');
  if (!form || !successEl) return;

  /* -----------------------------------------------------------------------
     Validation rules
     ----------------------------------------------------------------------- */
  const RULES = {
    name: {
      required: true,
      minLength: 2,
      messages: {
        required:  'Please enter your full name.',
        minLength: 'Name must be at least 2 characters.',
      },
    },
    phone: {
      required: true,
      pattern:  /^[\d\s().+\-]{7,}$/,
      messages: {
        required: 'Please enter your phone number.',
        pattern:  'Please enter a valid phone number.',
      },
    },
    service: {
      required: true,
      messages: {
        required: 'Please select the service you need.',
      },
    },
  };

  /**
   * Validate a single field.
   * @param {HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement} field
   * @returns {{ valid: boolean, message: string }}
   */
  function validateField(field) {
    const rule = RULES[field.name];
    if (!rule) return { valid: true, message: '' };

    const val = field.value.trim();

    if (rule.required && val === '') {
      return { valid: false, message: rule.messages.required };
    }
    if (rule.minLength && val.length < rule.minLength) {
      return { valid: false, message: rule.messages.minLength };
    }
    if (rule.pattern && !rule.pattern.test(val)) {
      return { valid: false, message: rule.messages.pattern };
    }

    return { valid: true, message: '' };
  }

  /**
   * Apply or clear the visual error state for a field.
   * @param {HTMLElement} field
   * @param {{ valid: boolean, message: string }} result
   */
  function applyValidationUI(field, result) {
    const errorEl = document.getElementById(`${field.id}-error`);
    if (result.valid) {
      field.classList.remove('is-invalid');
      field.classList.add('is-valid');
      if (errorEl) errorEl.textContent = '';
    } else {
      field.classList.add('is-invalid');
      field.classList.remove('is-valid');
      if (errorEl) errorEl.textContent = result.message;
    }
  }

  /* -----------------------------------------------------------------------
     Live validation on blur (after first interaction)
     ----------------------------------------------------------------------- */
  const touchedFields = new Set();

  form.addEventListener('blur', (e) => {
    const field = e.target;
    if (!field.name || !RULES[field.name]) return;
    touchedFields.add(field.name);
    applyValidationUI(field, validateField(field));
  }, true); // capture phase to catch select blur

  form.addEventListener('input', (e) => {
    const field = e.target;
    if (!field.name || !RULES[field.name]) return;
    if (!touchedFields.has(field.name)) return; // only re-validate touched fields
    applyValidationUI(field, validateField(field));
  });

  /* -----------------------------------------------------------------------
     Submit handler
     ----------------------------------------------------------------------- */
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Validate all required fields on submit
    const fieldsToValidate = $$('[name]', form).filter((f) => RULES[f.name]);
    let firstInvalid = null;

    fieldsToValidate.forEach((field) => {
      touchedFields.add(field.name);
      const result = validateField(field);
      applyValidationUI(field, result);
      if (!result.valid && !firstInvalid) {
        firstInvalid = field;
      }
    });

    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }

    // --- Simulate async submission ---
    setLoadingState(true);

    const formData = collectFormData();
    console.info('[ServiceForm] Submission payload:', formData);

    await simulateNetworkDelay(1200);

    setLoadingState(false);
    showSuccess();
  });

  /**
   * Collect form values into a plain object.
   * @returns {Object}
   */
  function collectFormData() {
    return {
      name:           $('#fname', form)?.value.trim()  || '',
      phone:          $('#fphone', form)?.value.trim() || '',
      service:        $('#fservice', form)?.value      || '',
      description:    $('#fdescription', form)?.value.trim() || '',
      preferred_time: $('#ftime', form)?.value         || '',
      submitted_at:   new Date().toISOString(),
    };
  }

  /**
   * Toggle the submit button's loading state.
   * @param {boolean} loading
   */
  function setLoadingState(loading) {
    if (!submitBtn) return;
    if (loading) {
      submitBtn.classList.add('is-loading');
      submitBtn.disabled = true;
      submitBtn.setAttribute('aria-busy', 'true');
    } else {
      submitBtn.classList.remove('is-loading');
      submitBtn.disabled = false;
      submitBtn.removeAttribute('aria-busy');
    }
  }

  /**
   * Simulate a network round-trip delay.
   * @param {number} ms
   * @returns {Promise<void>}
   */
  function simulateNetworkDelay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /** Show success state, hide form. */
  function showSuccess() {
    form.hidden = true;
    successEl.hidden = false;
    successEl.focus();

    // Scroll success message into view
    successEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  /* -----------------------------------------------------------------------
     Reset / submit another
     ----------------------------------------------------------------------- */
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      form.reset();
      touchedFields.clear();

      // Remove validation classes
      $$('.form-control', form).forEach((f) => {
        f.classList.remove('is-valid', 'is-invalid');
      });
      $$('.form-error', form).forEach((e) => (e.textContent = ''));

      successEl.hidden = true;
      form.hidden = false;

      // Focus first field
      const firstField = $('#fname', form);
      if (firstField) firstField.focus();
    });
  }

  /* -----------------------------------------------------------------------
     Phone number auto-formatting (US format)
     ----------------------------------------------------------------------- */
  const phoneField = $('#fphone', form);
  if (phoneField) {
    phoneField.addEventListener('input', function () {
      let digits = this.value.replace(/\D/g, '').slice(0, 10);
      let formatted = digits;

      if (digits.length >= 7) {
        formatted = `(${digits.slice(0,3)}) ${digits.slice(3,6)}-${digits.slice(6)}`;
      } else if (digits.length >= 4) {
        formatted = `(${digits.slice(0,3)}) ${digits.slice(3)}`;
      } else if (digits.length > 0) {
        formatted = `(${digits}`;
      }

      // Only update if value has actually changed to avoid cursor jumps
      if (this.value !== formatted) {
        const cursor = this.selectionStart;
        this.value = formatted;
        // Best-effort cursor restoration
        try { this.setSelectionRange(cursor, cursor); } catch (_) {}
      }
    });
  }
})();


/* ==========================================================================
   10. Navbar position offset on initial load (hash in URL)
   ========================================================================== */
(function handleInitialHash() {
  if (!window.location.hash) return;

  const targetId = window.location.hash.slice(1);
  const target   = document.getElementById(targetId);
  if (!target) return;

  // Wait for layout to settle, then scroll with offset
  window.addEventListener('load', () => {
    setTimeout(() => {
      const navbarH = parseInt(
        getComputedStyle(document.documentElement).getPropertyValue('--navbar-h') || '70',
        10
      );
      const top = target.getBoundingClientRect().top + window.scrollY - navbarH - 16;
      window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
    }, 100);
  });
})();
