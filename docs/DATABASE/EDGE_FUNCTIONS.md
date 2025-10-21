# Edge Functions - Twisted Hearth Foundation

## Overview
Supabase Edge Functions are serverless TypeScript functions that run on Deno runtime. They handle email communications, analytics processing, and system integrations.

## Function Directory Structure
```
supabase/functions/
├── _shared/
│   └── display-name.ts          # Shared utilities
├── daily-analytics-aggregation/
│   └── index.ts                 # Daily analytics processing
├── send-bulk-email/
│   └── index.ts                 # Bulk email campaigns
├── send-contribution-confirmation/
│   └── index.ts                 # Feast contribution emails
├── send-email-campaign/
│   └── index.ts                 # Advanced email campaigns
├── send-friend-invitation/
│   └── index.ts                 # Friend invitation system
├── send-notification-email/
│   └── index.ts                 # General notifications
├── send-rsvp-confirmation/
│   └── index.ts                 # RSVP confirmation emails
└── send-support-report/
    └── index.ts                 # Support ticket handling
```

## Function Details

### 1. send-rsvp-confirmation
**Purpose**: Sends RSVP confirmation emails with calendar invites

**Endpoint**: `POST /functions/v1/send-rsvp-confirmation`

**Input Schema**:
```typescript
{
  rsvpId: string;      // UUID of the RSVP
  email: string;       // Recipient email
  isUpdate?: boolean;  // Whether this is an update
}
```

**Features**:
- ✅ Calendar invite generation (.ics files)
- ✅ Admin notification emails
- ✅ Additional guests support
- ✅ Email tracking (email_sent_at)
- ✅ CORS handling for multiple domains

**Environment Variables**:
- `MAILJET_API_KEY` - Mailjet API key
- `MAILJET_API_SECRET` - Mailjet API secret
- `MAILJET_FROM_EMAIL` - Sender email
- `MAILJET_FROM_NAME` - Sender name
- `PRIVATE_EVENT_ADDRESS` - Event location
- `ALLOWED_ORIGINS` - CORS origins

### 2. send-contribution-confirmation
**Purpose**: Sends feast contribution confirmation emails

**Endpoint**: `POST /functions/v1/send-contribution-confirmation`

**Input Schema**:
```typescript
{
  contributorEmail: string;
  contributorName: string;
  dishName: string;
  notes?: string;
  isVegan: boolean;
  isGlutenFree: boolean;
}
```

**Features**:
- ✅ Dietary restriction badges
- ✅ Admin notifications
- ✅ Contribution tracking
- ✅ Email validation

### 3. send-email-campaign
**Purpose**: Advanced email campaign system with variable replacement

**Endpoint**: `POST /functions/v1/send-email-campaign`

**Input Schema**:
```typescript
{
  campaign_id: string;  // UUID of email campaign
}
```

**Features**:
- ✅ Variable replacement ({{name}}, {{email}}, etc.)
- ✅ Batch processing (50 emails per batch)
- ✅ Recipient filtering (all, rsvp_yes, rsvp_pending, custom)
- ✅ Delivery tracking
- ✅ Rate limiting (1 second between batches)
- ✅ Error handling and retry logic

**Supported Variables**:
- `{{name}}` - User display name
- `{{email}}` - User email
- `{{rsvp_status}}` - RSVP status
- `{{event_date}}` - Event date
- `{{event_time}}` - Event time
- `{{event_address}}` - Event address
- `{{num_guests}}` - Number of guests
- `{{dietary_restrictions}}` - Dietary restrictions
- `{{gallery_link}}` - Photo gallery link### 4. send-bulk-email
**Purpose**: Handles bulk email campaigns with recipient management

**Endpoint**: `POST /functions/v1/send-bulk-email`

**Input Schema**:
```typescript
{
  campaignId: string;  // UUID of email campaign
}
```

**Features**:
- ✅ Campaign status tracking
- ✅ Recipient count management
- ✅ Batch processing (50 emails per batch)
- ✅ Success/failure tracking
- ✅ Email send logging

### 5. send-support-report
**Purpose**: Handles support ticket submissions and notifications

**Endpoint**: `POST /functions/v1/send-support-report`

**Input Schema**:
```typescript
{
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
```

**Features**:
- ✅ User confirmation emails
- ✅ Admin alert emails
- ✅ Browser log capture
- ✅ Screenshot support
- ✅ Priority email headers
- ✅ Support ticket creation

### 6. daily-analytics-aggregation
**Purpose**: Processes daily analytics data aggregation

**Endpoint**: `POST /functions/v1/daily-analytics-aggregation`

**Query Parameters**:
- `date` (optional) - Target date for aggregation (defaults to yesterday)

**Features**:
- ✅ Daily data rollup
- ✅ Performance metrics calculation
- ✅ User activity aggregation
- ✅ Error handling

### 7. send-friend-invitation
**Purpose**: Sends friend invitation emails

**Endpoint**: `POST /functions/v1/send-friend-invitation`

**Features**:
- ✅ Invitation tracking
- ✅ Social sharing
- ✅ Event promotion

### 8. send-notification-email
**Purpose**: General notification system

**Endpoint**: `POST /functions/v1/send-notification-email`

**Features**:
- ✅ System notifications
- ✅ User alerts
- ✅ Event updates

## Shared Utilities

### display-name.ts
**Purpose**: Name handling utilities for email functions

**Functions**:
- `getDisplayName(data: UserNameData): string` - Gets display name with priority system
- `getFullName(data: UserNameData): string` - Gets full name for formal contexts

**Name Priority System**:
1. `display_name` (highest priority)
2. `first_name`
3. Legacy `name` field (first word)
4. Email username (before @)
5. 'Guest' (fallback)

## Configuration

### Supabase Configuration
All functions use these environment variables:
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key for admin operations

### Mailjet Configuration
Email functions require:
- `MAILJET_API_KEY` - Mailjet API key
- `MAILJET_API_SECRET` - Mailjet API secret
- `MAILJET_FROM_EMAIL` - Sender email address
- `MAILJET_FROM_NAME` - Sender display name

### CORS Configuration
- `ALLOWED_ORIGINS` - Comma-separated list of allowed origins
- Automatic support for `partytillyou.rip` and `lovable.app` domains

## Error Handling

### Common Error Patterns
1. **Validation Errors**: Zod schema validation failures
2. **Database Errors**: Supabase operation failures
3. **Email Errors**: Mailjet API failures
4. **Authentication Errors**: Missing or invalid credentials

### Error Response Format
```typescript
{
  error: string;
  details?: any;  // Additional error information
}
```

## Rate Limiting

### Email Functions
- **Batch Size**: 50 emails per batch (Mailjet limit)
- **Rate Limit**: 1 second delay between batches
- **Retry Logic**: Automatic retry for failed batches

### Analytics Functions
- **Processing Limit**: Daily aggregation only
- **Timeout**: 30 seconds maximum execution time

## Monitoring

### Logging
All functions include comprehensive logging:
- Request/response logging
- Error logging with stack traces
- Performance metrics
- Email delivery status

### Metrics
- Email send success/failure rates
- Function execution times
- Database query performance
- API response times