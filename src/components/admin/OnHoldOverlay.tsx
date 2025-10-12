import { AlertTriangle } from "lucide-react";

interface OnHoldOverlayProps {
  reason: string;
  children: React.ReactNode;
}

export function OnHoldOverlay({ reason, children }: OnHoldOverlayProps) {
  return (
    <div className="relative">
      {/* Underlying content (dimmed) */}
      <div className="opacity-40 pointer-events-none">
        {children}
      </div>
      
      {/* Overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-lg border-2 border-warning">
        <div className="text-center space-y-3 p-6 max-w-md">
          <div className="flex items-center justify-center gap-2 text-warning">
            <AlertTriangle className="h-8 w-8" />
            <span className="text-2xl font-bold">ON HOLD</span>
          </div>
          
          <p className="text-muted-foreground text-sm">
            {reason}
          </p>
          
          <p className="text-xs text-muted-foreground/70">
            This feature will be available in a future update
          </p>
        </div>
      </div>
    </div>
  );
}
