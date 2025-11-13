import React from 'react';

export const TagIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
      d="M9.52 3.5C4.79 3.5 1 7.29 1 12.02c0 4.73 3.79 8.52 8.52 8.52h5.83c.75 0 1.35-.6 1.35-1.35V5.55c0-.75-.6-1.35-1.35-1.35H9.52zM15.5 12h-3m3 3h-3m0-6h-3"
    />
  </svg>
);