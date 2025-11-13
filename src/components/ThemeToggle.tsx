import React, { useContext } from 'react';
import { MoonIcon } from './icons/MoonIcon'; 
import { SunIcon } from './icons/SunIcon'; 
import { TTSContext } from '../contexts/TTSContext';


interface ThemeToggleProps {
  theme: string;
  toggleTheme: () => void;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ theme, toggleTheme }) => {
  const isDark = theme === 'dark';
  const { speak } = useContext(TTSContext);

  const handleClick = () => {
    const nextTheme = isDark ? 'claro' : 'oscuro';
    speak(`Cambiando a modo ${nextTheme}.`);
    toggleTheme();
  };

  return (
    <button
      onClick={handleClick}
      className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
    >
      {isDark ? (
        <SunIcon className="w-6 h-6 text-yellow-400" strokeWidth={2} />
      ) : (
        <MoonIcon className="w-6 h-6 text-gray-700" strokeWidth={2} />
      )}
    </button>
  );
};

export default ThemeToggle;