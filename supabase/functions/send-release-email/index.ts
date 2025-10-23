import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';
import { getDisplayName } from '../_shared/display-name.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SendReleaseEmailRequest {
  release_id: string;
  email_type: 'admin' | 'user';
  recipient_groups: string[];
  custom_recipients: string[];
}

interface RecipientData {
  email: string;
  name: string;
  rsvp_status?: string;
  num_guests?: number;
  dietary_restrictions?: string;
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

    const { release_id, email_type, recipient_groups, custom_recipients }: SendReleaseEmailRequest = await req.json();
    console.log(`📧 Starting release email: ${release_id}, Type: ${email_type}`);

    // Get full release data
    const { data: releaseData, error: releaseError } = await supabase.rpc('get_release_full', {
      p_release_id: release_id
    });

    if (releaseError || !releaseData) {
      throw new Error(`Release not found: ${releaseError?.message}`);
    }

    const { release, features = [], api_changes = [], changes = [], notes = [] } = releaseData as any;
    const fullRelease = {
      ...release,
      features,
      api_changes,
      changes,
      notes,
    };

    console.log(`📋 Release: v${release.version}, Environment: ${release.environment}`);

    // Generate email HTML based on type
    const emailHtml = await generateReleaseEmailHtml(fullRelease, email_type);
    
    // Collect recipients based on groups
    let recipientsData: RecipientData[] = [];

    for (const group of recipient_groups) {
      if (group === 'all') {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('email, display_name, first_name, last_name');
        
        recipientsData = recipientsData.concat(profiles?.map(p => ({
          email: p.email,
          name: getDisplayName({
            display_name: p.display_name,
            first_name: p.first_name,
            last_name: p.last_name,
            email: p.email
          }),
        })) || []);
      } else if (group === 'admins') {
        const { data: admins } = await supabase
          .from('profiles')
          .select('email, display_name, first_name, last_name')
          .eq('role', 'admin');
        
        recipientsData = recipientsData.concat(admins?.map(a => ({
          email: a.email,
          name: getDisplayName({
            display_name: a.display_name,
            first_name: a.first_name,
            last_name: a.last_name,
            email: a.email
          }),
        })) || []);
      } else if (group === 'rsvp_yes') {
        const { data: rsvps } = await supabase
          .from('rsvps')
          .select('email, first_name, last_name, display_name, name, status, dietary_restrictions, num_guests')
          .eq('status', 'confirmed')
          .eq('is_approved', true);
        
        recipientsData = recipientsData.concat(rsvps?.map(r => ({
          email: r.email,
          name: getDisplayName({
            display_name: r.display_name,
            first_name: r.first_name,
            last_name: r.last_name,
            name: r.name,
            email: r.email
          }),
          rsvp_status: r.status,
          num_guests: r.num_guests,
          dietary_restrictions: r.dietary_restrictions,
        })) || []);
      } else if (group === 'rsvp_pending') {
        const { data: rsvps } = await supabase
          .from('rsvps')
          .select('email, first_name, last_name, display_name, name, status, dietary_restrictions, num_guests')
          .eq('status', 'pending');
        
        recipientsData = recipientsData.concat(rsvps?.map(r => ({
          email: r.email,
          name: getDisplayName({
            display_name: r.display_name,
            first_name: r.first_name,
            last_name: r.last_name,
            name: r.name,
            email: r.email
          }),
          rsvp_status: r.status,
          num_guests: r.num_guests,
          dietary_restrictions: r.dietary_restrictions,
        })) || []);
      }
    }

