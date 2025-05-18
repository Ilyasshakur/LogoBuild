
import React from 'react';

const Logo = () => {
  return (
    <div className="flex items-center justify-center">
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 500 500" 
        fill="currentColor" 
        className="w-10 h-10"
      >
        <path d="M150,100 L350,100 C370,100 380,120 380,140 L350,200 L150,200 L120,140 C120,120 130,100 150,100 Z" />
        <path d="M120,140 L150,200 L350,200 L380,140 L120,140 Z" />
        <rect x="160" y="140" width="40" height="120" rx="10" />
        <rect x="230" y="140" width="40" height="120" rx="10" />
        <rect x="300" y="140" width="40" height="120" rx="10" />
      </svg>
    </div>
  );
};

export default Logo;
