# Path A — Daily Runbook (Preview dev → Promote to Production)

**Purpose:**
This document is for your *daily* workflow when you’re developing in a feature or `dev` branch.
You’ll use it to:

* Build and push your branch from Cursor
* Create a pull request to preview it
* Verify the preview URL
* Then promote to production when you’re ready

---

### Step 1 — Confirm environment in Cursor

1. Open your project in **Cursor**.
2. Look at the bottom status bar to confirm the **current branch** (for example `dev`, `feature-x`, or `v3.0.0`).
3. Make sure you’re connected to your GitHub repository (Cursor should show your remote branch tracking info).

> If Cursor asks to “Publish Branch” or “Track Remote,” accept it.

---

### Step 2 — Commit and push your work

1. In Cursor, open the **Source Control** panel (the branch icon on the left).
2. Stage all changes (click the “+” next to each file or “Stage All”).
3. Write a clear commit message such as:
   `feat: updated navigation bar layout`
4. Click **Commit**.
5. Click **Sync Changes** or **Push** (depending on your Cursor version).

Your updates are now live in your GitHub branch.

---

### Step 3 — Create a Pull Request to main

1. Inside Cursor, open the **Command Palette** (`Ctrl+Shift+P` or `Cmd+Shift+P` on Mac).
   Type: `GitHub: Create Pull Request`

   * Base branch = `main`
   * Compare branch = your current branch (e.g., `dev`)
2. Alternatively, open the web view:
   [https://github.com/OWNER/REPO/compare](https://github.com/OWNER/REPO/compare)

   * Set **base** to `main`
   * Set **compare** to your dev branch
   * Click **Create pull request**

Name your PR something clear (e.g. *“2025 update – navbar redesign”*).

---

### Step 4 — Wait for the Firebase Hosting Preview

Once the PR is open, GitHub Actions automatically runs the workflow you created earlier (`firebase-hosting.yml`).

You’ll see a **check** under your PR titled:
**Firebase Hosting: Preview Channel** or **Firebase Hosting Preview**.

When it finishes, it posts a **preview URL** like this:
`https://PR-1234-YOUR_SITE_ID.web.app`

This is a live, temporary version of your site showing that branch’s code.

---

### Step 5 — Test and review your preview

1. Open the preview URL in your browser.
2. Test all important functions: routing, APIs, forms, authentication, etc.
3. Share the link with any testers or collaborators.

If you find anything wrong, go back to Cursor, make fixes, and **push more commits**.
GitHub Actions automatically rebuilds the preview each time you push.

---

### Step 6 — Promote to production

When the preview looks correct and you’re ready to make it live:

1. Go to your Pull Request on GitHub.
2. Click **Merge pull request** → **Confirm merge**.
3. GitHub Actions automatically runs another deploy — this time to **production** (your live domain).
4. Watch deployment logs at:
   [https://github.com/OWNER/REPO/actions](https://github.com/OWNER/REPO/actions)
   (Look for a job named *Firebase Hosting (Preview & Prod)*)

Once it completes successfully:

* Production URL (your live site): `https://YOUR_CUSTOM_DOMAIN`
* Backup Firebase domain: `https://YOUR_SITE_ID.web.app`
* Verify in Firebase Hosting Console:
  [https://console.firebase.google.com/project/YOUR_PROJECT_ID/hosting](https://console.firebase.google.com/project/YOUR_PROJECT_ID/hosting)

---

### Step 7 — Close out for the day

After confirming production is correct:

1. Go back to your Pull Request page.
2. Click **Delete branch** (this removes the merged branch from GitHub).
3. Optionally, confirm your Preview Channel auto-expired in Firebase (Hosting → “Channels” tab).

Your `main` branch now reflects the live production version.

---

### Step 8 — Reset your local environment (optional)

If you want Cursor back on the `dev` branch for the next day’s work:

```bash
git checkout dev
git pull
```

or use the Cursor branch switcher (bottom left) and select `dev`.

Now you’re ready to start a new cycle.

---

**Summary of your Day-to-Day Routine**

| Action      | What to Do                           | Where           |
| ----------- | ------------------------------------ | --------------- |
| Develop     | Edit and push on `dev` branch        | Cursor          |
| Preview     | Create PR → wait for preview link    | GitHub          |
| Review/Test | Open preview URL                     | Browser         |
| Deploy      | Merge PR                             | GitHub          |
| Confirm     | Check production and Hosting console | Firebase        |
| Close Out   | Delete merged branch, reset Cursor   | GitHub / Cursor |

