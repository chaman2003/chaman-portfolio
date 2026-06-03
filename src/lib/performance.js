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

export function shouldEnableSmoothCursor() {
  if (typeof window === 'undefined') return false;
  if (isPerfLite()) return false;

  return window.matchMedia('(any-hover: hover) and (any-pointer: fine) and (min-width: 1024px)')
    .matches;
}

export function shouldRunStarfieldAnimation(isMotionEnabled) {
  if (!isMotionEnabled) return false;
  if (document.hidden) return false;
  return !isPerfLite();
}

/** Butter-smooth Lenis scroll (persists regardless of motion toggle). */
export function shouldEnableLenisScroll() {
  if (typeof window === 'undefined') return false;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  if (isPerfLite()) return false;
  return true;
}
