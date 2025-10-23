#!/bin/bash
# Deploy Release Email Edge Function
# Run this script from the project root directory

echo "🚀 Deploying Release Email Edge Function..."

# Check if Supabase CLI is available
if ! command -v supabase &> /dev/null; then
    echo "📦 Installing Supabase CLI via npx..."
    npx supabase --version
fi

# Check if logged in
echo "🔐 Checking Supabase authentication..."
if ! npx supabase projects list &> /dev/null; then
    echo "❌ Not logged in to Supabase. Please run:"
    echo "   supabase login"
    echo "   Then run this script again."
    exit 1
fi

# Deploy the function
echo "📡 Deploying send-release-email function..."
npx supabase functions deploy send-release-email --project-ref dgdeiybuxlqbdfofzxpy

if [ $? -eq 0 ]; then
    echo "✅ Function deployed successfully!"
    echo "🧪 Testing deployment..."
    npx supabase functions list --project-ref dgdeiybuxlqbdfofzxpy
    echo ""
    echo "🎉 Deployment complete! You can now test the email sending feature."
    echo "   Go to Release Management → Click 'Send System Update Email'"
else
    echo "❌ Deployment failed. Check the error messages above."
    echo "💡 Try deploying manually via the Supabase Dashboard:"
    echo "   https://supabase.com/dashboard/project/dgdeiybuxlqbdfofzxpy"
fi
