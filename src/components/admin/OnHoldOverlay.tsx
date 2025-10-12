import { AlertTriangle } from 'lucide-react';

interface OnHoldOverlayProps {
  className?: string;
  variant?: 'banner' | 'professional';
  message?: string;
}

export const OnHoldOverlay = ({ 
  className = "", 
  variant = 'professional',
  message = "This feature is currently in development and will be available in a future update."
}: OnHoldOverlayProps) => {
  // Professional card-based styling (default)
  if (variant === 'professional') {
    return (
      <div className={`absolute inset-0 rounded-lg overflow-hidden pointer-events-none ${className}`}>
        {/* Warning indicator in top-right */}
        <div className="absolute top-3 right-3 sm:top-4 sm:right-4 flex items-center gap-1.5 sm:gap-2 text-yellow-500 z-10">
          <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5" />
          <span className="font-bold text-xs sm:text-sm">ON HOLD</span>
        </div>
        
        {/* Explanatory message at bottom */}
        {message && (
          <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 text-xs sm:text-sm text-muted-foreground z-10">
            {message}
          </div>
        )}
      </div>
    );
  }

  // Diagonal banner variant (legacy)
  return (
    <div className={`absolute inset-0 rounded-lg overflow-hidden pointer-events-none ${className}`}>
      {/* Semi-transparent overlay */}
      <div className="absolute inset-0 bg-background/30 z-[9]" />
      
      {/* Diagonal "ON HOLD" banner */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div 
          className="bg-destructive text-destructive-foreground font-bold text-lg sm:text-xl md:text-2xl py-2 px-16 sm:px-20 md:px-24 -rotate-45 shadow-lg whitespace-nowrap"
          style={{ transformOrigin: 'center' }}
        >
          ON HOLD
        </div>
      </div>
    </div>
  );
};
