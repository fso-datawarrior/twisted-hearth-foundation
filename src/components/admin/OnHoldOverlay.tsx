import { AlertTriangle } from 'lucide-react';

interface OnHoldOverlayProps {
  className?: string;
  message?: string;
}

export const OnHoldOverlay = ({ 
  className = "", 
  message
}: OnHoldOverlayProps) => {
  return (
    <>
      {/* Warning indicator in top-right */}
      <div className={`absolute top-3 right-3 sm:top-4 sm:right-4 flex items-center gap-1.5 sm:gap-2 text-yellow-500 z-10 pointer-events-none ${className}`}>
        <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5" />
        <span className="font-bold text-xs sm:text-sm">ON HOLD</span>
      </div>
      
      {/* Explanatory message at bottom */}
      {message && (
        <div className="mt-2 pt-2 border-t border-border text-xs sm:text-sm text-muted-foreground">
          {message}
        </div>
      )}
    </>
  );
};
