import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";

interface HeroVideoProps {
  src?: string;
  poster?: string;
  headline: string;
  tagline?: string;
  rotatingLines?: string[];
  cta?: {
    label: string;
    href: string;
  };
  className?: string;
}

const HeroVideo = ({ 
  src, 
  poster, 
  headline, 
  tagline, 
  rotatingLines = [],
  cta,
  className 
}: HeroVideoProps) => {
  const [isMuted, setIsMuted] = useState(true);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Rotate teaser lines every 4.5s
  React.useEffect(() => {
    if (rotatingLines.length === 0 || isPaused) return;
    
    const interval = setInterval(() => {
      setCurrentLineIndex((prev) => (prev + 1) % rotatingLines.length);
    }, 4500);
    
    return () => clearInterval(interval);
  }, [rotatingLines.length, isPaused]);

  const handleUnmute = () => {
    if (videoRef.current) {
      videoRef.current.muted = false;
      setIsMuted(false);
    }
  };
  return (
    <section className={cn("relative min-h-screen flex items-center justify-center overflow-hidden", className)}>
      {/* Background Video or Image */}
      {src && !window.matchMedia('(prefers-reduced-motion: reduce)').matches ? (
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          poster={poster}
          preload="metadata"
          className="absolute inset-0 w-full h-full object-cover z-0"
          aria-hidden="true"
          width="1920"
          height="1080"
        >
          <source src={src} type="video/mp4" />
          <track 
            kind="captions" 
            src="/captions/hero-captions.vtt" 
            srcLang="en" 
            label="English captions"
            default 
          />
          {/* TODO: Add actual captions file */}
        </video>
      ) : poster ? (
        <div 
          className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat z-0"
          style={{ 
            backgroundImage: `url(${poster})`,
            backgroundAttachment: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'scroll' : 'fixed'
          }}
          aria-hidden="true"
        />
      ) : (
        <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-bg via-bg-2 to-accent-purple/20 z-0" />
      )}
      
      {/* Overlay */}
      <div 
        className="absolute inset-0 z-10"
        style={{ backgroundColor: 'var(--hero-overlay)' }}
      />
      
      {/* Unmute Button */}
      {src && !window.matchMedia('(prefers-reduced-motion: reduce)').matches && (
        <Button
          variant="ghost"
          size="icon"
          onClick={handleUnmute}
          className={cn(
            "absolute top-4 right-4 z-30 text-ink/80 hover:text-accent-gold transition-opacity",
            !isMuted && "opacity-0 pointer-events-none"
          )}
          aria-label={isMuted ? "Unmute background video" : "Video is unmuted"}
        >
          {isMuted ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
        </Button>
      )}

      {/* Content */}
      <div className="relative z-20 text-center px-6 max-w-4xl mx-auto">
        <h1 className="font-heading text-5xl md:text-7xl lg:text-8xl mb-6 text-shadow-gothic animate-fade-in">
          <span className="block text-ink mb-2">{headline.split(' ').slice(0, 2).join(' ')}</span>
          <span className="block text-accent-gold">{headline.split(' ').slice(2).join(' ')}</span>
        </h1>
        
        {tagline && (
          <p className="font-subhead text-xl md:text-2xl text-muted-foreground mb-8 animate-fade-in animation-delay-300">
            {tagline}
          </p>
        )}

        {/* Rotating Teaser Lines */}
        {rotatingLines.length > 0 && (
          <div 
            className="mb-8 h-8 flex items-center justify-center animate-fade-in animation-delay-500"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <ul role="list" className="relative">
              {rotatingLines.map((line, index) => (
                <li
                  key={index}
                  className={cn(
                    "absolute inset-0 font-body text-sm md:text-base text-accent-gold/90 italic transition-opacity duration-700",
                    index === currentLineIndex ? "opacity-100" : "opacity-0"
                  )}
                  aria-live={index === currentLineIndex ? "polite" : "off"}
                  aria-atomic="true"
                >
                  {line}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {cta && (
          <div className="animate-fade-in animation-delay-600">
            <Button
              asChild
              size="lg"
              className="bg-accent-red hover:bg-accent-red/80 text-ink font-subhead text-lg px-12 py-4 glow-gold hover:scale-105 transition-all motion-safe"
              aria-label={`${cta.label} - Opens RSVP form`}
            >
              <a href={cta.href}>
                {cta.label}
              </a>
            </Button>
          </div>
        )}
      </div>
      
      {/* Accessibility: Skip to main content */}
      <a 
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 bg-accent-gold text-bg px-4 py-2 rounded focus-visible"
      >
        Skip to main content
      </a>
    </section>
  );
};

export default HeroVideo;