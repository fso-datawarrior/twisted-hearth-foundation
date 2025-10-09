import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const BulkEmailSchema = z.object({
  campaignId: z.string().uuid()
});

const MJ_API = Deno.env.get("MAILJET_API_KEY")!;
const MJ_SECRET = Deno.env.get("MAILJET_API_SECRET")!;
const FROM_EMAIL = Deno.env.get("MAILJET_FROM_EMAIL")!;
const FROM_NAME = Deno.env.get("MAILJET_FROM_NAME") ?? "Jamie & Kat Ruth";
const ALLOWED = (Deno.env.get("ALLOWED_ORIGINS") ?? "").split(",").map(s => s.trim()).filter(Boolean);

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

function mjAuth() {
  const token = btoa(`${MJ_API}:${MJ_SECRET}`);
  return { Authorization: `Basic ${token}` };
}

function cors(origin: string | null) {
  const allowed = origin && ALLOWED.includes(origin);
  const isPartytillyou = origin && origin.includes("partytillyou.rip");
  const isLovable = origin && origin.includes("lovable.app");
  const defaultOrigin = (isPartytillyou || isLovable) ? origin : "https://partytillyou.rip";
  return {
    "Access-Control-Allow-Origin": allowed ? origin : defaultOrigin,
    "Vary": "Origin",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "authorization, content-type, x-client-info, apikey",
  };
}

serve(async (req) => {
  const origin = req.headers.get("origin");
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors(origin) });
  if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405, headers: cors(origin) });

  let body: { campaignId: string };
  try { 
    const rawBody = await req.json();
    const validated = BulkEmailSchema.safeParse(rawBody);
    if (!validated.success) {
      console.error('Validation error:', validated.error);
      return new Response(JSON.stringify({ error: 'Invalid input', details: validated.error }), { 
        status: 400, 
        headers: cors(origin) 
      });
    }
    body = validated.data;
  } catch { 
    return new Response("Bad Request", { status: 400, headers: cors(origin) }); 
  }

  // Get campaign details
  const { data: campaign, error: campaignError } = await supabase
    .from('email_campaigns')
    .select('*')
    .eq('id', body.campaignId)
    .single();

  if (campaignError || !campaign) {
    return new Response("Campaign not found", { status: 404, headers: cors(origin) });
  }

  // Update campaign status
  await supabase
    .from('email_campaigns')
    .update({ status: 'sending' })
    .eq('id', campaign.id);

  // Get recipients
  const { data: recipients, error: recipientsError } = await supabase.rpc(
    'get_email_recipients',
    { p_filter: campaign.recipient_filter }
  );

  if (recipientsError || !recipients || recipients.length === 0) {
    await supabase
      .from('email_campaigns')
      .update({ status: 'failed', updated_at: new Date().toISOString() })
      .eq('id', campaign.id);
    return new Response("No recipients found", { status: 400, headers: cors(origin) });
  }

  // Update recipient count
  await supabase
    .from('email_campaigns')
    .update({ recipient_count: recipients.length })
    .eq('id', campaign.id);

  let sent = 0;
  let failed = 0;

  // Send emails in batches of 50 (Mailjet limit)
  for (let i = 0; i < recipients.length; i += 50) {
    const batch = recipients.slice(i, i + 50);
    
    const messages = batch.map((recipient: any) => ({
      From: { Email: FROM_EMAIL, Name: FROM_NAME },
      To: [{ Email: recipient.email, Name: recipient.name }],
      Subject: campaign.subject,
      TextPart: campaign.message_text,
      HTMLPart: campaign.message_html,
      CustomID: `${campaign.id}-${recipient.email}`
    }));

    try {
      const res = await fetch("https://api.mailjet.com/v3.1/send", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...mjAuth() },
        body: JSON.stringify({ Messages: messages })
      });

      if (res.ok) {
        sent += batch.length;
        // Record successful sends
        for (const recipient of batch) {
          await supabase.from('email_sends').insert({
            campaign_id: campaign.id,
            recipient_email: recipient.email,
            recipient_name: recipient.name,
            status: 'sent',
            sent_at: new Date().toISOString()
          });
        }
      } else {
        failed += batch.length;
        const errorText = await res.text();
        // Record failures
        for (const recipient of batch) {
          await supabase.from('email_sends').insert({
            campaign_id: campaign.id,
            recipient_email: recipient.email,
            recipient_name: recipient.name,
            status: 'failed',
            error_message: errorText
          });
        }
      }
    } catch (error) {
      failed += batch.length;
      console.error('Batch send error:', error);
    }

    // Small delay between batches
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Update final campaign status
  await supabase
    .from('email_campaigns')
    .update({
      status: failed === 0 ? 'sent' : 'failed',
      sent_count: sent,
      failed_count: failed,
      sent_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', campaign.id);

  return new Response(JSON.stringify({ sent, failed }), {
    status: 200,
    headers: { ...cors(origin), "Content-Type": "application/json" }
  });
});
