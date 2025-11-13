import React, { useState, useEffect, useCallback, useContext } from 'react';
import type { CompetitorAnalysis, Lead } from '../types';
import { ShieldCheckIcon } from './icons/ShieldCheckIcon';
import { LightBulbIcon } from './icons/LightBulbIcon';
import { performCompetitorAnalysis } from '../services/geminiService';
import { TTSContext } from '../contexts/TTSContext';
import type { TTSContextType } from '../contexts/TTSContext';


interface CompetitorAnalysisModalProps {
  lead: Lead;
  onAnalysisComplete: (analysis: CompetitorAnalysis) => void;
  onDeductCredits: (amount: number) => Promise<boolean>;
  userApiKey: string; // New: User's API key
}

const LoadingState: React.FC = () => (
    <div className="p-8 text-center animate-pulse">
        <ShieldCheckIcon className="w-16 h-16 mx-auto text-indigo-600 dark:text-yellow-500" />
        <h3 className="mt-4 text-xl font-bold text-gray-800 dark:text-white">Analizando Competencia...</h3>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
            La IA está investigando el mercado para darte una ventaja estratégica.
        </p>
    </div>
);

// FIX: Changed to named export
export const CompetitorAnalysisModal: React.FC<CompetitorAnalysisModalProps> = ({ lead, onAnalysisComplete, onDeductCredits, userApiKey }) => {
    const [analysis, setAnalysis] = useState<CompetitorAnalysis | null>(lead.competitorAnalysis || null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { speak } = useContext(TTSContext) as TTSContextType;

    const handleGenerate = useCallback(async () => {
        if (!await onDeductCredits(2)) { // Cost for competitor analysis
            speak("Créditos insuficientes para realizar un análisis de competencia.");
            return;
        } 
        setIsLoading(true);
        setError(null);
        speak(`Analizando la competencia para ${lead.name}.`);
        try {
            const newAnalysis = await performCompetitorAnalysis(lead, userApiKey); // Pass userApiKey
            setAnalysis(newAnalysis);
            onAnalysisComplete(newAnalysis);
            speak("Análisis de competencia completado.");
        } catch (err: any) {
            setError(err.message || 'Ocurrió un error desconocido.');
            speak("Hubo un error al analizar la competencia.");
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
    if (!analysis) return <div className="p-6 text-center">No se pudo generar el análisis.</div>;

    return (
        <div className="p-6 space-y-6">
            <div className="p-4 bg-indigo-50 dark:bg-indigo-900/50 border-l-4 border-indigo-500 rounded-r-lg flex items-start gap-3">
                <LightBulbIcon className="w-6 h-6 text-indigo-500 flex-shrink-0 mt-1" />
                <div>
                    <h3 className="font-bold text-indigo-800 dark:text-indigo-200">Tu Ventaja Estratégica</h3>
                    <p className="mt-1 text-indigo-700 dark:text-indigo-300">{analysis.strategicAdvantage}</p>
                </div>
            </div>
            
            <div className="space-y-4">
                {analysis.competitors.map((competitor, index: number) => ( // Explicitly type index
                    <div key={index} className="bg-white dark:bg-gray-800/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                        <h4 className="font-bold text-gray-800 dark:text-white">{competitor.name}</h4>
                        <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                            <div>
                                <h5 className="font-semibold text-green-600 dark:text-green-400">Fortaleza</h5>
                                <p className="text-gray-600 dark:text-gray-300">{competitor.strength}</p>
                            </div>
                            <div>
                                <h5 className="font-semibold text-red-600 dark:text-red-400">Debilidad</h5>
                                <p className="text-gray-600 dark:text-gray-300">{competitor.weakness}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
             <div className="flex justify-end pt-4">
                <button 
                    onClick={handleGenerate} 
                    disabled={isLoading}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 font-semibold"
                >
                    {isLoading ? 'Regenerando...' : 'Regenerar Análisis'}
                </button>
            </div>
        </div>
    );
};