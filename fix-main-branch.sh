#!/bin/bash

echo "🧹 Cleaning up main branch..."

# Fetch latest main
git fetch origin main

# Create a clean branch from main
git checkout -b clean-main origin/main

# Remove the old broken workflow file
rm -f .github/workflows/firebase-deploy.yml

# Copy the working workflow file from your current branch
git checkout v-3.0.1.1-UserDropdownViewFIX -- .github/workflows/firebase-hosting.yml

# Commit the changes
git add .
git commit -m "fix: remove broken firebase-deploy.yml, keep only working firebase-hosting.yml

- Deleted old firebase-deploy.yml that was causing conflicts
- Kept only the working firebase-hosting.yml with Firebase CLI auth
- Now main branch will work like development branch"

# Push to main
git push origin clean-main:main

echo "✅ Main branch cleaned up!"
echo "🚀 Production should now work like development!"
