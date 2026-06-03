import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import parse from 'html-react-parser';
import markup from './markup.html?raw';
import { initPortfolioEffects } from './effects/portfolioEffects';
import { SmoothCursor } from './components/SmoothCursor/SmoothCursor';
import { AnimatedThemeToggler } from './components/AnimatedThemeToggler/AnimatedThemeToggler';
import './styles/legacy.css';

function readStoredTheme() {
  try {
    return localStorage.getItem('theme') === 'light' ? 'light' : 'dark';
  } catch {
    return 'dark';
  }
}

export default function App() {
  const initializedRef = useRef(false);
  const [theme, setTheme] = useState(readStoredTheme);
  const [headerMount, setHeaderMount] = useState(null);
  const [navMount, setNavMount] = useState(null);

  useLayoutEffect(() => {
    setHeaderMount(document.getElementById('themeToggleMount'));
    setNavMount(document.getElementById('navThemeToggleMount'));
  }, []);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    initPortfolioEffects();
  }, []);

  const handleThemeChange = (nextTheme) => {
    setTheme(nextTheme);
    try {
      localStorage.setItem('theme', nextTheme);
    } catch {
      /* ignore quota errors */
    }
  };

  const themeToggler = (
    <AnimatedThemeToggler theme={theme} onThemeChange={handleThemeChange} />
  );

  return (
    <>
      <SmoothCursor />
      {parse(markup)}
      {headerMount ? createPortal(themeToggler, headerMount) : null}
      {navMount
        ? createPortal(
            <AnimatedThemeToggler
              className="nav-theme-toggler"
              theme={theme}
              onThemeChange={handleThemeChange}
            />,
            navMount
          )
        : null}
    </>
  );
}
