import React from 'react';
import { motion } from 'framer-motion';
import { HuntHint } from './HuntSystem';

interface VignetteCardProps {
  title: string;
  subtitle: string;
  hook: string;
  imageUrl: string;
  huntHint?: {
    id: string;
    hint: string;
    found: boolean;
    onFound: (id: string) => void;
  };
  className?: string;
}

export const VignetteCard: React.FC<VignetteCardProps> = ({
  title,
  subtitle,
  hook,
  imageUrl,
  huntHint,
  className = ''
}) => {
  return (
    <motion.div
      className={`
        vignette-card glassmorphism-card
        hover-tilt motion-safe:hover:scale-105
        rounded-lg overflow-hidden
        transition-all duration-300
        ${className}
      `}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="vignette-card__content p-6">
        <div className="relative">
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-48 object-cover rounded-lg mb-4"
            loading="lazy"
          />
          
          {huntHint && (
            <HuntHint
              id={huntHint.id}
              hint={huntHint.hint}
              found={huntHint.found}
              onFound={huntHint.onFound}
              className="absolute top-2 right-2"
            >
              <div className="w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center text-accent hover:bg-accent/30 transition-colors">
                <span className="text-lg">🔍</span>
              </div>
            </HuntHint>
          )}
        </div>

        <div className="space-y-3">
          <h3 className="text-xl font-heading text-foreground">
            {title}
          </h3>
          
          <h4 className="text-lg font-subhead text-accent">
            {subtitle}
          </h4>
          
          <p className="text-muted-foreground leading-relaxed">
            {hook}
          </p>
        </div>

        <motion.button
          className="mt-4 w-full bg-primary/10 hover:bg-primary/20 text-primary px-4 py-2 rounded-lg transition-colors focus-ring"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          View Teaser
        </motion.button>
      </div>
    </motion.div>
  );
};

// Vignette Grid Component with Modern CSS Grid
interface VignetteGridProps {
  vignettes: Array<{
    id: string;
    title: string;
    subtitle: string;
    hook: string;
    imageUrl: string;
    huntHint?: {
      id: string;
      hint: string;
      found: boolean;
      onFound: (id: string) => void;
    };
  }>;
  className?: string;
}

export const VignetteGrid: React.FC<VignetteGridProps> = ({
  vignettes,
  className = ''
}) => {
  return (
    <div className={`vignette-grid ${className}`}>
      {vignettes.map((vignette, index) => (
        <VignetteCard
          key={vignette.id}
          {...vignette}
          className="animate-fade-in-up"
          style={{ animationDelay: `${index * 0.1}s` }}
        />
      ))}
    </div>
  );
};
