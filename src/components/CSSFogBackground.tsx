import React, { useRef, useEffect } from 'react';

const CSSFogBackground: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 100;
        const y = ((event.clientY - rect.top) / rect.height) * 100;
        
        containerRef.current.style.setProperty('--mouse-x', `${x}%`);
        containerRef.current.style.setProperty('--mouse-y', `${y}%`);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div 
      ref={containerRef}
      className="css-fog-background"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,
        pointerEvents: 'none',
        background: `
          radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), 
            rgba(255, 255, 255, 0.06) 0%, 
            rgba(200, 200, 200, 0.06) 25%, 
            rgba(150, 150, 150, 0.06) 50%, 
            transparent 70%
          )
        `,
        animation: 'fogDrift 60s ease-in-out infinite, fogOpacityPulse 16s ease-in-out infinite 27s',
        opacity: 1
      }}
    >
      {/* Multiple fog layers for depth */}
      <div 
        className="fog-layer-1"
        style={{
          position: 'absolute',
          top: '-100%',
          left: '-100%',
          width: '300%',
          height: '300%',
          borderRadius: '50%',
          overflow: 'hidden',
          background: `
            radial-gradient(circle at 45% 45%, rgba(255, 255, 255, 0.06) 0%, transparent 50%)
          `,
          animation: 'fogSwirl1 60s ease-in-out infinite, fogOpacityPulse 16s ease-in-out infinite 0s',
          opacity: 0.05
        }}
      />
      <div 
        className="fog-layer-2"
        style={{
          position: 'absolute',
          top: '-100%',
          left: '-100%',
          width: '300%',
          height: '300%',
          borderRadius: '50%',
          overflow: 'hidden',
          background: `
            radial-gradient(circle at 55% 45%, rgba(255, 255, 255, 0.06) 0%, transparent 50%)
          `,
          animation: 'fogSwirl2 55s ease-in-out infinite, fogOpacityPulse 16s ease-in-out infinite 3s',
          opacity: 0.05
        }}
      />
      <div 
        className="fog-layer-3"
        style={{
          position: 'absolute',
          top: '-100%',
          left: '-100%',
          width: '300%',
          height: '300%',
          borderRadius: '50%',
          overflow: 'hidden',
          background: `
            radial-gradient(circle at 45% 55%, rgba(255, 255, 255, 0.06) 0%, transparent 50%)
          `,
          animation: 'fogSwirl3 50s ease-in-out infinite, fogOpacityPulse 16s ease-in-out infinite 6s',
          opacity: 0.05
        }}
      />
      <div 
        className="fog-layer-4"
        style={{
          position: 'absolute',
          top: '-100%',
          left: '-100%',
          width: '300%',
          height: '300%',
          borderRadius: '50%',
          overflow: 'hidden',
          background: `
            radial-gradient(circle at 55% 55%, rgba(255, 255, 255, 0.06) 0%, transparent 50%)
          `,
          animation: 'fogSwirl4 15s ease-in-out infinite, fogOpacityPulse 16s ease-in-out infinite 9s',
          opacity: 0.05
        }}
      />
      <div 
        className="fog-layer-5"
        style={{
          position: 'absolute',
          top: '-100%',
          left: '-100%',
          width: '300%',
          height: '300%',
          borderRadius: '50%',
          overflow: 'hidden',
          background: `
            radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.06) 0%, transparent 50%)
          `,
          animation: 'fogSwirl5 40s ease-in-out infinite, fogOpacityPulse 16s ease-in-out infinite 12s',
          opacity: 0.05
        }}
      />
      <div 
        className="fog-layer-6"
        style={{
          position: 'absolute',
          top: '-150%',
          left: '-150%',
          width: '400%',
          height: '400%',
          borderRadius: '50%',
          overflow: 'hidden',
          background: `
            radial-gradient(circle at 25% 25%, rgba(255, 255, 255, 0.06) 0%, transparent 50%)
          `,
          animation: 'fogSwirl4 45s ease-in-out infinite, fogOpacityPulse 16s ease-in-out infinite 15s',
          opacity: 0.1
        }}
      />
      <div 
        className="fog-layer-7"
        style={{
          position: 'absolute',
          top: '-150%',
          left: '-150%',
          width: '400%',
          height: '400%',
          borderRadius: '50%',
          overflow: 'hidden',
          background: `
            radial-gradient(circle at 75% 25%, rgba(255, 255, 255, 0.06) 0%, transparent 50%)
          `,
          animation: 'fogSwirl4 15s ease-in-out infinite, fogOpacityPulse 16s ease-in-out infinite 18s',
          opacity: 0.05
        }}
      />
      <div 
        className="fog-layer-8"
        style={{
          position: 'absolute',
          top: '-150%',
          left: '-150%',
          width: '400%',
          height: '400%',
          borderRadius: '50%',
          overflow: 'hidden',
          background: `
            radial-gradient(circle at 25% 75%, rgba(255, 255, 255, 0.06) 0%, transparent 50%)
          `,
          animation: 'fogSwirl4 15s ease-in-out infinite, fogOpacityPulse 16s ease-in-out infinite 21s',
          opacity: 0.05
        }}
      />
      <div 
        className="fog-layer-9"
        style={{
          position: 'absolute',
          top: '-150%',
          left: '-150%',
          width: '400%',
          height: '400%',
          borderRadius: '50%',
          overflow: 'hidden',
          background: `
            radial-gradient(circle at 75% 75%, rgba(255, 255, 255, 0.06) 0%, transparent 50%)
          `,
          animation: 'fogSwirl4 15s ease-in-out infinite, fogOpacityPulse 16s ease-in-out infinite 24s',
          opacity: 0.05
        }}
      />
    </div>
  );
};

export default CSSFogBackground;
