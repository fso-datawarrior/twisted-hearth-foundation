#!/bin/bash

# 🚀 AUTOMATED PRODUCTION DEPLOYMENT SCRIPT
# Based on DEPLOY-TO-PRODUCTION-PROMPT.md
# Usage: ./deploy-to-production.sh

set -e  # Exit on any error

echo "🚀 TWISTED HEARTH FOUNDATION - PRODUCTION DEPLOYMENT"
echo "=================================================="

# Step 1: Branch Verification
echo "📋 Step 1: Verifying current branch..."
CURRENT_BRANCH=$(git branch --show-current)
echo "✅ Current branch: $CURRENT_BRANCH"

if [ "$CURRENT_BRANCH" != "test-preview-channel" ]; then
    echo "⚠️  WARNING: You're not on test-preview-channel branch"
    echo "   Current branch: $CURRENT_BRANCH"
    echo "   Expected: test-preview-channel"
    read -p "   Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Deployment cancelled"
        exit 1
    fi
fi

# Step 2: Prerequisites Check
echo "📋 Step 2: Checking prerequisites..."

# Check for recent commits
echo "   Checking recent commits..."
git log --oneline -3

# Check working tree is clean
echo "   Checking working tree..."
if ! git diff-index --quiet HEAD --; then
    echo "❌ Working tree has uncommitted changes"
    echo "   Please commit or stash changes before deploying"
    exit 1
fi
echo "✅ Working tree is clean"

# Check if branch is pushed to GitHub
echo "   Checking if branch is pushed to GitHub..."
if ! git diff --quiet origin/$CURRENT_BRANCH; then
    echo "⚠️  Branch is not up to date with GitHub"
    echo "   Pushing changes..."
    git push origin $CURRENT_BRANCH
fi
echo "✅ Branch is up to date with GitHub"

# Step 3: Workflow File Check
echo "📋 Step 3: Verifying workflow file..."
if [ ! -f ".github/workflows/firebase-hosting.yml" ]; then
    echo "❌ Workflow file not found: .github/workflows/firebase-hosting.yml"
    exit 1
fi
echo "✅ Workflow file exists"

# Step 4: Firebase Configuration Check
echo "📋 Step 4: Checking Firebase configuration..."
if [ ! -f "firebase.json" ]; then
    echo "❌ Firebase configuration not found: firebase.json"
    exit 1
fi
echo "✅ Firebase configuration exists"

# Step 5: Build Test
echo "📋 Step 5: Testing build process..."
echo "   Installing dependencies..."
npm ci --legacy-peer-deps

echo "   Building project..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful"
else
    echo "❌ Build failed"
    exit 1
fi

# Step 6: Deployment Instructions
echo ""
echo "🎯 DEPLOYMENT READY!"
echo "==================="
echo ""
echo "📋 Manual Steps Required:"
echo "1. Go to: https://github.com/fso-datawarrior/twisted-hearth-foundation/actions/workflows/firebase-hosting.yml"
echo "2. Click 'Run workflow' button (right side)"
echo "3. Set parameters:"
echo "   - Branch: $CURRENT_BRANCH"
echo "   - Target: production"
echo "4. Click 'Run workflow'"
echo ""
echo "🔗 Quick Links:"
echo "   GitHub Actions: https://github.com/fso-datawarrior/twisted-hearth-foundation/actions"
echo "   Production Site: https://2025.partytillyou.rip"
echo "   Firebase Console: https://console.firebase.google.com/project/twisted-hearth-foundation/hosting"
echo ""
echo "⏱️  Expected deployment time: 2-5 minutes"
echo ""

# Step 7: Open GitHub Actions page
echo "🌐 Opening GitHub Actions page..."
if command -v start >/dev/null 2>&1; then
    start "https://github.com/fso-datawarrior/twisted-hearth-foundation/actions/workflows/firebase-hosting.yml"
elif command -v open >/dev/null 2>&1; then
    open "https://github.com/fso-datawarrior/twisted-hearth-foundation/actions/workflows/firebase-hosting.yml"
elif command -v xdg-open >/dev/null 2>&1; then
    xdg-open "https://github.com/fso-datawarrior/twisted-hearth-foundation/actions/workflows/firebase-hosting.yml"
else
    echo "   Please manually open the GitHub Actions page"
fi

echo ""
echo "✅ DEPLOYMENT SCRIPT COMPLETE!"
echo "   Follow the manual steps above to complete deployment"
