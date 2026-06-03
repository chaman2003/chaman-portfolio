import { isPerfLite } from '../../lib/performance.js';

export function initGsap(ctx) {
  const initGsapAnimations = () => {
    const { motion } = ctx;
    if (
      motion.gsapInitialized ||
      !window.gsap ||
      !window.ScrollTrigger ||
      !ctx.isMotionEnabled() ||
      isPerfLite()
    ) {
      return;
    }

    motion.gsapInitialized = true;
    window.gsap.registerPlugin(window.ScrollTrigger);

    const speed = motion.profile?.speed || 1;
    const intensity = motion.profile?.intensity || 1;

    window.gsap.from('.header', {
      y: -24,
      opacity: 0,
      duration: 0.8 * speed,
      ease: 'power3.out',
      clearProps: 'transform',
      onComplete: () => {
        window.gsap.set('.header', { clearProps: 'transform' });
      },
    });

    window.gsap.from('.hero-content > *', {
      y: 24,
      opacity: 0,
      duration: 0.8 * speed,
      stagger: 0.08 * speed,
      ease: 'power3.out',
    });

    window.gsap.from('.hero-side', {
      x: 30,
      opacity: 0,
      duration: 0.9 * speed,
      ease: 'power3.out',
    });

    window.gsap.from('.quick-meta span, .floating-tags span, .fetch-terminal', {
      y: 14,
      opacity: 0,
      duration: 0.7 * speed,
      stagger: 0.06 * speed,
      delay: 0.2 * speed,
      ease: 'power2.out',
    });

    window.gsap.to('.logo-pill', {
      y: -4 * intensity,
      duration: 1.6 * speed,
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true,
      stagger: 0.12 * speed,
    });

  };

  window.addEventListener('motionprofilechange', () => {
    initGsapAnimations();
    if (window.gsap?.globalTimeline) {
      window.gsap.globalTimeline.paused(!ctx.isMotionEnabled());
    }
  });

  initGsapAnimations();

  return { initGsapAnimations };
}
