import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { ImageIcon, Upload, X, Loader2 } from 'lucide-react';
import { Profile, updateUserProfile, uploadAvatar, deleteAvatar } from '@/lib/profile-api';
import { useProfile } from '@/contexts/ProfileContext';
import AvatarCropModal from './AvatarCropModal';

interface ProfileSettingsProps {
  profile: Profile | null;
  onProfileUpdate: () => void;
}

export default function ProfileSettings({ profile, onProfileUpdate }: ProfileSettingsProps) {
  const { toast } = useToast();
  const { refreshProfile, updateProfileOptimistic } = useProfile();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload an image file',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please upload an image smaller than 5MB',
        variant: 'destructive',
      });
      return;
    }

    // Show crop modal
    const reader = new FileReader();
    reader.onloadend = () => {
      setImageToCrop(reader.result as string);
      setCropModalOpen(true);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload an image file',
        variant: 'destructive',
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please upload an image smaller than 5MB',
        variant: 'destructive',
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImageToCrop(reader.result as string);
      setCropModalOpen(true);
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = (croppedBlob: Blob) => {
    // Convert blob to file
    const file = new File([croppedBlob], 'avatar.jpg', { type: 'image/jpeg' });
    setAvatarFile(file);

    // Create preview URL
    const previewUrl = URL.createObjectURL(croppedBlob);
    setAvatarPreview(previewUrl);

    // Clean up
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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

      // Optimistic update for instant feedback
      updateProfileOptimistic({ avatar_url: avatarUrl || '' });

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
      
      // Refresh to ensure sync
      await refreshProfile();
      onProfileUpdate();
    } catch (error: any) {
      console.error('Avatar upload error:', error);
      // Revert optimistic update on error
      await refreshProfile();
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

      // Optimistic update
      updateProfileOptimistic({ avatar_url: null });

      // Update profile to remove avatar URL
      const { error } = await updateUserProfile({
        avatar_url: null
      });

      if (error) {
        throw error;
      }

      // Clear local state
      setAvatarFile(null);
      setAvatarPreview(null);

      // Refresh profile data
      await refreshProfile();

      toast({
        title: "Avatar removed",
        description: "Your profile photo has been removed.",
      });

      onProfileUpdate();
    } catch (error: any) {
      console.error('Avatar removal error:', error);
      // Revert on error
      await refreshProfile();
      toast({
        title: "Removal failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setRemoveDialogOpen(false);
    }
  };

  const confirmRemoveAvatar = () => {
    setRemoveDialogOpen(true);
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);

      // Optimistic update
      updateProfileOptimistic({ display_name: displayName.trim() || null });

      const { error } = await updateUserProfile({
        display_name: displayName.trim() || null
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Profile updated!",
        description: "Your profile information has been saved.",
      });

      await refreshProfile();
      onProfileUpdate();
    } catch (error: any) {
      console.error('Profile update error:', error);
      // Revert on error
      await refreshProfile();
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
        <CardContent className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={getAvatarDisplay() || undefined} alt="Profile photo" />
              <AvatarFallback className="text-2xl">{getInitials()}</AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              {/* Drag & Drop Zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                  isDragging
                    ? 'border-accent-gold bg-accent-gold/10'
                    : 'border-border hover:border-accent-gold/50 hover:bg-accent-gold/5'
                }`}
              >
                <ImageIcon className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm font-medium mb-1">
                  {avatarPreview ? 'Change Photo' : 'Upload Photo'}
                </p>
                <p className="text-xs text-muted-foreground">
                  Drag & drop or click to browse
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Max 5MB • JPG, PNG, GIF
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />

              {/* Action Buttons */}
              <div className="flex gap-2 mt-4">
                {avatarPreview && (
                  <Button
                    className="flex-1 bg-accent-gold hover:bg-accent-gold/80 text-background"
                    onClick={handleAvatarUpload}
                    disabled={uploading}
                  >
                    {uploading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4 mr-2" />
                    )}
                    Save Photo
                  </Button>
                )}

                {(profile?.avatar_url || avatarPreview) && (
                  <Button
                    variant="outline"
                    className="text-destructive hover:text-destructive"
                    onClick={confirmRemoveAvatar}
                    disabled={uploading}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Remove
                  </Button>
                )}
              </div>
            </div>
          </div>
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
          <div className="space-y-2">
            <Label htmlFor="display-name">Display Name</Label>
            <Input
              id="display-name"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Enter your display name"
              maxLength={50}
            />
            <p className="text-xs text-muted-foreground">
              This is how your name will appear to other users.
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
              disabled={saving || displayName === (profile?.display_name || '')}
              className="bg-accent-gold hover:bg-accent-gold/80 text-background"
            >
              {saving ? "Saving..." : "Save Changes"}
            </Button>
            
            <Button
              variant="outline"
              onClick={() => setDisplayName(profile?.display_name || '')}
              disabled={saving}
            >
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Avatar Crop Modal */}
      {imageToCrop && (
        <AvatarCropModal
          open={cropModalOpen}
          onOpenChange={setCropModalOpen}
          imageUrl={imageToCrop}
          onCropComplete={handleCropComplete}
        />
      )}

      {/* Remove Avatar Confirmation Dialog */}
      <AlertDialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Avatar</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove your profile photo? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveAvatar}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
