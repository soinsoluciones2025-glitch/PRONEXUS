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
        <path d="M12 2a10 10 0 1 0 10 10" opacity="0.4"/>
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2v2m0 16v2m10-12h-2M4 12H2" />
        <path d="m15.5 8.5 2.8 2.8m-12.6 0 2.8-2.8m0 5.6 2.8 2.8m-8.4-8.4 2.8 2.8" />
    </svg>
);