const Logo = () => {
  return (
    <div className="w-10 h-10 flex items-center justify-center">
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 500 500" 
        fill="#0c4a93" 
        className="w-10 h-10"
      >
        {/* Shopping basket logo */}
        <g>
          <path d="M250,80 L150,150 L350,150 Z" />
          <path d="M150,150 L140,170 L360,170 L350,150 Z" />
          <path d="M140,170 L170,250 L330,250 L360,170 Z" />
          <rect x="180" y="180" width="30" height="60" rx="10" />
          <rect x="235" y="180" width="30" height="60" rx="10" />
          <rect x="290" y="180" width="30" height="60" rx="10" />
        </g>
      </svg>
    </div>
  );
};

export default Logo;
