import React, { useState, useEffect, useCallback } from 'react';
import { UsersIcon } from './icons/UsersIcon';
import { CodeBracketIcon } from './icons/CodeBracketIcon';
import { LightBulbIcon } from './icons/LightBulbIcon';
import { PlayIcon } from './icons/PlayIcon';

interface ZenAdvertisementProps {
  onShowVideo: () => void;
}

const slides = [
  {
    icon: <UsersIcon className="w-8 h-8" />,
    title: "Para Revendedores y Agencias",
    description: "Vende nuestros servicios de desarrollo como si fueran tuyos. Usa nuestra plataforma de marca blanca para gestionar todo el proceso, desde la propuesta hasta la entrega, sin escribir una línea de código.",
    cta: "Conviértete en Agencia"
  },
  {
    icon: <CodeBracketIcon className="w-8 h-8" />,
    title: "Para Desarrolladores",
    description: "Alquila nuestra plataforma SAAS y personalízala con tu propio catálogo de servicios. Automatiza tus ventas, la generación de propuestas y la gestión de clientes para escalar tu negocio.",
    cta: "Potencia tu Negocio"
  },
  {
    icon: <LightBulbIcon className="w-8 h-8" />,
    title: "Proyecto Zen: Tu Próximo Negocio Digital",
    description: "Te presentamos una oportunidad única para generar ingresos. Descubre cómo nuestra plataforma 'Business-in-a-Box' puede ser tu próximo emprendimiento exitoso.",
    cta: "Explorar Oportunidad"
  }
];

const ZenAdvertisement: React.FC<ZenAdvertisementProps> = ({ onShowVideo }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrentSlide(prev => (prev + 1) % slides.length);
  }, []);

  useEffect(() => {
    const interval = setInterval(nextSlide, 5000); // Change slide every 5 seconds
    return () => clearInterval(interval);
  }, [nextSlide]);

  const slide = slides[currentSlide];

  return (
    <div className="mt-12 p-6 bg-white dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg w-full max-w-2xl mx-auto animate-fade-in overflow-hidden">
      <div className="flex flex-col md:flex-row gap-6 items-center">
        <div className="flex-1">
          <div className="flex items-center gap-3 text-indigo-600">
            {slide.icon}
            <h3 className="text-xl font-bold text-gray-800 dark:text-white">{slide.title}</h3>
          </div>
          <p className="mt-2 text-gray-600 dark:text-gray-300 text-sm">
            {slide.description}
          </p>
        </div>
        <div className="flex-shrink-0 flex flex-col gap-3">
          <a href="https://proyectozen.netlify.app/" target="_blank" rel="noopener noreferrer" className="w-48 text-center bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg transition-transform transform hover:scale-105">
            {slide.cta}
          </a>
          <button onClick={onShowVideo} className="w-48 flex items-center justify-center gap-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white font-bold py-2 px-4 rounded-lg transition-transform transform hover:scale-105">
            <PlayIcon className="w-5 h-5"/>
            Ver Video
          </button>
        </div>
      </div>
      <div className="flex justify-center gap-2 mt-4">
        {slides.map((_, index) => (
          <button key={index} onClick={() => setCurrentSlide(index)} className={`w-2 h-2 rounded-full transition-colors ${currentSlide === index ? 'bg-cyan-600' : 'bg-gray-300 dark:bg-gray-600'}`}></button>
        ))}
      </div>
    </div>
  );
};

export default ZenAdvertisement;