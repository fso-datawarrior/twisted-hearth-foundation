# 03-DEPLOY-TO-PRODUCTION.md

## 🚀 **Deploy to Production**

Use this prompt to deploy your current branch to production.

**📋 Reference:** See `docs/DEPLOYMENT-PROD/firebase-project-configuration.md` for complete Firebase project details.

---

**Prompt:**
```
Deploy my current branch to production. Do this now.

Use my current branch.

DO NOT ASK ME QUESTIONS - JUST EXECUTE THE COMMANDS!

Instructions:
1. Run: git branch --show-current (detect current branch automatically)
2. Check git status for any uncommitted changes
3. Add all changes to git staging
4. Commit changes with descriptive message
5. Push current branch to GitHub
6. Merge current branch to prod-2025.partytillyou.rip (or push if already on prod-2025.partytillyou.rip)
7. Trigger automated production deployment
8. Monitor deployment and report success/failure
9. Provide production URL when complete

NOTE: We use 'prod-2025.partytillyou.rip' branch for production, NOT 'main'. This eliminates worktree conflicts.

SAFETY CHECKS:
- NEVER delete files without explicit confirmation
- ALWAYS check git status before making changes
- ALWAYS commit changes before merging to prod-2025.partytillyou.rip
- ALWAYS verify push was successful
- ALWAYS monitor deployment status
- ALWAYS confirm production site is updated

Production URL: https://2025.partytillyou.rip/
Repository: https://github.com/fso-datawarrior/twisted-hearth-foundation

Expected workflow: https://github.com/fso-datawarrior/twisted-hearth-foundation/actions/workflows/firebase-hosting.yml
```

---

## **Usage Examples**

### **Deploy Current Branch (Recommended):**
```
Deploy my current branch to production. Do this now.

Use my current branch.
```

### **Deploy with Specific Changes:**
```
Deploy my current branch to production. Do this now.

Use my current branch.

Changes made:
- Fixed email validation logic
- Updated user interface
- Added error handling
- Ready for production deployment
```

---

## **What This Does**

1. ✅ **Checks current branch** and confirms it's production-ready
2. ✅ **Checks git status** for uncommitted changes
3. ✅ **Stages all changes** (`git add .`)
4. ✅ **Commits with message** (asks for description if needed)
5. ✅ **Pushes branch to GitHub**
6. ✅ **Merges to prod-2025.partytillyou.rip** (or pushes if already on production branch)
7. ✅ **Triggers automated production deployment**
8. ✅ **Monitors deployment** and reports status
9. ✅ **Confirms production site** is updated

---

## **Safety Features**

- 🛡️ **File Protection:** Never deletes files without explicit confirmation
- 🛡️ **Status Verification:** Always checks git status before making changes
- 🛡️ **Commit Safety:** Always commits changes before merging to main
- 🛡️ **Push Verification:** Always verifies push was successful
- 🛡️ **Deployment Monitoring:** Always monitors deployment status
- 🛡️ **Production Confirmation:** Always confirms production site is updated

---

## **Expected Result**

- **Changes committed** and pushed to GitHub
- **Branch merged to prod-2025.partytillyou.rip** (if needed)
- **Production site** auto-updates: https://2025.partytillyou.rip/
- **Deployment complete** with success confirmation
- **All changes preserved** and safely stored
- **No worktree conflicts** - clean merge every time

---

## **Troubleshooting**

### **If "Invalid project selection" Error**

The Firebase hosting site name in `.firebaserc` doesn't match the actual Firebase Hosting site.

**Solution:**
1. **Check Firebase configuration:** See `docs/DEPLOYMENT-PROD/firebase-project-configuration.md`
2. **Verify hosting sites:** Run `firebase hosting:sites:list` (requires authentication)
3. **Update `.firebaserc`:** Ensure the site name matches the actual Firebase Hosting site
4. **Common fixes:**
   - Use `"default"` for the main production site
   - Use `"twisted-hearth-foundation-dev"` for development site
   - Verify site names in Firebase Console → Hosting

### **If "Authentication Error: Your credentials are no longer valid"**

The `FIREBASE_TOKEN` GitHub secret has expired. To fix:

1. **Generate new Firebase token locally:**
   ```bash
   firebase login:ci
   ```

2. **Update GitHub Secret:**
   - Go to: https://github.com/fso-datawarrior/twisted-hearth-foundation/settings/secrets/actions
   - Find: `FIREBASE_TOKEN`
   - Click: "Update"
   - Paste: The new token
   - Save

3. **Re-run the deployment:**
   - Go to: https://github.com/fso-datawarrior/twisted-hearth-foundation/actions
   - Find the failed workflow
   - Click "Re-run jobs"

### **If deployment fails (other reasons):**
1. Check GitHub Actions logs: https://github.com/fso-datawarrior/twisted-hearth-foundation/actions
2. Verify Firebase project permissions
3. Ensure `firebase.json` is configured correctly

### **If changes don't appear:**
1. Wait 2-3 minutes for Firebase CDN propagation
2. Hard refresh browser (Ctrl+F5)
3. Check Firebase Console for deployment status
