import React, { useState, useContext } from 'react';
import type { Lead, LeadStatus, AppConfig } from '../types';
import { TrashIcon } from './icons/TrashIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { ChatBubbleIcon } from './icons/ChatBubbleIcon';
import { LightBulbIcon } from './icons/LightBulbIcon';
import { RocketLaunchIcon } from './icons/RocketLaunchIcon';
import { InboxIcon } from './icons/InboxIcon';
import { TrendingUpIcon } from './icons/TrendingUpIcon';
import { DocumentCheckIcon } from './icons/DocumentCheckIcon';
import { TTSContext } from '../contexts/TTSContext';
import type { TTSContextType } from '../contexts/TTSContext';
import { ClockIcon } from './icons/ClockIcon';
// FIX: Imported ActiveModal type from App with a named import.
import type { ActiveModal } from '../App';

interface WorkspaceLeadCardProps {
    lead: Lead;
    onUpdate: (leadId: string, updates: Partial<Omit<Lead, 'id'>>) => void;
    onRemove: (leadId: string) => void;
    setActiveModal: (modal: ActiveModal) => void;
    setSelectedLead: (lead: Lead | null) => void;
    onAnalyzeReply: (leadId: string, replyBody: string) => Promise<void>;
    isPremium: boolean;
    appConfig: AppConfig;
}

const statusOptions: LeadStatus[] = ['pending', 'contacted', 'interested', 'proposal', 'won', 'lost', 'discarded'];

const statusStyles: Record<LeadStatus, string> = {
    pending: 'bg-slate-200 text-slate-800 dark:bg-gray-700 dark:text-gray-200',
    contacted: 'bg-blue-200 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    interested: 'bg-yellow-200 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    proposal: 'bg-indigo-200 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
    won: 'bg-green-220 text-green-800 dark:bg-green-900 dark:text-green-200', // Changed to green-220
    lost: 'bg-red-200 text-red-800 dark:bg-red-900 dark:text-red-200',
    discarded: 'bg-gray-400 text-gray-800 dark:bg-gray-600 dark:text-gray-200',
};

