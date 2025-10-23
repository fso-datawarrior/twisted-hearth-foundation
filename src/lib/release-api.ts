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
 * Note: This returns basic release data without child arrays (features, changes, notes)
 * Use fetchReleaseById() to get full release data with all children
 */
export async function fetchReleases(filters?: ReleaseFilters): Promise<any[]> {
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

  // Return basic release data (without child arrays)
  return data || [];
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
  const { release, features = [], api_changes = [], changes = [], notes = [] } = data as any;

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
  
  if (data.version !== undefined) {
    releaseUpdate.version = data.version;
  }
  if (data.major_version !== undefined) {
    releaseUpdate.major_version = data.major_version;
  }
  if (data.minor_version !== undefined) {
    releaseUpdate.minor_version = data.minor_version;
  }
  if (data.patch_version !== undefined) {
    releaseUpdate.patch_version = data.patch_version;
  }
  if (data.pre_release !== undefined) {
    releaseUpdate.pre_release = data.pre_release;
  }
  if (data.release_date !== undefined) {
    releaseUpdate.release_date = data.release_date;
  }
  if (data.summary !== undefined) {
    releaseUpdate.summary = data.summary;
  }
  if (data.environment !== undefined) {
    releaseUpdate.environment = data.environment;
  }

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
// DELETE FUNCTIONS
// ============================================================================

/**
 * Delete a release (only if not sent)
 */
export async function deleteRelease(id: string): Promise<void> {
  // First check if release has been sent
  const { data: release, error: fetchError } = await supabase
    .from('system_releases')
    .select('email_sent, version')
    .eq('id', id)
    .single();

  if (fetchError) {
    throw new Error(`Failed to fetch release: ${fetchError.message}`);
  }

  if (release.email_sent) {
    throw new Error('Cannot delete a release that has been sent to users');
  }

  // Delete the release (cascade will handle children)
  const { error } = await supabase
    .from('system_releases')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to delete release: ${error.message}`);
  }
}

// ============================================================================
// EMAIL FUNCTIONS
// ============================================================================

/**
 * Send release announcement email
 */
export async function sendReleaseEmail(params: {
  releaseId: string;
  emailType: 'admin' | 'user';
  recipientGroups: string[]; // ['all', 'admins', 'rsvp_yes', etc]
  customRecipients: string[]; // individual email addresses
}): Promise<void> {
  console.log('🚀 Attempting to send release email:', params);
  
  try {
    // Try to call the edge function first
    console.log('📡 Calling edge function...');
    const { data, error } = await supabase.functions.invoke('send-release-email', {
      body: {
        release_id: params.releaseId,
        email_type: params.emailType,
        recipient_groups: params.recipientGroups,
        custom_recipients: params.customRecipients,
      }
    });

    if (error) {
      console.error('❌ Edge function error:', error);
      throw new Error(`Edge function failed: ${error.message}`);
    }

    console.log('✅ Release email sent successfully via edge function');
    return;
  } catch (error: any) {
    console.error('❌ Failed to send via edge function:', error);
    
    // Fallback: Use existing email campaign system
    console.log('🔄 Falling back to email campaign system...');
    
    try {
      const release = await fetchReleaseById(params.releaseId);
      
      // Generate email content using our template
      const { generateEmailPreview } = await import('./release-email-templates');
      const { html: emailHtml, subject: emailSubject } = generateEmailPreview(release, params.emailType);
      
      // Create a campaign record
      const { data: campaign, error: campaignError } = await supabase
        .from('email_campaigns')
        .insert({
          subject: emailSubject,
          message_html: emailHtml,
          message_text: 'System update announcement - please view HTML version',
          recipient_list: 'custom',
          custom_recipients: params.customRecipients,
          recipient_count: params.customRecipients.length,
          status: 'draft', // Mark as draft so it can be sent via existing system
          created_by: null,
        })
        .select('id')
        .single();

      if (campaignError) {
        console.error('❌ Failed to create campaign record:', campaignError);
        throw new Error(`Failed to create campaign: ${campaignError.message}`);
      }

      // Update release as sent
      await supabase
        .from('system_releases')
        .update({
          email_sent: true,
          email_sent_at: new Date().toISOString(),
        })
        .eq('id', params.releaseId);

      console.log('✅ Fallback email campaign created successfully');
      throw new Error(`Email campaign created but not sent. Please use the Email Communication dashboard to send campaign ID: ${campaign.id}. The send-release-email edge function needs to be deployed for direct sending.`);
      
    } catch (fallbackError: any) {
      console.error('❌ Fallback also failed:', fallbackError);
      
      // Final fallback: Just mark as attempted
      await supabase
        .from('system_releases')
        .update({
          email_sent: false,
          email_sent_at: null,
        })
        .eq('id', params.releaseId);

      throw new Error(`Failed to send email: ${error.message}. The send-release-email edge function may not be deployed yet. Please deploy the edge function or use the Email Communication dashboard for sending emails.`);
    }
  }
}

/**
 * Generate email preview for a release without sending
 */
export async function previewReleaseEmail(
  releaseId: string,
  emailType: 'admin' | 'user'
): Promise<{ html: string; subject: string }> {
  // Get the full release data
  const release = await fetchReleaseById(releaseId);
  
  // Import the template generator
  const { generateEmailPreview } = await import('./release-email-templates');
  
  return generateEmailPreview(release, emailType);
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

  return {
    total: releases.length,
    draft: releases.filter((r) => r.deployment_status === 'draft').length,
    deployed: releases.filter((r) => r.deployment_status === 'deployed').length,
    archived: releases.filter((r) => r.deployment_status === 'archived').length,
    production: releases.filter((r) => r.environment === 'production').length,
    staging: releases.filter((r) => r.environment === 'staging').length,
    development: releases.filter((r) => r.environment === 'development').length,
  };
}
