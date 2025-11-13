import React from 'react';
import type { Job } from '../types';
import { BriefcaseIcon } from './icons/BriefcaseIcon';
import { MapPinIcon } from './icons/MapPinIcon';
import { ShieldCheckIcon } from './icons/ShieldCheckIcon';
import { CurrencyDollarIcon } from './icons/CurrencyDollarIcon';
import { ExclamationCircleIcon } from './icons/ExclamationCircleIcon'; // Import new icon

interface JobCardProps {
  job: Job;
}

const JobCard: React.FC<JobCardProps> = ({ job }) => {
  // If there's a detailError, we render a specific error card.
  if (job.detailError) {
    return (
      <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded-lg border border-red-200 dark:border-red-700 shadow-sm flex items-start gap-4">
        <ExclamationCircleIcon className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
        <div>
          <h3 className="font-bold text-red-800 dark:text-red-200">{job.jobTitle || 'Error'}</h3>
          <p className="text-sm text-red-700 dark:text-red-300 mt-1">{job.detailError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800/50 p-4 rounded-lg border border-slate-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div>
        <div className="flex justify-between items-start">
            <h3 className="font-bold text-slate-900 dark:text-white">{job.jobTitle}</h3>
            {job.profileFitScore !== undefined && job.profileFitScore !== null && (
                <div className="flex items-center gap-1 font-bold text-lg text-green-500" title={`Afinidad con tu perfil: ${job.profileFitScore}%`}>
                    <ShieldCheckIcon className="w-5 h-5" />
                    <span>{job.profileFitScore}</span>
                </div>
            )}
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-600 dark:text-gray-400 mt-1">
          <div className="flex items-center gap-1.5"><BriefcaseIcon className="w-4 h-4" /> {job.companyName}</div>
          <div className="flex items-center gap-1.5"><MapPinIcon className="w-4 h-4" /> {job.location}</div>
          {job.salaryRange && <div className="flex items-center gap-1.5"><CurrencyDollarIcon className="w-4 h-4" /> {job.salaryRange}</div>}
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-slate-200 dark:border-gray-700">
        <p className="text-sm text-slate-700 dark:text-gray-300 line-clamp-3">{job.description}</p>
      </div>
      <div className="mt-3">
        <h4 className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase">Tecnologías / Requisitos Clave:</h4>
        <div className="flex flex-wrap gap-2 mt-2">
            {(job.requiredTechnologies && job.requiredTechnologies.length > 0 ? job.requiredTechnologies : job.requirements).slice(0, 4).map((req, i) => (
                <span key={i} className="px-2 py-1 bg-slate-100 dark:bg-gray-700 text-slate-700 dark:text-gray-200 text-xs font-medium rounded-full">{req}</span>
            ))}
        </div>
      </div>
    </div>
  );
};

export default JobCard;