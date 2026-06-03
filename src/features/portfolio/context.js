/** DOM refs and shared runtime state for portfolio effects. */
export function createPortfolioContext() {
  return {
    dom: {
      year: document.getElementById('year'),
      typewriter: document.getElementById('typewriter'),
      githubCards: document.getElementById('githubCards'),
      githubHeadline: document.getElementById('ghHeadline'),
      scrollProgress: document.getElementById('scrollProgress'),
      heroScene: document.getElementById('heroScene'),
      logoMarquee: document.getElementById('logoMarquee'),
      backToTop: document.getElementById('backToTop'),
      labOutput: document.getElementById('labOutput'),
      labButtons: Array.from(document.querySelectorAll('.lab-btn')),
      labForm: document.getElementById('labForm'),
      labInput: document.getElementById('labInput'),
      fetchForm: document.getElementById('fetchForm'),
      fetchInput: document.getElementById('fetchInput'),
      siteNav: document.getElementById('siteNav'),
      menuToggle: document.getElementById('menuToggle'),
      navClose: document.getElementById('navClose'),
      navBackdrop: document.getElementById('navBackdrop'),
      tickerTrack: document.getElementById('tickerTrack'),
      starfield: document.getElementById('starfield'),
    },
    motion: {
      profile: null,
      userSetting: localStorage.getItem('portfolio_motion') || 'on',
      gsapInitialized: false,
      reducedMotionQuery: window.matchMedia('(prefers-reduced-motion: reduce)'),
      toggleButtons: Array.from(document.querySelectorAll('[data-motion-toggle]')),
    },
    rag: {
      githubProfileChunk: '',
      githubRagChunks: [],
    },
    lab: {
      history: [],
      historyCursor: -1,
      busy: false,
    },
    scroll: {
      engine: null,
      scrollTo: null,
      destroy: () => {},
    },
    isMotionEnabled: () => false,
    syncMotionProfile: () => {},
  };
}
