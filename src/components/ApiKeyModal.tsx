import React, { useState } from 'react';
import { KeyIcon } from './icons/KeyIcon';
import { ArrowTopRightOnSquareIcon } from './icons/ArrowTopRightOnSquareIcon';

interface ApiKeyModalProps {
  onSave: (key: string) => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ onSave }) => {
  const [apiKey, setApiKey] = useState('');

  const handleSave = () => {
    if (apiKey.trim()) {
      onSave(apiKey.trim());
    }
  };

  return (
    <div className="p-6 space-y-4">
      <div className="text-center">
        <KeyIcon className="w-12 h-12 mx-auto text-yellow-500" />
        <h3 className="mt-4 text-xl font-bold text-gray-800 dark:text-white">Configura tu Clave de API de Google AI</h3>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          Para usar las funciones de IA, necesitas proporcionar tu propia clave de API de Google AI.
        </p>
      </div>
      
      <div>
        <label htmlFor="api-key-input" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
          Tu Clave de API
        </label>
        <div className="relative mt-1">
            <input
                type="password"
                id="api-key-input"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Ingresa tu clave aquí"
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
            />
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Tu clave se guarda de forma segura y solo se usa para las llamadas a la API de IA.
        </p>
      </div>

      <a
        href="https://aistudio.google.com/app/apikey"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center gap-2 w-full text-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-cyan-700 bg-cyan-100 hover:bg-cyan-200"
      >
        Obtener una Clave de API en Google AI Studio
        <ArrowTopRightOnSquareIcon className="w-4 h-4" />
      </a>

      <div className="pt-4 flex justify-end">
        <button
          onClick={handleSave}
          disabled={!apiKey.trim()}
          className="px-6 py-2 bg-cyan-600 text-white font-bold rounded-md hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Guardar Clave
        </button>
      </div>
    </div>
  );
};

export default ApiKeyModal;