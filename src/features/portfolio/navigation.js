export function initNavigation(ctx) {
  const { siteNav, menuToggle, navClose, navBackdrop } = ctx.dom;

  const isDrawerViewport = () => window.innerWidth <= 1023;

  const setNavOpen = (open) => {
    const shouldOpen = Boolean(open) && isDrawerViewport();
    document.body.classList.toggle('nav-open', shouldOpen);
    menuToggle?.setAttribute('aria-expanded', shouldOpen ? 'true' : 'false');
    siteNav?.setAttribute('aria-hidden', shouldOpen ? 'false' : 'true');
    navBackdrop?.setAttribute('aria-hidden', shouldOpen ? 'false' : 'true');
  };

  const closeNav = () => setNavOpen(false);
  const toggleNav = () => setNavOpen(!document.body.classList.contains('nav-open'));

  const syncNavForViewport = () => {
    if (!isDrawerViewport()) {
      document.body.classList.remove('nav-open');
      menuToggle?.setAttribute('aria-expanded', 'false');
      siteNav?.removeAttribute('aria-hidden');
      navBackdrop?.setAttribute('aria-hidden', 'true');
      return;
    }

    const navOpen = document.body.classList.contains('nav-open');
    menuToggle?.setAttribute('aria-expanded', navOpen ? 'true' : 'false');
    siteNav?.setAttribute('aria-hidden', navOpen ? 'false' : 'true');
    navBackdrop?.setAttribute('aria-hidden', navOpen ? 'false' : 'true');
  };

  menuToggle?.addEventListener('click', toggleNav);
  navClose?.addEventListener('click', closeNav);
  navBackdrop?.addEventListener('click', closeNav);

  siteNav?.addEventListener('click', (event) => {
    const link = event.target.closest('a[href^="#"]');
    if (!link) return;
    closeNav();
  });

  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeNav();
  });

  const syncMobileHeaderOffset = () => {
    if (!isDrawerViewport()) {
      document.documentElement.style.removeProperty('--mobile-header-offset');
      return;
    }

    const topbar = document.querySelector('.site-topbar');
    const header = document.querySelector('.header');
    const measureEl = topbar || header;
    if (!measureEl) return;

    const offset = Math.ceil(measureEl.getBoundingClientRect().height + 14);
    document.documentElement.style.setProperty('--mobile-header-offset', `${offset}px`);
  };

  window.addEventListener('resize', () => {
    syncNavForViewport();
    syncMobileHeaderOffset();
  });
  syncNavForViewport();
  syncMobileHeaderOffset();
  requestAnimationFrame(syncMobileHeaderOffset);

  const navLinks = Array.from(document.querySelectorAll('nav a[href^="#"]'));
  const sectionMap = navLinks
    .map((link) => {
      const target = document.querySelector(link.getAttribute('href'));
      return target ? { link, target } : null;
    })
    .filter(Boolean);

  if ('IntersectionObserver' in window) {
    const navObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const current = sectionMap.find((s) => s.target === entry.target);
          if (!current) return;
          navLinks.forEach((l) => l.classList.remove('active'));
          current.link.classList.add('active');
        });
      },
      { threshold: 0.35 }
    );

    sectionMap.forEach((s) => navObserver.observe(s.target));
  }
}
