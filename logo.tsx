import { FC } from "react";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  withText?: boolean;
}

const Logo: FC<LogoProps> = ({ className, size = "md", withText = true }) => {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-10 w-10"
  };

  return (
    <div className={cn("flex items-center", className)}>
      <svg 
        className={cn("text-primary", sizeClasses[size])} 
        fill="currentColor" 
        viewBox="0 0 24 24"
      >
        <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm3.5 12.09l-1.41 1.41L12 13.42 9.91 15.5 8.5 14.09 10.59 12 8.5 9.91 9.91 8.5 12 10.59l2.09-2.09 1.41 1.41L13.42 12l2.08 2.09z"></path>
      </svg>
      {withText && (
        <span className={cn(
          "ml-2 font-bold text-primary",
          size === "sm" ? "text-lg" : size === "md" ? "text-xl" : "text-2xl"
        )}>
          Signhey
        </span>
      )}
    </div>
  );
};

export default Logo;
