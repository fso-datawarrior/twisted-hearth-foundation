{F0CD6A15-41B1-4160-B4A4-16457D3C4515}.png

https://dgdeiybuxlqbdfofzxpy.supabase.co/functions/v1/send-rsvp-confirmation

Logs
{A14B0D0A-22E0-4A7A-8D6F-9495030C1EED}.png

Code
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
const MJ_API = Deno.env.get("MAILJET_API_KEY");
const MJ_SECRET = Deno.env.get("MAILJET_API_SECRET");
const FROM_EMAIL = Deno.env.get("MAILJET_FROM_EMAIL");
const FROM_NAME = Deno.env.get("MAILJET_FROM_NAME") ?? "Jamie & Kat Ruth";
const ADMIN_EMAIL = FROM_EMAIL; // Admin receives notifications at the from email
const PRIVATE_ADDRESS = Deno.env.get("PRIVATE_EVENT_ADDRESS") ?? "Location provided after RSVP.";
const ALLOWED = (Deno.env.get("ALLOWED_ORIGINS") ?? "").split(",").map((s)=>s.trim()).filter(Boolean);
// Event facts (server-only source of truth)
const EVENT_TITLE = "The Ruths' Twisted Fairytale Halloween Bash";
const EVENT_START_ISO = "2025-10-18T19:00:00-06:00"; // America/Denver
const EVENT_DURATION_MIN = 240;
function mjAuth() {
  const token = btoa(`${MJ_API}:${MJ_SECRET}`);
  return {
    Authorization: `Basic ${token}`
  };
}
function buildICS(name) {
  const start = new Date(EVENT_START_ISO);
  const end = new Date(start.getTime() + EVENT_DURATION_MIN * 60000);
  const dt = (d)=>d.toISOString().replace(/[-:]/g, "").replace(".000", "");
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//partytillyou.rip//Twisted Fairytale//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${crypto.randomUUID()}@partytillyou.rip`,
    `DTSTAMP:${dt(new Date())}`,
    `DTSTART:${dt(start)}`,
    `DTEND:${dt(end)}`,
    `SUMMARY:${EVENT_TITLE}`,
    `DESCRIPTION:Hi ${name}\\nYour RSVP is confirmed. Address: ${PRIVATE_ADDRESS}\\nPlease do not share publicly.`,
    `LOCATION:${PRIVATE_ADDRESS}`,
    "END:VEVENT",
    "END:VCALENDAR"
  ].join("\r\n");
  return btoa(ics);
}
function cors(origin) {
  const allowed = origin && ALLOWED.includes(origin);
  return {
    "Access-Control-Allow-Origin": allowed ? origin : "https://partytillyou.rip",
    "Vary": "Origin",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "authorization, content-type"
  };
}
function buildAdditionalGuestsList(guests) {
  if (!guests || guests.length === 0) return '';
  const guestList = guests.map((guest, index)=>`<li style="margin: 8px 0;"><strong>Guest ${index + 2}:</strong> ${guest.name}${guest.email ? ` (${guest.email})` : ''}</li>`).join('');
  return `
    <div style="margin: 20px 0; padding: 16px; background: #f9fafb; border-left: 4px solid #ff6b35; border-radius: 4px;">
      <h3 style="margin: 0 0 12px 0; color: #ff6b35; font-size: 16px;">Additional Guests:</h3>
      <ul style="margin: 0; padding-left: 20px; list-style: none;">
        ${guestList}
      </ul>
    </div>
  `;
}
serve(async (req)=>{
  const origin = req.headers.get("origin");
  if (req.method === "OPTIONS") return new Response("ok", {
    headers: cors(origin)
  });
  if (req.method !== "POST") return new Response("Method Not Allowed", {
    status: 405,
    headers: cors(origin)
  });
  let body;
  try {
    body = await req.json();
  } catch  {
    return new Response("Bad Request", {
      status: 400,
      headers: cors(origin)
    });
  }
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
      From: {
        Email: FROM_EMAIL,
        Name: FROM_NAME
      },
      To: [
        {
          Email: body.email,
          Name: body.name
        }
      ],
      Subject: subject,
      TextPart: text,
      HTMLPart: html,
      Attachments: [
        {
          ContentType: "text/calendar",
          Filename: "twisted-fairytale.ics",
          Base64Content: buildICS(body.name)
        }
      ],
      CustomID: body.rsvpId
    },
    {
      From: {
        Email: FROM_EMAIL,
        Name: FROM_NAME
      },
      To: [
        {
          Email: ADMIN_EMAIL,
          Name: "Admin"
        }
      ],
      Subject: adminSubject,
      HTMLPart: adminHtml,
      CustomID: `admin-${body.rsvpId}`
    }
  ];
  const res = await fetch("https://api.mailjet.com/v3.1/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...mjAuth()
    },
    body: JSON.stringify({
      Messages: messages
    })
  });
  if (!res.ok) {
    const errorText = await res.text();
    console.error('Mailjet API error:', errorText);
    return new Response("Email send failed", {
      status: 502,
      headers: cors(origin)
    });
  }
  const result = await res.json();
  console.log('Emails sent successfully:', result);
  return new Response("ok", {
    status: 200,
    headers: cors(origin)
  });
});

Details:
{E94030AA-58DE-4E20-A009-30D6F6B02696}.png

Endpoint URL:
https://dgdeiybuxlqbdfofzxpy.supabase.co/functions/v1/send-rsvp-confirmation

Secrets:
{6CFD162D-59E9-4F99-85CE-6649D57D4C47}.png

