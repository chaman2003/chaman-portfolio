import { askGeminiWithRag } from '../utils/rag.js';

export function initPortfolioEffects() {
const yearEl = document.getElementById('year');
const typewriterEl = document.getElementById('typewriter');
const ghCardsEl = document.getElementById('githubCards');
const ghHeadlineEl = document.getElementById('ghHeadline');
const scrollProgressEl = document.getElementById('scrollProgress');
const heroSceneEl = document.getElementById('heroScene');
const logoMarqueeEl = document.getElementById('logoMarquee');
const backToTopBtn = document.getElementById('backToTop');
const labOutputEl = document.getElementById('labOutput');
const labButtons = Array.from(document.querySelectorAll('.lab-btn'));
const labFormEl = document.getElementById('labForm');
const labInputEl = document.getElementById('labInput');
const fetchFormEl = document.getElementById('fetchForm');
const fetchInputEl = document.getElementById('fetchInput');
const siteNavEl = document.getElementById('siteNav');
const menuToggleBtn = document.getElementById('menuToggle');
const navCloseBtn = document.getElementById('navClose');
const navBackdropEl = document.getElementById('navBackdrop');
const motionToggleBtns = Array.from(document.querySelectorAll('[data-motion-toggle]'));
const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
let userMotionSetting = localStorage.getItem('portfolio_motion') || 'on';
let motionProfile = null;
let gsapInitialized = false;

function getViewportTier(width = window.innerWidth) {
  if (width < 320) return 'watch';
  if (width < 480) return 'phone';
  if (width < 768) return 'phablet';
  if (width < 1024) return 'tablet';
  if (width < 1440) return 'laptop';
  if (width < 1920) return 'desktop';
  return 'ultra';
}

function buildMotionProfile() {
  const tier = getViewportTier();
  const profiles = {
    watch: {
      speed: 1.55,
      intensity: 0.3,
      sparkModulo: 16,
      parallaxMinWidth: 9999,
      parallaxScale: 0,
      tiltMax: 0,
      magneticFactor: 0,
      starCount: 14
    },
    phone: {
      speed: 1.35,
      intensity: 0.42,
      sparkModulo: 14,
      parallaxMinWidth: 9999,
      parallaxScale: 0,
      tiltMax: 0,
      magneticFactor: 0.02,
      starCount: 18
    },
    phablet: {
      speed: 1.2,
      intensity: 0.56,
      sparkModulo: 12,
      parallaxMinWidth: 1400,
      parallaxScale: 0,
      tiltMax: 2,
      magneticFactor: 0.03,
      starCount: 24
    },
    tablet: {
      speed: 1.1,
      intensity: 0.68,
      sparkModulo: 10,
      parallaxMinWidth: 1300,
      parallaxScale: 0.06,
      tiltMax: 3,
      magneticFactor: 0.035,
      starCount: 30
    },
    laptop: {
      speed: 1,
      intensity: 0.78,
      sparkModulo: 8,
      parallaxMinWidth: 1200,
      parallaxScale: 0.07,
      tiltMax: 3,
      magneticFactor: 0.04,
      starCount: 36
    },
    desktop: {
      speed: 0.96,
      intensity: 0.86,
      sparkModulo: 6,
      parallaxMinWidth: 1200,
      parallaxScale: 0.08,
      tiltMax: 3.2,
      magneticFactor: 0.042,
      starCount: 44
    },
    ultra: {
      speed: 0.93,
      intensity: 0.92,
      sparkModulo: 4,
      parallaxMinWidth: 1300,
      parallaxScale: 0.09,
      tiltMax: 4,
      magneticFactor: 0.05,
      starCount: 52
    }
  };

  const level = profiles[tier];
  const enabled = userMotionSetting === 'on' && !reducedMotionQuery.matches;
  return { ...level, tier, enabled };
}

function isMotionEnabled() {
  return Boolean(motionProfile?.enabled);
}

function updateMotionToggleLabel() {
  if (!motionToggleBtns.length || !motionProfile) return;

  if (reducedMotionQuery.matches) {
    motionToggleBtns.forEach((btn) => {
      btn.textContent = 'Motion Off (System)';
      btn.setAttribute('aria-pressed', 'false');
      btn.title = 'Motion follows system reduced-motion preference.';
    });
    return;
  }

  motionToggleBtns.forEach((btn) => {
    btn.textContent = motionProfile.enabled ? 'Motion On' : 'Motion Off';
    btn.setAttribute('aria-pressed', motionProfile.enabled ? 'true' : 'false');
    btn.title = motionProfile.enabled
      ? 'Disable cinematic motion effects'
      : 'Enable cinematic motion effects';
  });
}

function syncMotionProfile() {
  motionProfile = buildMotionProfile();
  document.body.setAttribute('data-motion', motionProfile.enabled ? 'on' : 'off');
  document.body.setAttribute('data-motion-level', motionProfile.tier);
  document.body.style.setProperty('--motion-speed', String(motionProfile.speed));
  document.body.style.setProperty('--motion-play-state', motionProfile.enabled ? 'running' : 'paused');
  updateMotionToggleLabel();

  if (window.gsap?.globalTimeline) {
    window.gsap.globalTimeline.paused(!motionProfile.enabled);
  }

  window.dispatchEvent(new Event('motionprofilechange'));
}

if (typeof reducedMotionQuery.addEventListener === 'function') {
  reducedMotionQuery.addEventListener('change', syncMotionProfile);
} else if (typeof reducedMotionQuery.addListener === 'function') {
  reducedMotionQuery.addListener(syncMotionProfile);
}

motionToggleBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    userMotionSetting = userMotionSetting === 'on' ? 'off' : 'on';
    localStorage.setItem('portfolio_motion', userMotionSetting);
    syncMotionProfile();
  });
});

