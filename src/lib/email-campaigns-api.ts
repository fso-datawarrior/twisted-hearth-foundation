import { supabase } from '@/integrations/supabase/client';

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  html_content: string;
  preview_text?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CampaignStats {
  sent: number;
  delivered: number;
  bounced: number;
  failed: number;
}

export interface EmailCampaign {
  id: string;
  template_id?: string;
  recipient_list: 'all' | 'rsvp_yes' | 'rsvp_pending' | 'custom' | 'admins';
  custom_recipients?: string[];
  subject: string;
  scheduled_at?: string;
  sent_at?: string;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed';
  stats: CampaignStats;
  created_at: string;
  email_templates?: EmailTemplate;
  template_variables?: Record<string, any>;
}

// Template Management
export async function getTemplates() {
  const { data, error } = await supabase
    .from('email_templates')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as EmailTemplate[];
}

export async function getActiveTemplates() {
  const { data, error } = await supabase
    .from('email_templates')
    .select('*')
    .eq('is_active', true)
    .order('name');

  if (error) throw error;
  return data as EmailTemplate[];
}

export async function getTemplate(id: string) {
  const { data, error } = await supabase
    .from('email_templates')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as EmailTemplate;
}

export async function createTemplate(template: Omit<EmailTemplate, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('email_templates')
    .insert(template)
    .select()
    .single();

  if (error) throw error;
  return data as EmailTemplate;
}

export async function updateTemplate(id: string, updates: Partial<EmailTemplate>) {
  const { data, error } = await supabase
    .from('email_templates')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as EmailTemplate;
}

