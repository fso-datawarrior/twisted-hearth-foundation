# 🚀 Complete Replication Guide

**This guide shows how to replicate the entire deployment workflow system for any new project.**

---

## 📋 What You're Replicating

**A complete 3-path deployment system:**

1. **Path A (Production via PR):** Dev → PR → Preview → Merge → Production
2. **Path B (Manual Production):** Dev → Direct deploy to production  
3. **Path C (Development):** Dev → Development site (live preview)

**Plus:**
- ✅ Automated GitHub Actions workflows
- ✅ Firebase Hosting integration
- ✅ Cursor chat prompts for daily workflow
- ✅ Complete documentation system

---

## 🎯 Prerequisites

**Before starting, ensure you have:**

- ✅ **GitHub repository** (public or private)
- ✅ **Firebase project** created
- ✅ **Custom domain** (optional, for production)
- ✅ **Node.js project** with `npm run build` command
- ✅ **Firebase CLI** installed locally
- ✅ **GitHub Actions** enabled on repository

---

## 📁 Step 1: Create Documentation Structure

**Create this folder structure:**

```
docs/
  DEPLOYMENT-WORKFLOWS/
    UNIFIED-SETUP.md
    WHICH-PATH-GUIDE.md
    RUNBOOK-PathA.md
    RUNBOOK-PathB.md
    RUNBOOK-PathC.md
    SETUP-DEV-ENVIRONMENT-PROMPT.md
    DEPLOY-TO-PRODUCTION-PROMPT.md
    DAILY-WORKFLOW-PROMPTS.md
    SETUP-COMPLETE-GUIDE.md
    REPLICATION-GUIDE.md
```

**Copy these files from the current project:**
- All files in `docs/DEPLOYMENT-WORKFLOWS/`
- Update project-specific values (see Step 2)

---

## 🔧 Step 2: Update Project-Specific Values

**In each file, replace these placeholders:**

| Placeholder | Replace With | Example |
|-------------|--------------|---------|
| `twisted-hearth-foundation` | Your Firebase project ID | `my-awesome-project` |
| `2025.partytillyou.rip` | Your production domain | `myapp.com` |
| `twisted-hearth-foundation-dev` | Your dev site ID | `my-awesome-project-dev` |
| `fso-datawarrior/twisted-hearth-foundation` | Your GitHub repo | `username/repository-name` |
| `v-3.0.0.0-Milestone` | Your main branch | `main` or `master` |

**Files to update:**
- `UNIFIED-SETUP.md`
- `WHICH-PATH-GUIDE.md`
- `RUNBOOK-PathA.md`
- `RUNBOOK-PathB.md`
- `SETUP-DEV-ENVIRONMENT-PROMPT.md`
- `DEPLOY-TO-PRODUCTION-PROMPT.md`
- `DAILY-WORKFLOW-PROMPTS.md`

---

## 🔥 Step 3: Firebase Setup

### 3.1 Create Firebase Project
```bash
firebase login
firebase projects:create your-project-id
firebase use your-project-id
```

### 3.2 Create Development Site
```bash
firebase hosting:sites:create your-project-id-dev
```

### 3.3 Configure firebase.json
**File:** `firebase.json`
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

### 3.4 Create .firebaserc
**File:** `.firebaserc`
```json
{
  "projects": {
    "default": "your-project-id"
  }
}
```

---

## ⚙️ Step 4: GitHub Actions Setup

### 4.1 Create Production Workflow
**File:** `.github/workflows/firebase-hosting.yml`

```yaml
name: Firebase Hosting (Preview & Prod)

on:
  pull_request:
    branches: [ main ]
  push:
    branches: [ main ]
  workflow_dispatch:
    inputs:
      branch:
        description: 'Branch to build/deploy'
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
          firebase use your-project-id
          if [ "${{ github.event_name }}" = "pull_request" ] || [ "${{ inputs.target }}" = "preview" ]; then
            firebase hosting:channel:deploy pr-${{ github.event.number || 'manual' }} --expires 7d
          else
            firebase deploy --only hosting
          fi
        env:
          FIREBASE_TOKEN: ${{ secrets.FIREBASE_TOKEN }}
```

