# 00-REFRESH-FIREBASE-TOKEN.md

## 🔑 **Refresh Firebase Authentication Token**

Use this prompt at the start of your day or whenever deployments fail with authentication errors.

---

**Prompt:**
```
Refresh Firebase authentication token. Do this now.

INSTRUCTIONS FOR USER:

I need you to refresh the Firebase authentication token. Follow these steps:

1. Open your terminal
2. Run this command: firebase login:ci
3. A browser will open - log in with your Firebase account
4. Copy the token that appears in the terminal (starts with "1//...")
5. Go to: https://github.com/fso-datawarrior/twisted-hearth-foundation/settings/secrets/actions
6. Find: FIREBASE_TOKEN
7. Click: "Update" (pencil icon)
8. Paste: The new token you copied
9. Click: "Update secret"
10. Tell me: "Token updated, continue"

Once you confirm the token is updated, all deployments will work correctly.

WAIT FOR USER CONFIRMATION before proceeding with any deployments.
```

---

## **When to Use This**

- ✅ **Start of each day** - Proactively refresh before working
- ✅ **When deployments fail** - If you see "Authentication Error: Your credentials are no longer valid"
- ✅ **After long breaks** - Tokens expire after ~7 days of inactivity
- ✅ **Before important deployments** - Ensure authentication is working

---

## **What This Does**

1. ✅ **Guides you through** Firebase token generation
2. ✅ **Provides direct link** to GitHub secrets page
3. ✅ **Waits for confirmation** before proceeding
4. ✅ **Ensures deployments work** by refreshing authentication

---

## **Signs You Need to Refresh the Token**

Watch for these error messages in GitHub Actions:
- ❌ "Authentication Error: Your credentials are no longer valid"
- ❌ "Please run firebase login --reauth"
- ❌ "Invalid project selection, please verify project twisted-hearth-foundation exists"
- ❌ "For CI servers and headless environments, generate a new token with firebase login:ci"

---

## **How Long Does the Token Last?**

- Firebase CI tokens typically expire after **7-30 days**
- Expiration depends on Firebase account settings
- **Best practice:** Refresh at the start of each work session

---

## **Troubleshooting**

### **If `firebase login:ci` command not found:**
Install Firebase CLI:
```bash
npm install -g firebase-tools
```

### **If browser doesn't open:**
- Check your default browser settings
- Try running with `--no-localhost` flag:
  ```bash
  firebase login:ci --no-localhost
  ```

### **If you can't access GitHub secrets page:**
- You need admin/write access to the repository
- Contact repository owner for access
- Or ask them to update the token for you

---

## **Expected Result**

- ✅ **New token generated** and saved
- ✅ **GitHub secret updated** with fresh token
- ✅ **All deployments will work** for the next 7-30 days
- ✅ **Ready to use** other daily prompts

---

## **Daily Workflow (Updated)**

```
Start of day: 00-REFRESH-FIREBASE-TOKEN.md (if needed)
   ↓
Then: 01-SETUP-DEV-ENVIRONMENT.md OR 02-UPDATE-DEV-ENVIRONMENT.md
   ↓
During day: 02-UPDATE-DEV-ENVIRONMENT.md (multiple times)
   ↓
End of day: 03-DEPLOY-TO-PRODUCTION.md
```

---

**Pro Tip:** Bookmark the GitHub secrets page for quick access!
https://github.com/fso-datawarrior/twisted-hearth-foundation/settings/secrets/actions
