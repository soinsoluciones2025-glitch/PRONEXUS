import React from 'react';

export const LightBulbIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
    <path d="M9 18h6" />
    <path d="M12 21a2 2 0 0 0 2-2v-3a2 2 0 0 0-4 0v3a2 2 0 0 0 2 2z" />
    <path d="M8 14h8V9a4 4 0 0 0-8 0v5z" />
  </svg>
);