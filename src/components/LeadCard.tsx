import React from 'react';
import type { Lead } from '../types';
import { StarIcon } from './icons/StarIcon';
import { MapPinIcon } from './icons/MapPinIcon';
import { GlobeIcon } from './icons/GlobeIcon';
import { PhoneIcon } from './icons/PhoneIcon';
import { ExclamationCircleIcon } from './icons/ExclamationCircleIcon'; // Import new icon

interface LeadCardProps {
  lead: Lead;
}

const LeadCard: React.FC<LeadCardProps> = ({ lead }) => {
  const scoreColor = lead.potentialScore > 75 ? 'text-green-500' : lead.potentialScore >= 40 ? 'text-yellow-500' : 'text-red-500';

  // If there's a detailError, we render a specific error card.
  if (lead.detailError) {
    return (
      <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded-lg border border-red-200 dark:border-red-700 shadow-sm flex items-start gap-4">
        <ExclamationCircleIcon className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
        <div>
          <h3 className="font-bold text-red-800 dark:text-red-200">{lead.name || 'Error'}</h3>
          <p className="text-sm text-red-700 dark:text-red-300 mt-1">{lead.detailError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800/50 p-4 rounded-lg border border-slate-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="font-bold text-slate-900 dark:text-white">{lead.name}</h3>
          {lead.businessType && <p className="text-xs font-semibold text-cyan-700 dark:text-cyan-400 bg-cyan-100 dark:bg-cyan-900/50 px-2 py-0.5 rounded-full inline-block mt-1">{lead.businessType}</p>}
          <p className="text-sm text-slate-600 dark:text-gray-400 mt-1">{lead.details}</p>
        </div>
        <div className={`flex items-center gap-1 font-bold text-lg ${scoreColor}`}>
          <StarIcon className="w-5 h-5" />
          <span>{lead.potentialScore}</span>
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-slate-200 dark:border-gray-700 flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-500 dark:text-gray-400">
        {lead.contactInfo?.phone && <div className="flex items-center gap-1"><PhoneIcon className="w-4 h-4" /> {lead.contactInfo.phone}</div>}
        {lead.mapUri && <div className="flex items-center gap-1"><MapPinIcon className="w-4 h-4" /> <a href={lead.mapUri} target="_blank" rel="noopener noreferrer" className="hover:text-cyan-500 hover:underline">Ver en Mapa</a></div>}
        {lead.contactInfo?.website && <div className="flex items-center gap-1"><GlobeIcon className="w-4 h-4" /> <a href={lead.contactInfo.website} target="_blank" rel="noopener noreferrer" className="hover:text-cyan-500 hover:underline">Sitio Web</a></div>}
      </div>
      {lead.opportunityAnalysis && (
        <div className="mt-3 p-2 bg-cyan-50 dark:bg-cyan-900/30 rounded-md">
            <p className="text-xs text-cyan-800 dark:text-cyan-200"><span className="font-bold">Oportunidad:</span> {lead.opportunityAnalysis}</p>
        </div>
      )}
    </div>
  );
};

export default LeadCard;