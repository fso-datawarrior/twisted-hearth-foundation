# Data-Warrior.com Email System Documentation
### Comprehensive Technical & Workflow Reference

---

## 📘 Overview

This document provides a full reference for the **email infrastructure** used by **data-warrior.com**, including configuration for:

- Domain DNS (Squarespace)
- Inbound and outbound email (Google Workspace + Mailjet)
- Supabase Edge Functions (automated and campaign emails)
- Workflow architecture
- Maintenance and troubleshooting

It is designed for developers and administrators maintaining or migrating this system.

---

## 🌐 Domain & Hosting

- **Domain:** `data-warrior.com`  
- **Registrar & DNS Host:** [Squarespace Domains](https://account.squarespace.com/domains)  
- **Inbound Mail (Receiving):** Google Workspace (Gmail)  
- **Outbound Mail (Sending):** Mailjet (via Supabase integration)  
- **Backend Platform:** Supabase Edge Functions (email automation and campaign management)

---

## 🧩 DNS Configuration (Squarespace)

Your DNS records are managed through **Squarespace**, and have been configured to authenticate both **Mailjet** and **Google Workspace** for secure sending and receiving.

> **Figure 1 — Squarespace DNS Records Overview**  
> (Mailjet, Google, and DMARC entries visible)  
> ![Squarespace DNS Records Part 1](file_000000009ebc622fb6667a7a7908272d)  
>
> **Figure 2 — Squarespace DNS Records Continued**  
> (MX, SPF, and DMARC configuration)  
> ![Squarespace DNS Records Part 2](file_000000006ee461f5a7a6ba74a5598b26)

### ✅ Current DNS Records Summary

| Type | Host | Value | Purpose |
|------|------|--------|----------|
| **A** | `@` | 198.185.159.1–4 | Squarespace website hosting |
| **CNAME** | `www` | ext-cust.squarespace.com | Website redirect |
| **CNAME** | `bounce` | `bnc3.mailjet.com` | Mailjet bounce handling |
| **TXT** | `@` | `v=spf1 include:spf.mailjet.com ?all` | SPF authorization for Mailjet |
| **TXT** | `mailjet._domainkey` | Long DKIM key (Mailjet) | DKIM authentication for Mailjet |
| **TXT** | `google._domainkey` | Long DKIM key (Google) | DKIM authentication for Gmail |
| **TXT** | `_dmarc` | `v=DMARC1; p=quarantine; rua=mailto:data-warrior.com` | DMARC protection policy |
| **MX** | `@` | `smtp.google.com` | Google Workspace inbound email |

✅ **SPF/DKIM Verification Status:**  
Both records verified and active within Mailjet.

---

## 💼 Mailjet Configuration

**Mailjet Dashboard:** [https://app.mailjet.com/account/sender](https://app.mailjet.com/account/sender)

> **Figure 3 — Mailjet Domain Authentication (Verified)**  
> ![Mailjet SPF/DKIM OK](file_00000000df4c61f5a1714ae724f61cb9)
>
> **Figure 4 — Mailjet Domain Setup Details (Record Examples)**  
> ![Mailjet Domain Authentication Setup](file_00000000d09461f586c21ca8f94cf4bc)

### Mailjet Domain Status

| Setting | Status |
|----------|---------|
| **Domain:** | `data-warrior.com` |
| **SPF:** | ✅ OK |
| **DKIM:** | ✅ OK |
| **Bounce Handling (CNAME):** | ✅ Configured (`bnc3.mailjet.com`) |

### Mailjet API Credentials (stored in Supabase)

| Variable | Value |
|-----------|--------|
| `MAILJET_API_KEY` | (Stored securely in Supabase Secrets) |
| `MAILJET_API_SECRET` | (Stored securely in Supabase Secrets) |
| `MAILJET_FROM_EMAIL` | `fso@data-warrior.com` |
| `MAILJET_FROM_NAME` | `Data Warrior` |

---

## ⚙️ Supabase Configuration

Supabase handles all **email automation** and **campaign distribution** via **Edge Functions** and securely stored **secrets**.

### **Authentication Settings**

> **Figure 5 — Supabase Auth Providers Settings**  
> ![Supabase Auth Providers](file_00000000e494622fa404c1c040699bd8)

**Enabled:**
- Email provider (enabled for magic link, signup, reset flows)
- Custom branded HTML templates applied

**Disabled:**
- Phone, SAML, Web3 Wallet, Apple, etc.

---

### **Edge Functions Overview**

> **Figure 6 — Supabase Edge Functions List**  
> ![Supabase Edge Functions](file_000000003744620c938b27ccb18cc0ad)

| Function Name | Purpose | Status |
|----------------|----------|--------|
| `send-rsvp-confirmation` | Sends RSVP confirmation emails to users and admins | ✅ Active |
| `send-contribution-confirmation` | Sends donation/contribution confirmation | ✅ Active |
| `test-mailjet` | Test endpoint for verifying Mailjet API | ✅ Active |
| `send-bulk-email` | Handles campaign and batch sending | ✅ Active |
| `send-email-campaign` | Admin-managed campaign delivery | ✅ Active |
| `daily-analytics-aggregation` | Daily reporting and metrics | ✅ Active |
| `send-support-report` | Sends internal status/support updates | ✅ Active |

---

### **Edge Function Secrets**

> **Figure 7 — Supabase Secrets Configuration**  
> ![Supabase Secrets](file_000000005034622f8044be4a7315447d)

| Secret Name | Description |
|--------------|-------------|
| `MAILJET_API_KEY` | Mailjet public key for authentication |
| `MAILJET_API_SECRET` | Mailjet secret key for API calls |
| `MAILJET_FROM_EMAIL` | Primary sender (`fso@data-warrior.com`) |
| `MAILJET_FROM_NAME` | Sender name (“Data Warrior”) |
| `PRIVATE_EVENT_ADDRESS` | Private address for RSVP emails |
| `SUPABASE_*` | Supabase connection keys and URLs |

These secrets ensure your email system remains secure and environment-independent.

---

## 🧠 Email System Architecture (In-House System)

### **Core Components**
- **Frontend Admin Interface:** React-based dashboard for email management
- **Supabase Edge Functions:** Handle all email generation and delivery
- **Mailjet API:** Provides reliable outbound delivery and analytics
- **Database Tables:** Store templates, campaigns, recipients, and tracking

### **User-Facing Workflows**

#### 1. RSVP Confirmation
- Triggered by RSVP submission
- Sends:
  - **User Email:** Event details + calendar (.ics)
  - **Admin Email:** Full RSVP data
- Includes dynamic personalization: name, RSVP status, guests, etc.

#### 2. Authentication Emails
- Signup confirmation, password reset, invitation, etc.
- Custom HTML templates with brand styling

---

### **Admin-Facing Workflows**

#### Email Template Management
- Create/edit templates via Admin Dashboard → “Email Communication → Templates”
- Variables supported:
  - `{{name}}`, `{{email}}`, `{{rsvp_status}}`, etc.
- Live preview and mobile view modes

#### Email Campaign Management
- Build campaigns using saved templates
- Select recipients (confirmed RSVPs, all users, custom CSV)
- Schedule or send immediately
- Batch send (50 per batch, 1 sec delay)
- Track send/delivery/bounce metrics

---

## 📊 Analytics & Tracking

| Metric | Description |
|--------|-------------|
| **Sent Count** | Total attempted emails |
| **Delivered Count** | Successfully delivered messages |
| **Bounced Count** | Hard bounces (non-deliverable) |
| **Failed Count** | Mailjet-reported errors |
| **Per-Recipient Tracking** | Individual status + error logging |

---

## 🔐 Security & Reliability

- Mailjet credentials stored in Supabase secrets  
- Row-Level Security (RLS) in Supabase database  
- Admin-only access for email management UI  
- Rate limiting and retry logic for reliability  
- Full error logging for diagnostics  

---

## 🧾 Maintenance Checklist

| Task | Frequency | Notes |
|------|------------|-------|
| Verify Mailjet SPF/DKIM | Quarterly | In Mailjet dashboard |
| Monitor DMARC reports | Monthly | Inbox: `fso@data-warrior.com` |
| Test “test-mailjet” function | Monthly | Confirms API + domain setup |
| Rotate API keys | Every 3–6 months | Update in Supabase Secrets |
| Review bounce reports | Weekly | Check Mailjet dashboard |
| Audit campaign stats | After each campaign | Detect delivery drops |
| Backup templates | Monthly | Export from database |

---

## 🧰 Troubleshooting Guide

| Issue | Possible Cause | Fix |
|-------|----------------|-----|
| Email not sending | Expired API keys | Update secrets in Supabase |
| Goes to spam | SPF/DKIM mismatch | Reverify DNS + Mailjet |
| Mailjet “Unauthorized” error | Wrong key or missing auth header | Confirm API key in Supabase |
| Function fails | Edge Function deployment issue | Redeploy function |
| No analytics data | Table sync delay | Check `daily-analytics-aggregation` logs |

---

## ✅ Verification Summary

| Component | Status |
|------------|---------|
| Squarespace DNS | ✅ Correct |
| Google Workspace (Inbound) | ✅ Working |
| Mailjet (Outbound) | ✅ Verified |
| SPF/DKIM/DMARC | ✅ All passing |
| Supabase Integration | ✅ Connected |
| Edge Functions | ✅ Operational |
| Campaign Analytics | ✅ Functional |

---

## 📎 References

- **Squarespace DNS Management:**  
  [https://account.squarespace.com/domains](https://account.squarespace.com/domains)
- **Mailjet Dashboard:**  
  [https://app.mailjet.com/account/sender](https://app.mailjet.com/account/sender)
- **Supabase Dashboard:**  
  [https://supabase.com/dashboard](https://supabase.com/dashboard)
- **Mail-tester (for validation):**  
  [https://www.mail-tester.com/](https://www.mail-tester.com/)

---

**Document Version:** 2025-10-15  
**Maintainer:** fso@data-warrior.com  
**Last Verified:** 2025-10-15  

---
