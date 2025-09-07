import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";

export function NavThemeIcon({ className }: { className?: string }) {
  return (
    <div className={cn("relative h-full w-full", className)}>
      {/* shimmer hook (extend later if desired) */}
      <svg className="absolute inset-0 h-0 w-0">
        <filter id="mirror-shimmer">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="1" seed="2" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="0" />
        </filter>
      </svg>
      <Sparkles className="h-full w-full p-1 text-amber-100/80 drop-shadow-sm" />
    </div>
  );
}