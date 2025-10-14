import React, { createContext, useContext, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from '@supabase/supabase-js';
import { isPartyOver } from './event';
import { logger } from './logger';
import type { Profile } from './profile-api';

type SessionUser = { 
  id: string; 
  email: string | null;
  user_metadata?: { full_name?: string; [key: string]: any };
};
type AuthCtx = { 
  user: SessionUser | null; 
  session: Session | null;
  profile: Profile | null;
  signIn: (email: string) => Promise<void>; 
  signOut: () => Promise<void>; 
  devSignIn: (email: string) => Promise<void>;
  signInWithOtp: (email: string) => Promise<void>;
  verifyOtp: (email: string, token: string) => Promise<void>;
  signUpWithPassword: (email: string, password: string) => Promise<void>;
  signInWithPassword: (email: string, password: string) => Promise<void>;
  resetPasswordForEmail: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
  loading: boolean;
};

const AuthContext = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<SessionUser | null>(null);
  const [session, setSession] = React.useState<Session | null>(null);
  const [profile, setProfile] = React.useState<Profile | null>(null);
  const [loading, setLoading] = React.useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (data) {
        setProfile(data);
      }
    } catch (error) {
      logger.error('Failed to fetch profile', error);
    }
  };

  const refreshProfile = async () => {
    if (user?.id) {
      await fetchProfile(user.id);
    }
  };

  useEffect(() => {
    logger.info('🔐 AuthProvider: Initializing auth state...');
    
    // Set up auth state listener FIRST to catch magic link auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        logger.info('🔐 AuthProvider: Auth state changed', { event, hasSession: !!session });
        setSession(session);
        const newUser = session?.user ? { 
          id: session.user.id, 
          email: session.user.email,
          user_metadata: session.user.user_metadata 
        } : null;
        setUser(newUser);
        
        // Fetch profile when user signs in
        if (newUser?.id) {
          fetchProfile(newUser.id);
        } else {
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    // Check for existing session with error handling
    supabase.auth.getSession()
      .then(({ data: { session }, error }) => {
        if (error) {
          logger.error('🔐 AuthProvider: Error getting session', error);
        } else {
          logger.info('🔐 AuthProvider: Got existing session', { hasSession: !!session });
        }
        setSession(session);
        const existingUser = session?.user ? { 
          id: session.user.id, 
          email: session.user.email,
          user_metadata: session.user.user_metadata 
        } : null;
        setUser(existingUser);
        
        // Fetch profile for existing session
        if (existingUser?.id) {
          fetchProfile(existingUser.id);
        }
        
        setLoading(false);
      })
      .catch((error) => {
        logger.error('🔐 AuthProvider: Failed to get session', error);
        setLoading(false);
      });

    return () => subscription.unsubscribe();
  }, []);

  // Auto sign-out after party ends
  useEffect(() => {
    const checkPartyEnd = () => {
      if (isPartyOver() && session) {
        supabase.auth.signOut();
      }
    };

    // Check immediately
    checkPartyEnd();

    // Check every minute
    const interval = setInterval(checkPartyEnd, 60_000);
    
    return () => clearInterval(interval);
  }, [session]);

  const signIn = async (email: string) => {
    logger.debug('🔐 OTP Auth - Starting signIn process', {
      email,
      origin: window.location.origin,
      timestamp: new Date().toISOString()
    });

    try {
      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false,
        }
      });

      logger.debug('🔐 OTP Auth - Supabase response', {
        data,
        error,
        hasError: !!error,
        errorMessage: error?.message,
        errorCode: error?.status,
        timestamp: new Date().toISOString()
      });
      
      if (error) {
        logger.error('🔐 OTP Auth - Error details', error, {
          message: error.message,
          status: error.status,
          name: error.name,
          stack: error.stack
        });
        
        // If it's a rate limit error, provide a helpful message
        if (error.status === 429) {
          throw new Error('Rate limit exceeded. Please wait a few minutes before trying again, or contact support if this persists.');
        }
        
        throw error;
      }

      logger.info('🔐 OTP Auth - Success! OTP sent', {
        email,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('🔐 Magic Link Auth - Catch block error', error instanceof Error ? error : new Error('Unknown error'), {
        error,
        errorType: typeof error,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  };
  
  const signOut = async () => { 
    await supabase.auth.signOut(); 
  };

  // Dev mode: Create a mock session for testing (bypasses email) - DEVELOPMENT ONLY
  const devSignIn = async (email: string) => {
    // Security: Only allow in development environment
    if (import.meta.env.PROD || window.location.hostname !== 'localhost') {
      throw new Error('Developer authentication is disabled in production');
    }
    
    // Create a mock user session for development
    const mockUser = {
      id: 'dev-user-' + Date.now(),
      email: email,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      app_metadata: {},
      user_metadata: { email },
      aud: 'authenticated',
      confirmation_sent_at: new Date().toISOString(),
    };
    
    setUser({ 
      id: mockUser.id, 
      email: mockUser.email,
      user_metadata: mockUser.user_metadata 
    });
    setSession({
      access_token: 'dev-token',
      refresh_token: 'dev-refresh',
      expires_in: 3600,
      expires_at: Math.floor(Date.now() / 1000) + 3600,
      token_type: 'bearer',
      user: mockUser as any
    });
  };

  const signInWithOtp = async (email: string) => {
    logger.debug('🔐 OTP Auth - Starting signInWithOtp process', {
      email,
      origin: window.location.origin,
      redirectTo: `${window.location.origin}/auth`,
      shouldCreateUser: false,
      timestamp: new Date().toISOString()
    });

    try {
      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false,
          emailRedirectTo: `${window.location.origin}/auth`,
        }
      });

      logger.debug('🔐 OTP Auth - Supabase response', {
        data,
        error,
        hasError: !!error,
        errorMessage: error?.message,
        errorCode: error?.status,
        timestamp: new Date().toISOString()
      });
      
      if (error) {
        logger.error('🔐 OTP Auth - Error details', error, {
          message: error.message,
          status: error.status,
          name: error.name,
          stack: error.stack
        });
        throw error;
      }

      logger.info('🔐 OTP Auth - Success! OTP sent', {
        email,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('🔐 OTP Auth - Catch block error', error instanceof Error ? error : new Error('Unknown error'), {
        error,
        errorType: typeof error,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  };

  const verifyOtp = async (email: string, token: string) => {
    const { error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email'
    });
    
    if (error) {
      throw error;
    }
  };

  const signUpWithPassword = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth`,
      }
    });
    
    if (error) {
      throw error;
    }
  };

  const signInWithPassword = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      throw error;
    }
  };

  const resetPasswordForEmail = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth?type=recovery`,
    });
    
    if (error) {
      throw error;
    }
  };

  const updatePassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    
    if (error) {
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, profile, signIn, signOut, devSignIn, signInWithOtp, verifyOtp, signUpWithPassword, signInWithPassword, resetPasswordForEmail, updatePassword, refreshProfile, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}