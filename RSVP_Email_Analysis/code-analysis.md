# RSVP Email System - Code Analysis

## Frontend Code (src/pages/RSVP.tsx)

### RSVP Submission Flow
The RSVP form handles two scenarios:
1. **New RSVP Creation** (lines 305-375)
2. **Existing RSVP Update** (lines 239-303)

### Email Invocation Points

#### 1. New RSVP Email (lines 340-354)
```typescript
// Send confirmation email
try {
  await supabase.functions.invoke("send-rsvp-confirmation", {
    body: {
      rsvpId: data.id,
      name: formData.name,
      email: formData.email,
      guests: formData.guestCount,
      isUpdate: false,
      additionalGuests: formData.guestCount > 1 ? additionalGuests : [],
    },
  });
} catch (emailErr) {
  console.warn("Email function error:", emailErr);
}
```

#### 2. RSVP Update Email (lines 281-295)
```typescript
// Send update notification emails
try {
  await supabase.functions.invoke("send-rsvp-confirmation", {
    body: {
      rsvpId: existingRsvp.id,
      name: formData.name,
      email: formData.email,
      guests: formData.guestCount,
      isUpdate: true,
      additionalGuests: formData.guestCount > 1 ? additionalGuests : [],
    },
  });
} catch (emailErr) {
  console.warn("Email function error:", emailErr);
}
```

### Error Handling Issues
- **Silent Failures**: Email errors only log warnings, no user feedback
- **No Retry Logic**: Failed emails are not retried
- **No Status Tracking**: No way to know if email was sent successfully

## Backend Code (supabase/functions/send-rsvp-confirmation/index.ts)

### Function Structure
- **Entry Point**: `serve()` function handles HTTP requests
- **Email Service**: Uses Mailjet API for sending emails
- **CORS**: Configured for specific origins
- **Authentication**: Uses environment variables for Mailjet credentials

### Critical Issues Found

#### 1. Missing Database Update
```typescript
// After successful email send (lines 184-187)
const result = await res.json();
console.log('Emails sent successfully:', result);
// ❌ MISSING: No database update to track email_sent_at
return new Response("ok", { status: 200, headers: cors(origin) });
```

#### 2. Environment Variable Validation
```typescript
// Lines 17-20 - Uses non-null assertion without validation
const MJ_API = Deno.env.get("MAILJET_API_KEY")!;  // ❌ Could be undefined
const MJ_SECRET = Deno.env.get("MAILJET_API_SECRET")!;
const FROM_EMAIL = Deno.env.get("MAILJET_FROM_EMAIL")!;
```

#### 3. Error Response Handling
```typescript
// Lines 178-182 - Basic error handling
if (!res.ok) {
  const errorText = await res.text();
  console.error('Mailjet API error:', errorText);
  return new Response("Email send failed", { status: 502, headers: cors(origin) });
}
```

### Email Content Generation
- **User Email**: Confirmation with event details and calendar attachment
- **Admin Email**: Notification with RSVP details
- **HTML/Text**: Both formats provided
- **Calendar**: ICS attachment included

### Required Environment Variables
- `MAILJET_API_KEY`
- `MAILJET_API_SECRET`
- `MAILJET_FROM_EMAIL`
- `MAILJET_FROM_NAME`
- `PRIVATE_EVENT_ADDRESS`
- `ALLOWED_ORIGINS`

## Contribution Email System (supabase/functions/send-contribution-confirmation/index.ts)

### Similar Structure
- Uses same Mailjet configuration
- Sends emails for feast contributions
- Has proper environment variable validation (lines 32-35)

### Better Error Handling
```typescript
if (!MAILJET_API_KEY || !MAILJET_API_SECRET || !MAILJET_FROM_EMAIL || !MAILJET_FROM_NAME) {
  console.error('Missing Mailjet configuration');
  throw new Error('Email service not configured');
}
```

## Code Quality Issues

### 1. Inconsistent Error Handling
- RSVP function: Silent failures
- Contribution function: Proper validation

### 2. Missing Observability
- No database tracking of email status
- Limited logging for debugging

### 3. No Retry Mechanism
- Failed emails are not retried
- No queue system for reliability

## Recommendations

### Immediate Fixes
1. Add environment variable validation to RSVP function
2. Update database with email_sent_at timestamp
3. Improve error handling and user feedback

### Long-term Improvements
1. Implement retry logic
2. Add email status tracking
3. Create admin dashboard for email monitoring
4. Add comprehensive logging
