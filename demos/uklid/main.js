/**
 * LOPE — Úklidová firma Kladno
 * Main interactivity script
 */

(function () {
  'use strict';

  /* ── Mobile menu toggle ── */
  const menuToggle = document.getElementById('menu-toggle');
  const navMobile = document.getElementById('nav-mobile');

  if (menuToggle && navMobile) {
    menuToggle.addEventListener('click', () => {
      const isOpen = navMobile.classList.contains('open');
      
      menuToggle.classList.toggle('active', !isOpen);
      navMobile.classList.toggle('open', !isOpen);
      document.body.style.overflow = !isOpen ? 'hidden' : '';
    });

    // Close mobile menu on link click
    navMobile.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        menuToggle.classList.remove('active');
        navMobile.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  /* ── Smooth scroll for anchor links ── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        
        // Let's close mobile nav just in case
        if (menuToggle && navMobile) {
          menuToggle.classList.remove('active');
          navMobile.classList.remove('open');
          document.body.style.overflow = '';
        }

        targetEl.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  /* ── Contact form submission feedback ── */
  const form = document.getElementById('contact-form');

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      const submitBtn = form.querySelector('.form-submit');
      if (!submitBtn) return;

      const originalText = submitBtn.innerHTML;

      // Visual state during processing / success
      submitBtn.innerHTML = 'Odesílám...';
      submitBtn.disabled = true;

      setTimeout(() => {
        submitBtn.innerHTML = '✓ Poptávka odeslána!';
        submitBtn.style.background = 'var(--c-success, #2c5843)';
        submitBtn.style.borderColor = 'var(--c-success, #2c5843)';
        
        // Reset form input
        form.reset();

        setTimeout(() => {
          submitBtn.innerHTML = originalText;
          submitBtn.style.background = '';
          submitBtn.style.borderColor = '';
          submitBtn.disabled = false;
        }, 3000);

      }, 1000);
    });
  }

})();
