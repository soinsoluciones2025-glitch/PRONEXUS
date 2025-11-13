import React, { useState, useEffect, useCallback, useContext } from 'react';
import type { InterviewPrep, Job, UserCVInfo } from '../types';
import { AcademicCapIcon } from './icons/AcademicCapIcon';
import { LightBulbIcon } from './icons/LightBulbIcon';
import { generateInterviewPrep } from '../services/geminiService';
import { TTSContext } from '../contexts/TTSContext';
import type { TTSContextType } from '../contexts/TTSContext';


interface InterviewPrepModalProps {
  job: Job;
  userInfo: UserCVInfo;
  onPrepGenerated: (prep: InterviewPrep) => void;
  onDeductCredits: (amount: number) => Promise<boolean>;
  userApiKey: string; // New: User's API key
}

export const InterviewPrepModal: React.FC<InterviewPrepModalProps> = ({ job, userInfo, onPrepGenerated, onDeductCredits, userApiKey }) => {
  const [prep, setPrep] = useState<InterviewPrep | null>(job.interviewPrep || null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { speak } = useContext(TTSContext) as TTSContextType;

  const handleGenerate = useCallback(async () => {
    const deductionSuccessful = await onDeductCredits(1);
    if (!deductionSuccessful) {
        speak("Créditos insuficientes para generar la preparación de entrevista.");
        return;
    }
    setIsLoading(true);
    setError(null);
    speak(`Generando preparación de entrevista para ${job.jobTitle ?? ''}.`);
    try {
      const newPrep = await generateInterviewPrep(job, userInfo, userApiKey); // Pass userApiKey
      setPrep(newPrep);
      onPrepGenerated(newPrep);
      speak("Preparación de entrevista generada con éxito.");
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error desconocido.');
      speak("Hubo un error al generar la preparación de entrevista.");
    } finally {
      setIsLoading(false);
    }
  }, [job, userInfo, onPrepGenerated, onDeductCredits, userApiKey, speak]);

  useEffect(() => {
    if (!prep) {
      handleGenerate();
    }
  }, [prep, handleGenerate]);

  const renderLoading = () => (
    <div className="text-center p-8 animate-pulse">
        <AcademicCapIcon className="w-12 h-12 mx-auto text-green-500" />
        <p className="mt-4 text-lg font-semibold text-gray-700 dark:text-gray-300">Preparando tu entrevista...</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">La IA está compilando preguntas y estrategias para el éxito.</p>
    </div>
  );

  const renderError = () => (
    <div className="text-center p-8">
      <p className="text-red-500">{error}</p>
      <button onClick={handleGenerate} className="mt-4 px-4 py-2 bg-cyan-600 text-white rounded-md">Reintentar</button>
    </div>
  );
  
  const renderPrep = () => (
    prep && (
      <div className="space-y-6">
        <div className="p-4 bg-green-50 dark:bg-green-900/50 border-l-4 border-green-500 rounded-r-lg">
            <h3 className="font-bold text-green-800 dark:text-green-200">Declaración de Cierre Clave</h3>
            <p className="mt-1 text-green-700 dark:text-green-300">{prep.closingStatement}</p>
        </div>

        <div className="bg-gray-100 dark:bg-gray-900/50 p-4 rounded-lg space-y-4">
          <div>
            <h3 className="text-sm font-bold text-gray-800 dark:text-white uppercase tracking-wider">Preguntas Comunes (HR)</h3>
            <ul className="list-disc list-inside mt-2 text-gray-700 dark:text-gray-300 space-y-1">
                {prep.commonQuestions.map((q: string, i: number) => <li key={i}>{q}</li>)}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-800 dark:text-white uppercase tracking-wider">Preguntas Técnicas</h3>
            <ul className="list-disc list-inside mt-2 text-gray-700 dark:text-gray-300 space-y-1">
                {prep.technicalQuestions.map((q: string, i: number) => <li key={i}>{q}</li>)}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-800 dark:text-white uppercase tracking-wider">Preguntas de Comportamiento (Método STAR)</h3>
            <ul className="list-disc list-inside mt-2 text-gray-700 dark:text-gray-300 space-y-1">
                {prep.behavioralQuestions.map((q: string, i: number) => <li key={i}>{q}</li>)}
            </ul>
          </div>
        </div>
        <div className="flex justify-end">
            <button onClick={handleGenerate} disabled={isLoading} className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 font-semibold rounded-md transition-colors"
                >
                <LightBulbIcon className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                Regenerar Preparación
            </button>
        </div>
      </div>
    )
  );

  return (
    <div className="p-6">
        {isLoading && !prep ? renderLoading() : error ? renderError() : renderPrep()}
    </div>
  );
};
