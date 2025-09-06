// Deno runtime (Supabase Edge Functions)
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

type Payload = {
  rsvpId: string;
  name: string;
  email: string;
  guests: number;
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MJ_API = Deno.env.get("MAILJET_API_KEY")!;
const MJ_SECRET = Deno.env.get("MAILJET_API_SECRET")!;
const FROM_EMAIL = Deno.env.get("MAILJET_FROM_EMAIL")!;
const FROM_NAME = Deno.env.get("MAILJET_FROM_NAME") ?? "Jamie & Kat Ruth";
const PRIVATE_ADDRESS = Deno.env.get("PRIVATE_EVENT_ADDRESS") ?? "Location provided after RSVP.";

function mjAuth() {
  const token = btoa(`${MJ_API}:${MJ_SECRET}`);
  return { Authorization: `Basic ${token}` };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { 
      status: 405, 
      headers: corsHeaders 
    });
  }

  let body: Payload;
  try { 
    body = await req.json(); 
  } catch { 
    return new Response("Bad Request", { 
      status: 400, 
      headers: corsHeaders 
    }); 
  }

  console.log("Sending RSVP confirmation email:", { rsvpId: body.rsvpId, email: body.email, guests: body.guests });

  const subject = "Your RSVP is received — Twisted Fairytale Bash";
  const text = `Hi ${body.name},

We have your RSVP for ${body.guests} ${body.guests > 1 ? "guests" : "guest"}.

Date: Saturday, October 18, 2025 — 7:00 PM
Where: ${PRIVATE_ADDRESS}

This address is private. Please don't share it publicly.

Get ready for a night where beloved fairytales meet contemporary darkness. Come prepared in costume - the more twisted, the better!

— Jamie & Kat Ruth`;

  const html = `
  <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
    <h2 style="margin:0 0 16px 0; color: #3B1F4A;">Your RSVP is received</h2>
    <p>Hi ${body.name},</p>
    <p>We have your RSVP for <strong>${body.guests}</strong> ${body.guests > 1 ? "guests" : "guest"}.</p>
    
    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <p style="margin: 0 0 8px 0;"><strong>Date:</strong> Saturday, October 18, 2025 — 7:00 PM</p>
      <p style="margin: 0;"><strong>Where:</strong> ${PRIVATE_ADDRESS}</p>
    </div>
    
    <p style="opacity: 0.8; font-size: 14px;">This address is private. Please don't share it publicly.</p>
    
    <p>Get ready for a night where beloved fairytales meet contemporary darkness. Come prepared in costume - the more twisted, the better!</p>
    
    <p style="margin-top: 30px;">— Jamie &amp; Kat Ruth</p>
  </div>`;

  try {
    const res = await fetch("https://api.mailjet.com/v3.1/send", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...mjAuth() },
      body: JSON.stringify({
        Messages: [
          {
            From: { Email: FROM_EMAIL, Name: FROM_NAME },
            To: [{ Email: body.email, Name: body.name }],
            Subject: subject,
            TextPart: text,
            HTMLPart: html,
            CustomID: body.rsvpId
          }
        ]
      })
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Mailjet API error:", { status: res.status, error: errorText });
      return new Response("Email send failed", { 
        status: 500, 
        headers: corsHeaders 
      });
    }

    const result = await res.json();
    console.log("Email sent successfully:", result);
    
    return new Response("ok", { 
      status: 200, 
      headers: corsHeaders 
    });
  } catch (error) {
    console.error("Mailjet error:", error);
    return new Response("Email send failed", { 
      status: 500, 
      headers: corsHeaders 
    });
  }
});