    // Add custom recipients
    if (custom_recipients.length > 0) {
      recipientsData = recipientsData.concat(custom_recipients.map(email => ({
        email,
        name: getDisplayName({ email }),
      })));
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

    // Create campaign record for tracking
    const { data: campaign, error: campaignError } = await supabase
      .from('email_campaigns')
      .insert({
        subject: emailHtml.subject,
        message_html: emailHtml.html,
        message_text: stripHtml(emailHtml.html),
        recipient_list: 'custom',
        custom_recipients: recipientsData.map(r => r.email),
        recipient_count: recipientsData.length,
        status: 'sending',
        created_by: null, // System generated
      })
      .select('id')
      .single();

    if (campaignError) {
      throw new Error(`Failed to create campaign: ${campaignError.message}`);
    }

    // Send emails via Mailjet
    const batchSize = 50;
    let sentCount = 0;
    let deliveredCount = 0;
    let bouncedCount = 0;
    let failedCount = 0;

    for (let i = 0; i < recipientsData.length; i += batchSize) {
      const batch = recipientsData.slice(i, i + batchSize);
      
      const mailjetPayload = {
        Messages: batch.map(recipient => ({
          From: {
            Email: mailjetFromEmail,
            Name: mailjetFromName,
          },
          To: [{
            Email: recipient.email,
            Name: recipient.name,
          }],
          Subject: emailHtml.subject,
          HTMLPart: emailHtml.html,
          TextPart: stripHtml(emailHtml.html),
          CustomID: `release-${release_id}-${recipient.email}`,
        })),
      };

      try {
        const response = await fetch('https://api.mailjet.com/v3.1/send', {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${btoa(`${mailjetApiKey}:${mailjetApiSecret}`)}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(mailjetPayload),
        });

        const result = await response.json();
        console.log(`✅ Batch response:`, result);

        // Update recipient statuses
        if (result.Messages) {
          for (let j = 0; j < result.Messages.length; j++) {
            const msg = result.Messages[j];
            const recipient = batch[j];

            if (msg.Status === 'success') {
              await supabase
                .from('campaign_recipients')
                .insert({
                  campaign_id: campaign.id,
                  email: recipient.email,
                  status: 'sent',
                  sent_at: new Date().toISOString(),
                });
              sentCount++;
              deliveredCount++;
            } else {
              await supabase
                .from('campaign_recipients')
                .insert({
                  campaign_id: campaign.id,
                  email: recipient.email,
                  status: 'failed',
                  error_message: msg.Errors?.[0]?.ErrorMessage || 'Unknown error',
                });
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
            .insert({
              campaign_id: campaign.id,
              email: recipient.email,
              status: 'failed',
              error_message: error.message,
            });
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
      .eq('id', campaign.id);

    // Update release as sent
    await supabase
      .from('system_releases')
      .update({
        email_sent: true,
        email_sent_at: new Date().toISOString(),
        email_type_sent: email_type,
        recipient_count: recipientsData.length,
      })
      .eq('id', release_id);

    console.log(`✅ Release email sent successfully: ${sentCount} sent, ${failedCount} failed`);

    return new Response(JSON.stringify({
      success: true,
      sent: sentCount,
      failed: failedCount,
      total: recipientsData.length,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Release email error:', error);
    return new Response(JSON.stringify({
      error: error.message,
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

/**
 * Generate email HTML for release
 */
async function generateReleaseEmailHtml(release: any, emailType: 'admin' | 'user'): Promise<{ html: string; subject: string }> {
  if (emailType === 'admin') {
    const subject = `🎃 System Update v${release.version} - Technical Summary`;
    
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #8B5CF6, #A855F7); color: white; padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px; }
    .section { margin: 25px 0; padding: 20px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #8B5CF6; }
    .section h3 { color: #8B5CF6; margin-top: 0; }
    .feature-item { margin: 15px 0; padding: 15px; background: white; border-radius: 5px; border: 1px solid #e9ecef; }
    .api-change { font-family: monospace; background: #f1f3f4; padding: 8px; border-radius: 4px; margin: 5px 0; }
    .breaking { background: #fff3cd; border-color: #ffc107; }
    .footer { margin-top: 40px; padding: 20px; background: #f8f9fa; border-radius: 8px; text-align: center; font-size: 14px; color: #6c757d; }
  </style>
</head>
<body>
  <div class="header">
    <h1>🎃 System Update v${release.version}</h1>
    <p>Technical Summary for Administrators</p>
    <p><strong>Release Date:</strong> ${new Date(release.release_date).toLocaleDateString()}</p>
    <p><strong>Environment:</strong> ${release.environment}</p>
  </div>

  ${release.summary ? `
  <div class="section">
    <h3>📋 Executive Summary</h3>
    <p>${release.summary}</p>
  </div>
  ` : ''}

  ${release.features && release.features.length > 0 ? `
  <div class="section">
    <h3>✨ Features Added</h3>
    ${release.features.map(feature => `
      <div class="feature-item">
        <h4>${feature.title}</h4>
        <p><strong>Description:</strong> ${feature.description}</p>
        ${feature.benefit ? `<p><strong>Benefit:</strong> ${feature.benefit}</p>` : ''}
      </div>
    `).join('')}
  </div>
  ` : ''}

  ${release.api_changes && release.api_changes.length > 0 ? `
  <div class="section">
    <h3>🔧 API Changes</h3>
    ${release.api_changes.map(change => `
      <div class="api-change">
        <strong>${change.endpoint}</strong> (${change.change_type?.toUpperCase()})
        <br>${change.description}
      </div>
    `).join('')}
  </div>
  ` : ''}

  ${release.changes && release.changes.length > 0 ? `
  <div class="section">
    <h3>🔨 Changes</h3>
    ${release.changes.map(change => `
      <div class="feature-item">
        <strong>${change.category?.replace('_', ' ').toUpperCase()}</strong>
        ${change.component ? ` - ${change.component}` : ''}
        <br>${change.description}
      </div>
    `).join('')}
  </div>
  ` : ''}

  ${release.notes && release.notes.some(n => n.note_type === 'breaking') ? `
  <div class="section breaking">
    <h3>⚠️ Breaking Changes</h3>
    ${release.notes.filter(n => n.note_type === 'breaking').map(note => `
      <div class="feature-item">
        <p>${note.content}</p>
      </div>
    `).join('')}
  </div>
  ` : ''}

  ${release.notes && release.notes.some(n => n.note_type === 'known_issue') ? `
  <div class="section">
    <h3>🐛 Known Issues</h3>
    ${release.notes.filter(n => n.note_type === 'known_issue').map(note => `
      <div class="feature-item">
        <p>${note.content}</p>
      </div>
    `).join('')}
  </div>
  ` : ''}

  ${release.notes && release.notes.some(n => n.note_type === 'technical') ? `
  <div class="section">
    <h3>🔧 Technical Notes</h3>
    ${release.notes.filter(n => n.note_type === 'technical').map(note => `
      <div class="feature-item">
        <p>${note.content}</p>
      </div>
    `).join('')}
  </div>
  ` : ''}

  <div class="footer">
    <p>For technical support, contact the development team.</p>
  </div>
</body>
</html>`;

    return { html, subject };
  } else {
    const subject = `🎃 We Made Your Party Experience Even Better! v${release.version}`;
    
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #d4af37, #ffd700); color: #2d1b4e; padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px; }
    .section { margin: 25px 0; padding: 20px; background: #fff; border-radius: 8px; border: 2px solid #d4af37; }
    .section h3 { color: #2d1b4e; margin-top: 0; }
    .feature-card { margin: 15px 0; padding: 20px; background: linear-gradient(135deg, #f8f9fa, #e9ecef); border-radius: 10px; border: 2px solid #d4af37; }
    .cta-button { display: inline-block; background: linear-gradient(135deg, #d4af37, #ffd700); color: #2d1b4e; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; margin: 20px 0; }
    .footer { margin-top: 40px; padding: 20px; background: #f8f9fa; border-radius: 8px; text-align: center; font-size: 14px; color: #6c757d; }
  </style>
</head>
<body>
  <div class="header">
    <h1>🎃 We Made Your Party Experience Even Better!</h1>
    <p>Hey party people! 🎉✨</p>
    <p><strong>Version ${release.version}</strong> • ${new Date(release.release_date).toLocaleDateString()}</p>
  </div>

  ${release.summary ? `
  <div class="section">
    <h3>🎊 What's New This Time?</h3>
    <p>${release.summary}</p>
  </div>
  ` : ''}

  ${release.features && release.features.length > 0 ? `
  <div class="section">
    <h3>✨ What's New & Awesome!</h3>
    <p>We've been working hard to make your party experience even more magical! 🎩✨</p>
    ${release.features.map(feature => `
      <div class="feature-card">
        <h4>🎉 ${feature.title}</h4>
        <p>${feature.benefit || feature.description}</p>
      </div>
    `).join('')}
  </div>
  ` : ''}

  ${release.changes && release.changes.filter(c => c.category === 'bug_fix').length > 0 ? `
  <div class="section">
    <h3>🔧 What We Fixed!</h3>
    <p>Oops! We found some sneaky bugs and squashed them! 🐛💥</p>
    <ul>
      ${release.changes.filter(c => c.category === 'bug_fix').map(change => `
        <li>🎯 ${change.description}</li>
      `).join('')}
    </ul>
  </div>
  ` : ''}

  ${release.changes && release.changes.filter(c => c.category === 'improvement').length > 0 ? `
  <div class="section">
    <h3>🚀 What's Better Now!</h3>
    <p>We made everything smoother and more fun! 🌟</p>
    <ul>
      ${release.changes.filter(c => c.category === 'improvement').map(change => `
        <li>⭐ ${change.description}</li>
      `).join('')}
    </ul>
  </div>
  ` : ''}

  ${release.changes && release.changes.filter(c => c.category === 'ui_update').length > 0 ? `
  <div class="section">
    <h3>🎨 Lookin' Good!</h3>
    <p>We spruced up the interface to make it even more beautiful! ✨</p>
    <ul>
      ${release.changes.filter(c => c.category === 'ui_update').map(change => `
        <li>🎭 ${change.description}</li>
      `).join('')}
    </ul>
  </div>
  ` : ''}

  ${release.notes && release.notes.some(n => n.note_type === 'known_issue') ? `
  <div class="section">
    <h3>⚠️ Heads Up, Party People!</h3>
    <p>We found a few little quirks that we're working on fixing:</p>
    <ul>
      ${release.notes.filter(n => n.note_type === 'known_issue').map(note => `
        <li>🔍 ${note.content}</li>
      `).join('')}
    </ul>
    <p><em>Don't worry - we're on it! These will be fixed soon! 🛠️✨</em></p>
  </div>
  ` : ''}

  <div style="text-align: center; margin: 30px 0;">
    <a href="${Deno.env.get('SITE_URL') || 'https://twistedhearth.com'}" class="cta-button">Check It Out! 🎃</a>
  </div>

  <div class="footer">
    <p><strong>See you at the bash! 🎭✨</strong></p>
    <p>Questions? Just reply to this email!</p>
  </div>
</body>
</html>`;

    return { html, subject };
  }
}

/**
 * Strip HTML tags from text
 */
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}
