# 🚀 Automated Production Deploy Prompt

## **One-Command Production Deployment**

Use this prompt to deploy your current branch to production automatically:

---

**Prompt:**
```
Deploy my current branch to production automatically. 

Current branch: [BRANCH_NAME]

Instructions:
1. Check current branch and confirm it's ready for production
2. Push the branch to GitHub 
3. Trigger the "Deploy to Production" GitHub Actions workflow
4. Monitor the deployment and report success/failure
5. Provide the production URL when complete

Expected workflow: https://github.com/fso-datawarrior/twisted-hearth-foundation/actions/workflows/firebase-hosting.yml

Production URL: https://2025.partytillyou.rip/
```

---

## **How It Works**

### **Automated Production Deployment**
- **Trigger:** Push to `main` branch OR manual workflow dispatch
- **Workflow:** `.github/workflows/firebase-hosting.yml`
- **Process:** 
  1. Builds the project (`npm run build`)
  2. Deploys to Firebase Hosting (`firebase deploy --only hosting`)
  3. Updates production site automatically

### **Manual Production Deployment**
- **Trigger:** Manual workflow dispatch
- **Process:** Same as automated, but triggered manually
- **Use Case:** Deploy any branch to production without merging to main

---

## **Current Status**

✅ **Production deployment is now AUTOMATED!**

- **Auto-deploy:** ✅ Push to `main` → Production
- **Manual deploy:** ✅ Any branch → Production  
- **Development:** ✅ Push to dev branch → Development site

---

## **Usage Examples**

### **Path A (Recommended): Merge to Main**
```bash
# 1. Merge your branch to main
git checkout main
git merge your-feature-branch
git push origin main

# 2. Production deploys automatically! 🎉
```

### **Path B: Direct Deploy**
```bash
# 1. Push your branch
git push origin your-feature-branch

# 2. Use the prompt above to trigger manual deployment
```

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

---

**🎉 Production deployment is now as easy as development!**
