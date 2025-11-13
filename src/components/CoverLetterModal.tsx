import React, { useState, useEffect, useCallback, useContext } from 'react';
import type { Job, CoverLetter, UserCVInfo } from '../types';
import { generateCoverLetter } from '../services/geminiService';
import { ClipboardIcon } from './icons/ClipboardIcon'; 
import { CheckIcon } from './icons/CheckIcon'; 
import { ArrowPathIcon } from './icons/ArrowPathIcon'; 
import { EnvelopeIcon } from './icons/EnvelopeIcon'; 
import { TTSContext } from '../contexts/TTSContext';

interface CoverLetterModalProps {
  job: Job;
  userInfo: UserCVInfo;
  onSave: (coverLetter: CoverLetter) => void;
  onDeductCredits: (amount: number) => Promise<boolean>;
  userApiKey: string; // New: User's API key
}

const CoverLetterModal: React.FC<CoverLetterModalProps> = ({ job, userInfo, onSave, onDeductCredits, userApiKey }) => {
  const [coverLetter, setCoverLetter] = useState<CoverLetter | null>(job.coverLetter || null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const { speak } = useContext(TTSContext);

  const handleGenerate = useCallback(async () => {
    const deductionSuccessful = await onDeductCredits(1);
    if (!deductionSuccessful) {
        speak("Créditos insuficientes para generar la carta de presentación.");
        return;
    }
    setIsLoading(true);
    setError(null);
    speak(`Generando carta de presentación para ${job.jobTitle ?? ''}.`); // Add nullish coalescing
    try {
      const newCoverLetter = await generateCoverLetter(job, userInfo, userApiKey); // Pass userApiKey
      setCoverLetter(newCoverLetter);
      onSave(newCoverLetter);
      speak("Carta de presentación generada con éxito.");
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error desconocido.');
      speak("Hubo un error al generar la carta de presentación.");
    } finally {
      setIsLoading(false);
    }
  }, [job, userInfo, onSave, onDeductCredits, userApiKey, speak]); 

  useEffect(() => {
    if (!coverLetter) {
      handleGenerate();
    }
  }, [coverLetter, handleGenerate]);

  const handleCopyToClipboard = () => {
    if (!coverLetter) return;
    const textToCopy = `Asunto: ${coverLetter.subject}\n\n${coverLetter.body}`;
    navigator.clipboard.writeText(textToCopy.trim());
    setIsCopied(true);
    speak("Carta de presentación copiada al portapapeles.");
    setTimeout(() => setIsCopied(false), 2000);
  };

  const renderLoading = () => (
    <div className="text-center p-8 animate-pulse">
        <EnvelopeIcon className="w-12 h-12 mx-auto text-yellow-500" strokeWidth={2} />
        <p className="mt-4 text-lg font-semibold text-gray-700 dark:text-gray-300">Redactando una carta de presentación...</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">La IA está creando un mensaje personalizado para destacar tu perfil.</p>
    </div>
  );

  const renderError = () => (
    <div className="text-center p-8">
      <p className="text-red-500">{error}</p>
      <button onClick={handleGenerate} className="mt-4 px-4 py-2 bg-cyan-600 text-white rounded-md">Reintentar</button>
    </div>
  );
  
  const renderCoverLetter = () => (
    coverLetter && (
      <div className="space-y-6">
        <div className="bg-gray-100 dark:bg-gray-900/50 p-4 rounded-lg space-y-4">
          <div>
            <h3 className="text-sm font-bold text-gray-800 dark:text-white uppercase tracking-wider">Asunto:</h3>
            <p className="mt-1 text-gray-700 dark:text-gray-200 font-semibold">{coverLetter.subject}</p>
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-800 dark:text-white uppercase tracking-wider">Cuerpo del Mensaje:</h3>
            <p className="mt-1 text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{coverLetter.body}</p>
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
            {isCopied ? 'Copiado' : 'Copiar Texto'}
          </button>
        </div>
      </div>
    )
  );

  return (
    <div className="p-6">
        {isLoading && !coverLetter ? renderLoading() : error ? renderError() : renderCoverLetter()}
    </div>
  );
};

export default CoverLetterModal;
