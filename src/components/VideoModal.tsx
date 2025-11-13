import React from 'react';

interface VideoModalProps {
  videoUrl: string;
  title: string;
}

const VideoModal: React.FC<VideoModalProps> = ({ videoUrl, title }) => {
  return (
    <div className="w-full aspect-[9/16] md:aspect-[2/3] overflow-hidden rounded-xl bg-black">
      {videoUrl ? (
        <video 
          autoPlay 
          loop 
          playsInline
          className="w-full h-full object-cover object-top" 
          key={videoUrl}
          title={title}
        >
          <source src={videoUrl} type="video/mp4" />
          Tu navegador no soporta la etiqueta de video.
        </video>
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-black">
          <p className="text-gray-400">Video no disponible.</p>
        </div>
      )}
    </div>
  );
};

export default VideoModal;