import React from 'react';

export const UsersIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24" 
        strokeWidth={1.5} 
        stroke="currentColor" 
        {...props}
    >
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m-7.5-2.962c.513-.513.513-1.345 0-1.858l-3.44-3.44a1.875 1.875 0 10-2.652 2.652L6.814 15.06M12 18.75a9.094 9.094 0 01-3.741-.479 3 3 0 014.682-2.72M12 18.75v.001M15.375 12a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0z" />
    </svg>
);
