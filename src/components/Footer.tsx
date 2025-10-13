import { useState } from "react";

const TWISTED_QUOTES = [
  "👻 Mirror mirror on the wall... showed me my LinkedIn profile.",
  "😴 Sleeping Beauty hit snooze one too many times...",
  "🐺 The Big Bad Wolf just wanted to talk about your car's extended warranty.",
  "📶 Rapunzel's tower had terrible Wi-Fi.",
  "🎃 Cinderella's pumpkin carriage got towed at midnight.",
  "🧥 Little Red Riding Hood's grandmother was just really into fur coats.",
  "🏠 Hansel and Gretel found the gingerbread house on Zillow.",
  "⛏️ Snow White's seven dwarves formed a union.",
  "🐷 The Three Little Pigs filed an insurance claim.",
  "⭐ Goldilocks was just checking Airbnb reviews.",
  "💋 The prince's kiss came with terms and conditions...",
  "⏰ Happily ever after was just the free trial period.",
  "🍪 The witch's gingerbread was actually keto-friendly.",
  "🌹 Beauty's Beast was just having a really bad hair day.",
  "🧵 Rumpelstiltskin wanted payment in cryptocurrency.",
];

function HalloweenIcons() {
  const [activeQuote, setActiveQuote] = useState<string | null>(null);
  const [hoveredIcon, setHoveredIcon] = useState<string | null>(null);

  const getRandomQuote = () => {
    const randomIndex = Math.floor(Math.random() * TWISTED_QUOTES.length);
    return TWISTED_QUOTES[randomIndex];
  };

  const handleHover = (iconName: string) => {
    setHoveredIcon(iconName);
    setActiveQuote(getRandomQuote());
  };

  return (
    <div className="flex flex-col items-center gap-4 mb-6">
      {/* Icons */}
      <div className="flex justify-center gap-6 text-5xl">
        <span 
          className="cursor-pointer transition-all duration-300 hover:scale-125 hover:animate-shake text-orange-400 hover:text-orange-300"
          onMouseEnter={() => handleHover('ghost')}
          onMouseLeave={() => setHoveredIcon(null)}
          role="button"
          aria-label="Twisted fairytale ghost"
        >
          👻
        </span>
        <span 
          className="cursor-pointer transition-all duration-300 hover:scale-125 hover:animate-shake text-purple-400 hover:text-purple-300"
          onMouseEnter={() => handleHover('bat')}
          onMouseLeave={() => setHoveredIcon(null)}
          role="button"
          aria-label="Twisted fairytale bat"
        >
          🦇
        </span>
        <span 
          className="cursor-pointer transition-all duration-300 hover:scale-125 hover:animate-shake text-orange-500 hover:text-orange-400"
          onMouseEnter={() => handleHover('pumpkin')}
          onMouseLeave={() => setHoveredIcon(null)}
          role="button"
          aria-label="Twisted fairytale pumpkin"
        >
          🎃
        </span>
      </div>

      {/* Twisted Quote Display - Fixed height to prevent layout shift */}
      <div 
        className="text-center text-sm h-[4em] max-w-md px-4 flex items-center justify-center"
        style={{ 
          fontFamily: 'Creepster, cursive',
          color: '#c084fc',
          textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
        }}
      >
        {hoveredIcon && activeQuote && (
          <span className="animate-type-in">
            {activeQuote}
          </span>
        )}
      </div>
    </div>
  );
}

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-bg-2 border-t border-accent-purple/30 py-6 px-6 pb-[max(env(safe-area-inset-bottom),1rem)]">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center">
          {/* Halloween Icons with Hover Quotes */}
          <HalloweenIcons />
          
          {/* Event Title */}
          <h2 className="font-heading text-xl mb-3 text-accent-gold">
            The Ruths' Twisted Fairytale Halloween Bash
          </h2>
          
          {/* Hosts */}
          <p className="font-subhead text-base mb-4 text-muted-foreground">
            Hosted by Jamie & Kat Ruth
          </p>
          
          {/* Website Links */}
          <div className="mb-4 space-y-2">
            <div className="flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-4 text-sm">
              <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-2">
                <span className="text-muted-foreground">👑 This year's twisted tales:</span>
                <a 
                  href="https://2025.partytillyou.rip" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-amber-400 hover:text-amber-300 hover:underline transition-all font-semibold"
                >
                  2025.partytillyou.rip
                </a>
                <span className="text-xs text-muted-foreground italic">(Twisted Fairytales)</span>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-4 text-sm">
              <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-2">
                <span className="text-muted-foreground">🎬 Last year's retro party:</span>
                <a 
                  href="https://partytillyou.rip" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-purple-400 hover:text-purple-300 hover:underline transition-all font-semibold"
                >
                  partytillyou.rip
                </a>
                <span className="text-xs text-muted-foreground italic">(80's Movies)</span>
              </div>
            </div>
            <div>
              <a 
                href="/contact" 
                className="font-body text-sm text-muted-foreground hover:text-accent-gold transition-colors motion-safe no-underline focus:no-underline"
              >
                Contact Us
              </a>
            </div>
            <div className="mt-2">
              <a 
                href="/spooky-portal-of-lost-souls" 
                className="font-body text-xs text-accent-red hover:text-accent-red transition-colors motion-safe no-underline focus:no-underline italic animate-pulse"
              >
                👻 Dare to wander where you shouldn't? Click if you're brave...
              </a>
            </div>
          </div>
          
          {/* Copyright */}
          <div className="border-t border-accent-purple/30 pt-4 mt-4">
            <p className="font-body text-sm text-muted-foreground">
              © {currentYear} Jamie & Kat Ruth. All twisted tales reserved.
            </p>
            <p className="font-body text-xs text-muted-foreground mt-2 italic">
              "Not all who wander are lost... but some should be."
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;