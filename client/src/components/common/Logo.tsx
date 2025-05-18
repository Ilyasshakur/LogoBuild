
const Logo = () => {
  return (
    <div className="w-10 h-10 flex items-center justify-center">
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 500 500" 
        fill="currentColor" 
        className="w-10 h-10"
      >
        {/* Shopping basket logo */}
        <path d="M250,100 L125,200 L375,200 Z" />
        <path d="M125,200 L100,230 L400,230 L375,200 Z" />
        <path d="M100,230 L150,350 L350,350 L400,230 Z" />
        <rect x="170" y="250" width="40" height="80" rx="10" />
        <rect x="230" y="250" width="40" height="80" rx="10" />
        <rect x="290" y="250" width="40" height="80" rx="10" />
      </svg>
    </div>
  );
};

export default Logo;
