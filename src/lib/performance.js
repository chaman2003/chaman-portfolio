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

/** Touch-first phones/tablets. */
export function isCoarsePointer() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(pointer: coarse)').matches;
}

export function isTouchViewport() {
  if (typeof window === 'undefined') return false;
  return isCoarsePointer() || window.matchMedia('(max-width: 1023px)').matches;
}

/** GPU-heavy effects only — motion toggle can still run lightweight CSS animations. */
export function isGpuPerfLite() {
  return isPerfLite() || isCoarsePointer();
}

/** @deprecated Use isGpuPerfLite for scroll/spring or isPerfLite for animations */
export function isMobilePerfMode() {
  return isGpuPerfLite();
}

export function applyMobilePerfDocumentFlags() {
  if (typeof document === 'undefined') return;
  if (isTouchViewport()) {
    document.documentElement.classList.add('mobile-touch');
  }
  if (isPerfLite()) {
    document.body.setAttribute('data-perf-lite', 'true');
  }
}

export function shouldEnableSmoothCursor() {
  if (typeof window === 'undefined') return false;
  if (isGpuPerfLite()) return false;

  return window.matchMedia('(any-hover: hover) and (any-pointer: fine) and (min-width: 1024px)')
    .matches;
}

export function shouldRunStarfieldAnimation(isMotionEnabled) {
  if (!isMotionEnabled) return false;
  if (document.hidden) return false;
  if (isGpuPerfLite()) return false;
  return true;
}

/** Motion spring scroll for anchors only — not on touch devices. */
export function shouldEnableMotionSmoothScroll() {
  if (typeof window === 'undefined') return false;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  if (isGpuPerfLite()) return false;
  return true;
}

/** @deprecated Use shouldEnableMotionSmoothScroll */
export function shouldEnableLenisScroll() {
  return shouldEnableMotionSmoothScroll();
}

export function shouldUseSpringScrollProgress() {
  if (typeof window === 'undefined') return false;
  if (isGpuPerfLite()) return false;
  return true;
}
