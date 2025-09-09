import { Crown, Flame, Star } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-bg-2 border-t border-accent-purple/30 py-12 px-6">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center">
          {/* Gothic Icons */}
          <div className="flex justify-center items-center space-x-8 mb-8">
            <Crown className="w-8 h-8 text-accent-gold" aria-hidden="true" />
            <Flame className="w-8 h-8 text-accent-red" aria-hidden="true" />
            <Star className="w-8 h-8 text-accent-gold" aria-hidden="true" />
          </div>
          
          {/* Event Title */}
          <h2 className="font-heading text-2xl mb-4 text-accent-gold">
            The Ruths' Twisted Fairytale Halloween Bash
          </h2>
          
          {/* Hosts */}
          <p className="font-subhead text-lg mb-6 text-muted-foreground">
            Hosted by Jamie & Kat Ruth
          </p>
          
          {/* Domain */}
          <div className="mb-6">
            <a 
              href="https://partytillyou.rip" 
              className="font-body text-accent-gold hover:text-accent-red transition-colors motion-safe no-underline focus:no-underline"
            >
              partytillyou.rip
            </a>
          </div>
          
          {/* Copyright */}
          <div className="border-t border-accent-purple/30 pt-6">
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