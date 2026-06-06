import { isFastScrolling } from '../../lib/scroll-velocity.js';
import { isPerfLite } from '../../lib/performance.js';

const STAGGER_ROOTS = [
  '.stats',
  '.achievement-strip',
  '.about-grid',
  '.exp-focus-row',
  '.client-grid',
  '.cred-grid',
  '.milestone-grid',
  '.project-grid',
  '.github-cards',
  '.profile-grid',
  '.timeline',
  '.main-skill-grid',
  '.lab-btn-grid',
  '.cta-row',
].join(',');

const FLOAT_TARGETS = '.stat, .achievement-card, .main-skill-card';
const MAX_STAGGER_INDEX = 8;

function markStaggerContainers(root = document) {
  root.querySelectorAll(STAGGER_ROOTS).forEach((el) => {
    if (el.classList.contains('reveal-stagger')) return;
    el.classList.add('reveal-stagger');
    el.querySelectorAll(':scope > *').forEach((child, index) => {
      child.style.setProperty('--reveal-i', String(Math.min(index, MAX_STAGGER_INDEX)));
    });
  });

  root.querySelectorAll(FLOAT_TARGETS).forEach((el) => {
    el.classList.add('reveal-float');
  });
}

function playReveal(section) {
  section.classList.add('visible');
  requestAnimationFrame(() => {
    section.classList.add('is-revealed');
  });
}

/** Lightweight scroll reveals — transform/opacity only, unobserve after play. */
export function initScrollReveal(ctx) {
  const sections = Array.from(document.querySelectorAll('.reveal'));
  markStaggerContainers();

  let observer = null;
  const pendingReveals = [];
  let revealFrame = 0;

  const revealSection = (section, instant = false) => {
    if (section.classList.contains('is-revealed')) return;

    if (instant) {
      section.classList.add('visible', 'is-revealed');
    } else {
      playReveal(section);
    }

    observer?.unobserve(section);
  };

  const flushRevealQueue = () => {
    revealFrame = 0;
    if (!pendingReveals.length) return;

    if (isFastScrolling()) {
      const batch = pendingReveals.splice(0);
      batch.forEach((section) => revealSection(section, true));
      return;
    }

    revealSection(pendingReveals.shift(), false);

    if (pendingReveals.length) {
      revealFrame = requestAnimationFrame(flushRevealQueue);
    }
  };

  const queueReveal = (section) => {
    if (section.classList.contains('is-revealed')) return;
    pendingReveals.push(section);
    if (!revealFrame) {
      revealFrame = requestAnimationFrame(flushRevealQueue);
    }
  };

  const revealAll = () => {
    pendingReveals.length = 0;
    if (revealFrame) {
      cancelAnimationFrame(revealFrame);
      revealFrame = 0;
    }
    sections.forEach((section) => {
      section.classList.add('is-revealed', 'visible');
      observer?.unobserve(section);
    });
  };

  const observeSections = () => {
    if (observer) {
      observer.disconnect();
      observer = null;
    }

    if (!ctx.isMotionEnabled() || isPerfLite()) {
      revealAll();
      return;
    }

    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          queueReveal(entry.target);
        });
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -6% 0px',
      }
    );

    sections.forEach((section) => {
      if (!section.classList.contains('is-revealed')) {
        observer.observe(section);
      }
    });
  };

  ctx.refreshScrollReveal = (root = document) => {
    markStaggerContainers(root);
    observeSections();
  };

  observeSections();

  window.addEventListener('motionprofilechange', observeSections);

  return { refreshScrollReveal: ctx.refreshScrollReveal };
}
