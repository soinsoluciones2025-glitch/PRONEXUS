import React from 'react';

export const OutreachWaveIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
        <circle cx="12" cy="12" r="2" />
        <path d="M16.24 7.76a6 6 0 0 1 0 8.49" opacity="0.8"/>
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14" opacity="0.5"/>
        <path d="M4.93 19.07a10 10 0 0 1 0-14.14" opacity="0.5"/>
        <path d="M7.76 16.24a6 6 0 0 1 0-8.49" opacity="0.8"/>
    </svg>
);
