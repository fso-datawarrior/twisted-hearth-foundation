# Replication Guide: Setting Up Workload Identity for New Projects

## Overview

This guide shows you how to replicate the Workload Identity setup for a new project. Follow these steps to create the same automated, secure deployment pipeline for any Firebase + GitHub Actions project.

## Prerequisites Checklist

Before starting, ensure you have:

- [ ] Google Cloud Project created with billing enabled
- [ ] Firebase project initialized and hosting enabled
- [ ] GitHub repository created with Actions enabled
- [ ] Admin access to Google Cloud Console
- [ ] Admin access to GitHub repository
- [ ] Node.js project with build process configured

## Project-Specific Values to Replace

Create a list of your project-specific values before starting:

| Placeholder | Your Value | Description |
|-------------|------------|-------------|
| `[PROJECT_ID]` | | Firebase/Google Cloud project ID |
| `[PROJECT_NUMBER]` | | Google Cloud project number |
| `[ORGANIZATION]` | | GitHub organization name |
| `[REPOSITORY]` | | GitHub repository name |
| `[PRODUCTION_BRANCH]` | | Production branch name (e.g., `prod-2025.yourdomain.com`) |
| `[DEV_BRANCH_PATTERN_1]` | | Development branch pattern (e.g., `v-3.0.3.*`) |
| `[DEV_BRANCH_PATTERN_2]` | | Additional dev branch pattern |
| `[DEFAULT_DEV_BRANCH]` | | Default development branch |
| `[PRODUCTION_SITE_ID]` | | Firebase hosting production site ID |
| `[DEVELOPMENT_SITE_ID]` | | Firebase hosting development site ID |

## Step-by-Step Implementation

### Step 1: Google Cloud Setup

1. **Create Workload Identity Pool**
   - Follow `WORKLOAD-IDENTITY-SETUP-GUIDE.md` Step 1
   - Use pool ID: `github-actions`
   - Use provider name: `github`

2. **Configure OIDC Provider**
   - Follow `WORKLOAD-IDENTITY-SETUP-GUIDE.md` Step 2
   - Set condition: `assertion.repository == "[ORGANIZATION]/[REPOSITORY]"`

3. **Set Up Service Account**
   - Create service account: `firebase-hosting-deployer@[PROJECT_ID].iam.gserviceaccount.com`
   - Grant `Firebase Hosting Admin` role
   - Grant `Workload Identity User` role with principal set:
     ```
     principalSet://iam.googleapis.com/projects/[PROJECT_NUMBER]/locations/global/workloadIdentityPools/github-actions/attribute.repository/[ORGANIZATION]/[REPOSITORY]
     ```

### Step 2: Firebase Configuration

1. **Create firebase.json**
   ```json
   {
     "hosting": [
       {
         "target": "main",
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
       },
       {
         "target": "dev",
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
     ]
   }
   ```

2. **Create .firebaserc**
   ```json
   {
     "projects": {
       "default": "[PROJECT_ID]"
     },
     "targets": {
       "[PROJECT_ID]": {
         "hosting": {
           "main": ["[PRODUCTION_SITE_ID]"],
           "dev": ["[DEVELOPMENT_SITE_ID]"]
         }
       }
     }
   }
   ```

### Step 3: GitHub Actions Workflows

1. **Create Production Workflow**
   - Copy `.github/workflows/firebase-hosting.yml` from `WORKLOAD-IDENTITY-SETUP-GUIDE.md`
   - Replace all `[PLACEHOLDER]` values with your project values
   - Update branch triggers to match your production branch

2. **Create Development Workflow**
   - Copy `.github/workflows/firebase-hosting-dev.yml` from `WORKLOAD-IDENTITY-SETUP-GUIDE.md`
   - Replace all `[PLACEHOLDER]` values with your project values
   - Update branch triggers to match your development branches

### Step 4: Daily Prompts (Optional)

If you want to use the daily prompts system:

1. **Copy Daily Prompts Directory**
   - Copy `docs/DEPLOYMENT-WORKFLOWS/DAILY-PROMPTS/` to your project
   - Update URLs and repository references in each prompt

2. **Update Prompt References**
   - Replace `fso-datawarrior/twisted-hearth-foundation` with `[ORGANIZATION]/[REPOSITORY]`
   - Update development and production URLs
   - Update branch names to match your naming convention

### Step 5: Documentation

1. **Create Project Configuration Document**
   - Copy `docs/DEPLOYMENT-PROD/firebase-project-configuration.md`
   - Replace all placeholder values with your actual configuration
   - Update URLs and references

2. **Create Project-Specific Runbook**
   - Copy `docs/DEPLOYMENT-PROD/InventoryRunBook.md`
   - Update project name, URLs, and specific procedures
   - Customize for your project's needs

## Configuration Templates

### GitHub Actions Production Workflow Template

