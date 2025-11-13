import React from 'react'; 
import { LightBulbIcon } from './icons/LightBulbIcon';
import { HeartIcon } from './icons/HeartIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { OutreachWaveIcon } from './icons/OutreachWaveIcon';
import { AiQuillIcon } from './icons/AiQuillIcon';


interface PhilosophyModalProps {
  onClose: () => void;
}

export const PhilosophyModal: React.FC<PhilosophyModalProps> = ({ onClose }) => {
  return (
      <div className="p-6 space-y-6 bg-gray-50 dark:bg-gray-800/80 text-gray-800 dark:text-white">
        <div className="text-center">
            <h2 className="text-2xl font-bold text-indigo-700 dark:text-indigo-300 flex items-center justify-center gap-3">
                <OutreachWaveIcon className="w-8 h-8"/> Nuestro Nexo de Inteligencia
            </h2>
            <p className="mt-4 text-lg font-semibold text-gray-700 dark:text-gray-300">
                "No buscamos más clientes, buscamos los clientes <strong className='text-yellow-500 dark:text-yellow-400'>correctos</strong>."
            </p>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
                La prospección no debería ser un juego de números. Creemos que la clave para una conexión exitosa no es contactar a más personas,
                sino contactar a las personas *correctas*, con el mensaje *correcto* y en el momento *correcto*.
            </p>
        </div>
        
        <div className="space-y-6">
            {/* Section 1: Entendemos tu Oferta */}
            <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-cyan-100 dark:bg-cyan-900/50 flex items-center justify-center">
                    <SparklesIcon className="w-6 h-6 text-cyan-600 dark:text-cyan-300" />
                </div>
                <div>
                    <h3 className="font-semibold text-gray-800 dark:text-white">1. Entendemos tu Oferta (El Contexto)</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Todo comienza contigo. La IA primero digiere y comprende profundamente tu producto, servicio o perfil profesional.
                    </p>
                </div>
            </div>

            {/* Section 2: Descubrimos Nichos Ocultos */}
            <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
                    <LightBulbIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-300" />
                </div>
                <div>
                    <h3 className="font-semibold text-gray-800 dark:text-white">2. Descubrimos Nichos Ocultos (La Oportunidad)</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        La IA identifica los nichos de mercado o tipos de empleo más específicos y receptivos a tu oferta en un área determinada.
                    </p>
                </div>
            </div>

            {/* Section 3: Identificamos la Necesidad */}
            <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center">
                    <HeartIcon className="w-6 h-6 text-purple-600 dark:text-purple-300" />
                </div>
                <div>
                    <h3 className="font-semibold text-gray-800 dark:text-white">3. Identificamos la Necesidad (La Relevancia)</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Nuestros "filtros inteligentes" son hipótesis de "puntos de dolor" o "requisitos clave" generados por la IA,
                        diseñadas para encontrar objetivos con una necesidad real de tu solución.
                    </p>
                </div>
            </div>

            {/* Section 4: Generamos el Puente */}
            <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/50 flex items-center justify-center">
                    <AiQuillIcon className="w-6 h-6 text-orange-600 dark:text-orange-300" />
                </div>
                <div>
                    <h3 className="font-semibold text-gray-800 dark:text-white">4. Generamos el Puente (La Conexión)</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        La IA se convierte en tu estratega de comunicación, generando textos completos y profesionales adaptados a tu objetivo.
                        No son guiones genéricos; son puentes de comunicación construidos sobre la base de la Inteligencia.
                    </p>
                </div>
            </div>
        </div>

        {/* Nuestra Promesa */}
        <div className="pt-6 border-t border-gray-200 dark:border-gray-700 space-y-4">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white text-center">Nuestra Promesa</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg text-center">
                    <h4 className="font-bold text-cyan-600 dark:text-cyan-400">Garantía de Relevancia</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Cada lead o empleo que te mostramos es analizado por IA para asegurar que sea una oportunidad real.</p>
                </div>
                <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg text-center">
                    <h4 className="font-bold text-cyan-600 dark:text-cyan-400">Garantía de Ahorro de Tiempo</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Reducimos tus horas de investigación manual, dándote más tiempo para cerrar acuerdos o postularte.</p>
                </div>
                <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg text-center">
                    <h4 className="font-bold text-cyan-600 dark:text-cyan-400">Garantía de Calidad</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Nuestro algoritmo evoluciona constantemente para ofrecerte la mejor calidad de prospectos y adaptaciones de CV.</p>
                </div>
            </div>
        </div>

        <div className="pt-4 text-center">
            <button onClick={onClose} className="px-6 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-gray-500">
                Entendido
            </button>
        </div>
    </div>
  );
};