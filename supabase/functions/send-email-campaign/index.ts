import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SendCampaignRequest {
  campaign_id: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const mailjetApiKey = Deno.env.get('MAILJET_API_KEY')!;
    const mailjetApiSecret = Deno.env.get('MAILJET_API_SECRET')!;
    const mailjetFromEmail = Deno.env.get('MAILJET_FROM_EMAIL')!;
    const mailjetFromName = Deno.env.get('MAILJET_FROM_NAME')!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { campaign_id }: SendCampaignRequest = await req.json();
    console.log(`📧 Starting email campaign: ${campaign_id}`);

    // Get campaign details
    const { data: campaign, error: campaignError } = await supabase
      .from('email_campaigns')
      .select('*, email_templates(*)')
      .eq('id', campaign_id)
      .single();

    if (campaignError || !campaign) {
      throw new Error(`Campaign not found: ${campaignError?.message}`);
    }

    console.log(`📋 Campaign: ${campaign.subject}, List: ${campaign.recipient_list}`);

    // Update campaign status to 'sending'
    await supabase
      .from('email_campaigns')
      .update({ status: 'sending' })
      .eq('id', campaign_id);

    // Build recipient list with user data
    interface RecipientData {
      email: string;
      name: string;
      rsvp_status?: string;
      costume_idea?: string;
      num_guests?: number;
      dietary_restrictions?: string;
    }

    let recipientsData: RecipientData[] = [];

    if (campaign.recipient_list === 'all') {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('email, display_name')
        .not('email', 'is', null);
      
      recipientsData = profiles?.map(p => ({
        email: p.email,
        name: p.display_name || p.email.split('@')[0],
      })) || [];
    } else if (campaign.recipient_list === 'rsvp_yes') {
      const { data: rsvps } = await supabase
        .from('rsvps')
        .select('email, name, status, dietary_restrictions, num_guests')
        .eq('status', 'confirmed')
        .eq('is_approved', true);
      
      recipientsData = rsvps?.map(r => ({
        email: r.email,
        name: r.name,
        rsvp_status: r.status,
        num_guests: r.num_guests,
        dietary_restrictions: r.dietary_restrictions,
      })) || [];
    } else if (campaign.recipient_list === 'rsvp_pending') {
      const { data: rsvps } = await supabase
        .from('rsvps')
        .select('email, name, status, dietary_restrictions, num_guests')
        .eq('status', 'pending');
      
      recipientsData = rsvps?.map(r => ({
        email: r.email,
        name: r.name,
        rsvp_status: r.status,
        num_guests: r.num_guests,
        dietary_restrictions: r.dietary_restrictions,
      })) || [];
    } else if (campaign.recipient_list === 'custom' && campaign.custom_recipients) {
      recipientsData = campaign.custom_recipients.map(email => ({
        email,
        name: email.split('@')[0],
      }));
    }

    // Remove duplicates by email
    const uniqueRecipients = new Map<string, RecipientData>();
    recipientsData.forEach(r => {
      if (!uniqueRecipients.has(r.email)) {
        uniqueRecipients.set(r.email, r);
      }
    });
    recipientsData = Array.from(uniqueRecipients.values());

    console.log(`📬 Sending to ${recipientsData.length} recipients`);

    if (recipientsData.length === 0) {
      throw new Error('No recipients found');
    }

    // Create recipient records
    for (const recipient of recipientsData) {
      await supabase
        .from('campaign_recipients')
        .insert({
          campaign_id,
          email: recipient.email,
          status: 'pending',
        })
        .onConflict('campaign_id, email')
        .ignoreDuplicates();
    }

    // Function to replace variables in HTML
    const replaceVariables = (html: string, data: RecipientData): string => {
      return html
        .replace(/{{name}}/g, data.name)
        .replace(/{{email}}/g, data.email)
        .replace(/{{rsvp_status}}/g, data.rsvp_status || 'pending')
        .replace(/{{event_date}}/g, 'November 1st, 2025')
        .replace(/{{event_time}}/g, '6:30 PM')
        .replace(/{{event_address}}/g, 'Denver, Colorado')
        .replace(/{{costume_idea}}/g, data.costume_idea || 'your creative costume')
        .replace(/{{num_guests}}/g, String(data.num_guests || 1))
        .replace(/{{dietary_restrictions}}/g, data.dietary_restrictions || 'none specified')
        .replace(/{{gallery_link}}/g, 'https://twisted-tale.lovable.app/gallery');
    };

    // Send emails via Mailjet (batch of 50 at a time to respect rate limits)
    const batchSize = 50;
    let sentCount = 0;
    let deliveredCount = 0;
    let bouncedCount = 0;
    let failedCount = 0;

    for (let i = 0; i < recipientsData.length; i += batchSize) {
      const batch = recipientsData.slice(i, i + batchSize);
      console.log(`📤 Sending batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(recipientsData.length / batchSize)}`);

      const messages = batch.map(recipient => ({
        From: {
          Email: mailjetFromEmail,
          Name: mailjetFromName,
        },
        To: [
          {
            Email: recipient.email,
            Name: recipient.name,
          },
        ],
        Subject: campaign.subject,
        HTMLPart: replaceVariables(campaign.email_templates?.html_content || '<p>No content</p>', recipient),
        TextPart: campaign.email_templates?.preview_text || '',
      }));

      try {
        const mailjetResponse = await fetch('https://api.mailjet.com/v3.1/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Basic ${btoa(`${mailjetApiKey}:${mailjetApiSecret}`)}`,
          },
          body: JSON.stringify({ Messages: messages }),
        });

        const result = await mailjetResponse.json();
        console.log(`✅ Batch response:`, result);

        // Update recipient statuses
        if (result.Messages) {
          for (let j = 0; j < result.Messages.length; j++) {
            const msg = result.Messages[j];
            const recipient = batch[j];

            if (msg.Status === 'success') {
              await supabase
                .from('campaign_recipients')
                .update({
                  status: 'sent',
                  sent_at: new Date().toISOString(),
                })
                .eq('campaign_id', campaign_id)
                .eq('email', recipient.email);
              sentCount++;
              deliveredCount++;
            } else {
              await supabase
                .from('campaign_recipients')
                .update({
                  status: 'failed',
                  error_message: msg.Errors?.[0]?.ErrorMessage || 'Unknown error',
                })
                .eq('campaign_id', campaign_id)
                .eq('email', recipient.email);
              failedCount++;
            }
          }
        }
      } catch (error) {
        console.error(`❌ Batch error:`, error);
        // Mark batch as failed
        for (const recipient of batch) {
          await supabase
            .from('campaign_recipients')
            .update({
              status: 'failed',
              error_message: error.message,
            })
            .eq('campaign_id', campaign_id)
            .eq('email', recipient.email);
          failedCount++;
        }
      }

      // Rate limiting: wait 1 second between batches
      if (i + batchSize < recipientsData.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // Update campaign with final stats
    await supabase
      .from('email_campaigns')
      .update({
        status: 'sent',
        sent_at: new Date().toISOString(),
        stats: {
          sent: sentCount,
          delivered: deliveredCount,
          bounced: bouncedCount,
          failed: failedCount,
        },
      })
      .eq('id', campaign_id);

    console.log(`✅ Campaign complete: ${sentCount} sent, ${failedCount} failed`);

    return new Response(
      JSON.stringify({
        success: true,
        stats: {
          sent: sentCount,
          delivered: deliveredCount,
          bounced: bouncedCount,
          failed: failedCount,
        },
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error('❌ Error sending campaign:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
});
