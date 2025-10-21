# Deployment Architecture Overview

## System Architecture

### High-Level Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Development   │    │   GitHub Actions  │    │   Firebase      │
│   Branches      │───▶│   Workflows      │───▶│   Hosting       │
│                 │    │                  │    │                 │
│ • v-3.0.3.*     │    │ • Build Process  │    │ • Dev Site      │
│ • dev           │    │ • Authentication │    │ • Prod Site     │
│ • develop       │    │ • Deployment     │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                        │                        │
         │                        │                        │
         ▼                        ▼                        ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Production    │    │   Workload       │    │   Supabase      │
│   Branch        │    │   Identity       │    │   Backend       │
│                 │    │                  │    │                 │
│ • prod-2025.    │    │ • Google Cloud   │    │ • Database      │
│   partytillyou. │    │ • Service Account│    │ • Auth          │
│   rip           │    │ • Repository     │    │ • API           │
└─────────────────┘    │   Restriction    │    └─────────────────┘
                       └──────────────────┘
```

### Component Details

**Frontend (React + Vite)**
- React application with TypeScript
- Vite build system
- Tailwind CSS for styling
- Supabase client for backend integration

**Hosting (Firebase)**
- Firebase Hosting for static site hosting
- CDN distribution for global performance
- Custom domain support
- SSL certificates managed automatically

**Backend (Supabase)**
- PostgreSQL database
- Real-time subscriptions
- Authentication service
- REST and GraphQL APIs

**Authentication (Workload Identity)**
- Google Cloud Workload Identity Federation
- GitHub Actions integration
- Service account impersonation
- Repository-scoped access

## Deployment Pipeline

### Development Pipeline

```
Developer → Git Push → GitHub Actions → Firebase Hosting (Dev)
    │           │            │                    │
    │           │            │                    │
    ▼           ▼            ▼                    ▼
Local Dev   Dev Branch   Build & Deploy      Dev Site
Changes     (v-3.0.3.*)  (Automated)      (twisted-hearth-foundation-dev.web.app)
```

**Process Flow:**
1. Developer makes changes locally
2. Commits and pushes to development branch
3. GitHub Actions workflow triggers automatically
4. Builds project using `npm run build`
5. Deploys to Firebase Hosting development site
6. Site updates with new changes

### Production Pipeline

```
Dev Branch → Merge → Production Branch → GitHub Actions → Firebase Hosting (Prod)
    │           │            │                    │                    │
    │           │            │                    │                    │
    ▼           ▼            ▼                    ▼                    ▼
Tested      Manual      prod-2025.         Build & Deploy      Production Site
Changes     Merge       partytillyou.rip   (Automated)         (2025.partytillyou.rip)
```

**Process Flow:**
1. Development changes tested and verified
2. Manual merge to production branch (`prod-2025.partytillyou.rip`)
3. GitHub Actions workflow triggers automatically
4. Builds project using `npm run build`
5. Deploys to Firebase Hosting production site
6. Production site updates with new changes

## Branch Strategy

### Why We Use `prod-2025.partytillyou.rip` Instead of `main`

**The Problem with Main Branch:**
- Git worktree conflicts at `D:/OneDrive/GH_Repositories/2025 Twisted Hallows Fog Background/main-branch`
- Constant "main is already used by worktree" errors
- Files getting deleted during merge attempts
- PATCHES folders disappearing
- Daily prompts getting removed

**The Solution:**
- Dedicated production branch: `prod-2025.partytillyou.rip`
- Clear, descriptive naming
- Matches production URL
- No worktree conflicts
- Clean merges every time

### Branch Naming Convention

**Development Branches:**
- `v-3.0.3.*` - Version-specific development branches
- `dev` - General development branch
- `develop` - Alternative development branch
- `test-preview-channel` - Testing branch

**Production Branch:**
- `prod-2025.partytillyou.rip` - Production deployment branch

**Deprecated:**
- `main` - Avoided due to worktree conflicts

## Environment Separation

### Development Environment

**URL**: https://twisted-hearth-foundation-dev.web.app/
**Purpose**: Testing and iteration
**Triggers**: Push to development branches
**Features**:
- Automatic deployment on push
- Fast iteration cycle
- Safe testing environment
- Preview of changes

### Production Environment

**URL**: https://2025.partytillyou.rip/
**Purpose**: Live user-facing site
**Triggers**: Push to production branch
**Features**:
- Manual deployment control
- Stable, tested changes only
- Production-grade performance
- Custom domain with SSL

## Security Model

### Workload Identity Authentication

**Components:**
- **Identity Pool**: `github-actions` (Google Cloud)
- **OIDC Provider**: `github` (GitHub Actions)
- **Service Account**: `firebase-hosting-deployer@twisted-hearth-foundation.iam.gserviceaccount.com`
- **Repository Restriction**: `assertion.repository == "fso-datawarrior/twisted-hearth-foundation"`

**Security Benefits:**
- No stored secrets or tokens
- Repository-scoped access only
- Automatic credential rotation
- Audit trail in Google Cloud Console
- Principle of least privilege

### Service Account Permissions

**Firebase Hosting Deployer Service Account:**
- `Firebase Hosting Admin` - Deploy to Firebase Hosting
- `Workload Identity User` - Impersonate via Workload Identity

**No Additional Permissions:**
- No database access
- No other Firebase services
- No cross-project access
- No elevated privileges

### Repository Security

**Access Control:**
- Only `fso-datawarrior/twisted-hearth-foundation` repository can deploy
- No access from other repositories
- No access from other organizations
- Branch-level deployment control

## Authentication Flow

### Workload Identity Flow

```
GitHub Actions → Google Cloud → Firebase
     │              │              │
     │              │              │
     ▼              ▼              ▼
