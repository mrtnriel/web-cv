/**
 * Gabriel Martin R. Manalo — Portfolio Engine
 * Stable 60fps/120fps Scroll Engine, Dynamic Island Navigation, Accordions, and Carousels.
 */

// --- 1. Scroll Engine: Fade Progress Calculation ---
function initScrollEngine() {
  const scrollThreshold = 300;

  let ticking = false;

  const onScroll = () => {
    const scrollY = window.scrollY || window.pageYOffset;

    // Hero scroll hint opacity calculation
    const progress = Math.min(Math.max(scrollY / scrollThreshold, 0), 1);
    document.documentElement.style.setProperty('--hero-scroll-progress', progress.toFixed(4));

    ticking = false;
  };

  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        window.requestAnimationFrame(onScroll);
        ticking = true;
      }
    },
    { passive: true }
  );

  onScroll();
  window.addEventListener('resize', onScroll, { passive: true });
}

// --- 2. Staggered Scroll Reveal Observer ---
function initScrollReveals() {
  const staggerGroups = document.querySelectorAll('.stagger-group');
  staggerGroups.forEach((group) => {
    const items = group.querySelectorAll('.reveal-item');
    items.forEach((item, index) => {
      item.style.setProperty('--stagger-delay', `${index * 55}ms`);
    });
  });

  const revealItems = document.querySelectorAll('.reveal-item');
  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
  );

  revealItems.forEach((item) => observer.observe(item));
}

// --- 3. Text Scramble Animation ---
class TextScramble {
  constructor(el) {
    this.el = el;
    this.chars = '!<>-_\\/[]{}—=+*^?#________';
    this.update = this.update.bind(this);
  }

  setText(newText) {
    const oldText = this.el.innerText;
    const length = Math.max(oldText.length, newText.length);
    const promise = new Promise((resolve) => (this.resolve = resolve));
    this.queue = [];

    for (let i = 0; i < length; i++) {
      const from = oldText[i] || '';
      const to = newText[i] || '';
      const start = Math.floor(Math.random() * 25);
      const end = start + Math.floor(Math.random() * 25);
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
        if (!char || Math.random() < 0.28) {
          char = this.chars[Math.floor(Math.random() * this.chars.length)];
          this.queue[i].char = char;
        }
        output += `<span style="opacity: 0.45;">${char}</span>`;
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

    fx.setText(originalText);

    target.addEventListener('mouseenter', () => {
      fx.setText(originalText);
    });
  });
}

// --- 4. Interactive Project Accordion ---
function initArtifactAccordion() {
  const artifactItems = document.querySelectorAll('.artifact-item');

  const toggleItem = (item) => {
    const isCurrentlyActive = item.classList.contains('active');

    artifactItems.forEach((other) => {
      other.classList.remove('active');
      other.setAttribute('aria-expanded', 'false');
    });

    if (!isCurrentlyActive) {
      item.classList.add('active');
      item.setAttribute('aria-expanded', 'true');
    }
  };

  artifactItems.forEach((item) => {
    item.addEventListener('click', (e) => {
      if (e.target.closest('.carousel-container') || e.target.closest('.btn-action') || e.target.closest('a')) {
        return;
      }
      toggleItem(item);
    });

    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        if (e.target.closest('.carousel-container') || e.target.closest('.btn-action') || e.target.closest('a')) {
          return;
        }
        e.preventDefault();
        toggleItem(item);
      }
    });
  });
}

// --- 5. Dynamic Island Navigation (Accurate & Jitter-Free) ---
function initNavigation() {
  const sections = document.querySelectorAll('.scroll-section');
  const navLinks = document.querySelectorAll('.island-link');
  let isProgrammaticScrolling = false;
  let scrollTimeout = null;

  navLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href')?.replace('#', '');
      const target = document.getElementById(targetId);
      if (!target) return;

      e.preventDefault();

      navLinks.forEach((l) => l.classList.remove('active-nav'));
      link.classList.add('active-nav');

      isProgrammaticScrolling = true;
      clearTimeout(scrollTimeout);

      const targetTop = target.getBoundingClientRect().top + window.scrollY;
      const topOffset = 80;
      const finalY = Math.max(0, targetTop - topOffset);

      window.scrollTo({
        top: finalY,
        behavior: 'smooth'
      });

      history.pushState(null, '', `#${targetId}`);

      scrollTimeout = setTimeout(() => {
        isProgrammaticScrolling = false;
      }, 750);
    });
  });

  const updateSpy = () => {
    if (isProgrammaticScrolling) return;

    const scrollY = window.scrollY || window.pageYOffset;
    const docHeight = document.documentElement.scrollHeight;
    const windowHeight = window.innerHeight;

    if (windowHeight + scrollY >= docHeight - 80) {
      navLinks.forEach((l) => l.classList.remove('active-nav'));
      const contactLink = document.querySelector('.island-link[href="#contact"]');
      if (contactLink) contactLink.classList.add('active-nav');
      return;
    }

    let currentSectionId = '';
    sections.forEach((section) => {
      const sectionTop = section.getBoundingClientRect().top;
      if (sectionTop <= 160) {
        currentSectionId = section.getAttribute('id');
      }
    });

    if (currentSectionId) {
      navLinks.forEach((l) => l.classList.remove('active-nav'));
      const activeLink = document.querySelector(`.island-link[href="#${currentSectionId}"]`);
      if (activeLink) activeLink.classList.add('active-nav');
    }
  };

  window.addEventListener('scroll', updateSpy, { passive: true });
  updateSpy();
}

