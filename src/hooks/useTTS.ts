
import { useState, useEffect, useCallback } from 'react';

const TTS_SETTINGS_KEY = 'prospectNexusTTSSettings';

interface TTSSettings {
  isEnabled: boolean;
  volume: number;
  rate: number;
  pitch: number;
  selectedVoiceURI: string | null;
}

const defaultSettings: TTSSettings = {
  isEnabled: false,
  volume: 1,
  rate: 1,
  pitch: 1,
  selectedVoiceURI: null,
};

export const useTTS = () => {
  const [settings, setSettings] = useState<TTSSettings>(() => {
    try {
      const savedSettings = localStorage.getItem(TTS_SETTINGS_KEY);
      return savedSettings ? { ...defaultSettings, ...JSON.parse(savedSettings) } : defaultSettings;
    } catch {
      return defaultSettings;
    }
  });
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    const handleVoicesChanged = () => {
      const voices = window.speechSynthesis.getVoices();
      setAvailableVoices(voices);
      
      // If there's no selected voice but there are voices available, select a default one (e.g., a Spanish one)
      if (!settings.selectedVoiceURI && voices.length > 0) {
          const spanishVoice = voices.find(v => v.lang.startsWith('es-')) || voices[0];
          if (spanishVoice) {
              setSettings(s => ({ ...s, selectedVoiceURI: spanishVoice.voiceURI }));
          }
      }
    };
    
    // Voices may load asynchronously
    handleVoicesChanged(); // Initial call
    window.speechSynthesis.onvoiceschanged = handleVoicesChanged;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, [settings.selectedVoiceURI]); // Re-run if selectedVoiceURI changes to ensure it's still valid

  useEffect(() => {
    try {
      localStorage.setItem(TTS_SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error("Could not save TTS settings to localStorage", error);
    }
  }, [settings]);

  const speak = useCallback((text: string) => {
    if (!settings.isEnabled || !text) return;
    
    window.speechSynthesis.cancel(); // Cancel any previous speech
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.volume = settings.volume;
    utterance.rate = settings.rate;
    utterance.pitch = settings.pitch;

    if (settings.selectedVoiceURI) {
      const selectedVoice = availableVoices.find(v => v.voiceURI === settings.selectedVoiceURI);
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
    }
    
    window.speechSynthesis.speak(utterance);
  }, [settings, availableVoices]);
  
  // Create individual setters to be exposed from the hook
  const setIsEnabled = (enabled: boolean) => setSettings(s => ({ ...s, isEnabled: enabled }));
  const setVolume = (volume: number) => setSettings(s => ({ ...s, volume }));
  const setRate = (rate: number) => setSettings(s => ({ ...s, rate }));
  const setPitch = (pitch: number) => setSettings(s => ({ ...s, pitch }));
  const setSelectedVoiceURI = (uri: string | null) => setSettings(s => ({ ...s, selectedVoiceURI: uri }));

  return {
    speak,
    isEnabled: settings.isEnabled,
    setIsEnabled,
    volume: settings.volume,
    setVolume,
    rate: settings.rate,
    setRate,
    pitch: settings.pitch,
    setPitch,
    availableVoices,
    selectedVoiceURI: settings.selectedVoiceURI,
    setSelectedVoiceURI,
  };
};
