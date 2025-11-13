import React from 'react';

const AnimatedLogo: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" {...props}>
    <defs>
      {/* Gradient is now correctly centered using userSpaceOnUse */}
      <radialGradient id="radarGradient-light" cx="50" cy="50" r="50" gradientUnits="userSpaceOnUse">
        <stop offset="0%" />
        <stop offset="100%" />
      </radialGradient>
      <radialGradient id="radarGradient-dark" cx="50" cy="50" r="50" gradientUnits="userSpaceOnUse">
        <stop offset="0%" />
        <stop offset="100%" />
      </radialGradient>
    </defs>

    {/* Rejilla estática del radar */}
    <g className="text-gray-300 dark:text-gray-600" strokeWidth="1.5">
      <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" />
      <path d="M50 5 V10 M50 95 V90 M5 50 H10 M95 50 H90" stroke="currentColor" />
      <circle cx="50" cy="50" r="25" fill="none" stroke="currentColor" strokeDasharray="4 4" />
      <path d="M50 40 V60 M40 50 H60" stroke="currentColor" />
    </g>
    
    {/* Blips (puntos) animados */}
    <g className="fill-cyan-500 dark:fill-yellow-400">
        <circle cx="67.6" cy="17.6" r="2" style={{ animation: 'radar-blip 4s infinite ease-out', animationDelay: '0.3s' }} />
        <circle cx="20" cy="38" r="2.5" style={{ animation: 'radar-blip 4s infinite ease-out', animationDelay: '1.2s' }} />
        <circle cx="75" cy="75" r="2" style={{ animation: 'radar-blip 4s infinite ease-out', animationDelay: '2.5s' }} />
        <circle cx="40" cy="80" r="2.5" style={{ animation: 'radar-blip 4s infinite ease-out', animationDelay: '3.2s' }} />
    </g>

    {/* Pulsos expansivos desde el centro */}
    <g className="text-cyan-500 dark:text-yellow-400">
      <circle cx="50" cy="50" r="0" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ animation: 'radar-pulse 2s infinite ease-out' }} />
      <circle cx="50" cy="50" r="0" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ animation: 'radar-pulse 2s infinite ease-out', animationDelay: '1s' }} />
    </g>

    {/* Barrido animado (reducido a 60 grados para un look más refinado) */}
    <g style={{ animation: 'radar-sweep 4s linear infinite', transformOrigin: '50% 50%' }}>
        <path 
            className="block dark:hidden"
            d="M 50 50 L 50 5 A 45 45 0 0 1 88.97 27.5 L 50 50" 
            fill="url(#radarGradient-light)"
            stroke="none"
        />
        <path 
            className="hidden dark:block"
            d="M 50 50 L 50 5 A 45 45 0 0 1 88.97 27.5 L 50 50" 
            fill="url(#radarGradient-dark)"
            stroke="none"
        />
    </g>
  </svg>
);

export default AnimatedLogo;