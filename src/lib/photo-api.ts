import { supabase } from '@/integrations/supabase/client';

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
  category?: 'costumes' | 'food' | 'activities' | 'general';
  is_approved: boolean;
  is_featured: boolean;
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
 * Get approved photos for public gallery
 */
export const getApprovedPhotos = async (): Promise<{ data: Photo[] | null; error: any }> => {
  const { data, error } = await supabase
    .from('photos')
    .select('id, user_id, storage_path, filename, caption, tags, category, is_approved, is_featured, likes_count, created_at, updated_at')
    .eq('is_approved', true)
    .order('created_at', { ascending: false });

  return { data: data as any, error };
};

/**
 * Get user's own photos (including unapproved)
 */
export const getUserPhotos = async (): Promise<{ data: Photo[] | null; error: any }> => {
  // Ensure we only fetch the current user's photos for the "My Photos" section
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) {
    return { data: [], error: userError || new Error('Not authenticated') };
  }
  const userId = userData.user.id;

  const { data, error } = await supabase
    .from('photos')
    .select('id, user_id, storage_path, filename, caption, tags, category, is_approved, is_featured, likes_count, created_at, updated_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  return { data: data as any, error };
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

export default Photo;