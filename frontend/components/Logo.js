export default function Logo({ className = "", width = 400, height = 120 }) {
  return (
    <svg 
      width={width} 
      height={height} 
      viewBox="0 0 400 120" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Background */}
      <rect width="400" height="120" fill="#0d9488" rx="8"/>
      
      {/* Main text BGFA */}
      <text 
        x="200" 
        y="45" 
        fontFamily="Arial, sans-serif" 
        fontSize="32" 
        fontWeight="bold" 
        textAnchor="middle" 
        fill="white"
      >
        BGFA
      </text>
      
      {/* Subtitle */}
      <text 
        x="200" 
        y="68" 
        fontFamily="Arial, sans-serif" 
        fontSize="14" 
        textAnchor="middle" 
        fill="#ccfbf1"
      >
        Bridging Gaps
      </text>
      
      {/* Subtitle */}
      <text 
        x="200" 
        y="85" 
        fontFamily="Arial, sans-serif" 
        fontSize="14" 
        textAnchor="middle" 
        fill="#ccfbf1"
      >
        Fostering Agency
      </text>
      
      {/* Decorative elements */}
      <circle cx="50" cy="60" r="20" fill="#14b8a6" opacity="0.6"/>
      <circle cx="350" cy="60" r="20" fill="#14b8a6" opacity="0.6"/>
      
      {/* Bridge-like connecting element */}
      <path 
        d="M 70 60 Q 200 30 330 60" 
        stroke="#14b8a6" 
        strokeWidth="3" 
        fill="none" 
        opacity="0.8"
      />
    </svg>
  );
} 