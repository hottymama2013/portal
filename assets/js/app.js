(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ----- Sticky header shadow on scroll -----
  const header = document.querySelector('.site-header');
  const onScroll = () => {
    if (!header) return;
    if (window.scrollY > 12) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ----- Mobile nav toggle -----
  const toggle = document.querySelector('.nav-toggle');
  const mobileNav = document.getElementById('mobile-nav');
  if (toggle && mobileNav) {
    toggle.addEventListener('click', () => {
      const open = toggle.getAttribute('aria-expanded') === 'true';
      const next = !open;
      toggle.setAttribute('aria-expanded', String(next));
      if (next) {
        mobileNav.hidden = false;
        requestAnimationFrame(() => mobileNav.classList.add('open'));
      } else {
        mobileNav.classList.remove('open');
        mobileNav.hidden = true;
      }
    });
    mobileNav.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', () => {
        toggle.setAttribute('aria-expanded', 'false');
        mobileNav.classList.remove('open');
        mobileNav.hidden = true;
      });
    });
  }

  // ----- Reveal-on-scroll using IntersectionObserver -----
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !prefersReducedMotion) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    reveals.forEach((el, i) => {
      el.style.setProperty('--delay', `${(i % 6) * 60}ms`);
      io.observe(el);
    });
  } else {
    reveals.forEach((el) => el.classList.add('in-view'));
  }

  // ----- Animated stat counters -----
  const counters = document.querySelectorAll('[data-count]');
  if ('IntersectionObserver' in window && counters.length && !prefersReducedMotion) {
    const animate = (el) => {
      const target = parseInt(el.dataset.count, 10) || 0;
      const duration = 1600;
      const start = performance.now();
      const easeOut = (t) => 1 - Math.pow(1 - t, 3);
      const step = (now) => {
        const t = Math.min(1, (now - start) / duration);
        const current = Math.floor(easeOut(t) * target);
        el.textContent = current.toLocaleString();
        if (t < 1) requestAnimationFrame(step);
        else el.textContent = target.toLocaleString() + (target >= 1000 ? '+' : '');
      };
      requestAnimationFrame(step);
    };
    const ioc = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animate(entry.target);
            ioc.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );
    counters.forEach((c) => ioc.observe(c));
  } else {
    counters.forEach((c) => {
      const target = parseInt(c.dataset.count, 10) || 0;
      c.textContent = target.toLocaleString() + (target >= 1000 ? '+' : '');
    });
  }

  // ----- Smooth scroll with header offset -----
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const headerH = header ? header.offsetHeight : 0;
      const top = target.getBoundingClientRect().top + window.scrollY - headerH - 12;
      window.scrollTo({ top, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
  });

  // ----- Subtle parallax on hero card -----
  const heroCard = document.querySelector('.hero-card');
  if (heroCard && !prefersReducedMotion && window.matchMedia('(min-width: 980px)').matches) {
    heroCard.addEventListener('mousemove', (e) => {
      const rect = heroCard.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      heroCard.style.transform = `perspective(900px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg)`;
    });
    heroCard.addEventListener('mouseleave', () => {
      heroCard.style.transform = 'perspective(900px) rotateY(0) rotateX(0)';
    });
  }
})();
