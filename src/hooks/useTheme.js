import { useCallback, useState } from 'react';

export function readStoredTheme() {
  try {
    return localStorage.getItem('theme') === 'light' ? 'light' : 'dark';
  } catch {
    return 'dark';
  }
}

export function useTheme() {
  const [theme, setTheme] = useState(readStoredTheme);

  const onThemeChange = useCallback((nextTheme) => {
    setTheme(nextTheme);
    try {
      localStorage.setItem('theme', nextTheme);
    } catch {
      /* ignore quota errors */
    }
  }, []);

  return { theme, onThemeChange };
}
