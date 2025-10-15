# 🌐 Firebase + Cloudflare Custom Domain Setup  
### Example: `2025.partytillyou.rip` → `twisted-hearth-foundation.web.app`

This document provides a detailed, verified guide for connecting a **Cloudflare-managed subdomain** to a **Firebase Hosting site** hosted on Google Cloud.  
It includes exact configuration steps, verification checks, troubleshooting, and optional Cloudflare tuning.

---

## 🧩 Overview

| Component | Details |
|------------|----------|
| **Root Domain** | `partytillyou.rip` |
| **Subdomain Used** | `2025.partytillyou.rip` |
| **DNS Provider** | Cloudflare |
| **Hosting Platform** | Firebase Hosting (Google Cloud) |
| **Firebase Project Name** | `twisted-hearth-foundation` |
| **Firebase Project ID** | `twisted-hearth-foundation` |
| **Default Firebase URL** | `https://twisted-hearth-foundation.web.app` |

**Goal:** Connect the subdomain `2025.partytillyou.rip` to your Firebase-hosted site securely via HTTPS.

---

## 🧱 Step 1. Prepare Firebase Hosting

1. Open your Firebase Console:  
   👉 [https://console.firebase.google.com/project/twisted-hearth-foundation/hosting/sites](https://console.firebase.google.com/project/twisted-hearth-foundation/hosting/sites)

2. In the left sidebar, click **Hosting** → **Add Custom Domain**.

3. Enter: 2025.partytillyou.rip

4. Firebase will display a **CNAME record** to verify ownership and link traffic:
    Type: CNAME
    Name: 2025
    Target: twisted-hearth-foundation.web.app

5. Firebase will also warn you to **remove any existing A records** for that subdomain (these can block the SSL certificate).

---

## ⚙️ Step 2. Update Cloudflare DNS Records

1. Go to your Cloudflare dashboard:  
👉 [https://dash.cloudflare.com](https://dash.cloudflare.com)

2. Select your domain **partytillyou.rip**.

3. In the sidebar, click **DNS → Records**.

4. **Delete** any existing A record for `2025`:
    Type: A
    Name: 2025
    Value: 185.158.133.1 ← (or any other IP)

5. **Add a new CNAME record:**

| Type | Name | Content | Proxy Status | TTL |
|------|------|----------|---------------|-----|
| `CNAME` | `2025` | `twisted-hearth-foundation.web.app` | **DNS Only (gray cloud)** | Auto |

6. Click **Save**.

7. (Optional but recommended)  
Navigate to **Caching → Configuration → Purge Everything** to remove any cached DNS or redirect data.

---

## 🔍 Step 3. Verify DNS Propagation

Before returning to Firebase, confirm that your DNS has propagated:

### 🔹 Using DNSChecker
Go to [https://dnschecker.org](https://dnschecker.org)

Run the following lookups:

#### Check 1: A Record
- Query: `A` record for `2025.partytillyou.rip`  
- Expected Result: **No results**

#### Check 2: CNAME Record
- Query: `CNAME` record for `2025.partytillyou.rip`  
- Expected Result:  
    twisted-hearth-foundation.web.app

✅ When all locations globally show the Firebase target, you’re ready to verify.

---

## 🔑 Step 4. Verify Domain in Firebase

1. Return to Firebase Hosting in your project.  
 [Firebase Console → Hosting → Custom Domains](https://console.firebase.google.com/project/twisted-hearth-foundation/hosting/sites)

2. Click **Verify** next to `2025.partytillyou.rip`.

3. Firebase will:
 - Confirm DNS ownership via the CNAME
 - Bind the domain to your hosting site
 - Begin issuing an SSL certificate via Let’s Encrypt

If successful, Firebase will show:
    Minting certificate
This means the certificate request is in progress.

---

## ⏳ Step 5. Wait for SSL Certificate to Complete

**Typical duration:** 15–60 minutes  
(occasionally up to 4 hours depending on global DNS propagation).

### During this period:
- **HTTP (http://2025.partytillyou.rip)** may work.
- **HTTPS (https://2025.partytillyou.rip)** will show:
    NET::ERR_CERT_COMMON_NAME_INVALID
or “Your connection is not private.”

✅ This is expected while the SSL certificate is being minted.

---

## ✅ Step 6. Confirm Successful Connection

When Firebase completes the SSL process, the domain status will change to:

> **Connected**

You can then test by visiting:
👉 [https://2025.partytillyou.rip](https://2025.partytillyou.rip)

You should see:
- 🔒 A secure lock icon
- Your Firebase-hosted site content

---

## 🧩 Step 7. (Optional) Enable Cloudflare Proxy

After Firebase SSL is confirmed working:

1. In Cloudflare DNS, toggle the gray cloud (DNS Only) to orange to enable **Cloudflare proxy**.

2. Then go to **SSL/TLS → Overview** in Cloudflare and set the mode to:
    Full (Strict)

> ⚠️ Never use “Flexible” mode — it will create redirect loops with Firebase.

---

## 🧠 Troubleshooting Reference

| Symptom | Likely Cause | Fix |
|----------|---------------|-----|
| ❌ `ACME challenge failed (403 Forbidden)` | Old A record pointing to wrong IP | Delete A record for `2025` |
| ⚠️ `Too many redirects` | Cloudflare SSL mode = Flexible | Change to **Full (Strict)** |
| ⌛ “Minting certificate” for hours | DNS not yet fully propagated | Verify with [dnschecker.org](https://dnschecker.org) and purge Cloudflare cache |
| 🚫 Browser shows “Not Secure” | SSL certificate not finished | Wait 15–60 minutes and refresh |

---

## 🧾 Final Working DNS Configuration (Confirmed)

| Type | Name | Content | Proxy | TTL |
|------|------|----------|--------|-----|
| CNAME | 2025 | twisted-hearth-foundation.web.app | DNS Only | Auto |
| A | partytillyou.rip | 69.164.196.229 (root) | DNS Only | Auto |
| CNAME | * | partytillyou.rip | DNS Only | Auto |
| TXT | partytillyou.rip | google-site-verification=... | DNS Only | 1 hr |

---

## 📘 Helpful Links

- **Firebase Hosting Docs:** [https://firebase.google.com/docs/hosting](https://firebase.google.com/docs/hosting)  
- **Cloudflare DNS Record Guide:** [https://developers.cloudflare.com/dns/manage-dns-records/how-to](https://developers.cloudflare.com/dns/manage-dns-records/how-to)  
- **Check DNS Propagation:** [https://dnschecker.org](https://dnschecker.org)

---

## 🖼️ Screenshot References
(Replace with your own if you capture them)

1. **Cloudflare DNS Record Panel**
- Showing `CNAME 2025 → twisted-hearth-foundation.web.app`
2. **Firebase Hosting → Custom Domains**
- Status: “Minting certificate” → “Connected”
3. **Browser View**
- Before: `NET::ERR_CERT_COMMON_NAME_INVALID`
- After: Secure lock (HTTPS active)

---

## 🏁 Summary

Once complete, your domain flow will look like this:
    Browser (https://2025.partytillyou.rip
    )
    │
    ▼
    Cloudflare DNS → Firebase Hosting (Google CDN)
    │
    ▼
    twisted-hearth-foundation.web.app (live site)

Your Firebase site is now live on your own custom subdomain with secure HTTPS.

---

**Document Author:** FSO Admin  
**Project:** `twisted-hearth-foundation`  
**Last Updated:** October 2025  
**Verified Configuration:** Cloudflare + Firebase Hosting + Google Cloud

