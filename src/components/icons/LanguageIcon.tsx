import React from 'react';

export const LanguageIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 21l5.25-11.625M21 21l-5.25-11.625M3.75 9h16.5M4.5 19.5h15M6.375 4.5h11.25" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5V21" />
  </svg>
);