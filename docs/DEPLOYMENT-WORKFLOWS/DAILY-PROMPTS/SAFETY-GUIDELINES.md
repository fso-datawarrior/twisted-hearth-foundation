# 🛡️ **SAFETY GUIDELINES FOR DAILY PROMPTS**

## **🚨 CRITICAL SAFETY RULES**

### **1. File Protection**
- **NEVER delete files** without explicit user confirmation
- **ALWAYS check if files are being used** before removing them
- **ALWAYS verify file dependencies** before cleanup operations
- **ALWAYS ask "Are you sure?"** before destructive operations

### **2. Git Workflow Safety**
- **ALWAYS check git status** before making any changes
- **ALWAYS commit changes** before switching branches
- **ALWAYS verify push was successful** before proceeding
- **ALWAYS confirm branch is up to date** with remote

### **3. Change Preservation**
- **ALWAYS preserve working code** - never delete active implementations
- **ALWAYS check for uncommitted changes** before cleanup
- **ALWAYS ask for confirmation** before removing "unused" files
- **ALWAYS verify files are truly unused** before deletion

---

## **🔍 Pre-Operation Checks**

### **Before Any Git Operation:**
```bash
# Check current status
git status

# Check for uncommitted changes
git diff --name-only

# Check current branch
git branch --show-current

# Check if branch is up to date
git fetch
git status -uno
```

### **Before File Deletion:**
```bash
# Check if file is imported/used
grep -r "filename" src/
grep -r "import.*filename" src/
grep -r "from.*filename" src/

# Check if file is referenced in package.json
grep -r "filename" package.json
```

---

## **⚠️ Common Mistakes to Avoid**

### **❌ DON'T DO THIS:**
- Delete files without checking if they're used
- Assume files are "unused" without verification
- Clean up without asking for confirmation
- Delete working implementations
- Remove context files without checking imports

### **✅ DO THIS INSTEAD:**
- Always check file usage before deletion
- Ask for explicit confirmation before cleanup
- Preserve working code and implementations
- Verify files are truly unused before removing
- Check all imports and references first

---

## **🔄 Safe Cleanup Process**

### **Step 1: Identify Files**
```bash
# List all files in directory
ls -la src/contexts/

# Check git status for untracked files
git status --porcelain
```

### **Step 2: Verify Usage**
```bash
# Check if file is imported anywhere
grep -r "SupportModalContext" src/
grep -r "import.*SupportModalContext" src/
grep -r "from.*SupportModalContext" src/
```

### **Step 3: Ask for Confirmation**
```
I found these files that appear to be unused:
- src/contexts/SupportModalContext.tsx

Before deleting, I need to confirm:
1. Are you sure this file is not being used?
2. Have you checked all imports and references?
3. Is this file part of a working implementation?

Please confirm before I proceed with deletion.
```

### **Step 4: Safe Deletion**
```bash
# Only delete after explicit confirmation
git rm src/contexts/SupportModalContext.tsx
git commit -m "remove unused SupportModalContext (confirmed safe)"
```

---

## **📋 Safety Checklist**

Before any operation, verify:

- [ ] **Git status is clean** or changes are committed
- [ ] **Current branch is correct** for the operation
- [ ] **Files are truly unused** before deletion
- [ ] **User has confirmed** destructive operations
- [ ] **Working code is preserved** and not deleted
- [ ] **All imports checked** before removing files
- [ ] **Push was successful** before proceeding
- [ ] **Deployment status confirmed** after changes

---

## **🚨 Emergency Recovery**

If files are accidentally deleted:

### **1. Check Git History**
```bash
# Find when file was deleted
git log --oneline --follow -- src/contexts/SupportModalContext.tsx

# See what was deleted
git show HEAD~1:src/contexts/SupportModalContext.tsx
```

### **2. Restore from Git**
```bash
# Restore file from previous commit
git checkout HEAD~1 -- src/contexts/SupportModalContext.tsx

# Or restore from specific commit
git checkout <commit-hash> -- src/contexts/SupportModalContext.tsx
```

### **3. Recreate Implementation**
If file can't be restored, recreate based on:
- User's description of what was working
- Similar patterns in the codebase
- User's original implementation notes

---

**Remember: It's better to be safe than sorry. Always ask before deleting!** 🛡️
