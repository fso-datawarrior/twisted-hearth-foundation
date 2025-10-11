# Mailjet Template Guide for Twisted Hearth Foundation

This guide explains how to use Mailjet for sending email campaigns through the admin dashboard.

## Overview

The Twisted Hearth Foundation email system uses Mailjet as the email service provider. All email campaigns are sent through Mailjet's API with proper tracking and delivery management.

## Email System Architecture

- **Templates**: Created and managed within the application
- **Campaigns**: Composed using templates and sent to recipient lists
- **Delivery**: Handled by Mailjet with automatic batching and rate limiting
- **Tracking**: Basic statistics (sent, delivered, bounced, failed)

## Setting Up Email Campaigns

### 1. Create an Email Template

1. Go to Admin Dashboard → Email (Settings menu)
2. Click "New Template"
3. Fill in:
   - **Template Name**: Internal reference (e.g., "Welcome Email")
   - **Subject Line**: Email subject (supports variables)
   - **Preview Text**: Short preview text shown in inbox
   - **HTML Content**: Full email body (supports variables)

### 2. Using Variables in Templates

You can insert dynamic content using double curly braces:

```html
<h1>Hello {{name}}!</h1>
<p>Your RSVP status is: {{rsvp_status}}</p>
<p>Event date: {{event_date}}</p>
```

**Available Variables**:
- `{{name}}` - Guest name
- `{{email}}` - Guest email address
- `{{rsvp_status}}` - RSVP status (confirmed, pending, etc.)
- `{{event_date}}` - Event date

### 3. Compose a Campaign

1. Click "New Campaign" in the Campaigns tab
2. Select a template
3. Choose recipient list:
   - **All Guests**: Everyone in the system
   - **Confirmed RSVPs**: Only confirmed attendees
   - **Pending RSVPs**: Only pending RSVPs
   - **Custom List**: Upload CSV or paste emails
4. Review recipient count
5. Send test email to yourself first
6. Send or schedule the campaign

## Rate Limiting & Best Practices

### Mailjet Free Tier Limits
- **500 emails/day** (free tier)
- Campaigns are automatically batched in groups of 50
- 1-second delay between batches to respect rate limits

### Best Practices
1. **Always send a test email first** before sending to all recipients
2. **Keep subject lines under 60 characters** for better open rates
3. **Write clear, mobile-friendly HTML** (most guests read on phones)
4. **Include an unsubscribe option** for compliance
5. **Don't send too frequently** - max once per week recommended

## Troubleshooting

### Campaign Status: Failed
- Check Mailjet dashboard for specific error messages
- Verify email addresses are valid
- Ensure HTML content is properly formatted
- Check that Mailjet API credentials are set correctly

### Low Delivery Rate
- Some emails may be marked as spam
- Encourage guests to whitelist your sender email
- Avoid spam trigger words in subject lines
- Keep email content relevant and valuable

### Test Email Not Received
- Check spam folder
- Verify your email in the admin system is correct
- Check Mailjet logs for delivery status

## Accessing Mailjet Dashboard

1. Visit: https://app.mailjet.com/
2. Log in with admin credentials
3. Check delivery statistics, bounce reports, and detailed logs

## Email Statistics

The system tracks:
- **Sent**: Total emails attempted
- **Delivered**: Successfully delivered emails
- **Bounced**: Invalid/unreachable addresses
- **Failed**: System errors during sending

## Security & Compliance

- All emails are sent through Mailjet's secure API
- API credentials stored as encrypted secrets
- Only admins can send email campaigns
- All campaign activity is logged for audit purposes

## Support

For issues with:
- **Email System**: Check edge function logs in Supabase
- **Mailjet Service**: Contact Mailjet support
- **Template Design**: Test in the preview pane before sending

## Example Email Template

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #1a1a1a; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background: white; }
    .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Twisted Hearth Foundation</h1>
    </div>
    <div class="content">
      <h2>Hello {{name}}!</h2>
      <p>We're excited to welcome you to our Twisted Tale event!</p>
      <p>Your RSVP status: <strong>{{rsvp_status}}</strong></p>
      <p>Event date: <strong>{{event_date}}</strong></p>
    </div>
    <div class="footer">
      <p>Twisted Hearth Foundation</p>
      <p>If you wish to unsubscribe, please reply to this email.</p>
    </div>
  </div>
</body>
</html>
```

## Rate Limit Monitoring

The edge function automatically handles rate limiting by:
1. Batching emails in groups of 50
2. Waiting 1 second between batches
3. Tracking send counts and failures
4. Updating campaign statistics in real-time

If you need to send more than 500 emails/day, consider upgrading your Mailjet plan.
