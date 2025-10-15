Path B — Daily Runbook (Make a dev branch live without merging)

Purpose:
Use this on days when you want your dev (or feature) branch to go straight to production without merging into main. You’ll trigger a manual GitHub Actions run (or optionally deploy via the Firebase CLI), verify the live site, and later “reset” prod back to main.

Prerequisites (one-time from Path A setup):
• The workflow file exists at .github/workflows/firebase-hosting.yml with workflow_dispatch inputs (branch, target).
• Firebase Hosting is connected to your project and your custom domain is green in Hosting.
• firebase.json points Hosting to your built output (e.g., "public": "dist" or frameworks auto-detect).

— — —

Step 1 — Confirm you’re on the right branch in Cursor

1. Open the repo in Cursor.
2. Bottom status bar → confirm current branch is the one you want to deploy (e.g., dev or feature/foo).
3. Source Control (left sidebar) → Stage → Commit → Push.
   Tip: Pushing ensures GitHub has the exact code you want to deploy.

— — —

Step 2 — Trigger a manual production deploy from GitHub Actions (recommended)

1. Open GitHub Actions for your repo:
   [https://github.com/OWNER/REPO/actions](https://github.com/OWNER/REPO/actions)
2. In the left sidebar, click the workflow named: Firebase Hosting (Preview & Prod).
3. Top-right of the workflow page, click: Run workflow.
4. In the Run workflow dialog:
   • branch = your branch name (e.g., dev)
   • target = production
   Then click the green Run workflow button.
5. Watch the job logs live on this page. You’ll see steps like Checkout, Install, Build, Deploy.

Notes:
• This uses the exact branch you specify, and deploys to the “live” channel on Firebase Hosting.
• If you have multiple Hosting sites and configured target: YOUR_SITE_ID in the workflow, this deploys to that specific site.

— — —

Optional Step 2B — Deploy from the local CLI instead (hands-on)
Use this only if you need to deploy your local working copy directly.

Commands (run in the repo root terminal inside Cursor):
npm i -g firebase-tools
firebase login
firebase use YOUR_PROJECT_ID
npm run build
firebase deploy --only hosting

Verification:
• Firebase Hosting dashboard:
[https://console.firebase.google.com/project/YOUR_PROJECT_ID/hosting](https://console.firebase.google.com/project/YOUR_PROJECT_ID/hosting)
• Production URLs:
https://YOUR_CUSTOM_DOMAIN
[https://YOUR_SITE_ID.web.app](https://YOUR_SITE_ID.web.app)

— — —

Step 3 — Verify the live site after deployment

1. Open your production URL(s):
   • https://YOUR_CUSTOM_DOMAIN
   • [https://YOUR_SITE_ID.web.app](https://YOUR_SITE_ID.web.app) (backup Firebase domain)
2. Smoke test critical paths (homepage, routing, forms, auth, payments, etc.).
3. In Firebase Console → Hosting, confirm the new Release is listed:
   [https://console.firebase.google.com/project/YOUR_PROJECT_ID/hosting](https://console.firebase.google.com/project/YOUR_PROJECT_ID/hosting)
   Tip: Click the latest release to see which Git commit (or workflow run) produced it.

— — —

Step 4 — Communicate that “prod == dev” today (recommended practice)
If you work with others, drop a note in your team channel:
“Deploying branch dev (commit abc123) directly to production today via Path B. I’ll restore prod to main at EOD.”

— — —

Step 5 — Keep working and redeploy as needed (same day)
If you make more changes:

1. Commit + Push on the same branch.
2. Re-run the workflow with branch=<same branch>, target=production at:
   [https://github.com/OWNER/REPO/actions](https://github.com/OWNER/REPO/actions) → Firebase Hosting (Preview & Prod) → Run workflow.

— — —

Step 6 — Reset to steady state at the end of the day (return prod to main)
Choose one:

Choice A — Make main live again without merging

1. Go to Actions:
   [https://github.com/OWNER/REPO/actions](https://github.com/OWNER/REPO/actions)
2. Open Firebase Hosting (Preview & Prod) → Run workflow.
3. Inputs:
   • branch = main
   • target = production
4. Run it and watch logs.
5. Verify production now matches main:
   [https://console.firebase.google.com/project/YOUR_PROJECT_ID/hosting](https://console.firebase.google.com/project/YOUR_PROJECT_ID/hosting)
   https://YOUR_CUSTOM_DOMAIN

Choice B — Merge dev → main to keep today’s changes

1. Open compare:
   [https://github.com/OWNER/REPO/compare](https://github.com/OWNER/REPO/compare)
   • base = main
   • compare = your dev branch
2. Create Pull Request → review → Merge pull request.
3. After merge, the workflow auto-deploys to production (push to main).
4. Verify live as usual.

— — —

Rollback (if something looks wrong)

1. Firebase Console → Hosting:
   [https://console.firebase.google.com/project/YOUR_PROJECT_ID/hosting](https://console.firebase.google.com/project/YOUR_PROJECT_ID/hosting)
2. Open the Releases tab, select the last good release, click Rollback.
   This instantly restores the prior working version.

— — —

Common gotchas and quick checks
• Build output mismatch: If deploy succeeds but the site looks outdated, check firebase.json "public" path or frameworks config. It must match your build output (e.g., dist or build).
• Environment variables: Ensure any build-time variables are set in your CI or framework config so the production build matches your expectations.
• Worktrees in Cursor: If you can’t switch to main locally due to a worktree lock, it doesn’t affect Path B. You can still deploy the desired branch via Actions (branch input). To clean locally later:
git worktree list
git worktree remove /path/to/unused-worktree

— — —

Quick Links (keep these for daily use)
• GitHub Actions: [https://github.com/OWNER/REPO/actions](https://github.com/OWNER/REPO/actions)
• Compare & PRs: [https://github.com/OWNER/REPO/compare](https://github.com/OWNER/REPO/compare)  and  [https://github.com/OWNER/REPO/pulls](https://github.com/OWNER/REPO/pulls)
• Firebase Hosting: [https://console.firebase.google.com/project/YOUR_PROJECT_ID/hosting](https://console.firebase.google.com/project/YOUR_PROJECT_ID/hosting)
• Hosting Settings: [https://console.firebase.google.com/project/YOUR_PROJECT_ID/hosting/settings](https://console.firebase.google.com/project/YOUR_PROJECT_ID/hosting/settings)
• Production URLs: https://YOUR_CUSTOM_DOMAIN  and  [https://YOUR_SITE_ID.web.app](https://YOUR_SITE_ID.web.app)

