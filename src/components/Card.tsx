import { ReactNode, useState } from "react";
import { cn } from "@/lib/utils";

interface CardProps {
  variant?: "vignette" | "costume" | "default";
  image?: string;
  video?: string;
  videoPosition?: "top" | "center" | "bottom";
  title: string;
  hook?: string;
  onClick?: () => void;
  className?: string;
  children?: ReactNode;
}

const Card = ({ 
  variant = "default", 
  image, 
  video,
  videoPosition = "center",
  title, 
  hook, 
  onClick, 
  className,
  children 
}: CardProps) => {
  const [imgReady, setImgReady] = useState(false);
  const baseClasses = "group relative rounded-2xl bg-black/90 backdrop-blur-sm shadow/50 transition cursor-pointer overflow-hidden";
  
  const variantClasses = {
    vignette: "border border-accent-purple/30 focus-within:ring-2 focus-within:ring-[--accent-gold] active:border-accent-gold/30 active:shadow-md [@media(hover:hover)]:hover:shadow-[0_0_30px_rgba(59,110,71,0.25)] [@media(hover:hover)]:motion-safe:hover:-translate-y-0.5",
    costume: "border border-accent-green/30 focus-within:ring-2 focus-within:ring-[--accent-gold] active:border-accent-gold/30 active:shadow-md [@media(hover:hover)]:hover:shadow-[0_0_30px_rgba(59,47,74,0.25)] [@media(hover:hover)]:motion-safe:hover:-translate-y-0.5",
    default: "border border-accent-purple/30 focus-within:ring-2 focus-within:ring-[--accent-gold] active:border-accent-gold/30 active:shadow-md [@media(hover:hover)]:hover:shadow-[0_0_30px_rgba(197,164,93,0.25)] [@media(hover:hover)]:motion-safe:hover:-translate-y-0.5"
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
      {(image || video) && (
        <div className="aspect-video overflow-hidden relative min-h-[200px]">
          {video ? (
            <video 
              src={video} 
              autoPlay
              loop
              muted
              playsInline
              className={cn(
                "w-full h-full object-cover transition-all motion-safe hover:scale-110",
                videoPosition === "top" && "object-top",
                videoPosition === "bottom" && "object-bottom"
              )}
              aria-label={title}
            />
          ) : (
            <>
              <img 
                src={image} 
                alt={title}
                loading="lazy"
                decoding="async"
                width="400"
                height="225"
                onLoad={() => setImgReady(true)}
                className={cn(
                  "w-full h-full object-cover transition-all motion-safe hover:scale-110",
                  imgReady ? "opacity-100" : "opacity-0"
                )}
              />
              {!imgReady && (
                <div className="absolute inset-0 animate-pulse rounded bg-white/5" aria-hidden="true" />
              )}
            </>
          )}
        </div>
      )}
      
      <div className="p-6 bg-black/95 backdrop-blur-sm">
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