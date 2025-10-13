import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChangePasswordModal({ isOpen, onClose }: ChangePasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { updatePassword } = useAuth();
  const { toast } = useToast();

  const handleClose = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
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
      // Verify current password by attempting to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: (await supabase.auth.getUser()).data.user?.email || "",
        password: currentPassword,
      });

      if (signInError) {
        toast({
          title: "Incorrect password",
          description: "Your current password is incorrect.",
          variant: "destructive",
        });
        return;
      }

      // Update password
      await updatePassword(newPassword);
      
      toast({
        title: "Password changed!",
        description: "Your password has been successfully updated.",
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
            Enter your current password and choose a new one
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password" className="font-subhead text-accent-gold">
              Current Password
            </Label>
            <Input
              id="current-password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={loading}
              className="bg-background border-accent-purple/30 focus:border-accent-gold"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-password" className="font-subhead text-accent-gold">
              New Password
            </Label>
            <Input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={loading}
              minLength={6}
              className="bg-background border-accent-purple/30 focus:border-accent-gold"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-new-password" className="font-subhead text-accent-gold">
              Confirm New Password
            </Label>
            <Input
              id="confirm-new-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={loading}
              minLength={6}
              className="bg-background border-accent-purple/30 focus:border-accent-gold"
            />
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
              disabled={loading || !currentPassword || !newPassword || !confirmPassword}
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
