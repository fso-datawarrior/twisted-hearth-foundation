# 📧 COPY THIS → SEND TO LOVABLE

Copy everything below the line and paste into Lovable Chat:

---

🔴 **CRITICAL: Fix Wrong Event Date/Time/Address in Email Templates**

## THE PROBLEM

Our email system is sending **CRITICAL INCORRECT INFORMATION** to guests:

**❌ Current (WRONG):**
- Date: October 18, 2025
- Time: 7:00 PM  
- Address: Denver, Colorado

**✅ Should Be (CORRECT):**
- Date: **Friday, November 1st, 2025**
- Time: **6:30 PM**
- Address: **1816 White Feather Drive, Longmont, Colorado 80504**

**Impact**: Guests might show up on the wrong day or go to the wrong city!

---

## YOUR TASK

Fix **13 text changes across 10 files**. All instructions are in the repository.

### 📚 READ THESE DOCUMENTS IN ORDER:

1. **Main Instructions**: `TempDocs/Batch2-CriticalBugs/LOVABLE-PROMPT-Item15-Email-Fixes.md`
   - Complete line-by-line instructions for all 13 changes
   - Exact code snippets with before/after
   - Line numbers for each change

2. **Visual Reference**: `TempDocs/Batch2-CriticalBugs/ITEM15_BEFORE_AFTER.md`
   - Before/after examples
   - Format standards
   - Quick reference table

3. **Technical Details**: `TempDocs/Batch2-CriticalBugs/ITEM15_EMAIL_FIXES.md`
   - File-by-file breakdown
   - Testing requirements

---

## CHANGES SUMMARY

### 🔴 CRITICAL - Edge Functions (Active Email Sending):
1. `supabase/functions/send-rsvp-confirmation/index.ts`
   - Line 46: Change date/time constant
   - Line 143: Update plain text email date
   - Line 159: Update HTML email date

2. `supabase/functions/send-email-campaign/index.ts`
   - Line 154: Change address

### 🟡 MEDIUM - Admin UI:
3. `src/components/admin/EmailTemplateEditor.tsx`
   - Line 46: Update preview address

### 🟢 LOW - Static Templates (5 HTML files + 2 docs):
4. `email-templates/01-magic-link.html` - Line 93
5. `email-templates/02-confirm-signup.html` - Line 78
6. `email-templates/03-invite-user.html` - Lines 42-43 (date + address)
7. `email-templates/04-change-email.html` - Line 82
8. `email-templates/05-reset-password.html` - Line 87
9. `email-templates/README.md` - Line 30
10. `docs/MAILJET_TEMPLATE_GUIDE.md` - Lines 40, 262

---

## CRITICAL REMINDERS

⚠️ **DO NOT** modify `src/lib/event.ts` - it's already correct (source of truth)  
⚠️ **DO NOT** change `${PRIVATE_ADDRESS}` variables - they pull from env vars  
⚠️ **USE EXACT FORMATTING**:
- Date: "Friday, November 1st, 2025" (with day of week and ordinal)
- Time: "6:30 PM" (not 18:30, not 6:30pm)
- Address: "1816 White Feather Drive, Longmont, Colorado 80504"

---

## VERIFICATION REQUIRED

After making changes, run these searches:

**Should Find ZERO:**
```bash
grep -r "October 18" supabase/ email-templates/ src/
grep -r "Denver, Colorado" supabase/ email-templates/ src/
```

**Should Find MANY:**
```bash
grep -r "November 1" supabase/ email-templates/ src/
grep -r "Longmont" supabase/ email-templates/ src/
```

---

## COMPLETION REPORT REQUIRED

After completing ALL changes, provide this report:

```markdown
# EMAIL FIXES - COMPLETION REPORT

## ✅ CHANGES COMPLETED

### Edge Functions (Critical):
- [✅/❌] send-rsvp-confirmation/index.ts (3 changes on lines 46, 143, 159)
- [✅/❌] send-email-campaign/index.ts (1 change on line 154)

### Admin UI (Medium):
- [✅/❌] EmailTemplateEditor.tsx (1 change on line 46)

### Static Templates (Low):
- [✅/❌] 01-magic-link.html
- [✅/❌] 02-confirm-signup.html
- [✅/❌] 03-invite-user.html (2 changes)
- [✅/❌] 04-change-email.html
- [✅/❌] 05-reset-password.html

### Documentation:
- [✅/❌] email-templates/README.md
- [✅/❌] docs/MAILJET_TEMPLATE_GUIDE.md (2 changes)

## 🔍 VERIFICATION

Search Results:
- "October 18" found: [NONE or list files]
- "Denver, Colorado" found: [NONE or list files]
- "November 1" found: [count] instances
- "Longmont" found: [count] instances

## 📝 SUMMARY

- Total Files Modified: 10
- Total Lines Changed: 13
- Issues Encountered: [None or describe]
- Time Taken: [X minutes]

✅ All changes complete and verified
```

---

## 🎯 YOUR PROCESS

1. **READ** the main prompt file (`LOVABLE-PROMPT-Item15-Email-Fixes.md`)
2. **CREATE** your implementation plan
3. **SHOW ME** your plan for approval
4. **MAKE** all 13 changes after I approve
5. **VERIFY** with grep searches
6. **PROVIDE** completion report in format above

---

**IMPORTANT**: This is CRITICAL - guests are getting wrong event info. Please read the detailed instructions carefully and make all changes with exact formatting.

Ready to start? Please read the prompt file and create your implementation plan! 🚀

