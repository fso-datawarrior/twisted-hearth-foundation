import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    try {
      await signIn(email.trim().toLowerCase());
      toast({
        title: "Magic link sent! ✨",
        description: "Check your email and click the link to sign in. The link expires in 1 hour.",
        duration: 8000,
      });
      onClose();
      setEmail("");
    } catch (error: any) {
      console.error('Sign-in error:', error);
      
      let errorMessage = "Please try again or contact support.";
      
      if (error?.message?.includes('rate')) {
        errorMessage = "Too many requests. Please wait a moment before trying again.";
      } else if (error?.message?.includes('invalid')) {
        errorMessage = "Please enter a valid email address.";
      } else if (error?.message?.includes('network')) {
        errorMessage = "Network error. Please check your connection and try again.";
      }
      
      toast({
        title: "Could not send magic link",
        description: errorMessage,
        variant: "destructive",
        duration: 6000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl text-accent-gold">
            Sign In to the Bash
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="font-subhead text-accent-purple">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com"
              required
              disabled={isLoading}
              className="bg-background border-accent-purple/30 focus:border-accent-gold"
            />
          </div>
          
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 border-accent-purple/30 hover:bg-accent-purple/10"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !email.trim()}
              className="flex-1 bg-accent-gold hover:bg-accent-gold/80 text-background font-subhead"
            >
              {isLoading ? "Sending..." : "Send Magic Link"}
            </Button>
          </div>
          
          <div className="text-center">
            <p className="font-body text-sm text-muted-foreground">
              We'll send you a secure sign-in link. No passwords required.
            </p>
            <p className="font-body text-xs text-muted-foreground mt-1 opacity-75">
              Make sure to check your spam folder if you don't see the email.
            </p>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}