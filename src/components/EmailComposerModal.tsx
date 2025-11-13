import React, { useState, useContext } from 'react';
import type { Lead } from '../types';
import { PaperAirplaneIcon } from './icons/PaperAirplaneIcon';
import { TTSContext } from '../contexts/TTSContext';

interface EmailComposerModalProps {
  lead: Lead;
  onSend: (content: { subject: string; body: string }) => void;
  onClose: () => void;
}

const EmailComposerModal: React.FC<EmailComposerModalProps> = ({ lead, onSend, onClose }) => {
  const [subject, setSubject] = useState(lead.contactScript?.subject || '');
  const [body, setBody] = useState(lead.contactScript?.body || '');
  const [isSending, setIsSending] = useState(false);
  const { speak } = useContext(TTSContext);

  const handleSend = async () => {
    if (!subject.trim() || !body.trim()) {
      speak("Asunto y cuerpo del mensaje no pueden estar vacíos.");
      alert("El asunto y el cuerpo del mensaje no pueden estar vacíos.");
      return;
    }

    setIsSending(true);
    speak("Enviando email.");
    try {
      await onSend({ subject, body });
      speak("Email enviado con éxito.");
      onClose();
    } catch (error) {
      console.error("Error sending email:", error);
      speak("Hubo un error al enviar el email.");
      alert("Error al enviar el email. Consulta la consola.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-800 dark:text-white">Redactar Email para {lead.name}</h3>
        <p className="text-gray-600 dark:text-gray-300 mt-1">
          Edita el guion generado por IA o escribe tu propio mensaje.
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Dirigido a: <span className="font-semibold">{lead.contactInfo?.email || 'No hay email registrado'}</span>
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Asunto</label>
          <input
            type="text"
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="mt-1 w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
            placeholder="Asunto del email"
          />
        </div>
        <div>
          <label htmlFor="body" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Cuerpo del Mensaje</label>
          <textarea
            id="body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={10}
            className="mt-1 w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
            placeholder="Cuerpo del mensaje"
          />
        </div>
      </div>

      <div className="pt-4 flex justify-end gap-3">
        <button
          onClick={onClose}
          className="px-6 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-gray-500"
        >
          Cancelar
        </button>
        <button
          onClick={handleSend}
          disabled={isSending || !lead.contactInfo?.email}
          className="flex items-center gap-2 px-6 py-2 bg-cyan-600 text-white font-bold rounded-md hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed"
          title={!lead.contactInfo?.email ? "El cliente no tiene un email guardado" : ""}
        >
          <PaperAirplaneIcon className="w-5 h-5" strokeWidth={2} />
          {isSending ? 'Enviando...' : 'Enviar Email'}
        </button>
      </div>
    </div>
  );
};

export default EmailComposerModal;
