import { useEffect, ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSwipe } from '@/hooks/use-swipe';
import { useIsMobile } from '@/hooks/use-mobile';

interface SwipeNavigatorProps {
  children: ReactNode;
}

const PAGE_ORDER = [
  '/',           // LEFT BOUNDARY
  '/vignettes', 
  '/schedule',
  '/gallery',
  '/discussion',
  '/costumes',
  '/rsvp'        // RIGHT BOUNDARY
];

export const SwipeNavigator = ({ children }: SwipeNavigatorProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();

  const getCurrentPageIndex = () => {
    return PAGE_ORDER.indexOf(location.pathname);
  };

  const navigateToPage = (direction: 'next' | 'prev') => {
    const currentIndex = getCurrentPageIndex();
    if (currentIndex === -1) return; // Unknown route

    if (direction === 'next') {
      // Stop at right boundary (don't wrap)
      if (currentIndex < PAGE_ORDER.length - 1) {
        navigate(PAGE_ORDER[currentIndex + 1]);
      }
    } else {
      // Stop at left boundary (don't wrap)
      if (currentIndex > 0) {
        navigate(PAGE_ORDER[currentIndex - 1]);
      }
    }
  };

  const shouldPreventSwipe = (target: EventTarget | null): boolean => {
    if (!target || !(target instanceof Element)) return false;

    // Prevent swipe on interactive elements
    const interactiveSelectors = [
      'button',
      'a',
      'input',
      'textarea',
      'select',
      '[role="button"]',
      '.embla__slide', // Carousel slides
      '.carousel',
      '[data-swipe-ignore]',
      '.modal',
      '.dialog',
      '.dropdown',
      '.popover'
    ];

    return interactiveSelectors.some(selector => {
      try {
        return target.matches(selector) || target.closest(selector);
      } catch {
        return false;
      }
    });
  };

  const { onTouchStart, onTouchMove, onTouchEnd } = useSwipe({
    onSwipeLeft: () => navigateToPage('next'),
    onSwipeRight: () => navigateToPage('prev'),
  });

  useEffect(() => {
    if (!isMobile) return;

    const handleTouchStart = (e: TouchEvent) => {
      // Prevent swipe on iOS edge swipes (back navigation)
      const touch = e.touches[0];
      if (touch.clientX < 20 || touch.clientX > window.innerWidth - 20) return;
      
      // Check if target should prevent swipe
      if (shouldPreventSwipe(e.target)) return;

      onTouchStart(e);
    };

    const handleTouchMove = (e: TouchEvent) => {
      onTouchMove(e);
    };

    const handleTouchEnd = (e: TouchEvent) => {
      onTouchEnd();
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isMobile, onTouchStart, onTouchMove, onTouchEnd]);

  return <>{children}</>;
};