```yaml
name: Deploy to Production

on:
  push:
    branches: [ prod-[PRODUCTION_BRANCH] ]
  pull_request:
    branches: [ prod-[PRODUCTION_BRANCH] ]
  workflow_dispatch:
    inputs:
      target:
        description: 'Deployment target'
        required: true
        default: 'production'
        type: choice
        options:
        - production
        - preview

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      id-token: write

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

      - name: Authenticate to Google Cloud
        uses: google-github-actions/auth@v2
        with:
          workload_identity_provider: 'projects/[PROJECT_NUMBER]/locations/global/workloadIdentityPools/github-actions/providers/github'
          service_account: 'firebase-hosting-deployer@[PROJECT_ID].iam.gserviceaccount.com'

      - name: Deploy to Firebase Hosting
        run: |
          firebase use [PROJECT_ID]
          if [ "${{ github.event_name }}" = "pull_request" ] || [ "${{ inputs.target }}" = "preview" ]; then
            firebase hosting:channel:deploy pr-${{ github.event.number || 'manual' }} --expires 7d
          else
            echo "🚀 Deploying to PRODUCTION..."
            firebase deploy --only hosting:main
            echo "✅ Production deployment complete!"
          fi
```

### Firebase Configuration Template

```json
{
  "hosting": [
    {
      "target": "main",
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
    },
    {
      "target": "dev",
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
  ]
}
```

## Testing Procedures

### 1. Initial Setup Test

1. **Create Test Branch**
   ```bash
   git checkout -b test-workload-identity
   echo "Test deployment" > test.txt
   git add test.txt
   git commit -m "test: verify Workload Identity setup"
   git push origin test-workload-identity
   ```

2. **Verify GitHub Actions**
   - Check Actions tab in GitHub
   - Confirm workflow runs without authentication errors
   - Verify deployment completes successfully

3. **Test Development Deployment**
   - Add test branch to development workflow triggers
   - Push changes and verify dev deployment works

### 2. Production Deployment Test

1. **Create Production Branch**
   ```bash
   git checkout -b prod-[PRODUCTION_BRANCH]
   git push origin prod-[PRODUCTION_BRANCH]
   ```

2. **Verify Production Workflow**
   - Check that production workflow triggers
   - Confirm deployment to production site
   - Verify site is accessible

### 3. Rollback Test

1. **Test Emergency Rollback**
   ```bash
   git checkout prod-[PRODUCTION_BRANCH]
   git revert HEAD
   git push origin prod-[PRODUCTION_BRANCH]
   ```

2. **Verify Rollback**
   - Confirm rollback deployment triggers
   - Verify site reverts to previous state

## Common Pitfalls and Solutions

### Issue: "Authentication Error: Your credentials are no longer valid"

**Cause**: Workload Identity not properly configured
**Solution**:
1. Verify Workload Identity Pool exists
2. Check service account has `Workload Identity User` role
3. Confirm repository restriction matches your GitHub repository

### Issue: "Invalid project selection"

**Cause**: Firebase project configuration mismatch
**Solution**:
1. Run `firebase hosting:sites:list` to get correct site IDs
2. Update `.firebaserc` with correct site IDs
3. Verify `firebase.json` has correct hosting targets

### Issue: "Permission denied"

**Cause**: Service account lacks required permissions
**Solution**:
1. Grant `Firebase Hosting Admin` role to service account
2. Verify `Workload Identity User` role is assigned
3. Check principal set includes your repository

### Issue: Workflow doesn't trigger

**Cause**: Branch not in workflow triggers
**Solution**:
1. Add your branch to the `branches` list in workflow YAML
2. Verify branch name matches exactly
3. Check workflow file syntax

## Success Criteria

Your setup is complete when:

- [ ] Workload Identity Pool created and configured
- [ ] Service account has correct permissions
- [ ] GitHub Actions workflows created and functional
- [ ] Development deployment works automatically
- [ ] Production deployment works automatically
- [ ] No authentication errors in any workflow
- [ ] Both sites accessible and updating correctly
- [ ] Rollback procedure tested and working

## Rollback Plan

If something goes wrong:

1. **Disable Workload Identity**
   - Remove `Workload Identity User` role from service account
   - This will cause workflows to fail safely

2. **Revert to Manual Deployment**
   - Use `firebase login:ci` to generate token
   - Add `FIREBASE_TOKEN` secret to GitHub
   - Update workflows to use token authentication

3. **Clean Up**
   - Delete Workload Identity Pool
   - Remove service account if not needed
   - Update documentation to reflect changes

## Next Steps

After successful setup:

1. **Train Team Members**
   - Share this replication guide
   - Walk through the daily workflow
   - Explain troubleshooting procedures

2. **Document Project-Specific Details**
   - Create project configuration document
   - Update runbooks with specific URLs and procedures
   - Document any customizations made

3. **Monitor and Maintain**
   - Set up monitoring for deployment failures
   - Regular security reviews of permissions
   - Keep documentation updated with changes

---

**Remember**: Always test thoroughly in a development environment before deploying to production!
