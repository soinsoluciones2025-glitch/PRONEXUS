import React from 'react';

export const ShareIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
        <path d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.195.025.39.05.588.08m-5.858 2.186a2.25 2.25 0 112.186 0M12 15a2.25 2.25 0 110-4.5 2.25 2.25 0 010 4.5m0 0v-2.25m0 2.25c.195.025.39.05.588.08m-5.858 2.186a2.25 2.25 0 100-2.186m0 2.186c.195.025.39.05.588.08m5.858-2.186a2.25 2.25 0 100 2.186m0-2.186c-.195-.025-.39-.05-.588-.08m5.858-2.186a2.25 2.25 0 110-2.186m0 2.186c-.195-.025-.39-.05-.588-.08m-5.858 0a2.25 2.25 0 100 2.186m0-2.186c.195.025.39.05.588.08M17.25 12a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
    </svg>
);