# Mailjet Template Guide

This guide covers how to use Mailjet for email campaigns in the Twisted Tale application.

## Table of Contents
- [Accessing Mailjet Dashboard](#accessing-mailjet-dashboard)
- [Email Template Variables](#email-template-variables)
- [Creating Templates](#creating-templates)
- [Testing Templates](#testing-templates)
- [Best Practices](#best-practices)
- [Compliance & Legal](#compliance--legal)

## Accessing Mailjet Dashboard

1. Log in to your Mailjet account at [https://app.mailjet.com](https://app.mailjet.com)
2. Navigate to **Templates** in the left sidebar
3. View campaign statistics under **Statistics** > **Campaign Statistics**
4. Manage API keys under **Account Settings** > **API Key Management**

### Required Configuration

Ensure the following environment variables are set in your Supabase Edge Function secrets:

- `MAILJET_API_KEY` - Your Mailjet API key
- `MAILJET_API_SECRET` - Your Mailjet API secret
- `MAILJET_FROM_EMAIL` - Verified sender email address
- `MAILJET_FROM_NAME` - Display name for sender

## Email Template Variables

The application supports the following template variables that will be automatically replaced with recipient data:

| Variable | Description | Example Value |
|----------|-------------|---------------|
| `{{name}}` | Recipient's full name | "John Doe" |
| `{{email}}` | Recipient's email address | "guest@example.com" |
| `{{rsvp_status}}` | Current RSVP status | "confirmed", "pending" |
| `{{event_date}}` | Event date | "November 1st, 2025" |
| `{{event_time}}` | Event start time | "6:30 PM" |
| `{{event_address}}` | Event location | "Denver, Colorado" |
| `{{costume_idea}}` | Guest's costume concept | "Little Red Riding Hood" |
| `{{num_guests}}` | Number of guests attending | "2" |
| `{{dietary_restrictions}}` | Dietary preferences/restrictions | "Vegetarian, Nut allergy" |
| `{{gallery_link}}` | Link to photo gallery | "https://twisted-tale.lovable.app/gallery" |

### Using Variables in Templates

Include variables in your HTML content using double curly braces:

```html
<h1>Hello {{name}}!</h1>
<p>Thank you for your RSVP! Your status is: <strong>{{rsvp_status}}</strong></p>
<p>We're looking forward to seeing you on {{event_date}} at {{event_time}}.</p>
```

## Creating Templates

### 1. Using the Template Editor

1. Navigate to **Admin Dashboard** > **Email Communication** > **Templates** tab
2. Click **"New Template"**
3. Fill in template details:
   - **Template Name**: Internal reference name (e.g., "RSVP Confirmation")
   - **Subject Line**: Email subject (can include variables)
   - **Preview Text**: Text shown in email previews
   - **HTML Content**: Full email HTML

4. Click **"Show Preview"** to see live rendering
5. Switch between **Desktop** and **Mobile** preview modes
6. Click **"Save Template"**

### 2. Template Structure

Recommended HTML structure for email templates:

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{subject}}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: #8B5CF6;
      color: white;
      padding: 20px;
      text-align: center;
    }
    .content {
      padding: 30px 20px;
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      background: #8B5CF6;
      color: white;
      text-decoration: none;
      border-radius: 6px;
      margin: 20px 0;
    }
    .footer {
      text-align: center;
      font-size: 12px;
      color: #666;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Twisted Tale Halloween Party</h1>
  </div>
  
  <div class="content">
    <h2>Hello {{name}}!</h2>
    <p>Your content goes here...</p>
    
    <a href="{{gallery_link}}" class="button">View Gallery</a>
  </div>
  
  <div class="footer">
    <p>Event Date: {{event_date}} at {{event_time}}</p>
    <p>Location: {{event_address}}</p>
    <p><a href="[unsubscribe_link]">Unsubscribe</a></p>
  </div>
</body>
</html>
```

### 3. Mobile-Responsive Design

Always use responsive design principles:

```css
@media only screen and (max-width: 600px) {
  body {
    padding: 10px !important;
  }
  .content {
    padding: 15px 10px !important;
  }
  h1 {
    font-size: 24px !important;
  }
  .button {
    display: block !important;
    width: 100% !important;
    text-align: center !important;
  }
}
```

## Testing Templates

### 1. Send Test Email

Before sending to all guests:

1. Complete campaign setup
2. Click **"Send Test Email"** button
3. Test email will be sent to your logged-in admin email
4. Verify:
   - Subject line renders correctly
   - All variables are replaced with sample data
   - Links work properly
   - Images load correctly
   - Layout displays properly on mobile and desktop

### 2. Test Recipient Lists

When creating a campaign, test with small recipient lists first:

1. Use **"Custom List"** recipient option
2. Add 2-3 test email addresses
3. Send campaign and verify delivery
4. Check spam folders
5. Verify all content renders correctly

### 3. Preview Modes

Use the template editor's preview modes:

- **Rendered**: See how the email will look to recipients
- **HTML**: Review the raw HTML code
- **Desktop**: Preview on desktop email clients (600px width)
- **Mobile**: Preview on mobile devices (375px width)

## Best Practices

### Email Design

1. **Keep it Simple**: Use clear, concise content
2. **Single Column Layout**: Works best across email clients
3. **Clear Call-to-Action**: Make buttons/links obvious
4. **Use Inline CSS**: Email clients strip `<style>` tags
5. **Alt Text for Images**: Always include descriptive alt text
6. **Test Across Clients**: Gmail, Outlook, Apple Mail, etc.

### Content Guidelines

1. **Personalization**: Use `{{name}}` to address recipients
2. **Clear Subject Lines**: 50 characters or less
3. **Preview Text**: 90-100 characters, complements subject
4. **Responsive Design**: Test on mobile devices
5. **Accessible**: Good contrast, readable fonts (14px+)

### Sending Strategy

1. **Start Small**: Test with 5-10 recipients first
2. **Rate Limiting**: System enforces 500 emails/hour via Mailjet
3. **Monitor Stats**: Check delivery, bounce, and failure rates
4. **Time Zone Awareness**: Schedule sends for optimal engagement
5. **Avoid Spam Triggers**: No ALL CAPS, excessive punctuation!!!

### Image Hosting

- Host images on reliable CDN (Supabase Storage)
- Use full URLs (not relative paths)
- Keep images optimized (< 1MB each)
- Provide alt text for accessibility

## Compliance & Legal

### GDPR & Privacy

1. **Consent**: Only email users who have explicitly opted in
2. **Unsubscribe Link**: Required in all marketing emails
3. **Privacy Policy**: Link to your privacy policy
4. **Data Protection**: Handle personal data responsibly

### CAN-SPAM Act (US)

1. **Physical Address**: Include in footer
2. **Clear Identification**: Show who the email is from
3. **Honest Subject Lines**: No deceptive subjects
4. **Opt-Out Option**: Honor unsubscribe requests within 10 days
5. **Monitor Compliance**: You're responsible even if outsourced

### CASL (Canada)

1. **Express Consent**: Required for commercial emails
2. **Identification**: Clearly identify sender
3. **Contact Information**: Provide valid contact details
4. **Unsubscribe Mechanism**: Simple and free to use

### Example Footer with Compliance

```html
<div class="footer">
  <p>Twisted Tale Halloween Party</p>
  <p>Denver, Colorado, USA</p>
  <p><a href="https://twisted-tale.lovable.app/privacy">Privacy Policy</a></p>
  <p><a href="[unsubscribe_link]">Unsubscribe</a></p>
  <p style="font-size: 11px; color: #999;">
    You received this email because you RSVP'd to the Twisted Tale event.
  </p>
</div>
```

## Troubleshooting

### Emails Not Sending

1. Verify Mailjet credentials in Supabase secrets
2. Check sender email is verified in Mailjet
3. Review Edge Function logs for errors
4. Ensure recipient list has valid email addresses

### Variable Not Replacing

1. Use exact variable names: `{{name}}` not `{{Name}}`
2. Check variable spelling matches database field
3. Ensure variables are in double curly braces
4. Test with known good data first

### High Bounce Rate

1. Verify email addresses are valid
2. Check sender reputation in Mailjet dashboard
3. Review email content for spam triggers
4. Ensure SPF/DKIM records are configured

### Emails Going to Spam

1. Use verified sender domain
2. Avoid spam trigger words
3. Balance text/image ratio
4. Include physical address
5. Provide clear unsubscribe option
6. Build sender reputation gradually

## Support Resources

- **Mailjet Documentation**: [https://dev.mailjet.com](https://dev.mailjet.com)
- **Email on Acid**: Test emails across clients
- **Litmus**: Email testing and analytics
- **Can I Email**: HTML/CSS support across email clients
- **Supabase Edge Functions**: [https://supabase.com/docs/guides/functions](https://supabase.com/docs/guides/functions)

## Campaign Workflow

1. **Create Template**: Design and save reusable template
2. **Test Template**: Send test email to yourself
3. **Create Campaign**: Select template and recipients
4. **Review**: Check recipient count and subject
5. **Send Test**: Send to small test group
6. **Monitor**: Check delivery stats in Admin Dashboard
7. **Send Campaign**: Send to full recipient list
8. **Analyze**: Review statistics and engagement

## Rate Limits

The application enforces the following limits:

- **Batch Size**: 50 emails per batch
- **Rate Limit**: 500 emails per hour (Mailjet free tier)
- **Delay Between Batches**: 1 second
- **Daily Limit**: 200 emails/day (Mailjet free tier)

Upgrade your Mailjet plan for higher limits.
