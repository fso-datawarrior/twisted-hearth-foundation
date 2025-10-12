import { useState, useEffect, useCallback } from 'react';
import { createSession, endSession } from '@/lib/analytics-api';
import { logger } from '@/lib/logger';

const SESSION_STORAGE_KEY = 'analytics_session_id';
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

export function useSessionTracking() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [lastActivity, setLastActivity] = useState<number>(Date.now());

  // Start a new session
  const startSession = useCallback(async () => {
    try {
      const { data: newSessionId, error } = await createSession();
      
      if (error || !newSessionId) {
        logger.error('Failed to start session', error);
        return;
      }

      setSessionId(newSessionId);
      setIsActive(true);
      setLastActivity(Date.now());
      
      // Store session ID in sessionStorage
      sessionStorage.setItem(SESSION_STORAGE_KEY, newSessionId);
      
      logger.info('Session started', { sessionId: newSessionId });
    } catch (error) {
      logger.error('Session start error', error as Error);
    }
  }, []);

  // End current session
  const endCurrentSession = useCallback(async () => {
    if (!sessionId) return;

    try {
      await endSession(sessionId);
      setIsActive(false);
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
      logger.info('Session ended', { sessionId });
    } catch (error) {
      logger.error('Session end error', error as Error);
    }
  }, [sessionId]);

  // Check for existing session on mount
  useEffect(() => {
    const existingSessionId = sessionStorage.getItem(SESSION_STORAGE_KEY);
    
    if (existingSessionId) {
      // Check if session is still valid (not timed out)
      const storedTime = sessionStorage.getItem(`${SESSION_STORAGE_KEY}_time`);
      const lastTime = storedTime ? parseInt(storedTime, 10) : 0;
      
      if (Date.now() - lastTime < SESSION_TIMEOUT) {
        // Resume existing session
        setSessionId(existingSessionId);
        setIsActive(true);
        setLastActivity(Date.now());
        sessionStorage.setItem(`${SESSION_STORAGE_KEY}_time`, Date.now().toString());
        logger.info('Session resumed', { sessionId: existingSessionId });
      } else {
        // Session timed out, start new one
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
        sessionStorage.removeItem(`${SESSION_STORAGE_KEY}_time`);
        startSession();
      }
    } else {
      // No existing session, start new one
      startSession();
    }
  }, [startSession]);

  // Update last activity time
  const updateActivity = useCallback(() => {
    setLastActivity(Date.now());
    sessionStorage.setItem(`${SESSION_STORAGE_KEY}_time`, Date.now().toString());
  }, []);

  // Track user activity
  useEffect(() => {
    const handleActivity = () => {
      updateActivity();
    };

    // Listen for user interactions
    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('click', handleActivity);
    window.addEventListener('scroll', handleActivity);

    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('scroll', handleActivity);
    };
  }, [updateActivity]);

  // Check for session timeout
  useEffect(() => {
    const checkTimeout = setInterval(() => {
      if (isActive && Date.now() - lastActivity > SESSION_TIMEOUT) {
        logger.info('Session timed out');
        endCurrentSession();
      }
    }, 60000); // Check every minute

    return () => clearInterval(checkTimeout);
  }, [isActive, lastActivity, endCurrentSession]);

  // End session on page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (sessionId) {
        // Use sendBeacon for reliable unload tracking
        navigator.sendBeacon?.('/api/analytics/end-session', JSON.stringify({ sessionId }));
        endCurrentSession();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [sessionId, endCurrentSession]);

  return {
    sessionId,
    isActive,
    startSession,
    endSession: endCurrentSession,
  };
}
