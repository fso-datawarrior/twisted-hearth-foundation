import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { useDeveloperMode } from "@/contexts/DeveloperModeContext";
import { Mail, KeyRound, Lock } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [authMethod, setAuthMethod] = useState<"magic" | "otp" | "password">("magic");
  const [otpSent, setOtpSent] = useState(false);
  const { devSignIn, signUpWithPassword, signInWithPassword, resetPasswordForEmail, signIn } = useAuth();
  const { toast } = useToast();
  const { isDeveloperMode } = useDeveloperMode();

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setEmail("");
      setPassword("");
      setOtp("");
      setIsSignUp(false);
      setIsForgotPassword(false);
      setOtpSent(false);
      setAuthMethod("magic");
    }, 200);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isForgotPassword) {
      if (!email.trim()) {
        return;
      }
      
      setLoading(true);
      try {
        await resetPasswordForEmail(email.trim().toLowerCase());
        toast({
          title: "Password reset link sent!",
          description: "Check your email for the password reset link.",
          duration: 5000,
        });
        handleClose();
      } catch (error: any) {
        toast({
          title: "Failed to send reset link",
          description: error?.message || "Please try again or contact support.",
          variant: "destructive",
          duration: 6000,
        });
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!email.trim()) return;

    // Magic Link Sign In
    if (authMethod === "magic") {
      setLoading(true);
      try {
        await signIn(email.trim().toLowerCase());
        toast({
          title: "Magic Link Sent! ✨",
          description: "Check your email for the magic sign-in link.",
          duration: 5000,
        });
        handleClose();
      } catch (error: any) {
        toast({
          title: "Failed to send magic link",
          description: error?.message || "Please try again.",
          variant: "destructive",
          duration: 6000,
        });
      } finally {
        setLoading(false);
      }
      return;
    }

    // OTP Sign In
    if (authMethod === "otp") {
      if (!otpSent) {
        // Send OTP
        setLoading(true);
        try {
          const { supabase } = await import("@/integrations/supabase/client");
          await supabase.auth.signInWithOtp({
            email: email.trim().toLowerCase(),
          });
          setOtpSent(true);
          toast({
            title: "OTP Sent! 🔑",
            description: "Check your email for the one-time password.",
            duration: 5000,
          });
        } catch (error: any) {
          toast({
            title: "Failed to send OTP",
            description: error?.message || "Please try again.",
            variant: "destructive",
            duration: 6000,
          });
        } finally {
          setLoading(false);
        }
      } else {
        // Verify OTP
        if (!otp.trim()) return;
        setLoading(true);
        try {
          const { supabase } = await import("@/integrations/supabase/client");
          const { error } = await supabase.auth.verifyOtp({
            email: email.trim().toLowerCase(),
            token: otp.trim(),
            type: 'email',
          });
          if (error) throw error;
          toast({
            title: "Welcome back!",
            description: "You're now signed in.",
            duration: 3000,
          });
          handleClose();
        } catch (error: any) {
          toast({
            title: "Invalid OTP",
            description: "Please check the code and try again.",
            variant: "destructive",
            duration: 6000,
          });
        } finally {
          setLoading(false);
        }
      }
      return;
    }

    // Password-based authentication
    if (!password.trim()) return;

    setLoading(true);
    try {
      if (isSignUp) {
        await signUpWithPassword(email.trim().toLowerCase(), password);
        toast({
          title: "Account created!",
          description: "Check your email to verify your account.",
          duration: 5000,
        });
        handleClose();
      } else {
        await signInWithPassword(email.trim().toLowerCase(), password);
        toast({
          title: "Welcome back!",
          description: "You're now signed in.",
          duration: 3000,
        });
        handleClose();
      }
    } catch (error: any) {
      let errorMsg = isSignUp
        ? "Unable to create account. Please try again."
        : "Invalid email or password.";
      
      if (error?.message?.includes('Email not confirmed')) {
        errorMsg = "Please check your email and click the confirmation link before signing in.";
      } else if (error?.message?.includes('invalid')) {
        errorMsg = "Please check your email and password.";
      } else if (error?.message?.includes('already registered')) {
        errorMsg = "This email is already registered. Try signing in instead.";
      }
      
      toast({
        title: isSignUp ? "Sign up failed" : "Sign in failed",
        description: errorMsg,
        variant: "destructive",
        duration: 6000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDevSignIn = async () => {
    if (!email.trim()) {
      return;
    }
    
    setLoading(true);
    try {
      await devSignIn(email.trim().toLowerCase());
      toast({
        title: "Dev sign-in successful! 🚀",
        description: "You're now signed in (dev mode - no email required)",
        duration: 4000,
      });
      handleClose();
      setEmail("");
    } catch (error: any) {
      toast({
        title: "Dev sign-in failed",
        description: error?.message || "Something went wrong with dev mode sign-in",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-[425px] mx-auto border-accent-gold">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl sm:text-2xl text-accent-gold uppercase">
            {isForgotPassword ? "Reset Password" : "Sign In to The Bash"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">
            {isForgotPassword
              ? "Enter your email to receive a password reset link."
              : authMethod === "magic"
              ? "Enter your email to receive a magic link for instant access."
              : authMethod === "otp"
              ? otpSent
                ? "Enter the OTP code sent to your email."
                : "We'll send a one-time password to your email."
              : isSignUp
              ? "Create an account with email and password."
              : "Sign in with your email and password."
            }
          </DialogDescription>
        </DialogHeader>

        {!isForgotPassword && (
          <Tabs value={authMethod} onValueChange={(v) => setAuthMethod(v as typeof authMethod)} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-background/50 border border-accent-gold/20">
              <TabsTrigger 
                value="magic" 
                className="data-[state=active]:bg-accent-gold data-[state=active]:text-background text-xs sm:text-sm"
              >
                <Mail className="w-4 h-4 mr-1" />
                Magic
              </TabsTrigger>
              <TabsTrigger 
                value="otp"
                className="data-[state=active]:bg-accent-gold data-[state=active]:text-background text-xs sm:text-sm"
              >
                <KeyRound className="w-4 h-4 mr-1" />
                OTP
              </TabsTrigger>
              <TabsTrigger 
                value="password"
                className="data-[state=active]:bg-accent-gold data-[state=active]:text-background text-xs sm:text-sm"
              >
                <Lock className="w-4 h-4 mr-1" />
                Password
              </TabsTrigger>
            </TabsList>
          </Tabs>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="font-subhead text-accent-gold text-sm uppercase">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com"
              required
              disabled={loading || (authMethod === "otp" && otpSent)}
              className="bg-background border-accent-purple/30 focus:border-accent-gold"
            />
          </div>

          {authMethod === "otp" && otpSent && (
            <div className="space-y-2">
              <Label htmlFor="otp" className="font-subhead text-accent-gold text-sm uppercase">
                One-Time Password
              </Label>
              <Input
                id="otp"
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter 6-digit code"
                required
                disabled={loading}
                maxLength={6}
                className="bg-background border-accent-purple/30 focus:border-accent-gold text-center text-lg tracking-widest"
              />
            </div>
          )}

          {authMethod === "password" && !isForgotPassword && (
            <div className="space-y-2">
              <Label htmlFor="password" className="font-subhead text-accent-gold text-sm uppercase">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={loading}
                minLength={6}
                className="bg-background border-accent-purple/30 focus:border-accent-gold"
              />
            </div>
          )}

          {authMethod === "magic" && !isForgotPassword && (
            <div className="bg-accent-gold/10 border border-accent-gold/20 rounded-lg p-3">
              <p className="text-xs text-accent-gold font-medium mb-1">✨ Magic link sign-in</p>
              <p className="text-xs text-muted-foreground">
                No password needed. Just click the link in your email.
              </p>
            </div>
          )}

          {authMethod === "otp" && !otpSent && !isForgotPassword && (
            <div className="bg-accent-gold/10 border border-accent-gold/20 rounded-lg p-3">
              <p className="text-xs text-accent-gold font-medium mb-1">🔑 One-time password</p>
              <p className="text-xs text-muted-foreground">
                We'll send a secure code to your email that you can use to sign in.
              </p>
            </div>
          )}

          <div className="flex items-center justify-between text-xs flex-wrap gap-2">
            {isForgotPassword ? (
              <button
                type="button"
                onClick={() => setIsForgotPassword(false)}
                className="text-accent-gold hover:text-accent-gold/80 underline"
              >
                Back to Sign In
              </button>
            ) : (
              <>
                {authMethod === "password" && (
                  <button
                    type="button"
                    onClick={() => setIsSignUp(!isSignUp)}
                    className="text-accent-gold hover:text-accent-gold/80 underline"
                  >
                    {isSignUp ? "Sign in instead" : "Create account"}
                  </button>
                )}
                {authMethod === "password" && !isSignUp && (
                  <button
                    type="button"
                    onClick={() => setIsForgotPassword(true)}
                    className="text-accent-gold hover:text-accent-gold/80 underline"
                  >
                    Forgot Password?
                  </button>
                )}
              </>
            )}
          </div>

          <Button
            type="submit"
            disabled={
              loading || 
              !email.trim() || 
              (authMethod === "password" && !isForgotPassword && !password.trim()) ||
              (authMethod === "otp" && otpSent && !otp.trim())
            }
            className="w-full bg-accent-gold hover:bg-accent-gold/80 text-background font-subhead"
          >
            {loading 
              ? "Processing..." 
              : isForgotPassword
              ? "Send Reset Link"
              : authMethod === "magic"
              ? "Send Magic Link"
              : authMethod === "otp"
              ? otpSent
                ? "Verify OTP"
                : "Send OTP"
              : isSignUp
              ? "Sign Up"
              : "Sign In"
            }
          </Button>

          {isDeveloperMode && (
            <div className="pt-4 border-t border-accent-purple/20">
              <p className="text-xs text-amber-400 mb-2 text-center">🔧 Developer Mode Active</p>
              <Button
                type="button"
                variant="outline"
                onClick={handleDevSignIn}
                disabled={loading || !email.trim()}
                className="w-full border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
              >
                {loading ? "Processing..." : "Dev Sign-in (Skip Auth)"}
              </Button>
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
