import { supabase } from '@/integrations/supabase/client';

/**
 * Sync profile data from RSVP to profile table
 * Creates profile if it doesn't exist, updates if it does
 */
export const syncProfileFromRSVP = async (rsvpData: {
  firstName: string;
  lastName: string;
  displayName: string;
  email: string;
}): Promise<{ success: boolean; error?: any }> => {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      return { success: false, error: { message: 'Not authenticated' } };
    }

    // Use the existing RPC function to update/create profile
    const { data, error } = await supabase.rpc('update_user_profile', {
      p_first_name: rsvpData.firstName.trim(),
      p_last_name: rsvpData.lastName.trim(),
      p_display_name: rsvpData.displayName.trim() || null,
      p_avatar_url: null // Don't update avatar from RSVP
    });

    if (error) {
      console.error('Profile sync error:', error);
      return { success: false, error };
    }

    return { success: true };
  } catch (error) {
    console.error('Profile sync error:', error);
    return { success: false, error };
  }
};

/**
 * Sync RSVP data from profile changes
 * This is handled by the database trigger, but we can call it manually if needed
 */
export const syncRSVPFromProfile = async (profileData: {
  firstName: string;
  lastName: string;
  displayName: string;
}): Promise<{ success: boolean; error?: any }> => {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      return { success: false, error: { message: 'Not authenticated' } };
    }

    // Update RSVP record directly
    const { error } = await supabase
      .from('rsvps')
      .update({
        first_name: profileData.firstName.trim(),
        last_name: profileData.lastName.trim(),
        display_name: profileData.displayName.trim() || null,
        name: `${profileData.firstName.trim()} ${profileData.lastName.trim()}`,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.user.id);

    if (error) {
      console.error('RSVP sync error:', error);
      return { success: false, error };
    }

    return { success: true };
  } catch (error) {
    console.error('RSVP sync error:', error);
    return { success: false, error };
  }
};

/**
 * Ensure profile exists for current user
 * Called when user submits RSVP for the first time
 */
export const ensureProfileExists = async (rsvpData: {
  firstName: string;
  lastName: string;
  displayName: string;
  email: string;
}): Promise<{ success: boolean; error?: any }> => {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      return { success: false, error: { message: 'Not authenticated' } };
    }

    // Check if profile exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.user.id)
      .maybeSingle();

    if (existingProfile) {
      // Profile exists, just sync the data
      return await syncProfileFromRSVP(rsvpData);
    } else {
      // Profile doesn't exist, create it with RSVP data
      return await syncProfileFromRSVP(rsvpData);
    }
  } catch (error) {
    console.error('Ensure profile exists error:', error);
    return { success: false, error };
  }
};

/**
 * Get display name with fallback logic
 * Consistent across both forms
 */
export const getDisplayNameFallback = (
  displayName: string,
  firstName: string,
  lastName: string
): string => {
  if (displayName?.trim()) {
    return displayName.trim();
  }
  
  if (firstName?.trim()) {
    return firstName.trim();
  }
  
  return '';
};

/**
 * Load profile data for RSVP form
 * Pre-populates RSVP form with existing profile data
 */
export const loadProfileDataForRSVP = async (): Promise<{
  firstName: string;
  lastName: string;
  displayName: string;
} | null> => {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      return null;
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('first_name, last_name, display_name')
      .eq('id', user.user.id)
      .maybeSingle();

    if (error) {
      console.error('Error loading profile for RSVP:', error);
      return null;
    }

    if (profile) {
      return {
        firstName: profile.first_name || '',
        lastName: profile.last_name || '',
        displayName: profile.display_name || ''
      };
    }

    return null;
  } catch (error) {
    console.error('Error loading profile for RSVP:', error);
    return null;
  }
};
