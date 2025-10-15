# CI/CD Pipeline Snapshot & Runbook

A living document to finish setup, document how it works, and simplify future troubleshooting. I’ve pre‑filled what we know and left **[TODO]** blocks where we need your inputs.

---

## 1) Project Overview (Quick Facts)

* **Goal:** Migrate website from Lovable AI to Google Cloud / Firebase Hosting with a clean CI/CD pipeline from GitHub.
* **Domains:**

  * `partytillyou.rip` – **DNS at Cloudflare**.

    * Subdomain in use: `2025.partytillyou.rip` → will point to Firebase Hosting site.
  * `data-warrior.com` – **DNS at Squarespace** (will configure after the above is stable).
* **Repo:** `github.com/fso-datawarrior/twisted-hearth-foundation` (**[confirm org/repo if different]**).
* **Firebase:** Hosting connected to project **[PROJECT_ID]** (**[TODO: confirm actual Firebase project ID]**).
* **Auth to Google Cloud:** GitHub → Google Cloud using **Workload Identity Federation (WIF)**; deploys run via a **Service Account** with Hosting permissions.

---

## 2) Where to Click (Handy Links)

> Replace `PROJECT_ID` with your real Firebase/GCP project id.

* **Firebase console – Hosting:** `https://console.firebase.google.com/project/PROJECT_ID/hosting`
* **Firebase console – Project settings:** `https://console.firebase.google.com/project/PROJECT_ID/settings/general`
* **GCP – Service Accounts:** `https://console.cloud.google.com/iam-admin/serviceaccounts?project=PROJECT_ID`
* **GCP – IAM (role bindings):** `https://console.cloud.google.com/iam-admin/iam?project=PROJECT_ID`
* **GCP – Workload Identity Federation (Pools/Providers):** `https://console.cloud.google.com/iam-admin/workload-identity-pools?project=PROJECT_ID`
* **Cloudflare – Dashboard:** `https://dash.cloudflare.com/` → choose **partytillyou.rip** → **DNS**.
* **Squarespace – Domains:** `https://account.squarespace.com/domains` → choose **data-warrior.com** → **DNS Settings**.
* **GitHub – Actions:** `https://github.com/fso-datawarrior/twisted-hearth-foundation/actions`
* **GitHub – Repository secrets:** `https://github.com/fso-datawarrior/twisted-hearth-foundation/settings/secrets/actions`

---

## 3) GitHub → Firebase CI/CD: Target State

**What the pipeline does** (plain English):

1. When you push to `main` (or merge a PR), GitHub Actions runs.
2. It **authenticates to Google Cloud** without JSON keys using **Workload Identity Federation (WIF)**. (This is more secure than storing keys.)
3. It runs `firebase deploy --only hosting` to upload the latest build to Firebase Hosting.
4. It posts deploy logs and marks the workflow green/red.

**Branches/Environments (suggested):**

* `main` → **Production** Hosting site.
* `dev`  → **Preview** channels or a **staging** site (optional).

**[TODO]** Confirm branch names and whether you want a dedicated staging site.

---

## 4) Google Service Account & WIF (Current Status)

We previously noted:

* Service Account: something like `firebase-adminsdk-fbsvc@PROJECT_ID.iam.gserviceaccount.com` (**[TODO: confirm exact SA email]**)
* WIF binding added: **Workload Identity User** for GitHub repo principal set:

  ```
  ```

principalSet://iam.googleapis.com/projects/1017057598145/locations/global/workloadIdentityPools/github-pool/attribute.repository/fso-datawarrior/twisted-hearth-foundation

````
(From prior notes; please verify the **project number**, **pool name**, and **repo path** match your environment.)

**Required roles on the Service Account (minimal functional set):**
- `Firebase Hosting Admin` *(or)* `Firebase Admin` *(broader)*
- `Service Account Token Creator` *(lets WIF mint short‑lived tokens)*
- Optionally `Viewer` roles for debugging (`Logs Viewer`), if you want CI to fetch logs.

**Verify in the console:**
1) Open **Service Accounts**: `https://console.cloud.google.com/iam-admin/serviceaccounts?project=PROJECT_ID`.
2) Click your SA → **Permissions** tab → confirm the roles above.
3) Open **Workload Identity Federation**: `https://console.cloud.google.com/iam-admin/workload-identity-pools?project=PROJECT_ID` → your **Pool** (e.g., `github-pool`) → **Provider** (GitHub). Confirm the **attribute.repository** matches `fso-datawarrior/twisted-hearth-foundation`.

**[TODO]** Paste screenshots or confirm the pool/provider names and SA email.

---

