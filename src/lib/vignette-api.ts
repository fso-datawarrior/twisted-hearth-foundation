import { supabase } from '@/integrations/supabase/client';

export interface PastVignette {
  id: string;
  title: string;
  description: string;
  year: number;
  theme_tag: string;
  photo_ids: string[];
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

export interface CreateVignetteData {
  title: string;
  description: string;
  year: number;
  theme_tag: string;
  photo_ids?: string[];
  is_active?: boolean;
  sort_order?: number;
}

export interface UpdateVignetteData {
  title?: string;
  description?: string;
  year?: number;
  theme_tag?: string;
  photo_ids?: string[];
  is_active?: boolean;
  sort_order?: number;
}

/**
 * Create a new vignette
 */
export const createVignette = async (data: CreateVignetteData) => {
  return await supabase.rpc('manage_vignette', {
    p_action: 'create',
    p_title: data.title,
    p_description: data.description,
    p_year: data.year,
    p_theme_tag: data.theme_tag,
    p_photo_ids: data.photo_ids || [],
    p_is_active: data.is_active ?? true,
    p_sort_order: data.sort_order ?? 0
  });
};

/**
 * Update an existing vignette
 */
export const updateVignette = async (vignetteId: string, data: UpdateVignetteData) => {
  const { data: result, error } = await supabase.rpc('manage_vignette', {
    p_action: 'update',
    p_vignette_id: vignetteId,
    p_title: data.title,
    p_description: data.description,
    p_year: data.year,
    p_theme_tag: data.theme_tag,
    p_photo_ids: data.photo_ids,
    p_is_active: data.is_active,
    p_sort_order: data.sort_order
  });

  return { data: result, error };
};

/**
 * Delete a vignette
 */
export const deleteVignette = async (vignetteId: string) => {
  const { data: result, error } = await supabase.rpc('manage_vignette', {
    p_action: 'delete',
    p_vignette_id: vignetteId
  });

  return { data: result, error };
};

/**
 * Reorder a vignette
 */
export const reorderVignette = async (vignetteId: string, sortOrder: number) => {
  const { data: result, error } = await supabase.rpc('manage_vignette', {
    p_action: 'reorder',
    p_vignette_id: vignetteId,
    p_sort_order: sortOrder
  });

  return { data: result, error };
};

/**
 * Get active vignettes for public display (max 3)
 */
export const getActiveVignettes = async () => {
  const { data, error } = await supabase.rpc('get_active_vignettes');
  
  return { data: data as PastVignette[], error };
};

/**
 * Get all vignettes (admin only)
 */
export const getAllVignettes = async () => {
  const { data, error } = await supabase
    .from('past_vignettes')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });

  return { data: data as PastVignette[], error };
};

/**
 * Get vignette by ID
 */
export const getVignetteById = async (vignetteId: string) => {
  const { data, error } = await supabase
    .from('past_vignettes')
    .select('*')
    .eq('id', vignetteId)
    .single();

  return { data: data as PastVignette, error };
};

/**
 * Get photos associated with vignettes
 */
export const getVignettePhotos = async (photoIds: string[]) => {
  if (!photoIds || photoIds.length === 0) {
    return { data: [], error: null };
  }

  const { data, error } = await supabase
    .from('photos')
    .select('*')
    .in('id', photoIds)
    .eq('is_approved', true);

  return { data, error };
};

/**
 * Get photos selected for vignettes
 */
export const getVignetteSelectedPhotos = async () => {
  const { data, error } = await supabase
    .from('photos')
    .select('*')
    .eq('is_vignette_selected', true)
    .eq('is_approved', true)
    .order('created_at', { ascending: false });

  return { data, error };
};

/**
 * Toggle vignette selection for a photo
 */
export const toggleVignetteSelection = async (photoId: string, selected: boolean) => {
  return await supabase.rpc('toggle_vignette_selection', {
    p_photo_id: photoId,
    p_selected: selected
  });
};

/**
 * Update photo metadata for vignette selection
 */
export const updatePhotoVignetteSelection = async (photoId: string, selected: boolean) => {
  const { data, error } = await supabase
    .from('photos')
    .update({ is_vignette_selected: selected })
    .eq('id', photoId)
    .eq('is_approved', true);

  return { data, error };
};

/**
 * Validate vignette data
 */
export const validateVignetteData = (data: CreateVignetteData | UpdateVignetteData): string[] => {
  const errors: string[] = [];

  if ('title' in data && data.title !== undefined && (!data.title.trim() || data.title.length > 200)) {
    if (!data.title.trim()) {
      errors.push('Title is required');
    } else {
      errors.push('Title must be 200 characters or less');
    }
  }

  if ('description' in data && data.description !== undefined && (!data.description.trim() || data.description.length > 1000)) {
    if (!data.description.trim()) {
      errors.push('Description is required');
    } else {
      errors.push('Description must be 1000 characters or less');
    }
  }

  if ('year' in data && data.year !== undefined && (data.year < 1900 || data.year > 2100)) {
    errors.push('Year must be between 1900 and 2100');
  }

  if ('theme_tag' in data && data.theme_tag !== undefined && (!data.theme_tag.trim() || data.theme_tag.length > 20)) {
    if (!data.theme_tag.trim()) {
      errors.push('Theme tag is required');
    } else {
      errors.push('Theme tag must be 20 characters or less');
    }
  }

  if ('photo_ids' in data && data.photo_ids !== undefined && data.photo_ids.length > 3) {
    errors.push('Maximum 3 photos allowed per vignette');
  }

  return errors;
};
