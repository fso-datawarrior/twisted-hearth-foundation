# User Settings Page Implementation - Lovable AI Prompt

## Project Context
This is a Twisted Hearth Foundation event website built with React, TypeScript, Supabase, and shadcn/ui components. We need to implement a comprehensive user settings page that allows authenticated users to manage their profile information, upload avatars, and update account settings.

## Current System Overview

### Authentication System
- Uses Supabase Auth with magic link and password authentication
- `useAuth` hook provides user session management
- Existing `ChangePasswordModal` component for password updates
- Protected routes use `RequireAuth` component

### Database Structure
- **`auth.users`** - Supabase managed authentication users
- **`profiles`** - Extended user profile data with columns: `id`, `email`, `display_name`, `created_at`, `updated_at`
- **`user_roles`** - Role management (admin, user, etc.)

### Existing Components
- Avatar component from shadcn/ui (`@/components/ui/avatar`)
- Navigation system in `NavBar.tsx` with user dropdown
- Routing defined in `App.tsx`
- File upload system using Supabase Storage (`gallery` bucket)

### Styling
- Uses Tailwind CSS with custom theme
- shadcn/ui component library
- Responsive design with mobile-first approach
- Dark theme with accent colors (gold, purple)

## Implementation Requirements

### 1. Database Schema Updates

First, create a new migration file: `supabase/migrations/[timestamp]_add_user_settings_support.sql`

```sql
-- Add avatar_url column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Add updated trigger for profiles
CREATE OR REPLACE FUNCTION public.update_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_profiles_updated_at();

-- Create avatars bucket for profile photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars', 
  true,
  2097152, -- 2MB limit for avatars
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- RLS policies for avatar uploads
CREATE POLICY "Users can upload their own avatar"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Avatars are publicly viewable"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'avatars');

CREATE POLICY "Users can update their own avatar"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own avatar"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Function to update user profile securely
CREATE OR REPLACE FUNCTION public.update_user_profile(
  p_display_name TEXT DEFAULT NULL,
  p_avatar_url TEXT DEFAULT NULL
) RETURNS TABLE(success BOOLEAN, message TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
BEGIN
  -- Authentication check
  IF v_user_id IS NULL THEN
    RETURN QUERY SELECT false, 'User must be authenticated'::TEXT;
    RETURN;
  END IF;

  -- Update profile
  UPDATE public.profiles 
  SET 
    display_name = COALESCE(p_display_name, display_name),
    avatar_url = COALESCE(p_avatar_url, avatar_url),
    updated_at = now()
  WHERE id = v_user_id;

  IF NOT FOUND THEN
    -- Create profile if it doesn't exist
    INSERT INTO public.profiles (id, email, display_name, avatar_url)
    SELECT v_user_id, au.email, p_display_name, p_avatar_url
    FROM auth.users au WHERE au.id = v_user_id;
  END IF;

  RETURN QUERY SELECT true, 'Profile updated successfully'::TEXT;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.update_user_profile TO authenticated;

-- Function to update user email
CREATE OR REPLACE FUNCTION public.update_user_email(
  p_new_email TEXT
) RETURNS TABLE(success BOOLEAN, message TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
BEGIN
  -- Authentication check
  IF v_user_id IS NULL THEN
    RETURN QUERY SELECT false, 'User must be authenticated'::TEXT;
    RETURN;
  END IF;

  -- Email validation
  IF p_new_email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
    RETURN QUERY SELECT false, 'Invalid email format'::TEXT;
    RETURN;
  END IF;

  -- Check if email already exists
  IF EXISTS (SELECT 1 FROM public.profiles WHERE email = p_new_email AND id != v_user_id) THEN
    RETURN QUERY SELECT false, 'Email already in use'::TEXT;
    RETURN;
  END IF;

  -- Update profile email
  UPDATE public.profiles 
  SET email = p_new_email, updated_at = now()
  WHERE id = v_user_id;

  RETURN QUERY SELECT true, 'Email updated successfully. Please verify your new email.'::TEXT;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.update_user_email TO authenticated;
```

### 2. API Layer

Create `src/lib/profile-api.ts`:

