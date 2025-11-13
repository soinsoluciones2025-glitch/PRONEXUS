import React from 'react';

export const RocketLaunchIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24" 
        strokeWidth={2} 
        stroke="currentColor" 
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
    >
        <path d="M12 2L6 12h12L12 2z" />
        <path d="M12 22v-4" />
        <path d="M5 18h14" />
        <circle cx="12" cy="18" r="2" />
    </svg>
);