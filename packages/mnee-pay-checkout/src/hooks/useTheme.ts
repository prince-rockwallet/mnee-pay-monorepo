import { useEffect, useState } from 'react';
import { Theme } from '../types';

export function useTheme(initialTheme: Theme = 'light') {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (initialTheme === 'auto') {
      if (typeof window === 'undefined') {
        return initialTheme as any;
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return initialTheme;
  });

  useEffect(() => {
    if (initialTheme !== 'auto') {
      setTheme(initialTheme);
      return;
    }

    if (typeof window === 'undefined') {
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      setTheme(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [initialTheme]);

  return theme;
}