const WorkspaceLeadCard: React.FC<WorkspaceLeadCardProps> = ({
    lead, onUpdate, onRemove, setActiveModal, setSelectedLead, onAnalyzeReply,
    isPremium, appConfig,
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [replyInput, setReplyInput] = useState('');
    const { speak } = useContext(TTSContext) as TTSContextType;

    const handleAction = (modal: ActiveModal) => {
        setSelectedLead(lead);
        setActiveModal(modal);
    };

    const handleAnalyzeReplyClick = async () => {
        if (!replyInput.trim()) {
            speak("Por favor, ingresa el texto de la respuesta para analizar.");
            alert("Por favor, ingresa el texto de la respuesta para analizar.");
            return;
        }
        await onAnalyzeReply(lead.id, replyInput);
        setReplyInput(''); // Clear input after analysis
    };
    
    const handleOpenContactScript = () => {
        handleAction('contactScript');
    }

    const handleOpenDeepDive = () => {
        handleAction('deepDive');
    }

    const handleOpenCompetitorAnalysis = () => {
        handleAction('competitorAnalysis');
    }

    const handleOpenProposal = () => {
        // Ensure deep dive is available before opening proposal modal
        if (!lead.deepDiveAnalysis) {
            speak("Por favor, genera un Diagnóstico 360 grados primero.");
            alert("Por favor, genera un Diagnóstico 360° primero para este cliente potencial.");
            return;
        }
        handleAction('proposal');
    }


    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-slate-200 dark:border-gray-700 transition-shadow hover:shadow-lg mb-4">
            <div className="p-4 flex justify-between items-center cursor-pointer" onClick={() => {setIsExpanded(!isExpanded);}}>
                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-900 dark:text-white truncate">{lead.name}</h3>
                    <p className="text-sm text-slate-600 dark:text-gray-400 truncate">{lead.businessType || 'Tipo de Negocio Desconocido'}</p>
                    <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">{lead.opportunityAnalysis?.substring(0, 50)}...</p>
                </div>
                <div className="flex items-center gap-3 ml-4 flex-shrink-0">
                    <select
                        value={lead.status}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onUpdate(lead.id, { status: e.target.value as LeadStatus })}
                        onClick={(e: React.MouseEvent<HTMLSelectElement>) => e.stopPropagation()} // Prevent card expansion when changing status
                        className={`px-2 py-1 text-xs font-semibold rounded-md border-none outline-none focus:ring-2 focus:ring-cyan-500 text-slate-800 dark:text-white ${statusStyles[lead.status]}`}
                    >
                        {statusOptions.map((s: LeadStatus) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                    </select>
                    <button onClick={(e: React.MouseEvent<HTMLButtonElement>) => { e.stopPropagation(); onRemove(lead.id);}} className="p-1.5 text-slate-400 hover:text-red-500" title="Eliminar cliente potencial"><TrashIcon className="w-5 h-5" strokeWidth={2} /></button>
                    <ChevronDownIcon className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} strokeWidth={2} />
                </div>
            </div>
            {isExpanded && (
                <div className="p-4 border-t border-slate-200 dark:border-gray-700 space-y-4">
                    {/* Detailed Lead Info */}
                    <div>
                        <h4 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">Detalles del Cliente</h4>
                        <p className="mt-1 text-sm text-slate-700 dark:text-gray-300 whitespace-pre-wrap">{lead.details}</p>
                        {lead.contactInfo?.email && <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">Email: {lead.contactInfo.email}</p>}
                        {lead.contactInfo?.phone && <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">Teléfono: {lead.contactInfo.phone}</p>}
                        {lead.contactInfo?.website && <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">Web: <a href={lead.contactInfo.website} target="_blank" rel="noopener noreferrer" className="hover:text-cyan-500 hover:underline">{lead.contactInfo.website}</a></p>}
                    </div>

                    {/* Opportunity Analysis */}
                    {lead.opportunityAnalysis && (
                        <div>
                            <h4 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">Análisis de Oportunidad</h4>
                            <p className="mt-1 text-sm text-cyan-700 dark:text-cyan-300 whitespace-pre-wrap">{lead.opportunityAnalysis}</p>
                        </div>
                    )}
                    
                    {/* Notes */}
                    <div>
                        <h4 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">Notas</h4>
                        <textarea
                            value={lead.notes || ''}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onUpdate(lead.id, { notes: e.target.value })}
                            onClick={(e: React.MouseEvent<HTMLTextAreaElement>) => e.stopPropagation()}
                            className="mt-1 w-full p-2 border border-slate-300 dark:border-gray-600 rounded-md bg-slate-50 dark:bg-gray-700 text-sm text-slate-900 dark:text-white"
                            rows={3}
                            placeholder="Añade tus notas aquí..."
                        />
                    </div>

                    {/* AI Tools */}
                    <div className="flex justify-end flex-wrap gap-2">
                        <button onClick={handleOpenDeepDive} disabled={!isPremium && (appConfig.creditCosts.performDeepDiveAnalysis ?? 0) > 0} title={!isPremium && (appConfig.creditCosts.performDeepDiveAnalysis ?? 0) > 0 ? `Función Premium: Diagnóstico 360° (${appConfig.creditCosts.performDeepDiveAnalysis ?? 0} Créditos)` : "Diagnóstico 360° IA"} className={`flex items-center gap-2 px-3 py-1.5 text-sm bg-indigo-100 hover:bg-indigo-200 text-indigo-700 font-semibold rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}>
                            <LightBulbIcon className="w-4 h-4" strokeWidth={2}/>
                            Diagnóstico 360° {(!isPremium && (appConfig.creditCosts.performDeepDiveAnalysis ?? 0) > 0) ? '(Adquirir Créditos)' : ''}
                        </button>
                        <button onClick={handleOpenCompetitorAnalysis} disabled={!isPremium && (appConfig.creditCosts.performCompetitorAnalysis ?? 0) > 0} title={!isPremium && (appConfig.creditCosts.performCompetitorAnalysis ?? 0) > 0 ? `Función Premium: Análisis Competencia (${appConfig.creditCosts.performCompetitorAnalysis ?? 0} Créditos)` : "Análisis de Competencia IA"} className={`flex items-center gap-2 px-3 py-1.5 text-sm bg-purple-100 hover:bg-purple-200 text-purple-700 font-semibold rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}>
                            <TrendingUpIcon className="w-4 h-4" strokeWidth={2}/>
                            Competencia {(!isPremium && (appConfig.creditCosts.performCompetitorAnalysis ?? 0) > 0) ? '(Adquirir Créditos)' : ''}
                        </button>
                        <button onClick={handleOpenProposal} disabled={!isPremium && (appConfig.creditCosts.generateProposal ?? 0) > 0} title={!isPremium && (appConfig.creditCosts.generateProposal ?? 0) > 0 ? `Función Premium: Generar Propuesta (${appConfig.creditCosts.generateProposal ?? 0} Créditos)` : "Generar Propuesta IA"} className={`flex items-center gap-2 px-3 py-1.5 text-sm bg-green-100 hover:bg-green-200 text-green-700 font-semibold rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}>
                            <DocumentCheckIcon className="w-4 h-4" strokeWidth={2}/>
                            Propuesta {(!isPremium && (appConfig.creditCosts.generateProposal ?? 0) > 0) ? '(Adquirir Créditos)' : ''}
                        </button>
                        <button onClick={handleOpenContactScript} disabled={!isPremium && (appConfig.creditCosts.generateContactScript ?? 0) > 0} title={!isPremium && (appConfig.creditCosts.generateContactScript ?? 0) > 0 ? `Función Premium: Guion de Contacto (${appConfig.creditCosts.generateContactScript ?? 0} Créditos)` : "Guion de Contacto IA"} className={`flex items-center gap-2 px-3 py-1.5 text-sm bg-cyan-100 hover:bg-cyan-200 text-cyan-700 font-semibold rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}>
                            <ChatBubbleIcon className="w-4 h-4" strokeWidth={2}/>
                            Guion de Contacto {(!isPremium && (appConfig.creditCosts.generateContactScript ?? 0) > 0) ? '(Adquirir Créditos)' : ''}
                        </button>
                        <button onClick={() => handleAction('emailComposer')} disabled={!lead.contactInfo?.email} title={!lead.contactInfo?.email ? "El cliente no tiene un email guardado" : "Abrir borrador de email"} className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold rounded-md disabled:opacity-50 disabled:cursor-not-allowed">
                            <RocketLaunchIcon className="w-4 h-4" strokeWidth={2}/>
                            Enviar Email
                        </button>
                    </div>

                    {/* Email Reply Analysis */}
                    {lead.lastReply && (
                        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-gray-700">
                            <h4 className="flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-2">
                                <InboxIcon className="w-4 h-4 text-slate-500" strokeWidth={2} /> Última Respuesta del Cliente
                            </h4>
                            <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-md">
                                <p className="text-sm text-gray-700 dark:text-gray-300 italic">"{lead.lastReply}"</p>
                                {lead.replyAnalysis && (
                                    <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                                        <p><span className="font-semibold">Sentimiento:</span> {lead.replyAnalysis.sentiment}</p>
                                        <p><span className="font-semibold">Resumen IA:</span> {lead.replyAnalysis.summary}</p>
                                        <p><span className="font-semibold">Siguiente Paso IA:</span> {lead.replyAnalysis.suggestedNextStep}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    <div className="mt-2 flex flex-col sm:flex-row gap-2">
                        <input
                            type="text"
                            value={replyInput}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setReplyInput(e.target.value)}
                            onClick={(e: React.MouseEvent<HTMLInputElement>) => e.stopPropagation()} // Prevent card expansion
                            placeholder="Pega la respuesta del cliente aquí para analizarla..."
                            className="flex-grow p-2 border border-slate-300 dark:border-gray-600 rounded-md bg-slate-50 dark:bg-gray-700 text-sm text-slate-900 dark:text-white"
                        />
                        <button
                            onClick={handleAnalyzeReplyClick}
                            disabled={!replyInput.trim() || (!isPremium && (appConfig.creditCosts.analyzeEmailReply ?? 0) > 0)}
                            title={!replyInput.trim() ? "Ingresa texto para analizar" : (!isPremium && (appConfig.creditCosts.analyzeEmailReply ?? 0) > 0 ? `Función Premium: Analizar Respuesta (${appConfig.creditCosts.analyzeEmailReply ?? 0} Créditos)` : "Analizar Respuesta IA")}
                            className={`flex-shrink-0 px-3 py-2 text-sm bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            Analizar Respuesta {(!isPremium && (appConfig.creditCosts.analyzeEmailReply ?? 0) > 0) ? '(Adquirir Créditos)' : ''}
                        </button>
                    </div>

                    {lead.activityHistory && lead.activityHistory.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-gray-700">
                            <h4 className="flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-2">
                                <ClockIcon className="w-4 h-4 text-slate-500" strokeWidth={2} /> Historial de Actividad
                            </h4>
                            <ul className="space-y-1 text-sm text-slate-700 dark:text-gray-300">
                                {lead.activityHistory.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((entry, index: number) => (
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

export default WorkspaceLeadCard;