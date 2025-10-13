# 🤖 Lovable AI Prompt Template

**Purpose**: Standard format for all Lovable AI prompts  
**Created**: October 13, 2025  
**Status**: Master Template

---

## 📋 STANDARD PROMPT STRUCTURE

Every Lovable prompt MUST include:

1. **Task Overview** - What needs to be done
2. **Document References** - Where to find detailed specs (Git repo paths)
3. **Implementation Steps** - Clear, ordered instructions
4. **Testing Requirements** - What to test
5. **Completion Report Format** - MANDATORY output format

---

## ✅ MANDATORY COMPLETION REPORT

**CRITICAL**: Lovable MUST provide this report after implementation:

```markdown
# COMPLETION REPORT: [Batch Name]

## ✅ ITEMS COMPLETED

For each item, provide:

### Item X: [Name]
**Status**: ✅ Complete / ⚠️ Partial / ❌ Failed  
**Files Modified**:
- path/to/file1.tsx (lines changed: X-Y)
- path/to/file2.css (added animations)

**Changes Made**:
- Specific change 1
- Specific change 2
- Specific change 3

**Testing Results**:
- [ ] Test 1: Result
- [ ] Test 2: Result
- [ ] Test 3: Result

**Issues Encountered**: None / [Description]  
**Workarounds Applied**: None / [Description]

---

## 📊 SUMMARY

**Total Items**: X  
**Completed**: X  
**Partial**: X  
**Failed**: X  
**Total Files Modified**: X  
**Total Lines Changed**: ~XXX

## 🧪 TESTING PERFORMED

- [ ] Desktop Chrome: Pass/Fail
- [ ] Mobile Chrome: Pass/Fail
- [ ] Desktop Safari: Pass/Fail
- [ ] Mobile Safari: Pass/Fail
- [ ] Edge: Pass/Fail

## ⚠️ KNOWN ISSUES

List any issues discovered or remaining work needed.

## 🔄 RECOMMENDED NEXT STEPS

What should be done next or verified.
```

---

## 🎯 WHY THIS FORMAT?

1. **Clear accountability** - Know exactly what was done
2. **Easy verification** - Can check files and lines
3. **Test results** - Confirms functionality
4. **Issue tracking** - Know what needs follow-up
5. **Historical record** - Future reference

---

## 📝 USAGE INSTRUCTIONS

When creating a Lovable prompt:

1. Copy the batch-specific prompt content
2. Add at the END of the prompt:
   ```
   ## 🚨 COMPLETION REPORT REQUIRED
   
   After completing all implementation work, you MUST provide a detailed completion report using this format:
   [Insert completion report template]
   ```

3. Emphasize this is NOT optional
4. Request report even if there are failures/issues

---

**This template ensures consistent, verifiable delivery from Lovable AI.**

