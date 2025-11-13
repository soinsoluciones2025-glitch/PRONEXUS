import React, { useState, useCallback, useContext } from 'react';
import type { Lead, LeadStatus, Job, JobStatus, DraggableItem, UserCVInfo, AppConfig } from '../types';
import WorkspaceLeadCard from './WorkspaceLeadCard'; 
import { WorkspaceJobCard } from './WorkspaceJobCard'; 
import DroppableSection from './DroppableSection';
import { exportFullAnalysisToCsv, exportGoogleContactsCsv, sendLeadsToWhatsApp } from '../utils/exportService';
import { ChevronDownIcon } from './icons/ChevronDownIcon'; 
import { ArrowDownTrayIcon } from './icons/ArrowDownTrayIcon'; 
import { TTSContext } from '../contexts/TTSContext';
import type { TTSContextType } from '../contexts/TTSContext';
// FIX: Imported ActiveModal type from App with a named import.
import type { ActiveModal } from '../App';

interface WorkspaceProps {
  mode: 'sales' | 'job';
  savedLeads: Lead[];
  savedJobs: Job[];
  onUpdateLead: (leadId: string, updates: Partial<Omit<Lead, 'id'>>) => void;
  onRemoveLead: (leadId: string) => void;
  onUpdateJob: (jobId: string, updates: Partial<Omit<Job, 'id'>>) => void;
  onRemoveJob: (jobId: string) => void;
  onDrop: (item: DraggableItem, targetStatus: string) => void;
  isDragging: boolean;
  draggedItemType: DraggableItem['type'] | null;
  setActiveModal: (modal: ActiveModal) => void;
  setSelectedLead: (lead: Lead | null) => void;
  setSelectedJob: (job: Job | null) => void;
  onAnalyzeReply: (leadId: string, replyBody: string) => Promise<void>;
  isPremium: boolean;
  userInfo?: UserCVInfo;
  appConfig: AppConfig;
  whatsAppNumber?: string;
}