syncMotionProfile();

if (yearEl) yearEl.textContent = new Date().getFullYear();

// Preloader
const preloaderDone = () => document.body.classList.add('loaded');
window.addEventListener('load', () => setTimeout(preloaderDone, 420));
setTimeout(preloaderDone, 1800);

function isDrawerViewport() {
  return window.innerWidth <= 1023;
}

function setNavOpen(open) {
  const shouldOpen = Boolean(open) && isDrawerViewport();
  document.body.classList.toggle('nav-open', shouldOpen);
  menuToggleBtn?.setAttribute('aria-expanded', shouldOpen ? 'true' : 'false');
  siteNavEl?.setAttribute('aria-hidden', shouldOpen ? 'false' : 'true');
  navBackdropEl?.setAttribute('aria-hidden', shouldOpen ? 'false' : 'true');
}

function closeNav() {
  setNavOpen(false);
}

function toggleNav() {
  setNavOpen(!document.body.classList.contains('nav-open'));
}

function syncNavForViewport() {
  if (!isDrawerViewport()) {
    document.body.classList.remove('nav-open');
    menuToggleBtn?.setAttribute('aria-expanded', 'false');
    siteNavEl?.removeAttribute('aria-hidden');
    navBackdropEl?.setAttribute('aria-hidden', 'true');
    return;
  }

  const navOpen = document.body.classList.contains('nav-open');
  menuToggleBtn?.setAttribute('aria-expanded', navOpen ? 'true' : 'false');
  siteNavEl?.setAttribute('aria-hidden', navOpen ? 'false' : 'true');
  navBackdropEl?.setAttribute('aria-hidden', navOpen ? 'false' : 'true');
}

menuToggleBtn?.addEventListener('click', toggleNav);
navCloseBtn?.addEventListener('click', closeNav);
navBackdropEl?.addEventListener('click', closeNav);

siteNavEl?.addEventListener('click', (event) => {
  const link = event.target.closest('a[href^="#"]');
  if (!link) return;
  closeNav();
});

window.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  closeNav();
});

window.addEventListener('resize', syncNavForViewport);
syncNavForViewport();

// Active nav highlight
const navLinks = Array.from(document.querySelectorAll('nav a[href^="#"]'));
const sectionMap = navLinks
  .map((link) => {
    const target = document.querySelector(link.getAttribute('href'));
    return target ? { link, target } : null;
  })
  .filter(Boolean);

if ('IntersectionObserver' in window) {
  const navObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const current = sectionMap.find((s) => s.target === entry.target);
        if (!current) return;
        navLinks.forEach((l) => l.classList.remove('active'));
        current.link.classList.add('active');
      });
    },
    { threshold: 0.35 }
  );

  sectionMap.forEach((s) => navObserver.observe(s.target));
}

