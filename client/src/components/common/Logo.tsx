
import React from 'react';

const Logo = () => {
  return (
    <div className="w-10 h-10 flex items-center justify-center">
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 500 500" 
        fill="currentColor" 
        className="w-10 h-10"
      >
        {/* Shopping basket top edge */}
        <path d="M150,180 L350,180 L300,220 L200,220 Z" />
        {/* Shopping basket sides */}
        <path d="M140,220 L180,350 L320,350 L360,220 Z" />
        {/* Handle */}
        <path d="M200,160 Q250,120 300,160" strokeWidth="20" fill="none" stroke="currentColor" />
        {/* Grid pattern */}
        <rect x="180" y="250" width="25" height="70" rx="5" />
        <rect x="237.5" y="250" width="25" height="70" rx="5" />
        <rect x="295" y="250" width="25" height="70" rx="5" />
      </svg>
    </div>
  );
};

export default Logo;
