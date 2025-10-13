# 🚀 SEND THIS TO LOVABLE (Chat Mode)

Copy and paste this message to Lovable:

---

🔴 **CRITICAL FIX NEEDED: Wrong Event Date/Time/Address in Email Templates**

I need you to fix critical data errors in our email system. Guests are receiving emails with WRONG event information!

## 📚 REFERENCE DOCUMENTS (Git Repo):
Please read these files in order:
1. `TempDocs/Batch2-CriticalBugs/LOVABLE-PROMPT-Item15-Email-Fixes.md` - **Main instructions**
2. `TempDocs/Batch2-CriticalBugs/ITEM15_BEFORE_AFTER.md` - Visual before/after examples
3. `TempDocs/Batch2-CriticalBugs/ITEM15_EMAIL_FIXES.md` - Technical details

## 🎯 WHAT'S WRONG:

**Current (WRONG):**
- Date: October 18, 2025
- Time: 7:00 PM
- Address: "Denver, Colorado"

**Should Be (CORRECT):**
- Date: **Friday, November 1st, 2025**
- Time: **6:30 PM**
- Address: **"1816 White Feather Drive, Longmont, Colorado 80504"**

## 🔧 CHANGES NEEDED:

**13 text changes across 10 files:**

**CRITICAL (Edge Functions - Active Emails):**
1. `supabase/functions/send-rsvp-confirmation/index.ts` - 3 changes (lines 46, 143, 159)
2. `supabase/functions/send-email-campaign/index.ts` - 1 change (line 154)

**MEDIUM (Admin UI):**
3. `src/components/admin/EmailTemplateEditor.tsx` - 1 change (line 46)

**LOW (Static Templates):**
4-8. Five files in `email-templates/*.html` - 6 changes total

**DOCUMENTATION:**
9-10. Two doc files - 3 changes total

## 📋 REQUIREMENTS:

1. **READ** the main prompt file for exact line-by-line instructions
2. **MAKE ALL 13 CHANGES** carefully (no typos!)
3. **VERIFY** with searches:
   - "October 18" should find ZERO results
   - "Denver, Colorado" should find ZERO results in code
   - "November 1" should find MANY results
   - "Longmont" should find MANY results
4. **PROVIDE COMPLETION REPORT** using format in prompt

## ⚠️ CRITICAL NOTES:

- DO NOT modify `src/lib/event.ts` (it's already correct)
- DO NOT change `${PRIVATE_ADDRESS}` variables (they pull from env vars)
- Use exact formatting: "Friday, November 1st, 2025" and "6:30 PM"
- Be consistent with address format

## 🚨 WHY THIS IS CRITICAL:

Guests are receiving emails with wrong event date (October instead of November!) and wrong location (Denver instead of Longmont). This could cause people to show up on the wrong day or go to the wrong city!

---

**PLEASE CREATE YOUR IMPLEMENTATION PLAN FIRST, then I'll approve execution.**

Let me know when you've reviewed the documents and are ready to proceed! 🎯

