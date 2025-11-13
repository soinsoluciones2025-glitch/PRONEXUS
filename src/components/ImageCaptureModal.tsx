import React, { useState, useRef, useCallback } from 'react';
// Note: This component assumes `react-webcam` is installed in the project.
// As I cannot modify package.json, this is a functional placeholder.
// import Webcam from 'react-webcam'; 
import { CameraIcon } from './icons/CameraIcon.tsx';
import ImageUploader from './ImageUploader.tsx';

// Dummy Webcam component if react-webcam is not available
// FIX: The dummy Webcam component was not accepting any props, causing a type error.
// It has been updated to use React.forwardRef to correctly handle the `ref` prop
// and accept other props passed to it, resolving the TypeScript error.
const Webcam = React.forwardRef<any, any>((_props, _ref) => (
    <div className="bg-black text-white flex items-center justify-center aspect-video">
        <p>Webcam preview would be here.</p>
    </div>
));
Webcam.displayName = 'Webcam';


interface ImageCaptureModalProps {
  onCaptureComplete: (imageUrl: string) => void;
  storagePath: string;
}

const videoConstraints = {
  width: 1280,
  height: 720,
  facingMode: "user"
};

const ImageCaptureModal: React.FC<ImageCaptureModalProps> = ({ onCaptureComplete, storagePath }) => {
  const webcamRef = useRef<any>(null); // Use `any` for dummy component
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [mode, setMode] = useState<'capture' | 'upload'>('capture');

  const capture = useCallback(() => {
    if (webcamRef.current) {
        const imageSrc = webcamRef.current.getScreenshot();
        if (imageSrc) {
            setImgSrc(imageSrc);
        }
    }
  }, [webcamRef]);

  const handleRetake = () => {
      setImgSrc(null);
  };
  
  const handleUsePhoto = () => {
      if (imgSrc) {
          // In a real app, you would convert the base64 `imgSrc` to a Blob/File and upload it.
          // For this simulation, we'll just pass the base64 string.
          onCaptureComplete(imgSrc); 
      }
  };

  return (
    <div className="p-4">
        <div className="flex justify-center mb-4 border-b">
            <button onClick={() => setMode('capture')} className={`px-4 py-2 ${mode === 'capture' ? 'border-b-2 border-cyan-500' : ''}`}>Take Photo</button>
            <button onClick={() => setMode('upload')} className={`px-4 py-2 ${mode === 'upload' ? 'border-b-2 border-cyan-500' : ''}`}>Upload Image</button>
        </div>

        {mode === 'capture' && (
            <div>
            {imgSrc ? (
                <img src={imgSrc} alt="captured" />
            ) : (
                <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    videoConstraints={videoConstraints}
                />
            )}
            <div className="mt-4 flex justify-center gap-4">
                {imgSrc ? (
                    <>
                        <button onClick={handleRetake} className="px-4 py-2 bg-gray-200 rounded-md">Retake</button>
                        <button onClick={handleUsePhoto} className="px-4 py-2 bg-cyan-600 text-white rounded-md">Use Photo</button>
                    </>
                ) : (
                    <button onClick={capture} className="p-4 bg-cyan-600 text-white rounded-full">
                        <CameraIcon className="w-6 h-6" />
                    </button>
                )}
            </div>
        </div>
        )}

        {mode === 'upload' && (
            <ImageUploader onUploadComplete={onCaptureComplete} storagePath={storagePath} />
        )}
    </div>
  );
};

export default ImageCaptureModal;