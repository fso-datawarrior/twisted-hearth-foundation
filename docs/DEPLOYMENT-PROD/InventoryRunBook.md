# Firebase Deployment Procedures for Twisted Hearth Foundation

> Project: **twisted-hearth-foundation**
> Environment: Firebase Hosting + Supabase Backend
> Author: FSO Data Warrior
> Purpose: This document explains both methods for deploying updates — directly to production or safely as a preview.

---

## 1. Overview

Firebase Hosting can only have **one active production site** per project (your `.web.app` domain).
You can deploy from **any branch**, but production always serves the files from the last `firebase deploy` command executed.

Firebase also supports **Preview Channels**, which let you temporarily publish builds from any branch to a separate preview URL for testing.

---

## 2. Option A — Deploy a Branch Directly to Production

**Use this when:** your branch is stable and you’re ready for the live site to update.

### 🔧 Steps

1. **Make sure you’re on the branch you want to deploy:**

   ```bash
   git branch
   # You should see * your-branch-name
   ```

2. **Build the project:**

   ```bash
   npm ci
   npm run build
   ```

3. **Deploy to Firebase production:**

   ```bash
   firebase deploy --only hosting
   ```

   * Firebase uploads everything inside `dist/` to the production CDN.
   * You’ll see:

     ```
     ✔  Deploy complete!
     Hosting URL: https://twisted-hearth-foundation.web.app
     ```

4. **Verify deployment:**

   * Visit [https://twisted-hearth-foundation.web.app](https://twisted-hearth-foundation.web.app)
   * Hard refresh (**Ctrl + Shift + R**) to bypass CDN cache.
   * Confirm new changes are visible.

### 💡 Notes

* Deploying from any branch overwrites production with that branch’s build.
* Recommended only when QA or testing on the branch is complete.
* Tag the release version in GitHub for tracking:

  ```bash
  git tag -a vX.Y.Z -m "Production release vX.Y.Z"
  git push origin vX.Y.Z
  ```

---

## 3. Option B — Deploy to a Preview Channel

**Use this when:** you want to test or share updates without affecting production.

### 🔧 Steps

1. **Stay on your feature/development branch:**

   ```bash
   git branch  # confirm you’re on your working branch
   ```

2. **Build the project:**

   ```bash
   npm ci
   npm run build
   ```

3. **Deploy to a named preview channel:**

   ```bash
   firebase hosting:channel:deploy <channel-name>
   ```

   Example:

   ```bash
   firebase hosting:channel:deploy batch4-patch-preview
   ```

   * Output will show something like:

     ```
     Hosting URL: https://batch4-patch-preview--twisted-hearth-foundation.web.app
     ```
   * This preview link expires automatically after **7 days** (default).

4. **Review & share:**

   * Open the preview URL and verify changes.
   * Share the link for testing and QA.

5. **When ready, promote to production:**

   ```bash
   git checkout main
   git merge <your-branch-name>
   git push origin main
   firebase deploy --only hosting
   ```

---

## 4. Troubleshooting

| Issue              | Cause                                        | Fix                                                                                |
| ------------------ | -------------------------------------------- | ---------------------------------------------------------------------------------- |
| Site didn’t update | Deployed from wrong branch or didn’t rebuild | Check branch → rebuild → redeploy                                                  |
| Old assets showing | CDN/browser caching                          | Hard refresh or append `?v=2` to URL                                               |
| Build errors       | Dependency mismatch                          | Run `npm ci` to reset modules                                                      |
| 404 on refresh     | Missing SPA rewrite rule                     | Ensure `firebase.json` includes `{ "source": "**", "destination": "/index.html" }` |

---

## 5. Best Practices

* Always **build before deploying**.
* Keep `main` as production source of truth.
* Tag every production deployment.
* Use **Preview Channels** for review and testing.
* Avoid direct deploys from untested branches.

---

## 6. Quick Command Reference

| Action               | Command                                          |
| -------------------- | ------------------------------------------------ |
| Deploy production    | `firebase deploy --only hosting`                 |
| Deploy preview       | `firebase hosting:channel:deploy <channel-name>` |
| Check preview links  | `firebase hosting:channel:list`                  |
| Delete old previews  | `firebase hosting:channel:delete <channel-name>` |
| Build project        | `npm run build`                                  |
| Check current branch | `git branch`                                     |

---

### ✅ Summary

| Goal               | Command                                  | Result                                        |
| ------------------ | ---------------------------------------- | --------------------------------------------- |
| Push updates live  | `firebase deploy --only hosting`         | Updates `.web.app` site immediately           |
| Test branch safely | `firebase hosting:channel:deploy <name>` | Temporary preview link (expires after 7 days) |

Keep this document with your Firebase runbook so you can confidently update or preview your site anytime.
