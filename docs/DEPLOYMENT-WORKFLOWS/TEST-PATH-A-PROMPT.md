# Test Path A Workflow - Complete Cursor Chat Prompt

**Use this prompt in a new Cursor chat to test the entire Path A deployment workflow.**

---

## Cursor Chat Prompt

```
I need to test the Path A deployment workflow (PR → Preview → Merge → Production) for my Firebase-hosted React app. Here's the context:

**Project Details:**
- Repository: fso-datawarrior/twisted-hearth-foundation
- Current branch: v-3.0.0.0-Milestone
- Firebase project: twisted-hearth-foundation
- Production URL: https://2025.partytillyou.rip
- Firebase token: Already configured in GitHub secrets as FIREBASE_TOKEN

**Current State:**
- I have a unified GitHub Actions workflow at .github/workflows/firebase-hosting.yml
- The workflow supports both Path A (PR previews) and Path B (manual deploys)
- Path B is already working (manual deploys work perfectly)
- I need to test Path A: Create PR → Preview → Merge → Production

**What I need you to do:**

1. **Verify the current workflow configuration** - Check that .github/workflows/firebase-hosting.yml has the correct triggers for pull_request and push events

2. **Create a test PR** - Help me create a pull request from v-3.0.0.0-Milestone to main to trigger the preview workflow

3. **Monitor the preview deployment** - Watch the GitHub Actions run and verify the preview URL is generated

4. **Test the preview** - Help me verify the preview URL works and shows the correct changes

5. **Test production deployment** - Help me merge the PR and verify it auto-deploys to production

6. **Verify the complete workflow** - Confirm that both preview and production deployments work correctly

**Expected workflow:**
- PR created → GitHub Actions runs → Preview URL generated → Test preview → Merge PR → Production deploy → Verify live site

**Key files to check:**
- .github/workflows/firebase-hosting.yml (should have pull_request and push triggers)
- firebase.json (should point to "public": "dist")
- .firebaserc (should have project alias)

**Success criteria:**
- Preview URL works and shows current branch changes
- Production URL (https://2025.partytillyou.rip) updates after merge
- No authentication or deployment errors
- Both preview and production use the same Firebase token authentication

Please start by examining the current workflow configuration and then guide me through testing the complete Path A workflow.
```

---

## What This Prompt Tests

**Complete Path A Workflow:**
1. ✅ **Workflow Configuration** - Verifies triggers are correct
2. ✅ **PR Creation** - Tests pull_request trigger
3. ✅ **Preview Deploy** - Tests preview channel creation
4. ✅ **Preview Testing** - Verifies preview URL works
5. ✅ **PR Merge** - Tests push trigger
6. ✅ **Production Deploy** - Tests production deployment
7. ✅ **End-to-End Verification** - Confirms complete workflow

**Expected Results:**
- Preview URL: `https://twisted-hearth-foundation--pr-X-xxxxx.web.app`
- Production URL: `https://2025.partytillyou.rip`
- Both should show the same content (current branch changes)
- No authentication errors
- Clean deployment logs

**If Issues Arise:**
- Authentication problems → Check Firebase token secret
- Workflow not triggering → Check trigger configuration
- Preview not working → Check channelId logic
- Production not updating → Check push trigger and merge process

---

## Quick Reference

**GitHub URLs:**
- Actions: https://github.com/fso-datawarrior/twisted-hearth-foundation/actions
- Create PR: https://github.com/fso-datawarrior/twisted-hearth-foundation/compare
- Repository: https://github.com/fso-datawarrior/twisted-hearth-foundation

**Firebase URLs:**
- Console: https://console.firebase.google.com/project/twisted-hearth-foundation/hosting
- Production: https://2025.partytillyou.rip
- Backup: https://twisted-hearth-foundation.web.app

**Key Commands:**
```bash
# Check current branch
git branch

# Check workflow file
cat .github/workflows/firebase-hosting.yml

# Check Firebase config
cat firebase.json
cat .firebaserc
```

---

**Copy the prompt above and paste it into a new Cursor chat to test the complete Path A workflow!**
