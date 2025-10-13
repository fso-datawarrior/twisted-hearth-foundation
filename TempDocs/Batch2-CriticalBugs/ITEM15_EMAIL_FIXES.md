# 🔴 ITEM 15: Email Template Fixes - Implementation Guide

**Date**: October 13, 2025  
**Priority**: CRITICAL  
**Status**: 🔍 Issues Identified, Ready to Fix

---

## 🚨 CRITICAL ISSUES FOUND

### **❌ WRONG DATE & TIME**
**Current**: October 18, 2025 at 7:00 PM  
**Correct**: **November 1st, 2025 at 6:30 PM**

### **❌ WRONG ADDRESS**
**Current**: "Denver, Colorado"  
**Correct**: **"1816 White Feather Drive, Longmont, Colorado 80504"**

---

## 📋 FILES TO FIX

### **🔴 CRITICAL - Edge Functions** (Active email sending)

#### **File 1: `supabase/functions/send-rsvp-confirmation/index.ts`**

**Line 46** - Event Start Time:
```typescript
// BEFORE:
const EVENT_START_ISO = "2025-10-18T19:00:00-06:00"; // America/Denver

// AFTER:
const EVENT_START_ISO = "2025-11-01T18:30:00-06:00"; // November 1st, 6:30 PM America/Denver
```

**Line 143** - Plain Text Email:
```typescript
// BEFORE:
Date: Saturday, October 18, 2025 — 7:00 PM

// AFTER:
Date: Friday, November 1st, 2025 — 6:30 PM
```

**Line 159** - HTML Email:
```typescript
// BEFORE:
<p><strong>Date:</strong> Saturday, October 18, 2025 — 7:00 PM</p>

// AFTER:
<p><strong>Date:</strong> Friday, November 1st, 2025 — 6:30 PM</p>
```

**Lines 144 & 160** - Address (uses PRIVATE_ADDRESS env var):
- This is **GOOD** - address comes from environment variable
- Just need to verify `PRIVATE_EVENT_ADDRESS` env var is set correctly in Supabase

---

#### **File 2: `supabase/functions/send-email-campaign/index.ts`**

**Line 152-154** - Variable replacements:
```typescript
// BEFORE:
.replace(/{{event_date}}/g, 'November 1st, 2025')  // ✅ Already correct!
.replace(/{{event_time}}/g, '6:30 PM')              // ✅ Already correct!
.replace(/{{event_address}}/g, 'Denver, Colorado')  // ❌ Wrong address

// AFTER:
.replace(/{{event_date}}/g, 'November 1st, 2025')
.replace(/{{event_time}}/g, '6:30 PM')
.replace(/{{event_address}}/g, '1816 White Feather Drive, Longmont, Colorado 80504')
```

---

### **🟡 MEDIUM - Admin UI**

#### **File 3: `src/components/admin/EmailTemplateEditor.tsx`**

**Line 46** - Preview template:
```typescript
// BEFORE:
.replace(/{{event_address}}/g, 'Denver, Colorado')

// AFTER:
.replace(/{{event_address}}/g, '1816 White Feather Drive, Longmont, Colorado 80504')
```

---

### **🟢 LOW - Static Email Templates** (Not actively used by system)

These are reference templates, but should be updated for consistency:

#### **File 4: `email-templates/01-magic-link.html`** (Line 93)
#### **File 5: `email-templates/02-confirm-signup.html`** (Line 78)
#### **File 6: `email-templates/03-invite-user.html`** (Line 43)
#### **File 7: `email-templates/04-change-email.html`** (Line 82)
#### **File 8: `email-templates/05-reset-password.html`** (Line 87)

**All these files have:**
```html
<!-- BEFORE: -->
Denver, Colorado

<!-- AFTER: -->
1816 White Feather Drive, Longmont, Colorado 80504
```

**File 6 also needs date fix (line 43):**
```html
<!-- BEFORE: -->
<strong style="color: #d4af37;">When:</strong> Saturday, October 18, 2025 — 7:00 PM<br>

<!-- AFTER: -->
<strong style="color: #d4af37;">When:</strong> Friday, November 1st, 2025 — 6:30 PM<br>
```

---

### **📝 DOCUMENTATION UPDATES**

