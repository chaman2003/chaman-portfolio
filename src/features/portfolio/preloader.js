import { hardScrollToTop } from '../../lib/scroll-reset.js';

export function initPreloader() {
  const preloaderDone = () => {
    hardScrollToTop(window.__portfolioMotionScroll ?? null);
    document.body.classList.add('loaded');
  };

  window.addEventListener('load', () => setTimeout(preloaderDone, 420));
  setTimeout(preloaderDone, 1800);
}
