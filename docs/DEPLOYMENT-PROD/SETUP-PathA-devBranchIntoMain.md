# Path A — One-Time Setup (Preview → Promote to Production) - Working in Dev Branch then Pushing To Main

**Goal:** Every pull request (PR) from your `dev` branch into `main` automatically builds a **preview URL** you can test.
When you merge that PR, GitHub Actions automatically deploys to **production**.

---

### Step 1 – Confirm your repo and branches inside Cursor

1. Open your project in **Cursor**.
2. Look at the bottom status bar; confirm you’re on the branch you develop on (for example `dev`).
3. In the left sidebar, open **Source Control** → make a small change (even a test line in `README.md`) → **Commit** → **Push**.
   This confirms Cursor is talking correctly to your GitHub repository.

---

### Step 2 – Add the GitHub Actions workflow

You need a workflow file that tells GitHub how to build and deploy your site automatically.

1. In Cursor’s file explorer, open the folder `.github/workflows/`.

   * If it doesn’t exist, create those folders.
2. Inside that folder, create a new file called **`firebase-hosting.yml`**.
3. Paste the following content:

```yaml
name: Firebase Hosting (Preview & Prod)

on:
  pull_request:
    branches: [ main ]     # PRs targeting main create a preview deploy
  push:
    branches: [ main ]     # Merges to main deploy to production
  workflow_dispatch:       # Lets you run it manually for any branch
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

      - name: Install dependencies
        run: npm ci

      - name: Build project
        run: npm run build

      - name: Deploy to Firebase Hosting
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: ${{ secrets.GITHUB_TOKEN }}
          projectId: YOUR_PROJECT_ID
          channelId: ${{ (github.event_name == 'pull_request' || inputs.target == 'preview') && 'pr-${{ github.event.number || 'manual' }}' || 'live' }}
          # If you have multiple hosting sites, uncomment and specify:
          # target: YOUR_SITE_ID
```

4. Commit and push this new file:

   * Cursor → **Source Control** → Stage → Commit → Push.

You can check the workflow appears at:
**[https://github.com/OWNER/REPO/actions](https://github.com/OWNER/REPO/actions)**

---

### Step 3 – Verify Firebase Hosting setup

1. Open **Firebase Console → Hosting**:
   [https://console.firebase.google.com/project/YOUR_PROJECT_ID/hosting](https://console.firebase.google.com/project/YOUR_PROJECT_ID/hosting)
2. Confirm your **default site** (or your custom site ID).
3. Make sure your **custom domain** (for example `2025.partytillyou.rip`) shows “Connected” and the SSL icon is green.
4. If needed, go to **Hosting → Settings** for GitHub integration details:
   [https://console.firebase.google.com/project/YOUR_PROJECT_ID/hosting/settings](https://console.firebase.google.com/project/YOUR_PROJECT_ID/hosting/settings)

---

### Step 4 – Check your `firebase.json`

In your project root you must have a `firebase.json` file that tells Hosting where your built site files live.
Typical example for a single-page app:

```json
{
  "hosting": {
    "public": "dist",                     // or "build" if your framework uses that
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [{ "source": "**", "destination": "/index.html" }]
  }
}
```

If you’re using a Firebase-supported framework (like Next.js or React with automatic detection), it may instead contain `"frameworksBackend": {}` — both are fine.

---

### Step 5 – (Option A) Link GitHub to Firebase through the Console (UI method)

If you want to also connect it visually:

1. Go to **Firebase → Hosting** in the console.
2. In the **GitHub Integration** card, click **Link a repository**.
3. Follow the prompts to authenticate with GitHub and choose your repo.

This step is optional if you’re already using the YAML workflow above; it just provides an extra UI status link inside Firebase.

---

### Step 6 – Test it

1. Make a small change in Cursor on your `dev` branch.
2. Commit + Push.
3. On GitHub, create a Pull Request (base = main, compare = dev).
4. In the PR’s **Checks** section, look for **Firebase Hosting Preview** → click the preview URL.
5. Merge the PR → watch the **Actions** tab → your site should deploy to production.
