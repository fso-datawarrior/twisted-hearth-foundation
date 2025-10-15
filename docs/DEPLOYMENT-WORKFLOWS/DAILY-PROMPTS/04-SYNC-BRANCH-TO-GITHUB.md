# 04-SYNC-BRANCH-TO-GITHUB.md

## 🔄 **Sync Branch to GitHub**

Use this prompt to sync your current branch with the remote GitHub repository.

---

**Prompt:**
```
Sync my current branch to GitHub.

Current branch: [CURRENT_BRANCH_NAME]

Instructions:
1. Check current branch and confirm it's correct
2. Check git status for any uncommitted changes
3. Add all changes to git staging
4. Commit changes with descriptive message
5. Push branch to GitHub
6. Confirm sync was successful

SAFETY CHECKS:
- NEVER delete files without explicit confirmation
- ALWAYS check git status before making changes
- ALWAYS ask for commit message if not provided
- ALWAYS verify push was successful
- ALWAYS confirm branch is up to date with remote

Repository: https://github.com/fso-datawarrior/twisted-hearth-foundation
```

---

## **Usage Examples**

### **Quick Sync:**
```
Sync my current branch to GitHub.

Current branch: v-3.0.1.2-dev-email-cleanup
```

### **Sync with Specific Changes:**
```
Sync my current branch to GitHub.

Current branch: v-3.0.1.2-dev-email-cleanup

Changes made:
- Fixed email validation logic
- Updated user interface
- Added error handling
```

### **Sync with Commit Message:**
```
Sync my current branch to GitHub.

Current branch: v-3.0.1.2-dev-email-cleanup

Commit message: "fix: improve email validation and user interface"
```

---

## **What This Does**

1. ✅ **Checks current branch** and confirms it's correct
2. ✅ **Checks git status** for uncommitted changes
3. ✅ **Stages all changes** (`git add .`)
4. ✅ **Commits with message** (asks for description if needed)
5. ✅ **Pushes to GitHub** to sync with remote
6. ✅ **Confirms sync was successful**

---

## **Safety Features**

- 🛡️ **File Protection:** Never deletes files without explicit confirmation
- 🛡️ **Status Verification:** Always checks git status before making changes
- 🛡️ **Commit Safety:** Always asks for commit message if not provided
- 🛡️ **Push Verification:** Always verifies push was successful
- 🛡️ **Branch Confirmation:** Always confirms branch is up to date with remote

---

## **Expected Result**

- **Changes committed** and pushed to GitHub
- **Branch synced** with remote repository
- **All local changes** safely stored on GitHub
- **Ready for** development environment setup or production deployment

---

## **When to Use This**

- **Before switching branches** - ensure current work is saved
- **During development** - sync progress without deploying
- **Before meetings** - ensure latest changes are backed up
- **End of work session** - save all progress to GitHub
- **Before any deployment** - ensure branch is up to date

---

## **Difference from Other Prompts**

| Prompt | Purpose | What It Does |
|--------|---------|-------------|
| **04-SYNC-BRANCH-TO-GITHUB** | Sync only | Commits and pushes to GitHub |
| **02-UPDATE-DEV-ENVIRONMENT** | Sync + Deploy | Commits, pushes, and triggers dev deployment |
| **03-DEPLOY-TO-PRODUCTION** | Sync + Deploy | Commits, pushes, merges to main, and triggers production |

---

## **Git Commands Used**

```bash
# Check current branch
git branch --show-current

# Check git status
git status

# Add all changes
git add .

# Commit changes
git commit -m "descriptive message"

# Push to GitHub
git push origin [branch-name]

# Verify push was successful
git status -uno
```