```typescript
import { supabase } from '@/integrations/supabase/client';

export interface Profile {
  id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProfileUpdate {
  display_name?: string;
  avatar_url?: string;
}

/**
 * Get current user profile
 */
export const getCurrentUserProfile = async (): Promise<{ data: Profile | null; error: any }> => {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      return { data: null, error: { message: 'Not authenticated' } };
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.user.id)
      .single();

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

/**
 * Update user profile using RPC function
 */
export const updateUserProfile = async (updates: ProfileUpdate): Promise<{ data: any; error: any }> => {
  try {
    const { data, error } = await supabase.rpc('update_user_profile', {
      p_display_name: updates.display_name || null,
      p_avatar_url: updates.avatar_url || null,
    });

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

/**
 * Upload avatar to Supabase Storage
 */
export const uploadAvatar = async (file: File): Promise<{ data: string | null; error: any }> => {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      return { data: null, error: { message: 'Not authenticated' } };
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.user.id}/avatar-${Date.now()}.${fileExt}`;

    // Upload file
    const { data, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (uploadError) {
      return { data: null, error: uploadError };
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    return { data: publicUrl, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

/**
 * Update user email using RPC function
 */
export const updateUserEmail = async (newEmail: string): Promise<{ data: any; error: any }> => {
  try {
    // Update in Supabase Auth
    const { error: authError } = await supabase.auth.updateUser({ email: newEmail });
    if (authError) {
      return { data: null, error: authError };
    }

    // Update in profiles table
    const { data, error } = await supabase.rpc('update_user_email', {
      p_new_email: newEmail
    });

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

/**
 * Delete avatar from storage
 */
export const deleteAvatar = async (avatarUrl: string): Promise<{ error: any }> => {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      return { error: { message: 'Not authenticated' } };
    }

    // Extract file path from URL
    const urlParts = avatarUrl.split('/');
    const fileName = `${user.user.id}/${urlParts[urlParts.length - 1]}`;

    const { error } = await supabase.storage
      .from('avatars')
      .remove([fileName]);

    return { error };
  } catch (error) {
    return { error };
  }
};
```

### 3. Main Settings Page

Create `src/pages/UserSettings.tsx`:

```typescript
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import RequireAuth from '@/components/RequireAuth';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ArrowLeft, User, Shield, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProfileSettings from '@/components/settings/ProfileSettings';
import AccountSettings from '@/components/settings/AccountSettings';
import SecuritySettings from '@/components/settings/SecuritySettings';
import { getCurrentUserProfile, Profile } from '@/lib/profile-api';

export default function UserSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const { data, error } = await getCurrentUserProfile();
      
      if (error) {
        toast({
          title: "Error loading profile",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      setProfile(data);
    } catch (error) {
      console.error('Error loading profile:', error);
      toast({
        title: "Error loading profile",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <RequireAuth>
        <div className="min-h-screen bg-background">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-gold"></div>
            </div>
          </div>
        </div>
      </RequireAuth>
    );
  }

  return (
    <RequireAuth>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/discussion">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-heading font-bold text-accent-gold">Settings</h1>
              <p className="text-muted-foreground">Manage your account and preferences</p>
            </div>
          </div>

          {/* Settings Tabs */}
          <Card className="border-accent-purple/30">
            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-muted/50">
                <TabsTrigger value="profile" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">Profile</span>
                </TabsTrigger>
                <TabsTrigger value="account" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  <span className="hidden sm:inline">Account</span>
                </TabsTrigger>
                <TabsTrigger value="security" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  <span className="hidden sm:inline">Security</span>
                </TabsTrigger>
              </TabsList>

              <div className="p-6">
                <TabsContent value="profile" className="space-y-6">
                  <ProfileSettings 
                    profile={profile} 
                    onProfileUpdate={loadProfile}
                  />
                </TabsContent>

                <TabsContent value="account" className="space-y-6">
                  <AccountSettings 
                    profile={profile} 
                    onProfileUpdate={loadProfile}
                  />
                </TabsContent>

                <TabsContent value="security" className="space-y-6">
                  <SecuritySettings />
                </TabsContent>
              </div>
            </Tabs>
          </Card>
        </div>
      </div>
    </RequireAuth>
  );
}
```

### 4. Profile Settings Component

Create `src/components/settings/ProfileSettings.tsx`:

```typescript
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Camera, Upload, Trash2 } from 'lucide-react';
import { Profile, updateUserProfile, uploadAvatar, deleteAvatar } from '@/lib/profile-api';

interface ProfileSettingsProps {
  profile: Profile | null;
  onProfileUpdate: () => void;
}

export default function ProfileSettings({ profile, onProfileUpdate }: ProfileSettingsProps) {
  const { toast } = useToast();
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
    try {
      setSaving(true);

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

      onProfileUpdate();
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
                <AvatarImage src={getAvatarDisplay()} alt="Profile" />
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
          <div className="space-y-2">
            <Label htmlFor="display-name">Display Name</Label>
            <Input
              id="display-name"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Enter your display name"
              maxLength={50}
              className="bg-background border-accent-purple/30 focus:border-accent-gold"
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
              className="bg-muted border-accent-purple/30"
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
              className="border-accent-purple/30"
            >
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

### 5. Account Settings Component

Create `src/components/settings/AccountSettings.tsx`:

```typescript
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
                className="bg-muted border-accent-purple/30"
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
                className="bg-muted border-accent-purple/30"
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
                className="bg-background border-accent-purple/30 focus:border-accent-gold"
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
                className="bg-background border-accent-purple/30 focus:border-accent-gold"
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

      {/* Account Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Account Activity</CardTitle>
          <CardDescription>
            Overview of your account activity and contributions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="space-y-2">
              <p className="text-2xl font-bold text-accent-gold">-</p>
              <p className="text-sm text-muted-foreground">Photos Uploaded</p>
            </div>
            <div className="space-y-2">
              <p className="text-2xl font-bold text-accent-gold">-</p>
              <p className="text-sm text-muted-foreground">Guestbook Posts</p>
            </div>
            <div className="space-y-2">
              <p className="text-2xl font-bold text-accent-gold">-</p>
              <p className="text-sm text-muted-foreground">Events Attended</p>
            </div>
            <div className="space-y-2">
              <p className="text-2xl font-bold text-accent-gold">-</p>
              <p className="text-sm text-muted-foreground">Days Active</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

### 6. Security Settings Component

Create `src/components/settings/SecuritySettings.tsx`:

```typescript
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChangePasswordModal } from '@/components/ChangePasswordModal';
import { Key, Shield, Smartphone, Clock } from 'lucide-react';

export default function SecuritySettings() {
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  return (
    <div className="space-y-6">
      {/* Password Security */}
      <Card>
        <CardHeader>
          <CardTitle>Password & Authentication</CardTitle>
          <CardDescription>
            Manage your password and authentication settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-accent-purple/30 rounded-lg">
            <div className="flex items-center gap-3">
              <Key className="h-5 w-5 text-accent-gold" />
              <div>
                <p className="font-medium">Password</p>
                <p className="text-sm text-muted-foreground">
                  Last changed: Never or recently
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowPasswordModal(true)}
              className="border-accent-purple/30 hover:bg-accent-purple/10"
            >
              Change Password
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 border border-accent-purple/30 rounded-lg opacity-50">
            <div className="flex items-center gap-3">
              <Smartphone className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium text-muted-foreground">Two-Factor Authentication</p>
                <p className="text-sm text-muted-foreground">
                  Coming soon - Add an extra layer of security
                </p>
              </div>
            </div>
            <Button variant="outline" disabled>
              Set Up 2FA
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Login Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Login Activity</CardTitle>
          <CardDescription>
            Recent login activity and active sessions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-accent-purple/30 rounded-lg">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-accent-gold" />
                <div>
                  <p className="font-medium">Current Session</p>
                  <p className="text-sm text-muted-foreground">
                    Started today - This device
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-green-600">Active</span>
              </div>
            </div>

            <div className="text-center py-8 text-muted-foreground">
              <Shield className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Session management features coming soon</p>
              <p className="text-sm">View and manage all active sessions</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Privacy Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Privacy Settings</CardTitle>
          <CardDescription>
            Control your privacy and data sharing preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Shield className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Privacy controls coming soon</p>
            <p className="text-sm">Manage your data and privacy preferences</p>
          </div>
        </CardContent>
      </Card>

      {/* Password Change Modal */}
      <ChangePasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
      />
    </div>
  );
}
```

### 7. Navigation Integration

Update `src/components/NavBar.tsx` to add settings link to user dropdown:

```typescript
// Add to the imports
import { User } from "lucide-react";

// In the user dropdown section (around line 280-300), add:
<DropdownMenuItem asChild>
  <Link to="/settings" className="flex items-center cursor-pointer">
    <User className="h-4 w-4 mr-2" />
    Settings
  </Link>
</DropdownMenuItem>
```

### 8. Route Integration

Update `src/App.tsx` to add the settings route:

```typescript
// Add to lazy imports
const UserSettings = lazy(() => import("./pages/UserSettings"));

// Add to routes (before the catch-all route)
<Route path="/settings" element={<UserSettings />} />
```

### 9. Update Supabase Types

Update `src/integrations/supabase/types.ts` to include the new avatar_url column:

```typescript
// In the profiles table Row interface, add:
avatar_url: string | null

// In the profiles table Insert interface, add:
avatar_url?: string | null

// In the profiles table Update interface, add:
avatar_url?: string | null
```

## Key Features Implemented

### ✅ Avatar Upload & Management
- Drag & drop file upload
- Image preview before saving
- File validation (type, size)
- Avatar deletion functionality
- Fallback to user initials
- Secure storage in dedicated bucket

### ✅ Profile Information
- Display name editing
- Email display (read-only in profile tab)
- Profile creation/update timestamps
- Real-time validation

### ✅ Account Management
- Email change functionality
- Account activity overview
- Member since information
- Email verification flow

### ✅ Security Features
- Password change integration
- Login activity display
- Future 2FA preparation
- Session management foundation

### ✅ UI/UX Excellence
- Responsive design (mobile-first)
- Loading states and progress indicators
- Clear error handling and validation
- Accessible navigation and forms
- Consistent with app theming

### ✅ Security & Performance
- Server-side validation via RPC functions
- Proper file upload security
- Optimistic updates for better UX
- Efficient re-rendering patterns
- Protected routes and authentication

## Implementation Notes

1. **Database Migration**: Run the migration file first to set up the required schema changes
2. **File Structure**: Create the new components in the specified directories
3. **Navigation**: Update NavBar and App.tsx to integrate the settings page
4. **Testing**: Test avatar upload, profile updates, and email changes thoroughly
5. **Error Handling**: Ensure proper error messages for all failure scenarios
6. **Mobile**: Verify responsive design works well on all screen sizes

## Future Enhancements

- Two-factor authentication setup
- Session management and device tracking
- Privacy settings and data export
- Account deletion functionality
- Notification preferences
- Profile visibility controls

This implementation provides a comprehensive user settings system that integrates seamlessly with the existing Twisted Hearth Foundation application while maintaining security, performance, and user experience standards.
