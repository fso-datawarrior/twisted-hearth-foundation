import React, { createContext, useContext } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";
import { isPartyOver } from "./event";

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
  signUpWithPassword: (email: string, password: string) => Promise<void>;
  signInWithPassword: (email: string, password: string) => Promise<void>;
  loading: boolean;
};

const AuthContext = createContext<AuthCtx | null>(null);

type State = {
  user: SessionUser | null;
  session: Session | null;
  loading: boolean;
};

export class AuthProvider extends React.Component<{ children: React.ReactNode }, State> {
  private subscription: { unsubscribe: () => void } | null = null;
  private partyInterval: number | undefined;

  state: State = {
    user: null,
    session: null,
    loading: true,
  };

  async componentDidMount() {
    try {
      // Log the React runtime to help diagnose duplicate React issues
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      console.log("🔐 AuthProvider (class): React.version=", (React as any).version);

      // Listen for auth state changes FIRST
      const { data } = supabase.auth.onAuthStateChange((event, session) => {
        // console.debug('🔐 Auth state changed', { event, hasSession: !!session });
        this.setState({
          session: session ?? null,
          user: session?.user
            ? { id: session.user.id, email: session.user.email, user_metadata: session.user.user_metadata }
            : null,
          loading: false,
        });
      });
      this.subscription = data?.subscription ?? null;

      // Then check existing session
      const { data: sessionData, error } = await supabase.auth.getSession();
      if (error) {
        console.error("🔐 AuthProvider: Error getting session", error);
      }
      const session = sessionData.session ?? null;
      this.setState({
        session,
        user: session?.user
          ? { id: session.user.id, email: session.user.email, user_metadata: session.user.user_metadata }
          : null,
        loading: false,
      });

      // Auto sign-out after party ends
      const checkPartyEnd = () => {
        if (isPartyOver() && this.state.session) {
          supabase.auth.signOut();
        }
      };
      checkPartyEnd();
      this.partyInterval = window.setInterval(checkPartyEnd, 60_000);
    } catch (e) {
      console.error("🔐 AuthProvider: Initialization error", e);
      this.setState({ loading: false });
    }
  }

  componentWillUnmount(): void {
    try {
      this.subscription?.unsubscribe();
    } catch {}
    if (this.partyInterval) window.clearInterval(this.partyInterval);
  }

  // ----- Auth API (same surface as before) -----
  signIn = async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false },
    });
    if (error) throw error;
  };

  signOut = async () => {
    await supabase.auth.signOut();
  };

  devSignIn = async (email: string) => {
    if (import.meta.env.PROD || window.location.hostname !== "localhost") {
      throw new Error("Developer authentication is disabled in production");
    }
    // Minimal mock (kept for local-only developer flow)
    this.setState({
      user: { id: "dev-user-" + Date.now(), email, user_metadata: { email } },
      session: {
        access_token: "dev-token",
        refresh_token: "dev-refresh",
        expires_in: 3600,
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        token_type: "bearer",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        user: { id: "dev-user-" + Date.now(), email, user_metadata: { email } } as any,
      },
      loading: false,
    });
  };

  signInWithOtp = async (email: string) => {
    const redirectTo = `${window.location.origin}/auth`;
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false, emailRedirectTo: redirectTo },
    });
    if (error) throw error;
  };

  verifyOtp = async (email: string, token: string) => {
    const { error } = await supabase.auth.verifyOtp({ email, token, type: "email" });
    if (error) throw error;
  };

  signUpWithPassword = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth` },
    });
    if (error) throw error;
  };

  signInWithPassword = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  render() {
    const value: AuthCtx = {
      user: this.state.user,
      session: this.state.session,
      signIn: this.signIn,
      signOut: this.signOut,
      devSignIn: this.devSignIn,
      signInWithOtp: this.signInWithOtp,
      verifyOtp: this.verifyOtp,
      signUpWithPassword: this.signUpWithPassword,
      signInWithPassword: this.signInWithPassword,
      loading: this.state.loading,
    };

    return <AuthContext.Provider value={value}>{this.props.children}</AuthContext.Provider>;
  }
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
