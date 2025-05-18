
const Logo = () => {
  return (
    <div className="w-10 h-10 flex items-center justify-center">
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 500 500" 
        fill="currentColor" 
        className="w-10 h-10"
      >
        <path d="M250,150 L375,200 L375,220 L125,220 L125,200 Z" />
        <path d="M125,220 L100,250 L400,250 L375,220 Z" />
        <path d="M100,250 L150,350 L350,350 L400,250 Z" />
        <rect x="170" y="270" width="30" height="60" rx="5" />
        <rect x="235" y="270" width="30" height="60" rx="5" />
        <rect x="300" y="270" width="30" height="60" rx="5" />
      </svg>
    </div>
  );
};

export default Logo;
