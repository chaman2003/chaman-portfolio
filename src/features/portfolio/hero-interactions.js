import { TYPEWRITER_LINES } from '../../config/lab-commands.js';
import { isPerfLite } from '../../lib/performance.js';

export function initHeroInteractions(ctx) {
  const { typewriter, heroScene } = ctx.dom;

  let lineIndex = 0;
  let charIndex = 0;
  let deleting = false;

  const runTypewriter = () => {
    if (!typewriter) return;
    if (!ctx.isMotionEnabled() || isPerfLite()) {
      typewriter.textContent = TYPEWRITER_LINES[0];
      return;
    }

    const current = TYPEWRITER_LINES[lineIndex];

    if (!deleting) {
      charIndex += 1;
      typewriter.textContent = current.slice(0, charIndex);
      if (charIndex === current.length) {
        deleting = true;
        return setTimeout(runTypewriter, 1200);
      }
    } else {
      charIndex -= 1;
      typewriter.textContent = current.slice(0, charIndex);
      if (charIndex === 0) {
        deleting = false;
        lineIndex = (lineIndex + 1) % TYPEWRITER_LINES.length;
      }
    }

    const wait = Math.round((deleting ? 30 : 56) * (ctx.motion.profile?.speed || 1));
    setTimeout(runTypewriter, wait);
  };

  runTypewriter();

  const clearHeroSceneTransform = () => {
    if (!heroScene) return;
    const minWidth = ctx.motion.profile?.parallaxMinWidth || 1200;
    if (window.innerWidth < minWidth) {
      heroScene.style.transform = '';
    }
  };

  clearHeroSceneTransform();
  window.addEventListener('resize', clearHeroSceneTransform, { passive: true });

  if (isPerfLite()) return;

  const hasFinePointer = window.matchMedia('(pointer: fine)').matches;
  if (!hasFinePointer) return;

  let parallaxRaf = 0;
  let pendingParallax = null;

  const applyParallax = () => {
    parallaxRaf = 0;
    if (!heroScene || !ctx.isMotionEnabled()) return;
    if (window.innerWidth < (ctx.motion.profile?.parallaxMinWidth || 1200)) return;
    if (!pendingParallax) return;

    const { x, y } = pendingParallax;
    const scale = ctx.motion.profile?.parallaxScale || 0.1;
    heroScene.style.transform = `perspective(1000px) rotateY(${x * scale}deg) rotateX(${-y * scale}deg)`;
  };

  const onWindowMove = (event) => {
    if (!heroScene || !ctx.isMotionEnabled()) return;
    if (window.innerWidth < (ctx.motion.profile?.parallaxMinWidth || 1200)) return;

    pendingParallax = {
      x: (event.clientX / window.innerWidth - 0.5) * 3,
      y: (event.clientY / window.innerHeight - 0.5) * 3,
    };

    if (!parallaxRaf) {
      parallaxRaf = requestAnimationFrame(applyParallax);
    }
  };

  window.addEventListener('mousemove', onWindowMove, { passive: true });
  window.addEventListener('mouseleave', () => {
    if (!heroScene) return;
    heroScene.style.transform = 'perspective(1000px) rotateY(0deg) rotateX(0deg)';
  });

  let activeTilt = null;
  let tiltRaf = 0;

  const onTiltMove = (event) => {
    if (!ctx.isMotionEnabled()) return;
    const maxTilt = ctx.motion.profile?.tiltMax || 0;
    if (maxTilt <= 0) return;

    const card = event.target instanceof Element ? event.target.closest('.tilt') : null;
    if (!card) {
      if (activeTilt) {
        activeTilt.style.transform = 'perspective(700px) rotateX(0deg) rotateY(0deg)';
        activeTilt = null;
      }
      return;
    }

    activeTilt = card;
    if (tiltRaf) return;

    tiltRaf = requestAnimationFrame(() => {
      tiltRaf = 0;
      if (!activeTilt) return;
      const rect = activeTilt.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const rotateY = (x / rect.width - 0.5) * maxTilt;
      const rotateX = (0.5 - y / rect.height) * maxTilt;
      activeTilt.style.transform = `perspective(700px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });
  };

  document.addEventListener('pointermove', onTiltMove, { passive: true });

  window.addEventListener('motionprofilechange', () => {
    if (!heroScene || ctx.isMotionEnabled()) return;
    heroScene.style.transform = 'perspective(1000px) rotateY(0deg) rotateX(0deg)';
    document.querySelectorAll('.tilt').forEach((card) => {
      card.style.transform = 'perspective(700px) rotateX(0deg) rotateY(0deg)';
    });
    document.querySelectorAll('.magnetic').forEach((btn) => {
      btn.style.transform = 'translate(0, 0)';
    });
  });
}