const Workspace: React.FC<WorkspaceProps> = ({
  mode,
  savedLeads,
  savedJobs,
  onUpdateLead,
  onRemoveLead,
  onUpdateJob,
  onRemoveJob,
  onDrop,
  isDragging,
  draggedItemType,
  setActiveModal,
  setSelectedLead,
  setSelectedJob,
  onAnalyzeReply,
  isPremium,
  userInfo,
  appConfig,
  whatsAppNumber,
}) => {
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const { speak } = useContext(TTSContext) as TTSContextType;

  const leadStatusColumns: { status: LeadStatus; label: string }[] = [
    { status: 'pending', label: 'Pendientes' }, { status: 'contacted', label: 'Contactados' },
    { status: 'interested', label: 'Interesados' }, { status: 'proposal', label: 'Propuestas' },
    { status: 'won', label: 'Ganados' },
  ];

  const jobStatusColumns: { status: JobStatus; label: string }[] = [
    { status: 'saved', label: 'Guardados' }, { status: 'applied', label: 'Postulados' },
    { status: 'interviewing', label: 'Entrevistas' }, { status: 'offer', label: 'Oferta' },
    { status: 'accepted', label: 'Aceptados' },
  ];

  const handleDrop = useCallback((item: DraggableItem, targetColumnId: string) => {
    onDrop(item, targetColumnId);
  }, [onDrop]);

  const renderLeadsColumn = (columnStatus: LeadStatus) => {
    return savedLeads
      .filter((lead: Lead) => lead.status === columnStatus)
      .map((lead: Lead) => (
        <WorkspaceLeadCard
          key={lead.id}
          lead={lead}
          onUpdate={onUpdateLead}
          onRemove={onRemoveLead}
          setActiveModal={setActiveModal}
          setSelectedLead={setSelectedLead}
          onAnalyzeReply={onAnalyzeReply}
          isPremium={isPremium}
          appConfig={appConfig}
        />
      ));
  };

  const renderJobsColumn = (columnStatus: JobStatus) => {
    return savedJobs
      .filter((job: Job) => job.status === columnStatus)
      .map((job: Job) => (
        <WorkspaceJobCard
          key={job.id}
          job={job}
          onUpdate={onUpdateJob}
          onRemove={onRemoveJob}
          userInfo={userInfo}
          setActiveModal={setActiveModal}
          setSelectedJob={setSelectedJob}
          appConfig={appConfig}
          isPremium={isPremium} 
        />
      ));
  };
  
  const isEmpty = (mode === 'sales' && savedLeads.length === 0) || (mode === 'job' && savedJobs.length === 0);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 h-full flex flex-col animate-fade-in">
      <div className="flex justify-between items-center mb-6 flex-shrink-0">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Espacio de Trabajo</h2>
        <div className="relative">
          <button
            onClick={() => setExportMenuOpen(!exportMenuOpen)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-200 dark:bg-gray-700 text-slate-700 dark:text-gray-200 font-semibold rounded-md hover:bg-slate-300 dark:hover:bg-gray-600 transition-colors"
          >
            <ArrowDownTrayIcon className="w-5 h-5" strokeWidth={2} />
            <span className="hidden sm:inline">Exportar</span>
            <ChevronDownIcon className={`w-4 h-4 transition-transform ${exportMenuOpen ? 'rotate-180' : ''}`} strokeWidth={2} />
          </button>
          {exportMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-md shadow-lg py-1 z-10">
              <button onClick={() => { exportFullAnalysisToCsv(savedLeads, 'prospects_full_analysis'); setExportMenuOpen(false); speak("Exportando análisis completo."); }} className="block w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-gray-200 hover:bg-slate-100 dark:hover:bg-gray-600">Análisis Completo CSV</button>
              <button onClick={() => { exportGoogleContactsCsv(savedLeads, 'google_contacts'); setExportMenuOpen(false); speak("Exportando a Google Contacts."); }} className="block w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-gray-200 hover:bg-slate-100 dark:hover:bg-gray-600">Google Contacts CSV</button>
              {whatsAppNumber && <button onClick={() => { sendLeadsToWhatsApp(savedLeads, whatsAppNumber); setExportMenuOpen(false); speak("Compartiendo por WhatsApp."); }} className="block w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-gray-200 hover:bg-slate-100 dark:hover:bg-gray-600">Compartir por WhatsApp</button>}
            </div>
          )}
        </div>
      </div>
      
      {isEmpty ? (
        <div className="flex-grow flex items-center justify-center text-center p-4">
            <p className="text-slate-500 dark:text-gray-400">Arrastra los resultados aquí para organizar tu pipeline.</p>
        </div>
      ) : (
        <div className="relative flex-grow">
            <div className="absolute inset-0 flex lg:grid lg:grid-cols-5 gap-4 overflow-x-auto pb-4">
            {mode === 'sales'
                ? leadStatusColumns.map((col: { status: LeadStatus; label: string }) => (
                    <DroppableSection
                    key={col.status}
                    id={col.status}
                    label={col.label}
                    onDrop={handleDrop}
                    isDragging={isDragging}
                    draggedItemType={draggedItemType}
                    accepts="lead"
                    totalItems={savedLeads.filter((l: Lead) => l.status === col.status).length}
                    >
                    {renderLeadsColumn(col.status)}
                    </DroppableSection>
                ))
                : jobStatusColumns.map((col: { status: JobStatus; label: string }) => (
                    <DroppableSection
                    key={col.status}
                    id={col.status}
                    label={col.label}
                    onDrop={handleDrop}
                    isDragging={isDragging}
                    draggedItemType={draggedItemType}
                    accepts="job"
                    totalItems={savedJobs.filter((j: Job) => j.status === col.status).length}
                    >
                    {renderJobsColumn(col.status)}
                    </DroppableSection>
                ))}
            </div>
             {!isEmpty && (
                 <div className="lg:hidden absolute bottom-0 left-1/2 -translate-x-1/2 text-xs text-slate-400 dark:text-gray-500 pointer-events-none bg-slate-100/80 dark:bg-gray-900/80 px-2 py-1 rounded-full">
                    ← Desliza para ver más →
                </div>
            )}
        </div>
      )}
    </div>
  );
};

export default Workspace;