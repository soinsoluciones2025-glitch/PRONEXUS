import React, { createContext } from 'react';
import { useTTS } from '../hooks/useTTS';

// FIX: TTSContextType is now defined and exported directly from this file.
export interface TTSContextType {
  speak: (text: string) => void;
  isEnabled: boolean;
  setIsEnabled: (enabled: boolean) => void;
  volume: number;
  setVolume: (volume: number) => void;
  rate: number;
  setRate: (rate: number) => void;
  pitch: number;
  setPitch: (pitch: number) => void;
  availableVoices: SpeechSynthesisVoice[];
  selectedVoiceURI: string | null;
  setSelectedVoiceURI: (uri: string | null) => void;
}

export const TTSContext = createContext<TTSContextType>({
  speak: () => {},
  isEnabled: false,
  setIsEnabled: () => {},
  volume: 1,
  setVolume: () => {},
  rate: 1,
  setRate: () => {},
  pitch: 1,
  setPitch: () => {},
  availableVoices: [],
  selectedVoiceURI: null,
  setSelectedVoiceURI: () => {},
});

export const TTSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const ttsState = useTTS();

  return (
    <TTSContext.Provider value={ttsState}>
      {children}
    </TTSContext.Provider>
  );
};