import { supabase } from '@/integrations/supabase/client';
import { trackActivity } from './analytics-api';

// ================================================================
// PHOTO GALLERY DATABASE API  
// ================================================================

export interface Photo {
  id: string;
  user_id: string;
  storage_path: string;
  filename: string;
  caption?: string;
  tags: string[];
  category?: 'past-vignettes' | 'creepy-decor' | 'costume-heroes' | 'event-memories' | 'general';
  is_approved: boolean;
  is_featured: boolean;
  is_favorite: boolean;
  is_vignette_selected?: boolean;
  likes_count: number;
  file_size?: number;
  mime_type?: string;
  created_at: string;
  updated_at: string;
}

export interface PhotoReaction {
  id: string;
  photo_id: string;
  user_id: string;
  reaction_type: 'like' | 'love' | 'laugh' | 'wow';
  created_at: string;
}

// ================================================================
// API FUNCTIONS
// ================================================================

/**
 * Get approved photos for public gallery with pagination
 */
export const getApprovedPhotos = async (
  page: number = 1,
  pageSize: number = 20
): Promise<{ data: Photo[] | null; error: any; totalCount: number }> => {
  // Get total count first
  const { count } = await supabase
    .from('photos')
    .select('*', { count: 'exact', head: true })
    .eq('is_approved', true);

  // Get paginated data
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error } = await supabase
    .from('photos')
    .select('id, user_id, storage_path, filename, caption, tags, category, is_approved, is_featured, is_favorite, likes_count, created_at, updated_at')
    .eq('is_approved', true)
    .order('created_at', { ascending: false })
    .range(from, to);

  return { data: data as any, error, totalCount: count || 0 };
};

/**
 * Get user's own photos (including unapproved) with pagination
 */
export const getUserPhotos = async (
  page: number = 1,
  pageSize: number = 20
): Promise<{ data: Photo[] | null; error: any; totalCount: number }> => {
  // Ensure we only fetch the current user's photos for the "My Photos" section
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) {
    return { data: [], error: userError || new Error('Not authenticated'), totalCount: 0 };
  }
  const userId = userData.user.id;

  // Get total count first
  const { count } = await supabase
    .from('photos')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  // Get paginated data
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error } = await supabase
    .from('photos')
    .select('id, user_id, storage_path, filename, caption, tags, category, is_approved, is_featured, is_favorite, likes_count, created_at, updated_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(from, to);

  return { data: data as any, error, totalCount: count || 0 };
};

/**
 * Upload photo metadata after file upload
 */
export const uploadPhotoMetadata = async (
  storagePath: string,
  filename: string,
  caption?: string,
  tags: string[] = [],
  category: string = 'general'
): Promise<{ data: Photo | null; error: any }> => {
  const { data, error } = await (supabase.rpc as any)('upload_photo', {
    p_storage_path: storagePath,
    p_filename: filename,
    p_caption: caption || null,
    p_tags: tags,
    p_category: category
  });

  // Track photo upload
  if (data && !error) {
    const sessionId = sessionStorage.getItem('analytics_session_id');
    if (sessionId) {
      trackActivity({
        action_type: 'photo_upload',
        action_category: 'content',
        action_details: { photo_id: data, category: category },
        session_id: sessionId,
      }).catch(err => console.warn('Failed to track photo upload:', err));
    }
  }

  return { data: data as any, error };
};

/**
 * Toggle photo reaction (like, love, etc.)
 */
export const togglePhotoReaction = async (
  photoId: string,
  reactionType: 'like' | 'love' | 'laugh' | 'wow' = 'like'
): Promise<{ data: boolean | null; error: any }> => {
  const { data, error } = await supabase.rpc('toggle_photo_reaction', {
    p_photo_id: photoId,
    p_reaction_type: reactionType
  });

  // Track photo reaction
  if (data !== null && !error) {
    const sessionId = sessionStorage.getItem('analytics_session_id');
    if (sessionId) {
      trackActivity({
        action_type: 'photo_reaction',
        action_category: 'interaction',
        action_details: { photo_id: photoId, reaction_type: reactionType, added: data },
        session_id: sessionId,
      }).catch(err => console.warn('Failed to track photo reaction:', err));
    }
  }

  return { data: data as boolean | null, error };
};

/**
 * Get reactions for a photo
 */
export const getPhotoReactions = async (photoId: string): Promise<{ data: PhotoReaction[] | null; error: any }> => {
  const { data, error } = await supabase
    .from('photo_reactions')
    .select('id, photo_id, user_id, reaction_type, created_at')
    .eq('photo_id', photoId)
    .order('created_at', { ascending: false });

  return { data: data as PhotoReaction[] | null, error };
};

