Path B — One-Time Setup (Deploy a branch to production without merging)

Purpose
Enable a manual GitHub Actions run that takes any branch you specify (e.g., `dev`) and deploys it to the **live** Firebase Hosting site (production). You’ll use this on days when you want to skip merging to `main`, then later reset prod back to steady state.

What you need before you start
• Your GitHub repo connected in Cursor and pushing successfully.
• A Firebase project (note `YOUR_PROJECT_ID`) and a Hosting site (note `YOUR_SITE_ID`).
• DNS + SSL already working for your custom domain in Firebase Hosting (green status).

Direct links you’ll use
• GitHub Actions (your repo): `https://github.com/OWNER/REPO/actions`
• Firebase Hosting: `https://console.firebase.google.com/project/YOUR_PROJECT_ID/hosting`
• Firebase Hosting settings (GitHub integration, sites/targets): `https://console.firebase.google.com/project/YOUR_PROJECT_ID/hosting/settings`

— — —

Step 1 — Ensure your GitHub Actions workflow exists and supports manual runs

1. In Cursor’s file explorer, open/create `.github/workflows/firebase-hosting.yml`.
2. Paste or update to include `workflow_dispatch` with **branch** and **target** inputs:

```yaml
name: Firebase Hosting (Preview & Prod)

on:
  pull_request:
    branches: [ main ]     # previews for PRs into main (kept from Path A)
  push:
    branches: [ main ]     # production deploys on merges to main (kept from Path A)
  workflow_dispatch:       # <-- required for Path B manual deploys
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
      id-token: write
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

      - name: Install deps
        run: npm ci

      - name: Build
        run: npm run build

      - name: Deploy to Firebase Hosting
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: ${{ secrets.GITHUB_TOKEN }}
          projectId: YOUR_PROJECT_ID
          # If input target == 'preview' we deploy to a preview channel; otherwise 'live'
          channelId: ${{ (github.event_name == 'pull_request' || inputs.target == 'preview') && 'pr-${{ github.event.number || 'manual' }}' || 'live' }}
          # Optional: lock to a specific Hosting site if you have more than one
          # target: YOUR_SITE_ID
```

3. Commit and push the workflow file from Cursor (Source Control → Stage → Commit → Push).

— — —

Step 2 — Make sure authentication for the Action can deploy to Firebase
You need one of the following. Pick the simplest that applies to you:

Option A (easiest): You already linked GitHub from Firebase Hosting
• Go to Firebase Console → Hosting: `https://console.firebase.google.com/project/YOUR_PROJECT_ID/hosting`
• In the **GitHub integration** card, click **Link a repository** (or confirm it’s already linked).
• This wires up OIDC behind the scenes so the Action can deploy without storing keys.

Option B (you previously set up OIDC/Workload Identity in Google Cloud)
• If you followed Path A’s setup, you likely have this done. No extra steps needed.

(Only if necessary) Option C: Service account key secret (not recommended)
• Create a JSON key for a service account with Hosting deploy rights.
• Save it in GitHub repo secrets and configure the Action accordingly. This is a fallback if OIDC isn’t possible.

— — —

Step 3 — Confirm `firebase.json` points to your build output
Your build system must output to the folder Firebase serves. Typical SPA config:

```json
{
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [{ "source": "**", "destination": "/index.html" }]
  }
}
```

Notes:
• If you use a framework that Firebase auto-detects (e.g., Next.js, React SSR), you may see `"frameworksBackend": {}` instead of `"public"`. That’s fine.
• Ensure `npm run build` generates files where Hosting expects them (e.g., `dist` or `build`).

— — —

Step 4 — (Optional but recommended) Define explicit Hosting targets for multi-site setups
If you have **multiple Hosting sites** (e.g., a production site and a staging site), lock your Action deploy to a specific site:

1. In your project root, ensure a `.firebaserc` exists with your project alias:

   ```json
   {
     "projects": { "default": "YOUR_PROJECT_ID" }
   }
   ```
2. Map a target name to your site ID:
   Run in terminal:
   `firebase target:apply hosting YOUR_TARGET_NAME YOUR_SITE_ID`
3. In the Action, uncomment and set:
   `target: YOUR_SITE_ID` (or use `target: YOUR_TARGET_NAME` if using targets via CLI).

— — —

Step 5 — Verify manual deploy works (using a test branch)

1. Go to GitHub Actions: `https://github.com/OWNER/REPO/actions`
2. Left sidebar: click **Firebase Hosting (Preview & Prod)**.
3. Top-right: **Run workflow**.
4. In the inputs dialog:
   • **branch** = `dev` (or any test branch)
   • **target** = `production`
   Click **Run workflow**.
5. Watch the logs; confirm steps: Checkout → Install → Build → Deploy.
6. Open your live URLs to confirm:
   • `https://YOUR_CUSTOM_DOMAIN`
   • `https://YOUR_SITE_ID.web.app`
7. Confirm the new **Release** appears in Firebase Hosting:
   `https://console.firebase.google.com/project/YOUR_PROJECT_ID/hosting`

— — —

Step 6 — (Optional) Add a dedicated “staging” site and domain
This lets you keep production clean but still have a stable environment for dev branch:

1. Firebase Console → Hosting → **Add another site** (top-right).
2. Name it (e.g., `YOUR_SITE_ID-staging`).
3. Map a subdomain (e.g., `staging.yourdomain.com`) in **Custom domains**.
4. In your Action, set `target: YOUR_SITE_ID-staging` when you want dev to go to staging instead of production.
5. When ready for production, switch the Action input to production (or merge to main via Path A).

— — —

Step 7 — Team conventions (so Path B doesn’t surprise anyone)
• When you deploy a non-main branch to production, post a short note in your team channel:
“Prod is now running branch `dev` (commit `abc123`) via Path B. I’ll restore prod to `main` at EOD.”
• At day’s end, “reset” production back to `main` (see your Reset / Close doc), or merge dev → main if you want to keep the changes.

— — —

Step 8 — Rollback safety
If something looks off after a Path B deploy:

1. Firebase Console → Hosting → **Releases**.
2. Click the last known good release → **Rollback**.
   This instantly restores the previous version (no code changes needed).

— — —

Common gotchas and how to fix them
• Site looks outdated after a “success” deploy → Check that `firebase.json` “public” (or framework config) matches your build output; make sure `npm run build` runs in the correct working directory.
• Environment variables missing → Ensure build-time env vars are configured in your GitHub Action (e.g., repository secrets → export before build) or in your framework’s env system.
• Cursor/Git worktree prevents you switching to `main` locally → This doesn’t block Path B. You can still deploy **any branch** by entering its name in **Run workflow**. Clean worktrees later with:

* `git worktree list`
* `git worktree remove /path/to/unused-worktree`


