import React, { useState, useEffect, useCallback, useContext } from 'react';
import type { DeepDiveAnalysis, Lead } from '../types';
import { performDeepDiveAnalysis } from '../services/geminiService';
import { LightBulbIcon } from './icons/LightBulbIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { ShareIcon } from './icons/ShareIcon'; // For social media
import { DesktopComputerIcon } from './icons/DesktopComputerIcon'; // For online visibility
import { PhotoIcon } from './icons/PhotoIcon'; // For visual analysis
import { ArrowPathIcon } from './icons/ArrowPathIcon'; // For regenerate
import { TTSContext } from '../contexts/TTSContext';
import type { TTSContextType } from '../contexts/TTSContext';


interface DeepDiveModalProps {
  lead: Lead;
  onAnalysisComplete: (analysis: DeepDiveAnalysis) => void;
  onDeductCredits: (amount: number) => Promise<boolean>;
  userApiKey: string;
}

const LoadingState: React.FC = () => (
    <div className="p-8 text-center animate-pulse">
        <SparklesIcon className="w-16 h-16 mx-auto text-indigo-600 dark:text-yellow-500" />
        <h3 className="mt-4 text-xl font-bold text-gray-800 dark:text-white">Realizando Diagnóstico 360°...</h3>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
            La IA está investigando a fondo el negocio para un análisis completo.
        </p>
    </div>
);

