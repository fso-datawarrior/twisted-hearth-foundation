# Firebase Project Configuration

## Project Overview

This document contains the complete Firebase project configuration for the Twisted Hearth Foundation Halloween event website.

## Core Project Information

- **Project ID**: `twisted-hearth-foundation`
- **Project Number**: `1017057598145`
- **Organization**: `data-warrior.com`
- **Project Name**: `twisted-hearth-foundation`
- **Environment**: Production and Development

## Firebase Hosting Configuration

### Production Hosting
- **Domain**: `2025.partytillyou.rip`
- **Firebase Hosting Site**: `twisted-hearth-foundation` (default site)
- **Target Name**: `main`
- **Deployment Command**: `firebase deploy --only hosting:main`

### Development Hosting
- **Domain**: `twisted-hearth-foundation-dev.web.app`
- **Firebase Hosting Site**: `twisted-hearth-foundation-dev`
- **Target Name**: `dev`
- **Deployment Command**: `firebase deploy --only hosting:dev`

## Service Accounts

### Firebase Admin SDK Service Account
- **Email**: `firebase-adminsdk-fbsvc@twisted-hearth-foundation.iam.gserviceaccount.com`
- **Name**: `firebase-adminsdk`
- **Roles**:
  - `Firebase Admin SDK Administrator Service Agent`
  - `Firebase App Check Admin`
  - `Service Account Token Creator`

### Firebase Hosting Deployer Service Account
- **Email**: `firebase-hosting-deployer@twisted-hearth-foundation.iam.gserviceaccount.com`
- **Name**: `firebase-hosting-deployer`
- **Roles**:
  - `Firebase Hosting Admin`

## IAM Permissions Structure

### Organization Level (`data-warrior.com`)
- **Group**: `gcp-organization-admins@data-warrior.com`
  - `Organization Administrator`
  - `Pub/Sub Admin`
  - `Security Center Admin`

### Project Level (`twisted-hearth-foundation`)
- **User**: `fso@data-warrior.com` (FSO Admin)
  - `Organization Administrator` (inherited)
  - `Owner` (inherited)

## GitHub Actions Configuration

### Required Secrets
- **FIREBASE_TOKEN**: CI token for Firebase authentication
  - Generated via: `firebase login:ci`
  - Updated in: GitHub Settings → Secrets and variables → Actions

### Workflow Triggers
- **Production**: Push/PR to `prod-2025.partytillyou.rip` branch
- **Development**: Push to development branches (v-3.0.3.x, dev, develop, etc.)

## Firebase CLI Commands

### Authentication
```bash
# Generate CI token for GitHub Actions
firebase login:ci

# Local authentication
firebase login
```

### Project Management
```bash
# List all projects
firebase projects:list

# Switch to project
firebase use twisted-hearth-foundation

# List hosting sites
firebase hosting:sites:list
```

### Deployment Commands
```bash
# Deploy to production
firebase deploy --only hosting:main

# Deploy to development
firebase deploy --only hosting:dev

# Deploy preview channel
firebase hosting:channel:deploy pr-123 --expires 7d
```

## Troubleshooting

### "Invalid project selection" Error
This error occurs when the hosting site name in `.firebaserc` doesn't match the actual Firebase Hosting site.

**Solution**: Verify the hosting site name:
```bash
firebase hosting:sites:list
```

Then update `.firebaserc` with the correct site name.

### "Authentication Error: Your credentials are no longer valid"
The `FIREBASE_TOKEN` GitHub secret has expired.

**Solution**:
1. Generate new token: `firebase login:ci`
2. Update GitHub secret: Settings → Secrets and variables → Actions → FIREBASE_TOKEN
3. Re-run the failed workflow

### Deployment Not Appearing
1. Wait 2-3 minutes for Firebase CDN propagation
2. Hard refresh browser (Ctrl+F5)
3. Check Firebase Console for deployment status

## Configuration Files

### `.firebaserc`
```json
{
  "projects": {
    "default": "twisted-hearth-foundation"
  },
  "targets": {
    "twisted-hearth-foundation": {
      "hosting": {
        "main": ["twisted-hearth-foundation"],
        "dev": ["twisted-hearth-foundation-dev"]
      }
    }
  }
}
```

### `firebase.json`
```json
{
  "hosting": [
    {
      "target": "main",
      "public": "dist",
      "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
      "rewrites": [{"source": "**", "destination": "/index.html"}]
    },
    {
      "target": "dev",
      "public": "dist",
      "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
      "rewrites": [{"source": "**", "destination": "/index.html"}]
    }
  ]
}
```

## URLs

- **Production Site**: https://2025.partytillyou.rip/
- **Development Site**: https://twisted-hearth-foundation-dev.web.app/
- **Firebase Console**: https://console.firebase.google.com/project/twisted-hearth-foundation
- **GitHub Repository**: https://github.com/fso-datawarrior/twisted-hearth-foundation
- **GitHub Actions**: https://github.com/fso-datawarrior/twisted-hearth-foundation/actions

## Security Notes

- All service accounts follow principle of least privilege
- CI/CD tokens are rotated regularly
- Production deployments require explicit branch merging
- Development deployments are automated for approved branches only

---

*Last Updated: January 2025*
*Document Version: 1.0*
