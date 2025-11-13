import React, { useState, useContext } from 'react';
import type { Job, JobStatus, UserCVInfo, AppConfig } from '../types';
import { TrashIcon } from './icons/TrashIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { DocumentTextIcon } from './icons/DocumentTextIcon';
import { EnvelopeIcon } from './icons/EnvelopeIcon';
import { AcademicCapIcon } from './icons/AcademicCapIcon';
import { ClockIcon } from './icons/ClockIcon';
import { TTSContext } from '../contexts/TTSContext';
import type { TTSContextType } from '../contexts/TTSContext';
import { ShieldCheckIcon } from './icons/ShieldCheckIcon';
// FIX: Imported ActiveModal type from App with a named import.
import type { ActiveModal } from '../App';

interface WorkspaceJobCardProps {
    job: Job;
    onUpdate: (jobId: string, updates: Partial<Omit<Job, 'id'>>) => void;
    onRemove: (jobId: string) => void;
    userInfo?: UserCVInfo;
    setActiveModal: (modal: ActiveModal) => void; // FIX: Typed as ActiveModal
    setSelectedJob: (job: Job | null) => void;
    appConfig: AppConfig;
    isPremium: boolean; // FIX: Added isPremium prop
}

const statusOptions: JobStatus[] = ['saved', 'applied', 'interviewing', 'offer', 'rejected', 'accepted'];

const statusStyles: Record<JobStatus, string> = {
    saved: 'bg-slate-200 text-slate-800 dark:bg-gray-700 dark:text-gray-200',
    applied: 'bg-blue-200 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    interviewing: 'bg-yellow-200 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    offer: 'bg-purple-200 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    rejected: 'bg-red-200 text-red-800 dark:bg-red-900 dark:text-red-200',
    accepted: 'bg-green-200 text-green-800 dark:bg-green-900 dark:text-green-200',
};

