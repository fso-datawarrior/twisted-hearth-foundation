import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { useDeveloperMode } from "@/contexts/DeveloperModeContext";
import { CheckCircle, Mail, KeyRound, ArrowLeft, Lock, Clock } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [authMethod, setAuthMethod] = useState<'magic-link' | 'otp' | 'password'>('magic-link');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [countdown, setCountdown] = useState(300);
  const [rateLimitCooldown, setRateLimitCooldown] = useState(0);
  const [isSignUp, setIsSignUp] = useState(false);
  const { signIn, devSignIn, signInWithOtp, verifyOtp, signUpWithPassword, signInWithPassword } = useAuth();
  const { toast } = useToast();
  const { isDeveloperMode } = useDeveloperMode();

  // Countdown timer for OTP expiration
  useEffect(() => {
    if (otpSent && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpSent, countdown]);

  // Countdown timer for rate limit cooldown
  useEffect(() => {
    if (rateLimitCooldown > 0) {
      const timer = setTimeout(() => setRateLimitCooldown(rateLimitCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [rateLimitCooldown]);

  const handleClose = () => {
    onClose();
    // Reset form state when modal closes
    setTimeout(() => {
      setEmail("");
      setPassword("");
      setSent(false);
      setOtpSent(false);
      setOtpCode("");
      setCountdown(300);
      setAuthMethod('magic-link');
      setIsSignUp(false);
    }, 200);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || (authMethod === 'password' && !password.trim())) {
      return;
    }

    setLoading(true);
    
    try {
      if (authMethod === 'magic-link') {
        await signIn(email.trim().toLowerCase());
        setSent(true);
      } else if (authMethod === 'otp') {
        await signInWithOtp(email.trim().toLowerCase());
        setOtpSent(true);
        setCountdown(300);
        toast({
          title: "Code sent!",
          description: "Check your email for a 6-digit code.\n🎃 Check your spam crypt if it doesn't appear!",
          duration: 4000,
        });
      } else {
        // Password authentication
        if (isSignUp) {
          await signUpWithPassword(email.trim().toLowerCase(), password);
          toast({
            title: "Account created!",
            description: "Check your email to verify your account.\n🎃 Check your spam crypt if it doesn't appear!",
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
      }
    } catch (error: any) {
      let errorMsg = authMethod === 'magic-link' 
        ? "Unable to send magic link. Please try again."
        : authMethod === 'otp'
        ? "Unable to send code. Please try again."
        : isSignUp
        ? "Unable to create account. Please try again."
        : "Invalid email or password.";
      
      if (error?.message?.includes('rate') || error?.status === 429) {
        errorMsg = "Too many requests. Try password sign-in or wait before retrying.";
        // Set cooldown to 2 hours (7200 seconds)
        setRateLimitCooldown(7200);
      } else if (error?.message?.includes('invalid')) {
        errorMsg = authMethod === 'password' 
          ? "Please check your email and password."
          : "Please enter a valid email address.";
      } else if (error?.message?.includes('network')) {
        errorMsg = "Network error. Please check your connection and try again.";
      } else if (error?.message?.includes('already registered')) {
        errorMsg = "This email is already registered. Try signing in instead.";
      }
      
      toast({
        title: authMethod === 'password' 
          ? (isSignUp ? "Sign up failed" : "Sign in failed")
          : authMethod === 'magic-link' 
          ? "Failed to send magic link" 
          : "Failed to send code",
        description: errorMsg,
        variant: "destructive",
        duration: 6000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otpCode.length !== 6) {
      toast({
        title: "Invalid code",
        description: "Please enter a 6-digit code.",
        variant: "destructive",
      });
      return;
    }

    setVerifying(true);
    try {
      await verifyOtp(email.trim().toLowerCase(), otpCode);
      toast({
        title: "Success!",
        description: "You're now signed in!",
        duration: 3000,
      });
      handleClose();
    } catch (error: any) {
      let errorMsg = "Please check the code and try again.";
      
      if (error?.message?.includes('expired')) {
        errorMsg = "This code has expired. Request a new one.";
      } else if (error?.message?.includes('invalid')) {
        errorMsg = "This code is incorrect. Please try again.";
      }
      
      toast({
        title: "Verification failed",
        description: errorMsg,
        variant: "destructive",
        duration: 5000,
      });
      setOtpCode("");
    } finally {
      setVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    try {
      await signInWithOtp(email.trim().toLowerCase());
      setCountdown(300);
      setOtpCode("");
      toast({
        title: "New code sent!",
        description: "Check your email for a new 6-digit code.\n🎃 Check your spam crypt if it doesn't appear!",
        duration: 4000,
      });
    } catch (error: any) {
      toast({
        title: "Failed to resend code",
        description: "Please try again in a moment.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBackToEmail = () => {
    setOtpSent(false);
    setOtpCode("");
    setCountdown(300);
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
            Enter Twisted Tale
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {otpSent 
              ? "Enter the 6-digit code sent to your email."
              : authMethod === 'magic-link'
              ? "Enter your email to receive a magic link for instant access."
              : authMethod === 'otp'
              ? "Enter your email to receive a 6-digit code."
              : isSignUp
              ? "Create an account with email and password."
              : "Sign in with your email and password."
            }
          </DialogDescription>
        </DialogHeader>
        
        {otpSent ? (
          <div className="space-y-4 py-4">
            <div className="flex flex-col items-center text-center space-y-4">
              <KeyRound className="h-12 w-12 text-accent-gold" />
              <h3 className="font-heading text-lg text-accent-gold">Enter Verification Code</h3>
              <p className="text-sm text-muted-foreground">
                We sent a 6-digit code to <strong className="text-foreground">{email}</strong>
              </p>
              <p className="text-xs text-amber-400 font-semibold">
                💀 Check your spam crypt if it doesn't appear!
              </p>
              
              <div className="w-full max-w-xs">
                <InputOTP 
                  maxLength={6} 
                  value={otpCode} 
                  onChange={setOtpCode}
                  disabled={verifying}
                >
                  <InputOTPGroup className="gap-2 mx-auto">
                    <InputOTPSlot index={0} className="border-2 border-accent-gold/60 bg-accent-purple/20 text-accent-gold focus:border-accent-gold focus:ring-2 focus:ring-accent-gold/50" />
                    <InputOTPSlot index={1} className="border-2 border-accent-gold/60 bg-accent-purple/20 text-accent-gold focus:border-accent-gold focus:ring-2 focus:ring-accent-gold/50" />
                    <InputOTPSlot index={2} className="border-2 border-accent-gold/60 bg-accent-purple/20 text-accent-gold focus:border-accent-gold focus:ring-2 focus:ring-accent-gold/50" />
                    <InputOTPSlot index={3} className="border-2 border-accent-gold/60 bg-accent-purple/20 text-accent-gold focus:border-accent-gold focus:ring-2 focus:ring-accent-gold/50" />
                    <InputOTPSlot index={4} className="border-2 border-accent-gold/60 bg-accent-purple/20 text-accent-gold focus:border-accent-gold focus:ring-2 focus:ring-accent-gold/50" />
                    <InputOTPSlot index={5} className="border-2 border-accent-gold/60 bg-accent-purple/20 text-accent-gold focus:border-accent-gold focus:ring-2 focus:ring-accent-gold/50" />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              <div className="text-center">
                {countdown > 0 ? (
                  <p className={`text-sm ${countdown < 30 ? 'text-red-500' : 'text-muted-foreground'}`}>
                    Code expires in {Math.floor(countdown / 60)}:{String(countdown % 60).padStart(2, '0')}
                  </p>
                ) : (
                  <Button
                    type="button"
                    variant="link"
                    onClick={handleResendOtp}
                    disabled={loading}
                    className="text-accent-gold hover:text-accent-gold/80"
                  >
                    Resend code
                  </Button>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleBackToEmail}
                disabled={verifying}
                className="flex-1 border-accent-purple/30 hover:bg-accent-purple/10"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button
                onClick={handleVerifyOtp}
                disabled={verifying || otpCode.length !== 6}
                className="flex-1 bg-accent-gold hover:bg-accent-gold/80 text-background font-subhead"
              >
                {verifying ? "Verifying..." : "Verify Code"}
              </Button>
            </div>
          </div>
        ) : sent ? (
          <div className="space-y-4 py-4">
            <div className="flex flex-col items-center text-center space-y-3">
              <CheckCircle className="h-12 w-12 text-green-500" />
              <h3 className="font-heading text-lg text-accent-gold">Check Your Email!</h3>
              <p className="text-sm text-muted-foreground">
                We sent a magic link to <strong className="text-foreground">{email}</strong>
              </p>
              <p className="text-xs text-muted-foreground opacity-75">
                Click the link in the email to log in instantly - no confirmation needed!
              </p>
              <p className="text-xs text-amber-400 font-semibold">
                💀 Check your spam crypt if it doesn't appear!
              </p>
            </div>
            
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="w-full border-accent-purple/30 hover:bg-accent-purple/10"
            >
              Close
            </Button>
          </div>
        ) : (
          <>
            {/* Rate Limit Warning */}
            {rateLimitCooldown > 0 && (
              <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 flex items-start gap-3">
                <Clock className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium text-destructive">Rate limit active</p>
                  <p className="text-xs text-muted-foreground">
                    Cooldown: {Math.floor(rateLimitCooldown / 3600)}h {Math.floor((rateLimitCooldown % 3600) / 60)}m {rateLimitCooldown % 60}s
                  </p>
                  <p className="text-xs text-muted-foreground">Try password sign-in below instead.</p>
                </div>
              </div>
            )}

            {/* Auth Method Toggle */}
            <div className="grid grid-cols-3 gap-2 p-1 bg-accent-purple/10 rounded-lg">
              <button
                type="button"
                onClick={() => setAuthMethod('magic-link')}
                disabled={rateLimitCooldown > 0}
                className={`px-3 py-2 rounded-md text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  authMethod === 'magic-link'
                    ? 'bg-accent-gold text-background'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Mail className="inline h-3 w-3 mr-1" />
                Magic
              </button>
              <button
                type="button"
                onClick={() => setAuthMethod('otp')}
                disabled={rateLimitCooldown > 0}
                className={`px-3 py-2 rounded-md text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  authMethod === 'otp'
                    ? 'bg-accent-gold text-background'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <KeyRound className="inline h-3 w-3 mr-1" />
                OTP
              </button>
              <button
                type="button"
                onClick={() => setAuthMethod('password')}
                className={`px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                  authMethod === 'password'
                    ? 'bg-accent-gold text-background'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Lock className="inline h-3 w-3 mr-1" />
                Password
              </button>
            </div>

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

              {authMethod === 'password' && (
                <>
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

                  <div className="flex items-center justify-between text-xs">
                    <button
                      type="button"
                      onClick={() => setIsSignUp(!isSignUp)}
                      className="text-accent-gold hover:text-accent-gold/80 underline"
                    >
                      {isSignUp ? "Already have an account? Sign in" : "Need an account? Sign up"}
                    </button>
                  </div>
                </>
              )}
              
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={loading}
                  className="flex-1 border-accent-purple/30 hover:bg-accent-purple/10"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading || !email.trim() || (authMethod === 'password' && !password.trim()) || (authMethod !== 'password' && rateLimitCooldown > 0)}
                  className="flex-1 bg-accent-gold hover:bg-accent-gold/80 text-background font-subhead disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      {authMethod === 'magic-link' ? (
                        <Mail className="mr-2 h-4 w-4 animate-pulse" />
                      ) : authMethod === 'otp' ? (
                        <KeyRound className="mr-2 h-4 w-4 animate-pulse" />
                      ) : (
                        <Lock className="mr-2 h-4 w-4 animate-pulse" />
                      )}
                      {authMethod === 'password' ? (isSignUp ? "Creating..." : "Signing in...") : "Sending..."}
                    </>
                  ) : authMethod === 'magic-link' ? (
                    "Send Magic Link"
                  ) : authMethod === 'otp' ? (
                    "Send Code"
                  ) : isSignUp ? (
                    "Create Account"
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </div>
            </form>

            {isDeveloperMode && (
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-accent-purple/20" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Dev Mode</span>
                </div>
              </div>
            )}

            {isDeveloperMode && (
              <Button
                type="button"
                variant="secondary"
                onClick={handleDevSignIn}
                disabled={loading || !email.trim()}
                className="w-full bg-accent-purple/20 hover:bg-accent-purple/30 text-accent-gold border-accent-purple/40"
              >
                {loading ? "Signing in..." : "🚀 Dev Sign In (No Email)"}
              </Button>
            )}
            
            <div className="text-center">
              {authMethod === 'magic-link' ? (
                <>
                  <p className="font-body text-sm text-muted-foreground">
                    📧 <strong>Magic link sign-in</strong> - Check your email to log in!
                  </p>
                  <p className="font-body text-xs text-muted-foreground mt-1 opacity-75">
                    No password needed. Just click the link in your email.
                  </p>
                </>
              ) : authMethod === 'otp' ? (
                <>
                  <p className="font-body text-sm text-muted-foreground">
                    🔐 <strong>OTP code sign-in</strong> - Enter the code from your email!
                  </p>
                  <p className="font-body text-xs text-muted-foreground mt-1 opacity-75">
                    6-digit code • Expires in 5 minutes
                  </p>
                </>
              ) : (
                <>
                  <p className="font-body text-sm text-muted-foreground">
                    🔒 <strong>Password sign-in</strong> - Instant access, no email wait!
                  </p>
                  <p className="font-body text-xs text-muted-foreground mt-1 opacity-75">
                    Password must be at least 6 characters
                  </p>
                </>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}