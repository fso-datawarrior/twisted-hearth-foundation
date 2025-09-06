import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CardProps {
  variant?: "vignette" | "costume" | "default";
  image?: string;
  title: string;
  hook?: string;
  onClick?: () => void;
  className?: string;
  children?: ReactNode;
}

const Card = ({ 
  variant = "default", 
  image, 
  title, 
  hook, 
  onClick, 
  className,
  children 
}: CardProps) => {
  const baseClasses = "bg-card rounded-lg border overflow-hidden transition-all motion-safe cursor-pointer";
  
  const variantClasses = {
    vignette: "border-accent-purple/30 hover:border-accent-gold/50 hover:scale-105",
    costume: "border-accent-green/30 hover:border-accent-red/50 hover:scale-105",
    default: "border-accent-purple/30 hover:border-accent-gold/50"
  };

  return (
    <div 
      className={cn(baseClasses, variantClasses[variant], className)}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      } : undefined}
      aria-label={onClick ? `View details for ${title}` : undefined}
    >
      {image && (
        <div className="aspect-video overflow-hidden">
          <img 
            src={image} 
            alt={title}
            className="w-full h-full object-cover transition-transform motion-safe hover:scale-110"
          />
        </div>
      )}
      
      <div className="p-6">
        <h3 className="font-subhead text-xl mb-3 text-accent-gold">
          {title}
        </h3>
        
        {hook && (
          <p className="font-body text-muted-foreground text-sm mb-4">
            {hook}
          </p>
        )}
        
        {children}
      </div>
    </div>
  );
};

export default Card;