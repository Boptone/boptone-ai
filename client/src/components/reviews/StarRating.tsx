import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
  showCount?: boolean;
  reviewCount?: number;
}

/**
 * StarRating Component
 * 
 * Displays star ratings with optional interactivity for user input.
 * Supports half-star display for average ratings.
 */
export function StarRating({
  rating,
  maxRating = 5,
  size = "md",
  interactive = false,
  onRatingChange,
  showCount = false,
  reviewCount = 0,
}: StarRatingProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  const handleClick = (starIndex: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(starIndex + 1);
    }
  };

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: maxRating }).map((_, index) => {
          const starValue = index + 1;
          const isFilled = starValue <= rating;
          const isHalfFilled = !isFilled && starValue - 0.5 <= rating;

          return (
            <button
              key={index}
              type="button"
              disabled={!interactive}
              onClick={() => handleClick(index)}
              className={cn(
                "relative",
                interactive && "cursor-pointer hover:scale-110 transition-transform",
                !interactive && "cursor-default"
              )}
              aria-label={`${starValue} star${starValue > 1 ? "s" : ""}`}
            >
              {/* Half-filled star (for average ratings) */}
              {isHalfFilled && !interactive && (
                <div className="absolute inset-0 overflow-hidden" style={{ width: "50%" }}>
                  <Star
                    className={cn(sizeClasses[size], "fill-yellow-400 text-yellow-400")}
                  />
                </div>
              )}
              
              {/* Full star */}
              <Star
                className={cn(
                  sizeClasses[size],
                  isFilled
                    ? "fill-yellow-400 text-yellow-400"
                    : "fill-none text-gray-300",
                  isHalfFilled && !interactive && "fill-none text-gray-300"
                )}
              />
            </button>
          );
        })}
      </div>

      {showCount && reviewCount > 0 && (
        <span className="text-sm text-muted-foreground ml-1">
          ({reviewCount.toLocaleString()})
        </span>
      )}
    </div>
  );
}
