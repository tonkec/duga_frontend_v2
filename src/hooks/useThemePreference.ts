import { useEffect, useState } from 'react';

export type ThemePreference = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'duga:theme-preference';

const isThemePreference = (value: string | null): value is ThemePreference =>
  value === 'light' || value === 'dark';

export const getStoredThemePreference = (): ThemePreference => {
  if (typeof window === 'undefined') return 'light';

  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
  return isThemePreference(storedTheme) ? storedTheme : 'light';
};

export const applyThemePreference = (theme: ThemePreference) => {
  if (typeof document === 'undefined') return;

  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
};

export const useThemePreference = () => {
  const [theme, setTheme] = useState<ThemePreference>(() => getStoredThemePreference());

  useEffect(() => {
    applyThemePreference(theme);
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  return {
    theme,
    isDarkMode: theme === 'dark',
    setTheme,
    toggleTheme: () => setTheme((currentTheme) => (currentTheme === 'dark' ? 'light' : 'dark')),
  };
};
