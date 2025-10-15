# 03-DEPLOY-TO-PRODUCTION.md

## 🚀 **Deploy to Production**

Use this prompt to deploy your current branch to production.

---

**Prompt:**
```
Deploy my current branch to production.

Current branch: [CURRENT_BRANCH_NAME]

Instructions:
1. Check current branch and confirm it's ready for production
2. Add all changes to git staging
3. Commit changes with descriptive message
4. Push branch to GitHub
5. Merge branch to main (or push to main if already on main)
6. Trigger automated production deployment
7. Monitor deployment and report success/failure
8. Provide production URL when complete

Production URL: https://2025.partytillyou.rip/
Repository: https://github.com/fso-datawarrior/twisted-hearth-foundation

Expected workflow: https://github.com/fso-datawarrior/twisted-hearth-foundation/actions/workflows/firebase-hosting.yml
```

---

## **Usage Examples**

### **Deploy Current Branch:**
```
Deploy my current branch to production.

Current branch: v-3.0.1.2-dev-email-cleanup
```

### **Deploy with Specific Changes:**
```
Deploy my current branch to production.

Current branch: v-3.0.1.2-dev-email-cleanup

Changes made:
- Fixed email validation logic
- Updated user interface
- Added error handling
- Ready for production deployment
```

---

## **What This Does**

1. ✅ **Checks current branch** and confirms it's production-ready
2. ✅ **Stages all changes** (`git add .`)
3. ✅ **Commits with message** (asks for description if needed)
4. ✅ **Pushes branch to GitHub**
5. ✅ **Merges to main** (or pushes to main if already on main)
6. ✅ **Triggers automated production deployment**
7. ✅ **Monitors deployment** and reports status
8. ✅ **Confirms production site** is updated

---

## **Expected Result**

- **Changes committed** and pushed to GitHub
- **Branch merged to main** (if needed)
- **Production site** auto-updates: https://2025.partytillyou.rip/
- **Deployment complete** with success confirmation

---

## **Troubleshooting**

### **If deployment fails:**
1. Check GitHub Actions logs: https://github.com/fso-datawarrior/twisted-hearth-foundation/actions
2. Verify `FIREBASE_TOKEN` secret is set
3. Check Firebase project permissions
4. Ensure `firebase.json` is configured correctly

### **If changes don't appear:**
1. Wait 2-3 minutes for Firebase CDN propagation
2. Hard refresh browser (Ctrl+F5)
3. Check Firebase Console for deployment status
