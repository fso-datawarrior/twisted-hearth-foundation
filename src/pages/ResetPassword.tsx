import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isValidRecovery, setIsValidRecovery] = useState<boolean | null>(null);
  const { updatePassword } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if we have the recovery token in the URL (hash or query params)
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const type = searchParams.get("type") || hashParams.get("type");
    const accessToken = searchParams.get("access_token") || hashParams.get("access_token");
    
    // If we detect recovery parameters, mark as valid
    if (type === "recovery" || accessToken) {
      setIsValidRecovery(true);
      return;
    }
    
    // Give the auth provider a moment to process the session from the hash
    const timer = setTimeout(() => {
      // After waiting, if still no recovery session detected, it's invalid
      setIsValidRecovery(false);
      toast({
        title: "Invalid reset link",
        description: "This password reset link is invalid or has expired.",
        variant: "destructive",
      });
      navigate("/");
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [searchParams, navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters.",
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
        description: "Your password has been successfully reset.",
        duration: 3000,
      });
      setTimeout(() => navigate("/"), 2000);
    } catch (error: any) {
      toast({
        title: "Failed to reset password",
        description: error?.message || "Please try again or request a new reset link.",
        variant: "destructive",
        duration: 6000,
      });
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while checking recovery session
  if (isValidRecovery === null) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Card className="w-full max-w-md border-accent-gold">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-gold mx-auto"></div>
              <p className="text-muted-foreground">Processing your reset link...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Don't render form if not a valid recovery session
  if (!isValidRecovery) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md border-accent-gold">
        <CardHeader>
          <CardTitle className="font-heading text-2xl text-accent-gold uppercase text-center">
            Reset Your Password
          </CardTitle>
          <CardDescription className="text-muted-foreground text-center">
            Enter your new password below
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
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
              <Label htmlFor="confirm-password" className="font-subhead text-accent-gold">
                Confirm Password
              </Label>
              <Input
                id="confirm-password"
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

            <Button
              type="submit"
              disabled={loading || !newPassword || !confirmPassword}
              className="w-full bg-accent-gold hover:bg-accent-gold/80 text-background font-subhead"
            >
              {loading ? "Updating Password..." : "Reset Password"}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/")}
              className="w-full border-accent-purple/30 text-accent-gold hover:bg-accent-purple/10"
            >
              Cancel
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
