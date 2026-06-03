import { motionValue } from 'motion';
import { attachFollow } from 'motion-dom';
import { createMotionSmoothScroll } from '../../lib/motion-smooth-scroll.js';
import { shouldEnableMotionSmoothScroll } from '../../lib/performance.js';
import { hardScrollToTop, scheduleScrollToTop } from '../../lib/scroll-reset.js';

let activeScrollTeardown = null;

const PROGRESS_SPRING = {
  type: 'spring',
  stiffness: 100,
  damping: 30,
  restDelta: 0.001,
};

function markNestedScrollAreas() {
  document
    .querySelectorAll('[data-nested-scroll], [data-lenis-prevent], .fetch-body, #labOutput, .nav-drawer-links')
    .forEach((el) => {
      el.setAttribute('data-nested-scroll', '');
    });
}

/** Let wheel/touch scroll stay inside terminal panels instead of moving the page. */
function bindNestedScrollGuards() {
  const nestedScrollers = document.querySelectorAll('[data-nested-scroll]');

  nestedScrollers.forEach((el) => {
    if (el.dataset.nestedScrollBound === '1') return;
    el.dataset.nestedScrollBound = '1';

    el.addEventListener(
      'wheel',
      (event) => {
        if (el.scrollHeight <= el.clientHeight) return;
        event.stopPropagation();
      },
      { passive: true }
    );

    el.addEventListener(
      'touchmove',
      (event) => {
        if (el.scrollHeight <= el.clientHeight) return;
        event.stopPropagation();
      },
      { passive: true }
    );
  });
}

function getScrollMetrics(engine) {
  if (engine) {
    return { scroll: engine.scroll, limit: engine.limit };
  }

  const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
  const limit = document.documentElement.scrollHeight - document.documentElement.clientHeight;
  return { scroll: scrollTop, limit };
}

export function initScroll(ctx) {
  if (activeScrollTeardown) {
    activeScrollTeardown();
    activeScrollTeardown = null;
  }

  const { scrollProgress, backToTop } = ctx.dom;
  const scrollApi = { engine: null, scrollTo: null, destroy: () => {} };

  hardScrollToTop();
  document.body.classList.remove('nav-open');
  if (scrollProgress) scrollProgress.style.transform = 'scaleX(0)';
  backToTop?.classList.remove('visible');

  const rawProgress = motionValue(0);
  const smoothProgress = motionValue(0);
  const stopProgressFollow = attachFollow(smoothProgress, rawProgress, PROGRESS_SPRING);

  let lastProgressScale = -1;
  let lastBackToTopVisible = null;
  let stopProgressListener = () => {};

  if (scrollProgress) {
    stopProgressListener = smoothProgress.on('change', (scale) => {
      const clamped = Math.min(1, Math.max(0, scale));
      if (Math.abs(clamped - lastProgressScale) > 0.001) {
        lastProgressScale = clamped;
        scrollProgress.style.transform = `scaleX(${clamped})`;
      }
    });
  }

  const updateScrollProgress = () => {
    const { scroll, limit } = getScrollMetrics(scrollApi.engine);
    const ratio = limit > 0 ? scroll / limit : 0;
    rawProgress.set(Math.min(1, Math.max(0, ratio)));

    if (backToTop) {
      const showTop = scroll > 260;
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
  const onScrollProgress = () => {
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
  const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;

  markNestedScrollAreas();
  bindNestedScrollGuards();

  if (useMotionScroll) {
    const engine = createMotionSmoothScroll({
      wheelMultiplier: isCoarsePointer ? 0.85 : 0.72,
      touchMultiplier: isCoarsePointer ? 0.92 : 1.05,
    });

    engine.bind({
      smoothWheel: !isCoarsePointer,
      smoothTouch: false,
    });

    scrollApi.engine = engine;
    window.__portfolioMotionScroll = engine;

    let progressRaf = 0;
    const trackProgress = () => {
      onScrollProgress();
      progressRaf = requestAnimationFrame(trackProgress);
    };
    progressRaf = requestAnimationFrame(trackProgress);

    if (window.gsap?.ticker && window.ScrollTrigger) {
      window.gsap.registerPlugin(window.ScrollTrigger);
      window.gsap.ticker.add(onScrollProgress);
      window.gsap.ticker.lagSmoothing(0);
    }

    scrollApi.destroy = () => {
      cancelAnimationFrame(progressRaf);
      engine.destroy();
      document.documentElement.classList.remove('motion-smooth-scroll');
      scrollApi.engine = null;
      if (window.__portfolioMotionScroll === engine) {
        window.__portfolioMotionScroll = null;
      }
      if (window.gsap?.ticker) {
        window.gsap.ticker.remove(onScrollProgress);
      }
    };

    hardScrollToTop(engine);
    engine.resize();
    scheduleScrollToTop(engine);
  } else {
    scheduleScrollToTop();
    window.addEventListener('scroll', onScrollProgress, { passive: true });
    updateScrollProgress();
  }

  const onPageShow = () => {
    hardScrollToTop(scrollApi.engine);
    lastProgressScale = -1;
    lastBackToTopVisible = null;
    updateScrollProgress();
    scrollApi.engine?.resize();
  };

  window.addEventListener('pageshow', onPageShow);

  if (!useMotionScroll) {
    updateScrollProgress();
  }

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

  const baseDestroy = scrollApi.destroy;
  scrollApi.destroy = () => {
    window.removeEventListener('pageshow', onPageShow);
    stopProgressFollow();
    stopProgressListener();
    if (!useMotionScroll) {
      window.removeEventListener('scroll', onScrollProgress);
    }
    baseDestroy();
  };

  activeScrollTeardown = scrollApi.destroy;
  ctx.scroll = scrollApi;
  return scrollApi;
}
