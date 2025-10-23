# Deploy Release Email Edge Function (PowerShell)
# Run this script from the project root directory

Write-Host "🚀 Deploying Release Email Edge Function..." -ForegroundColor Green

# Check if Supabase CLI is available
Write-Host "📦 Checking Supabase CLI..." -ForegroundColor Yellow
try {
    $version = npx supabase --version
    Write-Host "✅ Supabase CLI available: $version" -ForegroundColor Green
}
catch {
    Write-Host "❌ Supabase CLI not found. Installing..." -ForegroundColor Red
    npx supabase --version
}

# Check if logged in
Write-Host "🔐 Checking Supabase authentication..." -ForegroundColor Yellow
try {
    npx supabase projects list | Out-Null
    Write-Host "✅ Authenticated with Supabase" -ForegroundColor Green
}
catch {
    Write-Host "❌ Not logged in to Supabase. Please run:" -ForegroundColor Red
    Write-Host "   supabase login" -ForegroundColor Cyan
    Write-Host "   Then run this script again." -ForegroundColor Cyan
    exit 1
}

# Deploy the function
Write-Host "📡 Deploying send-release-email function..." -ForegroundColor Yellow
$deployResult = npx supabase functions deploy send-release-email --project-ref dgdeiybuxlqbdfofzxpy

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Function deployed successfully!" -ForegroundColor Green
    Write-Host "🧪 Testing deployment..." -ForegroundColor Yellow
    npx supabase functions list --project-ref dgdeiybuxlqbdfofzxpy
    Write-Host ""
    Write-Host "🎉 Deployment complete! You can now test the email sending feature." -ForegroundColor Green
    Write-Host "   Go to Release Management → Click 'Send System Update Email'" -ForegroundColor Cyan
}
else {
    Write-Host "❌ Deployment failed. Check the error messages above." -ForegroundColor Red
    Write-Host "💡 Try deploying manually via the Supabase Dashboard:" -ForegroundColor Yellow
    Write-Host "   https://supabase.com/dashboard/project/dgdeiybuxlqbdfofzxpy" -ForegroundColor Cyan
}
