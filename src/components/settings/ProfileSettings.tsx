import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Camera, Upload, Trash2 } from 'lucide-react';
import { Profile, updateUserProfile, uploadAvatar, deleteAvatar } from '@/lib/profile-api';
import { useAuth } from '@/lib/auth';

interface ProfileSettingsProps {
  profile: Profile | null;
  onProfileUpdate: () => void;
}

export default function ProfileSettings({ profile, onProfileUpdate }: ProfileSettingsProps) {
  const { toast } = useToast();
  const { refreshProfile } = useAuth();
  const [firstName, setFirstName] = useState(profile?.first_name || '');
  const [lastName, setLastName] = useState(profile?.last_name || '');
  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please select a JPEG, PNG, or WebP image.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 2MB.",
        variant: "destructive",
      });
      return;
    }

    setAvatarFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setAvatarPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile) return;

    try {
      setUploading(true);

      // Delete old avatar if exists
      if (profile?.avatar_url) {
        await deleteAvatar(profile.avatar_url);
      }

      // Upload new avatar
      const { data: avatarUrl, error } = await uploadAvatar(avatarFile);
      
      if (error) {
        throw error;
      }

      // Update profile with new avatar URL
      const { error: updateError } = await updateUserProfile({
        avatar_url: avatarUrl
      });

      if (updateError) {
        throw updateError;
      }

      toast({
        title: "Avatar updated!",
        description: "Your profile photo has been successfully updated.",
      });

      setAvatarFile(null);
      setAvatarPreview(null);
      onProfileUpdate();
      await refreshProfile();
    } catch (error: any) {
      console.error('Avatar upload error:', error);
      toast({
        title: "Upload failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    if (!profile?.avatar_url) return;

    try {
      setUploading(true);

      // Delete avatar from storage
      await deleteAvatar(profile.avatar_url);

      // Update profile to remove avatar URL
      const { error } = await updateUserProfile({
        avatar_url: null
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Avatar removed",
        description: "Your profile photo has been removed.",
      });

      onProfileUpdate();
    } catch (error: any) {
      console.error('Avatar removal error:', error);
      toast({
        title: "Removal failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!firstName.trim()) {
      toast({
        title: "First name required",
        description: "Please enter your first name.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);

      const { error } = await updateUserProfile({
        first_name: firstName.trim(),
        last_name: lastName.trim() || null,
        display_name: displayName.trim() || null
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Profile updated!",
        description: "Your profile information has been saved.",
      });

      onProfileUpdate();
      await refreshProfile();
    } catch (error: any) {
      console.error('Profile update error:', error);
      toast({
        title: "Update failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const getAvatarDisplay = () => {
    if (avatarPreview) return avatarPreview;
    if (profile?.avatar_url) return profile.avatar_url;
    return null;
  };

  const getInitials = () => {
    if (firstName) {
      return firstName[0].toUpperCase() + (lastName ? lastName[0].toUpperCase() : '');
    }
    if (displayName) {
      return displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    if (profile?.email) {
      return profile.email[0].toUpperCase();
    }
    return 'U';
  };

  return (
    <div className="space-y-6">
      {/* Avatar Section */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Photo</CardTitle>
          <CardDescription>
            Upload a profile photo to personalize your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-6">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src={getAvatarDisplay() || undefined} alt="Profile" />
                <AvatarFallback className="text-lg font-semibold">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity rounded-full flex items-center justify-center cursor-pointer">
                <Camera className="h-6 w-6 text-white" />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('avatar-upload')?.click()}
                  disabled={uploading}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Choose Photo
                </Button>
                
                {(profile?.avatar_url || avatarFile) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRemoveAvatar}
                    disabled={uploading}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remove
                  </Button>
                )}
              </div>

              {avatarFile && (
                <Button
                  size="sm"
                  onClick={handleAvatarUpload}
                  disabled={uploading}
                  className="bg-accent-gold hover:bg-accent-gold/80 text-background"
                >
                  {uploading ? "Uploading..." : "Save Photo"}
                </Button>
              )}

              <p className="text-xs text-muted-foreground">
                JPEG, PNG, or WebP. Max 2MB.
              </p>
            </div>
          </div>

          <input
            id="avatar-upload"
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleAvatarChange}
            className="hidden"
            aria-label="Upload avatar image"
          />
        </CardContent>
      </Card>

      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>
            Update your display name and other profile details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first-name">First Name *</Label>
              <Input
                id="first-name"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Enter your first name"
                maxLength={50}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="last-name">Last Name</Label>
              <Input
                id="last-name"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Enter your last name"
                maxLength={50}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="display-name">Display Name (Optional)</Label>
            <Input
              id="display-name"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Enter your display name"
              maxLength={50}
            />
            <p className="text-xs text-muted-foreground">
              This is what other users will see. If left blank, we'll use your first name.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email-display">Email Address</Label>
            <Input
              id="email-display"
              type="email"
              value={profile?.email || ''}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">
              To change your email, use the Account tab.
            </p>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              onClick={handleSaveProfile}
              disabled={saving || (!firstName.trim())}
              className="bg-accent-gold hover:bg-accent-gold/80 text-background"
            >
              {saving ? "Saving..." : "Save Changes"}
            </Button>
            
            <Button
              variant="outline"
              onClick={() => {
                setFirstName(profile?.first_name || '');
                setLastName(profile?.last_name || '');
                setDisplayName(profile?.display_name || '');
              }}
              disabled={saving}
            >
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
