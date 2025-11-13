import React, { useEffect, useRef } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';
  hideHeader?: boolean;
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
  '5xl': 'max-w-5xl',
};

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md', hideHeader = false }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-fade-in-fast"
        onClick={onClose}
        aria-hidden="true"
      ></div>

      <div
        ref={modalRef}
        className={`relative w-full ${sizeClasses[size]} m-4 bg-white dark:bg-gray-800 rounded-xl shadow-xl transform transition-all animate-slide-up flex flex-col max-h-[90vh]`}
      >
        {!hideHeader && (
          <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-gray-700 flex-shrink-0">
            <h2 id="modal-title" className="text-xl font-bold text-slate-900 dark:text-white">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full text-slate-400 hover:bg-slate-200 dark:hover:bg-gray-700 hover:text-slate-600 dark:hover:text-gray-200 transition-colors"
              aria-label="Cerrar modal"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {hideHeader && (
          <button
            onClick={onClose}
            className="absolute top-3 right-3 z-20 p-2 rounded-full bg-black/50 text-white hover:bg-black/75 transition-colors"
            aria-label="Cerrar modal"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
        
        <div className={`overflow-auto flex-grow ${!hideHeader ? 'bg-slate-50 dark:bg-gray-800 rounded-b-xl' : 'rounded-xl'}`}>
            {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;