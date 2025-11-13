import React from 'react';

export const CrosshairsIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6 12h12M12 6v12M12 21a9 9 0 100-18 9 9 0 000 18z"
    />
  </svg>
);
