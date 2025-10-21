# Master Deployment Checklist

## Overview

This checklist ensures proper setup and maintenance of the Workload Identity-based Firebase deployment pipeline. Use this for initial setup, daily operations, and emergency procedures.

---

## Initial Setup Checklist (One-Time)

### Prerequisites
- [ ] Google Cloud Project created with billing enabled
- [ ] Firebase project initialized and hosting enabled
- [ ] GitHub repository created with Actions enabled
- [ ] Admin access to Google Cloud Console
- [ ] Admin access to GitHub repository
- [ ] Node.js project with build process configured

### Google Cloud Configuration
- [ ] Workload Identity Pool created (`github-actions`)
- [ ] OIDC Provider configured (`github`)
- [ ] Attribute mappings set up:
  - [ ] `google.subject` → `assertion.sub`
  - [ ] `attribute.repository` → `assertion.repository`
- [ ] Repository restriction condition added:
  - [ ] `assertion.repository == "[ORGANIZATION]/[REPOSITORY]"`

### Service Account Setup
- [ ] Service account created: `firebase-hosting-deployer@[PROJECT_ID].iam.gserviceaccount.com`
- [ ] `Firebase Hosting Admin` role assigned
- [ ] `Workload Identity User` role assigned
- [ ] Principal set configured:
  - [ ] `principalSet://iam.googleapis.com/projects/[PROJECT_NUMBER]/locations/global/workloadIdentityPools/github-actions/attribute.repository/[ORGANIZATION]/[REPOSITORY]`

### Firebase Configuration
- [ ] `firebase.json` created with hosting targets:
  - [ ] `main` target for production
  - [ ] `dev` target for development
- [ ] `.firebaserc` created with:
  - [ ] Project alias configuration
  - [ ] Hosting target mappings
- [ ] Firebase hosting sites created:
  - [ ] Production site: `[PRODUCTION_SITE_ID]`
  - [ ] Development site: `[DEVELOPMENT_SITE_ID]`

### GitHub Actions Workflows
- [ ] Production workflow created: `.github/workflows/firebase-hosting.yml`
- [ ] Development workflow created: `.github/workflows/firebase-hosting-dev.yml`
- [ ] Workflow permissions configured:
  - [ ] `contents: read`
  - [ ] `id-token: write`
- [ ] Branch triggers configured:
  - [ ] Production branch: `prod-[PRODUCTION_BRANCH]`
  - [ ] Development branches: `[DEV_BRANCH_PATTERNS]`

### Testing and Validation
- [ ] Test branch created and pushed
- [ ] Development deployment triggered successfully
- [ ] Development site accessible and updated
- [ ] Production branch created and pushed
- [ ] Production deployment triggered successfully
- [ ] Production site accessible and updated
- [ ] No authentication errors in any workflow
- [ ] Both sites showing correct content

### Documentation
- [ ] Project configuration documented: `docs/DEPLOYMENT-PROD/firebase-project-configuration.md`
- [ ] Daily prompts created/updated
- [ ] Runbook created/updated
- [ ] Team members trained on new workflow

---

## Daily Development Checklist (Repeatable)

### Start of Day
- [ ] Check current branch: `git branch --show-current`
- [ ] Verify branch is development branch
- [ ] Check for uncommitted changes: `git status`
- [ ] Ensure branch is in development workflow triggers
- [ ] If new branch needed, create with proper naming convention

### During Development
- [ ] Make changes and test locally
- [ ] Commit changes with descriptive message
- [ ] Push to development branch
- [ ] Monitor GitHub Actions for deployment
- [ ] Verify development site updated
- [ ] Test changes on development site
- [ ] Fix any issues found

### End of Day
- [ ] All changes tested in development
- [ ] Ready for production deployment
- [ ] Merge to production branch
- [ ] Monitor production deployment
- [ ] Verify production site updated
- [ ] Confirm no errors in production

---

## Production Deployment Checklist (End of Day)

### Pre-Deployment
- [ ] All changes tested in development environment
- [ ] Development site verified and working
- [ ] No critical bugs or issues
- [ ] Rollback plan prepared
- [ ] Team notified of production deployment

### Deployment Process
- [ ] Merge development branch to production branch
- [ ] Push production branch to GitHub
- [ ] Monitor GitHub Actions workflow
- [ ] Verify deployment completes successfully
- [ ] Check for any error messages

