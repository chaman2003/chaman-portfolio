import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import parse from 'html-react-parser';
import portfolioHtml from '../content/portfolio.html?raw';
import { initPortfolioEffects } from '../features/portfolio/index.js';
import { SmoothCursor } from '../components/SmoothCursor/SmoothCursor';
import { AnimatedThemeToggler } from '../components/AnimatedThemeToggler/AnimatedThemeToggler';
import { useTheme } from '../hooks/useTheme.js';
import { usePortalTargets } from '../hooks/usePortalTargets.js';
import '../styles/index.css';

export default function App() {
  const initializedRef = useRef(false);
  const { theme, onThemeChange } = useTheme();
  const targets = usePortalTargets(['themeToggleMount', 'navThemeToggleMount']);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    initPortfolioEffects();
  }, []);

  const themeToggler = <AnimatedThemeToggler theme={theme} onThemeChange={onThemeChange} />;

  return (
    <>
      <SmoothCursor />
      {parse(portfolioHtml)}
      {targets.themeToggleMount ? createPortal(themeToggler, targets.themeToggleMount) : null}
      {targets.navThemeToggleMount
        ? createPortal(
            <AnimatedThemeToggler
              className="nav-theme-toggler"
              theme={theme}
              onThemeChange={onThemeChange}
            />,
            targets.navThemeToggleMount
          )
        : null}
    </>
  );
}
