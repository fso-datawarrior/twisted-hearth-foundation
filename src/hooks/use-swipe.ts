import { useRef, useCallback } from 'react';

interface SwipeHandlers {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
}

interface TouchPoint {
  x: number;
  y: number;
  time: number;
}

export const useSwipe = (handlers: SwipeHandlers) => {
  const touchStart = useRef<TouchPoint | null>(null);
  const touchEnd = useRef<TouchPoint | null>(null);

  const minSwipeDistance = 50;
  const maxSwipeTime = 300;
  const maxVerticalDistance = 100;

  const onTouchStart = useCallback((e: TouchEvent) => {
    const touch = e.touches[0];
    touchStart.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    };
    touchEnd.current = null;
  }, []);

  const onTouchMove = useCallback((e: TouchEvent) => {
    const touch = e.touches[0];
    touchEnd.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    };
  }, []);

  const onTouchEnd = useCallback(() => {
    if (!touchStart.current || !touchEnd.current) return;

    const deltaX = touchEnd.current.x - touchStart.current.x;
    const deltaY = Math.abs(touchEnd.current.y - touchStart.current.y);
    const deltaTime = touchEnd.current.time - touchStart.current.time;

    // Check if swipe is valid (horizontal, fast enough, long enough)
    if (
      Math.abs(deltaX) > minSwipeDistance &&
      deltaY < maxVerticalDistance &&
      deltaTime < maxSwipeTime
    ) {
      if (deltaX > 0 && handlers.onSwipeRight) {
        handlers.onSwipeRight();
      } else if (deltaX < 0 && handlers.onSwipeLeft) {
        handlers.onSwipeLeft();
      }
    }

    touchStart.current = null;
    touchEnd.current = null;
  }, [handlers, minSwipeDistance, maxVerticalDistance, maxSwipeTime]);

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
  };
};