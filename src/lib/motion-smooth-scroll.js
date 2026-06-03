import { animate } from 'motion';

const ANCHOR_SPRING = {
  type: 'spring',
  stiffness: 90,
  damping: 24,
  mass: 0.95,
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
 * Motion spring scroll for programmatic navigation only (anchors, back-to-top).
 * Page wheel/touch scrolling stays native so nested panels and mobile work reliably.
 */
export function createMotionSmoothScroll() {
  let anchorAnimation = null;
  let enabled = true;

  const scrollTo = (target, opts = {}) => {
    const { offset = 0, immediate = false } = opts;
    const y = resolveScrollY(target, offset);
    if (y === null) return;

    anchorAnimation?.stop();

    if (immediate) {
      window.scrollTo(0, y);
      return;
    }

    const start = window.scrollY;
    if (Math.abs(start - y) < 2) return;

    anchorAnimation = animate(start, y, {
      ...ANCHOR_SPRING,
      onUpdate: (latest) => {
        window.scrollTo(0, latest);
      },
      onComplete: () => {
        anchorAnimation = null;
      },
    });
  };

  const destroy = () => {
    enabled = false;
    anchorAnimation?.stop();
    anchorAnimation = null;
  };

  const bind = () => {
    document.documentElement.classList.add('motion-smooth-scroll');
  };

  const resize = () => {};

  return {
    scrollTo,
    destroy,
    bind,
    resize,
    get scroll() {
      return window.scrollY;
    },
    get limit() {
      return getScrollLimit();
    },
    jump(y) {
      if (!enabled) return;
      window.scrollTo(0, clampScroll(y));
    },
  };
}
