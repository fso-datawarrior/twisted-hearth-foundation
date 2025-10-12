import { supabase } from '@/integrations/supabase/client';
import { logger } from './logger';

// Types
export interface SessionData {
  id?: string;
  user_id?: string;
  browser?: string;
  device_type?: string;
  os?: string;
  started_at?: string;
  pages_viewed?: number;
  actions_taken?: number;
}

export interface PageViewData {
  page_path: string;
  page_title?: string;
  referrer?: string;
  session_id: string;
  viewport_width?: number;
  viewport_height?: number;
}

export interface ActivityData {
  action_type: string;
  action_category: string;
  action_details?: Record<string, any>;
  session_id: string;
}

export interface ContentInteractionData {
  content_type: string;
  content_id: string;
  interaction_type: string;
  interaction_value?: string;
  session_id: string;
}

// Session Management
export const createSession = async (): Promise<{ data: string | null; error: any }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    const sessionData: any = {
      user_id: user?.id || null,
      browser: getBrowser(),
      device_type: getDeviceType(),
      os: getOS(),
      started_at: new Date().toISOString(),
      pages_viewed: 0,
      actions_taken: 0,
    };

    const { data, error } = await supabase
      .from('user_sessions')
      .insert(sessionData)
      .select('id')
      .single();

    if (error) {
      logger.error('Failed to create session', error);
      return { data: null, error };
    }

    return { data: data.id, error: null };
  } catch (error) {
    logger.error('Session creation error', error as Error);
    return { data: null, error };
  }
};

export const updateSession = async (
  sessionId: string,
  updates: { pages_viewed?: number; actions_taken?: number; duration_seconds?: number }
): Promise<{ error: any }> => {
  try {
    const { error } = await supabase
      .from('user_sessions')
      .update(updates)
      .eq('id', sessionId);

    if (error) {
      logger.error('Failed to update session', error);
    }

    return { error };
  } catch (error) {
    logger.error('Session update error', error as Error);
    return { error };
  }
};

export const endSession = async (sessionId: string): Promise<{ error: any }> => {
  try {
    const { data: session } = await supabase
      .from('user_sessions')
      .select('started_at')
      .eq('id', sessionId)
      .single();

    if (session) {
      const startTime = new Date(session.started_at).getTime();
      const endTime = Date.now();
      const durationSeconds = Math.floor((endTime - startTime) / 1000);

      const { error } = await supabase
        .from('user_sessions')
        .update({
          ended_at: new Date().toISOString(),
          duration_seconds: durationSeconds,
        })
        .eq('id', sessionId);

      if (error) {
        logger.error('Failed to end session', error);
      }

      return { error };
    }

    return { error: null };
  } catch (error) {
    logger.error('Session end error', error as Error);
    return { error };
  }
};

// Page View Tracking
export const trackPageView = async (data: PageViewData): Promise<{ data: string | null; error: any }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    const pageViewData = {
      user_id: user?.id || null,
      session_id: data.session_id,
      page_path: data.page_path,
      page_title: data.page_title || document.title,
      referrer: data.referrer || document.referrer || null,
      viewport_width: data.viewport_width || window.innerWidth,
      viewport_height: data.viewport_height || window.innerHeight,
    };

    const { data: result, error } = await supabase
      .from('page_views')
      .insert(pageViewData)
      .select('id')
      .single();

    if (error) {
      logger.error('Failed to track page view', error);
      return { data: null, error };
    }

    return { data: result.id, error: null };
  } catch (error) {
    logger.error('Page view tracking error', error as Error);
    return { data: null, error };
  }
};

export const updatePageViewDuration = async (
  pageViewId: string,
  timeOnPage: number
): Promise<{ error: any }> => {
  try {
    const { error } = await supabase
      .from('page_views')
      .update({
        time_on_page: timeOnPage,
        exited_at: new Date().toISOString(),
      })
      .eq('id', pageViewId);

    if (error) {
      logger.error('Failed to update page view duration', error);
    }

    return { error };
  } catch (error) {
    logger.error('Page view duration update error', error as Error);
    return { error };
  }
};

// Activity Tracking
export const trackActivity = async (data: ActivityData): Promise<{ error: any }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    const activityData = {
      user_id: user?.id || null,
      session_id: data.session_id,
      action_type: data.action_type,
      action_category: data.action_category,
      action_details: data.action_details || {},
    };

    const { error } = await supabase
      .from('user_activity_logs')
      .insert(activityData);

    if (error) {
      logger.error('Failed to track activity', error);
    }

    return { error };
  } catch (error) {
    logger.error('Activity tracking error', error as Error);
    return { error };
  }
};

// Content Interaction Tracking
export const trackContentInteraction = async (
  data: ContentInteractionData
): Promise<{ error: any }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    const interactionData = {
      user_id: user?.id || null,
      session_id: data.session_id,
      content_type: data.content_type,
      content_id: data.content_id,
      interaction_type: data.interaction_type,
      interaction_value: data.interaction_value || null,
    };

    const { error } = await supabase
      .from('content_interactions')
      .insert(interactionData);

    if (error) {
      logger.error('Failed to track content interaction', error);
    }

    return { error };
  } catch (error) {
    logger.error('Content interaction tracking error', error as Error);
    return { error };
  }
};

