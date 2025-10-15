# Unified Deployment Setup (Path A & Path B)

**Purpose:** One-time setup for both deployment workflows. This enables:
- **Path A**: Dev branch → PR to main → Preview → Merge → Production
- **Path B**: Dev branch → Manual deploy to production (bypassing main)

Both paths use the same infrastructure, just different triggers.

---

## Prerequisites Check

Before starting, verify these are already configured:

✅ **Firebase Project**: `twisted-hearth-foundation`  
✅ **Custom Domain**: `https://2025.partytillyou.rip` (SSL connected)  
✅ **Workload Identity Federation**: Already configured  
✅ **Service Account**: `firebase-adminsdk-fbsvc@twisted-hearth-foundation.iam.gserviceaccount.com`  
✅ **Build Output**: `npm run build` produces files in `dist/` folder  

**Quick verification:**
- Firebase Hosting: https://console.firebase.google.com/project/twisted-hearth-foundation/hosting
- Custom domain should show green "Connected" status

---

## Step 1 — Create the Unified GitHub Actions Workflow

Replace your existing workflow with this unified version that supports both paths.

**File:** `.github/workflows/firebase-hosting.yml`

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
      id-token: write       # for OIDC / Workload Identity
      contents: read

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
        run: npm ci

      - name: Build project
        run: npm run build

      - name: Deploy to Firebase Hosting
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: ${{ secrets.GITHUB_TOKEN }}
          projectId: twisted-hearth-foundation
          target: twisted-hearth-foundation   # Hosting Site ID
          # If running from a PR or manual 'preview', use a preview channel; else deploy 'live'
          channelId: ${{ (github.event_name == 'pull_request' || inputs.target == 'preview') && 'pr-${{ github.event.number || 'manual' }}' || 'live' }}
```

**Commit this file:**
1. In Cursor: Source Control → Stage → Commit → Push
2. Verify it appears at: https://github.com/OWNER/REPO/actions

---

## Step 2 — Verify Firebase Hosting Configuration

Your `firebase.json` should look like this (already correct):

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

**Note:** If you see `"frameworksBackend": {}` instead of `"public"`, that's also fine for Firebase auto-detected frameworks.

---

## Step 3 — Create .firebaserc File

**File:** `.firebaserc`

```json
{
  "projects": {
    "default": "twisted-hearth-foundation"
  }
}
```

**Commit this file:**
1. In Cursor: Source Control → Stage → Commit → Push

---

## Step 4 — Test Path A (Preview → Production)

Test the standard workflow:

1. **Create a test branch:**
   ```bash
   git checkout -b test-setup-path-a
   ```

2. **Make a small change:**
   - Edit `README.md` or any file
   - Commit and push: `git add . && git commit -m "test: setup verification" && git push`

3. **Create a Pull Request:**
   - Go to: https://github.com/OWNER/REPO/compare
   - Base: `main`, Compare: `test-setup-path-a`
   - Create PR

4. **Verify preview deploy:**
   - Check PR's "Checks" section for "Firebase Hosting Preview"
   - Click the preview URL (should work)
   - Preview URL format: `https://pr-123-twisted-hearth-foundation.web.app`

5. **Test production deploy:**
   - Merge the PR
   - Check Actions tab for successful deploy
   - Verify live site: https://2025.partytillyou.rip

---

## Step 5 — Test Path B (Manual Deploy)

Test the manual deployment workflow:

1. **Go to GitHub Actions:**
   https://github.com/OWNER/REPO/actions

2. **Run the workflow manually:**
   - Click "Firebase Hosting (Preview & Prod)"
   - Click "Run workflow" (top right)
   - **Branch:** `test-setup-path-a` (or any branch)
   - **Target:** `production`
   - Click "Run workflow"

3. **Verify deployment:**
   - Watch the logs until completion
   - Check live site: https://2025.partytillyou.rip
   - Verify in Firebase Console: https://console.firebase.google.com/project/twisted-hearth-foundation/hosting

---

## Step 6 — Clean Up Test Branch

After successful testing:

1. **Delete the test branch:**
   ```bash
   git checkout main
   git branch -d test-setup-path-a
   git push origin --delete test-setup-path-a
   ```

2. **Or delete via GitHub UI:**
   - Go to the merged PR
   - Click "Delete branch"

---

## Verification Checklist

✅ **Path A works:** PR creates preview, merge deploys to production  
✅ **Path B works:** Manual workflow deploys any branch to production  
✅ **Authentication works:** No errors in GitHub Actions logs  
✅ **Custom domain works:** https://2025.partytillyou.rip loads correctly  
✅ **Firebase Console shows:** New releases appear in Hosting dashboard  

---

## Next Steps

Now that setup is complete, use these daily runbooks:

- **Path A (Standard)**: See `RUNBOOK-PathA.md`
- **Path B (Manual)**: See `RUNBOOK-PathB.md`
- **Which to choose?**: See `WHICH-PATH-GUIDE.md`

---

## Troubleshooting

**If preview URLs don't work:**
- Check that the PR is targeting `main` branch
- Verify the workflow ran successfully in Actions tab

**If manual deploys fail:**
- Ensure you're using the correct branch name
- Check that the branch exists and has recent commits

**If production site looks outdated:**
- Verify `firebase.json` points to `"public": "dist"`
- Check that `npm run build` runs successfully locally

**If authentication fails:**
- Your Workload Identity Federation is already configured
- No additional setup needed for authentication

---

**Quick Links:**
- GitHub Actions: https://github.com/OWNER/REPO/actions
- Firebase Hosting: https://console.firebase.google.com/project/twisted-hearth-foundation/hosting
- Production URL: https://2025.partytillyou.rip
