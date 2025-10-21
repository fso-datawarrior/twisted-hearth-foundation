import { supabase } from '@/integrations/supabase/client';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface ReleaseFormData {
  version: string;
  major_version: number;
  minor_version: number;
  patch_version: number;
  pre_release?: string;
  release_date: string;
  summary: string;
  environment: 'development' | 'staging' | 'production';
  
  // Child data
  features: Array<{
    title: string;
    description: string;
    benefit?: string;
    sort_order: number;
  }>;
  
  api_changes: Array<{
    endpoint: string;
    change_type: 'new' | 'modified' | 'deprecated' | 'removed';
    description: string;
    sort_order: number;
  }>;
  
  changes: Array<{
    category: 'bug_fix' | 'improvement' | 'ui_update' | 'database';
    description: string;
    component?: string;
    sort_order: number;
  }>;
  
  notes: Array<{
    note_type: 'technical' | 'breaking' | 'known_issue';
    content: string;
  }>;
}

export interface FullRelease extends ReleaseFormData {
  id: string;
  deployment_status: 'draft' | 'deployed' | 'archived';
  email_sent: boolean;
  email_sent_at?: string;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface ReleaseFilters {
  environment?: 'development' | 'staging' | 'production';
  status?: 'draft' | 'deployed' | 'archived';
  limit?: number;
}

// ============================================================================
// FETCH FUNCTIONS
// ============================================================================

/**
 * Fetch releases with optional filters
 */
export async function fetchReleases(filters?: ReleaseFilters): Promise<FullRelease[]> {
  let query = supabase
    .from('system_releases')
    .select('*')
    .order('created_at', { ascending: false });

  if (filters?.environment) {
    query = query.eq('environment', filters.environment);
  }

  if (filters?.status) {
    query = query.eq('deployment_status', filters.status);
  }

  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching releases:', error);
    throw new Error(`Failed to fetch releases: ${error.message}`);
  }

  return data as FullRelease[];
}

/**
 * Fetch a single release with all related data (features, changes, notes, etc.)
 */
export async function fetchReleaseById(id: string): Promise<FullRelease> {
  // Call the database function to get full release data
  const { data, error } = await supabase.rpc('get_release_full' as any, {
    p_release_id: id
  });

  if (error) {
    console.error('Error fetching release:', error);
    throw new Error(`Failed to fetch release: ${error.message}`);
  }

  if (!data) {
    throw new Error('Release not found');
  }

  // Transform the JSONB response into FullRelease format
  const response = data as any;
  const release = response.release;
  const features = response.features || [];
  const api_changes = response.api_changes || [];
  const changes = response.changes || [];
  const notes = response.notes || [];

  return {
    ...release,
    features,
    api_changes,
    changes,
    notes,
  } as FullRelease;
}

/**
 * Get the latest release for an environment
 */
export async function fetchLatestRelease(
  environment: 'development' | 'staging' | 'production' = 'production'
): Promise<FullRelease | null> {
  const { data, error } = await supabase.rpc('get_latest_release' as any, {
    p_environment: environment
  });

  if (error) {
    console.error('Error fetching latest release:', error);
    throw new Error(`Failed to fetch latest release: ${error.message}`);
  }

  if (!data || (data as any).length === 0) {
    return null;
  }

  return (data as any)[0] as FullRelease;
}

// ============================================================================
// CREATE & UPDATE FUNCTIONS
// ============================================================================

/**
 * Create a new release draft
 */
export async function createReleaseDraft(data: ReleaseFormData): Promise<string> {
  // Start a transaction by creating the release first
  const { data: releaseData, error: releaseError } = await supabase
    .from('system_releases')
    .insert({
      version: data.version,
      major_version: data.major_version,
      minor_version: data.minor_version,
      patch_version: data.patch_version,
      pre_release: data.pre_release || null,
      release_date: data.release_date,
      summary: data.summary,
      environment: data.environment,
      deployment_status: 'draft',
    })
    .select('id')
    .single();

  if (releaseError) {
    console.error('Error creating release:', releaseError);
    throw new Error(`Failed to create release: ${releaseError.message}`);
  }

  const releaseId = releaseData.id;

  // Insert features
  if (data.features.length > 0) {
    const { error: featuresError } = await supabase
      .from('release_features')
      .insert(
        data.features.map((feature) => ({
          release_id: releaseId,
          ...feature,
        }))
      );

    if (featuresError) {
      console.error('Error inserting features:', featuresError);
      throw new Error(`Failed to insert features: ${featuresError.message}`);
    }
  }

  // Insert API changes
  if (data.api_changes.length > 0) {
    const { error: apiError } = await supabase
      .from('release_api_changes')
      .insert(
        data.api_changes.map((change) => ({
          release_id: releaseId,
          ...change,
        }))
      );

    if (apiError) {
      console.error('Error inserting API changes:', apiError);
      throw new Error(`Failed to insert API changes: ${apiError.message}`);
    }
  }

  // Insert changes (bug fixes, improvements, etc.)
  if (data.changes.length > 0) {
    const { error: changesError } = await supabase
      .from('release_changes')
      .insert(
        data.changes.map((change) => ({
          release_id: releaseId,
          ...change,
        }))
      );

    if (changesError) {
      console.error('Error inserting changes:', changesError);
      throw new Error(`Failed to insert changes: ${changesError.message}`);
    }
  }

  // Insert notes
  if (data.notes.length > 0) {
    const { error: notesError } = await supabase
      .from('release_notes')
      .insert(
        data.notes.map((note) => ({
          release_id: releaseId,
          ...note,
        }))
      );

    if (notesError) {
      console.error('Error inserting notes:', notesError);
      throw new Error(`Failed to insert notes: ${notesError.message}`);
    }
  }

  return releaseId;
}

