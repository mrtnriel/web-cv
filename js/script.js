/**
 * Gabriel Martin R. Manalo — Interaction & Motion Engine 2.0
 * Pure Vanilla Architecture • Web Audio Synthesis • Kinetic Physics
 */

// Global Audio Engine (Web Audio API - Zero External Dependencies)
let audioCtx = null;
let isSoundEnabled = true;

const SOUND_ON_SVG = `<svg class="topbar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg>`;
const SOUND_OFF_SVG = `<svg class="topbar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>`;

function initAudioFeedback() {
  const savedSound = localStorage.getItem('portfolio-sound');
  isSoundEnabled = savedSound !== null ? savedSound === 'true' : true;

  const soundBtn = document.getElementById('sound-toggle');
  const updateSoundUI = () => {
    if (soundBtn) {
      soundBtn.innerHTML = isSoundEnabled ? SOUND_ON_SVG : SOUND_OFF_SVG;
      soundBtn.classList.toggle('is-muted', !isSoundEnabled);
      soundBtn.setAttribute('title', isSoundEnabled ? 'Mute sound effects' : 'Enable sound effects');
      soundBtn.setAttribute('aria-label', isSoundEnabled ? 'Mute sound effects' : 'Enable sound effects');
    }
  };
  updateSoundUI();

  if (soundBtn) {
    soundBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      isSoundEnabled = !isSoundEnabled;
      localStorage.setItem('portfolio-sound', String(isSoundEnabled));
      updateSoundUI();
      if (isSoundEnabled) playHapticSound('switch');
    });
  }
}

function playHapticSound(type = 'click') {
  if (!isSoundEnabled) return;
  try {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContext();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    // Lowpass filter to ensure soft, organic acoustic profile
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2400, now);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);

    if (type === 'click') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.025);
      gain.gain.setValueAtTime(0.035, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.025);
      osc.start(now);
      osc.stop(now + 0.025);
    } else if (type === 'switch') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(540, now);
      osc.frequency.exponentialRampToValueAtTime(1080, now + 0.035);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);
      osc.start(now);
      osc.stop(now + 0.035);
    } else if (type === 'tick') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(750, now);
      gain.gain.setValueAtTime(0.018, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.015);
      osc.start(now);
      osc.stop(now + 0.015);
    } else if (type === 'slide') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(420, now);
      osc.frequency.exponentialRampToValueAtTime(680, now + 0.028);
      gain.gain.setValueAtTime(0.025, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.028);
      osc.start(now);
      osc.stop(now + 0.028);
    } else if (type === 'success') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(1040, now + 0.06);
      gain.gain.setValueAtTime(0.045, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);
      osc.start(now);
      osc.stop(now + 0.06);
    }
  } catch (err) {
    // Graceful fallback if audio context isn't permitted by autoplay policy
  }
}

// 1. Custom Cursor (Desktop Only with Spring Lerp)
function initCustomCursor() {
  const dot = document.querySelector('.custom-cursor-dot');
  const ring = document.querySelector('.custom-cursor-ring');
  
  const isFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!isFinePointer || prefersReducedMotion || !dot || !ring) return;

  let mouseX = -100, mouseY = -100;
  let ringX = -100, ringY = -100;
  let isVisible = false;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    if (!isVisible) {
      isVisible = true;
      dot.style.opacity = '1';
      ring.style.opacity = '1';
      ringX = mouseX;
      ringY = mouseY;
    }

    dot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
  });

  function renderCursor() {
    ringX += (mouseX - ringX) * 0.22;
    ringY += (mouseY - ringY) * 0.22;
    ring.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
    requestAnimationFrame(renderCursor);
  }
  requestAnimationFrame(renderCursor);

  const interactiveSelector = 'a, button, input, textarea, .skill-pills span, .project-panel, .timeline-node, .immersive-photo, .project-nav-btn, .carousel-btn, .carousel-dot, .island-theme-btn, .island-link';
  
  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(interactiveSelector)) {
      ring.classList.add('is-hovering');
    }
  });

  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(interactiveSelector)) {
      ring.classList.remove('is-hovering');
    }
  });

  window.addEventListener('mousedown', () => {
    dot.classList.add('is-active');
    ring.classList.add('is-active');
    playHapticSound('click');
  });

  window.addEventListener('mouseup', () => {
    dot.classList.remove('is-active');
    ring.classList.remove('is-active');
  });

  document.addEventListener('mouseleave', () => {
    dot.style.opacity = '0';
    ring.style.opacity = '0';
    isVisible = false;
  });
}

