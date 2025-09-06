import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type SessionUser = { id: string; email: string | null };
type AuthCtx = { user: SessionUser | null; signIn: (email: string) => Promise<void>; signOut: () => Promise<void>; };

const AuthContext = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user ? { id: data.session.user.id, email: data.session.user.email } : null);
    };
    init();
    const { data: sub } = supabase.auth.onAuthStateChange((_e, sess) => {
      setUser(sess?.user ? { id: sess.user.id, email: sess.user.email } : null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const signIn = async (email: string) => {
    const redirectUrl = `${window.location.origin}/`;
    await supabase.auth.signInWithOtp({ 
      email, 
      options: { emailRedirectTo: redirectUrl } 
    });
  };
  
  const signOut = async () => { 
    await supabase.auth.signOut(); 
  };

  return <AuthContext.Provider value={{ user, signIn, signOut }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}