export const DeepDiveModal: React.FC<DeepDiveModalProps> = ({ lead, onAnalysisComplete, onDeductCredits, userApiKey }) => {
    const [analysis, setAnalysis] = useState<DeepDiveAnalysis | null>(lead.deepDiveAnalysis || null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { speak } = useContext(TTSContext) as TTSContextType;

    const handleGenerate = useCallback(async () => {
        const deductionSuccessful = await onDeductCredits(2); // Cost for deep dive analysis
        if (!deductionSuccessful) {
            speak("Créditos insuficientes para realizar un diagnóstico 360 grados.");
            return;
        }
        setIsLoading(true);
        setError(null);
        speak(`Realizando diagnóstico 360 grados para ${lead.name}.`);
        try {
            const newAnalysis = await performDeepDiveAnalysis(lead, userApiKey);
            setAnalysis(newAnalysis);
            onAnalysisComplete(newAnalysis);
            speak("Diagnóstico 360 grados completado.");
        } catch (err: any) {
            setError(err.message || 'Ocurrió un error desconocido.');
            speak("Hubo un error al realizar el diagnóstico 360 grados.");
        } finally {
            setIsLoading(false);
        }
    }, [lead, onAnalysisComplete, onDeductCredits, userApiKey, speak]);

    useEffect(() => {
        if (!analysis) {
            handleGenerate();
        }
    }, [analysis, handleGenerate]);

    if (isLoading) return <LoadingState />;
    if (error) return <div className="p-6 text-center text-red-500">{error}</div>;
    if (!analysis) return <div className="p-6 text-center">No se pudo generar el diagnóstico.</div>;

    return (
        <div className="p-6 space-y-6">
            <div className="p-4 bg-indigo-50 dark:bg-indigo-900/50 border-l-4 border-indigo-500 rounded-r-lg flex items-start gap-3">
                <LightBulbIcon className="w-6 h-6 text-indigo-500 flex-shrink-0 mt-1" />
                <div>
                    <h3 className="font-bold text-indigo-800 dark:text-indigo-200">Resumen Estratégico</h3>
                    <p className="mt-1 text-indigo-700 dark:text-indigo-300">{analysis.strategicSummary}</p>
                </div>
            </div>
            
            <div className="space-y-4">
                {/* Review Analysis */}
                <div className="bg-white dark:bg-gray-800/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                    <h4 className="font-bold text-gray-800 dark:text-white flex items-center gap-2"><SparklesIcon className="w-5 h-5 text-cyan-500" /> Análisis de la Voz del Cliente (Reseñas)</h4>
                    <div className="mt-3 space-y-2 text-sm">
                        <div>
                            <h5 className="font-semibold text-green-600 dark:text-green-400">Puntos Positivos:</h5>
                            <ul className="list-disc list-inside ml-4 text-gray-600 dark:text-gray-300">
                                {(analysis.reviewAnalysis?.positivePoints || []).map((point: string, i: number) => <li key={i}>{point}</li>)}
                            </ul>
                        </div>
                        <div>
                            <h5 className="font-semibold text-red-600 dark:text-red-400">Áreas de Mejora:</h5>
                            <ul className="list-disc list-inside ml-4 text-gray-600 dark:text-gray-300">
                                {(analysis.reviewAnalysis?.areasForImprovement || []).map((point: string, i: number) => <li key={i}>{point}</li>)}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Visual Analysis */}
                <div className="bg-white dark:bg-gray-800/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                    <h4 className="font-bold text-gray-800 dark:text-white flex items-center gap-2"><PhotoIcon className="w-5 h-5 text-purple-500" /> Análisis Visual (Sitio Web/Imágenes)</h4>
                    <div className="mt-3 space-y-2 text-sm">
                        <p className="text-gray-600 dark:text-gray-300"><span className="font-semibold">Resumen:</span> {analysis.visualAnalysis?.summary}</p>
                        {analysis.visualAnalysis?.imageTags && analysis.visualAnalysis.imageTags.length > 0 && (
                            <div>
                                <h5 className="font-semibold text-gray-700 dark:text-gray-200">Etiquetas Visuales Clave:</h5>
                                <div className="flex flex-wrap gap-2 mt-1">
                                    {analysis.visualAnalysis.imageTags.map((tag: string, i: number) => (
                                        <span key={i} className="px-2 py-1 bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-200 text-xs font-medium rounded-full">{tag}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Online Visibility Audit */}
                {analysis.onlineVisibilityAudit && (
                    <div className="bg-white dark:bg-gray-800/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                        <h4 className="font-bold text-gray-800 dark:text-white flex items-center gap-2"><DesktopComputerIcon className="w-5 h-5 text-blue-500" /> Auditoría de Visibilidad Online</h4>
                        <div className="mt-3 space-y-2 text-sm text-gray-600 dark:text-gray-300">
                            <p><span className="font-semibold">Google Business Profile Optimizado:</span> {analysis.onlineVisibilityAudit.googleBusinessProfileOptimized ? 'Sí' : 'No'}</p>
                            <p><span className="font-semibold">Presencia en Directorios:</span> {analysis.onlineVisibilityAudit.directoryPresence}</p>
                            <p><span className="font-semibold">Gestión de Reputación:</span> {analysis.onlineVisibilityAudit.reputationManagement}</p>
                            {analysis.onlineVisibilityAudit.performanceScore !== undefined && <p><span className="font-semibold">Puntuación de Rendimiento Web:</span> {analysis.onlineVisibilityAudit.performanceScore}/100</p>}
                            {analysis.onlineVisibilityAudit.seoScore !== undefined && <p><span className="font-semibold">Puntuación SEO:</span> {analysis.onlineVisibilityAudit.seoScore}/100</p>}
                            <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-md">
                                <p className="text-blue-800 dark:text-blue-200"><span className="font-semibold">Oportunidad Clave:</span> {analysis.onlineVisibilityAudit.keyOpportunity}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Social Media Analysis */}
                {analysis.socialMediaAnalysis && (
                    <div className="bg-white dark:bg-gray-800/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                        <h4 className="font-bold text-gray-800 dark:text-white flex items-center gap-2"><ShareIcon className="w-5 h-5 text-red-500" /> Análisis de Redes Sociales</h4>
                        <div className="mt-3 space-y-2 text-sm text-gray-600 dark:text-gray-300">
                            <p><span className="font-semibold">Presencia:</span> {(analysis.socialMediaAnalysis.presence || []).join(', ') || 'No detectada'}</p>
                            <p><span className="font-semibold">Nivel de Actividad:</span> {analysis.socialMediaAnalysis.activityLevel}</p>
                            <p><span className="font-semibold">Engagement:</span> {analysis.socialMediaAnalysis.engagement}</p>
                            <div className="p-2 bg-red-50 dark:bg-red-900/30 rounded-md">
                                <p className="text-red-800 dark:text-red-200"><span className="font-semibold">Oportunidad Clave:</span> {analysis.socialMediaAnalysis.keyOpportunity}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
             <div className="flex justify-end pt-4">
                <button 
                    onClick={handleGenerate} 
                    disabled={isLoading}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 font-semibold flex items-center gap-2"
                >
                    <ArrowPathIcon className="w-5 h-5" />
                    {isLoading ? 'Regenerando...' : 'Regenerar Análisis'}
                </button>
            </div>
        </div>
    );
};
