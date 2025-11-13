import React, { useState, useEffect, useContext } from 'react';
import type { DynamicFilter, AppConfig } from '../types.ts';
import { AdjustmentsHorizontalIcon } from './icons/AdjustmentsHorizontalIcon';
import { ToggleSwitch } from './ToggleSwitch.tsx';
import { TTSContext } from '../contexts/TTSContext.tsx';

interface DynamicFiltersModalProps {
  filters: DynamicFilter[];
  onApplyFilters: (appliedFilters: DynamicFilter[]) => void;
  isLoading: boolean;
  appConfig: AppConfig;
}

const LoadingState: React.FC = () => (
  <div className="p-8 text-center animate-pulse">
    <AdjustmentsHorizontalIcon className="w-16 h-16 mx-auto text-indigo-600 dark:text-yellow-500" />
    <h3 className="mt-4 text-xl font-bold text-gray-800 dark:text-white">Generando Filtros Inteligentes...</h3>
    <p className="mt-2 text-gray-600 dark:text-gray-400">
        La IA está analizando las categorías para sugerir filtros inteligentes.
    </p>
  </div>
);

export const DynamicFiltersModal: React.FC<DynamicFiltersModalProps> = ({ filters, onApplyFilters, isLoading, appConfig }) => {
  const [localFilters, setLocalFilters] = useState<DynamicFilter[]>([]);
  const { speak } = useContext(TTSContext);

  useEffect(() => {
    // Initialize local state from props, which now include the `isActive` state
    setLocalFilters(filters);
  }, [filters]);

  const handleFilterToggle = (index: number, checked: boolean) => {
    const updatedFilters = [...localFilters];
    updatedFilters[index].isActive = checked;
    // For boolean filters, the value should reflect the active state
    if (updatedFilters[index].type === 'boolean') {
        updatedFilters[index].value = checked;
    }
    setLocalFilters(updatedFilters);
    speak(checked ? `Filtro ${updatedFilters[index].label} activado.` : `Filtro ${updatedFilters[index].label} desactivado.`);
  };

  const cost = appConfig.creditCosts.generateDynamicFilters;
  const hasActiveFilters = localFilters.some(f => f.isActive);
  
  if (isLoading) return <LoadingState />;

  return (
    <div className="p-6 space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-800 dark:text-white">Filtros Inteligentes (IA)</h3>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          La IA ha sugerido estos filtros. Activa los que desees aplicar.
        </p>
      </div>

      <div className="space-y-4">
        {localFilters.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No se generaron filtros dinámicos para esta selección.
          </div>
        ) : (
          localFilters.map((filter, index) => (
            <div key={filter.key} className="grid grid-cols-3 items-center bg-gray-100 dark:bg-gray-700/50 p-3 rounded-lg border border-transparent has-[.toggle-on]:border-cyan-500 transition-all duration-200">
              <label htmlFor={`filter-${filter.key}`} className="col-span-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
                {filter.label}
              </label>
              
              <div className="col-span-1 flex justify-end">
                <ToggleSwitch
                  checked={filter.isActive || false}
                  onChange={(checked) => handleFilterToggle(index, checked)}
                  ariaLabel={`Activar filtro ${filter.label}`}
                  className={`${filter.isActive ? 'toggle-on' : ''}`}
                />
              </div>
            </div>
          ))
        )}
      </div>

      <div className="pt-4 flex justify-end">
        <button
          onClick={() => onApplyFilters(localFilters)}
          className="px-6 py-2 bg-cyan-600 text-white font-bold rounded-md hover:bg-cyan-700 disabled:opacity-50"
          disabled={isLoading}
        >
          {isLoading ? 'Aplicando...' : `Aplicar Filtros ${hasActiveFilters ? `(${cost} Crédito${cost !== 1 ? 's' : ''})` : '(0 Créditos)'}`}
        </button>
      </div>
    </div>
  );
};