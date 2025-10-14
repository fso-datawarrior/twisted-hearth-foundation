import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";
import { useDeveloperMode } from "@/contexts/DeveloperModeContext";
import { Mail, KeyRound, Lock, Eye, EyeOff } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSupport?: () => void;
}

export default function AuthModal({ isOpen, onClose, onOpenSupport }: AuthModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [authMethod, setAuthMethod] = useState<'magic' | 'otp' | 'password'>('password');
  const [otpSent, setOtpSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { signIn, signUpWithPassword, signInWithPassword, resetPasswordForEmail, devSignIn } = useAuth();
  const { isDeveloperMode } = useDeveloperMode();

  const handleClose = () => {
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setOtp("");
    setOtpSent(false);
    setIsSignUp(false);
    setIsForgotPassword(false);
    setAuthMethod('password');
    setShowPassword(false);
    setShowConfirmPassword(false);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Password reset flow
      if (isForgotPassword) {
        await resetPasswordForEmail(email);
        
        toast({
          title: "Password reset link sent!",
          description: "Check your email for the password reset link.",
        });
        handleClose();
        return;
      }

      // Magic Link authentication
      if (authMethod === 'magic') {
        await signIn(email);
        
        toast({
          title: "Magic link sent!",
          description: "Check your email to sign in.",
        });
        handleClose();
        return;
      }

      // OTP authentication
      if (authMethod === 'otp') {
        if (!otpSent) {
          // Send OTP
          const { supabase } = await import("@/integrations/supabase/client");
          const { error } = await supabase.auth.signInWithOtp({
            email: email.trim().toLowerCase(),
          });
          if (error) throw error;
          
          setOtpSent(true);
          toast({
            title: "OTP sent!",
            description: "Check your email for the 6-digit code.",
          });
        } else {
          // Verify OTP
          const { supabase } = await import("@/integrations/supabase/client");
          const { error } = await supabase.auth.verifyOtp({
            email: email.trim().toLowerCase(),
            token: otp.trim(),
            type: 'email',
          });
          if (error) throw error;
          
          toast({
            title: "Welcome back!",
            description: "You have successfully signed in.",
          });
          handleClose();
        }
        return;
      }

      // Password-based authentication
      if (authMethod === 'password') {
        if (isSignUp) {
          // Validate password confirmation
          if (password !== confirmPassword) {
            toast({
              title: "Passwords don't match",
              description: "Please ensure both password fields are identical.",
              variant: "destructive",
            });
            return;
          }
          
          await signUpWithPassword(email, password);
          
          toast({
            title: "Account created!",
            description: "Please check your email to confirm your account.",
          });
          handleClose();
        } else {
          await signInWithPassword(email, password);
          
          toast({
            title: "Welcome back!",
            description: "You have successfully signed in.",
          });
          handleClose();
        }
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      toast({
        title: "Authentication failed",
        description: error.message || "An error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDevSignIn = async () => {
    if (!email) return;
    
    setLoading(true);
    try {
      await devSignIn(email);
      toast({
        title: "Dev sign-in successful!",
        description: "You're now signed in (dev mode).",
      });
      handleClose();
    } catch (error: any) {
      toast({
        title: "Dev sign-in failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-[425px] mx-auto bg-background border-2 border-accent-gold/30">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-accent-gold">
            {isForgotPassword ? "Reset Password" : isSignUp ? "Create Account" : "Sign In"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-2">
          {!isForgotPassword && (
            <Tabs value={authMethod} onValueChange={(v) => setAuthMethod(v as any)} className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-background/50 border border-accent-gold/20">
                <TabsTrigger 
                  value="password" 
                  className="data-[state=active]:bg-accent-gold/20 data-[state=active]:text-accent-gold text-xs sm:text-sm"
                >
                  <Lock className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  Password
                </TabsTrigger>
                <TabsTrigger 
                  value="magic" 
                  className="data-[state=active]:bg-accent-gold/20 data-[state=active]:text-accent-gold text-xs sm:text-sm"
                >
                  <Mail className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  Magic
                </TabsTrigger>
                <TabsTrigger 
                  value="otp" 
                  className="data-[state=active]:bg-accent-gold/20 data-[state=active]:text-accent-gold text-xs sm:text-sm"
                >
                  <KeyRound className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  OTP
                </TabsTrigger>
              </TabsList>

              {/* Password Tab */}
              <TabsContent value="password" className="space-y-2 mt-2">
                <div className="space-y-2">
                  <Label htmlFor="password-email" className="text-accent-gold">Email</Label>
                  <Input
                    id="password-email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-background/50 border-accent-gold/30 focus:border-accent-gold text-foreground placeholder:text-muted-foreground"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-accent-gold">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="bg-background/50 border-accent-gold/30 focus:border-accent-gold text-foreground placeholder:text-muted-foreground pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-accent-gold transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {isSignUp && (
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password" className="text-accent-gold">Confirm Password</Label>
                    <div className="relative">
                      <Input
                        id="confirm-password"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="bg-background/50 border-accent-gold/30 focus:border-accent-gold text-foreground placeholder:text-muted-foreground pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-accent-gold transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                )}

                <p className="text-xs text-muted-foreground">
                  {isSignUp ? "Create an account with email and password" : "Sign in with your email and password"}
                </p>
              </TabsContent>

              {/* Magic Link Tab */}
              <TabsContent value="magic" className="space-y-2 mt-2">
                <div className="space-y-2">
                  <Label htmlFor="magic-email" className="text-accent-gold">Email</Label>
                  <Input
                    id="magic-email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-background/50 border-accent-gold/30 focus:border-accent-gold text-foreground placeholder:text-muted-foreground"
                  />
                </div>
                
                <p className="text-xs text-muted-foreground">
                  We'll send you a magic link to sign in - no password needed!
                </p>
              </TabsContent>

              {/* OTP Tab */}
              <TabsContent value="otp" className="space-y-2 mt-2">
                <div className="space-y-2">
                  <Label htmlFor="otp-email" className="text-accent-gold">Email</Label>
                  <Input
                    id="otp-email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={otpSent}
                    className="bg-background/50 border-accent-gold/30 focus:border-accent-gold text-foreground placeholder:text-muted-foreground disabled:opacity-50"
                  />
                </div>

                {otpSent && (
                  <div className="space-y-2">
                    <Label htmlFor="otp-code" className="text-accent-gold">6-digit code</Label>
                    <Input
                      id="otp-code"
                      type="text"
                      placeholder="000000"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      maxLength={6}
                      required
                      className="bg-background/50 border-accent-gold/30 focus:border-accent-gold text-foreground placeholder:text-muted-foreground font-mono text-lg tracking-widest text-center"
                    />
                  </div>
                )}
                
                <p className="text-xs text-muted-foreground">
                  {otpSent ? "Enter the 6-digit code sent to your email" : "We'll send you a one-time code to sign in"}
                </p>
              </TabsContent>
            </Tabs>
          )}

          {isForgotPassword && (
            <div className="space-y-2">
              <Label htmlFor="reset-email" className="text-accent-gold">Email</Label>
              <Input
                id="reset-email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-background/50 border-accent-gold/30 focus:border-accent-gold text-foreground"
              />
            </div>
          )}

          <div className="flex flex-col gap-1 items-center">
            {authMethod === 'password' && !isForgotPassword && (
              <div className="flex flex-col gap-1 items-center">
                <Button
                  type="button"
                  variant="link"
                  className="text-xs text-accent-gold hover:text-accent-gold/80 hover:underline p-0 h-auto"
                  onClick={() => setIsSignUp(!isSignUp)}
                >
                  {isSignUp ? "Already have an account? Sign in" : "Need an account? Sign up"}
                </Button>
                <Button
                  type="button"
                  variant="link"
                  className="text-xs text-accent-gold hover:text-accent-gold/80 hover:underline p-0 h-auto"
                  onClick={() => setIsForgotPassword(!isForgotPassword)}
                >
                  {isForgotPassword ? "Back to sign in" : "Forgot password?"}
                </Button>
                {onOpenSupport && (
                  <Button
                    type="button"
                    variant="link"
                    className="text-xs text-blue-400 hover:text-blue-300 hover:underline p-0 h-auto"
                    onClick={() => {
                      handleClose();
                      onOpenSupport();
                    }}
                  >
                    Having Trouble Signing In? <span className="font-semibold ml-1">Report Issue</span>
                  </Button>
                )}
              </div>
            )}

            {isForgotPassword && (
              <Button
                type="button"
                variant="link"
                className="text-xs text-accent-gold hover:text-accent-gold/80 hover:underline p-0 h-auto"
                onClick={() => setIsForgotPassword(false)}
              >
                Back to sign in
              </Button>
            )}
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-accent-gold hover:bg-accent-gold/90 text-background font-semibold"
          >
            {loading ? "Processing..." : 
             isForgotPassword ? "Send Reset Link" :
             authMethod === 'magic' ? "Send Magic Link" :
             authMethod === 'otp' ? (otpSent ? "Verify Code" : "Send Code") :
             isSignUp ? "Create Account" : "Sign In"}
          </Button>

          {isDeveloperMode && (
            <div className="pt-4 border-t border-accent-gold/20">
              <p className="text-xs text-amber-400 mb-2 text-center">🔧 Developer Mode Active</p>
              <Button
                type="button"
                variant="outline"
                onClick={handleDevSignIn}
                disabled={loading || !email}
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

export { AuthModal };