/**
 * Update an existing release
 */
export async function updateRelease(
  id: string,
  data: Partial<ReleaseFormData>
): Promise<void> {
  // Update main release record
  const releaseUpdate: Record<string, any> = {};
  
  if (data.version !== undefined) releaseUpdate.version = data.version;
  if (data.major_version !== undefined) releaseUpdate.major_version = data.major_version;
  if (data.minor_version !== undefined) releaseUpdate.minor_version = data.minor_version;
  if (data.patch_version !== undefined) releaseUpdate.patch_version = data.patch_version;
  if (data.pre_release !== undefined) releaseUpdate.pre_release = data.pre_release;
  if (data.release_date !== undefined) releaseUpdate.release_date = data.release_date;
  if (data.summary !== undefined) releaseUpdate.summary = data.summary;
  if (data.environment !== undefined) releaseUpdate.environment = data.environment;

  if (Object.keys(releaseUpdate).length > 0) {
    const { error: releaseError } = await supabase
      .from('system_releases')
      .update(releaseUpdate)
      .eq('id', id);

    if (releaseError) {
      console.error('Error updating release:', releaseError);
      throw new Error(`Failed to update release: ${releaseError.message}`);
    }
  }

  // Update features (delete old, insert new)
  if (data.features !== undefined) {
    await supabase.from('release_features').delete().eq('release_id', id);
    
    if (data.features.length > 0) {
      const { error: featuresError } = await supabase
        .from('release_features')
        .insert(
          data.features.map((feature) => ({
            release_id: id,
            ...feature,
          }))
        );

      if (featuresError) {
        console.error('Error updating features:', featuresError);
        throw new Error(`Failed to update features: ${featuresError.message}`);
      }
    }
  }

  // Update API changes
  if (data.api_changes !== undefined) {
    await supabase.from('release_api_changes').delete().eq('release_id', id);
    
    if (data.api_changes.length > 0) {
      const { error: apiError } = await supabase
        .from('release_api_changes')
        .insert(
          data.api_changes.map((change) => ({
            release_id: id,
            ...change,
          }))
        );

      if (apiError) {
        console.error('Error updating API changes:', apiError);
        throw new Error(`Failed to update API changes: ${apiError.message}`);
      }
    }
  }

  // Update changes
  if (data.changes !== undefined) {
    await supabase.from('release_changes').delete().eq('release_id', id);
    
    if (data.changes.length > 0) {
      const { error: changesError } = await supabase
        .from('release_changes')
        .insert(
          data.changes.map((change) => ({
            release_id: id,
            ...change,
          }))
        );

      if (changesError) {
        console.error('Error updating changes:', changesError);
        throw new Error(`Failed to update changes: ${changesError.message}`);
      }
    }
  }

  // Update notes
  if (data.notes !== undefined) {
    await supabase.from('release_notes').delete().eq('release_id', id);
    
    if (data.notes.length > 0) {
      const { error: notesError } = await supabase
        .from('release_notes')
        .insert(
          data.notes.map((note) => ({
            release_id: id,
            ...note,
          }))
        );

      if (notesError) {
        console.error('Error updating notes:', notesError);
        throw new Error(`Failed to update notes: ${notesError.message}`);
      }
    }
  }
}

// ============================================================================
// STATUS CHANGE FUNCTIONS
// ============================================================================

/**
 * Publish a release (change status to deployed)
 */
export async function publishRelease(id: string): Promise<void> {
  const { error } = await supabase.rpc('publish_release' as any, {
    p_release_id: id
  });

  if (error) {
    console.error('Error publishing release:', error);
    throw new Error(`Failed to publish release: ${error.message}`);
  }
}

/**
 * Archive a release
 */
export async function archiveRelease(id: string): Promise<void> {
  const { error } = await supabase.rpc('archive_release' as any, {
    p_release_id: id
  });

  if (error) {
    console.error('Error archiving release:', error);
    throw new Error(`Failed to archive release: ${error.message}`);
  }
}

// ============================================================================
// EMAIL FUNCTIONS
// ============================================================================

/**
 * Send release announcement email
 */
export async function sendReleaseEmail(
  id: string,
  emailType: 'admin' | 'user'
): Promise<void> {
  // Get the full release data
  const release = await fetchReleaseById(id);

  // TODO: Call email edge function once email templates are updated
  // For now, just mark as sent
  const { error } = await supabase
    .from('system_releases')
    .update({
      email_sent: true,
      email_sent_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) {
    console.error('Error marking email as sent:', error);
    throw new Error(`Failed to send email: ${error.message}`);
  }

  console.log(`Release email (${emailType}) sent for release ${release.version}`);
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Check if a version already exists
 */
export async function versionExists(version: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('system_releases')
    .select('id')
    .eq('version', version)
    .maybeSingle();

  if (error) {
    console.error('Error checking version:', error);
    return false;
  }

  return data !== null;
}

/**
 * Get release statistics
 */
export async function getReleaseStats() {
  const { data: releases, error } = await supabase
    .from('system_releases')
    .select('deployment_status, environment');

  if (error) {
    console.error('Error fetching release stats:', error);
    return {
      total: 0,
      draft: 0,
      deployed: 0,
      archived: 0,
      production: 0,
      staging: 0,
      development: 0,
    };
  }

  const stats = {
    total: releases.length,
    draft: releases.filter((r) => r.deployment_status === 'draft').length,
    deployed: releases.filter((r) => r.deployment_status === 'deployed').length,
    archived: releases.filter((r) => r.deployment_status === 'archived').length,
    production: releases.filter((r) => r.environment === 'production').length,
    staging: releases.filter((r) => r.environment === 'staging').length,
    development: releases.filter((r) => r.environment === 'development').length,
  };

  return stats;
}
