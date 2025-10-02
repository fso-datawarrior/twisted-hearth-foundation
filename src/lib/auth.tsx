import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from '@supabase/supabase-js';
import { isPartyOver } from './event';

type SessionUser = { id: string; email: string | null };
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
    // Set up auth state listener FIRST to catch magic link auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ? { id: session.user.id, email: session.user.email } : null);
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ? { id: session.user.id, email: session.user.email } : null);
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
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth`,
      }
    });
    
    if (error) {
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
    
    setUser({ id: mockUser.id, email: mockUser.email });
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
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false,
        emailRedirectTo: `${window.location.origin}/auth`,
      }
    });
    
    if (error) {
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