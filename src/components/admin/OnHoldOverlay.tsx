import { AlertTriangle } from 'lucide-react';

interface OnHoldOverlayProps {
  className?: string;
}

export const OnHoldOverlay = ({ className = "" }: OnHoldOverlayProps) => {
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
