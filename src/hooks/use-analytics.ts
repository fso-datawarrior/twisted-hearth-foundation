import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView, trackActivity } from '@/lib/analytics';

/**
 * Hook to automatically track page views on route changes
 */
export const usePageTracking = () => {
  const location = useLocation();
  const lastPathRef = useRef<string>('');

  useEffect(() => {
    const currentPath = location.pathname + location.search;
    
    // Avoid duplicate tracking on initial mount or same path
    if (lastPathRef.current === currentPath) return;
    
    lastPathRef.current = currentPath;
    
    // Get page title from document
    const pageTitle = document.title || 'Untitled Page';
    
    // Track the page view
    trackPageView(currentPath, pageTitle);
  }, [location]);
};

/**
 * Hook to track user activity with convenient API
 */
export const useActivityTracker = () => {
  return {
    track: trackActivity,
  };
};
