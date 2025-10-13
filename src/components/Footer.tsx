import { Ghost, Moon, Sparkles } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-bg-2 border-t border-accent-purple/30 py-6 px-6 pb-[max(env(safe-area-inset-bottom),1rem)]">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center">
          {/* Halloween Icons */}
          <div className="flex justify-center items-center gap-6 mb-6">
            <Ghost 
              className="w-6 h-6 text-accent-gold hover:text-accent-purple transition-colors motion-safe cursor-pointer" 
              aria-label="Ghost icon"
            />
            <Moon 
              className="w-6 h-6 text-accent-purple hover:text-accent-gold transition-colors motion-safe cursor-pointer" 
              aria-label="Moon icon"
            />
            <Sparkles 
              className="w-6 h-6 text-accent-gold hover:text-accent-purple transition-colors motion-safe cursor-pointer" 
              aria-label="Sparkles icon"
            />
          </div>
          
          {/* Event Title */}
          <h2 className="font-heading text-xl mb-3 text-accent-gold">
            The Ruths' Twisted Fairytale Halloween Bash
          </h2>
          
          {/* Hosts */}
          <p className="font-subhead text-base mb-4 text-muted-foreground">
            Hosted by Jamie & Kat Ruth
          </p>
          
          {/* Domain and Contact */}
          <div className="mb-4 space-y-2">
            <div className="flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">This year: </span>
                <a 
                  href="https://2025.twistedhearth.foundation" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-accent-gold hover:underline transition-colors motion-safe"
                >
                  2025.twistedhearth.foundation
                </a>
              </div>
              <span className="hidden sm:inline text-muted-foreground">•</span>
              <div>
                <span className="text-muted-foreground">Last year: </span>
                <a 
                  href="https://2024.twistedhearth.foundation" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-accent-gold transition-colors motion-safe"
                >
                  2024.twistedhearth.foundation
                </a>
              </div>
            </div>
            <div>
              <a 
                href="https://partytillyou.rip" 
                className="font-body text-sm text-accent-gold hover:text-accent-red transition-colors motion-safe no-underline focus:no-underline"
              >
                partytillyou.rip
              </a>
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