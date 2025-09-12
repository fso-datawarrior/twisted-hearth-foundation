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
    // Use custom domain for production or current origin for development
    const isProduction = window.location.hostname === '2025.partytillyou.rip';
    const redirectUrl = isProduction 
      ? 'https://2025.partytillyou.rip/auth'
      : `${window.location.origin}/auth`;
      
    const { error } = await supabase.auth.signInWithOtp({ 
      email, 
      options: { emailRedirectTo: redirectUrl } 
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

  return (
    <AuthContext.Provider value={{ user, session, signIn, signOut, devSignIn, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}