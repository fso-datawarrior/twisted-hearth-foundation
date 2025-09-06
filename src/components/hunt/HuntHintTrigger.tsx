import { useState, useEffect } from "react";
import { useHunt } from "./HuntProvider";
import { HUNT_ENABLED } from "./hunt-config";

type Props = {
  id: string;
  label: string;
  hint?: string;
  className?: string;
};

export default function HuntHintTrigger({ id, label, hint, className = "" }: Props) {
  const { isFound, markFound } = useHunt();
  const [showTooltip, setShowTooltip] = useState(false);
  const [justFound, setJustFound] = useState(false);
  const found = isFound(id);

  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!HUNT_ENABLED) return null;

  const handleActivate = () => {
    if (!found) {
      markFound(id);
      setJustFound(true);
      setShowTooltip(true);
      
      // Hide tooltip after 2 seconds
      setTimeout(() => {
        setShowTooltip(false);
      }, 2000);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleActivate();
    }
    if (e.key === "Escape") {
      setShowTooltip(false);
    }
  };

  useEffect(() => {
    if (justFound) {
      // Reset the justFound state after animation
      const timer = setTimeout(() => setJustFound(false), 500);
      return () => clearTimeout(timer);
    }
  }, [justFound]);

  return (
    <div className={`relative ${className}`}>
      <button
        role="button"
        tabIndex={0}
        aria-label={label}
        title={hint}
        className={`
          h-5 w-5 rounded-full transition-all duration-300 cursor-pointer
          focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold
          ${
            found
              ? "bg-accent-green/80 ring-2 ring-accent-green shadow-[0_0_15px_rgba(59,110,71,0.8)]"
              : "bg-accent-green/40 ring-1 ring-accent-green/70 shadow-[0_0_10px_rgba(59,110,71,0.6)]"
          }
          hover:bg-accent-green/60 hover:ring-accent-green hover:shadow-[0_0_15px_rgba(59,110,71,0.8)]
          ${!prefersReducedMotion && justFound ? "animate-scale-in" : ""}
          ${!prefersReducedMotion ? "motion-safe:hover:scale-110" : ""}
        `}
        onClick={handleActivate}
        onKeyDown={handleKeyDown}
        onMouseEnter={() => hint && setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onFocus={() => hint && setShowTooltip(true)}
        onBlur={() => setShowTooltip(false)}
      >
        {found && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-xs text-white">✓</div>
          </div>
        )}
      </button>

      {/* Tooltip */}
      {showTooltip && (hint || justFound) && (
        <div
          className={`
            absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 
            bg-bg-2 text-ink text-xs rounded border border-accent-green/50 
            whitespace-nowrap z-50 shadow-lg
            ${!prefersReducedMotion ? "animate-fade-in" : ""}
          `}
        >
          {justFound ? "Secret found!" : hint}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-2 border-transparent border-t-bg-2"></div>
        </div>
      )}
    </div>
  );
}