// Intelligent terminal commands (Gemini + local RAG)
const GITHUB_TOKEN =
  window.__VRIK_RUNTIME__?.GITHUB_TOKEN ||
  localStorage.getItem('vrik_github_token') ||
  '';

function getGitHubHeaders() {
  const headers = {
    Accept: 'application/vnd.github+json'
  };

  if (GITHUB_TOKEN && GITHUB_TOKEN !== 'REPLACE_WITH_GITHUB_TOKEN') {
    headers.Authorization = `Bearer ${GITHUB_TOKEN}`;
  }

  return headers;
}

const resumeRagChunks = [
  'Professional summary: AI & ML undergraduate and full-stack developer specializing in AI-driven systems and real-time applications. Experienced with MERN and Python solutions integrating LLM, STT, and TTS workflows.',
  'Education: B.E in AI & ML at Vivekananda Institute of Technology, Bengaluru (Dec 2022 - Jun 2026), CGPA 8.7.',
  'Internship: Cortex Craft AI (Jan 2026 - Present), building AI-first POCs with LLM integration, agentic/RAG workflows, secure APIs, and scalable architectures.',
  'Internship: Edunet Foundation (Mar 2025 - Apr 2025), built PeakHive MERN e-commerce platform, improved engagement by 50% and reduced order-processing errors by 20%.',
  'Projects: Epsilora AI, PrintChakra AI, PeakHive, Tic Tac Toe AI.',
  'Skills: JavaScript, TypeScript, React, Next.js, Node.js, Express, MERN, Python, Flask, MongoDB, PostgreSQL, Redis, Supabase, LLMs, RAG, LangChain, MCP, Socket.IO, Whisper, OCR, Docker, Kubernetes, CI/CD, Linux, REST APIs, Tailwind, Vercel.',
  'Achievements: ₹4,500 sponsorship for PrintChakra AI, 1st rank in 3rd and 6th semester, SCIMAGINATION 2K23 and 2K25 2nd place.'
];

const linkedinRagChunks = [
  'LinkedIn: linkedin.com/in/chaman2003 — Software Engineer (Full-Stack | MERN | AI Systems), open to internships, collaborations, and product engineering roles.'
];

let githubProfileChunk = '';
let githubRagChunks = [];
let labHistory = [];
let labHistoryCursor = -1;
let terminalBusy = false;

const labResponses = {
  help: `Available commands:\n- help\n- about\n- stack\n- focus\n- contact\n- github\n- linkedin\n- resume\n- achievements\n- languages\n- ai.summary\n- ai.projects\n- ai.skills\n- ask <question>\n- clear`,
  about: `Chaman S\nSoftware Engineer (Full-Stack | MERN | AI Systems)\nAI & ML Undergraduate (B.E, CGPA 8.7)\nBengaluru, Karnataka`,
  stack: `Core Stack:\n- JavaScript, TypeScript, React, Next.js\n- Node.js, Express, MERN, Flask\n- MongoDB, PostgreSQL, Redis, Supabase\n- LLMs, RAG, LangChain, MCP, Whisper, OCR\n- Docker, Kubernetes, CI/CD, Linux\n- REST APIs, Socket.IO, Tailwind, Vercel`,
  focus: `Current Focus:\n- AI-first full-stack systems\n- Voice + OCR workflows\n- Secure, scalable architecture\n- Production-ready deployment`,
  contact: `Contact:\nEmail: chaman2003.dev@gmail.com\nPhone: +91 6361005641\nLinkedIn: linkedin.com/in/chaman2003\nGitHub: github.com/chaman2003`,
  github: `GitHub Snapshot:\n- Username: @chaman2003\n- Full-stack + AI repositories\n- Fast iteration + polished product mindset`,
  linkedin: `LinkedIn:\n- linkedin.com/in/chaman2003\n- Open to internships, collaborations, product roles`,
  resume: `Resume Highlights:\n- B.E AI & ML (CGPA 8.7)\n- Cortex Craft AI (Jan 2026 - Present)\n- Edunet Foundation (Mar 2025 - Apr 2025)\n- PrintChakra sponsorship ₹4,500`,
  achievements: `Achievements:\n- 1st rank in 3rd and 6th semester (AI & ML, VKIT)\n- SCIMAGINATION 2K23: 2nd place\n- SCIMAGINATION 2K25: 2nd place`,
  languages: `Languages:\nEnglish (Fluent)\nHindi (Fluent)\nKannada (Native)\nTelugu (Conversational)`
};