## 5) GitHub Actions Workflow (YAML)
Create `.github/workflows/deploy.yaml` with this template (safe defaults):
```yaml
name: Deploy to Firebase Hosting

on:
push:
  branches: [ "main" ]
workflow_dispatch: {}

permissions:
contents: read
id-token: write  # required for Workload Identity Federation

jobs:
deploy:
  runs-on: ubuntu-latest

  steps:
    - name: Checkout
      uses: actions/checkout@v4

    - name: Set up Node.js
      uses: actions/setup-node@v4
      with:
        node-version: "20"

    - name: Install deps
      run: |
        npm ci || npm install

    - name: Build
      run: |
        npm run build || echo "No build step"

    - name: Auth to Google Cloud (WIF)
      uses: google-github-actions/auth@v2
      with:
        workload_identity_provider: ${{ secrets.GCP_WIF_PROVIDER }}
        service_account: ${{ secrets.GCP_DEPLOY_SA }}

    - name: Install Firebase CLI
      run: npm i -g firebase-tools

    - name: Deploy to Firebase Hosting
      run: |
        firebase deploy --only hosting --project ${{ secrets.GCP_PROJECT_ID }} --non-interactive
````

**GitHub Secrets to add** (`Settings` → `Secrets and variables` → `Actions`):

* `GCP_PROJECT_ID` → your GCP/Firebase project id (e.g., `my-app-prod`).
* `GCP_DEPLOY_SA` → SA email, e.g., `firebase-deployer@PROJECT_ID.iam.gserviceaccount.com`.
* `GCP_WIF_PROVIDER` → full resource path to your WIF provider, e.g.,
  `projects/1017057598145/locations/global/workloadIdentityPools/github-pool/providers/github`

**[TODO]** Confirm the exact values to save as secrets.

---

## 6) Firebase Hosting: Site & Channels

**Check Hosting site name:** `https://console.firebase.google.com/project/PROJECT_ID/hosting` → **Sites** tab. Typical default is your project ID.

**Preview channels (optional but recommended):**

* Enable PR previews with `firebase hosting:channel:deploy` or the official Firebase GitHub Action. Great for testing before prod.

**[TODO]** Confirm if you want PR previews and a staging site.

---

## 7) Domains & DNS

### 7.1 Cloudflare (`partytillyou.rip`)

* You added a **CNAME** with **Name** = `2025`. In Cloudflare, the **Name** field is the **subdomain label**, so `Name = 2025` resolves to the **FQDN** `2025.partytillyou.rip`. That’s how the subdomain is identified.
* Ensure the CNAME points to the **target** shown in Firebase Hosting’s **Connect domain** wizard (not a random A record). The wizard will list a verification **TXT** and a hosting **CNAME** target specifically for that subdomain.
* If you previously had an **A record** for `2025` (or a wildcard `*`) pointing elsewhere, delete it so the CNAME can take effect. Conflicting records will block the CNAME.
* In Cloudflare DNS, the **orange cloud** (proxy) can interfere with Firebase verification. If verification fails, set the record to **DNS‑only (gray cloud)** until verification completes, then you can try switching back if needed.

**Steps (exact clicks):**

1. Go to `https://console.firebase.google.com/project/PROJECT_ID/hosting` → **Add custom domain** → enter `2025.partytillyou.rip` and follow prompts. Keep that tab open showing the exact TXT/CNAME values.
2. Open `https://dash.cloudflare.com/` → select **partytillyou.rip** → left sidebar **DNS** → **Records** → **Add record**.
3. **Type:** `TXT` → **Name:** *as shown by Firebase (often `2025` or `_firebase` prefix)* → **Content:** the verification string → **Save**.
4. **Type:** `CNAME` → **Name:** `2025` → **Target:** *exact CNAME target from Firebase wizard* → **Proxy status:** **DNS only** → **Save**.
5. Back in Firebase → click **Verify**. DNS can take a few minutes, but Cloudflare is usually quick.
6. Once verified, Firebase will issue/activate TLS and show the domain as **Connected**.

**If a record “doesn’t show up”**:

* Refresh Cloudflare DNS page, ensure you’re on the correct **account/zone**.
* Check for a conflicting record (another `CNAME`/`A`/`AAAA` for `2025`). Delete conflicts.
* Clear Cloudflare **proxied** status (use **DNS‑only**).
* Use an external lookup like `nslookup 2025.partytillyou.rip` from your machine to confirm public DNS.

### 7.2 Squarespace (`data-warrior.com`)

We’ll configure **after** `2025.partytillyou.rip` is live, but the flow is similar:

1. Firebase Hosting → **Add custom domain** → enter `www.data-warrior.com` (recommended to start with `www`).
2. Squarespace Domains: `https://account.squarespace.com/domains` → pick **data-warrior.com** → **DNS Settings** → add the **TXT** and **CNAME** that Firebase shows.
3. For the **apex** `data-warrior.com`, Firebase typically asks for **A/AAAA** records pointing to Google front‑ends. Add those only if/when you want apex traffic to go to Firebase. Otherwise set up an **HTTP redirect** from apex → `www` inside Squarespace or via DNS provider features.

