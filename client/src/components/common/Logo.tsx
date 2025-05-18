import React from 'react';

const Logo = () => {
  return (
    <div className="w-10 h-10 flex items-center justify-center">
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 500 500" 
        fill="#0F4C81" 
        className="w-10 h-10"
      >
        {/* Shopping basket */}
        <path d="M100,200 L400,200 L350,300 L150,300 Z" />
        {/* Vertical lines */}
        <rect x="180" y="220" width="30" height="60" fill="white" />
        <rect x="235" y="220" width="30" height="60" fill="white" />
        <rect x="290" y="220" width="30" height="60" fill="white" />
        {/* Handle */}
        <path d="M200,180 L250,150 L300,180" strokeWidth="30" strokeLinecap="round" />
      </svg>
      <span className="ml-2 text-xl font-bold text-primary">UshopLS</span>
    </div>
  );
};

export default Logo;