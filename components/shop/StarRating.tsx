"use client";

import { Star } from "lucide-react";
import { useState } from "react";

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
  showValue?: boolean;
  className?: string;
}

export default function StarRating({
  rating,
  maxRating = 5,
  size = "md",
  interactive = false,
  onRatingChange,
  showValue = false,
  className = "",
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0);

  const sizeMap = {
    sm: 14,
    md: 18,
    lg: 24,
  };

  const iconSize = sizeMap[size];
  const displayRating = interactive && hoverRating > 0 ? hoverRating : rating;

  const handleClick = (index: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(index);
    }
  };

  const handleMouseEnter = (index: number) => {
    if (interactive) {
      setHoverRating(index);
    }
  };

  const handleMouseLeave = () => {
    if (interactive) {
      setHoverRating(0);
    }
  };

  return (
    <div className={`flex items-center gap-0.5 ${className}`}>
      {Array.from({ length: maxRating }, (_, i) => {
        const index = i + 1;
        const isFilled = index <= displayRating;
        const isHalf = !isFilled && index - 0.5 <= displayRating;

        return (
          <button
            key={i}
            aria-label={`${index} star${index !== 1 ? "s" : ""}`}
            className={`
                            ${interactive ? "cursor-pointer hover:scale-110" : "cursor-default"}
                            transition-transform duration-150
                            focus:outline-none focus:ring-0
                            disabled:cursor-default
                        `}
            disabled={!interactive}
            type="button"
            onClick={() => handleClick(index)}
            onMouseEnter={() => handleMouseEnter(index)}
            onMouseLeave={handleMouseLeave}
          >
            <Star
              className={`
                                transition-colors duration-150
                                ${
                                  isFilled || isHalf
                                    ? "text-warning fill-warning"
                                    : "text-default-300"
                                }
                            `}
              fill={isFilled ? "currentColor" : isHalf ? "url(#half)" : "none"}
              size={iconSize}
            />
          </button>
        );
      })}

      {showValue && (
        <span
          className={`ml-2 font-medium text-default-600 ${size === "sm" ? "text-xs" : size === "lg" ? "text-base" : "text-sm"}`}
        >
          {rating.toFixed(1)}
        </span>
      )}

      {/* SVG gradient for half stars */}
      <svg className="absolute" height="0" width="0">
        <defs>
          <linearGradient id="half">
            <stop offset="50%" stopColor="currentColor" />
            <stop offset="50%" stopColor="transparent" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
