# Complete Setup Guide & Troubleshooting Reference

**This document provides the complete setup process and troubleshooting solutions for building Firebase deployment workflows with GitHub Actions.**

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Complete Setup Process](#complete-setup-process)
3. [Authentication Methods](#authentication-methods)
4. [Workflow Configuration](#workflow-configuration)
5. [Testing Procedures](#testing-procedures)
6. [Troubleshooting Guide](#troubleshooting-guide)
7. [Common Issues & Solutions](#common-issues--solutions)
8. [Best Practices](#best-practices)

---

## Project Overview

**What We Built:**
- Unified GitHub Actions workflow supporting both Path A (PR previews) and Path B (manual deploys)
- Firebase Hosting integration with automatic authentication
- Complete documentation system for daily deployment workflows
- Cursor chat prompts for automated deployment processes

**Key Technologies:**
- GitHub Actions
- Firebase Hosting
- Firebase CLI
- Workload Identity Federation (attempted)
- Firebase Token Authentication (final solution)

---

## Complete Setup Process

### Prerequisites

**Required Accounts & Access:**
- GitHub repository with Actions enabled
- Firebase project with Hosting configured
- Custom domain connected to Firebase Hosting
- Admin access to both GitHub and Firebase

**Project-Specific Values:**
- Repository: `fso-datawarrior/twisted-hearth-foundation`
- Firebase Project: `twisted-hearth-foundation`
- Custom Domain: `https://2025.partytillyou.rip`
- Build Output: `dist/` (Vite React app)

### Step 1: Firebase Project Setup

**1.1 Verify Firebase Hosting:**
```bash
# Check Firebase project
firebase projects:list

# Check hosting sites
firebase hosting:sites:list
```

**1.2 Verify Custom Domain:**
- Go to: https://console.firebase.google.com/project/twisted-hearth-foundation/hosting
- Ensure custom domain shows "Connected" with green SSL status
- Note the site ID (usually matches project ID)

**1.3 Verify firebase.json:**
```json
{
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

### Step 2: Authentication Setup

**2.1 Generate Firebase Token:**
```bash
# Generate CI token
firebase login:ci

# Copy the generated token
# Example: 1//@4s6FHzDbEWBFCgYIARAAGAQSNWF-L9IrzPEeajJhWZShZqyDWM-6-F8ayG7Hi7Ktit7B3Ihx9C3mQ265GhMftXUAczufdbeuyzY
```

**2.2 Add GitHub Secret:**
- Go to: https://github.com/fso-datawarrior/twisted-hearth-foundation/settings/secrets/actions
- Click "New repository secret"
- Name: `FIREBASE_TOKEN`
- Value: [paste token from step 2.1]

### Step 3: Workflow Configuration

**3.1 Create .firebaserc:**
```json
{
  "projects": {
    "default": "twisted-hearth-foundation"
  }
}
```

**3.2 Create GitHub Actions Workflow:**
```yaml
name: Firebase Hosting (Preview & Prod)

on:
  pull_request:
    branches: [ main ]     # PRs into main -> PREVIEW deploy (Path A)
  push:
    branches: [ main ]     # Push to main -> PRODUCTION deploy (Path A)
  workflow_dispatch:       # Manual runs for Path B (deploy any branch to prod)
    inputs:
      branch:
        description: 'Branch to build/deploy (e.g., 3.1.0-dev-email-cleanup)'
        required: true
        default: 'main'
      target:
        description: 'preview or production'
        required: true
        default: 'preview'

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      id-token: write
      checks: write
      pull-requests: write

    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          ref: ${{ inputs.branch || github.ref }}

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci --legacy-peer-deps

      - name: Build project
        run: npm run build

      - name: Install Firebase CLI
        run: npm install -g firebase-tools

      - name: Deploy to Firebase Hosting
        run: |
          firebase use twisted-hearth-foundation
          if [ "${{ github.event_name }}" = "pull_request" ] || [ "${{ inputs.target }}" = "preview" ]; then
            firebase hosting:channel:deploy pr-${{ github.event.number || 'manual' }} --expires 7d
          else
            firebase deploy --only hosting
          fi
        env:
          FIREBASE_TOKEN: ${{ secrets.FIREBASE_TOKEN }}
```

### Step 4: Testing

**4.1 Test Path B (Manual Deploy):**
1. Go to: https://github.com/fso-datawarrior/twisted-hearth-foundation/actions
2. Click "Firebase Hosting (Preview & Prod)"
3. Click "Run workflow"
4. Branch: `[your-branch]`, Target: `production`
5. Click "Run workflow"

**4.2 Test Path A (PR Preview):**
1. Create PR from feature branch to main
2. Check PR's "Checks" section for preview URL
3. Test preview functionality
4. Merge PR to test production deploy

---

## Authentication Methods

### Method 1: Firebase Token (Recommended)

**Pros:**
- Simple setup
- Reliable authentication
- No complex IAM configuration
- Works consistently

**Cons:**
- Token expires (need to regenerate periodically)
- Less secure than Workload Identity

**Setup:**
```bash
firebase login:ci
# Add token to GitHub secrets as FIREBASE_TOKEN
```

### Method 2: Workload Identity Federation (Attempted)

**Pros:**
- More secure
- No token management
- Google-recommended approach

**Cons:**
- Complex setup
- Prone to configuration errors
- Difficult to troubleshoot

**Common Issues:**
- `invalid_target` errors
- Provider disabled/deleted
- Incorrect audience parameters

---

## Workflow Configuration

### Key Components

**1. Triggers:**
- `pull_request` → Preview deploys
- `push` → Production deploys  
- `workflow_dispatch` → Manual deploys

**2. Permissions:**
```yaml
permissions:
  contents: read
  id-token: write      # For Workload Identity (if used)
  checks: write        # For PR status updates
  pull-requests: write # For PR interactions
```

**3. Channel Logic:**
```bash
# Preview channels
firebase hosting:channel:deploy pr-${{ github.event.number || 'manual' }} --expires 7d

# Production deploy
firebase deploy --only hosting
```

### Environment Variables

**Required:**
- `FIREBASE_TOKEN` - GitHub secret with Firebase CI token

**Optional:**
- `GOOGLE_APPLICATION_CREDENTIALS` - For service account auth
- `FIREBASE_PROJECT_ID` - Override project ID

---

## Testing Procedures

### Path A Testing (PR Workflow)

**1. Create Test PR:**
```bash
git checkout -b test-path-a
# Make small change
git add .
git commit -m "test: Path A workflow"
git push origin test-path-a
# Create PR on GitHub
```

**2. Verify Preview:**
- Check PR "Checks" section
- Look for "Firebase Hosting Preview"
- Click preview URL
- Test functionality

**3. Test Production:**
- Merge PR
- Watch Actions tab for production deploy
- Verify live site updated

### Path B Testing (Manual Deploy)

**1. Manual Workflow:**
- Go to Actions tab
- Click "Firebase Hosting (Preview & Prod)"
- Click "Run workflow"
- Select branch and target

**2. Verify Deployment:**
- Watch deployment logs
- Check for success indicators
- Verify production site

---

## Troubleshooting Guide

### Common Error Patterns

**1. Authentication Errors**
```
Error: Failed to authenticate, have you run firebase login?
```

**Solutions:**
- Check `FIREBASE_TOKEN` secret exists
- Verify token is valid: `firebase login:ci`
- Regenerate token if expired

**2. Workload Identity Errors**
```
Error: invalid_target - The target service indicated by the "audience" parameters is invalid
```

**Solutions:**
- Switch to Firebase token authentication
- Check Workload Identity Provider status
- Verify service account permissions

**3. Build Errors**
```
Error: npm ci failed
```

**Solutions:**
- Check `package.json` exists
- Verify Node.js version compatibility
- Use `npm ci --legacy-peer-deps` if needed

**4. Deployment Errors**
```
Error: Resource not accessible by integration
```

**Solutions:**
- Add `checks: write` permission
- Verify GitHub token permissions
- Check workflow file syntax

### Debugging Steps

**1. Check Workflow Syntax:**
```bash
# Validate YAML syntax
yamllint .github/workflows/firebase-hosting.yml
```

**2. Test Firebase CLI Locally:**
```bash
# Test authentication
firebase login
firebase projects:list

# Test deployment
firebase deploy --only hosting --dry-run
```

**3. Check GitHub Secrets:**
- Go to repository settings → Secrets
- Verify `FIREBASE_TOKEN` exists
- Check secret value is correct

**4. Review Action Logs:**
- Go to Actions tab
- Click on failed workflow
- Check each step for errors
- Look for specific error messages

---

## Common Issues & Solutions

### Issue 1: Workload Identity Federation Fails

**Symptoms:**
- `invalid_target` error
- Authentication step fails
- Provider not found

**Root Cause:**
- Workload Identity Provider disabled/deleted
- Incorrect audience parameters
- Service account permissions

**Solution:**
- Switch to Firebase token authentication
- Use `firebase login:ci` approach
- Add token to GitHub secrets

### Issue 2: GitHub Permissions Errors

**Symptoms:**
- `Resource not accessible by integration`
- Check runs fail to create
- 403 Forbidden errors

**Root Cause:**
- Missing workflow permissions
- GitHub token scope issues

**Solution:**
```yaml
permissions:
  contents: read
  checks: write
  pull-requests: write
```

### Issue 3: Build Process Fails

**Symptoms:**
- `npm ci` fails
- Build step errors
- Missing dependencies

**Root Cause:**
- Package.json issues
- Node.js version mismatch
- Peer dependency conflicts

**Solution:**
```yaml
- name: Install dependencies
  run: npm ci --legacy-peer-deps
```

### Issue 4: Firebase Deployment Fails

**Symptoms:**
- `firebase deploy` fails
- Authentication errors
- Project not found

**Root Cause:**
- Invalid Firebase token
- Wrong project ID
- Missing .firebaserc

**Solution:**
- Regenerate Firebase token
- Verify project ID
- Create .firebaserc file

---

## Best Practices

### 1. Authentication Strategy

**Recommended Approach:**
- Use Firebase token for simplicity
- Regenerate token every 6 months
- Store token in GitHub secrets
- Avoid Workload Identity for initial setup

### 2. Workflow Design

**Key Principles:**
- Single workflow file for both paths
- Clear trigger separation
- Proper permission scoping
- Comprehensive error handling

### 3. Testing Strategy

**Testing Approach:**
- Test Path B first (manual deploy)
- Test Path A second (PR workflow)
- Verify both preview and production
- Test error scenarios

### 4. Documentation

**Documentation Requirements:**
- Setup instructions
- Daily runbooks
- Troubleshooting guides
- Cursor chat prompts

### 5. Maintenance

**Regular Tasks:**
- Monitor token expiration
- Update dependencies
- Review workflow logs
- Test deployment processes

---

## Quick Reference

### Essential Commands

```bash
# Generate Firebase token
firebase login:ci

# Test Firebase locally
firebase deploy --only hosting --dry-run

# Check current branch
git branch

# Check recent commits
git log --oneline -5
```

### Key URLs

- **GitHub Actions:** https://github.com/fso-datawarrior/twisted-hearth-foundation/actions
- **Firebase Console:** https://console.firebase.google.com/project/twisted-hearth-foundation/hosting
- **Production Site:** https://2025.partytillyou.rip
- **GitHub Secrets:** https://github.com/fso-datawarrior/twisted-hearth-foundation/settings/secrets/actions

### File Locations

- **Workflow:** `.github/workflows/firebase-hosting.yml`
- **Firebase Config:** `firebase.json`
- **Project Alias:** `.firebaserc`
- **Documentation:** `docs/DEPLOYMENT-WORKFLOWS/`

---

## Conclusion

This setup provides a robust, reliable deployment system that can be easily replicated for other projects. The key to success is:

1. **Start simple** with Firebase token authentication
2. **Test thoroughly** with both Path A and Path B
3. **Document everything** for future reference
4. **Monitor and maintain** the system regularly

The troubleshooting guide covers all the issues we encountered and their solutions, making future implementations much smoother.
