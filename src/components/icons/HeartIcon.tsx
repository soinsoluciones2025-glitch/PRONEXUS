import React from 'react';

export const HeartIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        fill="currentColor" 
        viewBox="0 0 24 24" 
        strokeWidth={2} 
        stroke="none" 
        {...props}
    >
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5A5.5 5.5 0 017.5 3c1.74 0 3.41.81 4.5 2.09A5.5 5.5 0 0116.5 3c3.03 0 5.5 2.47 5.5 5.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
);