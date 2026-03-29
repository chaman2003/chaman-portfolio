const yearEl = document.getElementById('year');
const typewriterEl = document.getElementById('typewriter');
const ghCardsEl = document.getElementById('githubCards');
const ghHeadlineEl = document.getElementById('ghHeadline');
const scrollProgressEl = document.getElementById('scrollProgress');
const heroSceneEl = document.getElementById('heroScene');
const themeToggleBtn = document.getElementById('themeToggle');
const logoMarqueeEl = document.getElementById('logoMarquee');
const clickFxEl = document.getElementById('clickFx');
const backToTopBtn = document.getElementById('backToTop');
const labOutputEl = document.getElementById('labOutput');
const labButtons = Array.from(document.querySelectorAll('.lab-btn'));
const labFormEl = document.getElementById('labForm');
const labInputEl = document.getElementById('labInput');
const fetchFormEl = document.getElementById('fetchForm');
const fetchInputEl = document.getElementById('fetchInput');
const fetchOutputEl = document.getElementById('fetchOutput');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (yearEl) yearEl.textContent = new Date().getFullYear();

// Preloader
const preloaderDone = () => document.body.classList.add('loaded');
window.addEventListener('load', () => setTimeout(preloaderDone, 420));
setTimeout(preloaderDone, 1800);

// Theme toggle
const storedTheme = localStorage.getItem('theme');
if (storedTheme === 'light') {
  document.body.setAttribute('data-theme', 'light');
  if (themeToggleBtn) themeToggleBtn.textContent = '☀️ Light';
}

function toggleTheme() {
  const current = document.body.getAttribute('data-theme') || 'dark';
  const next = current === 'dark' ? 'light' : 'dark';
  document.body.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
  if (themeToggleBtn) themeToggleBtn.textContent = next === 'dark' ? '🌙 Dark' : '☀️ Light';
}

themeToggleBtn?.addEventListener('click', toggleTheme);

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

// Intelligent terminal commands (Groq + local RAG)
const GROQ_API_KEY = localStorage.getItem('vrik_groq_key') || 'REPLACE_WITH_GROQ_API_KEY';
const GROQ_MODEL = 'llama-3.3-70b-versatile';

