import React from 'react';

interface UpgradePromptProps {
  onUpgrade: () => void;
  message: string;
}

const UpgradePrompt: React.FC<UpgradePromptProps> = ({ onUpgrade, message }) => {
  return (
    <div className="p-4 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 rounded-md text-center flex flex-col items-center justify-center gap-2">
      <p className="font-semibold">{message}</p>
      <button 
        onClick={onUpgrade} 
        className="px-4 py-2 bg-yellow-500 text-yellow-900 font-bold rounded-md hover:bg-yellow-600 transition-colors"
      >
        Adquirir Créditos
      </button>
    </div>
  );
};

export default UpgradePrompt;