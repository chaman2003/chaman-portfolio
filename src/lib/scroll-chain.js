/** When a nested scroller hits its top/bottom, pass wheel delta to the page. */
export function bindScrollChain(container) {
  if (!container || container.dataset.scrollChainBound === '1') return;
  container.dataset.scrollChainBound = '1';

  container.addEventListener(
    'wheel',
    (event) => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      if (scrollHeight <= clientHeight + 1) return;

      const maxScroll = scrollHeight - clientHeight;
      const delta = event.deltaY;
      const atTop = scrollTop <= 0;
      const atBottom = scrollTop >= maxScroll - 1;

      if ((delta < 0 && atTop) || (delta > 0 && atBottom)) {
        event.preventDefault();
        window.scrollBy({ top: delta, left: 0, behavior: 'auto' });
      }
    },
    { passive: false }
  );
}

export function bindScrollChains(selectors) {
  selectors.forEach((selector) => {
    document.querySelectorAll(selector).forEach(bindScrollChain);
  });
}
