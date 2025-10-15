# Deploy to Production - Cursor Chat Prompt

**Use this prompt in Cursor to deploy your current branch to production using Path B (manual deploy).**

---

## Cursor Chat Prompt

```
I need to deploy my current branch to production using our Firebase hosting setup. Please help me with the complete deployment process.

**Project Context:**
- Repository: fso-datawarrior/twisted-hearth-foundation
- Firebase project: twisted-hearth-foundation
- Production URL: https://2025.partytillyou.rip
- Firebase token: Already configured in GitHub secrets as FIREBASE_TOKEN

**Documentation References:**
- Setup Guide: docs/DEPLOYMENT-WORKFLOWS/UNIFIED-SETUP.md
- Path B Runbook: docs/DEPLOYMENT-WORKFLOWS/RUNBOOK-PathB.md
- Decision Guide: docs/DEPLOYMENT-WORKFLOWS/WHICH-PATH-GUIDE.md

**What I need you to do:**

1. **Check current branch** - First, determine what branch I'm currently on and display it clearly

2. **Verify branch choice** - Ask me to confirm this is the correct branch to deploy to production, or if I need to switch branches first

3. **Check prerequisites** - Verify that:
   - The branch has recent commits
   - The branch is pushed to GitHub
   - Firebase token secret exists
   - Workflow file is properly configured

4. **Execute Path B deployment** - Once confirmed, run the manual GitHub Actions workflow:
   - Go to: https://github.com/fso-datawarrior/twisted-hearth-foundation/actions
   - Find "Firebase Hosting (Preview & Prod)" workflow
   - Run workflow manually with current branch and target=production

5. **Monitor deployment** - Watch the deployment logs and report status

6. **Verify production** - Check that the production site updated correctly

**Important Notes:**
- This uses Path B (manual deploy) which bypasses the PR process
- The branch will be deployed directly to production
- Make sure this is the intended behavior before proceeding
- Reference our documentation for any questions about the deployment process

**Stop and ask for confirmation at each major step, especially:**
- Before confirming the branch to deploy
- Before triggering the GitHub Actions workflow
- If any errors occur during deployment

Please start by checking my current branch and asking for confirmation.
```

---

## What This Prompt Does

**Step-by-Step Process:**
1. ✅ **Branch Verification** - Checks current branch and asks for confirmation
2. ✅ **Prerequisites Check** - Verifies setup and configuration
3. ✅ **Path B Execution** - Runs manual GitHub Actions workflow
4. ✅ **Deployment Monitoring** - Watches logs and reports status
5. ✅ **Production Verification** - Confirms live site updated

**Safety Features:**
- **Branch confirmation** - Prevents accidental wrong-branch deploys
- **Prerequisites check** - Ensures everything is ready
- **Step-by-step confirmation** - Stops at each major step
- **Error handling** - Pauses if issues arise

**Documentation Integration:**
- References all your deployment docs
- Links to specific runbooks and guides
- Provides context for decision-making

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
