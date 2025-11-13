import React, { useContext } from 'react';
import type { MarketAnalysis } from '../types';
import { ChartPieIcon } from './icons/ChartPieIcon';
import { LightBulbIcon } from './icons/LightBulbIcon';
import { TTSContext } from '../contexts/TTSContext';

interface MarketAnalysisModalProps {
  analysis: MarketAnalysis | null;
  isLoading: boolean;
}

const LoadingState: React.FC = () => (
    <div className="p-8 text-center animate-pulse">
        <ChartPieIcon className="w-16 h-16 mx-auto text-cyan-500" />
        <h3 className="mt-4 text-xl font-bold text-gray-800 dark:text-white">Analizando el Mercado...</h3>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
            La IA está evaluando el nicho de mercado en tu área. Esto puede tardar unos segundos.
        </p>
    </div>
);

const AnalysisSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => {
    return (
        <div className="bg-white dark:bg-gray-800/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <h4 className="font-bold text-indigo-700 dark:text-indigo-300 mb-2">{title}</h4>
            <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                {children}
            </div>
        </div>
    );
};

const MarketAnalysisModal: React.FC<MarketAnalysisModalProps> = ({ analysis, isLoading }) => {
    const { speak } = useContext(TTSContext); // Keep speak here for explicit hover/focus feedback

    if (isLoading) return <LoadingState />;
    if (!analysis) return <div className="p-6 text-center text-red-500">No se pudo generar el análisis de mercado.</div>;

    return (
        <div className="p-6 space-y-6">
            <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white" onMouseEnter={() => speak("Inteligencia de Mercado")}>Inteligencia de Mercado</h3>
                <p className="mt-1 text-gray-600 dark:text-gray-400" onMouseEnter={() => speak(`Tamaño estimado del mercado: ${analysis.marketSize}`)}>Tamaño estimado del mercado: <span className="font-semibold">{analysis.marketSize}</span></p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AnalysisSection title="Fortalezas Comunes">
                    <ul className="list-disc list-inside">
                        {analysis.keyStrengths.map((s, i) => <li key={i} onMouseEnter={() => speak(s)}>{s}</li>)}
                    </ul>
                </AnalysisSection>

                <AnalysisSection title="Debilidades / Puntos de Dolor Comunes">
                     <ul className="list-disc list-inside">
                        {analysis.commonWeaknesses.map((w, i) => <li key={i} onMouseEnter={() => speak(w)}>{w}</li>)}
                    </ul>
                </AnalysisSection>
            </div>
            
            <AnalysisSection title="Necesidades No Cubiertas">
                <ul className="list-disc list-inside">
                    {analysis.unmetNeeds.map((n, i) => <li key={i} onMouseEnter={() => speak(n)}>{n}</li>)}
                </ul>
            </AnalysisSection>
            
            <div className="p-4 bg-indigo-50 dark:bg-indigo-900/50 border-l-4 border-indigo-500 rounded-r-lg flex items-start gap-3">
                <LightBulbIcon className="w-6 h-6 text-indigo-500 flex-shrink-0 mt-1" />
                <div>
                    <h3 className="font-bold text-indigo-800 dark:text-indigo-200" onMouseEnter={() => speak("Tu Oportunidad Estratégica")}>Tu Oportunidad Estratégica</h3>
                    <p className="mt-1 text-indigo-700 dark:text-indigo-300" onMouseEnter={() => speak(analysis.strategicOpportunities)}>{analysis.strategicOpportunities}</p>
                </div>
            </div>
        </div>
    );
};

export default MarketAnalysisModal;