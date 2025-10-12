import React, { useEffect } from 'react';
import { usePageTracking } from '@/hooks/use-analytics';
import { useAuth } from '@/lib/auth';
import { clearSession } from '@/lib/analytics';

interface AnalyticsProviderProps {
  children: React.ReactNode;
}

/**
 * Provider component that initializes analytics tracking
 * and manages session lifecycle
 */
export const AnalyticsProvider: React.FC<AnalyticsProviderProps> = ({ children }) => {
  const { user } = useAuth();
  
  // Enable automatic page view tracking
  usePageTracking();

  // Clear session on logout
  useEffect(() => {
    if (!user) {
      clearSession();
    }
  }, [user]);

  return <>{children}</>;
};
