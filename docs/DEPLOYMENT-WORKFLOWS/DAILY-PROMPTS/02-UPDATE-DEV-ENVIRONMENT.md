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
2. Add all changes to git staging
3. Commit changes with descriptive message
4. Push to GitHub to trigger development deployment
5. Confirm development site is updated

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
2. ✅ **Stages all changes** (`git add .`)
3. ✅ **Commits with message** (asks for description if needed)
4. ✅ **Pushes to GitHub** to trigger auto-deployment
5. ✅ **Confirms development site** is updated

---

## **Expected Result**

- **Changes committed** and pushed to GitHub
- **Development site** auto-updates: https://twisted-hearth-foundation-dev.web.app/
- **Live preview** shows latest changes
