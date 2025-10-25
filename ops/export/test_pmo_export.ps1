# PowerShell version of the PMO export script for Windows testing
# This is a test version - the actual GitHub Actions will use the bash version

param(
    [string]$GitHubToken = $env:GITHUB_TOKEN
)

# Read config
$configPath = ".pmo/config.yaml"
if (-not (Test-Path $configPath)) {
    Write-Error "Config file not found: $configPath"
    exit 1
}

# Parse YAML manually (simple case)
$configContent = Get-Content $configPath -Raw
$projectId = ($configContent | Select-String "project_id:\s*(.+)" | ForEach-Object { $_.Matches[0].Groups[1].Value }).Trim()

if (-not $projectId) {
    Write-Error "Could not parse project_id from config"
    exit 1
}

$repo = "fso-datawarrior/twisted-hearth-foundation"
$outDir = "export"
$null = New-Item -ItemType Directory -Path $outDir -Force

Write-Host "Testing PMO Export for project: $projectId"
Write-Host "Repository: $repo"

# Test GitHub API access
$headers = @{
    "Authorization" = "Bearer $GitHubToken"
    "Accept" = "application/vnd.github+json"
    "User-Agent" = "PMO-Exporter-Test"
}

try {
    # Test basic API access
    Write-Host "Testing GitHub API access..."
    $testUrl = "https://api.github.com/repos/$repo"
    $response = Invoke-RestMethod -Uri $testUrl -Headers $headers -Method Get
    Write-Host "✅ Repository access successful: $($response.full_name)"
    
    # Test issues endpoint
    Write-Host "Testing issues endpoint..."
    $issuesUrl = "https://api.github.com/repos/$repo/issues?state=open&per_page=10"
    $issues = Invoke-RestMethod -Uri $issuesUrl -Headers $headers -Method Get
    Write-Host "✅ Found $($issues.Count) open issues/PRs"
    
    # Test pulls endpoint
    Write-Host "Testing pulls endpoint..."
    $pullsUrl = "https://api.github.com/repos/$repo/pulls?state=open&per_page=10"
    $pulls = Invoke-RestMethod -Uri $pullsUrl -Headers $headers -Method Get
    Write-Host "✅ Found $($pulls.Count) open PRs"
    
    # Test labels endpoint
    Write-Host "Testing labels endpoint..."
    $labelsUrl = "https://api.github.com/repos/$repo/labels?per_page=10"
    $labels = Invoke-RestMethod -Uri $labelsUrl -Headers $headers -Method Get
    Write-Host "✅ Found $($labels.Count) labels"
    
    Write-Host ""
    Write-Host "🎉 All API endpoints are working correctly!"
    Write-Host "The PMO export script should work in GitHub Actions."
    
} catch {
    Write-Error "❌ API test failed: $($_.Exception.Message)"
    Write-Host "Please check your GitHub token permissions."
    exit 1
}
