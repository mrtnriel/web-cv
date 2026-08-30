# Project Analysis: Gabriel Martin R. Manalo — Portfolio & Web CV

**Project Name:** My CV / Web Portfolio  
**Author / Developer:** Gabriel Martin R. Manalo ([@mrtnriel](https://github.com/mrtnriel))  
**Target Role / Profile:** 3rd-Year Information Technology Student (Polytechnic University of the Philippines)  
**Last Updated:** August 30, 2026  

---

## 1. Project Overview & Objectives

This project is a high-performance, responsive personal portfolio and digital curriculum vitae (CV) designed and built by **Gabriel Martin R. Manalo**. The website serves as a technical showcase of his multidisciplinary skill set spanning **full-stack web development**, **network engineering**, and **data analysis**, aimed at prospective employers, internship recruiters, and collaborative tech partners.

### Core Objectives:
- **Technical Showcase:** Present real-world projects and prototypes (full-stack web apps, Figma UI/UX, Cisco network topologies, R data analysis).
- **Interactive Experience:** Demonstrate front-end craft using modern interaction design patterns (glassmorphism, kinetic typography, particle physics, custom cursor, smooth snapping, magnetic pull, and synthesized haptic audio).
- **Clean Architectural Foundation:** Build without heavyweight frameworks or bloated external dependencies—relying on pure semantic HTML5, modern CSS3 custom properties, and modular Vanilla JavaScript.

---

## 2. Directory Structure & Asset Inventory

```
My CV/
├── .git/                                 # Git version control metadata
├── css/
│   └── style.css                         # Core stylesheet & bryl-minimal design system
├── images/
│   ├── Me.jpg                            # Alternate profile photograph
│   ├── Profile.jpg                       # Featured profile portrait in the About section
│   ├── programming.png                   # Website favicon & visual glyph
│   └── Project 1/                        # Screenshot assets for SALN Portal carousel
│       ├── Screenshot 2026-07-14 232457.png  # 01 - Login Portal
│       ├── Screenshot 2026-07-14 233212.png  # 02 - Declarant Information & Compliance
│       ├── Screenshot 2026-07-14 233222.png  # 03 - Spouse Information Form
│       ├── Screenshot 2026-07-14 233232.png  # 04 - Unmarried Children Under 18
│       ├── Screenshot 2026-07-14 233245.png  # 05 - Real & Personal Assets Breakdown
│       ├── Screenshot 2026-07-14 233252.png  # 06 - Liabilities & Creditor Balances
│       ├── Screenshot 2026-07-14 233316.png  # 07 - Review Net Worth & Sworn Declaration
│       ├── Screenshot 2026-07-14 233434.png  # 08 - Submission Confirmation Alert
│       └── [Additional project captures]
├── js/
│   └── script.js                         # Interaction & Motion Engine
├── index.html                            # Main semantic markup file
└── PROJECT_ANALYSIS.md                   # Complete architectural analysis report
```

---

## 3. Technology Stack & Design System

### 3.1 Core Technologies
- **HTML5:** Semantic document outline (`<header>`, `<main>`, `<section>`, `<article>`, `<nav>`, `<footer>`).
- **CSS3:** Custom properties (CSS variables), CSS Grid, Flexbox, CSS Scroll Snap, Backdrop filters, Glassmorphic lighting, and CSS Keyframe animations.
- **JavaScript (ES6+):** Vanilla JS interaction engine using `IntersectionObserver`, `requestAnimationFrame`, `AudioContext` (Web Audio API), `matchMedia` queries, and DOM event delegation.
- **Web Fonts (Google Fonts CDN):**
  - `Geist` (Sans-serif) for primary headings and body copy.
  - `Geist Mono` (Monospace) for tags, badges, metrics, and navigation.
  - `Source Serif 4` (Serif) for editorial statement leads and institution subtext.

### 3.2 Design Philosophy ("bryl-minimal / Emil Motion Architecture")
- **Dark / Light Dual-Theme Engine:** Complete tokenized palette using CSS variables (`--bg`, `--ink`, `--gray-50` through `--gray-500`) with persistent `localStorage` synchronization.
- **Dynamic Island Sliding Pill Indicator:** Fluid layout-morphed highlight indicator that glides behind the active nav item.
- **Spotlight Proximity Glow:** Cursor-tracking radial gradient border illumination (`--mouse-x`, `--mouse-y`) across interactive cards.
- **Synthesized Haptic Audio:** Ultra-lightweight mechanical clicks and switch ticks synthesized live via Web Audio API.

---

## 4. Architectural Breakdown by Section

### 00 — Hero Section (`#hero`)
- **Visual Presentation:** Centered layout featuring live status pulse dot, role title ("3rd-Year Information Technology Student"), high-impact name heading, and descriptive bio.
- **Text Scramble FX:** Real-time character decoding animation running on initial load and mouse hover.
- **Magnetic Call-to-Action (CTA):** Action buttons with spring magnetic pull physics linking directly to the Contact section (`#contact`) and external GitHub profile.

### 01 — About Section (`#about`)
- **Layout:** Asymmetrical two-column grid (`1fr 1.5fr`) pairing a grayscale-filtered profile portrait with an engineering philosophy statement.
- **Key Message:** Highlights fundamental IT engineering, architectural problem solving, and internship readiness.
- **Quick Links:** Quick access to GitHub and LinkedIn profiles with magnetic hover effects.

### 02 — Projects Showcase (`#projects`)
- **Horizontal Scrolling Track:** Horizontal track with scroll snapping and custom frosted-glass navigation controls (`←` / `→`) plus keyboard arrow key listeners.
- **Featured Projects:**
  1. **SALN Submission Portal:** Full-stack government asset/liability disclosure system built with Python (Flask), MySQL, HTML, CSS, and JS. Features an interactive 8-slide screenshot carousel with thumbnail dots, touch swipe, and counter.
  2. **Room Booking Prototype:** Interactive university reservation dashboard prototype built in Figma applying User-Centered Design (UCD) principles.
  3. **Enterprise Network Topology:** Cisco Packet Tracer topology featuring multi-area OSPF routing, VLANs, STP, and firewall failover routing.
  4. **Exploratory Data Analysis:** Statistical data analysis using R, data cleaning, normalization, and `ggplot2` visualizations of academic performance factors.

### 03 — Expertise & Background (`#expertise`)
- **Education Timeline:**
  - *Degree:* Bachelor of Science in Information Technology (2024 — Present)
  - *Institution:* Polytechnic University of the Philippines
  - *Coursework:* Network Engineering, Data Communications, Database Theory & Normalization, Human-Computer Interaction (HCI).
- **Technical Toolkit (Categorized Pills):**
  - **Languages:** Java, C++, Python, COBOL, JavaScript, HTML/CSS, R
  - **Backend & Data:** Flask, MySQL, ERD Modeling, Database Normalization
  - **Networking:** Cisco Packet Tracer, VLANs, Spanning Tree Protocol (STP), EtherChannel
  - **Design & Tools:** Figma, Git/GitHub, VS Code, Vercel

### 04 — Contact & Footer (`#contact`)
- **Direct Communication Channels:**
  - Email: `martinramirezasdw@gmail.com`
  - Phone: `+63 916 401 1194`
  - LinkedIn & GitHub links
- **Interactive Form:** Client-side form simulation with input validation, dynamic submit animation, and transient success state ("Message Sent ✓").
- **Footer:** Minimal copyright declaration for 2026.

---

## 5. JavaScript Interaction & Motion Engine (`js/script.js`)

| Module | Implementation Details |
| :--- | :--- |
| **Web Audio Synthesizer** | Native Web Audio API oscillator synthesis generating subtle haptic clicks (`click`, `switch`, `tick`) with a dedicated audio toggle (`🔊`/`🔇`) persisted in `localStorage`. |
| **Custom Cursor** | Dual-element cursor (inner dot + lagging outer ring) driven by `requestAnimationFrame` with lerp interpolation (`0.22`). Automatically disabled on touch screens and when `prefers-reduced-motion` is active. |
| **Dynamic Island Pill** | Sliding pill background indicator computing exact relative offsets and widths for seamless sliding navigation states. |
| **Spotlight Mouse Tracking** | Dynamic `--mouse-x` and `--mouse-y` calculations creating proximity-based card lighting. |
| **Magnetic Pull Physics** | Physics-based cursor attraction on buttons and interactive glyphs. |
| **SALN Carousel** | Slide transition engine supporting button clicks, indicator dots, image counter updates, and touch swipe gestures (`touchstart` / `touchend`). |
| **Contact Form Handler** | Handles submission events with simulated delay states (`is-submitting` -> `is-success`) and automatic form reset. |
