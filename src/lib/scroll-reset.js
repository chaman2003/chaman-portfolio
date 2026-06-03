/** Force the page back to the top (beats browser scroll restoration on refresh). */
export function hardScrollToTop(lenis) {
  if (typeof window === 'undefined') return;

  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }

  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
  window.scrollTo(0, 0);

  if (lenis) {
    lenis.scrollTo(0, { immediate: true });
  }
}

export function resetRevealElements(elements = []) {
  elements.forEach((el) => {
    el.classList.remove('visible', 'is-revealed');
  });
}

export function scheduleScrollToTop(lenis) {
  hardScrollToTop(lenis);

  requestAnimationFrame(() => {
    hardScrollToTop(lenis);
    requestAnimationFrame(() => hardScrollToTop(lenis));
  });

  window.addEventListener('load', () => hardScrollToTop(lenis), { once: true });
}
