import React, { useContext } from 'react';
import type { AnalyticsData, LeadStatus, JobStatus } from '../types';
import { PresentationChartLineIcon } from './icons/PresentationChartLineIcon';
import { TTSContext } from '../contexts/TTSContext';
import type { TTSContextType } from '../contexts/TTSContext';


// Define FunnelBarProps interface for the FunnelBar component
interface FunnelBarProps {
  label: string;
  count: number;
  total: number;
}

// Define the FunnelBar component (not exported, as it's a sub-component of AnalyticsDashboardModal)
const FunnelBar: React.FC<FunnelBarProps> = ({ label, count, total }) => {
  const percentage = total > 0 ? (count / total) * 100 : 0;
  const { speak } = useContext(TTSContext) as TTSContextType;

  const statusColors: Record<LeadStatus | JobStatus, string> = {
    pending: 'bg-gray-400',
    contacted: 'bg-blue-400',
    interested: 'bg-yellow-400',
    proposal: 'bg-indigo-400',
    won: 'bg-green-500',
    lost: 'bg-red-500',
    discarded: 'bg-pink-400',
    saved: 'bg-gray-400',
    applied: 'bg-blue-400',
    interviewing: 'bg-yellow-400',
    offer: 'bg-purple-400',
    rejected: 'bg-red-500',
    accepted: 'bg-green-500',
  };

  const barColor = statusColors[label.toLowerCase() as LeadStatus | JobStatus] || 'bg-gray-400';

  return (
    <div className="flex items-center gap-3" 
        onMouseEnter={() => speak(`${label}: ${count} elementos. ${percentage.toFixed(1)} por ciento.`)}>
      <span className="text-sm w-24 text-gray-700 dark:text-gray-300">{label}</span>
      <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-4 relative">
        <div
          className={`h-full rounded-full ${barColor}`}
          style={{ width: `${percentage}%` }}
        ></div>
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-white drop-shadow-sm">
          {count} ({percentage.toFixed(1)}%)
        </span>
      </div>
    </div>
  );
};

interface AnalyticsDashboardModalProps {
  data: AnalyticsData | null;
}

// Exported as a named component
export const AnalyticsDashboardModal: React.FC<AnalyticsDashboardModalProps> = ({ data }) => {
    const { speak } = useContext(TTSContext) as TTSContextType;

  if (!data) {
    return (
      <div className="p-6 text-center text-gray-600 dark:text-gray-300">
        No hay datos de analíticas disponibles. Guarda algunos clientes o empleos para verlos aquí.
      </div>
    );
  }

  const renderFunnelSection = (title: string, funnelData: { [key: string]: number | undefined }) => {
    // FIX: Be explicit with the type of the accumulator and the handling of undefined values to satisfy TypeScript's strict checks.
    const total = Object.values(funnelData).reduce((accumulator: number, currentValue: number | undefined) => {
      const currentCount = currentValue ?? 0;
      return accumulator + currentCount;
    }, 0);

    if (total === 0) {
      return (
        <div className="text-center py-4 text-gray-500 dark:text-gray-400">
          No hay datos para {title}.
        </div>
      );
    }
    return (
      <div className="space-y-2">
        {Object.entries(funnelData).map(([status, count]: [string, number | undefined]) => {
            // FIX: Ensure count is a number before passing to the component.
            const safeCount = count ?? 0;
            return <FunnelBar key={status} label={status} count={safeCount} total={total} />;
        })}
      </div>
    );
  };

  return (
    <div className="p-6 space-y-8">
      <div className="text-center">
        <PresentationChartLineIcon className="w-12 h-12 mx-auto text-cyan-600 dark:text-cyan-400 mb-2" />
        <h3 className="text-2xl font-bold text-gray-800 dark:text-white" 
            onMouseEnter={() => speak("Dashboard de Analíticas.")}>Dashboard de Analíticas</h3>
        <p className="mt-1 text-gray-600 dark:text-gray-300" 
            onMouseEnter={() => speak("Visión general de tu progreso en Prospect Nexus AI.")}>Visión general de tu progreso en Prospect Nexus AI.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h4 className="text-lg font-bold text-gray-800 dark:text-white mb-3" 
            onMouseEnter={() => speak("Embudo de Ventas. Clientes Potenciales.")}>Embudo de Ventas (Clientes Potenciales)</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4" 
            onMouseEnter={() => speak(`Total de clientes potenciales guardados: ${data.totalLeads}`)}>Total de clientes potenciales guardados: <span className="font-semibold">{data.totalLeads}</span></p>
          {renderFunnelSection('Clientes Potenciales', data.salesFunnel)}
        </div>

        <div>
          <h4 className="text-lg font-bold text-gray-800 dark:text-white mb-3" 
            onMouseEnter={() => speak("Embudo de Empleo. Ofertas Guardadas.")}>Embudo de Empleo (Ofertas Guardadas)</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4" 
            onMouseEnter={() => speak(`Total de ofertas de empleo guardadas: ${data.totalJobs}`)}>Total de ofertas de empleo guardadas: <span className="font-semibold">{data.totalJobs}</span></p>
          {renderFunnelSection('Ofertas de Empleo', data.jobFunnel)}
        </div>
      </div>
    </div>
  );
};