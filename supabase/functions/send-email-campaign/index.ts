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

    // Build recipient list
    let recipients: string[] = [];

    if (campaign.recipient_list === 'all') {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('email')
        .not('email', 'is', null);
      recipients = profiles?.map(p => p.email).filter(Boolean) || [];
    } else if (campaign.recipient_list === 'rsvp_yes') {
      const { data: rsvps } = await supabase
        .from('rsvps')
        .select('email')
        .eq('status', 'confirmed')
        .eq('is_approved', true);
      recipients = rsvps?.map(r => r.email).filter(Boolean) || [];
    } else if (campaign.recipient_list === 'rsvp_pending') {
      const { data: rsvps } = await supabase
        .from('rsvps')
        .select('email')
        .eq('status', 'pending');
      recipients = rsvps?.map(r => r.email).filter(Boolean) || [];
    } else if (campaign.recipient_list === 'custom' && campaign.custom_recipients) {
      recipients = campaign.custom_recipients;
    }

    // Remove duplicates
    recipients = [...new Set(recipients)];
    console.log(`📬 Sending to ${recipients.length} recipients`);

    if (recipients.length === 0) {
      throw new Error('No recipients found');
    }

    // Create recipient records
    for (const email of recipients) {
      await supabase
        .from('campaign_recipients')
        .insert({
          campaign_id,
          email,
          status: 'pending',
        })
        .onConflict('campaign_id, email')
        .ignoreDuplicates();
    }

    // Send emails via Mailjet (batch of 50 at a time to respect rate limits)
    const batchSize = 50;
    let sentCount = 0;
    let deliveredCount = 0;
    let bouncedCount = 0;
    let failedCount = 0;

    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize);
      console.log(`📤 Sending batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(recipients.length / batchSize)}`);

      const messages = batch.map(email => ({
        From: {
          Email: mailjetFromEmail,
          Name: mailjetFromName,
        },
        To: [
          {
            Email: email,
          },
        ],
        Subject: campaign.subject,
        HTMLPart: campaign.email_templates?.html_content || '<p>No content</p>',
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
            const email = batch[j];

            if (msg.Status === 'success') {
              await supabase
                .from('campaign_recipients')
                .update({
                  status: 'sent',
                  sent_at: new Date().toISOString(),
                })
                .eq('campaign_id', campaign_id)
                .eq('email', email);
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
                .eq('email', email);
              failedCount++;
            }
          }
        }
      } catch (error) {
        console.error(`❌ Batch error:`, error);
        // Mark batch as failed
        for (const email of batch) {
          await supabase
            .from('campaign_recipients')
            .update({
              status: 'failed',
              error_message: error.message,
            })
            .eq('campaign_id', campaign_id)
            .eq('email', email);
          failedCount++;
        }
      }

      // Rate limiting: wait 1 second between batches
      if (i + batchSize < recipients.length) {
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