#### **File 9: `email-templates/README.md`** (Line 30)
```markdown
<!-- BEFORE: -->
- 📍 Event details (November 1st, 2025 • Denver, Colorado)

<!-- AFTER: -->
- 📍 Event details (November 1st, 2025 • 1816 White Feather Drive, Longmont, CO 80504)
```

#### **File 10: `docs/MAILJET_TEMPLATE_GUIDE.md`** (Lines 40, 262)
```markdown
<!-- Line 40 - Variable example -->
<!-- BEFORE: -->
| `{{event_address}}` | Event location | "Denver, Colorado" |

<!-- AFTER: -->
| `{{event_address}}` | Event location | "1816 White Feather Drive, Longmont, CO 80504" |

<!-- Line 262 - Example -->
<!-- BEFORE: -->
  <p>Denver, Colorado, USA</p>

<!-- AFTER: -->
  <p>1816 White Feather Drive, Longmont, Colorado 80504</p>
```

---

## ✅ ALREADY CORRECT

These files have the CORRECT information:
- ✅ `src/lib/event.ts` - November 1st, 2025 at 6:30 PM
- ✅ `supabase/functions/send-email-campaign/index.ts` - Date & time correct (only address wrong)

---

## 🔧 IMPLEMENTATION STEPS

### **Step 1: Fix Critical Edge Functions** (15 min)

1. Update `supabase/functions/send-rsvp-confirmation/index.ts`:
   - Line 46: Change date/time to November 1st, 6:30 PM
   - Line 143: Update plain text date
   - Line 159: Update HTML date

2. Update `supabase/functions/send-email-campaign/index.ts`:
   - Line 154: Change address to full Longmont address

### **Step 2: Verify Environment Variable** (5 min)

Check Supabase Dashboard → Settings → Edge Functions → Environment Variables:
- `PRIVATE_EVENT_ADDRESS` should be: `1816 White Feather Drive, Longmont, Colorado 80504`

### **Step 3: Fix Admin UI** (5 min)

Update `src/components/admin/EmailTemplateEditor.tsx`:
- Line 46: Change preview address

### **Step 4: Update Static Templates** (15 min)

Update all 5 email template HTML files:
- Replace "Denver, Colorado" with full address
- Fix date in `03-invite-user.html`

### **Step 5: Update Documentation** (5 min)

Update README and guide with correct information.

### **Step 6: Deploy Edge Functions** (5 min)

```bash
# Deploy updated edge functions
npx supabase functions deploy send-rsvp-confirmation
npx supabase functions deploy send-email-campaign
```

### **Step 7: Test Email Sending** (15 min)

- Send test RSVP confirmation
- Send test email campaign
- Verify date, time, and address in received emails

---

## 🧪 TESTING CHECKLIST

### **RSVP Confirmation Email:**
- [ ] Date shows: "Friday, November 1st, 2025"
- [ ] Time shows: "6:30 PM"
- [ ] Address shows: "1816 White Feather Drive, Longmont, Colorado 80504"
- [ ] Calendar .ICS file has correct date/time
- [ ] Email sends successfully
- [ ] Admin notification email correct

### **Email Campaign:**
- [ ] `{{event_date}}` → "November 1st, 2025"
- [ ] `{{event_time}}` → "6:30 PM"
- [ ] `{{event_address}}` → Full Longmont address
- [ ] Preview in admin panel shows correct info
- [ ] Test send works

### **Email Clients:**
- [ ] Gmail (desktop & mobile)
- [ ] Outlook
- [ ] Apple Mail
- [ ] Links work
- [ ] Formatting correct

---

## 📊 SUMMARY

| File | Type | Lines | Priority | Impact |
|------|------|-------|----------|--------|
| send-rsvp-confirmation | Edge Function | 3 changes | 🔴 CRITICAL | Active emails |
| send-email-campaign | Edge Function | 1 change | 🔴 CRITICAL | Active emails |
| EmailTemplateEditor | React Component | 1 change | 🟡 MEDIUM | Admin preview |
| email-templates/*.html | Static Files | 6 changes | 🟢 LOW | Reference only |
| Documentation | Markdown | 2 changes | 🟢 LOW | Docs |

**Total Changes**: 13 lines across 10 files  
**Estimated Time**: 1 hour  
**Risk**: LOW (text-only changes)

---

## 🚀 READY TO IMPLEMENT

All issues identified and solutions prepared. Ready to make changes?

**Recommendation**: Fix critical edge functions first, test, then update the rest.

