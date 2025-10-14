import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff } from "lucide-react";

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChangePasswordModal({ isOpen, onClose }: ChangePasswordModalProps) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { updatePassword } = useAuth();
  const { toast } = useToast();

  const handleClose = () => {
    setNewPassword("");
    setConfirmPassword("");
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (newPassword.length < 6) {
      toast({
        title: "Password too short",
        description: "New password must be at least 6 characters.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure both passwords are the same.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await updatePassword(newPassword);
      
      toast({
        title: "Password updated!",
        description: "Your password has been successfully changed.",
      });
      
      handleClose();
    } catch (error: any) {
      toast({
        title: "Failed to change password",
        description: error?.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-background border-accent-gold">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl text-accent-gold uppercase">
            Change Password
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Choose a new password for your account
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-password" className="font-subhead text-accent-gold">
              New Password
            </Label>
            <div className="relative">
              <Input
                id="new-password"
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={loading}
                minLength={6}
                className="bg-background border-accent-purple/30 focus:border-accent-gold pr-12 h-12 text-base md:h-10 md:text-sm"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-accent-gold transition-colors p-2 -m-1 rounded"
                aria-label={showNewPassword ? "Hide password" : "Show password"}
                disabled={loading}
              >
                {showNewPassword ? (
                  <EyeOff className="h-5 w-5 md:h-4 md:w-4" />
                ) : (
                  <Eye className="h-5 w-5 md:h-4 md:w-4" />
                )}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-new-password" className="font-subhead text-accent-gold">
              Confirm New Password
            </Label>
            <div className="relative">
              <Input
                id="confirm-new-password"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={loading}
                minLength={6}
                className="bg-background border-accent-purple/30 focus:border-accent-gold pr-12 h-12 text-base md:h-10 md:text-sm"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-accent-gold transition-colors p-2 -m-1 rounded"
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                disabled={loading}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5 md:h-4 md:w-4" />
                ) : (
                  <Eye className="h-5 w-5 md:h-4 md:w-4" />
                )}
              </button>
            </div>
          </div>

          <div className="text-xs text-muted-foreground space-y-1">
            <p>Password requirements:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>At least 6 characters long</li>
              <li>Both passwords must match</li>
            </ul>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="submit"
              disabled={loading || !newPassword || !confirmPassword}
              className="flex-1 bg-accent-gold hover:bg-accent-gold/80 text-background font-subhead"
            >
              {loading ? "Updating..." : "Update Password"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 border-accent-purple/30 text-accent-gold hover:bg-accent-purple/10"
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
