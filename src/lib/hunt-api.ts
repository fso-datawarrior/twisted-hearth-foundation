import { supabase } from '@/integrations/supabase/client';

// ================================================================
// HUNT SYSTEM DATABASE API
// ================================================================

export interface HuntHint {
  id: number;
  title: string;
  description: string;
  hint_text: string;
  difficulty_level: 'easy' | 'medium' | 'hard';
  category: 'visual' | 'text' | 'location' | 'riddle';
  points: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface HuntRun {
  id: string;
  user_id: string;
  started_at: string;
  completed_at?: string;
  total_points: number;
  status: 'active' | 'completed' | 'abandoned';
  created_at: string;
}

export interface HuntProgress {
  id: string;
  user_id: string;
  hunt_run_id: string;
  hint_id: number;
  found_at: string;
  points_earned: number;
  created_at: string;
}

export interface HuntReward {
  id: string;
  user_id: string;
  hunt_run_id: string;
  reward_type: 'badge' | 'trophy' | 'special_access';
  reward_name: string;
  description?: string;
  earned_at: string;
  created_at: string;
}

export interface HuntStats {
  total_hints: number;
  found_hints: number;
  completion_percentage: number;
  total_points: number;
  hunt_status: string;
}

// ================================================================
// API FUNCTIONS
// ================================================================

/**
 * Get all active hunt hints
 */
export const getHuntHints = async (): Promise<{ data: HuntHint[] | null; error: any }> => {
  const { data, error } = await supabase
    .from('hunt_hints' as any)
    .select('*')
    .eq('is_active', true)
    .order('id');

  return { data: data as any, error };
};

/**
 * Mark a hint as found - creates or updates hunt progress
 */
export const markHintFound = async (hintId: number, huntRunId?: string): Promise<{ data: HuntProgress | null; error: any }> => {
  const { data, error } = await (supabase.rpc as any)('mark_hint_found', {
    p_hint_id: hintId,
    p_hunt_run_id: huntRunId || null
  });

  return { data: data as any, error };
};

/**
 * Get current user's hunt statistics
 */
export const getHuntStats = async (userId?: string): Promise<{ data: HuntStats[] | null; error: any }> => {
  const { data, error } = await (supabase.rpc as any)('get_hunt_stats', {
    p_user_id: userId || null
  });

  return { data: data as any, error };
};

/**
 * Get user's active hunt run
 */
export const getActiveHuntRun = async (): Promise<{ data: HuntRun | null; error: any }> => {
  const { data, error } = await supabase
    .from('hunt_runs' as any)
    .select('*')
    .eq('status', 'active')
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  return { data: data as any, error };
};

/**
 * Get user's hunt progress for active run
 */
export const getHuntProgress = async (huntRunId?: string): Promise<{ data: HuntProgress[] | null; error: any }> => {
  let query = supabase
    .from('hunt_progress' as any)
    .select('*')
    .order('found_at');

  if (huntRunId) {
    query = query.eq('hunt_run_id', huntRunId);
  } else {
    // Get progress for active hunt run
    const { data: activeRun } = await getActiveHuntRun();
    if (!activeRun) {
      return { data: [], error: null };
    }
    query = query.eq('hunt_run_id', activeRun.id);
  }

  const { data, error } = await query;
  return { data: data as any, error };
};

/**
 * Get user's hunt rewards
 */
export const getHuntRewards = async (huntRunId?: string): Promise<{ data: HuntReward[] | null; error: any }> => {
  let query = supabase
    .from('hunt_rewards' as any)
    .select('*')
    .order('earned_at', { ascending: false });

  if (huntRunId) {
    query = query.eq('hunt_run_id', huntRunId);
  }

  const { data, error } = await query;
  return { data: data as any, error };
};

/**
 * Subscribe to hunt progress changes
 */
export const subscribeToHuntProgress = (
  callback: (payload: any) => void,
  huntRunId?: string
) => {
  const channel = supabase
    .channel('hunt_progress_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'hunt_progress'
      },
      callback
    );

  return channel.subscribe();
};

/**
 * Subscribe to hunt runs changes
 */
export const subscribeToHuntRuns = (callback: (payload: any) => void) => {
  return supabase
    .channel('hunt_runs_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'hunt_runs'
      },
      callback
    )
    .subscribe();
};

/**
 * Subscribe to hunt rewards changes
 */
export const subscribeToHuntRewards = (callback: (payload: any) => void) => {
  return supabase
    .channel('hunt_rewards_changes')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'hunt_rewards'
      },
      callback
    )
    .subscribe();
};