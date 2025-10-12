import { createContext, useContext, ReactNode } from 'react';
import { useSessionTracking } from '@/hooks/use-session-tracking';
import { useAnalyticsTracking } from '@/hooks/use-analytics-tracking';

interface AnalyticsContextType {
  sessionId: string | null;
  isTracking: boolean;
  trackEvent: (actionType: string, actionCategory: string, actionDetails?: Record<string, any>) => Promise<void>;
  trackInteraction: (contentType: string, contentId: string, interactionType: string, interactionValue?: string) => Promise<void>;
}

const AnalyticsContext = createContext<AnalyticsContextType | null>(null);

export function AnalyticsProvider({ children }: { children: ReactNode }) {
  const { sessionId, isActive } = useSessionTracking();
  const { trackEvent, trackInteraction, isTracking } = useAnalyticsTracking({
    sessionId,
    enabled: true,
  });

  const value: AnalyticsContextType = {
    sessionId,
    isTracking: isTracking && isActive,
    trackEvent,
    trackInteraction,
  };

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalytics() {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within AnalyticsProvider');
  }
  return context;
}
