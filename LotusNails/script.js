/* ============================================================
   LOTUS NAIL STUDIO — script.js
   ============================================================ */

'use strict';

// ============================================================
// Utility: run after DOM ready
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initMobileMenu();
  initSmoothScroll();
  initActiveNav();
  initScrollAnimations();
  initGalleryLightbox();
  initBookingForm();
  initFooterYear();
});

// ============================================================
// 1. NAVBAR — shadow on scroll
// ============================================================
function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  const onScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run once on load
}

// ============================================================
// 2. MOBILE MENU — hamburger toggle
// ============================================================
function initMobileMenu() {
  const toggle = document.getElementById('navToggle');
  const menu   = document.getElementById('navMenu');
  if (!toggle || !menu) return;

  toggle.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('open');
    toggle.classList.toggle('open', isOpen);
    toggle.setAttribute('aria-expanded', String(isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Close when a nav link is clicked
  menu.querySelectorAll('.nav-link, .nav-cta').forEach(link => {
    link.addEventListener('click', () => {
      menu.classList.remove('open');
      toggle.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  // Close on Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && menu.classList.contains('open')) {
      menu.classList.remove('open');
      toggle.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      toggle.focus();
    }
  });
}

// ============================================================
// 3. SMOOTH SCROLL — for anchor links
// ============================================================
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const targetId = anchor.getAttribute('href');
      if (!targetId || targetId === '#') return;

      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

// ============================================================
// 4. ACTIVE NAV — highlight current section in navbar
// ============================================================
function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');
  if (!sections.length || !navLinks.length) return;

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          const href = link.getAttribute('href');
          link.classList.toggle('active', href === `#${id}`);
        });
      });
    },
    { rootMargin: '-30% 0px -60% 0px', threshold: 0 }
  );

  sections.forEach(section => observer.observe(section));
}

// ============================================================
// 5. SCROLL ANIMATIONS — fade-in on scroll
// ============================================================
function initScrollAnimations() {
  // Add fade-in class to key elements
  const targets = [
    '.service-card',
    '.gallery-item',
    '.about-copy',
    '.about-image-wrap',
    '.section-header',
    '.booking-form-wrap',
    '.booking-info',
  ];

  targets.forEach((selector, groupIndex) => {
    document.querySelectorAll(selector).forEach((el, i) => {
      el.classList.add('fade-in');
      // Stagger children within a group
      if (i < 4) {
        el.classList.add(`fade-in-delay-${i + 1}`);
      }
    });
  });

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target); // animate once
        }
      });
    },
    { threshold: 0.12 }
  );

  document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
}

// ============================================================
// 6. GALLERY LIGHTBOX
// ============================================================
function initGalleryLightbox() {
  const lightbox     = document.getElementById('lightbox');
  const lightboxImg  = document.getElementById('lightboxImg');
  const lightboxClose = document.getElementById('lightboxClose');
  const galleryItems = document.querySelectorAll('.gallery-item[data-lightbox]');

  if (!lightbox || !lightboxImg || !galleryItems.length) return;

  function openLightbox(src, alt) {
    lightboxImg.src = src;
    lightboxImg.alt = alt;
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
    lightboxClose.focus();
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
    // Return focus to the item that opened it
    if (lightbox._triggerEl) {
      lightbox._triggerEl.focus();
    }
  }

  galleryItems.forEach(item => {
    const img = item.querySelector('img');
    if (!img) return;

    // Make item focusable
    item.setAttribute('tabindex', '0');
    item.setAttribute('role', 'button');
    item.setAttribute('aria-label', `View full image: ${img.alt}`);

    const open = () => {
      lightbox._triggerEl = item;
      openLightbox(img.src, img.alt);
    };

    item.addEventListener('click', open);
    item.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        open();
      }
    });
  });

  lightboxClose.addEventListener('click', closeLightbox);

  // Click outside image to close
  lightbox.addEventListener('click', e => {
    if (e.target === lightbox) closeLightbox();
  });

  // Escape key to close
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && lightbox.classList.contains('open')) {
      closeLightbox();
    }
  });

  // Arrow keys to navigate
  document.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('open')) return;

    const items   = Array.from(galleryItems);
    const current = lightbox._triggerEl;
    const idx     = items.indexOf(current);

    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      const next = items[(idx + 1) % items.length];
      const img  = next.querySelector('img');
      lightbox._triggerEl = next;
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt;
    }

    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      const prev = items[(idx - 1 + items.length) % items.length];
      const img  = prev.querySelector('img');
      lightbox._triggerEl = prev;
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt;
    }
  });
}

// ============================================================
// 7. BOOKING FORM — success handler + basic validation
// ============================================================
function initBookingForm() {
  const form        = document.getElementById('bookingForm');
  const successMsg  = document.getElementById('formSuccess');
  if (!form || !successMsg) return;

  // Set minimum date to today
  const dateInput = document.getElementById('prefDate');
  if (dateInput) {
    const today = new Date();
    const yyyy  = today.getFullYear();
    const mm    = String(today.getMonth() + 1).padStart(2, '0');
    const dd    = String(today.getDate()).padStart(2, '0');
    dateInput.setAttribute('min', `${yyyy}-${mm}-${dd}`);
  }

  form.addEventListener('submit', e => {
    e.preventDefault();

    // Basic HTML5 validation
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    // Collect form data (in a real app, send to backend / booking API)
    const data = {
      name:    document.getElementById('clientName')?.value,
      phone:   document.getElementById('clientPhone')?.value,
      service: document.getElementById('service')?.value,
      date:    document.getElementById('prefDate')?.value,
      time:    document.getElementById('prefTime')?.value,
      notes:   document.getElementById('notes')?.value,
    };

    console.log('Booking request:', data);

    // Show success message
    form.style.display = 'none';
    successMsg.classList.add('visible');
    successMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
}

// ============================================================
// 8. FOOTER YEAR — keep copyright current
// ============================================================
function initFooterYear() {
  const yearEl = document.getElementById('footerYear');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
}
