# Deploy Release Email Edge Function

## Prerequisites
- Supabase CLI installed (`npm install -g supabase` or use `npx supabase`)
- Access to the Supabase project (project ID: `dgdeiybuxlqbdfofzxpy`)

## Deployment Steps

### 1. Login to Supabase
```bash
supabase login
```
This will open a browser window for authentication.

### 2. Link to Project (if needed)
```bash
supabase link --project-ref dgdeiybuxlqbdfofzxpy
```

### 3. Deploy the Edge Function
```bash
supabase functions deploy send-release-email
```

### 4. Verify Deployment
```bash
supabase functions list
```

## Alternative: Manual Deployment via Supabase Dashboard

If CLI deployment doesn't work, you can manually create the function:

1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/dgdeiybuxlqbdfofzxpy)
2. Navigate to **Edge Functions** in the left sidebar
3. Click **Create a new function**
4. Name it: `send-release-email`
5. Copy the contents of `supabase/functions/send-release-email/index.ts`
6. Paste into the function editor
7. Click **Deploy**

## Environment Variables Required

Make sure these are set in your Supabase project:
- `MAILJET_API_KEY`
- `MAILJET_API_SECRET` 
- `MAILJET_FROM_EMAIL`
- `MAILJET_FROM_NAME`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

## Testing the Deployment

After deployment, test by:
1. Going to Release Management
2. Click "Send System Update Email" on a deployed release
3. Select recipients and email type
4. Click "Send Email"
5. Check browser console for success messages

## Troubleshooting

If deployment fails:
1. Check that all environment variables are set
2. Verify the function code syntax
3. Check Supabase logs for errors
4. Ensure the `get_release_full` RPC function exists

## Function Features

The deployed function will:
- ✅ Generate admin and user-friendly email versions
- ✅ Handle recipient group selection (all users, admins, RSVPs)
- ✅ Support individual recipient selection
- ✅ Send via Mailjet with proper tracking
- ✅ Update release status and create campaign records
- ✅ Provide detailed error logging