const resumeRagChunks = [
  'Professional summary: AI & ML undergraduate and full-stack developer specializing in AI-driven systems and real-time applications. Experienced with MERN and Python solutions integrating LLM, STT, and TTS workflows.',
  'Education: B.E in AI & ML at Vivekananda Institute of Technology, Bengaluru (Dec 2022 - Jun 2026), CGPA 8.7.',
  'Internship: Cortex Craft AI (Jan 2026 - Present), building AI-first POCs with LLM integration, agentic/RAG workflows, secure APIs, and scalable architectures.',
  'Internship: Edunet Foundation (Mar 2025 - Apr 2025), built PeakHive MERN e-commerce platform, improved engagement by 50% and reduced order-processing errors by 20%.',
  'Projects: Epsilora AI, PrintChakra AI, PeakHive, Tic Tac Toe AI.',
  'Skills: React, TypeScript, Node.js, Express, Python, Flask, MongoDB, PostgreSQL, LLMs, RAG, LangChain, MCP, Docker, Kubernetes, CI/CD.',
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
  stack: `Core Stack:\n- React, TypeScript, Node.js, Express\n- Python, Flask, Socket.IO\n- MongoDB, PostgreSQL, Supabase\n- LLMs, RAG, LangChain, MCP\n- Docker, Kubernetes, CI/CD`,
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

function tokenize(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9+.#\s]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 2);
}

function getRagDocuments() {
  return [...resumeRagChunks, ...linkedinRagChunks, githubProfileChunk, ...githubRagChunks].filter(Boolean);
}

function retrieveRagContext(query, topK = 6) {
  const docs = getRagDocuments();
  if (!docs.length) return [];

  const qTokens = tokenize(query);
  const scored = docs.map((doc) => {
    let score = 0;
    const low = doc.toLowerCase();
    qTokens.forEach((token) => {
      if (low.includes(token)) score += token.length > 5 ? 2 : 1;
    });
    return { doc, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const best = scored.filter((d) => d.score > 0).slice(0, topK).map((d) => d.doc);
  return best.length ? best : docs.slice(0, topK);
}

async function callGroqWithRag(query, { short = false } = {}) {
  if (!GROQ_API_KEY || GROQ_API_KEY === 'REPLACE_WITH_GROQ_API_KEY') {
    throw new Error('Groq API key missing. Set localStorage key "vrik_groq_key" and retry.');
  }

  const context = retrieveRagContext(query);
  const payload = {
    model: GROQ_MODEL,
    temperature: 0.3,
    max_tokens: short ? 220 : 450,
    messages: [
      {
        role: 'system',
        content: 'You are a concise portfolio assistant. Answer using only provided context. Keep responses accurate and professional.'
      },
      {
        role: 'user',
        content: `Question: ${query}\n\nContext:\n${context.join('\n\n')}`
      }
    ]
  };

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${GROQ_API_KEY}`
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const msg = await res.text();
    throw new Error(`Groq request failed (${res.status}): ${msg.slice(0, 160)}`);
  }

  const data = await res.json();
  return data?.choices?.[0]?.message?.content?.trim() || 'No response generated.';
}

function typeToElement(el, text) {
  if (!el) return;
  if (prefersReducedMotion) {
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

function setTopTerminalStatus(text) {
  if (!fetchOutputEl) return;
  fetchOutputEl.textContent = text;
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
    setTopTerminalStatus('Cleared. Top terminal is connected to the Interactive Lab below.');
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
      if (opts.source === 'top') {
        setTopTerminalStatus(`Sent to lab: ${commandRaw}`);
      }
      const response = await callGroqWithRag(aiQuery);
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
  if (opts.source === 'top') {
    setTopTerminalStatus(`Sent to lab: ${commandRaw}`);
  }
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
    if (labInputEl) labInputEl.value = cmd;
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
window.addEventListener('scroll', updateScrollProgress);
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

  setTimeout(runTypewriter, deleting ? 30 : 56);
}
runTypewriter();

// Cursor glow follow
const cursorGlow = document.getElementById('cursorGlow');
const hasFinePointer = window.matchMedia('(pointer: fine)').matches;
if (hasFinePointer && !prefersReducedMotion) {
  let sparkTick = 0;
  window.addEventListener('mousemove', (e) => {
    if (cursorGlow) {
      cursorGlow.style.left = `${e.clientX - 130}px`;
      cursorGlow.style.top = `${e.clientY - 130}px`;
    }

    if (!clickFxEl) return;
    sparkTick += 1;
    if (sparkTick % 3 !== 0) return;

    const spark = document.createElement('span');
    spark.className = 'cursor-spark';
    spark.style.left = `${e.clientX + (Math.random() * 10 - 5)}px`;
    spark.style.top = `${e.clientY + (Math.random() * 10 - 5)}px`;
    clickFxEl.appendChild(spark);
    setTimeout(() => spark.remove(), 560);
  });
} else if (cursorGlow) {
  cursorGlow.style.display = 'none';
}

// Click burst effect
if (clickFxEl && !prefersReducedMotion) {
  window.addEventListener('pointerdown', (e) => {
    const ring = document.createElement('span');
    ring.className = 'click-ring';
    ring.style.left = `${e.clientX}px`;
    ring.style.top = `${e.clientY}px`;
    clickFxEl.appendChild(ring);
    setTimeout(() => ring.remove(), 720);
  });
}

// Hero parallax (ultra subtle to avoid overlap)
if (!prefersReducedMotion) {
  window.addEventListener('mousemove', (e) => {
    if (!heroSceneEl || window.innerWidth < 1200) return;
    const x = (e.clientX / window.innerWidth - 0.5) * 3;
    const y = (e.clientY / window.innerHeight - 0.5) * 3;
    heroSceneEl.style.transform = `perspective(1000px) rotateY(${x * 0.12}deg) rotateX(${-y * 0.1}deg)`;
  });
  window.addEventListener('mouseleave', () => {
    if (!heroSceneEl) return;
    heroSceneEl.style.transform = 'perspective(1000px) rotateY(0deg) rotateX(0deg)';
  });
}

// 3D tilt cards (subtle)
const tiltCards = document.querySelectorAll('.tilt');
if (!prefersReducedMotion) {
  tiltCards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const rotateY = ((x / rect.width) - 0.5) * 5;
      const rotateX = (0.5 - y / rect.height) * 5;
      card.style.transform = `perspective(700px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(700px) rotateX(0deg) rotateY(0deg)';
    });
  });
}

// Magnetic buttons (very subtle)
const magneticButtons = document.querySelectorAll('.magnetic');
if (!prefersReducedMotion) {
  magneticButtons.forEach((btn) => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - (rect.left + rect.width / 2);
      const y = e.clientY - (rect.top + rect.height / 2);
      btn.style.transform = `translate(${x * 0.07}px, ${y * 0.07}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'translate(0, 0)';
    });
  });
}

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

function getGithubCols() {
  const w = window.innerWidth;
  if (w >= 1700) return 5;
  if (w >= 1280) return 4;
  if (w >= 980) return 3;
  if (w >= 640) return 2;
  return 1;
}

async function loadGitHubData() {
  try {
    const userRes = await fetch('https://api.github.com/users/chaman2003');
    const user = await userRes.json();

    if (ghHeadlineEl && user?.login) {
      ghHeadlineEl.textContent = `${user.public_repos ?? 0} public repos • ${user.followers ?? 0} followers • ${user.location || 'Open to global collaboration'}`;
    }

    githubProfileChunk = `GitHub profile ${user?.login || 'chaman2003'}: ${user?.public_repos ?? 0} public repos, ${user?.followers ?? 0} followers, location ${user?.location || 'not specified'}, bio: ${user?.bio || 'N/A'}.`;

    const reposRes = await fetch('https://api.github.com/users/chaman2003/repos?sort=updated&per_page=30');
    const repos = await reposRes.json();

    if (!Array.isArray(repos) || !ghCardsEl) return;

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
        const desc = repo.description;
        const lang = repo.language || 'Mixed';
        return `
          <article class="repo-card">
            <div class="repo-top">
              <h4><a class="project-link-title" href="${repo.html_url}" target="_blank" rel="noreferrer">${repo.name}</a></h4>
              <a class="inline-link" href="${repo.html_url}" target="_blank" rel="noreferrer">Open</a>
            </div>
            <p>${desc}</p>
            <div class="repo-meta">
              <span>★ ${repo.stargazers_count}</span>
              <span>⑂ ${repo.forks_count}</span>
              <span>${lang}</span>
            </div>
          </article>
        `;
      })
      .join('');
  } catch (error) {
    if (ghCardsEl) {
      ghCardsEl.innerHTML = '<p class="muted">Could not load GitHub data right now. Refresh shortly.</p>';
    }
    if (ghHeadlineEl) {
      ghHeadlineEl.textContent = 'GitHub sync temporarily unavailable.';
    }
  }
}
loadGitHubData();

let githubReloadTimer;
window.addEventListener('resize', () => {
  clearTimeout(githubReloadTimer);
  githubReloadTimer = setTimeout(() => {
    loadGitHubData();
    setupInfiniteMarquee(tickerTrack);
    setupInfiniteMarquee(logoMarqueeEl);
  }, 180);
});

// GSAP premium animations
if (window.gsap && window.ScrollTrigger && !prefersReducedMotion) {
  gsap.registerPlugin(ScrollTrigger);

  gsap.from('.header', {
    y: -24,
    opacity: 0,
    duration: 0.8,
    ease: 'power3.out'
  });

  gsap.from('.hero-content > *', {
    y: 24,
    opacity: 0,
    duration: 0.8,
    stagger: 0.08,
    ease: 'power3.out'
  });

  gsap.from('.hero-side', {
    x: 30,
    opacity: 0,
    duration: 0.9,
    ease: 'power3.out'
  });

  gsap.from('.quick-meta span, .floating-tags span, .fetch-terminal', {
    y: 14,
    opacity: 0,
    duration: 0.7,
    stagger: 0.06,
    delay: 0.2,
    ease: 'power2.out'
  });

  gsap.to('.logo-pill', {
    y: -4,
    duration: 1.6,
    ease: 'sine.inOut',
    repeat: -1,
    yoyo: true,
    stagger: 0.12
  });

  gsap.utils.toArray('.project, .profile-card, .timeline-item, .stat, .panel, .skill-logo-card, .achievement-card, .exp-card, .lab-controls, .lab-console-wrap').forEach((el) => {
    gsap.from(el, {
      y: 26,
      opacity: 0,
      duration: 0.8,
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
document.addEventListener('visibilitychange', () => {
  const playState = document.hidden ? 'paused' : 'running';
  if (tickerTrack) tickerTrack.style.animationPlayState = playState;
  if (logoMarqueeEl) logoMarqueeEl.style.animationPlayState = playState;
});

// Starfield background
const canvas = document.getElementById('starfield');
const ctx = canvas?.getContext('2d');

if (canvas && ctx) {
  const stars = [];
  const starCount = prefersReducedMotion ? 45 : 95;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
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

    for (const s of stars) {
      ctx.beginPath();
      ctx.fillStyle = `rgba(255,255,255,${s.alpha})`;
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();

      s.y += s.speed;
      if (s.y > canvas.height) {
        s.y = -5;
        s.x = Math.random() * canvas.width;
      }
    }

    requestAnimationFrame(draw);
  }

  resize();
  seedStars();
  draw();

  window.addEventListener('resize', () => {
    resize();
    seedStars();
  });
}
