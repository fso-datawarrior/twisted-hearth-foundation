# Firebase Deployment Runbook for Twisted Hearth Foundation

> Project: **twisted-hearth-foundation**
> Environment: Firebase Hosting + Supabase Backend
> Authentication: Workload Identity (permanent solution)
> Author: FSO Data Warrior
> Purpose: Automated deployment procedures using GitHub Actions and Workload Identity

---

## 1. Overview

This project uses **Workload Identity Federation** for secure, automated deployments to Firebase Hosting. No manual token management required - deployments are triggered automatically via GitHub Actions.

### Deployment Architecture

```
Development Branch → GitHub Actions → Firebase Hosting (Dev)
Production Branch → GitHub Actions → Firebase Hosting (Production)
```

### Key Benefits

- ✅ **No token expiration** - permanent authentication solution
- ✅ **Automated deployments** - push to branch triggers deployment
- ✅ **Secure** - no keys stored in GitHub secrets
- ✅ **Zero maintenance** - set it and forget it

---

## 2. Automated Deployment Methods

### Method A: Development Deployment

**Trigger**: Push to development branch
**Target**: Development site (https://twisted-hearth-foundation-dev.web.app/)

**Supported Branches**:
- `v-3.0.3.*` (version branches)
- `test-preview-channel`
- `dev`
- `develop`

**Process**:
1. Push changes to development branch
2. GitHub Actions automatically triggers
3. Builds project (`npm run build`)
4. Deploys to development site
5. Confirms deployment success

### Method B: Production Deployment

**Trigger**: Push to `prod-2025.partytillyou.rip` branch
**Target**: Production site (https://2025.partytillyou.rip/)

**Process**:
1. Merge development branch to `prod-2025.partytillyou.rip`
2. GitHub Actions automatically triggers
3. Builds project (`npm run build`)
4. Deploys to production site
5. Confirms deployment success

**Note**: We use `prod-2025.partytillyou.rip` instead of `main` to avoid git worktree conflicts.

---

## 3. Daily Workflow Using Prompts

### Quick Commands

Use these prompts for daily development:

**Start of Day**:
```
Set up my development environment for today. Do this now.
Use my current branch as the development branch.
```

**During Development**:
```
Update my development environment with current changes. Do this now.
Use my current branch as the development branch.
```

**End of Day**:
```
Deploy my current branch to production. Do this now.
Use my current branch.
```

**Save Progress**:
```
Sync my current branch to GitHub. Do this now.
Use my current branch.
```

### Manual Commands (Alternative)

If you prefer manual commands:

```bash
# Development deployment
git add .
git commit -m "update: sync changes to dev environment"
git push origin [your-branch]

# Production deployment
git checkout prod-2025.partytillyou.rip
git merge [your-branch]
git push origin prod-2025.partytillyou.rip
```

---

## 4. Monitoring Deployments

### GitHub Actions Dashboard

Monitor all deployments at:
https://github.com/fso-datawarrior/twisted-hearth-foundation/actions

### Deployment Status

- **Green checkmark**: Deployment successful
- **Red X**: Deployment failed - check logs
- **Yellow circle**: Deployment in progress

### Site Verification

**Development Site**: https://twisted-hearth-foundation-dev.web.app/
**Production Site**: https://2025.partytillyou.rip/

**Verification Steps**:
1. Visit the appropriate URL
2. Hard refresh (Ctrl+Shift+R) to bypass CDN cache
3. Confirm changes are visible
4. Check browser console for errors

---

## 5. Troubleshooting

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| **Deployment not triggered** | Branch not in workflow triggers | Add branch to `.github/workflows/firebase-hosting-dev.yml` |
| **Authentication error** | Workload Identity misconfigured | Check `docs/DEPLOYMENT-PROD/firebase-project-configuration.md` |
| **Site not updating** | CDN caching | Wait 2-3 minutes, then hard refresh |
| **Build errors** | Dependency issues | Check GitHub Actions logs for specific error |
| **404 on refresh** | Missing SPA rewrite | Verify `firebase.json` has correct rewrites |

### Authentication Troubleshooting

**If you see "Authentication Error: Your credentials are no longer valid"**:

This should not occur with Workload Identity, but if it does:

1. **Check Workload Identity Configuration**:
   - Verify Workload Identity Pool exists: `github-actions`
   - Check service account binding: `firebase-hosting-deployer@twisted-hearth-foundation.iam.gserviceaccount.com`
   - Confirm repository restriction: `assertion.repository == "fso-datawarrior/twisted-hearth-foundation"`

2. **Reference Documentation**:
   - See: `docs/DEPLOYMENT-PROD/firebase-project-configuration.md`
   - Check: Google Cloud Console → IAM & Admin → Workload Identity Pools

3. **Re-run Deployment**:
   - Go to: https://github.com/fso-datawarrior/twisted-hearth-foundation/actions
   - Find the failed workflow run
   - Click "Re-run jobs"

### Emergency Rollback

If production deployment causes issues:

```bash
# Identify last good commit
git log --oneline prod-2025.partytillyou.rip

# Revert to last good commit
git checkout prod-2025.partytillyou.rip
git revert [commit-hash]
git push origin prod-2025.partytillyou.rip
```

---

## 6. Best Practices

### Development Workflow

- ✅ **Always test in development** before production
- ✅ **Use descriptive commit messages**
- ✅ **Keep branches focused** on specific features
- ✅ **Monitor deployment status** after pushing

### Production Workflow

- ✅ **Merge to production branch** only when ready
- ✅ **Verify production site** after deployment
- ✅ **Keep rollback plan ready**
- ✅ **Tag important releases**

### Security Practices

- ✅ **Never commit secrets** to repository
- ✅ **Use Workload Identity** (no manual tokens)
- ✅ **Review permissions** regularly
- ✅ **Monitor deployment logs** for anomalies

---

## 7. Quick Reference

### URLs

- **Development Site**: https://twisted-hearth-foundation-dev.web.app/
- **Production Site**: https://2025.partytillyou.rip/
- **GitHub Actions**: https://github.com/fso-datawarrior/twisted-hearth-foundation/actions
- **Firebase Console**: https://console.firebase.google.com/project/twisted-hearth-foundation

### Key Files

- **Production Workflow**: `.github/workflows/firebase-hosting.yml`
- **Development Workflow**: `.github/workflows/firebase-hosting-dev.yml`
- **Firebase Config**: `firebase.json`
- **Project Config**: `.firebaserc`
- **Daily Prompts**: `docs/DEPLOYMENT-WORKFLOWS/DAILY-PROMPTS/`

### Branch Strategy

- **Development**: `v-3.0.3.*`, `dev`, `develop`, `test-preview-channel`
- **Production**: `prod-2025.partytillyou.rip` (NOT `main`)
- **Why not main**: Avoids git worktree conflicts

---

## 8. Documentation Links

- **Setup Guide**: `docs/DEPLOYMENT-PROD/WORKLOAD-IDENTITY-SETUP-GUIDE.md`
- **Replication Guide**: `docs/DEPLOYMENT-PROD/REPLICATION-GUIDE.md`
- **Project Configuration**: `docs/DEPLOYMENT-PROD/firebase-project-configuration.md`
- **Branch Strategy**: `docs/DEPLOYMENT-WORKFLOWS/PRODUCTION-BRANCH-STRATEGY.md`
- **Daily Prompts**: `docs/DEPLOYMENT-WORKFLOWS/DAILY-PROMPTS/README.md`
- **Safety Guidelines**: `docs/DEPLOYMENT-WORKFLOWS/DAILY-PROMPTS/SAFETY-GUIDELINES.md`

---

**This runbook provides everything needed for reliable, automated Firebase deployments using Workload Identity authentication.**
