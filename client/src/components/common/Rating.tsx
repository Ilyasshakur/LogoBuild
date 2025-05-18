import { Star, StarHalf } from "lucide-react";

interface RatingProps {
  value: number;
  count?: number;
  showCount?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const Rating = ({ 
  value, 
  count = 0, 
  showCount = true, 
  size = "sm",
  className = ""
}: RatingProps) => {
  // Round to nearest half
  const roundedValue = Math.round(value * 2) / 2;
  
  // Determine icon size based on prop
  const iconSize = {
    sm: 16,
    md: 20,
    lg: 24
  }[size];
  
  // Determine text size based on prop
  const textSize = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base"
  }[size];
  
  return (
    <div className={`flex items-center ${className}`}>
      <div className="flex text-secondary">
        {[1, 2, 3, 4, 5].map((star) => {
          if (star <= roundedValue) {
            // Full star
            return <Star key={star} size={iconSize} fill="currentColor" />;
          } else if (star - 0.5 === roundedValue) {
            // Half star
            return <StarHalf key={star} size={iconSize} fill="currentColor" />;
          } else {
            // Empty star
            return <Star key={star} size={iconSize} />;
          }
        })}
      </div>
      {showCount && count > 0 && (
        <span className={`${textSize} text-neutral-500 ml-1`}>({count})</span>
      )}
    </div>
  );
};

export default Rating;
