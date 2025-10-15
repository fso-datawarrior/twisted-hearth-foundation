# BULLETPROOF-DEPLOY-TO-PRODUCTION.md

## 🚀 **Bulletproof Deploy to Production**

Use this prompt to safely deploy your current branch to production WITHOUT losing any files.

---

**Prompt:**
```
Deploy my current branch to production using Path A (merge to main).

Current branch: [CURRENT_BRANCH_NAME]

CRITICAL SAFETY REQUIREMENTS:
1. NEVER delete any files
2. ALWAYS preserve all changes from current branch
3. ALWAYS verify files exist after merge
4. ALWAYS check that production matches dev

Step-by-step process:
1. Check current branch and confirm it's correct
2. Check git status for any uncommitted changes
3. Add and commit any uncommitted changes
4. Push current branch to GitHub
5. Switch to main branch
6. Pull latest main from GitHub
7. Merge current branch into main (preserve all files)
8. Push main to GitHub
9. Verify all files are present in main
10. Confirm production deployment triggered
11. Verify production site matches dev site

SAFETY CHECKS:
- ALWAYS check git status before any operation
- ALWAYS verify files exist after merge
- ALWAYS confirm production matches dev
- NEVER proceed if files are missing
- ALWAYS ask for confirmation before destructive operations

Repository: https://github.com/fso-datawarrior/twisted-hearth-foundation
Production: https://2025.partytillyou.rip
Dev: https://twisted-hearth-foundation-dev.web.app
```

---

## **Usage Example**

```
Deploy my current branch to production using Path A (merge to main).

Current branch: v-3.0.1.1-UserDropdownViewFIX

CRITICAL SAFETY REQUIREMENTS:
1. NEVER delete any files
2. ALWAYS preserve all changes from current branch
3. ALWAYS verify files exist after merge
4. ALWAYS check that production matches dev
```

---

## **What This Does**

1. ✅ **Checks current branch** and confirms it's correct
2. ✅ **Commits any uncommitted changes** to current branch
3. ✅ **Pushes current branch** to GitHub
4. ✅ **Switches to main branch** safely
5. ✅ **Pulls latest main** from GitHub
6. ✅ **Merges current branch** into main (preserving all files)
7. ✅ **Pushes main** to GitHub
8. ✅ **Verifies all files** are present in main
9. ✅ **Confirms production deployment** triggered
10. ✅ **Verifies production** matches dev site

---

## **Safety Features**

- 🛡️ **File Preservation:** Never deletes files during merge
- 🛡️ **Status Verification:** Always checks git status before operations
- 🛡️ **File Verification:** Always verifies files exist after merge
- 🛡️ **Production Verification:** Always confirms production matches dev
- 🛡️ **Confirmation Required:** Always asks before destructive operations

---

## **Expected Result**

- **All files preserved** from current branch
- **Main branch updated** with all changes
- **Production deployment** triggered automatically
- **Production site matches** dev site exactly
- **No files lost** during the process

---

## **Troubleshooting**

If files are missing after merge:
1. **Stop immediately** - don't proceed
2. **Check git status** to see what happened
3. **Restore missing files** from current branch
4. **Re-merge** with proper file preservation
5. **Verify all files** are present before pushing

---

## **Git Commands Used**

```bash
# Check current branch
git branch --show-current

# Check git status
git status

# Add and commit changes
git add .
git commit -m "descriptive message"

# Push current branch
git push origin [branch-name]

# Switch to main
git checkout main

# Pull latest main
git pull origin main

# Merge current branch (preserve all files)
git merge [branch-name] --no-ff

# Push main
git push origin main

# Verify files exist
git ls-files | grep [filename]
```
