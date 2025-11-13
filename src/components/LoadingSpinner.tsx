import React, { useEffect, useState } from 'react';

const LoadingSpinner: React.FC = () => {
  const loadingTexts = [
    "No buscamos más clientes, buscamos los clientes <strong class='text-yellow-500 dark:text-yellow-400'>correctos</strong>.",
    "Calibrando tu sonar de precisión...",
    "Analizando tu oferta para encontrar las mejores oportunidades.",
    "Estableciendo conexión con el nexo de inteligencia...",
  ];
  const [currentTextIndex, setCurrentTextIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTextIndex(prevIndex => (prevIndex + 1) % loadingTexts.length);
    }, 1250); // Cycle through all messages within the 5s window
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-4 animate-fade-in">
      <div 
        className="w-48 h-24 rounded-[50%] bg-white dark:bg-gray-200 relative overflow-hidden flex items-center justify-center shadow-2xl border-2 border-gray-300 dark:border-gray-600"
        style={{ animation: 'blink-main-eye 8s infinite' }}
      >
        <div 
          className="w-16 h-16 rounded-full bg-cyan-500 dark:bg-cyan-400 relative flex items-center justify-center transition-transform duration-500"
          style={{ animation: 'look-around 8s infinite ease-in-out' }}
        >
          <div 
            className="w-8 h-8 rounded-full bg-gray-900 dark:bg-black"
            style={{ animation: 'terminator-glow 8s infinite' }}
          ></div>
        </div>
      </div>
      <p className="mt-8 text-xl font-bold text-gray-700 dark:text-gray-300 animate-fade-in-fast" style={{ animationDelay: '0.2s' }}
        dangerouslySetInnerHTML={{ __html: loadingTexts[currentTextIndex] }}
      >
      </p>
      <p className="text-md text-gray-500 dark:text-gray-400">
        Un momento por favor.
      </p>
    </div>
  );
};

export default LoadingSpinner;