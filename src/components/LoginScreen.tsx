import React from 'react';
import { GoogleIcon } from './icons/GoogleIcon';
import AnimatedLogo from './AnimatedLogo';
import ZenAdvertisement from './ZenAdvertisement';
import VideoModal from './VideoModal';
import Modal from './Modal'; // Corrected path to Modal

interface LoginScreenProps {
  onSignIn: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onSignIn }) => {
  const [videoModalOpen, setVideoModalOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto text-center">
        <AnimatedLogo className="w-24 h-24 mx-auto" />
        <h1 className="mt-4 text-4xl font-bold text-slate-800 dark:text-white">
          Bienvenido a Prospect Nexus AI
        </h1>
        <p className="mt-2 text-lg text-slate-600 dark:text-gray-300">
          Tu sonar de precisión para encontrar clientes y empleos.
        </p>
        <div className="mt-8">
          <button
            onClick={onSignIn}
            className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-white dark:bg-gray-800 border border-slate-300 dark:border-gray-600 rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <GoogleIcon className="w-6 h-6" />
            <span className="font-semibold text-slate-700 dark:text-white">
              Iniciar Sesión con Google
            </span>
          </button>
        </div>
      </div>

      <ZenAdvertisement onShowVideo={() => setVideoModalOpen(true)} />

      <Modal isOpen={videoModalOpen} onClose={() => setVideoModalOpen(false)} title="Proyecto Zen: Business-in-a-Box" size="4xl">
        <VideoModal videoUrl="/zen_video.mp4" title="Proyecto Zen" />
      </Modal>
    </div>
  );
};

export default LoginScreen;