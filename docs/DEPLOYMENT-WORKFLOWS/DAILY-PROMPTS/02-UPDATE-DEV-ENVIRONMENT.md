# 02-UPDATE-DEV-ENVIRONMENT.md

## 🔄 **Update Development Environment**

Use this prompt to sync your current changes to the development environment.

---

**Prompt:**
```
Update my development environment with current changes.

Current branch: [CURRENT_BRANCH_NAME]

Instructions:
1. Check current branch and confirm it's the development branch
2. Check git status for any uncommitted changes
3. Add all changes to git staging
4. Commit changes with descriptive message
5. Push to GitHub to trigger development deployment
6. Confirm development site is updated

SAFETY CHECKS:
- NEVER delete files without explicit confirmation
- ALWAYS check git status before making changes
- ALWAYS ask for commit message if not provided
- ALWAYS verify push was successful
- ALWAYS confirm deployment status

Development URL: https://twisted-hearth-foundation-dev.web.app/
Repository: https://github.com/fso-datawarrior/twisted-hearth-foundation

Expected workflow: Auto-deploys on push to dev branch
```

---

## **Usage Examples**

### **Quick Update:**
```
Update my development environment with current changes.

Current branch: v-3.0.1.2-dev-email-cleanup
```

### **With Specific Changes:**
```
Update my development environment with current changes.

Current branch: v-3.0.1.2-dev-email-cleanup

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
- **Development site** auto-updates: https://twisted-hearth-foundation-dev.web.app/
- **Live preview** shows latest changes
- **All changes preserved** and safely stored
