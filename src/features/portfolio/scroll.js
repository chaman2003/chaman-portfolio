import Lenis from 'lenis';
import { shouldEnableLenisScroll } from '../../lib/performance.js';
import {
  hardScrollToTop,
  resetRevealElements,
  scheduleScrollToTop,
} from '../../lib/scroll-reset.js';

let activeScrollTeardown = null;

const PLEASING_EASE = (t) => 1 - (1 - t) ** 4;
const ANCHOR_SCROLL_DURATION = 2.35;

function markNestedScrollAreas() {
  document
    .querySelectorAll('.fetch-body, #labOutput, .lab-console, nav#siteNav')
    .forEach((el) => {
      el.setAttribute('data-lenis-prevent', '');
    });
}

function getScrollMetrics(lenis) {
  if (lenis) {
    return { scroll: lenis.scroll, limit: lenis.limit };
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
  const scrollApi = { lenis: null, scrollTo: null, destroy: () => {} };

  hardScrollToTop();
  document.body.classList.remove('nav-open');
  if (scrollProgress) scrollProgress.style.transform = 'scaleX(0)';
  backToTop?.classList.remove('visible');

  let lastProgressScale = -1;
  let lastBackToTopVisible = null;

  const updateScrollProgress = () => {
    const { scroll, limit } = getScrollMetrics(scrollApi.lenis);
    const ratio = limit > 0 ? scroll / limit : 0;
    const scale = Math.min(1, Math.max(0, ratio));

    if (scrollProgress && Math.abs(scale - lastProgressScale) > 0.001) {
      lastProgressScale = scale;
      scrollProgress.style.transform = `scaleX(${scale})`;
    }

    if (backToTop) {
      const showTop = scroll > 260;
      if (showTop !== lastBackToTopVisible) {
        lastBackToTopVisible = showTop;
        backToTop.classList.toggle('visible', showTop);
      }
    }
  };

  const scrollToTarget = (target, options = {}) => {
    const duration = options.duration ?? ANCHOR_SCROLL_DURATION;
    const offset = options.offset ?? -12;

    if (scrollApi.lenis) {
      scrollApi.lenis.scrollTo(target, {
        offset,
        duration,
        easing: options.easing ?? PLEASING_EASE,
        lock: false,
      });
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

  const reveals = document.querySelectorAll('.reveal');
  const revealElements = Array.from(reveals);
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  resetRevealElements(revealElements);
  document.body.classList.remove('js-reveal');

  let revealObserver = null;

  const lockRevealVisible = (el) => {
    if (el.classList.contains('is-revealed')) return;
    el.classList.add('visible', 'is-revealed');
    revealObserver?.unobserve(el);
  };

  const useLenis = shouldEnableLenisScroll();

  if (useLenis) {
    markNestedScrollAreas();

    const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
    const lenis = new Lenis({
      autoRaf: true,
      lerp: isCoarsePointer ? 0.09 : 0.062,
      wheelMultiplier: 0.72,
      touchMultiplier: 1.08,
      smoothWheel: true,
      syncTouch: isCoarsePointer,
      syncTouchLerp: 0.065,
      overscroll: true,
      prevent: (node) => Boolean(node?.closest?.('[data-lenis-prevent]')),
    });

    document.documentElement.classList.add('lenis', 'lenis-smooth');
    scrollApi.lenis = lenis;
    window.__portfolioLenis = lenis;

    lenis.on('scroll', onScrollProgress);

    if (window.gsap?.ticker && window.ScrollTrigger) {
      window.gsap.registerPlugin(window.ScrollTrigger);
      lenis.on('scroll', window.ScrollTrigger.update);
      window.gsap.ticker.lagSmoothing(0);
    }

    scrollApi.destroy = () => {
      lenis.destroy();
      document.documentElement.classList.remove('lenis', 'lenis-smooth');
      scrollApi.lenis = null;
      if (window.__portfolioLenis === lenis) {
        window.__portfolioLenis = null;
      }
    };

    hardScrollToTop(lenis);
    lenis.resize();
    scheduleScrollToTop(lenis);
  } else {
    scheduleScrollToTop();
  }

  const onPageShow = (event) => {
    hardScrollToTop(scrollApi.lenis);
    lastProgressScale = -1;
    lastBackToTopVisible = null;
    updateScrollProgress();

    if (event.persisted) {
      resetRevealElements(revealElements);
      document.body.classList.remove('js-reveal');
      if (!prefersReducedMotion && revealElements.length) {
        document.body.classList.add('js-reveal');
        revealElements.forEach((el) => revealObserver?.observe(el));
      }
    }

    scrollApi.lenis?.resize();
  };

  window.addEventListener('pageshow', onPageShow);

  if (!useLenis) {
    window.addEventListener('scroll', onScrollProgress, { passive: true });
  }

  updateScrollProgress();

  backToTop?.addEventListener('click', () => {
    scrollToTarget(0, { duration: 2.6, offset: 0 });
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
      scrollToTarget(target, { offset: -16, duration: ANCHOR_SCROLL_DURATION });
    },
    { capture: true }
  );

  if (revealElements.length) {
    if (prefersReducedMotion) {
      revealElements.forEach((el) => lockRevealVisible(el));
    } else {
      document.body.classList.add('js-reveal');
    }

    revealElements.forEach((el) => {
      el.addEventListener(
        'transitionend',
        (event) => {
          if (event.propertyName === 'opacity' || event.propertyName === 'transform') {
            lockRevealVisible(el);
          }
        },
        { passive: true }
      );
    });

    if (!prefersReducedMotion && 'IntersectionObserver' in window) {
      revealObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) lockRevealVisible(entry.target);
          });
        },
        {
          threshold: 0.12,
          rootMargin: '0px 0px -4% 0px',
        }
      );
      revealElements.forEach((el) => revealObserver.observe(el));
    }
  }

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
    baseDestroy();
  };

  activeScrollTeardown = scrollApi.destroy;
  ctx.scroll = scrollApi;
  return scrollApi;
}
