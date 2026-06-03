/** Heuristics for trimming heavy visual effects on weaker devices. */
export function isPerfLite() {
  if (typeof window === 'undefined') return false;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const saveData = navigator.connection?.saveData === true;
  const lowCores =
    typeof navigator.hardwareConcurrency === 'number' && navigator.hardwareConcurrency <= 4;
  const lowMemory = typeof navigator.deviceMemory === 'number' && navigator.deviceMemory <= 4;

  return reducedMotion || saveData || lowCores || lowMemory;
}

/** Touch-first phones/tablets — skip GPU-heavy effects that cause scroll jank. */
export function isCoarsePointer() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(pointer: coarse)').matches;
}

export function isMobilePerfMode() {
  return isPerfLite() || isCoarsePointer();
}

export function applyMobilePerfDocumentFlags() {
  if (typeof document === 'undefined') return;
  if (isMobilePerfMode()) {
    document.documentElement.classList.add('mobile-perf');
    document.body.setAttribute('data-perf-lite', 'true');
  }
}

export function shouldEnableSmoothCursor() {
  if (typeof window === 'undefined') return false;
  if (isMobilePerfMode()) return false;

  return window.matchMedia('(any-hover: hover) and (any-pointer: fine) and (min-width: 1024px)')
    .matches;
}

export function shouldRunStarfieldAnimation(isMotionEnabled) {
  if (!isMotionEnabled) return false;
  if (document.hidden) return false;
  if (isMobilePerfMode()) return false;
  return true;
}

/** Motion spring scroll for anchors only — not on touch devices. */
export function shouldEnableMotionSmoothScroll() {
  if (typeof window === 'undefined') return false;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  if (isMobilePerfMode()) return false;
  return true;
}

/** @deprecated Use shouldEnableMotionSmoothScroll */
export function shouldEnableLenisScroll() {
  return shouldEnableMotionSmoothScroll();
}

export function shouldUseSpringScrollProgress() {
  if (typeof window === 'undefined') return false;
  if (isMobilePerfMode()) return false;
  return true;
}
