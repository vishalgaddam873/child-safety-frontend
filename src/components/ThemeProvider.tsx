'use client';

import React, { useEffect, useState } from 'react';
import clsx from 'clsx';

const THEME_KEY = 'child_safety_theme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [resolved, setResolved] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const stored = (localStorage.getItem(THEME_KEY) as 'light' | 'dark' | 'system') || 'system';
    setTheme(stored);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const isDark =
      theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    setResolved(isDark ? 'dark' : 'light');
    root.classList.toggle('dark', isDark);
  }, [theme]);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const fn = () => {
      if (theme === 'system') setResolved(mq.matches ? 'dark' : 'light');
    };
    mq.addEventListener('change', fn);
    return () => mq.removeEventListener('change', fn);
  }, [theme]);

  return <>{children}</>;
}

export function useTheme() {
  const [theme, setThemeState] = useState<'light' | 'dark' | 'system'>('system');
  useEffect(() => {
    setThemeState((localStorage.getItem(THEME_KEY) as 'light' | 'dark' | 'system') || 'system');
  }, []);
  const setTheme = (t: 'light' | 'dark' | 'system') => {
    localStorage.setItem(THEME_KEY, t);
    setThemeState(t);
  };
  return { theme, setTheme };
}
