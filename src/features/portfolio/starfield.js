import { shouldRunStarfieldAnimation } from '../../lib/performance.js';

export function initStarfield(ctx) {
  const canvas = ctx.dom.starfield;
  const context2d = canvas?.getContext('2d', { alpha: true, desynchronized: true });
  if (!canvas || !context2d) return;

  const stars = [];
  let starCount = Math.min(ctx.motion.profile?.starCount || 40, 36);
  let rafId = 0;
  let lastFrame = 0;
  const targetFrameMs = 1000 / 30;

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    context2d.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const syncStarCount = () => {
    const next = Math.min(ctx.motion.profile?.starCount || 40, 36);
    if (next === starCount) return;
    starCount = next;
    seedStars();
  };

  const seedStars = () => {
    stars.length = 0;
    const w = window.innerWidth;
    const h = window.innerHeight;
    for (let i = 0; i < starCount; i += 1) {
      stars.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.1 + 0.2,
        speed: Math.random() * 0.14 + 0.04,
        alpha: Math.random() * 0.4 + 0.2,
      });
    }
  };

  const drawStatic = () => {
    context2d.clearRect(0, 0, window.innerWidth, window.innerHeight);
    context2d.fillStyle = 'rgba(255,255,255,0.35)';
    for (const s of stars) {
      context2d.globalAlpha = s.alpha;
      context2d.beginPath();
      context2d.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      context2d.fill();
    }
    context2d.globalAlpha = 1;
  };

  const draw = (timestamp) => {
    rafId = 0;

    if (!shouldRunStarfieldAnimation(ctx.isMotionEnabled())) {
      drawStatic();
      return;
    }

    if (timestamp - lastFrame < targetFrameMs) {
      rafId = requestAnimationFrame(draw);
      return;
    }
    lastFrame = timestamp;

    const w = window.innerWidth;
    const h = window.innerHeight;
    const intensity = ctx.motion.profile?.intensity || 1;

    context2d.clearRect(0, 0, w, h);
    context2d.fillStyle = '#fff';

    for (const s of stars) {
      context2d.globalAlpha = s.alpha;
      context2d.beginPath();
      context2d.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      context2d.fill();

      s.y += s.speed * intensity;
      if (s.y > h) {
        s.y = -4;
        s.x = Math.random() * w;
      }
    }

    context2d.globalAlpha = 1;
    rafId = requestAnimationFrame(draw);
  };

  const scheduleDraw = () => {
    if (rafId) return;
    rafId = requestAnimationFrame(draw);
  };

  resize();
  seedStars();
  drawStatic();

  if (shouldRunStarfieldAnimation(ctx.isMotionEnabled())) {
    scheduleDraw();
  }

  window.addEventListener('motionprofilechange', () => {
    syncStarCount();
    if (shouldRunStarfieldAnimation(ctx.isMotionEnabled())) {
      scheduleDraw();
    } else {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = 0;
      drawStatic();
    }
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = 0;
      return;
    }
    if (shouldRunStarfieldAnimation(ctx.isMotionEnabled())) {
      scheduleDraw();
    }
  });

  window.addEventListener(
    'resize',
    () => {
      resize();
      syncStarCount();
      seedStars();
      if (!shouldRunStarfieldAnimation(ctx.isMotionEnabled())) {
        drawStatic();
      }
    },
    { passive: true }
  );
}
