# 01-SETUP-DEV-ENVIRONMENT.md

## 🚀 **Daily Development Environment Setup**

Use this prompt to set up your development environment for the day.

---

**Prompt:**
```
Set up my development environment for today. Do this now.

Current branch: [CURRENT_BRANCH_NAME]

DO NOT ASK ME QUESTIONS - JUST EXECUTE THE COMMANDS!

Instructions:
1. Check current branch and confirm it's ready for development
2. Check for any uncommitted changes and ask before proceeding
3. If I want to create a new branch, ask me:
   - What version number should we use?
   - What feature/task am I working on today?
   - Create branch name in format: [version]-dev-[feature]
4. Push the branch to GitHub
5. Set up development environment for the branch
6. Confirm development site is accessible

SAFETY CHECKS:
- NEVER delete files without explicit confirmation
- ALWAYS check if files are being used before removing them
- ALWAYS commit changes before switching branches
- ALWAYS verify git status is clean before proceeding

Development URL: https://twisted-hearth-foundation-dev.web.app/
Repository: https://github.com/fso-datawarrior/twisted-hearth-foundation

Expected workflow: Auto-deploys on push to dev branch
```

---

## **Usage Examples**

### **Use Current Branch:**
```
Set up my development environment for today.

Current branch: v-3.0.1.1-UserDropdownViewFIX
```

### **Create New Branch:**
```
Set up my development environment for today.

Current branch: v-3.0.1.1-UserDropdownViewFIX

I want to create a new branch:
- Version: 3.0.1.2
- Feature: Email cleanup
- Branch name: v-3.0.1.2-dev-email-cleanup
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
- **Development site** auto-deploys: https://twisted-hearth-foundation-dev.web.app/
- **Ready for coding** with live preview
- **All changes preserved** and committed
