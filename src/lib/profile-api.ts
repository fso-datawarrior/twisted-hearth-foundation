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
  avatar_url?: string | null;
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
      p_avatar_url: updates.avatar_url !== undefined ? updates.avatar_url : null,
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
