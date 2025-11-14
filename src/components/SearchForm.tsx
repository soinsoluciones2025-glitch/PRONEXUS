import React, { useState, useContext } from 'react';
import type { InitialQuery, SearchArea, SearchMode, AppConfig } from '../types';
import { MapPinIcon } from './icons/MapPinIcon'; 
import { MagnifyingGlassIcon } from './icons/MagnifyingGlassIcon'; 
import VoiceInputButton from './VoiceInputButton';
import { reverseGeocode } from '../services/geminiService';
import { ChartBarSquareIcon } from './icons/ChartBarSquareIcon'; 
import { TTSContext } from '../contexts/TTSContext'; 

interface SearchFormProps {
  mode: SearchMode;
  initialQuery: InitialQuery;
  setInitialQuery: (query: InitialQuery) => void;
  searchArea: SearchArea;
  setSearchArea: React.Dispatch<React.SetStateAction<SearchArea>>;
  searchRadius: number;
  setSetSearchRadius: (radius: number) => void;
  onSearch: (query: InitialQuery, area: SearchArea, radius: number) => void;
  isLoading: boolean;
  progressMessage: string | null;
  freeSearchesRemaining: number;
  isDeveloper: boolean;
  onGetCurrentLocation: (coords: { latitude: number; longitude: number }) => void;
  onAnalyzeMarket: () => void;
  isPremium: boolean;
  appConfig: AppConfig;
}