// 2. Click Particles (Micro-bursts)
function initClickParticles() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  const colors = [
    'var(--particle-color-1)',
    'var(--particle-color-2)',
    'var(--particle-color-3)'
  ];

  window.addEventListener('click', (e) => {
    // Avoid particle bursts on form inputs to prevent distractions
    if (e.target.closest('input, textarea')) return;

    const count = 7;
    for (let i = 0; i < count; i++) {
      const particle = document.createElement('span');
      particle.className = 'click-particle';

      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
      const distance = 24 + Math.random() * 32;
      const dx = `${Math.cos(angle) * distance}px`;
      const dy = `${Math.sin(angle) * distance}px`;
      const size = `${3 + Math.random() * 3}px`;
      const color = colors[Math.floor(Math.random() * colors.length)];

      particle.style.width = size;
      particle.style.height = size;
      particle.style.backgroundColor = color;
      particle.style.left = `${e.clientX}px`;
      particle.style.top = `${e.clientY}px`;
      particle.style.setProperty('--dx', dx);
      particle.style.setProperty('--dy', dy);

      document.body.appendChild(particle);

      particle.addEventListener('animationend', () => {
        particle.remove();
      });
    }
  });
}

// 3. Dynamic Island Sliding Indicator
function initDynamicIsland() {
  const islandItems = document.querySelector('.island-items');
  const indicator = document.querySelector('.island-indicator');
  const navLinks = document.querySelectorAll('.island-link');
  if (!islandItems || !indicator || !navLinks.length) return;

  function positionIndicator(targetLink) {
    if (!targetLink) {
      indicator.classList.remove('is-visible');
      return;
    }
    const containerRect = islandItems.getBoundingClientRect();
    const linkRect = targetLink.getBoundingClientRect();
    const offsetLeft = linkRect.left - containerRect.left;

    indicator.style.width = `${linkRect.width}px`;
    indicator.style.transform = `translateX(${offsetLeft}px)`;
    indicator.classList.add('is-visible');
  }

  // Initial position on active nav
  const activeLink = document.querySelector('.island-link.active-nav') || navLinks[0];
  setTimeout(() => positionIndicator(activeLink), 100);

  // Hover transitions
  navLinks.forEach(link => {
    link.addEventListener('mouseenter', () => positionIndicator(link));
  });

  islandItems.addEventListener('mouseleave', () => {
    const currentActive = document.querySelector('.island-link.active-nav') || navLinks[0];
    positionIndicator(currentActive);
  });

  window.addEventListener('resize', () => {
    const currentActive = document.querySelector('.island-link.active-nav') || navLinks[0];
    positionIndicator(currentActive);
  });
}

// 4. Global Scroll Progress (Top of Website) & Dynamic Island Scroll State
function initScrollProgressBar() {
  const progressBar = document.querySelector('.scroll-progress-bar');
  const dynamicIsland = document.getElementById('dynamic-island');

  const updateProgress = () => {
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollTop = window.scrollY;
    const progressPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    if (progressBar) {
      progressBar.style.width = `${Math.min(100, Math.max(0, progressPercent))}%`;
    }
    if (dynamicIsland) {
      dynamicIsland.classList.toggle('is-scrolled', scrollTop > 25);
    }
  };

  window.addEventListener('scroll', updateProgress, { passive: true });
  window.addEventListener('resize', updateProgress, { passive: true });
  updateProgress();
}

