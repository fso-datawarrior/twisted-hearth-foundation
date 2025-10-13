# 🔴 LOVABLE PROMPT: Fix Email Date, Time, and Address

**Task**: Item 15 - Email Template Verification & Correction  
**Priority**: CRITICAL  
**Type**: Data Accuracy Fix  
**Estimated Time**: 1 hour  
**Risk**: LOW (text-only changes)

---

## 🎯 OBJECTIVE

Fix **CRITICAL DATA ERRORS** in email templates where:
- ❌ **Wrong Event Date**: October 18, 2025 → ✅ November 1st, 2025
- ❌ **Wrong Event Time**: 7:00 PM → ✅ 6:30 PM  
- ❌ **Wrong Address**: "Denver, Colorado" → ✅ "1816 White Feather Drive, Longmont, Colorado 80504"

**Impact**: Guests are receiving emails with incorrect event information!

---

## 📚 REFERENCE DOCUMENTS

**In Git Repository:**
- `TempDocs/Batch2-CriticalBugs/ITEM15_EMAIL_FIXES.md` - Complete fix specification
- `TempDocs/Batch2-CriticalBugs/ITEM15_BEFORE_AFTER.md` - Visual comparison
- `src/lib/event.ts` - Source of truth for correct date/time

---

## ✅ SOURCE OF TRUTH

**File**: `src/lib/event.ts` lines 1-8

This file has the CORRECT information:
```typescript
export const EVENT = {
  startISO: "2025-11-01T18:30:00-06:00", // November 1st at 6:30 PM
  endISO: "2025-11-02T03:00:00-06:00",
  timezone: "America/Denver",
  title: "The Ruths' Twisted Fairytale Halloween Bash",
};
```

**Correct Event Details:**
- **Date**: Friday, November 1st, 2025
- **Time**: 6:30 PM (18:30)
- **Timezone**: America/Denver (UTC-6)
- **Address**: 1816 White Feather Drive, Longmont, Colorado 80504

---

## 🔧 CHANGES REQUIRED

### **GROUP 1: CRITICAL - Edge Functions** 🔴

These functions send ACTIVE emails to users. Must be fixed immediately.

---

#### **File 1: `supabase/functions/send-rsvp-confirmation/index.ts`**

**Change 1 - Line 46**: Event Start Time Constant
```typescript
// BEFORE:
const EVENT_START_ISO = "2025-10-18T19:00:00-06:00"; // America/Denver

// AFTER:
const EVENT_START_ISO = "2025-11-01T18:30:00-06:00"; // November 1st, 6:30 PM America/Denver
```

**Change 2 - Line 143**: Plain Text Email Body
```typescript
// BEFORE:
Date: Saturday, October 18, 2025 — 7:00 PM

// AFTER:
Date: Friday, November 1st, 2025 — 6:30 PM
```

**Context (lines 140-148)**:
```typescript
const text = `Hi ${body.name},

We have ${isUpdate ? 'updated' : 'received'} your RSVP for ${body.guests} ${body.guests > 1 ? "guests" : "guest"}.
Date: Friday, November 1st, 2025 — 6:30 PM  // ← FIX THIS LINE
Where: ${PRIVATE_ADDRESS}

This address is private. Please don't share it publicly.

— Jamie & Kat Ruth`;
```

**Change 3 - Line 159**: HTML Email Body
```typescript
// BEFORE:
<p><strong>Date:</strong> Saturday, October 18, 2025 — 7:00 PM</p>

// AFTER:
<p><strong>Date:</strong> Friday, November 1st, 2025 — 6:30 PM</p>
```

**Context (lines 156-162)**:
```typescript
<p style="font-size: 16px; margin-top: 0;">Hi ${body.name},</p>
<p>We have ${actionText} your RSVP for <strong>${body.guests}</strong> ${body.guests > 1 ? "guests" : "guest"}.</p>
${additionalGuestsHtml}
<p><strong>Date:</strong> Friday, November 1st, 2025 — 6:30 PM</p>  // ← FIX THIS LINE
<p><strong>Where:</strong> ${PRIVATE_ADDRESS}</p>
<p style="opacity:.8; font-size: 14px;">This address is private. Please don't share it publicly.</p>
```

**✅ Note**: Lines 144 and 160 use `${PRIVATE_ADDRESS}` which comes from environment variable. This is CORRECT - address is managed via Supabase env vars, not hardcoded.

---

#### **File 2: `supabase/functions/send-email-campaign/index.ts`**

**Change 4 - Line 154**: Address Replacement Variable

