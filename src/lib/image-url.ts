import { supabase } from "@/integrations/supabase/client";
import { logger } from "./logger";

/**
 * Generate a public URL for an image in the gallery bucket
 * @param storagePath - The storage path of the image
 * @param width - Optional width for image transformation
 * @returns Public URL or placeholder on error
 */
export async function getPublicImageUrl(
  storagePath: string,
  width?: number
): Promise<string> {
  try {
    if (!storagePath) {
      logger.warn('[getPublicImageUrl] Empty storage path provided');
      return '/img/no-photos-placeholder.jpg';
    }

    // Generate public URL with optional transform
    const { data } = supabase.storage
      .from('gallery')
      .getPublicUrl(storagePath, width ? {
        transform: {
          width,
          quality: 80
        }
      } : undefined);

    if (!data?.publicUrl) {
      logger.error('[getPublicImageUrl] No public URL returned for: ' + storagePath);
      return '/img/no-photos-placeholder.jpg';
    }

    logger.debug('[getPublicImageUrl] Generated URL for: ' + storagePath, data.publicUrl);

    return data.publicUrl;
  } catch (error) {
    logger.error('[getPublicImageUrl] Exception for: ' + storagePath, error as Error);
    return '/img/no-photos-placeholder.jpg';
  }
}

/**
 * Synchronously generate a public URL (no async needed)
 * @param storagePath - The storage path of the image
 * @returns Public URL or placeholder
 */
export function getPublicImageUrlSync(storagePath: string): string {
  try {
    if (!storagePath) {
      return '/img/no-photos-placeholder.jpg';
    }

    const { data } = supabase.storage
      .from('gallery')
      .getPublicUrl(storagePath);

    return data?.publicUrl || '/img/no-photos-placeholder.jpg';
  } catch (error) {
    logger.error('[getPublicImageUrlSync] Exception for: ' + storagePath, error as Error);
    return '/img/no-photos-placeholder.jpg';
  }
}
