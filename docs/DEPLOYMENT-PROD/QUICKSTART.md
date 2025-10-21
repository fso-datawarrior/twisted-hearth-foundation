# Quick Start Guide

## 5-Minute Overview

Welcome to the Twisted Hearth Foundation deployment system! This guide gets you up and running quickly with our automated Firebase deployment pipeline.

## What You Need to Know

### The Basics
- **Development**: Push to any dev branch → Auto-deploys to dev site
- **Production**: Merge to `prod-2025.partytillyou.rip` → Auto-deploys to production
- **Authentication**: Workload Identity (no tokens to manage!)
- **No `main` branch**: We use `prod-2025.partytillyou.rip` instead

### Key URLs
- **Development Site**: https://twisted-hearth-foundation-dev.web.app/
- **Production Site**: https://2025.partytillyou.rip/
- **GitHub Actions**: https://github.com/fso-datawarrior/twisted-hearth-foundation/actions

## Prerequisites Checklist

Before you start, ensure you have:

- [ ] Access to the GitHub repository
- [ ] Node.js installed locally
- [ ] Git configured with your credentials
- [ ] Basic understanding of Git workflows

## Your First Deployment

### Step 1: Set Up Development Environment

```bash
# Check your current branch
git branch --show-current

# If you need a new branch
git checkout -b v-3.0.3.5-my-feature
```

### Step 2: Make Changes and Deploy

```bash
# Make your changes, then:
git add .
git commit -m "feat: add new feature"
git push origin v-3.0.3.5-my-feature
```

**That's it!** Your changes will automatically deploy to the development site.

### Step 3: Deploy to Production (When Ready)

```bash
# Merge to production branch
git checkout prod-2025.partytillyou.rip
git merge v-3.0.3.5-my-feature
git push origin prod-2025.partytillyou.rip
```

**Done!** Your changes are now live on production.

## Daily Workflow

### Option 1: Use Daily Prompts (Recommended)

Copy and paste these prompts into any AI chat:

**Start of Day:**
```
Set up my development environment for today. Do this now.
Use my current branch as the development branch.
```

**During Development:**
```
Update my development environment with current changes. Do this now.
Use my current branch as the development branch.
```

**End of Day:**
```
Deploy my current branch to production. Do this now.
Use my current branch.
```

### Option 2: Manual Commands

```bash
# Development deployment
git add . && git commit -m "update: sync changes" && git push origin [your-branch]

# Production deployment
git checkout prod-2025.partytillyou.rip && git merge [your-branch] && git push origin prod-2025.partytillyou.rip
```

## Common Commands Reference

### Git Commands
```bash
# Check current branch
git branch --show-current

# Check status
git status

# Create new branch
git checkout -b v-3.0.3.5-feature-name

# Switch branches
git checkout prod-2025.partytillyou.rip

# Merge branches
git merge feature-branch
```

### Deployment Commands
```bash
# Development deployment
git push origin [dev-branch]

# Production deployment
git push origin prod-2025.partytillyou.rip

# Emergency rollback
git revert [commit-hash] && git push origin prod-2025.partytillyou.rip
```

## Troubleshooting Quick Fixes

### "Deployment not triggered"
- Check if your branch is in `.github/workflows/firebase-hosting-dev.yml`
- Add your branch to the `branches` list if missing

### "Site not updating"
- Wait 2-3 minutes for CDN propagation
- Hard refresh browser (Ctrl+Shift+R)

### "Authentication error"
- This shouldn't happen with Workload Identity
- Check `docs/DEPLOYMENT-PROD/firebase-project-configuration.md`

### "Branch not found"
- Make sure you're on the right branch: `git branch --show-current`
- Create branch if needed: `git checkout -b [branch-name]`

## Branch Strategy

### Development Branches (Auto-deploy to dev site)
- `v-3.0.3.*` - Version-specific branches
- `dev` - General development
- `develop` - Alternative development
- `test-preview-channel` - Testing

### Production Branch (Auto-deploy to production)
- `prod-2025.partytillyou.rip` - Production deployments

### Avoid
- `main` - Causes worktree conflicts

## What Happens When You Deploy

### Development Deployment
1. Push to dev branch
2. GitHub Actions builds project
3. Deploys to https://twisted-hearth-foundation-dev.web.app/
4. Site updates automatically

### Production Deployment
1. Merge to `prod-2025.partytillyou.rip`
2. GitHub Actions builds project
3. Deploys to https://2025.partytillyou.rip/
4. Production site updates

## Monitoring Deployments

### Check Status
- **GitHub Actions**: https://github.com/fso-datawarrior/twisted-hearth-foundation/actions
- **Green checkmark**: Success
- **Red X**: Failed (check logs)
- **Yellow circle**: In progress

### Verify Sites
- **Development**: https://twisted-hearth-foundation-dev.web.app/
- **Production**: https://2025.partytillyou.rip/

## Emergency Procedures

### Rollback Production
```bash
# Find last good commit
git log --oneline prod-2025.partytillyou.rip

# Revert to it
git checkout prod-2025.partytillyou.rip
git revert [commit-hash]
git push origin prod-2025.partytillyou.rip
```

### Fix Broken Branch
```bash
# Reset to last good commit
git reset --hard [commit-hash]
git push --force origin [branch-name]
```

## Next Steps

### Learn More
- **Complete Setup Guide**: `docs/DEPLOYMENT-PROD/WORKLOAD-IDENTITY-SETUP-GUIDE.md`
- **Architecture Overview**: `docs/DEPLOYMENT-PROD/DEPLOYMENT-ARCHITECTURE-OVERVIEW.md`
- **Master Checklist**: `docs/DEPLOYMENT-PROD/MASTER-DEPLOYMENT-CHECKLIST.md`

### Daily Prompts
- **Setup Dev Environment**: `docs/DEPLOYMENT-WORKFLOWS/DAILY-PROMPTS/01-SETUP-DEV-ENVIRONMENT.md`
- **Update Dev Environment**: `docs/DEPLOYMENT-WORKFLOWS/DAILY-PROMPTS/02-UPDATE-DEV-ENVIRONMENT.md`
- **Deploy to Production**: `docs/DEPLOYMENT-WORKFLOWS/DAILY-PROMPTS/03-DEPLOY-TO-PRODUCTION.md`

### Safety Guidelines
- **Safety Guidelines**: `docs/DEPLOYMENT-WORKFLOWS/DAILY-PROMPTS/SAFETY-GUIDELINES.md`
- **Branch Strategy**: `docs/DEPLOYMENT-WORKFLOWS/PRODUCTION-BRANCH-STRATEGY.md`

## Key Benefits

- ✅ **No token management** - Workload Identity handles authentication
- ✅ **Automatic deployments** - Push to branch triggers deployment
- ✅ **Safe testing** - Development environment for testing
- ✅ **Reliable production** - Manual control over production deployments
- ✅ **No worktree conflicts** - Uses dedicated production branch

## Support

### Documentation
All documentation is in the `docs/` directory:
- `docs/DEPLOYMENT-PROD/` - Production deployment guides
- `docs/DEPLOYMENT-WORKFLOWS/` - Daily workflow prompts

### Getting Help
1. Check the troubleshooting section above
2. Review the detailed documentation
3. Check GitHub Actions logs for specific errors
4. Ask team members for assistance

---

**You're ready to start deploying! The system is designed to be simple and reliable.**
