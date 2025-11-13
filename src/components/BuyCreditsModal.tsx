import React from 'react';
import type { AppConfig } from '../types.ts';
import { WHATSAPP_NUMBER } from '../services/configService.ts';

interface BuyCreditsModalProps {
  appConfig: AppConfig;
  onPurchaseSimulated?: (slotsToAdd: number) => void; // Kept for potential future testing
}

const BuyCreditsModal: React.FC<BuyCreditsModalProps> = ({ appConfig }) => {

  const handlePurchase = (credits: number, price: number) => {
    const message = `Hola! Estoy interesado en comprar el paquete de ${credits} créditos por $${price} ARS.`;
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="p-6 space-y-4">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-800 dark:text-white">Recarga tus Créditos</h3>
        <p className="text-gray-600 dark:text-gray-300 mt-1">Elige un paquete para continuar usando la IA.</p>
      </div>
      
      <div className="space-y-3 pt-4">
        {appConfig.creditPackages.sort((a,b) => a.price - b.price).map((pkg) => {
            const isBestValue = pkg.description.toLowerCase().includes('mejor valor');
            return (
                <button 
                    key={pkg.id} 
                    onClick={() => handlePurchase(pkg.credits, pkg.price)}
                    className={`w-full p-4 border-2 rounded-lg text-left transition-transform transform hover:-translate-y-1 relative overflow-hidden ${isBestValue ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50'}`}
                >
                    {isBestValue && (
                        <div className="absolute top-0 right-0 px-2 py-0.5 bg-yellow-500 text-gray-900 text-xs font-bold rounded-bl-lg">{pkg.description}</div>
                    )}
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-lg font-bold text-cyan-800 dark:text-cyan-200">{pkg.credits} Créditos</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{isBestValue ? 'Ideal para uso regular' : 'Recarga rápida'}</p>
                        </div>
                        <p className="text-2xl font-extrabold text-gray-900 dark:text-white">${pkg.price.toLocaleString('es-AR')} <span className="text-sm font-semibold text-gray-500">ARS</span></p>
                    </div>
                </button>
            )
        })}
      </div>
    </div>
  );
};

export default BuyCreditsModal;