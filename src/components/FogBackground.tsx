import { useEffect, useRef } from "react";

interface FogBackgroundProps {
  className?: string;
}

export default function FogBackground({ className = "" }: FogBackgroundProps) {
  const fogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fog = fogRef.current;
    if (!fog) {
      return;
    }
    
    const updateMousePosition = (e: MouseEvent) => {
      const rect = fog.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      
      fog.style.setProperty('--mouse-x', `${x}%`);
      fog.style.setProperty('--mouse-y', `${y}%`);
    };

    fog.addEventListener('mousemove', updateMousePosition);
    
    return () => {
      fog.removeEventListener('mousemove', updateMousePosition);
    };
  }, []);

  return (
    <div 
      ref={fogRef}
      className={`pointer-events-none absolute inset-0 smoky-fog ${className}`}
    />
  );
}
