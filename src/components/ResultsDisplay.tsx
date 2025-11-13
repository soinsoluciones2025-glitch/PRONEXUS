import React, { useState } from 'react';
import type { Lead, Job, SearchMode, DraggableItem, DynamicFilter } from '../types';
import LeadCard from './LeadCard';
import JobCard from './JobCard';
import FilterBar from './FilterBar';
import DraggableLeadItem from './DraggableLeadItem';
import DraggableJobItem from './DraggableJobItem';
import AnimatedLogo from './AnimatedLogo';
import { XCircleIcon } from './icons/XCircleIcon';

interface ResultsDisplayProps {
  mode: SearchMode;
  results: (Lead | Job)[];
  isLoading: boolean;
  error: string | null;
  progressMessage: string | null;
  onDragStart: (item: DraggableItem) => (e: React.DragEvent<HTMLElement>) => void;
  onDragEnd: () => void;
  activeDynamicFilters: DynamicFilter[];
  onClearDynamicFilters: () => void;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({
  mode,
  results,
  isLoading,
  error,
  progressMessage,
  onDragStart,
  onDragEnd,
  activeDynamicFilters,
  onClearDynamicFilters,
}) => {
  const [activeFilter, setActiveFilter] = useState('all');

  const filterLeads = (leads: Lead[], filter: string): Lead[] => {
    if (filter === 'high') return leads.filter((l) => l.potentialScore > 75);
    if (filter === 'medium') return leads.filter((l) => l.potentialScore >= 40 && l.potentialScore <= 75);
    if (filter === 'low') return leads.filter((l) => l.potentialScore < 40);
    return leads;
  };

  const filteredLeads = mode === 'sales' ? filterLeads(results as Lead[], activeFilter) : [];
  const filteredJobs = mode === 'job' ? (results as Job[]) : [];

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center text-center p-8">
          <AnimatedLogo className="w-24 h-24" />
          <p className="mt-4 text-cyan-600 dark:text-cyan-400 font-semibold animate-pulse">
            {progressMessage || 'Buscando oportunidades...'}
          </p>
        </div>
      );
    }

    if (results.length === 0 && !error) {
      return <p className="text-slate-500 dark:text-gray-400 text-center p-4">No se encontraron resultados para tu búsqueda.</p>;
    }

    return (
      <div className="grid grid-cols-1 gap-4">
        {mode === 'sales'
          ? filteredLeads.map((lead) => (
              <DraggableLeadItem 
                key={lead.id} 
                lead={lead} 
                onDragStart={onDragStart}
                onDragEnd={onDragEnd} 
              >
                <LeadCard lead={lead} />
              </DraggableLeadItem>
            ))
          : filteredJobs.map((job) => (
              <DraggableJobItem 
                key={job.id} 
                job={job} 
                onDragStart={onDragStart}
                onDragEnd={onDragEnd} 
              >
                <JobCard job={job} />
              </DraggableJobItem>
            ))}
      </div>
    );
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 w-full max-w-2xl mx-auto lg:max-w-none animate-fade-in">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          {mode === 'sales' ? 'Clientes Potenciales Encontrados' : 'Ofertas de Empleo Encontradas'}
        </h2>
        {mode === 'sales' && <FilterBar activeFilter={activeFilter} onFilterChange={setActiveFilter} />}
      </div>
      
      {activeDynamicFilters.length > 0 && (
        <div className="mb-4 p-3 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg flex justify-between items-center gap-4 text-sm">
          <div className="flex flex-wrap gap-2">
            <span className="font-semibold text-indigo-800 dark:text-indigo-200">Filtros IA aplicados:</span>
            {activeDynamicFilters.map(filter => (
              <span key={filter.key} className="px-2 py-1 bg-indigo-200 dark:bg-indigo-800 text-indigo-900 dark:text-indigo-100 rounded-full text-xs">
                {filter.label}
              </span>
            ))}
          </div>
          <button onClick={onClearDynamicFilters} className="flex-shrink-0 flex items-center gap-1 text-indigo-600 dark:text-indigo-300 hover:underline font-semibold">
            <XCircleIcon className="w-4 h-4" />
            Limpiar
          </button>
        </div>
      )}

      {renderContent()}
    </div>
  );
};

export default ResultsDisplay;