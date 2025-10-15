# 01-SETUP-DEV-ENVIRONMENT.md

## 🚀 **Daily Development Environment Setup**

Use this prompt to set up your development environment for the day.

---

**Prompt:**
```
Set up my development environment for today.

Current branch: [CURRENT_BRANCH_NAME]

Instructions:
1. Check current branch and confirm it's ready for development
2. If I want to create a new branch, ask me:
   - What version number should we use?
   - What feature/task am I working on today?
   - Create branch name in format: [version]-dev-[feature]
3. Push the branch to GitHub
4. Set up development environment for the branch
5. Confirm development site is accessible

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
2. ✅ **Creates new branch** (if requested) with proper naming
3. ✅ **Pushes to GitHub** to sync with remote
4. ✅ **Sets up development environment** for live preview
5. ✅ **Confirms development site** is accessible

---

## **Expected Result**

- **Development branch** created and pushed
- **Development site** auto-deploys: https://twisted-hearth-foundation-dev.web.app/
- **Ready for coding** with live preview
