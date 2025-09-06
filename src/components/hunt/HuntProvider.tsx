import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { HUNT_TOTAL } from "./hunt-config";

type HuntState = {
  found: Record<string, string>; // id -> ISO timestamp
  completedAt?: string; // when all found
};

type HuntAPI = {
  isFound: (id: string) => boolean;
  markFound: (id: string) => void;
  reset: () => void;
  progress: number; // number of found
  total: number; // from config
  completed: boolean;
};

const HuntContext = createContext<HuntAPI | null>(null);

const STORAGE_KEY = "TF_HUNT_V1";

const initialState: HuntState = {
  found: {},
};

export function HuntProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<HuntState>(initialState);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setState(parsed);
      }
    } catch (error) {
      console.warn("Failed to load hunt progress:", error);
    }
  }, []);

  // Save to localStorage on state change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.warn("Failed to save hunt progress:", error);
    }
  }, [state]);

  const isFound = (id: string): boolean => {
    return id in state.found;
  };

  const markFound = (id: string): void => {
    if (isFound(id)) return; // idempotent

    const timestamp = new Date().toISOString();
    const newFound = { ...state.found, [id]: timestamp };
    const newState: HuntState = { found: newFound };

    // Check if completed
    if (Object.keys(newFound).length === HUNT_TOTAL) {
      newState.completedAt = timestamp;
    }

    setState(newState);
  };

  const reset = (): void => {
    setState(initialState);
  };

  // Dev hook for testing
  useEffect(() => {
    if (import.meta.env.DEV) {
      (window as any).hunt = { reset };
    }
  }, []);

  const api: HuntAPI = {
    isFound,
    markFound,
    reset,
    progress: Object.keys(state.found).length,
    total: HUNT_TOTAL,
    completed: !!state.completedAt,
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