import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface HeroVideoProps {
  src?: string;
  poster?: string;
  headline: string;
  tagline?: string;
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
  cta,
  className 
}: HeroVideoProps) => {
  return (
    <section className={cn("relative min-h-screen flex items-center justify-center overflow-hidden", className)}>
      {/* Background Video or Image */}
      {src ? (
        <video
          autoPlay
          muted
          loop
          playsInline
          poster={poster}
          className="absolute inset-0 w-full h-full object-cover z-0"
          aria-hidden="true"
        >
          <source src={src} type="video/mp4" />
          {/* TODO: Add captions track for accessibility */}
        </video>
      ) : poster ? (
        <div 
          className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat z-0"
          style={{ backgroundImage: `url(${poster})` }}
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
        
        {cta && (
          <div className="animate-fade-in animation-delay-600">
            <Button
              asChild
              size="lg"
              className="bg-accent-red hover:bg-accent-red/80 text-ink font-subhead text-lg px-12 py-4 glow-gold hover:scale-105 transition-all motion-safe"
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