import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

interface AdditionalGuest {
  name: string;
  email: string;
}

type Payload = { 
  rsvpId: string; 
  name: string; 
  email: string; 
  guests: number;
  isUpdate?: boolean;
  additionalGuests?: AdditionalGuest[];
};

// Temporarily hardcoded keys for testing
const MJ_API = "f3c1a2db847296151b9b989dc49cfa9a";
const MJ_SECRET = "6dec0ac72390100efa3e4a435077b870";
// const MJ_API = Deno.env.get("MAILJET_API_KEY")!;
// const MJ_SECRET = Deno.env.get("MAILJET_API_SECRET")!;
const FROM_EMAIL = Deno.env.get("MAILJET_FROM_EMAIL")!;
const FROM_NAME = Deno.env.get("MAILJET_FROM_NAME") ?? "Jamie & Kat Ruth";
const ADMIN_EMAIL = FROM_EMAIL; // Admin receives notifications at the from email
const PRIVATE_ADDRESS = Deno.env.get("PRIVATE_EVENT_ADDRESS") ?? "Location provided after RSVP.";
const ALLOWED = (Deno.env.get("ALLOWED_ORIGINS") ?? "").split(",").map(s => s.trim()).filter(Boolean);

// Supabase client for database updates
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Event facts (server-only source of truth)
const EVENT_TITLE = "The Ruths' Twisted Fairytale Halloween Bash";
const EVENT_START_ISO = "2025-10-18T19:00:00-06:00"; // America/Denver
const EVENT_DURATION_MIN = 240;

function mjAuth() {
  const token = btoa(`${MJ_API}:${MJ_SECRET}`);
  return { Authorization: `Basic ${token}` };
}

function buildICS(name: string) {
  const start = new Date(EVENT_START_ISO);
  const end = new Date(start.getTime() + EVENT_DURATION_MIN * 60000);
  const dt = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(".000", "");
  const ics = [
    "BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//partytillyou.rip//Twisted Fairytale//EN","CALSCALE:GREGORIAN","METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${crypto.randomUUID()}@partytillyou.rip`,
    `DTSTAMP:${dt(new Date())}`,
    `DTSTART:${dt(start)}`,
    `DTEND:${dt(end)}`,
    `SUMMARY:${EVENT_TITLE}`,
    `DESCRIPTION:Hi ${name}\\nYour RSVP is confirmed. Address: ${PRIVATE_ADDRESS}\\nPlease do not share publicly.`,
    `LOCATION:${PRIVATE_ADDRESS}`,
    "END:VEVENT","END:VCALENDAR"
  ].join("\r\n");
  return btoa(ics);
}