const SearchForm: React.FC<SearchFormProps> = ({
  mode,
  initialQuery,
  setInitialQuery,
  searchArea,
  setSearchArea,
  searchRadius,
  setSetSearchRadius,
  onSearch,
  isLoading,
  progressMessage,
  isDeveloper,
  onGetCurrentLocation,
  onAnalyzeMarket,
  isPremium,
  appConfig,
}) => {
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const { speak } = useContext(TTSContext);

  const handleQueryChange = (field: keyof InitialQuery, value: string) => {
    setInitialQuery({ ...initialQuery, [field]: value });
  };

  const handleAreaChange = (field: keyof SearchArea, value: string | boolean) => {
    setSearchArea(prev => ({ ...prev, [field]: value }));
  };

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      setIsGettingLocation(true);
      speak("Obteniendo tu ubicación actual.");
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          onGetCurrentLocation({ latitude, longitude });
          try {
            const { locationName } = await reverseGeocode(latitude, longitude);
            setSearchArea({ location: locationName, useUserLocation: true, coordinates: { latitude, longitude } });
            speak(`Ubicación encontrada: ${locationName}. Ahora puedes iniciar la búsqueda.`);
          } catch (error: any) {
            console.error(error);
            setSearchArea({ location: `Lat: ${latitude.toFixed(2)}, Lon: ${longitude.toFixed(2)}`, useUserLocation: true, coordinates: { latitude, longitude } });
            speak("No se pudo obtener el nombre de la ubicación, pero se usarán las coordenadas. Ya puedes buscar.");
          } finally {
            setIsGettingLocation(false);
          }
        },
        (error) => {
          console.error("Geolocation error:", error);
          alert('No se pudo obtener la ubicación. Por favor, asegúrate de haber dado permiso.');
          speak("Error al obtener la ubicación. Asegúrate de haber dado los permisos necesarios.");
          setIsGettingLocation(false);
        }
      );
    } else {
      alert('La geolocalización no es soportada por este navegador.');
      speak("La geolocalización no es soportada por este navegador.");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (initialQuery.userOfferingOrProfession.trim() && searchArea.location.trim()) {
      onSearch(initialQuery, searchArea, searchRadius);
    } else {
      speak("Por favor, completa todos los campos requeridos para la búsqueda.");
      alert('Por favor, completa todos los campos requeridos.');
    }
  };

  const salesLabels = {
    offering: '¿Qué vendes o qué servicio ofreces?',
    offeringPlaceholder: 'Ej: "Servicios de marketing digital para restaurantes"',
    audience: '¿A qué público o industria te diriges? (Opcional)',
    audiencePlaceholder: 'Ej: "Restaurantes de comida rápida"',
  };

  const jobLabels = {
    offering: '¿Qué puesto o profesión buscas?',
    offeringPlaceholder: 'Ej: "Desarrollador de React con 3 años de experiencia"',
    audience: '¿En qué industria tienes experiencia o te gustaría trabajar? (Opcional)',
    audiencePlaceholder: 'Ej: "Startups de tecnología financiera (FinTech)"',
  };

  const labels = mode === 'sales' ? salesLabels : jobLabels;
  const canAnalyzeMarket = (isPremium || isDeveloper) && initialQuery.userOfferingOrProfession.trim() && searchArea.location.trim();


  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 w-full max-w-2xl mx-auto lg:max-w-none space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Paso 1: Define tu Búsqueda</h2>
        <p className="text-sm text-slate-600 dark:text-gray-400">Describe qué ofreces o buscas para que la IA encuentre las mejores oportunidades.</p>
      </div>

      <div className="space-y-4">
        {/* User Offering Input */}
        <div className="relative">
          <label className="block text-sm font-semibold text-slate-700 dark:text-gray-300 mb-1" htmlFor="offering">{labels.offering}</label>
          <div className="flex items-center gap-2">
            <input
              id="offering"
              type="text"
              value={initialQuery.userOfferingOrProfession}
              onChange={(e) => handleQueryChange('userOfferingOrProfession', e.target.value)}
              placeholder={labels.offeringPlaceholder}
              required
              className="w-full p-3 border border-slate-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-slate-900 dark:text-white"
            />
            <VoiceInputButton onTranscript={(t) => handleQueryChange('userOfferingOrProfession', t)} />
          </div>
        </div>

        {/* Target Audience Input */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-gray-300 mb-1" htmlFor="audience">{labels.audience}</label>
          <input
            id="audience"
            type="text"
            value={initialQuery.targetAudienceOrIndustry}
            onChange={(e) => handleQueryChange('targetAudienceOrIndustry', e.target.value)}
            placeholder={labels.audiencePlaceholder}
            className="w-full p-3 border border-slate-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-slate-900 dark:text-white"
          />
        </div>

        {/* Location Input */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-gray-300 mb-1" htmlFor="location">Ubicación</label>
            <div className="flex items-center gap-2">
              <input
                id="location"
                type="text"
                value={searchArea.location}
                onChange={(e) => handleAreaChange('location', e.target.value)}
                placeholder="Ej: Buenos Aires, Argentina"
                required
                className="w-full p-3 border border-slate-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-slate-900 dark:text-white"
                disabled={isGettingLocation}
              />
              <button
                type="button"
                onClick={handleGetLocation}
                className={`p-3 rounded-lg transition-colors ${isGettingLocation ? 'bg-cyan-600 text-white animate-sonar-pulse-location' : 'bg-slate-200 dark:bg-gray-600 text-cyan-600 dark:text-cyan-300 hover:bg-slate-300'}`}
                title="Usar mi ubicación actual"
                disabled={isGettingLocation}
              >
                <MapPinIcon className="w-6 h-6" />
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-gray-300 mb-1" htmlFor="radius">Radio de Búsqueda (km)</label>
            <input
              id="radius"
              type="range"
              min="1"
              max="50"
              value={searchRadius}
              onChange={(e) => setSetSearchRadius(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
            />
            <div className="text-center text-sm text-slate-500 dark:text-gray-400 mt-1">{searchRadius} km</div>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-4">
        <button
            type="button"
            onClick={onAnalyzeMarket}
            disabled={!canAnalyzeMarket || isLoading}
            title={canAnalyzeMarket ? `Analizar mercado (${appConfig.creditCosts.performMarketAnalysis} créditos)` : 'Completa tu oferta y ubicación para analizar el mercado'}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-200 hover:bg-indigo-200 dark:hover:bg-indigo-900"
        >
            <ChartBarSquareIcon className="w-5 h-5" />
            Análisis de Mercado IA
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full sm:w-auto flex items-center justify-center gap-3 px-6 py-3 text-lg font-bold rounded-lg transition-colors duration-200 transform active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed bg-cyan-600 text-white hover:bg-cyan-700 shadow-lg"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {progressMessage || 'Buscando...'}
            </>
          ) : (
            <>
              <MagnifyingGlassIcon className="w-6 h-6" />
              Buscar Clientes Potenciales
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default SearchForm;