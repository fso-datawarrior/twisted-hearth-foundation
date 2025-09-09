import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HuntProgress } from './HuntSystem';

interface NavigationProps {
  huntProgress?: {
    found: number;
    total: number;
  };
  className?: string;
}

export const ModernNavigation: React.FC<NavigationProps> = ({
  huntProgress,
  className = ''
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navigationItems = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
    { name: 'Vignettes', href: '/vignettes' },
    { name: 'Schedule', href: '/schedule' },
    { name: 'Costumes', href: '/costumes' },
    { name: 'Feast', href: '/feast' },
    { name: 'Gallery', href: '/gallery' },
    { name: 'RSVP', href: '/rsvp' }
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <motion.nav
      className={`
        fixed top-0 left-0 right-0 z-40
        transition-all duration-300
        ${isScrolled 
          ? 'bg-background/95 backdrop-blur-md border-b border-border/50' 
          : 'bg-transparent'
        }
        ${className}
      `}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to="/"
            className="text-2xl font-heading text-foreground hover:text-accent transition-colors focus-ring"
            onClick={handleLinkClick}
          >
            Twisted Fairytale
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`
                  relative text-foreground/80 hover:text-foreground
                  transition-colors duration-200
                  ${location.pathname === item.href ? 'text-accent' : ''}
                  focus-ring
                `}
                onClick={handleLinkClick}
              >
                {item.name}
                {location.pathname === item.href && (
                  <motion.div
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-accent"
                    layoutId="activeIndicator"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </Link>
            ))}
          </div>

          {/* Hunt Progress & CTA */}
          <div className="flex items-center space-x-4">
            {huntProgress && huntProgress.found > 0 && (
              <HuntProgress
                found={huntProgress.found}
                total={huntProgress.total}
                className="w-8 h-8"
              />
            )}
            
            <Link
              to="/rsvp"
              className="bg-accent-red text-white px-6 py-2 rounded-lg hover:bg-accent-red/90 transition-colors focus-ring"
              onClick={handleLinkClick}
            >
              RSVP
            </Link>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-foreground hover:text-accent transition-colors focus-ring"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle mobile menu"
            >
              <motion.div
                animate={{ rotate: isMobileMenuOpen ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                ☰
              </motion.div>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden border-t border-border/50"
            >
              <div className="py-4 space-y-2">
                {navigationItems.map((item, index) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      to={item.href}
                      className={`
                        block px-4 py-2 text-foreground/80 hover:text-foreground
                        hover:bg-accent/10 rounded-lg transition-colors
                        ${location.pathname === item.href ? 'text-accent bg-accent/10' : ''}
                        focus-ring
                      `}
                      onClick={handleLinkClick}
                    >
                      {item.name}
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
};

// View Transition Hook
export const useViewTransition = () => {
  const [isTransitioning, setIsTransitioning] = useState(false);

  const startTransition = (callback: () => void) => {
    if ('startViewTransition' in document) {
      setIsTransitioning(true);
      (document as any).startViewTransition(() => {
        callback();
        setIsTransitioning(false);
      });
    } else {
      callback();
    }
  };

  return { isTransitioning, startTransition };
};
