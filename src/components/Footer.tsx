import React, { useState, useRef, useEffect } from 'react';
import type { AppConfig } from '../types';
import { PlusIcon } from './icons/PlusIcon';
import { LightBulbIcon } from './icons/LightBulbIcon';
import { TableCellsIcon } from './icons/TableCellsIcon';
import { StarIcon } from './icons/StarIcon';
import { QuestionMarkCircleIcon } from './icons/QuestionMarkCircleIcon';

interface FooterProps {
  userCredits: number;
  savedItemCount: number;
  onNewSearch: () => void;
  onShowPhilosophy: () => void;
  onShowReports: () => void;
  onGoPremium: () => void;
  isPremium: boolean;
  appConfig: AppConfig | null;
}

const formatCostKey = (key: string): string => {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase());
};

const Footer: React.FC<FooterProps> = ({
  userCredits,
  savedItemCount,
  onNewSearch,
  onShowPhilosophy,
  onShowReports,
  onGoPremium,
  isPremium,
  appConfig,
}) => {
  const [showCosts, setShowCosts] = useState(false);
  const costsPopupRef = useRef<HTMLDivElement>(null);
  
  const initialCredits = appConfig?.initialCredits || 0;
  const freeWorkspaceSlots = appConfig?.freeWorkspaceSlots || 0;

  const creditsPercentage = initialCredits > 0 ? (userCredits / initialCredits) * 100 : 0;
  const workspaceOccupiedPercentage = freeWorkspaceSlots > 0 ? (savedItemCount / freeWorkspaceSlots) * 100 : 0;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (costsPopupRef.current && !costsPopupRef.current.contains(event.target as Node)) {
        setShowCosts(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [costsPopupRef]);

  return (
    <footer className="relative bg-white dark:bg-gray-800 shadow-top p-4 flex flex-col sm:flex-row items-center justify-between gap-4 flex-shrink-0">
      
      {/* Pop-up de Costes de Créditos */}
      {showCosts && appConfig && (
        <div 
          ref={costsPopupRef}
          className="absolute bottom-full mb-2 left-4 sm:left-auto sm:right-auto bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-lg shadow-xl p-4 w-72 max-h-64 overflow-y-auto animate-fade-in-fast z-20"
        >
          <h4 className="font-bold text-sm text-slate-800 dark:text-white mb-2">Coste de Créditos por Acción</h4>
          <ul className="space-y-1 text-xs text-slate-600 dark:text-gray-300">
            {/* FIX: Cast `key` to the correct type to resolve TypeScript error */}
            {(Object.entries(appConfig.creditCosts) as [string, number][]).map(([key, value]) => (
              <li key={key} className="flex justify-between items-center">
                <span>{formatCostKey(key)}</span>
                <span className="font-bold text-cyan-600 dark:text-cyan-400">{value}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Left Side: Stats */}
      {!isPremium && (
        <div className="flex flex-col items-stretch sm:flex-row sm:items-center w-full sm:w-auto gap-4 text-sm text-slate-600 dark:text-gray-300">
          <div className="relative flex flex-col items-start w-full sm:w-[140px]">
            <div className="flex items-center gap-1">
              <p className="font-semibold whitespace-nowrap">Creditos: {userCredits} / {initialCredits}</p>
              <button onClick={() => setShowCosts(!showCosts)} title="Ver coste de créditos por acción">
                <QuestionMarkCircleIcon className="w-5 h-5 text-slate-400 hover:text-cyan-500 rounded-full animate-glow-pulse"/>
              </button>
            </div>
            <div className="w-full h-2 bg-slate-200 dark:bg-gray-700 rounded-full mt-1 overflow-hidden">
              <div className="h-full bg-cyan-500 rounded-full transition-all duration-300" style={{ width: `${creditsPercentage}%` }} />
            </div>
          </div>
          <div className="flex flex-col items-start w-full sm:w-[140px]">
            <p className="font-semibold whitespace-nowrap">Slots: {savedItemCount} / {freeWorkspaceSlots}</p>
            <div className="w-full h-2 bg-slate-200 dark:bg-gray-700 rounded-full mt-1 overflow-hidden">
              <div className="h-full bg-indigo-500 rounded-full transition-all duration-300" style={{ width: `${workspaceOccupiedPercentage}%` }} />
            </div>
          </div>
        </div>
      )}
      {isPremium && (
        <div className="flex items-center gap-2 text-yellow-500 font-bold text-sm">
          <StarIcon className="w-5 h-5"/>
          <span>CUENTA PREMIUM</span>
        </div>
      )}

      {/* Center: Actions */}
      {/* FIX: The file was truncated here, causing a parsing error. The rest of the component has been restored. */}
      <div className="flex items-center gap-2 flex-wrap justify-center">
        <button onClick={onNewSearch} className="flex items-center gap-2 px-3 py-2 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-gray-700 dark:text-gray-200 font-semibold rounded-md dark:hover:bg-gray-600 transition-colors">
          <PlusIcon className="w-4 h-4" />
          Nueva Búsqueda
        </button>
        <button onClick={onShowPhilosophy} className="flex items-center gap-2 px-3 py-2 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-gray-700 dark:text-gray-200 font-semibold rounded-md dark:hover:bg-gray-600 transition-colors">
          <LightBulbIcon className="w-4 h-4" />
          Nuestra Filosofía
        </button>
        <button onClick={onShowReports} className="flex items-center gap-2 px-3 py-2 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-gray-700 dark:text-gray-200 font-semibold rounded-md dark:hover:bg-gray-600 transition-colors">
          <TableCellsIcon className="w-4 h-4" />
          Ver Informes
        </button>
        {!isPremium && (
          <button onClick={onGoPremium} className="flex items-center gap-2 px-3 py-2 text-sm bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-bold rounded-md transition-colors animate-glow-pulse">
            <StarIcon className="w-4 h-4" />
            Adquirir Créditos
          </button>
        )}
      </div>
    </footer>
  );
};

export default Footer;
