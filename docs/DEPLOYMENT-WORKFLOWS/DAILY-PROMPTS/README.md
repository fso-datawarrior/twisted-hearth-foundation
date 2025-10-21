# 📋 **Daily Prompts**

These are your essential daily prompts for automated Firebase deployment using Workload Identity authentication.

## **🚀 New to This Project?**

**Start Here**: Read `docs/DEPLOYMENT-PROD/QUICKSTART.md` for a 5-minute overview

**Need Setup?**: Follow `docs/DEPLOYMENT-PROD/WORKLOAD-IDENTITY-SETUP-GUIDE.md` for complete setup

**Architecture**: See `docs/DEPLOYMENT-PROD/DEPLOYMENT-ARCHITECTURE-OVERVIEW.md` for system overview

---

## **🔑 00-REFRESH-FIREBASE-TOKEN.md (DEPRECATED)**
**Status:** No longer needed with Workload Identity  
**Purpose:** ~~Refresh Firebase authentication token~~  
**What changed:** We now use Workload Identity (permanent solution)  
**Benefit:** No more daily token refresh needed!

## **🚀 01-SETUP-DEV-ENVIRONMENT.md**
**When to use:** Start of your workday
**Purpose:** Set up development environment for the day
**What it does:** 
- Uses current branch OR creates new branch
- Pushes to GitHub
- Sets up development environment
- Confirms dev site is accessible

## **🔄 02-UPDATE-DEV-ENVIRONMENT.md**
**When to use:** During development (multiple times per day)
**Purpose:** Sync changes to development environment
**What it does:**
- Commits current changes
- Pushes to GitHub
- Triggers development deployment
- Confirms dev site is updated

## **🚀 03-DEPLOY-TO-PRODUCTION.md**
**When to use:** End of day or when ready for production
**Purpose:** Deploy to production
**What it does:**
- Commits all changes
- Merges to prod-2025.partytillyou.rip branch (NOT main)
- Triggers automated production deployment
- Confirms production site is updated

## **🔄 04-SYNC-BRANCH-TO-GITHUB.md**
**When to use:** Anytime you want to save progress
**Purpose:** Sync current branch to GitHub
**What it does:**
- Commits current changes
- Pushes to GitHub
- Confirms sync was successful
- No deployment triggered

## **🛡️ SAFETY-GUIDELINES.md**
**When to use:** Always reference before any operation
**Purpose:** Prevent accidental file deletion and ensure safe git workflow
**What it includes:**
- Critical safety rules
- Pre-operation checks
- Safe cleanup process
- Emergency recovery procedures

---

## **📝 How to Use**

1. **Copy the prompt** from the file
2. **Replace `[CURRENT_BRANCH_NAME]`** with your actual branch name (if needed)
3. **Paste into any chat** (Cursor, ChatGPT, etc.)
4. **Follow the instructions** provided by the AI

---

## **🎯 Daily Workflow**

```
Morning: 01-SETUP-DEV-ENVIRONMENT.md
   ↓
During day: 02-UPDATE-DEV-ENVIRONMENT.md (multiple times)
   ↓
Anytime: 04-SYNC-BRANCH-TO-GITHUB.md (save progress)
   ↓
End of day: 03-DEPLOY-TO-PRODUCTION.md (merges to prod-2025.partytillyou.rip)
```

**Note:** We use `prod-2025.partytillyou.rip` branch for production deployments, NOT `main`. This eliminates worktree conflicts and file deletion issues.

---

## **🛡️ Safety Features**

All prompts now include:
- ✅ **File Protection:** Never deletes files without explicit confirmation
- ✅ **Git Safety:** Always checks status before making changes
- ✅ **Change Preservation:** Always commits changes before switching branches
- ✅ **Deployment Verification:** Always confirms deployment status
- ✅ **Status Checks:** Always verifies operations were successful

---

## **🔗 Quick Links**

- **Development Site:** https://twisted-hearth-foundation-dev.web.app/
- **Production Site:** https://2025.partytillyou.rip/
- **GitHub Actions:** https://github.com/fso-datawarrior/twisted-hearth-foundation/actions
- **Repository:** https://github.com/fso-datawarrior/twisted-hearth-foundation

---

## **⚠️ Important Notes**

- **Always check SAFETY-GUIDELINES.md** before any operation
- **Never delete files** without explicit confirmation
- **Always commit changes** before switching branches
- **Always verify git status** before making changes
- **Always confirm deployment** after changes

---

## **🚨 Troubleshooting Quick Links**

### **Authentication Issues**
- **Workload Identity Setup**: `docs/DEPLOYMENT-PROD/WORKLOAD-IDENTITY-SETUP-GUIDE.md`
- **Project Configuration**: `docs/DEPLOYMENT-PROD/firebase-project-configuration.md`
- **Architecture Overview**: `docs/DEPLOYMENT-PROD/DEPLOYMENT-ARCHITECTURE-OVERVIEW.md`

### **Deployment Issues**
- **Master Checklist**: `docs/DEPLOYMENT-PROD/MASTER-DEPLOYMENT-CHECKLIST.md`
- **Runbook**: `docs/DEPLOYMENT-PROD/InventoryRunBook.md`
- **Branch Strategy**: `docs/DEPLOYMENT-WORKFLOWS/PRODUCTION-BRANCH-STRATEGY.md`

### **Replication for New Projects**
- **Replication Guide**: `docs/DEPLOYMENT-PROD/REPLICATION-GUIDE.md`
- **Quick Start**: `docs/DEPLOYMENT-PROD/QUICKSTART.md`