// 4. Scroll Reveal & Navigation Sync
function initScrollObserver() {
  const sections = document.querySelectorAll('.snap-section');
  const navLinks = document.querySelectorAll('.island-link');
  const indicator = document.querySelector('.island-indicator');
  const islandItems = document.querySelector('.island-items');

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
        const targets = entry.target.querySelectorAll('.reveal-item');
        targets.forEach(t => t.classList.add('is-revealed'));
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.18, rootMargin: '0px 0px -20px 0px' });

  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        let matchingLink = null;
        navLinks.forEach(link => {
          const isActive = link.getAttribute('href') === `#${id}`;
          link.classList.toggle('active-nav', isActive);
          link.setAttribute('aria-current', isActive ? 'page' : 'false');
          if (isActive) matchingLink = link;
        });

        if (matchingLink && indicator && islandItems) {
          const containerRect = islandItems.getBoundingClientRect();
          const linkRect = matchingLink.getBoundingClientRect();
          const offsetLeft = linkRect.left - containerRect.left;
          indicator.style.width = `${linkRect.width}px`;
          indicator.style.transform = `translateX(${offsetLeft}px)`;
          indicator.classList.add('is-visible');
        }
      }
    });
  }, { threshold: 0.4 });

  sections.forEach(section => {
    revealObserver.observe(section);
    navObserver.observe(section);
  });
}

// 5. Light / Dark Theme Toggle (Expanding Circular Origin Ripple)
const MOON_SVG = `<svg class="topbar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;
const SUN_SVG = `<svg class="topbar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;

function initThemeToggle() {
  const toggleBtn = document.getElementById('theme-toggle');

  const updateIcon = (theme) => {
    if (toggleBtn) {
      toggleBtn.innerHTML = theme === 'light' ? MOON_SVG : SUN_SVG;
      toggleBtn.setAttribute('title', theme === 'light' ? 'Switch to Dark theme' : 'Switch to Light theme');
      toggleBtn.setAttribute('aria-label', theme === 'light' ? 'Switch to Dark theme' : 'Switch to Light theme');
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

  // Initial load theme setup
  const savedTheme = localStorage.getItem('portfolio-theme');
  applyTheme(savedTheme || 'dark');

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const isCurrentlyLight = document.documentElement.getAttribute('data-theme') === 'light';
      const targetTheme = isCurrentlyLight ? 'dark' : 'light';

      playHapticSound('switch');

      if (!document.startViewTransition || prefersReducedMotion) {
        applyTheme(targetTheme);
        return;
      }

      // Calculate origin coordinates for expanding circular wave
      const rect = toggleBtn.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      const right = window.innerWidth - x;
      const bottom = window.innerHeight - y;
      const maxRadius = Math.hypot(
        Math.max(x, right),
        Math.max(y, bottom)
      );

      // Overshoot radius by 35% so the circle sweeps cleanly past the bottom corners without decelerating into them
      const safeRadius = maxRadius * 1.35;

      // Pass coordinates to GPU-accelerated CSS @keyframes
      document.documentElement.style.setProperty('--ripple-x', `${x.toFixed(1)}px`);
      document.documentElement.style.setProperty('--ripple-y', `${y.toFixed(1)}px`);
      document.documentElement.style.setProperty('--ripple-radius', `${safeRadius.toFixed(1)}px`);

      document.startViewTransition(() => {
        applyTheme(targetTheme);
      });
    });
  }
}

// 6. Polished High-Precision Text Scramble / Decrypt Engine
class TextScramble {
  constructor(el) {
    this.el = el;
    this.chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_#@*&!~';
    this.isAnimating = false;
    this.frameRequest = null;
    this.update = this.update.bind(this);
  }
  
  setText(newText) {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      this.el.textContent = newText;
      return Promise.resolve();
    }

    if (this.frameRequest) {
      cancelAnimationFrame(this.frameRequest);
    }

    const targetText = String(newText);
    const length = targetText.length;
    const promise = new Promise((resolve) => (this.resolve = resolve));
    this.queue = [];
    
