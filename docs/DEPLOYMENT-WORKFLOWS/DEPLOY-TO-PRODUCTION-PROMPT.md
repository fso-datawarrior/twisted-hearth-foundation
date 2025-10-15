# Deploy to Production - Cursor Chat Prompt

**Use this prompt in Cursor to deploy your current branch to production using Path B (manual deploy).**

---

## Cursor Chat Prompt

```
I need to deploy my current branch to production. Please help me with the complete deployment process.

**Project Context:**
- Repository: fso-datawarrior/twisted-hearth-foundation
- Firebase project: twisted-hearth-foundation
- Production URL: https://2025.partytillyou.rip
- Development URL: https://twisted-hearth-foundation-dev.web.app
- Firebase token: Already configured in GitHub secrets as FIREBASE_TOKEN

**Documentation References:**
- Setup Guide: docs/DEPLOYMENT-WORKFLOWS/UNIFIED-SETUP.md
- Decision Guide: docs/DEPLOYMENT-WORKFLOWS/WHICH-PATH-GUIDE.md
- Path A Runbook: docs/DEPLOYMENT-WORKFLOWS/RUNBOOK-PathA.md
- Path B Runbook: docs/DEPLOYMENT-WORKFLOWS/RUNBOOK-PathB.md

**What I need you to do:**

1. **Check current branch** - First, determine what branch I'm currently on and display it clearly

2. **Choose deployment path** - Ask me which path I want to use:
   - **Path A (PR → Preview → Merge → Production):** Create PR, get preview URL, merge to main
   - **Path B (Direct Deploy):** Deploy current branch directly to production
   - Explain the differences and help me choose

3. **Verify branch choice** - Ask me to confirm this is the correct branch to deploy to production, or if I need to switch branches first

4. **Check prerequisites** - Verify that:
   - The branch has recent commits
   - The branch is pushed to GitHub
   - Firebase token secret exists
   - Workflow file is properly configured

5. **Execute deployment** - Based on chosen path:
   - **Path A:** Create PR, provide preview URL, guide through merge process
   - **Path B:** Run manual GitHub Actions workflow with current branch and target=production

6. **Monitor deployment** - Watch the deployment logs and report status

7. **Verify production** - Check that the production site updated correctly

**Troubleshooting Notes:**
- If GitHub Actions "Run workflow" button doesn't appear, check:
  1. You're logged into GitHub with write permissions
  2. Actions are enabled in repository settings
  3. Workflow file has correct YAML syntax
  4. Line endings are Unix (LF) not Windows (CRLF)
- The workflow file is: `.github/workflows/firebase-hosting.yml`
- Manual trigger is called "Firebase Hosting (Preview & Prod)"

**Important Notes:**
- Path A includes code review and preview testing
- Path B bypasses the PR process for direct deployment
- Make sure this is the intended behavior before proceeding
- Reference our documentation for any questions about the deployment process

**Stop and ask for confirmation at each major step, especially:**
- Before choosing deployment path
- Before confirming the branch to deploy
- Before triggering the GitHub Actions workflow
- If any errors occur during deployment

Please start by checking my current branch and asking which deployment path I want to use.
```

---

## What This Prompt Does

**Step-by-Step Process:**
1. ✅ **Branch Verification** - Checks current branch and displays it clearly
2. ✅ **Path Selection** - Helps choose between Path A (PR) or Path B (direct)
3. ✅ **Prerequisites Check** - Verifies setup and configuration
4. ✅ **Deployment Execution** - Runs chosen path (PR creation or manual workflow)
5. ✅ **Deployment Monitoring** - Watches logs and reports status
6. ✅ **Production Verification** - Confirms live site updated

**Safety Features:**
- **Path selection** - Helps choose the right deployment approach
- **Branch confirmation** - Prevents accidental wrong-branch deploys
- **Prerequisites check** - Ensures everything is ready
- **Step-by-step confirmation** - Stops at each major step
- **Error handling** - Pauses if issues arise
- **Troubleshooting guidance** - Helps resolve common issues

**Documentation Integration:**
- References all your deployment docs
- Links to specific runbooks and guides
- Provides context for decision-making
- Includes troubleshooting steps

---

## Expected Workflow

**When you run this prompt:**

1. **AI checks:** `git branch` → Shows current branch
2. **AI asks:** "You're on branch X. Is this correct for production deployment?"
3. **You confirm:** "Yes" or "No, switch to branch Y"
4. **AI verifies:** Prerequisites, recent commits, GitHub push status
5. **AI executes:** Manual GitHub Actions workflow
6. **AI monitors:** Deployment progress and logs
7. **AI verifies:** Production site at https://2025.partytillyou.rip

**Success Criteria:**
- Correct branch deployed
- No authentication errors
- Production site updated
- Clean deployment logs

---

## Quick Reference

**Key URLs:**
- GitHub Actions: https://github.com/fso-datawarrior/twisted-hearth-foundation/actions
- Production Site: https://2025.partytillyou.rip
- Firebase Console: https://console.firebase.google.com/project/twisted-hearth-foundation/hosting

**Key Commands:**
```bash
# Check current branch
git branch

# Check recent commits
git log --oneline -5

# Check if pushed to GitHub
git status
```

---

**Copy this prompt and use it in Cursor whenever you want to deploy to production!**
