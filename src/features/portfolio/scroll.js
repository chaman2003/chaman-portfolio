export function initScroll(ctx) {
  const { scrollProgress, backToTop } = ctx.dom;

  const updateScrollProgress = () => {
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const ratio = height > 0 ? (scrollTop / height) * 100 : 0;

    if (scrollProgress) {
      scrollProgress.style.width = `${ratio}%`;
    }

    if (backToTop) {
      backToTop.classList.toggle('visible', scrollTop > 260);
    }
  };

  let scrollTicking = false;
  const onScrollProgress = () => {
    if (scrollTicking) return;
    scrollTicking = true;
    requestAnimationFrame(() => {
      scrollTicking = false;
      updateScrollProgress();
    });
  };

  window.addEventListener('scroll', onScrollProgress, { passive: true });
  updateScrollProgress();

  backToTop?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    document.body.classList.add('js-reveal');
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('visible');
        });
      },
      { threshold: 0.12 }
    );
    reveals.forEach((el) => revealObserver.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('visible'));
  }

  const counters = document.querySelectorAll('[data-counter]');
  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = Number(el.getAttribute('data-counter'));
        let value = 0;
        const increment = Math.max(1, Math.ceil(target / 40));
        const timer = setInterval(() => {
          value += increment;
          if (value >= target) {
            value = target;
            clearInterval(timer);
          }
          el.textContent = value + (target === 24 ? '/7' : '+');
        }, 28);
        counterObserver.unobserve(el);
      });
    },
    { threshold: 0.4 }
  );
  counters.forEach((counter) => counterObserver.observe(counter));
}
