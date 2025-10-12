import { supabase } from '@/integrations/supabase/client';
import { logger } from './logger';

// Session management
let currentSessionId: string | null = null;

export const getSessionId = (): string => {
  if (!currentSessionId) {
    currentSessionId = crypto.randomUUID();
    sessionStorage.setItem('analytics_session_id', currentSessionId);
  }
  return currentSessionId;
};

export const clearSession = () => {
  currentSessionId = null;
  sessionStorage.removeItem('analytics_session_id');
};

// Initialize session from storage on load
if (typeof window !== 'undefined') {
  currentSessionId = sessionStorage.getItem('analytics_session_id');
}

// Track page view
export const trackPageView = async (
  pagePath: string,
  pageTitle: string,
  referrer?: string
) => {
  try {
    const sessionId = getSessionId();
    const { data, error } = await supabase.rpc('track_page_view', {
      p_page_path: pagePath,
      p_page_title: pageTitle,
      p_referrer: referrer || document.referrer,
      p_session_id: sessionId,
      p_viewport_width: window.innerWidth,
      p_viewport_height: window.innerHeight,
    });

    if (error) {
      logger.error('Failed to track page view:', error);
    }
    return data;
  } catch (error) {
    logger.error('Error tracking page view:', error as Error);
  }
};

// Track user activity
export const trackActivity = async (
  actionType: string,
  actionCategory: string,
  actionDetails?: Record<string, any>
) => {
  try {
    const sessionId = getSessionId();
    const { data, error } = await supabase.rpc('track_activity', {
      p_action_type: actionType,
      p_action_category: actionCategory,
      p_action_details: actionDetails || {},
      p_session_id: sessionId,
    });

    if (error) {
      logger.error('Failed to track activity:', error);
    }
    return data;
  } catch (error) {
    logger.error('Error tracking activity:', error as Error);
  }
};

// Predefined activity types for consistency
export const ActivityTypes = {
  PHOTO_UPLOAD: 'photo_upload',
  PHOTO_LIKE: 'photo_like',
  PHOTO_FAVORITE: 'photo_favorite',
  GUESTBOOK_POST: 'guestbook_post',
  GUESTBOOK_REACTION: 'guestbook_reaction',
  HUNT_HINT_FOUND: 'hunt_hint_found',
  HUNT_COMPLETED: 'hunt_completed',
  RSVP_SUBMIT: 'rsvp_submit',
  TOURNAMENT_REGISTER: 'tournament_register',
  POTLUCK_ADD: 'potluck_add',
  POTLUCK_DELETE: 'potluck_delete',
} as const;

export const ActivityCategories = {
  ENGAGEMENT: 'engagement',
  CONTENT: 'content',
  NAVIGATION: 'navigation',
  AUTHENTICATION: 'authentication',
  INTERACTION: 'interaction',
} as const;

// Helper functions for common tracking scenarios
export const trackPhotoUpload = (photoId: string, category?: string) =>
  trackActivity(ActivityTypes.PHOTO_UPLOAD, ActivityCategories.CONTENT, {
    photo_id: photoId,
    category,
  });

export const trackPhotoLike = (photoId: string) =>
  trackActivity(ActivityTypes.PHOTO_LIKE, ActivityCategories.INTERACTION, {
    photo_id: photoId,
  });

export const trackGuestbookPost = (postId: string, isAnonymous: boolean) =>
  trackActivity(ActivityTypes.GUESTBOOK_POST, ActivityCategories.CONTENT, {
    post_id: postId,
    is_anonymous: isAnonymous,
  });

export const trackHuntHintFound = (hintId: number, pointsEarned: number) =>
  trackActivity(ActivityTypes.HUNT_HINT_FOUND, ActivityCategories.ENGAGEMENT, {
    hint_id: hintId,
    points_earned: pointsEarned,
  });

export const trackHuntCompleted = (totalPoints: number, duration: number) =>
  trackActivity(ActivityTypes.HUNT_COMPLETED, ActivityCategories.ENGAGEMENT, {
    total_points: totalPoints,
    duration_seconds: duration,
  });

export const trackRSVPSubmit = (numGuests: number) =>
  trackActivity(ActivityTypes.RSVP_SUBMIT, ActivityCategories.ENGAGEMENT, {
    num_guests: numGuests,
  });
