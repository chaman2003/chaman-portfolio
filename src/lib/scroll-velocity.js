const FAST_SCROLL_PX_MS = 3.75;
const IDLE_MS = 120;

let lastY = 0;
let lastTime = 0;
let idleTimer = 0;
let listening = false;

function onScroll() {
  const now = performance.now();
  const y = window.scrollY;
  const dt = Math.max(now - lastTime, 1);
  const velocity = Math.abs(y - lastY) / dt;

  document.documentElement.classList.add('is-scrolling');

  if (velocity >= FAST_SCROLL_PX_MS) {
    document.documentElement.classList.add('is-scrolling-fast');
  } else {
    document.documentElement.classList.remove('is-scrolling-fast');
  }

  lastY = y;
  lastTime = now;

  window.clearTimeout(idleTimer);
  idleTimer = window.setTimeout(() => {
    document.documentElement.classList.remove('is-scrolling', 'is-scrolling-fast');
  }, IDLE_MS);
}

/** Track scroll speed so animations can back off during fast wheel/touch flings. */
export function bindScrollVelocityTracking() {
  if (listening || typeof window === 'undefined') return () => {};

  lastY = window.scrollY;
  lastTime = performance.now();
  listening = true;
  window.addEventListener('scroll', onScroll, { passive: true });

  return () => {
    window.removeEventListener('scroll', onScroll);
    window.clearTimeout(idleTimer);
    document.documentElement.classList.remove('is-scrolling', 'is-scrolling-fast');
    listening = false;
  };
}

export function isFastScrolling() {
  return document.documentElement.classList.contains('is-scrolling-fast');
}
