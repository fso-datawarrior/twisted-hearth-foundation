# 01-SETUP-DEV-ENVIRONMENT.md

## 🚀 **Daily Development Environment Setup**

Use this prompt to set up your development environment for the day.

---

**Prompt:**
```
Set up my development environment for today. Do this now.

Use my current branch as the development branch.

DO NOT ASK ME QUESTIONS - JUST EXECUTE THE COMMANDS!

Instructions:
1. Run: git branch --show-current (detect current branch automatically)
2. Check for any uncommitted changes
3. Check if current branch exists in .github/workflows/firebase-hosting-dev.yml
4. IF branch is NOT in the workflow file:
   a. Add current branch to the branches list
   b. Commit and push workflow update
5. If I want to create a new branch, ask me:
   - What version number should we use?
   - What feature/task am I working on today?
   - Create branch name in format: [version]-dev-[feature]
6. Push the branch to GitHub
7. Monitor deployment and check for errors
8. IF authentication error: Provide FIREBASE_TOKEN refresh instructions
9. Confirm development site is accessible

SAFETY CHECKS:
- NEVER delete files without explicit confirmation
- ALWAYS check if files are being used before removing them
- ALWAYS check if branch is in workflow triggers
- ALWAYS add branch to workflow if missing
- ALWAYS commit changes before switching branches
- ALWAYS verify git status is clean before proceeding
- ALWAYS monitor deployment for authentication errors

Development URL: https://twisted-hearth-foundation-dev.web.app/
Repository: https://github.com/fso-datawarrior/twisted-hearth-foundation

Expected workflow: Auto-deploys on push to dev branch
```

---

## **Usage Examples**

### **Use Current Branch (Most Common):**
```
Set up my development environment for today. Do this now.

Use my current branch as the development branch.
```

### **Create New Branch (If Needed):**
```
Set up my development environment for today. Do this now.

Use my current branch as the development branch.

I want to create a new branch:
- Version: 3.0.4.0
- Feature: Email cleanup
```

---

## **What This Does**

1. ✅ **Checks current branch** and confirms it's ready
2. ✅ **Checks for uncommitted changes** and asks before proceeding
3. ✅ **Creates new branch** (if requested) with proper naming
4. ✅ **Pushes to GitHub** to sync with remote
5. ✅ **Sets up development environment** for live preview
6. ✅ **Confirms development site** is accessible

---

## **Safety Features**

- 🛡️ **File Protection:** Never deletes files without explicit confirmation
- 🛡️ **Usage Verification:** Checks if files are being used before removing
- 🛡️ **Git Safety:** Always commits changes before switching branches
- 🛡️ **Status Verification:** Verifies git status is clean before proceeding

---

## **Expected Result**

- **Development branch** created and pushed
- **Branch automatically added to workflow** (if needed)
- **Development site** auto-deploys: https://twisted-hearth-foundation-dev.web.app/
- **Ready for coding** with live preview
- **All changes preserved** and committed

---

## **Troubleshooting**

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
