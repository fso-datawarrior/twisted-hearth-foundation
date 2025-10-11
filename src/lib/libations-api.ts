import { supabase } from "@/integrations/supabase/client";
import { logger } from "./logger";

export type LibationType = 'cocktail' | 'mocktail' | 'punch' | 'specialty';

export interface SignatureLibation {
  id: string;
  name: string;
  description: string;
  ingredients: string[];
  libation_type: LibationType;
  image_url: string | null;
  serving_size: string | null;
  prep_notes: string | null;
  prep_time: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
}

export interface CreateLibationData {
  name: string;
  description: string;
  ingredients: string[];
  libation_type: LibationType;
  image_url?: string | null;
  serving_size?: string | null;
  prep_notes?: string | null;
  prep_time?: string | null;
  is_active: boolean;
  sort_order: number;
}

export interface UpdateLibationData extends Partial<CreateLibationData> {}

export async function createLibation(data: CreateLibationData): Promise<SignatureLibation> {
  logger.info('[libations-api] Creating libation', { name: data.name });
  
  const { data: libation, error } = await supabase
    .from('signature_libations')
    .insert([data])
    .select()
    .single();

  if (error) {
    logger.error('[libations-api] Error creating libation', error);
    throw error;
  }
  
  return libation as SignatureLibation;
}

export async function updateLibation(id: string, data: UpdateLibationData): Promise<SignatureLibation> {
  logger.info('[libations-api] Updating libation', { id, updates: data });
  
  const { data: libation, error } = await supabase
    .from('signature_libations')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    logger.error('[libations-api] Error updating libation', error);
    throw error;
  }
  
  return libation as SignatureLibation;
}

export async function deleteLibation(id: string): Promise<void> {
  logger.info('[libations-api] Deleting libation', { id });
  
  const { error } = await supabase
    .from('signature_libations')
    .delete()
    .eq('id', id);

  if (error) {
    logger.error('[libations-api] Error deleting libation', error);
    throw error;
  }
}

export async function reorderLibation(id: string, sortOrder: number): Promise<void> {
  logger.info('[libations-api] Reordering libation', { id, sortOrder });
  
  const { error } = await supabase
    .from('signature_libations')
    .update({ sort_order: sortOrder })
    .eq('id', id);

  if (error) {
    logger.error('[libations-api] Error reordering libation', error);
    throw error;
  }
}

export async function getActiveLibations(): Promise<SignatureLibation[]> {
  logger.info('[libations-api] Fetching active libations');
  
  const { data, error } = await supabase
    .from('signature_libations')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });

  if (error) {
    logger.error('[libations-api] Error fetching active libations', error);
    throw error;
  }
  
  return (data || []) as SignatureLibation[];
}

export async function getAllLibations(): Promise<SignatureLibation[]> {
  logger.info('[libations-api] Fetching all libations');
  
  const { data, error } = await supabase
    .from('signature_libations')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });

  if (error) {
    logger.error('[libations-api] Error fetching all libations', error);
    throw error;
  }
  
  return (data || []) as SignatureLibation[];
}