const labAliases = {
  'about.me': 'about',
  'stack.list': 'stack',
  'focus.now': 'focus',
  'contact.info': 'contact',
  'github.peek': 'github',
  'linkedin.peek': 'linkedin',
  'resume.scan': 'resume',
  'achievements.top': 'achievements'
};

function getRagDocuments() {
  return [...resumeRagChunks, ...linkedinRagChunks, githubProfileChunk, ...githubRagChunks].filter(Boolean);
}

function typeToElement(el, text) {
  if (!el) return;
  if (!isMotionEnabled()) {
    el.textContent = text;
    return;
  }

  el.textContent = '';
  let idx = 0;
  const tick = () => {
    idx += Math.max(1, Math.floor(text.length / 120));
    el.textContent = text.slice(0, idx);
    el.scrollTop = el.scrollHeight;
    if (idx < text.length) requestAnimationFrame(tick);
  };
  tick();
}

function typeToLab(text) {
  typeToElement(labOutputEl, text);
}


function setActiveLabButton(cmd) {
  labButtons.forEach((b) => {
    b.classList.toggle('active', b.getAttribute('data-lab-cmd') === cmd);
  });
}

async function executeLabCommand(rawCommand, opts = { store: true, source: 'lab' }) {
  const commandRaw = String(rawCommand || '').trim();
  if (!commandRaw || terminalBusy) return;

  const command = commandRaw.toLowerCase();
  const normalized = labAliases[command] || command;

  if (opts.store !== false && normalized !== 'clear') {
    labHistory.unshift(commandRaw);
    labHistory = Array.from(new Set(labHistory)).slice(0, 20);
    labHistoryCursor = -1;
  }

  setActiveLabButton(normalized);

  if (normalized === 'clear') {
    typeToLab('');
    return;
  }

  const aiPreset = {
    'ai.summary': 'Give a concise professional summary of Chaman S in 5 bullet points.',
    'ai.projects': 'Summarize Chaman’s strongest projects and technical impact.',
    'ai.skills': 'Group Chaman’s top skills by frontend, backend, AI, and DevOps with short impact notes.'
  };

  let aiQuery = null;
  if (command.startsWith('ask ')) {
    aiQuery = commandRaw.slice(4).trim();
  } else if (aiPreset[normalized]) {
    aiQuery = aiPreset[normalized];
  } else if (!labResponses[normalized]) {
    aiQuery = commandRaw;
  }

  if (aiQuery) {
    try {
      terminalBusy = true;
      typeToLab(`> ${commandRaw}\n\nthinking..`);
      const response = await askGeminiWithRag(aiQuery, getRagDocuments(), {
        short: Boolean(aiPreset[normalized]),
        throwErrors: true,
        topK: 6
      });
      typeToLab(`> ${commandRaw}\n\n${response}`);
    } catch (err) {
      typeToLab(`> ${commandRaw}\n\n${err.message}`);
    } finally {
      terminalBusy = false;
    }
    return;
  }

  const response = labResponses[normalized] || `Unknown command: ${commandRaw}\nTry: ask summarize my internships`;
  typeToLab(`> ${commandRaw}\n\n${response}`);
}

if (labButtons.length) {
  labButtons.forEach((btn) => {
    btn.addEventListener('click', () => executeLabCommand(btn.getAttribute('data-lab-cmd')));
  });
}

