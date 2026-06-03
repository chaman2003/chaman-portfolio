import { applyMobilePerfDocumentFlags } from '../../lib/performance.js';
import { createPortfolioContext } from './context.js';
import { initMotion } from './motion.js';
import { initPreloader } from './preloader.js';
import { initNavigation } from './navigation.js';
import { initScroll } from './scroll.js';
import { initLabTerminal } from './lab-terminal.js';
import { initGithub } from './github.js';
import { initHeroInteractions } from './hero-interactions.js';
import { initGsap } from './gsap.js';
import { initMarquee } from './marquee.js';
import { initStarfield } from './starfield.js';

/** Wire all DOM-driven portfolio interactions after the HTML shell mounts. */
export function initPortfolioEffects() {
  applyMobilePerfDocumentFlags();
  const ctx = createPortfolioContext();

  initMotion(ctx);
  initPreloader();
  initNavigation(ctx);

  const topbarEl = document.querySelector('.site-topbar');
  const headerEl = document.querySelector('.header');
  if (topbarEl) topbarEl.style.transform = 'none';
  if (headerEl) headerEl.style.transform = 'none';

  const heroScene = document.getElementById('heroScene');
  if (heroScene) {
    heroScene.style.transform = '';
  }

  if (ctx.dom.year) {
    ctx.dom.year.textContent = String(new Date().getFullYear());
  }

  initLabTerminal(ctx);
  initScroll(ctx);
  initHeroInteractions(ctx);

  const { initGsapAnimations } = initGsap(ctx);
  const { setupInfiniteMarquee } = initMarquee(ctx);

  initGithub(ctx, {
    onResize: () => {
      initGsapAnimations();
      setupInfiniteMarquee(ctx.dom.tickerTrack);
      setupInfiniteMarquee(ctx.dom.logoMarquee);
    },
  });

  initStarfield(ctx);
}