export async function deleteTemplate(id: string) {
  const { error } = await supabase
    .from('email_templates')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// Campaign Management
export async function getCampaigns() {
  const { data, error } = await supabase
    .from('email_campaigns')
    .select('*, email_templates(*)')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data.map(campaign => ({
    ...campaign,
    stats: campaign.stats as unknown as CampaignStats,
  })) as EmailCampaign[];
}

export async function getCampaign(id: string) {
  const { data, error } = await supabase
    .from('email_campaigns')
    .select('*, email_templates(*)')
    .eq('id', id)
    .single();

  if (error) throw error;
  return {
    ...data,
    stats: data.stats as unknown as CampaignStats,
  } as EmailCampaign;
}

export async function createCampaign(campaign: Omit<EmailCampaign, 'id' | 'created_at' | 'stats' | 'email_templates'>) {
  const { data, error } = await supabase
    .from('email_campaigns')
    .insert({
      ...campaign,
      stats: { sent: 0, delivered: 0, bounced: 0, failed: 0 },
    })
    .select()
    .single();

  if (error) throw error;
  return {
    ...data,
    stats: data.stats as unknown as CampaignStats,
  } as EmailCampaign;
}

export async function updateCampaign(id: string, updates: Partial<EmailCampaign>) {
  // Separate stats from other updates if present
  const { stats, ...otherUpdates } = updates;
  
  const updatePayload: any = {
    ...otherUpdates,
  };
  
  // Convert stats to Json type if present
  if (stats) {
    updatePayload.stats = stats as any;
  }
  
  const { data, error } = await supabase
    .from('email_campaigns')
    .update(updatePayload)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return {
    ...data,
    stats: data.stats as unknown as CampaignStats,
  } as EmailCampaign;
}

export async function deleteCampaign(id: string) {
  const { error } = await supabase
    .from('email_campaigns')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// Clone/Duplicate Campaign
export async function cloneCampaign(id: string): Promise<EmailCampaign> {
  // Get the original campaign
  const original = await getCampaign(id);
  
  // Create a new campaign with the same data but reset status
  const clonedData = {
    template_id: original.template_id,
    recipient_list: original.recipient_list,
    custom_recipients: original.custom_recipients,
    subject: `${original.subject} (Copy)`,
    template_variables: original.template_variables,
    status: 'draft' as const,
  };
  
  return await createCampaign(clonedData);
}

// Send Campaign
export async function sendCampaign(campaignId: string) {
  const { data, error } = await supabase.functions.invoke('send-email-campaign', {
    body: { campaign_id: campaignId },
  });

  if (error) throw error;
  return data;
}

// Get recipient count estimate
export async function getRecipientCount(recipientList: string): Promise<number> {
  if (recipientList === 'all') {
    const { count, error } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .not('email', 'is', null);
    if (error) throw error;
    return count || 0;
  } else if (recipientList === 'rsvp_yes') {
    const { count, error } = await supabase
      .from('rsvps')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'confirmed')
      .eq('is_approved', true);
    if (error) throw error;
    return count || 0;
  } else if (recipientList === 'rsvp_pending') {
    const { count, error } = await supabase
      .from('rsvps')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');
    if (error) throw error;
    return count || 0;
  } else if (recipientList === 'admins') {
    const { count, error } = await supabase
      .from('user_roles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'admin');
    if (error) throw error;
    return count || 0;
  }
  return 0;
}

// Parse CSV for custom recipients
export function parseEmailCSV(csvContent: string): string[] {
  const lines = csvContent.split('\n').map(line => line.trim()).filter(Boolean);
  const emails: string[] = [];
  
  for (const line of lines) {
    // Check if it's a simple email or CSV with columns
    const parts = line.split(',');
    for (const part of parts) {
      const trimmed = part.trim().replace(/['"]/g, '');
      // Basic email validation
      if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
        emails.push(trimmed);
      }
    }
  }
  
  // Remove duplicates
  return [...new Set(emails)];
}

/**
 * Send a system update email to all users
 */
export async function sendSystemUpdate(params: {
  version: string;
  templateType?: 'admin' | 'user' | 'both';
  releaseDate?: string;
  summary?: string;
  newFeatures?: Array<{ title: string; description: string; benefit?: string }>;
  bugFixes?: string[];
  improvements?: string[];
  knownIssues?: string[];
  additionalNotes?: string;
  // Admin-specific fields
  apisChanged?: Array<{ endpoint: string; change: string }>;
  uiUpdates?: Array<{ component: string; change: string }>;
  breakingChanges?: string[];
  databaseChanges?: string[];
  technicalNotes?: string;
}) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Check if user is admin
  const { data: userRole } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .eq('role', 'admin')
    .maybeSingle();

  if (!userRole) {
    throw new Error('Unauthorized: Admin access required');
  }

  const templateType = params.templateType || 'user';
  
  // Helper function to convert technical descriptions to user-friendly language
  const convertToUserFriendly = (technicalText: string): string => {
    const conversions: Record<string, string> = {
      'authentication': 'logging in',
      'API': 'app features',
      'database': 'data storage',
      'performance': 'speed',
      'bug': 'issue',
      'fix': 'improvement',
      'endpoint': 'feature',
      'component': 'page',
      'UI': 'interface',
      'UX': 'user experience',
      'migration': 'update',
      'schema': 'data structure',
      'optimization': 'improvement',
      'refactor': 'cleanup',
      'deployment': 'release'
    };
    
    let converted = technicalText;
    Object.entries(conversions).forEach(([tech, friendly]) => {
      converted = converted.replace(new RegExp(tech, 'gi'), friendly);
    });
    
    return converted;
  };

  const baseVariables = {
    VERSION: params.version,
    RELEASE_DATE: params.releaseDate || new Date().toLocaleDateString(),
    SUMMARY: params.summary || '',
    SITE_URL: window.location.origin,
    ADDITIONAL_NOTES: params.additionalNotes || '',
    KNOWN_ISSUES: params.knownIssues || [],
  };

  if (templateType === 'both') {
    // Send both admin and user versions
    const adminCampaign = await createCampaign({
      subject: `🎃 System Update ${params.version} - Technical Summary`,
      recipient_list: 'admins', // Send to admins only
      template_variables: {
        ...baseVariables,
        FEATURES_ADDED: params.newFeatures || [],
        APIS_CHANGED: params.apisChanged || [],
        UI_UPDATES: params.uiUpdates || [],
        BUG_FIXES: params.bugFixes || [],
        IMPROVEMENTS: params.improvements || [],
        BREAKING_CHANGES: params.breakingChanges || [],
        DATABASE_CHANGES: params.databaseChanges || [],
        TECHNICAL_NOTES: params.technicalNotes || '',
      },
      status: 'draft',
    });

    const userCampaign = await createCampaign({
      subject: `🎃 We Made Your Party Experience Even Better! ${params.version}`,
      recipient_list: 'all',
      template_variables: {
        ...baseVariables,
        FEATURES_ADDED: params.newFeatures?.map(f => ({
          title: f.title,
          benefit: f.benefit || convertToUserFriendly(f.description)
        })) || [],
        BUG_FIXES: params.bugFixes?.map(convertToUserFriendly) || [],
        IMPROVEMENTS: params.improvements?.map(convertToUserFriendly) || [],
      },
      status: 'draft',
    });

    // Send both campaigns
    await Promise.all([
      sendCampaign(adminCampaign.id),
      sendCampaign(userCampaign.id)
    ]);

    return { adminCampaign, userCampaign };
  } else if (templateType === 'admin') {
    // Admin/Technical version
    const campaign = await createCampaign({
      subject: `🎃 System Update ${params.version} - Technical Summary`,
      recipient_list: 'admins', // Send to admins only
      template_variables: {
        ...baseVariables,
        FEATURES_ADDED: params.newFeatures || [],
        APIS_CHANGED: params.apisChanged || [],
        UI_UPDATES: params.uiUpdates || [],
        BUG_FIXES: params.bugFixes || [],
        IMPROVEMENTS: params.improvements || [],
        BREAKING_CHANGES: params.breakingChanges || [],
        DATABASE_CHANGES: params.databaseChanges || [],
        TECHNICAL_NOTES: params.technicalNotes || '',
      },
      status: 'draft',
    });

    await sendCampaign(campaign.id);
    return campaign;
  } else {
    // User-friendly version (default)
    const campaign = await createCampaign({
      subject: `🎃 We Made Your Party Experience Even Better! ${params.version}`,
      recipient_list: 'all',
      template_variables: {
        ...baseVariables,
        FEATURES_ADDED: params.newFeatures?.map(f => ({
          title: f.title,
          benefit: f.benefit || convertToUserFriendly(f.description)
        })) || [],
        BUG_FIXES: params.bugFixes?.map(convertToUserFriendly) || [],
        IMPROVEMENTS: params.improvements?.map(convertToUserFriendly) || [],
      },
      status: 'draft',
    });

    await sendCampaign(campaign.id);
    return campaign;
  }
}
