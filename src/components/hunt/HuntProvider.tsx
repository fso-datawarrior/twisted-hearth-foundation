import { createContext, useContext, ReactNode } from "react";
import { useHunt as useHuntDatabase, type UseHuntReturn } from "@/hooks/use-hunt";
import { HUNT_ENABLED } from "./hunt-config";

// Re-export the hook interface for backward compatibility
type HuntAPI = {
  isFound: (id: string) => boolean;
  markFound: (id: string) => void;
  reset: () => void;
  progress: number; // number of found
  total: number; // total hints available
  completed: boolean;
  loading?: boolean;
  error?: string | null;
};

const HuntContext = createContext<HuntAPI | null>(null);

export function HuntProvider({ children }: { children: ReactNode }) {
  // Early return when hunt is disabled - provide no-op API
  if (!HUNT_ENABLED) {
    const noOpApi: HuntAPI = {
      isFound: () => false,
      markFound: () => {},
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

  const markFound = (id: string): void => {
    const hintId = parseInt(id, 10);
    if (!isNaN(hintId)) {
      hunt.markFound(hintId);
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