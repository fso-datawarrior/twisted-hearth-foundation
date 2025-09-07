import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from '@supabase/supabase-js';

type SessionUser = { id: string; email: string | null };
type AuthCtx = { 
  user: SessionUser | null; 
  session: Session | null;
  signIn: (email: string) => Promise<void>; 
  signOut: () => Promise<void>; 
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
        console.log('Auth state change:', event, session?.user?.email);
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

  const signIn = async (email: string) => {
    // Use the correct port for local development
    const redirectUrl = window.location.origin === 'http://localhost:3000' 
      ? 'http://localhost:8080/' 
      : `${window.location.origin}/`;
      
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

  return (
    <AuthContext.Provider value={{ user, session, signIn, signOut, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}