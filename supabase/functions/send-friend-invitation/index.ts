import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const MAILJET_API_KEY = Deno.env.get('MAILJET_API_KEY');
const MAILJET_API_SECRET = Deno.env.get('MAILJET_API_SECRET');
const MAILJET_FROM_EMAIL = Deno.env.get('MAILJET_FROM_EMAIL') || 'noreply@twistedtales.com';
const MAILJET_FROM_NAME = Deno.env.get('MAILJET_FROM_NAME') || 'Twisted Tales';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { inviterName, friendName, friendEmail, personalMessage, eventUrl } = await req.json();

    console.log('Sending friend invitation:', { inviterName, friendName, friendEmail });

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Georgia, serif; background-color: #0a0a0a; color: #e5e5e5; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: #1a1a1a; border: 2px solid #d4af37; border-radius: 8px; padding: 40px; }
          .header { text-align: center; margin-bottom: 30px; }
          .title { color: #d4af37; font-size: 32px; margin: 0; text-shadow: 0 0 10px rgba(212, 175, 55, 0.3); }
          .content { line-height: 1.6; font-size: 16px; }
          .message-box { background: rgba(139, 92, 246, 0.1); border-left: 4px solid #8b5cf6; padding: 15px; margin: 20px 0; border-radius: 4px; }
          .cta { text-align: center; margin: 30px 0; }
          .button { display: inline-block; background: #d4af37; color: #0a0a0a; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 18px; }
          .footer { text-align: center; margin-top: 30px; font-size: 14px; color: #888; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 class="title">🎃 You're Invited! 🎃</h1>
          </div>
          
          <div class="content">
            <p>Dear ${friendName},</p>
            
            <p><strong>${inviterName}</strong> has invited you to join them at the <strong>Twisted Tales Halloween Event</strong>!</p>
            
            ${personalMessage ? `
              <div class="message-box">
                <p style="margin: 0;"><em>"${personalMessage}"</em></p>
                <p style="margin: 10px 0 0 0; color: #d4af37; font-size: 14px;">— ${inviterName}</p>
              </div>
            ` : ''}
            
            <p>This isn't your typical Halloween party. Prepare yourself for an evening of twisted fairy tales, mysterious hunts, costume contests, and unforgettable memories.</p>
            
            <div class="cta">
              <a href="${eventUrl}/rsvp" class="button">RSVP Now</a>
            </div>
            
            <p>Don't miss out on the most anticipated Halloween event of the year!</p>
          </div>
          
          <div class="footer">
            <p>This invitation was sent by ${inviterName} through Twisted Tales</p>
            <p><a href="${eventUrl}" style="color: #d4af37;">Visit Event Website</a></p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailjetResponse = await fetch('https://api.mailjet.com/v3.1/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + btoa(`${MAILJET_API_KEY}:${MAILJET_API_SECRET}`),
      },
      body: JSON.stringify({
        Messages: [{
          From: {
            Email: MAILJET_FROM_EMAIL,
            Name: MAILJET_FROM_NAME,
          },
          To: [{
            Email: friendEmail,
            Name: friendName,
          }],
          Subject: `${inviterName} invited you to Twisted Tales! 🎃`,
          HTMLPart: htmlContent,
        }],
      }),
    });

    const result = await mailjetResponse.json();
    
    if (!mailjetResponse.ok) {
      console.error('Mailjet error:', result);
      throw new Error('Failed to send invitation email');
    }

    console.log('Invitation sent successfully');

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error sending invitation:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
