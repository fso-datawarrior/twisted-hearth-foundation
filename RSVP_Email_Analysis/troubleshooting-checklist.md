# RSVP Email Troubleshooting Checklist

## Quick Diagnosis Steps

### Step 1: Check Supabase Dashboard (5 minutes)
1. Go to [supabase.com](https://supabase.com) and log in
2. Select project `dgdeiybuxlqbdfofzxpy`
3. **Functions Tab**: ✅ `send-rsvp-confirmation` and `send-contribution-confirmation` are listed.
4. **Functions → Variables**: ✅ All Mailjet variables are set and configured.
5. **Table Editor**: Does `rsvps` table exist with `email_sent_at` column?

**If functions are missing**: Deploy them (✅ Functions are confirmed deployed)
**If variables are missing**: Set them (✅ Variables are confirmed set)
**If table is wrong**: Check migrations

### Step 2: Test Function Directly (2 minutes)
1. Go to **Functions → send-rsvp-confirmation**
2. Click **Invoke** button
3. Use this test payload:
```json
{
  "rsvpId": "test-123",
  "name": "Test User",
  "email": "your-email@example.com",
  "guests": 1,
  "isUpdate": false,
  "additionalGuests": []
}
```
4. Check the response and logs

**If function fails**: Check environment variables and logs
**If function succeeds**: Issue is in frontend or database

### Step 3: Check Function Logs (3 minutes)
1. Go to **Functions → send-rsvp-confirmation → Logs**
2. Look for recent executions (last 24 hours)
3. Check for error messages:
   - "Missing Mailjet configuration"
   - "Mailjet API error"
   - "CORS error"
   - "Database error"

**Common errors and fixes**:
- `Missing Mailjet configuration` → Set environment variables
- `Mailjet API error: 401` → Invalid API credentials
- `Mailjet API error: 403` → Account suspended or rate limited
- `CORS error` → Update ALLOWED_ORIGINS variable

### Step 4: Verify Environment Variables (2 minutes)
1. Go to **Functions → Secrets**
2. ✅ `MAILJET_API_KEY` and `MAILJET_API_SECRET` are correctly set.
3. ✅ `MAILJET_FROM_EMAIL` is set to a valid sender email address.
4. ✅ `MAILJET_FROM_NAME` is set.
5. ✅ `PRIVATE_EVENT_ADDRESS` is set.
6. ❓ Check if `ALLOWED_ORIGINS` is set (not visible in secrets list).

### Step 5: Test Frontend (2 minutes)
1. Open browser developer tools (F12)
2. Go to **Console** tab
3. Submit an RSVP
4. Look for errors:
   - `404 Not Found` → Function not deployed (✅ Functions are deployed)
   - `500 Internal Server Error` → Function error
   - `CORS error` → Origin not allowed

## Detailed Troubleshooting

### Issue 1: Functions Not Deployed
**Symptoms**:
- 404 errors in browser console
- Functions not listed in Supabase Dashboard
- "Function not found" errors

**Solution**:
```bash
# Deploy functions
supabase functions deploy send-rsvp-confirmation
supabase functions deploy send-contribution-confirmation
```

### Issue 2: Environment Variables Missing
**Symptoms**:
- "Missing Mailjet configuration" in logs
- Function returns 500 error
- Emails not sent

**Solution**:
1. Go to Supabase Dashboard → Functions → Variables
2. Set these variables:
   - `MAILJET_API_KEY=your_api_key`
   - `MAILJET_API_SECRET=your_secret`
   - `MAILJET_FROM_EMAIL=rsvp@partytillyou.rip`
   - `MAILJET_FROM_NAME=Jamie & Kat Ruth`
   - `PRIVATE_EVENT_ADDRESS=your_address`
   - `ALLOWED_ORIGINS=https://partytillyou.rip`

### Issue 3: Mailjet API Errors
**Symptoms**:
- "Mailjet API error: 401" in logs
- "Mailjet API error: 403" in logs
- Emails not delivered

**Solutions**:
- **401 Error**: Check API key and secret are correct
- **403 Error**: Check account status, may be suspended
- **Rate Limit**: Check usage limits in Mailjet dashboard

### Issue 4: Database Schema Issues
**Symptoms**:
- "Column does not exist" errors
- Function fails to update database
- Email tracking not working

**Solution**:
1. Check if `email_sent_at` column exists:
```sql
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'rsvps' AND column_name = 'email_sent_at';
```
2. If missing, add it:
```sql
ALTER TABLE public.rsvps ADD COLUMN email_sent_at TIMESTAMPTZ;
```

### Issue 5: CORS Issues
**Symptoms**:
- "CORS error" in browser console
- Function calls blocked by browser
- 403 errors

**Solution**:
1. Update `ALLOWED_ORIGINS` environment variable
2. Include your domain: `https://partytillyou.rip,https://your-domain.com`
3. Redeploy function after updating

### Issue 6: Frontend Code Issues
**Symptoms**:
- Function calls not being made
- Wrong function parameters
- Silent failures

**Solution**:
1. Check `src/pages/RSVP.tsx` lines 281-295 and 340-354
2. Verify function names match deployed functions
3. Check parameter structure matches function expectations

## Testing Workflow

### Test 1: Basic Function Test
1. Deploy function
2. Set environment variables
3. Test with simple payload
4. Check logs for success

### Test 2: Frontend Integration Test
1. Submit RSVP through frontend
2. Check browser console for errors
3. Check function logs for execution
4. Verify email delivery

### Test 3: End-to-End Test
1. Submit new RSVP
2. Check email received
3. Update RSVP
4. Check update email received
5. Verify database tracking

## Monitoring and Maintenance

### Daily Checks
- [ ] Function execution logs
- [ ] Email delivery rates
- [ ] Error rates

### Weekly Checks
- [ ] Mailjet account status
- [ ] Environment variable validity
- [ ] Database email tracking

### Monthly Checks
- [ ] Function performance
- [ ] Email template updates
- [ ] Security review

## Emergency Fixes

### If Emails Stop Working
1. Check Supabase function logs
2. Verify Mailjet account status
3. Test function directly
4. Check environment variables

### If Database Issues
1. Check migration status
2. Verify table structure
3. Check RLS policies
4. Test database functions

### If Frontend Issues
1. Check browser console
2. Verify function calls
3. Check network requests
4. Test with different browsers

## Success Criteria
- [ ] Functions deployed and accessible
- [ ] Environment variables set correctly
- [ ] Mailjet API working
- [ ] Frontend can call functions
- [ ] Emails being sent successfully
- [ ] Database tracking working
- [ ] No errors in logs


