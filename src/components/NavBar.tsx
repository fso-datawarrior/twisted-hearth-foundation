import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Menu, X, LogOut, Code, Code2, Shield, Eye, Volume2, VolumeX, Key, User } from "lucide-react";
import { AuthModal } from "@/components/AuthModal";
import { ChangePasswordModal } from "@/components/ChangePasswordModal";
import { useAuth } from "@/lib/auth";
import { useDeveloperMode } from "@/contexts/DeveloperModeContext";
import { useAdmin } from "@/contexts/AdminContext";
import { useAudio } from "@/contexts/AudioContext";
import { DEV_MODE_ENABLED } from "@/settings/dev-mode-settings";
import packageJson from "../../package.json";

interface NavBarProps {
  variant?: "public";
  ctaLabel?: string;
  onOpenSupport?: () => void;
}

const NavBar = ({ variant = "public", ctaLabel = "RSVP", onOpenSupport }: NavBarProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { isDeveloperMode, toggleDeveloperMode } = useDeveloperMode();
  const { isAdmin, isAdminView, toggleAdminView } = useAdmin();
  const { isMuted, toggleMute } = useAudio();

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/about", label: "About" },
    { to: "/vignettes", label: "Vignettes" },
    { to: "/schedule", label: "Schedule" },
    { to: "/costumes", label: "Costumes" },
    { to: "/feast", label: "Feast" },
    { to: "/gallery", label: "Gallery" },
    { to: "/discussion", label: "Discussion" },
    ...(isAdmin ? [{ to: "/admin", label: "Admin" }] : []),
  ];
  
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

  // Get current page name for mobile display
  const getCurrentPageName = () => {
    const currentLink = navLinks.find(link => link.to === location.pathname);
    return currentLink ? currentLink.label : "Home";
  };

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 motion-safe pt-[max(env(safe-area-inset-top),1rem)] ${
        isScrolled ? "backdrop-blur-md shadow-lg bg-bg-2/20" : "bg-transparent"
      }`}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="container mx-auto px-[max(env(safe-area-inset-left),1rem)] pr-[max(env(safe-area-inset-right),1rem)] py-4">
        <div className="flex items-center justify-between nav-full:justify-center">
          {/* Logo/Title - Positioned just to the left of nav links */}
          <div className="flex items-center gap-3 nav-full:mr-8">
            <Link 
              to="/" 
              className="font-heading text-2xl font-bold text-ink hover:text-accent-gold transition-colors motion-safe border-0 logo-responsive"
              aria-label="Home - The Ruths' Twisted Fairytale Halloween Bash"
            >
              The Ruths' Bash
            </Link>
            {isDeveloperMode && DEV_MODE_ENABLED && (
              <span className="text-xs text-ink/50 font-mono">
                v{packageJson.version}
              </span>
            )}
          </div>

          {/* Audio Mute Toggle - Always visible */}
          <Button
            onClick={toggleMute}
            variant="ghost"
            size="sm"
            className="hover:bg-accent-purple/10 font-subhead transition-colors ml-4"
            aria-label={isMuted ? "Unmute sound" : "Mute sound"}
          >
            {isMuted ? (
              <VolumeX className="h-5 w-5 text-ink/60" />
            ) : (
              <Volume2 className="h-5 w-5 text-accent-gold" />
            )}
          </Button>

          {/* Centered Desktop Navigation */}
          <div className="hidden nav-compact:flex items-center space-x-8">
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`font-subhead text-sm uppercase tracking-wider transition-colors motion-safe border-0 min-h-[44px] flex items-center touch-manipulation ${
                  location.pathname === to
                    ? "text-accent-gold"
                    : "text-ink hover:text-accent-gold"
                }`}
              >
                {label}
              </Link>
            ))}
          </div>
            
          {/* Auth Section - Positioned just to the right of nav links */}
          <div className="hidden nav-full:flex items-center space-x-4 ml-8">
              {/* Developer Mode Toggle - Only show when dev mode is enabled */}
              {DEV_MODE_ENABLED && (
                <Button
                  onClick={toggleDeveloperMode}
                  variant="ghost"
                  size="sm"
                  className={`hover:bg-accent-purple/10 font-subhead transition-colors ${
                    isDeveloperMode ? 'text-accent-gold' : 'text-ink/60'
                  }`}
                  title={`Developer Mode ${isDeveloperMode ? 'ON' : 'OFF'} - v${packageJson.version} (Ctrl+Shift+D)`}
                >
                  <div className="flex items-center gap-1">
                    {isDeveloperMode ? <Code2 size={16} /> : <Code size={16} />}
                    {isDeveloperMode && (
                      <span className="text-xs font-mono">
                        v{packageJson.version}
                      </span>
                    )}
                  </div>
                </Button>
              )}

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
                        {user.user_metadata?.full_name || user.email?.split("@")[0] || "User"}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                   <DropdownMenuContent align="end" className="bg-black/90 backdrop-blur-sm border-accent-purple/30">
                    {isAdmin && (
                      <>
                        <DropdownMenuItem 
                          onClick={toggleAdminView}
                          className="flex items-center gap-2 font-subhead hover:bg-accent-purple/10 cursor-pointer"
                        >
                          <Shield size={16} />
                          {isAdminView ? 'Switch to User View' : 'Switch to Admin View'}
                        </DropdownMenuItem>
                        <div className="px-2 py-1 text-xs text-ink/60 bg-accent-purple/10 rounded m-1">
                          Current: {isAdminView ? 'Admin' : 'User'} View
                        </div>
                        <div className="w-full h-px bg-accent-purple/30 my-1"></div>
                      </>
                    )}
                    <Link to="/settings" onClick={() => setIsMenuOpen(false)}>
                      <DropdownMenuItem className="flex items-center gap-2 font-subhead text-ink hover:bg-accent-purple/10 cursor-pointer">
                        <User size={16} />
                        Settings
                      </DropdownMenuItem>
                    </Link>
                    <DropdownMenuItem 
                      onClick={() => setShowChangePasswordModal(true)}
                      className="flex items-center gap-2 font-subhead text-accent-gold hover:bg-accent-gold/10 cursor-pointer"
                    >
                      <Key size={16} />
                      Change Password
                    </DropdownMenuItem>
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
                  variant="ghost"
                  className="hover:bg-accent-purple/10 font-subhead text-ink"
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

          <AuthModal 
            isOpen={showAuthModal} 
            onClose={() => setShowAuthModal(false)}
            onOpenSupport={onOpenSupport}
          />

          {/* Mobile Menu Button - Show when mobile OR when auth is hidden on desktop */}
          <div className="flex nav-full:hidden items-center space-x-4">
            <span className="font-subhead text-accent-gold text-sm uppercase tracking-wider nav-compact:hidden">
              {getCurrentPageName()}
            </span>
            
            {/* Mobile RSVP Button - Always visible on mobile */}
            <Button 
              asChild 
              variant="destructive" 
              size="sm"
              className="bg-accent-red hover:bg-accent-red/80 glow-gold font-subhead text-xs px-3 py-1"
            >
              <Link to="/rsvp">{ctaLabel}</Link>
            </Button>
            
            <button
              className="p-2 text-ink hover:text-accent-gold transition-colors motion-safe border-0 outline-none focus:outline-none focus-visible:outline-none ring-0 focus:ring-0 focus-visible:ring-0 bg-transparent"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-expanded={isMenuOpen ? "true" : "false"}
              aria-controls="mobile-menu"
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation - Show when mobile OR when auth is hidden on desktop */}
        {isMenuOpen && (
          <div 
            id="mobile-menu"
            className="block nav-full:hidden absolute top-full right-4 w-80 max-w-[calc(100vw-2rem)] bg-bg-2/95 backdrop-blur-md border border-accent-purple/30 rounded-xl shadow-elegant animate-fade-in"
          >
              <div className="px-6 py-4 space-y-4">
                {navLinks.map(({ to, label }) => (
                  <Link
                    key={to}
                    to={to}
                    onClick={() => setIsMenuOpen(false)}
                    className={`block font-subhead text-sm uppercase tracking-wider transition-colors motion-safe border-0 ${
                      location.pathname === to
                        ? "text-accent-gold"
                        : "text-ink hover:text-accent-gold"
                    }`}
                  >
                    {label}
                  </Link>
                ))}
                
                {/* Mobile Audio Toggle */}
                <div className="pt-2 border-t border-accent-purple/30">
                  <Button
                    onClick={() => { toggleMute(); setIsMenuOpen(false); }}
                    variant="ghost"
                    className="w-full font-subhead hover:bg-accent-purple/10"
                  >
                    <div className="flex items-center justify-center gap-2">
                      {isMuted ? (
                        <>
                          <VolumeX size={16} />
                          <span>Sound OFF</span>
                        </>
                      ) : (
                        <>
                          <Volume2 size={16} />
                          <span>Sound ON</span>
                        </>
                      )}
                    </div>
                  </Button>
                </div>

                {/* Mobile Developer Mode Toggle - Only show when dev mode is enabled */}
                {DEV_MODE_ENABLED && (
                  <div className="pt-2 border-t border-accent-purple/30">
                    <Button
                      onClick={() => { toggleDeveloperMode(); setIsMenuOpen(false); }}
                      variant="ghost"
                      className={`w-full font-subhead transition-colors ${
                        isDeveloperMode ? 'text-accent-gold hover:bg-accent-gold/10' : 'text-ink hover:bg-accent-purple/10'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        {isDeveloperMode ? <Code2 size={16} /> : <Code size={16} />}
                        <span>Developer Mode {isDeveloperMode ? 'ON' : 'OFF'}</span>
                        {isDeveloperMode && (
                          <span className="text-xs font-mono text-ink/60">
                            v{packageJson.version}
                          </span>
                        )}
                      </div>
                    </Button>
                  </div>
                )}

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
                        {user.user_metadata?.full_name || user.email?.split("@")[0] || "User"}
                      </span>
                    </div>
                    
                    {isAdmin && (
                      <>
                        <Button
                          onClick={() => { toggleAdminView(); setIsMenuOpen(false); }}
                          variant="ghost"
                          className="w-full hover:bg-accent-purple/10 font-subhead"
                        >
                          <Shield size={16} className="mr-2" />
                          {isAdminView ? 'Switch to User View' : 'Switch to Admin View'}
                        </Button>
                        <div className="px-2 py-1 text-xs text-ink/60 bg-accent-purple/10 rounded text-center">
                          Current: {isAdminView ? 'Admin' : 'User'} View
                        </div>
                      </>
                    )}
                    
                    <Link to="/settings">
                      <Button
                        onClick={() => setIsMenuOpen(false)}
                        variant="ghost"
                        className="w-full text-ink hover:bg-accent-purple/10 font-subhead"
                      >
                        <User size={16} className="mr-2" />
                        Settings
                      </Button>
                    </Link>
                    
                    <Button
                      onClick={() => { setShowChangePasswordModal(true); setIsMenuOpen(false); }}
                      variant="ghost"
                      className="w-full text-accent-gold hover:bg-accent-gold/10 font-subhead"
                    >
                      <Key size={16} className="mr-2" />
                      Change Password
                    </Button>
                    
                    <Button
                      onClick={() => { signOut(); setIsMenuOpen(false); }}
                      variant="ghost"
                      className="w-full text-accent-red hover:bg-accent-red/10 font-subhead"
                    >
                      <LogOut size={16} className="mr-2" />
                      Sign out
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={() => { setShowAuthModal(true); setIsMenuOpen(false); }}
                    variant="ghost"
                    className="w-full hover:bg-accent-purple/10 font-subhead text-ink"
                  >
                    Sign In
                  </Button>
                )}
              </div>
          </div>
        )}
      </div>
      
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      <ChangePasswordModal isOpen={showChangePasswordModal} onClose={() => setShowChangePasswordModal(false)} />
    </nav>
  );
};

export default NavBar;