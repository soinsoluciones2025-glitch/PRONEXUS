import { useState, useEffect, useCallback } from 'react';

const THEME_KEY = 'prospectNexusTheme';

export const useTheme = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    // Intentar leer el tema del localStorage
    const savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme === 'light' || savedTheme === 'dark') {
      return savedTheme;
    }
    // Si no hay tema guardado, usar la preferencia del sistema
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    // Aplicar la clase al body para Tailwind CSS
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    // Guardar la preferencia en localStorage
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  }, []);

  return { theme, toggleTheme };
};