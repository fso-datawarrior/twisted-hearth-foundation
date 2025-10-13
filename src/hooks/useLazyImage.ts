import { useState, useEffect, useRef } from 'react';

interface UseLazyImageOptions {
  threshold?: number;
  rootMargin?: string;
}

export const useLazyImage = (
  shouldLoad: boolean = true,
  options: UseLazyImageOptions = {}
) => {
  const [isInView, setIsInView] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!shouldLoad || hasLoaded) return;
    
    const element = ref.current;
    if (!element) return;

    // Create IntersectionObserver
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          setHasLoaded(true);
          observer.disconnect(); // Stop observing once loaded
        }
      },
      {
        threshold: options.threshold || 0.1,
        rootMargin: options.rootMargin || '100px', // Start loading 100px before visible
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [shouldLoad, hasLoaded, options.threshold, options.rootMargin]);

  return { ref, isInView, hasLoaded };
};