// --- 6. Light / Dark Theme Toggle ---
function initThemeToggle() {
  const toggleBtn = document.getElementById('theme-toggle');

  const updateIcon = (theme) => {
    const isDark = theme === 'dark';
    if (toggleBtn) {
      const icon = toggleBtn.querySelector('.theme-icon');
      if (icon) icon.textContent = isDark ? '☼' : '☾';
    }
  };

  const applyTheme = (theme) => {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('portfolio-theme', 'dark');
      updateIcon('dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('portfolio-theme', 'light');
      updateIcon('light');
    }
  };

  const savedTheme = localStorage.getItem('portfolio-theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
  applyTheme(initialTheme);

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const isCurrentlyDark = document.documentElement.getAttribute('data-theme') === 'dark';
      applyTheme(isCurrentlyDark ? 'light' : 'dark');
    });
  }
}

// --- 7. Project Screenshot Carousel ---
function initCarousels() {
  const containers = document.querySelectorAll('.carousel-container');

  containers.forEach((container) => {
    const track = container.querySelector('.carousel-track');
    const slides = Array.from(track.querySelectorAll('.carousel-slide'));
    const nextBtn = container.querySelector('.next-btn');
    const prevBtn = container.querySelector('.prev-btn');
    const dotsNav = container.querySelector('.carousel-indicators');

    let currentIndex = 0;

    slides.forEach((_, idx) => {
      const dot = document.createElement('div');
      dot.classList.add('dot');
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', `Slide ${idx + 1}`);
      if (idx === 0) dot.classList.add('active');

      dot.addEventListener('click', (e) => {
        e.stopPropagation();
        moveToSlide(idx);
      });
      dotsNav.appendChild(dot);
    });

    const dots = Array.from(dotsNav.children);

    const moveToSlide = (index) => {
      if (index < 0) {
        currentIndex = slides.length - 1;
      } else if (index >= slides.length) {
        currentIndex = 0;
      } else {
        currentIndex = index;
      }

      track.style.transform = `translateX(-${currentIndex * 100}%)`;
      dots.forEach((d) => d.classList.remove('active'));
      if (dots[currentIndex]) dots[currentIndex].classList.add('active');
    };

    if (nextBtn) {
      nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        moveToSlide(currentIndex + 1);
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        moveToSlide(currentIndex - 1);
      });
    }

    container.setAttribute('tabindex', '0');
    container.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        e.stopPropagation();
        moveToSlide(currentIndex - 1);
      } else if (e.key === 'ArrowRight') {
        e.stopPropagation();
        moveToSlide(currentIndex + 1);
      }
    });

    let touchStartX = 0;
    let touchEndX = 0;

    track.addEventListener(
      'touchstart',
      (e) => {
        touchStartX = e.changedTouches[0].screenX;
      },
      { passive: true }
    );

    track.addEventListener(
      'touchend',
      (e) => {
        touchEndX = e.changedTouches[0].screenX;
        const diff = touchStartX - touchEndX;
        if (Math.abs(diff) > 40) {
          if (diff > 0) moveToSlide(currentIndex + 1);
          else moveToSlide(currentIndex - 1);
        }
      },
      { passive: true }
    );
  });
}

// --- Initialize All Systems ---
document.addEventListener('DOMContentLoaded', () => {
  initScrollEngine();
  initScrollReveals();
  initScrambleEffects();
  initArtifactAccordion();
  initNavigation();
  initThemeToggle();
  initCarousels();
});