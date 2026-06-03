import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { shouldEnableSmoothCursor } from '../../lib/performance.js';
import './SmoothCursor.css';

const CURSOR_HEIGHT = 32;
const CURSOR_WIDTH = (CURSOR_HEIGHT * 50) / 54;
const TIP_OFFSET_X = CURSOR_WIDTH * 0.501;
const TIP_OFFSET_Y = CURSOR_HEIGHT * 0.1;

const TEXT_INPUT_SELECTOR =
  'input:not([type="button"]):not([type="submit"]):not([type="checkbox"]):not([type="radio"]), textarea, select, [contenteditable="true"]';

function DefaultCursorSVG() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 50 54"
      overflow="visible"
      fill="none"
      className="smooth-cursor__svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id="smooth-cursor-fill"
          x1="25"
          y1="4"
          x2="25"
          y2="44"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="var(--smooth-cursor-grad-a, #7ec8ff)" />
          <stop offset="0.55" stopColor="var(--smooth-cursor-grad-b, #4fa3ff)" />
          <stop offset="1" stopColor="var(--smooth-cursor-grad-c, #6f81ff)" />
        </linearGradient>
      </defs>
      <path
        d="M42.6817 41.1495L27.5103 6.79925C26.7269 5.02557 24.2082 5.02558 23.3927 6.79925L7.59814 41.1495C6.75833 42.9759 8.52712 44.8902 10.4125 44.1954L24.3757 39.0496C24.8829 38.8627 25.4385 38.8627 25.9422 39.0496L39.8121 44.1954C41.6849 44.8902 43.4884 42.9759 42.6817 41.1495Z"
        fill="url(#smooth-cursor-fill)"
      />
      <path
        d="M43.7146 40.6933L28.5431 6.34306C27.3556 3.65428 23.5772 3.69516 22.3668 6.32755L6.57226 40.6778C5.3134 43.4156 7.97238 46.298 10.803 45.2549L24.7662 40.109C25.0221 40.0147 25.2999 40.0156 25.5494 40.1082L39.4193 45.254C42.2261 46.2953 44.9254 43.4347 43.7146 40.6933Z"
        stroke="var(--smooth-cursor-stroke, #f5f8ff)"
        strokeWidth="2"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

function applyCursorState(el, { visible, pressed, hidden }) {
  el.classList.toggle('smooth-cursor--visible', visible);
  el.classList.toggle('smooth-cursor--pressed', pressed);
  el.classList.toggle('smooth-cursor--hidden', hidden);
}

export function SmoothCursor({ cursor = <DefaultCursorSVG /> }) {
  const [isActive, setIsActive] = useState(false);
  const rootRef = useRef(null);
  const svgRef = useRef(null);
  const enabledRef = useRef(false);
  const frameRef = useRef(0);
  const pendingRef = useRef(null);
  const stateRef = useRef({
    visible: false,
    pressed: false,
    hidden: false,
    clientX: -100,
    clientY: -100,
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia(
      '(any-hover: hover) and (any-pointer: fine) and (min-width: 1024px)'
    );

    const updateEnabled = () => {
      const nextEnabled = shouldEnableSmoothCursor() && mediaQuery.matches;
      enabledRef.current = nextEnabled;
      setIsActive(nextEnabled);
      document.documentElement.toggleAttribute('data-smooth-cursor', nextEnabled);
      if (!nextEnabled && rootRef.current) {
        applyCursorState(rootRef.current, { visible: false, pressed: false, hidden: false });
      }
    };

    updateEnabled();
    mediaQuery.addEventListener('change', updateEnabled);

    return () => {
      mediaQuery.removeEventListener('change', updateEnabled);
      document.documentElement.removeAttribute('data-smooth-cursor');
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, []);

  useEffect(() => {
    if (!isActive) return undefined;

    const root = rootRef.current;
    const svg = svgRef.current;
    if (!root || !svg) return undefined;

    const paint = () => {
      frameRef.current = 0;
      if (!enabledRef.current || document.hidden) return;

      const state = stateRef.current;
      const x = state.clientX - TIP_OFFSET_X;
      const y = state.clientY - TIP_OFFSET_Y;
      root.style.transform = `translate3d(${Math.round(x)}px, ${Math.round(y)}px, 0)`;
      applyCursorState(root, state);
    };

    const schedulePaint = () => {
      if (frameRef.current) return;
      frameRef.current = requestAnimationFrame(paint);
    };

    const queueMove = (clientX, clientY) => {
      const state = stateRef.current;
      state.clientX = clientX;
      state.clientY = clientY;
      state.visible =
        clientX >= 0 &&
        clientY >= 0 &&
        clientX <= window.innerWidth &&
        clientY <= window.innerHeight;
      schedulePaint();
    };

    const onPointerMove = (event) => {
      if (!enabledRef.current || event.pointerType === 'touch') return;
      queueMove(event.clientX, event.clientY);
    };

    const onPointerDown = (event) => {
      if (!enabledRef.current || event.pointerType === 'touch') return;
      stateRef.current.pressed = true;
      stateRef.current.hidden = false;
      stateRef.current.visible = true;
      queueMove(event.clientX, event.clientY);
    };

    const onPointerUp = () => {
      stateRef.current.pressed = false;
      schedulePaint();
    };

    const onPointerOver = (event) => {
      if (!enabledRef.current) return;
      if (document.documentElement.dataset.magicuiThemeVt === 'active') {
        stateRef.current.hidden = false;
        stateRef.current.visible = true;
        queueMove(event.clientX, event.clientY);
        return;
      }
      const target = event.target;
      const inTextZone = target instanceof Element && Boolean(target.closest(TEXT_INPUT_SELECTOR));
      stateRef.current.hidden = false;
      stateRef.current.visible = true;
      if (inTextZone && event.pointerType !== 'touch') {
        queueMove(event.clientX, event.clientY);
        return;
      }
      schedulePaint();
    };

    const onThemeTransitionChange = () => {
      if (!enabledRef.current) return;
      const isThemeTransition = document.documentElement.dataset.magicuiThemeVt === 'active';
      if (isThemeTransition) {
        stateRef.current.hidden = false;
        stateRef.current.visible = true;
        schedulePaint();
      }
    };

    const themeTransitionObserver = new MutationObserver(onThemeTransitionChange);
    themeTransitionObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-magicui-theme-vt'],
    });

    const hideCursor = () => {
      stateRef.current.visible = false;
      schedulePaint();
    };

    const onVisibilityChange = () => {
      if (!document.hidden) return;
      hideCursor();
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerdown', onPointerDown, { passive: true });
    window.addEventListener('pointerup', onPointerUp, { passive: true });
    window.addEventListener('pointercancel', onPointerUp, { passive: true });
    window.addEventListener('pointerover', onPointerOver, { passive: true });
    window.addEventListener('blur', hideCursor);
    document.documentElement.addEventListener('mouseleave', hideCursor);
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
      window.removeEventListener('pointerover', onPointerOver);
      window.removeEventListener('blur', hideCursor);
      document.documentElement.removeEventListener('mouseleave', hideCursor);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      themeTransitionObserver.disconnect();
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [isActive]);

  if (!isActive) {
    return null;
  }

  return createPortal(
    <div ref={rootRef} className="smooth-cursor" aria-hidden="true">
      <span className="smooth-cursor__glow" />
      <span ref={svgRef} className="smooth-cursor__svg-wrap">
        {cursor}
      </span>
    </div>,
    document.body
  );
}
