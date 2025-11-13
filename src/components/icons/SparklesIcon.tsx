import React from 'react';

export const SparklesIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
    <path d="M12 2l2.5 7h7.5l-6 5l2.5 7-7.5-5-7.5 5 2.5-7-6-5h7.5l2.5-7z" />
    <path d="M5 14l1-3h3l-2 2l1-3-2 2-2-2 1 3-2-2h3l2 2z" opacity="0.7"/>
    <path d="M19 8l1-3h3l-2 2l1-3-2 2-2-2 1 3-2-2h3l2 2z" opacity="0.7"/>
  </svg>
);