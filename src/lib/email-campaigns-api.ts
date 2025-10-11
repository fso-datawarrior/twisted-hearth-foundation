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
  recipient_list: 'all' | 'rsvp_yes' | 'rsvp_pending' | 'custom';
  custom_recipients?: string[];
  subject: string;
  scheduled_at?: string;
  sent_at?: string;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed';
  stats: CampaignStats;
  created_at: string;
  email_templates?: EmailTemplate;
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
