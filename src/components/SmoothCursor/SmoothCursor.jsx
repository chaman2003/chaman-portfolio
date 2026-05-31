import { useEffect, useRef, useState } from 'react';
import './SmoothCursor.css';

const DESKTOP_POINTER_QUERY = '(any-hover: hover) and (any-pointer: fine)';

/** Match --smooth-cursor-height and tip % in CSS (system-sized ~32px arrow). */
const CURSOR_HEIGHT = 32;
const CURSOR_WIDTH = (CURSOR_HEIGHT * 50) / 54;
const TIP_OFFSET_X = CURSOR_WIDTH * 0.501;
const TIP_OFFSET_Y = CURSOR_HEIGHT * 0.1;

function isTrackablePointer(pointerType) {
  return pointerType !== 'touch';
}

function DefaultCursorSVG() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 50 54"
      fill="none"
      className="smooth-cursor__svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="smooth-cursor-fill" x1="25" y1="4" x2="25" y2="44" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--smooth-cursor-grad-a, #7ec8ff)" />
          <stop offset="0.55" stopColor="var(--smooth-cursor-grad-b, #4fa3ff)" />
          <stop offset="1" stopColor="var(--smooth-cursor-grad-c, #6f81ff)" />
        </linearGradient>
        <filter
          id="smooth-cursor-shadow"
          x={0.602397}
          y={0.952444}
          width={49.0584}
          height={52.428}
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity={0} result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy={2.25825} />
          <feGaussianBlur stdDeviation={2.25825} />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.18 0 0 0 0 0.45 0 0 0 0 0.95 0 0 0 0.45 0"
          />
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_91_7928" />
          <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_91_7928" result="shape" />
        </filter>
      </defs>
      <g filter="url(#smooth-cursor-shadow)">
        <path
          d="M42.6817 41.1495L27.5103 6.79925C26.7269 5.02557 24.2082 5.02558 23.3927 6.79925L7.59814 41.1495C6.75833 42.9759 8.52712 44.8902 10.4125 44.1954L24.3757 39.0496C24.8829 38.8627 25.4385 38.8627 25.9422 39.0496L39.8121 44.1954C41.6849 44.8902 43.4884 42.9759 42.6817 41.1495Z"
          fill="url(#smooth-cursor-fill)"
        />
        <path
          d="M43.7146 40.6933L28.5431 6.34306C27.3556 3.65428 23.5772 3.69516 22.3668 6.32755L6.57226 40.6778C5.3134 43.4156 7.97238 46.298 10.803 45.2549L24.7662 40.109C25.0221 40.0147 25.2999 40.0156 25.5494 40.1082L39.4193 45.254C42.2261 46.2953 44.9254 43.4347 43.7146 40.6933Z"
          stroke="var(--smooth-cursor-stroke, #f5f8ff)"
          strokeWidth={2.25825}
        />
      </g>
    </svg>
  );
}

