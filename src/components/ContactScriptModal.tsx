import React, { useState, useEffect, useCallback, useContext } from 'react';
import type { Lead, ContactScript, ScriptTone, ScriptFocus } from '../types'; // Removed unused ReplyAnalysis
import { generateContactScript } from '../services/geminiService';
import { SparklesIcon } from './icons/SparklesIcon'; 
import { ClipboardIcon } from './icons/ClipboardIcon'; 
import { CheckIcon } from './icons/CheckIcon'; 
import { EnvelopeIcon } from './icons/EnvelopeIcon'; 
import { ArrowPathIcon } from './icons/ArrowPathIcon'; 
import { TTSContext } from '../contexts/TTSContext';

interface ContactScriptModalProps {
  lead: Lead;
  onDeductCredits: (amount: number) => Promise<boolean>;
  onScriptGenerated: (script: ContactScript) => void;
  onOpenEmailComposer: () => void; 
  userApiKey: string; // New: User's API key
}

const ContactScriptModal: React.FC<ContactScriptModalProps> = ({ 
    lead, onScriptGenerated, onOpenEmailComposer, onDeductCredits, userApiKey 
}) => {
  const [script, setScript] = useState<ContactScript | null>(lead.contactScript || null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tone, setTone] = useState<ScriptTone>('amigable');
  const [focus, setFocus] = useState<ScriptFocus>('valor');
  const [isCopied, setIsCopied] = useState(false);
  const { speak } = useContext(TTSContext);

  // Define isReplyContext based on whether a reply analysis exists
  const isReplyContext = !!lead.replyAnalysis;

  const handleGenerate = useCallback(async () => {
    // Correctly call onDeductCredits and handle its return value
    const deductionSuccessful = await onDeductCredits(1);
    if (!deductionSuccessful) {
        speak("Créditos insuficientes para generar un guion de contacto.");
        return;
    }
    setIsLoading(true);
    setError(null);
    speak(`Generando guion de contacto para ${lead.name ?? ''}.`); // Add nullish coalescing
    try {
      // FIX: The generateContactScript service now returns a full ContactScript object, which matches the expected type.
      const newScript = await generateContactScript(lead, tone, focus, userApiKey, isReplyContext ? lead.replyAnalysis : undefined); // Pass userApiKey
      setScript(newScript);
      onScriptGenerated(newScript);
      speak("Guion de contacto generado con éxito.");
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error desconocido.');
      speak("Hubo un error al generar el guion de contacto.");
    } finally {
      setIsLoading(false);
    }
  }, [lead, tone, focus, onScriptGenerated, onDeductCredits, userApiKey, isReplyContext, speak]); 

  useEffect(() => {
    // If no script is currently loaded, generate one.
    // The generation logic in handleGenerate will use the latest lead.replyAnalysis based on isReplyContext.
    if (!script) {
      handleGenerate();
    }
  }, [script, handleGenerate]); 

  const handleCopyToClipboard = () => {
    if (!script) return;
    const textToCopy = `Asunto: ${script.subject}\n\n${script.body}`;
    navigator.clipboard.writeText(textToCopy);
    setIsCopied(true);
    speak("Copiado al portapapeles.");
    setTimeout(() => setIsCopied(false), 2000);
  };
  
  const handleOpenComposer = () => {
      if(script) {
          onOpenEmailComposer();
      }
  }

  const renderLoading = () => (
    <div className="text-center p-8 animate-pulse">
        <SparklesIcon className="w-12 h-12 mx-auto text-cyan-500" strokeWidth={2} />
        <p className="mt-4 text-lg font-semibold text-gray-700 dark:text-gray-300">Creando un mensaje impactante...</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">La IA está analizando los datos para crear el mejor guion.</p>
    </div>
  );

  const renderError = () => (
    <div className="text-center p-8">
      <p className="text-red-500">{error}</p>
      <button onClick={handleGenerate} className="mt-4 px-4 py-2 bg-cyan-600 text-white rounded-md">Reintentar</button>
    </div>
  );
  
  const renderReplyContext = () => {
      if (!isReplyContext || !lead.replyAnalysis) return null;
      
      const sentimentColors = {
          positivo: 'border-green-500 bg-green-50 dark:bg-green-900/50',
          neutral: 'border-gray-500 bg-gray-50 dark:bg-gray-700/50',
          negativo: 'border-red-500 bg-red-50 dark:bg-red-900/50',
      };
      
      return (
          <div className={`p-4 rounded-lg border-l-4 mb-4 ${sentimentColors[lead.replyAnalysis.sentiment]}`}>
              <h4 className="font-bold text-sm text-gray-800 dark:text-white">Contexto de la Respuesta del Cliente:</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 italic" >"{lead.replyAnalysis.summary}"</p>
              <p className="text-sm text-gray-700 dark:text-gray-200 mt-2"><span className="font-semibold">Siguiente Paso Sugerido por IA:</span> <span>{lead.replyAnalysis.suggestedNextStep}</span></p>
          </div>
      )
  }

  const renderScript = () => (
    script && (
      <div className="space-y-6">
        {renderReplyContext()}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="text-sm font-semibold text-gray-600 dark:text-gray-300">Tono</label>
            <select value={tone} onChange={(e) => {setTone(e.target.value as ScriptTone);}} className="mt-1 w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-sm text-gray-800 dark:text-white"
                >
              <option value="amigable">Amigable</option>
              <option value="formal">Formal</option>
              <option value="directo">Directo</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="text-sm font-semibold text-gray-600 dark:text-gray-300">Enfoque</label>
            <select value={focus} onChange={(e) => {setFocus(e.target.value as ScriptFocus);}} className="mt-1 w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-sm text-gray-800 dark:text-white"
                >
              <option value="valor">Valor</option>
              <option value="precio">Precio</option>
              <option value="urgencia">Urgencia</option>
            </select>
          </div>
        </div>
        <div className="bg-gray-100 dark:bg-gray-900/50 p-4 rounded-lg space-y-4">
          <div>
            <h3 className="text-sm font-bold text-gray-800 dark:text-white uppercase tracking-wider">Asunto:</h3>
            <p className="mt-1 text-gray-700 dark:text-gray-200 font-semibold">{script.subject}</p>
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-800 dark:text-white uppercase tracking-wider">Cuerpo del Mensaje:</h3>
            <p className="mt-1 text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{script.body}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 justify-end">
          <button onClick={handleGenerate} disabled={isLoading} className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 font-semibold rounded-md transition-colors"
            >
            <ArrowPathIcon className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} strokeWidth={2} />
            Regenerar
          </button>
          <button onClick={handleCopyToClipboard} className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 font-semibold rounded-md transition-colors"
            >
            {isCopied ? <CheckIcon className="w-4 h-4 text-green-500" strokeWidth={2}/> : <ClipboardIcon className="w-4 h-4" strokeWidth={2} />}
            {isCopied ? 'Copiado' : 'Copiar'}
          </button>
          <button 
            onClick={handleOpenComposer}
            disabled={!lead.contactInfo?.email}
            title={!lead.contactInfo?.email ? "El cliente no tiene un email guardado" : "Abrir borrador de email"}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-md transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
            <EnvelopeIcon className="w-4 h-4" strokeWidth={2} />
            Contactar
          </button>
        </div>
      </div>
    )
  );

  return (
    <div className="p-6">
      {isLoading && !script ? renderLoading() : error ? renderError() : renderScript()}
    </div>
  );
};

export default ContactScriptModal;