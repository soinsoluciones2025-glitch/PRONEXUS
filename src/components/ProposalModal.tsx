import React, { useState, useEffect, useCallback, useContext } from 'react';
import type { Proposal, Lead } from '../types';
import { generateProposal } from '../services/geminiService';
import { ClipboardIcon } from './icons/ClipboardIcon';
import { CheckIcon } from './icons/CheckIcon';
import { ArrowPathIcon } from './icons/ArrowPathIcon';
import { DocumentCheckIcon } from './icons/DocumentCheckIcon';
import { TTSContext } from '../contexts/TTSContext';
import type { TTSContextType } from '../contexts/TTSContext';

interface ProposalModalProps {
  lead: Lead;
  onProposalGenerated: (proposal: Proposal) => void;
  onDeductCredits: (amount: number) => Promise<boolean>;
  userApiKey: string; // New: User's API key
}

const ProposalModal: React.FC<ProposalModalProps> = ({ lead, onProposalGenerated, onDeductCredits, userApiKey }) => {
  const [proposal, setProposal] = useState<Proposal | null>(lead.proposal || null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const { speak } = useContext(TTSContext) as TTSContextType;

  const handleGenerate = useCallback(async () => {
    if (!lead.deepDiveAnalysis) {
        setError("Se necesita un Diagnóstico 360° para generar una propuesta. Por favor, genéralo primero desde la tarjeta del cliente.");
        speak("Error: se necesita un diagnóstico 360 grados para generar una propuesta.");
        return;
    }
    const deductionSuccessful = await onDeductCredits(3); // Cost for proposal generation
    if (!deductionSuccessful) {
        speak("Créditos insuficientes para generar una propuesta.");
        return;
    }
    
    setIsLoading(true);
    setError(null);
    speak(`Generando propuesta para ${lead.name}.`);
    try {
      const newProposal = await generateProposal(lead, userApiKey); // Pass userApiKey
      setProposal(newProposal);
      onProposalGenerated(newProposal);
      speak("Propuesta generada con éxito.");
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error desconocido.');
      speak("Hubo un error al generar la propuesta.");
    } finally {
      setIsLoading(false);
    }
  }, [lead, onProposalGenerated, onDeductCredits, userApiKey, speak]);

  useEffect(() => {
    if (!proposal) {
      handleGenerate();
    }
  }, [proposal, handleGenerate]);

  const handleCopyToClipboard = () => {
    if (!proposal) return;
    const textToCopy = `
# Propuesta para ${lead.name}

## Introducción
${proposal.introduction}

## Solución Propuesta
${proposal.solution}

## Inversión y Valor
${proposal.investment}

## Próximos Pasos
${proposal.nextSteps}
    `;
    navigator.clipboard.writeText(textToCopy.trim());
    setIsCopied(true);
    speak("Propuesta copiada al portapapeles.");
    setTimeout(() => setIsCopied(false), 2000);
  };

  const renderLoading = () => (
    <div className="text-center p-8 animate-pulse">
        <DocumentCheckIcon className="w-12 h-12 mx-auto text-green-500" strokeWidth={2} />
        <p className="mt-4 text-lg font-semibold text-gray-700 dark:text-gray-300">Construyendo una propuesta ganadora...</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">La IA está utilizando el Diagnóstico 360° para crear una oferta irresistible.</p>
    </div>
  );

  const renderError = () => (
    <div className="text-center p-8">
      <p className="text-red-500">{error}</p>
      <button onClick={handleGenerate} className="mt-4 px-4 py-2 bg-cyan-600 text-white rounded-md">Reintentar</button>
    </div>
  );
  
  const renderProposal = () => (
    proposal && (
      <div className="space-y-6">
        <div className="bg-gray-100 dark:bg-gray-900/50 p-4 rounded-lg space-y-4">
          <div>
            <h3 className="text-sm font-bold text-gray-800 dark:text-white uppercase tracking-wider">Introducción</h3>
            <p className="mt-1 text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{proposal.introduction}</p>
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-800 dark:text-white uppercase tracking-wider">Solución Propuesta</h3>
            <p className="mt-1 text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{proposal.solution}</p>
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-800 dark:text-white uppercase tracking-wider">Inversión y Valor</h3>
            <p className="mt-1 text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{proposal.investment}</p>
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-800 dark:text-white uppercase tracking-wider">Próximos Pasos</h3>
            <p className="mt-1 text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{proposal.nextSteps}</p>
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
            {isCopied ? 'Copiado' : 'Copiar Propuesta'}
          </button>
        </div>
      </div>
    )
  );

  return (
    <div className="p-6">
        {isLoading && !proposal ? renderLoading() : error ? renderError() : renderProposal()}
    </div>
  );
};

export default ProposalModal;