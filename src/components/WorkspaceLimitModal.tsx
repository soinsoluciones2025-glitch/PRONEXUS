import React from 'react';
import { LockOpenIcon } from './icons/LockOpenIcon';
// FIX: Added import for AppConfig
import type { AppConfig } from '../types.ts';

interface WorkspaceLimitModalProps {
  onUpgrade: () => void;
  onClose: () => void;
  // FIX: Added appConfig to props
  appConfig: AppConfig | null;
}

const WorkspaceLimitModal: React.FC<WorkspaceLimitModalProps> = ({ onUpgrade, onClose, appConfig }) => {
  return (
    <div className="p-6 text-center">
      <LockOpenIcon className="w-12 h-12 mx-auto text-yellow-500" />
      <h3 className="mt-4 text-xl font-bold text-gray-800 dark:text-white">Límite del Espacio de Trabajo Alcanzado</h3>
      <p className="mt-2 text-gray-600 dark:text-gray-300">
        Has alcanzado el límite de {appConfig?.freeWorkspaceSlots || 10} elementos en tu espacio de trabajo para la versión gratuita.
      </p>
      <p className="mt-1 text-gray-600 dark:text-gray-300">
        Actualiza a Premium para guardar clientes y empleos ilimitados.
      </p>
      <div className="mt-6 flex justify-center gap-3">
        <button onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-md text-gray-800 dark:text-white">
            Más Tarde
        </button>
        <button onClick={onUpgrade} className="px-4 py-2 bg-yellow-500 text-gray-900 font-bold rounded-md hover:opacity-90">
            Actualizar a Premium
        </button>
      </div>
    </div>
  );
};

export default WorkspaceLimitModal;