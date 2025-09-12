import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth';
import {
  getHuntHints,
  getHuntStats,
  getHuntProgress,
  markHintFound,
  subscribeToHuntProgress,
  subscribeToHuntRuns,
  subscribeToHuntRewards,
  type HuntHint,
  type HuntStats,
  type HuntProgress
} from '@/lib/hunt-api';
import { useToast } from '@/hooks/use-toast';

export interface UseHuntReturn {
  // Data
  hints: HuntHint[];
  stats: HuntStats | null;
  progress: HuntProgress[];
  
  // State
  loading: boolean;
  error: string | null;
  
  // Actions
  isFound: (hintId: number) => boolean;
  markFound: (hintId: number) => Promise<void>;
  refreshData: () => Promise<void>;
  
  // Computed values
  foundCount: number;
  totalCount: number;
  completed: boolean;
  completionPercentage: number;
}

export function useHunt(): UseHuntReturn {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [hints, setHints] = useState<HuntHint[]>([]);
  const [stats, setStats] = useState<HuntStats | null>(null);
  const [progress, setProgress] = useState<HuntProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load initial data
  const loadData = useCallback(async () => {
    if (!user) {
      setHints([]);
      setStats(null);
      setProgress([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Load hints (public)
      const { data: hintsData, error: hintsError } = await getHuntHints();
      if (hintsError) throw hintsError;
      setHints(hintsData || []);

      // Load user stats
      const { data: statsData, error: statsError } = await getHuntStats();
      if (statsError) throw statsError;
      setStats(statsData?.[0] || null);

      // Load user progress
      const { data: progressData, error: progressError } = await getHuntProgress();
      if (progressError) throw progressError;
      setProgress(progressData || []);

    } catch (err: any) {
      console.error('Error loading hunt data:', err);
      setError(err.message || 'Failed to load hunt data');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Initial load
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!user) return;

    const progressChannel = subscribeToHuntProgress((payload) => {
      console.log('Hunt progress update:', payload);
      // Refresh data on any hunt progress change
      loadData();
    });

    const runsChannel = subscribeToHuntRuns((payload) => {
      console.log('Hunt runs update:', payload);
      // Refresh data on hunt run changes
      loadData();
    });

    const rewardsChannel = subscribeToHuntRewards((payload) => {
      console.log('Hunt rewards update:', payload);
      // Show reward notification
      if (payload.eventType === 'INSERT') {
        const reward = payload.new;
        toast({
          title: "🏆 Reward Earned!",
          description: `${reward.reward_name}: ${reward.description}`,
          duration: 5000,
        });
      }
    });

    return () => {
      progressChannel.unsubscribe();
      runsChannel.unsubscribe();
      rewardsChannel.unsubscribe();
    };
  }, [user, loadData, toast]);

  // Actions
  const isFound = useCallback((hintId: number): boolean => {
    return progress.some(p => p.hint_id === hintId);
  }, [progress]);

  const markFound = useCallback(async (hintId: number): Promise<void> => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to track your progress.",
        variant: "destructive",
      });
      return;
    }

    if (isFound(hintId)) {
      toast({
        title: "Already Found!",
        description: "You've already found this secret.",
      });
      return;
    }

    try {
      const { data, error } = await markHintFound(hintId);
      if (error) throw error;

      if (data) {
        const hint = hints.find(h => h.id === hintId);
        toast({
          title: "🎯 Secret Found!",
          description: hint ? `Found "${hint.title}" (+${data.points_earned} points)` : "Secret discovered!",
        });

        // Refresh data to get updated stats
        await loadData();
      }
    } catch (err: any) {
      console.error('Error marking hint found:', err);
      toast({
        title: "Error",
        description: err.message || "Failed to save progress",
        variant: "destructive",
      });
    }
  }, [user, isFound, hints, toast, loadData]);

  const refreshData = useCallback(async () => {
    await loadData();
  }, [loadData]);

  // Computed values
  const foundCount = progress.length;
  const totalCount = hints.length;
  const completed = stats?.hunt_status === 'completed' || (totalCount > 0 && foundCount >= totalCount);
  const completionPercentage = totalCount > 0 ? (foundCount / totalCount) * 100 : 0;

  return {
    // Data
    hints,
    stats,
    progress,
    
    // State
    loading,
    error,
    
    // Actions
    isFound,
    markFound,
    refreshData,
    
    // Computed values
    foundCount,
    totalCount,
    completed,
    completionPercentage,
  };
}