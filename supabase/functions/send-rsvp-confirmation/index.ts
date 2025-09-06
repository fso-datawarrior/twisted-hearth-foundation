import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

type Payload = { rsvpId: string; name: string; email: string; guests: number };

const MJ_API = Deno.env.get("MAILJET_API_KEY")!;
const MJ_SECRET = Deno.env.get("MAILJET_API_SECRET")!;
const FROM_EMAIL = Deno.env.get("MAILJET_FROM_EMAIL")!;
const FROM_NAME = Deno.env.get("MAILJET_FROM_NAME") ?? "Jamie & Kat Ruth";
const PRIVATE_ADDRESS = Deno.env.get("PRIVATE_EVENT_ADDRESS") ?? "Location provided after RSVP.";
const ALLOWED = (Deno.env.get("ALLOWED_ORIGINS") ?? "").split(",").map(s => s.trim()).filter(Boolean);

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
  return {
    "Access-Control-Allow-Origin": allowed ? origin : "https://partytillyou.rip",
    "Vary": "Origin",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "authorization, content-type",
  };
}

serve(async (req) => {
  const origin = req.headers.get("origin");
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors(origin) });
  if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405, headers: cors(origin) });

  let body: Payload;
  try { body = await req.json(); } catch { return new Response("Bad Request", { status: 400, headers: cors(origin) }); }

  const subject = "Your RSVP is received — Twisted Fairytale Bash";
  const text = `Hi ${body.name},

We have your RSVP for ${body.guests} ${body.guests > 1 ? "guests" : "guest"}.
Date: Saturday, October 18, 2025 — 7:00 PM
Where: ${PRIVATE_ADDRESS}

This address is private. Please don't share it publicly.

— Jamie & Kat Ruth`;

  const html = `
  <h2 style="margin:0 0 8px 0;">Your RSVP is received</h2>
  <p>Hi ${body.name},</p>
  <p>We have your RSVP for <strong>${body.guests}</strong> ${body.guests > 1 ? "guests" : "guest"}.</p>
  <p><strong>Date:</strong> Saturday, October 18, 2025 — 7:00 PM</p>
  <p><strong>Where:</strong> ${PRIVATE_ADDRESS}</p>
  <p style="opacity:.8">This address is private. Please don't share it publicly.</p>
  <p>— Jamie &amp; Kat Ruth</p>`;

  const res = await fetch("https://api.mailjet.com/v3.1/send", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...mjAuth() },
    body: JSON.stringify({
      Messages: [{
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
      }]
    })
  });

  if (!res.ok) return new Response("Email send failed", { status: 502, headers: cors(origin) });
  return new Response("ok", { status: 200, headers: cors(origin) });
});