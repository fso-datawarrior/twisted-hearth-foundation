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

export interface UserActivityStats {
  photos_uploaded: number;
  guestbook_posts: number;
  events_attended: number;
  days_active: number;
}

/**
 * Get user activity statistics
 */
export const getUserActivityStats = async (): Promise<{ 
  data: UserActivityStats | null; 
  error: any 
}> => {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      return { data: null, error: { message: 'Not authenticated' } };
    }

    // Get photos count
    const { count: photosCount } = await supabase
      .from('photos')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.user.id);

    // Get guestbook posts count
    const { count: guestbookCount } = await supabase
      .from('guestbook')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.user.id)
      .is('deleted_at', null);

    // Get RSVPs count
    const { count: rsvpsCount } = await supabase
      .from('rsvps')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.user.id);

    // Get profile created date for days active
    const { data: profile } = await supabase
      .from('profiles')
      .select('created_at')
      .eq('id', user.user.id)
      .single();

    const daysActive = profile?.created_at 
      ? Math.floor((Date.now() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    return {
      data: {
        photos_uploaded: photosCount || 0,
        guestbook_posts: guestbookCount || 0,
        events_attended: rsvpsCount || 0,
        days_active: daysActive
      },
      error: null
    };
  } catch (error) {
    return { data: null, error };
  }
};