function cors(origin: string | null) {
  const allowed = origin && ALLOWED.includes(origin);
  // Allow partytillyou.rip domains and lovable.app preview domains
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

function buildAdditionalGuestsList(guests: AdditionalGuest[]): string {
  if (!guests || guests.length === 0) return '';
  
  const guestList = guests.map((guest, index) => 
    `<li style="margin: 8px 0;"><strong>Guest ${index + 2}:</strong> ${guest.name}${guest.email ? ` (${guest.email})` : ''}</li>`
  ).join('');
  
  return `
    <div style="margin: 20px 0; padding: 16px; background: #f9fafb; border-left: 4px solid #ff6b35; border-radius: 4px;">
      <h3 style="margin: 0 0 12px 0; color: #ff6b35; font-size: 16px;">Additional Guests:</h3>
      <ul style="margin: 0; padding-left: 20px; list-style: none;">
        ${guestList}
      </ul>
    </div>
  `;
}

serve(async (req) => {
  const origin = req.headers.get("origin");
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors(origin) });
  if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405, headers: cors(origin) });

  let body: Payload;
  try { body = await req.json(); } catch { return new Response("Bad Request", { status: 400, headers: cors(origin) }); }

  console.log('Processing RSVP confirmation:', { 
    email: body.email, 
    guests: body.guests, 
    isUpdate: body.isUpdate,
    hasAdditionalGuests: (body.additionalGuests?.length || 0) > 0
  });

  const isUpdate = body.isUpdate || false;
  const actionText = isUpdate ? "updated" : "received";
  const actionTitle = isUpdate ? "RSVP Updated" : "Your RSVP is received";
  
  const subject = `${actionTitle} — Twisted Fairytale Bash`;
  
  const additionalGuestsHtml = buildAdditionalGuestsList(body.additionalGuests || []);
  
  const text = `Hi ${body.name},

We have ${isUpdate ? 'updated' : 'received'} your RSVP for ${body.guests} ${body.guests > 1 ? "guests" : "guest"}.
Date: Saturday, October 18, 2025 — 7:00 PM
Where: ${PRIVATE_ADDRESS}

This address is private. Please don't share it publicly.

— Jamie & Kat Ruth`;

  const html = `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <div style="background: linear-gradient(135deg, #ff6b35 0%, #ff8c42 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
      <h1 style="color: white; margin: 0; font-size: 28px;">🎃 ${actionTitle}</h1>
    </div>
    <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px;">
      <p style="font-size: 16px; margin-top: 0;">Hi ${body.name},</p>
      <p>We have ${actionText} your RSVP for <strong>${body.guests}</strong> ${body.guests > 1 ? "guests" : "guest"}.</p>
      ${additionalGuestsHtml}
      <p><strong>Date:</strong> Saturday, October 18, 2025 — 7:00 PM</p>
      <p><strong>Where:</strong> ${PRIVATE_ADDRESS}</p>
      <p style="opacity:.8; font-size: 14px;">This address is private. Please don't share it publicly.</p>
      <p style="margin-top: 30px;">— Jamie &amp; Kat Ruth</p>
    </div>
  </div>`;

  // Admin notification email
  const adminSubject = `🔔 RSVP ${isUpdate ? 'Updated' : 'Received'}: ${body.name}`;
  const adminHtml = `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <div style="background: #1f2937; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
      <h1 style="color: white; margin: 0; font-size: 24px;">🔔 RSVP ${isUpdate ? 'Updated' : 'Received'}</h1>
    </div>
    <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px;">
      <p style="font-size: 16px; margin-top: 0;"><strong>${body.name}</strong> has ${actionText} their RSVP.</p>
      <div style="background: white; padding: 20px; border-left: 4px solid #1f2937; margin: 20px 0; border-radius: 4px;">
        <p style="margin: 8px 0;"><strong>Name:</strong> ${body.name}</p>
        <p style="margin: 8px 0;"><strong>Email:</strong> ${body.email}</p>
        <p style="margin: 8px 0;"><strong>Total Guests:</strong> ${body.guests}</p>
        ${additionalGuestsHtml}
      </div>
      <p style="font-size: 14px; color: #6b7280; margin-top: 20px;">RSVP ID: ${body.rsvpId}</p>
    </div>
  </div>`;

  const messages = [
    {
      From: { Email: FROM_EMAIL, Name: FROM_NAME },
      To: [{ Email: body.email, Name: body.name }],
      Subject: subject,
      TextPart: text,
      HTMLPart: html,
      Attachments: [{
        ContentType: "text/calendar",
        Filename: "twisted-fairytale.ics",
        Base64Content: buildICS(body.name)
      }],
      CustomID: body.rsvpId
    },
    {
      From: { Email: FROM_EMAIL, Name: FROM_NAME },
      To: [{ Email: ADMIN_EMAIL, Name: "Admin" }],
      Subject: adminSubject,
      HTMLPart: adminHtml,
      CustomID: `admin-${body.rsvpId}`
    }
  ];

  console.log('Sending to Mailjet API...', {
    apiKey: MJ_API ? 'Present' : 'Missing',
    apiSecret: MJ_SECRET ? 'Present' : 'Missing',
    fromEmail: FROM_EMAIL,
    fromName: FROM_NAME,
    messageCount: messages.length
  });

  const res = await fetch("https://api.mailjet.com/v3.1/send", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...mjAuth() },
    body: JSON.stringify({ Messages: messages })
  });

  console.log('Mailjet API response:', {
    status: res.status,
    statusText: res.statusText,
    ok: res.ok
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error('Mailjet API error details:', {
      status: res.status,
      statusText: res.statusText,
      errorText: errorText,
      headers: Object.fromEntries(res.headers.entries())
    });
    return new Response(`Email send failed: ${res.status} ${res.statusText} - ${errorText}`, { status: 502, headers: cors(origin) });
  }

  const result = await res.json();
  console.log('Emails sent successfully:', result);
  
  // Update database to track email sent
  try {
    const { error: updateError } = await supabase
      .from('rsvps')
      .update({ email_sent_at: new Date().toISOString() })
      .eq('id', body.rsvpId);
    
    if (updateError) {
      console.error('Failed to update email_sent_at:', updateError);
      // Don't fail the request, just log the error
    } else {
      console.log('Successfully updated email_sent_at for RSVP:', body.rsvpId);
    }
  } catch (dbError) {
    console.error('Database update error:', dbError);
    // Don't fail the request, just log the error
  }
  
  return new Response("ok", { status: 200, headers: cors(origin) });
});