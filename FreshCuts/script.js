/* =========================================
   Fresh Cuts Barbershop — script.js
   ========================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* ----------------------------------------
     1. Smooth scroll for nav links
     (CSS scroll-behavior handles most cases,
      but this adds offset for sticky navbar)
  ---------------------------------------- */
  const NAVBAR_HEIGHT = () => document.getElementById('navbar')?.offsetHeight || 70;

  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const targetId = link.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();

      const top = target.getBoundingClientRect().top + window.scrollY - NAVBAR_HEIGHT();
      window.scrollTo({ top, behavior: 'smooth' });

      // Close mobile nav if open
      const collapse = document.getElementById('navbarNav');
      if (collapse && collapse.classList.contains('show')) {
        const bsCollapse = bootstrap.Collapse.getInstance(collapse);
        if (bsCollapse) bsCollapse.hide();
      }
    });
  });


  /* ----------------------------------------
     2. Navbar: scroll shadow + sticky class
  ---------------------------------------- */
  const navbar = document.getElementById('navbar');

  function updateNavbar() {
    if (window.scrollY > 20) {
      navbar?.classList.add('scrolled');
    } else {
      navbar?.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', updateNavbar, { passive: true });
  updateNavbar();


  /* ----------------------------------------
     3. Active nav link on scroll
     (IntersectionObserver approach)
  ---------------------------------------- */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('#navbar .nav-link[href^="#"]');

  function setActiveLink(id) {
    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${id}`) {
        link.classList.add('active');
      }
    });
  }

  const observerOptions = {
    root: null,
    rootMargin: `-${NAVBAR_HEIGHT() + 10}px 0px -55% 0px`,
    threshold: 0
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        setActiveLink(entry.target.id);
      }
    });
  }, observerOptions);

  sections.forEach(section => observer.observe(section));


  /* ----------------------------------------
     4. Booking form handler
  ---------------------------------------- */
  const bookingForm = document.getElementById('bookingForm');
  const successAlert = document.getElementById('formSuccess');

  if (bookingForm) {
    bookingForm.addEventListener('submit', e => {
      e.preventDefault();

      // Basic validation — Bootstrap does visual feedback
      if (!bookingForm.checkValidity()) {
        bookingForm.classList.add('was-validated');
        return;
      }

      // Simulate a submission (no backend)
      const submitBtn = bookingForm.querySelector('[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Sending...';

      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
        bookingForm.reset();
        bookingForm.classList.remove('was-validated');

        if (successAlert) {
          successAlert.classList.add('show');
          setTimeout(() => successAlert.classList.remove('show'), 6000);
        }
      }, 1400);
    });
  }


  /* ----------------------------------------
     5. Scroll-to-top button
  ---------------------------------------- */
  const scrollTopBtn = document.getElementById('scrollTop');

  if (scrollTopBtn) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 400) {
        scrollTopBtn.classList.add('visible');
      } else {
        scrollTopBtn.classList.remove('visible');
      }
    }, { passive: true });

    scrollTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }


  /* ----------------------------------------
     6. Subtle entrance animations
     (add .visible when element enters view)
  ---------------------------------------- */
  const animateEls = document.querySelectorAll('.animate-on-scroll');

  if (animateEls.length) {
    const animObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          animObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    animateEls.forEach(el => animObserver.observe(el));
  }

});
