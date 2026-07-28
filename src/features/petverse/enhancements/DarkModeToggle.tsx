import React, { useState, useEffect, useCallback } from 'react';
import styles from './DarkModeToggle.module.css';

type Theme = 'light' | 'dark';

const STORAGE_KEY = 'pv-theme-preference';

const getSystemPreference = (): Theme => {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const getStoredPreference = (): Theme | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {
    // localStorage unavailable
  }
  return null;
};

const DarkModeToggle: React.FC = () => {
  const [theme, setTheme] = useState<Theme>(() => {
    return getStoredPreference() || getSystemPreference();
  });

  const applyTheme = useCallback((t: Theme) => {
    document.documentElement.setAttribute('data-theme', t);
  }, []);

  useEffect(() => {
    applyTheme(theme);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // localStorage unavailable
    }
  }, [theme, applyTheme]);

  useEffect(() => {
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      if (!getStoredPreference()) {
        const next: Theme = e.matches ? 'dark' : 'light';
        setTheme(next);
        applyTheme(next);
      }
    };
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [applyTheme]);

  const toggle = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <button
      className={styles.toggle}
      onClick={toggle}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      <span className={styles.track} data-active={theme === 'dark'}>
        <span className={styles.thumb}>
          {theme === 'dark' ? '🌙' : '☀️'}
        </span>
      </span>
      <span className={styles.label}>
        {theme === 'dark' ? 'Dark' : 'Light'}
      </span>
    </button>
  );
};

export default DarkModeToggle;
