/** Force the page back to the top (beats browser scroll restoration on refresh). */
export function hardScrollToTop(scrollEngine) {
  if (typeof window === 'undefined') return;

  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }

  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
  window.scrollTo(0, 0);

  if (scrollEngine?.jump) {
    scrollEngine.jump(0);
  } else if (scrollEngine?.scrollTo) {
    scrollEngine.scrollTo(0, { immediate: true });
  }
}

export function scheduleScrollToTop(scrollEngine) {
  hardScrollToTop(scrollEngine);

  requestAnimationFrame(() => {
    hardScrollToTop(scrollEngine);
    requestAnimationFrame(() => hardScrollToTop(scrollEngine));
  });

  window.addEventListener('load', () => hardScrollToTop(scrollEngine), { once: true });
}