    for (let i = 0; i < length; i++) {
      const targetChar = targetText[i];
      if (targetChar === ' ') {
        this.queue.push({ targetChar: ' ', start: 0, end: 0, isSpace: true, char: ' ' });
        continue;
      }
      const start = Math.floor(i * 1.6);
      const end = start + 7 + Math.floor(Math.random() * 5);
      this.queue.push({
        targetChar,
        start,
        end,
        isSpace: false,
        char: ''
      });
    }
    
    this.frame = 0;
    this.isAnimating = true;
    this.update();
    return promise;
  }
  
  update() {
    let output = '';
    let complete = 0;

    for (let i = 0, n = this.queue.length; i < n; i++) {
      const item = this.queue[i];

      if (item.isSpace) {
        complete++;
        output += '&nbsp;';
        continue;
      }

      if (this.frame >= item.end) {
        complete++;
        output += `<span class="scramble-glyph is-resolved">${item.targetChar}</span>`;
      } else if (this.frame >= item.start) {
        if (!item.char || Math.random() < 0.38) {
          item.char = this.chars[Math.floor(Math.random() * this.chars.length)];
        }
        output += `<span class="scramble-glyph is-glitching">${item.char}</span>`;
      } else {
        output += `<span class="scramble-glyph is-glitching">${item.targetChar}</span>`;
      }
    }

    this.el.innerHTML = output;

    if (complete === this.queue.length) {
      this.isAnimating = false;
      this.resolve();
    } else {
      this.frameRequest = requestAnimationFrame(this.update);
      this.frame++;
    }
  }
}

let triggerHeroScramble = null;

function initScrambleEffects() {
  const heroHeading = document.getElementById('hero-heading');
  const lines = heroHeading ? heroHeading.querySelectorAll('.scramble-line') : [];
  
  if (!lines.length) return;

  const scramblers = Array.from(lines).map(line => ({
    el: line,
    text: line.getAttribute('data-text') || line.textContent.trim(),
    fx: new TextScramble(line)
  }));

  triggerHeroScramble = (withSound = true) => {
    if (scramblers.some(s => s.fx.isAnimating)) return;
    if (withSound) playHapticSound('tick');

    scramblers.forEach((s, idx) => {
      setTimeout(() => {
        s.fx.setText(s.text);
      }, idx * 90);
    });
  };

  if (heroHeading) {
    heroHeading.addEventListener('mouseenter', () => triggerHeroScramble(true));
  }
}

// 7. Spotlight Proximity Mouse Tracking (RAF Throttled for 60fps/120fps sync)
function initSpotlightTracking() {
  const elements = document.querySelectorAll('.spotlight-card, .skill-pills span');
  elements.forEach(el => {
    let ticking = false;
    el.addEventListener('mousemove', (e) => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const rect = el.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          el.style.setProperty('--mouse-x', `${x.toFixed(1)}px`);
          el.style.setProperty('--mouse-y', `${y.toFixed(1)}px`);
          ticking = false;
        });
        ticking = true;
      }
    });
  });
}

// 8. Magnetic Buttons (Damped Spring Physics with RAF Loop)
function initMagneticButtons() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  const magneticBtns = document.querySelectorAll('.magnetic-btn');
  magneticBtns.forEach(btn => {
    let targetX = 0, targetY = 0;
    let currentX = 0, currentY = 0;
    let isHovered = false;
    let animId = null;

    function renderMagnetic() {
      // Damped spring interpolation (0.20 lerp factor)
      currentX += (targetX - currentX) * 0.20;
      currentY += (targetY - currentY) * 0.20;

      btn.style.transform = `translate3d(${currentX.toFixed(2)}px, ${currentY.toFixed(2)}px, 0)`;

      if (isHovered || Math.abs(targetX - currentX) > 0.05 || Math.abs(targetY - currentY) > 0.05) {
        animId = requestAnimationFrame(renderMagnetic);
      } else {
        btn.style.transform = '';
        btn.style.transition = '';
        cancelAnimationFrame(animId);
        animId = null;
      }
    }

    btn.addEventListener('mouseenter', () => {
      btn.style.transition = 'none';
      isHovered = true;
    });

    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      targetX = (e.clientX - centerX) * 0.24;
      targetY = (e.clientY - centerY) * 0.24;
      isHovered = true;
      if (!animId) animId = requestAnimationFrame(renderMagnetic);
    });

    btn.addEventListener('mouseleave', () => {
      targetX = 0;
      targetY = 0;
      isHovered = false;
      btn.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
    });
  });
}

