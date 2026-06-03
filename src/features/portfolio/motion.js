import { isPerfLite } from '../../lib/performance.js';

function getViewportTier(width = window.innerWidth) {
  if (width < 320) return 'watch';
  if (width < 480) return 'phone';
  if (width < 768) return 'phablet';
  if (width < 1024) return 'tablet';
  if (width < 1440) return 'laptop';
  if (width < 1920) return 'desktop';
  return 'ultra';
}

function buildMotionProfile(ctx) {
  const tier = getViewportTier();
  const profiles = {
    watch: {
      speed: 1.55,
      intensity: 0.3,
      sparkModulo: 16,
      parallaxMinWidth: 9999,
      parallaxScale: 0,
      tiltMax: 0,
      magneticFactor: 0,
      starCount: 8,
    },
    phone: {
      speed: 1.35,
      intensity: 0.42,
      sparkModulo: 14,
      parallaxMinWidth: 9999,
      parallaxScale: 0,
      tiltMax: 0,
      magneticFactor: 0,
      starCount: 10,
    },
    phablet: {
      speed: 1.2,
      intensity: 0.5,
      sparkModulo: 12,
      parallaxMinWidth: 9999,
      parallaxScale: 0,
      tiltMax: 0,
      magneticFactor: 0,
      starCount: 14,
    },
    tablet: {
      speed: 1.1,
      intensity: 0.58,
      sparkModulo: 10,
      parallaxMinWidth: 9999,
      parallaxScale: 0,
      tiltMax: 2,
      magneticFactor: 0,
      starCount: 18,
    },
    laptop: {
      speed: 1,
      intensity: 0.65,
      sparkModulo: 8,
      parallaxMinWidth: 1280,
      parallaxScale: 0.05,
      tiltMax: 2,
      magneticFactor: 0,
      starCount: 22,
    },
    desktop: {
      speed: 0.96,
      intensity: 0.72,
      sparkModulo: 6,
      parallaxMinWidth: 1280,
      parallaxScale: 0.06,
      tiltMax: 2.5,
      magneticFactor: 0,
      starCount: 28,
    },
    ultra: {
      speed: 0.93,
      intensity: 0.78,
      sparkModulo: 4,
      parallaxMinWidth: 1400,
      parallaxScale: 0.07,
      tiltMax: 3,
      magneticFactor: 0,
      starCount: 32,
    },
  };

  const level = profiles[tier];
  const enabled = ctx.motion.userSetting === 'on' && !ctx.motion.reducedMotionQuery.matches;
  return { ...level, tier, enabled };
}

export function initMotion(ctx) {
  const { motion } = ctx;

  if (isPerfLite()) {
    document.body.setAttribute('data-perf-lite', 'true');
  }

  const updateMotionToggleLabel = () => {
    if (!motion.toggleButtons.length || !motion.profile) return;

    if (motion.reducedMotionQuery.matches) {
      motion.toggleButtons.forEach((btn) => {
        btn.textContent = 'Motion Off (System)';
        btn.setAttribute('aria-pressed', 'false');
        btn.title = 'Motion follows system reduced-motion preference.';
      });
      return;
    }

    motion.toggleButtons.forEach((btn) => {
      btn.textContent = motion.profile.enabled ? 'Motion On' : 'Motion Off';
      btn.setAttribute('aria-pressed', motion.profile.enabled ? 'true' : 'false');
      btn.title = motion.profile.enabled
        ? 'Disable cinematic motion effects'
        : 'Enable cinematic motion effects';
    });
  };

  ctx.syncMotionProfile = () => {
    motion.profile = buildMotionProfile(ctx);
    document.body.setAttribute('data-motion', motion.profile.enabled ? 'on' : 'off');
    document.body.setAttribute('data-motion-level', motion.profile.tier);
    document.body.style.setProperty('--motion-speed', String(motion.profile.speed));
    document.body.style.setProperty(
      '--motion-play-state',
      motion.profile.enabled ? 'running' : 'paused'
    );
    updateMotionToggleLabel();

    if (window.gsap?.globalTimeline) {
      window.gsap.globalTimeline.paused(!motion.profile.enabled);
    }

    window.dispatchEvent(new Event('motionprofilechange'));
  };

  ctx.isMotionEnabled = () => Boolean(motion.profile?.enabled);

  if (typeof motion.reducedMotionQuery.addEventListener === 'function') {
    motion.reducedMotionQuery.addEventListener('change', ctx.syncMotionProfile);
  } else if (typeof motion.reducedMotionQuery.addListener === 'function') {
    motion.reducedMotionQuery.addListener(ctx.syncMotionProfile);
  }

  motion.toggleButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      motion.userSetting = motion.userSetting === 'on' ? 'off' : 'on';
      localStorage.setItem('portfolio_motion', motion.userSetting);
      ctx.syncMotionProfile();
    });
  });

  ctx.syncMotionProfile();
}
