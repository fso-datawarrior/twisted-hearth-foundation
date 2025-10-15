# 🚀 Setup Development Environment - Daily Prompt

Use this prompt in a **new Cursor chat** to set up your development environment for the day.

---

## 📋 Pre-Flight Checklist

**Before running this prompt, ensure:**
- ✅ You're in the correct repository: `twisted-hearth-foundation`
- ✅ You have a stable internet connection
- ✅ You're ready to commit to a new development branch

---

## 🎯 Prompt to Copy & Paste

```
I need to set up my development environment for the day. Please help me:

1. **Check Current Status:**
   - Show me what branch I'm currently on
   - Check if there are any uncommitted changes
   - Verify the current branch is up to date with origin

2. **Version & Branch Planning:**
   - Ask me if I want to increment the version number (e.g., 3.0.0 → 3.1.0)
   - Ask me what I'm working on today (e.g., "email cleanup", "user dashboard", "bug fixes")
   - Create a new development branch name using the format: `[version]-dev-[feature]`
   - Examples: `3.1.0-dev-email-cleanup`, `3.0.1-dev-user-dashboard`, `3.2.0-dev-bug-fixes`

3. **Branch Management:**
   - Create and checkout the new development branch
   - Push the new branch to origin
   - Confirm the branch is properly set up

4. **Development Environment Setup:**
   - Deploy the new branch to the development site: https://twisted-hearth-foundation-dev.web.app
   - Verify the deployment was successful
   - Provide me with the development URL for testing

5. **Daily Workflow Summary:**
   - Show me the three deployment paths available:
     - **Path A (Production via PR):** PR → Preview → Merge → Production
     - **Path B (Manual Production):** Direct deploy to production
     - **Path C (Development):** Push to dev branch → Development site
   - Confirm which path I'll use for today's work

6. **Next Steps:**
   - Remind me that when I'm ready to deploy to production, I can use the "Deploy to Production" prompt
   - Show me the development site URL for immediate testing

**Project Details:**
- Repository: twisted-hearth-foundation
- Development Site: https://twisted-hearth-foundation-dev.web.app
- Production Site: https://2025.partytillyou.rip
- Branch Naming: [version]-dev-[feature]

**Current Branch Check:** Please start by showing me what branch I'm currently on and if there are any uncommitted changes.
```

---

## 🔄 Expected Workflow

**This prompt will:**

1. **✅ Status Check** - Verify current branch and changes
2. **✅ Version Planning** - Help you decide on version increment
3. **✅ Feature Planning** - Define what you're working on
4. **✅ Branch Creation** - Create properly named development branch
5. **✅ Development Deploy** - Deploy to development site
6. **✅ Environment Ready** - Provide working development URL

**After this prompt completes:**
- ✅ You'll have a new development branch
- ✅ Development site will be updated with your branch
- ✅ You can start coding and see changes live
- ✅ You're ready to use the "Deploy to Production" prompt when done

---

## 🎯 Quick Reference

**Development Branch Naming:**
- `3.1.0-dev-email-cleanup`
- `3.0.1-dev-user-dashboard` 
- `3.2.0-dev-bug-fixes`
- `3.1.0-dev-new-feature`

**Development Site:** https://twisted-hearth-foundation-dev.web.app

**Next Step:** When ready for production, use the "Deploy to Production" prompt

---

## 🚨 Troubleshooting

**If the prompt fails:**
1. Check you're in the correct repository
2. Ensure you have push permissions
3. Verify the development site is accessible
4. Check GitHub Actions for deployment status

**Common Issues:**
- **Branch already exists:** The prompt will handle this gracefully
- **Deployment fails:** Check the GitHub Actions logs
- **Site not updating:** Wait a few minutes for deployment to complete

---

**Ready to start your development day? Copy and paste the prompt above into a new Cursor chat!** 🚀
