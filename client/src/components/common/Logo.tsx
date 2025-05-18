
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
        {/* Shopping basket base */}
        <path d="M100,200 L400,200 L350,300 L150,300 Z" />
        {/* Vertical lines */}
        <rect x="180" y="220" width="30" height="60" />
        <rect x="235" y="220" width="30" height="60" />
        <rect x="290" y="220" width="30" height="60" />
        {/* Handle */}
        <path d="M200,180 L250,150 L300,180" strokeWidth="30" strokeLinecap="round" />
      </svg>
    </div>
  );
};

export default Logo;
