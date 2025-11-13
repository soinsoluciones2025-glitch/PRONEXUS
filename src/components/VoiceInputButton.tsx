import React, { useState, useEffect, useRef } from 'react';
import { MicrophoneIcon } from './icons/MicrophoneIcon'; 

// Add types for Web Speech API to fix TypeScript errors.
// These types are not included in default TypeScript DOM typings.
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
  // FIX: Changed 'onend' type to correctly accept an Event object
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
}

interface SpeechRecognitionEvent extends Event {
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
}

// FIX: Define a constructor interface for SpeechRecognition
interface SpeechRecognitionConstructor {
  new (): SpeechRecognition;
  prototype: SpeechRecognition;
}

declare global {
  interface Window {
    // FIX: Use the new constructor interface for SpeechRecognition and webkitSpeechRecognition
    SpeechRecognition: SpeechRecognitionConstructor;
    webkitSpeechRecognition: SpeechRecognitionConstructor;
  }
}

interface VoiceInputButtonProps {
  onTranscript: (transcript: string) => void;
}

const VoiceInputButton: React.FC<VoiceInputButtonProps> = ({ onTranscript }) => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setIsSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.lang = 'es-ES';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        onTranscript(transcript);
        setIsListening(false);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };

      // FIX: Update the onend handler to accept an event argument to match the interface
      recognition.onend = (_event: Event) => { // Use _event to mark as unused
        setIsListening(false);
      };
      
      recognitionRef.current = recognition;
    } else {
      setIsSupported(false);
    }
  }, [onTranscript]);

  const handleToggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  if (!isSupported) {
    return null; // Or render a disabled button with a tooltip
  }

  return (
    <button
      type="button"
      onClick={handleToggleListening}
      className={`relative p-2 rounded-full transition-all duration-300 ease-in-out transform hover:scale-110 active:scale-100 ${
        isListening 
          ? 'bg-red-600 text-white animate-pulse' 
          : 'bg-gray-200 dark:bg-gray-700 text-cyan-600 dark:text-cyan-300'
      }`}
      title={isListening ? "Detener grabación" : "Buscar por voz"}
    >
      <MicrophoneIcon className="w-5 h-5" strokeWidth={2} />
    </button>
  );
};

export default VoiceInputButton;