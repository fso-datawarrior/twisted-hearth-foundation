# Which Deployment Path Should I Use Today?

**Quick decision guide for choosing your daily deployment workflow.**

---

## Quick Comparison

| Aspect | Path A (Standard) | Path B (Manual) | Path C (Development) |
|--------|------------------|-----------------|---------------------|
| **Workflow** | Dev → PR → Preview → Merge → Prod | Dev → Manual Deploy → Prod | Dev → Development Site |
| **Review Process** | ✅ PR review, team approval | ❌ Skip review, direct deploy | ❌ No review needed |
| **Git History** | ✅ Clean merge history | ⚠️ Bypasses main branch | ✅ Clean development history |
| **Speed** | 🐌 Slower (PR process) | ⚡ Faster (immediate) | ⚡⚡ Fastest (auto-deploy) |
| **Safety** | ✅ Safer (preview + review) | ⚠️ Riskier (no preview) | ✅ Safe (dev only) |
| **Rollback** | ✅ Easy (revert PR) | ⚠️ Manual rollback needed | ✅ Easy (revert commit) |
| **Team Visibility** | ✅ Everyone sees changes | ⚠️ May surprise team | ✅ Team can see dev work |
| **Live Preview** | ✅ Preview URL (expires) | ❌ No preview | ✅ Always available |

---

## When to Use Path C (Development Site)

**✅ Choose Path C when:**

- **Daily development** - Working on features throughout the day
- **Live preview needed** - Want to see changes immediately as you code
- **Experimental features** - Testing new ideas without affecting production
- **Client demos** - Need a stable URL to show work in progress
- **Team collaboration** - Others need to see your development work
- **Learning/experimentation** - Trying new approaches or technologies
- **Bug investigation** - Debugging issues with live environment

**🎯 Perfect for:**
- Morning development setup
- Feature development cycles
- Client presentations
- Team code reviews
- Testing integrations

**📋 Daily workflow:**
1. Use "Setup Development Environment" prompt
2. Create development branch
3. Code and push changes
4. See updates live on development site
5. When ready, use Path A or B for production

---

## When to Use Path A (Standard Workflow)

**✅ Choose Path A when:**

- **Team collaboration** - Others need to review your changes
- **Important features** - New functionality that needs testing
- **Bug fixes** - Critical fixes that need careful review
- **Documentation** - Changes that should be documented in git history
- **Stable releases** - Features ready for production
- **Learning/mentoring** - Junior developers should use this path

**Path A Process:**
1. Work on `dev` branch
2. Create PR to `main`
3. Get preview URL for testing
4. Team reviews and approves
5. Merge PR → auto-deploy to production

**Time:** ~15-30 minutes (depending on review time)

---

## When to Use Path B (Manual Deploy)

**⚡ Choose Path B when:**

- **Rapid iteration** - Testing experimental features quickly
- **Hotfixes** - Urgent production fixes
- **Personal projects** - Working solo, no team review needed
- **A/B testing** - Deploying different versions for comparison
- **Debugging** - Need to test fixes in production environment
- **Time pressure** - Can't wait for PR process

**Path B Process:**
1. Work on any branch (dev, feature, etc.)
2. Go to GitHub Actions
3. Run workflow manually with your branch
4. Deploy directly to production
5. **Important:** Reset to `main` at end of day

**Time:** ~5-10 minutes

---

## Decision Tree

```
Are you working with a team?
├─ YES → Do others need to review your changes?
│   ├─ YES → Use Path A
│   └─ NO → Is this urgent/critical?
│       ├─ YES → Use Path B (but notify team)
│       └─ NO → Use Path A
└─ NO → Is this experimental/rapid iteration?
    ├─ YES → Use Path B
    └─ NO → Use Path A
```

---

## Path B Safety Rules

**⚠️ If you choose Path B, follow these rules:**

1. **Communicate first:**
   ```
   "Deploying branch 3.1.0-dev-email-cleanup (commit abc123) 
   directly to production via Path B. I'll restore prod to main at EOD."
   ```

2. **Reset at end of day:**
   - Either merge your branch to `main` (keeps changes)
   - Or run workflow with `branch=main, target=production` (reverts to main)

3. **Test thoroughly:**
   - Since there's no preview, test locally first
   - Have rollback plan ready

4. **Document what you did:**
   - Note which branch was deployed
   - Keep track of changes made

---

## Emergency Scenarios

**🚨 When Path B is the only option:**

- **Production is down** - Deploy fix immediately
- **Security vulnerability** - Hotfix needed now
- **Data corruption** - Urgent fix required
- **Client demo** - Need working version ASAP

**Even in emergencies:**
- Notify team immediately after deploy
- Plan to merge changes to `main` later
- Document what was deployed and why

---

## Quick Reference

**Path A Runbook:** `RUNBOOK-PathA.md`  
**Path B Runbook:** `RUNBOOK-PathB.md`  
**Setup Guide:** `UNIFIED-SETUP.md`

**Key URLs:**
- GitHub Actions: https://github.com/OWNER/REPO/actions
- Production Site: https://2025.partytillyou.rip
- Firebase Console: https://console.firebase.google.com/project/twisted-hearth-foundation/hosting

---

## Still Not Sure?

**Default recommendation:** Use Path A unless you have a specific reason for Path B.

Path A is safer, more collaborative, and creates better git history. Only use Path B when speed is more important than safety and review.
