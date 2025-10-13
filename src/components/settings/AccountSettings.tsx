import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Mail, Calendar, AlertTriangle } from 'lucide-react';
import { Profile, updateUserEmail } from '@/lib/profile-api';

interface AccountSettingsProps {
  profile: Profile | null;
  onProfileUpdate: () => void;
}

export default function AccountSettings({ profile, onProfileUpdate }: AccountSettingsProps) {
  const { toast } = useToast();
  const [newEmail, setNewEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [updating, setUpdating] = useState(false);

  const handleEmailUpdate = async () => {
    if (newEmail !== confirmEmail) {
      toast({
        title: "Emails don't match",
        description: "Please make sure both email addresses are the same.",
        variant: "destructive",
      });
      return;
    }

    if (newEmail === profile?.email) {
      toast({
        title: "Same email address",
        description: "Please enter a different email address.",
        variant: "destructive",
      });
      return;
    }

    try {
      setUpdating(true);

      const { error } = await updateUserEmail(newEmail);
      
      if (error) {
        throw error;
      }

      toast({
        title: "Email update requested",
        description: "Please check your new email for a confirmation link.",
      });

      setNewEmail('');
      setConfirmEmail('');
      onProfileUpdate();
    } catch (error: any) {
      console.error('Email update error:', error);
      toast({
        title: "Update failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const isValidEmail = (email: string) => {
    return /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email);
  };

  const canUpdateEmail = newEmail && 
    confirmEmail && 
    newEmail === confirmEmail && 
    isValidEmail(newEmail) && 
    newEmail !== profile?.email;

  return (
    <div className="space-y-6">
      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>
            View and manage your account details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Current Email
              </Label>
              <Input
                type="email"
                value={profile?.email || ''}
                disabled
                className="bg-muted"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Member Since
              </Label>
              <Input
                type="text"
                value={profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : ''}
                disabled
                className="bg-muted"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Email Change */}
      <Card>
        <CardHeader>
          <CardTitle>Change Email Address</CardTitle>
          <CardDescription>
            Update the email address associated with your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-email">New Email Address</Label>
              <Input
                id="new-email"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="Enter new email address"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-email">Confirm New Email</Label>
              <Input
                id="confirm-email"
                type="email"
                value={confirmEmail}
                onChange={(e) => setConfirmEmail(e.target.value)}
                placeholder="Confirm new email address"
              />
            </div>

            <div className="flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
                  Important Note
                </p>
                <p className="text-sm text-amber-600 dark:text-amber-300">
                  Changing your email will require verification. You'll need to confirm 
                  the new email address before the change takes effect.
                </p>
              </div>
            </div>

            <Button
              onClick={handleEmailUpdate}
              disabled={!canUpdateEmail || updating}
              className="bg-accent-gold hover:bg-accent-gold/80 text-background"
            >
              {updating ? "Updating..." : "Update Email"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
