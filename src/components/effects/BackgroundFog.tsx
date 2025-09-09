import { useEffect, useRef } from "react";
import { usePageVisibility } from "@/hooks/usePageVisibility";

interface BackgroundFogProps {
  intensity?: "low" | "md" | "high";
  speed?: "slow" | "medium" | "fast";
  tint?: "slate" | "purple" | "gold";
  force?: boolean; // Force fog even on mobile
}

export function BackgroundFog({ 
  intensity = "md", 
  speed = "slow", 
  tint = "slate",
  force = false 
}: BackgroundFogProps) {
  const fogRef = useRef<HTMLDivElement>(null);
  const isVisible = usePageVisibility();

  // Check for reduced motion preference
  const prefersReduced = typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Check if mobile (< 480px) and not forced
  const isMobile = typeof window !== "undefined" && window.innerWidth < 480;
  const shouldUseStatic = (isMobile && !force) || prefersReduced;

  useEffect(() => {
    if (!fogRef.current || shouldUseStatic) return;

    const fog = fogRef.current;
    let animationId: number;

    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      
      fog.style.setProperty('--mouse-x', `${x}%`);
      fog.style.setProperty('--mouse-y', `${y}%`);
    };

    if (isVisible) {
      window.addEventListener('mousemove', handleMouseMove, { passive: true });
    }

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isVisible, shouldUseStatic]);

  const getIntensityClass = () => {
    switch (intensity) {
      case "low": return "fog-intensity-low";
      case "high": return "fog-intensity-high";
      default: return "fog-intensity-md";
    }
  };

  const getSpeedClass = () => {
    switch (speed) {
      case "fast": return "fog-speed-fast";
      case "medium": return "fog-speed-medium";
      default: return "fog-speed-slow";
    }
  };

  const getTintClass = () => {
    switch (tint) {
      case "purple": return "fog-tint-purple";
      case "gold": return "fog-tint-gold";
      default: return "fog-tint-slate";
    }
  };

  useEffect(() => {
    console.log(`🌫️ BackgroundFog mounted with intensity: ${intensity}, speed: ${speed}, tint: ${tint}`);
  }, []);

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 1,
        overflow: 'hidden',
      }}
    >
      <div
        ref={fogRef}
        className={`
          fog-background
          ${getIntensityClass()}
          ${shouldUseStatic ? 'fog-static' : getSpeedClass()}
          ${getTintClass()}
          ${!isVisible ? 'fog-paused' : ''}
        `}
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          contain: 'paint',
          zIndex: 1,
          '--mouse-x': '50%',
          '--mouse-y': '50%',
        } as React.CSSProperties}
      />
    </div>
  );
}