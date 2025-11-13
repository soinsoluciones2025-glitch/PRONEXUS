import React, { useState, useEffect, useCallback, useContext } from 'react';
import type { Job, CV, UserCVInfo } from '../types';
import { generateCV } from '../services/geminiService';
import { ClipboardIcon } from './icons/ClipboardIcon'; 
import { CheckIcon } from './icons/CheckIcon'; 
import { ArrowPathIcon } from './icons/ArrowPathIcon'; 
import { DocumentTextIcon } from './icons/DocumentTextIcon'; 
import { TTSContext } from '../contexts/TTSContext';

interface CVModalProps {
  job: Job;
  userInfo: UserCVInfo;
  onSave: (cv: CV) => void;
  onDeductCredits: (amount: number) => Promise<boolean>;
  userApiKey: string; // New: User's API key
}

// FIX: Changed to a named export and explicitly typed as React.FC
export const CVModal: React.FC<CVModalProps> = ({ job, userInfo, onSave, onDeductCredits, userApiKey }) => {
  const [cv, setCv] = useState<CV | null>(job.cv || null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const { speak } = useContext(TTSContext);

  const handleGenerate = useCallback(async () => {
    const deductionSuccessful = await onDeductCredits(1);
    if (!deductionSuccessful) {
        speak("Créditos insuficientes para generar el CV.");
        return;
    }
    setIsLoading(true);
    setError(null);
    speak(`Generando CV adaptado para ${job.jobTitle ?? ''}.`); // Add nullish coalescing
    try {
      const newCv = await generateCV(job, userInfo, userApiKey); // Pass userApiKey
      setCv(newCv);
      onSave(newCv);
      speak("CV generado con éxito.");
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error desconocido.');
      speak("Hubo un error al generar el CV.");
    } finally {
      setIsLoading(false);
    }
  }, [job, userInfo, onSave, onDeductCredits, userApiKey, speak]); 

  useEffect(() => {
    if (!cv) {
      handleGenerate();
    }
  }, [cv, handleGenerate]);

  const handleCopyToClipboard = () => {
    if (!cv) return;
    const textToCopy = `
## Resumen Profesional
${cv.summary}

## Habilidades Clave
- ${cv.highlightedSkills.join('\n- ')}

## Experiencia Relevante
${cv.tailoredExperience.map(exp => `
### ${exp.title} en ${exp.company}
${exp.description}
`).join('\n')}
    `;
    navigator.clipboard.writeText(textToCopy.trim());
    setIsCopied(true);
    speak("CV copiado al portapapeles.");
    setTimeout(() => setIsCopied(false), 2000);
  };

  const renderLoading = () => (
    <div className="text-center p-8 animate-pulse">
        <DocumentTextIcon className="w-12 h-12 mx-auto text-yellow-500" strokeWidth={2} />
        <p className="mt-4 text-lg font-semibold text-gray-700 dark:text-gray-300">Creando un CV a medida...</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">La IA está adaptando tu experiencia a la oferta de trabajo.</p>
    </div>
  );

  const renderError = () => (
    <div className="text-center p-8">
      <p className="text-red-500">{error}</p>
      <button onClick={handleGenerate} className="mt-4 px-4 py-2 bg-cyan-600 text-white rounded-md">Reintentar</button>
    </div>
  );
  
  const renderCV = () => (
    cv && (
      <div className="space-y-6">
        <div className="bg-gray-100 dark:bg-gray-900/50 p-4 rounded-lg space-y-4">
          <div>
            <h3 className="text-sm font-bold text-gray-800 dark:text-white uppercase tracking-wider">Resumen Profesional Adaptado</h3>
            <p className="mt-1 text-gray-700 dark:text-gray-300">{cv.summary}</p>
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-800 dark:text-white uppercase tracking-wider">Habilidades Destacadas</h3>
            <div className="flex flex-wrap gap-2 mt-2">
                {cv.highlightedSkills.map((skill, i) => (
                    <span key={i} className="px-2 py-1 bg-cyan-100 dark:bg-cyan-900/70 text-cyan-800 dark:text-cyan-200 text-xs font-semibold rounded-full">{skill}</span>
                ))}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-800 dark:text-white uppercase tracking-wider">Experiencia Relevante Reescrita</h3>
            {cv.tailoredExperience.map((exp, i) => (
                <div key={i} className="mt-2">
                    <h4 className="font-semibold text-gray-700 dark:text-gray-200">{exp.title} en {exp.company}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{exp.description}</p>
                </div>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-2 justify-end">
          <button onClick={handleGenerate} disabled={isLoading} className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 font-semibold rounded-md transition-colors"
            >
            <ArrowPathIcon className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} strokeWidth={2} />
            Regenerar
          </button>
          <button onClick={handleCopyToClipboard} className="flex items-center gap-2 px-3 py-2 text-sm bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-md transition-colors"
            >
            {isCopied ? <CheckIcon className="w-4 h-4" strokeWidth={2}/> : <ClipboardIcon className="w-4 h-4" strokeWidth={2} />}
            {isCopied ? 'Copiado' : 'Copiar CV'}
          </button>
        </div>
      </div>
    )
  );

  return (
    <div className="p-6">
        {isLoading && !cv ? renderLoading() : error ? renderError() : renderCV()}
    </div>
  );
};
