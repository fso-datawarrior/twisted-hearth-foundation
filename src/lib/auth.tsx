import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from '@supabase/supabase-js';
import { isPartyOver } from './event';

type SessionUser = { 
  id: string; 
  email: string | null;
  user_metadata?: { full_name?: string; [key: string]: any };
};
type AuthCtx = { 
  user: SessionUser | null; 
  session: Session | null;
  signIn: (email: string) => Promise<void>; 
  signOut: () => Promise<void>; 
  devSignIn: (email: string) => Promise<void>;
  signInWithOtp: (email: string) => Promise<void>;
  verifyOtp: (email: string, token: string) => Promise<void>;
  loading: boolean;
};

const AuthContext = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🔐 AuthProvider: Initializing auth state...');
    
    // Set up auth state listener FIRST to catch magic link auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('🔐 AuthProvider: Auth state changed', { event, hasSession: !!session });
        setSession(session);
        setUser(session?.user ? { 
          id: session.user.id, 
          email: session.user.email,
          user_metadata: session.user.user_metadata 
        } : null);
        setLoading(false);
      }
    );

    // Check for existing session with error handling
    supabase.auth.getSession()
      .then(({ data: { session }, error }) => {
        if (error) {
          console.error('🔐 AuthProvider: Error getting session', error);
        } else {
          console.log('🔐 AuthProvider: Got existing session', { hasSession: !!session });
        }
        setSession(session);
        setUser(session?.user ? { 
          id: session.user.id, 
          email: session.user.email,
          user_metadata: session.user.user_metadata 
        } : null);
        setLoading(false);
      })
      .catch((error) => {
        console.error('🔐 AuthProvider: Failed to get session', error);
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
    console.log('🔐 Magic Link Auth - Starting signIn process', {
      email,
      origin: window.location.origin,
      redirectTo: `${window.location.origin}/auth`,
      timestamp: new Date().toISOString()
    });

    try {
      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth`,
        }
      });

      console.log('🔐 Magic Link Auth - Supabase response', {
        data,
        error,
        hasError: !!error,
        errorMessage: error?.message,
        errorCode: error?.status,
        timestamp: new Date().toISOString()
      });
      
      if (error) {
        console.error('🔐 Magic Link Auth - Error details', {
          message: error.message,
          status: error.status,
          statusText: error.statusText,
          name: error.name,
          cause: error.cause,
          stack: error.stack
        });
        
        // If it's a rate limit error, provide a helpful message
        if (error.status === 429) {
          throw new Error('Rate limit exceeded. Please wait a few minutes before trying again, or contact support if this persists.');
        }
        
        throw error;
      }

      console.log('🔐 Magic Link Auth - Success! Magic link sent', {
        email,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('🔐 Magic Link Auth - Catch block error', {
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
    console.log('🔐 OTP Auth - Starting signInWithOtp process', {
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

      console.log('🔐 OTP Auth - Supabase response', {
        data,
        error,
        hasError: !!error,
        errorMessage: error?.message,
        errorCode: error?.status,
        timestamp: new Date().toISOString()
      });
      
      if (error) {
        console.error('🔐 OTP Auth - Error details', {
          message: error.message,
          status: error.status,
          statusText: error.statusText,
          name: error.name,
          cause: error.cause,
          stack: error.stack
        });
        throw error;
      }

      console.log('🔐 OTP Auth - Success! OTP sent', {
        email,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('🔐 OTP Auth - Catch block error', {
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

  return (
    <AuthContext.Provider value={{ user, session, signIn, signOut, devSignIn, signInWithOtp, verifyOtp, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}