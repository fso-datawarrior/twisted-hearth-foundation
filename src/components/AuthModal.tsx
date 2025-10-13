import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { useDeveloperMode } from "@/contexts/DeveloperModeContext";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const { devSignIn, signUpWithPassword, signInWithPassword, resetPasswordForEmail } = useAuth();
  const { toast } = useToast();
  const { isDeveloperMode } = useDeveloperMode();

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setEmail("");
      setPassword("");
      setIsSignUp(false);
      setIsForgotPassword(false);
    }, 200);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isForgotPassword) {
      if (!email.trim()) return;
      
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

    if (!email.trim() || !password.trim()) {
      return;
    }

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
      
      if (error?.message?.includes('invalid')) {
        errorMsg = "Please check your email and password.";
      } else if (error?.message?.includes('network')) {
        errorMsg = "Network error. Please check your connection and try again.";
      } else if (error?.message?.includes('already registered')) {
        errorMsg = "This email is already registered. Forgot your password?";
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
      <DialogContent className="sm:max-w-[425px] border-accent-gold">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl text-accent-gold uppercase">
            {isForgotPassword ? "Reset Password" : "Enter Twisted Tale"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {isForgotPassword
              ? "Enter your email to receive a password reset link."
              : isSignUp
              ? "Create an account with email and password."
              : "Sign in with your email and password."
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="font-subhead text-accent-gold">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com"
              required
              disabled={loading}
              className="bg-background border-accent-purple/30 focus:border-accent-gold"
            />
          </div>

          {!isForgotPassword && (
            <div className="space-y-2">
              <Label htmlFor="password" className="font-subhead text-accent-gold">
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

          <div className="flex items-center justify-between text-xs">
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
                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-accent-gold hover:text-accent-gold/80 underline"
                >
                  {isSignUp ? "Already have an account? Sign in" : "Need an account? Sign up"}
                </button>
                {!isSignUp && (
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
            disabled={loading || !email.trim() || (!isForgotPassword && !password.trim())}
            className="w-full bg-accent-gold hover:bg-accent-gold/80 text-background font-subhead"
          >
            {loading 
              ? "Processing..." 
              : isForgotPassword
              ? "Send Reset Link"
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
