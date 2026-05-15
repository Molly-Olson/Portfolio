// Navbar scroll effect
const nav = document.getElementById('mainNav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 60);
});

// Active nav link on scroll
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('#navLinks .nav-link');

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(link => {
        link.classList.toggle(
          'active',
          link.getAttribute('href') === '#' + entry.target.id
        );
      });
    }
  });
}, { threshold: 0.4 });

sections.forEach(s => observer.observe(s));

// Smooth scroll offset for fixed navbar
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = nav.offsetHeight + 16;
    window.scrollTo({ top: target.offsetTop - offset, behavior: 'smooth' });
  });
});
