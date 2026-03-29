import { useEffect, useRef, useState } from 'react';

function loadScriptOnce(src, key) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[data-legacy-key="${key}"]`);
    if (existing) {
      if (existing.dataset.loaded === 'true') return resolve();
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error(`Failed to load ${src}`)), { once: true });
      return;
    }

    const el = document.createElement('script');
    el.src = src;
    el.async = false;
    el.dataset.legacyKey = key;
    el.addEventListener('load', () => {
      el.dataset.loaded = 'true';
      resolve();
    }, { once: true });
    el.addEventListener('error', () => reject(new Error(`Failed to load ${src}`)), { once: true });
    document.body.appendChild(el);
  });
}

export default function App() {
  const hostRef = useRef(null);
  const [markup, setMarkup] = useState('');

  useEffect(() => {
    fetch('/legacy/markup.html')
      .then((r) => r.text())
      .then((html) => setMarkup(html))
      .catch(() => setMarkup('<div style="padding:1rem;color:#fff">Failed to load page markup.</div>'));
  }, []);

  useEffect(() => {
    if (!markup || !hostRef.current) return;
    hostRef.current.innerHTML = markup;

    (async () => {
      await loadScriptOnce('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js', 'gsap-core');
      await loadScriptOnce('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js', 'gsap-scrolltrigger');
      await loadScriptOnce('/legacy/script.js', 'legacy-main');
    })().catch(() => {
      // no-op: fallback is static markup
    });
  }, [markup]);

  return <div ref={hostRef} />;
}