// 9. Project Track Showcase & Slider
function initProjectShowcase() {
  const track = document.querySelector('.projects-track');
  const prevBtn = document.getElementById('project-prev-btn');
  const nextBtn = document.getElementById('project-next-btn');
  const panels = document.querySelectorAll('.project-panel');
  if (!track || !panels.length) return;

  const getScrollDistance = () => {
    const panel = track.querySelector('.project-panel');
    if (!panel) return 600;
    const gap = window.innerWidth <= 900 ? 32 : (window.innerWidth <= 1200 ? 48 : 128);
    return panel.offsetWidth + gap;
  };

  if (nextBtn) {
    nextBtn.addEventListener('click', (e) => {
      e.preventDefault();
      track.scrollBy({ left: getScrollDistance(), behavior: 'smooth' });
      playHapticSound('tick');
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', (e) => {
      e.preventDefault();
      track.scrollBy({ left: -getScrollDistance(), behavior: 'smooth' });
      playHapticSound('tick');
    });
  }

  // Keyboard Arrow Navigation
  window.addEventListener('keydown', (e) => {
    const projectsSection = document.getElementById('projects');
    if (!projectsSection) return;
    const rect = projectsSection.getBoundingClientRect();
    const isInView = rect.top >= -window.innerHeight * 0.4 && rect.top <= window.innerHeight * 0.4;

    if (isInView) {
      if (e.key === 'ArrowRight') {
        track.scrollBy({ left: getScrollDistance(), behavior: 'smooth' });
        playHapticSound('tick');
      } else if (e.key === 'ArrowLeft') {
        track.scrollBy({ left: -getScrollDistance(), behavior: 'smooth' });
        playHapticSound('tick');
      }
    }
  });
}

// 10. SALN Project Multi-Image Carousel (Directional Transitions)
function initProjectCarousel() {
  const container = document.querySelector('.carousel-media');
  if (!container) return;

  const slides = container.querySelectorAll('.carousel-slide');
  const dots = container.querySelectorAll('.carousel-dot');
  const prevBtn = container.querySelector('.carousel-prev');
  const nextBtn = container.querySelector('.carousel-next');
  const counterCurrent = container.querySelector('.carousel-current');

  if (!slides.length) return;
  let currentIndex = 0;

  function updateCarousel(newIndex, direction = 'next') {
    let targetIndex;
    if (newIndex < 0) {
      targetIndex = slides.length - 1;
    } else if (newIndex >= slides.length) {
      targetIndex = 0;
    } else {
      targetIndex = newIndex;
    }

    if (targetIndex === currentIndex) return;

    slides.forEach((slide, idx) => {
      slide.classList.remove('is-active', 'slide-from-left', 'slide-from-right');
      if (idx === targetIndex) {
        slide.classList.add('is-active');
      } else if (idx === currentIndex) {
        slide.classList.add(direction === 'next' ? 'slide-from-left' : 'slide-from-right');
      }
    });

    currentIndex = targetIndex;

    dots.forEach((dot, idx) => {
      const isActive = idx === currentIndex;
      dot.classList.toggle('is-active', isActive);
      dot.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    if (counterCurrent) {
      counterCurrent.textContent = String(currentIndex + 1).padStart(2, '0');
    }
    playHapticSound('slide');
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      updateCarousel(currentIndex + 1, 'next');
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      updateCarousel(currentIndex - 1, 'prev');
    });
  }

  dots.forEach((dot, idx) => {
    dot.addEventListener('click', (e) => {
      e.stopPropagation();
      const dir = idx > currentIndex ? 'next' : 'prev';
      updateCarousel(idx, dir);
    });
  });

  let touchStartX = 0;
  container.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].clientX;
  }, { passive: true });

  container.addEventListener('touchend', (e) => {
    const touchEndX = e.changedTouches[0].clientX;
    const diffX = touchStartX - touchEndX;
    if (Math.abs(diffX) > 45) {
      if (diffX > 0) {
        updateCarousel(currentIndex + 1, 'next');
      } else {
        updateCarousel(currentIndex - 1, 'prev');
      }
    }
  }, { passive: true });
}

