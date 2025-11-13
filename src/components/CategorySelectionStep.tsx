
import React, { useState, useContext } from 'react';
import type { InitialQuery, SearchArea, DynamicFilter } from '../types';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import { MagnifyingGlassIcon } from './icons/MagnifyingGlassIcon';
import { AdjustmentsHorizontalIcon } from './icons/AdjustmentsHorizontalIcon';
import { TTSContext } from '../contexts/TTSContext';

interface CategorySelectionStepProps {
  categories: string[];
  isLoading: boolean;
  onBack: () => void;
  onSelectCategories: (categories: string[], appliedFilters?: DynamicFilter[]) => void; // appliedFilters is optional
  onGenerateDynamicFilters: (categories: string[]) => void;
  query: InitialQuery;
  area: SearchArea;
}

const CategorySelectionStep: React.FC<CategorySelectionStepProps> = ({
  categories,
  isLoading,
  onBack,
  onSelectCategories,
  onGenerateDynamicFilters,
  query,
  area,
}) => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const { speak } = useContext(TTSContext);

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const handleSelectAll = () => {
    if (selectedCategories.length === categories.length) {
      setSelectedCategories([]);
      speak("Se deseleccionaron todas las categorías.");
    } else {
      setSelectedCategories(categories);
      speak("Se seleccionaron todas las categorías.");
    }
  };

  const canProceed = selectedCategories.length > 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 w-full max-w-2xl mx-auto lg:max-w-none animate-fade-in">
      <div className="flex items-center gap-4 mb-4">
        <button onClick={onBack} className="p-2 hover:bg-slate-100 dark:hover:bg-gray-700 rounded-full">
            <ArrowLeftIcon className="w-6 h-6" />
        </button>
        <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Paso 2: Afina tu Búsqueda</h2>
            <p className="text-sm text-slate-600 dark:text-gray-400">
                La IA sugiere estos nichos para "{query.userOfferingOrProfession}" en {area.location}. Elige los más relevantes.
            </p>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center p-8">
          <p className="animate-pulse">Cargando...</p>
        </div>
      ) : (
        <div className="space-y-4">
            <div className="flex justify-end">
                <button
                    onClick={handleSelectAll}
                    className="text-sm font-semibold text-cyan-600 dark:text-cyan-400 hover:underline"
                >
                    {selectedCategories.length === categories.length ? 'Deseleccionar Todo' : 'Seleccionar Todo'}
                </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {categories.map((category) => {
                    const isSelected = selectedCategories.includes(category);
                    return (
                        <button
                            key={category}
                            onClick={() => handleCategoryToggle(category)}
                            className={`p-3 text-sm font-medium rounded-lg text-left transition-all duration-200 transform active:scale-95 border ${
                                isSelected
                                ? 'bg-cyan-600 text-white border-cyan-700 shadow-md'
                                : 'bg-slate-100 dark:bg-gray-700/60 text-slate-800 dark:text-gray-200 border-slate-200 dark:border-gray-600 hover:bg-slate-200 dark:hover:bg-gray-700'
                            }`}
                        >
                            {category}
                        </button>
                    );
                })}
            </div>
        </div>
      )}

      <div className="mt-6 border-t border-slate-200 dark:border-gray-700 pt-4 flex flex-col sm:flex-row justify-end items-center gap-3">
        <button
          onClick={() => onGenerateDynamicFilters(selectedCategories)}
          disabled={!canProceed || isLoading}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 text-base font-bold rounded-lg transition-colors duration-200 transform active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg"
        >
          <AdjustmentsHorizontalIcon className="w-5 h-5" />
          Usar Filtros Inteligentes (IA)
        </button>
        <button
          onClick={() => onSelectCategories(selectedCategories)}
          disabled={!canProceed || isLoading}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 text-base font-bold rounded-lg transition-colors duration-200 transform active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed bg-cyan-600 text-white hover:bg-cyan-700 shadow-lg"
        >
          <MagnifyingGlassIcon className="w-5 h-5" />
          {`Buscar en ${selectedCategories.length} categorÃ­a${selectedCategories.length === 1 ? '' : 's'}`}
        </button>
      </div>
    </div>
  );
};

export default CategorySelectionStep;