```typescript
// BEFORE:
.replace(/{{event_address}}/g, 'Denver, Colorado')

// AFTER:
.replace(/{{event_address}}/g, '1816 White Feather Drive, Longmont, Colorado 80504')
```

**Context (lines 147-159)**:
```typescript
// Function to replace variables in HTML
const replaceVariables = (html: string, data: RecipientData): string => {
  return html
    .replace(/{{name}}/g, data.name)
    .replace(/{{email}}/g, data.email)
    .replace(/{{rsvp_status}}/g, data.rsvp_status || 'pending')
    .replace(/{{event_date}}/g, 'November 1st, 2025')  // ✅ Already correct
    .replace(/{{event_time}}/g, '6:30 PM')              // ✅ Already correct
    .replace(/{{event_address}}/g, '1816 White Feather Drive, Longmont, Colorado 80504')  // ← FIX THIS LINE
    .replace(/{{costume_idea}}/g, data.costume_idea || 'your creative costume')
    .replace(/{{num_guests}}/g, String(data.num_guests || 1))
    .replace(/{{dietary_restrictions}}/g, data.dietary_restrictions || 'none specified')
    .replace(/{{gallery_link}}/g, 'https://twisted-tale.lovable.app/gallery');
};
```

---

### **GROUP 2: MEDIUM - Admin UI** 🟡

---

#### **File 3: `src/components/admin/EmailTemplateEditor.tsx`**

**Change 5 - Line 46**: Preview Template Address

```typescript
// BEFORE:
.replace(/{{event_address}}/g, 'Denver, Colorado')

// AFTER:
.replace(/{{event_address}}/g, '1816 White Feather Drive, Longmont, Colorado 80504')
```

**Context (lines 41-51)**:
```typescript
const previewHtml = template.html_template
  .replace(/{{name}}/g, 'Preview User')
  .replace(/{{email}}/g, 'preview@example.com')
  .replace(/{{event_date}}/g, 'November 1st, 2025')
  .replace(/{{event_time}}/g, '6:30 PM')
  .replace(/{{event_address}}/g, '1816 White Feather Drive, Longmont, Colorado 80504')  // ← FIX THIS LINE
  .replace(/{{rsvp_link}}/g, 'https://example.com/rsvp')
  .replace(/{{gallery_link}}/g, 'https://example.com/gallery')
  .replace(/{{costume_idea}}/g, 'Twisted Fairytale Character')
  .replace(/{{num_guests}}/g, '2')
  .replace(/{{dietary_restrictions}}/g, 'None');
```

---

### **GROUP 3: LOW - Static Email Templates** 🟢

These are reference templates not actively used by the system, but should be updated for consistency.

---

#### **File 4: `email-templates/01-magic-link.html`**

**Change 6 - Line 93**:
```html
<!-- BEFORE: -->
Denver, Colorado

<!-- AFTER: -->
1816 White Feather Drive, Longmont, Colorado 80504
```

**Context (lines 90-96)**:
```html
              <p style="font-size: 14px; color: #6b7280; margin: 0;">
                Hosted by Jamie & Kat Ruth<br>
                November 1st, 2025 • 6:30 PM<br>
                1816 White Feather Drive, Longmont, Colorado 80504  <!-- ← FIX THIS LINE -->
              </p>
            </div>
          </div>
```

---

#### **File 5: `email-templates/02-confirm-signup.html`**

**Change 7 - Line 78**:
```html
<!-- BEFORE: -->
Denver, Colorado

<!-- AFTER: -->
1816 White Feather Drive, Longmont, Colorado 80504
```

**Context (lines 75-81)**:
```html
              <p style="font-size: 14px; color: #6b7280; margin: 0;">
                Hosted by Jamie & Kat Ruth<br>
                November 1st, 2025<br>
                1816 White Feather Drive, Longmont, Colorado 80504  <!-- ← FIX THIS LINE -->
              </p>
            </div>
          </div>
```

---

#### **File 6: `email-templates/03-invite-user.html`**

**Change 8 - Line 43**: TWO FIXES - Date/Time AND Address

```html
<!-- BEFORE: -->
<strong style="color: #d4af37;">When:</strong> Saturday, October 18, 2025 — 7:00 PM<br>
<strong style="color: #d4af37;">Where:</strong> Denver, Colorado<br>

<!-- AFTER: -->
<strong style="color: #d4af37;">When:</strong> Friday, November 1st, 2025 — 6:30 PM<br>
<strong style="color: #d4af37;">Where:</strong> 1816 White Feather Drive, Longmont, Colorado 80504<br>
```

