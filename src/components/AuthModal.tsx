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
  const [sent, setSent] = useState(false);
  const { signIn, devSignIn } = useAuth();
  const { toast } = useToast();
  const { isDeveloperMode } = useDeveloperMode();

  const handleClose = () => {
    onClose();
    // Reset form state when modal closes
    setTimeout(() => {
      setEmail("");
      setSent(false);
    }, 200);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      return;
    }

    setLoading(true);
    
    try {
      await signIn(email.trim().toLowerCase());
      setSent(true);
    } catch (error: any) {
      let errorMsg = "Unable to send magic link. Please try again.";
      
      if (error?.message?.includes('rate')) {
        errorMsg = "Too many requests. Please wait a moment before trying again.";
      } else if (error?.message?.includes('invalid')) {
        errorMsg = "Please enter a valid email address.";
      } else if (error?.message?.includes('network')) {
        errorMsg = "Network error. Please check your connection and try again.";
      }
      
      toast({
        title: "Failed to send magic link",
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl text-accent-gold">
            Sign In to the Bash
          </DialogTitle>
        </DialogHeader>
        
        {sent ? (
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
              <p className="font-body text-sm text-muted-foreground">
                📧 <strong>Magic link sign-in</strong> - Check your email to log in!
              </p>
              <p className="font-body text-xs text-muted-foreground mt-1 opacity-75">
                No password needed. Just click the link in your email.
              </p>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}