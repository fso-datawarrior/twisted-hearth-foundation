# Missing Information - Collection Instructions

## Critical Information Needed

### 1. Supabase Dashboard Access
**What we need**: Current deployment status of functions and database

**How to gather**:
1. Go to [supabase.com](https://supabase.com) and log in
2. Select project `dgdeiybuxlqbdfofzxpy`
3. Take screenshots or copy the following information:

#### Functions Tab
- ✅ List of deployed functions (Confirmed: `send-rsvp-confirmation`, `send-contribution-confirmation`)
- ✅ Function status (Both functions are active and deployed)
- ❓ Function logs (last 10 entries) - **Still needed**
- ❓ Function invocations count - **Still needed**

#### Functions → Variables Tab
- ✅ List of all environment variables (Confirmed in secrets)
- ✅ Values (All Mailjet variables are set)
- ✅ Which variables are missing (None - all required variables are present)

**Confirmed Environment Variables**:
- ✅ `MAILJET_API_KEY` - Set
- ✅ `MAILJET_API_SECRET` - Set  
- ✅ `MAILJET_FROM_EMAIL` - Set
- ✅ `MAILJET_FROM_NAME` - Set
- ✅ `PRIVATE_EVENT_ADDRESS` - Set
- ❓ `ALLOWED_ORIGINS` - Status unknown (not visible in secrets)

#### Table Editor Tab
- List of all tables in the database
- Structure of the `rsvps` table
- Sample data from `rsvps` table (last 5 rows)
- Check if `email_sent_at` column exists

#### SQL Editor Tab
Run these queries and share the results:

```sql
-- Check if email tracking column exists
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'rsvps' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check recent RSVPs and email status
SELECT id, name, email, created_at, updated_at, email_sent_at 
FROM public.rsvps 
ORDER BY created_at DESC 
LIMIT 10;

-- Check if functions exist in database
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name LIKE '%rsvp%';
```

### 2. Supabase CLI Status
**What we need**: Local CLI connection status and deployment capabilities

**How to gather**:
1. Open terminal in project root directory
2. Run these commands and share the output:

```bash
# Check if Supabase CLI is installed
supabase --version

# Check if logged in
supabase status

# Check if linked to project
supabase projects list

# Check local functions
supabase functions list

# Check database status
supabase db diff --schema public
```

### 3. Environment Variables Status
**What we need**: Which environment variables are set and their values

**How to gather**:
1. In Supabase Dashboard → Functions → Variables
2. Copy the list of variables (mask sensitive values)
3. Note which required variables are missing

**Required variables checklist**:
- [ ] `MAILJET_API_KEY`
- [ ] `MAILJET_API_SECRET`
- [ ] `MAILJET_FROM_EMAIL`
- [ ] `MAILJET_FROM_NAME`
- [ ] `PRIVATE_EVENT_ADDRESS`
- [ ] `ALLOWED_ORIGINS`

### 4. Function Logs Analysis
**What we need**: Recent function execution logs to see what's failing

**How to gather**:
1. In Supabase Dashboard → Functions → send-rsvp-confirmation
2. Go to Logs tab
3. Look for recent executions (last 24 hours)
4. Copy any error messages or warnings
5. Check the Invocations tab for success/failure rates

### 5. Mailjet Account Status
**What we need**: Verify Mailjet account is active and API keys work

**How to gather**:
1. Log into [mailjet.com](https://mailjet.com)
2. Go to Account Settings → API Key Management
3. Check if API keys are active
4. Note the account status (trial/paid)
5. Check if there are any usage limits or restrictions

### 6. Browser Console Errors
**What we need**: Frontend errors when submitting RSVPs

**How to gather**:
1. Open browser developer tools (F12)
2. Go to Console tab
3. Submit an RSVP
4. Copy any error messages that appear
5. Check Network tab for failed requests to Supabase functions

### 7. Network Requests Analysis
**What we need**: See what requests are being made to Supabase

**How to gather**:
1. Open browser developer tools (F12)
2. Go to Network tab
3. Submit an RSVP
4. Look for requests to:
   - `supabase.co/functions/v1/send-rsvp-confirmation`
   - Any 404 or 500 errors
5. Copy the request/response details

### 8. Database Migration Status
**What we need**: Verify which migrations have been applied

**How to gather**:
1. In Supabase Dashboard → SQL Editor
2. Run this query:

```sql
-- Check migration history
SELECT version, name, executed_at 
FROM supabase_migrations.schema_migrations 
ORDER BY executed_at DESC 
LIMIT 20;

-- Check if email tracking columns exist
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND (table_name = 'rsvps' OR table_name = 'users')
AND column_name LIKE '%email%'
ORDER BY table_name, ordinal_position;
```

## Information Collection Template

Please fill out this template with the information you gather:

### Supabase Dashboard Status
- [ ] Functions deployed: [List]
- [ ] Environment variables set: [List]
- [ ] Database tables: [List]
- [ ] RSVPs table structure: [Details]
- [ ] Recent function logs: [Copy/paste]

### CLI Status
- [ ] Supabase CLI version: [Version]
- [ ] Logged in: [Yes/No]
- [ ] Project linked: [Yes/No]
- [ ] Local functions: [List]

### Environment Variables
- [ ] MAILJET_API_KEY: [Set/Not Set]
- [ ] MAILJET_API_SECRET: [Set/Not Set]
- [ ] MAILJET_FROM_EMAIL: [Set/Not Set]
- [ ] MAILJET_FROM_NAME: [Set/Not Set]
- [ ] PRIVATE_EVENT_ADDRESS: [Set/Not Set]
- [ ] ALLOWED_ORIGINS: [Set/Not Set]

### Function Logs
- [ ] Recent executions: [Count]
- [ ] Success rate: [Percentage]
- [ ] Common errors: [List]
- [ ] Last successful execution: [Timestamp]

### Mailjet Status
- [ ] Account active: [Yes/No]
- [ ] API keys valid: [Yes/No]
- [ ] Usage limits: [Details]
- [ ] Account type: [Trial/Paid]

### Browser Errors
- [ ] Console errors: [List]
- [ ] Network errors: [List]
- [ ] Failed requests: [Details]

## Priority Order
1. **Supabase Dashboard Status** (most critical)
2. **Function Logs** (shows what's failing)
3. **Environment Variables** (configuration issues)
4. **Browser Console Errors** (frontend issues)
5. **Mailjet Account Status** (email service issues)

Once you gather this information, I can provide a complete analysis and specific fix instructions.
