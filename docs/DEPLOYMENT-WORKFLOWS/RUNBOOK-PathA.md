# Path A — Daily Runbook (Preview dev → Promote to Production)

**Purpose:** Standard workflow for team collaboration and safe deployments.

**Prerequisites:** Complete `UNIFIED-SETUP.md` first.

---

## Quick Start

**When to use:** Team work, important features, bug fixes, stable releases  
**Time needed:** 15-30 minutes (including review time)  
**Safety level:** High (preview + review process)

---

## Step 1 — Confirm Environment

1. Open project in **Cursor**
2. Check bottom status bar for current branch (e.g., `dev`, `3.1.0-dev-feature`)
3. Verify connection to GitHub (should show remote tracking info)

> If Cursor asks to "Publish Branch" or "Track Remote," accept it.

---

## Step 2 — Commit and Push Your Work

1. Open **Source Control** panel (branch icon, left sidebar)
2. Stage all changes (click "+" next to each file or "Stage All")
3. Write clear commit message:
   ```
   feat: updated navigation bar layout
   fix: resolved authentication redirect issue
   ```
4. Click **Commit**
5. Click **Sync Changes** or **Push**

Your updates are now live in your GitHub branch.

---

## Step 3 — Create Pull Request

**Option A: In Cursor**
1. Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P`)
2. Type: `GitHub: Create Pull Request`
3. Base branch = `main`
4. Compare branch = your current branch

**Option B: GitHub Web**
1. Go to: https://github.com/OWNER/REPO/compare
2. Set **base** to `main`
3. Set **compare** to your dev branch
4. Click **Create pull request**

**PR Title Examples:**
- "2025 update – navbar redesign"
- "Fix authentication redirect loop"
- "Add user settings page"

---

## Step 4 — Wait for Preview Deploy

GitHub Actions automatically runs the workflow when PR is created.

**Look for:**
- **Check name:** "Firebase Hosting Preview"
- **Preview URL:** `https://pr-123-twisted-hearth-foundation.web.app`

**If preview fails:**
- Check Actions tab for error logs
- Ensure PR targets `main` branch
- Verify your branch has recent commits

---

## Step 5 — Test Preview

1. **Open preview URL** in browser
2. **Test critical functions:**
   - Navigation and routing
   - Forms and authentication
   - API calls and data loading
   - Mobile responsiveness
3. **Share with team** for review

**If issues found:**
- Go back to Cursor
- Make fixes and push more commits
- Preview automatically rebuilds

---

## Step 6 — Get Team Approval

**Request review from:**
- Team members familiar with the changes
- Code reviewers (if required)
- Product owner (for feature changes)

**Review checklist:**
- Code quality and best practices
- UI/UX changes look correct
- No breaking changes
- Performance impact acceptable

---

## Step 7 — Merge to Production

When preview is approved:

1. **Go to your Pull Request** on GitHub
2. **Click "Merge pull request"** → **"Confirm merge"**
3. **Watch deployment:**
   - Go to Actions tab
   - Look for "Firebase Hosting (Preview & Prod)" job
   - Wait for "Deploy to Firebase Hosting" step to complete

**Production URLs:**
- Live site: https://2025.partytillyou.rip
- Backup: https://twisted-hearth-foundation.web.app

---

## Step 8 — Verify Production

1. **Open production URL:** https://2025.partytillyou.rip
2. **Smoke test** critical paths
3. **Check Firebase Console:**
   - https://console.firebase.google.com/project/twisted-hearth-foundation/hosting
   - Verify new release appears
   - Check deployment timestamp

---

## Step 9 — Clean Up

**Delete merged branch:**
1. Go back to Pull Request page
2. Click **"Delete branch"** (removes from GitHub)
3. **Optional:** Confirm preview channel auto-expired in Firebase

**Reset local environment:**
```bash
git checkout dev
git pull
```

Or use Cursor's branch switcher (bottom left) and select `dev`.

---

## Daily Workflow Summary

| Action | What to Do | Where |
|--------|------------|-------|
| **Develop** | Edit and push on `dev` branch | Cursor |
| **Preview** | Create PR → wait for preview link | GitHub |
| **Review** | Test preview, get team approval | Browser + Team |
| **Deploy** | Merge PR → auto-deploy to production | GitHub |
| **Verify** | Check production site | Browser + Firebase |
| **Clean Up** | Delete branch, reset to dev | GitHub + Cursor |

---

## Troubleshooting

**Preview URL not working:**
- Check PR targets `main` branch
- Verify workflow ran in Actions tab
- Ensure branch has recent commits

**Merge failed:**
- Check for merge conflicts
- Ensure all required checks passed
- Verify branch protection rules

**Production site not updated:**
- Check Actions tab for deployment errors
- Verify Firebase Console shows new release
- Clear browser cache and try again

**Rollback needed:**
- Firebase Console → Hosting → Releases
- Select previous release → Rollback
- Or revert the PR on GitHub

---

## Quick Links

- **GitHub Actions:** https://github.com/OWNER/REPO/actions
- **Create PR:** https://github.com/OWNER/REPO/compare
- **Firebase Hosting:** https://console.firebase.google.com/project/twisted-hearth-foundation/hosting
- **Production Site:** https://2025.partytillyou.rip
- **Decision Guide:** `WHICH-PATH-GUIDE.md`
