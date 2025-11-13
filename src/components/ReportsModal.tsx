import React, { useState, useContext } from 'react';
import type { SavedMarketAnalysis, Lead } from '../types';
import { TrashIcon } from './icons/TrashIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { LightBulbIcon } from './icons/LightBulbIcon';
import { ChartPieIcon } from './icons/ChartPieIcon';
import { MagnifyingGlassDocumentIcon } from './icons/MagnifyingGlassDocumentIcon';
import { DocumentCheckIcon } from './icons/DocumentCheckIcon';
import { TTSContext } from '../contexts/TTSContext';
import type { TTSContextType } from '../contexts/TTSContext';


interface ReportsModalProps {
  marketReports: SavedMarketAnalysis[];
  diagnosticReports: Lead[];
  proposalReports: Lead[];
  onDeleteReport: (reportId: string) => void;
}

type ActiveTab = 'market' | 'diagnostics' | 'proposals';

const TabButton: React.FC<{
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
  count: number; // Ensure count is a number
}> = ({ label, icon, isActive, onClick, count }) => {
    return (
        <button
            onClick={() => {onClick();}}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-t-lg border-b-2 transition-colors ${
                isActive
                    ? 'text-cyan-600 dark:text-cyan-400 border-cyan-600'
                    : 'text-gray-500 dark:text-gray-400 border-transparent hover:text-gray-700 dark:hover:text-gray-200'
            }`}
        >
            {icon}
            <span>{label}</span>
            <span className={`px-2 py-0.5 text-xs rounded-full ${isActive ? 'bg-cyan-100 dark:bg-cyan-900/50' : 'bg-gray-200 dark:bg-gray-700'}`}>{count ?? 0}</span> {/* Ensure count is a number */}
        </button>
    );
};

const MarketReportItem: React.FC<{ report: SavedMarketAnalysis; onDelete: (id: string) => void }> = ({ report, onDelete }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const { speak } = useContext(TTSContext) as TTSContextType; 
    const { query, area, categories } = report.context;

    return (
        <div className="bg-white dark:bg-gray-800/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-start cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
                <div>
                    <p className="font-bold text-indigo-700 dark:text-indigo-300" onMouseEnter={() => speak(categories.join(', '))}>{categories.join(', ')}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400" onMouseEnter={() => speak(`Para: ${query.userOfferingOrProfession} en ${area.location}`)}>Para: "{query.userOfferingOrProfession}" en {area.location}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1" onMouseEnter={() => speak(`Generado el ${new Date(report.timestamp).toLocaleDateString()}`)}>Generado: {new Date(report.timestamp).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={(e: React.MouseEvent<HTMLButtonElement>) => { e.stopPropagation(); onDelete(report.id); speak("Informe eliminado.");}} className="p-1 text-gray-400 hover:text-red-500 transition-colors" title="Eliminar informe"><TrashIcon className="w-4 h-4" strokeWidth={2} /></button>
                    <ChevronDownIcon className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} strokeWidth={2} />
                </div>
            </div>
            {isExpanded && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-4 animate-fade-in-fast text-sm">
                    <div><p onMouseEnter={() => speak(`Tamaño del Mercado: ${report.analysis.marketSize}`)}><span className="font-semibold">Tamaño del Mercado:</span> {report.analysis.marketSize}</p></div>
                    <div><h5 className="font-semibold" onMouseEnter={() => speak("Fortalezas Clave:")}>Fortalezas Clave:</h5><ul className="list-disc list-inside ml-4">{(report.analysis.keyStrengths || []).map((item: string, i: number) => <li key={i} onMouseEnter={() => speak(item)}>{item}</li>)}</ul></div>
                    <div><h5 className="font-semibold" onMouseEnter={() => speak("Debilidades Comunes:")}>Debilidades Comunes:</h5><ul className="list-disc list-inside ml-4">{(report.analysis.commonWeaknesses || []).map((item: string, i: number) => <li key={i} onMouseEnter={() => speak(item)}>{item}</li>)}</ul></div>
                    <div><h5 className="font-semibold" onMouseEnter={() => speak("Necesidades no Cubiertas:")}>Necesidades no Cubiertas:</h5><ul className="list-disc list-inside ml-4">{(report.analysis.unmetNeeds || []).map((item: string, i: number) => <li key={i} onMouseEnter={() => speak(item)}>{item}</li>)}</ul></div>
                    <div className="p-3 bg-indigo-50 dark:bg-indigo-900/50 rounded flex items-start gap-3">
                         <LightBulbIcon className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" strokeWidth={2} />
                         <div>
                            <h5 className="font-semibold text-indigo-800 dark:text-indigo-200" onMouseEnter={() => speak("Oportunidad Estratégica")}>Oportunidad Estratégica</h5>
                            <p className="text-sm text-indigo-700 dark:text-indigo-300" onMouseEnter={() => speak(report.analysis.strategicOpportunities)}>{report.analysis.strategicOpportunities}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const DiagnosticReportItem: React.FC<{ lead: Lead }> = ({ lead }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const { speak } = useContext(TTSContext) as TTSContextType; 
    return (
        <div className="bg-white dark:bg-gray-800/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-start cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
                <div>
                    <p className="font-bold text-indigo-700 dark:text-indigo-300" onMouseEnter={() => speak(lead.name)}>{lead.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400" onMouseEnter={() => speak(`Analizado para: ${lead.userOffering}`)}>Analizado para: "{lead.userOffering}"</p>
                </div>
                <ChevronDownIcon className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} strokeWidth={2} />
            </div>
            {isExpanded && lead.deepDiveAnalysis && (
                 <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 animate-fade-in-fast space-y-3 text-sm">
                    <div><h5 className="font-semibold" onMouseEnter={() => speak("Resumen Estratégico:")}>Resumen Estratégico:</h5><p onMouseEnter={() => speak(lead.deepDiveAnalysis?.strategicSummary ?? '')}>{lead.deepDiveAnalysis?.strategicSummary}</p></div>
                    <div><h5 className="font-semibold" onMouseEnter={() => speak("Análisis de Reseñas:")}>Análisis de Reseñas:</h5><ul className="list-disc list-inside ml-4"><li>Positivas: {(lead.deepDiveAnalysis?.reviewAnalysis.positivePoints || []).join(', ')}</li><li>Mejoras: {(lead.deepDiveAnalysis?.reviewAnalysis.areasForImprovement || []).join(', ')}</li></ul></div>
                    {lead.deepDiveAnalysis.onlineVisibilityAudit && <div><h5 className="font-semibold" onMouseEnter={() => speak("Visibilidad Online:")}>Visibilidad Online:</h5><p onMouseEnter={() => speak(lead.deepDiveAnalysis?.onlineVisibilityAudit?.keyOpportunity ?? '')}>{lead.deepDiveAnalysis?.onlineVisibilityAudit?.keyOpportunity}</p></div>}
                    {lead.deepDiveAnalysis.socialMediaAnalysis && <div><h5 className="font-semibold" onMouseEnter={() => speak("Redes Sociales:")}>Redes Sociales:</h5><p onMouseEnter={() => speak(lead.deepDiveAnalysis?.socialMediaAnalysis?.keyOpportunity ?? '')}>{lead.deepDiveAnalysis?.socialMediaAnalysis?.keyOpportunity}</p></div>}
                </div>
            )}
        </div>
    );
};

const ProposalReportItem: React.FC<{ lead: Lead }> = ({ lead }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const { speak } = useContext(TTSContext) as TTSContextType; 
    return (
        <div className="bg-white dark:bg-gray-800/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-start cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
                <div>
                    <p className="font-bold text-green-700 dark:text-green-300" onMouseEnter={() => speak(lead.name)}>{lead.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400" onMouseEnter={() => speak(`Propuesta para: ${lead.userOffering}`)}>Propuesta para: "{lead.userOffering}"</p>
                </div>
                <ChevronDownIcon className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} strokeWidth={2} />
            </div>
            {isExpanded && lead.proposal && (
                 <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 animate-fade-in-fast space-y-3 text-sm">
                    <div><h5 className="font-semibold" onMouseEnter={() => speak("Introducción:")}>Introducción:</h5><p onMouseEnter={() => speak(lead.proposal?.introduction ?? '')}>{lead.proposal.introduction}</p></div>
                    <div><h5 className="font-semibold" onMouseEnter={() => speak("Solución Propuesta:")}>Solución Propuesta:</h5><p onMouseEnter={() => speak(lead.proposal?.solution ?? '')}>{lead.proposal.solution}</p></div>
                    <div><h5 className="font-semibold" onMouseEnter={() => speak("Inversión y Valor:")}>Inversión y Valor:</h5><p onMouseEnter={() => speak(lead.proposal?.investment ?? '')}>{lead.proposal.investment}</p></div>
                    <div><h5 className="font-semibold" onMouseEnter={() => speak("Próximos Pasos:")}>Próximos Pasos:</h5><p onMouseEnter={() => speak(lead.proposal?.nextSteps ?? '')}>{lead.proposal.nextSteps}</p></div>
                </div>
            )}
        </div>
    );
};


export const ReportsModal: React.FC<ReportsModalProps> = ({ marketReports, diagnosticReports, proposalReports, onDeleteReport }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('market');
  const { speak } = useContext(TTSContext) as TTSContextType; 

  const totalDiagnosticReportsCount = diagnosticReports.filter((l: Lead) => l.deepDiveAnalysis).length;
  const totalProposalReportsCount = proposalReports.filter((l: Lead) => l.proposal).length;

  return (
    <div className="p-6">
      <div className="flex flex-wrap border-b border-gray-200 dark:border-gray-700 mb-6">
        <TabButton 
          label="Mercado" 
          icon={<ChartPieIcon className="w-5 h-5" strokeWidth={2} />} 
          isActive={activeTab === 'market'} 
          onClick={() => {setActiveTab('market'); speak("Mostrando informes de mercado.");}} 
          count={marketReports.length} 
        />
        <TabButton 
          label="Diagnósticos 360°" 
          icon={<MagnifyingGlassDocumentIcon className="w-5 h-5" strokeWidth={2} />} 
          isActive={activeTab === 'diagnostics'} 
          onClick={() => {setActiveTab('diagnostics'); speak("Mostrando diagnósticos 360 grados.");}} 
          count={totalDiagnosticReportsCount}
        />
        <TabButton 
          label="Propuestas" 
          icon={<DocumentCheckIcon className="w-5 h-5" strokeWidth={2} />} 
          isActive={activeTab === 'proposals'} 
          onClick={() => {setActiveTab('proposals'); speak("Mostrando propuestas.");}} 
          count={totalProposalReportsCount}
        />
      </div>

      <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
        {activeTab === 'market' && (
          marketReports.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400" onMouseEnter={() => speak("No hay informes de mercado guardados.")}>No hay informes de mercado guardados.</p>
          ) : (
            marketReports.map((report: SavedMarketAnalysis) => (
              <MarketReportItem key={report.id} report={report} onDelete={onDeleteReport} />
            ))
          )
        )}
        {activeTab === 'diagnostics' && (
          diagnosticReports.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400" onMouseEnter={() => speak("No hay diagnósticos 360 grados guardados.")}>No hay diagnósticos 360° guardados.</p>
          ) : (
            diagnosticReports.filter((l: Lead) => l.deepDiveAnalysis).map((lead: Lead) => (
              <DiagnosticReportItem key={lead.id} lead={lead} />
            ))
          )
        )}
         {activeTab === 'proposals' && (
          proposalReports.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400" onMouseEnter={() => speak("No hay propuestas generadas.")}>No hay propuestas generadas.</p>
          ) : (
            proposalReports.filter((l: Lead) => l.proposal).map((lead: Lead) => (
              <ProposalReportItem key={lead.id} lead={lead} />
            ))
          )
        )}
      </div>
    </div>
  );
};