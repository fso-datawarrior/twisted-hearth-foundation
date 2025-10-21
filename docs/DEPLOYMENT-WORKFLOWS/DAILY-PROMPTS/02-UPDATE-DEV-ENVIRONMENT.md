# 02-UPDATE-DEV-ENVIRONMENT.md

## 🔄 **Update Development Environment**

Use this prompt to sync your current changes to the development environment.

---

**Prompt:**
```
Update my development environment with current changes. Do this now.

Use my current branch as the development branch.

DO NOT ASK ME QUESTIONS - JUST EXECUTE THE COMMANDS!

Execute these steps immediately:
1. Run: git branch --show-current (get the current branch name automatically)
2. Run: git status
3. Check if current branch exists in .github/workflows/firebase-hosting-dev.yml
4. IF branch is NOT in the workflow file:
   a. Add current branch to the branches list in firebase-hosting-dev.yml
   b. Run: git add .github/workflows/firebase-hosting-dev.yml
   c. Run: git commit -m "ci: add [current-branch] to dev deployment triggers"
   d. Run: git push origin [current-branch]
5. Run: git add .
6. Run: git commit -m "update: sync changes to dev environment"
7. Run: git push origin [current-branch]
8. Monitor: Check https://github.com/fso-datawarrior/twisted-hearth-foundation/actions
9. IF deployment fails with authentication error:
   - Report: Workload Identity authentication issue
   - Instruct: Check Firebase configuration at docs/DEPLOYMENT-PROD/firebase-project-configuration.md
   - Verify: Workload Identity Pool is properly configured

SAFETY CHECKS:
- NEVER delete files without explicit confirmation
- ALWAYS check if branch is in workflow triggers
- ALWAYS add branch to workflow if missing
- ALWAYS verify push was successful
- ALWAYS monitor deployment for errors
- ALWAYS provide recovery instructions if errors occur

Development URL: https://twisted-hearth-foundation-dev.web.app/
Repository: https://github.com/fso-datawarrior/twisted-hearth-foundation

IMPORTANT: Do NOT ask for confirmation. Do NOT ask what I want to do. Just execute the git commands and report the results. Automatically configure the workflow if needed.
```

---

## **Usage Examples**

### **Quick Update (Recommended):**
```
Update my development environment with current changes. Do this now.

Use my current branch as the development branch.
```

### **With Specific Changes:**
```
Update my development environment with current changes. Do this now.

Use my current branch as the development branch.

Changes made:
- Fixed email validation logic
- Updated user interface
- Added error handling
```

---

## **What This Does**

1. ✅ **Checks current branch** and confirms it's development branch
2. ✅ **Checks git status** for uncommitted changes
3. ✅ **Stages all changes** (`git add .`)
4. ✅ **Commits with message** (asks for description if needed)
5. ✅ **Pushes to GitHub** to trigger auto-deployment
6. ✅ **Confirms development site** is updated

---

## **Safety Features**

- 🛡️ **File Protection:** Never deletes files without explicit confirmation
- 🛡️ **Status Verification:** Always checks git status before making changes
- 🛡️ **Commit Safety:** Always asks for commit message if not provided
- 🛡️ **Push Verification:** Always verifies push was successful
- 🛡️ **Deployment Confirmation:** Always confirms deployment status

---

## **Expected Result**

- **Changes committed** and pushed to GitHub
- **Branch automatically added to workflow** (if needed)
- **Development site** auto-updates: https://twisted-hearth-foundation-dev.web.app/
- **Live preview** shows latest changes
- **All changes preserved** and safely stored

---

## **Troubleshooting**

### **If "Authentication Error: Your credentials are no longer valid"**

**This should no longer occur with Workload Identity**, but if it does:

1. **Check Workload Identity Configuration:**
   - Verify Workload Identity Pool exists: `github-actions`
   - Check service account binding: `firebase-hosting-deployer@twisted-hearth-foundation.iam.gserviceaccount.com`
   - Confirm repository restriction: `assertion.repository == "fso-datawarrior/twisted-hearth-foundation"`

2. **Reference Documentation:**
   - See: `docs/DEPLOYMENT-PROD/firebase-project-configuration.md`
   - Check: Google Cloud Console → IAM & Admin → Workload Identity Pools

3. **Re-run the deployment:**
   - Go to: https://github.com/fso-datawarrior/twisted-hearth-foundation/actions
   - Find the failed workflow run
   - Click "Re-run jobs"

### **If "Branch not in workflow triggers"**

The prompt should automatically fix this, but if it doesn't:
- The branch needs to be added to `.github/workflows/firebase-hosting-dev.yml`
- The prompt will detect this and add it automatically
- If manual fix needed, see SAFETY-GUIDELINES.md
