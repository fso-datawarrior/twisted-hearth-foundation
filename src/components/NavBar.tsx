import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Menu, X, LogOut } from "lucide-react";
import { AuthModal } from "@/components/AuthModal";
import { useAuth } from "@/lib/auth";

interface NavBarProps {
  variant?: "public";
  ctaLabel?: string;
}

const NavBar = ({ variant = "public", ctaLabel = "RSVP" }: NavBarProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const location = useLocation();
  const { user, signOut } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      document.documentElement.style.setProperty('--mouse-x', `${x}%`);
      document.documentElement.style.setProperty('--mouse-y', `${y}%`);
    };
    
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/about", label: "About" },
    { to: "/vignettes", label: "Vignettes" },
    { to: "/schedule", label: "Schedule" },
    { to: "/costumes", label: "Costumes" },
    { to: "/feast", label: "Feast" },
    { to: "/gallery", label: "Gallery" },
    { to: "/discussion", label: "Discussion" },
    { to: "/contact", label: "Contact" },
  ];

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 motion-safe ${
        isScrolled ? "backdrop-blur-md shadow-lg smoky-fog" : "bg-transparent"
      }`}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo/Title */}
          <Link 
            to="/" 
            className="font-heading text-2xl font-bold text-ink hover:text-accent-gold transition-colors motion-safe focus-visible"
            aria-label="Home - The Ruths' Twisted Fairytale Halloween Bash"
          >
            The Ruths' Bash
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`font-subhead text-sm uppercase tracking-wider transition-colors motion-safe focus-visible ${
                  location.pathname === to
                    ? "text-accent-gold"
                    : "text-ink hover:text-accent-gold"
                }`}
              >
                {label}
              </Link>
            ))}
            
            {/* Auth Section */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 hover:bg-accent-purple/10">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-accent-purple text-background text-sm">
                        {user.email?.charAt(0)?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-subhead text-ink">
                      {user.email?.split("@")[0] || "User"}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-card border-accent-purple/30">
                  <DropdownMenuItem 
                    onClick={() => signOut()}
                    className="flex items-center gap-2 font-subhead text-accent-red hover:bg-accent-red/10 cursor-pointer"
                  >
                    <LogOut size={16} />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                onClick={() => setShowAuthModal(true)}
                variant="outline"
                className="border-accent-purple hover:bg-accent-purple/10 font-subhead"
              >
                Sign In
              </Button>
            )}
            
            <Button 
              asChild 
              variant="destructive" 
              className="bg-accent-red hover:bg-accent-red/80 glow-gold font-subhead"
            >
              <Link to="/rsvp">{ctaLabel}</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 text-ink hover:text-accent-gold transition-colors motion-safe focus-visible"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div 
            id="mobile-menu"
            className="lg:hidden absolute top-full left-0 right-0 bg-bg-2/95 backdrop-blur-md border-t border-accent-purple/30"
          >
              <div className="container mx-auto px-6 py-4 space-y-4">
                {navLinks.map(({ to, label }) => (
                  <Link
                    key={to}
                    to={to}
                    onClick={() => setIsMenuOpen(false)}
                    className={`block font-subhead text-sm uppercase tracking-wider transition-colors motion-safe focus-visible ${
                      location.pathname === to
                        ? "text-accent-gold"
                        : "text-ink hover:text-accent-gold"
                    }`}
                  >
                    {label}
                  </Link>
                ))}
                
                {/* Mobile Auth */}
                {user ? (
                  <div className="space-y-3 pt-2 border-t border-accent-purple/30">
                    <div className="flex items-center gap-2 text-ink">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-accent-purple text-background text-sm">
                          {user.email?.charAt(0)?.toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-subhead">
                        {user.email?.split("@")[0] || "User"}
                      </span>
                    </div>
                    <Button
                      onClick={() => { signOut(); setIsMenuOpen(false); }}
                      variant="outline"
                      className="w-full border-accent-red text-accent-red hover:bg-accent-red/10 font-subhead"
                    >
                      <LogOut size={16} className="mr-2" />
                      Sign out
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={() => { setShowAuthModal(true); setIsMenuOpen(false); }}
                    variant="outline"
                    className="w-full border-accent-purple hover:bg-accent-purple/10 font-subhead"
                  >
                    Sign In
                  </Button>
                )}
                
                <Button 
                  asChild 
                  variant="destructive" 
                  className="w-full bg-accent-red hover:bg-accent-red/80 font-subhead"
                >
                  <Link to="/rsvp" onClick={() => setIsMenuOpen(false)}>
                    {ctaLabel}
                  </Link>
                </Button>
              </div>
          </div>
        )}
      </div>
      
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </nav>
  );
};

export default NavBar;