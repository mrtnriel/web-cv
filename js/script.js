/**
 * Gabriel Martin R. Manalo — Portfolio Engine
 * Implements bryl-minimal design logic, theme switching, live clock,
 * text scramble animations, accordion details, scroll-spy, and screenshot carousel.
 */

// --- 1. Live Time Clock ---
function initLiveClock() {
  const timeElement = document.getElementById('live-time');
  if (!timeElement) return;

  function update() {
    const now = new Date();
    timeElement.textContent = now.toLocaleTimeString('en-GB', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  update();
  setInterval(update, 1000);
}

// --- 2. Text Scramble Animation ---
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
      const start = Math.floor(Math.random() * 30);
      const end = start + Math.floor(Math.random() * 30);
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
        output += `<span style="opacity: 0.5;">${char}</span>`;
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

    // Run on initial load
    fx.setText(originalText);

    // Re-run on hover
    target.addEventListener('mouseenter', () => {
      fx.setText(originalText);
    });
  });
}

// --- 3. Scroll Fade-Up Observer ---
function initScrollObserver() {
  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );

  document.querySelectorAll('.fade-up').forEach((el) => {
    observer.observe(el);
  });
}

// --- 4. Interactive Project Accordion ---
function initArtifactAccordion() {
  const artifactItems = document.querySelectorAll('.artifact-item');

  const toggleItem = (item) => {
    const isCurrentlyActive = item.classList.contains('active');

    // Close all items
    artifactItems.forEach((other) => {
      other.classList.remove('active');
      other.setAttribute('aria-expanded', 'false');
    });

    // Toggle target item
    if (!isCurrentlyActive) {
      item.classList.add('active');
      item.setAttribute('aria-expanded', 'true');
    }
  };

  artifactItems.forEach((item) => {
    // Mouse click
    item.addEventListener('click', (e) => {
      // Prevent toggling if user clicks a direct button or carousel control
      if (e.target.closest('.carousel-container') || e.target.closest('.btn-action') || e.target.closest('a')) {
        return;
      }
      toggleItem(item);
    });

    // Keyboard support (Enter / Space)
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

// --- 5. Scroll-Spy Navigation & Mobile Drawer ---
function initNavigation() {
  const sections = document.querySelectorAll('.scroll-section');
  const navLinks = document.querySelectorAll('.nav-link');
  const mobileToggleBtn = document.getElementById('mobile-nav-toggle');
  const sidebar = document.getElementById('sidebar');

  // Scroll Spy
  const spyObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach((link) => link.classList.remove('active-nav'));
          const activeLink = document.querySelector(`.nav-link[href="#${id}"]`);
          if (activeLink) {
            activeLink.classList.add('active-nav');
          }
        }
      });
    },
    { rootMargin: '-30% 0px -60% 0px', threshold: 0 }
  );

  sections.forEach((sec) => spyObserver.observe(sec));

  // Mobile Drawer Toggle
  if (mobileToggleBtn && sidebar) {
    const toggleMenu = () => {
      const isOpen = sidebar.classList.toggle('open');
      mobileToggleBtn.setAttribute('aria-expanded', isOpen);
      mobileToggleBtn.innerHTML = isOpen ? '<span>[ CLOSE ]</span>' : '<span>[ MENU ]</span>';
    };

    mobileToggleBtn.addEventListener('click', toggleMenu);

    // Close when clicking nav links
    navLinks.forEach((link) => {
      link.addEventListener('click', () => {
        if (window.innerWidth <= 1024) {
          sidebar.classList.remove('open');
          mobileToggleBtn.setAttribute('aria-expanded', 'false');
          mobileToggleBtn.innerHTML = '<span>[ MENU ]</span>';
        }
      });
    });

    // Close on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && sidebar.classList.contains('open')) {
        sidebar.classList.remove('open');
        mobileToggleBtn.setAttribute('aria-expanded', 'false');
        mobileToggleBtn.innerHTML = '<span>[ MENU ]</span>';
      }
    });
  }
}

// --- 6. Light / Dark Theme Toggle ---
function initThemeToggle() {
  const desktopToggle = document.getElementById('theme-toggle');
  const mobileToggle = document.getElementById('mobile-theme-toggle');

  const updateIcons = (theme) => {
    const isDark = theme === 'dark';
    if (desktopToggle) {
      desktopToggle.querySelector('.theme-icon').textContent = isDark ? '☼' : '☾';
      desktopToggle.querySelector('.theme-text').textContent = isDark ? 'LIGHT' : 'DARK';
    }
    if (mobileToggle) {
      mobileToggle.textContent = isDark ? '☼' : '☾';
    }
  };

  const applyTheme = (theme) => {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('portfolio-theme', 'dark');
      updateIcons('dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('portfolio-theme', 'light');
      updateIcons('light');
    }
  };

  // Check saved theme or system preference
  const savedTheme = localStorage.getItem('portfolio-theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
  applyTheme(initialTheme);

  const toggleTheme = () => {
    const isCurrentlyDark = document.documentElement.getAttribute('data-theme') === 'dark';
    applyTheme(isCurrentlyDark ? 'light' : 'dark');
  };

  if (desktopToggle) desktopToggle.addEventListener('click', toggleTheme);
  if (mobileToggle) mobileToggle.addEventListener('click', toggleTheme);
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

    // Build indicator dots
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

    // Button controls
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

    // Keyboard Arrow Controls
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

    // Touch Swipe Gesture Support
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

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
  initLiveClock();
  initScrambleEffects();
  initScrollObserver();
  initArtifactAccordion();
  initNavigation();
  initThemeToggle();
  initCarousels();
});