import { useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView, trackActivity, trackContentInteraction, updatePageViewDuration, updateSession } from '@/lib/analytics-api';
import { logger } from '@/lib/logger';

interface UseAnalyticsTrackingProps {
  sessionId: string | null;
  enabled?: boolean;
}

export function useAnalyticsTracking({ sessionId, enabled = true }: UseAnalyticsTrackingProps) {
  const location = useLocation();
  const pageViewIdRef = useRef<string | null>(null);
  const pageStartTimeRef = useRef<number>(Date.now());
  const pageViewCountRef = useRef<number>(0);
  const actionCountRef = useRef<number>(0);

  // Track page view on route change
  useEffect(() => {
    if (!enabled || !sessionId) return;

    const trackPage = async () => {
      // Update previous page view duration if exists
      if (pageViewIdRef.current) {
        const timeOnPage = Math.floor((Date.now() - pageStartTimeRef.current) / 1000);
        await updatePageViewDuration(pageViewIdRef.current, timeOnPage);
      }

      // Track new page view
      const { data: pageViewId } = await trackPageView({
        page_path: location.pathname,
        page_title: document.title,
        referrer: document.referrer,
        session_id: sessionId,
        viewport_width: window.innerWidth,
        viewport_height: window.innerHeight,
      });

      if (pageViewId) {
        pageViewIdRef.current = pageViewId;
        pageStartTimeRef.current = Date.now();
        pageViewCountRef.current += 1;

        // Update session page view count
        await updateSession(sessionId, { pages_viewed: pageViewCountRef.current });

        logger.debug('Page view tracked', { path: location.pathname, pageViewId });
      }
    };

    trackPage();

    // Cleanup: update page view duration on unmount
    return () => {
      if (pageViewIdRef.current) {
        const timeOnPage = Math.floor((Date.now() - pageStartTimeRef.current) / 1000);
        updatePageViewDuration(pageViewIdRef.current, timeOnPage);
      }
    };
  }, [location.pathname, sessionId, enabled]);

  // Track custom event
  const trackEvent = useCallback(
    async (actionType: string, actionCategory: string, actionDetails?: Record<string, any>) => {
      if (!enabled || !sessionId) return;

      await trackActivity({
        action_type: actionType,
        action_category: actionCategory,
        action_details: actionDetails,
        session_id: sessionId,
      });

      actionCountRef.current += 1;
      await updateSession(sessionId, { actions_taken: actionCountRef.current });

      logger.debug('Event tracked', { actionType, actionCategory });
    },
    [sessionId, enabled]
  );

  // Track content interaction
  const trackInteraction = useCallback(
    async (
      contentType: string,
      contentId: string,
      interactionType: string,
      interactionValue?: string
    ) => {
      if (!enabled || !sessionId) return;

      await trackContentInteraction({
        content_type: contentType,
        content_id: contentId,
        interaction_type: interactionType,
        interaction_value: interactionValue,
        session_id: sessionId,
      });

      actionCountRef.current += 1;
      await updateSession(sessionId, { actions_taken: actionCountRef.current });

      logger.debug('Interaction tracked', { contentType, contentId, interactionType });
    },
    [sessionId, enabled]
  );

  return {
    trackEvent,
    trackInteraction,
    isTracking: enabled && !!sessionId,
  };
}
