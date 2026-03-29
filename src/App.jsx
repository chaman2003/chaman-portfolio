import { useEffect, useRef } from 'react';
import parse from 'html-react-parser';
import markup from './markup.html?raw';
import { initPortfolioEffects } from './effects/portfolioEffects';
import './styles/legacy.css';

export default function App() {
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    initPortfolioEffects();
  }, []);

  return <>{parse(markup)}</>;
}
