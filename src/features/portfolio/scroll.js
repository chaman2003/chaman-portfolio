import { motionValue } from 'motion';
import { attachFollow } from 'motion-dom';
import { createMotionSmoothScroll } from '../../lib/motion-smooth-scroll.js';
import {
  shouldEnableMotionSmoothScroll,
  shouldUseSpringScrollProgress,
} from '../../lib/performance.js';
import { bindScrollChains } from '../../lib/scroll-chain.js';
import { hardScrollToTop, scheduleScrollToTop } from '../../lib/scroll-reset.js';

let activeScrollTeardown = null;

const PROGRESS_SPRING = {
  type: 'spring',
  stiffness: 100,
  damping: 30,
  restDelta: 0.001,
};

/** Only true inner panels (lab, mobile nav) — not the hero terminal. */
function markNestedScrollAreas() {
  document
    .querySelectorAll('[data-nested-scroll], #labOutput, .nav-drawer-links')
    .forEach((el) => {
      el.setAttribute('data-nested-scroll', '');
    });
}

export function initScroll(ctx) {
  if (activeScrollTeardown) {
    activeScrollTeardown();
    activeScrollTeardown = null;
  }

  const { scrollProgress, backToTop } = ctx.dom;
  const scrollApi = { engine: null, scrollTo: null, destroy: () => {} };
  const useSpringProgress = shouldUseSpringScrollProgress();

  hardScrollToTop();
  document.body.classList.remove('nav-open');
  if (scrollProgress) scrollProgress.style.transform = 'scaleX(0)';
  backToTop?.classList.remove('visible');

  const rawProgress = motionValue(0);
  const smoothProgress = motionValue(0);
  const stopProgressFollow = useSpringProgress
    ? attachFollow(smoothProgress, rawProgress, PROGRESS_SPRING)
    : () => {};

  let lastProgressScale = -1;
  let lastBackToTopVisible = null;
  let stopProgressListener = () => {};

  if (scrollProgress && useSpringProgress) {
    stopProgressListener = smoothProgress.on('change', (scale) => {
      const clamped = Math.min(1, Math.max(0, scale));
      if (Math.abs(clamped - lastProgressScale) > 0.001) {
        lastProgressScale = clamped;
        scrollProgress.style.transform = `scaleX(${clamped})`;
      }
    });
  }

  const updateScrollProgress = () => {
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    const limit = Math.max(
      0,
      document.documentElement.scrollHeight - document.documentElement.clientHeight
    );
    const ratio = limit > 0 ? scrollTop / limit : 0;
    const clamped = Math.min(1, Math.max(0, ratio));

    if (useSpringProgress) {
      rawProgress.set(clamped);
    } else if (scrollProgress && Math.abs(clamped - lastProgressScale) > 0.001) {
      lastProgressScale = clamped;
      scrollProgress.style.transform = `scaleX(${clamped})`;
    }

    if (backToTop) {
      const showTop = scrollTop > 260;
      if (showTop !== lastBackToTopVisible) {
        lastBackToTopVisible = showTop;
        backToTop.classList.toggle('visible', showTop);
      }
    }
  };

  const scrollToTarget = (target, options = {}) => {
    const offset = options.offset ?? -12;

    if (scrollApi.engine) {
      scrollApi.engine.scrollTo(target, { offset, immediate: options.immediate });
      return;
    }

    const el = typeof target === 'string' ? document.querySelector(target) : target;
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  scrollApi.scrollTo = scrollToTarget;

  let scrollTicking = false;
  const onScroll = () => {
    if (scrollTicking) return;
    scrollTicking = true;
    requestAnimationFrame(() => {
      scrollTicking = false;
      updateScrollProgress();
    });
  };

  document.querySelectorAll('.reveal').forEach((el) => {
    el.classList.add('visible', 'is-revealed');
  });

  const useMotionScroll = shouldEnableMotionSmoothScroll();

  markNestedScrollAreas();

  if (!useSpringProgress) {
    bindScrollChains(['#labOutput', '.nav-drawer-links']);
  }

  if (useMotionScroll) {
    const engine = createMotionSmoothScroll();
    engine.bind();
    scrollApi.engine = engine;
    window.__portfolioMotionScroll = engine;

    hardScrollToTop(engine);
    engine.resize();
    scheduleScrollToTop(engine);
  } else {
    scheduleScrollToTop();
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  updateScrollProgress();

  const onPageShow = () => {
    hardScrollToTop(scrollApi.engine);
    lastProgressScale = -1;
    lastBackToTopVisible = null;
    updateScrollProgress();
    scrollApi.engine?.resize();
  };

  window.addEventListener('pageshow', onPageShow);

  backToTop?.addEventListener('click', () => {
    scrollToTarget(0, { offset: 0 });
  });

  document.addEventListener(
    'click',
    (event) => {
      const link = event.target instanceof Element ? event.target.closest('a[href^="#"]') : null;
      if (!link) return;

      const hash = link.getAttribute('href');
      if (!hash || hash === '#') return;

      const target = document.querySelector(hash);
      if (!target) return;

      if (link.target === '_blank') return;

      event.preventDefault();
      scrollToTarget(target, { offset: -16 });
    },
    { capture: true }
  );

  const counters = document.querySelectorAll('[data-counter]');
  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = Number(el.getAttribute('data-counter'));
        let value = 0;
        const steps = 52;
        const increment = Math.max(1, Math.ceil(target / steps));
        const timer = setInterval(() => {
          value += increment;
          if (value >= target) {
            value = target;
            clearInterval(timer);
          }
          el.textContent = value + (target === 24 ? '/7' : '+');
        }, 42);
        counterObserver.unobserve(el);
      });
    },
    { threshold: 0.35 }
  );
  counters.forEach((counter) => counterObserver.observe(counter));

  scrollApi.destroy = () => {
    window.removeEventListener('pageshow', onPageShow);
    window.removeEventListener('scroll', onScroll);
    stopProgressFollow();
    stopProgressListener();
    scrollApi.engine?.destroy();
    document.documentElement.classList.remove('motion-smooth-scroll');
    scrollApi.engine = null;
    if (window.__portfolioMotionScroll) {
      window.__portfolioMotionScroll = null;
    }
  };

  activeScrollTeardown = scrollApi.destroy;
  ctx.scroll = scrollApi;
  return scrollApi;
}
