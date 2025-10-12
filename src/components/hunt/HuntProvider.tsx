import React, { useContext, type ReactNode } from "react";
import { useHunt as useHuntDatabase, type UseHuntReturn } from "@/hooks/use-hunt";
import { HUNT_ENABLED } from "./hunt-config";
import { trackActivity } from "@/lib/analytics-api";

// Re-export the hook interface for backward compatibility
type HuntAPI = {
  isFound: (id: string) => boolean;
  markFound: (id: string) => Promise<void>; // Changed to async
  reset: () => void;
  progress: number; // number of found
  total: number; // total hints available
  completed: boolean;
  loading?: boolean;
  error?: string | null;
};

const HuntContext = React.createContext<HuntAPI | null>(null);

export function HuntProvider({ children }: { children: ReactNode }) {
  // Early return when hunt is disabled - provide no-op API
  if (!HUNT_ENABLED) {
    const noOpApi: HuntAPI = {
      isFound: () => false,
      markFound: async () => {},
      reset: () => {},
      progress: 0,
      total: 0,
      completed: false,
      loading: false,
      error: null,
    };
    return <HuntContext.Provider value={noOpApi}>{children}</HuntContext.Provider>;
  }

  const hunt = useHuntDatabase();

  // Convert hint IDs to string for backward compatibility
  const isFound = (id: string): boolean => {
    const hintId = parseInt(id, 10);
    return !isNaN(hintId) && hunt.isFound(hintId);
  };

  const markFound = async (id: string): Promise<void> => {
    const hintId = parseInt(id, 10);
    if (!isNaN(hintId)) {
      hunt.markFound(hintId);
      
      // Track rune discovery
      const sessionId = sessionStorage.getItem('analytics_session_id');
      if (sessionId) {
        trackActivity({
          action_type: 'hunt_rune_found',
          action_category: 'engagement',
          action_details: { hint_id: hintId, total_found: hunt.foundCount + 1 },
          session_id: sessionId,
        }).catch(err => console.warn('Failed to track rune discovery:', err));
      }

      // Track hunt completion if this was the last rune
      if (hunt.foundCount + 1 === hunt.totalCount) {
        if (sessionId) {
          trackActivity({
            action_type: 'hunt_completed',
            action_category: 'engagement',
            action_details: { total_runes: hunt.totalCount },
            session_id: sessionId,
          }).catch(err => console.warn('Failed to track hunt completion:', err));
        }
      }
    }
  };

  const reset = (): void => {
    // In database mode, reset is handled by admin functions
    // For dev purposes, we can refresh the data
    hunt.refreshData();
  };

  const api: HuntAPI = {
    isFound,
    markFound,
    reset,
    progress: hunt.foundCount,
    total: hunt.totalCount,
    completed: hunt.completed,
    loading: hunt.loading,
    error: hunt.error,
  };

  return <HuntContext.Provider value={api}>{children}</HuntContext.Provider>;
}

export function useHunt(): HuntAPI {
  const context = useContext(HuntContext);
  if (!context) {
    throw new Error("useHunt must be used within HuntProvider");
  }
  return context;
}