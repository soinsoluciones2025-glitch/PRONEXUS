
import React from 'react';

export const PhoneIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24" 
        strokeWidth={1.5} 
        stroke="currentColor" 
        {...props}
    >
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.314a2.25 2.25 0 00-2.25-2.25h-.158l-1.077 1.077M2.25 6.75L4.5 9.158m0 0l3.125 3.125m-4.505-.718l-.56 2.054a2.25 2.25 0 00-.095.632A2.25 2.25 0 004.5 21h4.5a2.25 2.25 0 002.25-2.25v-1.314a2.25 2.25 0 00-2.25-2.25h-.158l-1.077 1.077M21.75 6.75v4.5m0-4.5h-4.5m4.5 0L17.25 9.158" />
    </svg>
);