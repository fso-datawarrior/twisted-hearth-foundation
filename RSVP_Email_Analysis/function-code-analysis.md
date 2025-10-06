# Edge Function Code Analysis

## Function 1: send-rsvp-confirmation

### Endpoint
`https://dgdeiybuxlqbdfofzxpy.supabase.co/functions/v1/send-rsvp-confirmation`

### Code Analysis

#### Environment Variables Used
```typescript
const MJ_API = Deno.env.get("MAILJET_API_KEY");
const MJ_SECRET = Deno.env.get("MAILJET_API_SECRET");
const FROM_EMAIL = Deno.env.get("MAILJET_FROM_EMAIL");
const FROM_NAME = Deno.env.get("MAILJET_FROM_NAME") ?? "Jamie & Kat Ruth";
const ADMIN_EMAIL = FROM_EMAIL;
const PRIVATE_ADDRESS = Deno.env.get("PRIVATE_EVENT_ADDRESS") ?? "Location provided after RSVP.";
const ALLOWED = (Deno.env.get("ALLOWED_ORIGINS") ?? "").split(",").map(s => s.trim()).filter(Boolean);
```

#### Critical Issues Found

1. **Missing Environment Variable Validation**
   - Uses `Deno.env.get()` without validation
   - No null checks before using variables
   - Could cause runtime errors if variables are undefined

2. **Missing Database Update**
   - Function sends emails successfully
   - **NEVER updates database** with `email_sent_at` timestamp
   - No tracking of email delivery status

3. **CORS Configuration**
   - Uses `ALLOWED_ORIGINS` environment variable
   - Falls back to `"https://partytillyou.rip"` if not set
   - May block requests from other domains

#### Email Content Generation
- **User Email**: Confirmation with event details and calendar attachment
- **Admin Email**: Notification with RSVP details
- **Calendar Attachment**: ICS file with event details
- **HTML/Text**: Both formats provided

#### Mailjet API Integration
```typescript
const res = await fetch("https://api.mailjet.com/v3.1/send", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    ...mjAuth()
  },
  body: JSON.stringify({ Messages: messages })
});
```

#### Error Handling
```typescript
if (!res.ok) {
  const errorText = await res.text();
  console.error('Mailjet API error:', errorText);
  return new Response("Email send failed", { status: 502, headers: cors(origin) });
}
```

## Function 2: send-contribution-confirmation

### Endpoint
`https://dgdeiybuxlqbdfofzxpy.supabase.co/functions/v1/send-contribution-confirmation`

### Code Analysis

#### Environment Variables Used
```typescript
const MAILJET_API_KEY = Deno.env.get('MAILJET_API_KEY');
const MAILJET_API_SECRET = Deno.env.get('MAILJET_API_SECRET');
const MAILJET_FROM_EMAIL = Deno.env.get('MAILJET_FROM_EMAIL');
const MAILJET_FROM_NAME = Deno.env.get('MAILJET_FROM_NAME');
```

#### Better Error Handling
```typescript
if (!MAILJET_API_KEY || !MAILJET_API_SECRET || !MAILJET_FROM_EMAIL || !MAILJET_FROM_NAME) {
  console.error('Missing Mailjet configuration');
  throw new Error('Email service not configured');
}
```

#### CORS Configuration
```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};
```

## Code Comparison

### RSVP Function Issues
1. **No environment variable validation**
2. **No database tracking**
3. **Inconsistent CORS handling**
4. **Missing error details**

### Contribution Function Strengths
1. **Proper environment variable validation**
2. **Better error handling**
3. **Consistent CORS headers**
4. **More detailed error responses**

## Recommendations

### Immediate Fixes for RSVP Function
1. **Add environment variable validation**:
```typescript
if (!MJ_API || !MJ_SECRET || !FROM_EMAIL) {
  console.error('Missing Mailjet configuration');
  throw new Error('Email service not configured');
}
```

2. **Add database update after successful email**:
```typescript
// After successful email send
if (res.ok) {
  // Update database to track email sent
  // This requires Supabase client setup
}
```

3. **Improve error handling**:
```typescript
if (!res.ok) {
  const errorText = await res.text();
  console.error('Mailjet API error:', errorText);
  return new Response(JSON.stringify({ 
    error: 'Email send failed', 
    details: errorText 
  }), { 
    status: 502, 
    headers: { ...cors(origin), 'Content-Type': 'application/json' }
  });
}
```

### Long-term Improvements
1. **Unify error handling** between both functions
2. **Add database tracking** for email status
3. **Implement retry logic** for failed emails
4. **Add comprehensive logging** for debugging
5. **Create email queue system** for reliability

## Function Execution Flow

### RSVP Function Flow
1. Receive POST request with RSVP data
2. Validate request method and CORS
3. Parse request body
4. Generate email content (user + admin)
5. Send emails via Mailjet API
6. Return success/error response
7. **MISSING**: Update database with email status

### Contribution Function Flow
1. Receive POST request with contribution data
2. Validate request method and CORS
3. Parse request body
4. Validate environment variables
5. Generate email content (contributor + admin)
6. Send emails via Mailjet API
7. Return success/error response
8. **MISSING**: Update database with email status

## Critical Missing Features

### Both Functions Missing
1. **Database email tracking** - No `email_sent_at` updates
2. **Retry mechanism** - No retry for failed emails
3. **Email status monitoring** - No way to track delivery
4. **Comprehensive logging** - Limited debugging information
5. **Rate limiting** - No protection against abuse
