/**
 * Gabriel Martin R. Manalo — Interaction & Motion Engine 3.0
 * Architecture: Emil Kowalski Motion Craft • Sonner Micro-Feedback • Web Audio Synthesis
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
      if (isSoundEnabled) {
        playHapticSound('switch');
        showToast('Sound effects enabled', '🔊');
      } else {
        showToast('Sound effects muted', '🔇');
      }
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
    
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2400, now);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);

    if (type === 'click') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1100, now);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.022);
      gain.gain.setValueAtTime(0.03, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.022);
      osc.start(now);
      osc.stop(now + 0.022);
    } else if (type === 'switch') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(480, now);
      osc.frequency.exponentialRampToValueAtTime(960, now + 0.03);
      gain.gain.setValueAtTime(0.035, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.03);
      osc.start(now);
      osc.stop(now + 0.03);
    } else if (type === 'tick') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(780, now);
      gain.gain.setValueAtTime(0.015, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.012);
      osc.start(now);
      osc.stop(now + 0.012);
    } else if (type === 'slide') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(380, now);
      osc.frequency.exponentialRampToValueAtTime(620, now + 0.025);
      gain.gain.setValueAtTime(0.022, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.025);
      osc.start(now);
      osc.stop(now + 0.025);
    } else if (type === 'copy') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(640, now);
      osc.frequency.exponentialRampToValueAtTime(1280, now + 0.045);
      gain.gain.setValueAtTime(0.038, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.045);
      osc.start(now);
      osc.stop(now + 0.045);
    } else if (type === 'success') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(1040, now + 0.055);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.055);
      osc.start(now);
      osc.stop(now + 0.055);
    }
  } catch (err) {
    // Autoplay audio fallback
  }
}

// 1. Sonner-Style Toast Notification Engine
function showToast(message, icon = '✓') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast-pill';
  toast.innerHTML = `<span class="toast-icon">${icon}</span> <span class="toast-msg">${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('is-exiting');
    setTimeout(() => toast.remove(), 260);
  }, 2600);
}

// 2. Interactive Copy to Clipboard
function initCopyButtons() {
  const copyTargets = document.querySelectorAll('[data-copy]');
  copyTargets.forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      const textToCopy = btn.getAttribute('data-copy');
      if (!textToCopy) return;

      try {
        await navigator.clipboard.writeText(textToCopy);
        playHapticSound('copy');
        showToast(`Copied to clipboard: ${textToCopy}`, '📋');

        const originalText = btn.innerHTML;
        btn.classList.add('is-copied');
        btn.innerHTML = `<span style="color: var(--accent-emerald);">Copied ✓</span>`;

        setTimeout(() => {
          btn.classList.remove('is-copied');
          btn.innerHTML = originalText;
        }, 2200);
      } catch (err) {
        showToast(`Selected: ${textToCopy}`, 'ℹ️');
      }
    });
  });
}

// 3. Custom Cursor (Desktop Only with Precision Lerp)
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

  const interactiveSelector = 'a, button, input, textarea, .skill-pills span, .project-panel, .timeline-node, .immersive-photo, .project-nav-btn, .carousel-btn, .carousel-dot, .badge-chip, .channel-card, .copy-btn';
  
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

// 4. Click Particles (Micro-bursts)
function initClickParticles() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  const colors = [
    'var(--particle-color-1)',
    'var(--particle-color-2)',
    'var(--particle-color-3)'
  ];

  window.addEventListener('click', (e) => {
    if (e.target.closest('input, textarea')) return;

    const count = 6;
    for (let i = 0; i < count; i++) {
      const particle = document.createElement('span');
      particle.className = 'click-particle';

      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.4;
      const distance = 20 + Math.random() * 28;
      const dx = `${Math.cos(angle) * distance}px`;
      const dy = `${Math.sin(angle) * distance}px`;
      const size = `${3 + Math.random() * 2.5}px`;
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

// 5. Dynamic Island Sliding Indicator
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

  const activeLink = document.querySelector('.island-link.active-nav') || navLinks[0];
  setTimeout(() => positionIndicator(activeLink), 120);

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

// 6. Global Scroll Progress (Top of Website)
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

// 7. Scroll Reveal & Navigation Sync
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
  }, { threshold: 0.15, rootMargin: '0px 0px -20px 0px' });

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
  }, { threshold: 0.35 });

  sections.forEach(section => {
    revealObserver.observe(section);
    navObserver.observe(section);
  });
}

// 8. Light / Dark Theme Toggle
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
      const nextTheme = isCurrentlyLight ? 'dark' : 'light';
      applyTheme(nextTheme);
      playHapticSound('switch');
      showToast(`Switched to ${nextTheme} mode`, nextTheme === 'light' ? '☀️' : '🌙');
    });
  }
}

// 9. Text Scramble Animation (Safe & Stable)
class TextScramble {
  constructor(el) {
    this.el = el;
    this.chars = '!<>-_\\/[]{}—=+*^?#01';
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
      const start = Math.floor(Math.random() * 12);
      const end = start + Math.floor(Math.random() * 14);
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
        output += `<span style="opacity: 0.35;">${char}</span>`;
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
  const targets = document.querySelectorAll('.scramble-target, .scramble-line');
  targets.forEach((target) => {
    const originalText = target.dataset.text || target.textContent;
    const fx = new TextScramble(target);
    target.addEventListener('mouseenter', () => {
      fx.setText(originalText);
      playHapticSound('tick');
    });
  });
}

// 10. Spotlight Mouse Tracking
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

// 11. Magnetic Buttons (Damped Spring Physics)
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
      currentX += (targetX - currentX) * 0.20;
      currentY += (targetY - currentY) * 0.20;

      btn.style.transform = `translate3d(${currentX.toFixed(2)}px, ${currentY.toFixed(2)}px, 0)`;

      if (isHovered || Math.abs(targetX - currentX) > 0.05 || Math.abs(targetY - currentY) > 0.05) {
        animId = requestAnimationFrame(renderMagnetic);
      } else {
        btn.style.transform = '';
        cancelAnimationFrame(animId);
        animId = null;
      }
    }

    btn.addEventListener('mouseenter', () => {
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
      setTimeout(() => { btn.style.transition = ''; }, 400);
    });
  });
}

// 12. Project Track Showcase & Counter Sync
function initProjectShowcase() {
  const track = document.querySelector('.projects-track');
  const prevBtn = document.getElementById('project-prev-btn');
  const nextBtn = document.getElementById('project-next-btn');
  const counterPill = document.getElementById('track-counter');
  const panels = document.querySelectorAll('.project-panel');
  if (!track || !panels.length) return;

  const updateCounter = () => {
    if (!counterPill) return;
    const scrollLeft = track.scrollLeft;
    const panelWidth = panels[0].offsetWidth;
    const activeIndex = Math.min(panels.length - 1, Math.max(0, Math.round(scrollLeft / panelWidth)));
    counterPill.textContent = `0${activeIndex + 1} / 0${panels.length}`;
  };

  const getScrollDistance = () => {
    const panel = track.querySelector('.project-panel');
    if (!panel) return 600;
    const gap = window.innerWidth <= 960 ? 24 : 96;
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

  track.addEventListener('scroll', updateCounter, { passive: true });

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

// 13. SALN Project Multi-Image Carousel
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

// 14. Contact Form Handler with Validation
function initContactForm() {
  const form = document.getElementById('main-contact-form') || document.querySelector('.contact-form');
  const submitBtn = document.getElementById('contact-submit-btn') || document.querySelector('.btn-submit');
  if (!form || !submitBtn) return;

  const validateField = (input) => {
    const group = input.closest('.form-group');
    const feedback = group ? group.querySelector('.field-feedback') : null;
    let isValid = true;
    let errorMsg = '';

    if (input.required && !input.value.trim()) {
      isValid = false;
      errorMsg = 'This field is required.';
    } else if (input.type === 'email' && input.value.trim()) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(input.value.trim())) {
        isValid = false;
        errorMsg = 'Please enter a valid email address.';
      }
    }

    if (group) group.classList.toggle('has-error', !isValid);
    if (feedback) feedback.textContent = errorMsg;
    return isValid;
  };

  const inputs = form.querySelectorAll('input, textarea');
  inputs.forEach(input => {
    input.addEventListener('blur', () => validateField(input));
    input.addEventListener('input', () => {
      const group = input.closest('.form-group');
      if (group && group.classList.contains('has-error')) {
        validateField(input);
      }
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (submitBtn.classList.contains('is-submitting')) return;

    let isFormValid = true;
    inputs.forEach(input => {
      if (!validateField(input)) isFormValid = false;
    });

    if (!isFormValid) {
      playHapticSound('tick');
      showToast('Please check the required fields', '⚠️');
      return;
    }

    submitBtn.classList.add('is-submitting');
    const originalContent = submitBtn.innerHTML;
    submitBtn.innerHTML = `<span>Sending inquiry...</span>`;
    playHapticSound('click');

    setTimeout(() => {
      submitBtn.classList.remove('is-submitting');
      submitBtn.classList.add('is-success');
      submitBtn.innerHTML = `<span>Message Sent Successfully ✓</span>`;
      playHapticSound('success');
      showToast('Thank you! Your message has been sent.', '✉️');
      form.reset();

      setTimeout(() => {
        submitBtn.classList.remove('is-success');
        submitBtn.innerHTML = originalContent;
      }, 3500);
    }, 800);
  });
}

// 15. Minimalist Studio Hairline Preloader (Snappy 1.2s Tempo)
function initStudioPreloader() {
  const preloader = document.getElementById('preloader');
  if (!preloader) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion || sessionStorage.getItem('mrtn_preloader_seen')) {
    preloader.style.display = 'none';
    document.body.classList.add('page-ready');
    return;
  }

  const progressBar = document.getElementById('studio-progress');
  const counterEl = document.getElementById('studio-counter');
  const statusEl = document.getElementById('studio-status');
  if (!progressBar || !counterEl) return;

  let currentCount = 0;
  const duration = 1200; // Calibrated snappy 1.2s tempo
  const startTime = performance.now();
  let lastSoundTick = 0;

  function updateStudio(currentTime) {
    const elapsed = currentTime - startTime;
    const progressRatio = Math.min(elapsed / duration, 1);
    const easedProgress = 1 - Math.pow(1 - progressRatio, 3);
    currentCount = Math.round(easedProgress * 100);

    counterEl.textContent = currentCount < 10 ? `0${currentCount}%` : `${currentCount}%`;
    progressBar.style.width = `${currentCount}%`;

    if (statusEl) {
      if (currentCount >= 50 && currentCount < 90 && statusEl.textContent !== 'SYSTEM_SYNCHRONIZED') {
        statusEl.textContent = 'SYSTEM_SYNCHRONIZED';
        playHapticSound('switch');
      } else if (currentCount >= 90 && statusEl.textContent !== 'PORTFOLIO // READY') {
        statusEl.textContent = 'PORTFOLIO // READY';
      }
    }

    if (currentCount - lastSoundTick >= 10 && progressRatio < 0.95) {
      playHapticSound('tick');
      lastSoundTick = currentCount;
    }

    if (progressRatio < 1) {
      requestAnimationFrame(updateStudio);
    } else {
      setTimeout(() => {
        playHapticSound('success');
        preloader.classList.add('is-loaded');
        document.body.classList.add('page-ready');
        sessionStorage.setItem('mrtn_preloader_seen', 'true');

        setTimeout(() => {
          const heroLines = document.querySelectorAll('.scramble-line, .hero-name');
          heroLines.forEach(line => {
            line.dispatchEvent(new Event('mouseenter'));
          });
        }, 150);

        setTimeout(() => {
          preloader.remove();
        }, 800);
      }, 180);
    }
  }

  requestAnimationFrame(updateStudio);
}

// Master Initialization
document.addEventListener('DOMContentLoaded', () => {
  initAudioFeedback();
  initStudioPreloader();
  initCopyButtons();
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