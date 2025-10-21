# Workload Identity Setup Guide

## Overview

This guide provides step-by-step instructions for setting up Workload Identity Federation for GitHub Actions to authenticate with Google Cloud and Firebase. This eliminates the need for manual token refresh and provides a permanent, secure authentication solution.

## Prerequisites

- Google Cloud Project with billing enabled
- Firebase project initialized
- GitHub repository with Actions enabled
- Admin access to Google Cloud Console
- Admin access to GitHub repository

## Step 1: Create Workload Identity Pool

### 1.1 Navigate to Workload Identity Pools

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project: `[PROJECT_ID]`
3. Navigate to: **IAM & Admin** → **Workload Identity Pools**
4. Click **"Create Pool"**

### 1.2 Configure Identity Pool

**Pool Details:**
- **Pool ID**: `github-actions`
- **Display name**: `GitHub Actions Pool`
- **Description**: `GitHub Actions Pool for CI/CD authentication`
- **Location**: `Global`
- **Enabled pool**: ✅ ON

Click **"Continue"**

## Step 2: Create OIDC Provider

### 2.1 Provider Configuration

**Provider Details:**
- **Provider type**: `OpenID Connect (OIDC)`
- **Provider name**: `github`
- **Display name**: `GitHub Actions Provider`
- **Issuer URL**: `https://token.actions.githubusercontent.com`

### 2.2 Audience Configuration

- **Default audience**: ✅ Selected
- **Audience URL**: `https://iam.googleapis.com/projects/[PROJECT_NUMBER]/locations/global/workloadIdentityPools/github-actions/providers/github`

Click **"Continue"**

### 2.3 Configure Provider Attributes

**Attribute Mappings:**
- **Google 1**: `google.subject` → **OIDC 1**: `assertion.sub`
- **Google 2**: `attribute.repository` → **OIDC 2**: `assertion.repository`

**Attribute Conditions:**
- **Condition CEL**: `assertion.repository == "[ORGANIZATION]/[REPOSITORY]"`

Example: `assertion.repository == "fso-datawarrior/twisted-hearth-foundation"`

Click **"Save"**

## Step 3: Configure Service Account

### 3.1 Navigate to Service Accounts

1. Go to **IAM & Admin** → **Service Accounts**
2. Find your Firebase hosting service account: `firebase-hosting-deployer@[PROJECT_ID].iam.gserviceaccount.com`
3. Click on the service account name

### 3.2 Grant Workload Identity Access

1. Click **"Permissions"** tab
2. Click **"Principals with access"** tab
3. Click **"+ Grant Access"**

**Grant Access Configuration:**
- **New principals**: 
  ```
  principalSet://iam.googleapis.com/projects/[PROJECT_NUMBER]/locations/global/workloadIdentityPools/github-actions/attribute.repository/[ORGANIZATION]/[REPOSITORY]
  ```
- **Role**: `Workload Identity User`

Click **"Save"**

## Step 4: Update GitHub Actions Workflows

### 4.1 Production Workflow

Create/update `.github/workflows/firebase-hosting.yml`:

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

### 4.2 Development Workflow

Create/update `.github/workflows/firebase-hosting-dev.yml`:

```yaml
name: Deploy to Development

on:
  push:
    branches:
      - [DEV_BRANCH_PATTERN_1]
      - [DEV_BRANCH_PATTERN_2]
      - dev
      - develop
  workflow_dispatch:
    inputs:
      branch:
        description: 'Branch to deploy to development'
        required: true
        default: '[DEFAULT_DEV_BRANCH]'

jobs:
  build-and-deploy-dev:
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

      - name: Deploy to Development Site
        run: |
          firebase use [PROJECT_ID]
          echo "🚀 Deploying to DEVELOPMENT SITE..."
          firebase deploy --only hosting:dev
          echo "✅ Development deployment complete!"
```

## Step 5: Configure Firebase Project

### 5.1 Update firebase.json

Ensure your `firebase.json` includes hosting targets:

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

### 5.2 Update .firebaserc

Configure project aliases and hosting targets:

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

## Step 6: Test Authentication

### 6.1 Trigger Test Deployment

1. Push a test commit to your development branch
2. Check GitHub Actions: `https://github.com/[ORGANIZATION]/[REPOSITORY]/actions`
3. Verify the workflow runs without authentication errors

### 6.2 Validate Deployment

1. Check that the deployment completes successfully
2. Verify the site is accessible at the expected URL
3. Confirm no "Authentication Error" messages appear

## Troubleshooting

### Common Issues

**"Authentication Error: Your credentials are no longer valid"**
- Verify Workload Identity Pool is properly configured
- Check service account has `Workload Identity User` role
- Confirm repository restriction matches your GitHub repository

**"Invalid project selection"**
- Verify `.firebaserc` has correct project ID
- Check Firebase hosting sites exist: `firebase hosting:sites:list`
- Ensure hosting targets match actual site IDs

**"Permission denied"**
- Verify service account has `Firebase Hosting Admin` role
- Check Workload Identity principal set includes your repository
- Confirm attribute condition matches your repository name

### Validation Commands

```bash
# Check Firebase hosting sites
firebase hosting:sites:list

# Verify project configuration
firebase use [PROJECT_ID]

# Test local deployment
firebase deploy --only hosting:dev --dry-run
```

## Security Considerations

- **Repository Restriction**: Only allows deployments from your specific repository
- **Service Account Permissions**: Follows principle of least privilege
- **No Token Storage**: Eliminates risk of token exposure
- **Automatic Rotation**: No manual token management required
- **Audit Trail**: All deployments logged in Google Cloud Console

## Benefits

- ✅ **No token expiration** - permanent solution
- ✅ **More secure** - no keys to manage
- ✅ **Google recommended** - best practice for CI/CD
- ✅ **Zero maintenance** - set it and forget it
- ✅ **Organization compliant** - works with secure-by-default policies

## Next Steps

After completing this setup:

1. Update your daily prompts to reference Workload Identity
2. Remove any `FIREBASE_TOKEN` secrets from GitHub
3. Test both development and production deployments
4. Document your specific configuration values
5. Train team members on the new authentication method

---

**Note**: Replace all `[PLACEHOLDER]` values with your actual project configuration before implementing.