// 11. Contact Form Submission
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
    playHapticSound('click');

    setTimeout(() => {
      submitBtn.classList.remove('is-submitting');
      submitBtn.classList.add('is-success');
      submitBtn.innerHTML = `<span>Message Sent ✓</span>`;
      playHapticSound('success');
      form.reset();

      setTimeout(() => {
        submitBtn.classList.remove('is-success');
        submitBtn.innerHTML = originalContent;
      }, 3000);
    }, 700);
  });
}

// 12. Minimalist Studio Hairline Preloader (Option 3)
function initStudioPreloader() {
  const preloader = document.getElementById('preloader');
  if (!preloader) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion || sessionStorage.getItem('mrtn_preloader_seen')) {
    preloader.style.display = 'none';
    document.body.classList.add('page-ready');
    setTimeout(() => {
      if (typeof triggerHeroScramble === 'function') triggerHeroScramble(false);
    }, 180);
    return;
  }

  const progressBar = document.getElementById('studio-progress');
  const counterEl = document.getElementById('studio-counter');
  const statusEl = document.getElementById('studio-status');
  if (!progressBar || !counterEl) return;

  let currentCount = 0;
  const duration = 2100; // 2.1s calibrated studio tempo
  const startTime = performance.now();
  let lastSoundTick = 0;

  function updateStudio(currentTime) {
    const elapsed = currentTime - startTime;
    const progressRatio = Math.min(elapsed / duration, 1);
    const easedProgress = 1 - Math.pow(1 - progressRatio, 3);
    currentCount = Math.round(easedProgress * 100);

    counterEl.textContent = currentCount < 10 ? `0${currentCount}%` : `${currentCount}%`;
    progressBar.style.width = `${currentCount}%`;

    // Status transitions
    if (statusEl) {
      if (currentCount >= 50 && currentCount < 90 && statusEl.textContent !== 'SYSTEM_SYNCHRONIZED') {
        statusEl.textContent = 'SYSTEM_SYNCHRONIZED';
        playHapticSound('switch');
      } else if (currentCount >= 90 && statusEl.textContent !== 'PORTFOLIO // READY') {
        statusEl.textContent = 'PORTFOLIO // READY';
      }
    }

    if (currentCount - lastSoundTick >= 7 && progressRatio < 0.95) {
      playHapticSound('tick');
      lastSoundTick = currentCount;
    }

    if (progressRatio < 1) {
      requestAnimationFrame(updateStudio);
    } else {
      // Reached 100% -> Hold for 260ms, then soft spatial dissolve & hero reveal
      setTimeout(() => {
        playHapticSound('success');
        preloader.classList.add('is-loaded');
        document.body.classList.add('page-ready');
        sessionStorage.setItem('mrtn_preloader_seen', 'true');

        setTimeout(() => {
          if (typeof triggerHeroScramble === 'function') triggerHeroScramble(false);
        }, 220);

        setTimeout(() => {
          preloader.remove();
        }, 900);
      }, 260);
    }
  }

  requestAnimationFrame(updateStudio);
}

// Master Initialization
document.addEventListener('DOMContentLoaded', () => {
  initAudioFeedback();
  initStudioPreloader();
  initCustomCursor();
  initClickParticles();
  initDynamicIsland();
  initScrollProgressBar();
  initScrollObserver();
  initThemeToggle();
  initScrambleEffects();
  initSpotlightTracking();
  initMagneticButtons();
  initProjectShowcase();
  initProjectCarousel();
  initContactForm();
});