export const WorkspaceJobCard: React.FC<WorkspaceJobCardProps> = ({
    job, onUpdate, onRemove, userInfo, setActiveModal, setSelectedJob,
    appConfig, isPremium, // FIX: Destructured isPremium
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const { speak } = useContext(TTSContext) as TTSContextType;

    const handleAction = (modal: ActiveModal) => { // FIX: Type modal as ActiveModal
        setSelectedJob(job);
        setActiveModal(modal);
    };

    const handleCVClick = async () => {
        if (!userInfo || Object.keys(userInfo).length === 0) {
            speak("Por favor, completa tu información para CV en los Ajustes primero.");
            alert("Por favor, completa tu información para CV en los Ajustes primero.");
            setActiveModal('settings');
            return;
        }
        handleAction('cv');
    };

    const handleCoverLetterClick = async () => {
        if (!userInfo || Object.keys(userInfo).length === 0) {
            speak("Por favor, completa tu información para CV en los Ajustes primero.");
            alert("Por favor, completa tu información para CV en los Ajustes primero.");
            setActiveModal('settings');
            return;
        }
        handleAction('coverLetter');
    };
    
    const handleInterviewPrepClick = async () => {
        if (!userInfo || Object.keys(userInfo).length === 0) {
            speak("Por favor, completa tu información para CV en los Ajustes primero.");
            alert("Por favor, completa tu información para CV en los Ajustes primero.");
            setActiveModal('settings');
            return;
        }
        handleAction('interviewPrep');
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-slate-200 dark:border-gray-700 transition-shadow hover:shadow-lg mb-4">
            <div className="p-4 flex justify-between items-center cursor-pointer" onClick={() => {setIsExpanded(!isExpanded);}}>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                        <h3 className="font-bold text-slate-900 dark:text-white truncate">{job.jobTitle}</h3>
                        {job.profileFitScore && (
                            <div className="flex items-center gap-1 font-bold text-sm text-green-600" title={`Afinidad con tu perfil: ${job.profileFitScore}%`}>
                                <ShieldCheckIcon className="w-4 h-4" />
                                <span>{job.profileFitScore}</span>
                            </div>
                        )}
                    </div>
                    <p className="text-sm text-slate-600 dark:text-gray-400 truncate">{job.companyName} - {job.location}</p>
                    {job.salaryRange && <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">{job.salaryRange}</p>}
                </div>
                <div className="flex items-center gap-3 ml-4 flex-shrink-0">
                     <select
                        value={job.status}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {onUpdate(job.id, { status: e.target.value as JobStatus });}}
                        onClick={(e: React.MouseEvent<HTMLSelectElement>) => e.stopPropagation()}
                        className={`px-2 py-1 text-xs font-semibold rounded-md border-none outline-none focus:ring-2 focus:ring-cyan-500 text-slate-800 dark:text-white ${statusStyles[job.status]}`}
                    >
                        {statusOptions.map((s: JobStatus) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                    </select>
                    <button onClick={(e: React.MouseEvent<HTMLButtonElement>) => { e.stopPropagation(); onRemove(job.id);}} className="p-1.5 text-slate-400 hover:text-red-500" title="Eliminar oferta de empleo"><TrashIcon className="w-5 h-5" strokeWidth={2} /></button>
                    <ChevronDownIcon className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} strokeWidth={2} />
                </div>
            </div>
            {isExpanded && (
                <div className="p-4 border-t border-slate-200 dark:border-gray-700 space-y-4">
                    {/* Job Details */}
                    <div>
                        <h4 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">Detalles del Puesto</h4>
                        <p className="mt-1 text-sm text-slate-700 dark:text-gray-300 whitespace-pre-wrap">{job.description}</p>
                        {job.companySize && <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">Tamaño de la empresa: {job.companySize}</p>}
                    </div>
                    {/* Requirements */}
                    <div>
                        <h4 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">Tecnologías / Requisitos Clave</h4>
                        <ul className="list-disc list-inside mt-1 text-sm text-slate-700 dark:text-gray-300">
                            {(job.requiredTechnologies && job.requiredTechnologies.length > 0 ? job.requiredTechnologies : job.requirements).map((req: string, index: number) => <li key={index}>{req}</li>)}
                        </ul>
                    </div>

                    <div className="flex justify-end flex-wrap gap-2">
                        <button onClick={handleCVClick} disabled={!userInfo || Object.keys(userInfo).length === 0 || (!isPremium && (appConfig.creditCosts.generateCV ?? 0) > 0)} title={(!userInfo || Object.keys(userInfo).length === 0) ? "Completa tu CV en Ajustes primero" : (!isPremium && (appConfig.creditCosts.generateCV ?? 0) > 0 ? `Función Premium: Adaptar CV (${appConfig.creditCosts.generateCV ?? 0} Créditos)` : "Adaptar CV")} className={`flex items-center gap-2 px-3 py-1.5 text-sm bg-yellow-100 hover:bg-yellow-200 text-yellow-700 font-semibold rounded-md disabled:opacity-50 disabled:cursor-not-allowed`}>
                            <DocumentTextIcon className="w-4 h-4" strokeWidth={2}/>
                            Adaptar CV {(!isPremium && (appConfig.creditCosts.generateCV ?? 0) > 0) ? '(Adquirir Créditos)' : ''}
                        </button>
                        <button onClick={handleCoverLetterClick} disabled={!userInfo || Object.keys(userInfo).length === 0 || (!isPremium && (appConfig.creditCosts.generateCoverLetter ?? 0) > 0)} title={(!userInfo || Object.keys(userInfo).length === 0) ? "Completa tu CV en Ajustes primero" : (!isPremium && (appConfig.creditCosts.generateCoverLetter ?? 0) > 0 ? `Función Premium: Generar Carta (${appConfig.creditCosts.generateCoverLetter ?? 0} Créditos)` : "Generar Carta")} className={`flex items-center gap-2 px-3 py-1.5 text-sm bg-cyan-100 hover:bg-cyan-200 text-cyan-700 font-semibold rounded-md disabled:opacity-50 disabled:cursor-not-allowed`}>
                            <EnvelopeIcon className="w-4 h-4" strokeWidth={2}/>
                            Generar Carta {(!isPremium && (appConfig.creditCosts.generateCoverLetter ?? 0) > 0) ? '(Adquirir Créditos)' : ''}
                        </button>
                        <button onClick={handleInterviewPrepClick} disabled={!userInfo || Object.keys(userInfo).length === 0 || (!isPremium && (appConfig.creditCosts.generateInterviewPrep ?? 0) > 0)} title={(!userInfo || Object.keys(userInfo).length === 0) ? "Completa tu CV en Ajustes primero" : (!isPremium && (appConfig.creditCosts.generateInterviewPrep ?? 0) > 0 ? `Función Premium: Preparar Entrevista (${appConfig.creditCosts.generateInterviewPrep ?? 0} Créditos)` : "Preparar Entrevista")} className={`flex items-center gap-2 px-3 py-1.5 text-sm bg-green-100 hover:bg-green-200 text-green-700 font-semibold rounded-md disabled:opacity-50 disabled:cursor-not-allowed`}>
                            <AcademicCapIcon className="w-4 h-4" strokeWidth={2}/>
                            Preparar Entrevista {(!isPremium && (appConfig.creditCosts.generateInterviewPrep ?? 0) > 0) ? '(Adquirir Créditos)' : ''}
                        </button>
                    </div>

                    {job.activityHistory && job.activityHistory.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-gray-700">
                            <h4 className="flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-2">
                                <ClockIcon className="w-4 h-4 text-slate-500" strokeWidth={2} /> Historial de Actividad
                            </h4>
                            <ul className="space-y-1 text-sm text-slate-700 dark:text-gray-300">
                                {job.activityHistory.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((entry, index: number) => (
                                    <li key={index} className="flex items-center gap-2">
                                        <span className="text-xs text-slate-500 dark:text-gray-400">[{new Date(entry.date).toLocaleDateString()} {new Date(entry.date).toLocaleTimeString()}]</span>
                                        <span>{entry.event}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};