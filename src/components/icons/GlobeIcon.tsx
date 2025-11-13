
import React from 'react';

export const GlobeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24" 
        strokeWidth={1.5} 
        stroke="currentColor" 
        {...props}
    >
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21V3m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m0 18c1.657 0 3-4.03 3-9s-1.343-9-3-9M3.284 15.747c.884.341 1.83.568 2.827.701M20.716 15.747c-.884.341-1.83.568-2.827.701M6.11 8.252c.884-.341 1.83-.568 2.827-.701M17.89 8.252c-.884-.341-1.83-.568-2.827-.701" />
    </svg>
);