// Admin Query Functions
export const getAnalyticsSummary = async (
  startDate?: Date,
  endDate?: Date
): Promise<{ data: any; error: any }> => {
  try {
    const { data, error } = await supabase.rpc('get_analytics_summary', {
      p_start_date: startDate?.toISOString().split('T')[0] || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      p_end_date: endDate?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
    });

    if (error) {
      logger.error('Failed to get analytics summary', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    logger.error('Analytics summary error', error as Error);
    return { data: null, error };
  }
};

export const getPageViewsByDate = async (
  startDate: Date,
  endDate: Date
): Promise<{ data: any[]; error: any }> => {
  try {
    const { data, error } = await supabase
      .from('analytics_daily_aggregates')
      .select('date, total_page_views, unique_visitors')
      .gte('date', startDate.toISOString().split('T')[0])
      .lte('date', endDate.toISOString().split('T')[0])
      .order('date', { ascending: true });

    if (error) {
      logger.error('Failed to get page views by date', error);
      return { data: [], error };
    }

    return { data: data || [], error: null };
  } catch (error) {
    logger.error('Page views by date error', error as Error);
    return { data: [], error };
  }
};

export const getActivityBreakdown = async (
  startDate: Date,
  endDate: Date
): Promise<{ data: any; error: any }> => {
  try {
    const { data, error } = await supabase
      .from('analytics_daily_aggregates')
      .select('photos_uploaded, rsvps_submitted, guestbook_posts')
      .gte('date', startDate.toISOString().split('T')[0])
      .lte('date', endDate.toISOString().split('T')[0]);

    if (error) {
      logger.error('Failed to get activity breakdown', error);
      return { data: null, error };
    }

    // Aggregate the totals
    const totals = (data || []).reduce(
      (acc, row) => ({
        photo_uploads: acc.photo_uploads + (row.photos_uploaded || 0),
        rsvps: acc.rsvps + (row.rsvps_submitted || 0),
        guestbook_posts: acc.guestbook_posts + (row.guestbook_posts || 0),
        hunt_progress: 0, // Not tracked in daily aggregates yet
      }),
      { photo_uploads: 0, rsvps: 0, guestbook_posts: 0, hunt_progress: 0 }
    );

    return { data: totals, error: null };
  } catch (error) {
    logger.error('Activity breakdown error', error as Error);
    return { data: null, error };
  }
};

export const getPopularPages = async (
  startDate: Date,
  endDate: Date
): Promise<{ data: any[]; error: any }> => {
  try {
    const { data, error } = await supabase
      .from('page_views')
      .select('page_path')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    if (error) {
      logger.error('Failed to get popular pages', error);
      return { data: [], error };
    }

    // Aggregate by page_path
    const pageMap = new Map<string, { view_count: number; unique_visitors: Set<string>; total_time: number }>();
    
    (data || []).forEach((view: any) => {
      const existing = pageMap.get(view.page_path) || {
        view_count: 0,
        unique_visitors: new Set(),
        total_time: 0,
      };
      
      existing.view_count++;
      if (view.user_id) existing.unique_visitors.add(view.user_id);
      if (view.time_on_page) existing.total_time += view.time_on_page;
      
      pageMap.set(view.page_path, existing);
    });

    const popularPages = Array.from(pageMap.entries())
      .map(([page_path, stats]) => ({
        page_path,
        view_count: stats.view_count,
        unique_visitors: stats.unique_visitors.size,
        avg_time: stats.view_count > 0 ? Math.floor(stats.total_time / stats.view_count) : 0,
      }))
      .sort((a, b) => b.view_count - a.view_count)
      .slice(0, 10);

    return { data: popularPages, error: null };
  } catch (error) {
    logger.error('Popular pages error', error as Error);
    return { data: [], error };
  }
};

// Helper functions for browser detection
function getBrowser(): string {
  const userAgent = navigator.userAgent;
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Chrome')) return 'Chrome';
  if (userAgent.includes('Safari')) return 'Safari';
  if (userAgent.includes('Edge')) return 'Edge';
  return 'Unknown';
}

function getDeviceType(): string {
  const userAgent = navigator.userAgent;
  if (/mobile/i.test(userAgent)) return 'mobile';
  if (/tablet/i.test(userAgent)) return 'tablet';
  return 'desktop';
}

function getOS(): string {
  const userAgent = navigator.userAgent;
  if (userAgent.includes('Windows')) return 'Windows';
  if (userAgent.includes('Mac')) return 'macOS';
  if (userAgent.includes('Linux')) return 'Linux';
  if (userAgent.includes('Android')) return 'Android';
  if (userAgent.includes('iOS')) return 'iOS';
  return 'Unknown';
}
