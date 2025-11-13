import React from 'react';

export const StarIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        fill="currentColor" 
        viewBox="0 0 24 24" 
        strokeWidth={2} 
        stroke="none" 
        {...props}
    >
        <path d="M12 2l3.09 6.31 6.91 1.01-5 4.88 1.18 6.88L12 17.25l-6.18 3.25 1.18-6.88-5-4.88 6.91-1.01L12 2z" />
    </svg>
);