import React, { useState, useContext, useEffect } from 'react';
import type { User, UserCVInfo } from '../types';
import { TTSContext } from '../contexts/TTSContext'; 
import { ToggleSwitch } from './ToggleSwitch';
import { UserCircleIcon } from './icons/UserCircleIcon';
import { IdentificationIcon } from './icons/IdentificationIcon';
import { SpeakerWaveIcon } from './icons/SpeakerWaveIcon';
import { LanguageIcon } from './icons/LanguageIcon';
import { KeyIcon } from './icons/KeyIcon';
import { EyeIcon } from './icons/EyeIcon';
import { EyeSlashIcon } from './icons/EyeSlashIcon';
import { ArrowTopRightOnSquareIcon } from './icons/ArrowTopRightOnSquareIcon';


interface SettingsProps {
  user: User;
  onUpdateUser: (updates: Partial<User>) => Promise<void>;
  onClose: () => void; // This prop is used directly
}

const Settings: React.FC<SettingsProps> = ({ user, onUpdateUser, onClose: _onClose }) => { // Marked onClose as unused locally
  const [name, setName] = useState(user.name);
  const [whatsAppNumber, setWhatsAppNumber] = useState(user.whatsAppNumber || '');
  const [userCVInfo, setUserCVInfo] = useState<UserCVInfo>(user.userCVInfo ?? {}); // Ensure initialization
  const [apiKey, setApiKey] = useState(user.apiKey || '');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const tts = useContext(TTSContext);

  const handleCvInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setUserCVInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    const updates: Partial<User> = {
      name,
      whatsAppNumber: whatsAppNumber.trim() || undefined, // Store as undefined if empty
      userCVInfo,
      apiKey: apiKey.trim() || undefined,
    };
    try {
      await onUpdateUser(updates);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Error al guardar los ajustes.");
    } finally {
      setIsSaving(false);
    }
  };
  
  // Debounced update for TTS settings to avoid excessive re-renders (if TTS settings were saved to DB)
  // Currently, TTS settings are saved to localStorage in useTTS hook itself, so this useEffect is not strictly needed for saving.
  // It's kept here as a placeholder for potential future DB saving.
  useEffect(() => { // This useEffect is actually used
    const handler = setTimeout(() => {
        // Example: if you wanted to save TTS settings to user profile in DB:
        // onUpdateUser({ ttsSettings: { volume: tts.volume, rate: tts.rate, pitch: tts.pitch, selectedVoiceURI: tts.selectedVoiceURI } });
    }, 500);

    return () => {
        clearTimeout(handler);
    };
  }, [tts.volume, tts.rate, tts.pitch, tts.selectedVoiceURI, onUpdateUser]); 

  return (
    <div className="p-6 space-y-8">
      {/* API Key Section */}
      <section>
        <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2"><KeyIcon className="w-6 h-6"/> Clave de API de Google AI</h3>
        <div className="mt-4 p-4 bg-slate-100 dark:bg-gray-900/50 rounded-lg border border-slate-200 dark:border-gray-700 space-y-3">
            <p className="text-sm text-gray-600 dark:text-gray-300">
                Tu clave personal de API es necesaria para todas las funciones de inteligencia artificial. Se guarda de forma segura y nunca se comparte.
            </p>
            <div>
                <label htmlFor="api-key" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tu Clave de API</label>
                <div className="relative mt-1">
                    <input 
                        type={showApiKey ? 'text' : 'password'} 
                        id="api-key" 
                        value={apiKey} 
                        onChange={(e) => setApiKey(e.target.value)} 
                        placeholder="Ingresa tu clave de API aquí"
                        className="w-full p-2 pr-10 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                    />
                    <button 
                        type="button"
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                        title={showApiKey ? "Ocultar clave" : "Mostrar clave"}
                    >
                        {showApiKey ? <EyeSlashIcon className="w-5 h-5"/> : <EyeIcon className="w-5 h-5"/>}
                    </button>
                </div>
            </div>
            <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 w-full text-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-cyan-700 bg-cyan-100 hover:bg-cyan-200 dark:text-cyan-200 dark:bg-cyan-800/50 dark:hover:bg-cyan-800"
            >
                Obtener una Clave de API en Google AI Studio
                <ArrowTopRightOnSquareIcon className="w-4 h-4" />
            </a>
        </div>
      </section>

      {/* Profile Section */}
      <section>
        <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2"><UserCircleIcon className="w-6 h-6"/> Perfil de Usuario</h3>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre Completo</label>
            <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"/>
          </div>
          <div>
            <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Número de WhatsApp (con cód. país)</label>
            <input type="tel" id="whatsapp" value={whatsAppNumber} onChange={(e) => setWhatsAppNumber(e.target.value)} placeholder="Ej: 5491122334455" className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"/>
          </div>
        </div>
      </section>

      {/* CV Info Section */}
      <section>
        <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2"><IdentificationIcon className="w-6 h-6"/> Información para CV y Propuestas</h3>
        <div className="mt-4 space-y-4">
            <div>
                <label htmlFor="professionalSummary" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Resumen Profesional</label>
                <textarea id="professionalSummary" name="professionalSummary" value={userCVInfo.professionalSummary || ''} onChange={handleCvInfoChange} rows={3} className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"></textarea>
            </div>
             <div>
                <label htmlFor="workExperience" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Experiencia Laboral</label>
                <textarea id="workExperience" name="workExperience" value={userCVInfo.workExperience || ''} onChange={handleCvInfoChange} rows={4} className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"></textarea>
            </div>
             <div>
                <label htmlFor="skills" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Habilidades (separadas por comas)</label>
                <input type="text" id="skills" name="skills" value={userCVInfo.skills || ''} onChange={handleCvInfoChange} className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"/>
            </div>
        </div>
      </section>

      {/* TTS Section */}
       <section>
        <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2"><SpeakerWaveIcon className="w-6 h-6"/> Asistente de Voz (TTS)</h3>
        <div className="mt-4 space-y-4">
            <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Habilitar Asistente de Voz</label>
                <ToggleSwitch checked={tts.isEnabled} onChange={tts.setIsEnabled} />
            </div>
            {tts.isEnabled && (
                <>
                 <div>
                    <label htmlFor="voice" className="block text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2"><LanguageIcon className="w-5 h-5"/> Voz</label>
                    <select id="voice" value={tts.selectedVoiceURI || ''} onChange={e => tts.setSelectedVoiceURI(e.target.value)} className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600">
                        {tts.availableVoices.map(voice => <option key={voice.voiceURI} value={voice.voiceURI}>{voice.name} ({voice.lang})</option>)}
                    </select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label htmlFor="volume" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Volumen: {tts.volume.toFixed(1)}</label>
                        <input type="range" id="volume" min="0" max="1" step="0.1" value={tts.volume} onChange={e => tts.setVolume(Number(e.target.value))} className="w-full"/>
                    </div>
                    <div>
                        <label htmlFor="rate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Velocidad: {tts.rate.toFixed(1)}</label>
                        <input type="range" id="rate" min="0.5" max="2" step="0.1" value={tts.rate} onChange={e => tts.setRate(Number(e.target.value))} className="w-full"/>
                    </div>
                    <div>
                        <label htmlFor="pitch" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tono: {tts.pitch.toFixed(1)}</label>
                        <input type="range" id="pitch" min="0" max="2" step="0.1" value={tts.pitch} onChange={e => tts.setPitch(Number(e.target.value))} className="w-full"/>
                    </div>
                </div>
                </>
            )}
        </div>
      </section>

      {/* Save Button */}
      <div className="pt-6 flex justify-end items-center gap-4">
        {saveSuccess && <span className="text-green-600 text-sm">Guardado con éxito!</span>}
        <button onClick={handleSave} disabled={isSaving} className="px-6 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 disabled:opacity-50">
          {isSaving ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>
    </div>
  );
};

export default Settings;