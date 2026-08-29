/**
 * Gabriel Martin R. Manalo — Interaction & Motion Engine
 * Inspired by Emil Kowalski's Design Engineering Principles
 */

// 1. Intersection Observer for Scroll Reveals & Active Navigation
function initScrollObserver() {
  const sections = document.querySelectorAll('.snap-section');
  const navLinks = document.querySelectorAll('.island-link');

  // Reveal observer with 15% threshold for reliable triggering
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const targets = entry.target.querySelectorAll('.reveal-item');
        targets.forEach(t => t.classList.add('is-revealed'));
        if (entry.target.classList.contains('reveal-item')) {
          entry.target.classList.add('is-revealed');
        }
      }
    });
  }, { threshold: 0.15 });

  // Navigation spy observer with centered root margin
  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          const isActive = link.getAttribute('href') === `#${id}`;
          link.classList.toggle('active-nav', isActive);
          link.setAttribute('aria-current', isActive ? 'page' : 'false');
        });
      }
    });
  }, { threshold: 0.4 });

  sections.forEach(section => {
    revealObserver.observe(section);
    navObserver.observe(section);
  });
}

// 2. Light / Dark Theme Toggle with Accessible State
function initThemeToggle() {
  const toggleBtn = document.getElementById('theme-toggle');

  const updateIcon = (theme) => {
    if (toggleBtn) {
      const icon = toggleBtn.querySelector('.theme-icon');
      if (icon) icon.textContent = theme === 'light' ? '☾' : '☼';
    }
  };

  const applyTheme = (theme) => {
    if (theme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('portfolio-theme', 'light');
      updateIcon('light');
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('portfolio-theme', 'dark');
      updateIcon('dark');
    }
  };

  const savedTheme = localStorage.getItem('portfolio-theme');
  applyTheme(savedTheme || 'dark');

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const isCurrentlyLight = document.documentElement.getAttribute('data-theme') === 'light';
      applyTheme(isCurrentlyLight ? 'dark' : 'light');
    });
  }
}

// 3. Text Scramble Animation (Respects Reduced Motion)
class TextScramble {
  constructor(el) {
    this.el = el;
    this.chars = '!<>-_\\/[]{}—=+*^?#________';
    this.update = this.update.bind(this);
  }
  
  setText(newText) {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      this.el.textContent = newText;
      return Promise.resolve();
    }

    const oldText = this.el.innerText;
    const length = Math.max(oldText.length, newText.length);
    const promise = new Promise((resolve) => (this.resolve = resolve));
    this.queue = [];
    
    for (let i = 0; i < length; i++) {
      const from = oldText[i] || '';
      const to = newText[i] || '';
      const start = Math.floor(Math.random() * 16);
      const end = start + Math.floor(Math.random() * 16);
      this.queue.push({ from, to, start, end });
    }
    
    cancelAnimationFrame(this.frameRequest);
    this.frame = 0;
    this.update();
    return promise;
  }
  
  update() {
    let output = '';
    let complete = 0;
    for (let i = 0, n = this.queue.length; i < n; i++) {
      let { from, to, start, end, char } = this.queue[i];
      if (this.frame >= end) {
        complete++;
        output += to;
      } else if (this.frame >= start) {
        if (!char || Math.random() < 0.25) {
          char = this.chars[Math.floor(Math.random() * this.chars.length)];
          this.queue[i].char = char;
        }
        output += `<span style="opacity: 0.4;">${char}</span>`;
      } else {
        output += from;
      }
    }
    this.el.innerHTML = output;
    if (complete === this.queue.length) {
      this.resolve();
    } else {
      this.frameRequest = requestAnimationFrame(this.update);
      this.frame++;
    }
  }
}

function initScrambleEffects() {
  const targets = document.querySelectorAll('.scramble-target');
  targets.forEach((target) => {
    const originalText = target.textContent;
    const fx = new TextScramble(target);
    setTimeout(() => fx.setText(originalText), 150);
    target.addEventListener('mouseenter', () => fx.setText(originalText));
  });
}

// 4. Tactile Form Feedback (Rules 20 & 21: Loading & Success States)
function initContactForm() {
  const form = document.querySelector('.contact-form');
  const submitBtn = document.querySelector('.btn-submit');
  if (!form || !submitBtn) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (submitBtn.classList.contains('is-submitting')) return;

    submitBtn.classList.add('is-submitting');
    const originalContent = submitBtn.innerHTML;
    submitBtn.innerHTML = `<span>Sending...</span>`;

    setTimeout(() => {
      submitBtn.classList.remove('is-submitting');
      submitBtn.classList.add('is-success');
      submitBtn.innerHTML = `<span>Message Sent ✓</span>`;
      form.reset();

      setTimeout(() => {
        submitBtn.classList.remove('is-success');
        submitBtn.innerHTML = originalContent;
      }, 3000);
    }, 700);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initScrollObserver();
  initThemeToggle();
  initScrambleEffects();
  initContactForm();
});