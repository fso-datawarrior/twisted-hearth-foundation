# Path B — Daily Runbook (Deploy Branch Directly to Production)

**Purpose:** Manual deployment workflow for rapid iteration and urgent fixes.

**Prerequisites:** Complete `UNIFIED-SETUP.md` first.

---

## Quick Start

**When to use:** Rapid iteration, hotfixes, experimental features, solo work  
**Time needed:** 5-10 minutes  
**Safety level:** Medium (no preview, direct to production)

**⚠️ Important:** Always reset production to `main` at end of day!

---

## Step 1 — Confirm Branch and Push Changes

1. **Open project in Cursor**
2. **Check current branch** (bottom status bar)
3. **Stage, commit, and push:**
   ```bash
   git add .
   git commit -m "feat: experimental feature for testing"
   git push
   ```

**Ensure GitHub has your latest code before deploying.**

---

## Step 2 — Notify Team (Recommended)

**Post in team channel:**
```
🚀 Deploying branch 3.1.0-dev-email-cleanup (commit abc123) 
directly to production via Path B. I'll restore prod to main at EOD.
```

**This prevents surprises and keeps everyone informed.**

---

## Step 3 — Deploy via GitHub Actions

1. **Go to GitHub Actions:**
   https://github.com/OWNER/REPO/actions

2. **Find the workflow:**
   - Left sidebar: Click **"Firebase Hosting (Preview & Prod)"**

3. **Run workflow manually:**
   - Top-right: Click **"Run workflow"**
   - **Branch:** Enter your branch name (e.g., `3.1.0-dev-email-cleanup`)
   - **Target:** Select `production`
   - Click **"Run workflow"**

4. **Watch deployment:**
   - Monitor the job logs
   - Wait for "Deploy to Firebase Hosting" step to complete
   - Should show "Success" when done

---

## Step 4 — Verify Live Deployment

**Check production URLs:**
- **Primary:** https://2025.partytillyou.rip
- **Backup:** https://twisted-hearth-foundation.web.app

**Verify in Firebase Console:**
- https://console.firebase.google.com/project/twisted-hearth-foundation/hosting
- Check that new release appears
- Note the deployment timestamp

**Smoke test critical functions:**
- Homepage loads correctly
- Authentication works
- Key features function as expected
- Mobile responsiveness

---

## Step 5 — Continue Development (Same Day)

**If you need to make more changes:**

1. **Edit code in Cursor**
2. **Commit and push:**
   ```bash
   git add .
   git commit -m "fix: adjust styling based on production feedback"
   git push
   ```
3. **Re-run the workflow:**
   - Go back to Actions
   - Run workflow again with same branch
   - Target = `production`

**This updates production with your latest changes.**

---

## Step 6 — End of Day Reset

**⚠️ CRITICAL: Reset production to `main` before ending your day!**

**Choose one option:**

### Option A: Reset to Main (Discard Changes)
1. **Go to Actions:** https://github.com/OWNER/REPO/actions
2. **Run workflow:**
   - Branch: `main`
   - Target: `production`
3. **Verify:** Production now matches `main` branch

### Option B: Merge to Main (Keep Changes)
1. **Create PR:** https://github.com/OWNER/REPO/compare
   - Base: `main`
   - Compare: your dev branch
2. **Merge PR** (auto-deploys to production)
3. **Verify:** Production now has your changes in `main`

**Post team update:**
```
✅ Production restored to main branch. 
Path B experiment complete.
```

---

## Emergency Rollback

**If something goes wrong immediately:**

1. **Firebase Console Rollback:**
   - Go to: https://console.firebase.google.com/project/twisted-hearth-foundation/hosting
   - Click **"Releases"** tab
   - Select the last known good release
   - Click **"Rollback"**

2. **This instantly restores the previous version** (no code changes needed)

---

## Daily Workflow Summary

| Action | What to Do | Where |
|--------|------------|-------|
| **Develop** | Edit and push on any branch | Cursor |
| **Notify** | Tell team about Path B deploy | Team Channel |
| **Deploy** | Run workflow manually | GitHub Actions |
| **Verify** | Test production site | Browser + Firebase |
| **Iterate** | Make more changes if needed | Cursor → Actions |
| **Reset** | Restore prod to main at EOD | GitHub Actions |

---

## Safety Checklist

**Before deploying:**
- [ ] Tested changes locally
- [ ] Committed and pushed latest code
- [ ] Notified team about Path B usage
- [ ] Have rollback plan ready

**After deploying:**
- [ ] Verified production site works
- [ ] Checked Firebase Console for new release
- [ ] Documented what was deployed
- [ ] Planned end-of-day reset

**End of day:**
- [ ] Reset production to `main` branch
- [ ] Notified team that reset is complete
- [ ] Either merged changes to `main` OR discarded them

---

## Troubleshooting

**Deployment fails:**
- Check Actions logs for specific error
- Ensure branch name is correct
- Verify branch has recent commits
- Check Firebase project permissions

**Site looks outdated after "success":**
- Verify `firebase.json` points to `"public": "dist"`
- Check that `npm run build` works locally
- Clear browser cache and try again

**Can't switch to main locally:**
- This doesn't affect Path B deployment
- You can still deploy any branch via Actions
- Clean up worktrees later:
  ```bash
  git worktree list
  git worktree remove /path/to/unused-worktree
  ```

**Team is surprised by changes:**
- Always notify before using Path B
- Consider using Path A for team collaboration
- Document what was deployed and why

---

## Quick Links

- **GitHub Actions:** https://github.com/OWNER/REPO/actions
- **Firebase Hosting:** https://console.firebase.google.com/project/twisted-hearth-foundation/hosting
- **Production Site:** https://2025.partytillyou.rip
- **Decision Guide:** `WHICH-PATH-GUIDE.md`
- **Path A Runbook:** `RUNBOOK-PathA.md`