**[TODO]** After we finish `2025.partytillyou.rip`, paste the exact record values shown in the Firebase wizard for `www.data-warrior.com` and apex.

---

## 8) App Build Output

* **Where are static files?** E.g., `dist/` or `build/`. Configure `firebase.json` accordingly.
* Example `firebase.json`:

```json
{
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "cleanUrls": true,
    "trailingSlash": false
  }
}
```

**[TODO]** Confirm your actual build folder and any rewrites (SPAs often need `rewrites` to `/index.html`).

---

## 9) End‑to‑End Checklist

* [ ] GitHub workflow file committed on default branch.
* [ ] GitHub Secrets `GCP_PROJECT_ID`, `GCP_DEPLOY_SA`, `GCP_WIF_PROVIDER` set.
* [ ] Service Account exists and has roles: `Firebase Hosting Admin`, `Service Account Token Creator`.
* [ ] WIF pool/provider maps to `fso-datawarrior/twisted-hearth-foundation`.
* [ ] Firebase Hosting site exists and deploy works via CLI locally (`firebase deploy`).
* [ ] Cloudflare DNS: TXT + CNAME for `2025.partytillyou.rip` in **DNS‑only** during verification.
* [ ] Domain shows **Connected** in Firebase Hosting (TLS active).
* [ ] Push to `main` triggers workflow and deploys successfully.

---

## 10) Troubleshooting Guide

**A) Domain verification fails**

* Use **DNS‑only** (gray cloud) in Cloudflare for the records until verified.
* Ensure **no conflicting A/AAAA/CNAME** exist for the same name.
* Wait a few minutes and retry **Verify** in Firebase Hosting.
* Check external DNS: `nslookup 2025.partytillyou.rip` or `dig`.

**B) Workflow cannot authenticate**

* Error like `permission denied` or `unauthorized`: confirm `id-token: write` permission in YAML.
* Verify the **WIF provider path** and **Service Account email** in GitHub secrets.
* In GCP, open the WIF provider and confirm **attribute.repository** exactly matches `fso-datawarrior/twisted-hearth-foundation` (case‑sensitive) and **issuer** is GitHub.
* Ensure the SA has `Service Account Token Creator`.

**C) Deploy step fails (`firebase deploy`)**

* Make sure `firebase-tools` is installed in the job.
* Verify `firebase.json` points to the correct `public` build folder.
* If build artifacts are missing, ensure `npm run build` actually outputs to the folder in `firebase.json`.

**D) Page shows 404 after deploy**

* SPA needs rewrites: add

  ```json
  {
    "rewrites": [ { "source": "**", "destination": "/index.html" } ]
  }
  ```

  inside `hosting` in `firebase.json`.

**E) Old content still appears**

* Confirm the GitHub Action ran on the commit you expect.
* Check **Preview channels** vs **Production** deployment in Firebase Hosting UI.
* Hard refresh or query with `?v=timestamp` to bypass caches.

---

## 11) What I Still Need From You

Please paste/confirm the following so I can lock everything down:

1. **Firebase project ID** and whether there’s a separate **staging** project.
2. **Service Account email** used for deploys.
3. **WIF**: project number, pool name, provider name (a screenshot is perfect).
4. **GitHub default branch** (`main`?) and whether you want PR preview channels.
5. **Build output folder** (e.g., `dist/`, `build/`) and whether this is an SPA needing rewrites.
6. **Exact DNS records** Firebase showed for `2025.partytillyou.rip` (TXT + CNAME) and their current status in Cloudflare.
7. After we’re good with `2025.partytillyou.rip`: the same for `www.data-warrior.com` (and apex) in Squarespace.

---

## 12) Operating the Pipeline (Once Live)

* **Deploy to Production:** Merge to `main`. Action runs automatically and deploys.
* **Manual Deploy:** GitHub → **Actions** → **Deploy to Firebase Hosting** → **Run workflow** (useful for re‑deploying the latest commit).
* **Rollbacks:** In Firebase Hosting UI → **Releases** tab → select a previous release and **Rollback**.
* **Logs:** GitHub Action logs, and Firebase console → **Hosting** → **View logs** for request/serve logs.

---

## 13) Appendix: Optional Enhancements

* Protect production with **Required PR reviews** and **branch protection** in GitHub.
* Add a `dev` branch + **staging** site or **Preview channels** for PRs.
* Add **Status checks** (Lighthouse CI, ESLint) before deploy step.
* Use **`concurrency`** in Actions to cancel redundant builds on rapid pushes.

---

*As you share the TODO details/screenshots, I’ll fill them in here so this becomes your final, copy‑pastable runbook.*
