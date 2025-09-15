import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth";
import { useDeveloperMode } from "@/contexts/DeveloperModeContext";
import { useHunt } from "./HuntProvider";
import { useProximity } from "@/hooks/use-proximity";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { HUNT_ENABLED, HUNT_DEBUG_MODE, HUNT_PROXIMITY } from "./hunt-config";
import { getRunePath, getRuneInfo, getRuneHint } from "./rune-mapping";

type Props = {
  id: string;
  label: string;
  hint?: string;
  className?: string;
  bonus?: boolean;
};

// Rune image paths are now handled by the rune-mapping module

export default function HuntRune({ id, label, hint, className, bonus = false }: Props) {
  const { user } = useAuth();
  const { isDeveloperMode } = useDeveloperMode();
  const { isFound, markFound, progress, total } = useHunt();
  const { ref, near, prefersReduced, isTouch } = useProximity(HUNT_PROXIMITY.RADIUS);
  const [localToast, setLocalToast] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [hasBeenSeen, setHasBeenSeen] = useState(false);
  const [isCurrentlyVisible, setIsCurrentlyVisible] = useState(false);
  const [shouldTriggerSinglePulse, setShouldTriggerSinglePulse] = useState(false);
  const { toast } = useToast();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const singlePulseTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const runeInfo = getRuneInfo(id);
  const runeHint = getRuneHint(id);
  const runePath = getRunePath(id);
  const found = isFound(id);

  // Enhanced visibility logic - Use developer mode context
  const getBaseVisibility = () => {
    // Check for debug mode first
    if (typeof window !== 'undefined' && document.body.classList.contains('hunt-debug-show-all')) {
      return "opacity-100"; // Show all runes when debug mode is on
    }
    if (isDeveloperMode) {
      return "opacity-100"; // Show all runes when developer mode is on
    }
    if (HUNT_DEBUG_MODE) {
      return "opacity-80"; // Debug mode - slightly visible
    }
    if (isTouch) {
      return "opacity-40"; // Touch devices
    }
    if (near) {
      return "opacity-100"; // Near proximity
    }
    return "opacity-0"; // Hidden
  };

  const baseVis = getBaseVisibility();

  // Track visibility changes for first-time detection
  useEffect(() => {
    const isVisible = baseVis !== "opacity-0";
    const wasVisible = isCurrentlyVisible;
    
    setIsCurrentlyVisible(isVisible);
    
    // First time becoming visible
    if (isVisible && !wasVisible && !hasBeenSeen && !found) {
      setHasBeenSeen(true);
      setShouldTriggerSinglePulse(true);
      
      // Clear single pulse after animation
      singlePulseTimeoutRef.current = setTimeout(() => {
        setShouldTriggerSinglePulse(false);
      }, 2000);
    }
  }, [baseVis, isCurrentlyVisible, hasBeenSeen, found]);

  // 5-second interval pulse for unfound runes
  useEffect(() => {
    if (found || !isCurrentlyVisible) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Start interval for regular pulsing
    intervalRef.current = setInterval(() => {
      if (isCurrentlyVisible && !found) {
        // Trigger pulse animation
        setShouldTriggerSinglePulse(true);
        setTimeout(() => setShouldTriggerSinglePulse(false), 2000);
      }
    }, 5000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [found, isCurrentlyVisible]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (singlePulseTimeoutRef.current) {
        clearTimeout(singlePulseTimeoutRef.current);
      }
    };
  }, []);

  const handle = () => {
    if (!found && user) {
      markFound(id);
      const message = bonus ? "Bonus secret found!" : "Secret found!";
      const description = bonus ? label : `${label} — ${progress + 1} / ${total}`;
      
      toast({
        title: message,
        description: description,
      });
      setLocalToast(true);
      setTimeout(() => setLocalToast(false), 1200);
    }
  };

  const animationDelay = parseInt(id, 10) * 0.3; // Stagger animations

  // Get hint dot classes
  const getHintClasses = () => {
    if (!runeHint) {
      return "";
    }
    
    return cn(
      "absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-0",
      runeHint.shape === 'circle' && "hint-shape-circle",
      runeHint.shape === 'oval' && "hint-shape-oval", 
      runeHint.shape === 'square' && "hint-shape-square",
      runeHint.size === 'small' && "hint-size-small",
      runeHint.size === 'medium' && "hint-size-medium",
      runeHint.size === 'large' && "hint-size-large",
      runeHint.color,
      runeHint.pulseIntensity === 'subtle' && "pulse-intensity-subtle",
      runeHint.pulseIntensity === 'medium' && "pulse-intensity-medium",
      runeHint.pulseIntensity === 'bright' && "pulse-intensity-bright"
    );
  };

  // Animation states
  const getAnimationProps = () => {
    // Developer mode - show all runes statically (no pulsing)
    if (isDeveloperMode) {
      return {
        opacity: HUNT_PROXIMITY.OPACITY.DEBUG,
      };
    }
    
    // Normal behavior - static display
    if (prefersReduced) {
      return {
        opacity: found ? 1 : (near ? HUNT_PROXIMITY.OPACITY.NEAR * 0.3 : 0)
      };
    }
    
    // Found runes - static display
    if (found) {
      return {
        opacity: 1,
      };
    }
    
    // Unfound runes - proximity-based static display
    const baseOpacity = near ? HUNT_PROXIMITY.OPACITY.NEAR : 0;
    return {
      opacity: baseOpacity,
    };
  };

  // Don't render runes for unauthenticated users (unless in debug mode)
  if (!user && !document.body.classList.contains('hunt-debug-show-all')) {
    return (
      <div 
        ref={ref as React.RefObject<HTMLDivElement>}
        className={cn(
          "hunt-rune-placeholder h-10 w-10 rounded-full opacity-20 cursor-pointer",
          "hover:opacity-60 transition-opacity",
          className
        )}
        onClick={() => {
          toast({
            title: "Authentication Required",
            description: "Please sign in to discover runes",
            variant: "destructive",
          });
        }}
        title="Sign in to discover runes"
      >
        <div className="w-full h-full flex items-center justify-center text-xs font-mono text-muted-foreground">
          ?
        </div>
      </div>
    );
  }

  if (!HUNT_ENABLED) {
    return null;
  }

  return (
    <div className="relative">
      <motion.button
        ref={ref as React.RefObject<HTMLButtonElement>}
        type="button"
        aria-label={runeInfo?.name || label}
        aria-pressed={found}
        onClick={handle}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") { 
            e.preventDefault(); 
            handle(); 
          }
        }}
        className={cn(
          "hunt-rune transition outline-none motion-reduce:transition-none",
          "hover:opacity-100 focus-visible:opacity-100",
          baseVis,
          className
        )}
        title={runeInfo?.description || hint || runeInfo?.name}
        initial={{ opacity: 0 }}
        animate={getAnimationProps()}
        transition={{
          delay: animationDelay,
        }}
      >
        {/* Hint dot - always present when visible and not found, OR in debug mode */}
        {!found && (baseVis !== "opacity-0" || isDeveloperMode) && runeHint && (
          <div className={getHintClasses()} />
        )}
        
        {/* Rune image - when found OR in debug mode */}
        {(found || (typeof window !== 'undefined' && document.body.classList.contains('hunt-debug-show-all'))) && !imageError && (
          <img 
            src={runePath}
            alt={runeInfo?.name || `Rune ${id}`}
            className={cn(
              "pointer-events-none rune-image max-w-16 max-h-16 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10",
              found 
                ? "brightness-120 drop-shadow-[0_0_4px_rgba(197,164,93,0.8)]" 
                : "brightness-90 drop-shadow-[0_0_4px_rgba(59,110,71,0.6)]"
            )}
            onError={() => setImageError(true)}
            onLoad={() => setImageError(false)}
          />
        )}
        
        {/* Fallback placeholder */}
        {imageError && (
          <div 
            className={cn(
              "min-h-10 min-w-10 flex items-center justify-center text-xs font-mono",
              "bg-muted/20 rounded-full border border-dashed border-muted/40",
              found ? "text-accent-gold" : "text-muted-foreground"
            )}
            title={runeInfo?.name || `Rune ${id} (image failed to load)`}
          >
            {runeInfo?.name?.charAt(0) || id}
          </div>
        )}
      </motion.button>
      
      {localToast && (
        <div className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-black/70 px-2 py-1 text-xs text-white shadow-md">
          {bonus ? "Bonus secret!" : "Secret found!"}
        </div>
      )}
    </div>
  );
}