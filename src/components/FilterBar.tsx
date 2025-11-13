import React, { useContext } from 'react';
import { TTSContext } from '../contexts/TTSContext';

interface FilterBarProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

const filters = [
  { key: 'all', label: 'Todos', tooltip: 'Ver todos los clientes potenciales.' },
  { key: 'high', label: 'Potencial Alto (75+)', tooltip: 'Filtrar por clientes potenciales con un puntaje mayor a 75.' },
  { key: 'medium', label: 'Potencial Medio (40-74)', tooltip: 'Filtrar por clientes potenciales con un puntaje entre 40 y 74.' },
  { key: 'low', label: 'Potencial Bajo (<40)', tooltip: 'Filtrar por clientes potenciales con un puntaje menor a 40.' },
];

const FilterBar: React.FC<FilterBarProps> = ({ activeFilter, onFilterChange }) => {
  const { speak } = useContext(TTSContext);
  return (
    <div className="flex flex-wrap gap-2 bg-slate-100 dark:bg-gray-800/60 p-2 rounded-lg">
      {filters.map(filter => {
        const isActive = activeFilter === filter.key;
        return (
          <button
            key={filter.key}
            onClick={() => { onFilterChange(filter.key); speak(`Filtro cambiado a ${filter.label}.`); }}
            className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-all duration-200 transform active:scale-95 ${
              isActive
                ? 'bg-cyan-600 text-white shadow'
                : 'bg-white dark:bg-gray-700/50 text-slate-600 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-gray-700'
            }`}
          >
            {filter.label}
          </button>
        );
      })}
    </div>
  );
};

export default FilterBar;