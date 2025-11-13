import React from 'react';

export const DocumentCheckIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24" 
        strokeWidth={1.5} 
        stroke="currentColor" 
        {...props}
    >
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 12H18m-4.5 4.5v2.25m-3.75-3.75V18m-2.25-4.5H3.75m12 0a9.04 9.04 0 01-4.5 7.823 9.04 9.04 0 01-8.318-7.823" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 12a3.75 3.75 0 00-7.5 0" />
    </svg>
);