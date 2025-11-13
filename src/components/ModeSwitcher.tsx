import React, { useContext } from 'react';
import type { SearchMode } from '../types';
import { BriefcaseIcon } from './icons/BriefcaseIcon'; 
import { UsersIcon } from './icons/UsersIcon'; 
import { TTSContext } from '../contexts/TTSContext';

interface ModeSwitcherProps {
  currentMode: SearchMode;
  onModeChange: (mode: SearchMode) => void;
}

const ModeSwitcher: React.FC<ModeSwitcherProps> = ({ currentMode, onModeChange }) => {
  const isSales = currentMode === 'sales';
  const { speak } = useContext(TTSContext);

  const handleModeChange = (newMode: SearchMode) => {
    if (newMode !== currentMode) {
      onModeChange(newMode);
      speak(`Modo ${newMode === 'sales' ? 'Clientes' : 'Empleo'} activado.`);
    }
  };

  return (
    <div className="relative bg-gray-200 dark:bg-gray-700 rounded-full p-1 flex items-center transition-colors duration-300">
      <div
        className={`absolute top-1 left-1 h-8 w-1/2 bg-white dark:bg-gray-800 rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${
          isSales ? 'translate-x-0' : 'translate-x-full'
        }`}
      />
      <button
        onClick={() => handleModeChange('sales')}
        className={`relative z-10 w-1/2 flex items-center justify-center gap-2 px-3 py-1 rounded-full text-sm font-semibold transition-colors duration-300 ${
          isSales ? 'text-cyan-600 dark:text-cyan-400' : 'text-gray-600 dark:text-gray-300'
        }`}
        aria-pressed={isSales}
      >
        <UsersIcon className="w-5 h-5" strokeWidth={2} />
        CLIENTES
      </button>
      <button
        onClick={() => handleModeChange('job')}
        className={`relative z-10 w-1/2 flex items-center justify-center gap-2 px-3 py-1 rounded-full text-sm font-semibold transition-colors duration-300 ${
          !isSales ? 'text-cyan-600 dark:text-cyan-400' : 'text-gray-600 dark:text-gray-300'
        }`}
        aria-pressed={!isSales}
      >
        <BriefcaseIcon className="w-5 h-5" strokeWidth={2} />
        EMPLEOS
      </button>
    </div>
  );
};

export default ModeSwitcher;