### 4.2 Create Development Workflow
**File:** `.github/workflows/firebase-hosting-dev.yml`

```yaml
name: Deploy to Development

on:
  push:
    branches: [ dev, develop, main ]
  workflow_dispatch:
    inputs:
      branch:
        description: 'Branch to deploy to development'
        required: true
        default: 'dev'

jobs:
  deploy-dev:
    runs-on: ubuntu-latest
    permissions:
      contents: read
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

      - name: Deploy to Development Site
        run: |
          firebase use your-project-id
          firebase target:apply hosting dev your-project-id-dev
          firebase deploy --only hosting:dev
        env:
          FIREBASE_TOKEN: ${{ secrets.FIREBASE_TOKEN }}
```

---

## 🔐 Step 5: Authentication Setup

### 5.1 Generate Firebase Token
```bash
firebase login:ci
# Copy the token that's displayed
```

### 5.2 Add GitHub Secret
1. Go to your GitHub repository
2. Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Name: `FIREBASE_TOKEN`
5. Value: Paste the token from step 5.1

---

## 🧪 Step 6: Testing

### 6.1 Test Development Workflow
```bash
git checkout -b test-dev-workflow
echo "Testing development deployment" >> README.md
git add . && git commit -m "test: development deployment" && git push
```

**Check:**
- GitHub Actions should run "Deploy to Development"
- Visit your development site URL
- Should show your test changes

### 6.2 Test Production Workflow
```bash
git checkout -b test-prod-workflow
echo "Testing production deployment" >> README.md
git add . && git commit -m "test: production deployment" && git push
```

**Create PR:**
- Create PR from test-prod-workflow to main
- Check GitHub Actions for preview deployment
- Merge PR to trigger production deployment

---

## 📚 Step 7: Documentation Customization

### 7.1 Update Branch Names
**In all documentation files, update branch names:**
- Replace `v-3.0.0.0-Milestone` with your main branch
- Update any other branch-specific references

### 7.2 Update URLs
**Replace all URLs with your project URLs:**
- Production site URL
- Development site URL
- GitHub repository URL
- Firebase console URL

### 7.3 Update Project Details
**In prompts and guides, update:**
- Project name
- Feature examples
- Version numbering scheme
- Team-specific workflows

---

## 🎯 Step 8: Daily Workflow Setup

### 8.1 Morning Setup
**Use:** `SETUP-DEV-ENVIRONMENT-PROMPT.md`
- Creates development branch
- Deploys to development site
- Provides live preview URL

### 8.2 Evening Deploy
**Use:** `DEPLOY-TO-PRODUCTION-PROMPT.md`
- Deploys to production
- Chooses between Path A or Path B

---

## ✅ Verification Checklist

**Before considering setup complete:**

- [ ] Development site accessible and working
- [ ] Production site accessible and working
- [ ] GitHub Actions workflows running successfully
- [ ] All documentation updated with project values
- [ ] Firebase authentication working
- [ ] Both workflows tested end-to-end
- [ ] Cursor prompts working correctly
- [ ] Team trained on new workflow

---

## 🚨 Common Issues & Solutions

### Issue: "Hosting site or target dev not detected"
**Solution:** Ensure `firebase.json` has both `main` and `dev` targets configured

### Issue: "Resource not accessible by integration"
**Solution:** Add `checks: write` and `pull-requests: write` permissions to workflow

### Issue: "Firebase token expired"
**Solution:** Generate new token with `firebase login:ci` and update GitHub secret

### Issue: "Preview URL shows Site Not Found"
**Solution:** Preview channels expire after 7 days. Use development site for persistent previews.

---

## 🎉 Success!

**You now have a complete 3-path deployment system:**

1. **Path A:** PR → Preview → Merge → Production
2. **Path B:** Direct deploy to production
3. **Path C:** Development site with live preview

**Plus automated workflows, documentation, and Cursor prompts for daily use!**

---

## 📞 Support

**If you encounter issues:**
1. Check the troubleshooting section in `SETUP-COMPLETE-GUIDE.md`
2. Verify all project-specific values are updated
3. Test each workflow individually
4. Check GitHub Actions logs for specific errors

**This replication guide should get you up and running quickly!** 🚀
