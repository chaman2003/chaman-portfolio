import { animate, motionValue } from 'motion';
import { attachFollow } from 'motion-dom';

const DEFAULT_SPRING = {
  type: 'spring',
  stiffness: 120,
  damping: 28,
  mass: 0.85,
};

const ANCHOR_SPRING = {
  type: 'spring',
  stiffness: 72,
  damping: 22,
  mass: 1.05,
};

function getScrollLimit() {
  return Math.max(
    0,
    document.documentElement.scrollHeight - document.documentElement.clientHeight
  );
}

function clampScroll(y) {
  return Math.min(Math.max(0, y), getScrollLimit());
}

function resolveScrollY(target, offset = 0) {
  if (target === 0 || target === '0') return 0;

  if (typeof target === 'number') return clampScroll(target);

  const el = typeof target === 'string' ? document.querySelector(target) : target;
  if (!el) return null;

  return clampScroll(el.getBoundingClientRect().top + window.scrollY + offset);
}

/**
 * Motion spring–driven smooth scroll (replaces Lenis).
 * Wheel deltas update a target value; attachFollow springs the page position toward it.
 */
export function createMotionSmoothScroll(options = {}) {
  const wheelMultiplier = options.wheelMultiplier ?? 0.72;
  const touchMultiplier = options.touchMultiplier ?? 0.92;
  const wheelSpring = { ...DEFAULT_SPRING, ...options.wheelSpring };

  const targetY = motionValue(window.scrollY);
  const smoothY = motionValue(window.scrollY);

  let anchorAnimation = null;
  let touchStartY = 0;
  let lastTouchY = 0;
  let enabled = true;

  const stopFollow = attachFollow(smoothY, targetY, wheelSpring);

  const applyScroll = (y) => {
    const clamped = clampScroll(y);
    if (Math.abs(window.scrollY - clamped) > 0.5) {
      window.scrollTo(0, clamped);
    }
    return clamped;
  };

  const unsubSmooth = smoothY.on('change', (latest) => {
    applyScroll(latest);
  });

  const syncFromNativeScroll = () => {
    const y = window.scrollY;
    targetY.jump(y);
    smoothY.jump(y);
  };

  const shouldIgnoreEvent = (event) =>
    Boolean(event.target?.closest?.('[data-nested-scroll], [data-lenis-prevent]'));

  const onWheel = (event) => {
    if (!enabled || shouldIgnoreEvent(event)) return;

    event.preventDefault();
    targetY.set(clampScroll(targetY.get() + event.deltaY * wheelMultiplier));
  };

  const onTouchStart = (event) => {
    if (!enabled || shouldIgnoreEvent(event)) return;
    touchStartY = event.touches[0]?.clientY ?? 0;
    lastTouchY = touchStartY;
  };

  const onTouchMove = (event) => {
    if (!enabled || shouldIgnoreEvent(event)) return;

    const y = event.touches[0]?.clientY ?? lastTouchY;
    const delta = lastTouchY - y;
    lastTouchY = y;

    if (Math.abs(delta) < 0.5) return;

    event.preventDefault();
    targetY.set(clampScroll(targetY.get() + delta * touchMultiplier));
  };

  const scrollTo = (target, opts = {}) => {
    const { offset = 0, immediate = false } = opts;
    const y = resolveScrollY(target, offset);
    if (y === null) return;

    anchorAnimation?.stop();

    if (immediate) {
      targetY.jump(y);
      smoothY.jump(y);
      applyScroll(y);
      return;
    }

    anchorAnimation = animate(targetY, y, {
      ...ANCHOR_SPRING,
      onComplete: () => {
        anchorAnimation = null;
      },
    });
  };

  const destroy = () => {
    enabled = false;
    anchorAnimation?.stop();
    anchorAnimation = null;
    stopFollow();
    unsubSmooth();
    window.removeEventListener('wheel', onWheel);
    window.removeEventListener('touchstart', onTouchStart);
    window.removeEventListener('touchmove', onTouchMove);
    window.removeEventListener('scroll', syncFromNativeScroll);
  };

  const bind = ({ smoothWheel = true, smoothTouch = false } = {}) => {
    document.documentElement.classList.add('motion-smooth-scroll');

    if (smoothWheel) {
      window.addEventListener('wheel', onWheel, { passive: false });
    }

    if (smoothTouch) {
      window.addEventListener('touchstart', onTouchStart, { passive: true });
      window.addEventListener('touchmove', onTouchMove, { passive: false });
    } else {
      window.addEventListener('scroll', syncFromNativeScroll, { passive: true });
    }
  };

  const resize = () => {
    targetY.set(clampScroll(targetY.get()));
  };

  return {
    scrollTo,
    destroy,
    bind,
    resize,
    get scroll() {
      return smoothY.get();
    },
    get limit() {
      return getScrollLimit();
    },
    jump(y) {
      const clamped = clampScroll(y);
      targetY.jump(clamped);
      smoothY.jump(clamped);
      applyScroll(clamped);
    },
  };
}
