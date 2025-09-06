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
        title: "Magic link sent!",
        description: "Check your email for a sign-in link.",
        duration: 5000,
      });
      onClose();
      setEmail("");
    } catch (error) {
      toast({
        title: "Sign-in failed",
        description: "Please try again or contact support.",
        variant: "destructive",
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
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}