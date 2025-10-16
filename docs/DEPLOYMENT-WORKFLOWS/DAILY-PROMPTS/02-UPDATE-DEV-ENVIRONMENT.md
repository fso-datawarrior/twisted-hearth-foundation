# 02-UPDATE-DEV-ENVIRONMENT.md

## 🔄 **Update Development Environment**

Use this prompt to sync your current changes to the development environment.

---

**Prompt:**
```
Update my development environment with current changes. Do this now.

Current branch: [CURRENT_BRANCH_NAME]

DO NOT ASK ME QUESTIONS - JUST EXECUTE THE COMMANDS!

Execute these steps immediately:
1. Run: git status
2. Run: git add .
3. Run: git commit -m "update: sync changes to dev environment"
4. Run: git push origin [CURRENT_BRANCH_NAME]
5. Report: Deployment triggered - check https://github.com/fso-datawarrior/twisted-hearth-foundation/actions

SAFETY CHECKS:
- NEVER delete files without explicit confirmation
- ALWAYS check git status before making changes
- ALWAYS verify push was successful
- ALWAYS confirm deployment status

Development URL: https://twisted-hearth-foundation-dev.web.app/
Repository: https://github.com/fso-datawarrior/twisted-hearth-foundation

IMPORTANT: Do NOT ask for confirmation. Do NOT ask what I want to do. Just execute the git commands and report the results.
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