function handleSharedSubmit(inputEl, source) {
  const cmd = inputEl?.value || '';
  if (!cmd.trim()) return;
  executeLabCommand(cmd, { source });
  if (source === 'top') {
    document.getElementById('lab')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
  if (inputEl) inputEl.value = '';
}

labFormEl?.addEventListener('submit', (e) => {
  e.preventDefault();
  handleSharedSubmit(labInputEl, 'lab');
});

fetchFormEl?.addEventListener('submit', (e) => {
  e.preventDefault();
  handleSharedSubmit(fetchInputEl, 'top');
});

labInputEl?.addEventListener('keydown', (e) => {
  if (!labHistory.length) return;
  if (e.key === 'ArrowUp') {
    e.preventDefault();
    labHistoryCursor = Math.min(labHistoryCursor + 1, labHistory.length - 1);
    labInputEl.value = labHistory[labHistoryCursor] || '';
  } else if (e.key === 'ArrowDown') {
    e.preventDefault();
    labHistoryCursor = Math.max(labHistoryCursor - 1, -1);
    labInputEl.value = labHistoryCursor >= 0 ? labHistory[labHistoryCursor] : '';
  }
});

executeLabCommand('help', { store: false, source: 'lab' });

// Scroll progress
function updateScrollProgress() {
  const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
  const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
  const ratio = height > 0 ? (scrollTop / height) * 100 : 0;

  if (scrollProgressEl) {
    scrollProgressEl.style.width = `${ratio}%`;
  }

  if (backToTopBtn) {
    backToTopBtn.classList.toggle('visible', scrollTop > 260);
  }
}
let scrollTicking = false;
function onScrollProgress() {
  if (scrollTicking) return;
  scrollTicking = true;
  requestAnimationFrame(() => {
    scrollTicking = false;
    updateScrollProgress();
  });
}

window.addEventListener('scroll', onScrollProgress, { passive: true });
updateScrollProgress();

backToTopBtn?.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Reveal on scroll (safe fallback)
const reveals = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  document.body.classList.add('js-reveal');
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add('visible');
      });
    },
    { threshold: 0.12 }
  );
  reveals.forEach((el) => revealObserver.observe(el));
} else {
  reveals.forEach((el) => el.classList.add('visible'));
}

// Counter animation
const counters = document.querySelectorAll('[data-counter]');
const counterObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = Number(el.getAttribute('data-counter'));
      let value = 0;
      const increment = Math.max(1, Math.ceil(target / 40));
      const timer = setInterval(() => {
        value += increment;
        if (value >= target) {
          value = target;
          clearInterval(timer);
        }
        el.textContent = value + (target === 24 ? '/7' : '+');
      }, 28);
      counterObserver.unobserve(el);
    });
  },
  { threshold: 0.4 }
);
counters.forEach((counter) => counterObserver.observe(counter));

// Typewriter effect
const lines = [
  'crafting scalable MERN + AI systems...',
  'shipping premium user-first experiences...',
  'turning ideas into production-ready products...'
];
let lineIndex = 0;
let charIndex = 0;
let deleting = false;

function runTypewriter() {
  if (!typewriterEl) return;
  if (!isMotionEnabled()) {
    typewriterEl.textContent = lines[0];
    return setTimeout(runTypewriter, 360);
  }
  const current = lines[lineIndex];

  if (!deleting) {
    charIndex++;
    typewriterEl.textContent = current.slice(0, charIndex);
    if (charIndex === current.length) {
      deleting = true;
      return setTimeout(runTypewriter, 1200);
    }
  } else {
    charIndex--;
    typewriterEl.textContent = current.slice(0, charIndex);
    if (charIndex === 0) {
      deleting = false;
      lineIndex = (lineIndex + 1) % lines.length;
    }
  }

  const wait = Math.round((deleting ? 30 : 56) * (motionProfile?.speed || 1));
  setTimeout(runTypewriter, wait);
}
runTypewriter();

const hasFinePointer = window.matchMedia('(pointer: fine)').matches;

// Hero parallax (ultra subtle to avoid overlap)
window.addEventListener('mousemove', (e) => {
  if (!heroSceneEl || !isMotionEnabled()) return;
  if (window.innerWidth < (motionProfile?.parallaxMinWidth || 1200)) return;
  const x = (e.clientX / window.innerWidth - 0.5) * 3;
  const y = (e.clientY / window.innerHeight - 0.5) * 3;
  const scale = motionProfile?.parallaxScale || 0.1;
  heroSceneEl.style.transform = `perspective(1000px) rotateY(${x * scale}deg) rotateX(${-y * scale}deg)`;
});
window.addEventListener('mouseleave', () => {
  if (!heroSceneEl) return;
  heroSceneEl.style.transform = 'perspective(1000px) rotateY(0deg) rotateX(0deg)';
});
window.addEventListener('motionprofilechange', () => {
  if (!heroSceneEl || isMotionEnabled()) return;
  heroSceneEl.style.transform = 'perspective(1000px) rotateY(0deg) rotateX(0deg)';
});

