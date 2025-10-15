# 🚀 AUTOMATED PRODUCTION DEPLOYMENT SCRIPT (PowerShell)
# Based on DEPLOY-TO-PRODUCTION-PROMPT.md
# Usage: .\deploy-to-production.ps1

Write-Host "🚀 TWISTED HEARTH FOUNDATION - PRODUCTION DEPLOYMENT" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

# Step 1: Branch Verification
Write-Host "📋 Step 1: Verifying current branch..." -ForegroundColor Yellow
$currentBranch = git branch --show-current
Write-Host "✅ Current branch: $currentBranch" -ForegroundColor Green

if ($currentBranch -ne "test-preview-channel") {
    Write-Host "⚠️  WARNING: You're not on test-preview-channel branch" -ForegroundColor Yellow
    Write-Host "   Current branch: $currentBranch" -ForegroundColor Yellow
    Write-Host "   Expected: test-preview-channel" -ForegroundColor Yellow
    $continue = Read-Host "   Continue anyway? (y/N)"
    if ($continue -notmatch "^[Yy]$") {
        Write-Host "❌ Deployment cancelled" -ForegroundColor Red
        exit 1
    }
}

# Step 2: Prerequisites Check
Write-Host "📋 Step 2: Checking prerequisites..." -ForegroundColor Yellow

# Check for recent commits
Write-Host "   Checking recent commits..." -ForegroundColor White
git log --oneline -3

# Check working tree is clean
Write-Host "   Checking working tree..." -ForegroundColor White
$gitStatus = git status --porcelain
if ($gitStatus) {
    Write-Host "❌ Working tree has uncommitted changes" -ForegroundColor Red
    Write-Host "   Please commit or stash changes before deploying" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Working tree is clean" -ForegroundColor Green

# Check if branch is pushed to GitHub
Write-Host "   Checking if branch is pushed to GitHub..." -ForegroundColor White
$gitDiff = git diff origin/$currentBranch
if ($gitDiff) {
    Write-Host "⚠️  Branch is not up to date with GitHub" -ForegroundColor Yellow
    Write-Host "   Pushing changes..." -ForegroundColor White
    git push origin $currentBranch
}
Write-Host "✅ Branch is up to date with GitHub" -ForegroundColor Green

# Step 3: Workflow File Check
Write-Host "📋 Step 3: Verifying workflow file..." -ForegroundColor Yellow
if (!(Test-Path ".github/workflows/firebase-hosting.yml")) {
    Write-Host "❌ Workflow file not found: .github/workflows/firebase-hosting.yml" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Workflow file exists" -ForegroundColor Green

# Step 4: Firebase Configuration Check
Write-Host "📋 Step 4: Checking Firebase configuration..." -ForegroundColor Yellow
if (!(Test-Path "firebase.json")) {
    Write-Host "❌ Firebase configuration not found: firebase.json" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Firebase configuration exists" -ForegroundColor Green

# Step 5: Build Test
Write-Host "📋 Step 5: Testing build process..." -ForegroundColor Yellow
Write-Host "   Installing dependencies..." -ForegroundColor White
npm ci --legacy-peer-deps

Write-Host "   Building project..." -ForegroundColor White
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Build successful" -ForegroundColor Green
}
else {
    Write-Host "❌ Build failed" -ForegroundColor Red
    exit 1
}

# Step 6: Deployment Instructions
Write-Host ""
Write-Host "🎯 DEPLOYMENT READY!" -ForegroundColor Cyan
Write-Host "===================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Manual Steps Required:" -ForegroundColor Yellow
Write-Host "1. Go to: https://github.com/fso-datawarrior/twisted-hearth-foundation/actions/workflows/firebase-hosting.yml" -ForegroundColor White
Write-Host "2. Click 'Run workflow' button (right side)" -ForegroundColor White
Write-Host "3. Set parameters:" -ForegroundColor White
Write-Host "   - Branch: $currentBranch" -ForegroundColor White
Write-Host "   - Target: production" -ForegroundColor White
Write-Host "4. Click 'Run workflow'" -ForegroundColor White
Write-Host ""
Write-Host "🔗 Quick Links:" -ForegroundColor Yellow
Write-Host "   GitHub Actions: https://github.com/fso-datawarrior/twisted-hearth-foundation/actions" -ForegroundColor White
Write-Host "   Production Site: https://2025.partytillyou.rip" -ForegroundColor White
Write-Host "   Firebase Console: https://console.firebase.google.com/project/twisted-hearth-foundation/hosting" -ForegroundColor White
Write-Host ""
Write-Host "⏱️  Expected deployment time: 2-5 minutes" -ForegroundColor Yellow
Write-Host ""

# Step 7: Open GitHub Actions page
Write-Host "🌐 Opening GitHub Actions page..." -ForegroundColor Yellow
Start-Process "https://github.com/fso-datawarrior/twisted-hearth-foundation/actions/workflows/firebase-hosting.yml"

Write-Host ""
Write-Host "✅ DEPLOYMENT SCRIPT COMPLETE!" -ForegroundColor Green
Write-Host "   Follow the manual steps above to complete deployment" -ForegroundColor White
