import React from 'react';

export const NeuralNexusIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        {...props}
    >
        {/* Central Core */}
        <circle cx="12" cy="12" r="2.5" fill="currentColor" stroke="none" /> 

        {/* Radar Rings (perfectly concentric) */}
        <circle cx="12" cy="12" r="5" opacity="0.3" strokeWidth="1" />
        <circle cx="12" cy="12" r="9" opacity="0.15" strokeWidth="1" />
        
        {/* Main Radar sweep line - will be animated via CSS */}
        {/* The line itself is static, the animation rotates/scales it */}
        <rect x="11.5" y="12" width="10.5" height="1.5" rx="0.75" transform-origin="12 12" className="radar-line" stroke="none" fill="currentColor" opacity="0" />
    </svg>
);