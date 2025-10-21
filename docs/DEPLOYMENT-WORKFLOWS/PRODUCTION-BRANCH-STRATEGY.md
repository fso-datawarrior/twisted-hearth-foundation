# Production Branch Strategy

## 🎯 **Why We Use `prod-2025.partytillyou.rip` Instead of `main`**

This document explains our production branch strategy and why we DON'T use the `main` branch.

---

## ❌ **The Problem with Main Branch**

### **Git Worktree Conflicts**
- Main branch has a git worktree at `D:/OneDrive/GH_Repositories/2025 Twisted Hallows Fog Background/main-branch`
- This causes constant conflicts when trying to checkout or merge
- Results in **file deletions** during merge attempts
- Creates deployment failures and frustration

### **Symptoms of the Problem**
- Error: "main is already used by worktree"
- Files getting deleted during branch switches
- PATCHES folders disappearing
- Daily prompts getting removed
- Constant need to restore files

---

## ✅ **The Solution: Dedicated Production Branch**

### **Branch Name:** `prod-2025.partytillyou.rip`

**Why this name:**
- Clear and descriptive
- Matches the production URL
- Easy to identify as production branch
- No confusion with main

### **How It Works**

```
Development Branch (v-3.0.3.x-...)
    ↓
Merge to → prod-2025.partytillyou.rip
    ↓
Auto-deploy to → https://2025.partytillyou.rip
```

**Main branch:** Ignored and deprecated

---

## 🔧 **Configuration**

### **Production Workflow Triggers**
File: `.github/workflows/firebase-hosting.yml`

```yaml
on:
  push:
    branches: [ prod-2025.partytillyou.rip ]  # Production deployments
```

### **Development Workflow Triggers**
File: `.github/workflows/firebase-hosting-dev.yml`

```yaml
on:
  push:
    branches:
      - v-3.0.3.x-...  # Your dev branches
      - test-preview-channel
      - dev
      - develop
```

---

## 📋 **Daily Workflow**

### **Development:**
1. Work on dev branch (e.g., `v-3.0.3.2-dev-fixes`)
2. Push changes → Auto-deploys to https://twisted-hearth-foundation-dev.web.app/
3. Test and iterate

### **Production:**
1. Use `03-DEPLOY-TO-PRODUCTION.md` prompt
2. Merges dev branch to `prod-2025.partytillyou.rip`
3. Auto-deploys to https://2025.partytillyou.rip/
4. **No worktree conflicts!**

---

## ✅ **Benefits**

- ✅ **No file deletions** - Clean merges every time
- ✅ **No worktree conflicts** - Production branch is independent
- ✅ **Simpler workflow** - Dev → Production (done!)
- ✅ **Reliable deployments** - No mysterious failures
- ✅ **All files preserved** - PATCHES, prompts, documentation stay safe

---

## 🚫 **What to Avoid**

- ❌ **Don't use main branch** for anything
- ❌ **Don't try to merge to main** - it will fail
- ❌ **Don't checkout main** - worktree will block it
- ❌ **Don't try to fix the worktree** - just ignore main entirely

---

## 🎯 **Key Takeaway**

**Use `prod-2025.partytillyou.rip` for all production deployments.**

Forget main exists. It's deprecated and causes nothing but problems.

---

**This strategy eliminates all the deployment headaches and file deletion issues!**
