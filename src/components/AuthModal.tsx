import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { useDeveloperMode } from "@/contexts/DeveloperModeContext";
import { CheckCircle, Mail } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [authState, setAuthState] = useState<'form' | 'sent' | 'error'>('form');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { signIn, devSignIn } = useAuth();
  const { toast } = useToast();
  const { isDeveloperMode } = useDeveloperMode();

  const handleClose = () => {
    onClose();
    // Reset form state when modal closes
    setTimeout(() => {
      setEmail("");
      setAuthState('form');
      setErrorMessage(null);
    }, 200);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    
    try {
      await signIn(email.trim().toLowerCase());
      
      setAuthState('sent');
      
      toast({
        title: "Magic link sent! ✨",
        description: "Check your email and click the link to sign in. The link expires in 1 hour.",
        duration: 8000,
      });
    } catch (error: any) {
      console.error('Sign-in error:', error);
      
      let errorMsg = "Please try again or contact support.";
      
      if (error?.message?.includes('rate')) {
        errorMsg = "Too many requests. Please wait a moment before trying again.";
      } else if (error?.message?.includes('invalid')) {
        errorMsg = "Please enter a valid email address.";
      } else if (error?.message?.includes('network')) {
        errorMsg = "Network error. Please check your connection and try again.";
      }
      
      setErrorMessage(errorMsg);
      setAuthState('error');
      
      toast({
        title: "Could not send magic link",
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
    } catch (error) {
      console.error('Dev sign-in error:', error);
      toast({
        title: "Dev sign-in failed",
        description: "Something went wrong with dev mode sign-in",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl text-accent-gold">
            Sign In to the Bash
          </DialogTitle>
        </DialogHeader>
        
        {authState === 'sent' ? (
          <div className="space-y-4 text-center">
            <div className="flex justify-center">
              <div className="rounded-full bg-accent-gold/10 p-3">
                <CheckCircle className="h-8 w-8 text-accent-gold" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="font-subhead text-accent-gold">Check Your Email</h3>
              <p className="font-body text-sm text-muted-foreground">
                We've sent a magic link to <strong>{email}</strong>
              </p>
              <div className="mt-4 p-3 bg-muted rounded-lg text-xs text-muted-foreground">
                <p className="font-medium mb-1">⚠️ Important Tips:</p>
                <ul className="space-y-1">
                  <li>• Check your spam/junk folder if you don't see it</li>
                  <li>• Click the link immediately when you receive it</li>
                  <li>• Corporate emails may have security scanners that consume links</li>
                  <li>• Consider using a personal email (Gmail, etc.) if issues persist</li>
                </ul>
              </div>
              <Button
                onClick={handleClose}
                variant="outline"
                className="mt-4 w-full border-accent-purple/30 hover:bg-accent-purple/10"
              >
                Close
              </Button>
            </div>
          </div>
        ) : (
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
              {errorMessage && authState === 'error' && (
                <p className="font-body text-sm text-destructive">{errorMessage}</p>
              )}
            </div>
            
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
                disabled={loading || !email.trim()}
                className="flex-1 bg-accent-gold hover:bg-accent-gold/80 text-background font-subhead"
              >
                {loading ? (
                  <>
                    <Mail className="mr-2 h-4 w-4 animate-pulse" />
                    Sending...
                  </>
                ) : (
                  "Send Magic Link"
                )}
              </Button>
            </div>
          </form>
        )}

        {isDeveloperMode && authState === 'form' && (
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-accent-purple/20" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Dev Mode</span>
            </div>
          </div>
        )}

        {isDeveloperMode && authState === 'form' && (
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
        
        {authState === 'form' && (
          <div className="text-center">
            <p className="font-body text-sm text-muted-foreground">
              We'll send you a secure sign-in link. No passwords required.
            </p>
            <p className="font-body text-xs text-muted-foreground mt-1 opacity-75">
              Corporate email users: If links don't work, try a personal email to avoid security scanners.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}