// 3D tilt cards (subtle)
const tiltCards = document.querySelectorAll('.tilt');
tiltCards.forEach((card) => {
  card.addEventListener('mousemove', (e) => {
    if (!isMotionEnabled() || !hasFinePointer) return;
    const maxTilt = motionProfile?.tiltMax || 0;
    if (maxTilt <= 0) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rotateY = ((x / rect.width) - 0.5) * maxTilt;
    const rotateX = (0.5 - y / rect.height) * maxTilt;
    card.style.transform = `perspective(700px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = 'perspective(700px) rotateX(0deg) rotateY(0deg)';
  });
});

window.addEventListener('motionprofilechange', () => {
  if (isMotionEnabled()) return;
  tiltCards.forEach((card) => {
    card.style.transform = 'perspective(700px) rotateX(0deg) rotateY(0deg)';
  });
});

// Magnetic buttons (very subtle)
const magneticButtons = document.querySelectorAll('.magnetic');
magneticButtons.forEach((btn) => {
  btn.addEventListener('mousemove', (e) => {
    if (!isMotionEnabled() || !hasFinePointer) return;
    const factor = motionProfile?.magneticFactor || 0;
    if (factor <= 0) return;
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - (rect.left + rect.width / 2);
    const y = e.clientY - (rect.top + rect.height / 2);
    btn.style.transform = `translate(${x * factor}px, ${y * factor}px)`;
  });
  btn.addEventListener('mouseleave', () => {
    btn.style.transform = 'translate(0, 0)';
  });
});

window.addEventListener('motionprofilechange', () => {
  if (isMotionEnabled()) return;
  magneticButtons.forEach((btn) => {
    btn.style.transform = 'translate(0, 0)';
  });
});

// GitHub API data
const featuredRepoNames = new Set([
  'epsiloraai',
  'printchakraai',
  'printchakra',
  'peakhive',
  'tictactoeai'
]);

function normalizeRepoName(name = '') {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function truncateText(text = '', maxLength = 190) {
  const clean = String(text || '').trim();
  if (clean.length <= maxLength) return clean;
  return `${clean.slice(0, maxLength - 1).trimEnd()}…`;
}

function getGithubCols() {
  const w = window.innerWidth;
  if (w < 768) return 1;
  if (w >= 1680) return 4;
  if (w >= 1180) return 3;
  if (w >= 768) return 2;
  return 1;
}

async function loadGitHubData() {
  if (!ghCardsEl) return;

  try {
    const userRes = await fetch('https://api.github.com/users/chaman2003', {
      headers: getGitHubHeaders()
    });
    if (!userRes.ok) {
      const userErr = await userRes.json().catch(() => null);
      const errMsg = userErr?.message ? `: ${userErr.message}` : '';
      throw new Error(`GitHub user request failed (${userRes.status})${errMsg}`);
    }
    const user = await userRes.json();

    if (ghHeadlineEl && user?.login) {
      ghHeadlineEl.textContent = `${user.public_repos ?? 0} public repos • ${user.followers ?? 0} followers • ${user.location || 'Open to global collaboration'}`;
    }

    githubProfileChunk = `GitHub profile ${user?.login || 'chaman2003'}: ${user?.public_repos ?? 0} public repos, ${user?.followers ?? 0} followers, location ${user?.location || 'not specified'}, bio: ${user?.bio || 'N/A'}.`;

    const reposRes = await fetch('https://api.github.com/users/chaman2003/repos?sort=updated&per_page=30', {
      headers: getGitHubHeaders()
    });
    if (!reposRes.ok) {
      const reposErr = await reposRes.json().catch(() => null);
      const errMsg = reposErr?.message ? `: ${reposErr.message}` : '';
      throw new Error(`GitHub repos request failed (${reposRes.status})${errMsg}`);
    }
    const repos = await reposRes.json();

    if (!Array.isArray(repos)) {
      throw new Error('GitHub repos response format is invalid.');
    }

    githubRagChunks = repos
      .filter((r) => r.description && r.description.trim())
      .slice(0, 18)
      .map((r) => `Repo ${r.name}: ${r.description}. Language: ${r.language || 'Mixed'}. Stars: ${r.stargazers_count}.`);

    const ghCols = getGithubCols();
    const targetCards = ghCols * 2;
    document.body.classList.add('gh-packed');
    document.body.style.setProperty('--gh-cols', String(ghCols));

    const curatedRepos = repos
      .filter((repo) => {
        const hasDescription = Boolean(repo.description && repo.description.trim());
        const normalizedName = normalizeRepoName(repo.name);
        const notInFeatured = !featuredRepoNames.has(normalizedName);
        return hasDescription && notInFeatured;
      })
      .slice(0, targetCards);

    if (!curatedRepos.length) {
      ghCardsEl.innerHTML = '<p class="muted">No additional described repositories to show right now.</p>';
      return;
    }

    ghCardsEl.innerHTML = curatedRepos
      .map((repo) => {
        const name = escapeHtml(repo.name || 'Untitled Repo');
        const desc = escapeHtml(truncateText(repo.description || 'No description provided yet.'));
        const lang = escapeHtml(repo.language || 'Mixed');
        const stars = Number(repo.stargazers_count || 0);
        const branches = Number(repo.forks_count || 0);

        const metaChips = [
          stars > 0 ? `<span class="repo-meta-chip">★ ${stars}</span>` : '',
          branches > 0 ? `<span class="repo-meta-chip">⑂ ${branches}</span>` : '',
          `<span class="repo-meta-chip repo-lang">${lang}</span>`
        ]
          .filter(Boolean)
          .join('');

        return `
          <article class="repo-card">
            <div class="repo-top">
              <h4><a class="project-link-title" href="${repo.html_url}" target="_blank" rel="noreferrer" title="${name}">${name}</a></h4>
              <a class="inline-link repo-open" href="${repo.html_url}" target="_blank" rel="noreferrer" aria-label="Open ${name}">Open</a>
            </div>
            <p class="repo-desc" title="${desc}">${desc}</p>
            <div class="repo-meta">${metaChips}</div>
          </article>
        `;
      })
      .join('');
  } catch (error) {
    const errorText = String(error?.message || '').toLowerCase();
    const isRateLimited = errorText.includes('rate limit');

    if (ghCardsEl) {
      ghCardsEl.innerHTML = isRateLimited
        ? '<p class="muted">GitHub API rate limit reached. Please wait a bit and refresh.</p>'
        : '<p class="muted">Could not load GitHub data right now. Refresh shortly.</p>';
    }
    if (ghHeadlineEl) {
      ghHeadlineEl.textContent = isRateLimited
        ? 'GitHub rate limit reached. Try again shortly.'
        : 'GitHub sync temporarily unavailable.';
    }
  }
}
loadGitHubData();

let githubReloadTimer;
window.addEventListener('resize', () => {
  clearTimeout(githubReloadTimer);
  githubReloadTimer = setTimeout(() => {
    syncMotionProfile();
    initGsapAnimations();
    loadGitHubData();
    setupInfiniteMarquee(tickerTrack);
    setupInfiniteMarquee(logoMarqueeEl);
  }, 180);
});

// GSAP premium animations
function initGsapAnimations() {
  if (gsapInitialized || !window.gsap || !window.ScrollTrigger || !isMotionEnabled()) return;
  gsapInitialized = true;
  gsap.registerPlugin(ScrollTrigger);

  const speed = motionProfile?.speed || 1;
  const intensity = motionProfile?.intensity || 1;

  gsap.from('.header', {
    y: -24,
    opacity: 0,
    duration: 0.8 * speed,
    ease: 'power3.out'
  });

  gsap.from('.hero-content > *', {
    y: 24,
    opacity: 0,
    duration: 0.8 * speed,
    stagger: 0.08 * speed,
    ease: 'power3.out'
  });

  gsap.from('.hero-side', {
    x: 30,
    opacity: 0,
    duration: 0.9 * speed,
    ease: 'power3.out'
  });

  gsap.from('.quick-meta span, .floating-tags span, .fetch-terminal', {
    y: 14,
    opacity: 0,
    duration: 0.7 * speed,
    stagger: 0.06 * speed,
    delay: 0.2 * speed,
    ease: 'power2.out'
  });

  gsap.to('.logo-pill', {
    y: -4 * intensity,
    duration: 1.6 * speed,
    ease: 'sine.inOut',
    repeat: -1,
    yoyo: true,
    stagger: 0.12 * speed
  });

  gsap.utils.toArray('.project, .profile-card, .timeline-item, .stat, .panel, .skill-logo-card, .exp-card, .lab-controls, .lab-console-wrap').forEach((el) => {
    gsap.from(el, {
      y: 26,
      opacity: 0,
      duration: 0.8 * speed,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        toggleActions: 'play none none none',
        once: true
      }
    });
  });
}

window.addEventListener('motionprofilechange', () => {
  initGsapAnimations();
  if (window.gsap?.globalTimeline) {
    window.gsap.globalTimeline.paused(!isMotionEnabled());
  }
});

initGsapAnimations();

function setupInfiniteMarquee(trackEl) {
  if (!trackEl) return;

  const sourceHtml = trackEl.dataset.sourceHtml || trackEl.innerHTML;
  trackEl.dataset.sourceHtml = sourceHtml;

  const template = document.createElement('template');
  template.innerHTML = sourceHtml.trim();
  const baseItems = Array.from(template.content.children);
  if (!baseItems.length) return;

  trackEl.innerHTML = '';

  const containerWidth = trackEl.parentElement?.clientWidth || window.innerWidth;
  let passes = 0;
  while (passes < 8 && trackEl.scrollWidth < containerWidth * 1.8) {
    baseItems.forEach((item) => trackEl.appendChild(item.cloneNode(true)));
    passes += 1;
  }

  const oneSet = trackEl.innerHTML;
  trackEl.innerHTML = `${oneSet}${oneSet}`;

  requestAnimationFrame(() => {
    const shift = trackEl.scrollWidth / 2;
    const durationSec = Math.max(18, shift / 70);
    trackEl.style.setProperty('--loop-shift', `${shift}px`);
    trackEl.style.setProperty('--loop-duration', `${durationSec}s`);
    trackEl.dataset.loopReady = '1';
  });
}

const tickerTrack = document.getElementById('tickerTrack');
setupInfiniteMarquee(tickerTrack);
setupInfiniteMarquee(logoMarqueeEl);

// keep marquees smooth if user switches tab/visibility
function syncMarqueePlayState() {
  const playState = document.hidden || !isMotionEnabled() ? 'paused' : 'running';
  if (tickerTrack) tickerTrack.style.animationPlayState = playState;
  if (logoMarqueeEl) logoMarqueeEl.style.animationPlayState = playState;
}

document.addEventListener('visibilitychange', syncMarqueePlayState);
window.addEventListener('motionprofilechange', syncMarqueePlayState);
syncMarqueePlayState();

// Starfield background
const canvas = document.getElementById('starfield');
const ctx = canvas?.getContext('2d');

if (canvas && ctx) {
  const stars = [];
  let starCount = motionProfile?.starCount || 70;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function syncStarCount() {
    const next = motionProfile?.starCount || 70;
    if (next === starCount) return;
    starCount = next;
    seedStars();
  }

  function seedStars() {
    stars.length = 0;
    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.3 + 0.2,
        speed: Math.random() * 0.18 + 0.05,
        alpha: Math.random() * 0.45 + 0.2
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const intensity = isMotionEnabled() ? (motionProfile?.intensity || 1) : 0;

    for (const s of stars) {
      ctx.beginPath();
      ctx.fillStyle = `rgba(255,255,255,${s.alpha})`;
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();

      if (intensity > 0) {
        s.y += s.speed * intensity;
        if (s.y > canvas.height) {
          s.y = -5;
          s.x = Math.random() * canvas.width;
        }
      }
    }

    if (intensity > 0) {
      requestAnimationFrame(draw);
    } else {
      setTimeout(() => requestAnimationFrame(draw), 120);
    }
  }

  resize();
  seedStars();
  draw();

  window.addEventListener('motionprofilechange', () => {
    syncStarCount();
  });

  window.addEventListener('resize', () => {
    resize();
    syncStarCount();
    seedStars();
  });
}

}
