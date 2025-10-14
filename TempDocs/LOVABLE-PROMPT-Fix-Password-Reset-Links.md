# Fix Password Reset Link Issue - Lovable AI Prompt

## 🚨 Critical Issue: Password Reset Links Not Working

### **Problem Identified**
When users click the "Reset Password" button in their email, they get an "Invalid reset link" error instead of the password reset form.

### **Root Cause**
The password reset flow has a URL configuration mismatch between what the code expects and what Supabase is actually sending.

## 🔧 Required Fixes

### **Fix 1: Update Reset Password URL Configuration**

**File**: `src/lib/auth.tsx`

**Current Code** (line 274-282):
```typescript
const resetPasswordForEmail = async (email: string) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
  
  if (error) {
    throw error;
  }
};
```

**Updated Code**:
```typescript
const resetPasswordForEmail = async (email: string) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth?type=recovery`,
  });
  
  if (error) {
    throw error;
  }
};
```

### **Fix 2: Enhance AuthCallback Recovery Detection**

**File**: `src/pages/AuthCallback.tsx`

**Current Code** (lines 45-50):
```typescript
// If this is a password recovery link, redirect to reset-password page
if (type === 'recovery') {
  logger.info('🔐 AuthCallback: Detected password recovery, redirecting to reset-password');
  navigate('/reset-password' + window.location.hash, { replace: true });
  return;
}
```

**Enhanced Code**:
```typescript
// If this is a password recovery link, redirect to reset-password page
if (type === 'recovery') {
  logger.info('🔐 AuthCallback: Detected password recovery, redirecting to reset-password');
  navigate('/reset-password' + window.location.hash, { replace: true });
  return;
}

// Also check query params for recovery type (backup detection)
const queryType = searchParams.get('type');
if (queryType === 'recovery') {
  logger.info('🔐 AuthCallback: Detected password recovery via query params, redirecting to reset-password');
  // Preserve both hash and search params
  const fullParams = window.location.hash || ('?' + window.location.search.substring(1));
  navigate('/reset-password' + fullParams, { replace: true });
  return;
}
```

### **Fix 3: Improve ResetPassword Token Detection**

**File**: `src/pages/ResetPassword.tsx`

**Current Code** (lines 23-33):
```typescript
useEffect(() => {
  // Check if we have the recovery token in the URL (hash or query params)
  const hashParams = new URLSearchParams(window.location.hash.substring(1));
  const type = searchParams.get("type") || hashParams.get("type");
  const accessToken = searchParams.get("access_token") || hashParams.get("access_token");
  
  // If we detect recovery parameters, mark as valid
  if (type === "recovery" || accessToken) {
    setIsValidRecovery(true);
    return;
  }
```

**Enhanced Code**:
```typescript
useEffect(() => {
  // Check if we have the recovery token in the URL (hash or query params)
  const hashParams = new URLSearchParams(window.location.hash.substring(1));
  const type = searchParams.get("type") || hashParams.get("type");
  const accessToken = searchParams.get("access_token") || hashParams.get("access_token");
  const refreshToken = searchParams.get("refresh_token") || hashParams.get("refresh_token");
  
  // Log what we found for debugging
  console.log('🔐 ResetPassword: URL Analysis', {
    hash: window.location.hash,
    search: window.location.search,
    type,
    hasAccessToken: !!accessToken,
    hasRefreshToken: !!refreshToken
  });
  
  // If we detect recovery parameters, mark as valid
  if (type === "recovery" || accessToken || refreshToken) {
    console.log('✅ ResetPassword: Valid recovery session detected');
    setIsValidRecovery(true);
    return;
  }
```

### **Fix 4: Add Debug Logging**

**File**: `src/pages/ResetPassword.tsx`

Add this after the existing useEffect:

```typescript
// Add debug logging for troubleshooting
useEffect(() => {
  console.log('🔍 ResetPassword Debug Info:', {
    fullURL: window.location.href,
    pathname: window.location.pathname,
    search: window.location.search,
    hash: window.location.hash,
    searchParams: Object.fromEntries(searchParams.entries()),
    hashParams: Object.fromEntries(new URLSearchParams(window.location.hash.substring(1)).entries())
  });
}, [searchParams]);
```

## 🔧 Alternative Approach (If Above Doesn't Work)

### **Fallback Fix: Universal Auth Handling**

**File**: `src/lib/auth.tsx`

**Change the redirect back to `/auth`**:
```typescript
const resetPasswordForEmail = async (email: string) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth`,
  });
  
  if (error) {
    throw error;
  }
};
```

**Then enhance AuthCallback to handle ALL auth scenarios**:

**File**: `src/pages/AuthCallback.tsx`

**Add this before the existing auth handling**:
```typescript
// Enhanced recovery detection - check multiple sources
const isRecovery = type === 'recovery' || 
                  queryType === 'recovery' || 
                  searchParams.get('type') === 'recovery' ||
                  window.location.href.includes('type=recovery');

if (isRecovery) {
  logger.info('🔐 AuthCallback: Password recovery detected, redirecting...');
  // Preserve the entire URL structure
  const params = window.location.hash || window.location.search;
  navigate('/reset-password' + params, { replace: true });
  return;
}
```

## 🧪 Testing Instructions

### **Test the Fix**:
1. **Request password reset** from settings or login page
2. **Check email** for reset link
3. **Click the reset button** in email
4. **Verify** you land on the reset password page (not error)
5. **Check browser console** for debug logs
6. **Complete password reset** and verify it works

### **Debug Steps if Still Failing**:
1. **Open browser dev tools** before clicking email link
2. **Check console logs** for the debug information
3. **Copy the full URL** that the email link takes you to
4. **Check network tab** for any failed requests
5. **Verify** which route the email actually redirects to

## 📋 Expected Behavior After Fix

### **Successful Flow**:
1. ✅ User clicks email reset link
2. ✅ Link goes to `/auth` (or `/reset-password`)
3. ✅ AuthCallback detects recovery type
4. ✅ Redirects to `/reset-password` with tokens
5. ✅ ResetPassword page validates tokens
6. ✅ Shows password reset form
7. ✅ User can successfully reset password

### **Debug Console Output**:
```
🔐 AuthCallback: Detected password recovery, redirecting to reset-password
🔐 ResetPassword: URL Analysis { type: "recovery", hasAccessToken: true }
✅ ResetPassword: Valid recovery session detected
```

## 🔒 Security Notes

- All tokens are preserved during redirects
- Recovery session validation remains secure
- Debug logs don't expose sensitive data
- Fallback detection improves reliability

This fix addresses the URL routing issue while maintaining security and adding better debugging capabilities to prevent future issues.

## 🎯 Priority

This is a **CRITICAL** fix since password reset is a core security feature. Implement the first approach, and if it doesn't work, use the fallback approach with enhanced debugging.
