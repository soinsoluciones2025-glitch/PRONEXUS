import React from 'react';

export const PhotoIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
        <path d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-4.5-9a2.25 2.25 0 00-2.25-2.25H9.75A2.25 2.25 0 007.5 3.75m9 0V2.25A2.25 2.25 0 0014.25 0H9.75A2.25 2.25 0 007.5 2.25v1.5m9 0a2.25 2.25 0 012.25 2.25v2.25m-13.5 0V5.25A2.25 2.25 0 014.5 3.75" />
    </svg>
);