1. Request Token   2. Validate     3. Deploy
   (OIDC)            Repository      to Firebase
                     Restriction     Hosting
```

**Detailed Flow:**
1. GitHub Actions workflow starts
2. Requests OIDC token from GitHub
3. Sends token to Google Cloud Workload Identity
4. Google Cloud validates repository restriction
5. Issues short-lived access token
6. Firebase CLI uses token for deployment
7. Deployment completes successfully

### Benefits Over Token-Based Auth

**Old Method (FIREBASE_TOKEN):**
- Manual token generation (`firebase login:ci`)
- Tokens expire every 7-30 days
- Manual refresh required
- Tokens stored in GitHub secrets
- Risk of token exposure

**New Method (Workload Identity):**
- Automatic authentication
- No token expiration
- No manual maintenance
- No stored secrets
- More secure and reliable

## Quick Reference Links

### Documentation
- **Setup Guide**: `docs/DEPLOYMENT-PROD/WORKLOAD-IDENTITY-SETUP-GUIDE.md`
- **Replication Guide**: `docs/DEPLOYMENT-PROD/REPLICATION-GUIDE.md`
- **Project Configuration**: `docs/DEPLOYMENT-PROD/firebase-project-configuration.md`
- **Master Checklist**: `docs/DEPLOYMENT-PROD/MASTER-DEPLOYMENT-CHECKLIST.md`
- **Runbook**: `docs/DEPLOYMENT-PROD/InventoryRunBook.md`

### Workflows
- **Branch Strategy**: `docs/DEPLOYMENT-WORKFLOWS/PRODUCTION-BRANCH-STRATEGY.md`
- **Daily Prompts**: `docs/DEPLOYMENT-WORKFLOWS/DAILY-PROMPTS/README.md`
- **Safety Guidelines**: `docs/DEPLOYMENT-WORKFLOWS/DAILY-PROMPTS/SAFETY-GUIDELINES.md`

### Configuration Files
- **Production Workflow**: `.github/workflows/firebase-hosting.yml`
- **Development Workflow**: `.github/workflows/firebase-hosting-dev.yml`
- **Firebase Config**: `firebase.json`
- **Project Config**: `.firebaserc`

### External Links
- **Development Site**: https://twisted-hearth-foundation-dev.web.app/
- **Production Site**: https://2025.partytillyou.rip/
- **GitHub Actions**: https://github.com/fso-datawarrior/twisted-hearth-foundation/actions
- **Firebase Console**: https://console.firebase.google.com/project/twisted-hearth-foundation
- **Google Cloud Console**: https://console.cloud.google.com/project/twisted-hearth-foundation

## Key Benefits

### For Developers
- **Simple workflow**: Push to branch, deployment happens automatically
- **No token management**: No need to refresh authentication tokens
- **Fast iteration**: Development changes deploy immediately
- **Safe testing**: Development environment for testing changes

### For Operations
- **Reliable deployments**: No authentication failures
- **Audit trail**: All deployments logged in Google Cloud Console
- **Security**: Repository-scoped access, no stored secrets
- **Maintenance-free**: No manual token refresh needed

### For the Project
- **Consistent deployments**: Same process every time
- **Reduced errors**: Automated process reduces human error
- **Better security**: Workload Identity is more secure than tokens
- **Scalable**: Easy to replicate for other projects

---

**This architecture provides a robust, secure, and maintainable deployment pipeline for Firebase Hosting with GitHub Actions.**
