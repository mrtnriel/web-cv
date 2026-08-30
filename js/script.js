/**
 * Gabriel Martin R. Manalo — Interaction & Motion Engine 2.0
 * Pure Vanilla Architecture • Web Audio Synthesis • Kinetic Physics
 */

// Global Audio Engine (Web Audio API - Zero External Dependencies)
let audioCtx = null;
let isSoundEnabled = true;

function initAudioFeedback() {
  const savedSound = localStorage.getItem('portfolio-sound');
  isSoundEnabled = savedSound !== null ? savedSound === 'true' : true;

  const soundBtn = document.getElementById('sound-toggle');
  const updateSoundUI = () => {
    if (soundBtn) {
      const icon = soundBtn.querySelector('.sound-icon');
      if (icon) icon.textContent = isSoundEnabled ? '🔊' : '🔇';
      soundBtn.classList.toggle('is-muted', !isSoundEnabled);
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

  const interactiveSelector = 'a, button, input, textarea, .skill-pills span, .project-panel, .timeline-node, .immersive-photo, .project-nav-btn, .carousel-btn, .carousel-dot';
  
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

// 4. Global Scroll Progress (Top of Website)
function initScrollProgressBar() {
  const progressBar = document.querySelector('.scroll-progress-bar');
  if (!progressBar) return;

  const updateProgress = () => {
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollTop = window.scrollY;
    const progressPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = `${Math.min(100, Math.max(0, progressPercent))}%`;
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
        const targets = entry.target.querySelectorAll('.reveal-item');
        targets.forEach(t => t.classList.add('is-revealed'));
        if (entry.target.classList.contains('reveal-item')) {
          entry.target.classList.add('is-revealed');
        }
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -30px 0px' });

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

// 5. Light / Dark Theme Toggle
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
      playHapticSound('switch');
    });
  }
}

// 6. Text Scramble Animation
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
    const originalText = target.dataset.text || target.textContent;
    const fx = new TextScramble(target);
    setTimeout(() => fx.setText(originalText), 200);
    target.addEventListener('mouseenter', () => fx.setText(originalText));
  });
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
      // Damped spring interpolation (0.18 lerp factor)
      currentX += (targetX - currentX) * 0.18;
      currentY += (targetY - currentY) * 0.18;

      btn.style.transform = `translate3d(${currentX.toFixed(2)}px, ${currentY.toFixed(2)}px, 0)`;

      if (isHovered || Math.abs(targetX - currentX) > 0.05 || Math.abs(targetY - currentY) > 0.05) {
        animId = requestAnimationFrame(renderMagnetic);
      } else {
        btn.style.transform = '';
        cancelAnimationFrame(animId);
        animId = null;
      }
    }

    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      targetX = (e.clientX - centerX) * 0.28;
      targetY = (e.clientY - centerY) * 0.28;
      isHovered = true;
      if (!animId) animId = requestAnimationFrame(renderMagnetic);
    });

    btn.addEventListener('mouseleave', () => {
      targetX = 0;
      targetY = 0;
      isHovered = false;
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

// Master Initialization
document.addEventListener('DOMContentLoaded', () => {
  initAudioFeedback();
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