/**
 * Admin: Moderate photo (approve/reject)
 */
export const moderatePhoto = async (
  photoId: string,
  approve: boolean,
  featured: boolean = false
): Promise<{ data: Photo | null; error: any }> => {
  const { data, error } = await supabase.rpc('moderate_photo', {
    p_photo_id: photoId,
    p_approved: approve,
    p_featured: featured
  });

  return { data: data as Photo | null, error };
};

/**
 * Subscribe to photo changes
 */
export const subscribeToPhotos = (callback: (payload: any) => void) => {
  return supabase
    .channel('photos_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'photos'
      },
      callback
    )
    .subscribe();
};

/**
 * Subscribe to photo reactions changes  
 */
export const subscribeToPhotoReactions = (callback: (payload: any) => void) => {
  return supabase
    .channel('photo_reactions_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'photo_reactions'
      },
      callback
    )
    .subscribe();
};

/**
 * Delete a photo (storage and database)
 */
export const deletePhoto = async (photoId: string, storagePath: string): Promise<{ error: any }> => {
  // Delete from database first
  const { error: dbError } = await supabase
    .from('photos')
    .delete()
    .eq('id', photoId);

  if (dbError) return { error: dbError };

  // Delete from storage
  const { error: storageError } = await supabase.storage
    .from('gallery')
    .remove([storagePath]);

  // Track photo deletion
  if (!storageError) {
    const sessionId = sessionStorage.getItem('analytics_session_id');
    if (sessionId) {
      trackActivity({
        action_type: 'photo_delete',
        action_category: 'content',
        action_details: { photo_id: photoId },
        session_id: sessionId,
      }).catch(err => console.warn('Failed to track photo deletion:', err));
    }
  }

  return { error: storageError };
};

/**
 * Update photo metadata (tags, category, caption)
 */
export const updatePhotoMetadata = async (
  photoId: string,
  updates: {
    caption?: string;
    tags?: string[];
    category?: 'costumes' | 'food' | 'activities' | 'general';
  }
): Promise<{ error: any }> => {
  const { error } = await supabase
    .from('photos')
    .update(updates)
    .eq('id', photoId);

  return { error };
};

/**
 * Toggle photo favorite status
 */
export const togglePhotoFavorite = async (photoId: string): Promise<{ data: boolean | null; error: any }> => {
  // Get current favorite status
  const { data: photo, error: fetchError } = await supabase
    .from('photos')
    .select('is_favorite')
    .eq('id', photoId)
    .single();

  if (fetchError) return { data: null, error: fetchError };

  // Toggle the favorite status
  const newFavoriteStatus = !photo.is_favorite;
  const { error: updateError } = await supabase
    .from('photos')
    .update({ is_favorite: newFavoriteStatus })
    .eq('id', photoId);

  if (updateError) return { data: null, error: updateError };

  return { data: newFavoriteStatus, error: null };
};

/**
 * Toggle photo emoji reaction
 */
export const togglePhotoEmojiReaction = async (
  photoId: string,
  emoji: string
): Promise<{ data: boolean | null; error: any }> => {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) {
    return { data: null, error: userError || new Error('Not authenticated') };
  }
  const userId = userData.user.id;

  // Check if reaction exists
  const { data: existing, error: fetchError } = await supabase
    .from('photo_emoji_reactions')
    .select('id')
    .eq('photo_id', photoId)
    .eq('user_id', userId)
    .eq('emoji', emoji)
    .maybeSingle();

  if (fetchError) return { data: null, error: fetchError };

  if (existing) {
    // Remove reaction
    const { error: deleteError } = await supabase
      .from('photo_emoji_reactions')
      .delete()
      .eq('photo_id', photoId)
      .eq('user_id', userId)
      .eq('emoji', emoji);

    if (deleteError) return { data: null, error: deleteError };
    return { data: false, error: null };
  } else {
    // Add reaction
    const { error: insertError } = await supabase
      .from('photo_emoji_reactions')
      .insert({
        photo_id: photoId,
        user_id: userId,
        emoji
      });

    if (insertError) return { data: null, error: insertError };
    return { data: true, error: null };
  }
};

/**
 * Get emoji reactions for a photo
 */
export const getPhotoEmojiReactions = async (photoId: string): Promise<{ data: any[] | null; error: any }> => {
  const { data, error } = await supabase
    .from('photo_emoji_reactions')
    .select('id, emoji, user_id, created_at')
    .eq('photo_id', photoId);

  return { data, error };
};

export default Photo;