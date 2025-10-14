import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { getDisplayName } from '../_shared/display-name.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ContributionData {
  contributorEmail: string;
  contributorName: string;
  dishName: string;
  notes?: string;
  isVegan: boolean;
  isGlutenFree: boolean;
}

const ContributionSchema = z.object({
  contributorEmail: z.string().email(),
  contributorName: z.string().min(1).max(100),
  dishName: z.string().min(1).max(200),
  notes: z.string().max(500).optional(),
  isVegan: z.boolean(),
  isGlutenFree: z.boolean()
});

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const rawBody = await req.json();
    const validated = ContributionSchema.safeParse(rawBody);
    if (!validated.success) {
      console.error('Validation error:', validated.error);
      return new Response(
        JSON.stringify({ error: 'Invalid input', details: validated.error }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }
    const { contributorEmail, contributorName, dishName, notes, isVegan, isGlutenFree }: ContributionData = validated.data;

    // Use display name helper as safeguard
    const displayName = getDisplayName({
      name: contributorName,
      email: contributorEmail
    });

    console.log('Sending contribution confirmation emails for:', { contributorEmail, dishName, displayName });

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
          <p style="font-size: 16px; margin-top: 0;">Hi ${displayName},</p>
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
            Name: MAILJET_FROM_NAME,
          },
          To: [
            {
              Email: contributorEmail,
              Name: displayName,
            },
          ],
          Subject: `🎃 Your Feast Contribution: ${dishName}`,
          HTMLPart: contributorEmailHtml,
        },
        {
          From: {
            Email: MAILJET_FROM_EMAIL,
            Name: MAILJET_FROM_NAME,
          },
          To: [
            {
              Email: MAILJET_FROM_EMAIL,
              Name: 'Admin',
            },
          ],
          Subject: `🔔 New Feast Contribution: ${dishName}`,
          HTMLPart: adminEmailHtml,
        },
      ],
    };

    const mailjetResponse = await fetch('https://api.mailjet.com/v3.1/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + btoa(`${MAILJET_API_KEY}:${MAILJET_API_SECRET}`),
      },
      body: JSON.stringify(mailjetPayload),
    });

    if (!mailjetResponse.ok) {
      const errorText = await mailjetResponse.text();
      console.error('Mailjet API error:', errorText);
      throw new Error(`Mailjet API error: ${mailjetResponse.status}`);
    }

    const result = await mailjetResponse.json();
    console.log('Emails sent successfully:', result);

    return new Response(
      JSON.stringify({ success: true, message: 'Confirmation emails sent' }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error('Error in send-contribution-confirmation:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);