### Post-Deployment
- [ ] Visit production site
- [ ] Hard refresh to bypass CDN cache
- [ ] Verify all changes are visible
- [ ] Test critical functionality
- [ ] Check browser console for errors
- [ ] Monitor site performance
- [ ] Confirm deployment success

### Documentation
- [ ] Update deployment log
- [ ] Tag release if significant changes
- [ ] Update team on deployment status
- [ ] Document any issues encountered

---

## Emergency Rollback Checklist

### Identify Issue
- [ ] Confirm production issue exists
- [ ] Determine severity and impact
- [ ] Notify team of emergency rollback
- [ ] Document the issue

### Execute Rollback
- [ ] Identify last good commit: `git log --oneline prod-[PRODUCTION_BRANCH]`
- [ ] Switch to production branch: `git checkout prod-[PRODUCTION_BRANCH]`
- [ ] Revert problematic commit: `git revert [commit-hash]`
- [ ] Push rollback: `git push origin prod-[PRODUCTION_BRANCH]`
- [ ] Monitor rollback deployment

### Verify Rollback
- [ ] Check GitHub Actions for rollback deployment
- [ ] Verify rollback completes successfully
- [ ] Visit production site
- [ ] Hard refresh to bypass CDN cache
- [ ] Confirm site reverted to previous state
- [ ] Test critical functionality
- [ ] Verify issue is resolved

### Post-Rollback
- [ ] Document rollback in deployment log
- [ ] Notify team of rollback completion
- [ ] Investigate root cause of issue
- [ ] Plan fix for next deployment
- [ ] Update procedures if needed

---

## Health Check Checklist (Weekly)

### Authentication Health
- [ ] Workload Identity Pool status verified
- [ ] Service account permissions reviewed
- [ ] Repository restrictions confirmed
- [ ] No authentication errors in recent deployments

### Infrastructure Health
- [ ] Firebase hosting sites accessible
- [ ] GitHub Actions workflows functioning
- [ ] Build process working correctly
- [ ] Dependencies up to date

### Security Health
- [ ] Service account permissions reviewed
- [ ] No unnecessary permissions granted
- [ ] Repository access restrictions verified
- [ ] Audit logs reviewed for anomalies

### Documentation Health
- [ ] All documentation up to date
- [ ] Configuration values current
- [ ] Procedures tested and validated
- [ ] Team knowledge current

---

## Troubleshooting Checklist

### Authentication Issues
- [ ] Verify Workload Identity Pool exists
- [ ] Check service account has correct roles
- [ ] Confirm repository restriction matches
- [ ] Review GitHub Actions permissions
- [ ] Check Google Cloud Console for errors

### Deployment Issues
- [ ] Verify branch is in workflow triggers
- [ ] Check Firebase project configuration
- [ ] Confirm hosting sites exist
- [ ] Review build process and dependencies
- [ ] Check GitHub Actions logs for errors

### Site Issues
- [ ] Wait for CDN propagation (2-3 minutes)
- [ ] Hard refresh browser (Ctrl+Shift+R)
- [ ] Check Firebase Console for deployment status
- [ ] Verify site configuration in firebase.json
- [ ] Test in different browser/incognito mode

---

## Success Criteria

Your deployment pipeline is healthy when:

- [ ] All initial setup items completed
- [ ] Daily development workflow smooth
- [ ] Production deployments reliable
- [ ] No authentication errors
- [ ] Both sites updating correctly
- [ ] Team comfortable with procedures
- [ ] Documentation complete and current
- [ ] Emergency procedures tested

---

## Quick Reference

### Key Commands
```bash
# Check current branch
git branch --show-current

# Check git status
git status

# Development deployment
git add . && git commit -m "update: sync changes" && git push origin [branch]

# Production deployment
git checkout prod-[PRODUCTION_BRANCH] && git merge [branch] && git push origin prod-[PRODUCTION_BRANCH]

# Emergency rollback
git checkout prod-[PRODUCTION_BRANCH] && git revert [commit-hash] && git push origin prod-[PRODUCTION_BRANCH]
```

### Key URLs
- **Development Site**: https://twisted-hearth-foundation-dev.web.app/
- **Production Site**: https://2025.partytillyou.rip/
- **GitHub Actions**: https://github.com/fso-datawarrior/twisted-hearth-foundation/actions
- **Firebase Console**: https://console.firebase.google.com/project/twisted-hearth-foundation

### Emergency Contacts
- **Primary**: [Team Lead]
- **Secondary**: [DevOps Lead]
- **Escalation**: [Manager]

---

**Use this checklist regularly to ensure your deployment pipeline remains healthy and reliable.**
