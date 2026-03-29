const yearEl = document.getElementById('year');
const typewriterEl = document.getElementById('typewriter');
const ghCardsEl = document.getElementById('githubCards');
const ghHeadlineEl = document.getElementById('ghHeadline');
const scrollProgressEl = document.getElementById('scrollProgress');
const heroSceneEl = document.getElementById('heroScene');
const themeToggleBtn = document.getElementById('themeToggle');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (yearEl) yearEl.textContent = new Date().getFullYear();

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

// Scroll progress
function updateScrollProgress() {
  if (!scrollProgressEl) return;
  const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
  const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
  const ratio = height > 0 ? (scrollTop / height) * 100 : 0;
  scrollProgressEl.style.width = `${ratio}%`;
}
window.addEventListener('scroll', updateScrollProgress);
updateScrollProgress();

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
  window.addEventListener('mousemove', (e) => {
    if (!cursorGlow) return;
    cursorGlow.style.left = `${e.clientX - 130}px`;
    cursorGlow.style.top = `${e.clientY - 130}px`;
  });
} else if (cursorGlow) {
  cursorGlow.style.display = 'none';
}

// Hero parallax (subtle)
if (!prefersReducedMotion) {
  window.addEventListener('mousemove', (e) => {
    if (!heroSceneEl || window.innerWidth < 900) return;
    const x = (e.clientX / window.innerWidth - 0.5) * 5;
    const y = (e.clientY / window.innerHeight - 0.5) * 5;
    heroSceneEl.style.transform = `perspective(1000px) rotateY(${x * 0.25}deg) rotateX(${-y * 0.22}deg)`;
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

// Command deck modal
const deckEl = document.getElementById('commandDeck');
const deckOpenBtn = document.getElementById('commandDeckOpen');
const deckCloseBtn = document.getElementById('commandDeckClose');

function openDeck() {
  if (!deckEl) return;
  deckEl.classList.add('active');
  deckEl.setAttribute('aria-hidden', 'false');
}

function closeDeck() {
  if (!deckEl) return;
  deckEl.classList.remove('active');
  deckEl.setAttribute('aria-hidden', 'true');
}

deckOpenBtn?.addEventListener('click', openDeck);
deckCloseBtn?.addEventListener('click', closeDeck);
deckEl?.addEventListener('click', (e) => {
  if (e.target === deckEl) closeDeck();
});
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeDeck();
  if (e.key.toLowerCase() === 'k' && (e.ctrlKey || e.metaKey)) {
    e.preventDefault();
    openDeck();
  }
});

const commandMap = {
  github: 'https://github.com/chaman2003',
  leetcode: 'https://leetcode.com/chaman_2003/',
  linkedin: 'https://linkedin.com/in/chaman2003',
  mail: 'mailto:chamans7952@gmail.com'
};

document.querySelectorAll('[data-action]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const action = btn.getAttribute('data-action');
    const url = commandMap[action];
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
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

    const reposRes = await fetch('https://api.github.com/users/chaman2003/repos?sort=updated&per_page=30');
    const repos = await reposRes.json();

    if (!Array.isArray(repos) || !ghCardsEl) return;

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
  githubReloadTimer = setTimeout(loadGitHubData, 180);
});

// GSAP premium animations
if (window.gsap && window.ScrollTrigger) {
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

  gsap.utils.toArray('.project, .profile-card, .timeline-item, .stat, .panel').forEach((el) => {
    gsap.from(el, {
      y: 26,
      opacity: 0,
      duration: 0.8,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        toggleActions: 'play none none reverse'
      }
    });
  });
}

// keep ticker smooth if user switches tab/visibility
const tickerTrack = document.getElementById('tickerTrack');
document.addEventListener('visibilitychange', () => {
  if (!tickerTrack) return;
  tickerTrack.style.animationPlayState = document.hidden ? 'paused' : 'running';
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
