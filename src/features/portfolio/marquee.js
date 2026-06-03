export function setupInfiniteMarquee(trackEl) {
  if (!trackEl) return;

  const sourceHtml = trackEl.dataset.sourceHtml || trackEl.innerHTML;
  trackEl.dataset.sourceHtml = sourceHtml;

  const template = document.createElement('template');
  template.innerHTML = sourceHtml.trim();
  const baseItems = Array.from(template.content.children);
  if (!baseItems.length) return;

  trackEl.innerHTML = '';

  const containerWidth = trackEl.parentElement?.clientWidth || window.innerWidth;
  let passes = 0;
  while (passes < 8 && trackEl.scrollWidth < containerWidth * 1.8) {
    baseItems.forEach((item) => trackEl.appendChild(item.cloneNode(true)));
    passes += 1;
  }

  const oneSet = trackEl.innerHTML;
  trackEl.innerHTML = `${oneSet}${oneSet}`;

  requestAnimationFrame(() => {
    const shift = trackEl.scrollWidth / 2;
    const durationSec = Math.max(18, shift / 70);
    trackEl.style.setProperty('--loop-shift', `${shift}px`);
    trackEl.style.setProperty('--loop-duration', `${durationSec}s`);
    trackEl.dataset.loopReady = '1';
  });
}

export function initMarquee(ctx) {
  const { tickerTrack, logoMarquee } = ctx.dom;

  setupInfiniteMarquee(tickerTrack);
  setupInfiniteMarquee(logoMarquee);

  const syncMarqueePlayState = () => {
    const playState = document.hidden || !ctx.isMotionEnabled() ? 'paused' : 'running';
    if (tickerTrack) tickerTrack.style.animationPlayState = playState;
    if (logoMarquee) logoMarquee.style.animationPlayState = playState;
  };

  document.addEventListener('visibilitychange', syncMarqueePlayState);
  window.addEventListener('motionprofilechange', syncMarqueePlayState);
  syncMarqueePlayState();

  return { setupInfiniteMarquee };
}