export function SmoothCursor({ cursor = <DefaultCursorSVG /> }) {
  const cursorRef = useRef(null);
  const tiltRef = useRef(0);
  const rafRef = useRef(0);
  const targetTiltRef = useRef(0);
  const lastPosRef = useRef({ x: 0, y: 0, hasValue: false });
  const [isEnabled, setIsEnabled] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [isTextCursorZone, setIsTextCursorZone] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(DESKTOP_POINTER_QUERY);

    const updateEnabled = () => {
      const nextIsEnabled = mediaQuery.matches;
      setIsEnabled(nextIsEnabled);
      document.documentElement.toggleAttribute('data-smooth-cursor', nextIsEnabled);
      if (!nextIsEnabled) {
        setIsVisible(false);
      }
    };

    updateEnabled();
    mediaQuery.addEventListener('change', updateEnabled);

    return () => {
      mediaQuery.removeEventListener('change', updateEnabled);
      document.documentElement.removeAttribute('data-smooth-cursor');
    };
  }, []);

  useEffect(() => {
    if (!isEnabled) {
      return undefined;
    }

    const el = cursorRef.current;
    if (!el) return undefined;

    const updateTilt = () => {
      const elNode = cursorRef.current;
      if (!elNode) return;

      const next = targetTiltRef.current;
      const current = tiltRef.current;
      const delta = next - current;
      tiltRef.current = current + delta * 0.22;
      elNode.style.setProperty('--smooth-cursor-tilt', `${tiltRef.current.toFixed(2)}deg`);

      if (Math.abs(delta) > 0.08) {
        rafRef.current = requestAnimationFrame(updateTilt);
      } else {
        rafRef.current = 0;
      }
    };

    const move = (clientX, clientY) => {
      if (clientX < 0 || clientY < 0 || clientX > window.innerWidth || clientY > window.innerHeight) {
        setIsVisible(false);
        return;
      }

      const x = clientX - TIP_OFFSET_X;
      const y = clientY - TIP_OFFSET_Y;
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`;

      const last = lastPosRef.current;
      if (last.hasValue) {
        const dx = clientX - last.x;
        const dy = clientY - last.y;
        const speed = Math.hypot(dx, dy);
        const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
        // Keep a Windows-like pointer baseline and add a small velocity-based tilt.
        const dynamicTilt = Math.sin(((angle + 25) * Math.PI) / 180) * Math.min(5.5, speed * 0.28);
        targetTiltRef.current = dynamicTilt;
        if (!rafRef.current) {
          rafRef.current = requestAnimationFrame(updateTilt);
        }
      }
      lastPosRef.current = { x: clientX, y: clientY, hasValue: true };

      setIsVisible(!isTextCursorZone);
    };

    const onPointerMove = (e) => {
      if (!isTrackablePointer(e.pointerType)) return;
      move(e.clientX, e.clientY);
    };

    const supportsRaw = 'onpointerrawupdate' in window;

    const onPointerRawUpdate = (e) => {
      if (!isTrackablePointer(e.pointerType)) return;
      move(e.clientX, e.clientY);
    };

    const onPointerDown = (e) => {
      if (!isTrackablePointer(e.pointerType)) return;
      setIsPressed(true);
      move(e.clientX, e.clientY);
    };

    const onPointerUp = () => setIsPressed(false);
    const onPointerCancel = () => setIsPressed(false);

    const onDocumentLeave = () => setIsVisible(false);
    const onWindowBlur = () => setIsVisible(false);

    const onPointerOver = (e) => {
      const target = e.target;
      const isTextZone = Boolean(
        target instanceof Element &&
          target.closest(
            'input:not([type="button"]):not([type="submit"]):not([type="checkbox"]):not([type="radio"]), textarea, select, [contenteditable="true"]'
          )
      );
      setIsTextCursorZone(isTextZone);
      if (isTextZone) {
        setIsVisible(false);
      }
    };

    if (supportsRaw) {
      window.addEventListener('pointerrawupdate', onPointerRawUpdate);
    }
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerdown', onPointerDown, { passive: true });
    window.addEventListener('pointerup', onPointerUp, { passive: true });
    window.addEventListener('pointercancel', onPointerCancel, { passive: true });
    window.addEventListener('pointerover', onPointerOver, { passive: true });
    window.addEventListener('blur', onWindowBlur);
    document.documentElement.addEventListener('mouseleave', onDocumentLeave);

    return () => {
      if (supportsRaw) {
        window.removeEventListener('pointerrawupdate', onPointerRawUpdate);
      }
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerCancel);
      window.removeEventListener('pointerover', onPointerOver);
      window.removeEventListener('blur', onWindowBlur);
      document.documentElement.removeEventListener('mouseleave', onDocumentLeave);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = 0;
      }
    };
  }, [isEnabled, isTextCursorZone]);

  if (!isEnabled) {
    return null;
  }

  return (
    <div
      ref={cursorRef}
      className={`smooth-cursor${isPressed ? ' smooth-cursor--pressed' : ''}${isVisible ? ' smooth-cursor--visible' : ''}${
        isTextCursorZone ? ' smooth-cursor--hidden' : ''
      }`}
      aria-hidden="true"
    >
      <span className="smooth-cursor__glow" />
      {cursor}
    </div>
  );
}
