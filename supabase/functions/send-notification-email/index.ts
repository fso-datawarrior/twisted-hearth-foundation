import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.58.0";

const MAILJET_API_KEY = Deno.env.get("MAILJET_API_KEY");
const MAILJET_API_SECRET = Deno.env.get("MAILJET_API_SECRET");
const MAILJET_FROM_EMAIL = Deno.env.get("MAILJET_FROM_EMAIL");
const MAILJET_FROM_NAME = Deno.env.get("MAILJET_FROM_NAME") || "Twisted Hearth Foundation";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationEmailRequest {
  notificationId: string;
  userId: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { notificationId, userId }: NotificationEmailRequest = await req.json();

    if (!notificationId || !userId) {
      return new Response(
        JSON.stringify({ error: "Missing notificationId or userId" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase admin client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Fetch notification details
    const { data: notification, error: notifError } = await supabase
      .from("notifications")
      .select("*")
      .eq("id", notificationId)
      .eq("user_id", userId)
      .single();

    if (notifError || !notification) {
      console.error("Notification fetch error:", notifError);
      return new Response(
        JSON.stringify({ error: "Notification not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch user email and preferences
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("email")
      .eq("id", userId)
      .single();

    if (profileError || !profile?.email) {
      console.error("Profile fetch error:", profileError);
      return new Response(
        JSON.stringify({ error: "User email not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch notification preferences
    const { data: preferences } = await supabase
      .from("notification_preferences")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    // Check if user wants email for this notification type
    const typePreferenceMap: Record<string, keyof typeof preferences> = {
      comment: "email_on_comment",
      reply: "email_on_reply",
      reaction: "email_on_reaction",
      rsvp_update: "email_on_rsvp_update",
      event_update: "email_on_event_update",
      admin_announcement: "email_on_admin_announcement",
    };

    const preferenceKey = typePreferenceMap[notification.type];
    if (preferences && preferenceKey && !preferences[preferenceKey]) {
      console.log(`User has disabled emails for ${notification.type}`);
      return new Response(
        JSON.stringify({ message: "User has disabled this notification type" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build email HTML
    const linkButton = notification.link
      ? `<div style="margin: 30px 0; text-align: center;">
           <a href="${notification.link}" style="display: inline-block; padding: 12px 30px; background-color: #D4AF37; color: #1a1a1a; text-decoration: none; border-radius: 6px; font-weight: bold;">
             View Details
           </a>
         </div>`
      : "";

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #1a1a1a; color: #e5e5e5;">
        <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <div style="background-color: #2a2a2a; border: 1px solid #8B5CF6; border-radius: 8px; padding: 30px;">
            <h1 style="color: #D4AF37; margin-top: 0; font-size: 24px;">${notification.title}</h1>
            <p style="color: #e5e5e5; font-size: 16px; line-height: 1.6;">
              ${notification.message}
            </p>
            ${linkButton}
            <hr style="border: none; border-top: 1px solid #444; margin: 30px 0;">
            <p style="color: #999; font-size: 14px; margin-bottom: 0;">
              You received this email because you're registered for the Twisted Hearth Foundation event.
            </p>
            <p style="color: #999; font-size: 14px; margin-top: 10px;">
              <a href="${SUPABASE_URL.replace('/rest/v1', '')}/settings" style="color: #D4AF37; text-decoration: none;">
                Manage your notification preferences
              </a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send email via Mailjet
    const mailjetAuth = btoa(`${MAILJET_API_KEY}:${MAILJET_API_SECRET}`);
    const mailjetResponse = await fetch("https://api.mailjet.com/v3.1/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${mailjetAuth}`,
      },
      body: JSON.stringify({
        Messages: [
          {
            From: {
              Email: MAILJET_FROM_EMAIL,
              Name: MAILJET_FROM_NAME,
            },
            To: [
              {
                Email: profile.email,
              },
            ],
            Subject: notification.title,
            HTMLPart: htmlContent,
          },
        ],
      }),
    });

    if (!mailjetResponse.ok) {
      const errorText = await mailjetResponse.text();
      console.error("Mailjet error:", errorText);
      throw new Error(`Mailjet API error: ${mailjetResponse.status}`);
    }

    const mailjetResult = await mailjetResponse.json();
    console.log("Email sent successfully:", mailjetResult);

    return new Response(
      JSON.stringify({ success: true, message: "Email sent successfully" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in send-notification-email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
