# Environment Variables - Twisted Hearth Foundation

## Overview
This document outlines all environment variables used in the Twisted Hearth Foundation system, including Supabase configuration, email services, and application settings.

## Supabase Configuration

### Core Supabase Variables
```bash
# Supabase Project Configuration
SUPABASE_URL=https://dgdeiybuxlqbdfofzxpy.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Purpose**: 
- `SUPABASE_URL` - Base URL for Supabase API calls
- `SUPABASE_ANON_KEY` - Public API key for client-side operations
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key for admin operations (Edge Functions)

**Security**: 
- Service role key bypasses RLS policies
- Only use in server-side contexts
- Never expose in client-side code

## Email Service Configuration

### Mailjet API Configuration
```bash
# Mailjet Email Service
MAILJET_API_KEY=your_mailjet_api_key
MAILJET_API_SECRET=your_mailjet_api_secret
MAILJET_FROM_EMAIL=noreply@partytillyou.rip
MAILJET_FROM_NAME="Jamie & Kat Ruth"
```

**Purpose**:
- `MAILJET_API_KEY` - Mailjet API authentication key
- `MAILJET_API_SECRET` - Mailjet API secret for authentication
- `MAILJET_FROM_EMAIL` - Default sender email address
- `MAILJET_FROM_NAME` - Default sender display name

**Usage**: Used by all email-related Edge Functions for sending transactional and campaign emails.

## Application Configuration

### CORS and Security
```bash
# CORS Configuration
ALLOWED_ORIGINS=https://partytillyou.rip,https://twisted-tale.lovable.app
```

**Purpose**:
- `ALLOWED_ORIGINS` - Comma-separated list of allowed CORS origins
- Automatically includes `partytillyou.rip` and `lovable.app` domains
- Used by Edge Functions for CORS handling

### Event Configuration
```bash
# Event Details
PRIVATE_EVENT_ADDRESS="1816 White Feather Drive, Longmont, Colorado 80504"
EVENT_TITLE="The Ruths' Twisted Fairytale Halloween Bash"
EVENT_START_ISO="2025-11-01T18:30:00-06:00"
EVENT_DURATION_MIN=240
```

**Purpose**:
- `PRIVATE_EVENT_ADDRESS` - Private event location (not shared publicly)
- `EVENT_TITLE` - Official event title
- `EVENT_START_ISO` - Event start time in ISO format
- `EVENT_DURATION_MIN` - Event duration in minutes

**Usage**: Used in email templates and calendar invite generation.

## Development vs Production

### Development Environment
```bash
# Development Settings
NODE_ENV=development
SUPABASE_URL=https://dgdeiybuxlqbdfofzxpy.supabase.co
ALLOWED_ORIGINS=http://localhost:3000,https://twisted-tale.lovable.app
```

### Production Environment
```bash
# Production Settings
NODE_ENV=production
SUPABASE_URL=https://dgdeiybuxlqbdfofzxpy.supabase.co
ALLOWED_ORIGINS=https://partytillyou.rip
```

## Edge Function Specific Variables

### Function Configuration
Each Edge Function can access these variables:
- All Supabase variables
- All Mailjet variables
- All application configuration variables
- Function-specific variables (if any)

### Function Environment Access
```typescript
// In Edge Functions
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const mailjetApiKey = Deno.env.get("MAILJET_API_KEY")!;
const allowedOrigins = Deno.env.get("ALLOWED_ORIGINS")?.split(",") || [];
```

## Security Considerations

### Sensitive Variables
**Never expose these in client-side code**:
- `SUPABASE_SERVICE_ROLE_KEY`
- `MAILJET_API_SECRET`
- `PRIVATE_EVENT_ADDRESS`

### Public Variables
**Safe for client-side use**:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `EVENT_TITLE`
- `EVENT_START_ISO`

### Variable Validation
All Edge Functions validate required environment variables:
```typescript
if (!MAILJET_API_KEY || !MAILJET_API_SECRET) {
  throw new Error('Email service not configured');
}
```

## Environment Setup

### Supabase Dashboard
1. Go to Project Settings → API
2. Copy the Project URL and API keys
3. Set up environment variables in your deployment platform

### Mailjet Setup
1. Create Mailjet account
2. Generate API key and secret
3. Configure sender email and name
4. Set up environment variables

### Deployment Platforms
- **Vercel**: Use Vercel dashboard environment variables
- **Netlify**: Use Netlify dashboard environment variables
- **Supabase**: Use Supabase dashboard secrets management

## Troubleshooting

### Common Issues
1. **Missing Variables**: Check all required variables are set
2. **Invalid Keys**: Verify API keys are correct and active
3. **CORS Errors**: Ensure origins are properly configured
4. **Email Failures**: Check Mailjet account limits and configuration

### Debugging
Enable debug logging in Edge Functions:
```typescript
console.log('Environment check:', {
  hasSupabaseUrl: !!Deno.env.get("SUPABASE_URL"),
  hasMailjetKey: !!Deno.env.get("MAILJET_API_KEY"),
  allowedOrigins: Deno.env.get("ALLOWED_ORIGINS")
});
```

## Backup and Recovery

### Variable Backup
Keep secure backups of:
- API keys and secrets
- Database connection strings
- Email service credentials

### Recovery Process
1. Restore environment variables
2. Verify API key validity
3. Test Edge Function connectivity
4. Validate email service functionality