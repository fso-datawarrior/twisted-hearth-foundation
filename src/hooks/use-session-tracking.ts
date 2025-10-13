import { useState, useEffect, useCallback, useRef } from 'react';
import { createSession, endSession } from '@/lib/analytics-api';
import { logger } from '@/lib/logger';

const SESSION_STORAGE_KEY = 'analytics_session_id';
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

export function useSessionTracking() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [lastActivity, setLastActivity] = useState<number>(Date.now());
  const isInitialized = useRef(false);

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
      sessionStorage.setItem(`${SESSION_STORAGE_KEY}_time`, Date.now().toString());
      
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
      sessionStorage.removeItem(`${SESSION_STORAGE_KEY}_time`);
      logger.info('Session ended', { sessionId });
    } catch (error) {
      logger.error('Session end error', error as Error);
    }
  }, [sessionId]);

  // Update last activity time
  const updateActivity = useCallback(() => {
    setLastActivity(Date.now());
    sessionStorage.setItem(`${SESSION_STORAGE_KEY}_time`, Date.now().toString());
  }, []);

  // Initialize session on mount (only once) - NON-BLOCKING
  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;

    const existingSessionId = sessionStorage.getItem(SESSION_STORAGE_KEY);
    
    if (existingSessionId) {
      // Check if session is still valid (not timed out)
      const storedTime = sessionStorage.getItem(`${SESSION_STORAGE_KEY}_time`);
      const lastTime = storedTime ? parseInt(storedTime, 10) : 0;
      
      if (Date.now() - lastTime < SESSION_TIMEOUT) {
        // Resume existing session immediately (non-blocking)
        setSessionId(existingSessionId);
        setIsActive(true);
        setLastActivity(Date.now());
        sessionStorage.setItem(`${SESSION_STORAGE_KEY}_time`, Date.now().toString());
        logger.info('Session resumed', { sessionId: existingSessionId });
      } else {
        // Session timed out, start new one in background (don't await)
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
        sessionStorage.removeItem(`${SESSION_STORAGE_KEY}_time`);
        startSession(); // Fire and forget - don't block rendering
      }
    } else {
      // No existing session, start new one in background (don't await)
      startSession(); // Fire and forget - don't block rendering
    }
  }, []); // Empty dependency array - only run once

  // Track user activity
  useEffect(() => {
    if (!isActive) return;

    const handleActivity = () => {
      setLastActivity(Date.now());
      sessionStorage.setItem(`${SESSION_STORAGE_KEY}_time`, Date.now().toString());
    };

    // Listen for user interactions
    window.addEventListener('mousemove', handleActivity, { passive: true });
    window.addEventListener('keydown', handleActivity, { passive: true });
    window.addEventListener('click', handleActivity, { passive: true });
    window.addEventListener('scroll', handleActivity, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('scroll', handleActivity);
    };
  }, [isActive]); // Only depend on isActive

  // Check for session timeout
  useEffect(() => {
    if (!isActive) return;

    const checkTimeout = setInterval(() => {
      const currentTime = Date.now();
      const storedTime = sessionStorage.getItem(`${SESSION_STORAGE_KEY}_time`);
      const lastTime = storedTime ? parseInt(storedTime, 10) : currentTime;
      
      if (currentTime - lastTime > SESSION_TIMEOUT) {
        logger.info('Session timed out');
        if (sessionId) {
          endSession(sessionId).catch(err => logger.error('Failed to end timed out session', err));
        }
        setIsActive(false);
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
        sessionStorage.removeItem(`${SESSION_STORAGE_KEY}_time`);
      }
    }, 60000); // Check every minute

    return () => clearInterval(checkTimeout);
  }, [isActive, sessionId]); // Depend on sessionId for endSession

  // End session on page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (sessionId) {
        // Attempt to end session on unload (best effort)
        endSession(sessionId).catch(() => {
          // Silently fail - this is best effort only
        });
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [sessionId]); // Only depend on sessionId

  return {
    sessionId,
    isActive,
    startSession,
    endSession: endCurrentSession,
  };
}