---
Edge Function: 
https://dgdeiybuxlqbdfofzxpy.supabase.co/functions/v1/send-contribution-confirmation

Logs:
{99D4E5AE-0668-48DB-AC07-62D809E4DB20}.png

Code:
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};
const handler = async (req)=>{
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    });
  }
  try {
    const { contributorEmail, contributorName, dishName, notes, isVegan, isGlutenFree } = await req.json();
    console.log('Sending contribution confirmation emails for:', {
      contributorEmail,
      dishName
    });
    const MAILJET_API_KEY = Deno.env.get('MAILJET_API_KEY');
    const MAILJET_API_SECRET = Deno.env.get('MAILJET_API_SECRET');
    const MAILJET_FROM_EMAIL = Deno.env.get('MAILJET_FROM_EMAIL');
    const MAILJET_FROM_NAME = Deno.env.get('MAILJET_FROM_NAME');
    if (!MAILJET_API_KEY || !MAILJET_API_SECRET || !MAILJET_FROM_EMAIL || !MAILJET_FROM_NAME) {
      console.error('Missing Mailjet configuration');
      throw new Error('Email service not configured');
    }
    // Build dietary badges
    const dietaryBadges = [];
    if (isVegan) dietaryBadges.push('<span style="background: #10b981; color: white; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: 600;">🌱 VEGAN</span>');
    if (isGlutenFree) dietaryBadges.push('<span style="background: #f59e0b; color: white; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: 600;">🌾 GLUTEN-FREE</span>');
    const dietaryBadgesHtml = dietaryBadges.length > 0 ? `<div style="margin: 16px 0;">${dietaryBadges.join(' ')}</div>` : '';
    const notesHtml = notes ? `<p style="color: #6b7280; margin: 8px 0;"><strong>Notes:</strong> ${notes}</p>` : '';
    // Email to contributor
    const contributorEmailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #ff6b35 0%, #ff8c42 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🎃 Contribution Confirmed!</h1>
        </div>
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px;">
          <p style="font-size: 16px; margin-top: 0;">Hi ${contributorName},</p>
          <p>Thank you for contributing to the Twisted Tale Feast! Your dish has been successfully added:</p>
          <div style="background: white; padding: 20px; border-left: 4px solid #ff6b35; margin: 20px 0; border-radius: 4px;">
            <h2 style="margin: 0 0 12px 0; color: #ff6b35; font-size: 20px;">📌 ${dishName}</h2>
            ${dietaryBadgesHtml}
            ${notesHtml}
          </div>
          <p>We're excited to have your dish at the feast! See you at the event.</p>
          <p style="margin-top: 30px; color: #6b7280; font-size: 14px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
            <strong>The Twisted Hearth Foundation Team</strong><br>
            This is an automated confirmation. Please do not reply to this email.
          </p>
        </div>
      </body>
      </html>
    `;
    // Email to admin
    const adminEmailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #1f2937; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">🔔 New Feast Contribution</h1>
        </div>
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px;">
          <p style="font-size: 16px; margin-top: 0;"><strong>New contribution added to the feast!</strong></p>
          <div style="background: white; padding: 20px; border-left: 4px solid #1f2937; margin: 20px 0; border-radius: 4px;">
            <h2 style="margin: 0 0 12px 0; color: #1f2937; font-size: 20px;">📌 ${dishName}</h2>
            ${dietaryBadgesHtml}
            ${notesHtml}
            <p style="margin: 16px 0 0 0; padding-top: 16px; border-top: 1px solid #e5e7eb;">
              <strong>Contributor:</strong> ${contributorName} (${contributorEmail})
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
    // Prepare Mailjet request
    const mailjetPayload = {
      Messages: [
        {
          From: {
            Email: MAILJET_FROM_EMAIL,
            Name: MAILJET_FROM_NAME
          },
          To: [
            {
              Email: contributorEmail,
              Name: contributorName
            }
          ],
          Subject: `🎃 Your Feast Contribution: ${dishName}`,
          HTMLPart: contributorEmailHtml
        },
        {
          From: {
            Email: MAILJET_FROM_EMAIL,
            Name: MAILJET_FROM_NAME
          },
          To: [
            {
              Email: MAILJET_FROM_EMAIL,
              Name: 'Admin'
            }
          ],
          Subject: `🔔 New Feast Contribution: ${dishName}`,
          HTMLPart: adminEmailHtml
        }
      ]
    };
    const mailjetResponse = await fetch('https://api.mailjet.com/v3.1/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + btoa(`${MAILJET_API_KEY}:${MAILJET_API_SECRET}`)
      },
      body: JSON.stringify(mailjetPayload)
    });
    if (!mailjetResponse.ok) {
      const errorText = await mailjetResponse.text();
      console.error('Mailjet API error:', errorText);
      throw new Error(`Mailjet API error: ${mailjetResponse.status}`);
    }
    const result = await mailjetResponse.json();
    console.log('Emails sent successfully:', result);
    return new Response(JSON.stringify({
      success: true,
      message: 'Confirmation emails sent'
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  } catch (error) {
    console.error('Error in send-contribution-confirmation:', error);
    return new Response(JSON.stringify({
      error: error.message
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  }
};
serve(handler);

Details:
{A043C9F0-8815-44B8-9445-BE757C5262C3}.png

Endpoint URL:
https://dgdeiybuxlqbdfofzxpy.supabase.co/functions/v1/send-contribution-confirmation

Secrets:
{70516B57-71A7-44EB-8E91-D39454A2C41D}.png