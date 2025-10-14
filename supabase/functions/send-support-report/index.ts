import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SupportReportRequest {
  email: string;
  description: string;
  screenshotUrl?: string;
  userAgent?: string;
  browserLogs?: Array<{
    level: string;
    message: string;
    timestamp: string;
  }>;
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const payload: SupportReportRequest = await req.json();
    const { email, description, screenshotUrl, userAgent, browserLogs } = payload;

    // Validate required fields
    if (!email || !description) {
      return new Response(
        JSON.stringify({ error: "Email and description are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Insert support report into database
    const { data: report, error: dbError } = await supabase
      .from("support_reports")
      .insert({
        email,
        description,
        screenshot_url: screenshotUrl,
        user_agent: userAgent,
        browser_logs: browserLogs,
        status: "open",
      })
      .select()
      .single();

    if (dbError) throw dbError;

    // Prepare Mailjet email data
    const mailjetApiKey = Deno.env.get("MAILJET_API_KEY");
    const mailjetApiSecret = Deno.env.get("MAILJET_API_SECRET");
    const fromEmail = Deno.env.get("MAILJET_FROM_EMAIL");
    const fromName = Deno.env.get("MAILJET_FROM_NAME");

    if (!mailjetApiKey || !mailjetApiSecret || !fromEmail || !fromName) {
      throw new Error("Mailjet configuration missing");
    }

    // Format console logs for email
    const formattedLogs = browserLogs
      ?.map(log => `[${log.timestamp}] [${log.level.toUpperCase()}] ${log.message}`)
      .join("\n") || "No console logs captured";

    // 1. Send confirmation email to user
    const userEmailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #FF6B00 0%, #8B2500 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            .emoji { font-size: 24px; }
            .report-id { background: #fff; padding: 10px; border-left: 4px solid #FF6B00; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="emoji">🎃</div>
              <h1>We've Got Your Back, Brave Soul!</h1>
            </div>
            <div class="content">
              <p>Thanks for reaching out, ghost hunter! 👻</p>
              
              <p>Your spooky issue has been logged in our haunted registry. Our tech wizards are brewing up a fix faster than you can say "Boo!"</p>
              
              <div class="report-id">
                <strong>Your Report ID:</strong> ${report.id}
              </div>
              
              <p>We'll haunt your inbox with updates soon. In the meantime, don't let the login gremlins get you down! 🧙‍♀️</p>
              
              <p>If you need to reach us directly, reply to this email or contact us at fso@data-warrior.com</p>
            </div>
            <div class="footer">
              <p>— The Twisted Tech Team</p>
              <p>Twisted Hearth Foundation</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // 2. Send alert email to admin
    const adminEmailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: monospace; line-height: 1.6; color: #333; }
            .container { max-width: 800px; margin: 0 auto; padding: 20px; }
            .alert { background: #ff4444; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
            .section { background: #f9f9f9; padding: 20px; margin-bottom: 15px; border-left: 4px solid #ff4444; }
            .label { font-weight: bold; color: #666; }
            .logs { background: #1e1e1e; color: #00ff00; padding: 15px; border-radius: 4px; overflow-x: auto; }
            pre { margin: 0; white-space: pre-wrap; word-wrap: break-word; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="alert">
              <h1>🚨 HIGH PRIORITY: User Login Issue Report</h1>
            </div>
            
            <div class="section">
              <p><span class="label">📧 User Email:</span> ${email}</p>
              <p><span class="label">🕐 Reported At:</span> ${new Date().toLocaleString()}</p>
              <p><span class="label">🆔 Report ID:</span> ${report.id}</p>
            </div>
            
            <div class="section">
              <p class="label">📝 Description:</p>
              <p>${description}</p>
            </div>
            
            ${screenshotUrl ? `
            <div class="section">
              <p class="label">📸 Screenshot:</p>
              <p><a href="${screenshotUrl}" target="_blank">View Screenshot</a></p>
            </div>
            ` : ''}
            
            ${userAgent ? `
            <div class="section">
              <p class="label">🖥️ User Agent:</p>
              <p style="font-size: 11px;">${userAgent}</p>
            </div>
            ` : ''}
            
            <div class="section">
              <p class="label">📋 Recent Console Logs:</p>
              <div class="logs">
                <pre>${formattedLogs}</pre>
              </div>
            </div>
            
            <div class="section">
              <p><strong>⚡ Action Required:</strong> Investigate and respond within 24 hours.</p>
              <p>Access the admin dashboard to update the report status and add notes.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Send both emails via Mailjet
    const mailjetAuth = btoa(`${mailjetApiKey}:${mailjetApiSecret}`);
    
    const emailPayload = {
      Messages: [
        {
          From: { Email: fromEmail, Name: fromName },
          To: [{ Email: email }],
          Subject: "🎃 We've Got Your Back, Brave Soul!",
          HTMLPart: userEmailHtml,
        },
        {
          From: { Email: fromEmail, Name: fromName },
          To: [{ Email: "fso@data-warrior.com" }],
          Subject: `🚨 HIGH PRIORITY: User Login Issue - ${email}`,
          HTMLPart: adminEmailHtml,
          Headers: {
            "X-Priority": "1",
            "X-MSMail-Priority": "High",
            "Importance": "high",
          },
        },
      ],
    };

    const mailjetResponse = await fetch("https://api.mailjet.com/v3.1/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${mailjetAuth}`,
      },
      body: JSON.stringify(emailPayload),
    });

    if (!mailjetResponse.ok) {
      const errorText = await mailjetResponse.text();
      console.error("Mailjet error:", errorText);
      throw new Error(`Failed to send emails: ${errorText}`);
    }

    console.log("Support report submitted and emails sent:", report.id);

    return new Response(
      JSON.stringify({ success: true, reportId: report.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in send-support-report:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
