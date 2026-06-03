export function initPreloader() {
  const preloaderDone = () => document.body.classList.add('loaded');
  window.addEventListener('load', () => setTimeout(preloaderDone, 420));
  setTimeout(preloaderDone, 1800);
}