**Context (lines 40-46)**:
```html
              <p style="font-size: 16px; line-height: 1.6; margin: 16px 0;">
                <strong style="color: #d4af37;">When:</strong> Friday, November 1st, 2025 — 6:30 PM<br>  <!-- ← FIX -->
                <strong style="color: #d4af37;">Where:</strong> 1816 White Feather Drive, Longmont, Colorado 80504<br>  <!-- ← FIX -->
                <strong style="color: #d4af37;">Theme:</strong> Twisted Fairytales 👻🎃<br>
              </p>
```

---

#### **File 7: `email-templates/04-change-email.html`**

**Change 9 - Line 82**:
```html
<!-- BEFORE: -->
November 1st, 2025 • Denver, Colorado

<!-- AFTER: -->
November 1st, 2025 • 1816 White Feather Drive, Longmont, Colorado 80504
```

**Context (lines 79-85)**:
```html
              <p style="font-size: 14px; color: #6b7280; margin: 0;">
                Hosted by Jamie & Kat Ruth<br>
                November 1st, 2025 • 1816 White Feather Drive, Longmont, Colorado 80504  <!-- ← FIX THIS LINE -->
              </p>
            </div>
          </div>
```

---

#### **File 8: `email-templates/05-reset-password.html`**

**Change 10 - Line 87**:
```html
<!-- BEFORE: -->
Denver, Colorado

<!-- AFTER: -->
1816 White Feather Drive, Longmont, Colorado 80504
```

**Context (lines 84-90)**:
```html
              <p style="font-size: 14px; color: #6b7280; margin: 0;">
                Hosted by Jamie & Kat Ruth<br>
                November 1st, 2025<br>
                1816 White Feather Drive, Longmont, Colorado 80504  <!-- ← FIX THIS LINE -->
              </p>
            </div>
          </div>
```

---

### **GROUP 4: DOCUMENTATION** 📝

---

#### **File 9: `email-templates/README.md`**

**Change 11 - Line 30**:
```markdown
<!-- BEFORE: -->
- 📍 Event details (November 1st, 2025 • Denver, Colorado)

<!-- AFTER: -->
- 📍 Event details (November 1st, 2025 • 1816 White Feather Drive, Longmont, CO 80504)
```

---

#### **File 10: `docs/MAILJET_TEMPLATE_GUIDE.md`**

**Change 12 - Line 40**: Update example value
```markdown
<!-- BEFORE: -->
| `{{event_address}}` | Event location | "Denver, Colorado" |

<!-- AFTER: -->
| `{{event_address}}` | Event location | "1816 White Feather Drive, Longmont, CO 80504" |
```

**Change 13 - Line 262**: Update example HTML
```html
<!-- BEFORE: -->
  <p>Denver, Colorado, USA</p>

<!-- AFTER: -->
  <p>1816 White Feather Drive, Longmont, Colorado 80504</p>
```

---

## 📋 IMPLEMENTATION CHECKLIST

As you make changes, check off each item:

### **Edge Functions** (Critical):
- [ ] File 1, Change 1: Update EVENT_START_ISO to November 1st, 6:30 PM
- [ ] File 1, Change 2: Update plain text date in email body
- [ ] File 1, Change 3: Update HTML date in email body
- [ ] File 2, Change 4: Update address in email campaign function

### **Admin UI** (Medium):
- [ ] File 3, Change 5: Update address in EmailTemplateEditor preview

### **Static Templates** (Low):
- [ ] File 4, Change 6: Update address in magic-link.html
- [ ] File 5, Change 7: Update address in confirm-signup.html
- [ ] File 6, Change 8: Update date/time AND address in invite-user.html (2 lines)
- [ ] File 7, Change 9: Update address in change-email.html
- [ ] File 8, Change 10: Update address in reset-password.html

### **Documentation** (Low):
- [ ] File 9, Change 11: Update README example
- [ ] File 10, Change 12: Update MAILJET guide table
- [ ] File 10, Change 13: Update MAILJET guide HTML example

---

## 🧪 VERIFICATION REQUIREMENTS

After making ALL changes, verify:

### **Code Verification**:
- [ ] All 13 changes made across 10 files
- [ ] No typos in addresses or dates
- [ ] No syntax errors in TypeScript files
- [ ] No HTML formatting broken in template files
- [ ] Address format consistent: "1816 White Feather Drive, Longmont, Colorado 80504"
- [ ] Date format consistent: "Friday, November 1st, 2025"
- [ ] Time format consistent: "6:30 PM"

### **Search Verification**:
Run these searches to confirm no instances remain:

```bash
# Should find ZERO results:
grep -r "October 18" supabase/ email-templates/ src/
grep -r "2025-10-18" supabase/ email-templates/ src/
grep -r "7:00 PM" supabase/ email-templates/ src/ (may find other unrelated)
grep -r "Denver, Colorado" supabase/ email-templates/ src/ docs/

# Should find CORRECT results:
grep -r "November 1" supabase/ email-templates/ src/
grep -r "2025-11-01" supabase/ email-templates/ src/
grep -r "6:30 PM" supabase/ email-templates/ src/
grep -r "Longmont" supabase/ email-templates/ src/
```

### **File-by-File Verification**:
- [ ] `supabase/functions/send-rsvp-confirmation/index.ts` - 3 changes verified
- [ ] `supabase/functions/send-email-campaign/index.ts` - 1 change verified
- [ ] `src/components/admin/EmailTemplateEditor.tsx` - 1 change verified
- [ ] `email-templates/01-magic-link.html` - 1 change verified
- [ ] `email-templates/02-confirm-signup.html` - 1 change verified
- [ ] `email-templates/03-invite-user.html` - 2 changes verified
- [ ] `email-templates/04-change-email.html` - 1 change verified
- [ ] `email-templates/05-reset-password.html` - 1 change verified
- [ ] `email-templates/README.md` - 1 change verified
- [ ] `docs/MAILJET_TEMPLATE_GUIDE.md` - 2 changes verified

---

## 🚨 CRITICAL REMINDERS

1. **DO NOT** modify `src/lib/event.ts` - this file is CORRECT and is the source of truth
2. **DO NOT** change the `${PRIVATE_ADDRESS}` variable references - these pull from environment variables
3. **BE CAREFUL** with date formatting - use "Friday, November 1st, 2025" (include day of week and ordinal)
4. **BE CAREFUL** with time - use "6:30 PM" (not 18:30, not 6:30pm)
5. **BE CONSISTENT** with address format - use full address including "Colorado 80504"

---

## 📊 COMPLETION REPORT FORMAT

After completing ALL changes, provide this report:

```markdown
# EMAIL FIXES - COMPLETION REPORT

## ✅ CHANGES COMPLETED

### Edge Functions (Critical):
- [✅/❌] File 1: send-rsvp-confirmation/index.ts
  - Line 46: EVENT_START_ISO updated
  - Line 143: Plain text date updated
  - Line 159: HTML date updated
- [✅/❌] File 2: send-email-campaign/index.ts
  - Line 154: Address updated

### Admin UI (Medium):
- [✅/❌] File 3: EmailTemplateEditor.tsx
  - Line 46: Preview address updated

### Static Templates (Low):
- [✅/❌] File 4: 01-magic-link.html - Line 93 updated
- [✅/❌] File 5: 02-confirm-signup.html - Line 78 updated
- [✅/❌] File 6: 03-invite-user.html - Lines 42-43 updated (date + address)
- [✅/❌] File 7: 04-change-email.html - Line 82 updated
- [✅/❌] File 8: 05-reset-password.html - Line 87 updated

### Documentation (Low):
- [✅/❌] File 9: email-templates/README.md - Line 30 updated
- [✅/❌] File 10: docs/MAILJET_TEMPLATE_GUIDE.md - Lines 40, 262 updated

## 🔍 VERIFICATION RESULTS

### Search Results:
- "October 18" found in: [list files or NONE]
- "Denver, Colorado" found in: [list files or NONE]
- "November 1" found in: [list files with counts]
- "Longmont" found in: [list files with counts]

### Code Quality:
- [ ] No syntax errors
- [ ] No linting errors
- [ ] All TypeScript files compile
- [ ] All HTML files valid

## 📝 SUMMARY

- **Total Files Modified**: 10
- **Total Lines Changed**: 13
- **Critical Changes**: 4
- **Medium Changes**: 1
- **Low Priority Changes**: 8
- **Issues Encountered**: [None / describe any issues]
- **Time Taken**: [X minutes]

## ✅ READY FOR DEPLOYMENT

All email templates now have correct event information:
- ✅ Date: Friday, November 1st, 2025
- ✅ Time: 6:30 PM
- ✅ Address: 1816 White Feather Drive, Longmont, Colorado 80504
```

---

## 🎯 SUCCESS CRITERIA

This task is COMPLETE when:
- ✅ All 13 changes made across 10 files
- ✅ No instances of "October 18" or "Denver, Colorado" remain in active code
- ✅ All searches verified
- ✅ No syntax/linting errors
- ✅ Completion report provided

---

**IMPORTANT**: This is a CRITICAL fix. Guests are receiving wrong event information. Please complete all changes carefully and verify thoroughly.

**Let me know when complete!** 🚀

