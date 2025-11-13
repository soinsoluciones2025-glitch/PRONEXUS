import React from 'react';

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  ariaLabel?: string;
  // FIX: Added className prop to allow passing Tailwind CSS classes
  className?: string; 
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ checked, onChange, ariaLabel = 'Toggle', className }) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={() => onChange(!checked)}
      // FIX: Applied the className prop to the button element
      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 ${
        checked ? 'bg-cyan-600' : 'bg-gray-300 dark:bg-gray-600'
      } ${className || ''}`} 
    >
      <span
        aria-hidden="true"
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
};